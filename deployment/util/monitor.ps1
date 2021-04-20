# #!/bin/bash

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

# #WORK IN PROGRESS

# function Create_Metrics_Alert_AppServicePlan_CPU) {
#     Customername=$1
#     Environment=$2

#     Name="$Customername $Environment CPU"

#     az monitor metrics alert create --condition "avg CpuPercentage > 90" \
#                                     --window-size 5m \
#                                     --evaluation-frequency 1m \
#                                     --description "$Name" \
#                                     --name "$Name" \
#                                     --severity 3
#                                     --resource-group "$Customername" \
#                                     --scopes ""
#                                     --action "Support"

# }

# function Create_Metrics_Alert_AppServicePlan_Memory) {
#     Customername=$1
#     Environment=$2

#     Name="$Customername $Environment Memory"

#     az monitor metrics alert create --condition "avg MemoryPercentage > 80" \ 
#                                     --window-size 5m \
#                                     --evaluation-frequency 1m \
#                                     --description "$Name" \
#                                     --name "$Name" \
#                                     --severity 3
#                                     --resource-group "$Customername" \
#                                     --scopes ""
#                                     --action "Support"

# }

# function Create_Metrics_Alert_AppService_HTTPErrors) {
#     Customername=$1
#     Environment=$2
#     WebAppName=$3

#     Name="$WebAppName HTTP Server Errors"

#     az monitor metrics alert create --condition "total Http5xx > 0" \ 
#                                     --window-size 5m \
#                                     --evaluation-frequency 1m \
#                                     --description "$Name" \
#                                     --name "$Name" \
#                                     --severity 3
#                                     --resource-group "$Customername" \
#                                     --scopes ""
#                                     --action "Support"

# }

# function Create_Metrics_Alert_AppService_AverageResponseTime) {
#     Customername=$1
#     Environment=$2
#     WebAppName=$3

#     Name="$WebAppName Average Response Time"

#     az monitor metrics alert create --condition "avg ResponseTime > 10" \ 
#                                     --window-size 5m \
#                                     --evaluation-frequency 1m \
#                                     --description "$Name" \
#                                     --name "$Name" \
#                                     --severity 3
#                                     --resource-group "$Customername" \
#                                     --scopes ""
#                                     --action "Support"

# }