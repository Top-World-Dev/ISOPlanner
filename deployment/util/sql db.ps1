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
    . ("$ScriptDirectory\naming.ps1")
    . ("$ScriptDirectory\sql query.ps1")
    . ("$ScriptDirectory\keyvault.ps1")
    . ("$ScriptDirectory\password.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}

function existsSQLDB($resourceGroup, $dbType) {
    
    $dbName = getNameSQLDatabase $resourceGroup $dbType
    $sqlServerName = getNameSQLServer $resourceGroup

    Write-Host "##[section]Checking existence of SQL database $sqlServerName.$dbName"

    $res = az sql db list --resource-group $resourceGroup --server $sqlServerName --query "[?name=='$dbName']" --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]SQL database $sqlServerName.$dbName exists: $res"
    return $res
}

function createSQLDB($resourceGroup, $dbType, $elasticPool, $computeModel) {

    $exists = existsSQLDB $resourceGroup $dbType

    if ($exists -eq $false) {

        $dbName = getNameSQLDatabase $resourceGroup $dbType
        $sqlServerName = getNameSQLServer $resourceGroup
        Write-Host "##[section]Creating SQL database $sqlServerName.$dbName"
        
        if (![string]::IsNullOrEmpty($elasticPool)) {

            #Sizing parameters are determined by the elastic pool
            $res = az sql db create --name $dbName --resource-group $resourceGroup --server $sqlServerName --elastic-pool $elasticPool --yes --output tsv 

        } else {
            # compute-model {Serverless, Provisioned}
            #
            # compute model Serverless
            #   - edition GeneralPurpose
            #   - family gen5
            #   - capacity 1
            #   - min-capacity 0.5
            #   - max-size 1gb
            #   - auto-pause-delay 60
            #
            # compute model Provisioned
            #   - edition Basic
            #   - capacity 5
            #   - max-size 2gb

            switch ($computeModel) {
                "Serverless" {
                    $res = az sql db create --name $dbName --resource-group $resourceGroup --server $sqlServerName --compute-model "Serverless" --edition "GeneralPurpose" --family "Gen5" --capacity "1" --min-capacity "0.5" --max-size "1GB" --auto-pause-delay "60" --yes --output tsv
                    break
                }
                
                "Provisioned" {
                    $res = az sql db create --name $dbName --resource-group $resourceGroup --server $sqlServerName --compute-model "Provisioned" --edition "Basic" --capacity "5" --max-size "2GB" --yes --output tsv
                    break
                }
                default {
                    throw ("Unsupported compute model: $computeModel")
                }              
            }
        }
       
        if (!$res) { throw ("Aborting Azure CLI command") }

        $serverURL = getNameSQLServerURL $resourceGroup
        setKeyVaultSecret $resourceGroup 'SQLSERVER' $serverURL
        setKeyVaultSecret $resourceGroup 'SQLDB' $dbName
        setKeyVaultSecret $resourceGroup 'SQLAUTHTYPE' 'default'

    }
}

function removeSQLDB($resourceGroup, $dbType) {

    $exists = existsSQLDB $resourceGroup $dbType

    if ($exists -eq $true) {

        $dbName = getNameSQLDatabase $resourceGroup $dbType
        $sqlServerName = getNameSQLServer $resourceGroup
        Write-Host "##[section]Removing SQL database $sqlServerName.$dbName"

        az sql db delete --name $dbName --resource-group $resourceGroup --server $sqlServerName --yes
    }

    removeKeyVaultSecret $resourceGroup 'SQLSERVER'
    removeKeyVaultSecret $resourceGroup 'SQLDB'
    removeKeyVaultSecret $resourceGroup 'SQLAUTHTYPE'
}

function createSQLDBUser($resourceGroup, $dbType) {

    try {

        $dbName = getNameSQLDatabase $resourceGroup $dbType
        $userName = getNameSQLUser $resourceGroup $dbType
        $userPwd = generatePasswordSQLLogin
    
        Write-Host "##[section]Creating SQL database login/user: $dbName.$userName"

        openSQLFirewall $resourceGroup

        $sql = "SELECT '1' FROM sys.sql_logins WHERE name='$userName'"
        $rows = execSQL $resourceGroup $sql "master" $true

        if (!$rows) {

            #create SQL login and store the username & password in the keyvault
            $userPwd = generatePasswordSQLLogin
            $sql = "CREATE LOGIN [$userName] WITH password='$userPwd'"
            execSQL $resourceGroup $sql "master" $true

            setKeyVaultSecret $resourceGroup "SQLUSER" $userName
            setKeyVaultSecret $resourceGroup "SQLPWD" $userPwd
        }

        # create the database user
        $sql = "IF NOT EXISTS (SELECT 1 FROM [sys].[database_principals] WHERE [type] = N'S' AND name = N'$userName') BEGIN CREATE USER [$userName] FROM LOGIN [$userName]; END" 
        execSQL $resourceGroup $sql $dbName $true
        # make the database user db_owner
        $sql = "ALTER ROLE db_owner ADD MEMBER [$userName]"
        execSQL $resourceGroup $sql $dbName $true

    }
    catch {
        Write-Error "##[error]Error while creating DB user"
        Write-Error $_.Exception | format-list -force
    }
    finally {
        closeSQLFirewall $resourceGroup
    }
}

function removeSQLDBUser($resourceGroup, $dbType) {
    
    try {

        $dbName = getNameSQLDatabase $resourceGroup $dbType
        $userName = getNameSQLUser $resourceGroup $dbType

        Write-Host "##[section]Removing SQL database login/user: $dbName.$userName"

        $exists = existsSQLDB $resourceGroup $dbType

        if ($exists -eq $true) {

            openSQLFirewall $resourceGroup

            $sql="IF EXISTS (SELECT name FROM sys.database_principals WHERE name = N'$userName') DROP USER [$userName]"
            execSQL $resourceGroup $sql $dbName $true

            $sql="IF  EXISTS (SELECT name FROM sys.sql_logins WHERE name = '$userName') DROP LOGIN [$userName]" 
            execSQL $resourceGroup $sql "master" $true
            
        }

        removeKeyVaultSecret $resourceGroup "SQLUSER"
        removeKeyVaultSecret $resourceGroup "SQLPWD"

    }
    catch {
        Write-Error $_.Exception | format-list -force
        Write-Error "##[error]Error while removing db user"
        
    }
    finally {
        closeSQLFirewall $resourceGroup
    }
    
}

function generatePasswordSQLLogin {

    #generate root password for SQL login of 32 chars
    #minimal 5 special characters
    #minimal 5 digits

    $p = generatePassword 32 5 5

    return $p

}