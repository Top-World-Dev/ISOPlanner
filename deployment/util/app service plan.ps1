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

function createAppServicePlan($resourceGroup, $onLinux, $sku) { 

    $exists = existsAppServicePlan $resourceGroup

    if ($exists -eq $false) {
        $AppServicePlanName = getNameAppServicePlan $resourceGroup
        if ($onLinux) {
            Write-Host "##[section]Creating App Service Plan on Linux $AppServicePlanName" 
            $res = az appservice plan create -n $AppServicePlanName -l $azureRegion -g $resourceGroup --sku $sku --is-linux
        } else {
            Write-Host "##[section]Creating App Service Plan on Windows $AppServicePlanName" 
            $res = az appservice plan create -n $AppServicePlanName -l $azureRegion -g $resourceGroup --sku $sku 
        }

        if (!$res) { throw ("Aborting Azure CLI command") }
    }
}

function existsAppServicePlan($resourceGroup) {

    $AppServicePlanName = getNameAppServicePlan $resourceGroup
    Write-Host "##[section]Checking existence of app service plan $AppServicePlanName"

    $res = az appservice plan list -g $resourceGroup --query "[?name=='$AppServicePlanName']" --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]App service plan $AppServicePlanName exists: $res"
    return $res
}

function removeAppServicePlan($resourceGroup) {

    $exists = existsAppServicePlan $resourceGroup

    if ($exists -eq $true) {
        $AppServicePlanName = getNameAppServicePlan $resourceGroup
        Write-Host "##[section]Removing App Service Plan $AppServicePlanName"

        $appCount = getAppServicePlanAppCount $resourceGroup $AppServicePlanName
        if ($appCount -eq 0) {
            az appservice plan delete -n $AppServicePlanName -g $resourceGroup --yes
        } else {
            Write-Host "##[warning]Cannot remove App Service Plan $AppServicePlanName because it still contains apps"
        }
    }
}

function getAppServicePlanAppCount($resourceGroup, $name) {

    $res = az appservice plan show --resource-group $resourceGroup --name $name --query numberOfSites --output tsv
    if (!$res) { throw ("Aborting Azure CLI command") }
    Write-Host "##[command]App service plan app count: $res"
    return $res
}

function isSupportedByAppServicePlan($resourceGroup, $feature) {

    $supported = $false
    $AppServicePlanName = getNameAppServicePlan $resourceGroup
    Write-Host "##[command]Checking feature $feature of App Service Plan $AppServicePlanName"

    switch ($feature) {
        "always-on" {
            $res = az appservice plan show --name $AppServicePlanName --resource-group $resourceGroup --query "sku.name" --output tsv
            if (!$res) { throw ("Aborting Azure CLI command") }
            Write-Host "##[command]Result: $res"
            if ($res -eq "F1") {$supported = $false} else {$supported = $true}
            break
        }
        "64-bit" {
            $res = az appservice plan show --name $AppServicePlanName --resource-group $resourceGroup --query "sku.name" --output tsv
            if (!$res) { throw ("Aborting Azure CLI command") }
            Write-Host "##[command]Result: $res"
            if ($res -eq "F1") {$supported = $false} else {$supported = $true}
            break
        }
        "slot" {
            $res = az appservice plan show --name $AppServicePlanName --resource-group $resourceGroup --query "sku.name" --output tsv
            if (!$res) { throw ("Aborting Azure CLI command") }
            Write-Host "##[command]Result: $res"
            if (@("F1", "B1") -contains $res) {$supported = $false} else {$supported = $true}
            break
        }
        default { throw ("Unknown feature") }
    }

    Write-Host "##[command]Supported: $supported"
    return $supported
}