# MAM+

The MAM+ userscript, converted to CoffeeScript and published in a more official manner.



## Installation

Simply install with Greasemonkey (Firefox) or Tampermonkey (all other browsers).

## Modification & Contribution

In case you want to modify the script and/or contribute to it, follow the below instructions. You'll need to be using Firefox for the ideal workflow.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)

### Instructions

- Make sure the prerequisites are installed on your system
- Clone this project to your computer
- Make sure your terminal window is open to this project folder, and run `npm install`
- Duplicate `edit_gulpfile.js` and rename it to `gulpfile.js`
- Open Firefox and create a new userscript
    - Set the name exactly to `MAM Plus`
    - Set the includes to `https://myanonamouse.net/*` & `https://www.myanonamouse.net/*`
- Open `gulpfile.js` and set the value of `YOUR_DIR` to the path of your Greasemonkey scripts directory
- If you didn't set the local Greasemonkey location, you'll probably get an unnecessary folder showing up in your project directory until I get around to fixing this
- Make sure your terminal window is open to this project folder, and run `gulp`
