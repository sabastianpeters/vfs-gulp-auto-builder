
const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

let UnityVersion = "2019.3.12f1";
let GameName = "Project Afloat"

let ProjectSourcePath = "project-src";
let ProjectDestPath = `project-dest`;
let WindowsExePath = `${ProjectDestPath}\\Windows\\${GameName}.exe`;
let MacExePath = `${ProjectDestPath}\\Mac\\${GameName}.exe`;
let LinuxExePath = `${ProjectDestPath}\\Linux\\${GameName}.exe`;

let GitUrl = "https://github.com/vfs-sct/Afloat";
let TargetBranch = "develop";
let UnityPath = `C:\\Program Files\\Unity Editors\\${UnityVersion}\\Editor\\Unity.exe`;



function runCmdNoError (done, cmd)
{
    exec(cmd, function(err, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        done();
    })
}

function runCmd (done, cmd)
{
    exec(cmd, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
}



gulp.task("clear-src", done => {
    runCmdNoError(done, `rd /s /q "%cd%\\${ProjectSourcePath}"`)
});
gulp.task("clear-dest", done => {
    runCmdNoError(done, `rd /s /q "%cd%\\${ProjectDestPath}"`)
});

gulp.task("clear", gulp.parallel(["clear-src", "clear-dest"]));

gulp.task("pull", done => {
    runCmd(done, `git clone -b ${TargetBranch} ${GitUrl} "${ProjectSourcePath}"`)
});



// NOTE: all teams may not want the 3 builds

/// https://docs.unity3d.com/Manual/CommandLineArguments.html
gulp.task("unity-build", done => {
    runCmd(done, 
        `"${UnityPath}" -quit -batchmode -logFile stdout.log `+
        `-projectPath "%cd%\\${ProjectSourcePath}" `+
        `-buildWindows64Player "%cd%\\${WindowsExePath}" `+
        `-buildOSXUniversalPlayer "%cd%\\${MacExePath}" `+
        `-buildLinux64Player "%cd%\\${LinuxExePath}"`
    )
});

gulp.task("rebuild", gulp.series("clear-dest", "unity-build"));

// gulp.task("default", gulp.series("clear", "pull", "unity-build"));
gulp.task("default", gulp.series("rebuild"));