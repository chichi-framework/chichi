# set env vars usually set by MyGet (enable for local testing)
$env:SourcesPath = '.'
#$env:NuGet = "./nuget.exe" # https://dist.nuget.org/win-x86-commandline/latest/nuget.exe

$nuget = $env:NuGet

Copy-Item $env:SourcesPath\LICENSE $env:SourcesPath\LICENSE.txt # has to be .txt extension, don't check in

# create packages
& $nuget pack "$env:SourcesPath\nuget\chichi.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath
& $nuget pack "$env:SourcesPath\nuget\chichi.stylus.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath
