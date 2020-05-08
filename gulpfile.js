
const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

let UnityPath = "";
let ProjectFolderName = "project-src";
let GitUrl = "https://github.com/vfs-sct/Afloat";
let TargetBranch = "develop";

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


gulp.task("clear", done => {
    runCmdNoError(done, `rd /s /q "%cd%\\${ProjectFolderName}"`)
})

gulp.task("pull", done => {
    runCmd(done, `git clone -b ${TargetBranch} ${GitUrl} "${ProjectFolderName}"`)
});

gulp.task("unity-build", done => {
});


gulp.task("default", gulp.series("clear", "pull", "unity-build"));