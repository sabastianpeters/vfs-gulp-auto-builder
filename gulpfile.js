
const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

let UnityVersion = "2019.3.12f1";

let ProjectSourceFolderName = "project-src";
let ProjectDestFolderName = "project-src";

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
    runCmdNoError(done, `rd /s /q "%cd%\\${ProjectSourceFolderName}"`)
});
gulp.task("clear-dest", done => {
    runCmdNoError(done, `rd /s /q "%cd%\\${ProjectDestFolderName}"`)
});

gulp.task("clear", gulp.parallel(["clear-src", "clear-dest"]));

gulp.task("pull", done => {
    runCmd(done, `git clone -b ${TargetBranch} ${GitUrl} "${ProjectSourceFolderName}"`)
});

gulp.task("unity-build", done => {
    // runCmd(done, "mkdir $")
    runCmd(done, `"${UnityPath}" -quit -batchmode -logFile stdout.log -projectPath "%cd%\\${ProjectSourceFolderName}" -buildWindowsPlayer "%cd$\\${ProjectDestFolderName}"`)
});


gulp.task("default", gulp.series("clear", "pull", "unity-build"));