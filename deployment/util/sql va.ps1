# #!/usr/bin/pwsh

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

# # VA - Vulnerability Assesment

# # Include required files
# $ScriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
# try {
#     . ("$ScriptDirectory\naming.ps1")
# }
# catch {
#     Write-Host "##[error]Could not load all supporting PowerShell Scripts from $ScriptDirectory"
#     Write-Error $_.Exception | format-list -force
#     throw
# }

# Function ClearDBVulnerabilityAssesmentRuleBaseline ($customerName, $db, $ruleid) {

#     $server = getNameSQLServer $customerName
 
#     $baselineresult = Get-AzSqlDatabaseVulnerabilityAssessmentRuleBaseline -ResourceGroupName $customerName -ServerName $server -DatabaseName $db -RuleId $ruleid -ErrorAction SilentlyContinue

#     if ($baselineresult -and $baselineresult.BaselineResult.Count -gt 0) {
#         Write-Host "Clearing baseline."
#         Clear-AzSqlDatabaseVulnerabilityAssessmentRuleBaseline -ResourceGroupName $customerName -ServerName $server -DatabaseName $db -RuleId $ruleid
#     } else {
#         Write-Host "No baseline was present."
#     }
# }

# Function AddDBVulnerabilityAssesmentRuleBaseline ($customerName, $db, $ruleid, $baselineresult) {

#     $server = "$($customerName.ToLower())-sql"

#     Write-Host "Setting baseline rule: $ruleid" -ForegroundColor Green
    
#     ClearDBVulnerabilityAssesmentRuleBaseline $customerName $db $ruleid
    
#     if ($baselineresult -and $baselineresult.count -gt 0) {
        
#         Write-Host "Setting baseline values: $baselineresult"
#         for ($i = 0; $i -le ($baselineresult.length - 1); $i += 1) {
#             Write-Host $baselineresult[$i]
#         }

#         Set-AzSqlDatabaseVulnerabilityAssessmentRuleBaseline -ResourceGroupName $customerName -ServerName $server -DatabaseName $db -RuleId $ruleid -BaselineResult $baselineresult
#     }
# }

# Function AddDBVulnerabilityAssesmentRuleBaselineOptional ($customerName, $db, $ruleid, $baselineresult, $scanresult) {

#     $server = "$($customerName.ToLower())-sql"

#     Write-Host "Setting optional baseline rule: $ruleid" -ForegroundColor Green
    
#     ClearDBVulnerabilityAssesmentRuleBaseline $customerName $db $ruleid
    
#     if ($baselineresult -and $baselineresult.count -gt 0) {

#         $actualresult = @()
#         $actualresult = $scanresult.Scans.Results | Where-Object {$_.RuleId -eq $ruleid -and $_.Status -eq "Finding"} | Select-Object {$_.QueryResults}
    
#         if ($actualresult -and $actualresult.psobject -and $actualresult.psobject.properties -and $actualresult.psobject.properties.value) {

#             $numvalues = $actualresult.psobject.properties.value.count

#             Write-Host "Actual result type: $($actualresult.psobject.properties.value.GetType())"
#             Write-Host "Number of items: $numvalues"
    
#             if ($numvalues -gt 0) {

#                 $optionalbaselineresult = @()
#                 $actualbaselinevalue = @()

#                 Write-Host "Actual baseline result:"
                
#                 for ($i = 0; $i -lt $numvalues; $i++) {

#                     $actualbaselinevalue = $actualresult.psobject.properties.value[$i]
#                     $actualbaselinevaluetype = $actualbaselinevalue.GetType().Name
#                     Write-Host "Actual result type of index: $actualbaselinevaluetype"

#                     if ($actualbaselinevaluetype -eq "String") {
#                         $actualbaselinevalue = $actualresult.psobject.properties.value
#                         $i = $numvalues #there is only 1 array so break the for loop after 1 
#                     } elseif ($actualbaselinevaluetype -eq "Char") {
#                         $actualbaselinevalue = $actualresult.psobject.properties.value
#                     } elseif ($actualbaselinevaluetype -eq "Array") {
#                         $actualbaselinevalue = $actualresult.psobject.properties.value[$i]
#                     } elseif ($actualbaselinevaluetype -eq "Object[]") {
#                         $actualbaselinevalue = $actualresult.psobject.properties.value[$i]
#                     } else {
#                         throw "Unknown type"
#                     }
                    
