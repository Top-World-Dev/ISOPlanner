#!/usr/bin/pwsh

#####################################################
#                                                   # 
# This file is located in the Azure repository and  #
# must be pulled via the git upstream.              #  
#                                                   #  
# Don't make any changes to this file outside       # 
# the Azure repository, otherwise merge conflicts   #
# will occur.                                       #
#                                                   #
#####################################################

# Include required files
$ScriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
try {
    . ("$ScriptDirectory\keyvault.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}

Function openSQLFirewall($resourceGroup) {

    $SQLServerName = getNameSQLServer $resourceGroup
    
    $ip = Invoke-RestMethod http://ipinfo.io/json | Select-Object -exp ip

    $firewallRule = az sql server firewall-rule list --resource-group $resourceGroup --server $SQLServerName --query "[?startIpAddress=='$ip']" --output tsv
    if ($firewallRule) {
        return $false
    }

    $rand = Get-Random -Maximum 1000
    $firewallRuleName = "Azure DevOps Agent $rand"
    
    Write-Host "##[section]Creating SQL firewall rule $firewallRuleName for current IP: $ip"
    $firewallRule = az sql server firewall-rule create --resource-group $resourceGroup --server $SQLServerName --name $firewallRuleName --start-ip-address $ip --end-ip-address $ip    
    if (!$firewallRule) {
        throw ("Error while creating SQL Server firewall rule")
    }
}

Function closeSQLFirewall($resourceGroup) {

    $SQLServerName = getNameSQLServer $resourceGroup

    $ip = Invoke-RestMethod http://ipinfo.io/json | Select-Object -exp ip

    $firewallRules = az sql server firewall-rule list --resource-group $resourceGroup --server $SQLServerName --query "[?startIpAddress=='$ip'].{name: name}" --output tsv

    if ($firewallRules) {
        
        if ($firewallRules.GetType() -eq [System.Array]) { 
            Write-Host "##[section]Removing $($firewallRules.Length()) SQL firewall rule(s) for current IP: $ip"
            
            foreach ($name in $firewallRules) {
    
                Write-Host "##[command]Removing SQL firewall rule $name"
                az sql server firewall-rule delete --resource-group $resourceGroup --server $SQLServerName --name $name
            }

        } else {

            Write-Host "##[section]Removing SQL firewall rule $firewallRules for current IP: $ip"
            az sql server firewall-rule delete --resource-group $resourceGroup --server $SQLServerName --name $firewallRules

        }
    }
}

Function execSQL($resourceGroup, $SQL, $databaseName, $outputerrors) {

    try
    {

        Write-Host "##[command]$($databaseName): SQL: $SQL"

        $SQLServerURL = getNameSQLServerURL $resourceGroup
        $secret = getKeyVaultSecret $resourceGroup $sqlAdminUser
        if (!$secret) {throw "User $sqlAdminUser not found in keyvault of $resourceGroup"}

        $params = @{
        'Database' = $databaseName
        'ServerInstance' =  $SQLServerURL
        'Username' = $sqlAdminUser
        'Password' = $secret
        'OutputSqlErrors' = $outputerrors
        'Query' = $SQL
        }

        $result = Invoke-Sqlcmd @params

        Write-Host "##[command]Statement executed"
        
        return $result
    }
    catch {
        Write-Error $_.Exception|format-list -force
        throw "Error while executing SQL command. See previous errors."
    }

}

Function execSQLwithADAuth ($resourceGroup, $SQL, $databaseName)
{
    try {

        Write-Host "##[command]$($databaseName): AD Auth: $SQL"

        $SQLServerURL = getNameSQLServerURL $resourceGroup
        $secret = getKeyVaultSecret $baseResourceGroup $sqlAdminADUser
        if (!$secret) {throw "User $sqlAdminADUser not found in keyvault of $baseResourceGroup"}

        #opening SQL connection
        $cxnString = "Server=tcp:$SQLServerURL,1433; Database=$databaseName; Authentication=Active Directory Password; User ID=$sqlAdminADUser; Password=$secret;"
        $cxn = New-Object System.Data.SqlClient.SqlConnection
        $cxn.ConnectionString = $cxnString
        $cxn.Open()
        
        Write-Host "##[command]Connection opened to $SQLServerURL for database $databaseName"

        #exec SQL statement
        $cmd = New-Object System.Data.SqlClient.SqlCommand($SQL, $cxn)
        $cmd.ExecuteNonQuery()
        
        Write-Host "##[command]Statement executed"
    }
    catch {
        Write-Error $_.Exception|format-list -force
        if (!$cxn) {
            $cxn.Close()
        }
        throw "Error while executing SQL command. See previous errors."
    }
}

Function execSQLFile ($resourceGroup, $filePath, $databaseName, $outputerrors)
{
    try {

        Write-Host "##[command]$($databaseName): File: $filePath"

        $SQLServerURL = getNameSQLServerURL $resourceGroup
        $secret = getKeyVaultSecret $resourceGroup $sqlAdminUser
        if (!$secret) {throw "User $sqlAdminUser not found in keyvault of $resourceGroup"}

        $params = @{
            'Database'        = $databaseName
            'ServerInstance'  = $SQLServerURL
            'Username'        = $sqlAdminUser
            'Password'        = $secret
            'OutputSqlErrors' = $outputerrors
            'InputFile'       = $filePath
        }

        $result = Invoke-Sqlcmd @params

        Write-Host "##[command]File executed"

        return $result
        
    }
    catch {
        Write-Error $_.Exception|format-list -force
        throw "Error while executing SQL command. See previous errors."
    }
}
