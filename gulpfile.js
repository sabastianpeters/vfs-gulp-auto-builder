

const gulp = require("gulp")
const exec = require("gulp-exec")

let UnityPath = "";

gulp.task("pull", done => {
    console.log(`HEy!`);
    done();
});


gulp.task("default", gulp.series("pull"));