#                     if (HasActualResultInBaseline $actualbaselinevalue $baselineresult) {
#                         Write-Host "Adding to baseline"
#                         $optionalbaselineresult += , $actualbaselinevalue
#                     }
#                 }

#                 if ($optionalbaselineresult.Length -gt 0) {
#                     Set-AzSqlDatabaseVulnerabilityAssessmentRuleBaseline -ResourceGroupName $customerName -ServerName $server -DatabaseName $db -RuleId $ruleid -BaselineResult $optionalbaselineresult
#                 } else {
#                     Write-Host "Nothing to set"
#                 }

#             } else {
#                 Write-Host "No QueryResults found. Do not apply the optional baseline."
#             }

#         } else {
#             Write-Host "No QueryResults found. Do not apply the optional baseline."
#         }
#     }
# }

# function HasActualResultInBaseline ([String[]]$actualbaselinevalue, [String[][]]$baselineresult) {

#     for ($i = 0; $i -le ($baselineresult.length - 1); $i += 1) {
        
#         $pa = $baselineresult[$i]
 
#         if ($actualbaselinevalue.Length -ne $pa.length) {
#             Write-Host "Length is not equal. actual baseline: $($actualbaselinevalue.Length) baseline: $($pa.Length)"
#             return $false
#         }

#         $arraynotequal = 0

#         for ($j = 0; $j -le ($pa.length - 1); $j += 1) {

#             $val1 = $actualbaselinevalue[$j]
#             $val2 = $pa[$j]

#             Write-Host "Comparing $val1 -notlike $val2"

#             if ($val1 -notlike $val2) {
#                 $arraynotequal = 1
#                 break
#             }

#         }

#         if ($arraynotequal -eq 0) {
#             #we found an entry in baselineresult where all items in the array match with actualbaselinevalue
#             Write-Host "Equal"
#             return $true
#         }

#     }

#     Write-Host "Not equal"
#     return $false

# }

# Function AddDBVulnerabilityAssesmentRuleBaselineFromScanResult ($customerName, $db, $ruleid, $scanresult) {

#     $server = "$($customerName.ToLower())-sql"

#     Write-Host "Setting baseline rule from scan result: $ruleid" -ForegroundColor Green

#     ClearDBVulnerabilityAssesmentRuleBaseline $customerName $db $ruleid

#     $actualresult = $scanresult.Scans.Results | Where-Object {$_.RuleId -eq $ruleid -and $_.Status -eq "Finding"} | Select-Object {$_.QueryResults}
    
#     if ($actualresult -and $actualresult.psobject -and $actualresult.psobject.properties -and $actualresult.psobject.properties.value) {

#         $numvalues = $actualresult.psobject.properties.value.count
#         Write-Host "Number of arrays: $numvalues"

#         if ($numvalues -gt 0) {

#             $baselineresult = @()
    
#             for ($i = 0; $i -lt $numvalues; $i++) {
#                 $baselineresult += , $actualresult.psobject.properties.value[$i]
#             }

#             Write-Host "Setting baseline values: $baselineresult"
#             for ($i = 0; $i -le ($baselineresult.length - 1); $i += 1) {
#                 Write-Host $baselineresult[$i]
#             }
                
#             Set-AzSqlDatabaseVulnerabilityAssessmentRuleBaseline -ResourceGroupName $customerName -ServerName $server -DatabaseName $db -RuleId $ruleid -BaselineResult $baselineresult
        
#         }

#     } else {
#         Write-Host "No QueryResults found"
#     }
# }

# function AddVulnerabilityAssesmentRulesBaselineMaster ($customerName, $scanresult) {

#     #VA2130
#     $ruleid = "VA2130"
#     $baselineresult = @("sysop", "*"), @("Klant - $customerName - SQL - *", "*"), @("KUBAZ - SQL Administrator", "*")
#     AddDBVulnerabilityAssesmentRuleBaselineOptional $customerName "master" $ruleid $baselineresult $scanresult
    
