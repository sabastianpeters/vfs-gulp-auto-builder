

const gDrive = require('./GoogleDrive.js');


class GoogleDriveTools {
    
    static async createFileStructure (projectName){

        const parentFolder = await gDrive.createFolder({ name: projectName });
        const pId = parentFolder.data.id;

        console.log(`successfully created project "${projectName}"`);
        console.log(`\t- build id: ${pId}`);

        // creates folders for builds
        gDrive.createFolder({
            name: "Windows",
            parentFolderId: pId
        }).then(res => GoogleDriveTools.addBuild(res, projectName));
        
        gDrive.createFolder({
            name: "Mac",
            parentFolderId: pId
        }).then(res => GoogleDriveTools.addBuild(res, projectName));  

        gDrive.createFolder({
            name: "Linux",
            parentFolderId: pId
        }).then(res => GoogleDriveTools.addBuild(res, projectName));  

    }

    static async addBuild (res, projectName){
        await gDrive.createFile({
            name: `${projectName}.7z`,
            mimeType: "application/zip",
            body: "",
            parentFolderId: res.data.id
        })
    }



    static async uploadFile (parentFolderId = "12ilQ0IJZUOJriq4vmp7lmju296UT2g6E"){

        let uploadFileData = {
            localPath: path.join(__dirname, "PhotonLearning.zip"),
            mimeType: "application/zip",
            parentFolderId: parentFolderId
        }

        let file = await gDrive.uploadFile(uploadFileData)

        console.log(`sucessfully uploaded file:\n`);
        console.log(file);
    }

    static async createFile (){
        
        let fileData = {
            name: "my crazy new file",
            mimeType: "text/plain",
            body: "woah look at this crazy cool content",
        }

        let file = await gDrive.createFile(fileData);

        console.log(`sucessfully created file:\n`);
        console.log(file);
    }


    static async moveFile (){

        let moveFileData = {
            fileId: "1lGIxKWJi92bDEFSS0ehzyTC-Bn6y4o1n",
            folderId: "12ilQ0IJZUOJriq4vmp7lmju296UT2g6E"
        }

        let res = await gDrive.moveFileOrFolder(moveFileData);

        console.log(`successfully moved file or folder:\n`);
        console.log(res);
    }


    static async listAccesibleContent (parentFolderId){
        
        console.log(`here's the content we found:\n`);

        // gets and lists and files
        let data = await gDrive.getFileList(parentFolderId);
        data.forEach(file => console.log(`\t[file]: ${file.name} (${file.id})`))

        // gets and lists all the folders
        data = await gDrive.getFolderList(parentFolderId)
        data.forEach(folder => console.log(`\t[folder]: ${folder.name} (${folder.id})`))
    }
}

module.exports = GoogleDriveTools;