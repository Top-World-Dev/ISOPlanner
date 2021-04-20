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
    . ("$ScriptDirectory\globals.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}

function createKeyVault($resourceGroup) {

    $KeyVaultName = getNameKeyVault $resourceGroup

    $exists = existsKeyVault $resourceGroup $true

    if ($exists -eq $true) {
        Write-Host "##[section]Deleting soft deleted keyvault $KeyVaultName"
        $res = az keyvault purge --name $KeyVaultName --location $azureRegion
    }

    $exists = existsKeyVault $resourceGroup $false

    if ($exists -eq $false) {
        Write-Host "##[section]Creating keyvault $KeyVaultName"
        $res = az keyvault create --name $KeyVaultName --resource-group $resourceGroup --location $azureRegion
        if (!$res) { throw ("Aborting Azure CLI command") }
    }
    
    enableKeyVaultAuditLog $resourceGroup

}

function enableKeyVaultAuditLog($resourceGroup) {

    $KeyVaultName = getNameKeyVault $resourceGroup
    $StorageAccountName = getNameStorageAccount $resourceGroup

    Write-Host "##[section]Enable Keyvault $KeyVaultName diagnostic audit logging"

    $exists = existsKeyVault $resourceGroup $false
    if ($exists -eq $true) {

        $resourceId = az keyvault list --resource-group $resourceGroup --query "[?name=='$KeyVaultName'].{id: id}" --output tsv
        if (!$resourceId) { throw ("Aborting Azure CLI command") }

        $exist = az monitor diagnostic-settings list --resource $ResourceID --query "value[].name" --output tsv
        if ($exist.Length -gt 0) {$exist = $true } else { $exist = $false }
        
        Write-Host "##[command]Keyvault $KeyVaultName diagnostic audit logging exists: $exist"
        
        if ($exist -eq $false) {
            Write-Host "##[command]Updating diagnostic audit logging to storage account: $StorageAccountName"
            $logobject = '[{ \"category\": \"AuditEvent\",\"enabled\": true,\"retentionPolicy\": {\"enabled\": true,\"days\": 365}}]'
            $res = az monitor diagnostic-settings create --resource $ResourceID --name "AuditEvents" --storage-account $StorageAccountName --logs $logobject
            if (!$res) { throw ("Aborting Azure CLI command") }
        }
    }

}

function existsKeyVault($resourceGroup, $deleted) {

    $KeyVaultName = getNameKeyVault $resourceGroup
    
    if ($deleted) {
        Write-Host "##[section]Checking existence of soft-deleted key vault $KeyVaultName"
        $res = az keyvault list-deleted --query "[?name=='$KeyVaultName']" --output tsv
    } else {
        Write-Host "##[section]Checking existence of key vault $KeyVaultName"
        $res = az keyvault list --query "[?name=='$KeyVaultName']" --output tsv
    }
    
    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]KeyVault $KeyVaultName exists: $res"
    return $res
}

function removeKeyvault($resourceGroup) {

    $KeyVaultName = getNameKeyVault $resourceGroup
    
    $exists = existsKeyVault $resourceGroup $true

    if ($exists -eq $true) {
        Write-Host "##[section]Removing soft-deleted keyvault $KeyVaultName"
        az keyvault purge --name $KeyVaultName 
    }
    
    $exists = existsKeyVault $resourceGroup $false

    if ($exists -eq $true) {
        Write-Host "##[section]Removing keyvault $KeyVaultName"
        az keyvault delete --name $KeyVaultName --resource-group $resourceGroup
        az keyvault purge --name $KeyVaultName
    }
}

function setKeyVaultSecret($resourceGroup, $secretName, $secretValue) {

    $KeyVaultName = getNameKeyVault $resourceGroup

    Write-Host "##[command]Setting keyvault secret $KeyVaultName.$secretName=$secretValue"
    $secretValueEscaped = "`"$secretValue`""
    $res = az keyvault secret set --vault-name $KeyVaultName --name $secretName --value $secretValueEscaped --query [name] --output tsv
    if (!$res) { throw ( "Aborting Azure CLI command") }
}

function getKeyVaultSecret($resourceGroup, $secretName) {

    $KeyVaultName = getNameKeyVault $resourceGroup

    Write-Host "##[command]Getting keyvault secret $KeyVaultName.$secretName"
    $res = az keyvault secret show --name $secretName --vault-name $KeyVaultName --query [value] --output tsv
    if (!$res) { throw ( "Aborting Azure CLI command") }

    if ($res.Length -eq 0) { throw "Secret $secretName in keyvault $KeyVaultName does not exist" }
    return $res
}

function existsKeyVaultSecret($resourceGroup, $secretName, $deleted) {

    $KeyVaultName = getNameKeyVault $resourceGroup

    if ($deleted) {
        Write-Host "##[command]Checking existance of soft-deleted keyvault secret $KeyVaultName.$secretName"
        $res = az keyvault secret list-deleted --vault-name $KeyVaultName --query "[?name=='$secretName']" --output tsv
    } else {
        Write-Host "##[command]Checking existance of keyvault secret $KeyVaultName.$secretName"
        $res = az keyvault secret list --vault-name $KeyVaultName --query "[?name=='$secretName']" --output tsv
    }   

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]Keyvault secret exists: $res"
    return $res
}

function removeKeyVaultSecret($resourceGroup, $secretName) {

    $KeyVaultName = getNameKeyVault $resourceGroup

    $exists = existsKeyVaultSecret $resourceGroup $secretName $true

    if ($exists -eq $true) {
        Write-Host "##[command]Purging soft-deleted keyvault secret $KeyVaultName.$secretName"
        az keyvault secret purge --name $secretName --vault-name $KeyVaultName --output tsv
    }

    $exists = existsKeyVaultSecret $resourceGroup $secretName $false

    if ($exists -eq $true) {
        Write-Host "##[command]Removing keyvault secret $KeyVaultName.$secretName"
        $res = az keyvault secret delete --name $secretName --vault-name $KeyVaultName --output tsv
        if (!$res) { throw ( "Aborting Azure CLI command") }
        
        # Sleep for 20s is needed before purging because delete is an async operation in the back-end
        # https://github.com/Azure/azure-cli/issues/12722
        Start-Sleep -s 20 

        az keyvault secret purge --name $secretName --vault-name $KeyVaultName --output tsv
    }
}

function setKeyVaultAccessPolicy($resourceGroup, $spName) {

    #set an access policy for the service principal for the keyvault
    $KeyVaultName = getNameKeyVault $resourceGroup
    Write-Host "##[section]Set access policy for service principal $spName on keyvault $KeyVaultName"
    
    $res = az keyvault set-policy --name $KeyVaultName --spn "http://$spName" --certificate-permissions create delete deleteissuers get getissuers import list listissuers managecontacts manageissuers recover setissuers update purge --key-permissions backup create delete get import list recover restore update purge --secret-permissions backup delete get list recover restore set purge --output tsv
    if (!$res) { throw ( "Aborting Azure CLI command") }

}

function getKeyVaultURL($resourceGroup) {

    $KeyVaultName = getNameKeyVault $resourceGroup
    return "https://$KeyVaultName.vault.azure.net"

}