#     #VA2065
#     $ruleid = "VA2065"
#     $baselineresult = @("Allow $kantoor", "$kantoor", "$kantoor"), @("Allow $KTS", "$KTS", "$KTS"), @("AllowAllAzureIPs", "$Azure", "$Azure"), @("AllowAllAzureIPs", "$Azure", "$Azure")
#     AddDBVulnerabilityAssesmentRuleBaseline $customerName "master" $ruleid $baselineresult

#     #VA2108
#     #Drop users

#     #VA1143
#     #Create users

#     #VA1281

#     #VA2109 


# }

# function AddVulnerabilityAssesmentRulesBaselineGeneric ($customerName, $environment, $db) {

#     Write-Host "Adding generic baseline rules"

#     #VA1258
#     $ruleid = "VA1258"
#     $baselineresult = , @("Klant - $customerName - SQL - $environment")
#     AddDBVulnerabilityAssesmentRuleBaselineOptional $customerName $db $ruleid $baselineresult $scanresult

#     #VA2130
#     $ruleid = "VA2130"
#     $baselineresult = @("Klant - $customerName - SQL - $environment", "*"), @("dbo", "*")
#     AddDBVulnerabilityAssesmentRuleBaselineOptional $customerName $db $ruleid $baselineresult $scanresult

# }

# function AddVulnerabilityAssesmentRulesBaselineIRIS ($customerName, $environment, $db, $scanresult) {

#     Write-Host "Adding baseline rules for IRIS"

#     AddVulnerabilityAssesmentRulesBaselineGeneric $customerName $environment $db 

#     #VA1282
#     $ruleid = "VA1282"
#     $baselineresult = , @("db_executor")
#     AddDBVulnerabilityAssesmentRuleBaselineOptional $customerName $db $ruleid $baselineresult $scanresult

#     #VA2030
#     $ruleid = "VA2030"
#     $baselineresult = , @("DATABASE", "EXECUTE", "DATABASE_ROLE", "db_executor")
#     AddDBVulnerabilityAssesmentRuleBaselineOptional $customerName $db $ruleid $baselineresult $scanresult

#     #VA1054
#     #revoke execute on {object} from public

# }

# function AddVulnerabilityAssesmentRulesBaselineKIM ($customerName, $environment, $db, $scanresult) {

#     Write-Host "Adding baseline rules for KIM"

#     AddVulnerabilityAssesmentRulesBaselineGeneric $customerName $environment $db

#     #VA1282
#     $ruleid = "VA1282"
#     $baselineresult = , @("db_executor")
#     AddDBVulnerabilityAssesmentRuleBaselineOptional $customerName $db $ruleid $baselineresult $scanresult

# }

# function AddVulnerabilityAssesmentRulesBaselinePM ($customerName, $environment, $db, $scanresult) {

#     Write-Host "Adding baseline rules for PM"

#     AddVulnerabilityAssesmentRulesBaselineGeneric $customerName $environment $db 

# }

# function CleanFirewallRulesCustomer ($customerName) {

#     $sqlservers = Get-AzSqlServer -ResourceGroupName $customerName

#     foreach ($server in $sqlservers) {

#         Write-Host "Processing SQL Server: $($server.ServerName)"
#         CleanFirewallRulesServer $customerName $server.ServerName

#     }
# }

# function CleanFirewallRulesServer ($customerName, $server) {

#     #Remove all rules and re-create them because the names cannot be updated and de vulnerability assesment procedure expects exact matches

#     $rules = Get-AzSqlServerFirewallRule -ResourceGroupName $customerName -ServerName $server

#     foreach ($rule in $rules) {
        
#         Write-Host "Removing firewall rule $($rule.FirewallRuleName) from $server"
#         Remove-AzSqlServerFirewallRule -ResourceGroupName $customerName -ServerName $server -FirewallRuleName $rule.FirewallRuleName -Force

#     }

