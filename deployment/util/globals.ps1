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

# - devops -
$devopsOrganization = "https://dev.azure.com/redlab-app"
$devopsAgentImage = "windows-latest"
$devopsAgentPool = "Azure Pipelines"

# - azure -
$azureRegion = "westeurope"
$azureSubscriptionName = "REDLAB"
$azureSubscriptionId = "43b823ec-a954-4999-858f-9846195e3845"
$webAppTimeZone = "W. Europe Standard Time"
$baseResourceGroup = "REDLAB"
$spDevops = "SP-REDLAB-DEVOPS"

# - sql -
$sqlAdminADGroup = "SQLAdmins"
$sqlAdminADUser = "sqladmin"
$sqlAdminUser = "sysroot"
$sqlAllowedIpAddresses = @("77.169.193.67", "80.60.207.8")

# - github -
$githubOrganization = "redlab-app"
$gitMainBranche = "main"
