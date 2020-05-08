
/*
    Copyright (C) Sabastian Peters 2020

    A wrapper script that can upload, update, and download files
    from google drive
*/



// TODO: add ability to use the google picker
// this is for when we move to a visual interface
// https://developers.google.com/picker/docs
// https://developers.google.com/drive/api/v3/picker


const fs = require('fs');
const path = require('path');
const readline = require('readline');


// loads the google apis
const { google } = require('googleapis');
const drive = google.drive({
    version: 'v3'
});




class GoogleDrive {
    
    constructor (){
    }


    // A direct wrapper for google's create method
    createContent (params){ return new Promise (async (resolve, reject) => {
        
        // Creates file with params
        drive.files.create(params)
            .then(data => resolve(data))
            .catch((err) => reject(err));
    
    })}
    createFile ({ name, mimeType, body, parentFolderId = 'root' }){
        return this.createContent({
            requestBody: {
                name: name,
                mimeType: mimeType,
                parents: [parentFolderId]
            },
            media: {
                mimeType: mimeType,
                body: body
            }
        });
    }
    createFolder ({ name, parentFolderId = 'root' }){

        // ref: https://developers.google.com/drive/api/v3/folder

        return this.createContent({
            resource: {
                name: name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId]
            }
        });
    }

    async uploadFile ({ localPath, mimeType, parentFolderId = 'root' }){

        const fileSize = fs.statSync(localPath).size;
        const res = await drive.files.create(
            {
                requestBody: {
                    // a requestBody element is required if you want to use multipart
                    name: path.basename(localPath, path.extname(localPath)), /// gets file name w/o extension
                    mimeType: mimeType,
                    parents: [parentFolderId]
                },
                media: {
                    body: fs.createReadStream(localPath),
                },
            },
            {
                // Use the `onUploadProgress` event from Axios to track the
                // number of bytes uploaded to this point.
                onUploadProgress: evt => {
                    const progress = (evt.bytesRead / fileSize) * 100;
                    readline.clearLine();
                    readline.cursorTo(0);
                    process.stdout.write(`${Math.round(progress)}% complete`);
                },
            }
        );
        console.log(res.data);
        return res.data;
    }

    async updateFile (){
    
        // more detail in the answer here: https://stackoverflow.com/questions/55335703/nodejs-google-drive-api-how-to-update-file
        
        let fileId = "1lGIxKWJi92bDEFSS0ehzyTC-Bn6y4o1n";
    
        const res = await drive.files.update({
            fileId: fileId,
            media: {
                mimeType: 'text/plain',
                body: 'Some crazy new text'
            },
        });
        
        console.log(`updated file with id ${res.data.id}`);
    
    }


    moveFileOrFolder ({ fileId, folderId }){ return new Promise (async (resolve, reject) => {
        
        // Retrieve the existing parents to remove
        const res = await drive.files.get({
            fileId: fileId,
            fields: 'parents'
        });

        // Actually moves file
        const request = drive.files.update({
            fileId: fileId,
            addParents: folderId,                       /// adds the new folder as parent
            removeParents: res.data.parents.join(','),  /// removes the old parents (res.data is the file)
            fields: 'id, parents'
        })

        // Promise Calls
        request
            .then(data => resolve(data))
            .catch((err) => reject(err));

    })}



    getContentList (query = ""){ return new Promise ((resolve, reject) => {

        
        // full guide here: https://developers.google.com/drive/api/v3/search-files
        // TODO: this only lists the first page (this is okay since i never need more than 3 and max is 100)

        const request = drive.files.list({
            q: query, 
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive'
        });

        request
            .then(res => resolve(res.data.files))
            .catch(err => reject(err));

    })}
    getFileList (parentFolderId){

        let query = "mimeType != 'application/vnd.google-apps.folder'" /// we want to search for non-folder items
        if(parentFolderId != undefined)
            query += ` and '${parentFolderId}' in parents`;

        return this.getContentList(query); 
    }
    getFolderList (parentFolderId){

        let query = "mimeType = 'application/vnd.google-apps.folder'" /// we want to search for folders
        if(parentFolderId != undefined)
            query += ` and '${parentFolderId}' in parents`;

        return this.getContentList(query);
    }


    // downloads a file with the given id from google drive
    async downloadFile (fileId){

        return drive.files
            .get({ fileId, alt: 'media' }, { responseType: 'stream' })
            .then(res => {
                return new Promise((resolve, reject) => {

                    let filePath = path.join(__dirname, "my-downloaded-file.txt");
                    console.log(`writing to ${filePath}`);
                    const dest = fs.createWriteStream(filePath);


                    let progress = 0;

                    res.data
                        // when done downloading
                        .on('end', () => {
                            console.log('Done downloading file.');
                            resolve(filePath);
                        })
                        // when download fails
                        .on('error', err => {
                            console.error('Error downloading file.');
                            reject(err);
                        })
                        // progress bar update
                        .on('data', d => {
                            progress += d.length;
                            if (process.stdout.isTTY) {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Downloaded ${progress} bytes`);
                            }
                        })
                        // sends data to file
                        .pipe(dest);
                });
            });

    }
    
}

module.exports = new GoogleDrive();