#     Write-Host "Creating new firewall rules."
#     New-AzSqlServerFirewallRule -ResourceGroupName $customerName -ServerName $server -FirewallRuleName "Allow $kantoor" -StartIpAddress $Kantoor -EndIpAddress $Kantoor
#     New-AzSqlServerFirewallRule -ResourceGroupName $customerName -ServerName $server -FirewallRuleName "Allow $KTS" -StartIpAddress $KTS -EndIpAddress $KTS
#     New-AzSqlServerFirewallRule -ResourceGroupName $customerName -ServerName $server -FirewallRuleName "AllowAllAzureIPs" -StartIpAddress $Azure -EndIpAddress $Azure

# }

# function SetDatabaseSensitivityRecommendationCustomer ($customerName) {

#     $sqlservers = Get-AzSqlServer -ResourceGroupName $customerName

#     foreach ($server in $sqlservers) {

#         $databases = Get-AzSqlDatabase -ResourceGroupName $customerName -ServerName $server.ServerName

#         foreach ($db in $databases)
#         {
#             if ($db.DatabaseName -ne "master") {
#                 SetDatabaseSensitivityRecommendation $customerName $server.ServerName $db.DatabaseName
#             }
#         }

#     }

# }

# function SetDatabaseSensitivityRecommendation ($customerName, $server, $db) {

#     #set the data classification to the recommended columns and labels
#     Write-Host "Setting data classification recommendation for database $customerName.$server.$db"
#     Get-AzSqlDatabaseSensitivityRecommendation -ResourceGroupName $customerName -ServerName $server -DatabaseName $db | Set-AzSqlDatabaseSensitivityClassification
# }

# function AddVulnerabilityAssesmentRulesBaselineCustomer ($customerName) {

#     try {
        
#         $server = "$($customerName.ToLower())-sql"

#         $sqlserver = Get-AzSqlServer -ResourceGroupName $customerName -ServerName $server -ErrorAction SilentlyContinue
#         if ($sqlserver) {

#             $databases = Get-AzSqlDatabase -ResourceGroupName $customerName -ServerName $server

#             foreach ($database in $databases)
#             {
#                 Write-Host "Processing database: $($database.DatabaseName)" -ForegroundColor Green
    
#                 #determine the environment and type of database
#                 $environment=""
#                 $dbtype=""

#                 if ($database.DatabaseName -eq  "master") {
#                     $dbtype = "master"
#                 } else {

#                     $idx = $database.DatabaseName.LastIndexOf("-")
#                     if ( $idx -gt 0 )
#                     {
#                         $dbtype = $database.DatabaseName.Substring($idx + 1)
#                         Write-Host "dbtype: $dbtype"  

#                         $envtemp = $database.DatabaseName.Substring(0, $idx)
#                         $idxenv = $envtemp.IndexOf("-")
#                         if ( $idxenv -gt 0 )
#                         {
#                             $environment = $envtemp.Substring($idxenv + 1)
#                             Write-Host "environment: $environment"
#                         }
#                     }
#                 }
                
#                 #run the scan
#                 $scanresult = ExecuteVulnerabilityAssesmentScan $customerName $server $database.DatabaseName

#                 if ($scanresult) {

#                     #add the baseline
#                     $rescan=0

#                     #VA1288 - Add data sensitivity columns independend of the database type
#                     AddDBVulnerabilityAssesmentRuleBaselineFromScanResult $customerName $database.DatabaseName "VA1288" $scanresult

#                     if ($dbtype -eq "master") {
#                         AddVulnerabilityAssesmentRulesBaselineMaster $customerName $scanresult
#                         $rescan=1
#                     } elseif ($environment -eq "") {
#                         Write-Warning "Environment not recognized."
#                     } else {

#                         switch -wildcard ( $dbtype.ToLower() )
#                         {
#                             "iris*" {
#                                         AddVulnerabilityAssesmentRulesBaselineIRIS $customerName $environment $database.DatabaseName $scanresult
#                                         $rescan=1
#                                     }
#                             "kim*" {
#                                         AddVulnerabilityAssesmentRulesBaselineKIM $customerName $environment $database.DatabaseName $scanresult
#                                         $rescan=1
#                                     }
#                             "pm*" {
#                                         AddVulnerabilityAssesmentRulesBaselinePM $customerName $environment $database.DatabaseName $scanresult
#                                         $rescan=1
#                                     }
#                             default  {
#                                         Write-Warning "Non-standard database name encountered: $($dbtype.ToLower())"
#                                     }
#                         }
   
