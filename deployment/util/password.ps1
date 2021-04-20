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

$charArrayLetters = [Char[]]'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'     
$charArrayDigit   = [Char[]]'0123456789' 
$charArraySymbol  = [Char[]]'!#$%()*+.:;<=>?@[]^_{}~' 
# note that the following excluded special chars are not easily manageable in sql, ps and azcli: -&|`/\',"

function generatePassword($totalLenght, $numDigit, $numSymbol, $Symbols) {

    $charArrayLetters = [Char[]]'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'     
    $charArrayDigit   = [Char[]]'0123456789'    

    if ($Symbols) {
        $charArraySymbol  = [Char[]]$Symbols
    }

    if ($totalLenght -lt 16) { throw "Password to weak"}

    $numletters = $totalLenght - $numDigit - $numSymbol
    if ($numletters -lt 1) { throw "Total number of digits and symbols cannot exceed the total length minus 1"}

    while ($charArrayLetters.Length -lt $numletters) {
        $charArrayLetters += $charArrayLetters
    }

    $letters = (Get-Random -Count $numletters -InputObject ([char[]]$charArrayLetters)) -join ''
    
    if ($numDigit -gt 0) {

        while ($charArrayDigit.Length -lt $numDigit) {
            $charArrayDigit += $charArrayDigit
        }

        $digit = (Get-Random -Count $numDigit -InputObject ([char[]]$charArrayDigit)) -join ''
    }

    if ($numSymbol -gt 0) {

        while ($charArraySymbol.Length -lt $numSymbol) {
            $charArraySymbol += $charArraySymbol
        }

        $symbol = (Get-Random -Count $numSymbol -InputObject ([char[]]$charArraySymbol)) -join ''
    }

    $total = $letters + $digit + $symbol
    $p = (Get-Random -Count $totalLenght -InputObject ([char[]]$total)) -join ''

    return $p
}
