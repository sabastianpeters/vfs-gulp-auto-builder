
/*
    Copyright (C) Sabastian Peters 2020
*/

class BuildData {

    static PROJECT_DEST_PATH = "project-dest";
    static GAME_NAME = "untitled-game";

    constructor (targetPlatform){
        this.targetPlatform = targetPlatform;
    }


    get exePath (){
        return `${this.exeFolderPath}\\${BuildData.GAME_NAME}.exe`;
    }
    get exeFolderPath (){
        return `${BuildData.PROJECT_DEST_PATH}\\${this.targetPlatform.name}`;
    }

    get zipPath (){
        return `${BuildData.PROJECT_DEST_PATH}\\Compressed\\${this.targetPlatform.name}\\${BuildData.GAME_NAME}.zip`;
    }

}

module.exports = BuildData


