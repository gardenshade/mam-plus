# MAM+

The MAM+ userscript, now using Typescript and Gulp 4.

## Installation

As long as you have a userscript browser extension installed, you can simply __[CLICK HERE](https://github.com/gardenshade/mam-plus/raw/master/release/mam-plus.user.js)__ to install the script. Popular browser extensions include:
- [Tampermonkey](https://tampermonkey.net/): Recommended for Firefox v57+
- [Violentmonkey](https://violentmonkey.github.io/get-it/): Recommended for Chrome

MAM+ only officially supports the most recent versions of Chrome & Firefox, but other modern browsers with userscript support should theoretically work.

## Modification & Contribution

In case you want to modify the script and/or contribute to it, follow the below instructions. These instructions are for Chrome using Violentmonkey, as it's the easiest way to test scripts.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- Google Chrome with [Violentmonkey](https://violentmonkey.github.io/get-it/)
- tslint (not currently included because vscode has baked-in linting)

### Instructions

#### First-time setup
- Make sure the prerequisites are installed on your system
- Clone this project to your computer
- Open a terminal window in your project folder, and run `npm install`
- On the Chrome extensions page (found at chrome://extensions), ensure that the Violentmonkey extension has access to file URLs

#### Workflow
This is a Typescript project, but vanilla JavaScript is valid Typescript, so don't let a lack of knowledge of TS keep you from contributing.

To start developing, simply run `npm run build`. Assuming everything works, this will transpile the Typescript files into a single JavaScript file (in the `build/` dir) with a userscript header and inline sourcemaps. Additionally, the userscript will have `_dev` appended to its name, to differentiate between the developmental version and the release version.

For continuous development, run `npm run watch`. This task may halt when Typescript encounters an error, but will otherwise retranspile the script every time you save.

Drag the `_dev.user.js` file into Chrome and install with Violentmonkey. When you are using the Watch task, as long as you keep the userscript installation tab open any changes you save will be automatically loaded in your browser when you reload.

When you are ready to release your script, use [`npm version <newversion>`](https://docs.npmjs.com/cli/version) to increment your script, then `npm run release`. This will output a minified JavaScript file without the `_dev` suffix.
