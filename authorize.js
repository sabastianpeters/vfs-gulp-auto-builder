
const gAuth = require('./lib/GoogleAuth.js');
const gDrive = require('./lib/GoogleDrive.js');

async function main () {

    // Authorize client
    let credentials = await gAuth.loadCredentials();
    await gAuth.authorize(credentials.installed);

}

main().catch(console.error);