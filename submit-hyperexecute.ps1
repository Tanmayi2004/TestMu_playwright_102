$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$cli = Join-Path $projectRoot 'hyperexecute.exe'

if (-not (Test-Path $cli)) {
  throw 'HyperExecute CLI not found at the project root.'
}

$env:LT_USERNAME = 'mtanmayi'
$secureKey = Read-Host 'Enter your current LT_ACCESS_KEY (input stays hidden)' -AsSecureString
$keyPointer = [IntPtr]::Zero

try {
  $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  $env:LT_ACCESS_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)

  Push-Location $projectRoot
  & $cli --config hyperexecute.yaml --validate
  if ($LASTEXITCODE -ne 0) {
    throw 'HyperExecute config validation failed; no job was submitted.'
  }

  & $cli --config hyperexecute.yaml --concurrency 2
  if ($LASTEXITCODE -ne 0) {
    throw 'HyperExecute job submission failed.'
  }
}
finally {
  if ((Get-Location).Path -eq $projectRoot) {
    Pop-Location
  }
  Remove-Item Env:LT_USERNAME -ErrorAction SilentlyContinue
  Remove-Item Env:LT_ACCESS_KEY -ErrorAction SilentlyContinue
  if ($keyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  }
  $secureKey.Dispose()
}