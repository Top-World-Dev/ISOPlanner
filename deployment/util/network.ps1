# #!/usr/bin/pwsh

# #####################################################
# #                                                   # 
# # This file is located in the Azure repository and  #
# # must be pulled via the git upstream.              #  
# #                                                   #  
# # Don't make any changes to this file outside       # 
# # the Azure repository, otherwise merge conflicts   #
# # will occur.                                       #
# #                                                   #
# #####################################################

# # Include required files
# $ScriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
# try {
#     . ("$ScriptDirectory\naming.ps1")
#     . ("$ScriptDirectory\globals.ps1")
# }
# catch {
#     Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
#     Write-Error $_.Exception | format-list -force
#     throw
# }

# # WORK IN PROGRESS

# function Create_VNET() {

# local Name=$1-VNET
# local resourceGroup=$1

# local Region="westeurope"
# local Network="172.16.0.0/16"
# local Subnet="172.16.255.0/24"
        
#    exist=$(az network vnet list --resource-group "$resourceGroup" --query "[?name=='$Name']" --output tsv | wc -l)
#    echo -e "\e[36m VNET $Name exists: $exist\0033[0m"

#    if [ "$exist" -eq 0 ]; then
#         echo -e "\e[36m Creating VNET\0033[0m"
#         az network vnet create \
#                 --name "$Name" \
#                 --resource-group "$resourceGroup" \
#                 --location "$Region" \
#                 --address-prefix "$Network" \
#                 --subnet-name GatewaySubnet \
#                 --subnet-prefix "$Subnet"
#    fi

# }

# function Create_Subnet_apps() {

# local customerName=$1
# local Name=$1-VNET
# local resourceGroup=$1
# local environment=$2
# local subnetName=$customerName-$environment-Apps

#     #determine address space: next subnet is the count of subnets
#     local max=$(az network vnet subnet list --resource-group "$resourceGroup" --vnet-name "$Name" --output tsv | wc -l)
#     local addressprefix=${5:-172.16."$max".0/24}

#     exist=$(az network vnet subnet list --resource-group "$resourceGroup" --vnet-name "$Name" --query "[?name=='$subnetName']" --output tsv | wc -l)
#     echo -e "\e[36m subnet $subnetName exists: $exist\0033[0m"

#     if [ "$exist" -eq 0 ]; then
#         echo -e "\e[36m Creating subnet $subnetName with address space $addressprefix\0033[0m"
#         az network vnet subnet create \
#                 --address-prefixes "$addressprefix" \
#                 --vnet-name "$Name" \
#                 --name "$subnetName" \
#                 --resource-group "$resourceGroup" \
#                 --service-endpoints Microsoft.Web \
#                 --delegations Microsoft.Web/serverFarms
                
#     fi

# }

# function Create_Subnet_db() {

# local customerName=$1
# local Name=$1-VNET
# local resourceGroup=$1
# local environment=$2
# local subnetName=$customerName-$environment-DB

#     #determine address space: next subnet is the count of subnets
#     local max=$(az network vnet subnet list --resource-group "$resourceGroup" --vnet-name "$Name" --output tsv | wc -l)
#     local addressprefix=${5:-172.16."$max".0/24}

#     exist=$(az network vnet subnet list --resource-group "$resourceGroup" --vnet-name "$Name" --query "[?name=='$subnetName']" --output tsv | wc -l)
#     echo -e "\e[36m subnet $subnetName exists: $exist\0033[0m"

#     if [ "$exist" -eq 0 ]; then
#         echo -e "\e[36m Creating subnet $subnetName with address space $addressprefix\0033[0m"
#         az network vnet subnet create \
#                 --address-prefixes "$addressprefix" \
#                 --vnet-name "$Name" \
#                 --name "$subnetName" \
#                 --resource-group "$resourceGroup" \
#                 --service-endpoints Microsoft.Web Microsoft.SQL\
#                 --delegations Microsoft.Web/serverFarms

#     fi
   
# }

# function Create_Additional_Subnet() {

# local VNETName=$1
# local resourceGroup=$3 
# local subnetName=$2
# local ServiceEndpoint=${4:-Microsoft.Web}
# local SubnetIPRange=${5:-172.16.100.0/24}

#         az network vnet subnet create \
#                 --vnet-name "$vnetName" \
#                 --resource-group "$resourceGroup" \
#                 --name "$subnetName" \
#                 --service-endpoints "$ServiceEndpoint" \
#                 --address-prefix "$SubnetIPRange"        
   
# }

# function WebAppAccessRestrictionCreate() {

#     local customerName=$1
#     local environment=$2
#     local webAppSuffix=$3
#     local subnetNameSuffix=$4
#     local IP=$5
#     local priority=$6

#     local vNETname=$customerName-VNET
#     local resourceGroup=$customerName

