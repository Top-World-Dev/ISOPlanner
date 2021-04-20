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
    . ("$ScriptDirectory\app service plan.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}

function existsWebApp($resourceGroup, $webAppType) {

    $webappName = getNameWebApp $resourceGroup $webAppType
    Write-Host "##[section]Checking existence of web app $webappName"

    $res = az webapp list --resource-group $resourceGroup --query "[?name=='$webappName']" --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]Web app $webappName exists: $res"
    return $res
}

function existsWebAppSlot($resourceGroup, $webAppType, $slotName) {

    $webappName = getNameWebApp $resourceGroup $webAppType
    Write-Host "##[section]Checking existence of slot $slotName for web app $webappName"

    $res = az webapp deployment slot list --name $webAppName --resource-group $resourceGroup --query "[?name=='$slotName']" --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]Slot $slotName for web app $webappName exists: $res"
    return $res

}

function removeWebApp($resourceGroup, $webAppType) {
    
    $exists = existsWebApp $resourceGroup $webAppType

    if ($exists -eq $true) {
        $webappName = getNameWebApp $resourceGroup $webAppType
        Write-Host "##[section]Removing web app $webappName"
        az webapp delete --name $webAppName --resource-group $resourceGroup --keep-empty-plan
    }

}

function createWebAppSlot($resourceGroup, $webAppType, $slotName) {

    if ([string]::IsNullOrEmpty($slotName)) {
        Write-Host "##[section]Empty slot name provided. Skipping creation of slot"
        return
    }

    if (isSupportedByAppServicePlan $resourceGroup "slot" -eq $false) {
        Write-Host "##[warning]The app service plan does not support slots. Skipping creation of slot"
        return
    }

    $exists = existsWebAppSlot $resourceGroup $webAppType $slotName

    if ($exists -eq $false) {

        $webappName = getNameWebApp $resourceGroup $webAppType
        Write-Host "##[section]Creating web app slot $slotName for web app $webappName"
        $res = az webapp deployment slot create --name $webAppName --resource-group $resourceGroup --slot $slotName --configuration-source $webAppName --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }
    }

}

