#!/usr/bin/pwsh
param ($subscription, $artifactpath, $resourcegroup, $deploymentMethod)

# Include required files
try {
    . ("$artifactpath\deployment\util\web app.ps1")
}
catch {
    Write-Warning "Could not load all supporting PowerShell Scripts. "
    Write-Error $_.Exception | format-list -force
    throw
}

# stop the web app
$webAppType = ""
stopWebApp $resourcegroup $webAppType
