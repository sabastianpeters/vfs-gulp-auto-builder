
const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

const UNITY_VERSION = "2019.3.12f1";
const GAME_NAME = "Project Afloat"

const PROJECT_SOURCE_PATH = "project-src";
const PROJECT_DEST_PATH = `project-dest`;


const BuildData = require("./lib/BuildData.js");
BuildData.PROJECT_DEST_PATH = PROJECT_DEST_PATH;
BuildData.GAME_NAME = GAME_NAME;

let buildPlatformData = {
    windows: new BuildData({ name: "Windows" }),
    osx: new BuildData({ name: "OSX" }),
    linux: new BuildData({ name: "Linux" }),
}

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
    // TODO: convert to for loop
    runCmd(done, 
        `"${UnityPath}" -quit -batchmode -logFile stdout.log `+
        `-projectPath "%cd%\\${PROJECT_SOURCE_PATH}" `+
        `-buildWindows64Player "%cd%\\${buildPlatformData.windows.exePath}" `+
        `-buildOSXUniversalPlayer "%cd%\\${buildPlatformData.osx.exePath}" `+
        `-buildLinux64Player "%cd%\\${buildPlatformData.linux.exePath}"`
    )
});

gulp.task("build-unreal", done => {
    // TODO: add rohit implementation
});

gulp.task("rebuild-unity", gulp.series("clear-dest", "build-unity"));
gulp.task("rebuild-unreal", gulp.series("clear-dest", "build-unreal"));





// ## COMPRESS TASKS ##

const bin7z = require("7zip-bin").path7za;
const node7z = require("node-7z")
const path = require("path")

gulp.task("compress-builds", (done) => {


    for(let key in buildPlatformData){
        let platformData = buildPlatformData[key];
        
        // creates the zip folder stream
        const myStream = node7z.add(

            platformData.zipPath,  /// zip dest
            path.join(__dirname, path.dirname(platformData.exePath), "\\*"),  /// exe folder source
            
            // options
            {
                recursive: false, /// this seems to have unintuitive behaviour, but false gets desired result
                $progress: true, /// sends progress events
                $bin: bin7z, /// reference to 7z
            }
        )
        

        // progress updates
        myStream.on('progress', function (progress) {
            console.log(`zip progress: ${progress.percent}`); /// { percent: 67, fileCount: 5, file: undefinded }
        })

        // when finished
        myStream.on('end', function () {    
            console.log(`zip complete`);
            done();
        })
    }

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
    
    // defines google file id on the fly
    buildPlatformData.windows.googleFileId = "1PPjKp-1yw6eTM6bnnRcPBKkOWQ2hB0ap";
    buildPlatformData.osx.googleFileId = "1GuoZSz6WAitbp_N1k78jkhyIkLwwDYW3";
    buildPlatformData.linux.googleFileId = "1NTMBFaYvHf62ZQVMUOCctpunmJOEbAll";

    
    for(let key in buildPlatformData){
        let platformData = buildPlatformData[key];

        gDrive.uploadFile({
            targetFileId: platformData.googleFileId,
            localPath: path.join(__dirname, platformData.zipPath),
            mimeType: "application/zip"
        });
    }

    done();
})






// ## DEFAULT TASK (THATS AUTO-RUN)

// gulp.task("default", gulp.series("clear", "pull", "build-unity"));
// gulp.task("default", gulp.series("rebuild"));
gulp.task("default", gulp.series("upload"));




// cli: gulp "full-unity-build"
// cli: gulp "full-unreal-build"
// gulp.task("full-unreal-build", gulp.series("clear", "pull", "build-unreal"));
