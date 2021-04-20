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

function createResourceGroup($name) {

    $res = existsResourceGroup $name
    
    if ($res -ne $true) {
        Write-Host "##[section]Creating resource group $name"
        $res = az group create --location $azureRegion --name $name
        if (!$res) { throw ( "Aborting Azure CLI command") }
    }

}

function removeResourceGroup($name) {

    $res = existsResourceGroup $name

    if ($res -eq $true) {
        Write-Host "##[section]Removing resource group $name"
        az group delete --name $name --yes
    }

}

function existsResourceGroup($name) {

    Write-Host "##[section]Checking existence of resource group $name"
    $res = az group exists --name $name
    if (!$res) { throw ( "Aborting Azure CLI command") }
    Write-Host "##[command]Resource group $name exists: $res"

    return $res

}

function isEmptyResourceGroup($name) {

    $exists = existsResourceGroup $name
    if ($exists -eq $false) {
        return $true
    }

    $masterDBName = getNameSQLServer($name) + "/master"

    $infraComponents = @(
        @("Microsoft.KeyVault/vaults", $(getNameKeyvault($name))),
        @("Microsoft.Sql/servers", $(getNameSQLServer($name))),
        @("Microsoft.Sql/servers/databases", $masterDBName),
        @("Microsoft.Storage/storageAccounts", $(getNameStorageAccount($name))),
        @("Microsoft.Web/serverFarms", $(getNameAppServicePlan($name)))
    )

    $res = az resource list --resource-group $name --location $azureRegion --query "[].{name: name, type: type}"
    if ($res) {

        $jsonComponentList = $res | ConvertFrom-Json

        foreach ($infraComponent in $infraComponents) {
            $jsonComponentList = $jsonComponentList | Where-Object { $_.type -ne $infraComponent[0] -or $_.name -ne $infraComponent[1]} 
        }

        if ($jsonComponentList.Length -gt 0) {
            Write-Host "##[command]$infraComponents"
            Write-Host "##[command]$jsonComponentList"
            return $false
        }
    }

    return $true
}