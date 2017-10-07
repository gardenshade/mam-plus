# MAM+

The MAM+ userscript, converted to CoffeeScript and published in a more official manner.

## Installation

As long as you have a userscript browser extension installed, you can simply __[click here](https://github.com/gardenshade/mam-plus/raw/master/build/release/MAM_Plus.user.js)__ to install the script. Popular browser extensions include:
- [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/): Firefox
- [Violentmonkey](https://violentmonkey.github.io/get-it/): Chrome & Opera
- [Tampermonkey](https://tampermonkey.net/): most other browsers

MAM+ only officially supports the most recent versions of Chrome & Firefox, but other modern browsers with userscript support should theoretically work.

## Modification & Contribution

In case you want to modify the script and/or contribute to it, follow the below instructions. You will need to be using Greasemonkey or Violentmonkey.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- Gulp: `npm install -g gulp-cli`

### Instructions

- Make sure the prerequisites are installed on your system
- Clone this project to your computer
- Open a terminal window in your project folder, and run `npm install`

#### For Greasemonkey:

- Create a new file called `user-settings.json` in the project folder
- Find the path to your Greasemonkey scripts folder, and use it to create a new object in `user-settings.json`, like this:
```json
{ "userDir": "C:/Users/YOUR-USERNAME/AppData/Roaming/Mozilla/Firefox/Profiles/YOUR-CODE.default/gm_scripts" }
```
- Open Firefox and create a new userscript
    - Set the name exactly to `MAM Plus Dev`
    - Set the includes to `https://myanonamouse.net/*` & `https://www.myanonamouse.net/*`
- Make sure your terminal window is open to this project folder, and run `gulp`
- As long as `gulp` is running, any changes you save will be compiled automatically. Simply refresh the browser to see your changes
- When the script is ready to be released, run `gulp release`

#### For Violentmonkey:

- In Chrome, ensure that the Violentmonkey extension has access to file URLs
- Make sure your terminal window is open to this project folder, and run `gulp`
- Drag and drop the resulting file from `build/MAM_Plus_Dev` to your browser
- On the installation page, open `Options` and select `Track local file`
- Click `Confirm Installation` and **do not close the installation page**
- As long as `gulp` is running and the installation page is open, any changes you save will be compiled automatically. Simply refresh the browser to see your changes
- When the script is ready to be released, run `gulp release`
