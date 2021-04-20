#!/usr/bin/pwsh
param ($subscription, $artifactpath, $resourcegroup, $deploymentMethod)

# Include required files
try {
    . ("$artifactpath\deployment\util\app service plan.ps1")
    . ("$artifactpath\deployment\util\web app.ps1")
    . ("$artifactpath\deployment\util\sql db.ps1")
}
catch {
    Write-Warning "Could not load all supporting PowerShell Scripts from $artifactpath"
    Write-Error $_.Exception | format-list -force
    throw
}

# remove the apps
removeWebApp $resourcegroup ""


