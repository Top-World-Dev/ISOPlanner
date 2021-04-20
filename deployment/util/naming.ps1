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

function getNameStorageAccount($resourceGroup) {
    $validName=$resourceGroup.Replace("-", "")
    return "$($validName.ToLower())storage"
}

function getNameKeyVault($resourceGroup) {
    return "$($resourceGroup.ToLower())-vault"
}

function getNameSQLServer($resourceGroup) {
    return "$($resourceGroup.ToLower())-sql"
}

function getNameSQLServerURL($resourceGroup) {
    return "$($resourceGroup.ToLower())-sql.database.windows.net"
}

function getNameSQLDatabase($resourceGroup, $dbType) {
    if ([string]::IsNullOrEmpty($dbType)) {
        return "$($resourceGroup.ToLower())-db"
    } else {
        return "$($resourceGroup.ToLower())-$($dbType.ToLower())-db"
    }
}

function getNameSQLUser($resourceGroup, $dbType) {
    if ([string]::IsNullOrEmpty($dbType)) {
        return "$($resourceGroup.ToLower())"
    } else {
        return "$($resourceGroup.ToLower())-$($dbType.ToLower())"
    }
}

function getNameAppServicePlan($resourceGroup) {
    return "$($resourceGroup.ToLower())-plan"
}

function getNameDevopsProject($repository, $branch) {
    return "$repository-$branch"
}

function getNameWebApp($resourceGroup, $webAppType) {
    if ([string]::IsNullOrEmpty($webAppType)) {
        return $resourceGroup.ToLower()
    } else {
        return "$($resourceGroup.ToLower())-$($webAppType.ToLower())"
    }
}

function getNameServicePrincipal($resourceGroup) {
    return "SP$($resourceGroup.ToLower())"
}

function getNameServiceConnection($repository) {
    return "$($repository.ToLower())"
}
