$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$hostAddress = "127.0.0.1"
$port = "8080"
$baseUrl = "http://${hostAddress}:${port}"
$probeUrl = "${baseUrl}/backoffice"

function Test-TheBrandHouseServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $probeUrl -TimeoutSec 1
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  }
  catch {
    return $false
  }
}

function Resolve-PythonCommand {
  $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
  if ($pyLauncher) {
    return @{
      FilePath = $pyLauncher.Source
      Arguments = @("-3", "server.py")
    }
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    return @{
      FilePath = $python.Source
      Arguments = @("server.py")
    }
  }

  throw "Python 3 was not found. Install Python and reopen the workspace."
}

if (Test-TheBrandHouseServer) {
  Write-Output "TheBrandHouse local server is already running on ${baseUrl}"
  exit 0
}

$pythonCommand = Resolve-PythonCommand

$env:HOST = $hostAddress
$env:PORT = $port

Write-Output "Starting TheBrandHouse local server on ${baseUrl}"

$process = Start-Process `
  -FilePath $pythonCommand.FilePath `
  -ArgumentList $pythonCommand.Arguments `
  -WorkingDirectory $workspaceRoot `
  -WindowStyle Hidden `
  -PassThru

for ($attempt = 0; $attempt -lt 25; $attempt++) {
  Start-Sleep -Milliseconds 350

  if ($process.HasExited) {
    break
  }

  if (Test-TheBrandHouseServer) {
    Write-Output "TheBrandHouse local server is running on ${baseUrl}"
    Write-Output "Backoffice login: ${baseUrl}/backoffice"
    exit 0
  }
}

if ($process -and -not $process.HasExited) {
  Stop-Process -Id $process.Id -Force
}

throw "TheBrandHouse server did not become ready on ${baseUrl}."
