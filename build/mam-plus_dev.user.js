// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.3.4
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://www.myanonamouse.net/*
// @include      https://*.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.3.4
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
    SettingGroup[SettingGroup["User Pages"] = 7] = "User Pages";
    SettingGroup[SettingGroup["Upload Page"] = 8] = "Upload Page";
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
                    const timer = new Promise((resolve) => setTimeout(resolve, 2000, false));
                    const checkElem = Check.elemLoad(elem);
                    return Promise.race([timer, checkElem]).then((val) => {
                        if (val) {
                            return true;
                        }
                        else {
                            console.warn(`startFeature(${settings.title}) Unable to initiate! Could not find element: ${elem}`);
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
        return `https://r.mrd.ninja/https://www.goodreads.com/search?q=${encodeURIComponent(inp.replace('%', '')).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;
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
        const _getUID = (node) => this.extractFromShout(node, 'a[href^="/u/"]', 'href');
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
        const _makeNameTag = (name, hex, uid) => {
            uid = uid.match(/\d+/g).join(''); // Get the UID, but only the digits
            hex = hex ? `;${hex}` : ''; // If there is a hex value, prepend `;`
            return `@[ulink=${uid}${hex}]${name}[/ulink]`;
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
                    const userID = this.extractFromShout(node, 'a[href^="/u/"]', 'href');
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
                                replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: `;
                            }
                            else {
                                replyBox.value = `${replyBox.value} ${_makeNameTag(userName, nameColor, userID)} `;
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
                            replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: \u201c[i]${text}[/i]\u201d `;
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
            /* If the child is a node with children (ex. not plain text) check to see if
            the child is a link. If the link does NOT start with `/u/` (indicating a user)
            then change the link to the string `[Link]`.
            In all other cases, return the child text content. */
            if (child.childNodes.length > 0) {
                const childElem = Util.nodeToElem(child);
                if (!childElem.hasAttribute('href')) {
                    textArr.push(child.textContent);
                }
                else if (childElem.getAttribute('href').indexOf('/u/') < 0) {
                    textArr.push('[Link]');
                }
                else {
                    textArr.push(child.textContent);
                }
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
            selectButton.innerHTML = '\u2191 Select';
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
                    eval(`jsonList.` +
                        replacedText +
                        `= "` +
                        encodeURIComponent(quickShoutText.value) +
                        `";`);
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
                        // console.log(comboBoxOption);
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
                    const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //show the text area for input
                    quickShoutText.style.display = '';
                    //expand the footer to accomodate all feature aspects
                    shoutFoot.style.height = '11em';
                    //if what is in the input field is a saved entry key
                    if (jsonList[inputVal]) {
                        //this can be a sucky line of code because it can wipe out unsaved data, but i cannot think of better way
                        //replace the text area contents with what the value is in the matched pair
                        // quickShoutText.value = jsonList[JSON.parse(inputVal)];
                        quickShoutText.value = decodeURIComponent(jsonList[inputVal]);
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
                const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                //if the input field is blank
                if (!comboBoxInput.value) {
                    //restyle save button for unsaved and unnamed
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    //hide delete button
                    deleteButton.style.display = 'none';
                }
                //if input field has text in it
                else if (jsonList[inputVal] &&
                    quickShoutText.value !== decodeURIComponent(jsonList[inputVal])) {
                    //restyle save button as yellow for editted
                    saveButton.style.backgroundColor = 'Yellow';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = '';
                    //if the key is a match and the data is a match then we have a 100% saved entry and can put everything back to saved
                }
                else if (jsonList[inputVal] &&
                    quickShoutText.value === decodeURIComponent(jsonList[inputVal])) {
                    //restyle save button to green for saved
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    deleteButton.style.display = '';
                    //if the key is not found in the saved list, orange for unsaved and unnamed
                }
                else if (!jsonList[inputVal]) {
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
            const parentElement = document.querySelector('#mainBody');
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
        searchElement.textContent = ' 🔍';
        const linkBase = `/tor/browse.php?tor%5BsearchType%5D=all&tor%5BsearchIn%5D=torrents&tor%5Bcat%5D%5B%5D=0&tor%5BbrowseFlagsHideVsShow%5D=0&tor%5BsortType%5D=dateDesc&tor%5BsrchIn%5D%5B${type}%5D=true&tor%5Btext%5D=`;
        (_a = parentElement
            .querySelector(`#uploadForm > tbody > tr:nth-child(${rowPosition}) > td:nth-child(1)`)) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('beforeend', searchElement);
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
        UPDATE_LIST: [
            '🐞: Changed to MAMs mrd.ninja dereferal service, so external links work again',
        ],
        BUG_LIST: [],
    };
    MP.TIMESTAMP = 'Jun 24';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL2hvbWUudHMiLCJzcmMvbW9kdWxlcy9zaGFyZWQudHMiLCJzcmMvbW9kdWxlcy90b3IudHMiLCJzcmMvbW9kdWxlcy9mb3J1bS50cyIsInNyYy9tb2R1bGVzL3Nob3V0LnRzIiwic3JjL21vZHVsZXMvYnJvd3NlLnRzIiwic3JjL21vZHVsZXMvcmVxdWVzdC50cyIsInNyYy9tb2R1bGVzL3ZhdWx0LnRzIiwic3JjL21vZHVsZXMvdXBsb2FkLnRzIiwic3JjL21vZHVsZXMvdXNlci50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBaUJILElBQUssWUFZSjtBQVpELFdBQUssWUFBWTtJQUNiLG1EQUFRLENBQUE7SUFDUiwrQ0FBTSxDQUFBO0lBQ04sbURBQVEsQ0FBQTtJQUNSLHVEQUFVLENBQUE7SUFDViwrREFBYyxDQUFBO0lBQ2QsdURBQVUsQ0FBQTtJQUNWLGlEQUFPLENBQUE7SUFDUCwyREFBWSxDQUFBO0lBQ1osNkRBQWEsQ0FBQTtJQUNiLGlEQUFPLENBQUE7SUFDUCxrREFBTyxDQUFBO0FBQ1gsQ0FBQyxFQVpJLFlBQVksS0FBWixZQUFZLFFBWWhCO0FDL0JEOzs7O0dBSUc7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENB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QUFGLEVBQUUsUUE4RFg7QUFFRCx5QkFBeUI7QUFDekIsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6Im1hbS1wbHVzX2Rldi51c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFR5cGVzLCBJbnRlcmZhY2VzLCBldGMuXHJcbiAqL1xyXG5cclxudHlwZSBWYWxpZFBhZ2UgPVxyXG4gICAgfCAnaG9tZSdcclxuICAgIHwgJ2Jyb3dzZSdcclxuICAgIHwgJ3JlcXVlc3QnXHJcbiAgICB8ICdyZXF1ZXN0IGRldGFpbHMnXHJcbiAgICB8ICd0b3JyZW50J1xyXG4gICAgfCAnc2hvdXRib3gnXHJcbiAgICB8ICd2YXVsdCdcclxuICAgIHwgJ3VzZXInXHJcbiAgICB8ICd1cGxvYWQnXHJcbiAgICB8ICdmb3J1bSB0aHJlYWQnXHJcbiAgICB8ICdzZXR0aW5ncyc7XHJcblxyXG50eXBlIEJvb2tEYXRhID0gJ2Jvb2snIHwgJ2F1dGhvcicgfCAnc2VyaWVzJztcclxuXHJcbmVudW0gU2V0dGluZ0dyb3VwIHtcclxuICAgICdHbG9iYWwnLFxyXG4gICAgJ0hvbWUnLFxyXG4gICAgJ1NlYXJjaCcsXHJcbiAgICAnUmVxdWVzdHMnLFxyXG4gICAgJ1RvcnJlbnQgUGFnZScsXHJcbiAgICAnU2hvdXRib3gnLFxyXG4gICAgJ1ZhdWx0JyxcclxuICAgICdVc2VyIFBhZ2VzJyxcclxuICAgICdVcGxvYWQgUGFnZScsXHJcbiAgICAnRm9ydW0nLFxyXG4gICAgJ090aGVyJyxcclxufVxyXG5cclxudHlwZSBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JyB8ICdtdXRlJztcclxuXHJcbmludGVyZmFjZSBVc2VyR2lmdEhpc3Rvcnkge1xyXG4gICAgYW1vdW50OiBudW1iZXI7XHJcbiAgICBvdGhlcl9uYW1lOiBzdHJpbmc7XHJcbiAgICBvdGhlcl91c2VyaWQ6IG51bWJlcjtcclxuICAgIHRpZDogbnVtYmVyIHwgbnVsbDtcclxuICAgIHRpbWVzdGFtcDogbnVtYmVyO1xyXG4gICAgdGl0bGU6IHN0cmluZyB8IG51bGw7XHJcbiAgICB0eXBlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcnJheU9iamVjdCB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmdbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFN0cmluZ09iamVjdCB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBCb29rRGF0YU9iamVjdCBleHRlbmRzIFN0cmluZ09iamVjdCB7XHJcbiAgICBbJ2V4dHJhY3RlZCddOiBzdHJpbmc7XHJcbiAgICBbJ2Rlc2MnXTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRGl2Um93T2JqZWN0IHtcclxuICAgIFsndGl0bGUnXTogc3RyaW5nO1xyXG4gICAgWydkYXRhJ106IEhUTUxEaXZFbGVtZW50O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU2V0dGluZ0dsb2JPYmplY3Qge1xyXG4gICAgW2tleTogbnVtYmVyXTogRmVhdHVyZVNldHRpbmdzW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgc2NvcGU6IFNldHRpbmdHcm91cDtcclxuICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICB0eXBlOiAnY2hlY2tib3gnIHwgJ2Ryb3Bkb3duJyB8ICd0ZXh0Ym94JztcclxuICAgIGRlc2M6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFueUZlYXR1cmUgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgdGFnPzogc3RyaW5nO1xyXG4gICAgb3B0aW9ucz86IFN0cmluZ09iamVjdDtcclxuICAgIHBsYWNlaG9sZGVyPzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRmVhdHVyZSB7XHJcbiAgICBzZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nIHwgRHJvcGRvd25TZXR0aW5nIHwgVGV4dGJveFNldHRpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBDaGVja2JveFNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgdHlwZTogJ2NoZWNrYm94JztcclxufVxyXG5cclxuaW50ZXJmYWNlIERyb3Bkb3duU2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0eXBlOiAnZHJvcGRvd24nO1xyXG4gICAgdGFnOiBzdHJpbmc7XHJcbiAgICBvcHRpb25zOiBTdHJpbmdPYmplY3Q7XHJcbn1cclxuXHJcbmludGVyZmFjZSBUZXh0Ym94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0eXBlOiAndGV4dGJveCc7XHJcbiAgICB0YWc6IHN0cmluZztcclxuICAgIHBsYWNlaG9sZGVyOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vIG5hdmlnYXRvci5jbGlwYm9hcmQuZC50c1xyXG5cclxuLy8gVHlwZSBkZWNsYXJhdGlvbnMgZm9yIENsaXBib2FyZCBBUElcclxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NsaXBib2FyZF9BUElcclxuaW50ZXJmYWNlIENsaXBib2FyZCB7XHJcbiAgICB3cml0ZVRleHQobmV3Q2xpcFRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XHJcbiAgICAvLyBBZGQgYW55IG90aGVyIG1ldGhvZHMgeW91IG5lZWQgaGVyZS5cclxufVxyXG5cclxuaW50ZXJmYWNlIE5hdmlnYXRvckNsaXBib2FyZCB7XHJcbiAgICAvLyBPbmx5IGF2YWlsYWJsZSBpbiBhIHNlY3VyZSBjb250ZXh0LlxyXG4gICAgcmVhZG9ubHkgY2xpcGJvYXJkPzogQ2xpcGJvYXJkO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgTmF2aWdhdG9yRXh0ZW5kZWQgZXh0ZW5kcyBOYXZpZ2F0b3JDbGlwYm9hcmQge31cclxuIiwiLyoqXHJcbiAqIENsYXNzIGNvbnRhaW5pbmcgY29tbW9uIHV0aWxpdHkgbWV0aG9kc1xyXG4gKlxyXG4gKiBJZiB0aGUgbWV0aG9kIHNob3VsZCBoYXZlIHVzZXItY2hhbmdlYWJsZSBzZXR0aW5ncywgY29uc2lkZXIgdXNpbmcgYENvcmUudHNgIGluc3RlYWRcclxuICovXHJcblxyXG5jbGFzcyBVdGlsIHtcclxuICAgIC8qKlxyXG4gICAgICogQW5pbWF0aW9uIGZyYW1lIHRpbWVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYWZUaW1lcigpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVzb2x2ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyBzZXR0aW5nIG11bHRpcGxlIGF0dHJpYnV0ZXMgYXQgb25jZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldEF0dHIoZWw6IEVsZW1lbnQsIGF0dHI6IFN0cmluZ09iamVjdCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyKSB7XHJcbiAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyW2tleV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIFwibGVuZ3RoXCIgb2YgYW4gT2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgb2JqZWN0TGVuZ3RoKG9iajogT2JqZWN0KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3JjZWZ1bGx5IGVtcHRpZXMgYW55IEdNIHN0b3JlZCB2YWx1ZXNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwdXJnZVNldHRpbmdzKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgR01fbGlzdFZhbHVlcygpKSB7XHJcbiAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2cgYSBtZXNzYWdlIGFib3V0IGEgY291bnRlZCByZXN1bHRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZXBvcnRDb3VudChkaWQ6IHN0cmluZywgbnVtOiBudW1iZXIsIHRoaW5nOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzaW5ndWxhciA9IDE7XHJcbiAgICAgICAgaWYgKG51bSAhPT0gc2luZ3VsYXIpIHtcclxuICAgICAgICAgICAgdGhpbmcgKz0gJ3MnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYD4gJHtkaWR9ICR7bnVtfSAke3RoaW5nfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemVzIGEgZmVhdHVyZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHN0YXJ0RmVhdHVyZShcclxuICAgICAgICBzZXR0aW5nczogRmVhdHVyZVNldHRpbmdzLFxyXG4gICAgICAgIGVsZW06IHN0cmluZyxcclxuICAgICAgICBwYWdlPzogVmFsaWRQYWdlW11cclxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIC8vIFF1ZXVlIHRoZSBzZXR0aW5ncyBpbiBjYXNlIHRoZXkncmUgbmVlZGVkXHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2goc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAvLyBGdW5jdGlvbiB0byByZXR1cm4gdHJ1ZSB3aGVuIHRoZSBlbGVtZW50IGlzIGxvYWRlZFxyXG4gICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcclxuICAgICAgICAgICAgY29uc3QgdGltZXI6IFByb21pc2U8ZmFsc2U+ID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMDAsIGZhbHNlKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBjaGVja0VsZW0gPSBDaGVjay5lbGVtTG9hZChlbGVtKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbdGltZXIsIGNoZWNrRWxlbV0pLnRoZW4oKHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBzdGFydEZlYXR1cmUoJHtzZXR0aW5ncy50aXRsZX0pIFVuYWJsZSB0byBpbml0aWF0ZSEgQ291bGQgbm90IGZpbmQgZWxlbWVudDogJHtlbGVtfWBcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJcyB0aGUgc2V0dGluZyBlbmFibGVkP1xyXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZShzZXR0aW5ncy50aXRsZSkpIHtcclxuICAgICAgICAgICAgLy8gQSBzcGVjaWZpYyBwYWdlIGlzIG5lZWRlZFxyXG4gICAgICAgICAgICBpZiAocGFnZSAmJiBwYWdlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIExvb3Agb3ZlciBhbGwgcmVxdWlyZWQgcGFnZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHM6IGJvb2xlYW5bXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS5mb3JFYWNoKChwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2hlY2sucGFnZShwKS50aGVuKChyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCg8Ym9vbGVhbj5yKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgYW55IHJlcXVlc3RlZCBwYWdlIG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZSwgcnVuIHRoZSBmZWF0dXJlXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0cy5pbmNsdWRlcyh0cnVlKSA9PT0gdHJ1ZSkgcmV0dXJuIHJ1bigpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2tpcCB0byBlbGVtZW50IGNoZWNraW5nXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU2V0dGluZyBpcyBub3QgZW5hYmxlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmltcyBhIHN0cmluZyBsb25nZXIgdGhhbiBhIHNwZWNpZmllZCBjaGFyIGxpbWl0LCB0byBhIGZ1bGwgd29yZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHRyaW1TdHJpbmcoaW5wOiBzdHJpbmcsIG1heDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoaW5wLmxlbmd0aCA+IG1heCkge1xyXG4gICAgICAgICAgICBpbnAgPSBpbnAuc3Vic3RyaW5nKDAsIG1heCArIDEpO1xyXG4gICAgICAgICAgICBpbnAgPSBpbnAuc3Vic3RyaW5nKDAsIE1hdGgubWluKGlucC5sZW5ndGgsIGlucC5sYXN0SW5kZXhPZignICcpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGJyYWNrZXRzICYgYWxsIGNvbnRhaW5lZCB3b3JkcyBmcm9tIGEgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYnJhY2tldFJlbW92ZXIoaW5wOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBpbnBcclxuICAgICAgICAgICAgLnJlcGxhY2UoL3srLio/fSsvZywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFtcXFt8XFxdXFxdL2csICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvPC4qPz4vZywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXCguKj9cXCkvZywgJycpXHJcbiAgICAgICAgICAgIC50cmltKCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqUmV0dXJuIHRoZSBjb250ZW50cyBiZXR3ZWVuIGJyYWNrZXRzXHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQG1lbWJlcm9mIFV0aWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0Q29udGVudHMgPSAoaW5wOiBzdHJpbmcpID0+IHtcclxuICAgICAgICByZXR1cm4gaW5wLm1hdGNoKC9cXCgoW14pXSspXFwpLykhWzFdO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgc3RyaW5nIHRvIGFuIGFycmF5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nVG9BcnJheShpbnA6IHN0cmluZywgc3BsaXRQb2ludD86ICd3cycpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgcmV0dXJuIHNwbGl0UG9pbnQgIT09IHVuZGVmaW5lZCAmJiBzcGxpdFBvaW50ICE9PSAnd3MnXHJcbiAgICAgICAgICAgID8gaW5wLnNwbGl0KHNwbGl0UG9pbnQpXHJcbiAgICAgICAgICAgIDogaW5wLm1hdGNoKC9cXFMrL2cpIHx8IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBjb21tYSAob3Igb3RoZXIpIHNlcGFyYXRlZCB2YWx1ZSBpbnRvIGFuIGFycmF5XHJcbiAgICAgKiBAcGFyYW0gaW5wIFN0cmluZyB0byBiZSBkaXZpZGVkXHJcbiAgICAgKiBAcGFyYW0gZGl2aWRlciBUaGUgZGl2aWRlciAoZGVmYXVsdDogJywnKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNzdlRvQXJyYXkoaW5wOiBzdHJpbmcsIGRpdmlkZXI6IHN0cmluZyA9ICcsJyk6IHN0cmluZ1tdIHtcclxuICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgaW5wLnNwbGl0KGRpdmlkZXIpLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgYXJyLnB1c2goaXRlbS50cmltKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IGFuIGFycmF5IHRvIGEgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gaW5wIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGVuZCBjdXQtb2ZmIHBvaW50XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXJyYXlUb1N0cmluZyhpbnA6IHN0cmluZ1tdLCBlbmQ/OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICBpbnAuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcclxuICAgICAgICAgICAgb3V0cCArPSBrZXk7XHJcbiAgICAgICAgICAgIGlmIChlbmQgJiYgdmFsICsgMSAhPT0gaW5wLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cCArPSAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3V0cDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgRE9NIG5vZGUgcmVmZXJlbmNlIGludG8gYW4gSFRNTCBFbGVtZW50IHJlZmVyZW5jZVxyXG4gICAgICogQHBhcmFtIG5vZGUgVGhlIG5vZGUgdG8gY29udmVydFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG5vZGVUb0VsZW0obm9kZTogTm9kZSk6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBpZiAobm9kZS5maXJzdENoaWxkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA8SFRNTEVsZW1lbnQ+bm9kZS5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50ITtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vZGUtdG8tZWxlbSB3aXRob3V0IGNoaWxkbm9kZSBpcyB1bnRlc3RlZCcpO1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wTm9kZTogTm9kZSA9IG5vZGU7XHJcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodGVtcE5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+bm9kZS5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50ITtcclxuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZCh0ZW1wTm9kZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXRjaCBzdHJpbmdzIHdoaWxlIGlnbm9yaW5nIGNhc2Ugc2Vuc2l0aXZpdHlcclxuICAgICAqIEBwYXJhbSBhIEZpcnN0IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGIgU2Vjb25kIHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNhc2VsZXNzU3RyaW5nTWF0Y2goYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBjb21wYXJlOiBudW1iZXIgPSBhLmxvY2FsZUNvbXBhcmUoYiwgJ2VuJywge1xyXG4gICAgICAgICAgICBzZW5zaXRpdml0eTogJ2Jhc2UnLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBjb21wYXJlID09PSAwID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgbmV3IFRvckRldFJvdyBhbmQgcmV0dXJuIHRoZSBpbm5lciBkaXZcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIHJvdyB0byBiZSB0YXJnZXR0ZWRcclxuICAgICAqIEBwYXJhbSBsYWJlbCBUaGUgbmFtZSB0byBiZSBkaXNwbGF5ZWQgZm9yIHRoZSBuZXcgcm93XHJcbiAgICAgKiBAcGFyYW0gcm93Q2xhc3MgVGhlIHJvdydzIGNsYXNzbmFtZSAoc2hvdWxkIHN0YXJ0IHdpdGggbXBfKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZFRvckRldGFpbHNSb3coXHJcbiAgICAgICAgdGFyOiBIVE1MRGl2RWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgbGFiZWw6IHN0cmluZyxcclxuICAgICAgICByb3dDbGFzczogc3RyaW5nXHJcbiAgICApOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICAgICAgaWYgKHRhciA9PT0gbnVsbCB8fCB0YXIucGFyZW50RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFkZCBUb3IgRGV0YWlscyBSb3c6IGVtcHR5IG5vZGUgb3IgcGFyZW50IG5vZGUgQCAke3Rhcn1gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0YXIucGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJ0b3JEZXRSb3dcIj48ZGl2IGNsYXNzPVwidG9yRGV0TGVmdFwiPiR7bGFiZWx9PC9kaXY+PGRpdiBjbGFzcz1cInRvckRldFJpZ2h0ICR7cm93Q2xhc3N9XCI+PHNwYW4gY2xhc3M9XCJmbGV4XCI+PC9zcGFuPjwvZGl2PjwvZGl2PmBcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7cm93Q2xhc3N9IC5mbGV4YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IE1lcmdlIHdpdGggYFV0aWwuY3JlYXRlQnV0dG9uYFxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIGEgbGluayBidXR0b24gdGhhdCBpcyBzdHlsZWQgbGlrZSBhIHNpdGUgYnV0dG9uIChleC4gaW4gdG9yIGRldGFpbHMpXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHRoZSBidXR0b24gc2hvdWxkIGJlIGFkZGVkIHRvXHJcbiAgICAgKiBAcGFyYW0gdXJsIFRoZSBVUkwgdGhlIGJ1dHRvbiB3aWxsIHNlbmQgeW91IHRvXHJcbiAgICAgKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBvbiB0aGUgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gb3JkZXIgT3B0aW9uYWw6IGZsZXggZmxvdyBvcmRlcmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUxpbmtCdXR0b24oXHJcbiAgICAgICAgdGFyOiBIVE1MRWxlbWVudCxcclxuICAgICAgICB1cmw6IHN0cmluZyA9ICdub25lJyxcclxuICAgICAgICB0ZXh0OiBzdHJpbmcsXHJcbiAgICAgICAgb3JkZXI6IG51bWJlciA9IDBcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgYnV0dG9uXHJcbiAgICAgICAgY29uc3QgYnV0dG9uOiBIVE1MQW5jaG9yRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICAvLyBTZXQgdXAgdGhlIGJ1dHRvblxyXG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdtcF9idXR0b25fY2xvbmUnKTtcclxuICAgICAgICBpZiAodXJsICE9PSAnbm9uZScpIHtcclxuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfYmxhbmsnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnV0dG9uLmlubmVyVGV4dCA9IHRleHQ7XHJcbiAgICAgICAgYnV0dG9uLnN0eWxlLm9yZGVyID0gYCR7b3JkZXJ9YDtcclxuICAgICAgICAvLyBJbmplY3QgdGhlIGJ1dHRvblxyXG4gICAgICAgIHRhci5pbnNlcnRCZWZvcmUoYnV0dG9uLCB0YXIuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIGEgbm9uLWxpbmtlZCBidXR0b25cclxuICAgICAqIEBwYXJhbSBpZCBUaGUgSUQgb2YgdGhlIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgZGlzcGxheWVkIGluIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSB0eXBlIFRoZSBIVE1MIGVsZW1lbnQgdG8gY3JlYXRlLiBEZWZhdWx0OiBgaDFgXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBIVE1MIGVsZW1lbnQgdGhlIGJ1dHRvbiB3aWxsIGJlIGByZWxhdGl2ZWAgdG9cclxuICAgICAqIEBwYXJhbSByZWxhdGl2ZSBUaGUgcG9zaXRpb24gb2YgdGhlIGJ1dHRvbiByZWxhdGl2ZSB0byB0aGUgYHRhcmAuIERlZmF1bHQ6IGBhZnRlcmVuZGBcclxuICAgICAqIEBwYXJhbSBidG5DbGFzcyBUaGUgY2xhc3NuYW1lIG9mIHRoZSBlbGVtZW50LiBEZWZhdWx0OiBgbXBfYnRuYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUJ1dHRvbihcclxuICAgICAgICBpZDogc3RyaW5nLFxyXG4gICAgICAgIHRleHQ6IHN0cmluZyxcclxuICAgICAgICB0eXBlOiBzdHJpbmcgPSAnaDEnLFxyXG4gICAgICAgIHRhcjogc3RyaW5nIHwgSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgcmVsYXRpdmU6ICdiZWZvcmViZWdpbicgfCAnYWZ0ZXJlbmQnID0gJ2FmdGVyZW5kJyxcclxuICAgICAgICBidG5DbGFzczogc3RyaW5nID0gJ21wX2J0bidcclxuICAgICk6IFByb21pc2U8SFRNTEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDaG9vc2UgdGhlIG5ldyBidXR0b24gaW5zZXJ0IGxvY2F0aW9uIGFuZCBpbnNlcnQgZWxlbWVudHNcclxuICAgICAgICAgICAgLy8gY29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9XHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFyID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKSA6IHRhcjtcclxuICAgICAgICAgICAgY29uc3QgYnRuOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoYCR7dGFyfSBpcyBudWxsIWApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lmluc2VydEFkamFjZW50RWxlbWVudChyZWxhdGl2ZSwgYnRuKTtcclxuICAgICAgICAgICAgICAgIFV0aWwuc2V0QXR0cihidG4sIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogYG1wXyR7aWR9YCxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogYnRuQ2xhc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ2J1dHRvbicsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIGJ1dHRvbiB0ZXh0XHJcbiAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYnRuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYW4gZWxlbWVudCBpbnRvIGEgYnV0dG9uIHRoYXQsIHdoZW4gY2xpY2tlZCwgY29waWVzIHRleHQgdG8gY2xpcGJvYXJkXHJcbiAgICAgKiBAcGFyYW0gYnRuIEFuIEhUTUwgRWxlbWVudCBiZWluZyB1c2VkIGFzIGEgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgY29waWVkIHRvIGNsaXBib2FyZCBvbiBidXR0b24gY2xpY2ssIG9yIGEgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB3aWxsIHVzZSB0aGUgY2xpcGJvYXJkJ3MgY3VycmVudCB0ZXh0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2xpcGJvYXJkaWZ5QnRuKFxyXG4gICAgICAgIGJ0bjogSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgcGF5bG9hZDogYW55LFxyXG4gICAgICAgIGNvcHk6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBidG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSB0byBvdmVycmlkZSB0aGUgTmF2aWdhdG9yIHR5cGUgdG8gcHJldmVudCBUUyBlcnJvcnNcclxuICAgICAgICAgICAgY29uc3QgbmF2OiBOYXZpZ2F0b3JFeHRlbmRlZCB8IHVuZGVmaW5lZCA9IDxOYXZpZ2F0b3JFeHRlbmRlZD5uYXZpZ2F0b3I7XHJcbiAgICAgICAgICAgIGlmIChuYXYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRleHQsIGxpa2VseSBkdWUgdG8gbWlzc2luZyBicm93c2VyIHN1cHBvcnQuJyk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCAnbmF2aWdhdG9yJz9cIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvKiBOYXZpZ2F0b3IgRXhpc3RzICovXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvcHkgJiYgdHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29weSByZXN1bHRzIHRvIGNsaXBib2FyZFxyXG4gICAgICAgICAgICAgICAgICAgIG5hdi5jbGlwYm9hcmQhLndyaXRlVGV4dChwYXlsb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgdG8geW91ciBjbGlwYm9hcmQhJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biBwYXlsb2FkIGZ1bmN0aW9uIHdpdGggY2xpcGJvYXJkIHRleHRcclxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS5yZWFkVGV4dCgpLnRoZW4oKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZCh0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgZnJvbSB5b3VyIGNsaXBib2FyZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJ0bi5zdHlsZS5jb2xvciA9ICdncmVlbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYW4gSFRUUFJlcXVlc3QgZm9yIEdFVCBKU09OLCByZXR1cm5zIHRoZSBmdWxsIHRleHQgb2YgSFRUUCBHRVRcclxuICAgICAqIEBwYXJhbSB1cmwgLSBhIHN0cmluZyBvZiB0aGUgVVJMIHRvIHN1Ym1pdCBmb3IgR0VUIHJlcXVlc3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRKU09OKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBnZXRIVFRQID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByZXN1bHRzIHdpdGggdGhlIGFtb3VudCBlbnRlcmVkIGJ5IHVzZXIgcGx1cyB0aGUgdXNlcm5hbWUgZm91bmQgb24gdGhlIG1lbnUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgZ2V0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICBnZXRIVFRQLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIGdldEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnZXRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShnZXRIVFRQLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGdldEhUVFAuc2VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiB0d28gcGFyYW1ldGVyc1xyXG4gICAgICogQHBhcmFtIG1pbiBhIG51bWJlciBvZiB0aGUgYm90dG9tIG9mIHJhbmRvbSBudW1iZXIgcG9vbFxyXG4gICAgICogQHBhcmFtIG1heCBhIG51bWJlciBvZiB0aGUgdG9wIG9mIHRoZSByYW5kb20gbnVtYmVyIHBvb2xcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByYW5kb21OdW1iZXIgPSAobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTbGVlcCB1dGlsIHRvIGJlIHVzZWQgaW4gYXN5bmMgZnVuY3Rpb25zIHRvIGRlbGF5IHByb2dyYW1cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzbGVlcCA9IChtOiBhbnkpOiBQcm9taXNlPHZvaWQ+ID0+IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIG0pKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgbGFzdCBzZWN0aW9uIG9mIGFuIEhSRUZcclxuICAgICAqIEBwYXJhbSBlbGVtIEFuIGFuY2hvciBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gc3BsaXQgT3B0aW9uYWwgZGl2aWRlci4gRGVmYXVsdHMgdG8gYC9gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZW5kT2ZIcmVmID0gKGVsZW06IEhUTUxBbmNob3JFbGVtZW50LCBzcGxpdCA9ICcvJykgPT5cclxuICAgICAgICBlbGVtLmhyZWYuc3BsaXQoc3BsaXQpLnBvcCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBoZXggdmFsdWUgb2YgYSBjb21wb25lbnQgYXMgYSBzdHJpbmcuXHJcbiAgICAgKiBGcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzhcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY29tcG9uZW50VG9IZXggPSAoYzogbnVtYmVyIHwgc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICBjb25zdCBoZXggPSBjLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICByZXR1cm4gaGV4Lmxlbmd0aCA9PT0gMSA/IGAwJHtoZXh9YCA6IGhleDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGhleCBjb2xvciBjb2RlIGZyb20gUkdCLlxyXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQG1lbWJlcm9mIFV0aWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZ2JUb0hleCA9IChyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyKTogc3RyaW5nID0+IHtcclxuICAgICAgICByZXR1cm4gYCMke1V0aWwuY29tcG9uZW50VG9IZXgocil9JHtVdGlsLmNvbXBvbmVudFRvSGV4KGcpfSR7VXRpbC5jb21wb25lbnRUb0hleChcclxuICAgICAgICAgICAgYlxyXG4gICAgICAgICl9YDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeHRyYWN0IG51bWJlcnMgKHdpdGggZmxvYXQpIGZyb20gdGV4dCBhbmQgcmV0dXJuIHRoZW1cclxuICAgICAqIEBwYXJhbSB0YXIgQW4gSFRNTCBlbGVtZW50IHRoYXQgY29udGFpbnMgbnVtYmVyc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGbG9hdCA9ICh0YXI6IEhUTUxFbGVtZW50KTogbnVtYmVyW10gPT4ge1xyXG4gICAgICAgIGlmICh0YXIudGV4dENvbnRlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0YXIudGV4dENvbnRlbnQhLnJlcGxhY2UoLywvZywgJycpLm1hdGNoKC9cXGQrXFwuXFxkKy8pIHx8IFtdKS5tYXAoKG4pID0+XHJcbiAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG4pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgY29udGFpbnMgbm8gdGV4dCcpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIEdldCB0aGUgdXNlciBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0aGUgbG9nZ2VkIGluIHVzZXIgYW5kIGEgZ2l2ZW4gSURcclxuICAgICAqIEBwYXJhbSB1c2VySUQgQSB1c2VyIElEOyBjYW4gYmUgYSBzdHJpbmcgb3IgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0VXNlckdpZnRIaXN0b3J5KFxyXG4gICAgICAgIHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPFVzZXJHaWZ0SGlzdG9yeVtdPiB7XHJcbiAgICAgICAgY29uc3QgcmF3R2lmdEhpc3Rvcnk6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTihcclxuICAgICAgICAgICAgYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi91c2VyQm9udXNIaXN0b3J5LnBocD9vdGhlcl91c2VyaWQ9JHt1c2VySUR9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ2lmdEhpc3Rvcnk6IEFycmF5PFVzZXJHaWZ0SGlzdG9yeT4gPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxyXG4gICAgICAgIHJldHVybiBnaWZ0SGlzdG9yeTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXR0eVNpdGVUaW1lKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgZGF0ZT86IGJvb2xlYW4sIHRpbWU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUodW5peFRpbWVzdGFtcCAqIDEwMDApLnRvSVNPU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKGRhdGUgJiYgIXRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWRhdGUgJiYgdGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENoZWNrIGEgc3RyaW5nIHRvIHNlZSBpZiBpdCdzIGRpdmlkZWQgd2l0aCBhIGRhc2gsIHJldHVybmluZyB0aGUgZmlyc3QgaGFsZiBpZiBpdCBkb2Vzbid0IGNvbnRhaW4gYSBzcGVjaWZpZWQgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gb3JpZ2luYWwgVGhlIG9yaWdpbmFsIHN0cmluZyBiZWluZyBjaGVja2VkXHJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVkIEEgc3RyaW5nIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkIGluIHRoZSBvcmlnaW5hbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNoZWNrRGFzaGVzKG9yaWdpbmFsOiBzdHJpbmcsIGNvbnRhaW5lZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICBgY2hlY2tEYXNoZXMoICR7b3JpZ2luYWx9LCAke2NvbnRhaW5lZH0gKTogQ291bnQgJHtvcmlnaW5hbC5pbmRleE9mKFxyXG4gICAgICAgICAgICAgICAgICAgICcgLSAnXHJcbiAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERhc2hlcyBhcmUgcHJlc2VudFxyXG4gICAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcgLSAnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RyaW5nIGNvbnRhaW5zIGEgZGFzaGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IG9yaWdpbmFsLnNwbGl0KCcgLSAnKTtcclxuICAgICAgICAgICAgaWYgKHNwbGl0WzBdID09PSBjb250YWluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgPiBTdHJpbmcgYmVmb3JlIGRhc2ggaXMgXCIke2NvbnRhaW5lZH1cIjsgdXNpbmcgc3RyaW5nIGJlaGluZCBkYXNoYFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMgVXRpbGl0aWVzIHNwZWNpZmljIHRvIEdvb2RyZWFkc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdvb2RyZWFkcyA9IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFJlbW92ZXMgc3BhY2VzIGluIGF1dGhvciBuYW1lcyB0aGF0IHVzZSBhZGphY2VudCBpbnRpdGlhbHMuXHJcbiAgICAgICAgICogQHBhcmFtIGF1dGggVGhlIGF1dGhvcihzKVxyXG4gICAgICAgICAqIEBleGFtcGxlIFwiSCBHIFdlbGxzXCIgLT4gXCJIRyBXZWxsc1wiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc21hcnRBdXRoOiAoYXV0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gVXRpbC5zdHJpbmdUb0FycmF5KGF1dGgpO1xyXG4gICAgICAgICAgICBhcnIuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQga2V5IGlzIGFuIGluaXRpYWxcclxuICAgICAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5leHQga2V5IGlzIGFuIGluaXRpYWwsIGRvbid0IGFkZCBhIHNwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dExlbmc6IG51bWJlciA9IGFyclt2YWwgKyAxXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW5nIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBzcGFjZVxyXG4gICAgICAgICAgICByZXR1cm4gb3V0cC50cmltKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFR1cm5zIGEgc3RyaW5nIGludG8gYSBHb29kcmVhZHMgc2VhcmNoIFVSTFxyXG4gICAgICAgICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIFVSTCB0byBtYWtlXHJcbiAgICAgICAgICogQHBhcmFtIGlucCBUaGUgZXh0cmFjdGVkIGRhdGEgdG8gVVJJIGVuY29kZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGJ1aWxkU2VhcmNoVVJMOiAodHlwZTogQm9va0RhdGEgfCAnb24nLCBpbnA6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGdvb2RyZWFkcy5idWlsZEdyU2VhcmNoVVJMKCAke3R5cGV9LCAke2lucH0gKWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZ3JUeXBlOiBzdHJpbmcgPSB0eXBlO1xyXG4gICAgICAgICAgICBjb25zdCBjYXNlczogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgYm9vazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ29uJztcclxuICAgICAgICAgICAgICAgICAgICBpbnAgKz0gJywgIyc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoY2FzZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2VzW3R5cGVdKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphL2h0dHBzOi8vd3d3Lmdvb2RyZWFkcy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICBpbnAucmVwbGFjZSgnJScsICcnKVxyXG4gICAgICAgICAgICApLnJlcGxhY2UoXCInXCIsICclMjcnKX0mc2VhcmNoX3R5cGU9Ym9va3Mmc2VhcmNoJTVCZmllbGQlNUQ9JHtnclR5cGV9YDtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgY2xlYW5lZCBib29rIHRpdGxlIGZyb20gYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGl0bGUgdGV4dFxyXG4gICAgICogQHBhcmFtIGF1dGggQSBzdHJpbmcgb2YgYXV0aG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tUaXRsZSA9IGFzeW5jIChcclxuICAgICAgICBkYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGF1dGg6IHN0cmluZyA9ICcnXHJcbiAgICApID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEJvb2tUaXRsZSgpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGV4dHJhY3RlZCA9IGRhdGEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vIFNob3J0ZW4gdGl0bGUgYW5kIGNoZWNrIGl0IGZvciBicmFja2V0cyAmIGF1dGhvciBuYW1lc1xyXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwudHJpbVN0cmluZyhVdGlsLmJyYWNrZXRSZW1vdmVyKGV4dHJhY3RlZCksIDUwKTtcclxuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLmNoZWNrRGFzaGVzKGV4dHJhY3RlZCwgYXV0aCk7XHJcbiAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBHUi1mb3JtYXR0ZWQgYXV0aG9ycyBhcyBhbiBhcnJheSBsaW1pdGVkIHRvIGBudW1gXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBhdXRob3IgbGlua3NcclxuICAgICAqIEBwYXJhbSBudW0gVGhlIG51bWJlciBvZiBhdXRob3JzIHRvIHJldHVybi4gRGVmYXVsdCAzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va0F1dGhvcnMgPSBhc3luYyAoXHJcbiAgICAgICAgZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIG51bTogbnVtYmVyID0gM1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZXRCb29rQXV0aG9ycygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKGF1dGhvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoTGlzdC5wdXNoKFV0aWwuZ29vZHJlYWRzLnNtYXJ0QXV0aChhdXRob3IuaW5uZXJUZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gYXV0aExpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIHNlcmllcyBhcyBhbiBhcnJheVxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgc2VyaWVzIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1NlcmllcyA9IGFzeW5jIChkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tTZXJpZXMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmllc0xpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgdGFibGUtbGlrZSBhcnJheSBvZiByb3dzIGFzIGFuIG9iamVjdC5cclxuICAgICAqIFN0b3JlIHRoZSByZXR1cm5lZCBvYmplY3QgYW5kIGFjY2VzcyB1c2luZyB0aGUgcm93IHRpdGxlLCBleC4gYHN0b3JlZFsnVGl0bGU6J11gXHJcbiAgICAgKiBAcGFyYW0gcm93TGlzdCBBbiBhcnJheSBvZiB0YWJsZS1saWtlIHJvd3NcclxuICAgICAqIEBwYXJhbSB0aXRsZUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSB0aXRsZSBjZWxscy4gRGVmYXVsdCBgLnRvckRldExlZnRgXHJcbiAgICAgKiBAcGFyYW0gZGF0YUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSBkYXRhIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0UmlnaHRgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxyXG4gICAgICAgIHJvd0xpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4sXHJcbiAgICAgICAgdGl0bGVDbGFzcyA9ICcudG9yRGV0TGVmdCcsXHJcbiAgICAgICAgZGF0YUNsYXNzID0gJy50b3JEZXRSaWdodCdcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChyb3dMaXN0Lmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVdGlsLnJvd3NUb09iaiggJHtyb3dMaXN0fSApOiBSb3cgbGlzdCB3YXMgZW1wdHkhYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJvd3M6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIHJvd0xpc3QuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3Rvcih0aXRsZUNsYXNzKTtcclxuICAgICAgICAgICAgY29uc3QgZGF0YTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoZGF0YUNsYXNzKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGl0bGUudGV4dENvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUm93IHRpdGxlIHdhcyBlbXB0eSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcm93cy5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKChvYmpbaXRlbS5rZXldID0gaXRlbS52YWx1ZSksIG9iaiksIHt9KTtcclxuICAgIH07XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vKipcclxuICogIyBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsaWRhdGlvbiAmIGNvbmZpcm1hdGlvblxyXG4gKi9cclxuY2xhc3MgQ2hlY2sge1xyXG4gICAgcHVibGljIHN0YXRpYyBuZXdWZXI6IHN0cmluZyA9IEdNX2luZm8uc2NyaXB0LnZlcnNpb247XHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXZWZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdtcF92ZXJzaW9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFdhaXQgZm9yIGFuIGVsZW1lbnQgdG8gZXhpc3QsIHRoZW4gcmV0dXJuIGl0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgRE9NIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYW4gZWxlbWVudFxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxIVE1MRWxlbWVudD59IFByb21pc2Ugb2YgYW4gZWxlbWVudCB0aGF0IHdhcyBzZWxlY3RlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1Mb2FkKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYCVjIExvb2tpbmcgZm9yICR7c2VsZWN0b3J9YCwgJ2JhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjNTU1Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBfY291bnRlciA9IDA7XHJcbiAgICAgICAgY29uc3QgX2NvdW50ZXJMaW1pdCA9IDEwMDtcclxuICAgICAgICBjb25zdCBsb2dpYyA9IGFzeW5jIChzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIVE1MRWxlbWVudCB8IGZhbHNlPiA9PiB7XHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgYWN0dWFsIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBgJHtzZWxlY3Rvcn0gaXMgdW5kZWZpbmVkIWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPCBfY291bnRlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLmFmVGltZXIoKTtcclxuICAgICAgICAgICAgICAgIF9jb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgbG9naWMoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPj0gX2NvdW50ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgX2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxvZ2ljKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogUnVuIGEgZnVuY3Rpb24gd2hlbmV2ZXIgYW4gZWxlbWVudCBjaGFuZ2VzXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgZWxlbWVudCB0byBiZSBvYnNlcnZlZC4gQ2FuIGJlIGEgc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBvYnNlcnZlciB0cmlnZ2Vyc1xyXG4gICAgICogQHJldHVybiBQcm9taXNlIG9mIGEgbXV0YXRpb24gb2JzZXJ2ZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBjYWxsYmFjazogTXV0YXRpb25DYWxsYmFjayxcclxuICAgICAgICBjb25maWc6IE11dGF0aW9uT2JzZXJ2ZXJJbml0ID0ge1xyXG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgKTogUHJvbWlzZTxNdXRhdGlvbk9ic2VydmVyPiB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgJyR7c2VsZWN0b3J9J2ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIGAlYyBTZXR0aW5nIG9ic2VydmVyIG9uICR7c2VsZWN0b3J9OiAke3NlbGVjdGVkfWAsXHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1ZDhhYTgnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xyXG5cclxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHNlbGVjdGVkISwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgc2NyaXB0IGhhcyBiZWVuIHVwZGF0ZWQgZnJvbSBhbiBvbGRlciB2ZXJzaW9uXHJcbiAgICAgKiBAcmV0dXJuIFRoZSB2ZXJzaW9uIHN0cmluZyBvciBmYWxzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHVwZGF0ZWQoKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoJ0NoZWNrLnVwZGF0ZWQoKScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUFJFViBWRVIgPSAke3RoaXMucHJldlZlcn1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYE5FVyBWRVIgPSAke3RoaXMubmV3VmVyfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gRGlmZmVyZW50IHZlcnNpb25zOyB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1ZlciAhPT0gdGhpcy5wcmV2VmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGlzIG5ldyBvciB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF92ZXJzaW9uJywgdGhpcy5uZXdWZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJldlZlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzY3JpcHQgaGFzIHJ1biBiZWZvcmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgcnVuIGJlZm9yZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ3VwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QtdGltZSBydW5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgbmV2ZXIgcnVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5hYmxlIHRoZSBtb3N0IGJhc2ljIGZlYXR1cmVzXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2dvb2RyZWFkc0J0bicsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdhbGVydHMnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdmaXJzdFJ1bicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBub3QgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSB3aGF0IHBhZ2UgaXMgYmVpbmcgYWNjZXNzZWRcclxuICAgICAqIEBwYXJhbSB7VmFsaWRQYWdlfSBwYWdlUXVlcnkgLSBBbiBvcHRpb25hbCBwYWdlIHRvIHNwZWNpZmljYWxseSBjaGVjayBmb3JcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn0gQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gT3B0aW9uYWxseSwgYSBib29sZWFuIGlmIHRoZSBjdXJyZW50IHBhZ2UgbWF0Y2hlcyB0aGUgYHBhZ2VRdWVyeWBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKHBhZ2VRdWVyeT86IFZhbGlkUGFnZSk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFBhZ2UgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBsZXQgY3VycmVudFBhZ2U6IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrLnBhZ2UoKSBoYXMgYmVlbiBydW4gYW5kIGEgdmFsdWUgd2FzIHN0b3JlZFxyXG4gICAgICAgICAgICBpZiAoc3RvcmVkUGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBzdG9yZWQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0b3JlZFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gc3RvcmVkUGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBub3QgcHJldmlvdXMgcnVuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLmluZGV4T2YoJy5waHAnKSA/IHBhdGguc3BsaXQoJy5waHAnKVswXSA6IHBhdGg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWdlID0gcGF0aC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgcGFnZS5zaGlmdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQYWdlIFVSTCBAICR7cGFnZS5qb2luKCcgLT4gJyl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCBsaXRlcmFsIG9mIHNvcnRzIHRvIHVzZSBhcyBhIFwic3dpdGNoXCJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCB9ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcnOiAoKSA9PiAnaG9tZScsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICgpID0+ICdob21lJyxcclxuICAgICAgICAgICAgICAgICAgICBzaG91dGJveDogKCkgPT4gJ3Nob3V0Ym94JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogKCkgPT4gJ3NldHRpbmdzJyxcclxuICAgICAgICAgICAgICAgICAgICBtaWxsaW9uYWlyZXM6ICgpID0+ICd2YXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdDogKCkgPT4gJ3RvcnJlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHU6ICgpID0+ICd1c2VyJyxcclxuICAgICAgICAgICAgICAgICAgICBmOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAndCcpIHJldHVybiAnZm9ydW0gdGhyZWFkJztcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZVsxXSA9PT0gJ2Jyb3dzZScpIHJldHVybiAnYnJvd3NlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3JlcXVlc3RzMicpIHJldHVybiAncmVxdWVzdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICd2aWV3UmVxdWVzdCcpIHJldHVybiAncmVxdWVzdCBkZXRhaWxzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3VwbG9hZCcpIHJldHVybiAndXBsb2FkJztcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhIGNhc2UgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHBhZ2VcclxuICAgICAgICAgICAgICAgIGlmIChjYXNlc1twYWdlWzBdXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlID0gY2FzZXNbcGFnZVswXV0oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBQYWdlIFwiJHtwYWdlfVwiIGlzIG5vdCBhIHZhbGlkIE0rIHBhZ2UuIFBhdGg6ICR7cGF0aH1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgcGFnZSB0byBiZSBhY2Nlc3NlZCBsYXRlclxyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9jdXJyZW50UGFnZScsIGN1cnJlbnRQYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUganVzdCBjaGVja2luZyB3aGF0IHBhZ2Ugd2UncmUgb24sIHJldHVybiB0aGUgcGFnZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFnZVF1ZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3VycmVudFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBjaGVja2luZyBmb3IgYSBzcGVjaWZpYyBwYWdlLCByZXR1cm4gVFJVRS9GQUxTRVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFnZVF1ZXJ5ID09PSBjdXJyZW50UGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDaGVjayB0byBzZWUgaWYgYSBnaXZlbiBjYXRlZ29yeSBpcyBhbiBlYm9vay9hdWRpb2Jvb2sgY2F0ZWdvcnlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBpc0Jvb2tDYXQoY2F0OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDdXJyZW50bHksIGFsbCBib29rIGNhdGVnb3JpZXMgYXJlIGFzc3VtZWQgdG8gYmUgaW4gdGhlIHJhbmdlIG9mIDM5LTEyMFxyXG4gICAgICAgIHJldHVybiBjYXQgPj0gMzkgJiYgY2F0IDw9IDEyMCA/IHRydWUgOiBmYWxzZTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiY2hlY2sudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciBoYW5kbGluZyB2YWx1ZXMgYW5kIG1ldGhvZHMgcmVsYXRlZCB0byBzdHlsZXNcclxuICogQGNvbnN0cnVjdG9yIEluaXRpYWxpemVzIHRoZW1lIGJhc2VkIG9uIGxhc3Qgc2F2ZWQgdmFsdWU7IGNhbiBiZSBjYWxsZWQgYmVmb3JlIHBhZ2UgY29udGVudCBpcyBsb2FkZWRcclxuICogQG1ldGhvZCB0aGVtZSBHZXRzIG9yIHNldHMgdGhlIGN1cnJlbnQgdGhlbWVcclxuICovXHJcbmNsYXNzIFN0eWxlIHtcclxuICAgIHByaXZhdGUgX3RoZW1lOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9wcmV2VGhlbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX2Nzc0RhdGE6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBUaGUgbGlnaHQgdGhlbWUgaXMgdGhlIGRlZmF1bHQgdGhlbWUsIHNvIHVzZSBNKyBMaWdodCB2YWx1ZXNcclxuICAgICAgICB0aGlzLl90aGVtZSA9ICdsaWdodCc7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcHJldmlvdXNseSB1c2VkIHRoZW1lIG9iamVjdFxyXG4gICAgICAgIHRoaXMuX3ByZXZUaGVtZSA9IHRoaXMuX2dldFByZXZUaGVtZSgpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgdGhlbWUgb2JqZWN0IGV4aXN0cywgYXNzdW1lIHRoZSBjdXJyZW50IHRoZW1lIGlzIGlkZW50aWNhbFxyXG4gICAgICAgIGlmICh0aGlzLl9wcmV2VGhlbWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl90aGVtZSA9IHRoaXMuX3ByZXZUaGVtZTtcclxuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oJ25vIHByZXZpb3VzIHRoZW1lJyk7XHJcblxyXG4gICAgICAgIC8vIEZldGNoIHRoZSBDU1MgZGF0YVxyXG4gICAgICAgIHRoaXMuX2Nzc0RhdGEgPSBHTV9nZXRSZXNvdXJjZVRleHQoJ01QX0NTUycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgcmV0dXJuZWQgKi9cclxuICAgIGdldCB0aGVtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90aGVtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQWxsb3dzIHRoZSBjdXJyZW50IHRoZW1lIHRvIGJlIHNldCAqL1xyXG4gICAgc2V0IHRoZW1lKHZhbDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgdGhlIE0rIHRoZW1lIGJhc2VkIG9uIHRoZSBzaXRlIHRoZW1lICovXHJcbiAgICBwdWJsaWMgYXN5bmMgYWxpZ25Ub1NpdGVUaGVtZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCB0aGVtZTogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2V0U2l0ZUNTUygpO1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gdGhlbWUuaW5kZXhPZignZGFyaycpID4gMCA/ICdkYXJrJyA6ICdsaWdodCc7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZUaGVtZSAhPT0gdGhpcy5fdGhlbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0UHJldlRoZW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmplY3QgdGhlIENTUyBjbGFzcyB1c2VkIGJ5IE0rIGZvciB0aGVtaW5nXHJcbiAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYm9keTogSFRNTEJvZHlFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcclxuICAgICAgICAgICAgaWYgKGJvZHkpIHtcclxuICAgICAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChgbXBfJHt0aGlzLl90aGVtZX1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBCb2R5IGlzICR7Ym9keX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbmplY3RzIHRoZSBzdHlsZXNoZWV0IGxpbmsgaW50byB0aGUgaGVhZGVyICovXHJcbiAgICBwdWJsaWMgaW5qZWN0TGluaygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZDogc3RyaW5nID0gJ21wX2Nzcyc7XHJcbiAgICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGU6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICBzdHlsZS5pZCA9IGlkO1xyXG4gICAgICAgICAgICBzdHlsZS5pbm5lclRleHQgPSB0aGlzLl9jc3NEYXRhICE9PSB1bmRlZmluZWQgPyB0aGlzLl9jc3NEYXRhIDogJyc7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKSEuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgYW4gZWxlbWVudCB3aXRoIHRoZSBpZCBcIiR7aWR9XCIgYWxyZWFkeSBleGlzdHNgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogUmV0dXJucyB0aGUgcHJldmlvdXMgdGhlbWUgb2JqZWN0IGlmIGl0IGV4aXN0cyAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0UHJldlRoZW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIEdNX2dldFZhbHVlKCdzdHlsZV90aGVtZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTYXZlcyB0aGUgY3VycmVudCB0aGVtZSBmb3IgZnV0dXJlIHJlZmVyZW5jZSAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0UHJldlRoZW1lKCk6IHZvaWQge1xyXG4gICAgICAgIEdNX3NldFZhbHVlKCdzdHlsZV90aGVtZScsIHRoaXMuX3RoZW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRTaXRlQ1NTKCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRoZW1lVVJMOiBzdHJpbmcgfCBudWxsID0gZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykhXHJcbiAgICAgICAgICAgICAgICAuZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhlbWVVUkwgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoZW1lVVJMKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGB0aGVtZVVybCBpcyBub3QgYSBzdHJpbmc6ICR7dGhlbWVVUkx9YCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NoZWNrLnRzXCIgLz5cclxuLyoqXHJcbiAqIENPUkUgRkVBVFVSRVNcclxuICpcclxuICogWW91ciBmZWF0dXJlIGJlbG9uZ3MgaGVyZSBpZiB0aGUgZmVhdHVyZTpcclxuICogQSkgaXMgY3JpdGljYWwgdG8gdGhlIHVzZXJzY3JpcHRcclxuICogQikgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBieSBvdGhlciBmZWF0dXJlc1xyXG4gKiBDKSB3aWxsIGhhdmUgc2V0dGluZ3MgZGlzcGxheWVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlXHJcbiAqIElmIEEgJiBCIGFyZSBtZXQgYnV0IG5vdCBDIGNvbnNpZGVyIHVzaW5nIGBVdGlscy50c2AgaW5zdGVhZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGZlYXR1cmUgY3JlYXRlcyBhIHBvcC11cCBub3RpZmljYXRpb25cclxuICovXHJcbmNsYXNzIEFsZXJ0cyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLk90aGVyLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdhbGVydHMnLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTSsgQWxlcnQgcGFuZWwgZm9yIHVwZGF0ZSBpbmZvcm1hdGlvbiwgZXRjLicsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHRoaXMuX3NldHRpbmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbm90aWZ5KGtpbmQ6IHN0cmluZyB8IGJvb2xlYW4sIGxvZzogQXJyYXlPYmplY3QpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBBbGVydHMubm90aWZ5KCAke2tpbmR9IClgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBWZXJpZnkgYSBub3RpZmljYXRpb24gcmVxdWVzdCB3YXMgbWFkZVxyXG4gICAgICAgICAgICBpZiAoa2luZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVmVyaWZ5IG5vdGlmaWNhdGlvbnMgYXJlIGFsbG93ZWRcclxuICAgICAgICAgICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnYWxlcnRzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBtc2cgdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWxkTXNnID0gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnI6IHN0cmluZ1tdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgYnVpbGRNc2coICR7dGl0bGV9IClgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGFycmF5IGlzbid0IGVtcHR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnIubGVuZ3RoID4gMCAmJiBhcnJbMF0gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzZWN0aW9uIGhlYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtc2c6IHN0cmluZyA9IGA8aDQ+JHt0aXRsZX06PC9oND48dWw+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIGl0ZW0gaW4gdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9IGA8bGk+JHtpdGVtfTwvbGk+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9ICc8L3VsPic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdG8gYnVpbGQgbm90aWZpY2F0aW9uIHBhbmVsXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRQYW5lbCA9IChtc2c6IHN0cmluZyk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZFBhbmVsKCAke21zZ30gKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCdib2R5JykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCArPSBgPGRpdiBjbGFzcz0nbXBfbm90aWZpY2F0aW9uJz4ke21zZ308c3Bhbj5YPC9zcGFuPjwvZGl2PmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2dCb3g6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfbm90aWZpY2F0aW9uJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUJ0bjogSFRNTFNwYW5FbGVtZW50ID0gbXNnQm94LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3NlQnRuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBjbG9zZSBidXR0b24gaXMgY2xpY2tlZCwgcmVtb3ZlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2dCb3gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnQm94LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2luZCA9PT0gJ3VwZGF0ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0J1aWxkaW5nIHVwZGF0ZSBtZXNzYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGA8c3Ryb25nPk1BTSsgaGFzIGJlZW4gdXBkYXRlZCE8L3N0cm9uZz4gWW91IGFyZSBub3cgdXNpbmcgdiR7TVAuVkVSU0lPTn0sIGNyZWF0ZWQgb24gJHtNUC5USU1FU1RBTVB9LiBEaXNjdXNzIGl0IG9uIDxhIGhyZWY9J2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzJz50aGUgZm9ydW1zPC9hPi48aHI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBjaGFuZ2Vsb2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuVVBEQVRFX0xJU1QsICdDaGFuZ2VzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gYnVpbGRNc2cobG9nLkJVR19MSVNULCAnS25vd24gQnVncycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ2ZpcnN0UnVuJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8aDQ+V2VsY29tZSB0byBNQU0rITwvaDQ+UGxlYXNlIGhlYWQgb3ZlciB0byB5b3VyIDxhIGhyZWY9XCIvcHJlZmVyZW5jZXMvaW5kZXgucGhwXCI+cHJlZmVyZW5jZXM8L2E+IHRvIGVuYWJsZSB0aGUgTUFNKyBzZXR0aW5ncy48YnI+QW55IGJ1ZyByZXBvcnRzLCBmZWF0dXJlIHJlcXVlc3RzLCBldGMuIGNhbiBiZSBtYWRlIG9uIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvaXNzdWVzXCI+R2l0aHViPC9hPiwgPGEgaHJlZj1cIi9mb3J1bXMucGhwP2FjdGlvbj12aWV3dG9waWMmdG9waWNpZD00MTg2M1wiPnRoZSBmb3J1bXM8L2E+LCBvciA8YSBocmVmPVwiL3NlbmRtZXNzYWdlLnBocD9yZWNlaXZlcj0xMDgzMDNcIj50aHJvdWdoIHByaXZhdGUgbWVzc2FnZTwvYT4uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgZmlyc3QgcnVuIG1lc3NhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBSZWNlaXZlZCBtc2cga2luZDogJHtraW5kfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBidWlsZFBhbmVsKG1lc3NhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmaWNhdGlvbnMgYXJlIGRpc2FibGVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlYnVnIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2RlYnVnJyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnRXJyb3IgbG9nICg8ZW0+Q2xpY2sgdGhpcyBjaGVja2JveCB0byBlbmFibGUgdmVyYm9zZSBsb2dnaW5nIHRvIHRoZSBjb25zb2xlPC9lbT4pJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2godGhpcy5fc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogR0xPQkFMIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuY2xhc3MgSGlkZUhvbWUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBEcm9wZG93blNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2Ryb3Bkb3duJyxcclxuICAgICAgICB0aXRsZTogJ2hpZGVIb21lJyxcclxuICAgICAgICB0YWc6ICdSZW1vdmUgYmFubmVyL2hvbWUnLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogJ0RvIG5vdCByZW1vdmUgZWl0aGVyJyxcclxuICAgICAgICAgICAgaGlkZUJhbm5lcjogJ0hpZGUgdGhlIGJhbm5lcicsXHJcbiAgICAgICAgICAgIGhpZGVIb21lOiAnSGlkZSB0aGUgaG9tZSBidXR0b24nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgaGVhZGVyIGltYWdlIG9yIEhvbWUgYnV0dG9uLCBiZWNhdXNlIGJvdGggbGluayB0byB0aGUgaG9tZXBhZ2UnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWlubWVudSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBoaWRlcjogc3RyaW5nID0gR01fZ2V0VmFsdWUodGhpcy5fc2V0dGluZ3MudGl0bGUpO1xyXG4gICAgICAgIGlmIChoaWRlciA9PT0gJ2hpZGVIb21lJykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfaG9tZScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIGhvbWUgYnV0dG9uIScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaGlkZXIgPT09ICdoaWRlQmFubmVyJykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfYmFubmVyJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgYmFubmVyIScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogRHJvcGRvd25TZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFZhdWx0TGluayBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndmF1bHRMaW5rJyxcclxuICAgICAgICBkZXNjOiAnTWFrZSB0aGUgVmF1bHQgbGluayBieXBhc3MgdGhlIFZhdWx0IEluZm8gcGFnZScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKHRoaXMuX3RhcikhXHJcbiAgICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnL21pbGxpb25haXJlcy9kb25hdGUucGhwJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTWFkZSB0aGUgdmF1bHQgdGV4dCBsaW5rIHRvIHRoZSBkb25hdGUgcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1pbmlWYXVsdEluZm8gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ21pbmlWYXVsdEluZm8nLFxyXG4gICAgICAgIGRlc2M6ICdTaG9ydGVuIHRoZSBWYXVsdCBsaW5rICYgcmF0aW8gdGV4dCcsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21pbGxpb25JbmZvJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHZhdWx0VGV4dDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGNvbnN0IHJhdGlvVGV4dDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpITtcclxuXHJcbiAgICAgICAgLy8gU2hvcnRlbiB0aGUgcmF0aW8gdGV4dFxyXG4gICAgICAgIC8vIFRPRE86IG1vdmUgdGhpcyB0byBpdHMgb3duIHNldHRpbmc/XHJcbiAgICAgICAgLyogVGhpcyBjaGFpbmVkIG1vbnN0cm9zaXR5IGRvZXMgdGhlIGZvbGxvd2luZzpcclxuICAgICAgICAtIEV4dHJhY3QgdGhlIG51bWJlciAod2l0aCBmbG9hdCkgZnJvbSB0aGUgZWxlbWVudFxyXG4gICAgICAgIC0gRml4IHRoZSBmbG9hdCB0byAyIGRlY2ltYWwgcGxhY2VzICh3aGljaCBjb252ZXJ0cyBpdCBiYWNrIGludG8gYSBzdHJpbmcpXHJcbiAgICAgICAgLSBDb252ZXJ0IHRoZSBzdHJpbmcgYmFjayBpbnRvIGEgbnVtYmVyIHNvIHRoYXQgd2UgY2FuIGNvbnZlcnQgaXQgd2l0aGB0b0xvY2FsZVN0cmluZ2AgdG8gZ2V0IGNvbW1hcyBiYWNrICovXHJcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKFV0aWwuZXh0cmFjdEZsb2F0KHJhdGlvVGV4dClbMF0udG9GaXhlZCgyKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICByYXRpb1RleHQuaW5uZXJIVE1MID0gYCR7bnVtfSA8aW1nIHNyYz1cIi9waWMvdXBkb3duQmlnLnBuZ1wiIGFsdD1cInJhdGlvXCI+YDtcclxuXHJcbiAgICAgICAgLy8gVHVybiB0aGUgbnVtZXJpYyBwb3J0aW9uIG9mIHRoZSB2YXVsdCBsaW5rIGludG8gYSBudW1iZXJcclxuICAgICAgICBsZXQgbmV3VGV4dDogbnVtYmVyID0gcGFyc2VJbnQoXHJcbiAgICAgICAgICAgIHZhdWx0VGV4dC50ZXh0Q29udGVudCEuc3BsaXQoJzonKVsxXS5zcGxpdCgnICcpWzFdLnJlcGxhY2UoLywvZywgJycpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCB0aGUgdmF1bHQgYW1vdW50IHRvIG1pbGxpb250aHNcclxuICAgICAgICBuZXdUZXh0ID0gTnVtYmVyKChuZXdUZXh0IC8gMWU2KS50b0ZpeGVkKDMpKTtcclxuICAgICAgICAvLyBVcGRhdGUgdGhlIHZhdWx0IHRleHRcclxuICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQgPSBgVmF1bHQ6ICR7bmV3VGV4dH0gbWlsbGlvbmA7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2hvcnRlbmVkIHRoZSB2YXVsdCAmIHJhdGlvIG51bWJlcnMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBCb251c1BvaW50RGVsdGEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2JvbnVzUG9pbnREZWx0YScsXHJcbiAgICAgICAgZGVzYzogYERpc3BsYXkgaG93IG1hbnkgYm9udXMgcG9pbnRzIHlvdSd2ZSBnYWluZWQgc2luY2UgbGFzdCBwYWdlbG9hZGAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RtQlAnO1xyXG4gICAgcHJpdmF0ZSBfcHJldkJQOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBfY3VycmVudEJQOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBfZGVsdGE6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudEJQRWw6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IG9sZCBCUCB2YWx1ZVxyXG4gICAgICAgIHRoaXMuX3ByZXZCUCA9IHRoaXMuX2dldEJQKCk7XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50QlBFbCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBFeHRyYWN0IG9ubHkgdGhlIG51bWJlciBmcm9tIHRoZSBCUCBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSBjdXJyZW50QlBFbC50ZXh0Q29udGVudCEubWF0Y2goXHJcbiAgICAgICAgICAgICAgICAvXFxkKy9nXHJcbiAgICAgICAgICAgICkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCBuZXcgQlAgdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudEJQID0gcGFyc2VJbnQoY3VycmVudFswXSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldEJQKHRoaXMuX2N1cnJlbnRCUCk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgZGVsdGFcclxuICAgICAgICAgICAgdGhpcy5fZGVsdGEgPSB0aGlzLl9jdXJyZW50QlAgLSB0aGlzLl9wcmV2QlA7XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSB0ZXh0IGlmIG5vdCAwXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZWx0YSAhPT0gMCAmJiAhaXNOYU4odGhpcy5fZGVsdGEpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwbGF5QlAodGhpcy5fZGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Rpc3BsYXlCUCA9IChicDogbnVtYmVyKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgYm9udXNCb3g6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBsZXQgZGVsdGFCb3g6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICBkZWx0YUJveCA9IGJwID4gMCA/IGArJHticH1gIDogYCR7YnB9YDtcclxuXHJcbiAgICAgICAgaWYgKGJvbnVzQm94ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGJvbnVzQm94LmlubmVySFRNTCArPSBgPHNwYW4gY2xhc3M9J21wX2JwRGVsdGEnPiAoJHtkZWx0YUJveH0pPC9zcGFuPmA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIF9zZXRCUCA9IChicDogbnVtYmVyKTogdm9pZCA9PiB7XHJcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCwgYCR7YnB9YCk7XHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfZ2V0QlAgPSAoKTogbnVtYmVyID0+IHtcclxuICAgICAgICBjb25zdCBzdG9yZWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVZhbGApO1xyXG4gICAgICAgIGlmIChzdG9yZWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RvcmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgQmx1cnJlZEhlYWRlciBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYmx1cnJlZEhlYWRlcicsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJsdXJyZWQgYmFja2dyb3VuZCB0byB0aGUgaGVhZGVyIGFyZWFgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzaXRlTWFpbiA+IGhlYWRlcic7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGhlYWRlcjogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgJHt0aGlzLl90YXJ9YCk7XHJcbiAgICAgICAgY29uc3QgaGVhZGVySW1nOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IGhlYWRlci5xdWVyeVNlbGVjdG9yKGBpbWdgKTtcclxuXHJcbiAgICAgICAgaWYgKGhlYWRlckltZykge1xyXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJTcmM6IHN0cmluZyB8IG51bGwgPSBoZWFkZXJJbWcuZ2V0QXR0cmlidXRlKCdzcmMnKTtcclxuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBjb250YWluZXIgZm9yIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGJsdXJyZWRCYWNrOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ21wX2JsdXJyZWRCYWNrJyk7XHJcbiAgICAgICAgICAgIGhlYWRlci5hcHBlbmQoYmx1cnJlZEJhY2spO1xyXG4gICAgICAgICAgICBibHVycmVkQmFjay5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBoZWFkZXJTcmMgPyBgdXJsKCR7aGVhZGVyU3JjfSlgIDogJyc7XHJcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLmNsYXNzTGlzdC5hZGQoJ21wX2NvbnRhaW5lcicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgYSBibHVycmVkIGJhY2tncm91bmQgdG8gdGhlIGhlYWRlciEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGlkZVNlZWRib3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2hpZGVTZWVkYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBcIkdldCBBIFNlZWRib3hcIiBtZW51IGl0ZW0nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtZW51JztcclxuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFtdKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3Qgc2VlZGJveEJ0bjogSFRNTExJRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI21lbnUgLnNiRG9uQ3J5cHRvJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHNlZWRib3hCdG4pIHNlZWRib3hCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBnaWZ0IG5ld2VzdCAxMCBtZW1iZXJzIHRvIE1BTSBvbiBIb21lcGFnZSBvciBvcGVuIHRoZWlyIHVzZXIgcGFnZXNcclxuICovXHJcbmNsYXNzIEdpZnROZXdlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Ib21lLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnaWZ0TmV3ZXN0JyxcclxuICAgICAgICBkZXNjOiBgQWRkIGJ1dHRvbnMgdG8gR2lmdC9PcGVuIGFsbCBuZXdlc3QgbWVtYmVyc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2ZwTk0nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vZW5zdXJlIGdpZnRlZCBsaXN0IGlzIHVuZGVyIDUwIG1lbWJlciBuYW1lcyBsb25nXHJcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XHJcbiAgICAgICAgLy9nZXQgdGhlIEZyb250UGFnZSBOZXdNZW1iZXJzIGVsZW1lbnQgY29udGFpbmluZyBuZXdlc3QgMTAgbWVtYmVyc1xyXG4gICAgICAgIGNvbnN0IGZwTk0gPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGNvbnN0IG1lbWJlcnM6IEhUTUxBbmNob3JFbGVtZW50W10gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcclxuICAgICAgICAgICAgZnBOTS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBsYXN0TWVtID0gbWVtYmVyc1ttZW1iZXJzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIG1lbWJlcnMuZm9yRWFjaCgobWVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIC8vYWRkIGEgY2xhc3MgdG8gdGhlIGV4aXN0aW5nIGVsZW1lbnQgZm9yIHVzZSBpbiByZWZlcmVuY2UgaW4gY3JlYXRpbmcgYnV0dG9uc1xyXG4gICAgICAgICAgICBtZW1iZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGBtcF9yZWZQb2ludF8ke1V0aWwuZW5kT2ZIcmVmKG1lbWJlcil9YCk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIG1lbWJlciBoYXMgYmVlbiBnaWZ0ZWQgdGhyb3VnaCB0aGlzIGZlYXR1cmUgcHJldmlvdXNseVxyXG4gICAgICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKS5pbmRleE9mKFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikpID49IDApIHtcclxuICAgICAgICAgICAgICAgIC8vYWRkIGNoZWNrZWQgYm94IHRvIHRleHRcclxuICAgICAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSBcXHUyNjExYDtcclxuICAgICAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKCdtcF9naWZ0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGdpZnRzIHNldCBpbiBwcmVmZXJlbmNlcyBmb3IgdXNlciBwYWdlXHJcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XHJcbiAgICAgICAgLy9pZiB0aGV5IGRpZCBub3Qgc2V0IGEgdmFsdWUgaW4gcHJlZmVyZW5jZXMsIHNldCB0byAxMDAgb3Igc2V0IHRvIG1heCBvciBtaW5cclxuICAgICAgICAvLyBUT0RPOiBNYWtlIHRoZSBnaWZ0IHZhbHVlIGNoZWNrIGludG8gYSBVdGlsXHJcbiAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA+IDEwMDAgfHwgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKSkge1xyXG4gICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMDAnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xyXG4gICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NyZWF0ZSB0aGUgdGV4dCBpbnB1dCBmb3IgaG93IG1hbnkgcG9pbnRzIHRvIGdpdmVcclxuICAgICAgICBjb25zdCBnaWZ0QW1vdW50czogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgVXRpbC5zZXRBdHRyKGdpZnRBbW91bnRzLCB7XHJcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgc2l6ZTogJzMnLFxyXG4gICAgICAgICAgICBpZDogJ21wX2dpZnRBbW91bnRzJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDAnLFxyXG4gICAgICAgICAgICB2YWx1ZTogZ2lmdFZhbHVlU2V0dGluZyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2luc2VydCB0aGUgdGV4dCBib3ggYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lXHJcbiAgICAgICAgbGFzdE1lbS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZ2lmdEFtb3VudHMpO1xyXG5cclxuICAgICAgICAvL21ha2UgdGhlIGJ1dHRvbiBhbmQgaW5zZXJ0IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZSAoYmVmb3JlIHRoZSBpbnB1dCB0ZXh0KVxyXG4gICAgICAgIGNvbnN0IGdpZnRBbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ2dpZnRBbGwnLFxyXG4gICAgICAgICAgICAnR2lmdCBBbGw6ICcsXHJcbiAgICAgICAgICAgICdidXR0b24nLFxyXG4gICAgICAgICAgICBgLm1wX3JlZlBvaW50XyR7VXRpbC5lbmRPZkhyZWYobGFzdE1lbSl9YCxcclxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgJ21wX2J0bidcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vYWRkIGEgc3BhY2UgYmV0d2VlbiBidXR0b24gYW5kIHRleHRcclxuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblJpZ2h0ID0gJzVweCc7XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5Ub3AgPSAnNXB4JztcclxuXHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RDYWxsOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgdGV4dCB0byBzaG93IHByb2Nlc3NpbmdcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2VuZGluZyBHaWZ0cy4uLiBQbGVhc2UgV2FpdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB1c2VyIGhhcyBub3QgYmVlbiBnaWZ0ZWRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBtZW1iZXJzIG5hbWUgZm9yIEpTT04gc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gbWVtYmVyLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHBvaW50cyBhbW91bnQgZnJvbSB0aGUgaW5wdXQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRGaW5hbEFtb3VudCA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEZpbmFsQW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3dhaXQgMyBzZWNvbmRzIGJldHdlZW4gSlNPTiBjYWxsc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RDYWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXF1ZXN0IHNlbmRpbmcgcG9pbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGdpZnQgd2FzIHN1Y2Nlc3NmdWxseSBzZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgb2ZmIGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCA9IGAke21lbWJlci5pbm5lclRleHR9IFxcdTI2MTFgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgbWVtYmVyIHRvIHRoZSBzdG9yZWQgbWVtYmVyIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtcF9sYXN0TmV3R2lmdGVkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfSwke0dNX2dldFZhbHVlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbXBfbGFzdE5ld0dpZnRlZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIUpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b24gYWZ0ZXIgc2VuZFxyXG4gICAgICAgICAgICAgICAgKGdpZnRBbGxCdG4gYXMgSFRNTElucHV0RWxlbWVudCkuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cclxuICAgICAgICAgICAgICAgICAgICAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL25ld2xpbmUgYmV0d2VlbiBlbGVtZW50c1xyXG4gICAgICAgIG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXS5hZnRlcihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICAvL2xpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgaW5wdXQgYm94IGFuZCBlbnN1cmUgaXRzIGJldHdlZW4gNSBhbmQgMTAwMCwgaWYgbm90IGRpc2FibGUgYnV0dG9uXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcclxuICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcclxuICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuc2V0QXR0cmlidXRlKCd0aXRsZScsICdEaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYEdpZnQgQWxsICR7dmFsdWVUb051bWJlcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vYWRkIGEgYnV0dG9uIHRvIG9wZW4gYWxsIHVuZ2lmdGVkIG1lbWJlcnMgaW4gbmV3IHRhYnNcclxuICAgICAgICBjb25zdCBvcGVuQWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICdvcGVuVGFicycsXHJcbiAgICAgICAgICAgICdPcGVuIFVuZ2lmdGVkIEluIFRhYnMnLFxyXG4gICAgICAgICAgICAnYnV0dG9uJyxcclxuICAgICAgICAgICAgJ1tpZD1tcF9naWZ0QW1vdW50c10nLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAnbXBfYnRuJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG9wZW5BbGxCdG4uc2V0QXR0cmlidXRlKCd0aXRsZScsICdPcGVuIG5ldyB0YWIgZm9yIGVhY2gnKTtcclxuICAgICAgICBvcGVuQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKG1lbWJlci5ocmVmLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIGJvbnVzIHBvaW50cyBhdmFpbGFibGUgdG8gc3BlbmRcclxuICAgICAgICBsZXQgYm9udXNQb2ludHNBdmFpbDogc3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vZ2V0IHJpZCBvZiB0aGUgZGVsdGEgZGlzcGxheVxyXG4gICAgICAgIGlmIChib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGJvbnVzUG9pbnRzQXZhaWwgPSBib251c1BvaW50c0F2YWlsLnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICBib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3JlY3JlYXRlIHRoZSBib251cyBwb2ludHMgaW4gbmV3IHNwYW4gYW5kIGluc2VydCBpbnRvIGZwTk1cclxuICAgICAgICBjb25zdCBtZXNzYWdlU3BhbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0QWxsTXNnJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gJ0F2YWlsYWJsZSAnICsgYm9udXNQb2ludHNBdmFpbDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWZ0ZXIobWVzc2FnZVNwYW4pO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmFmdGVyKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIVxyXG4gICAgICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsICc8YnI+Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIGdpZnQgbmV3IG1lbWJlcnMgYnV0dG9uIHRvIEhvbWUgcGFnZS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBUcmltcyB0aGUgZ2lmdGVkIGxpc3QgdG8gbGFzdCA1MCBuYW1lcyB0byBhdm9pZCBnZXR0aW5nIHRvbyBsYXJnZSBvdmVyIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3RyaW1HaWZ0TGlzdCgpIHtcclxuICAgICAgICAvL2lmIHZhbHVlIGV4aXN0cyBpbiBHTVxyXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgIC8vR00gdmFsdWUgaXMgYSBjb21tYSBkZWxpbSB2YWx1ZSwgc3BsaXQgdmFsdWUgaW50byBhcnJheSBvZiBuYW1lc1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0TmFtZXMgPSBHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIGxldCBuZXdHaWZ0TmFtZXM6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoZ2lmdE5hbWVzLmxlbmd0aCA+IDUwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGdpZnROYW1lIG9mIGdpZnROYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0TmFtZXMuaW5kZXhPZihnaWZ0TmFtZSkgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZWJ1aWxkIGEgY29tbWEgZGVsaW0gc3RyaW5nIG91dCBvZiB0aGUgZmlyc3QgNDkgbmFtZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3R2lmdE5hbWVzID0gbmV3R2lmdE5hbWVzICsgZ2lmdE5hbWUgKyAnLCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IG5ldyBzdHJpbmcgaW4gR01cclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnLCBuZXdHaWZ0TmFtZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vc2V0IHZhbHVlIGlmIGRvZXNudCBleGlzdFxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsICcnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBoaWRlIG5ld3MgaXRlbXMgb24gdGhlIHBhZ2VcclxuICovXHJcbmNsYXNzIEhpZGVOZXdzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcclxuICAgICAgICB0aXRsZTogJ2hpZGVOZXdzJyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIGRlc2M6ICdUaWR5IHRoZSBob21lcGFnZSBhbmQgYWxsb3cgTmV3cyB0byBiZSBoaWRkZW4nLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5tYWluUGFnZU5ld3NIZWFkJztcclxuICAgIHByaXZhdGUgX3ZhbHVlVGl0bGU6IHN0cmluZyA9IGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfV92YWxgO1xyXG4gICAgcHJpdmF0ZSBfaWNvbiA9ICdcXHUyNzRlJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIE5PVEU6IGZvciBkZXZlbG9wbWVudFxyXG4gICAgICAgIC8vIEdNX2RlbGV0ZVZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO2NvbnNvbGUud2FybihgVmFsdWUgb2YgJHt0aGlzLl92YWx1ZVRpdGxlfSB3aWxsIGJlIGRlbGV0ZWQhYCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX2NoZWNrRm9yU2VlbigpO1xyXG4gICAgICAgIHRoaXMuX2FkZEhpZGVyQnV0dG9uKCk7XHJcbiAgICAgICAgLy8gdGhpcy5fY2xlYW5WYWx1ZXMoKTsgLy8gRklYOiBOb3Qgd29ya2luZyBhcyBpbnRlbmRlZFxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDbGVhbmVkIHVwIHRoZSBob21lIHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgX2NoZWNrRm9yU2VlbiA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgICAgICBjb25zdCBwcmV2VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xyXG4gICAgICAgIGNvbnN0IG5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHRoaXMuX3ZhbHVlVGl0bGUsICc6XFxuJywgcHJldlZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKHByZXZWYWx1ZSAmJiBuZXdzKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgaWNvbiB0byBzcGxpdCBvdXQgdGhlIGtub3duIGhpZGRlbiBtZXNzYWdlc1xyXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5BcnJheSA9IHByZXZWYWx1ZS5zcGxpdCh0aGlzLl9pY29uKTtcclxuICAgICAgICAgICAgLyogSWYgYW55IG9mIHRoZSBoaWRkZW4gbWVzc2FnZXMgbWF0Y2ggYSBjdXJyZW50IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHJlbW92ZSB0aGUgY3VycmVudCBtZXNzYWdlIGZyb20gdGhlIERPTSAqL1xyXG4gICAgICAgICAgICBoaWRkZW5BcnJheS5mb3JFYWNoKChoaWRkZW4pID0+IHtcclxuICAgICAgICAgICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkudGV4dENvbnRlbnQgPT09IGhpZGRlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBjdXJyZW50IG1lc3NhZ2VzLCBoaWRlIHRoZSBoZWFkZXJcclxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpblBhZ2VOZXdzU3ViJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfcmVtb3ZlQ2xvY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2xvY2s6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSAuZnBUaW1lJyk7XHJcbiAgICAgICAgaWYgKGNsb2NrKSBjbG9jay5yZW1vdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgX2FkanVzdEhlYWRlclNpemUgPSAoc2VsZWN0b3I6IHN0cmluZywgdmlzaWJsZT86IGJvb2xlYW4pID0+IHtcclxuICAgICAgICBjb25zdCBuZXdzSGVhZGVyOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgaWYgKG5ld3NIZWFkZXIpIHtcclxuICAgICAgICAgICAgaWYgKHZpc2libGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmZvbnRTaXplID0gJzJlbSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9hZGRIaWRlckJ1dHRvbiA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcbiAgICAgICAgaWYgKCFuZXdzKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIG5ld3MgZW50cnlcclxuICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIGJ1dHRvblxyXG4gICAgICAgICAgICBjb25zdCB4YnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIHhidXR0b24udGV4dENvbnRlbnQgPSB0aGlzLl9pY29uO1xyXG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoeGJ1dHRvbiwge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OmlubGluZS1ibG9jazttYXJnaW4tcmlnaHQ6MC43ZW07Y3Vyc29yOnBvaW50ZXI7JyxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiAnbXBfY2xlYXJCdG4nLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGlja3NcclxuICAgICAgICAgICAgeGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gY2xpY2tlZCwgYXBwZW5kIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IG5ld3MgcG9zdCB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGxpc3Qgb2YgcmVtZW1iZXJlZCBuZXdzIGl0ZW1zXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1ZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKVxyXG4gICAgICAgICAgICAgICAgICAgID8gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcclxuICAgICAgICAgICAgICAgICAgICA6ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIaWRpbmcuLi4gJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSwgYCR7cHJldmlvdXNWYWx1ZX0ke2VudHJ5LnRleHRDb250ZW50fWApO1xyXG4gICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbW9yZSBuZXdzIGl0ZW1zLCByZW1vdmUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZE5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlZE5ld3MgJiYgdXBkYXRlZE5ld3MubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBidXR0b24gYXMgdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBlbnRyeVxyXG4gICAgICAgICAgICBpZiAoZW50cnkuZmlyc3RDaGlsZCkgZW50cnkuZmlyc3RDaGlsZC5iZWZvcmUoeGJ1dHRvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIF9jbGVhblZhbHVlcyA9IChudW0gPSAzKSA9PiB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBHTV9nZXRWYWx1ZSgke3RoaXMuX3ZhbHVlVGl0bGV9KWAsIHZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBsYXN0IDMgc3RvcmVkIGl0ZW1zIGFmdGVyIHNwbGl0dGluZyB0aGVtIGF0IHRoZSBpY29uXHJcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5hcnJheVRvU3RyaW5nKHZhbHVlLnNwbGl0KHRoaXMuX2ljb24pLnNsaWNlKDAgLSBudW0pKTtcclxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIG5ldyB2YWx1ZVxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfZ2V0TmV3c0l0ZW1zID0gKCk6IE5vZGVMaXN0T2Y8SFRNTERpdkVsZW1lbnQ+IHwgbnVsbCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2RpdltjbGFzc149XCJtYWluUGFnZU5ld3NcIl0nKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NoZWNrLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBTSEFSRUQgQ09ERVxyXG4gKlxyXG4gKiBUaGlzIGlzIGZvciBhbnl0aGluZyB0aGF0J3Mgc2hhcmVkIGJldHdlZW4gZmlsZXMsIGJ1dCBpcyBub3QgZ2VuZXJpYyBlbm91Z2ggdG9cclxuICogdG8gYmVsb25nIGluIGBVdGlscy50c2AuIEkgY2FuJ3QgdGhpbmsgb2YgYSBiZXR0ZXIgd2F5IHRvIGNhdGVnb3JpemUgRFJZIGNvZGUuXHJcbiAqL1xyXG5cclxuY2xhc3MgU2hhcmVkIHtcclxuICAgIC8qKlxyXG4gICAgICogUmVjZWl2ZSBhIHRhcmdldCBhbmQgYHRoaXMuX3NldHRpbmdzLnRpdGxlYFxyXG4gICAgICogQHBhcmFtIHRhciBDU1Mgc2VsZWN0b3IgZm9yIGEgdGV4dCBpbnB1dCBib3hcclxuICAgICAqL1xyXG4gICAgLy8gVE9ETzogd2l0aCBhbGwgQ2hlY2tpbmcgYmVpbmcgZG9uZSBpbiBgVXRpbC5zdGFydEZlYXR1cmUoKWAgaXQncyBubyBsb25nZXIgbmVjZXNzYXJ5IHRvIENoZWNrIGluIHRoaXMgZnVuY3Rpb25cclxuICAgIHB1YmxpYyBmaWxsR2lmdEJveCA9IChcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBzZXR0aW5nVGl0bGU6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZmlsbEdpZnRCb3goICR7dGFyfSwgJHtzZXR0aW5nVGl0bGV9IClgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKHRhcikudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludEJveDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcilcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRCb3gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyU2V0UG9pbnRzOiBudW1iZXIgPSBwYXJzZUludChcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7c2V0dGluZ1RpdGxlfV92YWxgKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1heFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQocG9pbnRCb3guZ2V0QXR0cmlidXRlKCdtYXgnKSEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4odXNlclNldFBvaW50cykgJiYgdXNlclNldFBvaW50cyA8PSBtYXhQb2ludHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4UG9pbnRzID0gdXNlclNldFBvaW50cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCb3gudmFsdWUgPSBtYXhQb2ludHMudG9GaXhlZCgwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1heFBvaW50cyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBsaXN0IG9mIGFsbCByZXN1bHRzIGZyb20gQnJvd3NlIHBhZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFNlYXJjaExpc3QgPSAoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PiA9PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgc2VhcmNoIHJlc3VsdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0gdGQnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gPSA8XHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxyXG4gICAgICAgICAgICAgICAgPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChzbmF0Y2hMaXN0ID09PSBudWxsIHx8IHNuYXRjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc25hdGNoTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZ29vZHJlYWRzQnV0dG9ucyA9IGFzeW5jIChcclxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXHJcbiAgICApID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucy4uLicpO1xyXG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XHJcbiAgICAgICAgbGV0IGF1dGhvcnMgPSAnJztcclxuXHJcbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBHb29kcmVhZHMnLCAnbXBfZ3JSb3cnKTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcclxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9nclJvdyAuZmxleCcpO1xyXG5cclxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cgLmZsZXgnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcclxuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ3NlcmllcycsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cclxuICAgICAgICBhdXRob3JQXHJcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdhdXRob3InLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xyXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnYm9vaycsIHRpdGxlKTtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdUaXRsZScsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0aXRsZX0gJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gdGl0bGUgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMhYCk7XHJcbiAgICB9O1xyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy5cclxuICovXHJcbmNsYXNzIFRvckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9yR2lmdERlZmF1bHQnLFxyXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gNTAwMCwgbWF4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RoYW5rc0FyZWEgaW5wdXRbbmFtZT1wb2ludHNdJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBuZXcgU2hhcmVkKClcclxuICAgICAgICAgICAgLmZpbGxHaWZ0Qm94KHRoaXMuX3RhciwgdGhpcy5fc2V0dGluZ3MudGl0bGUpXHJcbiAgICAgICAgICAgIC50aGVuKChwb2ludHMpID0+XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogQWRkcyB2YXJpb3VzIGxpbmtzIHRvIEdvb2RyZWFkc1xyXG4gKi9cclxuY2xhc3MgR29vZHJlYWRzQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b24nLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucycsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyKDMpKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIEdvb2RyZWFkcyBidXR0b25zJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZXMgYSBmaWVsZCBmb3IgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGJiY29kZVxyXG4gKi9cclxuY2xhc3MgQ3VycmVudGx5UmVhZGluZyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHRpdGxlOiAnY3VycmVudGx5UmVhZGluZycsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBnZW5lcmF0ZSBhIFwiQ3VycmVudGx5IFJlYWRpbmdcIiBmb3J1bSBzbmlwcGV0YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyBDdXJyZW50bHkgUmVhZGluZyBzZWN0aW9uLi4uJyk7XHJcbiAgICAgICAgLy8gR2V0IHRoZSByZXF1aXJlZCBpbmZvcm1hdGlvblxyXG4gICAgICAgIGNvbnN0IHRpdGxlOiBzdHJpbmcgPSBkb2N1bWVudCEucXVlcnlTZWxlY3RvcignI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZScpIVxyXG4gICAgICAgICAgICAudGV4dENvbnRlbnQhO1xyXG4gICAgICAgIGNvbnN0IGF1dGhvcnM6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCB0b3JJRDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMl07XHJcbiAgICAgICAgY29uc3Qgcm93VGFyOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8nKTtcclxuXHJcbiAgICAgICAgLy8gVGl0bGUgY2FuJ3QgYmUgbnVsbFxyXG4gICAgICAgIGlmICh0aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRpdGxlIGZpZWxkIHdhcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCdWlsZCBhIG5ldyB0YWJsZSByb3dcclxuICAgICAgICBjb25zdCBjclJvdzogSFRNTERpdkVsZW1lbnQgPSBhd2FpdCBVdGlsLmFkZFRvckRldGFpbHNSb3coXHJcbiAgICAgICAgICAgIHJvd1RhcixcclxuICAgICAgICAgICAgJ0N1cnJlbnRseSBSZWFkaW5nJyxcclxuICAgICAgICAgICAgJ21wX2NyUm93J1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gUHJvY2VzcyBkYXRhIGludG8gc3RyaW5nXHJcbiAgICAgICAgY29uc3QgYmx1cmI6IHN0cmluZyA9IGF3YWl0IHRoaXMuX2dlbmVyYXRlU25pcHBldCh0b3JJRCwgdGl0bGUsIGF1dGhvcnMpO1xyXG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxyXG4gICAgICAgIGNvbnN0IGJ0bjogSFRNTERpdkVsZW1lbnQgPSBhd2FpdCB0aGlzLl9idWlsZEJ1dHRvbihjclJvdywgYmx1cmIpO1xyXG4gICAgICAgIC8vIEluaXQgYnV0dG9uXHJcbiAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oYnRuLCBibHVyYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEJ1aWxkIGEgQkIgQ29kZSB0ZXh0IHNuaXBwZXQgdXNpbmcgdGhlIGJvb2sgaW5mbywgdGhlbiByZXR1cm4gaXRcclxuICAgICAqIEBwYXJhbSBpZCBUaGUgc3RyaW5nIElEIG9mIHRoZSBib29rXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgVGhlIHN0cmluZyB0aXRsZSBvZiB0aGUgYm9va1xyXG4gICAgICogQHBhcmFtIGF1dGhvcnMgQSBub2RlIGxpc3Qgb2YgYXV0aG9yIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dlbmVyYXRlU25pcHBldChcclxuICAgICAgICBpZDogc3RyaW5nLFxyXG4gICAgICAgIHRpdGxlOiBzdHJpbmcsXHJcbiAgICAgICAgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD5cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBBZGQgQXV0aG9yIExpbmtcclxuICAgICAgICAgKiBAcGFyYW0gYXV0aG9yRWxlbSBBIGxpbmsgY29udGFpbmluZyBhdXRob3IgaW5mb3JtYXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBhZGRBdXRob3JMaW5rID0gKGF1dGhvckVsZW06IEhUTUxBbmNob3JFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBgW3VybD0ke2F1dGhvckVsZW0uaHJlZi5yZXBsYWNlKCdodHRwczovL3d3dy5teWFub25hbW91c2UubmV0JywgJycpfV0ke1xyXG4gICAgICAgICAgICAgICAgYXV0aG9yRWxlbS50ZXh0Q29udGVudFxyXG4gICAgICAgICAgICB9Wy91cmxdYDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IHRoZSBOb2RlTGlzdCBpbnRvIGFuIEFycmF5IHdoaWNoIGlzIGVhc2llciB0byB3b3JrIHdpdGhcclxuICAgICAgICBsZXQgYXV0aG9yQXJyYXk6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgYXV0aG9ycy5mb3JFYWNoKChhdXRob3JFbGVtKSA9PiBhdXRob3JBcnJheS5wdXNoKGFkZEF1dGhvckxpbmsoYXV0aG9yRWxlbSkpKTtcclxuICAgICAgICAvLyBEcm9wIGV4dHJhIGl0ZW1zXHJcbiAgICAgICAgaWYgKGF1dGhvckFycmF5Lmxlbmd0aCA+IDMpIHtcclxuICAgICAgICAgICAgYXV0aG9yQXJyYXkgPSBbLi4uYXV0aG9yQXJyYXkuc2xpY2UoMCwgMyksICdldGMuJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYFt1cmw9L3QvJHtpZH1dJHt0aXRsZX1bL3VybF0gYnkgW2ldJHthdXRob3JBcnJheS5qb2luKCcsICcpfVsvaV1gO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBCdWlsZCBhIGJ1dHRvbiBvbiB0aGUgdG9yIGRldGFpbHMgcGFnZVxyXG4gICAgICogQHBhcmFtIHRhciBBcmVhIHdoZXJlIHRoZSBidXR0b24gd2lsbCBiZSBhZGRlZCBpbnRvXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBDb250ZW50IHRoYXQgd2lsbCBiZSBhZGRlZCBpbnRvIHRoZSB0ZXh0YXJlYVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9idWlsZEJ1dHRvbih0YXI6IEhUTUxEaXZFbGVtZW50LCBjb250ZW50OiBzdHJpbmcpOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICAgICAgLy8gQnVpbGQgdGV4dCBkaXNwbGF5XHJcbiAgICAgICAgdGFyLmlubmVySFRNTCA9IGA8dGV4dGFyZWEgcm93cz1cIjFcIiBjb2xzPVwiODBcIiBzdHlsZT0nbWFyZ2luLXJpZ2h0OjVweCc+JHtjb250ZW50fTwvdGV4dGFyZWE+YDtcclxuICAgICAgICAvLyBCdWlsZCBidXR0b25cclxuICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24odGFyLCAnbm9uZScsICdDb3B5JywgMik7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2NyUm93IC5tcF9idXR0b25fY2xvbmUnKSEuY2xhc3NMaXN0LmFkZCgnbXBfcmVhZGluZycpO1xyXG4gICAgICAgIC8vIFJldHVybiBidXR0b25cclxuICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9yZWFkaW5nJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBQcm90ZWN0cyB0aGUgdXNlciBmcm9tIHJhdGlvIHRyb3VibGVzIGJ5IGFkZGluZyB3YXJuaW5ncyBhbmQgZGlzcGxheWluZyByYXRpbyBkZWx0YVxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3QnLFxyXG4gICAgICAgIGRlc2M6IGBQcm90ZWN0IHlvdXIgcmF0aW8gd2l0aCB3YXJuaW5ncyAmYW1wOyByYXRpbyBjYWxjdWxhdGlvbnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGluZyByYXRpbyBwcm90ZWN0aW9uLi4uJyk7XHJcbiAgICAgICAgLy8gVGhlIGRvd25sb2FkIHRleHQgYXJlYVxyXG4gICAgICAgIGNvbnN0IGRsQnRuOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGRkbCcpO1xyXG4gICAgICAgIC8vIFRoZSBjdXJyZW50bHkgdW51c2VkIGxhYmVsIGFyZWEgYWJvdmUgdGhlIGRvd25sb2FkIHRleHRcclxuICAgICAgICBjb25zdCBkbExhYmVsOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI2Rvd25sb2FkIC50b3JEZXRJbm5lclRvcCdcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFdvdWxkIGJlY29tZSByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJOZXc6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICAvLyBDdXJyZW50IHJhdGlvXHJcbiAgICAgICAgY29uc3QgckN1cjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKTtcclxuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXHJcbiAgICAgICAgY29uc3Qgc2VlZGluZzogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNETGhpc3RvcnknKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBjdXN0b20gcmF0aW8gYW1vdW50cyAod2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXMgb3RoZXJ3aXNlKVxyXG4gICAgICAgIGNvbnN0IFtyMSwgcjIsIHIzXSA9IHRoaXMuX2NoZWNrQ3VzdG9tU2V0dGluZ3MoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBSYXRpbyBwcm90ZWN0aW9uIGxldmVscyBzZXQgdG86ICR7cjF9LCAke3IyfSwgJHtyM31gKTtcclxuXHJcbiAgICAgICAgLy8gT25seSBydW4gdGhlIGNvZGUgaWYgdGhlIHJhdGlvIGV4aXN0c1xyXG4gICAgICAgIGlmIChyTmV3ICYmIHJDdXIpIHtcclxuICAgICAgICAgICAgY29uc3QgckRpZmYgPSBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAtIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdO1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICBgQ3VycmVudCAke1V0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdfSB8IE5ldyAke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXVxyXG4gICAgICAgICAgICAgICAgICAgIH0gfCBEaWYgJHtyRGlmZn1gXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gT25seSBhY3RpdmF0ZSBpZiBhIHJhdGlvIGNoYW5nZSBpcyBleHBlY3RlZFxyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHJEaWZmKSAmJiByRGlmZiA+IDAuMDA5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlZWRpbmcgJiYgZGxMYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIE5PVCBhbHJlYWR5IHNlZWRpbmcgb3IgZG93bmxvYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICBkbExhYmVsLmlubmVySFRNTCA9IGBSYXRpbyBsb3NzICR7ckRpZmYudG9GaXhlZCgyKX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdub3JtYWwnOyAvL1RvIGRpc3Rpbmd1aXNoIGZyb20gQk9MRCBUaXRsZXNcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGxCdG4gJiYgZGxMYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIFwidHJpdmlhbCByYXRpbyBsb3NzXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2UgY2hhbmdlcyB3aWxsIGFsd2F5cyBoYXBwZW4gaWYgdGhlIHJhdGlvIGNvbmRpdGlvbnMgYXJlIG1ldFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyRGlmZiA+IHIxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdTcHJpbmdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmNvbG9yID0gJ2JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIFwiSSBuZXZlciB3YW50IHRvIGRsIHcvbyBGTFwiIHRocmVzaG9sZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyB1c2VzIHRoZSBNaW5pbXVtIFJhdGlvLCBpZiBlbmFibGVkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVwbGFjZSBkaXNhYmxlIGJ1dHRvbiB3aXRoIGJ1eSBGTCBidXR0b25cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByRGlmZiA+IHIzIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdE1pbl92YWwnKVxyXG4gICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnUmVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8vL0Rpc2FibGUgbGluayB0byBwcmV2ZW50IGRvd25sb2FkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLy8gZGxCdG4uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuY3Vyc29yID0gJ25vLWRyb3AnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXliZSBoaWRlIHRoZSBidXR0b24sIGFuZCBhZGQgdGhlIFJhdGlvIExvc3Mgd2FybmluZyBpbiBpdHMgcGxhY2U/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLmlubmVySFRNTCA9ICdGTCBSZWNvbW1lbmRlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJJIG5lZWQgdG8gdGhpbmsgYWJvdXQgdXNpbmcgYSBGTFwiIHRocmVzaG9sZFxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAockRpZmYgPiByMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2hlY2tDdXN0b21TZXR0aW5ncygpIHtcclxuICAgICAgICBsZXQgbDEgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMV92YWwnKSk7XHJcbiAgICAgICAgbGV0IGwyID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDJfdmFsJykpO1xyXG4gICAgICAgIGxldCBsMyA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwzX3ZhbCcpKTtcclxuXHJcbiAgICAgICAgaWYgKGlzTmFOKGwzKSkgbDMgPSAxO1xyXG4gICAgICAgIGlmIChpc05hTihsMikpIGwyID0gMiAvIDM7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSAxIC8gMztcclxuXHJcbiAgICAgICAgLy8gSWYgc29tZW9uZSBwdXQgdGhpbmdzIGluIGEgZHVtYiBvcmRlciwgaWdub3JlIHNtYWxsZXIgbnVtYmVyc1xyXG4gICAgICAgIGlmIChsMiA+IGwzKSBsMiA9IGwzO1xyXG4gICAgICAgIGlmIChsMSA+IGwyKSBsMSA9IGwyO1xyXG5cclxuICAgICAgICAvLyBJZiBjdXN0b20gbnVtYmVycyBhcmUgc21hbGxlciB0aGFuIGRlZmF1bHQgdmFsdWVzLCBpZ25vcmUgdGhlIGxvd2VyIHdhcm5pbmdcclxuICAgICAgICBpZiAoaXNOYU4obDIpKSBsMiA9IGwzIDwgMiAvIDMgPyBsMyA6IDIgLyAzO1xyXG4gICAgICAgIGlmIChpc05hTihsMSkpIGwxID0gbDIgPCAxIC8gMyA/IGwyIDogMSAvIDM7XHJcblxyXG4gICAgICAgIHJldHVybiBbbDEsIGwyLCBsM107XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBMb3cgcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdEwxIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDEnLFxyXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDEnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMC4zJyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBzbWFsbGVzdCB0aHJlc2hob2xkIHRvIHdhcm4gb2YgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgc2xpZ2h0IGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2V0IGN1c3RvbSBMMSBSYXRpbyBQcm90ZWN0aW9uIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBNZWRpdW0gcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdEwyIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDInLFxyXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDInLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMC42JyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBtZWRpYW4gdGhyZXNoaG9sZCB0byB3YXJuIG9mIHJhdGlvIGNoYW5nZXMuICg8ZW0+VGhpcyBpcyBhIG5vdGljZWFibGUgY29sb3IgY2hhbmdlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTZXQgY3VzdG9tIEwyIFJhdGlvIFByb3RlY3Rpb24hJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEhpZ2ggcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdEwzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDMnLFxyXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDMnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMScsXHJcbiAgICAgICAgZGVzYzogYFNldCB0aGUgaGlnaGVzdCB0aHJlc2hob2xkIHRvIHdhcm4gb2YgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGRpc2FibGVzIGRvd25sb2FkIHdpdGhvdXQgRkwgdXNlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTZXQgY3VzdG9tIEwyIFJhdGlvIFByb3RlY3Rpb24hJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFJhdGlvUHJvdGVjdE1pbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdE1pbicsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGFnOiAnTWluaW11bSBSYXRpbycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTAwJyxcclxuICAgICAgICBkZXNjOiAnVHJpZ2dlciB0aGUgbWF4aW11bSB3YXJuaW5nIGlmIHlvdXIgcmF0aW8gd291bGQgZHJvcCBiZWxvdyB0aGlzIG51bWJlci4nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIGN1c3RvbSBtaW5pbXVtIHJhdGlvIScpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAqIEFsbG93cyBnaWZ0aW5nIG9mIEZMIHdlZGdlIHRvIG1lbWJlcnMgdGhyb3VnaCBmb3J1bS5cclxuICovXHJcbmNsYXNzIEZvcnVtRkxHaWZ0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Gb3J1bSxcclxuICAgICAgICB0aXRsZTogJ2ZvcnVtRkxHaWZ0JyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgVGhhbmsgYnV0dG9uIHRvIGZvcnVtIHBvc3RzLiAoPGVtPlNlbmRzIGEgRkwgd2VkZ2U8L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5mb3J1bUxpbmsnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnZm9ydW0gdGhyZWFkJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGluZyBGb3J1bSBHaWZ0IEJ1dHRvbi4uLicpO1xyXG4gICAgICAgIC8vbWFpbkJvZHkgaXMgYmVzdCBlbGVtZW50IHdpdGggYW4gSUQgSSBjb3VsZCBmaW5kIHRoYXQgaXMgYSBwYXJlbnQgdG8gYWxsIGZvcnVtIHBvc3RzXHJcbiAgICAgICAgY29uc3QgbWFpbkJvZHkgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5Jyk7XHJcbiAgICAgICAgLy9tYWtlIGFycmF5IG9mIGZvcnVtIHBvc3RzIC0gdGhlcmUgaXMgb25seSBvbmUgY3Vyc29yIGNsYXNzZWQgb2JqZWN0IHBlciBmb3J1bSBwb3N0LCBzbyB0aGlzIHdhcyBiZXN0IHRvIGtleSBvZmYgb2YuIHdpc2ggdGhlcmUgd2VyZSBtb3JlIElEcyBhbmQgc3VjaCB1c2VkIGluIGZvcnVtc1xyXG4gICAgICAgIGNvbnN0IGZvcnVtUG9zdHM6IEhUTUxBbmNob3JFbGVtZW50W10gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcclxuICAgICAgICAgICAgbWFpbkJvZHkuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY29sdGFibGUnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9mb3IgZWFjaCBwb3N0IG9uIHRoZSBwYWdlXHJcbiAgICAgICAgZm9ydW1Qb3N0cy5mb3JFYWNoKChmb3J1bVBvc3QpID0+IHtcclxuICAgICAgICAgICAgLy93b3JrIG91ciB3YXkgZG93biB0aGUgc3RydWN0dXJlIG9mIHRoZSBIVE1MIHRvIGdldCB0byBvdXIgcG9zdFxyXG4gICAgICAgICAgICBsZXQgYm90dG9tUm93ID0gZm9ydW1Qb3N0LmNoaWxkTm9kZXNbMV07XHJcbiAgICAgICAgICAgIGJvdHRvbVJvdyA9IGJvdHRvbVJvdy5jaGlsZE5vZGVzWzRdO1xyXG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1szXTtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIElEIG9mIHRoZSBmb3J1bSBmcm9tIHRoZSBjdXN0b20gTUFNIGF0dHJpYnV0ZVxyXG4gICAgICAgICAgICBsZXQgcG9zdElEID0gKDxIVE1MRWxlbWVudD5mb3J1bVBvc3QucHJldmlvdXNTaWJsaW5nISkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgIC8vbWFtIGRlY2lkZWQgdG8gaGF2ZSBhIGRpZmZlcmVudCBzdHJ1Y3R1cmUgZm9yIGxhc3QgZm9ydW0uIHdpc2ggdGhleSBqdXN0IGhhZCBJRHMgb3Igc29tZXRoaW5nIGluc3RlYWQgb2YgYWxsIHRoaXMganVtcGluZyBhcm91bmRcclxuICAgICAgICAgICAgaWYgKHBvc3RJRCA9PT0gJ2xhc3QnKSB7XHJcbiAgICAgICAgICAgICAgICBwb3N0SUQgPSAoPEhUTUxFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBmb3J1bVBvc3QucHJldmlvdXNTaWJsaW5nIS5wcmV2aW91c1NpYmxpbmchXHJcbiAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBlbGVtZW50IGZvciBvdXIgZmVhdHVyZVxyXG4gICAgICAgICAgICBjb25zdCBnaWZ0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICAgICAgLy9zZXQgc2FtZSBjbGFzcyBhcyBvdGhlciBvYmplY3RzIGluIGFyZWEgZm9yIHNhbWUgcG9pbnRlciBhbmQgZm9ybWF0dGluZyBvcHRpb25zXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY3Vyc29yJyk7XHJcbiAgICAgICAgICAgIC8vZ2l2ZSBvdXIgZWxlbWVudCBhbiBJRCBmb3IgZnV0dXJlIHNlbGVjdGlvbiBhcyBuZWVkZWRcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsICdtcF8nICsgcG9zdElEICsgJ190ZXh0Jyk7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBpbWcgZWxlbWVudCB0byBsZWFkIG91ciBuZXcgZmVhdHVyZSB2aXN1YWxzXHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRJY29uR2lmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgIC8vdXNlIHNpdGUgZnJlZWxlZWNoIGdpZiBpY29uIGZvciBvdXIgZmVhdHVyZVxyXG4gICAgICAgICAgICBnaWZ0SWNvbkdpZi5zZXRBdHRyaWJ1dGUoXHJcbiAgICAgICAgICAgICAgICAnc3JjJyxcclxuICAgICAgICAgICAgICAgICdodHRwczovL2Nkbi5teWFub25hbW91c2UubmV0L2ltYWdlYnVja2V0LzEwODMwMy90aGFuay5naWYnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIC8vbWFrZSB0aGUgZ2lmIGljb24gdGhlIGZpcnN0IGNoaWxkIG9mIGVsZW1lbnRcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ2lmdEljb25HaWYpO1xyXG4gICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSBlbGVtZW50IGluIGxpbmUgd2l0aCB0aGUgY3Vyc29yIG9iamVjdCB3aGljaCBpcyB0aGUgcXVvdGUgYW5kIHJlcG9ydCBidXR0b25zIGF0IGJvdHRvbVxyXG4gICAgICAgICAgICBib3R0b21Sb3cuYXBwZW5kQ2hpbGQoZ2lmdEVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgLy9tYWtlIGl0IGEgYnV0dG9uIHZpYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvL3RvIGF2b2lkIGJ1dHRvbiB0cmlnZ2VyaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBwYWdlIGxvYWQsIGNoZWNrIGlmIGFscmVhZHkgaGF2ZSBqc29uIHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZHVlIHRvIGxhY2sgb2YgSURzIGFuZCBjb25mbGljdGluZyBxdWVyeSBzZWxlY3RhYmxlIGVsZW1lbnRzLCBuZWVkIHRvIGp1bXAgdXAgYSBmZXcgcGFyZW50IGxldmVsc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0UGFyZW50Tm9kZSA9IGdpZnRFbGVtZW50LnBhcmVudEVsZW1lbnQhLnBhcmVudEVsZW1lbnQhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGFyZW50RWxlbWVudCE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vb25jZSBhdCBwYXJlbnQgbm9kZSBvZiB0aGUgcG9zdCwgZmluZCB0aGUgcG9zdGVyJ3MgdXNlciBpZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyRWxlbSA9IHBvc3RQYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoYGFbaHJlZl49XCIvdS9cIl1gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIFVSTCBvZiB0aGUgcG9zdCB0byBhZGQgdG8gbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3N0VVJMID0gKDxIVE1MRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL2YvdC9cIl1gKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSkuZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IE1BTSB1c2VyIHNlbmRpbmcgZ2lmdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VuZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJNZW51JykhLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jbGVhbiB1cCB0ZXh0IG9mIHNlbmRlciBvYmpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyID0gc2VuZGVyLnN1YnN0cmluZygwLCBzZW5kZXIuaW5kZXhPZignICcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHRpdGxlIG9mIHRoZSBwYWdlIHNvIHdlIGNhbiB3cml0ZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmb3J1bVRpdGxlID0gZG9jdW1lbnQudGl0bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3V0IGRvd24gZmx1ZmYgZnJvbSBwYWdlIHRpdGxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcnVtVGl0bGUgPSBmb3J1bVRpdGxlLnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDIyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ydW1UaXRsZS5pbmRleE9mKCd8JykgLSAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBtZW1iZXJzIG5hbWUgZm9yIEpTT04gc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gKDxIVE1MRWxlbWVudD51c2VyRWxlbSEpLmlubmVyVGV4dDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCBhIGdpZnQgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9c2VuZFdlZGdlJmdpZnRUbz0ke3VzZXJOYW1lfSZtZXNzYWdlPSR7c2VuZGVyfSB3YW50cyB0byB0aGFuayB5b3UgZm9yIHlvdXIgY29udHJpYnV0aW9uIHRvIHRoZSBmb3J1bSB0b3BpYyBbdXJsPWh0dHBzOi8vbXlhbm9uYW1vdXNlLm5ldCR7cG9zdFVSTH1dJHtmb3J1bVRpdGxlfVsvdXJsXWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWFrZSAjIFVSSSBjb21wYXRpYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCcjJywgJyUyMycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3VzZSBNQU0rIGpzb24gZ2V0IHV0aWxpdHkgdG8gcHJvY2VzcyBVUkwgYW5kIHJldHVybiByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGdpZnQgd2FzIHN1Y2Nlc3NmdWxseSBzZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBmZWF0dXJlIHRleHQgdG8gc2hvdyBzdWNjZXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBTdWNjZXNzZnVsIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9iYXNlZCBvbiBmYWlsdXJlLCBhZGQgZmVhdHVyZSB0ZXh0IHRvIHNob3cgZmFpbHVyZSByZWFzb24gb3IgZ2VuZXJpY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvciA9PT1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdZb3UgY2FuIG9ubHkgc2VuZCBhIHVzZXIgb25lIHdlZGdlIHBlciBkYXkuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkOiBBbHJlYWR5IEdpZnRlZCBUaGlzIFVzZXIgVG9kYXkhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yID09PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ludmFsaWQgdXNlciwgdGhpcyB1c2VyIGlzIG5vdCBjdXJyZW50bHkgYWNjZXB0aW5nIHdlZGdlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogVGhpcyBVc2VyIERvZXMgTm90IEFjY2VwdCBHaWZ0cyEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb25seSBrbm93biBleGFtcGxlIG9mIHRoaXMgJ290aGVyJyBpcyB3aGVuIGdpZnRpbmcgeW91cnNlbGZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdGTCBHaWZ0IEZhaWxlZCEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogUHJvY2VzcyAmIHJldHVybiBpbmZvcm1hdGlvbiBmcm9tIHRoZSBzaG91dGJveFxyXG4gKi9cclxuY2xhc3MgUHJvY2Vzc1Nob3V0cyB7XHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoIHRoZSBzaG91dGJveCBmb3IgY2hhbmdlcywgdHJpZ2dlcmluZyBhY3Rpb25zIGZvciBmaWx0ZXJlZCBzaG91dHNcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIHNob3V0Ym94IGVsZW1lbnQgc2VsZWN0b3JcclxuICAgICAqIEBwYXJhbSBuYW1lcyAoT3B0aW9uYWwpIExpc3Qgb2YgdXNlcm5hbWVzL0lEcyB0byBmaWx0ZXIgZm9yXHJcbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgKE9wdGlvbmFsKSBXaGF0IGZpbHRlciB0aGUgbmFtZXMgYXJlIGZvci4gUmVxdWlyZWQgaWYgYG5hbWVzYCBpcyBwcm92aWRlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2hvdXRib3goXHJcbiAgICAgICAgdGFyOiBzdHJpbmcsXHJcbiAgICAgICAgbmFtZXM/OiBzdHJpbmdbXSxcclxuICAgICAgICB1c2VydHlwZT86IFNob3V0Ym94VXNlclR5cGVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIC8vIE9ic2VydmUgdGhlIHNob3V0Ym94XHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKFxyXG4gICAgICAgICAgICB0YXIsXHJcbiAgICAgICAgICAgIChtdXRMaXN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzaG91dGJveCB1cGRhdGVzLCBwcm9jZXNzIHRoZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgbXV0TGlzdC5mb3JFYWNoKChtdXRSZWMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGNoYW5nZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgICAgICBtdXRSZWMuYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlOiBOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYWRkZWQgYnkgTUFNKyBmb3IgZ2lmdCBidXR0b24sIGlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIGlnbm9yZSBpZiB0aGUgbm9kZSBpcyBhIGRhdGUgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15tcF8vLnRlc3Qobm9kZURhdGEuZ2V0QXR0cmlidXRlKCdpZCcpISkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgbG9va2luZyBmb3Igc3BlY2lmaWMgdXNlcnMuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWVzICE9PSB1bmRlZmluZWQgJiYgbmFtZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJ0eXBlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVc2VydHlwZSBtdXN0IGJlIGRlZmluZWQgaWYgZmlsdGVyaW5nIG5hbWVzISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklEOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hyZWYnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhID4gc3BhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlsdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgL3UvJHtuYW1lfWAgPT09IHVzZXJJRCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNhc2VsZXNzU3RyaW5nTWF0Y2gobmFtZSwgdXNlck5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVTaG91dChub2RlLCB1c2VydHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7IGNoaWxkTGlzdDogdHJ1ZSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdhdGNoIHRoZSBzaG91dGJveCBmb3IgY2hhbmdlcywgdHJpZ2dlcmluZyBhY3Rpb25zIGZvciBmaWx0ZXJlZCBzaG91dHNcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIHNob3V0Ym94IGVsZW1lbnQgc2VsZWN0b3JcclxuICAgICAqIEBwYXJhbSBidXR0b25zIE51bWJlciB0byByZXByZXNlbnQgY2hlY2tib3ggc2VsZWN0aW9ucyAxID0gUmVwbHksIDIgPSBSZXBseSBXaXRoIFF1b3RlXHJcbiAgICAgKiBAcGFyYW0gY2hhckxpbWl0IE51bWJlciBvZiBjaGFyYWN0ZXJzIHRvIGluY2x1ZGUgaW4gcXVvdGUsICwgY2hhckxpbWl0PzpudW1iZXIgLSBDdXJyZW50bHkgdW51c2VkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTaG91dGJveFJlcGx5KHRhcjogc3RyaW5nLCBidXR0b25zPzogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnd2F0Y2hTaG91dGJveFJlcGx5KCcsIHRhciwgYnV0dG9ucywgJyknKTtcclxuXHJcbiAgICAgICAgY29uc3QgX2dldFVJRCA9IChub2RlOiBOb2RlKTogc3RyaW5nID0+XHJcbiAgICAgICAgICAgIHRoaXMuZXh0cmFjdEZyb21TaG91dChub2RlLCAnYVtocmVmXj1cIi91L1wiXScsICdocmVmJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IF9nZXRSYXdDb2xvciA9IChlbGVtOiBIVE1MU3BhbkVsZW1lbnQpOiBzdHJpbmcgfCBudWxsID0+IHtcclxuICAgICAgICAgICAgaWYgKGVsZW0uc3R5bGUuYmFja2dyb3VuZENvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbS5zdHlsZS5jb2xvcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW0uc3R5bGUuY29sb3I7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgX2dldE5hbWVDb2xvciA9IChlbGVtOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsKTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByYXdDb2xvcjogc3RyaW5nIHwgbnVsbCA9IF9nZXRSYXdDb2xvcihlbGVtKTtcclxuICAgICAgICAgICAgICAgIGlmIChyYXdDb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gaGV4XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmdiOiBzdHJpbmdbXSA9IFV0aWwuYnJhY2tldENvbnRlbnRzKHJhd0NvbG9yKS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlsLnJnYlRvSGV4KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMl0pXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVsZW1lbnQgaXMgbnVsbCFcXG4ke2VsZW19YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IF9tYWtlTmFtZVRhZyA9IChuYW1lOiBzdHJpbmcsIGhleDogc3RyaW5nIHwgbnVsbCwgdWlkOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICB1aWQgPSB1aWQubWF0Y2goL1xcZCsvZykhLmpvaW4oJycpOyAvLyBHZXQgdGhlIFVJRCwgYnV0IG9ubHkgdGhlIGRpZ2l0c1xyXG4gICAgICAgICAgICBoZXggPSBoZXggPyBgOyR7aGV4fWAgOiAnJzsgLy8gSWYgdGhlcmUgaXMgYSBoZXggdmFsdWUsIHByZXBlbmQgYDtgXHJcbiAgICAgICAgICAgIHJldHVybiBgQFt1bGluaz0ke3VpZH0ke2hleH1dJHtuYW1lfVsvdWxpbmtdYDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHJlcGx5IGJveFxyXG4gICAgICAgIGNvbnN0IHJlcGx5Qm94ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYm94X3RleHQnKTtcclxuICAgICAgICAvLyBPYnNlcnZlIHRoZSBzaG91dGJveFxyXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcclxuICAgICAgICAgICAgdGFyLFxyXG4gICAgICAgICAgICAobXV0TGlzdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2hvdXRib3ggdXBkYXRlcywgcHJvY2VzcyB0aGUgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIG11dExpc3QuZm9yRWFjaCgobXV0UmVjKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjaGFuZ2VkIG5vZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0UmVjLmFkZGVkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShub2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBub2RlIGlzIGFkZGVkIGJ5IE1BTSsgZm9yIGdpZnQgYnV0dG9uLCBpZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpZ25vcmUgaWYgdGhlIG5vZGUgaXMgYSBkYXRlIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9ebXBfLy50ZXN0KG5vZGVEYXRhLmdldEF0dHJpYnV0ZSgnaWQnKSEpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGF0YS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIG5hbWUgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvdXROYW1lOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gVXRpbC5ub2RlVG9FbGVtKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApLnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZl49XCIvdS9cIl0gc3BhbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHcmFiIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZSBuYW1lLCBvciB0ZXh0IGNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVDb2xvcjogc3RyaW5nIHwgbnVsbCA9IF9nZXROYW1lQ29sb3Ioc2hvdXROYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9leHRyYWN0IHRoZSB1c2VybmFtZSBmcm9tIG5vZGUgZm9yIHVzZSBpbiByZXBseVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhID4gc3BhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlcklEOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FbaHJlZl49XCIvdS9cIl0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hyZWYnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgc3BhbiBlbGVtZW50IHRvIGJlIGJvZHkgb2YgYnV0dG9uIGFkZGVkIHRvIHBhZ2UgLSBidXR0b24gdXNlcyByZWxhdGl2ZSBub2RlIGNvbnRleHQgYXQgY2xpY2sgdGltZSB0byBkbyBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbHlCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIGEgUmVwbHlTaW1wbGUgcmVxdWVzdCwgdGhlbiBjcmVhdGUgUmVwbHkgU2ltcGxlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnV0dG9ucyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYnV0dG9uIHdpdGggb25jbGljayBhY3Rpb24gb2Ygc2V0dGluZyBzYiB0ZXh0IGZpZWxkIHRvIHVzZXJuYW1lIHdpdGggcG90ZW50aWFsIGNvbG9yIGJsb2NrIHdpdGggYSBjb2xvbiBhbmQgc3BhY2UgdG8gcmVwbHksIGZvY3VzIGN1cnNvciBpbiB0ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uaW5uZXJIVE1MID0gJzxidXR0b24+XFx1MjkzYTwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgc3R5bGVkIG5hbWUgdGFnIHRvIHRoZSByZXBseSBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgbm90aGluZyB3YXMgaW4gdGhlIHJlcGx5IGJveCwgYWRkIGEgY29sb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGx5Qm94LnZhbHVlID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtfbWFrZU5hbWVUYWcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJRFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX06IGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICR7X21ha2VOYW1lVGFnKHVzZXJOYW1lLCBuYW1lQ29sb3IsIHVzZXJJRCl9IGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgYSByZXBseVF1b3RlIHJlcXVlc3QsIHRoZW4gY3JlYXRlIHJlcGx5IHF1b3RlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChidXR0b25zID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBidXR0b24gd2l0aCBvbmNsaWNrIGFjdGlvbiBvZiBnZXR0aW5nIHRoYXQgbGluZSdzIHRleHQsIHN0cmlwcGluZyBkb3duIHRvIDY1IGNoYXIgd2l0aCBubyB3b3JkIGJyZWFrLCB0aGVuIGluc2VydCBpbnRvIFNCIHRleHQgZmllbGQsIGZvY3VzIGN1cnNvciBpbiB0ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uaW5uZXJIVE1MID0gJzxidXR0b24+XFx1MjkzZDwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnF1b3RlU2hvdXQobm9kZSwgNjUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHF1b3RlIHRvIHJlcGx5IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9OiBcXHUyMDFjW2ldJHt0ZXh0fVsvaV1cXHUyMDFkIGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9naXZlIHNwYW4gYW4gSUQgZm9yIHBvdGVudGlhbCB1c2UgbGF0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdtcF9yZXBseUJ1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2luc2VydCBidXR0b24gcHJpb3IgdG8gdXNlcm5hbWUgb3IgYW5vdGhlciBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUocmVwbHlCdXR0b24sIG5vZGUuY2hpbGROb2Rlc1syXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBxdW90ZVNob3V0KHNob3V0OiBOb2RlLCBsZW5ndGg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHRleHRBcnI6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgLy8gR2V0IG51bWJlciBvZiByZXBseSBidXR0b25zIHRvIHJlbW92ZSBmcm9tIHRleHRcclxuICAgICAgICBjb25zdCBidG5Db3VudCA9IHNob3V0LmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICcubXBfcmVwbHlCdXR0b24nXHJcbiAgICAgICAgKS5sZW5ndGg7XHJcbiAgICAgICAgLy8gR2V0IHRoZSB0ZXh0IG9mIGFsbCBjaGlsZCBub2Rlc1xyXG4gICAgICAgIHNob3V0LmNoaWxkTm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgLyogSWYgdGhlIGNoaWxkIGlzIGEgbm9kZSB3aXRoIGNoaWxkcmVuIChleC4gbm90IHBsYWluIHRleHQpIGNoZWNrIHRvIHNlZSBpZlxyXG4gICAgICAgICAgICB0aGUgY2hpbGQgaXMgYSBsaW5rLiBJZiB0aGUgbGluayBkb2VzIE5PVCBzdGFydCB3aXRoIGAvdS9gIChpbmRpY2F0aW5nIGEgdXNlcilcclxuICAgICAgICAgICAgdGhlbiBjaGFuZ2UgdGhlIGxpbmsgdG8gdGhlIHN0cmluZyBgW0xpbmtdYC5cclxuICAgICAgICAgICAgSW4gYWxsIG90aGVyIGNhc2VzLCByZXR1cm4gdGhlIGNoaWxkIHRleHQgY29udGVudC4gKi9cclxuICAgICAgICAgICAgaWYgKGNoaWxkLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRFbGVtID0gVXRpbC5ub2RlVG9FbGVtKGNoaWxkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNoaWxkRWxlbS5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBcnIucHVzaChjaGlsZC50ZXh0Q29udGVudCEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZEVsZW0uZ2V0QXR0cmlidXRlKCdocmVmJykhLmluZGV4T2YoJy91LycpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBcnIucHVzaCgnW0xpbmtdJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBcnIucHVzaChjaGlsZC50ZXh0Q29udGVudCEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBNYWtlIGEgc3RyaW5nLCBidXQgdG9zcyBvdXQgdGhlIGZpcnN0IGZldyBub2Rlc1xyXG4gICAgICAgIGxldCBub2RlVGV4dCA9IHRleHRBcnIuc2xpY2UoMyArIGJ0bkNvdW50KS5qb2luKCcnKTtcclxuICAgICAgICBpZiAobm9kZVRleHQuaW5kZXhPZignOicpID09PSAwKSB7XHJcbiAgICAgICAgICAgIG5vZGVUZXh0ID0gbm9kZVRleHQuc3Vic3RyKDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIHNob3VsZCBoYXZlIGp1c3QgdGhlIG1lc3NhZ2UgdGV4dC5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IHF1b3RlcyB0aGF0IG1pZ2h0IGJlIGNvbnRhaW5lZDpcclxuICAgICAgICBub2RlVGV4dCA9IG5vZGVUZXh0LnJlcGxhY2UoL1xcdXsyMDFjfSguKj8pXFx1ezIwMWR9L2d1LCAnJyk7XHJcbiAgICAgICAgLy8gVHJpbSB0aGUgdGV4dCB0byBhIG1heCBsZW5ndGggYW5kIGFkZCAuLi4gaWYgc2hvcnRlbmVkXHJcbiAgICAgICAgbGV0IHRyaW1tZWRUZXh0ID0gVXRpbC50cmltU3RyaW5nKG5vZGVUZXh0LnRyaW0oKSwgbGVuZ3RoKTtcclxuICAgICAgICBpZiAodHJpbW1lZFRleHQgIT09IG5vZGVUZXh0LnRyaW0oKSkge1xyXG4gICAgICAgICAgICB0cmltbWVkVGV4dCArPSAnIFtcXHUyMDI2XSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERvbmUhXHJcbiAgICAgICAgcmV0dXJuIHRyaW1tZWRUZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHNob3V0IFRoZSBub2RlIGNvbnRhaW5pbmcgc2hvdXQgaW5mb1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgZWxlbWVudCBzZWxlY3RvciBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBnZXQgVGhlIHJlcXVlc3RlZCBpbmZvIChocmVmIG9yIHRleHQpXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgc3RyaW5nIHRoYXQgd2FzIHNwZWNpZmllZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgc2hvdXQ6IE5vZGUsXHJcbiAgICAgICAgdGFyOiBzdHJpbmcsXHJcbiAgICAgICAgZ2V0OiAnaHJlZicgfCAndGV4dCdcclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJyk7XHJcblxyXG4gICAgICAgIGlmIChzaG91dCAhPT0gbnVsbCAmJiAhbm9kZURhdGEpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2hvdXRFbGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICB0YXJcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKHNob3V0RWxlbSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhY3RlZDogc3RyaW5nIHwgbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmIChnZXQgIT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS5nZXRBdHRyaWJ1dGUoZ2V0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhY3RlZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHRyYWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEF0dHJpYnV0ZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgRWxlbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgTm9kZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYW5nZSB0aGUgc3R5bGUgb2YgYSBzaG91dCBiYXNlZCBvbiBmaWx0ZXIgbGlzdHNcclxuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cclxuICAgICAqIEBwYXJhbSB1c2VydHlwZSBUaGUgdHlwZSBvZiB1c2VycyB0aGF0IGhhdmUgYmVlbiBmaWx0ZXJlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHN0eWxlU2hvdXQoc2hvdXQ6IE5vZGUsIHVzZXJ0eXBlOiBTaG91dGJveFVzZXJUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2hvdXRFbGVtOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCk7XHJcbiAgICAgICAgaWYgKHVzZXJ0eXBlID09PSAncHJpb3JpdHknKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgncHJpb3JpdHlTdHlsZV92YWwnKTtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbVN0eWxlKSB7XHJcbiAgICAgICAgICAgICAgICBzaG91dEVsZW0uc3R5bGUuYmFja2dyb3VuZCA9IGBoc2xhKCR7Y3VzdG9tU3R5bGV9KWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG91dEVsZW0uc3R5bGUuYmFja2dyb3VuZCA9ICdoc2xhKDAsMCUsNTAlLDAuMyknO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh1c2VydHlwZSA9PT0gJ211dGUnKSB7XHJcbiAgICAgICAgICAgIHNob3V0RWxlbS5jbGFzc0xpc3QuYWRkKCdtcF9tdXRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUHJpb3JpdHlVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncHJpb3JpdHlVc2VycycsXHJcbiAgICAgICAgdGFnOiAnRW1waGFzaXplIFVzZXJzJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiBzeXN0ZW0sIDI1NDIwLCA3NzYxOCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0VtcGhhc2l6ZXMgbWVzc2FnZXMgZnJvbSB0aGUgbGlzdGVkIHVzZXJzIGluIHRoZSBzaG91dGJveC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcHJpb3JpdHlVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBnbVZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShgJHt0aGlzLnNldHRpbmdzLnRpdGxlfV92YWxgKTtcclxuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW9yaXR5VXNlcnMgPSBhd2FpdCBVdGlsLmNzdlRvQXJyYXkoZ21WYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94KHRoaXMuX3RhciwgdGhpcy5fcHJpb3JpdHlVc2VycywgdGhpcy5fdXNlclR5cGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEhpZ2hsaWdodGluZyB1c2VycyBpbiB0aGUgc2hvdXRib3guLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gcHJpb3JpdHkgdXNlcnNcclxuICovXHJcbmNsYXNzIFByaW9yaXR5U3R5bGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5U3R5bGUnLFxyXG4gICAgICAgIHRhZzogJ0VtcGhhc2lzIFN0eWxlJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDAsIDAlLCA1MCUsIDAuMycsXHJcbiAgICAgICAgZGVzYzogYENoYW5nZSB0aGUgY29sb3Ivb3BhY2l0eSBvZiB0aGUgaGlnaGxpZ2h0aW5nIHJ1bGUgZm9yIGVtcGhhc2l6ZWQgdXNlcnMnIHBvc3RzLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXR0aW5nIGN1c3RvbSBoaWdobGlnaHQgZm9yIHByaW9yaXR5IHVzZXJzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgYSBjdXN0b20gYmFja2dyb3VuZCB0byBiZSBhcHBsaWVkIHRvIGRlc2lyZWQgbXV0ZWQgdXNlcnNcclxuICovXHJcbmNsYXNzIE11dGVkVXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ211dGVkVXNlcnMnLFxyXG4gICAgICAgIHRhZzogJ011dGUgdXNlcnMnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEyMzQsIGdhcmRlbnNoYWRlJyxcclxuICAgICAgICBkZXNjOiBgT2JzY3VyZXMgbWVzc2FnZXMgZnJvbSB0aGUgbGlzdGVkIHVzZXJzIGluIHRoZSBzaG91dGJveCB1bnRpbCBob3ZlcmVkLiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9tdXRlZFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfdXNlclR5cGU6IFNob3V0Ym94VXNlclR5cGUgPSAnbXV0ZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5zZXR0aW5ncy50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgaWYgKGdtVmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tdXRlZFVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlcmxpc3QgaXMgbm90IGRlZmluZWQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveCh0aGlzLl90YXIsIHRoaXMuX211dGVkVXNlcnMsIHRoaXMuX3VzZXJUeXBlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBPYnNjdXJpbmcgbXV0ZWQgdXNlcnMuLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBHaWZ0IGJ1dHRvbiB0byBiZSBhZGRlZCB0byBTaG91dCBUcmlwbGUgZG90IG1lbnVcclxuICovXHJcbmNsYXNzIEdpZnRCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZ2lmdEJ1dHRvbicsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIEdpZnQgYnV0dG9uIGluIFNob3V0Ym94IGRvdC1tZW51YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBJbml0aWFsaXplZCBHaWZ0IEJ1dHRvbi5gKTtcclxuICAgICAgICBjb25zdCBzYmZEaXYgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiZicpITtcclxuICAgICAgICBjb25zdCBzYmZEaXZDaGlsZCA9IHNiZkRpdiEuZmlyc3RDaGlsZDtcclxuXHJcbiAgICAgICAgLy9hZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHdoZW5ldmVyIHNvbWV0aGluZyBpcyBjbGlja2VkIGluIHRoZSBzYmYgZGl2XHJcbiAgICAgICAgc2JmRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICAgICAgLy9wdWxsIHRoZSBldmVudCB0YXJnZXQgaW50byBhbiBIVE1MIEVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSBUcmlwbGUgRG90IE1lbnUgYXMgYW4gZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCBzYk1lbnVFbGVtID0gdGFyZ2V0IS5jbG9zZXN0KCcuc2JfbWVudScpO1xyXG4gICAgICAgICAgICAvL2ZpbmQgdGhlIG1lc3NhZ2UgZGl2XHJcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudVBhcmVudCA9IHRhcmdldCEuY2xvc2VzdChgZGl2YCk7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBmdWxsIHRleHQgb2YgdGhlIG1lc3NhZ2UgZGl2XHJcbiAgICAgICAgICAgIGxldCBnaWZ0TWVzc2FnZSA9IHNiTWVudVBhcmVudCEuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAvL2Zvcm1hdCBtZXNzYWdlIHdpdGggc3RhbmRhcmQgdGV4dCArIG1lc3NhZ2UgY29udGVudHMgKyBzZXJ2ZXIgdGltZSBvZiB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICBnaWZ0TWVzc2FnZSA9XHJcbiAgICAgICAgICAgICAgICBgU2VudCBvbiBTaG91dGJveCBtZXNzYWdlOiBcImAgK1xyXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKGdpZnRNZXNzYWdlLmluZGV4T2YoJzogJykgKyAyKSArXHJcbiAgICAgICAgICAgICAgICBgXCIgYXQgYCArXHJcbiAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZS5zdWJzdHJpbmcoMCwgOCk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHRhcmdldCBvZiB0aGUgY2xpY2sgaXMgbm90IHRoZSBUcmlwbGUgRG90IE1lbnUgT1JcclxuICAgICAgICAgICAgLy9pZiBtZW51IGlzIG9uZSBvZiB5b3VyIG93biBjb21tZW50cyAob25seSB3b3JrcyBmb3IgZmlyc3QgMTAgbWludXRlcyBvZiBjb21tZW50IGJlaW5nIHNlbnQpXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICF0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51JykgfHxcclxuICAgICAgICAgICAgICAgIHNiTWVudUVsZW0hLmdldEF0dHJpYnV0ZSgnZGF0YS1lZScpISA9PT0gJzEnXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBNZW51IGFmdGVyIGl0IHBvcHMgdXBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIEdpZnQgQnV0dG9uLi4uYCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcHVwTWVudTogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudU1haW4nKTtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCg1KTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXBvcHVwTWVudSEuaGFzQ2hpbGROb2RlcygpKTtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIHVzZXIgZGV0YWlscyBmcm9tIHRoZSBwb3B1cCBtZW51IGRldGFpbHNcclxuICAgICAgICAgICAgY29uc3QgcG9wdXBVc2VyOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0pO1xyXG4gICAgICAgICAgICAvL21ha2UgdXNlcm5hbWUgZXF1YWwgdGhlIGRhdGEtdWlkLCBmb3JjZSBub3QgbnVsbFxyXG4gICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogU3RyaW5nID0gcG9wdXBVc2VyIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdWlkJykhO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxyXG4gICAgICAgICAgICBsZXQgZ2lmdFZhbHVlU2V0dGluZzogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ3VzZXJHaWZ0RGVmYXVsdF92YWwnKTtcclxuICAgICAgICAgICAgLy9pZiB0aGV5IGRpZCBub3Qgc2V0IGEgdmFsdWUgaW4gcHJlZmVyZW5jZXMsIHNldCB0byAxMDBcclxuICAgICAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICBpc05hTihOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAwJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBIVE1MIGRvY3VtZW50IHRoYXQgaG9sZHMgdGhlIGJ1dHRvbiBhbmQgdmFsdWUgdGV4dFxyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QnV0dG9uOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24uc2V0QXR0cmlidXRlKCdpZCcsICdnaWZ0QnV0dG9uJyk7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBidXR0b24gZWxlbWVudCBhcyB3ZWxsIGFzIGEgdGV4dCBlbGVtZW50IGZvciB2YWx1ZSBvZiBnaWZ0LiBQb3B1bGF0ZSB3aXRoIHZhbHVlIGZyb20gc2V0dGluZ3NcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5pbm5lckhUTUwgPSBgPGJ1dHRvbj5HaWZ0OiA8L2J1dHRvbj48c3Bhbj4mbmJzcDs8L3NwYW4+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgc2l6ZT1cIjNcIiBpZD1cIm1wX2dpZnRWYWx1ZVwiIHRpdGxlPVwiVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAwXCIgdmFsdWU9XCIke2dpZnRWYWx1ZVNldHRpbmd9XCI+YDtcclxuICAgICAgICAgICAgLy9hZGQgZ2lmdCBlbGVtZW50IHdpdGggYnV0dG9uIGFuZCB0ZXh0IHRvIHRoZSBtZW51XHJcbiAgICAgICAgICAgIHBvcHVwTWVudSEuY2hpbGROb2Rlc1swXS5hcHBlbmRDaGlsZChnaWZ0QnV0dG9uKTtcclxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHdoZW4gZ2lmdCBidXR0b24gaXMgY2xpY2tlZFxyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vcHVsbCB3aGF0ZXZlciB0aGUgZmluYWwgdmFsdWUgb2YgdGhlIHRleHQgYm94IGVxdWFsc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcclxuICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIC8vYmVnaW4gc2V0dGluZyB1cCB0aGUgR0VUIHJlcXVlc3QgdG8gTUFNIEpTT05cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRIVFRQID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgcmVzdWx0cyB3aXRoIHRoZSBhbW91bnQgZW50ZXJlZCBieSB1c2VyIHBsdXMgdGhlIHVzZXJuYW1lIGZvdW5kIG9uIHRoZSBtZW51IHNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAvL2FkZGVkIG1lc3NhZ2UgY29udGVudHMgZW5jb2RlZCB0byBwcmV2ZW50IHVuaW50ZW5kZWQgY2hhcmFjdGVycyBmcm9tIGJyZWFraW5nIEpTT04gVVJMXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0RmluYWxBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfSZtZXNzYWdlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlXHJcbiAgICAgICAgICAgICAgICApfWA7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnaWZ0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShnaWZ0SFRUUC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBsaW5lIGluIFNCIHRoYXQgc2hvd3MgZ2lmdCB3YXMgc3VjY2Vzc2Z1bCB0byBhY2tub3dsZWRnZSBnaWZ0IHdvcmtlZC9mYWlsZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2dpZnRTdGF0dXNFbGVtJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNiZkRpdkNoaWxkIS5hcHBlbmRDaGlsZChuZXdEaXYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBnaWZ0IHN1Y2NlZWRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbi5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWNjZXNzTXNnID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BvaW50cyBHaWZ0IFN1Y2Nlc3NmdWw6IFZhbHVlOiAnICsgZ2lmdEZpbmFsQW1vdW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKHN1Y2Nlc3NNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoJ21wX3N1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhaWxlZE1zZyA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiAnICsganNvbi5lcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5hcHBlbmRDaGlsZChmYWlsZWRNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoJ21wX2ZhaWwnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FmdGVyIHdlIGFkZCBsaW5lIGluIFNCLCBzY3JvbGwgdG8gYm90dG9tIHRvIHNob3cgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL2FmdGVyIHdlIGFkZCBsaW5lIGluIFNCLCBzY3JvbGwgdG8gYm90dG9tIHRvIHNob3cgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLnNlbmQoKTtcclxuICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRvIG1haW4gU0Igd2luZG93IGFmdGVyIGdpZnQgaXMgY2xpY2tlZCAtIHRoZXNlIGFyZSB0d28gc3RlcHMgdGFrZW4gYnkgTUFNIHdoZW4gY2xpY2tpbmcgb3V0IG9mIE1lbnVcclxuICAgICAgICAgICAgICAgIHNiZkRpdlxyXG4gICAgICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzYl9jbGlja2VkX3JvdycpWzBdIVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50QnlJZCgnc2JNZW51TWFpbicpIVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3NiQm90dG9tIGhpZGVNZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpIS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlVG9OdW1iZXI6IFN0cmluZyA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRWYWx1ZScpXHJcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcclxuICAgICAgICAgICAgICAgICAgICBpc05hTihOdW1iZXIodmFsdWVUb051bWJlcikpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBHaWZ0IEJ1dHRvbiBhZGRlZCFgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgUmVwbHkgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XHJcbiAqL1xyXG5jbGFzcyBSZXBseVNpbXBsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyZXBseVNpbXBsZScsXHJcbiAgICAgICAgLy90YWc6IFwiUmVwbHlcIixcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgUmVwbHkgYnV0dG9uIGluIFNob3V0Ym94OiAmIzEwNTU0O2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcmVwbHlTaW1wbGU6IG51bWJlciA9IDE7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94UmVwbHkodGhpcy5fdGFyLCB0aGlzLl9yZXBseVNpbXBsZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFJlcGx5IEJ1dHRvbi4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBSZXBseSBXaXRoIFF1b3RlIGJ1dHRvbiB0byBiZSBhZGRlZCB0byBTaG91dFxyXG4gKi9cclxuY2xhc3MgUmVwbHlRdW90ZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyZXBseVF1b3RlJyxcclxuICAgICAgICAvL3RhZzogXCJSZXBseSBXaXRoIFF1b3RlXCIsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIFJlcGx5IHdpdGggUXVvdGUgYnV0dG9uIGluIFNob3V0Ym94OiAmIzEwNTU3O2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcmVwbHlRdW90ZTogbnVtYmVyID0gMjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3hSZXBseSh0aGlzLl90YXIsIHRoaXMuX3JlcGx5UXVvdGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBSZXBseSB3aXRoIFF1b3RlIEJ1dHRvbi4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgZmVhdHVyZSBmb3IgYnVpbGRpbmcgYSBsaWJyYXJ5IG9mIHF1aWNrIHNob3V0IGl0ZW1zIHRoYXQgY2FuIGFjdCBhcyBhIGNvcHkvcGFzdGUgcmVwbGFjZW1lbnQuXHJcbiAqL1xyXG5jbGFzcyBRdWlja1Nob3V0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3F1aWNrU2hvdXQnLFxyXG4gICAgICAgIGRlc2M6IGBDcmVhdGUgZmVhdHVyZSBiZWxvdyBzaG91dGJveCB0byBzdG9yZSBwcmUtc2V0IG1lc3NhZ2VzLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBRdWljayBTaG91dCBCdXR0b25zLi4uYCk7XHJcbiAgICAgICAgLy9nZXQgdGhlIG1haW4gc2hvdXRib3ggaW5wdXQgZmllbGRcclxuICAgICAgICBjb25zdCByZXBseUJveCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XHJcbiAgICAgICAgLy9lbXB0eSBKU09OIHdhcyBnaXZpbmcgbWUgaXNzdWVzLCBzbyBkZWNpZGVkIHRvIGp1c3QgbWFrZSBhbiBpbnRybyBmb3Igd2hlbiB0aGUgR00gdmFyaWFibGUgaXMgZW1wdHlcclxuICAgICAgICBsZXQganNvbkxpc3QgPSBKU09OLnBhcnNlKFxyXG4gICAgICAgICAgICBgeyBcIkludHJvXCI6XCJXZWxjb21lIHRvIFF1aWNrU2hvdXQgTUFNK2VyISBIZXJlIHlvdSBjYW4gY3JlYXRlIHByZXNldCBTaG91dCBtZXNzYWdlcyBmb3IgcXVpY2sgcmVzcG9uc2VzIGFuZCBrbm93bGVkZ2Ugc2hhcmluZy4gJ0NsZWFyJyBjbGVhcnMgdGhlIGVudHJ5IHRvIHN0YXJ0IHNlbGVjdGlvbiBwcm9jZXNzIG92ZXIuICdTZWxlY3QnIHRha2VzIHdoYXRldmVyIFF1aWNrU2hvdXQgaXMgaW4gdGhlIFRleHRBcmVhIGFuZCBwdXRzIGluIHlvdXIgU2hvdXQgcmVzcG9uc2UgYXJlYS4gJ1NhdmUnIHdpbGwgc3RvcmUgdGhlIFNlbGVjdGlvbiBOYW1lIGFuZCBUZXh0IEFyZWEgQ29tYm8gZm9yIGZ1dHVyZSB1c2UgYXMgYSBRdWlja1Nob3V0LCBhbmQgaGFzIGNvbG9yIGluZGljYXRvcnMuIEdyZWVuID0gc2F2ZWQgYXMtaXMuIFllbGxvdyA9IFF1aWNrU2hvdXQgTmFtZSBleGlzdHMgYW5kIGlzIHNhdmVkLCBidXQgY29udGVudCBkb2VzIG5vdCBtYXRjaCB3aGF0IGlzIHN0b3JlZC4gT3JhbmdlID0gbm8gZW50cnkgbWF0Y2hpbmcgdGhhdCBuYW1lLCBub3Qgc2F2ZWQuICdEZWxldGUnIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIHRoYXQgZW50cnkgZnJvbSB5b3VyIHN0b3JlZCBRdWlja1Nob3V0cyAoYnV0dG9uIG9ubHkgc2hvd3Mgd2hlbiBleGlzdHMgaW4gc3RvcmFnZSkuIEZvciBuZXcgZW50cmllcyBoYXZlIHlvdXIgUXVpY2tTaG91dCBOYW1lIHR5cGVkIGluIEJFRk9SRSB5b3UgY3JhZnQgeW91ciB0ZXh0IG9yIHJpc2sgaXQgYmVpbmcgb3ZlcndyaXR0ZW4gYnkgc29tZXRoaW5nIHRoYXQgZXhpc3RzIGFzIHlvdSB0eXBlIGl0LiBUaGFua3MgZm9yIHVzaW5nIE1BTSshXCIgfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vZ2V0IFNob3V0Ym94IERJVlxyXG4gICAgICAgIGNvbnN0IHNob3V0Qm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZwU2hvdXQnKTtcclxuICAgICAgICAvL2dldCB0aGUgZm9vdGVyIHdoZXJlIHdlIHdpbGwgaW5zZXJ0IG91ciBmZWF0dXJlXHJcbiAgICAgICAgY29uc3Qgc2hvdXRGb290ID0gPEhUTUxFbGVtZW50PnNob3V0Qm94IS5xdWVyeVNlbGVjdG9yKCcuYmxvY2tGb290Jyk7XHJcbiAgICAgICAgLy9naXZlIGl0IGFuIElEIGFuZCBzZXQgdGhlIHNpemVcclxuICAgICAgICBzaG91dEZvb3QhLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfYmxvY2tGb290Jyk7XHJcbiAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xyXG4gICAgICAgIC8vY3JlYXRlIGEgbmV3IGRpdmUgdG8gaG9sZCBvdXIgY29tYm9Cb3ggYW5kIGJ1dHRvbnMgYW5kIHNldCB0aGUgc3R5bGUgZm9yIGZvcm1hdHRpbmdcclxuICAgICAgICBjb25zdCBjb21ib0JveERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnLjVlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luVG9wID0gJy41ZW0nO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBsYWJlbCB0ZXh0IGVsZW1lbnQgYW5kIGFkZCB0aGUgdGV4dCBhbmQgYXR0cmlidXRlcyBmb3IgSURcclxuICAgICAgICBjb25zdCBjb21ib0JveExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgJ3F1aWNrU2hvdXREYXRhJyk7XHJcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5pbm5lclRleHQgPSAnQ2hvb3NlIGEgUXVpY2tTaG91dCc7XHJcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94TGFiZWwnKTtcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgaW5wdXQgZmllbGQgdG8gbGluayB0byBkYXRhbGlzdCBhbmQgZm9ybWF0IHN0eWxlXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zdHlsZS5tYXJnaW5MZWZ0ID0gJy41ZW0nO1xyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuc2V0QXR0cmlidXRlKCdsaXN0JywgJ21wX2NvbWJvQm94TGlzdCcpO1xyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveElucHV0Jyk7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBkYXRhbGlzdCB0byBzdG9yZSBvdXIgcXVpY2tzaG91dHNcclxuICAgICAgICBjb25zdCBjb21ib0JveExpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRhbGlzdCcpO1xyXG4gICAgICAgIGNvbWJvQm94TGlzdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94TGlzdCcpO1xyXG4gICAgICAgIC8vaWYgdGhlIEdNIHZhcmlhYmxlIGV4aXN0c1xyXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcpKSB7XHJcbiAgICAgICAgICAgIC8vb3ZlcndyaXRlIGpzb25MaXN0IHZhcmlhYmxlIHdpdGggcGFyc2VkIGRhdGFcclxuICAgICAgICAgICAganNvbkxpc3QgPSBKU09OLnBhcnNlKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpO1xyXG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IE9wdGlvbiBlbGVtZW50IGFuZCBhZGQgb3VyIGRhdGEgZm9yIGRpc3BsYXkgdG8gdXNlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vaWYgbm8gR00gdmFyaWFibGVcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSB2YXJpYWJsZSB3aXRoIG91dCBJbnRybyBkYXRhXHJcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcclxuICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaXRlbVxyXG4gICAgICAgICAgICAvLyBUT0RPOiBwcm9iYWJseSBjYW4gZ2V0IHJpZCBvZiB0aGUgZm9yRWFjaCBhbmQganVzdCBkbyBzaW5nbGUgZXhlY3V0aW9uIHNpbmNlIHdlIGtub3cgdGhpcyBpcyBJbnRybyBvbmx5XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9hcHBlbmQgdGhlIGFib3ZlIGVsZW1lbnRzIHRvIG91ciBESVYgZm9yIHRoZSBjb21ibyBib3hcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveExhYmVsKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveElucHV0KTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveExpc3QpO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBjbGVhciBidXR0b24gYW5kIGFkZCBzdHlsZVxyXG4gICAgICAgIGNvbnN0IGNsZWFyQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgY2xlYXJCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIGNsZWFyQnV0dG9uLmlubmVySFRNTCA9ICdDbGVhcic7XHJcbiAgICAgICAgLy9jcmVhdGUgZGVsZXRlIGJ1dHRvbiwgYWRkIHN0eWxlLCBhbmQgdGhlbiBoaWRlIGl0IGZvciBsYXRlciB1c2VcclxuICAgICAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICc2ZW0nO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnUmVkJztcclxuICAgICAgICBkZWxldGVCdXR0b24uaW5uZXJIVE1MID0gJ0RFTEVURSc7XHJcbiAgICAgICAgLy9jcmVhdGUgc2VsZWN0IGJ1dHRvbiBhbmQgc3R5bGUgaXRcclxuICAgICAgICBjb25zdCBzZWxlY3RCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBzZWxlY3RCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5pbm5lckhUTUwgPSAnXFx1MjE5MSBTZWxlY3QnO1xyXG4gICAgICAgIC8vY3JlYXRlIHNhdmUgYnV0dG9uIGFuZCBzdHlsZSBpdFxyXG4gICAgICAgIGNvbnN0IHNhdmVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBzYXZlQnV0dG9uLmlubmVySFRNTCA9ICdTYXZlJztcclxuICAgICAgICAvL2FkZCBhbGwgNCBidXR0b25zIHRvIHRoZSBjb21ib0JveCBESVZcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjbGVhckJ1dHRvbik7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoc2VsZWN0QnV0dG9uKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzYXZlQnV0dG9uKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChkZWxldGVCdXR0b24pO1xyXG4gICAgICAgIC8vY3JlYXRlIG91ciB0ZXh0IGFyZWEgYW5kIHN0eWxlIGl0LCB0aGVuIGhpZGUgaXRcclxuICAgICAgICBjb25zdCBxdWlja1Nob3V0VGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuaGVpZ2h0ID0gJzUwJSc7XHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUubWFyZ2luID0gJzFlbSc7XHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUud2lkdGggPSAnOTclJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5pZCA9ICdtcF9xdWlja1Nob3V0VGV4dCc7XHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICAgICAgLy9leGVjdXRlcyB3aGVuIGNsaWNraW5nIHNlbGVjdCBidXR0b25cclxuICAgICAgICBzZWxlY3RCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBzb21ldGhpbmcgaW5zaWRlIG9mIHRoZSBxdWlja3Nob3V0IGFyZWFcclxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcHV0IHRoZSB0ZXh0IGluIHRoZSBtYWluIHNpdGUgcmVwbHkgZmllbGQgYW5kIGZvY3VzIG9uIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBxdWlja1Nob3V0VGV4dC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vY3JlYXRlIGEgcXVpY2tTaG91dCBkZWxldGUgYnV0dG9uXHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBub3QgdGhlIGxhc3QgcXVpY2tTaG91dFxyXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGpzb25MaXN0KS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVudHJ5IGZyb20gdGhlIEpTT04gYW5kIHVwZGF0ZSB0aGUgR00gdmFyaWFibGUgd2l0aCBuZXcganNvbiBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldO1xyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiBmb3IgbmV3IHVuc2F2ZWQgc3RhdHVzXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgbm90IGEgc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgb3B0aW9ucyBmcm9tIGRhdGFsaXN0IHRvIHJlc2V0IHdpdGggbmV3bHkgY3JlYXRlZCBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGl0ZW0gaW4gbmV3IGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25ldyBvcHRpb24gZWxlbWVudCB0byBhZGQgdG8gbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0aGUgY3VycmVudCBrZXkgdmFsdWUgdG8gdGhlIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIGVsZW1lbnQgdG8gdGhlIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGpzb25saXN0XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGl0ZW0gZnJvbSBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoL+CyoC9nLCAn4LKgJyldO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGVudGlyZSB2YXJpYWJsZSBzbyBpdHMgbm90IGVtcHR5IEdNIHZhcmlhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX3F1aWNrU2hvdXQnKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiBmb3IgbmV3IHVuc2F2ZWQgc3RhdHVzXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgbm90IGEgc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGlucHV0IGV2ZW50IG9uIGlucHV0IHRvIGZvcmNlIHNvbWUgdXBkYXRlcyBhbmQgZGlzcGF0Y2ggaXRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hJbnB1dC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL2NyZWF0ZSBldmVudCBvbiBzYXZlIGJ1dHRvbiB0byBzYXZlIHF1aWNrc2hvdXRcclxuICAgICAgICBzYXZlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgZGF0YSBpbiB0aGUga2V5IGFuZCB2YWx1ZSBHVUkgZmllbGRzLCBwcm9jZWVkXHJcbiAgICAgICAgICAgICAgICBpZiAocXVpY2tTaG91dFRleHQudmFsdWUgJiYgY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vd2FzIGhhdmluZyBpc3N1ZSB3aXRoIGV2YWwgcHJvY2Vzc2luZyB0aGUgLnJlcGxhY2UgZGF0YSBzbyBtYWRlIGEgdmFyaWFibGUgdG8gaW50YWtlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZWRUZXh0ID0gY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKTtcclxuICAgICAgICAgICAgICAgICAgICAvL2Z1biB3YXkgdG8gZHluYW1pY2FsbHkgY3JlYXRlIHN0YXRlbWVudHMgLSB0aGlzIHRha2VzIHdoYXRldmVyIGlzIGluIGxpc3QgZmllbGQgdG8gY3JlYXRlIGEga2V5IHdpdGggdGhhdCB0ZXh0IGFuZCB0aGUgdmFsdWUgZnJvbSB0aGUgdGV4dGFyZWFcclxuICAgICAgICAgICAgICAgICAgICBldmFsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBganNvbkxpc3QuYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlZFRleHQgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYD0gXCJgICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChxdWlja1Nob3V0VGV4dC52YWx1ZSkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYFwiO2BcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vb3ZlcndyaXRlIG9yIGNyZWF0ZSB0aGUgR00gdmFyaWFibGUgd2l0aCBuZXcganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSBzYXZlIGJ1dHRvbiB0byBncmVlbiBub3cgdGhhdCBpdHMgc2F2ZWQgYXMtaXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vc2hvdyBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBhIHNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBleGlzdGluZyBkYXRhbGlzdCBlbGVtZW50cyB0byByZWJ1aWxkIHdpdGggbmV3IGpzb25saXN0XHJcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGluIHRoZSBqc29ubGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgbmV3IG9wdGlvbiBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIGtleSBuYW1lIHRvIHRoZSBvcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVE9ETzogdGhpcyBtYXkgb3IgbWF5IG5vdCBiZSBuZWNlc3NhcnksIGJ1dCB3YXMgaGF2aW5nIGlzc3VlcyB3aXRoIHRoZSB1bmlxdWUgc3ltYm9sIHN0aWxsIHJhbmRvbWx5IHNob3dpbmcgdXAgYWZ0ZXIgc2F2ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBjb21ib0JveE9wdGlvbi52YWx1ZS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdG8gdGhlIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY29tYm9Cb3hPcHRpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL2FkZCBldmVudCBmb3IgY2xlYXIgYnV0dG9uIHRvIHJlc2V0IHRoZSBkYXRhbGlzdFxyXG4gICAgICAgIGNsZWFyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY2xlYXIgdGhlIGlucHV0IGZpZWxkIGFuZCB0ZXh0YXJlYSBmaWVsZFxyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPSAnJztcclxuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGlucHV0IGV2ZW50IG9uIGlucHV0IHRvIGZvcmNlIHNvbWUgdXBkYXRlcyBhbmQgZGlzcGF0Y2ggaXRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEV2ZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hJbnB1dC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL05leHQgdHdvIGlucHV0IGZ1bmN0aW9ucyBhcmUgbWVhdCBhbmQgcG90YXRvZXMgb2YgdGhlIGxvZ2ljIGZvciB1c2VyIGZ1bmN0aW9uYWxpdHlcclxuXHJcbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgY2hhbmdlZCB3aGl0aGluIHRoZSBpbnB1dCBmaWVsZFxyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2lucHV0JyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiBpbnB1dCBpcyBibGFua1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgdGV4dGFyZWEgaXMgYWxzbyBibGFuayBtaW5pbWl6ZSByZWFsIGVzdGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcXVpY2tTaG91dFRleHQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9oaWRlIHRoZSB0ZXh0IGFyZWFcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zaHJpbmsgdGhlIGZvb3RlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcyLjVlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIHRvIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHNvbWV0aGluZyBpcyBzdGlsbCBpbiB0aGUgdGV4dGFyZWEgd2UgbmVlZCB0byBpbmRpY2F0ZSB0aGF0IHVuc2F2ZWQgYW5kIHVubmFtZWQgZGF0YSBpcyB0aGVyZVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3R5bGUgZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWQgaXMgb3JnYW5nZSBzYXZlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9laXRoZXIgd2F5LCBoaWRlIHRoZSBkZWxldGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBpbnB1dCBmaWVsZCBoYXMgYW55IHRleHQgaW4gaXRcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3Nob3cgdGhlIHRleHQgYXJlYSBmb3IgaW5wdXRcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9leHBhbmQgdGhlIGZvb3RlciB0byBhY2NvbW9kYXRlIGFsbCBmZWF0dXJlIGFzcGVjdHNcclxuICAgICAgICAgICAgICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcxMWVtJztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHdoYXQgaXMgaW4gdGhlIGlucHV0IGZpZWxkIGlzIGEgc2F2ZWQgZW50cnkga2V5XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25MaXN0W2lucHV0VmFsXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMgY2FuIGJlIGEgc3Vja3kgbGluZSBvZiBjb2RlIGJlY2F1c2UgaXQgY2FuIHdpcGUgb3V0IHVuc2F2ZWQgZGF0YSwgYnV0IGkgY2Fubm90IHRoaW5rIG9mIGJldHRlciB3YXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXBsYWNlIHRoZSB0ZXh0IGFyZWEgY29udGVudHMgd2l0aCB3aGF0IHRoZSB2YWx1ZSBpcyBpbiB0aGUgbWF0Y2hlZCBwYWlyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0ganNvbkxpc3RbSlNPTi5wYXJzZShpbnB1dFZhbCldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSBkZWxldGUgYnV0dG9uIHNpbmNlIHRoaXMgaXMgbm93IGV4YWN0IG1hdGNoIHRvIHNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBzaG93IGl0cyBhIHNhdmVkIGNvbWJvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgbm90IGEgcmVnaXN0ZXJlZCBrZXkgbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSB0aGUgc2F2ZSBidXR0b24gdG8gYmUgYW4gdW5zYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9oaWRlIHRoZSBkZWxldGUgYnV0dG9uIHNpbmNlIHRoaXMgY2Fubm90IGJlIHNhdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL3doZW5ldmVyIHNvbWV0aGluZyBpcyB0eXBlZCBvciBkZWxldGVkIG91dCBvZiB0ZXh0YXJlYVxyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdpbnB1dCcsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBpbnB1dCBmaWVsZCBpcyBibGFua1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9pZiBpbnB1dCBmaWVsZCBoYXMgdGV4dCBpbiBpdFxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbaW5wdXRWYWxdICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgIT09IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gYXMgeWVsbG93IGZvciBlZGl0dGVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnWWVsbG93JztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBhIG1hdGNoIGFuZCB0aGUgZGF0YSBpcyBhIG1hdGNoIHRoZW4gd2UgaGF2ZSBhIDEwMCUgc2F2ZWQgZW50cnkgYW5kIGNhbiBwdXQgZXZlcnl0aGluZyBiYWNrIHRvIHNhdmVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2lucHV0VmFsXSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID09PSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIHRvIGdyZWVuIGZvciBzYXZlZFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBrZXkgaXMgbm90IGZvdW5kIGluIHRoZSBzYXZlZCBsaXN0LCBvcmFuZ2UgZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWpzb25MaXN0W2lucHV0VmFsXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2FkZCB0aGUgY29tYm9ib3ggYW5kIHRleHQgYXJlYSBlbGVtZW50cyB0byB0aGUgZm9vdGVyXHJcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKGNvbWJvQm94RGl2KTtcclxuICAgICAgICBzaG91dEZvb3QuYXBwZW5kQ2hpbGQocXVpY2tTaG91dFRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLyoqXHJcbiAqICNCUk9XU0UgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgU25hdGNoZWQgdG9ycmVudHMgdG8gYmUgaGlkZGVuL3Nob3duXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVTbmF0Y2hlZCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU25hdGNoZWQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gaGlkZS9zaG93IHJlc3VsdHMgdGhhdCB5b3UndmUgc25hdGNoZWRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfaXNWaXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9zbmF0Y2hlZEhvb2s6IHN0cmluZyA9ICd0ZCBkaXZbY2xhc3NePVwiYnJvd3NlXCJdJztcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgdG9nZ2xlOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PjtcclxuICAgICAgICBsZXQgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PjtcclxuICAgICAgICBjb25zdCBzdG9yZWRTdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChzdG9yZWRTdGF0ZSA9PT0gJ2ZhbHNlJyAmJiBHTV9nZXRWYWx1ZSgnc3RpY2t5U25hdGNoZWRUb2dnbGUnKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0b2dnbGVUZXh0OiBzdHJpbmcgPSB0aGlzLl9pc1Zpc2libGUgPyAnSGlkZSBTbmF0Y2hlZCcgOiAnU2hvdyBTbmF0Y2hlZCc7XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICh0b2dnbGUgPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdzbmF0Y2hlZFRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVUZXh0LFxyXG4gICAgICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBiYXNlZCBvbiB2aXMgc3RhdGVcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNWaXNpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ1Nob3cgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXN1bHRMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFRvZ2dsZSBTbmF0Y2hlZCBidXR0b24hJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIGxpc3QgYSBzZWFyY2ggcmVzdWx0cyBsaXN0XHJcbiAgICAgKiBAcGFyYW0gc3ViVGFyIHRoZSBlbGVtZW50cyB0aGF0IG11c3QgYmUgY29udGFpbmVkIGluIG91ciBmaWx0ZXJlZCByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ZpbHRlclJlc3VsdHMobGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Piwgc3ViVGFyOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBsaXN0LmZvckVhY2goKHNuYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxIZWFkaW5nRWxlbWVudCA9IDxIVE1MSGVhZGluZ0VsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3NuYXRjaGVkVG9nZ2xlJykhXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWxlY3Qgb25seSB0aGUgaXRlbXMgdGhhdCBtYXRjaCBvdXIgc3ViIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc25hdGNoLnF1ZXJ5U2VsZWN0b3Ioc3ViVGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhpZGUvc2hvdyBhcyByZXF1aXJlZFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ1Nob3cgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlLXJvdyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRWaXNTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NuYXRjaCB2aXMgc3RhdGU6JywgdGhpcy5faXNWaXNpYmxlLCAnXFxudmFsOicsIHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xyXG4gICAgICAgIHRoaXMuX2lzVmlzaWJsZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNlYXJjaExpc3QoKTogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXJjaGxpc3QgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc1Zpc2libGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZpc2libGUodmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbWVtYmVycyB0aGUgc3RhdGUgb2YgVG9nZ2xlU25hdGNoZWQgYmV0d2VlbiBwYWdlIGxvYWRzXHJcbiAqL1xyXG5jbGFzcyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc3RpY2t5U25hdGNoZWRUb2dnbGUnLFxyXG4gICAgICAgIGRlc2M6IGBNYWtlIHRvZ2dsZSBzdGF0ZSBwZXJzaXN0IGJldHdlZW4gcGFnZSBsb2Fkc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBSZW1lbWJlcmVkIHNuYXRjaCB2aXNpYmlsaXR5IHN0YXRlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHNcclxuICovXHJcbmNsYXNzIFBsYWludGV4dFNlYXJjaCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0U2VhcmNoJyxcclxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyBhdCB0b3Agb2YgcGFnZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NzciBoMSc7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICk7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGxldCB0b2dnbGVCdG46IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcclxuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PjtcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICh0b2dnbGVCdG4gPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAnI3NzcicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ21wX3RvZ2dsZSBtcF9wbGFpbkJ0bidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvcHkgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdtcF9jb3B5IG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBwbGFpbnRleHQgYm94XHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGA8YnI+PHRleHRhcmVhIGNsYXNzPSdtcF9wbGFpbnRleHRTZWFyY2gnIHN0eWxlPSdkaXNwbGF5OiBub25lJz48L3RleHRhcmVhPmBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCBvcGVuIHN0YXRlXHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCB0b2dnbGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICB0b2dnbGVCdG5cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHRib3ggc2hvdWxkIGV4aXN0LCBidXQganVzdCBpbiBjYXNlLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ0hpZGUgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBPcGVuIFN0YXRlIHRvIHRydWUvZmFsc2UgaW50ZXJuYWxseSBhbmQgaW4gc2NyaXB0IHN0b3JhZ2VcclxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zZXRPcGVuU3RhdGUodmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhbCA9ICdmYWxzZSc7XHJcbiAgICAgICAgfSAvLyBEZWZhdWx0IHZhbHVlXHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3RvZ2dsZVNuYXRjaGVkU3RhdGUnLCB2YWwpO1xyXG4gICAgICAgIHRoaXMuX2lzT3BlbiA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9wcm9jZXNzUmVzdWx0cyhcclxuICAgICAgICByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+XHJcbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXHJcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzZXJpZXNUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IHRoZSBpbXBvcnRhbnQgZGF0YSBmcm9tIGVhY2ggbm9kZVxyXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLmF1dGhvcidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcubmFycmF0b3InXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmF3VGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xyXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGxhc3Qgc2VyaWVzLCB0aGVuIHN0eWxlXHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcclxuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9ICdCWSAnO1xyXG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcclxuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9ICdGVCAnO1xyXG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3V0cDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzT3BlbigpOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNPcGVuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBpc09wZW4odmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHZhbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgdGhlIHNlYXJjaCBmZWF0dXJlcyB0byBiZSBoaWRkZW4vc2hvd25cclxuICovXHJcbmNsYXNzIFRvZ2dsZVNlYXJjaGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU2VhcmNoYm94JyxcclxuICAgICAgICBkZXNjOiBgQ29sbGFwc2UgdGhlIFNlYXJjaCBib3ggYW5kIG1ha2UgaXQgdG9nZ2xlYWJsZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclNlYXJjaENvbnRyb2wnO1xyXG4gICAgcHJpdmF0ZSBfaGVpZ2h0OiBzdHJpbmcgPSAnMjZweCc7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgPSAnZmFsc2UnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3Qgc2VhcmNoYm94OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgaWYgKHNlYXJjaGJveCkge1xyXG4gICAgICAgICAgICAvLyBBZGp1c3QgdGhlIHRpdGxlIHRvIG1ha2UgaXQgY2xlYXIgaXQgaXMgYSB0b2dnbGUgYnV0dG9uXHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBzZWFyY2hib3gucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcuYmxvY2tIZWFkQ29uIGg0J1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAodGl0bGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIEFkanVzdCB0ZXh0ICYgc3R5bGVcclxuICAgICAgICAgICAgICAgIHRpdGxlLmlubmVySFRNTCA9ICdUb2dnbGUgU2VhcmNoJztcclxuICAgICAgICAgICAgICAgIHRpdGxlLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgdGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9nZ2xlKHNlYXJjaGJveCEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3Qgc2V0IHVwIHRvZ2dsZSEgVGFyZ2V0IGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ29sbGFwc2UgdGhlIHNlYXJjaGJveFxyXG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoYm94LCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZTogYGhlaWdodDoke3RoaXMuX2hlaWdodH07b3ZlcmZsb3c6aGlkZGVuO2AsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBIaWRlIGV4dHJhIHRleHRcclxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMydcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgZ3VpZGVMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJyNtYWluQm9keSA+IGgzIH4gYSdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbikgbm90aWZpY2F0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGlmIChndWlkZUxpbmspIGd1aWRlTGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29sbGFwc2VkIHRoZSBTZWFyY2ggYm94IScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBjb2xsYXBzZSBTZWFyY2ggYm94ISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfdG9nZ2xlKGVsZW06IEhUTUxEaXZFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlLmhlaWdodCA9ICd1bnNldCc7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9ICd0cnVlJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlLmhlaWdodCA9IHRoaXMuX2hlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ2ZhbHNlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnVG9nZ2xlZCBTZWFyY2ggYm94IScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogR2VuZXJhdGVzIGxpbmtlZCB0YWdzIGZyb20gdGhlIHNpdGUncyBwbGFpbnRleHQgdGFnIGZpZWxkXHJcbiAqL1xyXG5jbGFzcyBCdWlsZFRhZ3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2J1aWxkVGFncycsXHJcbiAgICAgICAgZGVzYzogYEdlbmVyYXRlIGNsaWNrYWJsZSBUYWdzIGF1dG9tYXRpY2FsbHlgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGxldCByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3NcclxuICAgICAgICByZXN1bHRzTGlzdFxyXG4gICAgICAgICAgICAudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEJ1aWx0IHRhZyBsaW5rcyEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdC50aGVuKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSB0YWdzIGFnYWluXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEJ1aWx0IHRhZyBsaW5rcyEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ29kZSB0byBydW4gZm9yIGV2ZXJ5IHNlYXJjaCByZXN1bHRcclxuICAgICAqIEBwYXJhbSByZXMgQSBzZWFyY2ggcmVzdWx0IHJvd1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9wcm9jZXNzVGFnU3RyaW5nID0gKHJlczogSFRNTFRhYmxlUm93RWxlbWVudCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhZ2xpbmUgPSA8SFRNTFNwYW5FbGVtZW50PnJlcy5xdWVyeVNlbGVjdG9yKCcudG9yUm93RGVzYycpO1xyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAodGFnbGluZSk7XHJcblxyXG4gICAgICAgIC8vIEFzc3VtZSBicmFja2V0cyBjb250YWluIHRhZ3NcclxuICAgICAgICBsZXQgdGFnU3RyaW5nID0gdGFnbGluZS5pbm5lckhUTUwucmVwbGFjZSgvKD86XFxbfFxcXXxcXCh8XFwpfCQpL2dpLCAnLCcpO1xyXG4gICAgICAgIC8vIFJlbW92ZSBIVE1MIEVudGl0aWVzIGFuZCB0dXJuIHRoZW0gaW50byBicmVha3NcclxuICAgICAgICB0YWdTdHJpbmcgPSB0YWdTdHJpbmcuc3BsaXQoLyg/OiYuezEsNX07KS9nKS5qb2luKCc7Jyk7XHJcbiAgICAgICAgLy8gU3BsaXQgdGFncyBhdCAnLCcgYW5kICc7JyBhbmQgJz4nIGFuZCAnfCdcclxuICAgICAgICBsZXQgdGFncyA9IHRhZ1N0cmluZy5zcGxpdCgvXFxzKig/Ojt8LHw+fFxcfHwkKVxccyovKTtcclxuICAgICAgICAvLyBSZW1vdmUgZW1wdHkgb3IgbG9uZyB0YWdzXHJcbiAgICAgICAgdGFncyA9IHRhZ3MuZmlsdGVyKCh0YWcpID0+IHRhZy5sZW5ndGggPD0gMzAgJiYgdGFnLmxlbmd0aCA+IDApO1xyXG4gICAgICAgIC8vIEFyZSB0YWdzIGFscmVhZHkgYWRkZWQ/IE9ubHkgYWRkIGlmIG51bGxcclxuICAgICAgICBjb25zdCB0YWdCb3g6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSByZXMucXVlcnlTZWxlY3RvcignLm1wX3RhZ3MnKTtcclxuICAgICAgICBpZiAodGFnQm94ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luamVjdExpbmtzKHRhZ3MsIHRhZ2xpbmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ3MpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICogSW5qZWN0cyB0aGUgZ2VuZXJhdGVkIHRhZ3NcclxuICAgICAqIEBwYXJhbSB0YWdzIEFycmF5IG9mIHRhZ3MgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzZWFyY2ggcmVzdWx0IHJvdyB0aGF0IHRoZSB0YWdzIHdpbGwgYmUgYWRkZWQgdG9cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaW5qZWN0TGlua3MgPSAodGFnczogc3RyaW5nW10sIHRhcjogSFRNTFNwYW5FbGVtZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAvLyBJbnNlcnQgdGhlIG5ldyB0YWcgcm93XHJcbiAgICAgICAgICAgIGNvbnN0IHRhZ1JvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgdGFnUm93LmNsYXNzTGlzdC5hZGQoJ21wX3RhZ3MnKTtcclxuICAgICAgICAgICAgdGFyLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCB0YWdSb3cpO1xyXG4gICAgICAgICAgICB0YXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGFnUm93Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICAgICAgLy8gQWRkIHRoZSB0YWdzIHRvIHRoZSB0YWcgcm93XHJcbiAgICAgICAgICAgIHRhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YWdSb3cuaW5uZXJIVE1MICs9IGA8YSBjbGFzcz0nbXBfdGFnJyBocmVmPScvdG9yL2Jyb3dzZS5waHA/dG9yJTVCdGV4dCU1RD0lMjIke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgICAgICB0YWdcclxuICAgICAgICAgICAgICAgICl9JTIyJnRvciU1QnNyY2hJbiU1RCU1QnRhZ3MlNUQ9dHJ1ZSc+JHt0YWd9PC9hPmA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmFuZG9tIEJvb2sgZmVhdHVyZSB0byBvcGVuIGEgbmV3IHRhYi93aW5kb3cgd2l0aCBhIHJhbmRvbSBNQU0gQm9va1xyXG4gKi9cclxuY2xhc3MgUmFuZG9tQm9vayBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmFuZG9tQm9vaycsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBvcGVuIGEgcmFuZG9tbHkgc2VsZWN0ZWQgYm9vayBwYWdlLiAoPGVtPlVzZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjYXRlZ29yeSBpbiB0aGUgZHJvcGRvd248L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IHJhbmRvOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBjb25zdCByYW5kb1RleHQ6IHN0cmluZyA9ICdSYW5kb20gQm9vayc7XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChyYW5kbyA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3JhbmRvbUJvb2snLFxyXG4gICAgICAgICAgICAgICAgcmFuZG9UZXh0LFxyXG4gICAgICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHJhbmRvXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY291bnRSZXN1bHQ6IFByb21pc2U8bnVtYmVyPjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhdGVnb3JpZXM6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgQ2F0ZWdvcnkgZHJvcGRvd24gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRTZWxlY3Rpb246IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXRlZ29yeVBhcnRpYWwnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdmFsdWUgY3VycmVudGx5IHNlbGVjdGVkIGluIENhdGVnb3J5IERyb3Bkb3duXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdFZhbHVlOiBzdHJpbmcgPSBjYXRTZWxlY3Rpb24hLm9wdGlvbnNbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRTZWxlY3Rpb24uc2VsZWN0ZWRJbmRleFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2RlcGVuZGluZyBvbiBjYXRlZ29yeSBzZWxlY3RlZCwgY3JlYXRlIGEgY2F0ZWdvcnkgc3RyaW5nIGZvciB0aGUgSlNPTiBHRVRcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcoY2F0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBTEwnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlZmF1bHRzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xMyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTUnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTYnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRWYWx1ZS5jaGFyQXQoMCkgPT09ICdjJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbY2F0XVtdPScgKyBjYXRWYWx1ZS5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb3VudFJlc3VsdCA9IHRoaXMuX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdGVnb3JpZXMpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50UmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoZ2V0UmFuZG9tUmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vcGVuIG5ldyB0YWIgd2l0aCB0aGUgcmFuZG9tIGJvb2tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdC8nICsgZ2V0UmFuZG9tUmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnX2JsYW5rJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgUmFuZG9tIEJvb2sgYnV0dG9uIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIGNhdCBhIHN0cmluZyBjb250YWluaW5nIHRoZSBjYXRlZ29yaWVzIG5lZWRlZCBmb3IgSlNPTiBHZXRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0OiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBqc29uUmVzdWx0OiBQcm9taXNlPHN0cmluZz47XHJcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdG9yL2pzL2xvYWRTZWFyY2hKU09OYmFzaWMucGhwP3RvcltzZWFyY2hUeXBlXT1hbGwmdG9yW3NlYXJjaEluXT10b3JyZW50cyR7Y2F0fSZ0b3JbcGVycGFnZV09NSZ0b3JbYnJvd3NlRmxhZ3NIaWRlVnNTaG93XT0wJnRvcltzdGFydERhdGVdPSZ0b3JbZW5kRGF0ZV09JnRvcltoYXNoXT0mdG9yW3NvcnRUeXBlXT1yYW5kb20mdGh1bWJuYWlsPXRydWU/JHtVdGlsLnJhbmRvbU51bWJlcihcclxuICAgICAgICAgICAgICAgIDEsXHJcbiAgICAgICAgICAgICAgICAxMDAwMDBcclxuICAgICAgICAgICAgKX1gO1xyXG4gICAgICAgICAgICBQcm9taXNlLmFsbChbKGpzb25SZXN1bHQgPSBVdGlsLmdldEpTT04odXJsKSldKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGpzb25SZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoanNvbkZ1bGwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXR1cm4gdGhlIGZpcnN0IHRvcnJlbnQgSUQgb2YgdGhlIHJhbmRvbSBKU09OIHRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGpzb25GdWxsKS5kYXRhWzBdLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjIFJFUVVFU1QgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuLyoqXHJcbiAqICogSGlkZSByZXF1ZXN0ZXJzIHdobyBhcmUgc2V0IHRvIFwiaGlkZGVuXCJcclxuICovXHJcbmNsYXNzIFRvZ2dsZUhpZGRlblJlcXVlc3RlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlSGlkZGVuUmVxdWVzdGVycycsXHJcbiAgICAgICAgZGVzYzogYEhpZGUgaGlkZGVuIHJlcXVlc3RlcnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JSb3dzJztcclxuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9oaWRlID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0aGlzLl9hZGRUb2dnbGVTd2l0Y2goKTtcclxuICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gYXdhaXQgdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xyXG5cclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIodGhpcy5fdGFyLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2FkZFRvZ2dsZVN3aXRjaCgpIHtcclxuICAgICAgICAvLyBNYWtlIGEgbmV3IGJ1dHRvbiBhbmQgaW5zZXJ0IGJlc2lkZSB0aGUgU2VhcmNoIGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAnc2hvd0hpZGRlbicsXHJcbiAgICAgICAgICAgICdTaG93IEhpZGRlbicsXHJcbiAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAnI3JlcXVlc3RTZWFyY2ggLnRvcnJlbnRTZWFyY2gnLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgbmV3IGJ1dHRvbiBhbmQgYWRkIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICBjb25zdCB0b2dnbGVTd2l0Y2g6IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3Nob3dIaWRkZW4nKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdG9nZ2xlU3dpdGNoLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5MaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcjdG9yUm93cyA+IC5tcF9oaWRkZW4nXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdG9nZ2xlU3dpdGNoLmlubmVyVGV4dCA9ICdIaWRlIEhpZGRlbic7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbGlzdC1pdGVtJztcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ1Nob3cgSGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGhpZGRlbkxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0KCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXF1ZXN0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyAudG9yUmlnaHQnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEdyYWIgYWxsIHJlcXVlc3RzXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXFMaXN0OlxyXG4gICAgICAgICAgICAgICAgICAgIHwgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PlxyXG4gICAgICAgICAgICAgICAgICAgIHwgbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHwgdW5kZWZpbmVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICAgICAnI3RvclJvd3MgLnRvclJvdydcclxuICAgICAgICAgICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmVxTGlzdCA9PT0gbnVsbCB8fCByZXFMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHJlcUxpc3QgaXMgJHtyZXFMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcUxpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pIHtcclxuICAgICAgICBsaXN0LmZvckVhY2goKHJlcXVlc3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdGVyOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSByZXF1ZXN0LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnLnRvclJpZ2h0IGEnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0ZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3Quc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIHJlcXVlc3QuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2YgcmVxdWVzdCByZXN1bHRzXHJcbiAqL1xyXG5jbGFzcyBQbGFpbnRleHRSZXF1ZXN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFJlcXVlc3QnLFxyXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyBhdCB0b3Agb2YgcmVxdWVzdCBwYWdlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxyXG4gICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxyXG4gICAgKTtcclxuICAgIHByaXZhdGUgX3BsYWluVGV4dDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgbGV0IGNvcHlCdG46IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+O1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgdG9nZ2xlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICdTaG93IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICcjc3NyJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvcHkgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdtcF9jb3B5IG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBwbGFpbnRleHQgYm94XHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGA8YnI+PHRleHRhcmVhIGNsYXNzPSdtcF9wbGFpbnRleHRTZWFyY2gnIHN0eWxlPSdkaXNwbGF5OiBub25lJz48L3RleHRhcmVhPmBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh0aGlzLl9pc09wZW4pO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgdG9nZ2xlQnRuXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Ym94OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRib3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1Nob3cgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxyXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsID0gJ2ZhbHNlJztcclxuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcclxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGVuID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NSZXN1bHRzKHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXHJcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzZXJpZXNUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IHRoZSBpbXBvcnRhbnQgZGF0YSBmcm9tIGVhY2ggbm9kZVxyXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLmF1dGhvcidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcubmFycmF0b3InXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmF3VGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xyXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGxhc3Qgc2VyaWVzLCB0aGVuIHN0eWxlXHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcclxuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9ICdCWSAnO1xyXG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcclxuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9ICdGVCAnO1xyXG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3V0cDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSZXF1ZXN0TGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZ2V0U2VhcmNoTGlzdCggKWApO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXF1ZXN0IHJlc3VsdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyN0b3JSb3dzIC50b3JSb3cgYScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCByZXF1ZXN0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSA8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvclJvd3MgLnRvclJvdycpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBzbmF0Y2hMaXN0IGlzICR7c25hdGNoTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgR29vZHJlYWRzQnV0dG9uUmVxIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b25SZXEnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMgZm9yIHJlcXVlc3RzJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZmlsbFRvcnJlbnQnO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QgZGV0YWlscyddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gQ29udmVydCByb3cgc3RydWN0dXJlIGludG8gc2VhcmNoYWJsZSBvYmplY3RcclxuICAgICAgICBjb25zdCByZXFSb3dzID0gVXRpbC5yb3dzVG9PYmooZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gPiBkaXYnKSk7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snVGl0bGU6J10ucXVlcnlTZWxlY3Rvcignc3BhbicpO1xyXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IHJlcVJvd3NbXHJcbiAgICAgICAgICAgICdBdXRob3Iocyk6J1xyXG4gICAgICAgIF0ucXVlcnlTZWxlY3RvckFsbCgnYScpO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IHJlcVJvd3NbJ1NlcmllczonXVxyXG4gICAgICAgICAgICA/IHJlcVJvd3NbJ1NlcmllczonXS5xdWVyeVNlbGVjdG9yQWxsKCdhJylcclxuICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snUmVsZWFzZSBEYXRlJ107XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIFZBVUxUIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuY2xhc3MgU2ltcGxlVmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5WYXVsdCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc2ltcGxlVmF1bHQnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdTaW1wbGlmeSB0aGUgVmF1bHQgcGFnZXMuICg8ZW0+VGhpcyByZW1vdmVzIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBkb25hdGUgYnV0dG9uICZhbXA7IGxpc3Qgb2YgcmVjZW50IGRvbmF0aW9uczwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5Cb2R5JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3ZhdWx0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3Qgc3ViUGFnZTogc3RyaW5nID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgY29uc3QgcGFnZSA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc29sZS5ncm91cChgQXBwbHlpbmcgVmF1bHQgKCR7c3ViUGFnZX0pIHNldHRpbmdzLi4uYCk7XHJcblxyXG4gICAgICAgIC8vIENsb25lIHRoZSBpbXBvcnRhbnQgcGFydHMgYW5kIHJlc2V0IHRoZSBwYWdlXHJcbiAgICAgICAgY29uc3QgZG9uYXRlQnRuOiBIVE1MRm9ybUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XHJcbiAgICAgICAgY29uc3QgZG9uYXRlVGJsOiBIVE1MVGFibGVFbGVtZW50IHwgbnVsbCA9IHBhZ2UucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJ3RhYmxlOmxhc3Qtb2YtdHlwZSdcclxuICAgICAgICApO1xyXG4gICAgICAgIHBhZ2UuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIGJ1dHRvbiBpZiBpdCBleGlzdHNcclxuICAgICAgICBpZiAoZG9uYXRlQnRuICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0RvbmF0ZTogSFRNTEZvcm1FbGVtZW50ID0gPEhUTUxGb3JtRWxlbWVudD5kb25hdGVCdG4uY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld0RvbmF0ZSk7XHJcbiAgICAgICAgICAgIG5ld0RvbmF0ZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnPGgxPkNvbWUgYmFjayB0b21vcnJvdyE8L2gxPic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSB0YWJsZSBpZiBpdCBleGlzdHNcclxuICAgICAgICBpZiAoZG9uYXRlVGJsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhYmxlOiBIVE1MVGFibGVFbGVtZW50ID0gPEhUTUxUYWJsZUVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld1RhYmxlKTtcclxuICAgICAgICAgICAgbmV3VGFibGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhZ2Uuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICcyNXB4JztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2ltcGxpZmllZCB0aGUgdmF1bHQgcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICNVUExPQUQgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgZWFzaWVyIGNoZWNraW5nIGZvciBkdXBsaWNhdGUgdXBsb2Fkc1xyXG4gKi9cclxuXHJcbmNsYXNzIFNlYXJjaEZvckR1cGxpY2F0ZXMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3NlYXJjaEZvckR1cGxpY2F0ZXMnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VwbG9hZCBQYWdlJ10sXHJcbiAgICAgICAgZGVzYzogJ0Vhc2llciBzZWFyY2hpbmcgZm9yIGR1cGxpY2F0ZXMgd2hlbiB1cGxvYWRpbmcgY29udGVudCcsXHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN1cGxvYWRGb3JtIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXBsb2FkJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBwYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiB0aXRsZScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGl0bGUnLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0W25hbWU9XCJ0b3JbdGl0bGVdXCJdJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiA3LFxyXG4gICAgICAgICAgICAgICAgdXNlV2lsZGNhcmQ6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBhdXRob3IocyknLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2F1dGhvcicsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXQuYWNfYXV0aG9yJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIHNlcmllcycsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnc2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19zZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDExLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gbmFycmF0b3IocyknLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ25hcnJhdG9yJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19uYXJyYXRvcicsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgc2VhcmNoIHRvIHVwbG9hZHMhYCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICB0aXRsZSxcclxuICAgICAgICB0eXBlLFxyXG4gICAgICAgIGlucHV0U2VsZWN0b3IsXHJcbiAgICAgICAgcm93UG9zaXRpb24sXHJcbiAgICAgICAgdXNlV2lsZGNhcmQgPSBmYWxzZSxcclxuICAgIH06IHtcclxuICAgICAgICBwYXJlbnRFbGVtZW50OiBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgICAgIHR5cGU6IHN0cmluZztcclxuICAgICAgICBpbnB1dFNlbGVjdG9yOiBzdHJpbmc7XHJcbiAgICAgICAgcm93UG9zaXRpb246IG51bWJlcjtcclxuICAgICAgICB1c2VXaWxkY2FyZD86IGJvb2xlYW47XHJcbiAgICB9KSB7XHJcbiAgICAgICAgY29uc3Qgc2VhcmNoRWxlbWVudDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgVXRpbC5zZXRBdHRyKHNlYXJjaEVsZW1lbnQsIHtcclxuICAgICAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJyxcclxuICAgICAgICAgICAgc3R5bGU6ICd0ZXh0LWRlY29yYXRpb246IG5vbmU7IGN1cnNvcjogcG9pbnRlcjsnLFxyXG4gICAgICAgICAgICB0aXRsZSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWFyY2hFbGVtZW50LnRleHRDb250ZW50ID0gJyDwn5SNJztcclxuXHJcbiAgICAgICAgY29uc3QgbGlua0Jhc2UgPSBgL3Rvci9icm93c2UucGhwP3RvciU1QnNlYXJjaFR5cGUlNUQ9YWxsJnRvciU1QnNlYXJjaEluJTVEPXRvcnJlbnRzJnRvciU1QmNhdCU1RCU1QiU1RD0wJnRvciU1QmJyb3dzZUZsYWdzSGlkZVZzU2hvdyU1RD0wJnRvciU1QnNvcnRUeXBlJTVEPWRhdGVEZXNjJnRvciU1QnNyY2hJbiU1RCU1QiR7dHlwZX0lNUQ9dHJ1ZSZ0b3IlNUJ0ZXh0JTVEPWA7XHJcblxyXG4gICAgICAgIHBhcmVudEVsZW1lbnRcclxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICBgI3VwbG9hZEZvcm0gPiB0Ym9keSA+IHRyOm50aC1jaGlsZCgke3Jvd1Bvc2l0aW9ufSkgPiB0ZDpudGgtY2hpbGQoMSlgXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgPy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIHNlYXJjaEVsZW1lbnQpO1xyXG5cclxuICAgICAgICBzZWFyY2hFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlucHV0czogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoaW5wdXRTZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5wdXRzICYmIGlucHV0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0c0xpc3Q6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0c0xpc3QucHVzaChpbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBpbnB1dHNMaXN0LmpvaW4oJyAnKS50cmltKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoU3RyaW5nID0gdXNlV2lsZGNhcmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgKiR7ZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0c0xpc3Quam9pbignICcpKX0qYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVuY29kZVVSSUNvbXBvbmVudChpbnB1dHNMaXN0LmpvaW4oJyAnKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEVsZW1lbnQuc2V0QXR0cmlidXRlKCdocmVmJywgbGlua0Jhc2UgKyBzZWFyY2hTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAjIFVTRVIgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiAjIyMjIERlZmF1bHQgVXNlciBHaWZ0IEFtb3VudFxyXG4gKi9cclxuY2xhc3MgVXNlckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXNlciBQYWdlcyddLFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3VzZXJHaWZ0RGVmYXVsdCcsXHJcbiAgICAgICAgdGFnOiAnRGVmYXVsdCBHaWZ0JyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMDAwLCBtYXgnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy4gKDxlbT5PciB0aGUgbWF4IGFsbG93YWJsZSB2YWx1ZSwgd2hpY2hldmVyIGlzIGxvd2VyPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjYm9udXNnaWZ0JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VzZXInXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBuZXcgU2hhcmVkKClcclxuICAgICAgICAgICAgLmZpbGxHaWZ0Qm94KHRoaXMuX3RhciwgdGhpcy5fc2V0dGluZ3MudGl0bGUpXHJcbiAgICAgICAgICAgIC50aGVuKChwb2ludHMpID0+XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIyMgVXNlciBHaWZ0IEhpc3RvcnlcclxuICovXHJcbmNsYXNzIFVzZXJHaWZ0SGlzdG9yeSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnRIaXN0b3J5JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXHJcbiAgICAgICAgZGVzYzogJ0Rpc3BsYXkgZ2lmdCBoaXN0b3J5IGJldHdlZW4geW91IGFuZCBhbm90aGVyIHVzZXInLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3NlbmRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOm9yYW5nZSc+XFx1MjdGMDwvc3Bhbj5gO1xyXG4gICAgcHJpdmF0ZSBfZ2V0U3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjp0ZWFsJz5cXHUyN0YxPC9zcGFuPmA7XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICd0Ym9keSc7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3VzZXInXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluaXRpYWxsaXppbmcgdXNlciBnaWZ0IGhpc3RvcnkuLi4nKTtcclxuXHJcbiAgICAgICAgLy8gTmFtZSBvZiB0aGUgb3RoZXIgdXNlclxyXG4gICAgICAgIGNvbnN0IG90aGVyVXNlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSA+IGgxJykhLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3Rvcnkgcm93XHJcbiAgICAgICAgY29uc3QgaGlzdG9yeUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgICAgY29uc3QgaW5zZXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IHRib2R5IHRyOmxhc3Qtb2YtdHlwZScpO1xyXG4gICAgICAgIGlmIChpbnNlcnQpIGluc2VydC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgaGlzdG9yeUNvbnRhaW5lcik7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3RvcnkgdGl0bGUgZmllbGRcclxuICAgICAgICBjb25zdCBoaXN0b3J5VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgICAgIGhpc3RvcnlUaXRsZS5jbGFzc0xpc3QuYWRkKCdyb3doZWFkJyk7XHJcbiAgICAgICAgaGlzdG9yeVRpdGxlLnRleHRDb250ZW50ID0gJ0dpZnQgaGlzdG9yeSc7XHJcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5VGl0bGUpO1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZ2lmdCBoaXN0b3J5IGNvbnRlbnQgZmllbGRcclxuICAgICAgICBjb25zdCBoaXN0b3J5Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBoaXN0b3J5Qm94LmNsYXNzTGlzdC5hZGQoJ3JvdzEnKTtcclxuICAgICAgICBoaXN0b3J5Qm94LnRleHRDb250ZW50ID0gYFlvdSBoYXZlIG5vdCBleGNoYW5nZWQgZ2lmdHMgd2l0aCAke290aGVyVXNlcn0uYDtcclxuICAgICAgICBoaXN0b3J5Qm94LmFsaWduID0gJ2xlZnQnO1xyXG4gICAgICAgIGhpc3RvcnlDb250YWluZXIuYXBwZW5kQ2hpbGQoaGlzdG9yeUJveCk7XHJcbiAgICAgICAgLy8gR2V0IHRoZSBVc2VyIElEXHJcbiAgICAgICAgY29uc3QgdXNlcklEID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykucG9wKCk7XHJcbiAgICAgICAgLy8gVE9ETzogdXNlIGBjZG4uYCBpbnN0ZWFkIG9mIGB3d3cuYDsgY3VycmVudGx5IGNhdXNlcyBhIDQwMyBlcnJvclxyXG4gICAgICAgIGlmICh1c2VySUQpIHtcclxuICAgICAgICAgICAgLy8gR2V0IHRoZSBnaWZ0IGhpc3RvcnlcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEhpc3RvcnkgPSBhd2FpdCBVdGlsLmdldFVzZXJHaWZ0SGlzdG9yeSh1c2VySUQpO1xyXG4gICAgICAgICAgICAvLyBPbmx5IGRpc3BsYXkgYSBsaXN0IGlmIHRoZXJlIGlzIGEgaGlzdG9yeVxyXG4gICAgICAgICAgICBpZiAoZ2lmdEhpc3RvcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgUG9pbnQgJiBGTCB0b3RhbCB2YWx1ZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IFtwb2ludHNJbiwgcG9pbnRzT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFBvaW50cycpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgW3dlZGdlSW4sIHdlZGdlT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFdlZGdlJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUG9pbnRzIEluL091dDogJHtwb2ludHNJbn0vJHtwb2ludHNPdXR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFdlZGdlcyBJbi9PdXQ6ICR7d2VkZ2VJbn0vJHt3ZWRnZU91dH1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgaGlzdG9yeUJveC5pbm5lckhUTUwgPSBgWW91IGhhdmUgc2VudCAke3RoaXMuX3NlbmRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNPdXR9IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VPdXR9IEZMIHdlZGdlczwvc3Ryb25nPiB0byAke290aGVyVXNlcn0gYW5kIHJlY2VpdmVkICR7dGhpcy5fZ2V0U3ltYm9sfSA8c3Ryb25nPiR7cG9pbnRzSW59IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VJbn0gRkwgd2VkZ2VzPC9zdHJvbmc+Ljxocj5gO1xyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBtZXNzYWdlIHRvIHRoZSBib3hcclxuICAgICAgICAgICAgICAgIGhpc3RvcnlCb3guYXBwZW5kQ2hpbGQodGhpcy5fc2hvd0dpZnRzKGdpZnRIaXN0b3J5KSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBVc2VyIGdpZnQgaGlzdG9yeSBhZGRlZCEnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vIHVzZXIgZ2lmdCBoaXN0b3J5IGZvdW5kLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVc2VyIElEIG5vdCBmb3VuZDogJHt1c2VySUR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBTdW0gdGhlIHZhbHVlcyBvZiBhIGdpdmVuIGdpZnQgdHlwZSBhcyBJbmZsb3cgJiBPdXRmbG93IHN1bXNcclxuICAgICAqIEBwYXJhbSBoaXN0b3J5IHRoZSB1c2VyIGdpZnQgaGlzdG9yeVxyXG4gICAgICogQHBhcmFtIHR5cGUgcG9pbnRzIG9yIHdlZGdlc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zdW1HaWZ0cyhcclxuICAgICAgICBoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSxcclxuICAgICAgICB0eXBlOiAnZ2lmdFBvaW50cycgfCAnZ2lmdFdlZGdlJ1xyXG4gICAgKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgY29uc3Qgb3V0ZmxvdyA9IFswXTtcclxuICAgICAgICBjb25zdCBpbmZsb3cgPSBbMF07XHJcbiAgICAgICAgLy8gT25seSByZXRyaWV2ZSBhbW91bnRzIG9mIGEgc3BlY2lmaWVkIGdpZnQgdHlwZVxyXG4gICAgICAgIGhpc3RvcnkubWFwKChnaWZ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09IHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNwbGl0IGludG8gSW5mbG93L091dGZsb3dcclxuICAgICAgICAgICAgICAgIGlmIChnaWZ0LmFtb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZsb3cucHVzaChnaWZ0LmFtb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dGZsb3cucHVzaChnaWZ0LmFtb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBTdW0gYWxsIGl0ZW1zIGluIHRoZSBmaWx0ZXJlZCBhcnJheVxyXG4gICAgICAgIGNvbnN0IHN1bU91dCA9IG91dGZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XHJcbiAgICAgICAgY29uc3Qgc3VtSW4gPSBpbmZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XHJcbiAgICAgICAgcmV0dXJuIFtzdW1JbiwgTWF0aC5hYnMoc3VtT3V0KV07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENyZWF0ZXMgYSBsaXN0IG9mIHRoZSBtb3N0IHJlY2VudCBnaWZ0c1xyXG4gICAgICogQHBhcmFtIGhpc3RvcnkgVGhlIGZ1bGwgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdHdvIHVzZXJzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Nob3dHaWZ0cyhoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSkge1xyXG4gICAgICAgIC8vIElmIHRoZSBnaWZ0IHdhcyBhIHdlZGdlLCByZXR1cm4gY3VzdG9tIHRleHRcclxuICAgICAgICBjb25zdCBfd2VkZ2VPclBvaW50cyA9IChnaWZ0OiBVc2VyR2lmdEhpc3RvcnkpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZ2lmdC50eXBlID09PSAnZ2lmdFBvaW50cycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtNYXRoLmFicyhnaWZ0LmFtb3VudCl9YDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0V2VkZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyhGTCknO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBFcnJvcjogdW5rbm93biBnaWZ0IHR5cGUuLi4gJHtnaWZ0LnR5cGV9OiAke2dpZnQuYW1vdW50fWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBhIGxpc3QgZm9yIHRoZSBoaXN0b3J5XHJcbiAgICAgICAgY29uc3QgaGlzdG9yeUxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24oaGlzdG9yeUxpc3Quc3R5bGUsIHtcclxuICAgICAgICAgICAgbGlzdFN0eWxlOiAnbm9uZScsXHJcbiAgICAgICAgICAgIHBhZGRpbmc6ICdpbml0aWFsJyxcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTBlbScsXHJcbiAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bycsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGhpc3RvcnkgaXRlbXMgYW5kIGFkZCB0byBhbiBhcnJheVxyXG4gICAgICAgIGNvbnN0IGdpZnRzOiBzdHJpbmdbXSA9IGhpc3RvcnkubWFwKChnaWZ0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBzb21lIHN0eWxpbmcgZGVwZW5kaW5nIG9uIHBvcy9uZWcgbnVtYmVyc1xyXG4gICAgICAgICAgICBsZXQgZmFuY3lHaWZ0QW1vdW50OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICAgICAgICAgIGlmIChnaWZ0LmFtb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGZhbmN5R2lmdEFtb3VudCA9IGAke3RoaXMuX2dldFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fc2VuZFN5bWJvbH0gJHtfd2VkZ2VPclBvaW50cyhnaWZ0KX1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIE1ha2UgdGhlIGRhdGUgcmVhZGFibGVcclxuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IFV0aWwucHJldHR5U2l0ZVRpbWUoZ2lmdC50aW1lc3RhbXAsIHRydWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gYDxsaSBjbGFzcz0nbXBfZ2lmdEl0ZW0nPiR7ZGF0ZX0gJHtmYW5jeUdpZnRBbW91bnR9PC9saT5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEFkZCBoaXN0b3J5IGl0ZW1zIHRvIHRoZSBsaXN0XHJcbiAgICAgICAgaGlzdG9yeUxpc3QuaW5uZXJIVE1MID0gZ2lmdHMuam9pbignJyk7XHJcbiAgICAgICAgcmV0dXJuIGhpc3RvcnlMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIFBMQUNFIEFMTCBNKyBGRUFUVVJFUyBIRVJFXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKlxyXG4gKiBOZWFybHkgYWxsIGZlYXR1cmVzIGJlbG9uZyBoZXJlLCBhcyB0aGV5IHNob3VsZCBoYXZlIGludGVybmFsIGNoZWNrc1xyXG4gKiBmb3IgRE9NIGVsZW1lbnRzIGFzIG5lZWRlZC4gT25seSBjb3JlIGZlYXR1cmVzIHNob3VsZCBiZSBwbGFjZWQgaW4gYGFwcC50c2BcclxuICpcclxuICogVGhpcyBkZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBzZXR0aW5ncyB3aWxsIGJlIGdlbmVyYXRlZCBvbiB0aGUgU2V0dGluZ3MgcGFnZS5cclxuICogU2V0dGluZ3Mgd2lsbCBiZSBncm91cGVkIGJ5IHR5cGUgYW5kIEZlYXR1cmVzIG9mIG9uZSB0eXBlIHRoYXQgYXJlIGNhbGxlZCBiZWZvcmVcclxuICogb3RoZXIgRmVhdHVyZXMgb2YgdGhlIHNhbWUgdHlwZSB3aWxsIGFwcGVhciBmaXJzdC5cclxuICpcclxuICogVGhlIG9yZGVyIG9mIHRoZSBmZWF0dXJlIGdyb3VwcyBpcyBub3QgZGV0ZXJtaW5lZCBoZXJlLlxyXG4gKi9cclxuY2xhc3MgSW5pdEZlYXR1cmVzIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgR2xvYmFsIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBIaWRlSG9tZSgpO1xyXG4gICAgICAgIG5ldyBIaWRlU2VlZGJveCgpO1xyXG4gICAgICAgIG5ldyBCbHVycmVkSGVhZGVyKCk7XHJcbiAgICAgICAgbmV3IFZhdWx0TGluaygpO1xyXG4gICAgICAgIG5ldyBNaW5pVmF1bHRJbmZvKCk7XHJcbiAgICAgICAgbmV3IEJvbnVzUG9pbnREZWx0YSgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIEhvbWUgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgSGlkZU5ld3MoKTtcclxuICAgICAgICBuZXcgR2lmdE5ld2VzdCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFNlYXJjaCBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBUb2dnbGVTbmF0Y2hlZCgpO1xyXG4gICAgICAgIG5ldyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSgpO1xyXG4gICAgICAgIG5ldyBQbGFpbnRleHRTZWFyY2goKTtcclxuICAgICAgICBuZXcgVG9nZ2xlU2VhcmNoYm94KCk7XHJcbiAgICAgICAgbmV3IEJ1aWxkVGFncygpO1xyXG4gICAgICAgIG5ldyBSYW5kb21Cb29rKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgUmVxdWVzdCBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBHb29kcmVhZHNCdXR0b25SZXEoKTtcclxuICAgICAgICBuZXcgVG9nZ2xlSGlkZGVuUmVxdWVzdGVycygpO1xyXG4gICAgICAgIG5ldyBQbGFpbnRleHRSZXF1ZXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVG9ycmVudCBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBHb29kcmVhZHNCdXR0b24oKTtcclxuICAgICAgICBuZXcgQ3VycmVudGx5UmVhZGluZygpO1xyXG4gICAgICAgIG5ldyBUb3JHaWZ0RGVmYXVsdCgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3QoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDEoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDIoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDMoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TWluKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2hvdXRib3ggZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFByaW9yaXR5VXNlcnMoKTtcclxuICAgICAgICBuZXcgUHJpb3JpdHlTdHlsZSgpO1xyXG4gICAgICAgIG5ldyBNdXRlZFVzZXJzKCk7XHJcbiAgICAgICAgbmV3IFJlcGx5U2ltcGxlKCk7XHJcbiAgICAgICAgbmV3IFJlcGx5UXVvdGUoKTtcclxuICAgICAgICBuZXcgR2lmdEJ1dHRvbigpO1xyXG4gICAgICAgIG5ldyBRdWlja1Nob3V0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVmF1bHQgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFNpbXBsZVZhdWx0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVXNlciBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBVc2VyR2lmdERlZmF1bHQoKTtcclxuICAgICAgICBuZXcgVXNlckdpZnRIaXN0b3J5KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgRm9ydW0gUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgRm9ydW1GTEdpZnQoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVcGxvYWQgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgU2VhcmNoRm9yRHVwbGljYXRlcygpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9jb3JlLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBDbGFzcyBmb3IgaGFuZGxpbmcgc2V0dGluZ3MgYW5kIHRoZSBQcmVmZXJlbmNlcyBwYWdlXHJcbiAqIEBtZXRob2QgaW5pdDogdHVybnMgZmVhdHVyZXMnIHNldHRpbmdzIGluZm8gaW50byBhIHVzZWFibGUgdGFibGVcclxuICovXHJcbmNsYXNzIFNldHRpbmdzIHtcclxuICAgIC8vIEZ1bmN0aW9uIGZvciBnYXRoZXJpbmcgdGhlIG5lZWRlZCBzY29wZXNcclxuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTY29wZXMoc2V0dGluZ3M6IEFueUZlYXR1cmVbXSk6IFByb21pc2U8U2V0dGluZ0dsb2JPYmplY3Q+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ19nZXRTY29wZXMoJywgc2V0dGluZ3MsICcpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzY29wZUxpc3Q6IFNldHRpbmdHbG9iT2JqZWN0ID0ge307XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2V0dGluZyBvZiBzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IE51bWJlcihzZXR0aW5nLnNjb3BlKTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBTY29wZSBleGlzdHMsIHB1c2ggdGhlIHNldHRpbmdzIGludG8gdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGVMaXN0W2luZGV4XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0ucHVzaChzZXR0aW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGNyZWF0ZSB0aGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVMaXN0W2luZGV4XSA9IFtzZXR0aW5nXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNvbHZlKHNjb3BlTGlzdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gZm9yIGNvbnN0cnVjdGluZyB0aGUgdGFibGUgZnJvbSBhbiBvYmplY3RcclxuICAgIHByaXZhdGUgc3RhdGljIF9idWlsZFRhYmxlKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdfYnVpbGRUYWJsZSgnLCBwYWdlLCAnKScpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3V0cCA9IGA8dGJvZHk+PHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxicj48c3Ryb25nPk1BTSsgdiR7TVAuVkVSU0lPTn08L3N0cm9uZz4gLSBIZXJlIHlvdSBjYW4gZW5hYmxlICZhbXA7IGRpc2FibGUgYW55IGZlYXR1cmUgZnJvbSB0aGUgPGEgaHJlZj1cIi9mL3QvNDE4NjNcIj5NQU0rIHVzZXJzY3JpcHQ8L2E+ISBIb3dldmVyLCB0aGVzZSBzZXR0aW5ncyBhcmUgPHN0cm9uZz5OT1Q8L3N0cm9uZz4gc3RvcmVkIG9uIE1BTTsgdGhleSBhcmUgc3RvcmVkIHdpdGhpbiB0aGUgVGFtcGVybW9ua2V5L0dyZWFzZW1vbmtleSBleHRlbnNpb24gaW4geW91ciBicm93c2VyLCBhbmQgbXVzdCBiZSBjdXN0b21pemVkIG9uIGVhY2ggb2YgeW91ciBicm93c2Vycy9kZXZpY2VzIHNlcGFyYXRlbHkuPGJyPjxicj5Gb3IgYSBkZXRhaWxlZCBsb29rIGF0IHRoZSBhdmFpbGFibGUgZmVhdHVyZXMsIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvd2lraS9GZWF0dXJlLU92ZXJ2aWV3XCI+Y2hlY2sgdGhlIFdpa2khPC9hPjxicj48YnI+PC90ZD48L3RyPmA7XHJcblxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcGVOdW06IG51bWJlciA9IE51bWJlcihzY29wZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIHNlY3Rpb24gdGl0bGVcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gYDx0cj48dGQgY2xhc3M9J3JvdzInPiR7U2V0dGluZ0dyb3VwW3Njb3BlTnVtXX08L3RkPjx0ZCBjbGFzcz0ncm93MSc+YDtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgaW5wdXQgZmllbGQgYmFzZWQgb24gdGhlIHNldHRpbmdcclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2Vbc2NvcGVOdW1dKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ051bWJlcjogbnVtYmVyID0gTnVtYmVyKHNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW06IEFueUZlYXR1cmUgPSBwYWdlW3Njb3BlTnVtXVtzZXR0aW5nTnVtYmVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8aW5wdXQgdHlwZT0nY2hlY2tib3gnIGlkPScke2l0ZW0udGl0bGV9JyB2YWx1ZT0ndHJ1ZSc+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPGlucHV0IHR5cGU9J3RleHQnIGlkPScke2l0ZW0udGl0bGV9JyBwbGFjZWhvbGRlcj0nJHtpdGVtLnBsYWNlaG9sZGVyfScgY2xhc3M9J21wX3RleHRJbnB1dCcgc2l6ZT0nMjUnPiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8c2VsZWN0IGlkPScke2l0ZW0udGl0bGV9JyBjbGFzcz0nbXBfZHJvcElucHV0Jz5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGl0ZW0ub3B0aW9ucykuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxvcHRpb24gdmFsdWU9JyR7a2V5fSc+JHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3B0aW9ucyFba2V5XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC9vcHRpb24+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDwvc2VsZWN0PiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSkgY2FzZXNbaXRlbS50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgcm93XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICc8L3RkPjwvdHI+JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2F2ZSBidXR0b24gJiBsYXN0IHBhcnQgb2YgdGhlIHRhYmxlXHJcbiAgICAgICAgICAgIG91dHAgKz1cclxuICAgICAgICAgICAgICAgICc8dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGRpdiBpZD1cIm1wX3N1Ym1pdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlNhdmUgTSsgU2V0dGluZ3M/PzwvZGl2PjxkaXYgaWQ9XCJtcF9jb3B5XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+Q29weSBTZXR0aW5nczwvZGl2PjxkaXYgaWQ9XCJtcF9pbmplY3RcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5QYXN0ZSBTZXR0aW5nczwvZGl2PjxzcGFuIGNsYXNzPVwibXBfc2F2ZXN0YXRlXCIgc3R5bGU9XCJvcGFjaXR5OjBcIj5TYXZlZCE8L3NwYW4+PC90ZD48L3RyPjwvdGJvZHk+JztcclxuXHJcbiAgICAgICAgICAgIHJlc29sdmUob3V0cCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgc2V0dGluZ3MgdmFsdWVzXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0U2V0dGluZ3MocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICAvLyBVdGlsLnB1cmdlU2V0dGluZ3MoKTtcclxuICAgICAgICBjb25zdCBhbGxWYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNldHRpbmdzKCcsIHBhZ2UsICcpXFxuU3RvcmVkIEdNIGtleXM6JywgYWxsVmFsdWVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZVtOdW1iZXIoc2NvcGUpXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IHBhZ2VbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1ByZWY6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZi50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgU2V0OicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9YCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IFZhbHVlOicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUocHJlZi50aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSAmJiBHTV9nZXRWYWx1ZShwcmVmLnRpdGxlKSkgY2FzZXNbcHJlZi50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfc2V0U2V0dGluZ3Mob2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYF9zZXRTZXR0aW5ncyhgLCBvYmosICcpJyk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmpbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWYgPSBvYmpbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLmNoZWNrZWQpIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnA6IHN0cmluZyA9IGVsZW0udmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgLCBpbnApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgZWxlbS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSkgY2FzZXNbcHJlZi50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZlZCEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY29weVNldHRpbmdzKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgZ21MaXN0ID0gR01fbGlzdFZhbHVlcygpO1xyXG4gICAgICAgIGNvbnN0IG91dHA6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtdO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHN0b3JlZCBzZXR0aW5ncyBhbmQgcHVzaCB0byBvdXRwdXQgYXJyYXlcclxuICAgICAgICBnbUxpc3QubWFwKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IGV4cG9ydCBtcF8gc2V0dGluZ3MgYXMgdGhleSBzaG91bGQgb25seSBiZSBzZXQgYXQgcnVudGltZVxyXG4gICAgICAgICAgICBpZiAoc2V0dGluZy5pbmRleE9mKCdtcF8nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgIG91dHAucHVzaChbc2V0dGluZywgR01fZ2V0VmFsdWUoc2V0dGluZyldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0cCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3Bhc3RlU2V0dGluZ3MocGF5bG9hZDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfcGFzdGVTZXR0aW5ncyggKWApO1xyXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShwYXlsb2FkKTtcclxuICAgICAgICBzZXR0aW5ncy5mb3JFYWNoKCh0dXBsZTogW3N0cmluZywgc3RyaW5nXVtdKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0dXBsZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7dHVwbGVbMF19YCwgYCR7dHVwbGVbMV19YCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHR1cGxlWzBdLCAnOiAnLCB0dXBsZVsxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiB0aGF0IHNhdmVzIHRoZSB2YWx1ZXMgb2YgdGhlIHNldHRpbmdzIHRhYmxlXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfc2F2ZVNldHRpbmdzKHRpbWVyOiBudW1iZXIsIG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9zYXZlU2V0dGluZ3MoKWApO1xyXG5cclxuICAgICAgICBjb25zdCBzYXZlc3RhdGU6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLm1wX3NhdmVzdGF0ZScpIVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aW1lciAmIG1lc3NhZ2VcclxuICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2F2aW5nLi4uJyk7XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgdmFsdWVzIHN0b3JlZCBpbiBHTSBhbmQgcmVzZXQgZXZlcnl0aGluZ1xyXG4gICAgICAgIGZvciAoY29uc3QgZmVhdHVyZSBpbiBnbVZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGdtVmFsdWVzW2ZlYXR1cmVdICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGxvb3Agb3ZlciB2YWx1ZXMgdGhhdCBhcmUgZmVhdHVyZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgaWYgKCFbJ21wX3ZlcnNpb24nLCAnc3R5bGVfdGhlbWUnXS5pbmNsdWRlcyhnbVZhbHVlc1tmZWF0dXJlXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIG5vdCBwYXJ0IG9mIHByZWZlcmVuY2VzIHBhZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ21WYWx1ZXNbZmVhdHVyZV0uaW5kZXhPZignbXBfJykgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoZ21WYWx1ZXNbZmVhdHVyZV0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNhdmUgdGhlIHNldHRpbmdzIHRvIEdNIHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3NldFNldHRpbmdzKG9iaik7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbmZpcm1hdGlvbiBtZXNzYWdlXHJcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICAgICAgfSwgMjM0NSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyB0aGUgc2V0dGluZ3MgcGFnZS5cclxuICAgICAqIEBwYXJhbSByZXN1bHQgVmFsdWUgdGhhdCBtdXN0IGJlIHBhc3NlZCBkb3duIGZyb20gYENoZWNrLnBhZ2UoJ3NldHRpbmdzJylgXHJcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRvIHByb3ZpZGUgc2V0dGluZ3MgZm9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgaW5pdChyZXN1bHQ6IGJvb2xlYW4sIHNldHRpbmdzOiBBbnlGZWF0dXJlW10pIHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgb25seSBydW4gaWYgYENoZWNrLnBhZ2UoJ3NldHRpbmdzKWAgcmV0dXJucyB0cnVlICYgaXMgcGFzc2VkIGhlcmVcclxuICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChgbmV3IFNldHRpbmdzKClgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyB0YWJsZSBoYXMgbG9hZGVkXHJcbiAgICAgICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcjbWFpbkJvZHkgPiB0YWJsZScpLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFtNK10gU3RhcnRpbmcgdG8gYnVpbGQgU2V0dGluZ3MgdGFibGUuLi5gKTtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgdGFibGUgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOYXY6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgPiB0YWJsZScpITtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUaXRsZTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZVNjb3BlOiBTZXR0aW5nR2xvYk9iamVjdDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGFibGUgZWxlbWVudHMgYWZ0ZXIgdGhlIFByZWYgbmF2YmFyXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nTmF2Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNldHRpbmdUYWJsZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnY29sdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGxzcGFjaW5nOiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICd3aWR0aDoxMDAlO21pbi13aWR0aDoxMDAlO21heC13aWR0aDoxMDAlOycsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdUaXRsZS5pbm5lckhUTUwgPSAnTUFNKyBTZXR0aW5ncyc7XHJcbiAgICAgICAgICAgICAgICAvLyBHcm91cCBzZXR0aW5ncyBieSBwYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9nZXRTY29wZXMoc2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgdGFibGUgSFRNTCBmcm9tIGZlYXR1cmUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VTY29wZSA9IHNjb3BlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkVGFibGUoc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBjb250ZW50IGludG8gdGhlIG5ldyB0YWJsZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ1RhYmxlLmlubmVySFRNTCA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIE1BTSsgU2V0dGluZ3MgdGFibGUhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlU2NvcGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFNldHRpbmdzKHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNldHRpbmdzIGFyZSBkb25lIGxvYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdEJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3N1Ym1pdCcpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5QnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfY29weScpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXN0ZUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2luamVjdCcpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3NUaW1lcjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVTZXR0aW5ncyhzc1RpbWVyLCBzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihwYXN0ZUJ0biwgdGhpcy5fcGFzdGVTZXR0aW5ncywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fY29weVNldHRpbmdzKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBlcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzdHlsZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvZ2xvYmFsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9ob21lLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy90b3IudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2ZvcnVtLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9zaG91dC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvYnJvd3NlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9yZXF1ZXN0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy92YXVsdC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdXBsb2FkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91c2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZlYXR1cmVzLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNldHRpbmdzLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAqIFVzZXJzY3JpcHQgbmFtZXNwYWNlXHJcbiAqIEBjb25zdGFudCBDSEFOR0VMT0c6IE9iamVjdCBjb250YWluaW5nIGEgbGlzdCBvZiBjaGFuZ2VzIGFuZCBrbm93biBidWdzXHJcbiAqIEBjb25zdGFudCBUSU1FU1RBTVA6IFBsYWNlaG9sZGVyIGhvb2sgZm9yIHRoZSBjdXJyZW50IGJ1aWxkIHRpbWVcclxuICogQGNvbnN0YW50IFZFUlNJT046IFRoZSBjdXJyZW50IHVzZXJzY3JpcHQgdmVyc2lvblxyXG4gKiBAY29uc3RhbnQgUFJFVl9WRVI6IFRoZSBsYXN0IGluc3RhbGxlZCB1c2Vyc2NyaXB0IHZlcnNpb25cclxuICogQGNvbnN0YW50IEVSUk9STE9HOiBUaGUgdGFyZ2V0IGFycmF5IGZvciBsb2dnaW5nIGVycm9yc1xyXG4gKiBAY29uc3RhbnQgUEFHRV9QQVRIOiBUaGUgY3VycmVudCBwYWdlIFVSTCB3aXRob3V0IHRoZSBzaXRlIGFkZHJlc3NcclxuICogQGNvbnN0YW50IE1QX0NTUzogVGhlIE1BTSsgc3R5bGVzaGVldFxyXG4gKiBAY29uc3RhbnQgcnVuKCk6IFN0YXJ0cyB0aGUgdXNlcnNjcmlwdFxyXG4gKi9cclxubmFtZXNwYWNlIE1QIHtcclxuICAgIGV4cG9ydCBjb25zdCBERUJVRzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdkZWJ1ZycpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgZXhwb3J0IGNvbnN0IENIQU5HRUxPRzogQXJyYXlPYmplY3QgPSB7XHJcbiAgICAgICAgLyog8J+GleKZu++4j/CfkJ4gKi9cclxuICAgICAgICBVUERBVEVfTElTVDogW1xyXG4gICAgICAgICAgICAn8J+QnjogQ2hhbmdlZCB0byBNQU1zIG1yZC5uaW5qYSBkZXJlZmVyYWwgc2VydmljZSwgc28gZXh0ZXJuYWwgbGlua3Mgd29yayBhZ2FpbicsXHJcbiAgICAgICAgXSBhcyBzdHJpbmdbXSxcclxuICAgICAgICBCVUdfTElTVDogW10gYXMgc3RyaW5nW10sXHJcbiAgICB9O1xyXG4gICAgZXhwb3J0IGNvbnN0IFRJTUVTVEFNUDogc3RyaW5nID0gJyMjbWV0YV90aW1lc3RhbXAjIyc7XHJcbiAgICBleHBvcnQgY29uc3QgVkVSU0lPTjogc3RyaW5nID0gQ2hlY2submV3VmVyO1xyXG4gICAgZXhwb3J0IGNvbnN0IFBSRVZfVkVSOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBDaGVjay5wcmV2VmVyO1xyXG4gICAgZXhwb3J0IGNvbnN0IEVSUk9STE9HOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgZXhwb3J0IGNvbnN0IFBBR0VfUEFUSDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgZXhwb3J0IGNvbnN0IE1QX0NTUzogU3R5bGUgPSBuZXcgU3R5bGUoKTtcclxuICAgIGV4cG9ydCBjb25zdCBzZXR0aW5nc0dsb2I6IEFueUZlYXR1cmVbXSA9IFtdO1xyXG5cclxuICAgIGV4cG9ydCBjb25zdCBydW4gPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBQUkUgU0NSSVBUXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc29sZS5ncm91cChgV2VsY29tZSB0byBNQU0rIHYke1ZFUlNJT059IWApO1xyXG5cclxuICAgICAgICAvLyBUaGUgY3VycmVudCBwYWdlIGlzIG5vdCB5ZXQga25vd25cclxuICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBDaGVjay5wYWdlKCk7XHJcbiAgICAgICAgLy8gQWRkIGEgc2ltcGxlIGNvb2tpZSB0byBhbm5vdW5jZSB0aGUgc2NyaXB0IGlzIGJlaW5nIHVzZWRcclxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSAnbXBfZW5hYmxlZD0xO2RvbWFpbj1teWFub25hbW91c2UubmV0O3BhdGg9LztzYW1lc2l0ZT1sYXgnO1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgY29yZSBmdW5jdGlvbnNcclxuICAgICAgICBjb25zdCBhbGVydHM6IEFsZXJ0cyA9IG5ldyBBbGVydHMoKTtcclxuICAgICAgICBuZXcgRGVidWcoKTtcclxuICAgICAgICAvLyBOb3RpZnkgdGhlIHVzZXIgaWYgdGhlIHNjcmlwdCB3YXMgdXBkYXRlZFxyXG4gICAgICAgIENoZWNrLnVwZGF0ZWQoKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkgYWxlcnRzLm5vdGlmeShyZXN1bHQsIENIQU5HRUxPRyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgZmVhdHVyZXNcclxuICAgICAgICBuZXcgSW5pdEZlYXR1cmVzKCk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogU0VUVElOR1NcclxuICAgICAgICAgKi9cclxuICAgICAgICBDaGVjay5wYWdlKCdzZXR0aW5ncycpLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzdWJQZzogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSAmJiAoc3ViUGcgPT09ICcnIHx8IHN1YlBnID09PSAnP3ZpZXc9Z2VuZXJhbCcpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBzZXR0aW5ncyBwYWdlXHJcbiAgICAgICAgICAgICAgICBTZXR0aW5ncy5pbml0KHJlc3VsdCwgc2V0dGluZ3NHbG9iKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFNUWUxFU1xyXG4gICAgICAgICAqIEluamVjdHMgQ1NTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2hlYWQgbGlua1tocmVmKj1cIklDR3N0YXRpb25cIl0nKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgLy8gQWRkIGN1c3RvbSBDU1Mgc2hlZXRcclxuICAgICAgICAgICAgTVBfQ1NTLmluamVjdExpbmsoKTtcclxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHNpdGUgdGhlbWVcclxuICAgICAgICAgICAgTVBfQ1NTLmFsaWduVG9TaXRlVGhlbWUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfTtcclxufVxyXG5cclxuLy8gKiBTdGFydCB0aGUgdXNlcnNjcmlwdFxyXG5NUC5ydW4oKTtcclxuIl19
