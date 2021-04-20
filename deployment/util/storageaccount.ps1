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
    . ("$ScriptDirectory\globals.ps1")
    . ("$ScriptDirectory\naming.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}

function createStorageAccount($resourceGroup) {

    $StorageAccountName = getNameStorageAccount $resourceGroup
    $sku = "Standard_LRS"
        
    $exists = existsStorageAccount $resourceGroup
    
    #create the storage account
    if ($exists -eq $false) {
        Write-Host "##[section]Creating Storage Account $StorageAccountName" 

        $res = az storage account create --name $StorageAccountName --resource-group $resourceGroup --kind StorageV2 --https-only $true --location $azureRegion --sku $sku --bypass AzureServices --default-action allow --access-tier Cool
        if (!$res) { throw ( "Aborting Azure CLI command") }
    }

}

function existsStorageAccount($resourceGroup) {

    $StorageAccountName = getNameStorageAccount $resourceGroup
    Write-Host "##[section]Checking existence of storage account $StorageAccountName"
    $res = az storage account list --resource-group $resourceGroup --query "[?name=='$StorageAccountName']" --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]Storage account $StorageAccountName exists: $res"
    return $res
}

function getStorageAccountKey ($resourceGroup) {

    $StorageAccountName = getNameStorageAccount $resourceGroup
    Write-Host "##[section]Getting access key for the storage account $StorageAccountName"

    $res = az storage account keys list --account-name $StorageAccountName --query "[?keyName=='key1'].{value: value}" --output tsv
    if (!$res) { throw ( "Could not get key1") }

    return $res
}

function removeStorageAccount($resourceGroup) {

    $exists = existsStorageAccount $resourceGroup
    
    if ($exists -eq $true) {
        $StorageAccountName = getNameStorageAccount $resourceGroup
        Write-Host "##[section]Removing Storage Account $StorageAccountName" 
        az storage account delete --resource-group $resourceGroup --name $StorageAccountName --yes --output tsv
    }
}

function getStorageAccountSAS ($resourceGroup) {

    $StorageAccountName = getNameStorageAccount $resourceGroup
    Write-Host "##[section]Generating SAS token for the storage account $StorageAccountName"

    $StartTime = Get-Date
    $StartTime = $StartTime.AddMinutes(-15) #15 minutes in the past for computer time differences (MS best practice)
    $EndTime = $startTime.AddMinutes(45) #Lifetime of 30 minutes
    $accountkey = getStorageAccountKey $resourceGroup

    $res = az storage account generate-sas --account-name $StorageAccountName --account-key $accountkey --start $StartTime --expiry $EndTime --permissions "racwdlup" --services bfqt --resource-types sco
    if (!$res) { throw ( "Could not generate SAS token") }

    return $res
}

function createStorageAccountContainer ($resourceGroup, $containername) {

    $StorageAccountName = getNameStorageAccount $resourceGroup

    Write-Host "##[section]Creating container $containername in $StorageAccountName"

    $exists = existsStorageAccountContainer $resourceGroup $containername

    if ($exists -eq $false) {
        Write-Host "##[section]Creating Storage Account Container $containername" 

        $accountkey = getStorageAccountKey $resourceGroup
        $res = az storage account container create --account-name $StorageAccountName --account-key $accountkey --name $containername --public-access off
        if (!$res) { throw ( "Aborting Azure CLI command") }
    }
    
}

function existsStorageAccountContainer ($resourceGroup, $containername) {

    $StorageAccountName = getNameStorageAccount $resourceGroup

    Write-Host "##[section]Checking container $containername in $StorageAccountName"

    $accountkey = getStorageAccountKey $resourceGroup
    $exists = az storage container exists --account-name $StorageAccountName --account-key $accountkey --name $containername --output tsv

    Write-Host "##[command]Container  exists: $exists "

    return $exists
}

function getStorageAccountContributerRoles() {
    return @("Storage Blob Data Contributor", "Storage Account Contributor")
}