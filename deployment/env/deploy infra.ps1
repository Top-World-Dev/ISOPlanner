#!/usr/bin/pwsh
param ($subscription, $artifactpath, $resourcegroup, $deploymentMethod)

# Include required files
try {
    . ("$artifactpath\deployment\util\app service plan.ps1")
    . ("$artifactpath\deployment\util\web app.ps1")
    . ("$artifactpath\deployment\util\ad.ps1")
    . ("$artifactpath\deployment\util\naming.ps1")
    . ("$artifactpath\deployment\util\keyvault.ps1")
    . ("$artifactpath\deployment\util\sql db.ps1")
}
catch {
    Write-Warning "Could not load all supporting PowerShell Scripts from $artifactpath"
    Write-Error $_.Exception | format-list -force
    throw
}

if ($deploymentMethod -eq "production") {

    $slotName = "staging"
    $sku = "S1"

} elseif ($deploymentMethod -eq "test") {

    $slotName = ""
    $sku = "B1"

} else {

    $slotName = ""
    $sku = "F1"
}

# create the web app React
$webAppType = ""
$runtimeStack = "node|12-lts"
createWebApp $resourcegroup $webAppType $runtimeStack
createWebAppSlot $resourcegroup $webAppType $slotName

# set environment settings
createWebAppSetting $resourcegroup $webAppType $slotName "NODE_ENV" $deploymentMethod $false

#TODO:
#VNET integration
#Monitoring
#TLS/SSL