#                     }

#                     if ($rescan -eq 1) {
#                         #re-run the scan to verify results
#                         $scanresult = ExecuteVulnerabilityAssesmentScan $customerName $server $database.DatabaseName
#                     }   

#                 } else {
#                     Write-Warning "Scan failed to run. Skipping setting baseline."
#                 }

#             }

#         } else {
#             Write-Warning "SQL Server $server does not exist"
#         }

#     }
#     catch {
#         Write-Error $_.Exception | format-list -force
#     }

# }

# function ExecuteVulnerabilityAssesmentScan ($customerName, $server, $db) {

#     try {

#         #start the scan
#         $scanidnr = Get-Random -Maximum 10000
#         $scanId = "KubionDBVAScan$scanidnr"

#         Write-Host "Starting vulnerability scan in: $customerName on $server.$($database.DatabaseName) with Id: $scanId"

#         $scanresult = Start-AzSqlDatabaseVulnerabilityAssessmentScan -ResourceGroupName $customerName -ServerName $server -Database $database.DatabaseName -ScanId $scanid -AsJob
#         Write-Host "State: $($scanresult.State)..."
        
#         $numwaits = 0

#         #wait until ready
#         do 
#         {
            
#             Start-Sleep -s 2
#             $numwaits += 1

#             try {
#                 $scanresult = Get-AzSqlDatabaseVulnerabilityAssessmentScanRecord -ResourceGroupName $customerName -ServerName $server -Database $database.DatabaseName -ScanId $scanid
#                 Write-Host "State: $($scanresult.State)..."
#             }
#             catch {
#                 Write-Host "Error getting the state"
#                 Write-Host $_.Exception | format-list -force     
#             }

#         } while ((($scanresult.State -eq "Running") -or ($scanresult.State -eq "InProgress")) -and $numwaits -le 30)

#         try {
            
#             #log results
#             Write-Host "Scan result location: $($scanresult.ScanResultsLocationPath)"

#             for ($i = 0; $i -lt $scanresult.Errors.Count; $i++) {
                
#                 $result = $scanresult.Errors[$i]
#                 Write-Warning "$($result.Message)"
#             }

#             if ($scanresult.State -ne "FailedToRun") {

#                 #get JSON result object from storage account
#                 Write-Host "Downloading scan results..."
#                 $SAS = GetStorageAccountSAS $customerName
#                 $url = "$($scanresult.ScanResultsLocationPath)$SAS"

#                 Write-Host "Downloading: $url"
#                 Invoke-WebRequest -Uri $url -OutFile "$scanId.json"
#                 $jsonwithscanresults = Get-Content "$scanId.json" -Raw -Encoding UTF-8 | Out-String | ConvertFrom-Json
                
#                 if ($jsonwithscanresults) {
#                     Write-Host "Succesfully imported the scan results."
#                 } else {
#                     throw "Error downloading scan results."
#                 }

#                 Write-Host "Number of failed checks: $($scanresult.NumberOfFailedSecurityChecks)"
#                 if ($scanresult.NumberOfFailedSecurityChecks -gt 0) {
#                     $failingrules = $jsonwithscanresults.Scans.Results | Where-Object {$_.Status -eq "Finding"} | Select-Object {$_.RuleId}
#                     Write-Host "Failing rules:"
#                     for ($i = 0; $i -le ($failingrules.length - 1); $i += 1) {
#                         Write-Host $failingrules[$i]
#                     }
#                 }

#                 #return the scan results
#                 return $jsonwithscanresults

#             } else {
#                 throw "Vulnerability scan failed to run."
#             }

#         }
#         catch {
#             #if anything goes wrong with the scan results, return nothing
#             Write-Host $_.Exception | format-list -force
#             return $null
#         }
        
#     }
#     catch {
#         Write-Error $_.Exception | format-list -force
#     }

# }            

