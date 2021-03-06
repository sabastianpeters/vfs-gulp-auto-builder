# Unity Build Tool <!-- omit in toc -->

> Build tool for building Unity games with NaturalDocs documentation. 
> The game must be hosted on a git repo (Github use case explained here). 
> Builds are automatically compressed and uploaded to Google Drive after being built.
> This tool will only run on windows, but can build for Windows, OSX and Linux. 

### Table of Contents

- [Project Setup](#project-setup)
  - [GitHub Auth Setup](#github-auth-setup)
  - [Google Auth Setup](#google-auth-setup)
  - [Natural Docs Setup](#natural-docs-setup)
  - [Task Scheduler Setup](#task-scheduler-setup)
  - [Example Output](#example-output)

## Project Setup

- `npm install -g gulp-cli`
- ensure you have the right version of your game engine install for builds 
- in project folder:
  - `npm install`
- `git lfs install`
  - this [needs to be run once per user account per computer](https://git-lfs.github.com/)

### GitHub Auth Setup
- goto your github profile's settings page
- goto developer settings
- goto Personal Access Token
- create a token with full `repo` and `gist` privelages
- create file `config.git.js` in project root
- add the following content:
  ```javascript
  module.exports = {
      username: "YOUR USERNAME HERE",
      password: "YOUR PERSONAL ACCESS TOKEN HERE"
  };
  ```


### Google Auth Setup

- Goto your [Google API Console Credentials Screen](https://console.developers.google.com/apis/credentials/)
- choose to make a OAuth credentials with: `Create Credentials > OAuth client ID`
- choose type `Other` (this is for installed applications, or this console test)
- download the Client with `Download JSON` and name it `credentials.json`
- place this file in the root of this project
- `npm run auth` to authorize yourself


### Natural Docs Setup
- download the [NaturalDocs zip](https://www.naturaldocs.org/download/)
- create a folder called `bin` in project root
- unzip the folder so that `NaturalDocs.exe` is at the path `.\bin\NaturalDocs\NaturalDocs.exe`
- from this point, the docs should be all setup
  - if not, init the docs with `.\node_modules\.bin\gulp docs-init`
- you can customize your project's setting in `.\natural-docs-config\Project.txt`
- link to [full official guide](https://www.naturaldocs.org/getting_started/getting_set_up/#starting_a_new_project)


### Task Scheduler Setup

- here's a link to [a more complete guide](https://www.digitalcitizen.life/how-create-task-basic-task-wizard)
  - and here's a link for [setting this up automatically](https://stackoverflow.com/questions/1020023/specifying-start-in-directory-in-schtasks-command-in-windows)

![0](./readme-assets/task-schedueller-0.png)
![1](./readme-assets/task-schedueller-1.png)
![2](./readme-assets/task-schedueller-2.png)
![3](./readme-assets/task-schedueller-3.png)
![4](./readme-assets/task-schedueller-4.png)
![5](./readme-assets/task-schedueller-5.png)
> ^ NOTE: this image is incorrect.
> 
> - `Program/script`: `"cmd.exe"`
> - `Add arguments (optional)`: `/c ".\node_modules\.bin\gulp full-unity-build"`
> - `Start In`: path of the folder with the gulp script
>   - ie. if `a/b/c/gulpfile.js` is the path to the gulpfile, put `a/b/c` in this field
> 
> This runs a new *Command Prompt* that will run our gulp build script
>
> If building with unreal, do a "full-unreal-build" instead of unity


![6](./readme-assets/task-schedueller-6.png)

### Example Output

![0](./readme-assets/example-output-0.png)
![1](./readme-assets/example-output-1.png)
![2](./readme-assets/example-output-2.png)