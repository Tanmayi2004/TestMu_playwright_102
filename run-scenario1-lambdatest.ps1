$ErrorActionPreference = 'Stop'

$env:LT_USERNAME = Read-Host 'Enter your TestMu/LambdaTest username'
$secureKey = Read-Host 'Enter the current LT_ACCESS_KEY (input stays hidden)' -AsSecureString
$keyPointer = [IntPtr]::Zero

try {
  $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  $env:LT_ACCESS_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)

  npx playwright-node-sdk playwright test
  if ($LASTEXITCODE -ne 0) {
    throw 'LambdaTest Playwright cloud run failed. Check the SDK output and TestMu Automation build.'
  }
}
finally {
  Remove-Item Env:LT_USERNAME -ErrorAction SilentlyContinue
  Remove-Item Env:LT_ACCESS_KEY -ErrorAction SilentlyContinue
  if ($keyPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  }
  $secureKey.Dispose()
}