#         if [ ! "$webAppSuffix" == "" ]; then
#                 webAppName=$customerName-$environment-$webAppSuffix
#         else
#                 webAppName=$customerName-$environment
#         fi

#         if [ ! "$IP" == "" ]; then
#                 #allow IP-address
#                 ruleName="Allow $IP"
#                 WebAppAccessRestrictionExists "$customerName" "$webAppName" "$ruleName"
#                 echo -e "\e[36m Web app $webAppName access restriction rule $ruleName exists: $exist\0033[0m"
                
#                 echo "resourcegroup: $resourceGroup"
#                 echo "webAppName: $webAppName"
#                 echo "ruleName: $ruleName"
#                 echo "VNETname: $vNETname"
#                 echo "subnetName: $subnetNameSuffix"
#                 echo "Priority: $priority"
#                 echo "IP: $IP"

#                 if [ "$exist" -eq 0 ]; then
#                         az webapp config access-restriction add \
#                                 --resource-group "$resourceGroup" \
#                                 --name "$webAppName" \
#                                 --rule-name "$ruleName" \
#                                 --action Allow \
#                                 --ip-address "$IP" \
#                                 --priority "$priority" \
#                                 --output none
#                 fi
#         else
#                 #allow vnet/subnet
#                 ruleName="Allow $customerName-$environment-$subnetNameSuffix"
#                 local subnetName="$customerName-$environment-$subnetNameSuffix"
#                 local RuleLength=${#ruleName}

#                 #rule name has max of 32 char
#                 if [ "$RuleLength" -gt 32 ]; then
#                    echo -e "\e[36m Rule length $ruleName cannot exceed 32 characters.\0033[0m"
#                    exit 129
#                 fi

#                 WebAppAccessRestrictionExists "$resourceGroup" "$webAppName" "$ruleName"
#                 echo -e "\e[36m Web app $webAppName access restriction rule $ruleName exists: $exist\0033[0m"

#                 echo "resourcegroup: $resourceGroup"
#                 echo "webAppName: $webAppName"
#                 echo "ruleName: $ruleName"
#                 echo "VNETname: $vNETname"
#                 echo "subnetName: $subnetNameSuffix"
#                 echo "Priority: $priority"
#                 echo "IP: $IP"

#                 if [ "$exist" -eq 0 ]; then
#                         az webapp config access-restriction add \
#                                 --resource-group "$resourceGroup" \
#                                 --name "$webAppName" \
#                                 --rule-name "$ruleName" \
#                                 --action Allow \
#                                 --vnet-name "$vNETname" \
#                                 --subnet "$subnetName" \
#                                 --priority "$priority" \
#                                 --output none
#                 fi

#         fi
# }

# function WebAppAccessRestrictionExists() {

# local customerName=$1 
# local webAppName=$2
# local ruleName=$3

# local resourcegroup=$customerName

#         #return the line count; if line count = 0 the access restriction does not exists
#         exist=$(az webapp config access-restriction show \
#                 --resource-group "$resourceGroup" \
#                 -n "$webAppName" \
#                 --query "[ipSecurityRestrictions[?name=='$ruleName']]" \
#                 | wc -l)

#         #substract 3 empty lines to correct for an empty result (--output tsv does not work)
#         exist=$(($exist-3))
# }

# function WebApp_VNET_Integration() {

# local customerName=$1
# local environment=$2
# local webAppSuffix=$3

#         if [ "$webAppSuffix" == "" ]; then
#                 webAppName=$customerName-$environment
#         else
#                 webAppName=$customerName-$environment-$webAppSuffix
#         fi

#     local resourceGroup=$customerName
#     local vNETName=$customerName-VNET
#     local subnetApps=$customerName-$environment-Apps
        
#         az webapp vnet-integration add \
#                 --name $webAppName \
#                 --resource-group "$resourceGroup" \
#                 --vnet $vNETName \
#                 --subnet "$subnetApps" \
#                 --output none

#         #web sockets
#         az webapp config set \
#                 --resource-group "$resourceGroup" \
#                 --name $webAppName \
#                 --web-sockets-enabled true \
#                 --output none
# }

# # function Update_KIM() {
# #     #voor KIM
# #     local Name=$1
# #     local resourceGroup=$2
# #     local VNETname=$3
# #     local SubnetApps=$4
# #     local SubnetDB=$5 

# #         #vnet integration
# #         az webapp vnet-integration add \
# #                 --resource-group "$resourceGroup" \
# #                 --name "$Name" \
# #                 --vnet "$vnetname" \
# #                 --subnet "$SubnetApps"

# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "$vnetname" "$SubnetApps" "" 5
# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "$vnetname" "$SubnetDB" "" 15

# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "" "" "$Kantoor" 10
# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "" "" "$KTS" 11

