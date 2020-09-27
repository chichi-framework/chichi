# set env vars usually set by MyGet (enable for local testing)
$env:SourcesPath = '.'
$env:NuGet = "nuget.exe" # https://dist.nuget.org/win-x86-commandline/latest/nuget.exe

$nuget = $env:NuGet

Copy-Item $env:SourcesPath\LICENSE $env:SourcesPath\LICENSE.txt # has to be .txt extension, don't check in

# get version
$versionParts = ((Get-Content $env:SourcesPath\package.json) -join "`n").version.split('-', 2)
$version = $versionParts[0]

if ($versionParts.length -gt 1) {
  $version += '-' + $versionParts[1].replace('.', '').replace('-', '_')
}
# create packages
& $nuget pack "$env:SourcesPath\nuget\chichi.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath -Version $version
& $nuget pack "$env:SourcesPath\nuget\chichi.stylus.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath -Version $version