function createWebApp($resourceGroup, $webAppType, $runtimeStack) {
    
    $exists = existsWebApp $resourceGroup $webAppType

    if ($exists -eq $false) {

        $webappName = getNameWebApp $resourceGroup $webAppType
        $AppServicePlanName = getNameAppServicePlan $resourceGroup
        $runtimeStackEscaped = "`"$runtimeStack`""

        Write-Host "##[section]Creating web app $webappName in plan $AppServicePlanName with runtime $runtimeStackEscaped"
        $res = az webapp create --name $webappName --plan $AppServicePlanName --resource-group $resourceGroup --runtime $runtimeStackEscaped --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

        #set correct time zone for date calculations
        if (![string]::IsNullOrEmpty($webAppTimeZone)) {
            createWebAppSetting $resourceGroup $webAppType "" "WEBSITE_TIME_ZONE" $webAppTimeZone $false
        }

        #enable always on feature to e.g. allow webjobs
        if (isSupportedByAppServicePlan $resourceGroup "always-on") {
            Write-Host "##[command]Set always-on true"
            $res = az webapp config set -g $resourceGroup --name $webAppName --always-on true --output tsv
            if (!$res) { throw ("Aborting Azure CLI command") }
        }

        #ftps-state disabled
        Write-Host "##[command]Set ftps-state: disabled"
        $res = az webapp config set -g $resourceGroup --name $webAppName --ftps-state Disabled --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

        #--http20-enabled
        Write-Host "##[command]Set http20-enabled: true"
        $res = az webapp config set -g $resourceGroup --name $webAppName --http20-enabled true --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

        #force 64-bit
        if (isSupportedByAppServicePlan $resourceGroup "64-bit") {
            Write-Host "##[command]Set use32BitWorkerProcess: false"
            $res = az webapp config set -g $resourceGroup --name $webAppName --use-32bit-worker-process false --output tsv
            if (!$res) { throw ("Aborting Azure CLI command") }
        }

        #min-tls-version 1.2
        Write-Host "##[command]Set min-tls-version: 1.2"
        $res = az webapp config set -g $resourceGroup --name $webAppName --min-tls-version 1.2 --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

        #web-sockets-enabled true
        Write-Host "##[command]Set web-sockets-enabled: true"
        $res = az webapp config set -g $resourceGroup --name $webAppName --web-sockets-enabled true --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

        #https-only
        Write-Host "##[command]Set https-only: true"
        $res = az webapp update -g $resourceGroup --name $webAppName --https-only true --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

        #client-affinity-enabled false
        Write-Host "##[command]Set client-affinity-enabled: false"
        $res = az webapp update -g $resourceGroup --name $webAppName --client-affinity-enabled false --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

    }

}

function createWebAppSetting ($resourcegroup, $webAppType, $slotName, $name, $value, $slotSetting) {

    if ([string]::IsNullOrEmpty($slotName)) {

        $webappName = getNameWebApp $resourceGroup $webAppType
        Write-Host "##[section]Creating application setting for web app $($webappName): $name=$value (Slot setting: $slotSetting)"
        if ($slotSetting -eq $true) {$slotParam = "--slot-settings" } else {$slotParam = "--settings"}
        $res = az webapp config appsettings set -g $resourceGroup -n $webAppName $slotParam $name=$value --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

    } else {

        $webappName = getNameWebApp $resourceGroup $webAppType
        Write-Host "##[section]Creating application setting for web app $webappName slot $($slotName): $name=$value (Slot setting: $slotSetting)"
        if ($slotSetting -eq $true) {$slotParam = "--slot-settings" } else {$slotParam = "--settings"}
        $res = az webapp config appsettings set -g $resourceGroup -n $webAppName --slot $slotName $slotParam $name=$value --output tsv
        if (!$res) { throw ("Aborting Azure CLI command") }

    }
}

function createZip ($sourcePath, $zipFile) {

    Write-Host "##[section]Creating zip file $zipFile with contents of folder $sourcePath"
    Compress-Archive -Path "$sourcePath\*" -DestinationPath $zipFile -CompressionLevel optimal

}

function deployWebApp ($resourceGroup, $webAppType, $slotName, $zipFile) {

    $webAppName = getNameWebApp $resourceGroup $webAppType
    
    if ([string]::IsNullOrEmpty($slotName)) {
        Write-Host "##[section]Deploying to web app $webAppName from zip file $zipFile"
        $res = az webapp deployment source config-zip --resource-group $resourceGroup --name $webAppName --src $zipFile

    } else {
        Write-Host "##[section]Deploying to web app $webAppName slot $slotName from zip file $zipFile"
        $res = az webapp deployment source config-zip --resource-group $resourceGroup --name $webAppName --src $zipFile --slot $slotName
    }

    if (!$res) { throw ("Aborting Azure CLI command") }
}

function stopWebApp ($resourcegroup, $webAppType, $slotName) {

    $webAppName = getNameWebApp $resourceGroup $webAppType

    if ([string]::IsNullOrEmpty($slotName)) {
        Write-Host "##[section]Stopping web app $webAppName"
        az webapp stop --resource-group $resourceGroup --name $webAppName

    } else {
        Write-Host "##[section]Stopping web app $webAppName slot $slotName"
        az webapp stop --resource-group $resourceGroup --name $webAppName --slot $slotName
    }

}

function startWebApp ($resourcegroup, $webAppType, $slotName) {

    $webAppName = getNameWebApp $resourceGroup $webAppType

    if ([string]::IsNullOrEmpty($slotName)) {
        Write-Host "##[section]Starting web app $webAppName"
        az webapp start --resource-group $resourceGroup --name $webAppName

    } else {
        Write-Host "##[section]Starting web app $webAppName slot $slotName"
        az webapp start --resource-group $resourceGroup --name $webAppName --slot $slotName
    }

}