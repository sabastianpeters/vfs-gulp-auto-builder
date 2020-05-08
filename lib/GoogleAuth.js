
/*
    Copyright (C) Sabastian Peters 2020

    A wrapper script that gets authorization from the user to
    access the specified parts of their google account
*/


// # Resources
// how google handles this: https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/sampleclient.js


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';
// ^ The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
// TODO: make it do this automatically




// loads read and write libs
const fs = require('fs');
const readline = require('readline');


// loads the google apis
const { google } = require('googleapis');


class GoogleAuth {
    
    constructor (){

    }


    // ## PUBLIC METHODS ##
    
    // TODO: change the flow of this to be more logical (ie. dont assume we use credentials from a file)
    // Authorizes the client with the given credentials
    authorize(credentials, callback) { return new Promise ((resolve, reject) => {
        
        // TODO: convert this to a promise (properly)

        const { client_secret, client_id, redirect_uris } = credentials;

        const oAuth2Client = new google.auth.OAuth2(
            client_id, 
            client_secret, 
            redirect_uris[0]
        );

        // Defines the default auth client (so we don't need to specify it each request)
        google.options({
            auth: oAuth2Client
        });

        // TODO: make loading a promise

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            
            // if we don't already have a token, get one and exit
            if (err) return this.getAccessToken(oAuth2Client, (data) => resolve(data));

            // if we do already have a token, use that
            oAuth2Client.setCredentials(JSON.parse(token));
            
            return resolve();
        });

    })};





    // ## PRIVATE UTIL METHDOS ##

    
    // Gets the token required for OAuth2 Access
    // It stores it in the file
    getAccessToken(oAuth2Client, callback) {

        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this url:', authUrl);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });


        rl.question('Enter the code from that page here: ', (code) => {

            rl.close();

            oAuth2Client.getToken(code, (err, token) => {

                if (err) return console.error('Error retrieving access token', err);

                oAuth2Client.setCredentials(token);

                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {

                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);

                });

                callback(oAuth2Client);
            });
        });
    }
    
    loadCredentials () { return new Promise ((resolve, reject) => {
        
        // TODO: create parameter for file name
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {

            // if there's an error, exit
            if (err) 
            {
                console.log('Error loading client secret file:', err);
                return reject();
            }

            // if all good, send parsed content
            resolve(JSON.parse(content));
            return resolve();
        });
        
    })};
}

module.exports = new GoogleAuth();