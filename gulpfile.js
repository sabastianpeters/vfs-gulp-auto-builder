
// ! NOTE: CLEARING THE SOURCE FOR UNITY WILL REQUIRE TMPRO AND PHOTON TO BE RE-IMPORTED.
// ! THE CLI CANNOT DO THIS, AND THEREFOR THE BUILD WILL BREAK

const gulp = require("gulp");
const gulpExec = require("gulp-exec");
const exec = require('child_process').exec;

const UNITY_VERSION = "2019.3.12f1";
const GAME_NAME = "Project Afloat"

const PROJECT_SOURCE_PATH = "project-src";
const PROJECT_DEST_PATH = `project-dest`;

const NATURAL_DOC_EXE = ".\\bin\\NaturalDocs\\NaturalDocs.exe"
const PROJECT_DOCS_DEST_PATH = `project-docs`;
const PROJECT_DOCS_CONFIG_PATH = `natural-docs-config`;


const BuildData = require("./lib/BuildData.js");
BuildData.PROJECT_DEST_PATH = PROJECT_DEST_PATH;
BuildData.GAME_NAME = GAME_NAME;

let buildPlatformData = {
    windows: new BuildData({ name: "Windows" }),
    // osx: new BuildData({ name: "OSX" }),
    // linux: new BuildData({ name: "Linux" }),
}

const GIT_CONFIG = require("./config.git.js");
const DocumentationGitUrl = `https://${GIT_CONFIG.username}:${GIT_CONFIG.password}@github.com/vfs-sct/Afloat-Code-Documentation.git`;
const GitUrl = `https://${GIT_CONFIG.username}:${GIT_CONFIG.password}@github.com/vfs-sct/Afloat.git`;
const TargetBranch = "develop";
// const UnityPath = `C:\\Program Files\\Unity Editors\\${UNITY_VERSION}\\Editor\\Unity.exe`; /// home
const UnityPath = `C:\\Program Files\\Unity\\Hub\\Editor\\${UNITY_VERSION}\\Editor\\Unity.exe`; /// vfs



// ## UTIL ##

function runCmdNoErrorPromise (cmd){ return new Promise ((resolve, reject) => {
    runCmdNoError(resolve, cmd);
})}
function runCmdNoError (done, cmd){
    exec(cmd, function(err, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        done();
    })
}

function runCmdPromise (cmd){ return new Promise ((resolve, reject) => {
    runCmdNoError((err) => {
        if(err == undefined) resolve();
        else reject(err);
    }, cmd);
})}
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

gulp.task("clone", done => {
    runCmd(done, `git clone -b ${TargetBranch} ${GitUrl} "${PROJECT_SOURCE_PATH}"`)
});

gulp.task("pull", done => {
    // runCmd(done, `cd ${PROJECT_SOURCE_PATH} && git pull origin ${TargetBranch}`)
    // thanks: https://stackoverflow.com/questions/1125968/how-do-i-force-git-pull-to-overwrite-local-files
    runCmd(done, 
        `cd ${PROJECT_SOURCE_PATH} && `+
        `git reset --hard origin/${TargetBranch} && `+ ///  clears any baked files. The --hard option changes all the files in your working tree to match the files in origin/master
        `git fetch --all && `+ /// downloads the latest from remote without trying to merge or rebase anything
        `git reset --hard origin/${TargetBranch}` ///  resets the master branch to what you just fetched. The --hard option changes all the files in your working tree to match the files in origin/master
    )
});






// ## BUILD TASKS ##


// NOTE: all teams may not want the 3 builds
/// https://docs.unity3d.com/Manual/CommandLineArguments.html
gulp.task("build-unity", async (done) => {


    buildPlatformData.windows.unityBuildParam = "-executeMethod Afloat.Util.BuildCLI.Development.Windows";
    // buildPlatformData.osx.unityBuildParam = "-executeMethod Afloat.Util.BuildCLI.Development.OSX";
    // buildPlatformData.linux.unityBuildParam = "-executeMethod Afloat.Util.BuildCLI.Development.Linux";
    

    // builds it for each platform
    for(let key in buildPlatformData){
        let platformData = buildPlatformData[key];
        
        console.log(`starting build for ${platformData.targetPlatform.name}`);

        // waits for each build to finish
        await new Promise((res, rej) => {

            let done = (err) => {
                if(err) rej(err);
                else res();
                console.log(`finished build for ${platformData.targetPlatform.name}`);
            }

            runCmd(done, 
                `"${UnityPath}" -quit -batchmode -logFile stdout.log `+
                `-profiler-enable `+ /// required for sound designers swap sound banks
                `-projectPath "%cd%\\${PROJECT_SOURCE_PATH}" `+
                `${platformData.unityBuildParam} "%cd%\\${platformData.exeFolderPath}"`
            )
        });
    }
});

