#!/usr/bin/pwsh

# AD functions

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
    . ("$ScriptDirectory\keyvault.ps1")
    . ("$ScriptDirectory\storageaccount.ps1")
}
catch {
    Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
    Write-Error $_.Exception | format-list -force
    throw
}


function getTenantId() {

    $res = az account list --query [].tenantId --output tsv
    if (!$res) { 
        Write-Host "##[error]Tenant Id not found"
        throw ( "Aborting Azure CLI command" ) 
    }
    Write-Host "##[command]Tenant Id: $res"
    return $res
}

#
# Service Principals
# 
function createServicePrincipal($resourceGroup) {
    
    $exists = existsServicePrincipal $resourceGroup

    if ($exists -eq $false) {

        $spName = getNameServicePrincipal $resourceGroup
        Write-Host "##[section]Creating service principal $spName with the contributer role on resource group $resourceGroup"

        $spPwd = az ad sp create-for-rbac --name $spName --role Contributor --query password --scopes /subscriptions/$azureSubscriptionId/resourceGroups/$ResourceGroup --output tsv
        if (!$spPwd) { throw ( "Aborting Azure CLI command") }
        
        #store the password in the keyvault and give the service principal access permissions
        setKeyVaultSecret $resourceGroup $spName $spPwd

        $appClientId = getAppRegistrationClientId $spName
        setKeyVaultSecret $resourceGroup "$($spName)Id" $appClientId

        setKeyVaultAccessPolicy $resourceGroup $spName

        #give the service principal access permissions on the storage account
        $roles = getStorageAccountContributerRoles
        foreach ($role in $roles) {
            createRoleAssignment $resourceGroup $spName $role
        }
    }

}

function existsServicePrincipal($resourceGroup) {

    $spName = getNameServicePrincipal $resourceGroup
    Write-Host "##[section]Checking existence of service principal $spName"
    $res = az ad sp list --display-name $spName --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]Service principal $spName exists: $res"
    return $res

}

function createRoleAssignment($resourceGroup, $spName, $role) {

    $exists = existsRoleAssignment $resourceGroup $spName $role
    if ($exists -eq $false) {

        Write-Host "##[section]Creating role assignment for role $role in resource group $resourceGroup to $spName"
        $spnId = getServicePrincipalId $spName
        $res = az role assignment create --role $role --assignee $spnId --resource-group $ResourceGroup --output tsv
        if (!$res) { throw ( "Aborting Azure CLI command") }
    }
}

function existsRoleAssignment($resourceGroup, $spName, $role) {

    Write-Host "##[section]Checking existence of role assignment for $role in resource group $resourceGroup to $spName exists: $res"

    $spnId = getServicePrincipalId $spName
    $res = az role assignment list --role $role --assignee $spnId --resource-group $ResourceGroup --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]Role assignment exists: $res"
    return $res

}

function getServicePrincipalId($spName) {

    $res = az ad sp list --query "[?displayName=='$spName'].[objectId]" --all --output tsv
    if (!$res) { 
        Write-Host "##[error]Service principal not found: $spName"
        throw ( "Aborting Azure CLI command") 
    }
    Write-Host "##[command]Service principal object-id: $res"
    return $res
}

function removeServicePrincipal($resourceGroup) {

    #need AD role Application administrator

    $exists = existsServicePrincipal $resourceGroup

    if ($exists -eq $true) {

        $spName = getNameServicePrincipal $resourceGroup
        Write-Host "##[section]Removing service principal $spName"
        $spnId = getServicePrincipalId $spName
        az ad sp delete --id $spnId
    }
}

#
# App registrations
#

function existsAppRegistration($resourceGroup) {

    $arName = getNameAppRegistration $resourceGroup
    Write-Host "##[section]Checking existence of app registration $arName"
    $res = az ad app list --display-name $arName --output tsv

    if ($res.Length -gt 0) {$res = $true } else { $res = $false }
    Write-Host "##[command]App registration $arName exists: $res"
    return $res

}

function getAppRegistrationClientId($arName) {

    $res = az ad app list --query "[?displayName=='$arName'].[appId]" --all --output tsv
    if (!$res) { 
        Write-Host "##[error]App registration not found: $arName"
        throw ( "Aborting Azure CLI command" ) 
    }
    Write-Host "##[command]App registration app-id: $res"
    return $res
}

function createAppRegistration ($resourceGroup, $appRegName, $appMultiTenant, $appLogo, $appHomePage, $appTermsOfServiceURL, $appPrivacyURL, $appPlatform, $appRedirectURLs, $appFrontChannelLogout) {



}

function updateAppRegistration ($resourceGroup, $apiClientId, $apiGenAccessTokens, $apiGenIDTokens, $apiDelegatedPermissions, $apiApplicationPermissions, $appAPIPermissions, $apiIDURI, `
                $apiScopeName, $apiScopeURI, $apiScopeText, $apiAppRoles, $apiClientapplications, $apiKnownClientApplications) {




}
function removeAppRegistration($resourceGroup) {

    #need AD role Application administrator

    $exists = existsAppRegistration $resourceGroup

    if ($exists -eq $true) {

        $arName = getNameAppRegistration $resourceGroup
        Write-Host "##[section]Removing App Registration $arName"
        $appId = getAppRegistrationClientId $arName
        az ad app delete --id $appId
    }
}