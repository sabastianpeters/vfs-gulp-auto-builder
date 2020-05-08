
const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

let UnityVersion = "2019.3.12f1";
let GameName = "Project Afloat"

let ProjectSourcePath = "project-src";
let ProjectDestPath = `project-dest`;
let ProjectDestExePath = `${ProjectDestPath}\\${GameName}.exe`;

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

gulp.task("unity-build", done => {
    runCmd(done, `"${UnityPath}" -quit -batchmode -logFile stdout.log -projectPath "%cd%\\${ProjectSourcePath}" -buildWindowsPlayer "%cd%\\${ProjectDestExePath}"`)
});

gulp.task("rebuild", gulp.series("clear-dest", "unity-build"));

// gulp.task("default", gulp.series("clear", "pull", "unity-build"));
gulp.task("default", gulp.series("rebuild"));