# #         #classic pipeline mode
# #         az webapp config set \
# #                 --resource-group "$resourceGroup" \
# #                 --name "$Name" \
# #                 --generic-configurations '{"managedPipelineMode": "Classic"}'

# # }

# # function Update_Planning() {
# #     #voor KIM
# #     local Name=$1
# #     local resourceGroup=$2
# #     local VNETname=$3
# #     local SubnetApps=$4
# #     local SubnetDB=$5 

# #         az webapp vnet-integration add \
# #                 --resource-group "$resourceGroup" \
# #                 --name "$Name" \
# #                 --vnet "$vnetname" \
# #                 --subnet "$SubnetApps"

# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "$vnetname" "$SubnetApps" "" 5
# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "$vnetname" "$SubnetDB" "" 15

# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "" "" "$Kantoor" 10
# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "" "" "$KTS" 11
# # }


# # function Update_Rest() {
# #     #Voor IRISrest    
# #     local Name=$1
# #     local resourceGroup=$2
# #     local VNETname=$3
# #     local SubnetApps=$4
# #     local SubnetDB=$5  

# #         #vnet integration
# #         az webapp vnet-integration add \
# #                 --resource-group "$resourceGroup" \
# #                 --name "$Name" \
# #                 --vnet "$vnetname" \
# #                 --subnet "$SubnetApps"

# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "$vnetname" "$SubnetApps" "" 5
# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "$vnetname" "$SubnetDB" "" 15

# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "" "" "$Kantoor" 10
# #         WebAppAccessRestrictionCreate "$resourceGroup" "$Name" "" "" "$KTS" 11

# #         #web sockets
# #         az webapp config set -g "$resourceGroup" --name "$Name" --web-sockets-enabled true
# # }

# function Update_SQL_Firewall_Rules() {

# local customerName=$1
# local Name=$(echo "$1-sql" | tr '[:upper:]' '[:lower:]')
# local resourceGroup=$customerName
# local VNETname=$customerName-VNET
# local SubnetDB=$1-$2-DB
    
#     local VNETRuleName="Allow $SubnetDB"

#     exist=$(az sql server vnet-rule list --resource-group "$resourceGroup" --server "$Name"  --query "[?name=='$VNETRuleName']" --output tsv | wc -l)
#     echo -e "\e[36m SQL server VNET rule $VNETRuleName exists: $exist\0033[0m"

#     if [ "$exist" -eq 0 ]; then

#         az sql server vnet-rule create \
#                 --server "$Name" \
#                 --name "$VNETRuleName" \
#                 --resource-group "$resourceGroup" \
#                 --vnet-name "$VNETname" \
#                 --subnet "$SubnetDB"
#     fi

#     local FilewallRule="Allow $Kantoor"
#     exist=$(az sql server firewall-rule list --resource-group "$resourceGroup" --server "$Name"  --query "[?name=='$FilewallRule']" --output tsv | wc -l)
#     echo -e "\e[36m SQL server firewall rule exists: $exist\0033[0m"

#     if [ "$exist" -eq 0 ]; then

#         az sql server firewall-rule create \
#                 --resource-group "$resourceGroup" \
#                 --server "$Name" \
#                 --name "$FilewallRule" \
#                 --start-ip-address "$Kantoor" \
#                 --end-ip-address "$Kantoor" 
#     fi            

#     FilewallRule="Allow $KTS"
#     exist=$(az sql server firewall-rule list --resource-group "$resourceGroup" --server "$Name"  --query "[?name=='$FilewallRule']" --output tsv | wc -l)
#     echo -e "\e[36m SQL server firewall rule exists: $exist\0033[0m"

#     if [ "$exist" -eq 0 ]; then

#         az sql server firewall-rule create \
#                 --resource-group "$resourceGroup" \
#                 --server "$Name" \
#                 --name "$FilewallRule" \
#                 --start-ip-address "$KTS" \
#                 --end-ip-address "$KTS" 
#     fi    
# }

# #############
# #  revised  #
# #############

# function Remove_VPN() {

# local customerName=$1
# local vpnName="$customerName-VPN"
# local vpnLocalGatewayName="$customerName-OnPremise"
# local vpnConnectionName="$customerName-Connection"

#         az network vpn-connection delete --name "$vpnConnectionName"
#         az network local-gateway delete --name "$vpnLocalGatewayName"
#         az network vnet-gateway delete -name "$vpnName"
# }

# function Create_VPN() {

# local customerName=$1
# localGatewayIP=$2 #"86.92.252.143"
# localGatewayAddress=$3 #"192.168.50.0/24"

# local vpnName="$customerName-VPN"
# local vpnPublicIPName="$customerName-PublicIP-VPN"
# local vnetName="$customerName-VNET"
# local vpnLocalGatewayName="$customerName-OnPremise"
# local vpnConnectionName="$customerName-Connection"

