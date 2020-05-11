@ECHO OFF
REM Copyright Bishwajit Mukherjee 2020

REM set the default directory
Set defaultDir="C:\Users\bishw\Documents\BuildScripts"
Set gitdir="C:\Users\bishw\Documents\test"
cd %gitdir%
git pull origin develop
cd %defaultDir%

REM change the dir to the Build Ouput Folder
Set dir="C:\Users\bishw\Documents\AutomatedBuild"

Echo Deleting all files from %dir%
del %dir%\* /F /Q

Echo Deleting all folders from %dir%
for /d %%p in (%dir%\*) Do rd /Q /S "%%p"
@echo Folder deleted.

REM Set the UTAdir to the Batch files location in the computer
Set UTAdir="C:\Program Files\Epic Games\UE_4.24\Engine\Build\BatchFiles"
REM Set the uproject dir
Set ProjDir="C:\Users\bishw\Documents\test\UnworthyRoses\UnworthyRoses.uproject"
REM change the zip dir to the installation of 7zip
Set ZipDir="C:\Program Files\7-Zip"
Set FolderToZip="C:\Users\bishw\Documents\AutomatedBuild\WindowsNoEditor"


call %UTAdir%\RunUAT.bat BuildCookRun -Project=%ProjDir% -NoP4 -NoCompileEditor -Distribution -TargetPlatform=Win64 -Platform=Win64 -ClientConfig=Development -ServerConfig=Development -Cook -Build -Stage -Pak -Archive -ArchiveDirectory=%dir% -Rocket -Prereqs -Package
cd %dir%
mkdir zippedfile
REM change the OutputZipDir to the zip Ouput Folder
Set OutputZipDir="C:\Users\bishw\Documents\AutomatedBuild\zippedfile"

cd %ZipDir%
7z a -tzip %OutputZipDir%/build.7z %FolderToZip%

cd %defaultDir%