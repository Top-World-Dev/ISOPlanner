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
    . ("$ScriptDirectory\storageaccount.ps1")
    . ("$ScriptDirectory\keyvault.ps1")
    . ("$ScriptDirectory\password.ps1")
    . ("$ScriptDirectory\globals.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}

function createSQLServer($resourceGroup) {

    $SQLServerName = getNameSQLServer $resourceGroup
    $exists = existsSQLServer $resourceGroup

    if ($exists -eq $false) {
        Write-Host "##[section]Creating SQL server: $SQLServerName"

        Write-Host "##[command]Adding root password to keyvault"
        $userName = "sysroot"
        $password = generatePasswordSQLServer
        setKeyVaultSecret $resourceGroup $userName "$password"

        Write-Host "##[command]Configuring SQL server"
        $res = az sql server create --admin-user $userName --admin-password "$password" -g $resourceGroup -l $azureRegion -n $SQLServerName --minimal-tls-version "1.2" --enable-public-network $true
        if (!$res) { throw ( "Aborting Azure CLI command") }

        createSQLServerFirewallIpRule $resourceGroup $SQLServerName "AllowAllAzureIps" "0.0.0.0"

        setSQLServerAdmin $resourceGroup

        setSQLServerAudit $resourceGroup
    
        setSQLServerFirewallRules $resourceGroup

    }
}
    
function setSQLServerAdmin($resourceGroup) {

    $SQLServerName = getNameSQLServer $resourceGroup

    Write-Host "##[section]Set SQL Server AD administrator"
    $SQLUserObjectID = az ad group list --display-name $sqlAdminADGroup --query [].[objectId] --output tsv
    Write-Host "##[command]ID: $SQLUserObjectID"
    $res = az sql server ad-admin create --display-name $sqlAdminADGroup --object-id $SQLUserObjectID --resource-group $resourceGroup --server-name $SQLServerName
    if (!$res) { throw ( "Aborting Azure CLI command") }

}

function existsSQLServer($resourceGroup) {

    $SQLServerName = getNameSQLServer $resourceGroup
    Write-Host "##[section]Checking existence of SQL Server $SQLServerName"

    $res = az sql server list --resource-group $resourceGroup --query "[?name=='$SQLServerName']" --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]SQL Server $SQLServerName exists: $res"
    return $res

}
    
function removeSQLServer($resourceGroup) {

    $exists = existsSQLServer $resourceGroup
    
    if ($exists -eq $true) {
        $SQLServerName = getNameSQLServer $resourceGroup
        Write-Host "##[section]Removing SQL Server $SQLServerName" 
        az sql server delete --resource-group $resourceGroup --name $SQLServerName --yes --output tsv
    }

}

Function setSQLServerAudit ($resourceGroup) {

    Write-Host "##[section]Enabling SQL Server audit for: $resourceGroup"

    $SQLServerName = getNameSQLServer $resourceGroup
    $StorageAccountName = getNameStorageAccount $resourceGroup

    $exists = existsSQLServer $resourceGroup
    if ($exists -eq $true) {

        try {
            
            $res = az sql server audit-policy show --resource-group $resourceGroup --name $SQLServerName --query "state" --output tsv
            if ($res -ne "Enabled") {

                Write-Host "##[command]Storage account name: $StorageAccountName"

                $StorageAccountKey = getStorageAccountKey $resourceGroup
                
                Write-Host "##[command]Updating SQL Server audit policy"

                $res = az sql server audit-policy update --resource-group $resourceGroup --name $SQLServerName --state Enabled --blob-storage-target-state Enabled --storage-account $StorageAccountName --retention-days 31 --storage-key $StorageAccountKey
                if (!$res) { throw ( "Aborting Azure CLI command") }

            } else {
                Write-Host "##[command]SQL Server auditing is already enabled"
            }

        }
        catch {
            Write-Error $_.Exception | format-list -force
        }

    } else {
        Write-Warning "SQL Server $SQLServerName does not exist"
    }

}

function setSQLServerFirewallRules($resourceGroup) {

    if (![string]::IsNullOrEmpty($sqlAllowedIpAddresses)) {

        $SQLServerName = getNameSQLServer $resourceGroup
        Write-Host "##[section]Creating SQL Server firewall Ip-address rules for server $SQLServerName"

        foreach ($ip in $sqlAllowedIpAddresses) {
            createSQLServerFirewallIpRule $resourceGroup $SQLServerName "Allow $ip" $ip
        }
    }
}

function createSQLServerFirewallIpRule ($resourceGroup, $sqlServerName, $firewallRuleName, $ip) {

    Write-Host "##[command]Create SQL Server firewall rule for ip-address: $ip"
    $res = az sql server firewall-rule create --resource-group $resourceGroup --server $sqlServerName -n $firewallRuleName --start-ip-address $ip --end-ip-address $ip
    if (!$res) { throw ( "Aborting Azure CLI command") }

}

function generatePasswordSQLServer {
    
    #generate root password for SQL server of 64 chars
    #no special characters
    #must start with a alphanumeric character

    $p = generatePassword 61 20 0

    return "SQL$p"
}

# Function setSQLAdvancedDataSecurity ($resourceGroup) {

#     Write-Host "##[section]Enabling SQL Server Advanced Data Security for: $resourceGroup"

#     $SQLServerName = getNameSQLServer $resourceGroup
#     $StorageAccountName = getNameStorageAccount $resourceGroup

#     $exists = existsSQLServer $resourceGroup
#     if ($exists -eq $true) {

#         try {

#             if ((Get-AzSqlServerAdvancedDataSecurityPolicy -ResourceGroupName $resourceGroup -ServerName $SQLServerName).IsEnabled -ne $true) {
                
#                 Enable-AzSqlServerAdvancedDataSecurity -DoNotConfigureVulnerabilityAssessment -ResourceGroupName $resourceGroup -ServerName $SQLServerName
            
#             } else {
#                 Write-Host "##[command]SQL Server Advanced Data Security already enabled"
#             }

#             if ((Get-AzSqlServerVulnerabilityAssessmentSetting -ResourceGroupName $resourceGroup -ServerName $SQLServerName).RecurringScansInterval -ne "Weekly") {

#                 Write-Host "##[command]Enabling vulnerability assessment"

#                 createStorageAccountContainer $resourceGroup "vulnerability-assessment"

#                 $SAS = getStorageAccountSAS $resourceGroup
#                 $URLWithSAS = "https://$StorageAccountName.blob.core.windows.net/vulnerability-assessment$SAS"

#                 Write-Host "##[command]URL with SAS token: $URLWithSAS"
#                 Update-AzSqlServerVulnerabilityAssessmentSetting -ResourceGroupName $resourceGroup -ServerName $SQLServerName -BlobStorageSasUri $URLWithSAS -RecurringScansInterval Weekly -EmailAdmins $false
            
#             } else {
#                 Write-Host "##[command]SQL Server vulnerability assessment already enabled"
#             }

#         }
#         catch {
#             Write-Error $_.Exception | format-list -force
#         }

#     } else {
#         Write-Warning "SQL Server $SQLServerName does not exist"
#     }
# }


# function Create_Elastic_Pool() {

# local resourceGroup=$1
# local sku=$2

# local resourceGroup=$resourceGroup
# local elasticPoolName="$resourceGroup-ElasticPool"
# local server=$(echo "$resourceGroup-sql" | tr '[:upper:]' '[:lower:]')

#     exist=$(az sql elastic-pool list --resource-group "$resourceGroup" --server "$server" --query "[?name=='$elasticPoolName']" --output tsv | wc -l)
#     echo -e "\e[36m Elastic pool $elasticPoolName exists: $exist\0033[0m"
    
#     if [ "$exist" -eq 0 ]; then
#         echo -e "\e[36m Creating/updating elastic pool $elasticPoolName\0033[0m"
#         az sql elastic-pool create --resource-group "$resourceGroup" --server "$server" --name "$elasticPoolName" --edition Standard --capacity "$sku" --db-dtu-max "$sku"
#     fi
# }