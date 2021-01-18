// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.3.1
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://myanonamouse.net/*
// @include      https://www.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.3.1
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_getResourceText
// ==/UserScript==
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Types, Interfaces, etc.
 */
var SettingGroup;
(function (SettingGroup) {
    SettingGroup[SettingGroup["Global"] = 0] = "Global";
    SettingGroup[SettingGroup["Home"] = 1] = "Home";
    SettingGroup[SettingGroup["Search"] = 2] = "Search";
    SettingGroup[SettingGroup["Requests"] = 3] = "Requests";
    SettingGroup[SettingGroup["Torrent Page"] = 4] = "Torrent Page";
    SettingGroup[SettingGroup["Shoutbox"] = 5] = "Shoutbox";
    SettingGroup[SettingGroup["Vault"] = 6] = "Vault";
    SettingGroup[SettingGroup["Upload Page"] = 7] = "Upload Page";
    SettingGroup[SettingGroup["User Pages"] = 8] = "User Pages";
    SettingGroup[SettingGroup["Forum"] = 9] = "Forum";
    SettingGroup[SettingGroup["Other"] = 10] = "Other";
})(SettingGroup || (SettingGroup = {}));
/**
 * Class containing common utility methods
 *
 * If the method should have user-changeable settings, consider using `Core.ts` instead
 */
class Util {
    /**
     * Animation frame timer
     */
    static afTimer() {
        return new Promise((resolve) => {
            requestAnimationFrame(resolve);
        });
    }
    /**
     * Allows setting multiple attributes at once
     */
    static setAttr(el, attr) {
        return new Promise((resolve) => {
            for (const key in attr) {
                el.setAttribute(key, attr[key]);
            }
            resolve();
        });
    }
    /**
     * Returns the "length" of an Object
     */
    static objectLength(obj) {
        return Object.keys(obj).length;
    }
    /**
     * Forcefully empties any GM stored values
     */
    static purgeSettings() {
        for (const value of GM_listValues()) {
            GM_deleteValue(value);
        }
    }
    /**
     * Log a message about a counted result
     */
    static reportCount(did, num, thing) {
        const singular = 1;
        if (num !== singular) {
            thing += 's';
        }
        if (MP.DEBUG) {
            console.log(`> ${did} ${num} ${thing}`);
        }
    }
    /**
     * Initializes a feature
     */
    static startFeature(settings, elem, page) {
        return __awaiter(this, void 0, void 0, function* () {
            // Queue the settings in case they're needed
            MP.settingsGlob.push(settings);
            // Function to return true when the element is loaded
            function run() {
                return __awaiter(this, void 0, void 0, function* () {
                    const timer = new Promise((resolve) => setTimeout(resolve, 1500, false));
                    const checkElem = Check.elemLoad(elem);
                    return Promise.race([timer, checkElem]).then((val) => {
                        if (val) {
                            return true;
                        }
                        else {
                            console.warn(`startFeature(${settings.title}) unable to initiate! Could not find element: ${elem}`);
                            return false;
                        }
                    });
                });
            }
            // Is the setting enabled?
            if (GM_getValue(settings.title)) {
                // A specific page is needed
                if (page && page.length > 0) {
                    // Loop over all required pages
                    const results = [];
                    yield page.forEach((p) => {
                        Check.page(p).then((r) => {
                            results.push(r);
                        });
                    });
                    // If any requested page matches the current page, run the feature
                    if (results.includes(true) === true)
                        return run();
                    else
                        return false;
                    // Skip to element checking
                }
                else {
                    return run();
                }
                // Setting is not enabled
            }
            else {
                return false;
            }
        });
    }
    /**
     * Trims a string longer than a specified char limit, to a full word
     */
    static trimString(inp, max) {
        if (inp.length > max) {
            inp = inp.substring(0, max + 1);
            inp = inp.substring(0, Math.min(inp.length, inp.lastIndexOf(' ')));
        }
        return inp;
    }
    /**
     * Removes brackets & all contained words from a string
     */
    static bracketRemover(inp) {
        return inp
            .replace(/{+.*?}+/g, '')
            .replace(/\[\[|\]\]/g, '')
            .replace(/<.*?>/g, '')
            .replace(/\(.*?\)/g, '')
            .trim();
    }
    /**
     * Converts a string to an array
     */
    static stringToArray(inp, splitPoint) {
        return splitPoint !== undefined && splitPoint !== 'ws'
            ? inp.split(splitPoint)
            : inp.match(/\S+/g) || [];
    }
    /**
     * Converts a comma (or other) separated value into an array
     * @param inp String to be divided
     * @param divider The divider (default: ',')
     */
    static csvToArray(inp, divider = ',') {
        const arr = [];
        inp.split(divider).forEach((item) => {
            arr.push(item.trim());
        });
        return arr;
    }
    /**
     * Convert an array to a string
     * @param inp string
     * @param end cut-off point
     */
    static arrayToString(inp, end) {
        let outp = '';
        inp.forEach((key, val) => {
            outp += key;
            if (end && val + 1 !== inp.length) {
                outp += ' ';
            }
        });
        return outp;
    }
    /**
     * Converts a DOM node reference into an HTML Element reference
     * @param node The node to convert
     */
    static nodeToElem(node) {
        if (node.firstChild !== null) {
            return node.firstChild.parentElement;
        }
        else {
            console.warn('Node-to-elem without childnode is untested');
            const tempNode = node;
            node.appendChild(tempNode);
            const selected = node.firstChild.parentElement;
            node.removeChild(tempNode);
            return selected;
        }
    }
    /**
     * Match strings while ignoring case sensitivity
     * @param a First string
     * @param b Second string
     */
    static caselessStringMatch(a, b) {
        const compare = a.localeCompare(b, 'en', {
            sensitivity: 'base',
        });
        return compare === 0 ? true : false;
    }
    /**
     * Add a new TorDetRow and return the inner div
     * @param tar The row to be targetted
     * @param label The name to be displayed for the new row
     * @param rowClass The row's classname (should start with mp_)
     */
    static addTorDetailsRow(tar, label, rowClass) {
        if (tar === null || tar.parentElement === null) {
            throw new Error(`Add Tor Details Row: empty node or parent node @ ${tar}`);
        }
        else {
            tar.parentElement.insertAdjacentHTML('afterend', `<div class="torDetRow"><div class="torDetLeft">${label}</div><div class="torDetRight ${rowClass}"><span class="flex"></span></div></div>`);
            return document.querySelector(`.${rowClass} .flex`);
        }
    }
    // TODO: Merge with `Util.createButton`
    /**
     * Inserts a link button that is styled like a site button (ex. in tor details)
     * @param tar The element the button should be added to
     * @param url The URL the button will send you to
     * @param text The text on the button
     * @param order Optional: flex flow ordering
     */
    static createLinkButton(tar, url = 'none', text, order = 0) {
        // Create the button
        const button = document.createElement('a');
        // Set up the button
        button.classList.add('mp_button_clone');
        if (url !== 'none') {
            button.setAttribute('href', url);
            button.setAttribute('target', '_blank');
        }
        button.innerText = text;
        button.style.order = `${order}`;
        // Inject the button
        tar.insertBefore(button, tar.firstChild);
    }
    /**
     * Inserts a non-linked button
     * @param id The ID of the button
     * @param text The text displayed in the button
     * @param type The HTML element to create. Default: `h1`
     * @param tar The HTML element the button will be `relative` to
     * @param relative The position of the button relative to the `tar`. Default: `afterend`
     * @param btnClass The classname of the element. Default: `mp_btn`
     */
    static createButton(id, text, type = 'h1', tar, relative = 'afterend', btnClass = 'mp_btn') {
        return new Promise((resolve, reject) => {
            // Choose the new button insert location and insert elements
            // const target: HTMLElement | null = <HTMLElement>document.querySelector(tar);
            const target = typeof tar === 'string' ? document.querySelector(tar) : tar;
            const btn = document.createElement(type);
            if (target === null) {
                reject(`${tar} is null!`);
            }
            else {
                target.insertAdjacentElement(relative, btn);
                Util.setAttr(btn, {
                    id: `mp_${id}`,
                    class: btnClass,
                    role: 'button',
                });
                // Set initial button text
                btn.innerHTML = text;
                resolve(btn);
            }
        });
    }
    /**
     * Converts an element into a button that, when clicked, copies text to clipboard
     * @param btn An HTML Element being used as a button
     * @param payload The text that will be copied to clipboard on button click, or a callback function that will use the clipboard's current text
     */
    static clipboardifyBtn(btn, payload, copy = true) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            // Have to override the Navigator type to prevent TS errors
            const nav = navigator;
            if (nav === undefined) {
                alert('Failed to copy text, likely due to missing browser support.');
                throw new Error("browser doesn't support 'navigator'?");
            }
            else {
                /* Navigator Exists */
                if (copy && typeof payload === 'string') {
                    // Copy results to clipboard
                    nav.clipboard.writeText(payload);
                    console.log('[M+] Copied to your clipboard!');
                }
                else {
                    // Run payload function with clipboard text
                    nav.clipboard.readText().then((text) => {
                        payload(text);
                    });
                    console.log('[M+] Copied from your clipboard!');
                }
                btn.style.color = 'green';
            }
        });
    }
    /**
     * Creates an HTTPRequest for GET JSON, returns the full text of HTTP GET
     * @param url - a string of the URL to submit for GET request
     */
    static getJSON(url) {
        return new Promise((resolve, reject) => {
            const getHTTP = new XMLHttpRequest();
            //URL to GET results with the amount entered by user plus the username found on the menu selected
            getHTTP.open('GET', url, true);
            getHTTP.setRequestHeader('Content-Type', 'application/json');
            getHTTP.onreadystatechange = function () {
                if (getHTTP.readyState === 4 && getHTTP.status === 200) {
                    resolve(getHTTP.responseText);
                }
            };
            getHTTP.send();
        });
    }
    /**
     * #### Get the user gift history between the logged in user and a given ID
     * @param userID A user ID; can be a string or number
     */
    static getUserGiftHistory(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawGiftHistory = yield Util.getJSON(`https://www.myanonamouse.net/json/userBonusHistory.php?other_userid=${userID}`);
            const giftHistory = JSON.parse(rawGiftHistory);
            // Return the full data
            return giftHistory;
        });
    }
    static prettySiteTime(unixTimestamp, date, time) {
        const timestamp = new Date(unixTimestamp * 1000).toISOString();
        if (date && !time) {
            return timestamp.split('T')[0];
        }
        else if (!date && time) {
            return timestamp.split('T')[1];
        }
        else {
            return timestamp;
        }
    }
    /**
     * #### Check a string to see if it's divided with a dash, returning the first half if it doesn't contain a specified string
     * @param original The original string being checked
     * @param contained A string that might be contained in the original
     */
    static checkDashes(original, contained) {
        if (MP.DEBUG) {
            console.log(`checkDashes( ${original}, ${contained} ): Count ${original.indexOf(' - ')}`);
        }
        // Dashes are present
        if (original.indexOf(' - ') !== -1) {
            if (MP.DEBUG) {
                console.log(`String contains a dash`);
            }
            const split = original.split(' - ');
            if (split[0] === contained) {
                if (MP.DEBUG) {
                    console.log(`> String before dash is "${contained}"; using string behind dash`);
                }
                return split[1];
            }
            else {
                return split[0];
            }
        }
        else {
            return original;
        }
    }
}
/**
 *Return the contents between brackets
 *
 * @static
 * @memberof Util
 */
Util.bracketContents = (inp) => {
    return inp.match(/\(([^)]+)\)/)[1];
};
/**
 * Returns a random number between two parameters
 * @param min a number of the bottom of random number pool
 * @param max a number of the top of the random number pool
 */
Util.randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
/**
 * Sleep util to be used in async functions to delay program
 */
Util.sleep = (m) => new Promise((r) => setTimeout(r, m));
/**
 * Return the last section of an HREF
 * @param elem An anchor element
 * @param split Optional divider. Defaults to `/`
 */
Util.endOfHref = (elem, split = '/') => elem.href.split(split).pop();
/**
 * Return the hex value of a component as a string.
 * From https://stackoverflow.com/questions/5623838
 *
 * @static
 * @param {number} c
 * @returns {string}
 * @memberof Util
 */
Util.componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
};
/**
 * Return a hex color code from RGB.
 * From https://stackoverflow.com/questions/5623838
 *
 * @static
 * @memberof Util
 */
Util.rgbToHex = (r, g, b) => {
    return `#${Util.componentToHex(r)}${Util.componentToHex(g)}${Util.componentToHex(b)}`;
};
/**
 * Extract numbers (with float) from text and return them
 * @param tar An HTML element that contains numbers
 */
Util.extractFloat = (tar) => {
    if (tar.textContent) {
        return (tar.textContent.replace(/,/g, '').match(/\d+\.\d+/) || []).map((n) => parseFloat(n));
    }
    else {
        throw new Error('Target contains no text');
    }
};
/**
 * ## Utilities specific to Goodreads
 */
Util.goodreads = {
    /**
     * * Removes spaces in author names that use adjacent intitials.
     * @param auth The author(s)
     * @example "H G Wells" -> "HG Wells"
     */
    smartAuth: (auth) => {
        let outp = '';
        const arr = Util.stringToArray(auth);
        arr.forEach((key, val) => {
            // Current key is an initial
            if (key.length < 2) {
                // If next key is an initial, don't add a space
                const nextLeng = arr[val + 1].length;
                if (nextLeng < 2) {
                    outp += key;
                }
                else {
                    outp += `${key} `;
                }
            }
            else {
                outp += `${key} `;
            }
        });
        // Trim trailing space
        return outp.trim();
    },
    /**
     * * Turns a string into a Goodreads search URL
     * @param type The type of URL to make
     * @param inp The extracted data to URI encode
     */
    buildSearchURL: (type, inp) => {
        if (MP.DEBUG) {
            console.log(`goodreads.buildGrSearchURL( ${type}, ${inp} )`);
        }
        let grType = type;
        const cases = {
            book: () => {
                grType = 'title';
            },
            series: () => {
                grType = 'on';
                inp += ', #';
            },
        };
        if (cases[type]) {
            cases[type]();
        }
        return `http://www.dereferer.org/?https://www.goodreads.com/search?q=${encodeURIComponent(inp.replace('%', '')).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;
    },
};
/**
 * #### Return a cleaned book title from an element
 * @param data The element containing the title text
 * @param auth A string of authors
 */
Util.getBookTitle = (data, auth = '') => __awaiter(void 0, void 0, void 0, function* () {
    if (data === null) {
        throw new Error('getBookTitle() failed; element was null!');
    }
    let extracted = data.innerText;
    // Shorten title and check it for brackets & author names
    extracted = Util.trimString(Util.bracketRemover(extracted), 50);
    extracted = Util.checkDashes(extracted, auth);
    return extracted;
});
/**
 * #### Return GR-formatted authors as an array limited to `num`
 * @param data The element containing the author links
 * @param num The number of authors to return. Default 3
 */
Util.getBookAuthors = (data, num = 3) => __awaiter(void 0, void 0, void 0, function* () {
    if (data === null) {
        console.warn('getBookAuthors() failed; element was null!');
        return [];
    }
    else {
        const authList = [];
        data.forEach((author) => {
            if (num > 0) {
                authList.push(Util.goodreads.smartAuth(author.innerText));
                num--;
            }
        });
        return authList;
    }
});
/**
 * #### Return series as an array
 * @param data The element containing the series links
 */
Util.getBookSeries = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data === null) {
        console.warn('getBookSeries() failed; element was null!');
        return [];
    }
    else {
        const seriesList = [];
        data.forEach((series) => {
            seriesList.push(series.innerText);
        });
        return seriesList;
    }
});
/**
 * #### Return a table-like array of rows as an object.
 * Store the returned object and access using the row title, ex. `stored['Title:']`
 * @param rowList An array of table-like rows
 * @param titleClass The class used by the title cells. Default `.torDetLeft`
 * @param dataClass The class used by the data cells. Default `.torDetRight`
 */
Util.rowsToObj = (rowList, titleClass = '.torDetLeft', dataClass = '.torDetRight') => {
    if (rowList.length < 1) {
        throw new Error(`Util.rowsToObj( ${rowList} ): Row list was empty!`);
    }
    const rows = [];
    rowList.forEach((row) => {
        const title = row.querySelector(titleClass);
        const data = row.querySelector(dataClass);
        if (title) {
            rows.push({
                key: title.textContent,
                value: data,
            });
        }
        else {
            console.warn('Row title was empty!');
        }
    });
    return rows.reduce((obj, item) => ((obj[item.key] = item.value), obj), {});
};
/// <reference path="util.ts" />
/**
 * # Class for handling validation & confirmation
 */
class Check {
    /**
     * * Wait for an element to exist, then return it
     * @param {string} selector - The DOM string that will be used to select an element
     * @return {Promise<HTMLElement>} Promise of an element that was selected
     */
    static elemLoad(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (MP.DEBUG) {
                console.log(`%c Looking for ${selector}`, 'background: #222; color: #555');
            }
            let _counter = 0;
            const _counterLimit = 100;
            const logic = (selector) => __awaiter(this, void 0, void 0, function* () {
                // Select the actual element
                const elem = document.querySelector(selector);
                if (elem === undefined) {
                    throw `${selector} is undefined!`;
                }
                if (elem === null && _counter < _counterLimit) {
                    yield Util.afTimer();
                    _counter++;
                    return yield logic(selector);
                }
                else if (elem === null && _counter >= _counterLimit) {
                    _counter = 0;
                    return false;
                }
                else if (elem) {
                    return elem;
                }
                else {
                    return false;
                }
            });
            return logic(selector);
        });
    }
    /**
     * * Run a function whenever an element changes
     * @param selector - The element to be observed. Can be a string.
     * @param callback - The function to run when the observer triggers
     * @return Promise of a mutation observer
     */
    static elemObserver(selector, callback, config = {
        childList: true,
        attributes: true,
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            let selected = null;
            if (typeof selector === 'string') {
                selected = document.querySelector(selector);
                if (selected === null) {
                    throw new Error(`Couldn't find '${selector}'`);
                }
            }
            if (MP.DEBUG) {
                console.log(`%c Setting observer on ${selector}: ${selected}`, 'background: #222; color: #5d8aa8');
            }
            const observer = new MutationObserver(callback);
            observer.observe(selected, config);
            return observer;
        });
    }
    /**
     * * Check to see if the script has been updated from an older version
     * @return The version string or false
     */
    static updated() {
        if (MP.DEBUG) {
            console.group('Check.updated()');
            console.log(`PREV VER = ${this.prevVer}`);
            console.log(`NEW VER = ${this.newVer}`);
        }
        return new Promise((resolve) => {
            // Different versions; the script was updated
            if (this.newVer !== this.prevVer) {
                if (MP.DEBUG) {
                    console.log('Script is new or updated');
                }
                // Store the new version
                GM_setValue('mp_version', this.newVer);
                if (this.prevVer) {
                    // The script has run before
                    if (MP.DEBUG) {
                        console.log('Script has run before');
                        console.groupEnd();
                    }
                    resolve('updated');
                }
                else {
                    // First-time run
                    if (MP.DEBUG) {
                        console.log('Script has never run');
                        console.groupEnd();
                    }
                    // Enable the most basic features
                    GM_setValue('goodreadsBtn', true);
                    GM_setValue('alerts', true);
                    resolve('firstRun');
                }
            }
            else {
                if (MP.DEBUG) {
                    console.log('Script not updated');
                    console.groupEnd();
                }
                resolve(false);
            }
        });
    }
    /**
     * * Check to see what page is being accessed
     * @param {ValidPage} pageQuery - An optional page to specifically check for
     * @return {Promise<string>} A promise containing the name of the current page
     * @return {Promise<boolean>} Optionally, a boolean if the current page matches the `pageQuery`
     */
    static page(pageQuery) {
        const storedPage = GM_getValue('mp_currentPage');
        let currentPage = undefined;
        return new Promise((resolve) => {
            // Check.page() has been run and a value was stored
            if (storedPage !== undefined) {
                // If we're just checking what page we're on, return the stored page
                if (!pageQuery) {
                    resolve(storedPage);
                    // If we're checking for a specific page, return TRUE/FALSE
                }
                else if (pageQuery === storedPage) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                // Check.page() has not previous run
            }
            else {
                // Get the current page
                let path = window.location.pathname;
                path = path.indexOf('.php') ? path.split('.php')[0] : path;
                const page = path.split('/');
                page.shift();
                if (MP.DEBUG) {
                    console.log(`Page URL @ ${page.join(' -> ')}`);
                }
                // Create an object literal of sorts to use as a "switch"
                const cases = {
                    '': () => 'home',
                    index: () => 'home',
                    shoutbox: () => 'shoutbox',
                    preferences: () => 'settings',
                    millionaires: () => 'vault',
                    t: () => 'torrent',
                    u: () => 'user',
                    f: () => {
                        if (page[1] === 't')
                            return 'forum thread';
                    },
                    tor: () => {
                        if (page[1] === 'browse')
                            return 'browse';
                        else if (page[1] === 'requests2')
                            return 'request';
                        else if (page[1] === 'viewRequest')
                            return 'request details';
                        else if (page[1] === 'upload')
                            return 'upload';
                    },
                };
                // Check to see if we have a case that matches the current page
                if (cases[page[0]]) {
                    currentPage = cases[page[0]]();
                }
                else {
                    console.warn(`Page "${page}" is not a valid M+ page. Path: ${path}`);
                }
                if (currentPage !== undefined) {
                    // Save the current page to be accessed later
                    GM_setValue('mp_currentPage', currentPage);
                    // If we're just checking what page we're on, return the page
                    if (!pageQuery) {
                        resolve(currentPage);
                        // If we're checking for a specific page, return TRUE/FALSE
                    }
                    else if (pageQuery === currentPage) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            }
            if (MP.DEBUG) {
                console.groupEnd();
            }
        });
    }
    /**
     * * Check to see if a given category is an ebook/audiobook category
     */
    static isBookCat(cat) {
        // Currently, all book categories are assumed to be in the range of 39-120
        return cat >= 39 && cat <= 120 ? true : false;
    }
}
Check.newVer = GM_info.script.version;
Check.prevVer = GM_getValue('mp_version');
/// <reference path="check.ts" />
/**
 * Class for handling values and methods related to styles
 * @constructor Initializes theme based on last saved value; can be called before page content is loaded
 * @method theme Gets or sets the current theme
 */
class Style {
    constructor() {
        // The light theme is the default theme, so use M+ Light values
        this._theme = 'light';
        // Get the previously used theme object
        this._prevTheme = this._getPrevTheme();
        // If the previous theme object exists, assume the current theme is identical
        if (this._prevTheme !== undefined) {
            this._theme = this._prevTheme;
        }
        else if (MP.DEBUG)
            console.warn('no previous theme');
        // Fetch the CSS data
        this._cssData = GM_getResourceText('MP_CSS');
    }
    /** Allows the current theme to be returned */
    get theme() {
        return this._theme;
    }
    /** Allows the current theme to be set */
    set theme(val) {
        this._theme = val;
    }
    /** Sets the M+ theme based on the site theme */
    alignToSiteTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            const theme = yield this._getSiteCSS();
            this._theme = theme.indexOf('dark') > 0 ? 'dark' : 'light';
            if (this._prevTheme !== this._theme) {
                this._setPrevTheme();
            }
            // Inject the CSS class used by M+ for theming
            Check.elemLoad('body').then(() => {
                const body = document.querySelector('body');
                if (body) {
                    body.classList.add(`mp_${this._theme}`);
                }
                else if (MP.DEBUG) {
                    console.warn(`Body is ${body}`);
                }
            });
        });
    }
    /** Injects the stylesheet link into the header */
    injectLink() {
        const id = 'mp_css';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.innerText = this._cssData !== undefined ? this._cssData : '';
            document.querySelector('head').appendChild(style);
        }
        else if (MP.DEBUG)
            console.warn(`an element with the id "${id}" already exists`);
    }
    /** Returns the previous theme object if it exists */
    _getPrevTheme() {
        return GM_getValue('style_theme');
    }
    /** Saves the current theme for future reference */
    _setPrevTheme() {
        GM_setValue('style_theme', this._theme);
    }
    _getSiteCSS() {
        return new Promise((resolve) => {
            const themeURL = document
                .querySelector('head link[href*="ICGstation"]')
                .getAttribute('href');
            if (typeof themeURL === 'string') {
                resolve(themeURL);
            }
            else if (MP.DEBUG)
                console.warn(`themeUrl is not a string: ${themeURL}`);
        });
    }
}
/// <reference path="../check.ts" />
/**
 * CORE FEATURES
 *
 * Your feature belongs here if the feature:
 * A) is critical to the userscript
 * B) is intended to be used by other features
 * C) will have settings displayed on the Settings page
 * If A & B are met but not C consider using `Utils.ts` instead
 */
/**
 * This feature creates a pop-up notification
 */
class Alerts {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'alerts',
            desc: 'Enable the MAM+ Alert panel for update information, etc.',
        };
        MP.settingsGlob.push(this._settings);
    }
    notify(kind, log) {
        if (MP.DEBUG) {
            console.group(`Alerts.notify( ${kind} )`);
        }
        return new Promise((resolve) => {
            // Verify a notification request was made
            if (kind) {
                // Verify notifications are allowed
                if (GM_getValue('alerts')) {
                    // Internal function to build msg text
                    const buildMsg = (arr, title) => {
                        if (MP.DEBUG) {
                            console.log(`buildMsg( ${title} )`);
                        }
                        // Make sure the array isn't empty
                        if (arr.length > 0 && arr[0] !== '') {
                            // Display the section heading
                            let msg = `<h4>${title}:</h4><ul>`;
                            // Loop over each item in the message
                            arr.forEach((item) => {
                                msg += `<li>${item}</li>`;
                            }, msg);
                            // Close the message
                            msg += '</ul>';
                            return msg;
                        }
                        return '';
                    };
                    // Internal function to build notification panel
                    const buildPanel = (msg) => {
                        if (MP.DEBUG) {
                            console.log(`buildPanel( ${msg} )`);
                        }
                        Check.elemLoad('body').then(() => {
                            document.body.innerHTML += `<div class='mp_notification'>${msg}<span>X</span></div>`;
                            const msgBox = document.querySelector('.mp_notification');
                            const closeBtn = msgBox.querySelector('span');
                            try {
                                if (closeBtn) {
                                    // If the close button is clicked, remove it
                                    closeBtn.addEventListener('click', () => {
                                        if (msgBox) {
                                            msgBox.remove();
                                        }
                                    }, false);
                                }
                            }
                            catch (err) {
                                if (MP.DEBUG) {
                                    console.log(err);
                                }
                            }
                        });
                    };
                    let message = '';
                    if (kind === 'updated') {
                        if (MP.DEBUG) {
                            console.log('Building update message');
                        }
                        // Start the message
                        message = `<strong>MAM+ has been updated!</strong> You are now using v${MP.VERSION}, created on ${MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>`;
                        // Add the changelog
                        message += buildMsg(log.UPDATE_LIST, 'Changes');
                        message += buildMsg(log.BUG_LIST, 'Known Bugs');
                    }
                    else if (kind === 'firstRun') {
                        message =
                            '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="https://github.com/gardenshade/mam-plus/issues">Github</a>, <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a>, or <a href="/sendmessage.php?receiver=108303">through private message</a>.';
                        if (MP.DEBUG) {
                            console.log('Building first run message');
                        }
                    }
                    else if (MP.DEBUG) {
                        console.warn(`Received msg kind: ${kind}`);
                    }
                    buildPanel(message);
                    if (MP.DEBUG) {
                        console.groupEnd();
                    }
                    resolve(true);
                    // Notifications are disabled
                }
                else {
                    if (MP.DEBUG) {
                        console.log('Notifications are disabled.');
                        console.groupEnd();
                    }
                    resolve(false);
                }
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
class Debug {
    constructor() {
        this._settings = {
            scope: SettingGroup.Other,
            type: 'checkbox',
            title: 'debug',
            desc: 'Error log (<em>Click this checkbox to enable verbose logging to the console</em>)',
        };
        MP.settingsGlob.push(this._settings);
    }
    get settings() {
        return this._settings;
    }
}
/**
 * GLOBAL FEATURES
 */
class HideHome {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'dropdown',
            title: 'hideHome',
            tag: 'Remove banner/home',
            options: {
                default: 'Do not remove either',
                hideBanner: 'Hide the banner',
                hideHome: 'Hide the home button',
            },
            desc: 'Remove the header image or Home button, because both link to the homepage',
        };
        this._tar = '#mainmenu';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const hider = GM_getValue(this._settings.title);
        if (hider === 'hideHome') {
            document.body.classList.add('mp_hide_home');
            console.log('[M+] Hid the home button!');
        }
        else if (hider === 'hideBanner') {
            document.body.classList.add('mp_hide_banner');
            console.log('[M+] Hid the banner!');
        }
    }
    get settings() {
        return this._settings;
    }
}
class VaultLink {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'vaultLink',
            desc: 'Make the Vault link bypass the Vault Info page',
        };
        this._tar = '#millionInfo';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        document
            .querySelector(this._tar)
            .setAttribute('href', '/millionaires/donate.php');
        console.log('[M+] Made the vault text link to the donate page!');
    }
    get settings() {
        return this._settings;
    }
}
class MiniVaultInfo {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'miniVaultInfo',
            desc: 'Shorten the Vault link & ratio text',
        };
        this._tar = '#millionInfo';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const vaultText = document.querySelector(this._tar);
        const ratioText = document.querySelector('#tmR');
        // Shorten the ratio text
        // TODO: move this to its own setting?
        /* This chained monstrosity does the following:
        - Extract the number (with float) from the element
        - Fix the float to 2 decimal places (which converts it back into a string)
        - Convert the string back into a number so that we can convert it with`toLocaleString` to get commas back */
        const num = Number(Util.extractFloat(ratioText)[0].toFixed(2)).toLocaleString();
        ratioText.innerHTML = `${num} <img src="/pic/updownBig.png" alt="ratio">`;
        // Turn the numeric portion of the vault link into a number
        let newText = parseInt(vaultText.textContent.split(':')[1].split(' ')[1].replace(/,/g, ''));
        // Convert the vault amount to millionths
        newText = Number((newText / 1e6).toFixed(3));
        // Update the vault text
        vaultText.textContent = `Vault: ${newText} million`;
        console.log('[M+] Shortened the vault & ratio numbers!');
    }
    get settings() {
        return this._settings;
    }
}
class BonusPointDelta {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'bonusPointDelta',
            desc: `Display how many bonus points you've gained since last pageload`,
        };
        this._tar = '#tmBP';
        this._prevBP = 0;
        this._currentBP = 0;
        this._delta = 0;
        this._displayBP = (bp) => {
            const bonusBox = document.querySelector(this._tar);
            let deltaBox = '';
            deltaBox = bp > 0 ? `+${bp}` : `${bp}`;
            if (bonusBox !== null) {
                bonusBox.innerHTML += `<span class='mp_bpDelta'> (${deltaBox})</span>`;
            }
        };
        this._setBP = (bp) => {
            GM_setValue(`${this._settings.title}Val`, `${bp}`);
        };
        this._getBP = () => {
            const stored = GM_getValue(`${this._settings.title}Val`);
            if (stored === undefined) {
                return 0;
            }
            else {
                return parseInt(stored);
            }
        };
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        const currentBPEl = document.querySelector(this._tar);
        // Get old BP value
        this._prevBP = this._getBP();
        if (currentBPEl !== null) {
            // Extract only the number from the BP element
            const current = currentBPEl.textContent.match(/\d+/g);
            // Set new BP value
            this._currentBP = parseInt(current[0]);
            this._setBP(this._currentBP);
            // Calculate delta
            this._delta = this._currentBP - this._prevBP;
            // Show the text if not 0
            if (this._delta !== 0 && !isNaN(this._delta)) {
                this._displayBP(this._delta);
            }
        }
    }
    get settings() {
        return this._settings;
    }
}
class BlurredHeader {
    constructor() {
        this._settings = {
            scope: SettingGroup.Global,
            type: 'checkbox',
            title: 'blurredHeader',
            desc: `Add a blurred background to the header area`,
        };
        this._tar = '#siteMain > header';
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const header = document.querySelector(`${this._tar}`);
            const headerImg = header.querySelector(`img`);
            if (headerImg) {
                const headerSrc = headerImg.getAttribute('src');
                // Generate a container for the background
                const blurredBack = document.createElement('div');
                header.classList.add('mp_blurredBack');
                header.append(blurredBack);
                blurredBack.style.backgroundImage = headerSrc ? `url(${headerSrc})` : '';
                blurredBack.classList.add('mp_container');
            }
            console.log('[M+] Added a blurred background to the header!');
        });
    }
    // This must match the type selected for `this._settings`
    get settings() {
        return this._settings;
    }
}
class HideSeedbox {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'hideSeedbox',
            scope: SettingGroup.Global,
            desc: 'Remove the "Get A Seedbox" menu item',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#menu';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const seedboxBtn = document.querySelector('#menu .sbDonCrypto');
            if (seedboxBtn)
                seedboxBtn.style.display = 'none';
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ### Adds ability to gift newest 10 members to MAM on Homepage or open their user pages
 */
class GiftNewest {
    constructor() {
        this._settings = {
            scope: SettingGroup.Home,
            type: 'checkbox',
            title: 'giftNewest',
            desc: `Add buttons to Gift/Open all newest members`,
        };
        this._tar = '#fpNM';
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            //ensure gifted list is under 50 member names long
            this._trimGiftList();
            //get the FrontPage NewMembers element containing newest 10 members
            const fpNM = document.querySelector(this._tar);
            const members = Array.prototype.slice.call(fpNM.getElementsByTagName('a'));
            const lastMem = members[members.length - 1];
            members.forEach((member) => {
                //add a class to the existing element for use in reference in creating buttons
                member.setAttribute('class', `mp_refPoint_${Util.endOfHref(member)}`);
                //if the member has been gifted through this feature previously
                if (GM_getValue('mp_lastNewGifted').indexOf(Util.endOfHref(member)) >= 0) {
                    //add checked box to text
                    member.innerText = `${member.innerText} \u2611`;
                    member.classList.add('mp_gifted');
                }
            });
            //get the default value of gifts set in preferences for user page
            let giftValueSetting = GM_getValue('userGiftDefault_val');
            //if they did not set a value in preferences, set to 100 or set to max or min
            // TODO: Make the gift value check into a Util
            if (!giftValueSetting) {
                giftValueSetting = '100';
            }
            else if (Number(giftValueSetting) > 1000 || isNaN(Number(giftValueSetting))) {
                giftValueSetting = '1000';
            }
            else if (Number(giftValueSetting) < 5) {
                giftValueSetting = '5';
            }
            //create the text input for how many points to give
            const giftAmounts = document.createElement('input');
            Util.setAttr(giftAmounts, {
                type: 'text',
                size: '3',
                id: 'mp_giftAmounts',
                title: 'Value between 5 and 1000',
                value: giftValueSetting,
            });
            //insert the text box after the last members name
            lastMem.insertAdjacentElement('afterend', giftAmounts);
            //make the button and insert after the last members name (before the input text)
            const giftAllBtn = yield Util.createButton('giftAll', 'Gift All: ', 'button', `.mp_refPoint_${Util.endOfHref(lastMem)}`, 'afterend', 'mp_btn');
            //add a space between button and text
            giftAllBtn.style.marginRight = '5px';
            giftAllBtn.style.marginTop = '5px';
            giftAllBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                let firstCall = true;
                for (const member of members) {
                    //update the text to show processing
                    document.getElementById('mp_giftAllMsg').innerText =
                        'Sending Gifts... Please Wait';
                    //if user has not been gifted
                    if (!member.classList.contains('mp_gifted')) {
                        //get the members name for JSON string
                        const userName = member.innerText;
                        //get the points amount from the input box
                        const giftFinalAmount = (document.getElementById('mp_giftAmounts')).value;
                        //URL to GET random search results
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
                        //wait 3 seconds between JSON calls
                        if (firstCall) {
                            firstCall = false;
                        }
                        else {
                            yield Util.sleep(3000);
                        }
                        //request sending points
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //check off box
                            member.innerText = `${member.innerText} \u2611`;
                            member.classList.add('mp_gifted');
                            //add member to the stored member list
                            GM_setValue('mp_lastNewGifted', `${Util.endOfHref(member)},${GM_getValue('mp_lastNewGifted')}`);
                        }
                        else if (!JSON.parse(jsonResult).success) {
                            console.warn(JSON.parse(jsonResult).error);
                        }
                    }
                }
                //disable button after send
                giftAllBtn.disabled = true;
                document.getElementById('mp_giftAllMsg').innerText =
                    'Gifts completed to all Checked Users';
            }), false);
            //newline between elements
            members[members.length - 1].after(document.createElement('br'));
            //listen for changes to the input box and ensure its between 5 and 1000, if not disable button
            document.getElementById('mp_giftAmounts').addEventListener('input', () => {
                const valueToNumber = (document.getElementById('mp_giftAmounts')).value;
                const giftAll = document.getElementById('mp_giftAll');
                if (Number(valueToNumber) > 1000 ||
                    Number(valueToNumber) < 5 ||
                    isNaN(Number(valueToNumber))) {
                    giftAll.disabled = true;
                    giftAll.setAttribute('title', 'Disabled');
                }
                else {
                    giftAll.disabled = false;
                    giftAll.setAttribute('title', `Gift All ${valueToNumber}`);
                }
            });
            //add a button to open all ungifted members in new tabs
            const openAllBtn = yield Util.createButton('openTabs', 'Open Ungifted In Tabs', 'button', '[id=mp_giftAmounts]', 'afterend', 'mp_btn');
            openAllBtn.setAttribute('title', 'Open new tab for each');
            openAllBtn.addEventListener('click', () => {
                for (const member of members) {
                    if (!member.classList.contains('mp_gifted')) {
                        window.open(member.href, '_blank');
                    }
                }
            }, false);
            //get the current amount of bonus points available to spend
            let bonusPointsAvail = document.getElementById('tmBP').innerText;
            //get rid of the delta display
            if (bonusPointsAvail.indexOf('(') >= 0) {
                bonusPointsAvail = bonusPointsAvail.substring(0, bonusPointsAvail.indexOf('('));
            }
            //recreate the bonus points in new span and insert into fpNM
            const messageSpan = document.createElement('span');
            messageSpan.setAttribute('id', 'mp_giftAllMsg');
            messageSpan.innerText = 'Available ' + bonusPointsAvail;
            document.getElementById('mp_giftAmounts').after(messageSpan);
            document.getElementById('mp_giftAllMsg').after(document.createElement('br'));
            document
                .getElementById('mp_giftAllMsg')
                .insertAdjacentHTML('beforebegin', '<br>');
            console.log(`[M+] Adding gift new members button to Home page...`);
        });
    }
    /**
     * * Trims the gifted list to last 50 names to avoid getting too large over time.
     */
    _trimGiftList() {
        //if value exists in GM
        if (GM_getValue('mp_lastNewGifted')) {
            //GM value is a comma delim value, split value into array of names
            const giftNames = GM_getValue('mp_lastNewGifted').split(',');
            let newGiftNames = '';
            if (giftNames.length > 50) {
                for (const giftName of giftNames) {
                    if (giftNames.indexOf(giftName) <= 49) {
                        //rebuild a comma delim string out of the first 49 names
                        newGiftNames = newGiftNames + giftName + ',';
                        //set new string in GM
                        GM_setValue('mp_lastNewGifted', newGiftNames);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        else {
            //set value if doesnt exist
            GM_setValue('mp_lastNewGifted', '');
        }
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ### Adds ability to hide news items on the page
 */
class HideNews {
    constructor() {
        this._settings = {
            scope: SettingGroup.Home,
            title: 'hideNews',
            type: 'checkbox',
            desc: 'Tidy the homepage and allow News to be hidden',
        };
        this._tar = '.mainPageNewsHead';
        this._valueTitle = `${this._settings.title}_val`;
        this._icon = '\u274e';
        this._checkForSeen = () => __awaiter(this, void 0, void 0, function* () {
            const prevValue = GM_getValue(this._valueTitle);
            const news = this._getNewsItems();
            if (MP.DEBUG)
                console.log(this._valueTitle, ':\n', prevValue);
            if (prevValue && news) {
                // Use the icon to split out the known hidden messages
                const hiddenArray = prevValue.split(this._icon);
                /* If any of the hidden messages match a current message
                    remove the current message from the DOM */
                hiddenArray.forEach((hidden) => {
                    news.forEach((entry) => {
                        if (entry.textContent === hidden) {
                            entry.remove();
                        }
                    });
                });
                // If there are no current messages, hide the header
                if (!document.querySelector('.mainPageNewsSub')) {
                    this._adjustHeaderSize(this._tar, false);
                }
            }
            else {
                return;
            }
        });
        this._removeClock = () => {
            const clock = document.querySelector('#mainBody .fpTime');
            if (clock)
                clock.remove();
        };
        this._adjustHeaderSize = (selector, visible) => {
            const newsHeader = document.querySelector(selector);
            if (newsHeader) {
                if (visible === false) {
                    newsHeader.style.display = 'none';
                }
                else {
                    newsHeader.style.fontSize = '2em';
                }
            }
        };
        this._addHiderButton = () => {
            const news = this._getNewsItems();
            if (!news)
                return;
            // Loop over each news entry
            news.forEach((entry) => {
                // Create a button
                const xbutton = document.createElement('div');
                xbutton.textContent = this._icon;
                Util.setAttr(xbutton, {
                    style: 'display:inline-block;margin-right:0.7em;cursor:pointer;',
                    class: 'mp_clearBtn',
                });
                // Listen for clicks
                xbutton.addEventListener('click', () => {
                    // When clicked, append the content of the current news post to the
                    // list of remembered news items
                    const previousValue = GM_getValue(this._valueTitle)
                        ? GM_getValue(this._valueTitle)
                        : '';
                    if (MP.DEBUG)
                        console.log(`Hiding... ${previousValue}${entry.textContent}`);
                    GM_setValue(this._valueTitle, `${previousValue}${entry.textContent}`);
                    entry.remove();
                    // If there are no more news items, remove the header
                    const updatedNews = this._getNewsItems();
                    if (updatedNews && updatedNews.length < 1) {
                        this._adjustHeaderSize(this._tar, false);
                    }
                });
                // Add the button as the first child of the entry
                if (entry.firstChild)
                    entry.firstChild.before(xbutton);
            });
        };
        this._cleanValues = (num = 3) => {
            let value = GM_getValue(this._valueTitle);
            if (MP.DEBUG)
                console.log(`GM_getValue(${this._valueTitle})`, value);
            if (value) {
                // Return the last 3 stored items after splitting them at the icon
                value = Util.arrayToString(value.split(this._icon).slice(0 - num));
                // Store the new value
                GM_setValue(this._valueTitle, value);
            }
        };
        this._getNewsItems = () => {
            return document.querySelectorAll('div[class^="mainPageNews"]');
        };
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // NOTE: for development
            // GM_deleteValue(this._valueTitle);console.warn(`Value of ${this._valueTitle} will be deleted!`);
            this._removeClock();
            this._adjustHeaderSize(this._tar);
            yield this._checkForSeen();
            this._addHiderButton();
            // this._cleanValues(); // FIX: Not working as intended
            console.log('[M+] Cleaned up the home page!');
        });
    }
    // This must match the type selected for `this._settings`
    get settings() {
        return this._settings;
    }
}
/// <reference path="../check.ts" />
/**
 * SHARED CODE
 *
 * This is for anything that's shared between files, but is not generic enough to
 * to belong in `Utils.ts`. I can't think of a better way to categorize DRY code.
 */
class Shared {
    constructor() {
        /**
         * Receive a target and `this._settings.title`
         * @param tar CSS selector for a text input box
         */
        // TODO: with all Checking being done in `Util.startFeature()` it's no longer necessary to Check in this function
        this.fillGiftBox = (tar, settingTitle) => {
            if (MP.DEBUG)
                console.log(`Shared.fillGiftBox( ${tar}, ${settingTitle} )`);
            return new Promise((resolve) => {
                Check.elemLoad(tar).then(() => {
                    const pointBox = (document.querySelector(tar));
                    if (pointBox) {
                        const userSetPoints = parseInt(GM_getValue(`${settingTitle}_val`));
                        let maxPoints = parseInt(pointBox.getAttribute('max'));
                        if (!isNaN(userSetPoints) && userSetPoints <= maxPoints) {
                            maxPoints = userSetPoints;
                        }
                        pointBox.value = maxPoints.toFixed(0);
                        resolve(maxPoints);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        };
        /**
         * Returns list of all results from Browse page
         */
        this.getSearchList = () => {
            if (MP.DEBUG)
                console.log(`Shared.getSearchList( )`);
            return new Promise((resolve, reject) => {
                // Wait for the search results to exist
                Check.elemLoad('#ssr tr[id ^= "tdr"] td').then(() => {
                    // Select all search results
                    const snatchList = document.querySelectorAll('#ssr tr[id ^= "tdr"]');
                    if (snatchList === null || snatchList === undefined) {
                        reject(`snatchList is ${snatchList}`);
                    }
                    else {
                        resolve(snatchList);
                    }
                });
            });
        };
        this.goodreadsButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-Goodreads buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search Goodreads', 'mp_grRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_grRow .flex');
            const buttonTar = (document.querySelector('.mp_grRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = Util.goodreads.buildSearchURL('series', item);
                        Util.createLinkButton(buttonTar, url, buttonTitle, 4);
                    });
                }
                else {
                    console.warn('No series data detected!');
                }
            });
            // Build Author button
            authorP
                .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = Util.goodreads.buildSearchURL('author', authors);
                    Util.createLinkButton(buttonTar, url, 'Author', 3);
                }
                else {
                    console.warn('No author data detected!');
                }
            })
                // Build Title buttons
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const title = yield Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = Util.goodreads.buildSearchURL('book', title);
                    Util.createLinkButton(buttonTar, url, 'Title', 2);
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = Util.goodreads.buildSearchURL('on', `${title} ${authors}`);
                        Util.createLinkButton(buttonTar, bothURL, 'Title + Author', 1);
                    }
                    else if (MP.DEBUG) {
                        console.log(`Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`);
                    }
                }
                else {
                    console.warn('No title data detected!');
                }
            }));
            console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
        });
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * * Autofills the Gift box with a specified number of points.
 */
class TorGiftDefault {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'torGiftDefault',
            tag: 'Default Gift',
            placeholder: 'ex. 5000, max',
            desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
        };
        this._tar = '#thanksArea input[name=points]';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to Goodreads
 */
class GoodreadsButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'goodreadsButton',
            desc: 'Enable the MAM-to-Goodreads buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substr(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping Goodreads buttons');
                }
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Select the data points
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            const target = document.querySelector(this._tar);
            // Generate buttons
            this._share.goodreadsButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generates a field for "Currently Reading" bbcode
 */
class CurrentlyReading {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup['Torrent Page'],
            title: 'currentlyReading',
            desc: `Add a button to generate a "Currently Reading" forum snippet`,
        };
        this._tar = '#torDetMainCon .TorrentTitle';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding Currently Reading section...');
            // Get the required information
            const title = document.querySelector('#torDetMainCon .TorrentTitle')
                .textContent;
            const authors = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const torID = window.location.pathname.split('/')[2];
            const rowTar = document.querySelector('#fInfo');
            // Title can't be null
            if (title === null) {
                throw new Error(`Title field was null`);
            }
            // Build a new table row
            const crRow = yield Util.addTorDetailsRow(rowTar, 'Currently Reading', 'mp_crRow');
            // Process data into string
            const blurb = yield this._generateSnippet(torID, title, authors);
            // Build button
            const btn = yield this._buildButton(crRow, blurb);
            // Init button
            Util.clipboardifyBtn(btn, blurb);
        });
    }
    /**
     * * Build a BB Code text snippet using the book info, then return it
     * @param id The string ID of the book
     * @param title The string title of the book
     * @param authors A node list of author links
     */
    _generateSnippet(id, title, authors) {
        /**
         * * Add Author Link
         * @param authorElem A link containing author information
         */
        const addAuthorLink = (authorElem) => {
            return `[url=${authorElem.href.replace('https://www.myanonamouse.net', '')}]${authorElem.textContent}[/url]`;
        };
        // Convert the NodeList into an Array which is easier to work with
        let authorArray = [];
        authors.forEach((authorElem) => authorArray.push(addAuthorLink(authorElem)));
        // Drop extra items
        if (authorArray.length > 3) {
            authorArray = [...authorArray.slice(0, 3), 'etc.'];
        }
        return `[url=/t/${id}]${title}[/url] by [i]${authorArray.join(', ')}[/i]`;
    }
    /**
     * * Build a button on the tor details page
     * @param tar Area where the button will be added into
     * @param content Content that will be added into the textarea
     */
    _buildButton(tar, content) {
        // Build text display
        tar.innerHTML = `<textarea rows="1" cols="80" style='margin-right:5px'>${content}</textarea>`;
        // Build button
        Util.createLinkButton(tar, 'none', 'Copy', 2);
        document.querySelector('.mp_crRow .mp_button_clone').classList.add('mp_reading');
        // Return button
        return document.querySelector('.mp_reading');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Protects the user from ratio troubles by adding warnings and displaying ratio delta
 */
class RatioProtect {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup['Torrent Page'],
            title: 'ratioProtect',
            desc: `Protect your ratio with warnings &amp; ratio calculations`,
        };
        this._tar = '#ratio';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling ratio protection...');
            // The download text area
            const dlBtn = document.querySelector('#tddl');
            // The currently unused label area above the download text
            const dlLabel = document.querySelector('#download .torDetInnerTop');
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = this._checkCustomSettings();
            if (MP.DEBUG)
                console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);
            // Only run the code if the ratio exists
            if (rNew && rCur) {
                const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
                if (MP.DEBUG)
                    console.log(`Current ${Util.extractFloat(rCur)[0]} | New ${Util.extractFloat(rNew)[0]} | Dif ${rDiff}`);
                // Only activate if a ratio change is expected
                if (!isNaN(rDiff) && rDiff > 0.009) {
                    if (!seeding && dlLabel) {
                        // if NOT already seeding or downloading
                        dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                        dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                    }
                    if (dlBtn && dlLabel) {
                        // This is the "trivial ratio loss" threshold
                        // These changes will always happen if the ratio conditions are met
                        if (rDiff > r1) {
                            dlBtn.style.backgroundColor = 'SpringGreen';
                            dlBtn.style.color = 'black';
                        }
                        // This is the "I never want to dl w/o FL" threshold
                        // This also uses the Minimum Ratio, if enabled
                        // TODO: Replace disable button with buy FL button
                        if (rDiff > r3 ||
                            Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val')) {
                            dlBtn.style.backgroundColor = 'Red';
                            ////Disable link to prevent download
                            //// dlBtn.style.pointerEvents = 'none';
                            dlBtn.style.cursor = 'no-drop';
                            // maybe hide the button, and add the Ratio Loss warning in its place?
                            dlBtn.innerHTML = 'FL Recommended';
                            dlLabel.style.fontWeight = 'bold';
                            // This is the "I need to think about using a FL" threshold
                        }
                        else if (rDiff > r2) {
                            dlBtn.style.backgroundColor = 'Orange';
                        }
                    }
                }
            }
        });
    }
    _checkCustomSettings() {
        let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
        let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
        let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));
        if (isNaN(l3))
            l3 = 1;
        if (isNaN(l2))
            l2 = 2 / 3;
        if (isNaN(l1))
            l1 = 1 / 3;
        // If someone put things in a dumb order, ignore smaller numbers
        if (l2 > l3)
            l2 = l3;
        if (l1 > l2)
            l1 = l2;
        // If custom numbers are smaller than default values, ignore the lower warning
        if (isNaN(l2))
            l2 = l3 < 2 / 3 ? l3 : 2 / 3;
        if (isNaN(l1))
            l1 = l2 < 1 / 3 ? l2 : 1 / 3;
        return [l1, l2, l3];
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Low ratio protection amount
 */
class RatioProtectL1 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL1',
            tag: 'Ratio Warn L1',
            placeholder: 'default: 0.3',
            desc: `Set the smallest threshhold to warn of ratio changes. (<em>This is a slight color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Set custom L1 Ratio Protection!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Medium ratio protection amount
 */
class RatioProtectL2 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL2',
            tag: 'Ratio Warn L2',
            placeholder: 'default: 0.6',
            desc: `Set the median threshhold to warn of ratio changes. (<em>This is a noticeable color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Set custom L2 Ratio Protection!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * High ratio protection amount
 */
class RatioProtectL3 {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'textbox',
            title: 'ratioProtectL3',
            tag: 'Ratio Warn L3',
            placeholder: 'default: 1',
            desc: `Set the highest threshhold to warn of ratio changes. (<em>This disables download without FL use</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Set custom L2 Ratio Protection!');
    }
    get settings() {
        return this._settings;
    }
}
class RatioProtectMin {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'textbox',
            title: 'ratioProtectMin',
            scope: SettingGroup['Torrent Page'],
            tag: 'Minimum Ratio',
            placeholder: 'ex. 100',
            desc: 'Trigger the maximum warning if your ratio would drop below this number.',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#download';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Added custom minimum ratio!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * * Allows gifting of FL wedge to members through forum.
 */
class ForumFLGift {
    constructor() {
        this._settings = {
            type: 'checkbox',
            scope: SettingGroup.Forum,
            title: 'forumFLGift',
            desc: `Add a Thank button to forum posts. (<em>Sends a FL wedge</em>)`,
        };
        this._tar = '.forumLink';
        Util.startFeature(this._settings, this._tar, ['forum thread']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling Forum Gift Button...');
            //mainBody is best element with an ID I could find that is a parent to all forum posts
            const mainBody = document.querySelector('#mainBody');
            //make array of forum posts - there is only one cursor classed object per forum post, so this was best to key off of. wish there were more IDs and such used in forums
            const forumPosts = Array.prototype.slice.call(mainBody.getElementsByClassName('coltable'));
            //for each post on the page
            forumPosts.forEach((forumPost) => {
                //work our way down the structure of the HTML to get to our post
                let bottomRow = forumPost.childNodes[1];
                bottomRow = bottomRow.childNodes[4];
                bottomRow = bottomRow.childNodes[3];
                //get the ID of the forum from the custom MAM attribute
                let postID = forumPost.previousSibling.getAttribute('name');
                //mam decided to have a different structure for last forum. wish they just had IDs or something instead of all this jumping around
                if (postID === 'last') {
                    postID = (forumPost.previousSibling.previousSibling).getAttribute('name');
                }
                //create a new element for our feature
                const giftElement = document.createElement('a');
                //set same class as other objects in area for same pointer and formatting options
                giftElement.setAttribute('class', 'cursor');
                //give our element an ID for future selection as needed
                giftElement.setAttribute('id', 'mp_' + postID + '_text');
                //create new img element to lead our new feature visuals
                const giftIconGif = document.createElement('img');
                //use site freeleech gif icon for our feature
                giftIconGif.setAttribute('src', 'https://cdn.myanonamouse.net/imagebucket/108303/thank.gif');
                //make the gif icon the first child of element
                giftElement.appendChild(giftIconGif);
                //add the feature element in line with the cursor object which is the quote and report buttons at bottom
                bottomRow.appendChild(giftElement);
                //make it a button via click listener
                giftElement.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    //to avoid button triggering more than once per page load, check if already have json result
                    if (giftElement.childNodes.length <= 1) {
                        //due to lack of IDs and conflicting query selectable elements, need to jump up a few parent levels
                        const postParentNode = giftElement.parentElement.parentElement
                            .parentElement;
                        //once at parent node of the post, find the poster's user id
                        const userElem = postParentNode.querySelector(`a[href^="/u/"]`);
                        //get the URL of the post to add to message
                        const postURL = (postParentNode.querySelector(`a[href^="/f/t/"]`)).getAttribute('href');
                        //get the name of the current MAM user sending gift
                        let sender = document.getElementById('userMenu').innerText;
                        //clean up text of sender obj
                        sender = sender.substring(0, sender.indexOf(' '));
                        //get the title of the page so we can write in message
                        let forumTitle = document.title;
                        //cut down fluff from page title
                        forumTitle = forumTitle.substring(22, forumTitle.indexOf('|') - 1);
                        //get the members name for JSON string
                        const userName = userElem.innerText;
                        //URL to GET a gift result
                        let url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=sendWedge&giftTo=${userName}&message=${sender} wants to thank you for your contribution to the forum topic [url=https://myanonamouse.net${postURL}]${forumTitle}[/url]`;
                        //make # URI compatible
                        url = url.replace('#', '%23');
                        //use MAM+ json get utility to process URL and return results
                        const jsonResult = yield Util.getJSON(url);
                        if (MP.DEBUG)
                            console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //add the feature text to show success
                            giftElement.appendChild(document.createTextNode('FL Gift Successful!'));
                            //based on failure, add feature text to show failure reason or generic
                        }
                        else if (JSON.parse(jsonResult).error ===
                            'You can only send a user one wedge per day.') {
                            giftElement.appendChild(document.createTextNode('Failed: Already Gifted This User Today!'));
                        }
                        else if (JSON.parse(jsonResult).error ===
                            'Invalid user, this user is not currently accepting wedges') {
                            giftElement.appendChild(document.createTextNode('Failed: This User Does Not Accept Gifts!'));
                        }
                        else {
                            //only known example of this 'other' is when gifting yourself
                            giftElement.appendChild(document.createTextNode('FL Gift Failed!'));
                        }
                    }
                }), false);
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Process & return information from the shoutbox
 */
class ProcessShouts {
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param names (Optional) List of usernames/IDs to filter for
     * @param usertype (Optional) What filter the names are for. Required if `names` is provided
     */
    static watchShoutbox(tar, names, usertype) {
        // Observe the shoutbox
        Check.elemObserver(tar, (mutList) => {
            // When the shoutbox updates, process the information
            mutList.forEach((mutRec) => {
                // Get the changed nodes
                mutRec.addedNodes.forEach((node) => {
                    const nodeData = Util.nodeToElem(node);
                    // If the node is added by MAM+ for gift button, ignore
                    // Also ignore if the node is a date break
                    if (/^mp_/.test(nodeData.getAttribute('id')) ||
                        nodeData.classList.contains('dateBreak')) {
                        return;
                    }
                    // If we're looking for specific users...
                    if (names !== undefined && names.length > 0) {
                        if (usertype === undefined) {
                            throw new Error('Usertype must be defined if filtering names!');
                        }
                        // Extract
                        const userID = this.extractFromShout(node, 'a[href^="/u/"]', 'href');
                        const userName = this.extractFromShout(node, 'a > span', 'text');
                        // Filter
                        names.forEach((name) => {
                            if (`/u/${name}` === userID ||
                                Util.caselessStringMatch(name, userName)) {
                                this.styleShout(node, usertype);
                            }
                        });
                    }
                });
            });
        }, { childList: true });
    }
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param buttons Number to represent checkbox selections 1 = Reply, 2 = Reply With Quote
     * @param charLimit Number of characters to include in quote, , charLimit?:number - Currently unused
     */
    static watchShoutboxReply(tar, buttons) {
        if (MP.DEBUG)
            console.log('watchShoutboxReply(', tar, buttons, ')');
        const _getRawColor = (elem) => {
            if (elem.style.backgroundColor) {
                return elem.style.backgroundColor;
            }
            else if (elem.style.color) {
                return elem.style.color;
            }
            else {
                return null;
            }
        };
        const _getNameColor = (elem) => {
            if (elem) {
                const rawColor = _getRawColor(elem);
                if (rawColor) {
                    // Convert to hex
                    const rgb = Util.bracketContents(rawColor).split(',');
                    return Util.rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
                }
                else {
                    return null;
                }
            }
            else {
                throw new Error(`Element is null!\n${elem}`);
            }
        };
        const _makeNameTag = (name, hex) => {
            if (!hex) {
                return `@[i]${name}[/i]`;
            }
            else {
                return `@[color=${hex}][i]${name}[/i][/color]`;
            }
        };
        // Get the reply box
        const replyBox = document.getElementById('shbox_text');
        // Observe the shoutbox
        Check.elemObserver(tar, (mutList) => {
            // When the shoutbox updates, process the information
            mutList.forEach((mutRec) => {
                // Get the changed nodes
                mutRec.addedNodes.forEach((node) => {
                    const nodeData = Util.nodeToElem(node);
                    // If the node is added by MAM+ for gift button, ignore
                    // Also ignore if the node is a date break
                    if (/^mp_/.test(nodeData.getAttribute('id')) ||
                        nodeData.classList.contains('dateBreak')) {
                        return;
                    }
                    // Select the name information
                    const shoutName = Util.nodeToElem(node).querySelector('a[href^="/u/"] span');
                    // Grab the background color of the name, or text color
                    const nameColor = _getNameColor(shoutName);
                    //extract the username from node for use in reply
                    const userName = this.extractFromShout(node, 'a > span', 'text');
                    //create a span element to be body of button added to page - button uses relative node context at click time to do calculations
                    const replyButton = document.createElement('span');
                    //if this is a ReplySimple request, then create Reply Simple button
                    if (buttons === 1) {
                        //create button with onclick action of setting sb text field to username with potential color block with a colon and space to reply, focus cursor in text box
                        replyButton.innerHTML = '<button>\u293a</button>';
                        replyButton
                            .querySelector('button')
                            .addEventListener('click', () => {
                            // Add the styled name tag to the reply box
                            // If nothing was in the reply box, add a colon
                            if (replyBox.value === '') {
                                replyBox.value = `${_makeNameTag(userName, nameColor)}: `;
                            }
                            else {
                                replyBox.value = `${replyBox.value} ${_makeNameTag(userName, nameColor)} `;
                            }
                            replyBox.focus();
                        });
                    }
                    //if this is a replyQuote request, then create reply quote button
                    else if (buttons === 2) {
                        //create button with onclick action of getting that line's text, stripping down to 65 char with no word break, then insert into SB text field, focus cursor in text box
                        replyButton.innerHTML = '<button>\u293d</button>';
                        replyButton
                            .querySelector('button')
                            .addEventListener('click', () => {
                            const text = this.quoteShout(node, 65);
                            // Add quote to reply box
                            replyBox.value = `${_makeNameTag(userName, nameColor)}: \u201c[i]${text}[/i]\u201d `;
                            replyBox.focus();
                        });
                    }
                    //give span an ID for potential use later
                    replyButton.setAttribute('class', 'mp_replyButton');
                    //insert button prior to username or another button
                    node.insertBefore(replyButton, node.childNodes[2]);
                });
            });
        }, { childList: true });
    }
    static quoteShout(shout, length) {
        const textArr = [];
        // Get number of reply buttons to remove from text
        const btnCount = shout.firstChild.parentElement.querySelectorAll('.mp_replyButton').length;
        // Get the text of all child nodes
        shout.childNodes.forEach((child) => {
            // Links aren't clickable anyway so get rid of them
            if (child.nodeName === 'A') {
                textArr.push('[Link]');
            }
            else {
                textArr.push(child.textContent);
            }
        });
        // Make a string, but toss out the first few nodes
        let nodeText = textArr.slice(3 + btnCount).join('');
        if (nodeText.indexOf(':') === 0) {
            nodeText = nodeText.substr(2);
        }
        // At this point we should have just the message text.
        // Remove any quotes that might be contained:
        nodeText = nodeText.replace(/\u{201c}(.*?)\u{201d}/gu, '');
        // Trim the text to a max length and add ... if shortened
        let trimmedText = Util.trimString(nodeText.trim(), length);
        if (trimmedText !== nodeText.trim()) {
            trimmedText += ' [\u2026]';
        }
        // Done!
        return trimmedText;
    }
    /**
     * Extract information from shouts
     * @param shout The node containing shout info
     * @param tar The element selector string
     * @param get The requested info (href or text)
     * @returns The string that was specified
     */
    static extractFromShout(shout, tar, get) {
        const nodeData = Util.nodeToElem(shout).classList.contains('dateBreak');
        if (shout !== null && !nodeData) {
            const shoutElem = Util.nodeToElem(shout).querySelector(tar);
            if (shoutElem !== null) {
                let extracted;
                if (get !== 'text') {
                    extracted = shoutElem.getAttribute(get);
                }
                else {
                    extracted = shoutElem.textContent;
                }
                if (extracted !== null) {
                    return extracted;
                }
                else {
                    throw new Error('Could not extract shout! Attribute was null');
                }
            }
            else {
                throw new Error('Could not extract shout! Element was null');
            }
        }
        else {
            throw new Error('Could not extract shout! Node was null');
        }
    }
    /**
     * Change the style of a shout based on filter lists
     * @param shout The node containing shout info
     * @param usertype The type of users that have been filtered
     */
    static styleShout(shout, usertype) {
        const shoutElem = Util.nodeToElem(shout);
        if (usertype === 'priority') {
            const customStyle = GM_getValue('priorityStyle_val');
            if (customStyle) {
                shoutElem.style.background = `hsla(${customStyle})`;
            }
            else {
                shoutElem.style.background = 'hsla(0,0%,50%,0.3)';
            }
        }
        else if (usertype === 'mute') {
            shoutElem.classList.add('mp_muted');
        }
    }
}
class PriorityUsers {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'priorityUsers',
            tag: 'Emphasize Users',
            placeholder: 'ex. system, 25420, 77618',
            desc: 'Emphasizes messages from the listed users in the shoutbox. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)',
        };
        this._tar = '.sbf div';
        this._priorityUsers = [];
        this._userType = 'priority';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gmValue = GM_getValue(`${this.settings.title}_val`);
            if (gmValue !== undefined) {
                this._priorityUsers = yield Util.csvToArray(gmValue);
            }
            else {
                throw new Error('Userlist is not defined!');
            }
            ProcessShouts.watchShoutbox(this._tar, this._priorityUsers, this._userType);
            console.log(`[M+] Highlighting users in the shoutbox...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to priority users
 */
class PriorityStyle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'priorityStyle',
            tag: 'Emphasis Style',
            placeholder: 'default: 0, 0%, 50%, 0.3',
            desc: `Change the color/opacity of the highlighting rule for emphasized users' posts. (<em>This is formatted as Hue (0-360), Saturation (0-100%), Lightness (0-100%), Opacity (0-1)</em>)`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Setting custom highlight for priority users...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows a custom background to be applied to desired muted users
 */
class MutedUsers {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'textbox',
            title: 'mutedUsers',
            tag: 'Mute users',
            placeholder: 'ex. 1234, gardenshade',
            desc: `Obscures messages from the listed users in the shoutbox until hovered. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)`,
        };
        this._tar = '.sbf div';
        this._mutedUsers = [];
        this._userType = 'mute';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gmValue = GM_getValue(`${this.settings.title}_val`);
            if (gmValue !== undefined) {
                this._mutedUsers = yield Util.csvToArray(gmValue);
            }
            else {
                throw new Error('Userlist is not defined!');
            }
            ProcessShouts.watchShoutbox(this._tar, this._mutedUsers, this._userType);
            console.log(`[M+] Obscuring muted users...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Gift button to be added to Shout Triple dot menu
 */
class GiftButton {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'giftButton',
            desc: `Places a Gift button in Shoutbox dot-menu`,
        };
        this._tar = '.sbf';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Initialized Gift Button.`);
            const sbfDiv = document.getElementById('sbf');
            const sbfDivChild = sbfDiv.firstChild;
            //add event listener for whenever something is clicked in the sbf div
            sbfDiv.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                //pull the event target into an HTML Element
                const target = e.target;
                //add the Triple Dot Menu as an element
                const sbMenuElem = target.closest('.sb_menu');
                //find the message div
                const sbMenuParent = target.closest(`div`);
                //get the full text of the message div
                let giftMessage = sbMenuParent.innerText;
                //format message with standard text + message contents + server time of the message
                giftMessage =
                    `Sent on Shoutbox message: "` +
                        giftMessage.substring(giftMessage.indexOf(': ') + 2) +
                        `" at ` +
                        giftMessage.substring(0, 8);
                //if the target of the click is not the Triple Dot Menu OR
                //if menu is one of your own comments (only works for first 10 minutes of comment being sent)
                if (!target.closest('.sb_menu') ||
                    sbMenuElem.getAttribute('data-ee') === '1') {
                    return;
                }
                //get the Menu after it pops up
                console.log(`[M+] Adding Gift Button...`);
                const popupMenu = document.getElementById('sbMenuMain');
                do {
                    yield Util.sleep(5);
                } while (!popupMenu.hasChildNodes());
                //get the user details from the popup menu details
                const popupUser = Util.nodeToElem(popupMenu.childNodes[0]);
                //make username equal the data-uid, force not null
                const userName = popupUser.getAttribute('data-uid');
                //get the default value of gifts set in preferences for user page
                let giftValueSetting = GM_getValue('userGiftDefault_val');
                //if they did not set a value in preferences, set to 100
                if (!giftValueSetting) {
                    giftValueSetting = '100';
                }
                else if (Number(giftValueSetting) > 1000 ||
                    isNaN(Number(giftValueSetting))) {
                    giftValueSetting = '1000';
                }
                else if (Number(giftValueSetting) < 5) {
                    giftValueSetting = '5';
                }
                //create the HTML document that holds the button and value text
                const giftButton = document.createElement('span');
                giftButton.setAttribute('id', 'giftButton');
                //create the button element as well as a text element for value of gift. Populate with value from settings
                giftButton.innerHTML = `<button>Gift: </button><span>&nbsp;</span><input type="text" size="3" id="mp_giftValue" title="Value between 5 and 1000" value="${giftValueSetting}">`;
                //add gift element with button and text to the menu
                popupMenu.childNodes[0].appendChild(giftButton);
                //add event listener for when gift button is clicked
                giftButton.querySelector('button').addEventListener('click', () => {
                    //pull whatever the final value of the text box equals
                    const giftFinalAmount = (document.getElementById('mp_giftValue')).value;
                    //begin setting up the GET request to MAM JSON
                    const giftHTTP = new XMLHttpRequest();
                    //URL to GET results with the amount entered by user plus the username found on the menu selected
                    //added message contents encoded to prevent unintended characters from breaking JSON URL
                    const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}&message=${encodeURIComponent(giftMessage)}`;
                    giftHTTP.open('GET', url, true);
                    giftHTTP.setRequestHeader('Content-Type', 'application/json');
                    giftHTTP.onreadystatechange = function () {
                        if (giftHTTP.readyState === 4 && giftHTTP.status === 200) {
                            const json = JSON.parse(giftHTTP.responseText);
                            //create a new line in SB that shows gift was successful to acknowledge gift worked/failed
                            const newDiv = document.createElement('div');
                            newDiv.setAttribute('id', 'mp_giftStatusElem');
                            sbfDivChild.appendChild(newDiv);
                            //if the gift succeeded
                            if (json.success) {
                                const successMsg = document.createTextNode('Points Gift Successful: Value: ' + giftFinalAmount);
                                newDiv.appendChild(successMsg);
                                newDiv.classList.add('mp_success');
                            }
                            else {
                                const failedMsg = document.createTextNode('Points Gift Failed: Error: ' + json.error);
                                newDiv.appendChild(failedMsg);
                                newDiv.classList.add('mp_fail');
                            }
                            //after we add line in SB, scroll to bottom to show result
                            sbfDiv.scrollTop = sbfDiv.scrollHeight;
                        }
                        //after we add line in SB, scroll to bottom to show result
                        sbfDiv.scrollTop = sbfDiv.scrollHeight;
                    };
                    giftHTTP.send();
                    //return to main SB window after gift is clicked - these are two steps taken by MAM when clicking out of Menu
                    sbfDiv
                        .getElementsByClassName('sb_clicked_row')[0]
                        .removeAttribute('class');
                    document
                        .getElementById('sbMenuMain')
                        .setAttribute('class', 'sbBottom hideMe');
                });
                giftButton.querySelector('input').addEventListener('input', () => {
                    const valueToNumber = (document.getElementById('mp_giftValue')).value;
                    if (Number(valueToNumber) > 1000 ||
                        Number(valueToNumber) < 5 ||
                        isNaN(Number(valueToNumber))) {
                        giftButton.querySelector('button').disabled = true;
                    }
                    else {
                        giftButton.querySelector('button').disabled = false;
                    }
                });
                console.log(`[M+] Gift Button added!`);
            }));
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Reply button to be added to Shout
 */
class ReplySimple {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'replySimple',
            //tag: "Reply",
            desc: `Places a Reply button in Shoutbox: &#10554;`,
        };
        this._tar = '.sbf div';
        this._replySimple = 1;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replySimple);
            console.log(`[M+] Adding Reply Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Allows Reply With Quote button to be added to Shout
 */
class ReplyQuote {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'replyQuote',
            //tag: "Reply With Quote",
            desc: `Places a Reply with Quote button in Shoutbox: &#10557;`,
        };
        this._tar = '.sbf div';
        this._replyQuote = 2;
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            ProcessShouts.watchShoutboxReply(this._tar, this._replyQuote);
            console.log(`[M+] Adding Reply with Quote Button...`);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Creates feature for building a library of quick shout items that can act as a copy/paste replacement.
 */
class QuickShout {
    constructor() {
        this._settings = {
            scope: SettingGroup.Shoutbox,
            type: 'checkbox',
            title: 'quickShout',
            desc: `Create feature below shoutbox to store pre-set messages.`,
        };
        this._tar = '.sbf div';
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Adding Quick Shout Buttons...`);
            //get the main shoutbox input field
            const replyBox = document.getElementById('shbox_text');
            //empty JSON was giving me issues, so decided to just make an intro for when the GM variable is empty
            let jsonList = JSON.parse(`{ "Intro":"Welcome to QuickShout MAM+er! Here you can create preset Shout messages for quick responses and knowledge sharing. 'Clear' clears the entry to start selection process over. 'Select' takes whatever QuickShout is in the TextArea and puts in your Shout response area. 'Save' will store the Selection Name and Text Area Combo for future use as a QuickShout, and has color indicators. Green = saved as-is. Yellow = QuickShout Name exists and is saved, but content does not match what is stored. Orange = no entry matching that name, not saved. 'Delete' will permanently remove that entry from your stored QuickShouts (button only shows when exists in storage). For new entries have your QuickShout Name typed in BEFORE you craft your text or risk it being overwritten by something that exists as you type it. Thanks for using MAM+!" }`);
            //get Shoutbox DIV
            const shoutBox = document.getElementById('fpShout');
            //get the footer where we will insert our feature
            const shoutFoot = shoutBox.querySelector('.blockFoot');
            //give it an ID and set the size
            shoutFoot.setAttribute('id', 'mp_blockFoot');
            shoutFoot.style.height = '2.5em';
            //create a new dive to hold our comboBox and buttons and set the style for formatting
            const comboBoxDiv = document.createElement('div');
            comboBoxDiv.style.float = 'left';
            comboBoxDiv.style.marginLeft = '1em';
            comboBoxDiv.style.marginBottom = '.5em';
            comboBoxDiv.style.marginTop = '.5em';
            //create the label text element and add the text and attributes for ID
            const comboBoxLabel = document.createElement('label');
            comboBoxLabel.setAttribute('for', 'quickShoutData');
            comboBoxLabel.innerText = 'Choose a QuickShout';
            comboBoxLabel.setAttribute('id', 'mp_comboBoxLabel');
            //create the input field to link to datalist and format style
            const comboBoxInput = document.createElement('input');
            comboBoxInput.style.marginLeft = '.5em';
            comboBoxInput.setAttribute('list', 'mp_comboBoxList');
            comboBoxInput.setAttribute('id', 'mp_comboBoxInput');
            //create a datalist to store our quickshouts
            const comboBoxList = document.createElement('datalist');
            comboBoxList.setAttribute('id', 'mp_comboBoxList');
            //if the GM variable exists
            if (GM_getValue('mp_quickShout')) {
                //overwrite jsonList variable with parsed data
                jsonList = JSON.parse(GM_getValue('mp_quickShout'));
                //for each key item
                Object.keys(jsonList).forEach((key) => {
                    //create a new Option element and add our data for display to user
                    const comboBoxOption = document.createElement('option');
                    comboBoxOption.value = key.replace(/ಠ/g, ' ');
                    comboBoxList.appendChild(comboBoxOption);
                });
                //if no GM variable
            }
            else {
                //create variable with out Intro data
                GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                //for each key item
                // TODO: probably can get rid of the forEach and just do single execution since we know this is Intro only
                Object.keys(jsonList).forEach((key) => {
                    const comboBoxOption = document.createElement('option');
                    comboBoxOption.value = key.replace(/ಠ/g, ' ');
                    comboBoxList.appendChild(comboBoxOption);
                });
            }
            //append the above elements to our DIV for the combo box
            comboBoxDiv.appendChild(comboBoxLabel);
            comboBoxDiv.appendChild(comboBoxInput);
            comboBoxDiv.appendChild(comboBoxList);
            //create the clear button and add style
            const clearButton = document.createElement('button');
            clearButton.style.marginLeft = '1em';
            clearButton.innerHTML = 'Clear';
            //create delete button, add style, and then hide it for later use
            const deleteButton = document.createElement('button');
            deleteButton.style.marginLeft = '6em';
            deleteButton.style.display = 'none';
            deleteButton.style.backgroundColor = 'Red';
            deleteButton.innerHTML = 'DELETE';
            //create select button and style it
            const selectButton = document.createElement('button');
            selectButton.style.marginLeft = '1em';
            selectButton.innerHTML = 'Select';
            //create save button and style it
            const saveButton = document.createElement('button');
            saveButton.style.marginLeft = '1em';
            saveButton.innerHTML = 'Save';
            //add all 4 buttons to the comboBox DIV
            comboBoxDiv.appendChild(clearButton);
            comboBoxDiv.appendChild(selectButton);
            comboBoxDiv.appendChild(saveButton);
            comboBoxDiv.appendChild(deleteButton);
            //create our text area and style it, then hide it
            const quickShoutText = document.createElement('textarea');
            quickShoutText.style.height = '50%';
            quickShoutText.style.margin = '1em';
            quickShoutText.style.width = '97%';
            quickShoutText.id = 'mp_quickShoutText';
            quickShoutText.style.display = 'none';
            //executes when clicking select button
            selectButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if there is something inside of the quickshout area
                if (quickShoutText.value) {
                    //put the text in the main site reply field and focus on it
                    replyBox.value = quickShoutText.value;
                    replyBox.focus();
                }
            }), false);
            //create a quickShout delete button
            deleteButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if this is not the last quickShout
                if (Object.keys(jsonList).length > 1) {
                    //delete the entry from the JSON and update the GM variable with new json list
                    delete jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')];
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                    //delete the options from datalist to reset with newly created jsonList
                    comboBoxList.innerHTML = '';
                    //for each item in new jsonList
                    Object.keys(jsonList).forEach((key) => {
                        //new option element to add to list
                        const comboBoxOption = document.createElement('option');
                        //add the current key value to the element
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //add element to the list
                        comboBoxList.appendChild(comboBoxOption);
                    });
                    //if the last item in the jsonlist
                }
                else {
                    //delete item from jsonList
                    delete jsonList[comboBoxInput.value.replace(/ಠ/g, 'ಠ')];
                    //delete entire variable so its not empty GM variable
                    GM_deleteValue('mp_quickShout');
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                }
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            }), false);
            //create event on save button to save quickshout
            saveButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //if there is data in the key and value GUI fields, proceed
                if (quickShoutText.value && comboBoxInput.value) {
                    //was having issue with eval processing the .replace data so made a variable to intake it
                    const replacedText = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //fun way to dynamically create statements - this takes whatever is in list field to create a key with that text and the value from the textarea
                    eval(`jsonList.` + replacedText + `= "` + quickShoutText.value + `";`);
                    //overwrite or create the GM variable with new jsonList
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style save button to green now that its saved as-is
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //show delete button now that its a saved entry
                    deleteButton.style.display = '';
                    //delete existing datalist elements to rebuild with new jsonlist
                    comboBoxList.innerHTML = '';
                    //for each key in the jsonlist
                    Object.keys(jsonList).forEach((key) => {
                        //create new option element
                        const comboBoxOption = document.createElement('option');
                        //add key name to the option
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //TODO: this may or may not be necessary, but was having issues with the unique symbol still randomly showing up after saves
                        comboBoxOption.value = comboBoxOption.value.replace(/ಠ/g, ' ');
                        //add to the list
                        comboBoxList.appendChild(comboBoxOption);
                    });
                }
            }), false);
            //add event for clear button to reset the datalist
            clearButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                //clear the input field and textarea field
                comboBoxInput.value = '';
                quickShoutText.value = '';
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            }), false);
            //Next two input functions are meat and potatoes of the logic for user functionality
            //whenever something is typed or changed whithin the input field
            comboBoxInput.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
                //if input is blank
                if (!comboBoxInput.value) {
                    //if the textarea is also blank minimize real estate
                    if (!quickShoutText.value) {
                        //hide the text area
                        quickShoutText.style.display = 'none';
                        //shrink the footer
                        shoutFoot.style.height = '2.5em';
                        //re-style the save button to default
                        saveButton.style.backgroundColor = '';
                        saveButton.style.color = '';
                        //if something is still in the textarea we need to indicate that unsaved and unnamed data is there
                    }
                    else {
                        //style for unsaved and unnamed is organge save button
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                    }
                    //either way, hide the delete button
                    deleteButton.style.display = 'none';
                }
                //if the input field has any text in it
                else {
                    //show the text area for input
                    quickShoutText.style.display = '';
                    //expand the footer to accomodate all feature aspects
                    shoutFoot.style.height = '11em';
                    //if what is in the input field is a saved entry key
                    if (jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')]) {
                        //this can be a sucky line of code because it can wipe out unsaved data, but i cannot think of better way
                        //replace the text area contents with what the value is in the matched pair
                        quickShoutText.value =
                            jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')];
                        //show the delete button since this is now exact match to saved entry
                        deleteButton.style.display = '';
                        //restyle save button to show its a saved combo
                        saveButton.style.backgroundColor = 'Green';
                        saveButton.style.color = '';
                        //if this is not a registered key name
                    }
                    else {
                        //restyle the save button to be an unsaved entry
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                        //hide the delete button since this cannot be saved
                        deleteButton.style.display = 'none';
                    }
                }
            }), false);
            //whenever something is typed or deleted out of textarea
            quickShoutText.addEventListener('input', () => __awaiter(this, void 0, void 0, function* () {
                //if the input field is blank
                if (!comboBoxInput.value) {
                    //restyle save button for unsaved and unnamed
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    //hide delete button
                    deleteButton.style.display = 'none';
                }
                //if input field has text in it
                else if (jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')] &&
                    quickShoutText.value !==
                        jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')]) {
                    //restyle save button as yellow for editted
                    saveButton.style.backgroundColor = 'Yellow';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = '';
                    //if the key is a match and the data is a match then we have a 100% saved entry and can put everything back to saved
                }
                else if (jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')] &&
                    quickShoutText.value ===
                        jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')]) {
                    //restyle save button to green for saved
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    deleteButton.style.display = '';
                    //if the key is not found in the saved list, orange for unsaved and unnamed
                }
                else if (!jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')]) {
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = 'none';
                }
            }), false);
            //add the combobox and text area elements to the footer
            shoutFoot.appendChild(comboBoxDiv);
            shoutFoot.appendChild(quickShoutText);
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/**
 * #BROWSE PAGE FEATURES
 */
/**
 * Allows Snatched torrents to be hidden/shown
 */
class ToggleSnatched {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleSnatched',
            desc: `Add a button to hide/show results that you've snatched`,
        };
        this._tar = '#ssr';
        this._isVisible = true;
        this._snatchedHook = 'td div[class^="browse"]';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggle;
            let resultList;
            let results;
            const storedState = GM_getValue(`${this._settings.title}State`);
            if (storedState === 'false' && GM_getValue('stickySnatchedToggle') === true) {
                this._setVisState(false);
            }
            else {
                this._setVisState(true);
            }
            const toggleText = this._isVisible ? 'Hide Snatched' : 'Show Snatched';
            // Queue building the button and getting the results
            yield Promise.all([
                (toggle = Util.createButton('snatchedToggle', toggleText, 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton')),
                (resultList = this._share.getSearchList()),
            ]);
            toggle
                .then((btn) => {
                // Update based on vis state
                btn.addEventListener('click', () => {
                    if (this._isVisible === true) {
                        btn.innerHTML = 'Show Snatched';
                        this._setVisState(false);
                    }
                    else {
                        btn.innerHTML = 'Hide Snatched';
                        this._setVisState(true);
                    }
                    this._filterResults(results, this._snatchedHook);
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._snatchedHook);
                console.log('[M+] Added the Toggle Snatched button!');
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        results = res;
                        this._searchList = res;
                        this._filterResults(results, this._snatchedHook);
                    }));
                });
            });
        });
    }
    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    _filterResults(list, subTar) {
        list.forEach((snatch) => {
            const btn = (document.querySelector('#mp_snatchedToggle'));
            // Select only the items that match our sub element
            const result = snatch.querySelector(subTar);
            if (result !== null) {
                // Hide/show as required
                if (this._isVisible === false) {
                    btn.innerHTML = 'Show Snatched';
                    snatch.style.display = 'none';
                }
                else {
                    btn.innerHTML = 'Hide Snatched';
                    snatch.style.display = 'table-row';
                }
            }
        });
    }
    _setVisState(val) {
        if (MP.DEBUG) {
            console.log('Snatch vis state:', this._isVisible, '\nval:', val);
        }
        GM_setValue(`${this._settings.title}State`, `${val}`);
        this._isVisible = val;
    }
    get settings() {
        return this._settings;
    }
    get searchList() {
        if (this._searchList === undefined) {
            throw new Error('searchlist is undefined');
        }
        return this._searchList;
    }
    get visible() {
        return this._isVisible;
    }
    set visible(val) {
        this._setVisState(val);
    }
}
/**
 * Remembers the state of ToggleSnatched between page loads
 */
class StickySnatchedToggle {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'stickySnatchedToggle',
            desc: `Make toggle state persist between page loads`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Remembered snatch visibility state!');
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Generate a plaintext list of search results
 */
class PlaintextSearch {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'plaintextSearch',
            desc: `Insert plaintext search results at top of page`,
        };
        this._tar = '#ssr h1';
        this._isOpen = GM_getValue(`${this._settings.title}State`);
        this._share = new Shared();
        this._plainText = '';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggleBtn;
            let copyBtn;
            let resultList;
            // Queue building the toggle button and getting the results
            yield Promise.all([
                (toggleBtn = Util.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr', 'beforebegin', 'mp_toggle mp_plainBtn')),
                (resultList = this._share.getSearchList()),
            ]);
            // Process the results into plaintext
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                // Build the copy button
                copyBtn = yield Util.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');
                // Build the plaintext box
                copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
                // Insert plaintext results
                this._plainText = yield this._processResults(res);
                document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch').innerHTML = '';
                    resultList = this._share.getSearchList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        // Insert plaintext results
                        this._plainText = yield this._processResults(res);
                        document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                    }));
                });
            });
            // Init open state
            this._setOpenState(this._isOpen);
            // Set up toggle button functionality
            toggleBtn
                .then((btn) => {
                btn.addEventListener('click', () => {
                    // Textbox should exist, but just in case...
                    const textbox = document.querySelector('.mp_plaintextSearch');
                    if (textbox === null) {
                        throw new Error(`textbox doesn't exist!`);
                    }
                    else if (this._isOpen === 'false') {
                        this._setOpenState('true');
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    }
                    else {
                        this._setOpenState('false');
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            console.log('[M+] Inserted plaintext search results!');
        });
    }
    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    _setOpenState(val) {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }
    _processResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            let outp = '';
            results.forEach((node) => {
                // Reset each text field
                let title = '';
                let seriesTitle = '';
                let authTitle = '';
                let narrTitle = '';
                // Break out the important data from each node
                const rawTitle = node.querySelector('.torTitle');
                const seriesList = node.querySelectorAll('.series');
                const authList = node.querySelectorAll('.author');
                const narrList = node.querySelectorAll('.narrator');
                if (rawTitle === null) {
                    console.warn('Error Node:', node);
                    throw new Error(`Result title should not be null`);
                }
                else {
                    title = rawTitle.textContent.trim();
                }
                // Process series
                if (seriesList !== null && seriesList.length > 0) {
                    seriesList.forEach((series) => {
                        seriesTitle += `${series.textContent} / `;
                    });
                    // Remove trailing slash from last series, then style
                    seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                    seriesTitle = ` (${seriesTitle})`;
                }
                // Process authors
                if (authList !== null && authList.length > 0) {
                    authTitle = 'BY ';
                    authList.forEach((auth) => {
                        authTitle += `${auth.textContent} AND `;
                    });
                    // Remove trailing AND
                    authTitle = authTitle.substring(0, authTitle.length - 5);
                }
                // Process narrators
                if (narrList !== null && narrList.length > 0) {
                    narrTitle = 'FT ';
                    narrList.forEach((narr) => {
                        narrTitle += `${narr.textContent} AND `;
                    });
                    // Remove trailing AND
                    narrTitle = narrTitle.substring(0, narrTitle.length - 5);
                }
                outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
            });
            return outp;
        });
    }
    get settings() {
        return this._settings;
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(val) {
        this._setOpenState(val);
    }
}
/**
 * Allows the search features to be hidden/shown
 */
class ToggleSearchbox {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'toggleSearchbox',
            desc: `Collapse the Search box and make it toggleable`,
        };
        this._tar = '#torSearchControl';
        this._height = '26px';
        this._isOpen = 'false';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const searchbox = document.querySelector(this._tar);
            if (searchbox) {
                // Adjust the title to make it clear it is a toggle button
                const title = searchbox.querySelector('.blockHeadCon h4');
                if (title) {
                    // Adjust text & style
                    title.innerHTML = 'Toggle Search';
                    title.style.cursor = 'pointer';
                    // Set up click listener
                    title.addEventListener('click', () => {
                        this._toggle(searchbox);
                    });
                }
                else {
                    console.error('Could not set up toggle! Target does not exist');
                }
                // Collapse the searchbox
                Util.setAttr(searchbox, {
                    style: `height:${this._height};overflow:hidden;`,
                });
                // Hide extra text
                const notification = document.querySelector('#mainBody > h3');
                const guideLink = document.querySelector('#mainBody > h3 ~ a');
                if (notification)
                    notification.style.display = 'none';
                if (guideLink)
                    guideLink.style.display = 'none';
                console.log('[M+] Collapsed the Search box!');
            }
            else {
                console.error('Could not collapse Search box! Target does not exist');
            }
        });
    }
    _toggle(elem) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isOpen === 'false') {
                elem.style.height = 'unset';
                this._isOpen = 'true';
            }
            else {
                elem.style.height = this._height;
                this._isOpen = 'false';
            }
            if (MP.DEBUG)
                console.log('Toggled Search box!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generates linked tags from the site's plaintext tag field
 */
class BuildTags {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'buildTags',
            desc: `Generate clickable Tags automatically`,
        };
        this._tar = '#ssr';
        this._share = new Shared();
        /**
         * * Code to run for every search result
         * @param res A search result row
         */
        this._processTagString = (res) => {
            const tagline = res.querySelector('.torRowDesc');
            if (MP.DEBUG)
                console.group(tagline);
            // Assume brackets contain tags
            let tagString = tagline.innerHTML.replace(/(?:\[|\]|\(|\)|$)/gi, ',');
            // Remove HTML Entities and turn them into breaks
            tagString = tagString.split(/(?:&.{1,5};)/g).join(';');
            // Split tags at ',' and ';' and '>' and '|'
            let tags = tagString.split(/\s*(?:;|,|>|\||$)\s*/);
            // Remove empty or long tags
            tags = tags.filter((tag) => tag.length <= 30 && tag.length > 0);
            // Are tags already added? Only add if null
            const tagBox = res.querySelector('.mp_tags');
            if (tagBox === null) {
                this._injectLinks(tags, tagline);
            }
            if (MP.DEBUG) {
                console.log(tags);
                console.groupEnd();
            }
        };
        /**
         * * Injects the generated tags
         * @param tags Array of tags to add
         * @param tar The search result row that the tags will be added to
         */
        this._injectLinks = (tags, tar) => {
            if (tags.length > 0) {
                // Insert the new tag row
                const tagRow = document.createElement('span');
                tagRow.classList.add('mp_tags');
                tar.insertAdjacentElement('beforebegin', tagRow);
                tar.style.display = 'none';
                tagRow.insertAdjacentElement('afterend', document.createElement('br'));
                // Add the tags to the tag row
                tags.forEach((tag) => {
                    tagRow.innerHTML += `<a class='mp_tag' href='/tor/browse.php?tor%5Btext%5D=%22${encodeURIComponent(tag)}%22&tor%5BsrchIn%5D%5Btags%5D=true'>${tag}</a>`;
                });
            }
        };
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultsList = this._share.getSearchList();
            // Build the tags
            resultsList
                .then((results) => {
                results.forEach((r) => this._processTagString(r));
                console.log('[M+] Built tag links!');
            })
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    resultsList = this._share.getSearchList();
                    resultsList.then((results) => {
                        // Build the tags again
                        results.forEach((r) => this._processTagString(r));
                        console.log('[M+] Built tag links!');
                    });
                });
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * Random Book feature to open a new tab/window with a random MAM Book
 */
class RandomBook {
    constructor() {
        this._settings = {
            scope: SettingGroup.Search,
            type: 'checkbox',
            title: 'randomBook',
            desc: `Add a button to open a randomly selected book page. (<em>Uses the currently selected category in the dropdown</em>)`,
        };
        this._tar = '#ssr';
        Util.startFeature(this._settings, this._tar, ['browse']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let rando;
            const randoText = 'Random Book';
            // Queue building the button and getting the results
            yield Promise.all([
                (rando = Util.createButton('randomBook', randoText, 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton')),
            ]);
            rando
                .then((btn) => {
                btn.addEventListener('click', () => {
                    let countResult;
                    let categories = '';
                    //get the Category dropdown element
                    const catSelection = (document.getElementById('categoryPartial'));
                    //get the value currently selected in Category Dropdown
                    const catValue = catSelection.options[catSelection.selectedIndex].value;
                    //depending on category selected, create a category string for the JSON GET
                    switch (String(catValue)) {
                        case 'ALL':
                            categories = '';
                            break;
                        case 'defaults':
                            categories = '';
                            break;
                        case 'm13':
                            categories = '&tor[main_cat][]=13';
                            break;
                        case 'm14':
                            categories = '&tor[main_cat][]=14';
                            break;
                        case 'm15':
                            categories = '&tor[main_cat][]=15';
                            break;
                        case 'm16':
                            categories = '&tor[main_cat][]=16';
                            break;
                        default:
                            if (catValue.charAt(0) === 'c') {
                                categories = '&tor[cat][]=' + catValue.substring(1);
                            }
                    }
                    Promise.all([
                        (countResult = this._getRandomBookResults(categories)),
                    ]);
                    countResult
                        .then((getRandomResult) => {
                        //open new tab with the random book
                        window.open('https://www.myanonamouse.net/t/' + getRandomResult, '_blank');
                    })
                        .catch((err) => {
                        throw new Error(err);
                    });
                }, false);
                console.log('[M+] Added the Random Book button!');
            })
                .catch((err) => {
                throw new Error(err);
            });
        });
    }
    /**
     * Filters search results
     * @param cat a string containing the categories needed for JSON Get
     */
    _getRandomBookResults(cat) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let jsonResult;
                //URL to GET random search results
                const url = `https://www.myanonamouse.net/tor/js/loadSearchJSONbasic.php?tor[searchType]=all&tor[searchIn]=torrents${cat}&tor[perpage]=5&tor[browseFlagsHideVsShow]=0&tor[startDate]=&tor[endDate]=&tor[hash]=&tor[sortType]=random&thumbnail=true?${Util.randomNumber(1, 100000)}`;
                Promise.all([(jsonResult = Util.getJSON(url))]).then(() => {
                    jsonResult
                        .then((jsonFull) => {
                        //return the first torrent ID of the random JSON text
                        resolve(JSON.parse(jsonFull).data[0].id);
                    })
                        .catch((err) => {
                        throw new Error(err);
                    });
                });
            });
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/**
 * # REQUEST PAGE FEATURES
 */
/**
 * * Hide requesters who are set to "hidden"
 */
class ToggleHiddenRequesters {
    constructor() {
        this._settings = {
            scope: SettingGroup.Requests,
            type: 'checkbox',
            title: 'toggleHiddenRequesters',
            desc: `Hide hidden requesters`,
        };
        this._tar = '#torRows';
        this._hide = true;
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._addToggleSwitch();
            this._searchList = yield this._getRequestList();
            this._filterResults(this._searchList);
            Check.elemObserver(this._tar, () => __awaiter(this, void 0, void 0, function* () {
                this._searchList = yield this._getRequestList();
                this._filterResults(this._searchList);
            }));
        });
    }
    _addToggleSwitch() {
        // Make a new button and insert beside the Search button
        Util.createButton('showHidden', 'Show Hidden', 'div', '#requestSearch .torrentSearch', 'afterend', 'torFormButton');
        // Select the new button and add a click listener
        const toggleSwitch = (document.querySelector('#mp_showHidden'));
        toggleSwitch.addEventListener('click', () => {
            const hiddenList = document.querySelectorAll('#torRows > .mp_hidden');
            if (this._hide) {
                this._hide = false;
                toggleSwitch.innerText = 'Hide Hidden';
                hiddenList.forEach((item) => {
                    item.style.display = 'list-item';
                    item.style.opacity = '0.5';
                });
            }
            else {
                this._hide = true;
                toggleSwitch.innerText = 'Show Hidden';
                hiddenList.forEach((item) => {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                });
            }
        });
    }
    _getRequestList() {
        return new Promise((resolve, reject) => {
            // Wait for the requests to exist
            Check.elemLoad('#torRows .torRow .torRight').then(() => {
                // Grab all requests
                const reqList = document.querySelectorAll('#torRows .torRow');
                if (reqList === null || reqList === undefined) {
                    reject(`reqList is ${reqList}`);
                }
                else {
                    resolve(reqList);
                }
            });
        });
    }
    _filterResults(list) {
        list.forEach((request) => {
            const requester = request.querySelector('.torRight a');
            if (requester === null) {
                request.style.display = 'none';
                request.classList.add('mp_hidden');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Generate a plaintext list of request results
 */
class PlaintextRequest {
    constructor() {
        this._settings = {
            scope: SettingGroup.Requests,
            type: 'checkbox',
            title: 'plaintextRequest',
            desc: `Insert plaintext request results at top of request page`,
        };
        this._tar = '#ssr';
        this._isOpen = GM_getValue(`${this._settings.title}State`);
        this._plainText = '';
        this._getRequestList = () => {
            if (MP.DEBUG)
                console.log(`Shared.getSearchList( )`);
            return new Promise((resolve, reject) => {
                // Wait for the request results to exist
                Check.elemLoad('#torRows .torRow a').then(() => {
                    // Select all request results
                    const snatchList = (document.querySelectorAll('#torRows .torRow'));
                    if (snatchList === null || snatchList === undefined) {
                        reject(`snatchList is ${snatchList}`);
                    }
                    else {
                        resolve(snatchList);
                    }
                });
            });
        };
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            let toggleBtn;
            let copyBtn;
            let resultList;
            // Queue building the toggle button and getting the results
            yield Promise.all([
                (toggleBtn = Util.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr', 'beforebegin', 'mp_toggle mp_plainBtn')),
                (resultList = this._getRequestList()),
            ]);
            // Process the results into plaintext
            resultList
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                // Build the copy button
                copyBtn = yield Util.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');
                // Build the plaintext box
                copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
                // Insert plaintext results
                this._plainText = yield this._processResults(res);
                document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            }))
                .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch').innerHTML = '';
                    resultList = this._getRequestList();
                    resultList.then((res) => __awaiter(this, void 0, void 0, function* () {
                        // Insert plaintext results
                        this._plainText = yield this._processResults(res);
                        document.querySelector('.mp_plaintextSearch').innerHTML = this._plainText;
                    }));
                });
            });
            // Init open state
            this._setOpenState(this._isOpen);
            // Set up toggle button functionality
            toggleBtn
                .then((btn) => {
                btn.addEventListener('click', () => {
                    // Textbox should exist, but just in case...
                    const textbox = document.querySelector('.mp_plaintextSearch');
                    if (textbox === null) {
                        throw new Error(`textbox doesn't exist!`);
                    }
                    else if (this._isOpen === 'false') {
                        this._setOpenState('true');
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    }
                    else {
                        this._setOpenState('false');
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }, false);
            })
                .catch((err) => {
                throw new Error(err);
            });
            console.log('[M+] Inserted plaintext request results!');
        });
    }
    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    _setOpenState(val) {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }
    _processResults(results) {
        return __awaiter(this, void 0, void 0, function* () {
            let outp = '';
            results.forEach((node) => {
                // Reset each text field
                let title = '';
                let seriesTitle = '';
                let authTitle = '';
                let narrTitle = '';
                // Break out the important data from each node
                const rawTitle = node.querySelector('.torTitle');
                const seriesList = node.querySelectorAll('.series');
                const authList = node.querySelectorAll('.author');
                const narrList = node.querySelectorAll('.narrator');
                if (rawTitle === null) {
                    console.warn('Error Node:', node);
                    throw new Error(`Result title should not be null`);
                }
                else {
                    title = rawTitle.textContent.trim();
                }
                // Process series
                if (seriesList !== null && seriesList.length > 0) {
                    seriesList.forEach((series) => {
                        seriesTitle += `${series.textContent} / `;
                    });
                    // Remove trailing slash from last series, then style
                    seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                    seriesTitle = ` (${seriesTitle})`;
                }
                // Process authors
                if (authList !== null && authList.length > 0) {
                    authTitle = 'BY ';
                    authList.forEach((auth) => {
                        authTitle += `${auth.textContent} AND `;
                    });
                    // Remove trailing AND
                    authTitle = authTitle.substring(0, authTitle.length - 5);
                }
                // Process narrators
                if (narrList !== null && narrList.length > 0) {
                    narrTitle = 'FT ';
                    narrList.forEach((narr) => {
                        narrTitle += `${narr.textContent} AND `;
                    });
                    // Remove trailing AND
                    narrTitle = narrTitle.substring(0, narrTitle.length - 5);
                }
                outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
            });
            return outp;
        });
    }
    get settings() {
        return this._settings;
    }
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(val) {
        this._setOpenState(val);
    }
}
class GoodreadsButtonReq {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'goodreadsButtonReq',
            scope: SettingGroup.Requests,
            desc: 'Enable MAM-to-Goodreads buttons for requests',
        };
        this._tar = '#fillTorrent';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['request details']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert row structure into searchable object
            const reqRows = Util.rowsToObj(document.querySelectorAll('#torDetMainCon > div'));
            // Select the data points
            const bookData = reqRows['Title:'].querySelector('span');
            const authorData = reqRows['Author(s):'].querySelectorAll('a');
            const seriesData = reqRows['Series:']
                ? reqRows['Series:'].querySelectorAll('a')
                : null;
            const target = reqRows['Release Date'];
            // Generate buttons
            this._share.goodreadsButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * VAULT FEATURES
 */
class SimpleVault {
    constructor() {
        this._settings = {
            scope: SettingGroup.Vault,
            type: 'checkbox',
            title: 'simpleVault',
            desc: 'Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)',
        };
        this._tar = '#mainBody';
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const subPage = GM_getValue('mp_currentPage');
            const page = document.querySelector(this._tar);
            console.group(`Applying Vault (${subPage}) settings...`);
            // Clone the important parts and reset the page
            const donateBtn = page.querySelector('form');
            const donateTbl = page.querySelector('table:last-of-type');
            page.innerHTML = '';
            // Add the donate button if it exists
            if (donateBtn !== null) {
                const newDonate = donateBtn.cloneNode(true);
                page.appendChild(newDonate);
                newDonate.classList.add('mp_vaultClone');
            }
            else {
                page.innerHTML = '<h1>Come back tomorrow!</h1>';
            }
            // Add the donate table if it exists
            if (donateTbl !== null) {
                const newTable = (donateTbl.cloneNode(true));
                page.appendChild(newTable);
                newTable.classList.add('mp_vaultClone');
            }
            else {
                page.style.paddingBottom = '25px';
            }
            console.log('[M+] Simplified the vault page!');
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="../util.ts" />
/**
 * #UPLOAD PAGE FEATURES
 */
/**
 * Allows easier checking for duplicate uploads
 */
class SearchForDuplicates {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'searchForDuplicates',
            scope: SettingGroup['Upload Page'],
            desc: 'Easier searching for duplicates when uploading content',
        };
        this._tar = '#uploadForm input[type="submit"]';
        Util.startFeature(this._settings, this._tar, ['upload']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const parentElement = document.querySelector('#uploadForm tbody');
            if (parentElement) {
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given title',
                    type: 'title',
                    inputSelector: 'input[name="tor[title]"]',
                    rowPosition: 7,
                    useWildcard: true,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given author(s)',
                    type: 'author',
                    inputSelector: 'input.ac_author',
                    rowPosition: 10,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given series',
                    type: 'series',
                    inputSelector: 'input.ac_series',
                    rowPosition: 11,
                });
                this._generateSearch({
                    parentElement,
                    title: 'Check for results with given narrator(s)',
                    type: 'narrator',
                    inputSelector: 'input.ac_narrator',
                    rowPosition: 12,
                });
            }
            console.log(`[M+] Adding search to uploads!`);
        });
    }
    _generateSearch({ parentElement, title, type, inputSelector, rowPosition, useWildcard = false, }) {
        var _a;
        const searchElement = document.createElement('a');
        Util.setAttr(searchElement, {
            target: '_blank',
            style: 'text-decoration: none; cursor: pointer;',
            title,
        });
        searchElement.innerText = ' 🔍';
        const linkBase = `/tor/browse.php?tor%5BsearchType%5D=all&tor%5BsearchIn%5D=torrents&tor%5Bcat%5D%5B%5D=0&tor%5BbrowseFlagsHideVsShow%5D=0&tor%5BsortType%5D=dateDesc&tor%5BsrchIn%5D%5B${type}%5D=true&tor%5Btext%5D=`;
        (_a = parentElement
            .querySelector(`tr:nth-child(${rowPosition}) > td:nth-child(1)`)) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('beforeend', searchElement);
        searchElement.addEventListener('click', (event) => {
            const inputs = parentElement.querySelectorAll(inputSelector);
            if (inputs && inputs.length) {
                const inputsList = [];
                inputs.forEach((input) => {
                    if (input.value) {
                        inputsList.push(input.value);
                    }
                });
                const query = inputsList.join(' ').trim();
                if (query) {
                    const searchString = useWildcard
                        ? `*${encodeURIComponent(inputsList.join(' '))}*`
                        : encodeURIComponent(inputsList.join(' '));
                    searchElement.setAttribute('href', linkBase + searchString);
                }
                else {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            else {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/// <reference path="shared.ts" />
/// <reference path="../util.ts" />
/**
 * # USER PAGE FEATURES
 */
/**
 * #### Default User Gift Amount
 */
class UserGiftDefault {
    constructor() {
        this._settings = {
            scope: SettingGroup['User Pages'],
            type: 'textbox',
            title: 'userGiftDefault',
            tag: 'Default Gift',
            placeholder: 'ex. 1000, max',
            desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
        };
        this._tar = '#bonusgift';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }
    get settings() {
        return this._settings;
    }
}
/**
 * #### User Gift History
 */
class UserGiftHistory {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'userGiftHistory',
            scope: SettingGroup['User Pages'],
            desc: 'Display gift history between you and another user',
        };
        this._sendSymbol = `<span style='color:orange'>\u27F0</span>`;
        this._getSymbol = `<span style='color:teal'>\u27F1</span>`;
        this._tar = 'tbody';
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Initiallizing user gift history...');
            // Name of the other user
            const otherUser = document.querySelector('#mainBody > h1').textContent.trim();
            // Create the gift history row
            const historyContainer = document.createElement('tr');
            const insert = document.querySelector('#mainBody tbody tr:last-of-type');
            if (insert)
                insert.insertAdjacentElement('beforebegin', historyContainer);
            // Create the gift history title field
            const historyTitle = document.createElement('td');
            historyTitle.classList.add('rowhead');
            historyTitle.textContent = 'Gift history';
            historyContainer.appendChild(historyTitle);
            // Create the gift history content field
            const historyBox = document.createElement('td');
            historyBox.classList.add('row1');
            historyBox.textContent = `You have not exchanged gifts with ${otherUser}.`;
            historyBox.align = 'left';
            historyContainer.appendChild(historyBox);
            // Get the User ID
            const userID = window.location.pathname.split('/').pop();
            // TODO: use `cdn.` instead of `www.`; currently causes a 403 error
            if (userID) {
                // Get the gift history
                const giftHistory = yield Util.getUserGiftHistory(userID);
                // Only display a list if there is a history
                if (giftHistory.length) {
                    // Determine Point & FL total values
                    const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
                    const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
                    if (MP.DEBUG) {
                        console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                        console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
                    }
                    // Generate a message
                    historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> to ${otherUser} and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                    // Add the message to the box
                    historyBox.appendChild(this._showGifts(giftHistory));
                    console.log('[M+] User gift history added!');
                }
                else {
                    console.log('[M+] No user gift history found.');
                }
            }
            else {
                throw new Error(`User ID not found: ${userID}`);
            }
        });
    }
    /**
     * #### Sum the values of a given gift type as Inflow & Outflow sums
     * @param history the user gift history
     * @param type points or wedges
     */
    _sumGifts(history, type) {
        const outflow = [0];
        const inflow = [0];
        // Only retrieve amounts of a specified gift type
        history.map((gift) => {
            if (gift.type === type) {
                // Split into Inflow/Outflow
                if (gift.amount > 0) {
                    inflow.push(gift.amount);
                }
                else {
                    outflow.push(gift.amount);
                }
            }
        });
        // Sum all items in the filtered array
        const sumOut = outflow.reduce((accumulate, current) => accumulate + current);
        const sumIn = inflow.reduce((accumulate, current) => accumulate + current);
        return [sumIn, Math.abs(sumOut)];
    }
    /**
     * #### Creates a list of the most recent gifts
     * @param history The full gift history between two users
     */
    _showGifts(history) {
        // If the gift was a wedge, return custom text
        const _wedgeOrPoints = (gift) => {
            if (gift.type === 'giftPoints') {
                return `${Math.abs(gift.amount)}`;
            }
            else if (gift.type === 'giftWedge') {
                return '(FL)';
            }
            else {
                return `Error: unknown gift type... ${gift.type}: ${gift.amount}`;
            }
        };
        // Generate a list for the history
        const historyList = document.createElement('ul');
        Object.assign(historyList.style, {
            listStyle: 'none',
            padding: 'initial',
            height: '10em',
            overflow: 'auto',
        });
        // Loop over history items and add to an array
        const gifts = history.map((gift) => {
            // Add some styling depending on pos/neg numbers
            let fancyGiftAmount = '';
            if (gift.amount > 0) {
                fancyGiftAmount = `${this._getSymbol} ${_wedgeOrPoints(gift)}`;
            }
            else {
                fancyGiftAmount = `${this._sendSymbol} ${_wedgeOrPoints(gift)}`;
            }
            // Make the date readable
            const date = Util.prettySiteTime(gift.timestamp, true);
            return `<li class='mp_giftItem'>${date} ${fancyGiftAmount}</li>`;
        });
        // Add history items to the list
        historyList.innerHTML = gifts.join('');
        return historyList;
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ===========================
 * PLACE ALL M+ FEATURES HERE
 * ===========================
 *
 * Nearly all features belong here, as they should have internal checks
 * for DOM elements as needed. Only core features should be placed in `app.ts`
 *
 * This determines the order in which settings will be generated on the Settings page.
 * Settings will be grouped by type and Features of one type that are called before
 * other Features of the same type will appear first.
 *
 * The order of the feature groups is not determined here.
 */
class InitFeatures {
    constructor() {
        // Initialize Global functions
        new HideHome();
        new HideSeedbox();
        new BlurredHeader();
        new VaultLink();
        new MiniVaultInfo();
        new BonusPointDelta();
        // Initialize Home Page functions
        new HideNews();
        new GiftNewest();
        // Initialize Search Page functions
        new ToggleSnatched();
        new StickySnatchedToggle();
        new PlaintextSearch();
        new ToggleSearchbox();
        new BuildTags();
        new RandomBook();
        // Initialize Request Page functions
        new GoodreadsButtonReq();
        new ToggleHiddenRequesters();
        new PlaintextRequest();
        // Initialize Torrent Page functions
        new GoodreadsButton();
        new CurrentlyReading();
        new TorGiftDefault();
        new RatioProtect();
        new RatioProtectL1();
        new RatioProtectL2();
        new RatioProtectL3();
        new RatioProtectMin();
        // Initialize Shoutbox functions
        new PriorityUsers();
        new PriorityStyle();
        new MutedUsers();
        new ReplySimple();
        new ReplyQuote();
        new GiftButton();
        new QuickShout();
        // Initialize Vault functions
        new SimpleVault();
        // Initialize User Page functions
        new UserGiftDefault();
        new UserGiftHistory();
        // Initialize Forum Page functions
        new ForumFLGift();
        // Initialize Upload Page functions
        new SearchForDuplicates();
    }
}
/// <reference path="check.ts" />
/// <reference path="util.ts" />
/// <reference path="./modules/core.ts" />
/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a useable table
 */
class Settings {
    // Function for gathering the needed scopes
    static _getScopes(settings) {
        if (MP.DEBUG) {
            console.log('_getScopes(', settings, ')');
        }
        return new Promise((resolve) => {
            const scopeList = {};
            for (const setting of settings) {
                const index = Number(setting.scope);
                // If the Scope exists, push the settings into the array
                if (scopeList[index]) {
                    scopeList[index].push(setting);
                    // Otherwise, create the array
                }
                else {
                    scopeList[index] = [setting];
                }
            }
            resolve(scopeList);
        });
    }
    // Function for constructing the table from an object
    static _buildTable(page) {
        if (MP.DEBUG)
            console.log('_buildTable(', page, ')');
        return new Promise((resolve) => {
            let outp = `<tbody><tr><td class="row1" colspan="2"><br><strong>MAM+ v${MP.VERSION}</strong> - Here you can enable &amp; disable any feature from the <a href="/f/t/41863">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br>For a detailed look at the available features, <a href="https://github.com/gardenshade/mam-plus/wiki/Feature-Overview">check the Wiki!</a><br><br></td></tr>`;
            Object.keys(page).forEach((scope) => {
                const scopeNum = Number(scope);
                // Insert the section title
                outp += `<tr><td class='row2'>${SettingGroup[scopeNum]}</td><td class='row1'>`;
                // Create the required input field based on the setting
                Object.keys(page[scopeNum]).forEach((setting) => {
                    const settingNumber = Number(setting);
                    const item = page[scopeNum][settingNumber];
                    const cases = {
                        checkbox: () => {
                            outp += `<input type='checkbox' id='${item.title}' value='true'>${item.desc}<br>`;
                        },
                        textbox: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <input type='text' id='${item.title}' placeholder='${item.placeholder}' class='mp_textInput' size='25'>${item.desc}<br>`;
                        },
                        dropdown: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <select id='${item.title}' class='mp_dropInput'>`;
                            if (item.options) {
                                Object.keys(item.options).forEach((key) => {
                                    outp += `<option value='${key}'>${item.options[key]}</option>`;
                                });
                            }
                            outp += `</select>${item.desc}<br>`;
                        },
                    };
                    if (item.type)
                        cases[item.type]();
                });
                // Close the row
                outp += '</td></tr>';
            });
            // Add the save button & last part of the table
            outp +=
                '<tr><td class="row1" colspan="2"><div id="mp_submit" class="mp_settingBtn">Save M+ Settings??</div><div id="mp_copy" class="mp_settingBtn">Copy Settings</div><div id="mp_inject" class="mp_settingBtn">Paste Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>';
            resolve(outp);
        });
    }
    // Function for retrieving the current settings values
    static _getSettings(page) {
        // Util.purgeSettings();
        const allValues = GM_listValues();
        if (MP.DEBUG) {
            console.log('_getSettings(', page, ')\nStored GM keys:', allValues);
        }
        Object.keys(page).forEach((scope) => {
            Object.keys(page[Number(scope)]).forEach((setting) => {
                const pref = page[Number(scope)][Number(setting)];
                if (MP.DEBUG) {
                    console.log('Pref:', pref.title, '| Set:', GM_getValue(`${pref.title}`), '| Value:', GM_getValue(`${pref.title}_val`));
                }
                if (pref !== null && typeof pref === 'object') {
                    const elem = (document.getElementById(pref.title));
                    const cases = {
                        checkbox: () => {
                            elem.setAttribute('checked', 'checked');
                        },
                        textbox: () => {
                            elem.value = GM_getValue(`${pref.title}_val`);
                        },
                        dropdown: () => {
                            elem.value = GM_getValue(pref.title);
                        },
                    };
                    if (cases[pref.type] && GM_getValue(pref.title))
                        cases[pref.type]();
                }
            });
        });
    }
    static _setSettings(obj) {
        if (MP.DEBUG)
            console.log(`_setSettings(`, obj, ')');
        Object.keys(obj).forEach((scope) => {
            Object.keys(obj[Number(scope)]).forEach((setting) => {
                const pref = obj[Number(scope)][Number(setting)];
                if (pref !== null && typeof pref === 'object') {
                    const elem = (document.getElementById(pref.title));
                    const cases = {
                        checkbox: () => {
                            if (elem.checked)
                                GM_setValue(pref.title, true);
                        },
                        textbox: () => {
                            const inp = elem.value;
                            if (inp !== '') {
                                GM_setValue(pref.title, true);
                                GM_setValue(`${pref.title}_val`, inp);
                            }
                        },
                        dropdown: () => {
                            GM_setValue(pref.title, elem.value);
                        },
                    };
                    if (cases[pref.type])
                        cases[pref.type]();
                }
            });
        });
        console.log('[M+] Saved!');
    }
    static _copySettings() {
        const gmList = GM_listValues();
        const outp = [];
        // Loop over all stored settings and push to output array
        gmList.map((setting) => {
            // Don't export mp_ settings as they should only be set at runtime
            if (setting.indexOf('mp_') < 0) {
                outp.push([setting, GM_getValue(setting)]);
            }
        });
        return JSON.stringify(outp);
    }
    static _pasteSettings(payload) {
        if (MP.DEBUG)
            console.group(`_pasteSettings( )`);
        const settings = JSON.parse(payload);
        settings.forEach((tuple) => {
            if (tuple[1]) {
                GM_setValue(`${tuple[0]}`, `${tuple[1]}`);
                if (MP.DEBUG)
                    console.log(tuple[0], ': ', tuple[1]);
            }
        });
    }
    // Function that saves the values of the settings table
    static _saveSettings(timer, obj) {
        if (MP.DEBUG)
            console.group(`_saveSettings()`);
        const savestate = (document.querySelector('span.mp_savestate'));
        const gmValues = GM_listValues();
        // Reset timer & message
        savestate.style.opacity = '0';
        window.clearTimeout(timer);
        console.log('[M+] Saving...');
        // Loop over all values stored in GM and reset everything
        for (const feature in gmValues) {
            if (typeof gmValues[feature] !== 'function') {
                // Only loop over values that are feature settings
                if (!['mp_version', 'style_theme'].includes(gmValues[feature])) {
                    //if not part of preferences page
                    if (gmValues[feature].indexOf('mp_') !== 0) {
                        GM_setValue(gmValues[feature], false);
                    }
                }
            }
        }
        // Save the settings to GM values
        this._setSettings(obj);
        // Display the confirmation message
        savestate.style.opacity = '1';
        try {
            timer = window.setTimeout(() => {
                savestate.style.opacity = '0';
            }, 2345);
        }
        catch (e) {
            if (MP.DEBUG)
                console.warn(e);
        }
        if (MP.DEBUG)
            console.groupEnd();
    }
    /**
     * Inserts the settings page.
     * @param result Value that must be passed down from `Check.page('settings')`
     * @param settings The array of features to provide settings for
     */
    static init(result, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            // This will only run if `Check.page('settings)` returns true & is passed here
            if (result === true) {
                if (MP.DEBUG) {
                    console.group(`new Settings()`);
                }
                // Make sure the settings table has loaded
                yield Check.elemLoad('#mainBody > table').then((r) => {
                    if (MP.DEBUG)
                        console.log(`[M+] Starting to build Settings table...`);
                    // Create new table elements
                    const settingNav = document.querySelector('#mainBody > table');
                    const settingTitle = document.createElement('h1');
                    const settingTable = document.createElement('table');
                    let pageScope;
                    // Insert table elements after the Pref navbar
                    settingNav.insertAdjacentElement('afterend', settingTitle);
                    settingTitle.insertAdjacentElement('afterend', settingTable);
                    Util.setAttr(settingTable, {
                        class: 'coltable',
                        cellspacing: '1',
                        style: 'width:100%;min-width:100%;max-width:100%;',
                    });
                    settingTitle.innerHTML = 'MAM+ Settings';
                    // Group settings by page
                    this._getScopes(settings)
                        // Generate table HTML from feature settings
                        .then((scopes) => {
                        pageScope = scopes;
                        return this._buildTable(scopes);
                    })
                        // Insert content into the new table elements
                        .then((result) => {
                        settingTable.innerHTML = result;
                        console.log('[M+] Added the MAM+ Settings table!');
                        return pageScope;
                    })
                        .then((scopes) => {
                        this._getSettings(scopes);
                        return scopes;
                    })
                        // Make sure the settings are done loading
                        .then((scopes) => {
                        const submitBtn = (document.querySelector('#mp_submit'));
                        const copyBtn = (document.querySelector('#mp_copy'));
                        const pasteBtn = (document.querySelector('#mp_inject'));
                        let ssTimer;
                        try {
                            submitBtn.addEventListener('click', () => {
                                this._saveSettings(ssTimer, scopes);
                            }, false);
                            Util.clipboardifyBtn(pasteBtn, this._pasteSettings, false);
                            Util.clipboardifyBtn(copyBtn, this._copySettings());
                        }
                        catch (err) {
                            if (MP.DEBUG)
                                console.warn(err);
                        }
                        if (MP.DEBUG) {
                            console.groupEnd();
                        }
                    });
                });
            }
        });
    }
}
/// <reference path="types.ts" />
/// <reference path="style.ts" />
/// <reference path="./modules/core.ts" />
/// <reference path="./modules/global.ts" />
/// <reference path="./modules/home.ts" />
/// <reference path="./modules/tor.ts" />
/// <reference path="./modules/forum.ts" />
/// <reference path="./modules/shout.ts" />
/// <reference path="./modules/browse.ts" />
/// <reference path="./modules/request.ts" />
/// <reference path="./modules/vault.ts" />
/// <reference path="./modules/upload.ts" />
/// <reference path="./modules/user.ts" />
/// <reference path="features.ts" />
/// <reference path="settings.ts" />
/**
 * * Userscript namespace
 * @constant CHANGELOG: Object containing a list of changes and known bugs
 * @constant TIMESTAMP: Placeholder hook for the current build time
 * @constant VERSION: The current userscript version
 * @constant PREV_VER: The last installed userscript version
 * @constant ERRORLOG: The target array for logging errors
 * @constant PAGE_PATH: The current page URL without the site address
 * @constant MP_CSS: The MAM+ stylesheet
 * @constant run(): Starts the userscript
 */
var MP;
(function (MP) {
    MP.DEBUG = GM_getValue('debug') ? true : false;
    MP.CHANGELOG = {
        /* 🆕♻️🐞 */
        UPDATE_LIST: ['🆕: Added search buttons to upload page. @ Mori'],
        BUG_LIST: [],
    };
    MP.TIMESTAMP = 'Jan 18';
    MP.VERSION = Check.newVer;
    MP.PREV_VER = Check.prevVer;
    MP.ERRORLOG = [];
    MP.PAGE_PATH = window.location.pathname;
    MP.MP_CSS = new Style();
    MP.settingsGlob = [];
    MP.run = () => __awaiter(this, void 0, void 0, function* () {
        /**
         * * PRE SCRIPT
         */
        console.group(`Welcome to MAM+ v${MP.VERSION}!`);
        // The current page is not yet known
        GM_deleteValue('mp_currentPage');
        Check.page();
        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/;samesite=lax';
        // Initialize core functions
        const alerts = new Alerts();
        new Debug();
        // Notify the user if the script was updated
        Check.updated().then((result) => {
            if (result)
                alerts.notify(result, MP.CHANGELOG);
        });
        // Initialize the features
        new InitFeatures();
        /**
         * * SETTINGS
         */
        Check.page('settings').then((result) => {
            const subPg = window.location.search;
            if (result === true && (subPg === '' || subPg === '?view=general')) {
                // Initialize the settings page
                Settings.init(result, MP.settingsGlob);
            }
        });
        /**
         * * STYLES
         * Injects CSS
         */
        Check.elemLoad('head link[href*="ICGstation"]').then(() => {
            // Add custom CSS sheet
            MP.MP_CSS.injectLink();
            // Get the current site theme
            MP.MP_CSS.alignToSiteTheme();
        });
        console.groupEnd();
    });
})(MP || (MP = {}));
// * Start the userscript
MP.run();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL2hvbWUudHMiLCJzcmMvbW9kdWxlcy9zaGFyZWQudHMiLCJzcmMvbW9kdWxlcy90b3IudHMiLCJzcmMvbW9kdWxlcy9mb3J1bS50cyIsInNyYy9tb2R1bGVzL3Nob3V0LnRzIiwic3JjL21vZHVsZXMvYnJvd3NlLnRzIiwic3JjL21vZHVsZXMvcmVxdWVzdC50cyIsInNyYy9tb2R1bGVzL3ZhdWx0LnRzIiwic3JjL21vZHVsZXMvdXBsb2FkLnRzIiwic3JjL21vZHVsZXMvdXNlci50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBaUJILElBQUssWUFZSjtBQVpELFdBQUssWUFBWTtJQUNiLG1EQUFRLENBQUE7SUFDUiwrQ0FBTSxDQUFBO0lBQ04sbURBQVEsQ0FBQTtJQUNSLHVEQUFVLENBQUE7SUFDViwrREFBYyxDQUFBO0lBQ2QsdURBQVUsQ0FBQTtJQUNWLGlEQUFPLENBQUE7SUFDUCw2REFBYSxDQUFBO0lBQ2IsMkRBQVksQ0FBQTtJQUNaLGlEQUFPLENBQUE7SUFDUCxrREFBTyxDQUFBO0FBQ1gsQ0FBQyxFQVpJLFlBQVksS0FBWixZQUFZLFFBWWhCO0FDL0JEOzs7O0dBSUc7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENB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Q0FBQzthQUN2QztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUg7OztXQUdHO1FBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDdEQsdUJBQXVCO1lBQ3ZCLEdBQUEsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLDZCQUE2QjtZQUM3QixHQUFBLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQSxDQUFDO0FBQ04sQ0FBQyxFQTVEUyxFQUFFLEtBQUYsRUFBRSxRQTREWDtBQUVELHlCQUF5QjtBQUN6QixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoibWFtLXBsdXNfZGV2LnVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVHlwZXMsIEludGVyZmFjZXMsIGV0Yy5cclxuICovXHJcblxyXG50eXBlIFZhbGlkUGFnZSA9XHJcbiAgICB8ICdob21lJ1xyXG4gICAgfCAnYnJvd3NlJ1xyXG4gICAgfCAncmVxdWVzdCdcclxuICAgIHwgJ3JlcXVlc3QgZGV0YWlscydcclxuICAgIHwgJ3RvcnJlbnQnXHJcbiAgICB8ICdzaG91dGJveCdcclxuICAgIHwgJ3ZhdWx0J1xyXG4gICAgfCAndXBsb2FkJ1xyXG4gICAgfCAndXNlcidcclxuICAgIHwgJ2ZvcnVtIHRocmVhZCdcclxuICAgIHwgJ3NldHRpbmdzJztcclxuXHJcbnR5cGUgQm9va0RhdGEgPSAnYm9vaycgfCAnYXV0aG9yJyB8ICdzZXJpZXMnO1xyXG5cclxuZW51bSBTZXR0aW5nR3JvdXAge1xyXG4gICAgJ0dsb2JhbCcsXHJcbiAgICAnSG9tZScsXHJcbiAgICAnU2VhcmNoJyxcclxuICAgICdSZXF1ZXN0cycsXHJcbiAgICAnVG9ycmVudCBQYWdlJyxcclxuICAgICdTaG91dGJveCcsXHJcbiAgICAnVmF1bHQnLFxyXG4gICAgJ1VwbG9hZCBQYWdlJyxcclxuICAgICdVc2VyIFBhZ2VzJyxcclxuICAgICdGb3J1bScsXHJcbiAgICAnT3RoZXInLFxyXG59XHJcblxyXG50eXBlIFNob3V0Ym94VXNlclR5cGUgPSAncHJpb3JpdHknIHwgJ211dGUnO1xyXG5cclxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XHJcbiAgICBhbW91bnQ6IG51bWJlcjtcclxuICAgIG90aGVyX25hbWU6IHN0cmluZztcclxuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xyXG4gICAgdGlkOiBudW1iZXIgfCBudWxsO1xyXG4gICAgdGltZXN0YW1wOiBudW1iZXI7XHJcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIHR5cGU6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFycmF5T2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU3RyaW5nT2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEJvb2tEYXRhT2JqZWN0IGV4dGVuZHMgU3RyaW5nT2JqZWN0IHtcclxuICAgIFsnZXh0cmFjdGVkJ106IHN0cmluZztcclxuICAgIFsnZGVzYyddOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEaXZSb3dPYmplY3Qge1xyXG4gICAgWyd0aXRsZSddOiBzdHJpbmc7XHJcbiAgICBbJ2RhdGEnXTogSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTZXR0aW5nR2xvYk9iamVjdCB7XHJcbiAgICBba2V5OiBudW1iZXJdOiBGZWF0dXJlU2V0dGluZ3NbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICBzY29wZTogU2V0dGluZ0dyb3VwO1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHR5cGU6ICdjaGVja2JveCcgfCAnZHJvcGRvd24nIHwgJ3RleHRib3gnO1xyXG4gICAgZGVzYzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQW55RmVhdHVyZSBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0YWc/OiBzdHJpbmc7XHJcbiAgICBvcHRpb25zPzogU3RyaW5nT2JqZWN0O1xyXG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBGZWF0dXJlIHtcclxuICAgIHNldHRpbmdzOiBDaGVja2JveFNldHRpbmcgfCBEcm9wZG93blNldHRpbmcgfCBUZXh0Ym94U2V0dGluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIENoZWNrYm94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0eXBlOiAnY2hlY2tib3gnO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRHJvcGRvd25TZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICdkcm9wZG93bic7XHJcbiAgICB0YWc6IHN0cmluZztcclxuICAgIG9wdGlvbnM6IFN0cmluZ09iamVjdDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFRleHRib3hTZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICd0ZXh0Ym94JztcclxuICAgIHRhZzogc3RyaW5nO1xyXG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZztcclxufVxyXG5cclxuLy8gbmF2aWdhdG9yLmNsaXBib2FyZC5kLnRzXHJcblxyXG4vLyBUeXBlIGRlY2xhcmF0aW9ucyBmb3IgQ2xpcGJvYXJkIEFQSVxyXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2xpcGJvYXJkX0FQSVxyXG5pbnRlcmZhY2UgQ2xpcGJvYXJkIHtcclxuICAgIHdyaXRlVGV4dChuZXdDbGlwVGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxuICAgIC8vIEFkZCBhbnkgb3RoZXIgbWV0aG9kcyB5b3UgbmVlZCBoZXJlLlxyXG59XHJcblxyXG5pbnRlcmZhY2UgTmF2aWdhdG9yQ2xpcGJvYXJkIHtcclxuICAgIC8vIE9ubHkgYXZhaWxhYmxlIGluIGEgc2VjdXJlIGNvbnRleHQuXHJcbiAgICByZWFkb25seSBjbGlwYm9hcmQ/OiBDbGlwYm9hcmQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBOYXZpZ2F0b3JFeHRlbmRlZCBleHRlbmRzIE5hdmlnYXRvckNsaXBib2FyZCB7fVxyXG4iLCIvKipcclxuICogQ2xhc3MgY29udGFpbmluZyBjb21tb24gdXRpbGl0eSBtZXRob2RzXHJcbiAqXHJcbiAqIElmIHRoZSBtZXRob2Qgc2hvdWxkIGhhdmUgdXNlci1jaGFuZ2VhYmxlIHNldHRpbmdzLCBjb25zaWRlciB1c2luZyBgQ29yZS50c2AgaW5zdGVhZFxyXG4gKi9cclxuXHJcbmNsYXNzIFV0aWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRpb24gZnJhbWUgdGltZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZlRpbWVyKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHNldHRpbmcgbXVsdGlwbGUgYXR0cmlidXRlcyBhdCBvbmNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0QXR0cihlbDogRWxlbWVudCwgYXR0cjogU3RyaW5nT2JqZWN0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgXCJsZW5ndGhcIiBvZiBhbiBPYmplY3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBvYmplY3RMZW5ndGgob2JqOiBPYmplY3QpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcmNlZnVsbHkgZW1wdGllcyBhbnkgR00gc3RvcmVkIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHB1cmdlU2V0dGluZ3MoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBHTV9saXN0VmFsdWVzKCkpIHtcclxuICAgICAgICAgICAgR01fZGVsZXRlVmFsdWUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZyBhIG1lc3NhZ2UgYWJvdXQgYSBjb3VudGVkIHJlc3VsdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcG9ydENvdW50KGRpZDogc3RyaW5nLCBudW06IG51bWJlciwgdGhpbmc6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNpbmd1bGFyID0gMTtcclxuICAgICAgICBpZiAobnVtICE9PSBzaW5ndWxhcikge1xyXG4gICAgICAgICAgICB0aGluZyArPSAncyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPiAke2RpZH0gJHtudW19ICR7dGhpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgYSBmZWF0dXJlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgc3RhcnRGZWF0dXJlKFxyXG4gICAgICAgIHNldHRpbmdzOiBGZWF0dXJlU2V0dGluZ3MsXHJcbiAgICAgICAgZWxlbTogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U/OiBWYWxpZFBhZ2VbXVxyXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgLy8gUXVldWUgdGhlIHNldHRpbmdzIGluIGNhc2UgdGhleSdyZSBuZWVkZWRcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaChzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIHJldHVybiB0cnVlIHdoZW4gdGhlIGVsZW1lbnQgaXMgbG9hZGVkXHJcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aW1lcjogUHJvbWlzZTxmYWxzZT4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMTUwMCwgZmFsc2UpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrRWxlbSA9IENoZWNrLmVsZW1Mb2FkKGVsZW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lciwgY2hlY2tFbGVtXSkudGhlbigodmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYHN0YXJ0RmVhdHVyZSgke3NldHRpbmdzLnRpdGxlfSkgdW5hYmxlIHRvIGluaXRpYXRlISBDb3VsZCBub3QgZmluZCBlbGVtZW50OiAke2VsZW19YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElzIHRoZSBzZXR0aW5nIGVuYWJsZWQ/XHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHNldHRpbmdzLnRpdGxlKSkge1xyXG4gICAgICAgICAgICAvLyBBIHNwZWNpZmljIHBhZ2UgaXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCByZXF1aXJlZCBwYWdlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYm9vbGVhbltdID0gW107XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLmZvckVhY2goKHApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBDaGVjay5wYWdlKHApLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKDxib29sZWFuPnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBhbnkgcmVxdWVzdGVkIHBhZ2UgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlLCBydW4gdGhlIGZlYXR1cmVcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmluY2x1ZGVzKHRydWUpID09PSB0cnVlKSByZXR1cm4gcnVuKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHRvIGVsZW1lbnQgY2hlY2tpbmdcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBydW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZXR0aW5nIGlzIG5vdCBlbmFibGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyaW1zIGEgc3RyaW5nIGxvbmdlciB0aGFuIGEgc3BlY2lmaWVkIGNoYXIgbGltaXQsIHRvIGEgZnVsbCB3b3JkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdHJpbVN0cmluZyhpbnA6IHN0cmluZywgbWF4OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChpbnAubGVuZ3RoID4gbWF4KSB7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgbWF4ICsgMSk7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgTWF0aC5taW4oaW5wLmxlbmd0aCwgaW5wLmxhc3RJbmRleE9mKCcgJykpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlucDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYnJhY2tldHMgJiBhbGwgY29udGFpbmVkIHdvcmRzIGZyb20gYSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0UmVtb3ZlcihpbnA6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGlucFxyXG4gICAgICAgICAgICAucmVwbGFjZSgveysuKj99Ky9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcW1xcW3xcXF1cXF0vZywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC88Lio/Pi9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC4qP1xcKS9nLCAnJylcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICpSZXR1cm4gdGhlIGNvbnRlbnRzIGJldHdlZW4gYnJhY2tldHNcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRDb250ZW50cyA9IChpbnA6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBpbnAubWF0Y2goL1xcKChbXildKylcXCkvKSFbMV07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYW4gYXJyYXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb0FycmF5KGlucDogc3RyaW5nLCBzcGxpdFBvaW50PzogJ3dzJyk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gc3BsaXRQb2ludCAhPT0gdW5kZWZpbmVkICYmIHNwbGl0UG9pbnQgIT09ICd3cydcclxuICAgICAgICAgICAgPyBpbnAuc3BsaXQoc3BsaXRQb2ludClcclxuICAgICAgICAgICAgOiBpbnAubWF0Y2goL1xcUysvZykgfHwgW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIGNvbW1hIChvciBvdGhlcikgc2VwYXJhdGVkIHZhbHVlIGludG8gYW4gYXJyYXlcclxuICAgICAqIEBwYXJhbSBpbnAgU3RyaW5nIHRvIGJlIGRpdmlkZWRcclxuICAgICAqIEBwYXJhbSBkaXZpZGVyIFRoZSBkaXZpZGVyIChkZWZhdWx0OiAnLCcpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3N2VG9BcnJheShpbnA6IHN0cmluZywgZGl2aWRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBpbnAuc3BsaXQoZGl2aWRlcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBhcnIucHVzaChpdGVtLnRyaW0oKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gYXJyYXkgdG8gYSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBpbnAgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZW5kIGN1dC1vZmYgcG9pbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhcnJheVRvU3RyaW5nKGlucDogc3RyaW5nW10sIGVuZD86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIGlucC5mb3JFYWNoKChrZXksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgaWYgKGVuZCAmJiB2YWwgKyAxICE9PSBpbnAubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBET00gbm9kZSByZWZlcmVuY2UgaW50byBhbiBIVE1MIEVsZW1lbnQgcmVmZXJlbmNlXHJcbiAgICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjb252ZXJ0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbm9kZVRvRWxlbShub2RlOiBOb2RlKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGlmIChub2RlLmZpcnN0Q2hpbGQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm9kZS10by1lbGVtIHdpdGhvdXQgY2hpbGRub2RlIGlzIHVudGVzdGVkJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBOb2RlOiBOb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0ZW1wTm9kZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKHRlbXBOb2RlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hdGNoIHN0cmluZ3Mgd2hpbGUgaWdub3JpbmcgY2FzZSBzZW5zaXRpdml0eVxyXG4gICAgICogQHBhcmFtIGEgRmlyc3Qgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gYiBTZWNvbmQgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2FzZWxlc3NTdHJpbmdNYXRjaChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmU6IG51bWJlciA9IGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7XHJcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiAnYmFzZScsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUgPT09IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBuZXcgVG9yRGV0Um93IGFuZCByZXR1cm4gdGhlIGlubmVyIGRpdlxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgcm93IHRvIGJlIHRhcmdldHRlZFxyXG4gICAgICogQHBhcmFtIGxhYmVsIFRoZSBuYW1lIHRvIGJlIGRpc3BsYXllZCBmb3IgdGhlIG5ldyByb3dcclxuICAgICAqIEBwYXJhbSByb3dDbGFzcyBUaGUgcm93J3MgY2xhc3NuYW1lIChzaG91bGQgc3RhcnQgd2l0aCBtcF8pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICB0YXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBsYWJlbDogc3RyaW5nLFxyXG4gICAgICAgIHJvd0NsYXNzOiBzdHJpbmdcclxuICAgICk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICBpZiAodGFyID09PSBudWxsIHx8IHRhci5wYXJlbnRFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQWRkIFRvciBEZXRhaWxzIFJvdzogZW1wdHkgbm9kZSBvciBwYXJlbnQgbm9kZSBAICR7dGFyfWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhci5wYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cInRvckRldFJvd1wiPjxkaXYgY2xhc3M9XCJ0b3JEZXRMZWZ0XCI+JHtsYWJlbH08L2Rpdj48ZGl2IGNsYXNzPVwidG9yRGV0UmlnaHQgJHtyb3dDbGFzc31cIj48c3BhbiBjbGFzcz1cImZsZXhcIj48L3NwYW4+PC9kaXY+PC9kaXY+YFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtyb3dDbGFzc30gLmZsZXhgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogTWVyZ2Ugd2l0aCBgVXRpbC5jcmVhdGVCdXR0b25gXHJcbiAgICAvKipcclxuICAgICAqIEluc2VydHMgYSBsaW5rIGJ1dHRvbiB0aGF0IGlzIHN0eWxlZCBsaWtlIGEgc2l0ZSBidXR0b24gKGV4LiBpbiB0b3IgZGV0YWlscylcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgdGhlIGJ1dHRvbiBzaG91bGQgYmUgYWRkZWQgdG9cclxuICAgICAqIEBwYXJhbSB1cmwgVGhlIFVSTCB0aGUgYnV0dG9uIHdpbGwgc2VuZCB5b3UgdG9cclxuICAgICAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9uIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSBvcmRlciBPcHRpb25hbDogZmxleCBmbG93IG9yZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGlua0J1dHRvbihcclxuICAgICAgICB0YXI6IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHVybDogc3RyaW5nID0gJ25vbmUnLFxyXG4gICAgICAgIHRleHQ6IHN0cmluZyxcclxuICAgICAgICBvcmRlcjogbnVtYmVyID0gMFxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBidXR0b25cclxuICAgICAgICBjb25zdCBidXR0b246IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgIC8vIFNldCB1cCB0aGUgYnV0dG9uXHJcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ21wX2J1dHRvbl9jbG9uZScpO1xyXG4gICAgICAgIGlmICh1cmwgIT09ICdub25lJykge1xyXG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcclxuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBidXR0b24uaW5uZXJUZXh0ID0gdGV4dDtcclxuICAgICAgICBidXR0b24uc3R5bGUub3JkZXIgPSBgJHtvcmRlcn1gO1xyXG4gICAgICAgIC8vIEluamVjdCB0aGUgYnV0dG9uXHJcbiAgICAgICAgdGFyLmluc2VydEJlZm9yZShidXR0b24sIHRhci5maXJzdENoaWxkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc2VydHMgYSBub24tbGlua2VkIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBJRCBvZiB0aGUgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBkaXNwbGF5ZWQgaW4gdGhlIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHR5cGUgVGhlIEhUTUwgZWxlbWVudCB0byBjcmVhdGUuIERlZmF1bHQ6IGBoMWBcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIEhUTUwgZWxlbWVudCB0aGUgYnV0dG9uIHdpbGwgYmUgYHJlbGF0aXZlYCB0b1xyXG4gICAgICogQHBhcmFtIHJlbGF0aXZlIFRoZSBwb3NpdGlvbiBvZiB0aGUgYnV0dG9uIHJlbGF0aXZlIHRvIHRoZSBgdGFyYC4gRGVmYXVsdDogYGFmdGVyZW5kYFxyXG4gICAgICogQHBhcmFtIGJ0bkNsYXNzIFRoZSBjbGFzc25hbWUgb2YgdGhlIGVsZW1lbnQuIERlZmF1bHQ6IGBtcF9idG5gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIHR5cGU6IHN0cmluZyA9ICdoMScsXHJcbiAgICAgICAgdGFyOiBzdHJpbmcgfCBIVE1MRWxlbWVudCxcclxuICAgICAgICByZWxhdGl2ZTogJ2JlZm9yZWJlZ2luJyB8ICdhZnRlcmVuZCcgPSAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgIGJ0bkNsYXNzOiBzdHJpbmcgPSAnbXBfYnRuJ1xyXG4gICAgKTogUHJvbWlzZTxIVE1MRWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENob29zZSB0aGUgbmV3IGJ1dHRvbiBpbnNlcnQgbG9jYXRpb24gYW5kIGluc2VydCBlbGVtZW50c1xyXG4gICAgICAgICAgICAvLyBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcik7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cclxuICAgICAgICAgICAgICAgIHR5cGVvZiB0YXIgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpIDogdGFyO1xyXG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChgJHt0YXJ9IGlzIG51bGwhYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KHJlbGF0aXZlLCBidG4pO1xyXG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKGJ0biwge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBgbXBfJHtpZH1gLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBidG5DbGFzcyxcclxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnYnV0dG9uJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgYnV0dG9uIHRleHRcclxuICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShidG4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhbiBlbGVtZW50IGludG8gYSBidXR0b24gdGhhdCwgd2hlbiBjbGlja2VkLCBjb3BpZXMgdGV4dCB0byBjbGlwYm9hcmRcclxuICAgICAqIEBwYXJhbSBidG4gQW4gSFRNTCBFbGVtZW50IGJlaW5nIHVzZWQgYXMgYSBidXR0b25cclxuICAgICAqIEBwYXJhbSBwYXlsb2FkIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBjb3BpZWQgdG8gY2xpcGJvYXJkIG9uIGJ1dHRvbiBjbGljaywgb3IgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgdXNlIHRoZSBjbGlwYm9hcmQncyBjdXJyZW50IHRleHRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGlwYm9hcmRpZnlCdG4oXHJcbiAgICAgICAgYnRuOiBIVE1MRWxlbWVudCxcclxuICAgICAgICBwYXlsb2FkOiBhbnksXHJcbiAgICAgICAgY29weTogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBIYXZlIHRvIG92ZXJyaWRlIHRoZSBOYXZpZ2F0b3IgdHlwZSB0byBwcmV2ZW50IFRTIGVycm9yc1xyXG4gICAgICAgICAgICBjb25zdCBuYXY6IE5hdmlnYXRvckV4dGVuZGVkIHwgdW5kZWZpbmVkID0gPE5hdmlnYXRvckV4dGVuZGVkPm5hdmlnYXRvcjtcclxuICAgICAgICAgICAgaWYgKG5hdiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdGV4dCwgbGlrZWx5IGR1ZSB0byBtaXNzaW5nIGJyb3dzZXIgc3VwcG9ydC4nKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0ICduYXZpZ2F0b3InP1wiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8qIE5hdmlnYXRvciBFeGlzdHMgKi9cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY29weSAmJiB0eXBlb2YgcGF5bG9hZCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHJlc3VsdHMgdG8gY2xpcGJvYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEud3JpdGVUZXh0KHBheWxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvcGllZCB0byB5b3VyIGNsaXBib2FyZCEnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuIHBheWxvYWQgZnVuY3Rpb24gd2l0aCBjbGlwYm9hcmQgdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIG5hdi5jbGlwYm9hcmQhLnJlYWRUZXh0KCkudGhlbigodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkKHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvcGllZCBmcm9tIHlvdXIgY2xpcGJvYXJkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnRuLnN0eWxlLmNvbG9yID0gJ2dyZWVuJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBIVFRQUmVxdWVzdCBmb3IgR0VUIEpTT04sIHJldHVybnMgdGhlIGZ1bGwgdGV4dCBvZiBIVFRQIEdFVFxyXG4gICAgICogQHBhcmFtIHVybCAtIGEgc3RyaW5nIG9mIHRoZSBVUkwgdG8gc3VibWl0IGZvciBHRVQgcmVxdWVzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEpTT04odXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGdldEhUVFAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxyXG4gICAgICAgICAgICBnZXRIVFRQLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGdldEhUVFAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SFRUUC5yZWFkeVN0YXRlID09PSA0ICYmIGdldEhUVFAuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGdldEhUVFAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5zZW5kKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIHR3byBwYXJhbWV0ZXJzXHJcbiAgICAgKiBAcGFyYW0gbWluIGEgbnVtYmVyIG9mIHRoZSBib3R0b20gb2YgcmFuZG9tIG51bWJlciBwb29sXHJcbiAgICAgKiBAcGFyYW0gbWF4IGEgbnVtYmVyIG9mIHRoZSB0b3Agb2YgdGhlIHJhbmRvbSBudW1iZXIgcG9vbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJhbmRvbU51bWJlciA9IChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNsZWVwIHV0aWwgdG8gYmUgdXNlZCBpbiBhc3luYyBmdW5jdGlvbnMgdG8gZGVsYXkgcHJvZ3JhbVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNsZWVwID0gKG06IGFueSk6IFByb21pc2U8dm9pZD4gPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbSkpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHNlY3Rpb24gb2YgYW4gSFJFRlxyXG4gICAgICogQHBhcmFtIGVsZW0gQW4gYW5jaG9yIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBzcGxpdCBPcHRpb25hbCBkaXZpZGVyLiBEZWZhdWx0cyB0byBgL2BcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBlbmRPZkhyZWYgPSAoZWxlbTogSFRNTEFuY2hvckVsZW1lbnQsIHNwbGl0ID0gJy8nKSA9PlxyXG4gICAgICAgIGVsZW0uaHJlZi5zcGxpdChzcGxpdCkucG9wKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGhleCB2YWx1ZSBvZiBhIGNvbXBvbmVudCBhcyBhIHN0cmluZy5cclxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIFV0aWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjb21wb25lbnRUb0hleCA9IChjOiBudW1iZXIgfCBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIGNvbnN0IGhleCA9IGMudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIHJldHVybiBoZXgubGVuZ3RoID09PSAxID8gYDAke2hleH1gIDogaGV4O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgaGV4IGNvbG9yIGNvZGUgZnJvbSBSR0IuXHJcbiAgICAgKiBGcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzhcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJnYlRvSGV4ID0gKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIHJldHVybiBgIyR7VXRpbC5jb21wb25lbnRUb0hleChyKX0ke1V0aWwuY29tcG9uZW50VG9IZXgoZyl9JHtVdGlsLmNvbXBvbmVudFRvSGV4KFxyXG4gICAgICAgICAgICBiXHJcbiAgICAgICAgKX1gO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV4dHJhY3QgbnVtYmVycyAod2l0aCBmbG9hdCkgZnJvbSB0ZXh0IGFuZCByZXR1cm4gdGhlbVxyXG4gICAgICogQHBhcmFtIHRhciBBbiBIVE1MIGVsZW1lbnQgdGhhdCBjb250YWlucyBudW1iZXJzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdEZsb2F0ID0gKHRhcjogSFRNTEVsZW1lbnQpOiBudW1iZXJbXSA9PiB7XHJcbiAgICAgICAgaWYgKHRhci50ZXh0Q29udGVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRhci50ZXh0Q29udGVudCEucmVwbGFjZSgvLC9nLCAnJykubWF0Y2goL1xcZCtcXC5cXGQrLykgfHwgW10pLm1hcCgobikgPT5cclxuICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RhcmdldCBjb250YWlucyBubyB0ZXh0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgR2V0IHRoZSB1c2VyIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHRoZSBsb2dnZWQgaW4gdXNlciBhbmQgYSBnaXZlbiBJRFxyXG4gICAgICogQHBhcmFtIHVzZXJJRCBBIHVzZXIgSUQ7IGNhbiBiZSBhIHN0cmluZyBvciBudW1iZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBnZXRVc2VyR2lmdEhpc3RvcnkoXHJcbiAgICAgICAgdXNlcklEOiBudW1iZXIgfCBzdHJpbmdcclxuICAgICk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcclxuICAgICAgICBjb25zdCByYXdHaWZ0SGlzdG9yeTogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKFxyXG4gICAgICAgICAgICBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL3VzZXJCb251c0hpc3RvcnkucGhwP290aGVyX3VzZXJpZD0ke3VzZXJJRH1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeTogQXJyYXk8VXNlckdpZnRIaXN0b3J5PiA9IEpTT04ucGFyc2UocmF3R2lmdEhpc3RvcnkpO1xyXG4gICAgICAgIC8vIFJldHVybiB0aGUgZnVsbCBkYXRhXHJcbiAgICAgICAgcmV0dXJuIGdpZnRIaXN0b3J5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcHJldHR5U2l0ZVRpbWUodW5peFRpbWVzdGFtcDogbnVtYmVyLCBkYXRlPzogYm9vbGVhbiwgdGltZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSh1bml4VGltZXN0YW1wICogMTAwMCkudG9JU09TdHJpbmcoKTtcclxuICAgICAgICBpZiAoZGF0ZSAmJiAhdGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMF07XHJcbiAgICAgICAgfSBlbHNlIGlmICghZGF0ZSAmJiB0aW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXAuc3BsaXQoJ1QnKVsxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgQ2hlY2sgYSBzdHJpbmcgdG8gc2VlIGlmIGl0J3MgZGl2aWRlZCB3aXRoIGEgZGFzaCwgcmV0dXJuaW5nIHRoZSBmaXJzdCBoYWxmIGlmIGl0IGRvZXNuJ3QgY29udGFpbiBhIHNwZWNpZmllZCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBvcmlnaW5hbCBUaGUgb3JpZ2luYWwgc3RyaW5nIGJlaW5nIGNoZWNrZWRcclxuICAgICAqIEBwYXJhbSBjb250YWluZWQgQSBzdHJpbmcgdGhhdCBtaWdodCBiZSBjb250YWluZWQgaW4gdGhlIG9yaWdpbmFsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2hlY2tEYXNoZXMob3JpZ2luYWw6IHN0cmluZywgY29udGFpbmVkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIGBjaGVja0Rhc2hlcyggJHtvcmlnaW5hbH0sICR7Y29udGFpbmVkfSApOiBDb3VudCAke29yaWdpbmFsLmluZGV4T2YoXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtICdcclxuICAgICAgICAgICAgICAgICl9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGFzaGVzIGFyZSBwcmVzZW50XHJcbiAgICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJyAtICcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTdHJpbmcgY29udGFpbnMgYSBkYXNoYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc3BsaXQ6IHN0cmluZ1tdID0gb3JpZ2luYWwuc3BsaXQoJyAtICcpO1xyXG4gICAgICAgICAgICBpZiAoc3BsaXRbMF0gPT09IGNvbnRhaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGA+IFN0cmluZyBiZWZvcmUgZGFzaCBpcyBcIiR7Y29udGFpbmVkfVwiOyB1c2luZyBzdHJpbmcgYmVoaW5kIGRhc2hgXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzcGxpdFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzcGxpdFswXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyBVdGlsaXRpZXMgc3BlY2lmaWMgdG8gR29vZHJlYWRzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ29vZHJlYWRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUmVtb3ZlcyBzcGFjZXMgaW4gYXV0aG9yIG5hbWVzIHRoYXQgdXNlIGFkamFjZW50IGludGl0aWFscy5cclxuICAgICAgICAgKiBAcGFyYW0gYXV0aCBUaGUgYXV0aG9yKHMpXHJcbiAgICAgICAgICogQGV4YW1wbGUgXCJIIEcgV2VsbHNcIiAtPiBcIkhHIFdlbGxzXCJcclxuICAgICAgICAgKi9cclxuICAgICAgICBzbWFydEF1dGg6IChhdXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBVdGlsLnN0cmluZ1RvQXJyYXkoYXV0aCk7XHJcbiAgICAgICAgICAgIGFyci5mb3JFYWNoKChrZXksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBrZXkgaXMgYW4gaW5pdGlhbFxyXG4gICAgICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgbmV4dCBrZXkgaXMgYW4gaW5pdGlhbCwgZG9uJ3QgYWRkIGEgc3BhY2VcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuZzogbnVtYmVyID0gYXJyW3ZhbCArIDFdLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dExlbmcgPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgJHtrZXl9IGA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBUcmltIHRyYWlsaW5nIHNwYWNlXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwLnRyaW0oKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogVHVybnMgYSBzdHJpbmcgaW50byBhIEdvb2RyZWFkcyBzZWFyY2ggVVJMXHJcbiAgICAgICAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgVVJMIHRvIG1ha2VcclxuICAgICAgICAgKiBAcGFyYW0gaW5wIFRoZSBleHRyYWN0ZWQgZGF0YSB0byBVUkkgZW5jb2RlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYnVpbGRTZWFyY2hVUkw6ICh0eXBlOiBCb29rRGF0YSB8ICdvbicsIGlucDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZ29vZHJlYWRzLmJ1aWxkR3JTZWFyY2hVUkwoICR7dHlwZX0sICR7aW5wfSApYCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBnclR5cGU6IHN0cmluZyA9IHR5cGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhc2VzOiBhbnkgPSB7XHJcbiAgICAgICAgICAgICAgICBib29rOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ3RpdGxlJztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzZXJpZXM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBnclR5cGUgPSAnb24nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucCArPSAnLCAjJztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChjYXNlc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZXNbdHlwZV0oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYGh0dHA6Ly93d3cuZGVyZWZlcmVyLm9yZy8/aHR0cHM6Ly93d3cuZ29vZHJlYWRzLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgIGlucC5yZXBsYWNlKCclJywgJycpXHJcbiAgICAgICAgICAgICkucmVwbGFjZShcIidcIiwgJyUyNycpfSZzZWFyY2hfdHlwZT1ib29rcyZzZWFyY2glNUJmaWVsZCU1RD0ke2dyVHlwZX1gO1xyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBSZXR1cm4gYSBjbGVhbmVkIGJvb2sgdGl0bGUgZnJvbSBhbiBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSB0aXRsZSB0ZXh0XHJcbiAgICAgKiBAcGFyYW0gYXV0aCBBIHN0cmluZyBvZiBhdXRob3JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1RpdGxlID0gYXN5bmMgKFxyXG4gICAgICAgIGRhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aDogc3RyaW5nID0gJydcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0Qm9va1RpdGxlKCkgZmFpbGVkOyBlbGVtZW50IHdhcyBudWxsIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZXh0cmFjdGVkID0gZGF0YS5pbm5lclRleHQ7XHJcbiAgICAgICAgLy8gU2hvcnRlbiB0aXRsZSBhbmQgY2hlY2sgaXQgZm9yIGJyYWNrZXRzICYgYXV0aG9yIG5hbWVzXHJcbiAgICAgICAgZXh0cmFjdGVkID0gVXRpbC50cmltU3RyaW5nKFV0aWwuYnJhY2tldFJlbW92ZXIoZXh0cmFjdGVkKSwgNTApO1xyXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwuY2hlY2tEYXNoZXMoZXh0cmFjdGVkLCBhdXRoKTtcclxuICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIEdSLWZvcm1hdHRlZCBhdXRob3JzIGFzIGFuIGFycmF5IGxpbWl0ZWQgdG8gYG51bWBcclxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIGF1dGhvciBsaW5rc1xyXG4gICAgICogQHBhcmFtIG51bSBUaGUgbnVtYmVyIG9mIGF1dGhvcnMgdG8gcmV0dXJuLiBEZWZhdWx0IDNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rQXV0aG9ycyA9IGFzeW5jIChcclxuICAgICAgICBkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgbnVtOiBudW1iZXIgPSAzXHJcbiAgICApID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tBdXRob3JzKCkgZmFpbGVkOyBlbGVtZW50IHdhcyBudWxsIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoYXV0aG9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobnVtID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhMaXN0LnB1c2goVXRpbC5nb29kcmVhZHMuc21hcnRBdXRoKGF1dGhvci5pbm5lclRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICBudW0tLTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXRoTGlzdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBSZXR1cm4gc2VyaWVzIGFzIGFuIGFycmF5XHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBzZXJpZXMgbGlua3NcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rU2VyaWVzID0gYXN5bmMgKGRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignZ2V0Qm9va1NlcmllcygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LnB1c2goc2VyaWVzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWVzTGlzdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBSZXR1cm4gYSB0YWJsZS1saWtlIGFycmF5IG9mIHJvd3MgYXMgYW4gb2JqZWN0LlxyXG4gICAgICogU3RvcmUgdGhlIHJldHVybmVkIG9iamVjdCBhbmQgYWNjZXNzIHVzaW5nIHRoZSByb3cgdGl0bGUsIGV4LiBgc3RvcmVkWydUaXRsZTonXWBcclxuICAgICAqIEBwYXJhbSByb3dMaXN0IEFuIGFycmF5IG9mIHRhYmxlLWxpa2Ugcm93c1xyXG4gICAgICogQHBhcmFtIHRpdGxlQ2xhc3MgVGhlIGNsYXNzIHVzZWQgYnkgdGhlIHRpdGxlIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0TGVmdGBcclxuICAgICAqIEBwYXJhbSBkYXRhQ2xhc3MgVGhlIGNsYXNzIHVzZWQgYnkgdGhlIGRhdGEgY2VsbHMuIERlZmF1bHQgYC50b3JEZXRSaWdodGBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByb3dzVG9PYmogPSAoXHJcbiAgICAgICAgcm93TGlzdDogTm9kZUxpc3RPZjxFbGVtZW50PixcclxuICAgICAgICB0aXRsZUNsYXNzID0gJy50b3JEZXRMZWZ0JyxcclxuICAgICAgICBkYXRhQ2xhc3MgPSAnLnRvckRldFJpZ2h0J1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgaWYgKHJvd0xpc3QubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFV0aWwucm93c1RvT2JqKCAke3Jvd0xpc3R9ICk6IFJvdyBsaXN0IHdhcyBlbXB0eSFgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgcm93czogYW55W10gPSBbXTtcclxuXHJcbiAgICAgICAgcm93TGlzdC5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJvdy5xdWVyeVNlbGVjdG9yKHRpdGxlQ2xhc3MpO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3RvcihkYXRhQ2xhc3MpO1xyXG4gICAgICAgICAgICBpZiAodGl0bGUpIHtcclxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiB0aXRsZS50ZXh0Q29udGVudCxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZGF0YSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdSb3cgdGl0bGUgd2FzIGVtcHR5IScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiByb3dzLnJlZHVjZSgob2JqLCBpdGVtKSA9PiAoKG9ialtpdGVtLmtleV0gPSBpdGVtLnZhbHVlKSwgb2JqKSwge30pO1xyXG4gICAgfTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjIENsYXNzIGZvciBoYW5kbGluZyB2YWxpZGF0aW9uICYgY29uZmlybWF0aW9uXHJcbiAqL1xyXG5jbGFzcyBDaGVjayB7XHJcbiAgICBwdWJsaWMgc3RhdGljIG5ld1Zlcjogc3RyaW5nID0gR01faW5mby5zY3JpcHQudmVyc2lvbjtcclxuICAgIHB1YmxpYyBzdGF0aWMgcHJldlZlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ21wX3ZlcnNpb24nKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICogV2FpdCBmb3IgYW4gZWxlbWVudCB0byBleGlzdCwgdGhlbiByZXR1cm4gaXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIFRoZSBET00gc3RyaW5nIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHNlbGVjdCBhbiBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEhUTUxFbGVtZW50Pn0gUHJvbWlzZSBvZiBhbiBlbGVtZW50IHRoYXQgd2FzIHNlbGVjdGVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZWxlbUxvYWQoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBmYWxzZT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgTG9va2luZyBmb3IgJHtzZWxlY3Rvcn1gLCAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1NTUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IF9jb3VudGVyID0gMDtcclxuICAgICAgICBjb25zdCBfY291bnRlckxpbWl0ID0gMTAwO1xyXG4gICAgICAgIGNvbnN0IGxvZ2ljID0gYXN5bmMgKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+ID0+IHtcclxuICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBhY3R1YWwgZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChlbGVtID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IGAke3NlbGVjdG9yfSBpcyB1bmRlZmluZWQhYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA8IF9jb3VudGVyTGltaXQpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuYWZUaW1lcigpO1xyXG4gICAgICAgICAgICAgICAgX2NvdW50ZXIrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBsb2dpYyhzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA+PSBfY291bnRlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBfY291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbG9naWMoc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBSdW4gYSBmdW5jdGlvbiB3aGVuZXZlciBhbiBlbGVtZW50IGNoYW5nZXNcclxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFRoZSBlbGVtZW50IHRvIGJlIG9ic2VydmVkLiBDYW4gYmUgYSBzdHJpbmcuXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIG9ic2VydmVyIHRyaWdnZXJzXHJcbiAgICAgKiBAcmV0dXJuIFByb21pc2Ugb2YgYSBtdXRhdGlvbiBvYnNlcnZlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1PYnNlcnZlcihcclxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGNhbGxiYWNrOiBNdXRhdGlvbkNhbGxiYWNrLFxyXG4gICAgICAgIGNvbmZpZzogTXV0YXRpb25PYnNlcnZlckluaXQgPSB7XHJcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcclxuICAgICAgICB9XHJcbiAgICApOiBQcm9taXNlPE11dGF0aW9uT2JzZXJ2ZXI+IHtcclxuICAgICAgICBsZXQgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgc2VsZWN0ZWQgPSA8SFRNTEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGRuJ3QgZmluZCAnJHtzZWxlY3Rvcn0nYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgYCVjIFNldHRpbmcgb2JzZXJ2ZXIgb24gJHtzZWxlY3Rvcn06ICR7c2VsZWN0ZWR9YCxcclxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kOiAjMjIyOyBjb2xvcjogIzVkOGFhOCdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihjYWxsYmFjayk7XHJcblxyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoc2VsZWN0ZWQhLCBjb25maWcpO1xyXG4gICAgICAgIHJldHVybiBvYnNlcnZlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBzY3JpcHQgaGFzIGJlZW4gdXBkYXRlZCBmcm9tIGFuIG9sZGVyIHZlcnNpb25cclxuICAgICAqIEByZXR1cm4gVGhlIHZlcnNpb24gc3RyaW5nIG9yIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlZCgpOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5ncm91cCgnQ2hlY2sudXBkYXRlZCgpJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQUkVWIFZFUiA9ICR7dGhpcy5wcmV2VmVyfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTkVXIFZFUiA9ICR7dGhpcy5uZXdWZXJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBEaWZmZXJlbnQgdmVyc2lvbnM7IHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMubmV3VmVyICE9PSB0aGlzLnByZXZWZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaXMgbmV3IG9yIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmVyc2lvblxyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3ZlcnNpb24nLCB0aGlzLm5ld1Zlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcmV2VmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNjcmlwdCBoYXMgcnVuIGJlZm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGhhcyBydW4gYmVmb3JlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgndXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBGaXJzdC10aW1lIHJ1blxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGhhcyBuZXZlciBydW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIG1vc3QgYmFzaWMgZmVhdHVyZXNcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnZ29vZHJlYWRzQnRuJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2FsZXJ0cycsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ2ZpcnN0UnVuJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IG5vdCB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ2hlY2sgdG8gc2VlIHdoYXQgcGFnZSBpcyBiZWluZyBhY2Nlc3NlZFxyXG4gICAgICogQHBhcmFtIHtWYWxpZFBhZ2V9IHBhZ2VRdWVyeSAtIEFuIG9wdGlvbmFsIHBhZ2UgdG8gc3BlY2lmaWNhbGx5IGNoZWNrIGZvclxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmc+fSBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fSBPcHRpb25hbGx5LCBhIGJvb2xlYW4gaWYgdGhlIGN1cnJlbnQgcGFnZSBtYXRjaGVzIHRoZSBgcGFnZVF1ZXJ5YFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UocGFnZVF1ZXJ5PzogVmFsaWRQYWdlKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVkUGFnZSA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xyXG4gICAgICAgIGxldCBjdXJyZW50UGFnZTogVmFsaWRQYWdlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBiZWVuIHJ1biBhbmQgYSB2YWx1ZSB3YXMgc3RvcmVkXHJcbiAgICAgICAgICAgIGlmIChzdG9yZWRQYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGp1c3QgY2hlY2tpbmcgd2hhdCBwYWdlIHdlJ3JlIG9uLCByZXR1cm4gdGhlIHN0b3JlZCBwYWdlXHJcbiAgICAgICAgICAgICAgICBpZiAoIXBhZ2VRdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RvcmVkUGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY2hlY2tpbmcgZm9yIGEgc3BlY2lmaWMgcGFnZSwgcmV0dXJuIFRSVUUvRkFMU0VcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFnZVF1ZXJ5ID09PSBzdG9yZWRQYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjay5wYWdlKCkgaGFzIG5vdCBwcmV2aW91cyBydW5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGguaW5kZXhPZignLnBocCcpID8gcGF0aC5zcGxpdCgnLnBocCcpWzBdIDogcGF0aDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBwYXRoLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICBwYWdlLnNoaWZ0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBhZ2UgVVJMIEAgJHtwYWdlLmpvaW4oJyAtPiAnKX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IGxpdGVyYWwgb2Ygc29ydHMgdG8gdXNlIGFzIGEgXCJzd2l0Y2hcIlxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FzZXM6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gVmFsaWRQYWdlIHwgdW5kZWZpbmVkIH0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJyc6ICgpID0+ICdob21lJyxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogKCkgPT4gJ2hvbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3V0Ym94OiAoKSA9PiAnc2hvdXRib3gnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiAoKSA9PiAnc2V0dGluZ3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbGxpb25haXJlczogKCkgPT4gJ3ZhdWx0JyxcclxuICAgICAgICAgICAgICAgICAgICB0OiAoKSA9PiAndG9ycmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdTogKCkgPT4gJ3VzZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGY6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VbMV0gPT09ICd0JykgcmV0dXJuICdmb3J1bSB0aHJlYWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG9yOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAnYnJvd3NlJykgcmV0dXJuICdicm93c2UnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAncmVxdWVzdHMyJykgcmV0dXJuICdyZXF1ZXN0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3ZpZXdSZXF1ZXN0JykgcmV0dXJuICdyZXF1ZXN0IGRldGFpbHMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndXBsb2FkJykgcmV0dXJuICd1cGxvYWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgY2FzZSB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhc2VzW3BhZ2VbMF1dKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSBjYXNlc1twYWdlWzBdXSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFBhZ2UgXCIke3BhZ2V9XCIgaXMgbm90IGEgdmFsaWQgTSsgcGFnZS4gUGF0aDogJHtwYXRofWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBwYWdlIHRvIGJlIGFjY2Vzc2VkIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJywgY3VycmVudFBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJyZW50UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IGN1cnJlbnRQYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiBhIGdpdmVuIGNhdGVnb3J5IGlzIGFuIGVib29rL2F1ZGlvYm9vayBjYXRlZ29yeVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzQm9va0NhdChjYXQ6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIEN1cnJlbnRseSwgYWxsIGJvb2sgY2F0ZWdvcmllcyBhcmUgYXNzdW1lZCB0byBiZSBpbiB0aGUgcmFuZ2Ugb2YgMzktMTIwXHJcbiAgICAgICAgcmV0dXJuIGNhdCA+PSAzOSAmJiBjYXQgPD0gMTIwID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcblxyXG4vKipcclxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbHVlcyBhbmQgbWV0aG9kcyByZWxhdGVkIHRvIHN0eWxlc1xyXG4gKiBAY29uc3RydWN0b3IgSW5pdGlhbGl6ZXMgdGhlbWUgYmFzZWQgb24gbGFzdCBzYXZlZCB2YWx1ZTsgY2FuIGJlIGNhbGxlZCBiZWZvcmUgcGFnZSBjb250ZW50IGlzIGxvYWRlZFxyXG4gKiBAbWV0aG9kIHRoZW1lIEdldHMgb3Igc2V0cyB0aGUgY3VycmVudCB0aGVtZVxyXG4gKi9cclxuY2xhc3MgU3R5bGUge1xyXG4gICAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3ByZXZUaGVtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfY3NzRGF0YTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIFRoZSBsaWdodCB0aGVtZSBpcyB0aGUgZGVmYXVsdCB0aGVtZSwgc28gdXNlIE0rIExpZ2h0IHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gJ2xpZ2h0JztcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBwcmV2aW91c2x5IHVzZWQgdGhlbWUgb2JqZWN0XHJcbiAgICAgICAgdGhpcy5fcHJldlRoZW1lID0gdGhpcy5fZ2V0UHJldlRoZW1lKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgZXhpc3RzLCBhc3N1bWUgdGhlIGN1cnJlbnQgdGhlbWUgaXMgaWRlbnRpY2FsXHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZUaGVtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcHJldlRoZW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2Fybignbm8gcHJldmlvdXMgdGhlbWUnKTtcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggdGhlIENTUyBkYXRhXHJcbiAgICAgICAgdGhpcy5fY3NzRGF0YSA9IEdNX2dldFJlc291cmNlVGV4dCgnTVBfQ1NTJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSByZXR1cm5lZCAqL1xyXG4gICAgZ2V0IHRoZW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgc2V0ICovXHJcbiAgICBzZXQgdGhlbWUodmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl90aGVtZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyB0aGUgTSsgdGhlbWUgYmFzZWQgb24gdGhlIHNpdGUgdGhlbWUgKi9cclxuICAgIHB1YmxpYyBhc3luYyBhbGlnblRvU2l0ZVRoZW1lKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHRoZW1lOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZXRTaXRlQ1NTKCk7XHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGVtZS5pbmRleE9mKCdkYXJrJykgPiAwID8gJ2RhcmsnIDogJ2xpZ2h0JztcclxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB0aGlzLl90aGVtZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRQcmV2VGhlbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluamVjdCB0aGUgQ1NTIGNsYXNzIHVzZWQgYnkgTSsgZm9yIHRoZW1pbmdcclxuICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xyXG4gICAgICAgICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKGBtcF8ke3RoaXMuX3RoZW1lfWApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEJvZHkgaXMgJHtib2R5fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEluamVjdHMgdGhlIHN0eWxlc2hlZXQgbGluayBpbnRvIHRoZSBoZWFkZXIgKi9cclxuICAgIHB1YmxpYyBpbmplY3RMaW5rKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkOiBzdHJpbmcgPSAnbXBfY3NzJztcclxuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkge1xyXG4gICAgICAgICAgICBjb25zdCBzdHlsZTogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHN0eWxlLmlubmVyVGV4dCA9IHRoaXMuX2Nzc0RhdGEgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2Nzc0RhdGEgOiAnJztcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpIS5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBhbiBlbGVtZW50IHdpdGggdGhlIGlkIFwiJHtpZH1cIiBhbHJlYWR5IGV4aXN0c2ApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgaWYgaXQgZXhpc3RzICovXHJcbiAgICBwcml2YXRlIF9nZXRQcmV2VGhlbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gR01fZ2V0VmFsdWUoJ3N0eWxlX3RoZW1lJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNhdmVzIHRoZSBjdXJyZW50IHRoZW1lIGZvciBmdXR1cmUgcmVmZXJlbmNlICovXHJcbiAgICBwcml2YXRlIF9zZXRQcmV2VGhlbWUoKTogdm9pZCB7XHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3N0eWxlX3RoZW1lJywgdGhpcy5fdGhlbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFNpdGVDU1MoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhlbWVVUkw6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2hlYWQgbGlua1tocmVmKj1cIklDR3N0YXRpb25cIl0nKSFcclxuICAgICAgICAgICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVtZVVSTCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUodGhlbWVVUkwpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oYHRoZW1lVXJsIGlzIG5vdCBhIHN0cmluZzogJHt0aGVtZVVSTH1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxyXG4vKipcclxuICogQ09SRSBGRUFUVVJFU1xyXG4gKlxyXG4gKiBZb3VyIGZlYXR1cmUgYmVsb25ncyBoZXJlIGlmIHRoZSBmZWF0dXJlOlxyXG4gKiBBKSBpcyBjcml0aWNhbCB0byB0aGUgdXNlcnNjcmlwdFxyXG4gKiBCKSBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG90aGVyIGZlYXR1cmVzXHJcbiAqIEMpIHdpbGwgaGF2ZSBzZXR0aW5ncyBkaXNwbGF5ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2VcclxuICogSWYgQSAmIEIgYXJlIG1ldCBidXQgbm90IEMgY29uc2lkZXIgdXNpbmcgYFV0aWxzLnRzYCBpbnN0ZWFkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZmVhdHVyZSBjcmVhdGVzIGEgcG9wLXVwIG5vdGlmaWNhdGlvblxyXG4gKi9cclxuY2xhc3MgQWxlcnRzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2FsZXJ0cycsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNKyBBbGVydCBwYW5lbCBmb3IgdXBkYXRlIGluZm9ybWF0aW9uLCBldGMuJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2godGhpcy5fc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3RpZnkoa2luZDogc3RyaW5nIHwgYm9vbGVhbiwgbG9nOiBBcnJheU9iamVjdCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFsZXJ0cy5ub3RpZnkoICR7a2luZH0gKWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFZlcmlmeSBhIG5vdGlmaWNhdGlvbiByZXF1ZXN0IHdhcyBtYWRlXHJcbiAgICAgICAgICAgIGlmIChraW5kKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgbm90aWZpY2F0aW9ucyBhcmUgYWxsb3dlZFxyXG4gICAgICAgICAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdhbGVydHMnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG1zZyB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRNc2cgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycjogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICApOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZE1zZyggJHt0aXRsZX0gKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYXJyYXkgaXNuJ3QgZW1wdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPiAwICYmIGFyclswXSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNlY3Rpb24gaGVhZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1zZzogc3RyaW5nID0gYDxoND4ke3RpdGxlfTo8L2g0Pjx1bD5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaXRlbSBpbiB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gYDxsaT4ke2l0ZW19PC9saT5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJzwvdWw+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBub3RpZmljYXRpb24gcGFuZWxcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsZFBhbmVsID0gKG1zZzogc3RyaW5nKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkUGFuZWwoICR7bXNnfSApYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSdtcF9ub3RpZmljYXRpb24nPiR7bXNnfTxzcGFuPlg8L3NwYW4+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0JveDogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9ub3RpZmljYXRpb24nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnRuOiBIVE1MU3BhbkVsZW1lbnQgPSBtc2dCb3gucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VCdG4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLCByZW1vdmUgaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1zZ0JveCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2dCb3gucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAndXBkYXRlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgdXBkYXRlIG1lc3NhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYDxzdHJvbmc+TUFNKyBoYXMgYmVlbiB1cGRhdGVkITwvc3Ryb25nPiBZb3UgYXJlIG5vdyB1c2luZyB2JHtNUC5WRVJTSU9OfSwgY3JlYXRlZCBvbiAke01QLlRJTUVTVEFNUH0uIERpc2N1c3MgaXQgb24gPGEgaHJlZj0nZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjMnPnRoZSBmb3J1bXM8L2E+Ljxocj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNoYW5nZWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5VUERBVEVfTElTVCwgJ0NoYW5nZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuQlVHX0xJU1QsICdLbm93biBCdWdzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAnZmlyc3RSdW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxoND5XZWxjb21lIHRvIE1BTSshPC9oND5QbGVhc2UgaGVhZCBvdmVyIHRvIHlvdXIgPGEgaHJlZj1cIi9wcmVmZXJlbmNlcy9pbmRleC5waHBcIj5wcmVmZXJlbmNlczwvYT4gdG8gZW5hYmxlIHRoZSBNQU0rIHNldHRpbmdzLjxicj5BbnkgYnVnIHJlcG9ydHMsIGZlYXR1cmUgcmVxdWVzdHMsIGV0Yy4gY2FuIGJlIG1hZGUgb24gPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy9pc3N1ZXNcIj5HaXRodWI8L2E+LCA8YSBocmVmPVwiL2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzXCI+dGhlIGZvcnVtczwvYT4sIG9yIDxhIGhyZWY9XCIvc2VuZG1lc3NhZ2UucGhwP3JlY2VpdmVyPTEwODMwM1wiPnRocm91Z2ggcHJpdmF0ZSBtZXNzYWdlPC9hPi4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyBmaXJzdCBydW4gbWVzc2FnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFJlY2VpdmVkIG1zZyBraW5kOiAke2tpbmR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFuZWwobWVzc2FnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVidWcgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZGVidWcnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdFcnJvciBsb2cgKDxlbT5DbGljayB0aGlzIGNoZWNrYm94IHRvIGVuYWJsZSB2ZXJib3NlIGxvZ2dpbmcgdG8gdGhlIGNvbnNvbGU8L2VtPiknLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBHTE9CQUwgRkVBVFVSRVNcclxuICovXHJcblxyXG5jbGFzcyBIaWRlSG9tZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnZHJvcGRvd24nLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZUhvbWUnLFxyXG4gICAgICAgIHRhZzogJ1JlbW92ZSBiYW5uZXIvaG9tZScsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnRG8gbm90IHJlbW92ZSBlaXRoZXInLFxyXG4gICAgICAgICAgICBoaWRlQmFubmVyOiAnSGlkZSB0aGUgYmFubmVyJyxcclxuICAgICAgICAgICAgaGlkZUhvbWU6ICdIaWRlIHRoZSBob21lIGJ1dHRvbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBoZWFkZXIgaW1hZ2Ugb3IgSG9tZSBidXR0b24sIGJlY2F1c2UgYm90aCBsaW5rIHRvIHRoZSBob21lcGFnZScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5tZW51JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGhpZGVyOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSh0aGlzLl9zZXR0aW5ncy50aXRsZSk7XHJcbiAgICAgICAgaWYgKGhpZGVyID09PSAnaGlkZUhvbWUnKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9ob21lJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgaG9tZSBidXR0b24hJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChoaWRlciA9PT0gJ2hpZGVCYW5uZXInKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9iYW5uZXInKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBiYW5uZXIhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBEcm9wZG93blNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVmF1bHRMaW5rIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd2YXVsdExpbmsnLFxyXG4gICAgICAgIGRlc2M6ICdNYWtlIHRoZSBWYXVsdCBsaW5rIGJ5cGFzcyB0aGUgVmF1bHQgSW5mbyBwYWdlJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKSFcclxuICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvbWlsbGlvbmFpcmVzL2RvbmF0ZS5waHAnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBNYWRlIHRoZSB2YXVsdCB0ZXh0IGxpbmsgdG8gdGhlIGRvbmF0ZSBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWluaVZhdWx0SW5mbyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnbWluaVZhdWx0SW5mbycsXHJcbiAgICAgICAgZGVzYzogJ1Nob3J0ZW4gdGhlIFZhdWx0IGxpbmsgJiByYXRpbyB0ZXh0JyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgdmF1bHRUZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc3QgcmF0aW9UZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJykhO1xyXG5cclxuICAgICAgICAvLyBTaG9ydGVuIHRoZSByYXRpbyB0ZXh0XHJcbiAgICAgICAgLy8gVE9ETzogbW92ZSB0aGlzIHRvIGl0cyBvd24gc2V0dGluZz9cclxuICAgICAgICAvKiBUaGlzIGNoYWluZWQgbW9uc3Ryb3NpdHkgZG9lcyB0aGUgZm9sbG93aW5nOlxyXG4gICAgICAgIC0gRXh0cmFjdCB0aGUgbnVtYmVyICh3aXRoIGZsb2F0KSBmcm9tIHRoZSBlbGVtZW50XHJcbiAgICAgICAgLSBGaXggdGhlIGZsb2F0IHRvIDIgZGVjaW1hbCBwbGFjZXMgKHdoaWNoIGNvbnZlcnRzIGl0IGJhY2sgaW50byBhIHN0cmluZylcclxuICAgICAgICAtIENvbnZlcnQgdGhlIHN0cmluZyBiYWNrIGludG8gYSBudW1iZXIgc28gdGhhdCB3ZSBjYW4gY29udmVydCBpdCB3aXRoYHRvTG9jYWxlU3RyaW5nYCB0byBnZXQgY29tbWFzIGJhY2sgKi9cclxuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoVXRpbC5leHRyYWN0RmxvYXQocmF0aW9UZXh0KVswXS50b0ZpeGVkKDIpKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgIHJhdGlvVGV4dC5pbm5lckhUTUwgPSBgJHtudW19IDxpbWcgc3JjPVwiL3BpYy91cGRvd25CaWcucG5nXCIgYWx0PVwicmF0aW9cIj5gO1xyXG5cclxuICAgICAgICAvLyBUdXJuIHRoZSBudW1lcmljIHBvcnRpb24gb2YgdGhlIHZhdWx0IGxpbmsgaW50byBhIG51bWJlclxyXG4gICAgICAgIGxldCBuZXdUZXh0OiBudW1iZXIgPSBwYXJzZUludChcclxuICAgICAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50IS5zcGxpdCgnOicpWzFdLnNwbGl0KCcgJylbMV0ucmVwbGFjZSgvLC9nLCAnJylcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IHRoZSB2YXVsdCBhbW91bnQgdG8gbWlsbGlvbnRoc1xyXG4gICAgICAgIG5ld1RleHQgPSBOdW1iZXIoKG5ld1RleHQgLyAxZTYpLnRvRml4ZWQoMykpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdmF1bHQgdGV4dFxyXG4gICAgICAgIHZhdWx0VGV4dC50ZXh0Q29udGVudCA9IGBWYXVsdDogJHtuZXdUZXh0fSBtaWxsaW9uYDtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaG9ydGVuZWQgdGhlIHZhdWx0ICYgcmF0aW8gbnVtYmVycyEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJvbnVzUG9pbnREZWx0YSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYm9udXNQb2ludERlbHRhJyxcclxuICAgICAgICBkZXNjOiBgRGlzcGxheSBob3cgbWFueSBib251cyBwb2ludHMgeW91J3ZlIGdhaW5lZCBzaW5jZSBsYXN0IHBhZ2Vsb2FkYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG1CUCc7XHJcbiAgICBwcml2YXRlIF9wcmV2QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9jdXJyZW50QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9kZWx0YTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50QlBFbDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG5cclxuICAgICAgICAvLyBHZXQgb2xkIEJQIHZhbHVlXHJcbiAgICAgICAgdGhpcy5fcHJldkJQID0gdGhpcy5fZ2V0QlAoKTtcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRCUEVsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgbnVtYmVyIGZyb20gdGhlIEJQIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudDogUmVnRXhwTWF0Y2hBcnJheSA9IGN1cnJlbnRCUEVsLnRleHRDb250ZW50IS5tYXRjaChcclxuICAgICAgICAgICAgICAgIC9cXGQrL2dcclxuICAgICAgICAgICAgKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IG5ldyBCUCB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50QlAgPSBwYXJzZUludChjdXJyZW50WzBdKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0QlAodGhpcy5fY3VycmVudEJQKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWx0YVxyXG4gICAgICAgICAgICB0aGlzLl9kZWx0YSA9IHRoaXMuX2N1cnJlbnRCUCAtIHRoaXMuX3ByZXZCUDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRleHQgaWYgbm90IDBcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlbHRhICE9PSAwICYmICFpc05hTih0aGlzLl9kZWx0YSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3BsYXlCUCh0aGlzLl9kZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlzcGxheUJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCBib251c0JveDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGxldCBkZWx0YUJveDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgIGRlbHRhQm94ID0gYnAgPiAwID8gYCske2JwfWAgOiBgJHticH1gO1xyXG5cclxuICAgICAgICBpZiAoYm9udXNCb3ggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgYm9udXNCb3guaW5uZXJIVE1MICs9IGA8c3BhbiBjbGFzcz0nbXBfYnBEZWx0YSc+ICgke2RlbHRhQm94fSk8L3NwYW4+YDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgX3NldEJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1WYWxgLCBgJHticH1gKTtcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9nZXRCUCA9ICgpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCk7XHJcbiAgICAgICAgaWYgKHN0b3JlZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChzdG9yZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBCbHVycmVkSGVhZGVyIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdibHVycmVkSGVhZGVyJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIgYXJlYWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NpdGVNYWluID4gaGVhZGVyJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgaGVhZGVyOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAke3RoaXMuX3Rhcn1gKTtcclxuICAgICAgICBjb25zdCBoZWFkZXJJbWc6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoYGltZ2ApO1xyXG5cclxuICAgICAgICBpZiAoaGVhZGVySW1nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlclNyYzogc3RyaW5nIHwgbnVsbCA9IGhlYWRlckltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGJhY2tncm91bmRcclxuICAgICAgICAgICAgY29uc3QgYmx1cnJlZEJhY2s6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZCgnbXBfYmx1cnJlZEJhY2snKTtcclxuICAgICAgICAgICAgaGVhZGVyLmFwcGVuZChibHVycmVkQmFjayk7XHJcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGhlYWRlclNyYyA/IGB1cmwoJHtoZWFkZXJTcmN9KWAgOiAnJztcclxuICAgICAgICAgICAgYmx1cnJlZEJhY2suY2xhc3NMaXN0LmFkZCgnbXBfY29udGFpbmVyJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBhIGJsdXJyZWQgYmFja2dyb3VuZCB0byB0aGUgaGVhZGVyIScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdHlwZSBzZWxlY3RlZCBmb3IgYHRoaXMuX3NldHRpbmdzYFxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWRlU2VlZGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZVNlZWRib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIGRlc2M6ICdSZW1vdmUgdGhlIFwiR2V0IEEgU2VlZGJveFwiIG1lbnUgaXRlbScsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUnO1xyXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzZWVkYm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjbWVudSAuc2JEb25DcnlwdG8nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoc2VlZGJveEJ0bikgc2VlZGJveEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiAjIyMgQWRkcyBhYmlsaXR5IHRvIGdpZnQgbmV3ZXN0IDEwIG1lbWJlcnMgdG8gTUFNIG9uIEhvbWVwYWdlIG9yIG9wZW4gdGhlaXIgdXNlciBwYWdlc1xyXG4gKi9cclxuY2xhc3MgR2lmdE5ld2VzdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dpZnROZXdlc3QnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYnV0dG9ucyB0byBHaWZ0L09wZW4gYWxsIG5ld2VzdCBtZW1iZXJzYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZnBOTSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy9lbnN1cmUgZ2lmdGVkIGxpc3QgaXMgdW5kZXIgNTAgbWVtYmVyIG5hbWVzIGxvbmdcclxuICAgICAgICB0aGlzLl90cmltR2lmdExpc3QoKTtcclxuICAgICAgICAvL2dldCB0aGUgRnJvbnRQYWdlIE5ld01lbWJlcnMgZWxlbWVudCBjb250YWluaW5nIG5ld2VzdCAxMCBtZW1iZXJzXHJcbiAgICAgICAgY29uc3QgZnBOTSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc3QgbWVtYmVyczogSFRNTEFuY2hvckVsZW1lbnRbXSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKFxyXG4gICAgICAgICAgICBmcE5NLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGxhc3RNZW0gPSBtZW1iZXJzW21lbWJlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgbWVtYmVycy5mb3JFYWNoKChtZW1iZXIpID0+IHtcclxuICAgICAgICAgICAgLy9hZGQgYSBjbGFzcyB0byB0aGUgZXhpc3RpbmcgZWxlbWVudCBmb3IgdXNlIGluIHJlZmVyZW5jZSBpbiBjcmVhdGluZyBidXR0b25zXHJcbiAgICAgICAgICAgIG1lbWJlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYG1wX3JlZlBvaW50XyR7VXRpbC5lbmRPZkhyZWYobWVtYmVyKX1gKTtcclxuICAgICAgICAgICAgLy9pZiB0aGUgbWVtYmVyIGhhcyBiZWVuIGdpZnRlZCB0aHJvdWdoIHRoaXMgZmVhdHVyZSBwcmV2aW91c2x5XHJcbiAgICAgICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpLmluZGV4T2YoVXRpbC5lbmRPZkhyZWYobWVtYmVyKSkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9hZGQgY2hlY2tlZCBib3ggdG8gdGV4dFxyXG4gICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCA9IGAke21lbWJlci5pbm5lclRleHR9IFxcdTI2MTFgO1xyXG4gICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcclxuICAgICAgICBsZXQgZ2lmdFZhbHVlU2V0dGluZzogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ3VzZXJHaWZ0RGVmYXVsdF92YWwnKTtcclxuICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMCBvciBzZXQgdG8gbWF4IG9yIG1pblxyXG4gICAgICAgIC8vIFRPRE86IE1ha2UgdGhlIGdpZnQgdmFsdWUgY2hlY2sgaW50byBhIFV0aWxcclxuICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcclxuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpID4gMTAwMCB8fCBpc05hTihOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwMCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPCA1KSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY3JlYXRlIHRoZSB0ZXh0IGlucHV0IGZvciBob3cgbWFueSBwb2ludHMgdG8gZ2l2ZVxyXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoZ2lmdEFtb3VudHMsIHtcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBzaXplOiAnMycsXHJcbiAgICAgICAgICAgIGlkOiAnbXBfZ2lmdEFtb3VudHMnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ1ZhbHVlIGJldHdlZW4gNSBhbmQgMTAwMCcsXHJcbiAgICAgICAgICAgIHZhbHVlOiBnaWZ0VmFsdWVTZXR0aW5nLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vaW5zZXJ0IHRoZSB0ZXh0IGJveCBhZnRlciB0aGUgbGFzdCBtZW1iZXJzIG5hbWVcclxuICAgICAgICBsYXN0TWVtLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBnaWZ0QW1vdW50cyk7XHJcblxyXG4gICAgICAgIC8vbWFrZSB0aGUgYnV0dG9uIGFuZCBpbnNlcnQgYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lIChiZWZvcmUgdGhlIGlucHV0IHRleHQpXHJcbiAgICAgICAgY29uc3QgZ2lmdEFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAnZ2lmdEFsbCcsXHJcbiAgICAgICAgICAgICdHaWZ0IEFsbDogJyxcclxuICAgICAgICAgICAgJ2J1dHRvbicsXHJcbiAgICAgICAgICAgIGAubXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihsYXN0TWVtKX1gLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAnbXBfYnRuJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9hZGQgYSBzcGFjZSBiZXR3ZWVuIGJ1dHRvbiBhbmQgdGV4dFxyXG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcclxuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblRvcCA9ICc1cHgnO1xyXG5cclxuICAgICAgICBnaWZ0QWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBmaXJzdENhbGw6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHRoZSB0ZXh0IHRvIHNob3cgcHJvY2Vzc2luZ1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmlubmVyVGV4dCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHVzZXIgaGFzIG5vdCBiZWVuIGdpZnRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSBtZW1iZXIuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgcG9pbnRzIGFtb3VudCBmcm9tIHRoZSBpbnB1dCBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJhbmRvbSBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0RmluYWxBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd2FpdCAzIHNlY29uZHMgYmV0d2VlbiBKU09OIGNhbGxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdENhbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0Q2FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCgzMDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcXVlc3Qgc2VuZGluZyBwb2ludHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvblJlc3VsdDogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgZ2lmdCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBvZmYgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuaW5uZXJUZXh0ID0gYCR7bWVtYmVyLmlubmVyVGV4dH0gXFx1MjYxMWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZCgnbXBfZ2lmdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBtZW1iZXIgdG8gdGhlIHN0b3JlZCBtZW1iZXIgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21wX2xhc3ROZXdHaWZ0ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke1V0aWwuZW5kT2ZIcmVmKG1lbWJlcil9LCR7R01fZ2V0VmFsdWUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtcF9sYXN0TmV3R2lmdGVkJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvbiBhZnRlciBzZW5kXHJcbiAgICAgICAgICAgICAgICAoZ2lmdEFsbEJ0biBhcyBIVE1MSW5wdXRFbGVtZW50KS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxyXG4gICAgICAgICAgICAgICAgICAgICdHaWZ0cyBjb21wbGV0ZWQgdG8gYWxsIENoZWNrZWQgVXNlcnMnO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vbmV3bGluZSBiZXR3ZWVuIGVsZW1lbnRzXHJcbiAgICAgICAgbWVtYmVyc1ttZW1iZXJzLmxlbmd0aCAtIDFdLmFmdGVyKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgIC8vbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBpbnB1dCBib3ggYW5kIGVuc3VyZSBpdHMgYmV0d2VlbiA1IGFuZCAxMDAwLCBpZiBub3QgZGlzYWJsZSBidXR0b25cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlVG9OdW1iZXI6IFN0cmluZyA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxyXG4gICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRBbGwgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbCcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpIDwgNSB8fFxyXG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ0Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgR2lmdCBBbGwgJHt2YWx1ZVRvTnVtYmVyfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9hZGQgYSBidXR0b24gdG8gb3BlbiBhbGwgdW5naWZ0ZWQgbWVtYmVycyBpbiBuZXcgdGFic1xyXG4gICAgICAgIGNvbnN0IG9wZW5BbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ29wZW5UYWJzJyxcclxuICAgICAgICAgICAgJ09wZW4gVW5naWZ0ZWQgSW4gVGFicycsXHJcbiAgICAgICAgICAgICdidXR0b24nLFxyXG4gICAgICAgICAgICAnW2lkPW1wX2dpZnRBbW91bnRzXScsXHJcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICdtcF9idG4nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgb3BlbkFsbEJ0bi5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ09wZW4gbmV3IHRhYiBmb3IgZWFjaCcpO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4obWVtYmVyLmhyZWYsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2dldCB0aGUgY3VycmVudCBhbW91bnQgb2YgYm9udXMgcG9pbnRzIGF2YWlsYWJsZSB0byBzcGVuZFxyXG4gICAgICAgIGxldCBib251c1BvaW50c0F2YWlsOiBzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG1CUCcpIS5pbm5lclRleHQ7XHJcbiAgICAgICAgLy9nZXQgcmlkIG9mIHRoZSBkZWx0YSBkaXNwbGF5XHJcbiAgICAgICAgaWYgKGJvbnVzUG9pbnRzQXZhaWwuaW5kZXhPZignKCcpID49IDApIHtcclxuICAgICAgICAgICAgYm9udXNQb2ludHNBdmFpbCA9IGJvbnVzUG9pbnRzQXZhaWwuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgIGJvbnVzUG9pbnRzQXZhaWwuaW5kZXhPZignKCcpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcmVjcmVhdGUgdGhlIGJvbnVzIHBvaW50cyBpbiBuZXcgc3BhbiBhbmQgaW5zZXJ0IGludG8gZnBOTVxyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBtZXNzYWdlU3Bhbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2dpZnRBbGxNc2cnKTtcclxuICAgICAgICBtZXNzYWdlU3Bhbi5pbm5lclRleHQgPSAnQXZhaWxhYmxlICcgKyBib251c1BvaW50c0F2YWlsO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpIS5hZnRlcihtZXNzYWdlU3Bhbik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuYWZ0ZXIoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XHJcbiAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhXHJcbiAgICAgICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgJzxicj4nKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgZ2lmdCBuZXcgbWVtYmVycyBidXR0b24gdG8gSG9tZSBwYWdlLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFRyaW1zIHRoZSBnaWZ0ZWQgbGlzdCB0byBsYXN0IDUwIG5hbWVzIHRvIGF2b2lkIGdldHRpbmcgdG9vIGxhcmdlIG92ZXIgdGltZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdHJpbUdpZnRMaXN0KCkge1xyXG4gICAgICAgIC8vaWYgdmFsdWUgZXhpc3RzIGluIEdNXHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykpIHtcclxuICAgICAgICAgICAgLy9HTSB2YWx1ZSBpcyBhIGNvbW1hIGRlbGltIHZhbHVlLCBzcGxpdCB2YWx1ZSBpbnRvIGFycmF5IG9mIG5hbWVzXHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnROYW1lcyA9IEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgbGV0IG5ld0dpZnROYW1lczogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0TmFtZXMubGVuZ3RoID4gNTApIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2lmdE5hbWUgb2YgZ2lmdE5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnROYW1lcy5pbmRleE9mKGdpZnROYW1lKSA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlYnVpbGQgYSBjb21tYSBkZWxpbSBzdHJpbmcgb3V0IG9mIHRoZSBmaXJzdCA0OSBuYW1lc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdHaWZ0TmFtZXMgPSBuZXdHaWZ0TmFtZXMgKyBnaWZ0TmFtZSArICcsJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXQgbmV3IHN0cmluZyBpbiBHTVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsIG5ld0dpZnROYW1lcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9zZXQgdmFsdWUgaWYgZG9lc250IGV4aXN0XHJcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJywgJycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyMgQWRkcyBhYmlsaXR5IHRvIGhpZGUgbmV3cyBpdGVtcyBvbiB0aGUgcGFnZVxyXG4gKi9cclxuY2xhc3MgSGlkZU5ld3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Ib21lLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZU5ld3MnLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgZGVzYzogJ1RpZHkgdGhlIGhvbWVwYWdlIGFuZCBhbGxvdyBOZXdzIHRvIGJlIGhpZGRlbicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLm1haW5QYWdlTmV3c0hlYWQnO1xyXG4gICAgcHJpdmF0ZSBfdmFsdWVUaXRsZTogc3RyaW5nID0gYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9X3ZhbGA7XHJcbiAgICBwcml2YXRlIF9pY29uID0gJ1xcdTI3NGUnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gTk9URTogZm9yIGRldmVsb3BtZW50XHJcbiAgICAgICAgLy8gR01fZGVsZXRlVmFsdWUodGhpcy5fdmFsdWVUaXRsZSk7Y29uc29sZS53YXJuKGBWYWx1ZSBvZiAke3RoaXMuX3ZhbHVlVGl0bGV9IHdpbGwgYmUgZGVsZXRlZCFgKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvY2soKTtcclxuICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5fY2hlY2tGb3JTZWVuKCk7XHJcbiAgICAgICAgdGhpcy5fYWRkSGlkZXJCdXR0b24oKTtcclxuICAgICAgICAvLyB0aGlzLl9jbGVhblZhbHVlcygpOyAvLyBGSVg6IE5vdCB3b3JraW5nIGFzIGludGVuZGVkXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENsZWFuZWQgdXAgdGhlIGhvbWUgcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBfY2hlY2tGb3JTZWVuID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHByZXZWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSk7XHJcbiAgICAgICAgY29uc3QgbmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGhpcy5fdmFsdWVUaXRsZSwgJzpcXG4nLCBwcmV2VmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAocHJldlZhbHVlICYmIG5ld3MpIHtcclxuICAgICAgICAgICAgLy8gVXNlIHRoZSBpY29uIHRvIHNwbGl0IG91dCB0aGUga25vd24gaGlkZGVuIG1lc3NhZ2VzXHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkFycmF5ID0gcHJldlZhbHVlLnNwbGl0KHRoaXMuX2ljb24pO1xyXG4gICAgICAgICAgICAvKiBJZiBhbnkgb2YgdGhlIGhpZGRlbiBtZXNzYWdlcyBtYXRjaCBhIGN1cnJlbnQgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgcmVtb3ZlIHRoZSBjdXJyZW50IG1lc3NhZ2UgZnJvbSB0aGUgRE9NICovXHJcbiAgICAgICAgICAgIGhpZGRlbkFycmF5LmZvckVhY2goKGhpZGRlbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbmV3cy5mb3JFYWNoKChlbnRyeSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS50ZXh0Q29udGVudCA9PT0gaGlkZGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGN1cnJlbnQgbWVzc2FnZXMsIGhpZGUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluUGFnZU5ld3NTdWInKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9yZW1vdmVDbG9jayA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBjbG9jazogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IC5mcFRpbWUnKTtcclxuICAgICAgICBpZiAoY2xvY2spIGNsb2NrLnJlbW92ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBfYWRqdXN0SGVhZGVyU2l6ZSA9IChzZWxlY3Rvcjogc3RyaW5nLCB2aXNpYmxlPzogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld3NIZWFkZXI6IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICBpZiAobmV3c0hlYWRlcikge1xyXG4gICAgICAgICAgICBpZiAodmlzaWJsZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIG5ld3NIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5ld3NIZWFkZXIuc3R5bGUuZm9udFNpemUgPSAnMmVtJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgX2FkZEhpZGVyQnV0dG9uID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuICAgICAgICBpZiAoIW5ld3MpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggbmV3cyBlbnRyeVxyXG4gICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgYnV0dG9uXHJcbiAgICAgICAgICAgIGNvbnN0IHhidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgeGJ1dHRvbi50ZXh0Q29udGVudCA9IHRoaXMuX2ljb247XHJcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cih4YnV0dG9uLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZTogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbi1yaWdodDowLjdlbTtjdXJzb3I6cG9pbnRlcjsnLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6ICdtcF9jbGVhckJ0bicsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrc1xyXG4gICAgICAgICAgICB4YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiBjbGlja2VkLCBhcHBlbmQgdGhlIGNvbnRlbnQgb2YgdGhlIGN1cnJlbnQgbmV3cyBwb3N0IHRvIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gbGlzdCBvZiByZW1lbWJlcmVkIG5ld3MgaXRlbXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpXHJcbiAgICAgICAgICAgICAgICAgICAgPyBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKVxyXG4gICAgICAgICAgICAgICAgICAgIDogJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEhpZGluZy4uLiAke3ByZXZpb3VzVmFsdWV9JHtlbnRyeS50ZXh0Q29udGVudH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCBgJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XHJcbiAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBtb3JlIG5ld3MgaXRlbXMsIHJlbW92ZSB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkTmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkTmV3cyAmJiB1cGRhdGVkTmV3cy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIGJ1dHRvbiBhcyB0aGUgZmlyc3QgY2hpbGQgb2YgdGhlIGVudHJ5XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS5maXJzdENoaWxkKSBlbnRyeS5maXJzdENoaWxkLmJlZm9yZSh4YnV0dG9uKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgX2NsZWFuVmFsdWVzID0gKG51bSA9IDMpID0+IHtcclxuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYEdNX2dldFZhbHVlKCR7dGhpcy5fdmFsdWVUaXRsZX0pYCwgdmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGxhc3QgMyBzdG9yZWQgaXRlbXMgYWZ0ZXIgc3BsaXR0aW5nIHRoZW0gYXQgdGhlIGljb25cclxuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmFycmF5VG9TdHJpbmcodmFsdWUuc3BsaXQodGhpcy5faWNvbikuc2xpY2UoMCAtIG51bSkpO1xyXG4gICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZhbHVlXHJcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9nZXROZXdzSXRlbXMgPSAoKTogTm9kZUxpc3RPZjxIVE1MRGl2RWxlbWVudD4gfCBudWxsID0+IHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2W2NsYXNzXj1cIm1haW5QYWdlTmV3c1wiXScpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqIFNIQVJFRCBDT0RFXHJcbiAqXHJcbiAqIFRoaXMgaXMgZm9yIGFueXRoaW5nIHRoYXQncyBzaGFyZWQgYmV0d2VlbiBmaWxlcywgYnV0IGlzIG5vdCBnZW5lcmljIGVub3VnaCB0b1xyXG4gKiB0byBiZWxvbmcgaW4gYFV0aWxzLnRzYC4gSSBjYW4ndCB0aGluayBvZiBhIGJldHRlciB3YXkgdG8gY2F0ZWdvcml6ZSBEUlkgY29kZS5cclxuICovXHJcblxyXG5jbGFzcyBTaGFyZWQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWNlaXZlIGEgdGFyZ2V0IGFuZCBgdGhpcy5fc2V0dGluZ3MudGl0bGVgXHJcbiAgICAgKiBAcGFyYW0gdGFyIENTUyBzZWxlY3RvciBmb3IgYSB0ZXh0IGlucHV0IGJveFxyXG4gICAgICovXHJcbiAgICAvLyBUT0RPOiB3aXRoIGFsbCBDaGVja2luZyBiZWluZyBkb25lIGluIGBVdGlsLnN0YXJ0RmVhdHVyZSgpYCBpdCdzIG5vIGxvbmdlciBuZWNlc3NhcnkgdG8gQ2hlY2sgaW4gdGhpcyBmdW5jdGlvblxyXG4gICAgcHVibGljIGZpbGxHaWZ0Qm94ID0gKFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIHNldHRpbmdUaXRsZTogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5maWxsR2lmdEJveCggJHt0YXJ9LCAke3NldHRpbmdUaXRsZX0gKWApO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQodGFyKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50Qm94OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb2ludEJveCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJTZXRQb2ludHM6IG51bWJlciA9IHBhcnNlSW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtzZXR0aW5nVGl0bGV9X3ZhbGApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF4UG9pbnRzOiBudW1iZXIgPSBwYXJzZUludChwb2ludEJveC5nZXRBdHRyaWJ1dGUoJ21heCcpISk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTih1c2VyU2V0UG9pbnRzKSAmJiB1c2VyU2V0UG9pbnRzIDw9IG1heFBvaW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhQb2ludHMgPSB1c2VyU2V0UG9pbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwb2ludEJveC52YWx1ZSA9IG1heFBvaW50cy50b0ZpeGVkKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWF4UG9pbnRzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGxpc3Qgb2YgYWxsIHJlc3VsdHMgZnJvbSBCcm93c2UgcGFnZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0U2VhcmNoTGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZ2V0U2VhcmNoTGlzdCggKWApO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBzZWFyY2ggcmVzdWx0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3NzciB0cltpZCBePSBcInRkclwiXSB0ZCcpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiA9IDxcclxuICAgICAgICAgICAgICAgICAgICBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+XHJcbiAgICAgICAgICAgICAgICA+ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3NzciB0cltpZCBePSBcInRkclwiXScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBzbmF0Y2hMaXN0IGlzICR7c25hdGNoTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnb29kcmVhZHNCdXR0b25zID0gYXN5bmMgKFxyXG4gICAgICAgIGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zLi4uJyk7XHJcbiAgICAgICAgbGV0IHNlcmllc1A6IFByb21pc2U8c3RyaW5nW10+LCBhdXRob3JQOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xyXG5cclxuICAgICAgICBVdGlsLmFkZFRvckRldGFpbHNSb3codGFyZ2V0LCAnU2VhcmNoIEdvb2RyZWFkcycsICdtcF9nclJvdycpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IHRoZSBTZXJpZXMgYW5kIEF1dGhvclxyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxyXG4gICAgICAgICAgICAoYXV0aG9yUCA9IFV0aWwuZ2V0Qm9va0F1dGhvcnMoYXV0aG9yRGF0YSkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLm1wX2dyUm93IC5mbGV4Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdyAuZmxleCcpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnV0dG9uIHJvdyBjYW5ub3QgYmUgdGFyZ2V0ZWQhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCdWlsZCBTZXJpZXMgYnV0dG9uc1xyXG4gICAgICAgIHNlcmllc1AudGhlbigoc2VyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidXR0b25UaXRsZSA9IHNlci5sZW5ndGggPiAxID8gYFNlcmllczogJHtpdGVtfWAgOiAnU2VyaWVzJztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnc2VyaWVzJywgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCBidXR0b25UaXRsZSwgNCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgIGF1dGhvclBcclxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2F1dGhvcicsIGF1dGhvcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ0F1dGhvcicsIDMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXdhaXQgVXRpbC5nZXRCb29rVGl0bGUoYm9va0RhdGEsIGF1dGhvcnMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdib29rJywgdGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ1RpdGxlJywgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aG9ycyAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYm90aFVSTCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RpdGxlfSAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCBib3RoVVJMLCAnVGl0bGUgKyBBdXRob3InLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyFgKTtcclxuICAgIH07XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAqIEF1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLlxyXG4gKi9cclxuY2xhc3MgVG9yR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b3JHaWZ0RGVmYXVsdCcsXHJcbiAgICAgICAgdGFnOiAnRGVmYXVsdCBHaWZ0JyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiA1MDAwLCBtYXgnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy4gKDxlbT5PciB0aGUgbWF4IGFsbG93YWJsZSB2YWx1ZSwgd2hpY2hldmVyIGlzIGxvd2VyPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdGhhbmtzQXJlYSBpbnB1dFtuYW1lPXBvaW50c10nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gR29vZHJlYWRzXHJcbiAqL1xyXG5jbGFzcyBHb29kcmVhZHNCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvbicsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHIoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgR29vZHJlYWRzIGJ1dHRvbnMnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJyk7XHJcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjU2VyaWVzIGEnKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuZ29vZHJlYWRzQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlcyBhIGZpZWxkIGZvciBcIkN1cnJlbnRseSBSZWFkaW5nXCIgYmJjb2RlXHJcbiAqL1xyXG5jbGFzcyBDdXJyZW50bHlSZWFkaW5nIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGl0bGU6ICdjdXJyZW50bHlSZWFkaW5nJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGdlbmVyYXRlIGEgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGZvcnVtIHNuaXBwZXRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIEN1cnJlbnRseSBSZWFkaW5nIHNlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBHZXQgdGhlIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgY29uc3QgdGl0bGU6IHN0cmluZyA9IGRvY3VtZW50IS5xdWVyeVNlbGVjdG9yKCcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJykhXHJcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCE7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHRvcklEOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsyXTtcclxuICAgICAgICBjb25zdCByb3dUYXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbycpO1xyXG5cclxuICAgICAgICAvLyBUaXRsZSBjYW4ndCBiZSBudWxsXHJcbiAgICAgICAgaWYgKHRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGl0bGUgZmllbGQgd2FzIG51bGxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGEgbmV3IHRhYmxlIHJvd1xyXG4gICAgICAgIGNvbnN0IGNyUm93OiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IFV0aWwuYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICAgICAgcm93VGFyLFxyXG4gICAgICAgICAgICAnQ3VycmVudGx5IFJlYWRpbmcnLFxyXG4gICAgICAgICAgICAnbXBfY3JSb3cnXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBQcm9jZXNzIGRhdGEgaW50byBzdHJpbmdcclxuICAgICAgICBjb25zdCBibHVyYjogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2VuZXJhdGVTbmlwcGV0KHRvcklELCB0aXRsZSwgYXV0aG9ycyk7XHJcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXHJcbiAgICAgICAgY29uc3QgYnRuOiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IHRoaXMuX2J1aWxkQnV0dG9uKGNyUm93LCBibHVyYik7XHJcbiAgICAgICAgLy8gSW5pdCBidXR0b25cclxuICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihidG4sIGJsdXJiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQnVpbGQgYSBCQiBDb2RlIHRleHQgc25pcHBldCB1c2luZyB0aGUgYm9vayBpbmZvLCB0aGVuIHJldHVybiBpdFxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBzdHJpbmcgSUQgb2YgdGhlIGJvb2tcclxuICAgICAqIEBwYXJhbSB0aXRsZSBUaGUgc3RyaW5nIHRpdGxlIG9mIHRoZSBib29rXHJcbiAgICAgKiBAcGFyYW0gYXV0aG9ycyBBIG5vZGUgbGlzdCBvZiBhdXRob3IgbGlua3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTbmlwcGV0KFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PlxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIEFkZCBBdXRob3IgTGlua1xyXG4gICAgICAgICAqIEBwYXJhbSBhdXRob3JFbGVtIEEgbGluayBjb250YWluaW5nIGF1dGhvciBpbmZvcm1hdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGFkZEF1dGhvckxpbmsgPSAoYXV0aG9yRWxlbTogSFRNTEFuY2hvckVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGBbdXJsPSR7YXV0aG9yRWxlbS5ocmVmLnJlcGxhY2UoJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQnLCAnJyl9XSR7XHJcbiAgICAgICAgICAgICAgICBhdXRob3JFbGVtLnRleHRDb250ZW50XHJcbiAgICAgICAgICAgIH1bL3VybF1gO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIE5vZGVMaXN0IGludG8gYW4gQXJyYXkgd2hpY2ggaXMgZWFzaWVyIHRvIHdvcmsgd2l0aFxyXG4gICAgICAgIGxldCBhdXRob3JBcnJheTogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBhdXRob3JzLmZvckVhY2goKGF1dGhvckVsZW0pID0+IGF1dGhvckFycmF5LnB1c2goYWRkQXV0aG9yTGluayhhdXRob3JFbGVtKSkpO1xyXG4gICAgICAgIC8vIERyb3AgZXh0cmEgaXRlbXNcclxuICAgICAgICBpZiAoYXV0aG9yQXJyYXkubGVuZ3RoID4gMykge1xyXG4gICAgICAgICAgICBhdXRob3JBcnJheSA9IFsuLi5hdXRob3JBcnJheS5zbGljZSgwLCAzKSwgJ2V0Yy4nXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgW3VybD0vdC8ke2lkfV0ke3RpdGxlfVsvdXJsXSBieSBbaV0ke2F1dGhvckFycmF5LmpvaW4oJywgJyl9Wy9pXWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEJ1aWxkIGEgYnV0dG9uIG9uIHRoZSB0b3IgZGV0YWlscyBwYWdlXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFyZWEgd2hlcmUgdGhlIGJ1dHRvbiB3aWxsIGJlIGFkZGVkIGludG9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IENvbnRlbnQgdGhhdCB3aWxsIGJlIGFkZGVkIGludG8gdGhlIHRleHRhcmVhXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2J1aWxkQnV0dG9uKHRhcjogSFRNTERpdkVsZW1lbnQsIGNvbnRlbnQ6IHN0cmluZyk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICAvLyBCdWlsZCB0ZXh0IGRpc3BsYXlcclxuICAgICAgICB0YXIuaW5uZXJIVE1MID0gYDx0ZXh0YXJlYSByb3dzPVwiMVwiIGNvbHM9XCI4MFwiIHN0eWxlPSdtYXJnaW4tcmlnaHQ6NXB4Jz4ke2NvbnRlbnR9PC90ZXh0YXJlYT5gO1xyXG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbih0YXIsICdub25lJywgJ0NvcHknLCAyKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfY3JSb3cgLm1wX2J1dHRvbl9jbG9uZScpIS5jbGFzc0xpc3QuYWRkKCdtcF9yZWFkaW5nJyk7XHJcbiAgICAgICAgLy8gUmV0dXJuIGJ1dHRvblxyXG4gICAgICAgIHJldHVybiA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3JlYWRpbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIFByb3RlY3RzIHRoZSB1c2VyIGZyb20gcmF0aW8gdHJvdWJsZXMgYnkgYWRkaW5nIHdhcm5pbmdzIGFuZCBkaXNwbGF5aW5nIHJhdGlvIGRlbHRhXHJcbiAqL1xyXG5jbGFzcyBSYXRpb1Byb3RlY3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdCcsXHJcbiAgICAgICAgZGVzYzogYFByb3RlY3QgeW91ciByYXRpbyB3aXRoIHdhcm5pbmdzICZhbXA7IHJhdGlvIGNhbGN1bGF0aW9uc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIHJhdGlvIHByb3RlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBUaGUgZG93bmxvYWQgdGV4dCBhcmVhXHJcbiAgICAgICAgY29uc3QgZGxCdG46IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0ZGRsJyk7XHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnRseSB1bnVzZWQgbGFiZWwgYXJlYSBhYm92ZSB0aGUgZG93bmxvYWQgdGV4dFxyXG4gICAgICAgIGNvbnN0IGRsTGFiZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjZG93bmxvYWQgLnRvckRldElubmVyVG9wJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXHJcbiAgICAgICAgY29uc3Qgck5ldzogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIC8vIEN1cnJlbnQgcmF0aW9cclxuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xyXG4gICAgICAgIC8vIFNlZWRpbmcgb3IgZG93bmxvYWRpbmdcclxuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIGN1c3RvbSByYXRpbyBhbW91bnRzICh3aWxsIHJldHVybiBkZWZhdWx0IHZhbHVlcyBvdGhlcndpc2UpXHJcbiAgICAgICAgY29uc3QgW3IxLCByMiwgcjNdID0gdGhpcy5fY2hlY2tDdXN0b21TZXR0aW5ncygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFJhdGlvIHByb3RlY3Rpb24gbGV2ZWxzIHNldCB0bzogJHtyMX0sICR7cjJ9LCAke3IzfWApO1xyXG5cclxuICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY29kZSBpZiB0aGUgcmF0aW8gZXhpc3RzXHJcbiAgICAgICAgaWYgKHJOZXcgJiYgckN1cikge1xyXG4gICAgICAgICAgICBjb25zdCByRGlmZiA9IFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdIC0gVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF07XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgIGBDdXJyZW50ICR7VXRpbC5leHRyYWN0RmxvYXQockN1cilbMF19IHwgTmV3ICR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSB8IERpZiAke3JEaWZmfWBcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IGFjdGl2YXRlIGlmIGEgcmF0aW8gY2hhbmdlIGlzIGV4cGVjdGVkXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ockRpZmYpICYmIHJEaWZmID4gMC4wMDkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghc2VlZGluZyAmJiBkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgTk9UIGFscmVhZHkgc2VlZGluZyBvciBkb3dubG9hZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuaW5uZXJIVE1MID0gYFJhdGlvIGxvc3MgJHtyRGlmZi50b0ZpeGVkKDIpfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7IC8vVG8gZGlzdGluZ3Vpc2ggZnJvbSBCT0xEIFRpdGxlc1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkbEJ0biAmJiBkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJ0cml2aWFsIHJhdGlvIGxvc3NcIiB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBjaGFuZ2VzIHdpbGwgYWx3YXlzIGhhcHBlbiBpZiB0aGUgcmF0aW8gY29uZGl0aW9ucyBhcmUgbWV0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJEaWZmID4gcjEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1NwcmluZ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuY29sb3IgPSAnYmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJJIG5ldmVyIHdhbnQgdG8gZGwgdy9vIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHVzZXMgdGhlIE1pbmltdW0gUmF0aW8sIGlmIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIGRpc2FibGUgYnV0dG9uIHdpdGggYnV5IEZMIGJ1dHRvblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCBHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TWluX3ZhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy8vRGlzYWJsZSBsaW5rIHRvIHByZXZlbnQgZG93bmxvYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8vLyBkbEJ0bi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm8tZHJvcCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1heWJlIGhpZGUgdGhlIGJ1dHRvbiwgYW5kIGFkZCB0aGUgUmF0aW8gTG9zcyB3YXJuaW5nIGluIGl0cyBwbGFjZT9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uaW5uZXJIVE1MID0gJ0ZMIFJlY29tbWVuZGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyRGlmZiA+IHIyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0N1c3RvbVNldHRpbmdzKCkge1xyXG4gICAgICAgIGxldCBsMSA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwxX3ZhbCcpKTtcclxuICAgICAgICBsZXQgbDIgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMl92YWwnKSk7XHJcbiAgICAgICAgbGV0IGwzID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDNfdmFsJykpO1xyXG5cclxuICAgICAgICBpZiAoaXNOYU4obDMpKSBsMyA9IDE7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSAyIC8gMztcclxuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IDEgLyAzO1xyXG5cclxuICAgICAgICAvLyBJZiBzb21lb25lIHB1dCB0aGluZ3MgaW4gYSBkdW1iIG9yZGVyLCBpZ25vcmUgc21hbGxlciBudW1iZXJzXHJcbiAgICAgICAgaWYgKGwyID4gbDMpIGwyID0gbDM7XHJcbiAgICAgICAgaWYgKGwxID4gbDIpIGwxID0gbDI7XHJcblxyXG4gICAgICAgIC8vIElmIGN1c3RvbSBudW1iZXJzIGFyZSBzbWFsbGVyIHRoYW4gZGVmYXVsdCB2YWx1ZXMsIGlnbm9yZSB0aGUgbG93ZXIgd2FybmluZ1xyXG4gICAgICAgIGlmIChpc05hTihsMikpIGwyID0gbDMgPCAyIC8gMyA/IGwzIDogMiAvIDM7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSBsMiA8IDEgLyAzID8gbDIgOiAxIC8gMztcclxuXHJcbiAgICAgICAgcmV0dXJuIFtsMSwgbDIsIGwzXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIExvdyByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMScsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMScsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjMnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIHNtYWxsZXN0IHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBzbGlnaHQgY29sb3IgY2hhbmdlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTZXQgY3VzdG9tIEwxIFJhdGlvIFByb3RlY3Rpb24hJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIE1lZGl1bSByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDIgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMicsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMicsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjYnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIG1lZGlhbiB0aHJlc2hob2xkIHRvIHdhcm4gb2YgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgbm90aWNlYWJsZSBjb2xvciBjaGFuZ2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNldCBjdXN0b20gTDIgUmF0aW8gUHJvdGVjdGlvbiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogSGlnaCByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMycsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAxJyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBoaWdoZXN0IHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgZGlzYWJsZXMgZG93bmxvYWQgd2l0aG91dCBGTCB1c2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNldCBjdXN0b20gTDIgUmF0aW8gUHJvdGVjdGlvbiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TWluIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TWluJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0YWc6ICdNaW5pbXVtIFJhdGlvJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMDAnLFxyXG4gICAgICAgIGRlc2M6ICdUcmlnZ2VyIHRoZSBtYXhpbXVtIHdhcm5pbmcgaWYgeW91ciByYXRpbyB3b3VsZCBkcm9wIGJlbG93IHRoaXMgbnVtYmVyLicsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgY3VzdG9tIG1pbmltdW0gcmF0aW8hJyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogQWxsb3dzIGdpZnRpbmcgb2YgRkwgd2VkZ2UgdG8gbWVtYmVycyB0aHJvdWdoIGZvcnVtLlxyXG4gKi9cclxuY2xhc3MgRm9ydW1GTEdpZnQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkZvcnVtLFxyXG4gICAgICAgIHRpdGxlOiAnZm9ydW1GTEdpZnQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBUaGFuayBidXR0b24gdG8gZm9ydW0gcG9zdHMuICg8ZW0+U2VuZHMgYSBGTCB3ZWRnZTwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLmZvcnVtTGluayc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmb3J1bSB0aHJlYWQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIEZvcnVtIEdpZnQgQnV0dG9uLi4uJyk7XHJcbiAgICAgICAgLy9tYWluQm9keSBpcyBiZXN0IGVsZW1lbnQgd2l0aCBhbiBJRCBJIGNvdWxkIGZpbmQgdGhhdCBpcyBhIHBhcmVudCB0byBhbGwgZm9ydW0gcG9zdHNcclxuICAgICAgICBjb25zdCBtYWluQm9keSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKTtcclxuICAgICAgICAvL21ha2UgYXJyYXkgb2YgZm9ydW0gcG9zdHMgLSB0aGVyZSBpcyBvbmx5IG9uZSBjdXJzb3IgY2xhc3NlZCBvYmplY3QgcGVyIGZvcnVtIHBvc3QsIHNvIHRoaXMgd2FzIGJlc3QgdG8ga2V5IG9mZiBvZi4gd2lzaCB0aGVyZSB3ZXJlIG1vcmUgSURzIGFuZCBzdWNoIHVzZWQgaW4gZm9ydW1zXHJcbiAgICAgICAgY29uc3QgZm9ydW1Qb3N0czogSFRNTEFuY2hvckVsZW1lbnRbXSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKFxyXG4gICAgICAgICAgICBtYWluQm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2x0YWJsZScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2ZvciBlYWNoIHBvc3Qgb24gdGhlIHBhZ2VcclxuICAgICAgICBmb3J1bVBvc3RzLmZvckVhY2goKGZvcnVtUG9zdCkgPT4ge1xyXG4gICAgICAgICAgICAvL3dvcmsgb3VyIHdheSBkb3duIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwgdG8gZ2V0IHRvIG91ciBwb3N0XHJcbiAgICAgICAgICAgIGxldCBib3R0b21Sb3cgPSBmb3J1bVBvc3QuY2hpbGROb2Rlc1sxXTtcclxuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbNF07XHJcbiAgICAgICAgICAgIGJvdHRvbVJvdyA9IGJvdHRvbVJvdy5jaGlsZE5vZGVzWzNdO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgSUQgb2YgdGhlIGZvcnVtIGZyb20gdGhlIGN1c3RvbSBNQU0gYXR0cmlidXRlXHJcbiAgICAgICAgICAgIGxldCBwb3N0SUQgPSAoPEhUTUxFbGVtZW50PmZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgLy9tYW0gZGVjaWRlZCB0byBoYXZlIGEgZGlmZmVyZW50IHN0cnVjdHVyZSBmb3IgbGFzdCBmb3J1bS4gd2lzaCB0aGV5IGp1c3QgaGFkIElEcyBvciBzb21ldGhpbmcgaW5zdGVhZCBvZiBhbGwgdGhpcyBqdW1waW5nIGFyb3VuZFxyXG4gICAgICAgICAgICBpZiAocG9zdElEID09PSAnbGFzdCcpIHtcclxuICAgICAgICAgICAgICAgIHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchLnByZXZpb3VzU2libGluZyFcclxuICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGVsZW1lbnQgZm9yIG91ciBmZWF0dXJlXHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgICAgICAvL3NldCBzYW1lIGNsYXNzIGFzIG90aGVyIG9iamVjdHMgaW4gYXJlYSBmb3Igc2FtZSBwb2ludGVyIGFuZCBmb3JtYXR0aW5nIG9wdGlvbnNcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjdXJzb3InKTtcclxuICAgICAgICAgICAgLy9naXZlIG91ciBlbGVtZW50IGFuIElEIGZvciBmdXR1cmUgc2VsZWN0aW9uIGFzIG5lZWRlZFxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wXycgKyBwb3N0SUQgKyAnX3RleHQnKTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbmV3IGltZyBlbGVtZW50IHRvIGxlYWQgb3VyIG5ldyBmZWF0dXJlIHZpc3VhbHNcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEljb25HaWYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgLy91c2Ugc2l0ZSBmcmVlbGVlY2ggZ2lmIGljb24gZm9yIG91ciBmZWF0dXJlXHJcbiAgICAgICAgICAgIGdpZnRJY29uR2lmLnNldEF0dHJpYnV0ZShcclxuICAgICAgICAgICAgICAgICdzcmMnLFxyXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvMTA4MzAzL3RoYW5rLmdpZidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgLy9tYWtlIHRoZSBnaWYgaWNvbiB0aGUgZmlyc3QgY2hpbGQgb2YgZWxlbWVudFxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChnaWZ0SWNvbkdpZik7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSBmZWF0dXJlIGVsZW1lbnQgaW4gbGluZSB3aXRoIHRoZSBjdXJzb3Igb2JqZWN0IHdoaWNoIGlzIHRoZSBxdW90ZSBhbmQgcmVwb3J0IGJ1dHRvbnMgYXQgYm90dG9tXHJcbiAgICAgICAgICAgIGJvdHRvbVJvdy5hcHBlbmRDaGlsZChnaWZ0RWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICAvL21ha2UgaXQgYSBidXR0b24gdmlhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdG8gYXZvaWQgYnV0dG9uIHRyaWdnZXJpbmcgbW9yZSB0aGFuIG9uY2UgcGVyIHBhZ2UgbG9hZCwgY2hlY2sgaWYgYWxyZWFkeSBoYXZlIGpzb24gcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kdWUgdG8gbGFjayBvZiBJRHMgYW5kIGNvbmZsaWN0aW5nIHF1ZXJ5IHNlbGVjdGFibGUgZWxlbWVudHMsIG5lZWQgdG8ganVtcCB1cCBhIGZldyBwYXJlbnQgbGV2ZWxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RQYXJlbnROb2RlID0gZ2lmdEVsZW1lbnQucGFyZW50RWxlbWVudCEucGFyZW50RWxlbWVudCFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnRFbGVtZW50ITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmNlIGF0IHBhcmVudCBub2RlIG9mIHRoZSBwb3N0LCBmaW5kIHRoZSBwb3N0ZXIncyB1c2VyIGlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJFbGVtID0gcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi91L1wiXWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgVVJMIG9mIHRoZSBwb3N0IHRvIGFkZCB0byBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RVUkwgPSAoPEhUTUxFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoYGFbaHJlZl49XCIvZi90L1wiXWApIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgTUFNIHVzZXIgc2VuZGluZyBnaWZ0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZW5kZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck1lbnUnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFuIHVwIHRleHQgb2Ygc2VuZGVyIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIgPSBzZW5kZXIuc3Vic3RyaW5nKDAsIHNlbmRlci5pbmRleE9mKCcgJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdGl0bGUgb2YgdGhlIHBhZ2Ugc28gd2UgY2FuIHdyaXRlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcnVtVGl0bGUgPSBkb2N1bWVudC50aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jdXQgZG93biBmbHVmZiBmcm9tIHBhZ2UgdGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ydW1UaXRsZSA9IGZvcnVtVGl0bGUuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlLmluZGV4T2YoJ3wnKSAtIDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSAoPEhUTUxFbGVtZW50PnVzZXJFbGVtISkuaW5uZXJUZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIGEgZ2lmdCByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1zZW5kV2VkZ2UmZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtzZW5kZXJ9IHdhbnRzIHRvIHRoYW5rIHlvdSBmb3IgeW91ciBjb250cmlidXRpb24gdG8gdGhlIGZvcnVtIHRvcGljIFt1cmw9aHR0cHM6Ly9teWFub25hbW91c2UubmV0JHtwb3N0VVJMfV0ke2ZvcnVtVGl0bGV9Wy91cmxdYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlICMgVVJJIGNvbXBhdGlibGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJyMnLCAnJTIzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlIE1BTSsganNvbiBnZXQgdXRpbGl0eSB0byBwcm9jZXNzIFVSTCBhbmQgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvblJlc3VsdDogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgZ2lmdCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgdGV4dCB0byBzaG93IHN1Y2Nlc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdGTCBHaWZ0IFN1Y2Nlc3NmdWwhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Jhc2VkIG9uIGZhaWx1cmUsIGFkZCBmZWF0dXJlIHRleHQgdG8gc2hvdyBmYWlsdXJlIHJlYXNvbiBvciBnZW5lcmljXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yID09PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1lvdSBjYW4gb25seSBzZW5kIGEgdXNlciBvbmUgd2VkZ2UgcGVyIGRheS4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IEFscmVhZHkgR2lmdGVkIFRoaXMgVXNlciBUb2RheSEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSW52YWxpZCB1c2VyLCB0aGlzIHVzZXIgaXMgbm90IGN1cnJlbnRseSBhY2NlcHRpbmcgd2VkZ2VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkOiBUaGlzIFVzZXIgRG9lcyBOb3QgQWNjZXB0IEdpZnRzISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmx5IGtub3duIGV4YW1wbGUgb2YgdGhpcyAnb3RoZXInIGlzIHdoZW4gZ2lmdGluZyB5b3Vyc2VsZlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgRmFpbGVkIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBQcm9jZXNzICYgcmV0dXJuIGluZm9ybWF0aW9uIGZyb20gdGhlIHNob3V0Ym94XHJcbiAqL1xyXG5jbGFzcyBQcm9jZXNzU2hvdXRzIHtcclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIHNob3V0Ym94IGZvciBjaGFuZ2VzLCB0cmlnZ2VyaW5nIGFjdGlvbnMgZm9yIGZpbHRlcmVkIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIG5hbWVzIChPcHRpb25hbCkgTGlzdCBvZiB1c2VybmFtZXMvSURzIHRvIGZpbHRlciBmb3JcclxuICAgICAqIEBwYXJhbSB1c2VydHlwZSAoT3B0aW9uYWwpIFdoYXQgZmlsdGVyIHRoZSBuYW1lcyBhcmUgZm9yLiBSZXF1aXJlZCBpZiBgbmFtZXNgIGlzIHByb3ZpZGVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTaG91dGJveChcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBuYW1lcz86IHN0cmluZ1tdLFxyXG4gICAgICAgIHVzZXJ0eXBlPzogU2hvdXRib3hVc2VyVHlwZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgICAgIHRhcixcclxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGU6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBsb29raW5nIGZvciBzcGVjaWZpYyB1c2Vycy4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXMgIT09IHVuZGVmaW5lZCAmJiBuYW1lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlcnR5cGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZXJ0eXBlIG11c3QgYmUgZGVmaW5lZCBpZiBmaWx0ZXJpbmcgbmFtZXMhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySUQ6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWZePVwiL3UvXCJdJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHJlZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAvdS8ke25hbWV9YCA9PT0gdXNlcklEIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2FzZWxlc3NTdHJpbmdNYXRjaChuYW1lLCB1c2VyTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZVNob3V0KG5vZGUsIHVzZXJ0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIHNob3V0Ym94IGZvciBjaGFuZ2VzLCB0cmlnZ2VyaW5nIGFjdGlvbnMgZm9yIGZpbHRlcmVkIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIGJ1dHRvbnMgTnVtYmVyIHRvIHJlcHJlc2VudCBjaGVja2JveCBzZWxlY3Rpb25zIDEgPSBSZXBseSwgMiA9IFJlcGx5IFdpdGggUXVvdGVcclxuICAgICAqIEBwYXJhbSBjaGFyTGltaXQgTnVtYmVyIG9mIGNoYXJhY3RlcnMgdG8gaW5jbHVkZSBpbiBxdW90ZSwgLCBjaGFyTGltaXQ/Om51bWJlciAtIEN1cnJlbnRseSB1bnVzZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB3YXRjaFNob3V0Ym94UmVwbHkodGFyOiBzdHJpbmcsIGJ1dHRvbnM/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCd3YXRjaFNob3V0Ym94UmVwbHkoJywgdGFyLCBidXR0b25zLCAnKScpO1xyXG5cclxuICAgICAgICBjb25zdCBfZ2V0UmF3Q29sb3IgPSAoZWxlbTogSFRNTFNwYW5FbGVtZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW0uc3R5bGUuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0uc3R5bGUuY29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmNvbG9yO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IF9nZXROYW1lQ29sb3IgPSAoZWxlbTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29sb3I6IHN0cmluZyB8IG51bGwgPSBfZ2V0UmF3Q29sb3IoZWxlbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmF3Q29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGhleFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJnYjogc3RyaW5nW10gPSBVdGlsLmJyYWNrZXRDb250ZW50cyhyYXdDb2xvcikuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbC5yZ2JUb0hleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzFdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzJdKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbGVtZW50IGlzIG51bGwhXFxuJHtlbGVtfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBfbWFrZU5hbWVUYWcgPSAobmFtZTogc3RyaW5nLCBoZXg6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWhleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBAW2ldJHtuYW1lfVsvaV1gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBAW2NvbG9yPSR7aGV4fV1baV0ke25hbWV9Wy9pXVsvY29sb3JdYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcmVwbHkgYm94XHJcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xyXG4gICAgICAgIC8vIE9ic2VydmUgdGhlIHNob3V0Ym94XHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKFxyXG4gICAgICAgICAgICB0YXIsXHJcbiAgICAgICAgICAgIChtdXRMaXN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzaG91dGJveCB1cGRhdGVzLCBwcm9jZXNzIHRoZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgbXV0TGlzdC5mb3JFYWNoKChtdXRSZWMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGNoYW5nZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgICAgICBtdXRSZWMuYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYWRkZWQgYnkgTUFNKyBmb3IgZ2lmdCBidXR0b24sIGlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIGlnbm9yZSBpZiB0aGUgbm9kZSBpcyBhIGRhdGUgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15tcF8vLnRlc3Qobm9kZURhdGEuZ2V0QXR0cmlidXRlKCdpZCcpISkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgbmFtZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG91dE5hbWU6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBVdGlsLm5vZGVUb0VsZW0oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkucXVlcnlTZWxlY3RvcignYVtocmVmXj1cIi91L1wiXSBzcGFuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyYWIgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIG5hbWUsIG9yIHRleHQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZUNvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldE5hbWVDb2xvcihzaG91dE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2V4dHJhY3QgdGhlIHVzZXJuYW1lIGZyb20gbm9kZSBmb3IgdXNlIGluIHJlcGx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIHNwYW4gZWxlbWVudCB0byBiZSBib2R5IG9mIGJ1dHRvbiBhZGRlZCB0byBwYWdlIC0gYnV0dG9uIHVzZXMgcmVsYXRpdmUgbm9kZSBjb250ZXh0IGF0IGNsaWNrIHRpbWUgdG8gZG8gY2FsY3VsYXRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGx5QnV0dG9uOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBhIFJlcGx5U2ltcGxlIHJlcXVlc3QsIHRoZW4gY3JlYXRlIFJlcGx5IFNpbXBsZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ1dHRvbnMgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGJ1dHRvbiB3aXRoIG9uY2xpY2sgYWN0aW9uIG9mIHNldHRpbmcgc2IgdGV4dCBmaWVsZCB0byB1c2VybmFtZSB3aXRoIHBvdGVudGlhbCBjb2xvciBibG9jayB3aXRoIGEgY29sb24gYW5kIHNwYWNlIHRvIHJlcGx5LCBmb2N1cyBjdXJzb3IgaW4gdGV4dCBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLmlubmVySFRNTCA9ICc8YnV0dG9uPlxcdTI5M2E8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignYnV0dG9uJykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIHN0eWxlZCBuYW1lIHRhZyB0byB0aGUgcmVwbHkgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG5vdGhpbmcgd2FzIGluIHRoZSByZXBseSBib3gsIGFkZCBhIGNvbG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXBseUJveC52YWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7X21ha2VOYW1lVGFnKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX06IGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICR7X21ha2VOYW1lVGFnKHVzZXJOYW1lLCBuYW1lQ29sb3IpfSBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIGEgcmVwbHlRdW90ZSByZXF1ZXN0LCB0aGVuIGNyZWF0ZSByZXBseSBxdW90ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYnV0dG9ucyA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYnV0dG9uIHdpdGggb25jbGljayBhY3Rpb24gb2YgZ2V0dGluZyB0aGF0IGxpbmUncyB0ZXh0LCBzdHJpcHBpbmcgZG93biB0byA2NSBjaGFyIHdpdGggbm8gd29yZCBicmVhaywgdGhlbiBpbnNlcnQgaW50byBTQiB0ZXh0IGZpZWxkLCBmb2N1cyBjdXJzb3IgaW4gdGV4dCBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLmlubmVySFRNTCA9ICc8YnV0dG9uPlxcdTI5M2Q8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignYnV0dG9uJykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5xdW90ZVNob3V0KG5vZGUsIDY1KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBxdW90ZSB0byByZXBseSBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtfbWFrZU5hbWVUYWcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogXFx1MjAxY1tpXSR7dGV4dH1bL2ldXFx1MjAxZCBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2l2ZSBzcGFuIGFuIElEIGZvciBwb3RlbnRpYWwgdXNlIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbXBfcmVwbHlCdXR0b24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnNlcnQgYnV0dG9uIHByaW9yIHRvIHVzZXJuYW1lIG9yIGFub3RoZXIgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKHJlcGx5QnV0dG9uLCBub2RlLmNoaWxkTm9kZXNbMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcXVvdGVTaG91dChzaG91dDogTm9kZSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB0ZXh0QXJyOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIC8vIEdldCBudW1iZXIgb2YgcmVwbHkgYnV0dG9ucyB0byByZW1vdmUgZnJvbSB0ZXh0XHJcbiAgICAgICAgY29uc3QgYnRuQ291bnQgPSBzaG91dC5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50IS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAnLm1wX3JlcGx5QnV0dG9uJ1xyXG4gICAgICAgICkubGVuZ3RoO1xyXG4gICAgICAgIC8vIEdldCB0aGUgdGV4dCBvZiBhbGwgY2hpbGQgbm9kZXNcclxuICAgICAgICBzaG91dC5jaGlsZE5vZGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIExpbmtzIGFyZW4ndCBjbGlja2FibGUgYW55d2F5IHNvIGdldCByaWQgb2YgdGhlbVxyXG4gICAgICAgICAgICBpZiAoY2hpbGQubm9kZU5hbWUgPT09ICdBJykge1xyXG4gICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKCdbTGlua10nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRleHRBcnIucHVzaChjaGlsZC50ZXh0Q29udGVudCEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gTWFrZSBhIHN0cmluZywgYnV0IHRvc3Mgb3V0IHRoZSBmaXJzdCBmZXcgbm9kZXNcclxuICAgICAgICBsZXQgbm9kZVRleHQgPSB0ZXh0QXJyLnNsaWNlKDMgKyBidG5Db3VudCkuam9pbignJyk7XHJcbiAgICAgICAgaWYgKG5vZGVUZXh0LmluZGV4T2YoJzonKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBub2RlVGV4dCA9IG5vZGVUZXh0LnN1YnN0cigyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBzaG91bGQgaGF2ZSBqdXN0IHRoZSBtZXNzYWdlIHRleHQuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBxdW90ZXMgdGhhdCBtaWdodCBiZSBjb250YWluZWQ6XHJcbiAgICAgICAgbm9kZVRleHQgPSBub2RlVGV4dC5yZXBsYWNlKC9cXHV7MjAxY30oLio/KVxcdXsyMDFkfS9ndSwgJycpO1xyXG4gICAgICAgIC8vIFRyaW0gdGhlIHRleHQgdG8gYSBtYXggbGVuZ3RoIGFuZCBhZGQgLi4uIGlmIHNob3J0ZW5lZFxyXG4gICAgICAgIGxldCB0cmltbWVkVGV4dCA9IFV0aWwudHJpbVN0cmluZyhub2RlVGV4dC50cmltKCksIGxlbmd0aCk7XHJcbiAgICAgICAgaWYgKHRyaW1tZWRUZXh0ICE9PSBub2RlVGV4dC50cmltKCkpIHtcclxuICAgICAgICAgICAgdHJpbW1lZFRleHQgKz0gJyBbXFx1MjAyNl0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBEb25lIVxyXG4gICAgICAgIHJldHVybiB0cmltbWVkVGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEV4dHJhY3QgaW5mb3JtYXRpb24gZnJvbSBzaG91dHNcclxuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgc2VsZWN0b3Igc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZ2V0IFRoZSByZXF1ZXN0ZWQgaW5mbyAoaHJlZiBvciB0ZXh0KVxyXG4gICAgICogQHJldHVybnMgVGhlIHN0cmluZyB0aGF0IHdhcyBzcGVjaWZpZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgIHNob3V0OiBOb2RlLFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIGdldDogJ2hyZWYnIHwgJ3RleHQnXHJcbiAgICApOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpO1xyXG5cclxuICAgICAgICBpZiAoc2hvdXQgIT09IG51bGwgJiYgIW5vZGVEYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgfCBudWxsID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KS5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgdGFyXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChzaG91dEVsZW0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBleHRyYWN0ZWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2V0ICE9PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHRyYWN0ZWQgPSBzaG91dEVsZW0uZ2V0QXR0cmlidXRlKGdldCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChleHRyYWN0ZWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBBdHRyaWJ1dGUgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEVsZW1lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIE5vZGUgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2UgdGhlIHN0eWxlIG9mIGEgc2hvdXQgYmFzZWQgb24gZmlsdGVyIGxpc3RzXHJcbiAgICAgKiBAcGFyYW0gc2hvdXQgVGhlIG5vZGUgY29udGFpbmluZyBzaG91dCBpbmZvXHJcbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgVGhlIHR5cGUgb2YgdXNlcnMgdGhhdCBoYXZlIGJlZW4gZmlsdGVyZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzdHlsZVNob3V0KHNob3V0OiBOb2RlLCB1c2VydHlwZTogU2hvdXRib3hVc2VyVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpO1xyXG4gICAgICAgIGlmICh1c2VydHlwZSA9PT0gJ3ByaW9yaXR5Jykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21TdHlsZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ3ByaW9yaXR5U3R5bGVfdmFsJyk7XHJcbiAgICAgICAgICAgIGlmIChjdXN0b21TdHlsZSkge1xyXG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSBgaHNsYSgke2N1c3RvbVN0eWxlfSlgO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnaHNsYSgwLDAlLDUwJSwwLjMpJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodXNlcnR5cGUgPT09ICdtdXRlJykge1xyXG4gICAgICAgICAgICBzaG91dEVsZW0uY2xhc3NMaXN0LmFkZCgnbXBfbXV0ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFByaW9yaXR5VXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5VXNlcnMnLFxyXG4gICAgICAgIHRhZzogJ0VtcGhhc2l6ZSBVc2VycycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gc3lzdGVtLCAyNTQyMCwgNzc2MTgnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdFbXBoYXNpemVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3guICg8ZW0+VGhpcyBhY2NlcHRzIHVzZXIgSURzIGFuZCB1c2VybmFtZXMuIEl0IGlzIG5vdCBjYXNlIHNlbnNpdGl2ZS48L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3ByaW9yaXR5VXNlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdwcmlvcml0eSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5zZXR0aW5ncy50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgaWYgKGdtVmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmlvcml0eVVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlcmxpc3QgaXMgbm90IGRlZmluZWQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveCh0aGlzLl90YXIsIHRoaXMuX3ByaW9yaXR5VXNlcnMsIHRoaXMuX3VzZXJUeXBlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBIaWdobGlnaHRpbmcgdXNlcnMgaW4gdGhlIHNob3V0Ym94Li4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgYSBjdXN0b20gYmFja2dyb3VuZCB0byBiZSBhcHBsaWVkIHRvIHByaW9yaXR5IHVzZXJzXHJcbiAqL1xyXG5jbGFzcyBQcmlvcml0eVN0eWxlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwcmlvcml0eVN0eWxlJyxcclxuICAgICAgICB0YWc6ICdFbXBoYXNpcyBTdHlsZScsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLCAwJSwgNTAlLCAwLjMnLFxyXG4gICAgICAgIGRlc2M6IGBDaGFuZ2UgdGhlIGNvbG9yL29wYWNpdHkgb2YgdGhlIGhpZ2hsaWdodGluZyBydWxlIGZvciBlbXBoYXNpemVkIHVzZXJzJyBwb3N0cy4gKDxlbT5UaGlzIGlzIGZvcm1hdHRlZCBhcyBIdWUgKDAtMzYwKSwgU2F0dXJhdGlvbiAoMC0xMDAlKSwgTGlnaHRuZXNzICgwLTEwMCUpLCBPcGFjaXR5ICgwLTEpPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0dGluZyBjdXN0b20gaGlnaGxpZ2h0IGZvciBwcmlvcml0eSB1c2Vycy4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBkZXNpcmVkIG11dGVkIHVzZXJzXHJcbiAqL1xyXG5jbGFzcyBNdXRlZFVzZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdtdXRlZFVzZXJzJyxcclxuICAgICAgICB0YWc6ICdNdXRlIHVzZXJzJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMjM0LCBnYXJkZW5zaGFkZScsXHJcbiAgICAgICAgZGVzYzogYE9ic2N1cmVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3ggdW50aWwgaG92ZXJlZC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfbXV0ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ211dGUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgIGlmIChnbVZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbXV0ZWRVc2VycyA9IGF3YWl0IFV0aWwuY3N2VG9BcnJheShnbVZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXJsaXN0IGlzIG5vdCBkZWZpbmVkIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9tdXRlZFVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gT2JzY3VyaW5nIG11dGVkIHVzZXJzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgR2lmdCBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXQgVHJpcGxlIGRvdCBtZW51XHJcbiAqL1xyXG5jbGFzcyBHaWZ0QnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dpZnRCdXR0b24nLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBHaWZ0IGJ1dHRvbiBpbiBTaG91dGJveCBkb3QtbWVudWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSW5pdGlhbGl6ZWQgR2lmdCBCdXR0b24uYCk7XHJcbiAgICAgICAgY29uc3Qgc2JmRGl2ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYmYnKSE7XHJcbiAgICAgICAgY29uc3Qgc2JmRGl2Q2hpbGQgPSBzYmZEaXYhLmZpcnN0Q2hpbGQ7XHJcblxyXG4gICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyIGZvciB3aGVuZXZlciBzb21ldGhpbmcgaXMgY2xpY2tlZCBpbiB0aGUgc2JmIGRpdlxyXG4gICAgICAgIHNiZkRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vcHVsbCB0aGUgZXZlbnQgdGFyZ2V0IGludG8gYW4gSFRNTCBFbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICAvL2FkZCB0aGUgVHJpcGxlIERvdCBNZW51IGFzIGFuIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKTtcclxuICAgICAgICAgICAgLy9maW5kIHRoZSBtZXNzYWdlIGRpdlxyXG4gICAgICAgICAgICBjb25zdCBzYk1lbnVQYXJlbnQgPSB0YXJnZXQhLmNsb3Nlc3QoYGRpdmApO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgZnVsbCB0ZXh0IG9mIHRoZSBtZXNzYWdlIGRpdlxyXG4gICAgICAgICAgICBsZXQgZ2lmdE1lc3NhZ2UgPSBzYk1lbnVQYXJlbnQhLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgLy9mb3JtYXQgbWVzc2FnZSB3aXRoIHN0YW5kYXJkIHRleHQgKyBtZXNzYWdlIGNvbnRlbnRzICsgc2VydmVyIHRpbWUgb2YgdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgZ2lmdE1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgYFNlbnQgb24gU2hvdXRib3ggbWVzc2FnZTogXCJgICtcclxuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZyhnaWZ0TWVzc2FnZS5pbmRleE9mKCc6ICcpICsgMikgK1xyXG4gICAgICAgICAgICAgICAgYFwiIGF0IGAgK1xyXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKDAsIDgpO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSB0YXJnZXQgb2YgdGhlIGNsaWNrIGlzIG5vdCB0aGUgVHJpcGxlIERvdCBNZW51IE9SXHJcbiAgICAgICAgICAgIC8vaWYgbWVudSBpcyBvbmUgb2YgeW91ciBvd24gY29tbWVudHMgKG9ubHkgd29ya3MgZm9yIGZpcnN0IDEwIG1pbnV0ZXMgb2YgY29tbWVudCBiZWluZyBzZW50KVxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAhdGFyZ2V0IS5jbG9zZXN0KCcuc2JfbWVudScpIHx8XHJcbiAgICAgICAgICAgICAgICBzYk1lbnVFbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWUnKSEgPT09ICcxJ1xyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2dldCB0aGUgTWVudSBhZnRlciBpdCBwb3BzIHVwXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBHaWZ0IEJ1dHRvbi4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCBwb3B1cE1lbnU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJyk7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoNSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCFwb3B1cE1lbnUhLmhhc0NoaWxkTm9kZXMoKSk7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSB1c2VyIGRldGFpbHMgZnJvbSB0aGUgcG9wdXAgbWVudSBkZXRhaWxzXHJcbiAgICAgICAgICAgIGNvbnN0IHBvcHVwVXNlcjogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0ocG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgLy9tYWtlIHVzZXJuYW1lIGVxdWFsIHRoZSBkYXRhLXVpZCwgZm9yY2Ugbm90IG51bGxcclxuICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IFN0cmluZyA9IHBvcHVwVXNlciEuZ2V0QXR0cmlidXRlKCdkYXRhLXVpZCcpITtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcclxuICAgICAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhleSBkaWQgbm90IHNldCBhIHZhbHVlIGluIHByZWZlcmVuY2VzLCBzZXQgdG8gMTAwXHJcbiAgICAgICAgICAgIGlmICghZ2lmdFZhbHVlU2V0dGluZykge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwMCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICc1JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgSFRNTCBkb2N1bWVudCB0aGF0IGhvbGRzIHRoZSBidXR0b24gYW5kIHZhbHVlIHRleHRcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEJ1dHRvbjogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ2lmdEJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgYXMgd2VsbCBhcyBhIHRleHQgZWxlbWVudCBmb3IgdmFsdWUgb2YgZ2lmdC4gUG9wdWxhdGUgd2l0aCB2YWx1ZSBmcm9tIHNldHRpbmdzXHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24uaW5uZXJIVE1MID0gYDxidXR0b24+R2lmdDogPC9idXR0b24+PHNwYW4+Jm5ic3A7PC9zcGFuPjxpbnB1dCB0eXBlPVwidGV4dFwiIHNpemU9XCIzXCIgaWQ9XCJtcF9naWZ0VmFsdWVcIiB0aXRsZT1cIlZhbHVlIGJldHdlZW4gNSBhbmQgMTAwMFwiIHZhbHVlPVwiJHtnaWZ0VmFsdWVTZXR0aW5nfVwiPmA7XHJcbiAgICAgICAgICAgIC8vYWRkIGdpZnQgZWxlbWVudCB3aXRoIGJ1dHRvbiBhbmQgdGV4dCB0byB0aGUgbWVudVxyXG4gICAgICAgICAgICBwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0uYXBwZW5kQ2hpbGQoZ2lmdEJ1dHRvbik7XHJcbiAgICAgICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyIGZvciB3aGVuIGdpZnQgYnV0dG9uIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3B1bGwgd2hhdGV2ZXIgdGhlIGZpbmFsIHZhbHVlIG9mIHRoZSB0ZXh0IGJveCBlcXVhbHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRGaW5hbEFtb3VudCA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRWYWx1ZScpXHJcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAvL2JlZ2luIHNldHRpbmcgdXAgdGhlIEdFVCByZXF1ZXN0IHRvIE1BTSBKU09OXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnaWZ0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgLy9hZGRlZCBtZXNzYWdlIGNvbnRlbnRzIGVuY29kZWQgdG8gcHJldmVudCB1bmludGVuZGVkIGNoYXJhY3RlcnMgZnJvbSBicmVha2luZyBKU09OIFVSTFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEZpbmFsQW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX0mbWVzc2FnZT0ke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgKX1gO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRIVFRQLnJlYWR5U3RhdGUgPT09IDQgJiYgZ2lmdEhUVFAuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZ2lmdEhUVFAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgbGluZSBpbiBTQiB0aGF0IHNob3dzIGdpZnQgd2FzIHN1Y2Nlc3NmdWwgdG8gYWNrbm93bGVkZ2UgZ2lmdCB3b3JrZWQvZmFpbGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0U3RhdHVzRWxlbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXZDaGlsZCEuYXBwZW5kQ2hpbGQobmV3RGl2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgZ2lmdCBzdWNjZWVkZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc01zZyA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBTdWNjZXNzZnVsOiBWYWx1ZTogJyArIGdpZnRGaW5hbEFtb3VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5hcHBlbmRDaGlsZChzdWNjZXNzTXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5jbGFzc0xpc3QuYWRkKCdtcF9zdWNjZXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWlsZWRNc2cgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUG9pbnRzIEdpZnQgRmFpbGVkOiBFcnJvcjogJyArIGpzb24uZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuYXBwZW5kQ2hpbGQoZmFpbGVkTXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5jbGFzc0xpc3QuYWRkKCdtcF9mYWlsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZnRlciB3ZSBhZGQgbGluZSBpbiBTQiwgc2Nyb2xsIHRvIGJvdHRvbSB0byBzaG93IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXYuc2Nyb2xsVG9wID0gc2JmRGl2LnNjcm9sbEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9hZnRlciB3ZSBhZGQgbGluZSBpbiBTQiwgc2Nyb2xsIHRvIGJvdHRvbSB0byBzaG93IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAvL3JldHVybiB0byBtYWluIFNCIHdpbmRvdyBhZnRlciBnaWZ0IGlzIGNsaWNrZWQgLSB0aGVzZSBhcmUgdHdvIHN0ZXBzIHRha2VuIGJ5IE1BTSB3aGVuIGNsaWNraW5nIG91dCBvZiBNZW51XHJcbiAgICAgICAgICAgICAgICBzYmZEaXZcclxuICAgICAgICAgICAgICAgICAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2JfY2xpY2tlZF9yb3cnKVswXSFcclxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudU1haW4nKSFcclxuICAgICAgICAgICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzYkJvdHRvbSBoaWRlTWUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignaW5wdXQnKSEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0VmFsdWUnKVxyXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPCA1IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gR2lmdCBCdXR0b24gYWRkZWQhYCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIFJlcGx5IGJ1dHRvbiB0byBiZSBhZGRlZCB0byBTaG91dFxyXG4gKi9cclxuY2xhc3MgUmVwbHlTaW1wbGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmVwbHlTaW1wbGUnLFxyXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5XCIsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIFJlcGx5IGJ1dHRvbiBpbiBTaG91dGJveDogJiMxMDU1NDtgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3JlcGx5U2ltcGxlOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlTaW1wbGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBSZXBseSBCdXR0b24uLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgUmVwbHkgV2l0aCBRdW90ZSBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXRcclxuICovXHJcbmNsYXNzIFJlcGx5UXVvdGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmVwbHlRdW90ZScsXHJcbiAgICAgICAgLy90YWc6IFwiUmVwbHkgV2l0aCBRdW90ZVwiLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSB3aXRoIFF1b3RlIGJ1dHRvbiBpbiBTaG91dGJveDogJiMxMDU1NztgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3JlcGx5UXVvdGU6IG51bWJlciA9IDI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94UmVwbHkodGhpcy5fdGFyLCB0aGlzLl9yZXBseVF1b3RlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgd2l0aCBRdW90ZSBCdXR0b24uLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGZlYXR1cmUgZm9yIGJ1aWxkaW5nIGEgbGlicmFyeSBvZiBxdWljayBzaG91dCBpdGVtcyB0aGF0IGNhbiBhY3QgYXMgYSBjb3B5L3Bhc3RlIHJlcGxhY2VtZW50LlxyXG4gKi9cclxuY2xhc3MgUXVpY2tTaG91dCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdxdWlja1Nob3V0JyxcclxuICAgICAgICBkZXNjOiBgQ3JlYXRlIGZlYXR1cmUgYmVsb3cgc2hvdXRib3ggdG8gc3RvcmUgcHJlLXNldCBtZXNzYWdlcy5gLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUXVpY2sgU2hvdXQgQnV0dG9ucy4uLmApO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBtYWluIHNob3V0Ym94IGlucHV0IGZpZWxkXHJcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xyXG4gICAgICAgIC8vZW1wdHkgSlNPTiB3YXMgZ2l2aW5nIG1lIGlzc3Vlcywgc28gZGVjaWRlZCB0byBqdXN0IG1ha2UgYW4gaW50cm8gZm9yIHdoZW4gdGhlIEdNIHZhcmlhYmxlIGlzIGVtcHR5XHJcbiAgICAgICAgbGV0IGpzb25MaXN0ID0gSlNPTi5wYXJzZShcclxuICAgICAgICAgICAgYHsgXCJJbnRyb1wiOlwiV2VsY29tZSB0byBRdWlja1Nob3V0IE1BTStlciEgSGVyZSB5b3UgY2FuIGNyZWF0ZSBwcmVzZXQgU2hvdXQgbWVzc2FnZXMgZm9yIHF1aWNrIHJlc3BvbnNlcyBhbmQga25vd2xlZGdlIHNoYXJpbmcuICdDbGVhcicgY2xlYXJzIHRoZSBlbnRyeSB0byBzdGFydCBzZWxlY3Rpb24gcHJvY2VzcyBvdmVyLiAnU2VsZWN0JyB0YWtlcyB3aGF0ZXZlciBRdWlja1Nob3V0IGlzIGluIHRoZSBUZXh0QXJlYSBhbmQgcHV0cyBpbiB5b3VyIFNob3V0IHJlc3BvbnNlIGFyZWEuICdTYXZlJyB3aWxsIHN0b3JlIHRoZSBTZWxlY3Rpb24gTmFtZSBhbmQgVGV4dCBBcmVhIENvbWJvIGZvciBmdXR1cmUgdXNlIGFzIGEgUXVpY2tTaG91dCwgYW5kIGhhcyBjb2xvciBpbmRpY2F0b3JzLiBHcmVlbiA9IHNhdmVkIGFzLWlzLiBZZWxsb3cgPSBRdWlja1Nob3V0IE5hbWUgZXhpc3RzIGFuZCBpcyBzYXZlZCwgYnV0IGNvbnRlbnQgZG9lcyBub3QgbWF0Y2ggd2hhdCBpcyBzdG9yZWQuIE9yYW5nZSA9IG5vIGVudHJ5IG1hdGNoaW5nIHRoYXQgbmFtZSwgbm90IHNhdmVkLiAnRGVsZXRlJyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGF0IGVudHJ5IGZyb20geW91ciBzdG9yZWQgUXVpY2tTaG91dHMgKGJ1dHRvbiBvbmx5IHNob3dzIHdoZW4gZXhpc3RzIGluIHN0b3JhZ2UpLiBGb3IgbmV3IGVudHJpZXMgaGF2ZSB5b3VyIFF1aWNrU2hvdXQgTmFtZSB0eXBlZCBpbiBCRUZPUkUgeW91IGNyYWZ0IHlvdXIgdGV4dCBvciByaXNrIGl0IGJlaW5nIG92ZXJ3cml0dGVuIGJ5IHNvbWV0aGluZyB0aGF0IGV4aXN0cyBhcyB5b3UgdHlwZSBpdC4gVGhhbmtzIGZvciB1c2luZyBNQU0rIVwiIH1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2dldCBTaG91dGJveCBESVZcclxuICAgICAgICBjb25zdCBzaG91dEJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcFNob3V0Jyk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGZvb3RlciB3aGVyZSB3ZSB3aWxsIGluc2VydCBvdXIgZmVhdHVyZVxyXG4gICAgICAgIGNvbnN0IHNob3V0Rm9vdCA9IDxIVE1MRWxlbWVudD5zaG91dEJveCEucXVlcnlTZWxlY3RvcignLmJsb2NrRm9vdCcpO1xyXG4gICAgICAgIC8vZ2l2ZSBpdCBhbiBJRCBhbmQgc2V0IHRoZSBzaXplXHJcbiAgICAgICAgc2hvdXRGb290IS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2Jsb2NrRm9vdCcpO1xyXG4gICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzIuNWVtJztcclxuICAgICAgICAvL2NyZWF0ZSBhIG5ldyBkaXZlIHRvIGhvbGQgb3VyIGNvbWJvQm94IGFuZCBidXR0b25zIGFuZCBzZXQgdGhlIHN0eWxlIGZvciBmb3JtYXR0aW5nXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5mbG9hdCA9ICdsZWZ0JztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luQm90dG9tID0gJy41ZW0nO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpblRvcCA9ICcuNWVtJztcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgbGFiZWwgdGV4dCBlbGVtZW50IGFuZCBhZGQgdGhlIHRleHQgYW5kIGF0dHJpYnV0ZXMgZm9yIElEXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdxdWlja1Nob3V0RGF0YScpO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuaW5uZXJUZXh0ID0gJ0Nob29zZSBhIFF1aWNrU2hvdXQnO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveExhYmVsJyk7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGlucHV0IGZpZWxkIHRvIGxpbmsgdG8gZGF0YWxpc3QgYW5kIGZvcm1hdCBzdHlsZVxyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94SW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuc3R5bGUubWFyZ2luTGVmdCA9ICcuNWVtJztcclxuICAgICAgICBjb21ib0JveElucHV0LnNldEF0dHJpYnV0ZSgnbGlzdCcsICdtcF9jb21ib0JveExpc3QnKTtcclxuICAgICAgICBjb21ib0JveElucHV0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hJbnB1dCcpO1xyXG4gICAgICAgIC8vY3JlYXRlIGEgZGF0YWxpc3QgdG8gc3RvcmUgb3VyIHF1aWNrc2hvdXRzXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0YWxpc3QnKTtcclxuICAgICAgICBjb21ib0JveExpc3Quc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveExpc3QnKTtcclxuICAgICAgICAvL2lmIHRoZSBHTSB2YXJpYWJsZSBleGlzdHNcclxuICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSkge1xyXG4gICAgICAgICAgICAvL292ZXJ3cml0ZSBqc29uTGlzdCB2YXJpYWJsZSB3aXRoIHBhcnNlZCBkYXRhXHJcbiAgICAgICAgICAgIGpzb25MaXN0ID0gSlNPTi5wYXJzZShHTV9nZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcpKTtcclxuICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaXRlbVxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBPcHRpb24gZWxlbWVudCBhbmQgYWRkIG91ciBkYXRhIGZvciBkaXNwbGF5IHRvIHVzZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvL2lmIG5vIEdNIHZhcmlhYmxlXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9jcmVhdGUgdmFyaWFibGUgd2l0aCBvdXQgSW50cm8gZGF0YVxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XHJcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cclxuICAgICAgICAgICAgLy8gVE9ETzogcHJvYmFibHkgY2FuIGdldCByaWQgb2YgdGhlIGZvckVhY2ggYW5kIGp1c3QgZG8gc2luZ2xlIGV4ZWN1dGlvbiBzaW5jZSB3ZSBrbm93IHRoaXMgaXMgSW50cm8gb25seVxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYXBwZW5kIHRoZSBhYm92ZSBlbGVtZW50cyB0byBvdXIgRElWIGZvciB0aGUgY29tYm8gYm94XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hMYWJlbCk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hJbnB1dCk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hMaXN0KTtcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgY2xlYXIgYnV0dG9uIGFuZCBhZGQgc3R5bGVcclxuICAgICAgICBjb25zdCBjbGVhckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGNsZWFyQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBjbGVhckJ1dHRvbi5pbm5lckhUTUwgPSAnQ2xlYXInO1xyXG4gICAgICAgIC8vY3JlYXRlIGRlbGV0ZSBidXR0b24sIGFkZCBzdHlsZSwgYW5kIHRoZW4gaGlkZSBpdCBmb3IgbGF0ZXIgdXNlXHJcbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnNmVtJztcclxuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1JlZCc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLmlubmVySFRNTCA9ICdERUxFVEUnO1xyXG4gICAgICAgIC8vY3JlYXRlIHNlbGVjdCBidXR0b24gYW5kIHN0eWxlIGl0XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBzZWxlY3RCdXR0b24uaW5uZXJIVE1MID0gJ1NlbGVjdCc7XHJcbiAgICAgICAgLy9jcmVhdGUgc2F2ZSBidXR0b24gYW5kIHN0eWxlIGl0XHJcbiAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNhdmVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHNhdmVCdXR0b24uaW5uZXJIVE1MID0gJ1NhdmUnO1xyXG4gICAgICAgIC8vYWRkIGFsbCA0IGJ1dHRvbnMgdG8gdGhlIGNvbWJvQm94IERJVlxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNsZWFyQnV0dG9uKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzZWxlY3RCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGRlbGV0ZUJ1dHRvbik7XHJcbiAgICAgICAgLy9jcmVhdGUgb3VyIHRleHQgYXJlYSBhbmQgc3R5bGUgaXQsIHRoZW4gaGlkZSBpdFxyXG4gICAgICAgIGNvbnN0IHF1aWNrU2hvdXRUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5oZWlnaHQgPSAnNTAlJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5tYXJnaW4gPSAnMWVtJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS53aWR0aCA9ICc5NyUnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LmlkID0gJ21wX3F1aWNrU2hvdXRUZXh0JztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvL2V4ZWN1dGVzIHdoZW4gY2xpY2tpbmcgc2VsZWN0IGJ1dHRvblxyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIHNvbWV0aGluZyBpbnNpZGUgb2YgdGhlIHF1aWNrc2hvdXQgYXJlYVxyXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9wdXQgdGhlIHRleHQgaW4gdGhlIG1haW4gc2l0ZSByZXBseSBmaWVsZCBhbmQgZm9jdXMgb24gaXRcclxuICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IHF1aWNrU2hvdXRUZXh0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgYSBxdWlja1Nob3V0IGRlbGV0ZSBidXR0b25cclxuICAgICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCB0aGUgbGFzdCBxdWlja1Nob3V0XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoanNvbkxpc3QpLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgZW50cnkgZnJvbSB0aGUgSlNPTiBhbmQgdXBkYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBvcHRpb25zIGZyb20gZGF0YWxpc3QgdG8gcmVzZXQgd2l0aCBuZXdseSBjcmVhdGVkIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2ggaXRlbSBpbiBuZXcganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbmV3IG9wdGlvbiBlbGVtZW50IHRvIGFkZCB0byBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjdXJyZW50IGtleSB2YWx1ZSB0byB0aGUgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgZWxlbWVudCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGxhc3QgaXRlbSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgaXRlbSBmcm9tIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgv4LKgL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZW50aXJlIHZhcmlhYmxlIHNvIGl0cyBub3QgZW1wdHkgR00gdmFyaWFibGVcclxuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfcXVpY2tTaG91dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vY3JlYXRlIGV2ZW50IG9uIHNhdmUgYnV0dG9uIHRvIHNhdmUgcXVpY2tzaG91dFxyXG4gICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBkYXRhIGluIHRoZSBrZXkgYW5kIHZhbHVlIEdVSSBmaWVsZHMsIHByb2NlZWRcclxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSAmJiBjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy93YXMgaGF2aW5nIGlzc3VlIHdpdGggZXZhbCBwcm9jZXNzaW5nIHRoZSAucmVwbGFjZSBkYXRhIHNvIG1hZGUgYSB2YXJpYWJsZSB0byBpbnRha2UgaXRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlZFRleHQgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZnVuIHdheSB0byBkeW5hbWljYWxseSBjcmVhdGUgc3RhdGVtZW50cyAtIHRoaXMgdGFrZXMgd2hhdGV2ZXIgaXMgaW4gbGlzdCBmaWVsZCB0byBjcmVhdGUgYSBrZXkgd2l0aCB0aGF0IHRleHQgYW5kIHRoZSB2YWx1ZSBmcm9tIHRoZSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICAgICAgICAgIGV2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBqc29uTGlzdC5gICsgcmVwbGFjZWRUZXh0ICsgYD0gXCJgICsgcXVpY2tTaG91dFRleHQudmFsdWUgKyBgXCI7YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9vdmVyd3JpdGUgb3IgY3JlYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHNhdmUgYnV0dG9uIHRvIGdyZWVuIG5vdyB0aGF0IGl0cyBzYXZlZCBhcy1pc1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIGEgc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGV4aXN0aW5nIGRhdGFsaXN0IGVsZW1lbnRzIHRvIHJlYnVpbGQgd2l0aCBuZXcganNvbmxpc3RcclxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaW4gdGhlIGpzb25saXN0XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBuZXcgb3B0aW9uIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQga2V5IG5hbWUgdG8gdGhlIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiB0aGlzIG1heSBvciBtYXkgbm90IGJlIG5lY2Vzc2FyeSwgYnV0IHdhcyBoYXZpbmcgaXNzdWVzIHdpdGggdGhlIHVuaXF1ZSBzeW1ib2wgc3RpbGwgcmFuZG9tbHkgc2hvd2luZyB1cCBhZnRlciBzYXZlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGNvbWJvQm94T3B0aW9uLnZhbHVlLnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vYWRkIGV2ZW50IGZvciBjbGVhciBidXR0b24gdG8gcmVzZXQgdGhlIGRhdGFsaXN0XHJcbiAgICAgICAgY2xlYXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jbGVhciB0aGUgaW5wdXQgZmllbGQgYW5kIHRleHRhcmVhIGZpZWxkXHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vTmV4dCB0d28gaW5wdXQgZnVuY3Rpb25zIGFyZSBtZWF0IGFuZCBwb3RhdG9lcyBvZiB0aGUgbG9naWMgZm9yIHVzZXIgZnVuY3Rpb25hbGl0eVxyXG5cclxuICAgICAgICAvL3doZW5ldmVyIHNvbWV0aGluZyBpcyB0eXBlZCBvciBjaGFuZ2VkIHdoaXRoaW4gdGhlIGlucHV0IGZpZWxkXHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnaW5wdXQnLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGlzIGJsYW5rXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSB0ZXh0YXJlYSBpcyBhbHNvIGJsYW5rIG1pbmltaXplIHJlYWwgZXN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFxdWlja1Nob3V0VGV4dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIHRleHQgYXJlYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NocmluayB0aGUgZm9vdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzIuNWVtJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gdG8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgc29tZXRoaW5nIGlzIHN0aWxsIGluIHRoZSB0ZXh0YXJlYSB3ZSBuZWVkIHRvIGluZGljYXRlIHRoYXQgdW5zYXZlZCBhbmQgdW5uYW1lZCBkYXRhIGlzIHRoZXJlXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zdHlsZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZCBpcyBvcmdhbmdlIHNhdmUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL2VpdGhlciB3YXksIGhpZGUgdGhlIGRlbGV0ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIGlucHV0IGZpZWxkIGhhcyBhbnkgdGV4dCBpbiBpdFxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSB0ZXh0IGFyZWEgZm9yIGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZXhwYW5kIHRoZSBmb290ZXIgdG8gYWNjb21vZGF0ZSBhbGwgZmVhdHVyZSBhc3BlY3RzXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMTFlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB3aGF0IGlzIGluIHRoZSBpbnB1dCBmaWVsZCBpcyBhIHNhdmVkIGVudHJ5IGtleVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgY2FuIGJlIGEgc3Vja3kgbGluZSBvZiBjb2RlIGJlY2F1c2UgaXQgY2FuIHdpcGUgb3V0IHVuc2F2ZWQgZGF0YSwgYnV0IGkgY2Fubm90IHRoaW5rIG9mIGJldHRlciB3YXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXBsYWNlIHRoZSB0ZXh0IGFyZWEgY29udGVudHMgd2l0aCB3aGF0IHRoZSB2YWx1ZSBpcyBpbiB0aGUgbWF0Y2hlZCBwYWlyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Nob3cgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBpcyBub3cgZXhhY3QgbWF0Y2ggdG8gc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIHRvIHNob3cgaXRzIGEgc2F2ZWQgY29tYm9cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBub3QgYSByZWdpc3RlcmVkIGtleSBuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBiZSBhbiB1bnNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBjYW5ub3QgYmUgc2F2ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGRlbGV0ZWQgb3V0IG9mIHRleHRhcmVhXHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2lucHV0JyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgZmllbGQgaGFzIHRleHQgaW4gaXRcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgIT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gYXMgeWVsbG93IGZvciBlZGl0dGVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnWWVsbG93JztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBhIG1hdGNoIGFuZCB0aGUgZGF0YSBpcyBhIG1hdGNoIHRoZW4gd2UgaGF2ZSBhIDEwMCUgc2F2ZWQgZW50cnkgYW5kIGNhbiBwdXQgZXZlcnl0aGluZyBiYWNrIHRvIHNhdmVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gZm9yIHNhdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBub3QgZm91bmQgaW4gdGhlIHNhdmVkIGxpc3QsIG9yYW5nZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghanNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9hZGQgdGhlIGNvbWJvYm94IGFuZCB0ZXh0IGFyZWEgZWxlbWVudHMgdG8gdGhlIGZvb3RlclxyXG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChjb21ib0JveERpdik7XHJcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKHF1aWNrU2hvdXRUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjQlJPV1NFIFBBR0UgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogQWxsb3dzIFNuYXRjaGVkIHRvcnJlbnRzIHRvIGJlIGhpZGRlbi9zaG93blxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlU25hdGNoZWQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3RvZ2dsZVNuYXRjaGVkJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGhpZGUvc2hvdyByZXN1bHRzIHRoYXQgeW91J3ZlIHNuYXRjaGVkYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuICAgIHByaXZhdGUgX2lzVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9zZWFyY2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfc25hdGNoZWRIb29rOiBzdHJpbmcgPSAndGQgZGl2W2NsYXNzXj1cImJyb3dzZVwiXSc7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IHRvZ2dsZTogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XHJcbiAgICAgICAgbGV0IHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD47XHJcbiAgICAgICAgY29uc3Qgc3RvcmVkU3RhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxyXG4gICAgICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoc3RvcmVkU3RhdGUgPT09ICdmYWxzZScgJiYgR01fZ2V0VmFsdWUoJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJykgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgU25hdGNoZWQnIDogJ1Nob3cgU25hdGNoZWQnO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAnc25hdGNoZWRUb2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlVGV4dCxcclxuICAgICAgICAgICAgICAgICdoMScsXHJcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYmFzZWQgb24gdmlzIHN0YXRlXHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IHJlcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBUb2dnbGUgU25hdGNoZWQgYnV0dG9uIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbHRlcnMgc2VhcmNoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxyXG4gICAgICogQHBhcmFtIHN1YlRhciB0aGUgZWxlbWVudHMgdGhhdCBtdXN0IGJlIGNvbnRhaW5lZCBpbiBvdXIgZmlsdGVyZWQgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgbGlzdC5mb3JFYWNoKChzbmF0Y2gpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYnRuOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSA8SFRNTEhlYWRpbmdFbGVtZW50PihcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zbmF0Y2hlZFRvZ2dsZScpIVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VsZWN0IG9ubHkgdGhlIGl0ZW1zIHRoYXQgbWF0Y2ggb3VyIHN1YiBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHNuYXRjaC5xdWVyeVNlbGVjdG9yKHN1YlRhcik7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIaWRlL3Nob3cgYXMgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICBzbmF0Y2guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICBzbmF0Y2guc3R5bGUuZGlzcGxheSA9ICd0YWJsZS1yb3cnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0VmlzU3RhdGUodmFsOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTbmF0Y2ggdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWAsIGAke3ZhbH1gKTtcclxuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZWFyY2hMaXN0KCk6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9zZWFyY2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VhcmNoTGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHZhbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZVNuYXRjaGVkIGJldHdlZW4gcGFnZSBsb2Fkc1xyXG4gKi9cclxuY2xhc3MgU3RpY2t5U25hdGNoZWRUb2dnbGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJyxcclxuICAgICAgICBkZXNjOiBgTWFrZSB0b2dnbGUgc3RhdGUgcGVyc2lzdCBiZXR3ZWVuIHBhZ2UgbG9hZHNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gUmVtZW1iZXJlZCBzbmF0Y2ggdmlzaWJpbGl0eSBzdGF0ZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSBhIHBsYWludGV4dCBsaXN0IG9mIHNlYXJjaCByZXN1bHRzXHJcbiAqL1xyXG5jbGFzcyBQbGFpbnRleHRTZWFyY2ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFNlYXJjaCcsXHJcbiAgICAgICAgZGVzYzogYEluc2VydCBwbGFpbnRleHQgc2VhcmNoIHJlc3VsdHMgYXQgdG9wIG9mIHBhZ2VgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3IgaDEnO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICApO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcclxuICAgIHByaXZhdGUgX3BsYWluVGV4dDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgY29weUJ0bjogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSB0b2dnbGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgJyNzc3InLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHJlc3VsdHMgaW50byBwbGFpbnRleHRcclxuICAgICAgICByZXN1bHRMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb3B5IGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgY29weUJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLFxyXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyNtcF9wbGFpblRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICAnbXBfY29weSBtcF9wbGFpbkJ0bidcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgcGxhaW50ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgY29weUJ0bi5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBgPGJyPjx0ZXh0YXJlYSBjbGFzcz0nbXBfcGxhaW50ZXh0U2VhcmNoJyBzdHlsZT0nZGlzcGxheTogbm9uZSc+PC90ZXh0YXJlYT5gXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9wbGFpblRleHQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9wbGFpbnRleHRTZWFyY2gnKSEuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh0aGlzLl9pc09wZW4pO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgdG9nZ2xlQnRuXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Ym94OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRib3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1Nob3cgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXHJcbiAgICAgKiBAcGFyYW0gdmFsIHN0cmluZ2lmaWVkIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xyXG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxyXG4gICAgICAgIEdNX3NldFZhbHVlKCd0b2dnbGVTbmF0Y2hlZFN0YXRlJywgdmFsKTtcclxuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMoXHJcbiAgICAgICAgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGVhY2ggdGV4dCBmaWVsZFxyXG4gICAgICAgICAgICBsZXQgdGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgc2VyaWVzVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgYXV0aFRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IG5hcnJUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCB0aGUgaW1wb3J0YW50IGRhdGEgZnJvbSBlYWNoIG5vZGVcclxuICAgICAgICAgICAgY29uc3QgcmF3VGl0bGU6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvcignLnRvclRpdGxlJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgICAgICA+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnLnNlcmllcycpO1xyXG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5hdXRob3InXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hcnJMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLm5hcnJhdG9yJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJhd1RpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIE5vZGU6Jywgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc3VsdCB0aXRsZSBzaG91bGQgbm90IGJlIG51bGxgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gcmF3VGl0bGUudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBzZXJpZXNcclxuICAgICAgICAgICAgaWYgKHNlcmllc0xpc3QgIT09IG51bGwgJiYgc2VyaWVzTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlICs9IGAke3Nlcmllcy50ZXh0Q29udGVudH0gLyBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBsYXN0IHNlcmllcywgdGhlbiBzdHlsZVxyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBzZXJpZXNUaXRsZS5zdWJzdHJpbmcoMCwgc2VyaWVzVGl0bGUubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IGAgKCR7c2VyaWVzVGl0bGV9KWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBhdXRob3JzXHJcbiAgICAgICAgICAgIGlmIChhdXRoTGlzdCAhPT0gbnVsbCAmJiBhdXRoTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSAnQlkgJztcclxuICAgICAgICAgICAgICAgIGF1dGhMaXN0LmZvckVhY2goKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoVGl0bGUgKz0gYCR7YXV0aC50ZXh0Q29udGVudH0gQU5EIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9IGF1dGhUaXRsZS5zdWJzdHJpbmcoMCwgYXV0aFRpdGxlLmxlbmd0aCAtIDUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgbmFycmF0b3JzXHJcbiAgICAgICAgICAgIGlmIChuYXJyTGlzdCAhPT0gbnVsbCAmJiBuYXJyTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSAnRlQgJztcclxuICAgICAgICAgICAgICAgIG5hcnJMaXN0LmZvckVhY2goKG5hcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBuYXJyVGl0bGUgKz0gYCR7bmFyci50ZXh0Q29udGVudH0gQU5EIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9IG5hcnJUaXRsZS5zdWJzdHJpbmcoMCwgbmFyclRpdGxlLmxlbmd0aCAtIDUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHAgKz0gYCR7dGl0bGV9JHtzZXJpZXNUaXRsZX0gJHthdXRoVGl0bGV9ICR7bmFyclRpdGxlfVxcbmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG91dHA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIHRoZSBzZWFyY2ggZmVhdHVyZXMgdG8gYmUgaGlkZGVuL3Nob3duXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVTZWFyY2hib3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3RvZ2dsZVNlYXJjaGJveCcsXHJcbiAgICAgICAgZGVzYzogYENvbGxhcHNlIHRoZSBTZWFyY2ggYm94IGFuZCBtYWtlIGl0IHRvZ2dsZWFibGVgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JTZWFyY2hDb250cm9sJztcclxuICAgIHByaXZhdGUgX2hlaWdodDogc3RyaW5nID0gJzI2cHgnO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnID0gJ2ZhbHNlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHNlYXJjaGJveDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGlmIChzZWFyY2hib3gpIHtcclxuICAgICAgICAgICAgLy8gQWRqdXN0IHRoZSB0aXRsZSB0byBtYWtlIGl0IGNsZWFyIGl0IGlzIGEgdG9nZ2xlIGJ1dHRvblxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gc2VhcmNoYm94LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnLmJsb2NrSGVhZENvbiBoNCdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3QgdGV4dCAmIHN0eWxlXHJcbiAgICAgICAgICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAnVG9nZ2xlIFNlYXJjaCc7XHJcbiAgICAgICAgICAgICAgICB0aXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvZ2dsZShzZWFyY2hib3ghKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IHNldCB1cCB0b2dnbGUhIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENvbGxhcHNlIHRoZSBzZWFyY2hib3hcclxuICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNlYXJjaGJveCwge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IGBoZWlnaHQ6JHt0aGlzLl9oZWlnaHR9O292ZXJmbG93OmhpZGRlbjtgLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gSGlkZSBleHRyYSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbjogSFRNTEhlYWRpbmdFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGd1aWRlTGluazogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMyB+IGEnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24pIG5vdGlmaWNhdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBpZiAoZ3VpZGVMaW5rKSBndWlkZUxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvbGxhcHNlZCB0aGUgU2VhcmNoIGJveCEnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgY29sbGFwc2UgU2VhcmNoIGJveCEgVGFyZ2V0IGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3RvZ2dsZShlbGVtOiBIVE1MRGl2RWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSAndW5zZXQnO1xyXG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSAndHJ1ZSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9ICdmYWxzZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ1RvZ2dsZWQgU2VhcmNoIGJveCEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlcyBsaW5rZWQgdGFncyBmcm9tIHRoZSBzaXRlJ3MgcGxhaW50ZXh0IHRhZyBmaWVsZFxyXG4gKi9cclxuY2xhc3MgQnVpbGRUYWdzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdidWlsZFRhZ3MnLFxyXG4gICAgICAgIGRlc2M6IGBHZW5lcmF0ZSBjbGlja2FibGUgVGFncyBhdXRvbWF0aWNhbGx5YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSB0YWdzXHJcbiAgICAgICAgcmVzdWx0c0xpc3RcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgdGFncyBhZ2FpblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLmZvckVhY2goKHIpID0+IHRoaXMuX3Byb2Nlc3NUYWdTdHJpbmcocikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENvZGUgdG8gcnVuIGZvciBldmVyeSBzZWFyY2ggcmVzdWx0XHJcbiAgICAgKiBAcGFyYW0gcmVzIEEgc2VhcmNoIHJlc3VsdCByb3dcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcHJvY2Vzc1RhZ1N0cmluZyA9IChyZXM6IEhUTUxUYWJsZVJvd0VsZW1lbnQpID0+IHtcclxuICAgICAgICBjb25zdCB0YWdsaW5lID0gPEhUTUxTcGFuRWxlbWVudD5yZXMucXVlcnlTZWxlY3RvcignLnRvclJvd0Rlc2MnKTtcclxuXHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKHRhZ2xpbmUpO1xyXG5cclxuICAgICAgICAvLyBBc3N1bWUgYnJhY2tldHMgY29udGFpbiB0YWdzXHJcbiAgICAgICAgbGV0IHRhZ1N0cmluZyA9IHRhZ2xpbmUuaW5uZXJIVE1MLnJlcGxhY2UoLyg/OlxcW3xcXF18XFwofFxcKXwkKS9naSwgJywnKTtcclxuICAgICAgICAvLyBSZW1vdmUgSFRNTCBFbnRpdGllcyBhbmQgdHVybiB0aGVtIGludG8gYnJlYWtzXHJcbiAgICAgICAgdGFnU3RyaW5nID0gdGFnU3RyaW5nLnNwbGl0KC8oPzomLnsxLDV9OykvZykuam9pbignOycpO1xyXG4gICAgICAgIC8vIFNwbGl0IHRhZ3MgYXQgJywnIGFuZCAnOycgYW5kICc+JyBhbmQgJ3wnXHJcbiAgICAgICAgbGV0IHRhZ3MgPSB0YWdTdHJpbmcuc3BsaXQoL1xccyooPzo7fCx8PnxcXHx8JClcXHMqLyk7XHJcbiAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IG9yIGxvbmcgdGFnc1xyXG4gICAgICAgIHRhZ3MgPSB0YWdzLmZpbHRlcigodGFnKSA9PiB0YWcubGVuZ3RoIDw9IDMwICYmIHRhZy5sZW5ndGggPiAwKTtcclxuICAgICAgICAvLyBBcmUgdGFncyBhbHJlYWR5IGFkZGVkPyBPbmx5IGFkZCBpZiBudWxsXHJcbiAgICAgICAgY29uc3QgdGFnQm94OiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVzLnF1ZXJ5U2VsZWN0b3IoJy5tcF90YWdzJyk7XHJcbiAgICAgICAgaWYgKHRhZ0JveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbmplY3RMaW5rcyh0YWdzLCB0YWdsaW5lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdzKTtcclxuICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEluamVjdHMgdGhlIGdlbmVyYXRlZCB0YWdzXHJcbiAgICAgKiBAcGFyYW0gdGFncyBBcnJheSBvZiB0YWdzIHRvIGFkZFxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2VhcmNoIHJlc3VsdCByb3cgdGhhdCB0aGUgdGFncyB3aWxsIGJlIGFkZGVkIHRvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2luamVjdExpbmtzID0gKHRhZ3M6IHN0cmluZ1tdLCB0YXI6IEhUTUxTcGFuRWxlbWVudCkgPT4ge1xyXG4gICAgICAgIGlmICh0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBuZXcgdGFnIHJvd1xyXG4gICAgICAgICAgICBjb25zdCB0YWdSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHRhZ1Jvdy5jbGFzc0xpc3QuYWRkKCdtcF90YWdzJyk7XHJcbiAgICAgICAgICAgIHRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdGFnUm93KTtcclxuICAgICAgICAgICAgdGFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRhZ1Jvdy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgdGFncyB0byB0aGUgdGFnIHJvd1xyXG4gICAgICAgICAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFnUm93LmlubmVySFRNTCArPSBgPGEgY2xhc3M9J21wX3RhZycgaHJlZj0nL3Rvci9icm93c2UucGhwP3RvciU1QnRleHQlNUQ9JTIyJHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnXHJcbiAgICAgICAgICAgICAgICApfSUyMiZ0b3IlNUJzcmNoSW4lNUQlNUJ0YWdzJTVEPXRydWUnPiR7dGFnfTwvYT5gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJhbmRvbSBCb29rIGZlYXR1cmUgdG8gb3BlbiBhIG5ldyB0YWIvd2luZG93IHdpdGggYSByYW5kb20gTUFNIEJvb2tcclxuICovXHJcbmNsYXNzIFJhbmRvbUJvb2sgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JhbmRvbUJvb2snLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gb3BlbiBhIHJhbmRvbWx5IHNlbGVjdGVkIGJvb2sgcGFnZS4gKDxlbT5Vc2VzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgY2F0ZWdvcnkgaW4gdGhlIGRyb3Bkb3duPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxldCByYW5kbzogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgY29uc3QgcmFuZG9UZXh0OiBzdHJpbmcgPSAnUmFuZG9tIEJvb2snO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAocmFuZG8gPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdyYW5kb21Cb29rJyxcclxuICAgICAgICAgICAgICAgIHJhbmRvVGV4dCxcclxuICAgICAgICAgICAgICAgICdoMScsXHJcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICByYW5kb1xyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50UmVzdWx0OiBQcm9taXNlPG51bWJlcj47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yaWVzOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIENhdGVnb3J5IGRyb3Bkb3duIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0U2VsZWN0aW9uOiBIVE1MU2VsZWN0RWxlbWVudCA9IDxIVE1MU2VsZWN0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0ZWdvcnlQYXJ0aWFsJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHZhbHVlIGN1cnJlbnRseSBzZWxlY3RlZCBpbiBDYXRlZ29yeSBEcm9wZG93blxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRWYWx1ZTogc3RyaW5nID0gY2F0U2VsZWN0aW9uIS5vcHRpb25zW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0U2VsZWN0aW9uLnNlbGVjdGVkSW5kZXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZXBlbmRpbmcgb24gY2F0ZWdvcnkgc2VsZWN0ZWQsIGNyZWF0ZSBhIGNhdGVnb3J5IHN0cmluZyBmb3IgdGhlIEpTT04gR0VUXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKGNhdFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQUxMJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdkZWZhdWx0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTEzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE1JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE2JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTYnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0VmFsdWUuY2hhckF0KDApID09PSAnYycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW2NhdF1bXT0nICsgY2F0VmFsdWUuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY291bnRSZXN1bHQgPSB0aGlzLl9nZXRSYW5kb21Cb29rUmVzdWx0cyhjYXRlZ29yaWVzKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudFJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGdldFJhbmRvbVJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb3BlbiBuZXcgdGFiIHdpdGggdGhlIHJhbmRvbSBib29rXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3QvJyArIGdldFJhbmRvbVJlc3VsdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ19ibGFuaydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFJhbmRvbSBCb29rIGJ1dHRvbiEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbHRlcnMgc2VhcmNoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSBjYXQgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgY2F0ZWdvcmllcyBuZWVkZWQgZm9yIEpTT04gR2V0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQganNvblJlc3VsdDogUHJvbWlzZTxzdHJpbmc+O1xyXG4gICAgICAgICAgICAvL1VSTCB0byBHRVQgcmFuZG9tIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3Rvci9qcy9sb2FkU2VhcmNoSlNPTmJhc2ljLnBocD90b3Jbc2VhcmNoVHlwZV09YWxsJnRvcltzZWFyY2hJbl09dG9ycmVudHMke2NhdH0mdG9yW3BlcnBhZ2VdPTUmdG9yW2Jyb3dzZUZsYWdzSGlkZVZzU2hvd109MCZ0b3Jbc3RhcnREYXRlXT0mdG9yW2VuZERhdGVdPSZ0b3JbaGFzaF09JnRvcltzb3J0VHlwZV09cmFuZG9tJnRodW1ibmFpbD10cnVlPyR7VXRpbC5yYW5kb21OdW1iZXIoXHJcbiAgICAgICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICAgICAgMTAwMDAwXHJcbiAgICAgICAgICAgICl9YDtcclxuICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyhqc29uUmVzdWx0ID0gVXRpbC5nZXRKU09OKHVybCkpXSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBqc29uUmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGpzb25GdWxsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRoZSBmaXJzdCB0b3JyZW50IElEIG9mIHRoZSByYW5kb20gSlNPTiB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShqc29uRnVsbCkuZGF0YVswXS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vKipcclxuICogIyBSRVFVRVNUIFBBR0UgRkVBVFVSRVNcclxuICovXHJcbi8qKlxyXG4gKiAqIEhpZGUgcmVxdWVzdGVycyB3aG8gYXJlIHNldCB0byBcImhpZGRlblwiXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3RvZ2dsZUhpZGRlblJlcXVlc3RlcnMnLFxyXG4gICAgICAgIGRlc2M6IGBIaWRlIGhpZGRlbiByZXF1ZXN0ZXJzYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yUm93cyc7XHJcbiAgICBwcml2YXRlIF9zZWFyY2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+IHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfaGlkZSA9IHRydWU7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5fYWRkVG9nZ2xlU3dpdGNoKCk7XHJcbiAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcclxuXHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKHRoaXMuX3RhciwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gYXdhaXQgdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hZGRUb2dnbGVTd2l0Y2goKSB7XHJcbiAgICAgICAgLy8gTWFrZSBhIG5ldyBidXR0b24gYW5kIGluc2VydCBiZXNpZGUgdGhlIFNlYXJjaCBidXR0b25cclxuICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ3Nob3dIaWRkZW4nLFxyXG4gICAgICAgICAgICAnU2hvdyBIaWRkZW4nLFxyXG4gICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgJyNyZXF1ZXN0U2VhcmNoIC50b3JyZW50U2VhcmNoJyxcclxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIG5ldyBidXR0b24gYW5kIGFkZCBhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgY29uc3QgdG9nZ2xlU3dpdGNoOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zaG93SGlkZGVuJylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRvZ2dsZVN3aXRjaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaGlkZGVuTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnI3RvclJvd3MgPiAubXBfaGlkZGVuJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSAnSGlkZSBIaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuTGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ2xpc3QtaXRlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdG9nZ2xlU3dpdGNoLmlubmVyVGV4dCA9ICdTaG93IEhpZGRlbic7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSZXF1ZXN0TGlzdCgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyN0b3JSb3dzIC50b3JSb3cgLnRvclJpZ2h0JykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBHcmFiIGFsbCByZXF1ZXN0c1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVxTGlzdDpcclxuICAgICAgICAgICAgICAgICAgICB8IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD5cclxuICAgICAgICAgICAgICAgICAgICB8IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8IHVuZGVmaW5lZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAgICAgJyN0b3JSb3dzIC50b3JSb3cnXHJcbiAgICAgICAgICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD47XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlcUxpc3QgPT09IG51bGwgfHwgcmVxTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGByZXFMaXN0IGlzICR7cmVxTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXFMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZmlsdGVyUmVzdWx0cyhsaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+KSB7XHJcbiAgICAgICAgbGlzdC5mb3JFYWNoKChyZXF1ZXN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RlcjogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gcmVxdWVzdC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJy50b3JSaWdodCBhJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAocmVxdWVzdGVyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZSBhIHBsYWludGV4dCBsaXN0IG9mIHJlcXVlc3QgcmVzdWx0c1xyXG4gKi9cclxuY2xhc3MgUGxhaW50ZXh0UmVxdWVzdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwbGFpbnRleHRSZXF1ZXN0JyxcclxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMgYXQgdG9wIG9mIHJlcXVlc3QgcGFnZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICk7XHJcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGxldCB0b2dnbGVCdG46IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcclxuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PjtcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICh0b2dnbGVCdG4gPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAnI3NzcicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ21wX3RvZ2dsZSBtcF9wbGFpbkJ0bidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fZ2V0UmVxdWVzdExpc3QoKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHJlc3VsdHMgaW50byBwbGFpbnRleHRcclxuICAgICAgICByZXN1bHRMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb3B5IGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgY29weUJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLFxyXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyNtcF9wbGFpblRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICAnbXBfY29weSBtcF9wbGFpbkJ0bidcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgcGxhaW50ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgY29weUJ0bi5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBgPGJyPjx0ZXh0YXJlYSBjbGFzcz0nbXBfcGxhaW50ZXh0U2VhcmNoJyBzdHlsZT0nZGlzcGxheTogbm9uZSc+PC90ZXh0YXJlYT5gXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9wbGFpblRleHQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9wbGFpbnRleHRTZWFyY2gnKSEuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0IG9wZW4gc3RhdGVcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIHRvZ2dsZSBidXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIHRvZ2dsZUJ0blxyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGV4dGJveCBzaG91bGQgZXhpc3QsIGJ1dCBqdXN0IGluIGNhc2UuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRleHRib3ggZG9lc24ndCBleGlzdCFgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnSGlkZSBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCdmYWxzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbnNlcnRlZCBwbGFpbnRleHQgcmVxdWVzdCByZXN1bHRzIScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBPcGVuIFN0YXRlIHRvIHRydWUvZmFsc2UgaW50ZXJuYWxseSBhbmQgaW4gc2NyaXB0IHN0b3JhZ2VcclxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zZXRPcGVuU3RhdGUodmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhbCA9ICdmYWxzZSc7XHJcbiAgICAgICAgfSAvLyBEZWZhdWx0IHZhbHVlXHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3RvZ2dsZVNuYXRjaGVkU3RhdGUnLCB2YWwpO1xyXG4gICAgICAgIHRoaXMuX2lzT3BlbiA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9wcm9jZXNzUmVzdWx0cyhyZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+KTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGVhY2ggdGV4dCBmaWVsZFxyXG4gICAgICAgICAgICBsZXQgdGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgc2VyaWVzVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgYXV0aFRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IG5hcnJUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCB0aGUgaW1wb3J0YW50IGRhdGEgZnJvbSBlYWNoIG5vZGVcclxuICAgICAgICAgICAgY29uc3QgcmF3VGl0bGU6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvcignLnRvclRpdGxlJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgICAgICA+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnLnNlcmllcycpO1xyXG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5hdXRob3InXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hcnJMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLm5hcnJhdG9yJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJhd1RpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIE5vZGU6Jywgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc3VsdCB0aXRsZSBzaG91bGQgbm90IGJlIG51bGxgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gcmF3VGl0bGUudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBzZXJpZXNcclxuICAgICAgICAgICAgaWYgKHNlcmllc0xpc3QgIT09IG51bGwgJiYgc2VyaWVzTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlICs9IGAke3Nlcmllcy50ZXh0Q29udGVudH0gLyBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBsYXN0IHNlcmllcywgdGhlbiBzdHlsZVxyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBzZXJpZXNUaXRsZS5zdWJzdHJpbmcoMCwgc2VyaWVzVGl0bGUubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IGAgKCR7c2VyaWVzVGl0bGV9KWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBhdXRob3JzXHJcbiAgICAgICAgICAgIGlmIChhdXRoTGlzdCAhPT0gbnVsbCAmJiBhdXRoTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSAnQlkgJztcclxuICAgICAgICAgICAgICAgIGF1dGhMaXN0LmZvckVhY2goKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoVGl0bGUgKz0gYCR7YXV0aC50ZXh0Q29udGVudH0gQU5EIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9IGF1dGhUaXRsZS5zdWJzdHJpbmcoMCwgYXV0aFRpdGxlLmxlbmd0aCAtIDUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgbmFycmF0b3JzXHJcbiAgICAgICAgICAgIGlmIChuYXJyTGlzdCAhPT0gbnVsbCAmJiBuYXJyTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSAnRlQgJztcclxuICAgICAgICAgICAgICAgIG5hcnJMaXN0LmZvckVhY2goKG5hcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBuYXJyVGl0bGUgKz0gYCR7bmFyci50ZXh0Q29udGVudH0gQU5EIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9IG5hcnJUaXRsZS5zdWJzdHJpbmcoMCwgbmFyclRpdGxlLmxlbmd0aCAtIDUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHAgKz0gYCR7dGl0bGV9JHtzZXJpZXNUaXRsZX0gJHthdXRoVGl0bGV9ICR7bmFyclRpdGxlfVxcbmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG91dHA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QgPSAoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiA9PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdCByZXN1bHRzIHRvIGV4aXN0XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjdG9yUm93cyAudG9yUm93IGEnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgcmVxdWVzdCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbmF0Y2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+ID0gPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JSb3dzIC50b3JSb3cnKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGlmIChzbmF0Y2hMaXN0ID09PSBudWxsIHx8IHNuYXRjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc25hdGNoTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzT3BlbigpOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNPcGVuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBpc09wZW4odmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHZhbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEdvb2RyZWFkc0J1dHRvblJlcSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZ29vZHJlYWRzQnV0dG9uUmVxJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIGZvciByZXF1ZXN0cycsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2ZpbGxUb3JyZW50JztcclxuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0IGRldGFpbHMnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIENvbnZlcnQgcm93IHN0cnVjdHVyZSBpbnRvIHNlYXJjaGFibGUgb2JqZWN0XHJcbiAgICAgICAgY29uc3QgcmVxUm93cyA9IFV0aWwucm93c1RvT2JqKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uID4gZGl2JykpO1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IHJlcVJvd3NbJ1RpdGxlOiddLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSByZXFSb3dzW1xyXG4gICAgICAgICAgICAnQXV0aG9yKHMpOidcclxuICAgICAgICBdLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSByZXFSb3dzWydTZXJpZXM6J11cclxuICAgICAgICAgICAgPyByZXFSb3dzWydTZXJpZXM6J10ucXVlcnlTZWxlY3RvckFsbCgnYScpXHJcbiAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJlcVJvd3NbJ1JlbGVhc2UgRGF0ZSddO1xyXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLl9zaGFyZS5nb29kcmVhZHNCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBWQVVMVCBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbmNsYXNzIFNpbXBsZVZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuVmF1bHQsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3NpbXBsZVZhdWx0JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnU2ltcGxpZnkgdGhlIFZhdWx0IHBhZ2VzLiAoPGVtPlRoaXMgcmVtb3ZlcyBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgZG9uYXRlIGJ1dHRvbiAmYW1wOyBsaXN0IG9mIHJlY2VudCBkb25hdGlvbnM8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd2YXVsdCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHN1YlBhZ2U6IHN0cmluZyA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xyXG4gICAgICAgIGNvbnN0IHBhZ2UgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFwcGx5aW5nIFZhdWx0ICgke3N1YlBhZ2V9KSBzZXR0aW5ncy4uLmApO1xyXG5cclxuICAgICAgICAvLyBDbG9uZSB0aGUgaW1wb3J0YW50IHBhcnRzIGFuZCByZXNldCB0aGUgcGFnZVxyXG4gICAgICAgIGNvbnN0IGRvbmF0ZUJ0bjogSFRNTEZvcm1FbGVtZW50IHwgbnVsbCA9IHBhZ2UucXVlcnlTZWxlY3RvcignZm9ybScpO1xyXG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICd0YWJsZTpsYXN0LW9mLXR5cGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBwYWdlLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSBidXR0b24gaWYgaXQgZXhpc3RzXHJcbiAgICAgICAgaWYgKGRvbmF0ZUJ0biAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdEb25hdGU6IEhUTUxGb3JtRWxlbWVudCA9IDxIVE1MRm9ybUVsZW1lbnQ+ZG9uYXRlQnRuLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgcGFnZS5hcHBlbmRDaGlsZChuZXdEb25hdGUpO1xyXG4gICAgICAgICAgICBuZXdEb25hdGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhZ2UuaW5uZXJIVE1MID0gJzxoMT5Db21lIGJhY2sgdG9tb3Jyb3chPC9oMT4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgdGFibGUgaWYgaXQgZXhpc3RzXHJcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IDxIVE1MVGFibGVFbGVtZW50PihcclxuICAgICAgICAgICAgICAgIGRvbmF0ZVRibC5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcGFnZS5hcHBlbmRDaGlsZChuZXdUYWJsZSk7XHJcbiAgICAgICAgICAgIG5ld1RhYmxlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYWdlLnN0eWxlLnBhZGRpbmdCb3R0b20gPSAnMjVweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNpbXBsaWZpZWQgdGhlIHZhdWx0IHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAjVVBMT0FEIFBBR0UgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogQWxsb3dzIGVhc2llciBjaGVja2luZyBmb3IgZHVwbGljYXRlIHVwbG9hZHNcclxuICovXHJcblxyXG5jbGFzcyBTZWFyY2hGb3JEdXBsaWNhdGVzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzZWFyY2hGb3JEdXBsaWNhdGVzJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVcGxvYWQgUGFnZSddLFxyXG4gICAgICAgIGRlc2M6ICdFYXNpZXIgc2VhcmNoaW5nIGZvciBkdXBsaWNhdGVzIHdoZW4gdXBsb2FkaW5nIGNvbnRlbnQnLFxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdXBsb2FkRm9ybSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VwbG9hZCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN1cGxvYWRGb3JtIHRib2R5J1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gdGl0bGUnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RpdGxlJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dFtuYW1lPVwidG9yW3RpdGxlXVwiXScsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogNyxcclxuICAgICAgICAgICAgICAgIHVzZVdpbGRjYXJkOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gYXV0aG9yKHMpJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdhdXRob3InLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX2F1dGhvcicsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTAsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBzZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3NlcmllcycsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfc2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIG5hcnJhdG9yKHMpJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICduYXJyYXRvcicsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfbmFycmF0b3InLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDEyLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIHNlYXJjaCB0byB1cGxvYWRzIWApO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgdHlwZSxcclxuICAgICAgICBpbnB1dFNlbGVjdG9yLFxyXG4gICAgICAgIHJvd1Bvc2l0aW9uLFxyXG4gICAgICAgIHVzZVdpbGRjYXJkID0gZmFsc2UsXHJcbiAgICB9OiB7XHJcbiAgICAgICAgcGFyZW50RWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGl0bGU6IHN0cmluZztcclxuICAgICAgICB0eXBlOiBzdHJpbmc7XHJcbiAgICAgICAgaW5wdXRTZWxlY3Rvcjogc3RyaW5nO1xyXG4gICAgICAgIHJvd1Bvc2l0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgdXNlV2lsZGNhcmQ/OiBib29sZWFuO1xyXG4gICAgfSkge1xyXG4gICAgICAgIGNvbnN0IHNlYXJjaEVsZW1lbnQ6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hFbGVtZW50LCB7XHJcbiAgICAgICAgICAgIHRhcmdldDogJ19ibGFuaycsXHJcbiAgICAgICAgICAgIHN0eWxlOiAndGV4dC1kZWNvcmF0aW9uOiBub25lOyBjdXJzb3I6IHBvaW50ZXI7JyxcclxuICAgICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VhcmNoRWxlbWVudC5pbm5lclRleHQgPSAnIPCflI0nO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rQmFzZSA9IGAvdG9yL2Jyb3dzZS5waHA/dG9yJTVCc2VhcmNoVHlwZSU1RD1hbGwmdG9yJTVCc2VhcmNoSW4lNUQ9dG9ycmVudHMmdG9yJTVCY2F0JTVEJTVCJTVEPTAmdG9yJTVCYnJvd3NlRmxhZ3NIaWRlVnNTaG93JTVEPTAmdG9yJTVCc29ydFR5cGUlNUQ9ZGF0ZURlc2MmdG9yJTVCc3JjaEluJTVEJTVCJHt0eXBlfSU1RD10cnVlJnRvciU1QnRleHQlNUQ9YDtcclxuXHJcbiAgICAgICAgcGFyZW50RWxlbWVudFxyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihgdHI6bnRoLWNoaWxkKCR7cm93UG9zaXRpb259KSA+IHRkOm50aC1jaGlsZCgxKWApXHJcbiAgICAgICAgICAgID8uaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBzZWFyY2hFbGVtZW50KTtcclxuXHJcbiAgICAgICAgc2VhcmNoRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbnB1dHM6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gcGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGlucHV0U2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlucHV0cyAmJiBpbnB1dHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dHNMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dHNMaXN0LnB1c2goaW5wdXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gaW5wdXRzTGlzdC5qb2luKCcgJykudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChxdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaFN0cmluZyA9IHVzZVdpbGRjYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCoke2VuY29kZVVSSUNvbXBvbmVudChpbnB1dHNMaXN0LmpvaW4oJyAnKSl9KmBcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hFbGVtZW50LnNldEF0dHJpYnV0ZSgnaHJlZicsIGxpbmtCYXNlICsgc2VhcmNoU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogIyBVU0VSIFBBR0UgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogIyMjIyBEZWZhdWx0IFVzZXIgR2lmdCBBbW91bnRcclxuICovXHJcbmNsYXNzIFVzZXJHaWZ0RGVmYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdERlZmF1bHQnLFxyXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTAwMCwgbWF4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2JvbnVzZ2lmdCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgbmV3IFNoYXJlZCgpXHJcbiAgICAgICAgICAgIC5maWxsR2lmdEJveCh0aGlzLl90YXIsIHRoaXMuX3NldHRpbmdzLnRpdGxlKVxyXG4gICAgICAgICAgICAudGhlbigocG9pbnRzKSA9PlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0IHRoZSBkZWZhdWx0IGdpZnQgYW1vdW50IHRvICR7cG9pbnRzfWApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyMjIFVzZXIgR2lmdCBIaXN0b3J5XHJcbiAqL1xyXG5jbGFzcyBVc2VyR2lmdEhpc3RvcnkgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3VzZXJHaWZ0SGlzdG9yeScsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXNlciBQYWdlcyddLFxyXG4gICAgICAgIGRlc2M6ICdEaXNwbGF5IGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHlvdSBhbmQgYW5vdGhlciB1c2VyJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9zZW5kU3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjpvcmFuZ2UnPlxcdTI3RjA8L3NwYW4+YDtcclxuICAgIHByaXZhdGUgX2dldFN5bWJvbCA9IGA8c3BhbiBzdHlsZT0nY29sb3I6dGVhbCc+XFx1MjdGMTwvc3Bhbj5gO1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAndGJvZHknO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1c2VyJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbml0aWFsbGl6aW5nIHVzZXIgZ2lmdCBoaXN0b3J5Li4uJyk7XHJcblxyXG4gICAgICAgIC8vIE5hbWUgb2YgdGhlIG90aGVyIHVzZXJcclxuICAgICAgICBjb25zdCBvdGhlclVzZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgPiBoMScpIS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHJvd1xyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgICAgIGNvbnN0IGluc2VydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSB0Ym9keSB0cjpsYXN0LW9mLXR5cGUnKTtcclxuICAgICAgICBpZiAoaW5zZXJ0KSBpbnNlcnQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIGhpc3RvcnlDb250YWluZXIpO1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IHRpdGxlIGZpZWxkXHJcbiAgICAgICAgY29uc3QgaGlzdG9yeVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBoaXN0b3J5VGl0bGUuY2xhc3NMaXN0LmFkZCgncm93aGVhZCcpO1xyXG4gICAgICAgIGhpc3RvcnlUaXRsZS50ZXh0Q29udGVudCA9ICdHaWZ0IGhpc3RvcnknO1xyXG4gICAgICAgIGhpc3RvcnlDb250YWluZXIuYXBwZW5kQ2hpbGQoaGlzdG9yeVRpdGxlKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSBjb250ZW50IGZpZWxkXHJcbiAgICAgICAgY29uc3QgaGlzdG9yeUJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgaGlzdG9yeUJveC5jbGFzc0xpc3QuYWRkKCdyb3cxJyk7XHJcbiAgICAgICAgaGlzdG9yeUJveC50ZXh0Q29udGVudCA9IGBZb3UgaGF2ZSBub3QgZXhjaGFuZ2VkIGdpZnRzIHdpdGggJHtvdGhlclVzZXJ9LmA7XHJcbiAgICAgICAgaGlzdG9yeUJveC5hbGlnbiA9ICdsZWZ0JztcclxuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlCb3gpO1xyXG4gICAgICAgIC8vIEdldCB0aGUgVXNlciBJRFxyXG4gICAgICAgIGNvbnN0IHVzZXJJRCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnBvcCgpO1xyXG4gICAgICAgIC8vIFRPRE86IHVzZSBgY2RuLmAgaW5zdGVhZCBvZiBgd3d3LmA7IGN1cnJlbnRseSBjYXVzZXMgYSA0MDMgZXJyb3JcclxuICAgICAgICBpZiAodXNlcklEKSB7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgZ2lmdCBoaXN0b3J5XHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5ID0gYXdhaXQgVXRpbC5nZXRVc2VyR2lmdEhpc3RvcnkodXNlcklEKTtcclxuICAgICAgICAgICAgLy8gT25seSBkaXNwbGF5IGEgbGlzdCBpZiB0aGVyZSBpcyBhIGhpc3RvcnlcclxuICAgICAgICAgICAgaWYgKGdpZnRIaXN0b3J5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIFBvaW50ICYgRkwgdG90YWwgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBbcG9pbnRzSW4sIHBvaW50c091dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRQb2ludHMnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IFt3ZWRnZUluLCB3ZWRnZU91dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRXZWRnZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBvaW50cyBJbi9PdXQ6ICR7cG9pbnRzSW59LyR7cG9pbnRzT3V0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBXZWRnZXMgSW4vT3V0OiAke3dlZGdlSW59LyR7d2VkZ2VPdXR9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIGhpc3RvcnlCb3guaW5uZXJIVE1MID0gYFlvdSBoYXZlIHNlbnQgJHt0aGlzLl9zZW5kU3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzT3V0fSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlT3V0fSBGTCB3ZWRnZXM8L3N0cm9uZz4gdG8gJHtvdGhlclVzZXJ9IGFuZCByZWNlaXZlZCAke3RoaXMuX2dldFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c0lufSBwb2ludHM8L3N0cm9uZz4gJmFtcDsgPHN0cm9uZz4ke3dlZGdlSW59IEZMIHdlZGdlczwvc3Ryb25nPi48aHI+YDtcclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbWVzc2FnZSB0byB0aGUgYm94XHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5Qm94LmFwcGVuZENoaWxkKHRoaXMuX3Nob3dHaWZ0cyhnaWZ0SGlzdG9yeSkpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gVXNlciBnaWZ0IGhpc3RvcnkgYWRkZWQhJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBObyB1c2VyIGdpZnQgaGlzdG9yeSBmb3VuZC4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVXNlciBJRCBub3QgZm91bmQ6ICR7dXNlcklEfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgU3VtIHRoZSB2YWx1ZXMgb2YgYSBnaXZlbiBnaWZ0IHR5cGUgYXMgSW5mbG93ICYgT3V0ZmxvdyBzdW1zXHJcbiAgICAgKiBAcGFyYW0gaGlzdG9yeSB0aGUgdXNlciBnaWZ0IGhpc3RvcnlcclxuICAgICAqIEBwYXJhbSB0eXBlIHBvaW50cyBvciB3ZWRnZXNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc3VtR2lmdHMoXHJcbiAgICAgICAgaGlzdG9yeTogVXNlckdpZnRIaXN0b3J5W10sXHJcbiAgICAgICAgdHlwZTogJ2dpZnRQb2ludHMnIHwgJ2dpZnRXZWRnZSdcclxuICAgICk6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGNvbnN0IG91dGZsb3cgPSBbMF07XHJcbiAgICAgICAgY29uc3QgaW5mbG93ID0gWzBdO1xyXG4gICAgICAgIC8vIE9ubHkgcmV0cmlldmUgYW1vdW50cyBvZiBhIHNwZWNpZmllZCBnaWZ0IHR5cGVcclxuICAgICAgICBoaXN0b3J5Lm1hcCgoZ2lmdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZ2lmdC50eXBlID09PSB0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTcGxpdCBpbnRvIEluZmxvdy9PdXRmbG93XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2lmdC5hbW91bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mbG93LnB1c2goZ2lmdC5hbW91bnQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRmbG93LnB1c2goZ2lmdC5hbW91bnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gU3VtIGFsbCBpdGVtcyBpbiB0aGUgZmlsdGVyZWQgYXJyYXlcclxuICAgICAgICBjb25zdCBzdW1PdXQgPSBvdXRmbG93LnJlZHVjZSgoYWNjdW11bGF0ZSwgY3VycmVudCkgPT4gYWNjdW11bGF0ZSArIGN1cnJlbnQpO1xyXG4gICAgICAgIGNvbnN0IHN1bUluID0gaW5mbG93LnJlZHVjZSgoYWNjdW11bGF0ZSwgY3VycmVudCkgPT4gYWNjdW11bGF0ZSArIGN1cnJlbnQpO1xyXG4gICAgICAgIHJldHVybiBbc3VtSW4sIE1hdGguYWJzKHN1bU91dCldO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBDcmVhdGVzIGEgbGlzdCBvZiB0aGUgbW9zdCByZWNlbnQgZ2lmdHNcclxuICAgICAqIEBwYXJhbSBoaXN0b3J5IFRoZSBmdWxsIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHR3byB1c2Vyc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zaG93R2lmdHMoaGlzdG9yeTogVXNlckdpZnRIaXN0b3J5W10pIHtcclxuICAgICAgICAvLyBJZiB0aGUgZ2lmdCB3YXMgYSB3ZWRnZSwgcmV0dXJuIGN1c3RvbSB0ZXh0XHJcbiAgICAgICAgY29uc3QgX3dlZGdlT3JQb2ludHMgPSAoZ2lmdDogVXNlckdpZnRIaXN0b3J5KTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRQb2ludHMnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7TWF0aC5hYnMoZ2lmdC5hbW91bnQpfWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2lmdC50eXBlID09PSAnZ2lmdFdlZGdlJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcoRkwpJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBgRXJyb3I6IHVua25vd24gZ2lmdCB0eXBlLi4uICR7Z2lmdC50eXBlfTogJHtnaWZ0LmFtb3VudH1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYSBsaXN0IGZvciB0aGUgaGlzdG9yeVxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcclxuICAgICAgICBPYmplY3QuYXNzaWduKGhpc3RvcnlMaXN0LnN0eWxlLCB7XHJcbiAgICAgICAgICAgIGxpc3RTdHlsZTogJ25vbmUnLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnaW5pdGlhbCcsXHJcbiAgICAgICAgICAgIGhlaWdodDogJzEwZW0nLFxyXG4gICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIExvb3Agb3ZlciBoaXN0b3J5IGl0ZW1zIGFuZCBhZGQgdG8gYW4gYXJyYXlcclxuICAgICAgICBjb25zdCBnaWZ0czogc3RyaW5nW10gPSBoaXN0b3J5Lm1hcCgoZ2lmdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBBZGQgc29tZSBzdHlsaW5nIGRlcGVuZGluZyBvbiBwb3MvbmVnIG51bWJlcnNcclxuICAgICAgICAgICAgbGV0IGZhbmN5R2lmdEFtb3VudDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICBpZiAoZ2lmdC5hbW91bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBmYW5jeUdpZnRBbW91bnQgPSBgJHt0aGlzLl9nZXRTeW1ib2x9ICR7X3dlZGdlT3JQb2ludHMoZ2lmdCl9YDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZhbmN5R2lmdEFtb3VudCA9IGAke3RoaXMuX3NlbmRTeW1ib2x9ICR7X3dlZGdlT3JQb2ludHMoZ2lmdCl9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBNYWtlIHRoZSBkYXRlIHJlYWRhYmxlXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBVdGlsLnByZXR0eVNpdGVUaW1lKGdpZnQudGltZXN0YW1wLCB0cnVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGA8bGkgY2xhc3M9J21wX2dpZnRJdGVtJz4ke2RhdGV9ICR7ZmFuY3lHaWZ0QW1vdW50fTwvbGk+YDtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBBZGQgaGlzdG9yeSBpdGVtcyB0byB0aGUgbGlzdFxyXG4gICAgICAgIGhpc3RvcnlMaXN0LmlubmVySFRNTCA9IGdpZnRzLmpvaW4oJycpO1xyXG4gICAgICAgIHJldHVybiBoaXN0b3J5TGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBQTEFDRSBBTEwgTSsgRkVBVFVSRVMgSEVSRVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICpcclxuICogTmVhcmx5IGFsbCBmZWF0dXJlcyBiZWxvbmcgaGVyZSwgYXMgdGhleSBzaG91bGQgaGF2ZSBpbnRlcm5hbCBjaGVja3NcclxuICogZm9yIERPTSBlbGVtZW50cyBhcyBuZWVkZWQuIE9ubHkgY29yZSBmZWF0dXJlcyBzaG91bGQgYmUgcGxhY2VkIGluIGBhcHAudHNgXHJcbiAqXHJcbiAqIFRoaXMgZGV0ZXJtaW5lcyB0aGUgb3JkZXIgaW4gd2hpY2ggc2V0dGluZ3Mgd2lsbCBiZSBnZW5lcmF0ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2UuXHJcbiAqIFNldHRpbmdzIHdpbGwgYmUgZ3JvdXBlZCBieSB0eXBlIGFuZCBGZWF0dXJlcyBvZiBvbmUgdHlwZSB0aGF0IGFyZSBjYWxsZWQgYmVmb3JlXHJcbiAqIG90aGVyIEZlYXR1cmVzIG9mIHRoZSBzYW1lIHR5cGUgd2lsbCBhcHBlYXIgZmlyc3QuXHJcbiAqXHJcbiAqIFRoZSBvcmRlciBvZiB0aGUgZmVhdHVyZSBncm91cHMgaXMgbm90IGRldGVybWluZWQgaGVyZS5cclxuICovXHJcbmNsYXNzIEluaXRGZWF0dXJlcyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBJbml0aWFsaXplIEdsb2JhbCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgSGlkZUhvbWUoKTtcclxuICAgICAgICBuZXcgSGlkZVNlZWRib3goKTtcclxuICAgICAgICBuZXcgQmx1cnJlZEhlYWRlcigpO1xyXG4gICAgICAgIG5ldyBWYXVsdExpbmsoKTtcclxuICAgICAgICBuZXcgTWluaVZhdWx0SW5mbygpO1xyXG4gICAgICAgIG5ldyBCb251c1BvaW50RGVsdGEoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBIb21lIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEhpZGVOZXdzKCk7XHJcbiAgICAgICAgbmV3IEdpZnROZXdlc3QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBTZWFyY2ggUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgVG9nZ2xlU25hdGNoZWQoKTtcclxuICAgICAgICBuZXcgU3RpY2t5U25hdGNoZWRUb2dnbGUoKTtcclxuICAgICAgICBuZXcgUGxhaW50ZXh0U2VhcmNoKCk7XHJcbiAgICAgICAgbmV3IFRvZ2dsZVNlYXJjaGJveCgpO1xyXG4gICAgICAgIG5ldyBCdWlsZFRhZ3MoKTtcclxuICAgICAgICBuZXcgUmFuZG9tQm9vaygpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFJlcXVlc3QgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgR29vZHJlYWRzQnV0dG9uUmVxKCk7XHJcbiAgICAgICAgbmV3IFRvZ2dsZUhpZGRlblJlcXVlc3RlcnMoKTtcclxuICAgICAgICBuZXcgUGxhaW50ZXh0UmVxdWVzdCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFRvcnJlbnQgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgR29vZHJlYWRzQnV0dG9uKCk7XHJcbiAgICAgICAgbmV3IEN1cnJlbnRseVJlYWRpbmcoKTtcclxuICAgICAgICBuZXcgVG9yR2lmdERlZmF1bHQoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0KCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEwxKCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEwyKCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdEwzKCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdE1pbigpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFNob3V0Ym94IGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBQcmlvcml0eVVzZXJzKCk7XHJcbiAgICAgICAgbmV3IFByaW9yaXR5U3R5bGUoKTtcclxuICAgICAgICBuZXcgTXV0ZWRVc2VycygpO1xyXG4gICAgICAgIG5ldyBSZXBseVNpbXBsZSgpO1xyXG4gICAgICAgIG5ldyBSZXBseVF1b3RlKCk7XHJcbiAgICAgICAgbmV3IEdpZnRCdXR0b24oKTtcclxuICAgICAgICBuZXcgUXVpY2tTaG91dCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFZhdWx0IGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBTaW1wbGVWYXVsdCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFVzZXIgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgVXNlckdpZnREZWZhdWx0KCk7XHJcbiAgICAgICAgbmV3IFVzZXJHaWZ0SGlzdG9yeSgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIEZvcnVtIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEZvcnVtRkxHaWZ0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVXBsb2FkIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFNlYXJjaEZvckR1cGxpY2F0ZXMoKTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiY2hlY2sudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XHJcblxyXG4vKipcclxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHNldHRpbmdzIGFuZCB0aGUgUHJlZmVyZW5jZXMgcGFnZVxyXG4gKiBAbWV0aG9kIGluaXQ6IHR1cm5zIGZlYXR1cmVzJyBzZXR0aW5ncyBpbmZvIGludG8gYSB1c2VhYmxlIHRhYmxlXHJcbiAqL1xyXG5jbGFzcyBTZXR0aW5ncyB7XHJcbiAgICAvLyBGdW5jdGlvbiBmb3IgZ2F0aGVyaW5nIHRoZSBuZWVkZWQgc2NvcGVzXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0U2NvcGVzKHNldHRpbmdzOiBBbnlGZWF0dXJlW10pOiBQcm9taXNlPFNldHRpbmdHbG9iT2JqZWN0PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2NvcGVzKCcsIHNldHRpbmdzLCAnKScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc2NvcGVMaXN0OiBTZXR0aW5nR2xvYk9iamVjdCA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNldHRpbmcgb2Ygc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4OiBudW1iZXIgPSBOdW1iZXIoc2V0dGluZy5zY29wZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgU2NvcGUgZXhpc3RzLCBwdXNoIHRoZSBzZXR0aW5ncyBpbnRvIHRoZSBhcnJheVxyXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlTGlzdFtpbmRleF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZUxpc3RbaW5kZXhdLnB1c2goc2V0dGluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0gPSBbc2V0dGluZ107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZShzY29wZUxpc3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZ1bmN0aW9uIGZvciBjb25zdHJ1Y3RpbmcgdGhlIHRhYmxlIGZyb20gYW4gb2JqZWN0XHJcbiAgICBwcml2YXRlIHN0YXRpYyBfYnVpbGRUYWJsZShwYWdlOiBTZXR0aW5nR2xvYk9iamVjdCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnX2J1aWxkVGFibGUoJywgcGFnZSwgJyknKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgbGV0IG91dHAgPSBgPHRib2R5Pjx0cj48dGQgY2xhc3M9XCJyb3cxXCIgY29sc3Bhbj1cIjJcIj48YnI+PHN0cm9uZz5NQU0rIHYke01QLlZFUlNJT059PC9zdHJvbmc+IC0gSGVyZSB5b3UgY2FuIGVuYWJsZSAmYW1wOyBkaXNhYmxlIGFueSBmZWF0dXJlIGZyb20gdGhlIDxhIGhyZWY9XCIvZi90LzQxODYzXCI+TUFNKyB1c2Vyc2NyaXB0PC9hPiEgSG93ZXZlciwgdGhlc2Ugc2V0dGluZ3MgYXJlIDxzdHJvbmc+Tk9UPC9zdHJvbmc+IHN0b3JlZCBvbiBNQU07IHRoZXkgYXJlIHN0b3JlZCB3aXRoaW4gdGhlIFRhbXBlcm1vbmtleS9HcmVhc2Vtb25rZXkgZXh0ZW5zaW9uIGluIHlvdXIgYnJvd3NlciwgYW5kIG11c3QgYmUgY3VzdG9taXplZCBvbiBlYWNoIG9mIHlvdXIgYnJvd3NlcnMvZGV2aWNlcyBzZXBhcmF0ZWx5Ljxicj48YnI+Rm9yIGEgZGV0YWlsZWQgbG9vayBhdCB0aGUgYXZhaWxhYmxlIGZlYXR1cmVzLCA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2dhcmRlbnNoYWRlL21hbS1wbHVzL3dpa2kvRmVhdHVyZS1PdmVydmlld1wiPmNoZWNrIHRoZSBXaWtpITwvYT48YnI+PGJyPjwvdGQ+PC90cj5gO1xyXG5cclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNjb3BlTnVtOiBudW1iZXIgPSBOdW1iZXIoc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBzZWN0aW9uIHRpdGxlXHJcbiAgICAgICAgICAgICAgICBvdXRwICs9IGA8dHI+PHRkIGNsYXNzPSdyb3cyJz4ke1NldHRpbmdHcm91cFtzY29wZU51bV19PC90ZD48dGQgY2xhc3M9J3JvdzEnPmA7XHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIGlucHV0IGZpZWxkIGJhc2VkIG9uIHRoZSBzZXR0aW5nXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlW3Njb3BlTnVtXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOdW1iZXI6IG51bWJlciA9IE51bWJlcihzZXR0aW5nKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtOiBBbnlGZWF0dXJlID0gcGFnZVtzY29wZU51bV1bc2V0dGluZ051bWJlcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPGlucHV0IHR5cGU9J2NoZWNrYm94JyBpZD0nJHtpdGVtLnRpdGxlfScgdmFsdWU9J3RydWUnPiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8c3BhbiBjbGFzcz0nbXBfc2V0VGFnJz4ke2l0ZW0udGFnfTo8L3NwYW4+IDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nJHtpdGVtLnRpdGxlfScgcGxhY2Vob2xkZXI9JyR7aXRlbS5wbGFjZWhvbGRlcn0nIGNsYXNzPSdtcF90ZXh0SW5wdXQnIHNpemU9JzI1Jz4ke2l0ZW0uZGVzY308YnI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPHNlbGVjdCBpZD0nJHtpdGVtLnRpdGxlfScgY2xhc3M9J21wX2Ryb3BJbnB1dCc+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhpdGVtLm9wdGlvbnMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8b3B0aW9uIHZhbHVlPScke2tleX0nPiR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9wdGlvbnMhW2tleV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTwvb3B0aW9uPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8L3NlbGVjdD4ke2l0ZW0uZGVzY308YnI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUpIGNhc2VzW2l0ZW0udHlwZV0oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHJvd1xyXG4gICAgICAgICAgICAgICAgb3V0cCArPSAnPC90ZD48L3RyPic7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNhdmUgYnV0dG9uICYgbGFzdCBwYXJ0IG9mIHRoZSB0YWJsZVxyXG4gICAgICAgICAgICBvdXRwICs9XHJcbiAgICAgICAgICAgICAgICAnPHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxkaXYgaWQ9XCJtcF9zdWJtaXRcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5TYXZlIE0rIFNldHRpbmdzPz88L2Rpdj48ZGl2IGlkPVwibXBfY29weVwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPkNvcHkgU2V0dGluZ3M8L2Rpdj48ZGl2IGlkPVwibXBfaW5qZWN0XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+UGFzdGUgU2V0dGluZ3M8L2Rpdj48c3BhbiBjbGFzcz1cIm1wX3NhdmVzdGF0ZVwiIHN0eWxlPVwib3BhY2l0eTowXCI+U2F2ZWQhPC9zcGFuPjwvdGQ+PC90cj48L3Rib2R5Pic7XHJcblxyXG4gICAgICAgICAgICByZXNvbHZlKG91dHApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBjdXJyZW50IHNldHRpbmdzIHZhbHVlc1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNldHRpbmdzKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KSB7XHJcbiAgICAgICAgLy8gVXRpbC5wdXJnZVNldHRpbmdzKCk7XHJcbiAgICAgICAgY29uc3QgYWxsVmFsdWVzOiBzdHJpbmdbXSA9IEdNX2xpc3RWYWx1ZXMoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ19nZXRTZXR0aW5ncygnLCBwYWdlLCAnKVxcblN0b3JlZCBHTSBrZXlzOicsIGFsbFZhbHVlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5rZXlzKHBhZ2UpLmZvckVhY2goKHNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2VbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWYgPSBwYWdlW051bWJlcihzY29wZSldW051bWJlcihzZXR0aW5nKV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdQcmVmOicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWYudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IFNldDonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfWApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCBWYWx1ZTonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZi50aXRsZSkhXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKHByZWYudGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0gJiYgR01fZ2V0VmFsdWUocHJlZi50aXRsZSkpIGNhc2VzW3ByZWYudHlwZV0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NldFNldHRpbmdzKG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBfc2V0U2V0dGluZ3MoYCwgb2JqLCAnKScpO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmID0gb2JqW051bWJlcihzY29wZSldW051bWJlcihzZXR0aW5nKV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZi50aXRsZSkhXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbS5jaGVja2VkKSBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wOiBzdHJpbmcgPSBlbGVtLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnAgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYCwgaW5wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIGVsZW0udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0pIGNhc2VzW3ByZWYudHlwZV0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2F2ZWQhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NvcHlTZXR0aW5ncygpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGdtTGlzdCA9IEdNX2xpc3RWYWx1ZXMoKTtcclxuICAgICAgICBjb25zdCBvdXRwOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCBzdG9yZWQgc2V0dGluZ3MgYW5kIHB1c2ggdG8gb3V0cHV0IGFycmF5XHJcbiAgICAgICAgZ21MaXN0Lm1hcCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAvLyBEb24ndCBleHBvcnQgbXBfIHNldHRpbmdzIGFzIHRoZXkgc2hvdWxkIG9ubHkgYmUgc2V0IGF0IHJ1bnRpbWVcclxuICAgICAgICAgICAgaWYgKHNldHRpbmcuaW5kZXhPZignbXBfJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwLnB1c2goW3NldHRpbmcsIEdNX2dldFZhbHVlKHNldHRpbmcpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dHApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9wYXN0ZVNldHRpbmdzKHBheWxvYWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cChgX3Bhc3RlU2V0dGluZ3MoIClgKTtcclxuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IEpTT04ucGFyc2UocGF5bG9hZCk7XHJcbiAgICAgICAgc2V0dGluZ3MuZm9yRWFjaCgodHVwbGU6IFtzdHJpbmcsIHN0cmluZ11bXSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHVwbGVbMV0pIHtcclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3R1cGxlWzBdfWAsIGAke3R1cGxlWzFdfWApO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyh0dXBsZVswXSwgJzogJywgdHVwbGVbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gdGhhdCBzYXZlcyB0aGUgdmFsdWVzIG9mIHRoZSBzZXR0aW5ncyB0YWJsZVxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NhdmVTZXR0aW5ncyh0aW1lcjogbnVtYmVyLCBvYmo6IFNldHRpbmdHbG9iT2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfc2F2ZVNldHRpbmdzKClgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2F2ZXN0YXRlOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3Bhbi5tcF9zYXZlc3RhdGUnKSFcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWVzOiBzdHJpbmdbXSA9IEdNX2xpc3RWYWx1ZXMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgdGltZXIgJiBtZXNzYWdlXHJcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lcik7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmluZy4uLicpO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHZhbHVlcyBzdG9yZWQgaW4gR00gYW5kIHJlc2V0IGV2ZXJ5dGhpbmdcclxuICAgICAgICBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gZ21WYWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBnbVZhbHVlc1tmZWF0dXJlXSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgLy8gT25seSBsb29wIG92ZXIgdmFsdWVzIHRoYXQgYXJlIGZlYXR1cmUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIGlmICghWydtcF92ZXJzaW9uJywgJ3N0eWxlX3RoZW1lJ10uaW5jbHVkZXMoZ21WYWx1ZXNbZmVhdHVyZV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBub3QgcGFydCBvZiBwcmVmZXJlbmNlcyBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdtVmFsdWVzW2ZlYXR1cmVdLmluZGV4T2YoJ21wXycpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGdtVmFsdWVzW2ZlYXR1cmVdLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTYXZlIHRoZSBzZXR0aW5ncyB0byBHTSB2YWx1ZXNcclxuICAgICAgICB0aGlzLl9zZXRTZXR0aW5ncyhvYmopO1xyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHRoZSBjb25maXJtYXRpb24gbWVzc2FnZVxyXG4gICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XHJcbiAgICAgICAgICAgIH0sIDIzNDUpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc2VydHMgdGhlIHNldHRpbmdzIHBhZ2UuXHJcbiAgICAgKiBAcGFyYW0gcmVzdWx0IFZhbHVlIHRoYXQgbXVzdCBiZSBwYXNzZWQgZG93biBmcm9tIGBDaGVjay5wYWdlKCdzZXR0aW5ncycpYFxyXG4gICAgICogQHBhcmFtIHNldHRpbmdzIFRoZSBhcnJheSBvZiBmZWF0dXJlcyB0byBwcm92aWRlIHNldHRpbmdzIGZvclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGluaXQocmVzdWx0OiBib29sZWFuLCBzZXR0aW5nczogQW55RmVhdHVyZVtdKSB7XHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIG9ubHkgcnVuIGlmIGBDaGVjay5wYWdlKCdzZXR0aW5ncylgIHJldHVybnMgdHJ1ZSAmIGlzIHBhc3NlZCBoZXJlXHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYG5ldyBTZXR0aW5ncygpYCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgdGFibGUgaGFzIGxvYWRlZFxyXG4gICAgICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnI21haW5Cb2R5ID4gdGFibGUnKS50aGVuKChyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBbTStdIFN0YXJ0aW5nIHRvIGJ1aWxkIFNldHRpbmdzIHRhYmxlLi4uYCk7XHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHRhYmxlIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nTmF2OiBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gdGFibGUnKSE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nVGl0bGU6IEhUTUxIZWFkaW5nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nVGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZ2VTY29wZTogU2V0dGluZ0dsb2JPYmplY3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHRhYmxlIGVsZW1lbnRzIGFmdGVyIHRoZSBQcmVmIG5hdmJhclxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ05hdi5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RpdGxlKTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdUaXRsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZXR0aW5nVGFibGUsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogJ2NvbHRhYmxlJyxcclxuICAgICAgICAgICAgICAgICAgICBjZWxsc3BhY2luZzogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnd2lkdGg6MTAwJTttaW4td2lkdGg6MTAwJTttYXgtd2lkdGg6MTAwJTsnLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5uZXJIVE1MID0gJ01BTSsgU2V0dGluZ3MnO1xyXG4gICAgICAgICAgICAgICAgLy8gR3JvdXAgc2V0dGluZ3MgYnkgcGFnZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2NvcGVzKHNldHRpbmdzKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRhYmxlIEhUTUwgZnJvbSBmZWF0dXJlIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlU2NvcGUgPSBzY29wZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9idWlsZFRhYmxlKHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgY29udGVudCBpbnRvIHRoZSBuZXcgdGFibGUgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdUYWJsZS5pbm5lckhUTUwgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBNQU0rIFNldHRpbmdzIHRhYmxlIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFnZVNjb3BlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXRTZXR0aW5ncyhzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyBhcmUgZG9uZSBsb2FkaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zdWJtaXQnKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2NvcHknKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzdGVCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9pbmplY3QnKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNzVGltZXI6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zYXZlU2V0dGluZ3Moc3NUaW1lciwgc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4ocGFzdGVCdG4sIHRoaXMuX3Bhc3RlU2V0dGluZ3MsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX2NvcHlTZXR0aW5ncygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwZXMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic3R5bGUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2NvcmUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2dsb2JhbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvaG9tZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdG9yLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9mb3J1bS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvc2hvdXQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2Jyb3dzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvcmVxdWVzdC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdmF1bHQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VwbG9hZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdXNlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJmZWF0dXJlcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzZXR0aW5ncy50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBVc2Vyc2NyaXB0IG5hbWVzcGFjZVxyXG4gKiBAY29uc3RhbnQgQ0hBTkdFTE9HOiBPYmplY3QgY29udGFpbmluZyBhIGxpc3Qgb2YgY2hhbmdlcyBhbmQga25vd24gYnVnc1xyXG4gKiBAY29uc3RhbnQgVElNRVNUQU1QOiBQbGFjZWhvbGRlciBob29rIGZvciB0aGUgY3VycmVudCBidWlsZCB0aW1lXHJcbiAqIEBjb25zdGFudCBWRVJTSU9OOiBUaGUgY3VycmVudCB1c2Vyc2NyaXB0IHZlcnNpb25cclxuICogQGNvbnN0YW50IFBSRVZfVkVSOiBUaGUgbGFzdCBpbnN0YWxsZWQgdXNlcnNjcmlwdCB2ZXJzaW9uXHJcbiAqIEBjb25zdGFudCBFUlJPUkxPRzogVGhlIHRhcmdldCBhcnJheSBmb3IgbG9nZ2luZyBlcnJvcnNcclxuICogQGNvbnN0YW50IFBBR0VfUEFUSDogVGhlIGN1cnJlbnQgcGFnZSBVUkwgd2l0aG91dCB0aGUgc2l0ZSBhZGRyZXNzXHJcbiAqIEBjb25zdGFudCBNUF9DU1M6IFRoZSBNQU0rIHN0eWxlc2hlZXRcclxuICogQGNvbnN0YW50IHJ1bigpOiBTdGFydHMgdGhlIHVzZXJzY3JpcHRcclxuICovXHJcbm5hbWVzcGFjZSBNUCB7XHJcbiAgICBleHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgnZGVidWcnKSA/IHRydWUgOiBmYWxzZTtcclxuICAgIGV4cG9ydCBjb25zdCBDSEFOR0VMT0c6IEFycmF5T2JqZWN0ID0ge1xyXG4gICAgICAgIC8qIPCfhpXimbvvuI/wn5CeICovXHJcbiAgICAgICAgVVBEQVRFX0xJU1Q6IFsn8J+GlTogQWRkZWQgc2VhcmNoIGJ1dHRvbnMgdG8gdXBsb2FkIHBhZ2UuIEAgTW9yaSddIGFzIHN0cmluZ1tdLFxyXG4gICAgICAgIEJVR19MSVNUOiBbXSBhcyBzdHJpbmdbXSxcclxuICAgIH07XHJcbiAgICBleHBvcnQgY29uc3QgVElNRVNUQU1QOiBzdHJpbmcgPSAnIyNtZXRhX3RpbWVzdGFtcCMjJztcclxuICAgIGV4cG9ydCBjb25zdCBWRVJTSU9OOiBzdHJpbmcgPSBDaGVjay5uZXdWZXI7XHJcbiAgICBleHBvcnQgY29uc3QgUFJFVl9WRVI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IENoZWNrLnByZXZWZXI7XHJcbiAgICBleHBvcnQgY29uc3QgRVJST1JMT0c6IHN0cmluZ1tdID0gW107XHJcbiAgICBleHBvcnQgY29uc3QgUEFHRV9QQVRIOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBleHBvcnQgY29uc3QgTVBfQ1NTOiBTdHlsZSA9IG5ldyBTdHlsZSgpO1xyXG4gICAgZXhwb3J0IGNvbnN0IHNldHRpbmdzR2xvYjogQW55RmVhdHVyZVtdID0gW107XHJcblxyXG4gICAgZXhwb3J0IGNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFBSRSBTQ1JJUFRcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zb2xlLmdyb3VwKGBXZWxjb21lIHRvIE1BTSsgdiR7VkVSU0lPTn0hYCk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBjdXJyZW50IHBhZ2UgaXMgbm90IHlldCBrbm93blxyXG4gICAgICAgIEdNX2RlbGV0ZVZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xyXG4gICAgICAgIENoZWNrLnBhZ2UoKTtcclxuICAgICAgICAvLyBBZGQgYSBzaW1wbGUgY29va2llIHRvIGFubm91bmNlIHRoZSBzY3JpcHQgaXMgYmVpbmcgdXNlZFxyXG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9ICdtcF9lbmFibGVkPTE7ZG9tYWluPW15YW5vbmFtb3VzZS5uZXQ7cGF0aD0vO3NhbWVzaXRlPWxheCc7XHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBjb3JlIGZ1bmN0aW9uc1xyXG4gICAgICAgIGNvbnN0IGFsZXJ0czogQWxlcnRzID0gbmV3IEFsZXJ0cygpO1xyXG4gICAgICAgIG5ldyBEZWJ1ZygpO1xyXG4gICAgICAgIC8vIE5vdGlmeSB0aGUgdXNlciBpZiB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgQ2hlY2sudXBkYXRlZCgpLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSBhbGVydHMubm90aWZ5KHJlc3VsdCwgQ0hBTkdFTE9HKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBmZWF0dXJlc1xyXG4gICAgICAgIG5ldyBJbml0RmVhdHVyZXMoKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBTRVRUSU5HU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIENoZWNrLnBhZ2UoJ3NldHRpbmdzJykudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN1YlBnOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlICYmIChzdWJQZyA9PT0gJycgfHwgc3ViUGcgPT09ICc/dmlldz1nZW5lcmFsJykpIHtcclxuICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIHNldHRpbmdzIHBhZ2VcclxuICAgICAgICAgICAgICAgIFNldHRpbmdzLmluaXQocmVzdWx0LCBzZXR0aW5nc0dsb2IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogU1RZTEVTXHJcbiAgICAgICAgICogSW5qZWN0cyBDU1NcclxuICAgICAgICAgKi9cclxuICAgICAgICBDaGVjay5lbGVtTG9hZCgnaGVhZCBsaW5rW2hyZWYqPVwiSUNHc3RhdGlvblwiXScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBBZGQgY3VzdG9tIENTUyBzaGVldFxyXG4gICAgICAgICAgICBNUF9DU1MuaW5qZWN0TGluaygpO1xyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgc2l0ZSB0aGVtZVxyXG4gICAgICAgICAgICBNUF9DU1MuYWxpZ25Ub1NpdGVUaGVtZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICB9O1xyXG59XHJcblxyXG4vLyAqIFN0YXJ0IHRoZSB1c2Vyc2NyaXB0XHJcbk1QLnJ1bigpO1xyXG4iXX0=
