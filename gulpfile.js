

const gulp = require("gulp")
const gulpExec = require("gulp-exec")
const exec = require('child_process').exec

let UnityPath = "";
let ProjectFolderName = "project-src";

function runCmd (done, cmd)
{
    exec(cmd, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
}


gulp.task("pull", done => {
    runCmd(done, `mkdir ${ProjectFolderName}`)
});


gulp.task("default", gulp.series("pull"));