#         az network public-ip create \
#                 --name "$vpnPublicIPName" \
#                 -g "$customerName" \

#         az network vnet-gateway create \
#                 --name "$vpnName" \
#                 -l westeurope \
#                 --public-ip-address "$vpnPublicIPName" \
#                 -g "$customerName" \
#                 --vnet "$vnetName" \
#                 --gateway-type Vpn \
#                 --sku VpnGw1 \
#                 --vpn-type RouteBased \
#                 --no-wait

#         az network local-gateway create -g "$customerName" -n "$vpnLocalGatewayName" \
#         --gateway-ip-address "$localGatewayIP" \
#         --local-address-prefixes "$localGatewayAddress"  

#         az network vpn-connection create -g "$customerName" \
#                 -l westeurope \
#                 --name "$vpnConnectionName" \
#                 --vnet-gateway1 "$vpnName" \
#                 --local-gateway2 "$vpnLocalGatewayName" \
#                 --shared-key dummyPSK
                
#         az network vpn-connection ipsec-policy add \
#                 -g "$customerName" \
#                 --connection-name "$vpnConnectionName" \
#                 --dh-group ECP384 \
#                 --ike-encryption AES256 \
#                 --ike-integrity SHA384 \
#                 --ipsec-encryption AES256 \
#                 --ipsec-integrity SHA256 \
#                 --pfs-group None \
#                 --sa-lifetime 3600 \
#                 --sa-max-size 2048

#         az network vpn-connection update --name "$vpnConnectionName" \
#                 --use-policy-based-traffic-selectors true \
#                 -g "$customerName"
# }

# function SQL_Firewall() {
#         local customerName=$1
#         local statusParam=$2
#         echo -e "\e[36m SQL_Firewall customerName: $customerName status: $statusParam\0033[0m" 

#         resourceGroup=$customerName
#         sqlServer=$(echo "$customerName-sql" | tr '[:upper:]' '[:lower:]')
#         ruleName="Agent-FW-rule"
#         status="$(echo "$statusParam" | tr '[:upper:]' '[:lower:]')"
#         IP=$(curl -s ipinfo.io/ip)

#         if [ $status == "open" ]; then
#                 az sql server firewall-rule create --resource-group $resourceGroup --server $sqlServer --name $ruleName --start-ip-address $IP --end-ip-address $IP --output none
#         elif [ $status == "close" ]; then
#                 az sql server firewall-rule delete --resource-group $resourceGroup --server $sqlServer --name $ruleName --output none
#         else
#                 echo -e "\e[36m Status needs to be open or close\0033[0m"
#         fi
# }

# ####################
# # REMOVE FUNCTIONS #
# ####################

# function Remove_Subnet() {
#     local VNetName=$1
#     local subnetName=$2
#     local resourceGroup=$3

#     exist=$(az network vnet subnet list --resource-group "$resourceGroup" --vnet-name "$VNetName" --query "[?name=='$subnetName']" --output tsv | wc -l)
#     echo -e "\e[36m subnet $subnetName exists: $exist\0033[0m"

#     if [ "$exist" -eq 1 ]; then
#         echo -e "\e[36m Removing subnet $subnetName"
#         az network vnet subnet delete \
#                 --vnet-name "$VNetName" \
#                 --name "$subnetName" \
#                 --resource-group "$resourceGroup"
#     fi

# }

# function Remove_Subnet_db() {
#     local Name=$1
#     local resourceGroup=$2
#     local customerName=$3
#     local environment=$4

#     subnetName=$customerName-$environment-DB
#     Remove_Subnet $Name $subnetName $resourceGroup

# }

# function Remove_Subnet_apps() {
#     local Name=$1
#     local resourceGroup=$2
#     local customerName=$3
#     local environment=$4

#     subnetName=$customerName-$environment-Apps
#     Remove_Subnet $Name $subnetName $resourceGroup

# }

# function Remove_SQL_VNET_Rules() {
#     #SQL-server
#     local Name=$1
#     local resourceGroup=$2
#     local VNETname=$3
#     local SubnetDB=$4
    
#     local VNETRuleName="Allow subnet $SubnetDB traffic"

#     exist=$(az sql server vnet-rule list --resource-group "$resourceGroup" --server "$Name"  --query "[?name=='$VNETRuleName']" --output tsv | wc -l)
#     echo -e "\e[36m SQL server VNET rule $VNETRuleName exists: $exist\0033[0m"

#     if [ "$exist" -eq 1 ]; then
#         echo -e "\e[36m Removing SQL Server VNET rule $VNETRuleName\0033[0m"
#         az sql server vnet-rule delete \
#                 --server "$Name" \
#                 --name "$VNETRuleName" \
#                 --resource-group "$resourceGroup"

#     fi
# }