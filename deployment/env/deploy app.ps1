#!/usr/bin/pwsh
param ($subscription, $artifactpath, $resourcegroup, $deploymentMethod)

# Include required files
try {
    . ("$artifactpath\deployment\util\web app.ps1")
    . ("$artifactpath\deployment\util\naming.ps1")
    . ("$artifactpath\deployment\util\sql query.ps1")
}
catch {
    Write-Warning "Could not load all supporting PowerShell Scripts."
    Write-Error $_.Exception | format-list -force
    throw
}

if ($deploymentMethod -eq "production") {
    $slotName = "staging"
} else {
    $slotName = ""
}

#deploy the React app
$webAppType = ""
$zipFile = "$artifactpath\REDLAB.ISOPlanner.Web.zip"
deployWebApp $resourceGroup $webAppType $slotName $zipFile