gulp.task("build-unreal", done => {
    // TODO: add rohit implementation
});

gulp.task("rebuild-unity", gulp.series("clear-dest", "build-unity"));
gulp.task("rebuild-unreal", gulp.series("clear-dest", "build-unreal"));






// ## BUILD DOCUMENTATION TASKS ##

gulp.task("docs-init", async done => {
    await runCmdPromise(`${NATURAL_DOC_EXE} "${path.join(__dirname, PROJECT_DOCS_CONFIG_PATH)}"`)
    await runCmdNoErrorPromise(`mkdir ${PROJECT_DOCS_DEST_PATH}`);
    await runCmdPromise(`cd ${PROJECT_DOCS_DEST_PATH} && `+
        `echo # ${GAME_NAME} Code Documentation >> readme.md && `+
        `git init && `+
        `git add readme.md && `+
        `git commit -m "initial commit" && `+
        `git remote add origin ${DocumentationGitUrl} && `+
        `git push -u origin master` /// pushes docs, and links remote branch with local
    );
    done();
})

gulp.task("docs-build", async done => {
    await runCmdPromise(`"${NATURAL_DOC_EXE}" `+
        `-i "%cd%\\${PROJECT_SOURCE_PATH}\\Assets" `+ /// source path
        `-xi "%cd%\\${PROJECT_SOURCE_PATH}\\Assets\\Wwise" `+ /// ignore these
        `-xi "%cd%\\${PROJECT_SOURCE_PATH}\\Assets\\Photon" `+ /// ignore these
        `-p "%cd%\\${PROJECT_DOCS_CONFIG_PATH}\\Project.txt" `+ /// config path
        `-o HTML "%cd%\\${PROJECT_DOCS_DEST_PATH}"` /// dest path
    )
    done();
})

gulp.task("docs-upload", async done => {
    runCmdPromise(`cd ${PROJECT_DOCS_DEST_PATH} && `+
        `git add . && `+    
        `git commit -m "auto-generated: documentation" && `+    
        `git push -u origin master`    
    )
});

gulp.task("full-docs-build", gulp.series("docs-build", "docs-upload"))





// ## COMPRESS TASKS ##

const bin7z = require("7zip-bin").path7za;
const node7z = require("node-7z")
const path = require("path")

gulp.task("compress-builds", (done) => {

    
    let currentBuildCount = 0;
    let totalBuildCount = 0;
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
            ++currentBuildCount;
            if(totalBuildCount == currentBuildCount) done();
        })

        totalBuildCount++;
    }

});






// ## UPLOAD TASKS ##

const gAuth = require('./lib/GoogleAuth.js');
const gDrive = require('./lib/GoogleDrive.js')
const gDriveTools = require('./lib/GoogleDriveTools.js')


gulp.task("upload-compressed-builds", async (done) => {
    
    // Authorize client (must be done from pre)
    let credentials = await gAuth.loadCredentials();
    await gAuth.authorize(credentials.installed);

    // await gDriveTools.createFileStructure(GAME_NAME) /// use this to create the file structure
    
    // defines google file id on the fly
    buildPlatformData.windows.googleFileId = "1PPjKp-1yw6eTM6bnnRcPBKkOWQ2hB0ap";
    // buildPlatformData.osx.googleFileId = "1GuoZSz6WAitbp_N1k78jkhyIkLwwDYW3";
    // buildPlatformData.linux.googleFileId = "1NTMBFaYvHf62ZQVMUOCctpunmJOEbAll";

    
    // loops through each build and uploads it to target file
    let uploadPromiseList = []
    for(let key in buildPlatformData){
        let platformData = buildPlatformData[key];

        uploadPromiseList.push(gDrive.uploadFile({
            targetFileId: platformData.googleFileId,
            localPath: path.join(__dirname, platformData.zipPath),
            mimeType: "application/zip"
        }));
    }

    // waits for everything to upload to be called done
    Promise.all(uploadPromiseList).then(() => {
        done();
    })
})


gulp.task("upload", gulp.series("compress-builds", "upload-compressed-builds"));




// ## FULL BUILD PROCESSES ##


// local cli: .\node_modules\.bin\gulp full-unity-build

// cli: gulp "full-unity-build"
// cli: gulp "full-unreal-build"

// gulp.task("full-unreal-build", gulp.series("clear", "pull", "build-unreal"));

gulp.task(
    "full-unity-build", 
    gulp.series(
        "clear-dest",  
        "pull", 
        "build-unity",
        "upload",
        "full-docs-build"
    )
);


// gulp
//     clear-dest  
//     pull
//     build-unreal
//     upload-datastore

// ## DEFAULT TASK (THATS AUTO-RUN)

// gulp.task("default", gulp.series("clear", "pull", "build-unity"));
// gulp.task("default", gulp.series("rebuild"));
// gulp.task("default", gulp.series("upload"));
