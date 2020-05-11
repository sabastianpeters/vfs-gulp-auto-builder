
const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

const UNITY_VERSION = "2019.3.12f1";
const GAME_NAME = "Project Afloat"

const PROJECT_SOURCE_PATH = "project-src";
const PROJECT_DEST_PATH = `project-dest`;




const WINDOWS_EXE_PATH = `${PROJECT_DEST_PATH}\\Windows\\${GAME_NAME}.exe`;
const OSX_EXE_PATH = `${PROJECT_DEST_PATH}\\Mac\\${GAME_NAME}.exe`;
const LINUX_EXE_PATH = `${PROJECT_DEST_PATH}\\Linux\\${GAME_NAME}.exe`;

const WINDOWS_BUILD_ZIP_PATH = `${PROJECT_DEST_PATH}\\Compressed\\Windows\\${GAME_NAME}.zip`;
const OSX_BUILD_ZIP_PATH = `${PROJECT_DEST_PATH}\\Compressed\\Mac\\${GAME_NAME}.zip`;
const LINUX_BUILD_ZIP_PATH = `${PROJECT_DEST_PATH}\\Compressed\\Linux\\${GAME_NAME}.zip`;

const GitUrl = "https://github.com/vfs-sct/Afloat";
const TargetBranch = "develop";
const UnityPath = `C:\\Program Files\\Unity Editors\\${UNITY_VERSION}\\Editor\\Unity.exe`;



// ## UTIL ##

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



// ## CLEAR TASKS ##

gulp.task("clear-src", done => {
    runCmdNoError(done, `rd /s /q "%cd%\\${PROJECT_SOURCE_PATH}"`)
});
gulp.task("clear-dest", done => {
    runCmdNoError(done, `rd /s /q "%cd%\\${PROJECT_DEST_PATH}"`)
});

gulp.task("clear", gulp.parallel(["clear-src", "clear-dest"]));



// ## SOURCE CONTROL TASKS ##

gulp.task("pull", done => {
    runCmd(done, `git clone -b ${TargetBranch} ${GitUrl} "${PROJECT_SOURCE_PATH}"`)
});






// ## BUILD TASKS ##


// NOTE: all teams may not want the 3 builds
/// https://docs.unity3d.com/Manual/CommandLineArguments.html
gulp.task("build-unity", done => {
    runCmd(done, 
        `"${UnityPath}" -quit -batchmode -logFile stdout.log `+
        `-projectPath "%cd%\\${PROJECT_SOURCE_PATH}" `+
        `-buildWindows64Player "%cd%\\${WINDOWS_EXE_PATH}" `+
        `-buildOSXUniversalPlayer "%cd%\\${OSX_EXE_PATH}" `+
        `-buildLinux64Player "%cd%\\${LINUX_EXE_PATH}"`
    )
});

gulp.task("build-unreal", done => {
    // TODO: ask Rohit
});

gulp.task("rebuild-unity", gulp.series("clear-dest", "build-unity"));
gulp.task("rebuild-unreal", gulp.series("clear-dest", "build-unreal"));





// ## COMPRESS TASKS ##

const bin7z = require("7zip-bin").path7za;
const node7z = require("node-7z")
const path = require("path")

gulp.task("compress-builds", (done) => {

    const myStream = node7z.add(WINDOWS_BUILD_ZIP_PATH, path.join(__dirname, path.dirname(WINDOWS_EXE_PATH), "\\*"), {
        recursive: false, /// this adds things from subfolders
        $progress: true, /// sends progress events
        $bin: bin7z, /// reference to 7z
    })
    

    myStream.on('progress', function (progress) {
        console.log(`zip progress: ${progress.percent}`); /// { percent: 67, fileCount: 5, file: undefinded }
    })


    myStream.on('end', function () {    
        console.log(`zip complete`);
        done();
    })

});






// ## UPLOAD TASKS ##

const gAuth = require('./lib/GoogleAuth.js');
const gDrive = require('./lib/GoogleDrive.js')
const gDriveTools = require('./lib/GoogleDriveTools.js')


gulp.task("upload", async (done) => {
    
    // Authorize client (must be done from pre)
    let credentials = await gAuth.loadCredentials();
    await gAuth.authorize(credentials.installed);

    // await gDriveTools.createFileStructure(GAME_NAME) /// use this to create the file structure
    
    const GOOGLE_FILE_ID_LIST = {
        WINDOWS: "a",
        OSX: "a",
        LINUX: "a"
    }



    done();
})






// ## DEFAULT TASK (THATS AUTO-RUN)

// gulp.task("default", gulp.series("clear", "pull", "build-unity"));
// gulp.task("default", gulp.series("rebuild"));
gulp.task("default", gulp.series("compress-builds"));




// cli: gulp "full-unity-build"
// cli: gulp "full-unreal-build"
// gulp.task("full-unreal-build", gulp.series("clear", "pull", "build-unreal"));
