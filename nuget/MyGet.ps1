# set env vars usually set by MyGet (enable for local testing)
#$env:SourcesPath = '..'
#$env:NuGet = "./nuget.exe" # https://dist.nuget.org/win-x86-commandline/latest/nuget.exe

$nuget = $env:NuGet

Copy-Item $env:SourcesPath\LICENSE $env:SourcesPath\LICENSE.txt # has to be .txt extension, don't check in

# parse the version number out of package.json
$versionParts = ((Get-Content $env:SourcesPath\package.json) -join "`n" | ConvertFrom-Json).version.split('-', 2) # split the version on the '-'
$version = $versionParts[0]

if ($versionParts.Length -gt 1) {
  $version += '-' + $versionParts[1].replace('.', '').replace('-', '_') # strip out invalid chars from the PreRelease part
}

# create packages
& $nuget pack "$env:SourcesPath\nuget\chichi.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath -Version $version
& $nuget pack "$env:SourcesPath\nuget\chichi.stylus.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath -Version $version
