// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.2.23
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://myanonamouse.net/*
// @include      https://www.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.2.23
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
    SettingGroup[SettingGroup["Forum"] = 8] = "Forum";
    SettingGroup[SettingGroup["Other"] = 9] = "Other";
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
Util.getBookAuthors = (data, num = 3) => __awaiter(void 0, void 0, void 0, function* () {
    if (data === null) {
        throw new Error('getBookAuthors() failed; element was null!');
    }
    const authList = [];
    data.forEach((author) => {
        if (num > 0) {
            authList.push(Util.goodreads.smartAuth(author.innerText));
            num--;
        }
    });
    return authList;
});
Util.getBookSeries = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data === null) {
        throw new Error('getBookSeries() failed; element was null!');
    }
    const seriesList = [];
    data.forEach((series) => {
        seriesList.push(series.innerText);
    });
    return seriesList;
});
Util.rowsToObj = (rowList, titleClass = '.torDetLeft', dataClass = 'torDetRight') => {
    const rows = [];
    rowList.forEach((row) => {
        const title = row.querySelector(titleClass);
        const data = row.querySelector(dataClass);
        rows.push({ title: title, data: data });
    });
    return rows.reduce((prev, cur) => (prev[cur.key] = cur.value));
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
                // Grab the URL and slice out the good bits
                const path = window.location.pathname;
                const pageStr = path.split('/')[1];
                const subPage = path.split('/')[2];
                let currentPage;
                // Create an object literal of sorts to use as a "switch"
                const cases = {
                    '': 'home',
                    'index.php': 'home',
                    shoutbox: 'shoutbox',
                    t: 'torrent',
                    preferences: 'settings',
                    u: 'user',
                    'f/t': 'forum',
                    tor: subPage,
                    millionaires: 'vault',
                };
                /* TODO: set `cases` to any to allow proper Object switch */
                if (MP.DEBUG) {
                    console.log(`Page @ ${pageStr}\nSubpage @ ${subPage}`);
                }
                if (cases[pageStr] || cases[pageStr + '/' + subPage]) {
                    if (cases[pageStr] === subPage) {
                        currentPage = subPage.split('.')[0].replace(/[0-9]/g, '');
                    }
                    else if (cases[pageStr + '/' + subPage]) {
                        currentPage = cases[pageStr + '/' + subPage];
                        console.log('Forum Case');
                    }
                    else {
                        currentPage = cases[pageStr];
                    }
                    if (MP.DEBUG) {
                        console.log(`Currently on ${currentPage} page`);
                    }
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
                else if (MP.DEBUG) {
                    console.warn(`pageStr case returns '${cases[pageStr]}'`);
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
        this.goodreadsButtons = () => {
            console.log('[M+] Adding the MAM-to-Goodreads buttons...');
            console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
        };
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
            console.log('[M+] Adding the MAM-to-Goodreads buttons...');
            const authorData = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData = document.querySelector('#torDetMainCon .TorrentTitle');
            const seriesData = document.querySelectorAll('#Series a');
            const target = document.querySelector(this._tar);
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
        Util.startFeature(this._settings, this._tar, ['forum']).then((t) => {
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
        Util.startFeature(this._settings, this._tar, ['requests']).then((t) => {
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
        Util.startFeature(this._settings, this._tar, ['requests']).then((t) => {
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
        Util.startFeature(this._settings, this._tar, ['requests']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔥🔥🔥🔥🔥🔥');
            /* const authorData: NodeListOf<
                HTMLAnchorElement
            > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
            const bookData: HTMLSpanElement | null = document.querySelector(
                '#torDetMainCon .TorrentTitle'
            );
            const seriesData: NodeListOf<
                HTMLAnchorElement
            > | null = document.querySelectorAll('#Series a');
            const target: HTMLDivElement | null = document.querySelector(this._tar);
            let seriesP: Promise<string[]>, authorP: Promise<string[]>;
            let authors = ''; */
            const reqRows = Util.rowsToObj(document.querySelectorAll('torDetMainCon div'));
            console.log(reqRows);
            this._share.goodreadsButtons();
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
            '♻️: Currently Reading no longer lists all authors; the first 3 are used.',
            '♻️: Currently Reading now generates links to authors.',
            '♻️: Goodreads Buttons for books with multiple series now generate a button for each series',
            '🐞: Large ratio numbers should be correctly shortened by the Shorten Vault & Ratio Text feature.',
            '🐞: Hopefully fixed bug that might cause uneccessary resource use or blocked features if an expected page element was missing.',
            '🐞: Fixed an issue where shoutbox features might fail to load initially',
        ],
        BUG_LIST: [
            'Please be on the lookout for bugs related to Goodreads Buttons, as the code was drastically changed, thanks!',
        ],
    };
    MP.TIMESTAMP = 'Jan 14';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL2hvbWUudHMiLCJzcmMvbW9kdWxlcy9zaGFyZWQudHMiLCJzcmMvbW9kdWxlcy90b3IudHMiLCJzcmMvbW9kdWxlcy9mb3J1bS50cyIsInNyYy9tb2R1bGVzL3Nob3V0LnRzIiwic3JjL21vZHVsZXMvYnJvd3NlLnRzIiwic3JjL21vZHVsZXMvcmVxdWVzdC50cyIsInNyYy9tb2R1bGVzL3ZhdWx0LnRzIiwic3JjL21vZHVsZXMvdXNlci50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBZUgsSUFBSyxZQVdKO0FBWEQsV0FBSyxZQUFZO0lBQ2IsbURBQVEsQ0FBQTtJQUNSLCtDQUFNLENBQUE7SUFDTixtREFBUSxDQUFBO0lBQ1IsdURBQVUsQ0FBQTtJQUNWLCtEQUFjLENBQUE7SUFDZCx1REFBVSxDQUFBO0lBQ1YsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWixpREFBTyxDQUFBO0lBQ1AsaURBQU8sQ0FBQTtBQUNYLENBQUMsRUFYSSxZQUFZLEtBQVosWUFBWSxRQVdoQjtBQzVCRDs7OztHQUlHO0FBRUgsTUFBTSxJQUFJO0lBQ047O09BRUc7SUFDSSxNQUFNLENBQUMsT0FBTztRQUNqQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0Q7O09BRUc7SUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQVcsRUFBRSxJQUFrQjtRQUNqRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ25DO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBVztRQUNsQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxhQUFhO1FBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksYUFBYSxFQUFFLEVBQUU7WUFDakMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFXLEVBQUUsR0FBVyxFQUFFLEtBQWE7UUFDN0QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUNsQixLQUFLLElBQUksR0FBRyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztTQUMzQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBTyxZQUFZLENBQzVCLFFBQXlCLEVBQ3pCLElBQVksRUFDWixJQUFrQjs7WUFFbEIsNENBQTRDO1lBQzVDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRS9CLHFEQUFxRDtZQUNyRCxTQUFlLEdBQUc7O29CQUNkLE1BQU0sS0FBSyxHQUFtQixJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQ2xELFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUNuQyxDQUFDO29CQUNGLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUNqRCxJQUFJLEdBQUcsRUFBRTs0QkFDTCxPQUFPLElBQUksQ0FBQzt5QkFDZjs2QkFBTTs0QkFDSCxPQUFPLENBQUMsSUFBSSxDQUNSLGdCQUFnQixRQUFRLENBQUMsS0FBSyxpREFBaUQsSUFBSSxFQUFFLENBQ3hGLENBQUM7NEJBQ0YsT0FBTyxLQUFLLENBQUM7eUJBQ2hCO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7YUFBQTtZQUVELDBCQUEwQjtZQUMxQixJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLDRCQUE0QjtnQkFDNUIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3pCLCtCQUErQjtvQkFDL0IsTUFBTSxPQUFPLEdBQWMsRUFBRSxDQUFDO29CQUM5QixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTt3QkFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTs0QkFDckIsT0FBTyxDQUFDLElBQUksQ0FBVSxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsa0VBQWtFO29CQUNsRSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSTt3QkFBRSxPQUFPLEdBQUcsRUFBRSxDQUFDOzt3QkFDN0MsT0FBTyxLQUFLLENBQUM7b0JBRWxCLDJCQUEyQjtpQkFDOUI7cUJBQU07b0JBQ0gsT0FBTyxHQUFHLEVBQUUsQ0FBQztpQkFDaEI7Z0JBQ0QseUJBQXlCO2FBQzVCO2lCQUFNO2dCQUNILE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQVcsRUFBRSxHQUFXO1FBQzdDLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7WUFDbEIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQVc7UUFDcEMsT0FBTyxHQUFHO2FBQ0wsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7YUFDdkIsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7YUFDekIsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7YUFDckIsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7YUFDdkIsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQVdEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFXLEVBQUUsVUFBaUI7UUFDdEQsT0FBTyxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsS0FBSyxJQUFJO1lBQ2xELENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUN2QixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQVcsRUFBRSxVQUFrQixHQUFHO1FBQ3ZELE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUN6QixHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFhLEVBQUUsR0FBWTtRQUNuRCxJQUFJLElBQUksR0FBVyxFQUFFLENBQUM7UUFDdEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNyQixJQUFJLElBQUksR0FBRyxDQUFDO1lBQ1osSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxFQUFFO2dCQUMvQixJQUFJLElBQUksR0FBRyxDQUFDO2FBQ2Y7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVU7UUFDL0IsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtZQUMxQixPQUFvQixJQUFJLENBQUMsVUFBVyxDQUFDLGFBQWMsQ0FBQztTQUN2RDthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sUUFBUSxHQUFTLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sUUFBUSxHQUE2QixJQUFJLENBQUMsVUFBVyxDQUFDLGFBQWMsQ0FBQztZQUMzRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLE9BQU8sUUFBUSxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDbEQsTUFBTSxPQUFPLEdBQVcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFO1lBQzdDLFdBQVcsRUFBRSxNQUFNO1NBQ3RCLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLGdCQUFnQixDQUMxQixHQUEwQixFQUMxQixLQUFhLEVBQ2IsUUFBZ0I7UUFFaEIsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxhQUFhLEtBQUssSUFBSSxFQUFFO1lBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDOUU7YUFBTTtZQUNILEdBQUcsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQ2hDLFVBQVUsRUFDVixrREFBa0QsS0FBSyxpQ0FBaUMsUUFBUSwwQ0FBMEMsQ0FDN0ksQ0FBQztZQUVGLE9BQXVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxRQUFRLFFBQVEsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0wsQ0FBQztJQUVELHVDQUF1QztJQUN2Qzs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsZ0JBQWdCLENBQzFCLEdBQWdCLEVBQ2hCLE1BQWMsTUFBTSxFQUNwQixJQUFZLEVBQ1osUUFBZ0IsQ0FBQztRQUVqQixvQkFBb0I7UUFDcEIsTUFBTSxNQUFNLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUQsb0JBQW9CO1FBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDeEMsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1lBQ2hCLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDeEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxvQkFBb0I7UUFDcEIsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQ3RCLEVBQVUsRUFDVixJQUFZLEVBQ1osT0FBZSxJQUFJLEVBQ25CLEdBQXlCLEVBQ3pCLFdBQXVDLFVBQVUsRUFDakQsV0FBbUIsUUFBUTtRQUUzQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLDREQUE0RDtZQUM1RCwrRUFBK0U7WUFDL0UsTUFBTSxNQUFNLEdBQ1IsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDaEUsTUFBTSxHQUFHLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEQsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUNqQixNQUFNLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDO2FBQzdCO2lCQUFNO2dCQUNILE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO29CQUNkLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDZCxLQUFLLEVBQUUsUUFBUTtvQkFDZixJQUFJLEVBQUUsUUFBUTtpQkFDakIsQ0FBQyxDQUFDO2dCQUNILDBCQUEwQjtnQkFDMUIsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsZUFBZSxDQUN6QixHQUFnQixFQUNoQixPQUFZLEVBQ1osT0FBZ0IsSUFBSTtRQUVwQixHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDN0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDL0IsMkRBQTJEO1lBQzNELE1BQU0sR0FBRyxHQUFxRCxTQUFTLENBQUM7WUFDeEUsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUNuQixLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztnQkFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2FBQzNEO2lCQUFNO2dCQUNILHNCQUFzQjtnQkFFdEIsSUFBSSxJQUFJLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO29CQUNyQyw0QkFBNEI7b0JBQzVCLEdBQUcsQ0FBQyxTQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNILDJDQUEyQztvQkFDM0MsR0FBRyxDQUFDLFNBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQztvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7aUJBQ25EO2dCQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQzthQUM3QjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBVztRQUM3QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7WUFDckMsaUdBQWlHO1lBQ2pHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQixPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDN0QsT0FBTyxDQUFDLGtCQUFrQixHQUFHO2dCQUN6QixJQUFJLE9BQU8sQ0FBQyxVQUFVLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO29CQUNwRCxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNqQztZQUNMLENBQUMsQ0FBQztZQUNGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFnRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFPLGtCQUFrQixDQUNsQyxNQUF1Qjs7WUFFdkIsTUFBTSxjQUFjLEdBQVcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUM3Qyx1RUFBdUUsTUFBTSxFQUFFLENBQ2xGLENBQUM7WUFDRixNQUFNLFdBQVcsR0FBMkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN2RSx1QkFBdUI7WUFDdkIsT0FBTyxXQUFXLENBQUM7UUFDdkIsQ0FBQztLQUFBO0lBRU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFxQixFQUFFLElBQWMsRUFBRSxJQUFjO1FBQzlFLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvRCxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNmLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQzthQUFNLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ3RCLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQzthQUFNO1lBQ0gsT0FBTyxTQUFTLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtRQUN6RCxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUNQLGdCQUFnQixRQUFRLEtBQUssU0FBUyxhQUFhLFFBQVEsQ0FBQyxPQUFPLENBQy9ELEtBQUssQ0FDUixFQUFFLENBQ04sQ0FBQztTQUNMO1FBRUQscUJBQXFCO1FBQ3JCLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNoQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsTUFBTSxLQUFLLEdBQWEsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUNQLDRCQUE0QixTQUFTLDZCQUE2QixDQUNyRSxDQUFDO2lCQUNMO2dCQUNELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25CO2lCQUFNO2dCQUNILE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25CO1NBQ0o7YUFBTTtZQUNILE9BQU8sUUFBUSxDQUFDO1NBQ25CO0lBQ0wsQ0FBQzs7QUF4VkQ7Ozs7O0dBS0c7QUFDVyxvQkFBZSxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7SUFDNUMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQztBQXVORjs7OztHQUlHO0FBQ1csaUJBQVksR0FBRyxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQVUsRUFBRTtJQUM5RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM3RCxDQUFDLENBQUM7QUFFRjs7R0FFRztBQUNXLFVBQUssR0FBRyxDQUFDLENBQU0sRUFBaUIsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdEY7Ozs7R0FJRztBQUNXLGNBQVMsR0FBRyxDQUFDLElBQXVCLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRWpDOzs7Ozs7OztHQVFHO0FBQ1csbUJBQWMsR0FBRyxDQUFDLENBQWtCLEVBQVUsRUFBRTtJQUMxRCxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM5QyxDQUFDLENBQUM7QUFDRjs7Ozs7O0dBTUc7QUFDVyxhQUFRLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBVSxFQUFFO0lBQ2pFLE9BQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FDNUUsQ0FBQyxDQUNKLEVBQUUsQ0FBQztBQUNSLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNXLGlCQUFZLEdBQUcsQ0FBQyxHQUFnQixFQUFZLEVBQUU7SUFDeEQsSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FDaEIsQ0FBQztLQUNMO1NBQU07UUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7S0FDOUM7QUFDTCxDQUFDLENBQUM7QUErREY7O0dBRUc7QUFDVyxjQUFTLEdBQUc7SUFDdEI7Ozs7T0FJRztJQUNILFNBQVMsRUFBRSxDQUFDLElBQVksRUFBVSxFQUFFO1FBQ2hDLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0QixNQUFNLEdBQUcsR0FBYSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDckIsNEJBQTRCO1lBQzVCLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2hCLCtDQUErQztnQkFDL0MsTUFBTSxRQUFRLEdBQVcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQzdDLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtvQkFDZCxJQUFJLElBQUksR0FBRyxDQUFDO2lCQUNmO3FCQUFNO29CQUNILElBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO2lCQUNyQjthQUNKO2lCQUFNO2dCQUNILElBQUksSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO2FBQ3JCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxzQkFBc0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxjQUFjLEVBQUUsQ0FBQyxJQUFxQixFQUFFLEdBQVcsRUFBVSxFQUFFO1FBQzNELElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDO1FBQzFCLE1BQU0sS0FBSyxHQUFRO1lBQ2YsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDUCxNQUFNLEdBQUcsT0FBTyxDQUFDO1lBQ3JCLENBQUM7WUFDRCxNQUFNLEVBQUUsR0FBRyxFQUFFO2dCQUNULE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2QsR0FBRyxJQUFJLEtBQUssQ0FBQztZQUNqQixDQUFDO1NBQ0osQ0FBQztRQUNGLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7U0FDakI7UUFDRCxPQUFPLGdFQUFnRSxrQkFBa0IsQ0FDckYsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQ3ZCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsd0NBQXdDLE1BQU0sRUFBRSxDQUFDO0lBQzFFLENBQUM7Q0FDSixDQUFDO0FBRUY7Ozs7R0FJRztBQUNXLGlCQUFZLEdBQUcsQ0FDekIsSUFBNEIsRUFDNUIsT0FBZSxFQUFFLEVBQ25CLEVBQUU7SUFDQSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7S0FDL0Q7SUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQy9CLHlEQUF5RDtJQUN6RCxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QyxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDLENBQUEsQ0FBQztBQUVZLG1CQUFjLEdBQUcsQ0FDM0IsSUFBMEMsRUFDMUMsTUFBYyxDQUFDLEVBQ2pCLEVBQUU7SUFDQSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7S0FDakU7SUFDRCxNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7SUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQ3BCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNULFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsR0FBRyxFQUFFLENBQUM7U0FDVDtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQyxDQUFBLENBQUM7QUFFWSxrQkFBYSxHQUFHLENBQU8sSUFBMEMsRUFBRSxFQUFFO0lBQy9FLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztLQUNoRTtJQUNELE1BQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQztJQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDLENBQUEsQ0FBQztBQUVZLGNBQVMsR0FBRyxDQUN0QixPQUE0QixFQUM1QixVQUFVLEdBQUcsYUFBYSxFQUMxQixTQUFTLEdBQUcsYUFBYSxFQUMzQixFQUFFO0lBQ0EsTUFBTSxJQUFJLEdBQVUsRUFBRSxDQUFDO0lBRXZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNwQixNQUFNLEtBQUssR0FBMEIsR0FBRyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuRSxNQUFNLElBQUksR0FBMEIsR0FBRyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUM7QUN0bEJOLGdDQUFnQztBQUNoQzs7R0FFRztBQUNILE1BQU0sS0FBSztJQUlQOzs7O09BSUc7SUFDSSxNQUFNLENBQU8sUUFBUSxDQUFDLFFBQWdCOztZQUN6QyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsUUFBUSxFQUFFLEVBQUUsK0JBQStCLENBQUMsQ0FBQzthQUM5RTtZQUNELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUM7WUFDMUIsTUFBTSxLQUFLLEdBQUcsQ0FBTyxRQUFnQixFQUFnQyxFQUFFO2dCQUNuRSw0QkFBNEI7Z0JBQzVCLE1BQU0sSUFBSSxHQUF1QixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVsRSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQ3BCLE1BQU0sR0FBRyxRQUFRLGdCQUFnQixDQUFDO2lCQUNyQztnQkFDRCxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksUUFBUSxHQUFHLGFBQWEsRUFBRTtvQkFDM0MsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3JCLFFBQVEsRUFBRSxDQUFDO29CQUNYLE9BQU8sTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2hDO3FCQUFNLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxRQUFRLElBQUksYUFBYSxFQUFFO29CQUNuRCxRQUFRLEdBQUcsQ0FBQyxDQUFDO29CQUNiLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtxQkFBTSxJQUFJLElBQUksRUFBRTtvQkFDYixPQUFPLElBQUksQ0FBQztpQkFDZjtxQkFBTTtvQkFDSCxPQUFPLEtBQUssQ0FBQztpQkFDaEI7WUFDTCxDQUFDLENBQUEsQ0FBQztZQUVGLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNCLENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFPLFlBQVksQ0FDNUIsUUFBcUMsRUFDckMsUUFBMEIsRUFDMUIsU0FBK0I7UUFDM0IsU0FBUyxFQUFFLElBQUk7UUFDZixVQUFVLEVBQUUsSUFBSTtLQUNuQjs7WUFFRCxJQUFJLFFBQVEsR0FBdUIsSUFBSSxDQUFDO1lBQ3hDLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUM5QixRQUFRLEdBQXVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtvQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDbEQ7YUFDSjtZQUNELElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUNQLDBCQUEwQixRQUFRLEtBQUssUUFBUSxFQUFFLEVBQ2pELGtDQUFrQyxDQUNyQyxDQUFDO2FBQ0w7WUFDRCxNQUFNLFFBQVEsR0FBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVsRSxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwQyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsT0FBTztRQUNqQixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUMzQztRQUNELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQiw2Q0FBNkM7WUFDN0MsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzlCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7aUJBQzNDO2dCQUNELHdCQUF3QjtnQkFDeEIsV0FBVyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDZCw0QkFBNEI7b0JBQzVCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTt3QkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7d0JBQ3JDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDdEI7b0JBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTTtvQkFDSCxpQkFBaUI7b0JBQ2pCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTt3QkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7d0JBQ3BDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDdEI7b0JBQ0QsaUNBQWlDO29CQUNqQyxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNsQyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM1QixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0o7aUJBQU07Z0JBQ0gsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDbEMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUN0QjtnQkFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBcUI7UUFDcEMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFakQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLG1EQUFtRDtZQUNuRCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQzFCLG9FQUFvRTtnQkFDcEUsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDWixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3BCLDJEQUEyRDtpQkFDOUQ7cUJBQU0sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFO29CQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pCO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDbEI7Z0JBQ0Qsb0NBQW9DO2FBQ3ZDO2lCQUFNO2dCQUNILDJDQUEyQztnQkFDM0MsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7Z0JBQzlDLE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sT0FBTyxHQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLFdBQW1CLENBQUM7Z0JBQ3hCLHlEQUF5RDtnQkFDekQsTUFBTSxLQUFLLEdBQWlCO29CQUN4QixFQUFFLEVBQUUsTUFBTTtvQkFDVixXQUFXLEVBQUUsTUFBTTtvQkFDbkIsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLENBQUMsRUFBRSxTQUFTO29CQUNaLFdBQVcsRUFBRSxVQUFVO29CQUN2QixDQUFDLEVBQUUsTUFBTTtvQkFDVCxLQUFLLEVBQUUsT0FBTztvQkFDZCxHQUFHLEVBQUUsT0FBTztvQkFDWixZQUFZLEVBQUUsT0FBTztpQkFDeEIsQ0FBQztnQkFDRiw0REFBNEQ7Z0JBQzVELElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsT0FBTyxlQUFlLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQzFEO2dCQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFO29CQUNsRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxPQUFPLEVBQUU7d0JBQzVCLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQzdEO3lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUU7d0JBQ3ZDLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQzt3QkFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztxQkFDN0I7eUJBQU07d0JBQ0gsV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDaEM7b0JBQ0QsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFO3dCQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLFdBQVcsT0FBTyxDQUFDLENBQUM7cUJBQ25EO29CQUVELDZDQUE2QztvQkFDN0MsV0FBVyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUUzQyw2REFBNkQ7b0JBQzdELElBQUksQ0FBQyxTQUFTLEVBQUU7d0JBQ1osT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNyQiwyREFBMkQ7cUJBQzlEO3lCQUFNLElBQUksU0FBUyxLQUFLLFdBQVcsRUFBRTt3QkFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNqQjt5QkFBTTt3QkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2xCO2lCQUNKO3FCQUFNLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtvQkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDNUQ7YUFDSjtZQUNELElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtnQkFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDdEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBVztRQUMvQiwwRUFBMEU7UUFDMUUsT0FBTyxHQUFHLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2xELENBQUM7O0FBMU1hLFlBQU0sR0FBVyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUN4QyxhQUFPLEdBQXVCLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQ04xRSxpQ0FBaUM7QUFFakM7Ozs7R0FJRztBQUNILE1BQU0sS0FBSztJQUtQO1FBQ0ksK0RBQStEO1FBQy9ELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBRXRCLHVDQUF1QztRQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUV2Qyw2RUFBNkU7UUFDN0UsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDakM7YUFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLO1lBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRXZELHFCQUFxQjtRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCw4Q0FBOEM7SUFDOUMsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCx5Q0FBeUM7SUFDekMsSUFBSSxLQUFLLENBQUMsR0FBVztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0RBQWdEO0lBQ25DLGdCQUFnQjs7WUFDekIsTUFBTSxLQUFLLEdBQVcsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDM0QsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN4QjtZQUVELDhDQUE4QztZQUM5QyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxHQUEyQixRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLElBQUksRUFBRTtvQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUMzQztxQkFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7b0JBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRUQsa0RBQWtEO0lBQzNDLFVBQVU7UUFDYixNQUFNLEVBQUUsR0FBVyxRQUFRLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDOUIsTUFBTSxLQUFLLEdBQXFCLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEUsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDZCxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDbkUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEQ7YUFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLO1lBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxxREFBcUQ7SUFDN0MsYUFBYTtRQUNqQixPQUFPLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsbURBQW1EO0lBQzNDLGFBQWE7UUFDakIsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVPLFdBQVc7UUFDZixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxRQUFRLEdBQWtCLFFBQVE7aUJBQ25DLGFBQWEsQ0FBQywrQkFBK0IsQ0FBRTtpQkFDL0MsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFCLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUM5QixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDckI7aUJBQU0sSUFBSSxFQUFFLENBQUMsS0FBSztnQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FDekZELG9DQUFvQztBQUNwQzs7Ozs7Ozs7R0FRRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxNQUFNO0lBUVI7UUFQUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztZQUN6QixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSwwREFBMEQ7U0FDbkUsQ0FBQztRQUdFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLElBQXNCLEVBQUUsR0FBZ0I7UUFDbEQsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsQ0FBQztTQUM3QztRQUVELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQix5Q0FBeUM7WUFDekMsSUFBSSxJQUFJLEVBQUU7Z0JBQ04sbUNBQW1DO2dCQUNuQyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDdkIsc0NBQXNDO29CQUN0QyxNQUFNLFFBQVEsR0FBRyxDQUNiLEdBQWEsRUFDYixLQUFhLEVBQ0ssRUFBRTt3QkFDcEIsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFOzRCQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxLQUFLLElBQUksQ0FBQyxDQUFDO3lCQUN2Qzt3QkFDRCxrQ0FBa0M7d0JBQ2xDLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTs0QkFDakMsOEJBQThCOzRCQUM5QixJQUFJLEdBQUcsR0FBVyxPQUFPLEtBQUssWUFBWSxDQUFDOzRCQUMzQyxxQ0FBcUM7NEJBQ3JDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQ0FDakIsR0FBRyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUM7NEJBQzlCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDUixvQkFBb0I7NEJBQ3BCLEdBQUcsSUFBSSxPQUFPLENBQUM7NEJBRWYsT0FBTyxHQUFHLENBQUM7eUJBQ2Q7d0JBQ0QsT0FBTyxFQUFFLENBQUM7b0JBQ2QsQ0FBQyxDQUFDO29CQUVGLGdEQUFnRDtvQkFDaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFXLEVBQVEsRUFBRTt3QkFDckMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFOzRCQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDO3lCQUN2Qzt3QkFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7NEJBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLGdDQUFnQyxHQUFHLHNCQUFzQixDQUFDOzRCQUNyRixNQUFNLE1BQU0sR0FBWSxRQUFRLENBQUMsYUFBYSxDQUMxQyxrQkFBa0IsQ0FDcEIsQ0FBQzs0QkFDSCxNQUFNLFFBQVEsR0FBb0IsTUFBTSxDQUFDLGFBQWEsQ0FDbEQsTUFBTSxDQUNSLENBQUM7NEJBQ0gsSUFBSTtnQ0FDQSxJQUFJLFFBQVEsRUFBRTtvQ0FDViw0Q0FBNEM7b0NBQzVDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FDckIsT0FBTyxFQUNQLEdBQUcsRUFBRTt3Q0FDRCxJQUFJLE1BQU0sRUFBRTs0Q0FDUixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7eUNBQ25CO29DQUNMLENBQUMsRUFDRCxLQUFLLENBQ1IsQ0FBQztpQ0FDTDs2QkFDSjs0QkFBQyxPQUFPLEdBQUcsRUFBRTtnQ0FDVixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7b0NBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQ0FDcEI7NkJBQ0o7d0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDO29CQUVGLElBQUksT0FBTyxHQUFXLEVBQUUsQ0FBQztvQkFFekIsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO3dCQUNwQixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7NEJBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO3lCQUMxQzt3QkFDRCxvQkFBb0I7d0JBQ3BCLE9BQU8sR0FBRyw4REFBOEQsRUFBRSxDQUFDLE9BQU8sZ0JBQWdCLEVBQUUsQ0FBQyxTQUFTLHlGQUF5RixDQUFDO3dCQUN4TSxvQkFBb0I7d0JBQ3BCLE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFDaEQsT0FBTyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO3FCQUNuRDt5QkFBTSxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7d0JBQzVCLE9BQU87NEJBQ0gsZ1pBQWdaLENBQUM7d0JBQ3JaLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTs0QkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7eUJBQzdDO3FCQUNKO3lCQUFNLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTt3QkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxFQUFFLENBQUMsQ0FBQztxQkFDOUM7b0JBQ0QsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUVwQixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO3FCQUN0QjtvQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2QsNkJBQTZCO2lCQUNoQztxQkFBTTtvQkFDSCxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO3dCQUMzQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7cUJBQ3RCO29CQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDbEI7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRCxNQUFNLEtBQUs7SUFTUDtRQVJRLGNBQVMsR0FBb0I7WUFDakMsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLO1lBQ3pCLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUNBLG1GQUFtRjtTQUMxRixDQUFDO1FBR0UsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FDekpEOztHQUVHO0FBRUgsTUFBTSxRQUFRO0lBZVY7UUFkUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtZQUMxQixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsVUFBVTtZQUNqQixHQUFHLEVBQUUsb0JBQW9CO1lBQ3pCLE9BQU8sRUFBRTtnQkFDTCxPQUFPLEVBQUUsc0JBQXNCO2dCQUMvQixVQUFVLEVBQUUsaUJBQWlCO2dCQUM3QixRQUFRLEVBQUUsc0JBQXNCO2FBQ25DO1lBQ0QsSUFBSSxFQUFFLDJFQUEyRTtTQUNwRixDQUFDO1FBQ00sU0FBSSxHQUFXLFdBQVcsQ0FBQztRQUcvQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BELElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUs7UUFDVCxNQUFNLEtBQUssR0FBVyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RCxJQUFJLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM1QzthQUFNLElBQUksS0FBSyxLQUFLLFlBQVksRUFBRTtZQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVELE1BQU0sU0FBUztJQVNYO1FBUlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDMUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFdBQVc7WUFDbEIsSUFBSSxFQUFFLGdEQUFnRDtTQUN6RCxDQUFDO1FBQ00sU0FBSSxHQUFXLGNBQWMsQ0FBQztRQUdsQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BELElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUs7UUFDVCxRQUFRO2FBQ0gsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUU7YUFDekIsWUFBWSxDQUFDLE1BQU0sRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVELE1BQU0sYUFBYTtJQVNmO1FBUlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDMUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLGVBQWU7WUFDdEIsSUFBSSxFQUFFLHFDQUFxQztTQUM5QyxDQUFDO1FBQ00sU0FBSSxHQUFXLGNBQWMsQ0FBQztRQUdsQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BELElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUs7UUFDVCxNQUFNLFNBQVMsR0FBNkIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUUsTUFBTSxTQUFTLEdBQTZCLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFFLENBQUM7UUFFNUUseUJBQXlCO1FBQ3pCLHNDQUFzQztRQUN0Qzs7O29IQUc0RztRQUM1RyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNoRixTQUFTLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyw2Q0FBNkMsQ0FBQztRQUUxRSwyREFBMkQ7UUFDM0QsSUFBSSxPQUFPLEdBQVcsUUFBUSxDQUMxQixTQUFTLENBQUMsV0FBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FDdkUsQ0FBQztRQUVGLHlDQUF5QztRQUN6QyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLHdCQUF3QjtRQUN4QixTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsT0FBTyxVQUFVLENBQUM7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQsTUFBTSxlQUFlO0lBWWpCO1FBWFEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDMUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLGlCQUFpQjtZQUN4QixJQUFJLEVBQUUsaUVBQWlFO1NBQzFFLENBQUM7UUFDTSxTQUFJLEdBQVcsT0FBTyxDQUFDO1FBQ3ZCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBb0NuQixlQUFVLEdBQUcsQ0FBQyxFQUFVLEVBQVEsRUFBRTtZQUN0QyxNQUFNLFFBQVEsR0FBNkIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0UsSUFBSSxRQUFRLEdBQVcsRUFBRSxDQUFDO1lBRTFCLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBRXZDLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDbkIsUUFBUSxDQUFDLFNBQVMsSUFBSSw4QkFBOEIsUUFBUSxVQUFVLENBQUM7YUFDMUU7UUFDTCxDQUFDLENBQUM7UUFFTSxXQUFNLEdBQUcsQ0FBQyxFQUFVLEVBQVEsRUFBRTtZQUNsQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUM7UUFDTSxXQUFNLEdBQUcsR0FBVyxFQUFFO1lBQzFCLE1BQU0sTUFBTSxHQUF1QixXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7WUFDN0UsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN0QixPQUFPLENBQUMsQ0FBQzthQUNaO2lCQUFNO2dCQUNILE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNCO1FBQ0wsQ0FBQyxDQUFDO1FBdERFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDcEQsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSztRQUNELE1BQU0sV0FBVyxHQUE2QixRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRixtQkFBbUI7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFN0IsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3RCLDhDQUE4QztZQUM5QyxNQUFNLE9BQU8sR0FBcUIsV0FBVyxDQUFDLFdBQVksQ0FBQyxLQUFLLENBQzVELE1BQU0sQ0FDVyxDQUFDO1lBRXRCLG1CQUFtQjtZQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUU3QixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFFN0MseUJBQXlCO1lBQ3pCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNoQztTQUNKO0lBQ0wsQ0FBQztJQXlCRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQsTUFBTSxhQUFhO0lBUWY7UUFQUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtZQUMxQixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsZUFBZTtZQUN0QixJQUFJLEVBQUUsNkNBQTZDO1NBQ3RELENBQUM7UUFDTSxTQUFJLEdBQVcsb0JBQW9CLENBQUM7UUFFeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNwRCxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLE1BQU0sTUFBTSxHQUE2QixRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDaEYsTUFBTSxTQUFTLEdBQTRCLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFdkUsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsTUFBTSxTQUFTLEdBQWtCLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9ELDBDQUEwQztnQkFDMUMsTUFBTSxXQUFXLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRWxFLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNCLFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN6RSxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUM3QztZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUNsRSxDQUFDO0tBQUE7SUFFRCx5REFBeUQ7SUFDekQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVELE1BQU0sV0FBVztJQVNiLG1FQUFtRTtJQUNuRTtRQVRRLGNBQVMsR0FBb0I7WUFDakMsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsS0FBSyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzFCLElBQUksRUFBRSxzQ0FBc0M7U0FDL0MsQ0FBQztRQUNGLDZEQUE2RDtRQUNyRCxTQUFJLEdBQVcsT0FBTyxDQUFDO1FBRzNCLDZDQUE2QztRQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN4RCxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDYSxLQUFLOztZQUNmLE1BQU0sVUFBVSxHQUF5QixRQUFRLENBQUMsYUFBYSxDQUMzRCxvQkFBb0IsQ0FDdkIsQ0FBQztZQUNGLElBQUksVUFBVTtnQkFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEQsQ0FBQztLQUFBO0lBQ0QsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQ3BRRDs7R0FFRztBQUNILE1BQU0sVUFBVTtJQVNaO1FBUlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUk7WUFDeEIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFlBQVk7WUFDbkIsSUFBSSxFQUFFLDZDQUE2QztTQUN0RCxDQUFDO1FBQ00sU0FBSSxHQUFXLE9BQU8sQ0FBQztRQUczQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDOUQsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRWEsS0FBSzs7WUFDZixrREFBa0Q7WUFDbEQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JCLG1FQUFtRTtZQUNuRSxNQUFNLElBQUksR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0QsTUFBTSxPQUFPLEdBQXdCLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FDM0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUNqQyxDQUFDO1lBQ0YsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUN2Qiw4RUFBOEU7Z0JBQzlFLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGVBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RFLCtEQUErRDtnQkFDL0QsSUFBSSxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdEUseUJBQXlCO29CQUN6QixNQUFNLENBQUMsU0FBUyxHQUFHLEdBQUcsTUFBTSxDQUFDLFNBQVMsU0FBUyxDQUFDO29CQUNoRCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDckM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILGlFQUFpRTtZQUNqRSxJQUFJLGdCQUFnQixHQUF1QixXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUM5RSw2RUFBNkU7WUFDN0UsOENBQThDO1lBQzlDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDbkIsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO2FBQzVCO2lCQUFNLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFO2dCQUMzRSxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7YUFDN0I7aUJBQU0sSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQzthQUMxQjtZQUNELG1EQUFtRDtZQUNuRCxNQUFNLFdBQVcsR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtnQkFDdEIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsRUFBRSxFQUFFLGdCQUFnQjtnQkFDcEIsS0FBSyxFQUFFLDBCQUEwQjtnQkFDakMsS0FBSyxFQUFFLGdCQUFnQjthQUMxQixDQUFDLENBQUM7WUFDSCxpREFBaUQ7WUFDakQsT0FBTyxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUV2RCxnRkFBZ0Y7WUFDaEYsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUN0QyxTQUFTLEVBQ1QsWUFBWSxFQUNaLFFBQVEsRUFDUixnQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUN6QyxVQUFVLEVBQ1YsUUFBUSxDQUNYLENBQUM7WUFDRixxQ0FBcUM7WUFDckMsVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUVuQyxVQUFVLENBQUMsZ0JBQWdCLENBQ3ZCLE9BQU8sRUFDUCxHQUFTLEVBQUU7Z0JBQ1AsSUFBSSxTQUFTLEdBQVksSUFBSSxDQUFDO2dCQUM5QixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtvQkFDMUIsb0NBQW9DO29CQUNwQyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBRSxDQUFDLFNBQVM7d0JBQy9DLDhCQUE4QixDQUFDO29CQUNuQyw2QkFBNkI7b0JBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDekMsc0NBQXNDO3dCQUN0QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO3dCQUNsQywwQ0FBMEM7d0JBQzFDLE1BQU0sZUFBZSxHQUFzQixDQUN2QyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQzFDLENBQUMsS0FBSyxDQUFDO3dCQUNWLGtDQUFrQzt3QkFDbEMsTUFBTSxHQUFHLEdBQUcsd0VBQXdFLGVBQWUsV0FBVyxRQUFRLEVBQUUsQ0FBQzt3QkFDekgsbUNBQW1DO3dCQUNuQyxJQUFJLFNBQVMsRUFBRTs0QkFDWCxTQUFTLEdBQUcsS0FBSyxDQUFDO3lCQUNyQjs2QkFBTTs0QkFDSCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzFCO3dCQUNELHdCQUF3Qjt3QkFDeEIsTUFBTSxVQUFVLEdBQVcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLEVBQUUsQ0FBQyxLQUFLOzRCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUNyRCwrQkFBK0I7d0JBQy9CLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLEVBQUU7NEJBQ2hDLGVBQWU7NEJBQ2YsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLFNBQVMsQ0FBQzs0QkFDaEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQ2xDLHNDQUFzQzs0QkFDdEMsV0FBVyxDQUNQLGtCQUFrQixFQUNsQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksV0FBVyxDQUNwQyxrQkFBa0IsQ0FDckIsRUFBRSxDQUNOLENBQUM7eUJBQ0w7NkJBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxFQUFFOzRCQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7eUJBQzlDO3FCQUNKO2lCQUNKO2dCQUVELDJCQUEyQjtnQkFDMUIsVUFBK0IsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNqRCxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBRSxDQUFDLFNBQVM7b0JBQy9DLHNDQUFzQyxDQUFDO1lBQy9DLENBQUMsQ0FBQSxFQUNELEtBQUssQ0FDUixDQUFDO1lBRUYsMEJBQTBCO1lBQzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEUsOEZBQThGO1lBQzlGLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUN0RSxNQUFNLGFBQWEsR0FBOEIsQ0FDN0MsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUMxQyxDQUFDLEtBQUssQ0FBQztnQkFDVixNQUFNLE9BQU8sR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEUsSUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSTtvQkFDNUIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7b0JBQ3pCLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsRUFDOUI7b0JBQ0UsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ3hCLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUM3QztxQkFBTTtvQkFDSCxPQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztvQkFDekIsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxhQUFhLEVBQUUsQ0FBQyxDQUFDO2lCQUM5RDtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsdURBQXVEO1lBQ3ZELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FDdEMsVUFBVSxFQUNWLHVCQUF1QixFQUN2QixRQUFRLEVBQ1IscUJBQXFCLEVBQ3JCLFVBQVUsRUFDVixRQUFRLENBQ1gsQ0FBQztZQUVGLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFDMUQsVUFBVSxDQUFDLGdCQUFnQixDQUN2QixPQUFPLEVBQ1AsR0FBRyxFQUFFO2dCQUNELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO29CQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7d0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztxQkFDdEM7aUJBQ0o7WUFDTCxDQUFDLEVBQ0QsS0FBSyxDQUNSLENBQUM7WUFDRiwyREFBMkQ7WUFDM0QsSUFBSSxnQkFBZ0IsR0FBVyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBRSxDQUFDLFNBQVMsQ0FBQztZQUMxRSw4QkFBOEI7WUFDOUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNwQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQ3pDLENBQUMsRUFDRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQ2hDLENBQUM7YUFDTDtZQUNELDREQUE0RDtZQUM1RCxNQUFNLFdBQVcsR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRSxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNoRCxXQUFXLENBQUMsU0FBUyxHQUFHLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztZQUN4RCxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlELFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5RSxRQUFRO2lCQUNILGNBQWMsQ0FBQyxlQUFlLENBQUU7aUJBQ2hDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7UUFDdkUsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDSyxhQUFhO1FBQ2pCLHVCQUF1QjtRQUN2QixJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ2pDLGtFQUFrRTtZQUNsRSxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0QsSUFBSSxZQUFZLEdBQVcsRUFBRSxDQUFDO1lBQzlCLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7Z0JBQ3ZCLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO29CQUM5QixJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFO3dCQUNuQyx3REFBd0Q7d0JBQ3hELFlBQVksR0FBRyxZQUFZLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQzt3QkFDN0Msc0JBQXNCO3dCQUN0QixXQUFXLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLENBQUM7cUJBQ2pEO3lCQUFNO3dCQUNILE1BQU07cUJBQ1Q7aUJBQ0o7YUFDSjtTQUNKO2FBQU07WUFDSCwyQkFBMkI7WUFDM0IsV0FBVyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sUUFBUTtJQVVWO1FBVFEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUk7WUFDeEIsS0FBSyxFQUFFLFVBQVU7WUFDakIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxFQUFFLCtDQUErQztTQUN4RCxDQUFDO1FBQ00sU0FBSSxHQUFXLG1CQUFtQixDQUFDO1FBQ25DLGdCQUFXLEdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssTUFBTSxDQUFDO1FBQ3BELFVBQUssR0FBRyxRQUFRLENBQUM7UUFzQnpCLGtCQUFhLEdBQUcsR0FBd0IsRUFBRTtZQUN0QyxNQUFNLFNBQVMsR0FBdUIsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbEMsSUFBSSxFQUFFLENBQUMsS0FBSztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTlELElBQUksU0FBUyxJQUFJLElBQUksRUFBRTtnQkFDbkIsc0RBQXNEO2dCQUN0RCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEQ7OERBQzhDO2dCQUM5QyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDbkIsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTs0QkFDOUIsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO3lCQUNsQjtvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDSCxvREFBb0Q7Z0JBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7b0JBQzdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUM1QzthQUNKO2lCQUFNO2dCQUNILE9BQU87YUFDVjtRQUNMLENBQUMsQ0FBQSxDQUFDO1FBRUYsaUJBQVksR0FBRyxHQUFHLEVBQUU7WUFDaEIsTUFBTSxLQUFLLEdBQTBCLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNqRixJQUFJLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQztRQUVGLHNCQUFpQixHQUFHLENBQUMsUUFBZ0IsRUFBRSxPQUFpQixFQUFFLEVBQUU7WUFDeEQsTUFBTSxVQUFVLEdBQThCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0UsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO29CQUNuQixVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7aUJBQ3JDO3FCQUFNO29CQUNILFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztpQkFDckM7YUFDSjtRQUNMLENBQUMsQ0FBQztRQUVGLG9CQUFlLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPO1lBRWxCLDRCQUE0QjtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ25CLGtCQUFrQjtnQkFDbEIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtvQkFDbEIsS0FBSyxFQUFFLHlEQUF5RDtvQkFDaEUsS0FBSyxFQUFFLGFBQWE7aUJBQ3ZCLENBQUMsQ0FBQztnQkFDSCxvQkFBb0I7Z0JBQ3BCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNuQyxtRUFBbUU7b0JBQ25FLGdDQUFnQztvQkFDaEMsTUFBTSxhQUFhLEdBQXVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO3dCQUNuRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7d0JBQy9CLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ1QsSUFBSSxFQUFFLENBQUMsS0FBSzt3QkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsYUFBYSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUVsRSxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFDdEUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNmLHFEQUFxRDtvQkFDckQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUV6QyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTt3QkFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQzVDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILGlEQUFpRDtnQkFDakQsSUFBSSxLQUFLLENBQUMsVUFBVTtvQkFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQztRQUVGLGlCQUFZLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUU7WUFDdkIsSUFBSSxLQUFLLEdBQXVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUQsSUFBSSxFQUFFLENBQUMsS0FBSztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JFLElBQUksS0FBSyxFQUFFO2dCQUNQLGtFQUFrRTtnQkFDbEUsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNuRSxzQkFBc0I7Z0JBQ3RCLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hDO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsa0JBQWEsR0FBRyxHQUFzQyxFQUFFO1lBQ3BELE9BQU8sUUFBUSxDQUFDLGdCQUFnQixDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDO1FBakhFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM5RCxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLHdCQUF3QjtZQUN4QixrR0FBa0c7WUFFbEcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLHVEQUF1RDtZQUV2RCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUFBO0lBaUdELHlEQUF5RDtJQUN6RCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FDcldELG9DQUFvQztBQUVwQzs7Ozs7R0FLRztBQUVILE1BQU0sTUFBTTtJQUFaO1FBQ0k7OztXQUdHO1FBQ0gsaUhBQWlIO1FBQzFHLGdCQUFXLEdBQUcsQ0FDakIsR0FBVyxFQUNYLFlBQW9CLEVBQ08sRUFBRTtZQUM3QixJQUFJLEVBQUUsQ0FBQyxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxZQUFZLElBQUksQ0FBQyxDQUFDO1lBRTNFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMxQixNQUFNLFFBQVEsR0FBdUMsQ0FDakQsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FDOUIsQ0FBQztvQkFDRixJQUFJLFFBQVEsRUFBRTt3QkFDVixNQUFNLGFBQWEsR0FBVyxRQUFRLENBQ2xDLFdBQVcsQ0FBQyxHQUFHLFlBQVksTUFBTSxDQUFDLENBQ3JDLENBQUM7d0JBQ0YsSUFBSSxTQUFTLEdBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQzt3QkFDaEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxhQUFhLElBQUksU0FBUyxFQUFFOzRCQUNyRCxTQUFTLEdBQUcsYUFBYSxDQUFDO3lCQUM3Qjt3QkFDRCxRQUFRLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDdEI7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUN0QjtnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO1FBRUY7O1dBRUc7UUFDSSxrQkFBYSxHQUFHLEdBQTZDLEVBQUU7WUFDbEUsSUFBSSxFQUFFLENBQUMsS0FBSztnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDbkMsdUNBQXVDO2dCQUN2QyxLQUFLLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDaEQsNEJBQTRCO29CQUM1QixNQUFNLFVBQVUsR0FFZixRQUFRLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztvQkFDbkQsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7d0JBQ2pELE1BQU0sQ0FBQyxpQkFBaUIsVUFBVSxFQUFFLENBQUMsQ0FBQztxQkFDekM7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUN2QjtnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO1FBRUsscUJBQWdCLEdBQUcsR0FBRyxFQUFFO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztZQUUzRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUFBO0FDckVELGtDQUFrQztBQUNsQyxtQ0FBbUM7QUFFbkM7O0dBRUc7QUFDSCxNQUFNLGNBQWM7SUFZaEI7UUFYUSxjQUFTLEdBQW1CO1lBQ2hDLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLGdCQUFnQjtZQUN2QixHQUFHLEVBQUUsY0FBYztZQUNuQixXQUFXLEVBQUUsZUFBZTtZQUM1QixJQUFJLEVBQ0EscUhBQXFIO1NBQzVILENBQUM7UUFDTSxTQUFJLEdBQVcsZ0NBQWdDLENBQUM7UUFHcEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUs7UUFDVCxJQUFJLE1BQU0sRUFBRTthQUNQLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2FBQzVDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsTUFBTSxFQUFFLENBQUMsQ0FDL0QsQ0FBQztJQUNWLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLGVBQWU7SUFTakI7UUFSUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxpQkFBaUI7WUFDeEIsSUFBSSxFQUFFLHFDQUFxQztTQUM5QyxDQUFDO1FBQ00sU0FBSSxHQUFXLGFBQWEsQ0FBQztRQUdqQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDakUsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsaURBQWlEO2dCQUNqRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzFELElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDM0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUNoQjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7aUJBQ3ZFO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztZQUUzRCxNQUFNLFVBQVUsR0FFTCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUNyRSxNQUFNLFFBQVEsR0FBMkIsUUFBUSxDQUFDLGFBQWEsQ0FDM0QsOEJBQThCLENBQ2pDLENBQUM7WUFDRixNQUFNLFVBQVUsR0FFTCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsTUFBTSxNQUFNLEdBQTBCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hFLElBQUksT0FBMEIsRUFBRSxPQUEwQixDQUFDO1lBQzNELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUVqQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTlELGdDQUFnQztZQUNoQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM5QyxDQUFDLENBQUM7WUFFSCxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4QyxNQUFNLFNBQVMsR0FBcUMsQ0FDaEQsUUFBUSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUM1QyxDQUFDO1lBQ0YsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDckQ7WUFFRCx1QkFBdUI7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNqQixJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNoQixHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQ2pCLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7d0JBQ2xFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDMUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMxRCxDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7aUJBQzVDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxzQkFBc0I7WUFDdEIsT0FBTztpQkFDRixJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDWCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNqQixPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUM3RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3REO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztpQkFDNUM7WUFDTCxDQUFDLENBQUM7Z0JBQ0Ysc0JBQXNCO2lCQUNyQixJQUFJLENBQUMsR0FBUyxFQUFFO2dCQUNiLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3pELElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtvQkFDZCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3pELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsaUVBQWlFO29CQUNqRSxJQUFJLE9BQU8sS0FBSyxFQUFFLEVBQUU7d0JBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUN6QyxJQUFJLEVBQ0osR0FBRyxLQUFLLElBQUksT0FBTyxFQUFFLENBQ3hCLENBQUM7d0JBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ2xFO3lCQUFNLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTt3QkFDakIsT0FBTyxDQUFDLEdBQUcsQ0FDUCxpREFBaUQsS0FBSyxjQUFjLE9BQU8sRUFBRSxDQUNoRixDQUFDO3FCQUNMO2lCQUNKO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztpQkFDM0M7WUFDTCxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRVAsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FBQTtJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sZ0JBQWdCO0lBUWxCO1FBUFEsY0FBUyxHQUFvQjtZQUNqQyxJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsWUFBWSxDQUFDLGNBQWMsQ0FBQztZQUNuQyxLQUFLLEVBQUUsa0JBQWtCO1lBQ3pCLElBQUksRUFBRSw4REFBOEQ7U0FDdkUsQ0FBQztRQUNNLFNBQUksR0FBVyw4QkFBOEIsQ0FBQztRQUVsRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDakUsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRWEsS0FBSzs7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDeEQsK0JBQStCO1lBQy9CLE1BQU0sS0FBSyxHQUFXLFFBQVMsQ0FBQyxhQUFhLENBQUMsOEJBQThCLENBQUU7aUJBQ3pFLFdBQVksQ0FBQztZQUNsQixNQUFNLE9BQU8sR0FBa0MsUUFBUSxDQUFDLGdCQUFnQixDQUNwRSw4QkFBOEIsQ0FDakMsQ0FBQztZQUNGLE1BQU0sS0FBSyxHQUFXLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLE1BQU0sR0FBMEIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV2RSxzQkFBc0I7WUFDdEIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7YUFDM0M7WUFFRCx3QkFBd0I7WUFDeEIsTUFBTSxLQUFLLEdBQW1CLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUNyRCxNQUFNLEVBQ04sbUJBQW1CLEVBQ25CLFVBQVUsQ0FDYixDQUFDO1lBQ0YsMkJBQTJCO1lBQzNCLE1BQU0sS0FBSyxHQUFXLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDekUsZUFBZTtZQUNmLE1BQU0sR0FBRyxHQUFtQixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLGNBQWM7WUFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUE7SUFFRDs7Ozs7T0FLRztJQUNLLGdCQUFnQixDQUNwQixFQUFVLEVBQ1YsS0FBYSxFQUNiLE9BQXNDO1FBRXRDOzs7V0FHRztRQUNILE1BQU0sYUFBYSxHQUFHLENBQUMsVUFBNkIsRUFBRSxFQUFFO1lBQ3BELE9BQU8sUUFBUSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLENBQUMsSUFDdEUsVUFBVSxDQUFDLFdBQ2YsUUFBUSxDQUFDO1FBQ2IsQ0FBQyxDQUFDO1FBRUYsa0VBQWtFO1FBQ2xFLElBQUksV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUMvQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0UsbUJBQW1CO1FBQ25CLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsV0FBVyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN0RDtRQUVELE9BQU8sV0FBVyxFQUFFLElBQUksS0FBSyxnQkFBZ0IsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzlFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssWUFBWSxDQUFDLEdBQW1CLEVBQUUsT0FBZTtRQUNyRCxxQkFBcUI7UUFDckIsR0FBRyxDQUFDLFNBQVMsR0FBRyx5REFBeUQsT0FBTyxhQUFhLENBQUM7UUFDOUYsZUFBZTtRQUNmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QyxRQUFRLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRixnQkFBZ0I7UUFDaEIsT0FBdUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxZQUFZO0lBU2Q7UUFSUSxjQUFTLEdBQW9CO1lBQ2pDLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLEtBQUssRUFBRSxjQUFjO1lBQ3JCLElBQUksRUFBRSwyREFBMkQ7U0FDcEUsQ0FBQztRQUNNLFNBQUksR0FBVyxRQUFRLENBQUM7UUFHNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNhLEtBQUs7O1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBQ2pELHlCQUF5QjtZQUN6QixNQUFNLEtBQUssR0FBNkIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RSwwREFBMEQ7WUFDMUQsTUFBTSxPQUFPLEdBQTBCLFFBQVEsQ0FBQyxhQUFhLENBQ3pELDJCQUEyQixDQUM5QixDQUFDO1lBQ0YscUJBQXFCO1lBQ3JCLE1BQU0sSUFBSSxHQUEwQixRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RSxnQkFBZ0I7WUFDaEIsTUFBTSxJQUFJLEdBQTJCLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEUseUJBQXlCO1lBQ3pCLE1BQU0sT0FBTyxHQUEyQixRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTdFLHNFQUFzRTtZQUN0RSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNqRCxJQUFJLEVBQUUsQ0FBQyxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVqRix3Q0FBd0M7WUFDeEMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUNkLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxFQUFFLENBQUMsS0FBSztvQkFDUixPQUFPLENBQUMsR0FBRyxDQUNQLFdBQVcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQzdCLFVBQVUsS0FBSyxFQUFFLENBQ3BCLENBQUM7Z0JBRU4sOENBQThDO2dCQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssR0FBRyxLQUFLLEVBQUU7b0JBQ2hDLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxFQUFFO3dCQUNyQix3Q0FBd0M7d0JBQ3hDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsY0FBYyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQ3JELE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxDQUFDLGlDQUFpQztxQkFDekU7b0JBRUQsSUFBSSxLQUFLLElBQUksT0FBTyxFQUFFO3dCQUNsQiw2Q0FBNkM7d0JBQzdDLG1FQUFtRTt3QkFDbkUsSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFOzRCQUNaLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQzs0QkFDNUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO3lCQUMvQjt3QkFFRCxvREFBb0Q7d0JBQ3BELCtDQUErQzt3QkFDL0Msa0RBQWtEO3dCQUVsRCxJQUNJLEtBQUssR0FBRyxFQUFFOzRCQUNWLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLHFCQUFxQixDQUFDLEVBQ2pFOzRCQUNFLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQzs0QkFDcEMsb0NBQW9DOzRCQUNwQyx3Q0FBd0M7NEJBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQzs0QkFDL0Isc0VBQXNFOzRCQUN0RSxLQUFLLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDOzRCQUNuQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7NEJBQ2xDLDJEQUEyRDt5QkFDOUQ7NkJBQU0sSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFOzRCQUNuQixLQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7eUJBQzFDO3FCQUNKO2lCQUNKO2FBQ0o7UUFDTCxDQUFDO0tBQUE7SUFFTyxvQkFBb0I7UUFDeEIsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQixnRUFBZ0U7UUFDaEUsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFckIsOEVBQThFO1FBQzlFLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTVDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLGNBQWM7SUFXaEI7UUFWUSxjQUFTLEdBQW1CO1lBQ2hDLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLGdCQUFnQjtZQUN2QixHQUFHLEVBQUUsZUFBZTtZQUNwQixXQUFXLEVBQUUsY0FBYztZQUMzQixJQUFJLEVBQUUsaUdBQWlHO1NBQzFHLENBQUM7UUFDTSxTQUFJLEdBQVcsV0FBVyxDQUFDO1FBRy9CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLO1FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLGNBQWM7SUFXaEI7UUFWUSxjQUFTLEdBQW1CO1lBQ2hDLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLGdCQUFnQjtZQUN2QixHQUFHLEVBQUUsZUFBZTtZQUNwQixXQUFXLEVBQUUsY0FBYztZQUMzQixJQUFJLEVBQUUsbUdBQW1HO1NBQzVHLENBQUM7UUFDTSxTQUFJLEdBQVcsV0FBVyxDQUFDO1FBRy9CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLO1FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLGNBQWM7SUFXaEI7UUFWUSxjQUFTLEdBQW1CO1lBQ2hDLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLGdCQUFnQjtZQUN2QixHQUFHLEVBQUUsZUFBZTtZQUNwQixXQUFXLEVBQUUsWUFBWTtZQUN6QixJQUFJLEVBQUUsd0dBQXdHO1NBQ2pILENBQUM7UUFDTSxTQUFJLEdBQVcsV0FBVyxDQUFDO1FBRy9CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxLQUFLO1FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQsTUFBTSxlQUFlO0lBV2pCLG1FQUFtRTtJQUNuRTtRQVhRLGNBQVMsR0FBbUI7WUFDaEMsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsaUJBQWlCO1lBQ3hCLEtBQUssRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLEdBQUcsRUFBRSxlQUFlO1lBQ3BCLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLElBQUksRUFBRSx5RUFBeUU7U0FDbEYsQ0FBQztRQUNGLDZEQUE2RDtRQUNyRCxTQUFJLEdBQVcsV0FBVyxDQUFDO1FBRy9CLDZDQUE2QztRQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDakUsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ2EsS0FBSzs7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztLQUFBO0lBQ0QsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQ3RlRCxrQ0FBa0M7QUFDbEMsbUNBQW1DO0FBRW5DOztHQUVHO0FBQ0gsTUFBTSxXQUFXO0lBU2I7UUFSUSxjQUFTLEdBQW9CO1lBQ2pDLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztZQUN6QixLQUFLLEVBQUUsYUFBYTtZQUNwQixJQUFJLEVBQUUsZ0VBQWdFO1NBQ3pFLENBQUM7UUFDTSxTQUFJLEdBQVcsWUFBWSxDQUFDO1FBR2hDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUMvRCxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDYSxLQUFLOztZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUNsRCxzRkFBc0Y7WUFDdEYsTUFBTSxRQUFRLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckUsc0tBQXNLO1lBQ3RLLE1BQU0sVUFBVSxHQUF3QixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQzlELFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FDOUMsQ0FBQztZQUNGLDJCQUEyQjtZQUMzQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQzdCLGdFQUFnRTtnQkFDaEUsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLFNBQVMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyx1REFBdUQ7Z0JBQ3ZELElBQUksTUFBTSxHQUFpQixTQUFTLENBQUMsZUFBaUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzVFLGtJQUFrSTtnQkFDbEksSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO29CQUNuQixNQUFNLEdBQWlCLENBQ25CLFNBQVMsQ0FBQyxlQUFnQixDQUFDLGVBQWdCLENBQzdDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMzQjtnQkFDRCxzQ0FBc0M7Z0JBQ3RDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELGlGQUFpRjtnQkFDakYsV0FBVyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzVDLHVEQUF1RDtnQkFDdkQsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDekQsd0RBQXdEO2dCQUN4RCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCw2Q0FBNkM7Z0JBQzdDLFdBQVcsQ0FBQyxZQUFZLENBQ3BCLEtBQUssRUFDTCwyREFBMkQsQ0FDOUQsQ0FBQztnQkFDRiw4Q0FBOEM7Z0JBQzlDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3JDLHdHQUF3RztnQkFDeEcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFbkMscUNBQXFDO2dCQUNyQyxXQUFXLENBQUMsZ0JBQWdCLENBQ3hCLE9BQU8sRUFDUCxHQUFTLEVBQUU7b0JBQ1AsNEZBQTRGO29CQUM1RixJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTt3QkFDcEMsbUdBQW1HO3dCQUNuRyxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsYUFBYyxDQUFDLGFBQWM7NkJBQzNELGFBQWMsQ0FBQzt3QkFDcEIsNERBQTREO3dCQUM1RCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ2hFLDJDQUEyQzt3QkFDM0MsTUFBTSxPQUFPLEdBQWlCLENBQzFCLGNBQWMsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUUsQ0FDbkQsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3hCLG1EQUFtRDt3QkFDbkQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUUsQ0FBQyxTQUFTLENBQUM7d0JBQzVELDZCQUE2Qjt3QkFDN0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDbEQsc0RBQXNEO3dCQUN0RCxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO3dCQUNoQyxnQ0FBZ0M7d0JBQ2hDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUM3QixFQUFFLEVBQ0YsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQzlCLENBQUM7d0JBQ0Ysc0NBQXNDO3dCQUN0QyxNQUFNLFFBQVEsR0FBaUIsUUFBVSxDQUFDLFNBQVMsQ0FBQzt3QkFFcEQsMEJBQTBCO3dCQUMxQixJQUFJLEdBQUcsR0FBRyw2RUFBNkUsUUFBUSxZQUFZLE1BQU0sNkZBQTZGLE9BQU8sSUFBSSxVQUFVLFFBQVEsQ0FBQzt3QkFDNU8sdUJBQXVCO3dCQUN2QixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzlCLDZEQUE2RDt3QkFDN0QsTUFBTSxVQUFVLEdBQVcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLEVBQUUsQ0FBQyxLQUFLOzRCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUNyRCwrQkFBK0I7d0JBQy9CLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLEVBQUU7NEJBQ2hDLHNDQUFzQzs0QkFDdEMsV0FBVyxDQUFDLFdBQVcsQ0FDbkIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUNqRCxDQUFDOzRCQUNGLHNFQUFzRTt5QkFDekU7NkJBQU0sSUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUs7NEJBQzVCLDZDQUE2QyxFQUMvQzs0QkFDRSxXQUFXLENBQUMsV0FBVyxDQUNuQixRQUFRLENBQUMsY0FBYyxDQUNuQix5Q0FBeUMsQ0FDNUMsQ0FDSixDQUFDO3lCQUNMOzZCQUFNLElBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLOzRCQUM1QiwyREFBMkQsRUFDN0Q7NEJBQ0UsV0FBVyxDQUFDLFdBQVcsQ0FDbkIsUUFBUSxDQUFDLGNBQWMsQ0FDbkIsMENBQTBDLENBQzdDLENBQ0osQ0FBQzt5QkFDTDs2QkFBTTs0QkFDSCw2REFBNkQ7NEJBQzdELFdBQVcsQ0FBQyxXQUFXLENBQ25CLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FDN0MsQ0FBQzt5QkFDTDtxQkFDSjtnQkFDTCxDQUFDLENBQUEsRUFDRCxLQUFLLENBQ1IsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQzNJRDs7R0FFRztBQUNILE1BQU0sYUFBYTtJQUNmOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FDdkIsR0FBVyxFQUNYLEtBQWdCLEVBQ2hCLFFBQTJCO1FBRTNCLHVCQUF1QjtRQUN2QixLQUFLLENBQUMsWUFBWSxDQUNkLEdBQUcsRUFDSCxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ1IscURBQXFEO1lBQ3JELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDdkIsd0JBQXdCO2dCQUN4QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVUsRUFBRSxFQUFFO29CQUNyQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV2Qyx1REFBdUQ7b0JBQ3ZELDBDQUEwQztvQkFDMUMsSUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFFLENBQUM7d0JBQ3pDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUMxQzt3QkFDRSxPQUFPO3FCQUNWO29CQUNELHlDQUF5QztvQkFDekMsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUN6QyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7NEJBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQ1gsOENBQThDLENBQ2pELENBQUM7eUJBQ0w7d0JBQ0QsVUFBVTt3QkFDVixNQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsZ0JBQWdCLENBQ3hDLElBQUksRUFDSixnQkFBZ0IsRUFDaEIsTUFBTSxDQUNULENBQUM7d0JBQ0YsTUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDLGdCQUFnQixDQUMxQyxJQUFJLEVBQ0osVUFBVSxFQUNWLE1BQU0sQ0FDVCxDQUFDO3dCQUNGLFNBQVM7d0JBQ1QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFOzRCQUNuQixJQUNJLE1BQU0sSUFBSSxFQUFFLEtBQUssTUFBTTtnQ0FDdkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFDMUM7Z0NBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7NkJBQ25DO3dCQUNMLENBQUMsQ0FBQyxDQUFDO3FCQUNOO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLEVBQ0QsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUM7SUFDTixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBVyxFQUFFLE9BQWdCO1FBQzFELElBQUksRUFBRSxDQUFDLEtBQUs7WUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFcEUsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFxQixFQUFpQixFQUFFO1lBQzFELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7YUFDckM7aUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzthQUMzQjtpQkFBTTtnQkFDSCxPQUFPLElBQUksQ0FBQzthQUNmO1FBQ0wsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUE0QixFQUFpQixFQUFFO1lBQ2xFLElBQUksSUFBSSxFQUFFO2dCQUNOLE1BQU0sUUFBUSxHQUFrQixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25ELElBQUksUUFBUSxFQUFFO29CQUNWLGlCQUFpQjtvQkFDakIsTUFBTSxHQUFHLEdBQWEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FDaEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNoQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ2hCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDbkIsQ0FBQztpQkFDTDtxQkFBTTtvQkFDSCxPQUFPLElBQUksQ0FBQztpQkFDZjthQUNKO2lCQUFNO2dCQUNILE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLElBQUksRUFBRSxDQUFDLENBQUM7YUFDaEQ7UUFDTCxDQUFDLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRyxDQUFDLElBQVksRUFBRSxHQUFrQixFQUFVLEVBQUU7WUFDOUQsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDTixPQUFPLE9BQU8sSUFBSSxNQUFNLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0gsT0FBTyxXQUFXLEdBQUcsT0FBTyxJQUFJLGNBQWMsQ0FBQzthQUNsRDtRQUNMLENBQUMsQ0FBQztRQUVGLG9CQUFvQjtRQUNwQixNQUFNLFFBQVEsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RSx1QkFBdUI7UUFDdkIsS0FBSyxDQUFDLFlBQVksQ0FDZCxHQUFHLEVBQ0gsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNSLHFEQUFxRDtZQUNyRCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ3ZCLHdCQUF3QjtnQkFDeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFdkMsdURBQXVEO29CQUN2RCwwQ0FBMEM7b0JBQzFDLElBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBRSxDQUFDO3dCQUN6QyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFDMUM7d0JBQ0UsT0FBTztxQkFDVjtvQkFFRCw4QkFBOEI7b0JBQzlCLE1BQU0sU0FBUyxHQUEyQixJQUFJLENBQUMsVUFBVSxDQUNyRCxJQUFJLENBQ1AsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztvQkFDdkMsdURBQXVEO29CQUN2RCxNQUFNLFNBQVMsR0FBa0IsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMxRCxpREFBaUQ7b0JBQ2pELE1BQU0sUUFBUSxHQUFXLElBQUksQ0FBQyxnQkFBZ0IsQ0FDMUMsSUFBSSxFQUNKLFVBQVUsRUFDVixNQUFNLENBQ1QsQ0FBQztvQkFDRiwrSEFBK0g7b0JBQy9ILE1BQU0sV0FBVyxHQUFvQixRQUFRLENBQUMsYUFBYSxDQUN2RCxNQUFNLENBQ1QsQ0FBQztvQkFDRixtRUFBbUU7b0JBQ25FLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTt3QkFDZiw2SkFBNko7d0JBQzdKLFdBQVcsQ0FBQyxTQUFTLEdBQUcseUJBQXlCLENBQUM7d0JBQ2xELFdBQVc7NkJBQ04sYUFBYSxDQUFDLFFBQVEsQ0FBRTs2QkFDeEIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTs0QkFDNUIsMkNBQTJDOzRCQUMzQywrQ0FBK0M7NEJBQy9DLElBQUksUUFBUSxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7Z0NBQ3ZCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxZQUFZLENBQzVCLFFBQVEsRUFDUixTQUFTLENBQ1osSUFBSSxDQUFDOzZCQUNUO2lDQUFNO2dDQUNILFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FDYixRQUFRLENBQUMsS0FDYixJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQzs2QkFDNUM7NEJBQ0QsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNyQixDQUFDLENBQUMsQ0FBQztxQkFDVjtvQkFDRCxpRUFBaUU7eUJBQzVELElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTt3QkFDcEIsdUtBQXVLO3dCQUN2SyxXQUFXLENBQUMsU0FBUyxHQUFHLHlCQUF5QixDQUFDO3dCQUNsRCxXQUFXOzZCQUNOLGFBQWEsQ0FBQyxRQUFRLENBQUU7NkJBQ3hCLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7NEJBQzVCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUV2Qyx5QkFBeUI7NEJBQ3pCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxZQUFZLENBQzVCLFFBQVEsRUFDUixTQUFTLENBQ1osY0FBYyxJQUFJLGFBQWEsQ0FBQzs0QkFDakMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNyQixDQUFDLENBQUMsQ0FBQztxQkFDVjtvQkFDRCx5Q0FBeUM7b0JBQ3pDLFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBQ3BELG1EQUFtRDtvQkFDbkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxFQUNELEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUN0QixDQUFDO0lBQ04sQ0FBQztJQUVNLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBVyxFQUFFLE1BQWM7UUFDaEQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1FBQzdCLGtEQUFrRDtRQUNsRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVyxDQUFDLGFBQWMsQ0FBQyxnQkFBZ0IsQ0FDOUQsaUJBQWlCLENBQ3BCLENBQUMsTUFBTSxDQUFDO1FBQ1Qsa0NBQWtDO1FBQ2xDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDL0IsbURBQW1EO1lBQ25ELElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxHQUFHLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDMUI7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBWSxDQUFDLENBQUM7YUFDcEM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILGtEQUFrRDtRQUNsRCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM3QixRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQztRQUNELHNEQUFzRDtRQUN0RCw2Q0FBNkM7UUFDN0MsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QseURBQXlEO1FBQ3pELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNELElBQUksV0FBVyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNqQyxXQUFXLElBQUksV0FBVyxDQUFDO1NBQzlCO1FBQ0QsUUFBUTtRQUNSLE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsZ0JBQWdCLENBQzFCLEtBQVcsRUFDWCxHQUFXLEVBQ1gsR0FBb0I7UUFFcEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXhFLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM3QixNQUFNLFNBQVMsR0FBdUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLENBQ3RFLEdBQUcsQ0FDTixDQUFDO1lBQ0YsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNwQixJQUFJLFNBQXdCLENBQUM7Z0JBQzdCLElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtvQkFDaEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzNDO3FCQUFNO29CQUNILFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO2lCQUNyQztnQkFDRCxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7b0JBQ3BCLE9BQU8sU0FBUyxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7aUJBQ2xFO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO2FBQ2hFO1NBQ0o7YUFBTTtZQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztTQUM3RDtJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFXLEVBQUUsUUFBMEI7UUFDNUQsTUFBTSxTQUFTLEdBQWdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEQsSUFBSSxRQUFRLEtBQUssVUFBVSxFQUFFO1lBQ3pCLE1BQU0sV0FBVyxHQUF1QixXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN6RSxJQUFJLFdBQVcsRUFBRTtnQkFDYixTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLFdBQVcsR0FBRyxDQUFDO2FBQ3ZEO2lCQUFNO2dCQUNILFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLG9CQUFvQixDQUFDO2FBQ3JEO1NBQ0o7YUFBTSxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7WUFDNUIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0NBQ0o7QUFFRCxNQUFNLGFBQWE7SUFjZjtRQWJRLGNBQVMsR0FBbUI7WUFDaEMsS0FBSyxFQUFFLFlBQVksQ0FBQyxRQUFRO1lBQzVCLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLGVBQWU7WUFDdEIsR0FBRyxFQUFFLGlCQUFpQjtZQUN0QixXQUFXLEVBQUUsMEJBQTBCO1lBQ3ZDLElBQUksRUFDQSxzSUFBc0k7U0FDN0ksQ0FBQztRQUNNLFNBQUksR0FBVyxVQUFVLENBQUM7UUFDMUIsbUJBQWMsR0FBYSxFQUFFLENBQUM7UUFDOUIsY0FBUyxHQUFxQixVQUFVLENBQUM7UUFHN0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUMxRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLE1BQU0sT0FBTyxHQUF1QixXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN4RDtpQkFBTTtnQkFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7YUFDL0M7WUFDRCxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQzlELENBQUM7S0FBQTtJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sYUFBYTtJQVdmO1FBVlEsY0FBUyxHQUFtQjtZQUNoQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFFBQVE7WUFDNUIsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsZUFBZTtZQUN0QixHQUFHLEVBQUUsZ0JBQWdCO1lBQ3JCLFdBQVcsRUFBRSwwQkFBMEI7WUFDdkMsSUFBSSxFQUFFLG9MQUFvTDtTQUM3TCxDQUFDO1FBQ00sU0FBSSxHQUFXLFVBQVUsQ0FBQztRQUc5QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzFFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVhLEtBQUs7O1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7S0FBQTtJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVTtJQWFaO1FBWlEsY0FBUyxHQUFtQjtZQUNoQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFFBQVE7WUFDNUIsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsWUFBWTtZQUNuQixHQUFHLEVBQUUsWUFBWTtZQUNqQixXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLElBQUksRUFBRSxrSkFBa0o7U0FDM0osQ0FBQztRQUNNLFNBQUksR0FBVyxVQUFVLENBQUM7UUFDMUIsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFDM0IsY0FBUyxHQUFxQixNQUFNLENBQUM7UUFHekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUMxRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLE1BQU0sT0FBTyxHQUF1QixXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNyRDtpQkFBTTtnQkFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7YUFDL0M7WUFDRCxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FBQTtJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVTtJQVNaO1FBUlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFFBQVE7WUFDNUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFlBQVk7WUFDbkIsSUFBSSxFQUFFLDJDQUEyQztTQUNwRCxDQUFDO1FBQ00sU0FBSSxHQUFXLE1BQU0sQ0FBQztRQUcxQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzFFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVhLEtBQUs7O1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sTUFBTSxHQUFtQixRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBRSxDQUFDO1lBQy9ELE1BQU0sV0FBVyxHQUFHLE1BQU8sQ0FBQyxVQUFVLENBQUM7WUFFdkMscUVBQXFFO1lBQ3JFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDekMsNENBQTRDO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBcUIsQ0FBQztnQkFDdkMsdUNBQXVDO2dCQUN2QyxNQUFNLFVBQVUsR0FBRyxNQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQyxzQkFBc0I7Z0JBQ3RCLE1BQU0sWUFBWSxHQUFHLE1BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLHNDQUFzQztnQkFDdEMsSUFBSSxXQUFXLEdBQUcsWUFBYSxDQUFDLFNBQVMsQ0FBQztnQkFDMUMsbUZBQW1GO2dCQUNuRixXQUFXO29CQUNQLDZCQUE2Qjt3QkFDN0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDcEQsT0FBTzt3QkFDUCxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsMERBQTBEO2dCQUMxRCw2RkFBNkY7Z0JBQzdGLElBQ0ksQ0FBQyxNQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztvQkFDNUIsVUFBVyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUUsS0FBSyxHQUFHLEVBQzlDO29CQUNFLE9BQU87aUJBQ1Y7Z0JBQ0QsK0JBQStCO2dCQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQzFDLE1BQU0sU0FBUyxHQUF1QixRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUM1RSxHQUFHO29CQUNDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkIsUUFBUSxDQUFDLFNBQVUsQ0FBQyxhQUFhLEVBQUUsRUFBRTtnQkFDdEMsa0RBQWtEO2dCQUNsRCxNQUFNLFNBQVMsR0FBZ0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pFLGtEQUFrRDtnQkFDbEQsTUFBTSxRQUFRLEdBQVcsU0FBVSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUUsQ0FBQztnQkFDOUQsaUVBQWlFO2dCQUNqRSxJQUFJLGdCQUFnQixHQUF1QixXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDOUUsd0RBQXdEO2dCQUN4RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ25CLGdCQUFnQixHQUFHLEtBQUssQ0FBQztpQkFDNUI7cUJBQU0sSUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJO29CQUMvQixLQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFDakM7b0JBQ0UsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDO2lCQUM3QjtxQkFBTSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDckMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO2lCQUMxQjtnQkFDRCwrREFBK0Q7Z0JBQy9ELE1BQU0sVUFBVSxHQUFvQixRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRSxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDNUMsMEdBQTBHO2dCQUMxRyxVQUFVLENBQUMsU0FBUyxHQUFHLG1JQUFtSSxnQkFBZ0IsSUFBSSxDQUFDO2dCQUMvSyxtREFBbUQ7Z0JBQ25ELFNBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRCxvREFBb0Q7Z0JBQ3BELFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtvQkFDL0Qsc0RBQXNEO29CQUN0RCxNQUFNLGVBQWUsR0FBc0IsQ0FDdkMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FDeEMsQ0FBQyxLQUFLLENBQUM7b0JBQ1YsOENBQThDO29CQUM5QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO29CQUN0QyxpR0FBaUc7b0JBQ2pHLHdGQUF3RjtvQkFDeEYsTUFBTSxHQUFHLEdBQUcsd0VBQXdFLGVBQWUsV0FBVyxRQUFRLFlBQVksa0JBQWtCLENBQ2hKLFdBQVcsQ0FDZCxFQUFFLENBQUM7b0JBQ0osUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNoQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7b0JBQzlELFFBQVEsQ0FBQyxrQkFBa0IsR0FBRzt3QkFDMUIsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTs0QkFDdEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQy9DLDBGQUEwRjs0QkFDMUYsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDN0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzs0QkFDL0MsV0FBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDakMsdUJBQXVCOzRCQUN2QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0NBQ2QsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FDdEMsaUNBQWlDLEdBQUcsZUFBZSxDQUN0RCxDQUFDO2dDQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQy9CLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDOzZCQUN0QztpQ0FBTTtnQ0FDSCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUNyQyw2QkFBNkIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUM3QyxDQUFDO2dDQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7Z0NBQzlCLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzZCQUNuQzs0QkFDRCwwREFBMEQ7NEJBQzFELE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzt5QkFDMUM7d0JBQ0QsMERBQTBEO3dCQUMxRCxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7b0JBQzNDLENBQUMsQ0FBQztvQkFFRixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLDZHQUE2RztvQkFDN0csTUFBTTt5QkFDRCxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBRTt5QkFDNUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QixRQUFRO3lCQUNILGNBQWMsQ0FBQyxZQUFZLENBQUU7eUJBQzdCLFlBQVksQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUM5RCxNQUFNLGFBQWEsR0FBOEIsQ0FDN0MsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FDeEMsQ0FBQyxLQUFLLENBQUM7b0JBQ1YsSUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSTt3QkFDNUIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7d0JBQ3pCLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsRUFDOUI7d0JBQ0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO3FCQUN2RDt5QkFBTTt3QkFDSCxVQUFVLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7cUJBQ3hEO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxXQUFXO0lBV2I7UUFWUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsUUFBUTtZQUM1QixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsYUFBYTtZQUNwQixlQUFlO1lBQ2YsSUFBSSxFQUFFLDZDQUE2QztTQUN0RCxDQUFDO1FBQ00sU0FBSSxHQUFXLFVBQVUsQ0FBQztRQUMxQixpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUc3QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzFFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVhLEtBQUs7O1lBQ2YsYUFBYSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMvQyxDQUFDO0tBQUE7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVU7SUFXWjtRQVZRLGNBQVMsR0FBb0I7WUFDakMsS0FBSyxFQUFFLFlBQVksQ0FBQyxRQUFRO1lBQzVCLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxZQUFZO1lBQ25CLDBCQUEwQjtZQUMxQixJQUFJLEVBQUUsd0RBQXdEO1NBQ2pFLENBQUM7UUFDTSxTQUFJLEdBQVcsVUFBVSxDQUFDO1FBQzFCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDMUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRWEsS0FBSzs7WUFDZixhQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQzFELENBQUM7S0FBQTtJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVTtJQVNaO1FBUlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFFBQVE7WUFDNUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFlBQVk7WUFDbkIsSUFBSSxFQUFFLDBEQUEwRDtTQUNuRSxDQUFDO1FBQ00sU0FBSSxHQUFXLFVBQVUsQ0FBQztRQUc5QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzFFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVhLEtBQUs7O1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ2xELG1DQUFtQztZQUNuQyxNQUFNLFFBQVEsR0FBcUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN6RSxxR0FBcUc7WUFDckcsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDckIsMDBCQUEwMEIsQ0FDNzBCLENBQUM7WUFDRixrQkFBa0I7WUFDbEIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxpREFBaUQ7WUFDakQsTUFBTSxTQUFTLEdBQWdCLFFBQVMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckUsZ0NBQWdDO1lBQ2hDLFNBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLFNBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztZQUNsQyxxRkFBcUY7WUFDckYsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDakMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLFdBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztZQUN4QyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDckMsc0VBQXNFO1lBQ3RFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEQsYUFBYSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRCxhQUFhLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDO1lBQ2hELGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDckQsNkRBQTZEO1lBQzdELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEQsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1lBQ3hDLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDdEQsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNyRCw0Q0FBNEM7WUFDNUMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4RCxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ25ELDJCQUEyQjtZQUMzQixJQUFJLFdBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDOUIsOENBQThDO2dCQUM5QyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsbUJBQW1CO2dCQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNsQyxrRUFBa0U7b0JBQ2xFLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3hELGNBQWMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzlDLFlBQVksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzdDLENBQUMsQ0FBQyxDQUFDO2dCQUNILG1CQUFtQjthQUN0QjtpQkFBTTtnQkFDSCxxQ0FBcUM7Z0JBQ3JDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxtQkFBbUI7Z0JBQ25CLDBHQUEwRztnQkFDMUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDbEMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEQsY0FBYyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDOUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUVELHdEQUF3RDtZQUN4RCxXQUFXLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZDLFdBQVcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0Qyx1Q0FBdUM7WUFDdkMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRCxXQUFXLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDckMsV0FBVyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7WUFDaEMsaUVBQWlFO1lBQ2pFLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNwQyxZQUFZLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDM0MsWUFBWSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDbEMsbUNBQW1DO1lBQ25DLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3RDLFlBQVksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLGlDQUFpQztZQUNqQyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUNwQyxVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztZQUM5Qix1Q0FBdUM7WUFDdkMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyQyxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RDLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0QyxpREFBaUQ7WUFDakQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxRCxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEMsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BDLGNBQWMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQyxjQUFjLENBQUMsRUFBRSxHQUFHLG1CQUFtQixDQUFDO1lBQ3hDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QyxzQ0FBc0M7WUFDdEMsWUFBWSxDQUFDLGdCQUFnQixDQUN6QixPQUFPLEVBQ1AsR0FBUyxFQUFFO2dCQUNQLHFEQUFxRDtnQkFDckQsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFO29CQUN0QiwyREFBMkQ7b0JBQzNELFFBQVEsQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQztvQkFDdEMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUNwQjtZQUNMLENBQUMsQ0FBQSxFQUNELEtBQUssQ0FDUixDQUFDO1lBRUYsbUNBQW1DO1lBQ25DLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDekIsT0FBTyxFQUNQLEdBQVMsRUFBRTtnQkFDUCxvQ0FBb0M7Z0JBQ3BDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNsQyw4RUFBOEU7b0JBQzlFLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN4RCxXQUFXLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDdkQsaURBQWlEO29CQUNqRCxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7b0JBQzNDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDNUIsbURBQW1EO29CQUNuRCxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7b0JBQ3BDLHVFQUF1RTtvQkFDdkUsWUFBWSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7b0JBQzVCLCtCQUErQjtvQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDbEMsbUNBQW1DO3dCQUNuQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN4RCwwQ0FBMEM7d0JBQzFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzlDLHlCQUF5Qjt3QkFDekIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDN0MsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsa0NBQWtDO2lCQUNyQztxQkFBTTtvQkFDSCwyQkFBMkI7b0JBQzNCLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN4RCxxREFBcUQ7b0JBQ3JELGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDaEMsaURBQWlEO29CQUNqRCxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7b0JBQzNDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDNUIsbURBQW1EO29CQUNuRCxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7aUJBQ3ZDO2dCQUNELG1FQUFtRTtnQkFDbkUsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2pDLGFBQWEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFBLEVBQ0QsS0FBSyxDQUNSLENBQUM7WUFFRixnREFBZ0Q7WUFDaEQsVUFBVSxDQUFDLGdCQUFnQixDQUN2QixPQUFPLEVBQ1AsR0FBUyxFQUFFO2dCQUNQLDJEQUEyRDtnQkFDM0QsSUFBSSxjQUFjLENBQUMsS0FBSyxJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUU7b0JBQzdDLHlGQUF5RjtvQkFDekYsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUM1RCxnSkFBZ0o7b0JBQ2hKLElBQUksQ0FDQSxXQUFXLEdBQUcsWUFBWSxHQUFHLEtBQUssR0FBRyxjQUFjLENBQUMsS0FBSyxHQUFHLElBQUksQ0FDbkUsQ0FBQztvQkFDRix1REFBdUQ7b0JBQ3ZELFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN2RCx3REFBd0Q7b0JBQ3hELFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztvQkFDM0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUM1QiwrQ0FBK0M7b0JBQy9DLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDaEMsZ0VBQWdFO29CQUNoRSxZQUFZLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztvQkFDNUIsOEJBQThCO29CQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUNsQywyQkFBMkI7d0JBQzNCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hELDRCQUE0Qjt3QkFDNUIsY0FBYyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDOUMsNEhBQTRIO3dCQUM1SCxjQUFjLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDL0QsaUJBQWlCO3dCQUNqQixZQUFZLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUM3QyxDQUFDLENBQUMsQ0FBQztpQkFDTjtZQUNMLENBQUMsQ0FBQSxFQUNELEtBQUssQ0FDUixDQUFDO1lBRUYsa0RBQWtEO1lBQ2xELFdBQVcsQ0FBQyxnQkFBZ0IsQ0FDeEIsT0FBTyxFQUNQLEdBQVMsRUFBRTtnQkFDUCwwQ0FBMEM7Z0JBQzFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixjQUFjLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDMUIsbUVBQW1FO2dCQUNuRSxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDakMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUEsRUFDRCxLQUFLLENBQ1IsQ0FBQztZQUVGLG9GQUFvRjtZQUVwRixnRUFBZ0U7WUFDaEUsYUFBYSxDQUFDLGdCQUFnQixDQUMxQixPQUFPLEVBQ1AsR0FBUyxFQUFFO2dCQUNQLG1CQUFtQjtnQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUU7b0JBQ3RCLG9EQUFvRDtvQkFDcEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7d0JBQ3ZCLG9CQUFvQjt3QkFDcEIsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO3dCQUN0QyxtQkFBbUI7d0JBQ25CLFNBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQzt3QkFDbEMscUNBQXFDO3dCQUNyQyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7d0JBQ3RDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQzt3QkFDNUIsa0dBQWtHO3FCQUNyRzt5QkFBTTt3QkFDSCxzREFBc0Q7d0JBQ3RELFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQzt3QkFDNUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO3FCQUNwQztvQkFDRCxvQ0FBb0M7b0JBQ3BDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztpQkFDdkM7Z0JBQ0QsdUNBQXVDO3FCQUNsQztvQkFDRCw4QkFBOEI7b0JBQzlCLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDbEMscURBQXFEO29CQUNyRCxTQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7b0JBQ2pDLG9EQUFvRDtvQkFDcEQsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUU7d0JBQ2xELHlHQUF5Rzt3QkFDekcsMkVBQTJFO3dCQUMzRSxjQUFjLENBQUMsS0FBSzs0QkFDaEIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNyRCxxRUFBcUU7d0JBQ3JFLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzt3QkFDaEMsK0NBQStDO3dCQUMvQyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUM7d0JBQzNDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQzt3QkFDNUIsc0NBQXNDO3FCQUN6Qzt5QkFBTTt3QkFDSCxnREFBZ0Q7d0JBQ2hELFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQzt3QkFDNUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO3dCQUNqQyxtREFBbUQ7d0JBQ25ELFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztxQkFDdkM7aUJBQ0o7WUFDTCxDQUFDLENBQUEsRUFDRCxLQUFLLENBQ1IsQ0FBQztZQUVGLHdEQUF3RDtZQUN4RCxjQUFjLENBQUMsZ0JBQWdCLENBQzNCLE9BQU8sRUFDUCxHQUFTLEVBQUU7Z0JBQ1AsNkJBQTZCO2dCQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRTtvQkFDdEIsNkNBQTZDO29CQUM3QyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7b0JBQzVDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztvQkFDakMsb0JBQW9CO29CQUNwQixZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7aUJBQ3ZDO2dCQUNELCtCQUErQjtxQkFDMUIsSUFDRCxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNoRCxjQUFjLENBQUMsS0FBSzt3QkFDaEIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUN0RDtvQkFDRSwyQ0FBMkM7b0JBQzNDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztvQkFDNUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO29CQUNqQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7b0JBQ2hDLG9IQUFvSDtpQkFDdkg7cUJBQU0sSUFDSCxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNoRCxjQUFjLENBQUMsS0FBSzt3QkFDaEIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUN0RDtvQkFDRSx3Q0FBd0M7b0JBQ3hDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztvQkFDM0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUM1QixZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7b0JBQ2hDLDJFQUEyRTtpQkFDOUU7cUJBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDMUQsVUFBVSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO29CQUM1QyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7b0JBQ2pDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztpQkFDdkM7WUFDTCxDQUFDLENBQUEsRUFDRCxLQUFLLENBQ1IsQ0FBQztZQUNGLHVEQUF1RDtZQUN2RCxTQUFTLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25DLFNBQVMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDMUMsQ0FBQztLQUFBO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQy82QkQsa0NBQWtDO0FBQ2xDOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLGNBQWM7SUFhaEI7UUFaUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtZQUMxQixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLElBQUksRUFBRSx3REFBd0Q7U0FDakUsQ0FBQztRQUNNLFNBQUksR0FBVyxNQUFNLENBQUM7UUFDdEIsZUFBVSxHQUFZLElBQUksQ0FBQztRQUUzQixrQkFBYSxHQUFXLHlCQUF5QixDQUFDO1FBQ2xELFdBQU0sR0FBVyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBR2xDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLElBQUksTUFBNEIsQ0FBQztZQUNqQyxJQUFJLFVBQW9ELENBQUM7WUFDekQsSUFBSSxPQUF3QyxDQUFDO1lBQzdDLE1BQU0sV0FBVyxHQUF1QixXQUFXLENBQy9DLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLE9BQU8sQ0FDakMsQ0FBQztZQUVGLElBQUksV0FBVyxLQUFLLE9BQU8sSUFBSSxXQUFXLENBQUMsc0JBQXNCLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3pFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtZQUVELE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDO1lBRS9FLG9EQUFvRDtZQUNwRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FDdkIsZ0JBQWdCLEVBQ2hCLFVBQVUsRUFDVixJQUFJLEVBQ0osZUFBZSxFQUNmLGFBQWEsRUFDYixlQUFlLENBQ2xCLENBQUM7Z0JBQ0YsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUM3QyxDQUFDLENBQUM7WUFFSCxNQUFNO2lCQUNELElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLDRCQUE0QjtnQkFDNUIsR0FBRyxDQUFDLGdCQUFnQixDQUNoQixPQUFPLEVBQ1AsR0FBRyxFQUFFO29CQUNELElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7d0JBQzFCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO3dCQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUM1Qjt5QkFBTTt3QkFDSCxHQUFHLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQzt3QkFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDM0I7b0JBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDLEVBQ0QsS0FBSyxDQUNSLENBQUM7WUFDTixDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUVQLFVBQVU7aUJBQ0wsSUFBSSxDQUFDLENBQU8sR0FBRyxFQUFFLEVBQUU7Z0JBQ2hCLE9BQU8sR0FBRyxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1lBQzFELENBQUMsQ0FBQSxDQUFDO2lCQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1AsNkJBQTZCO2dCQUM3QixLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzVCLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUV6QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQU8sR0FBRyxFQUFFLEVBQUU7d0JBQzFCLE9BQU8sR0FBRyxHQUFHLENBQUM7d0JBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7d0JBQ3ZCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDckQsQ0FBQyxDQUFBLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNLLGNBQWMsQ0FBQyxJQUFxQyxFQUFFLE1BQWM7UUFDeEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3BCLE1BQU0sR0FBRyxHQUEyQyxDQUNoRCxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFFLENBQ2hELENBQUM7WUFFRixtREFBbUQ7WUFDbkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU1QyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7Z0JBQ2pCLHdCQUF3QjtnQkFDeEIsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtvQkFDM0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztpQkFDakM7cUJBQU07b0JBQ0gsR0FBRyxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQztpQkFDdEM7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLFlBQVksQ0FBQyxHQUFZO1FBQzdCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDcEU7UUFDRCxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssT0FBTyxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUM5QztRQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxHQUFZO1FBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLG9CQUFvQjtJQVN0QjtRQVJRLGNBQVMsR0FBb0I7WUFDakMsS0FBSyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzFCLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxzQkFBc0I7WUFDN0IsSUFBSSxFQUFFLDhDQUE4QztTQUN2RCxDQUFDO1FBQ00sU0FBSSxHQUFXLE1BQU0sQ0FBQztRQUcxQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDaEUsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSztRQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxlQUFlO0lBY2pCO1FBYlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDMUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLGlCQUFpQjtZQUN4QixJQUFJLEVBQUUsZ0RBQWdEO1NBQ3pELENBQUM7UUFDTSxTQUFJLEdBQVcsU0FBUyxDQUFDO1FBQ3pCLFlBQU8sR0FBaUMsV0FBVyxDQUN2RCxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxPQUFPLENBQ2pDLENBQUM7UUFDTSxXQUFNLEdBQVcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUM5QixlQUFVLEdBQVcsRUFBRSxDQUFDO1FBRzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLElBQUksU0FBK0IsQ0FBQztZQUNwQyxJQUFJLE9BQW9CLENBQUM7WUFDekIsSUFBSSxVQUFvRCxDQUFDO1lBRXpELDJEQUEyRDtZQUMzRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FDMUIsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixLQUFLLEVBQ0wsTUFBTSxFQUNOLGFBQWEsRUFDYix1QkFBdUIsQ0FDMUIsQ0FBQztnQkFDRixDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQzdDLENBQUMsQ0FBQztZQUVILHFDQUFxQztZQUNyQyxVQUFVO2lCQUNMLElBQUksQ0FBQyxDQUFPLEdBQUcsRUFBRSxFQUFFO2dCQUNoQix3QkFBd0I7Z0JBQ3hCLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQzdCLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsS0FBSyxFQUNMLGlCQUFpQixFQUNqQixVQUFVLEVBQ1YscUJBQXFCLENBQ3hCLENBQUM7Z0JBQ0YsMEJBQTBCO2dCQUMxQixPQUFPLENBQUMsa0JBQWtCLENBQ3RCLFVBQVUsRUFDViw0RUFBNEUsQ0FDL0UsQ0FBQztnQkFDRiwyQkFBMkI7Z0JBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxRQUFRLENBQUMsYUFBYSxDQUNsQixxQkFBcUIsQ0FDdkIsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDL0IsMEJBQTBCO2dCQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFBLENBQUM7aUJBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUCw2QkFBNkI7Z0JBQzdCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDNUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBRSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7b0JBQzlELFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUN6QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQU8sR0FBRyxFQUFFLEVBQUU7d0JBQzFCLDJCQUEyQjt3QkFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2xELFFBQVEsQ0FBQyxhQUFhLENBQ2xCLHFCQUFxQixDQUN2QixDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUNuQyxDQUFDLENBQUEsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFUCxrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFakMscUNBQXFDO1lBQ3JDLFNBQVM7aUJBQ0osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1YsR0FBRyxDQUFDLGdCQUFnQixDQUNoQixPQUFPLEVBQ1AsR0FBRyxFQUFFO29CQUNELDRDQUE0QztvQkFDNUMsTUFBTSxPQUFPLEdBQStCLFFBQVEsQ0FBQyxhQUFhLENBQzlELHFCQUFxQixDQUN4QixDQUFDO29CQUNGLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTt3QkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO3FCQUM3Qzt5QkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO3dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7d0JBQ2hDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLENBQUM7cUJBQ3BDO3lCQUFNO3dCQUNILElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzt3QkFDL0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztxQkFDcEM7Z0JBQ0wsQ0FBQyxFQUNELEtBQUssQ0FDUixDQUFDO1lBQ04sQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFUCxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7UUFDM0QsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0ssYUFBYSxDQUFDLEdBQWlDO1FBQ25ELElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNuQixHQUFHLEdBQUcsT0FBTyxDQUFDO1NBQ2pCLENBQUMsZ0JBQWdCO1FBQ2xCLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUN2QixDQUFDO0lBRWEsZUFBZSxDQUN6QixPQUF3Qzs7WUFFeEMsSUFBSSxJQUFJLEdBQVcsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDckIsd0JBQXdCO2dCQUN4QixJQUFJLEtBQUssR0FBVyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksV0FBVyxHQUFXLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxTQUFTLEdBQVcsRUFBRSxDQUFDO2dCQUMzQixJQUFJLFNBQVMsR0FBVyxFQUFFLENBQUM7Z0JBQzNCLDhDQUE4QztnQkFDOUMsTUFBTSxRQUFRLEdBQTZCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNFLE1BQU0sVUFBVSxHQUVMLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxRQUFRLEdBQXlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FDeEUsU0FBUyxDQUNaLENBQUM7Z0JBQ0YsTUFBTSxRQUFRLEdBQXlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FDeEUsV0FBVyxDQUNkLENBQUM7Z0JBRUYsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO29CQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2lCQUN0RDtxQkFBTTtvQkFDSCxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDeEM7Z0JBRUQsaUJBQWlCO2dCQUNqQixJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzlDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTt3QkFDMUIsV0FBVyxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsS0FBSyxDQUFDO29CQUM5QyxDQUFDLENBQUMsQ0FBQztvQkFDSCxxREFBcUQ7b0JBQ3JELFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUMvRCxXQUFXLEdBQUcsS0FBSyxXQUFXLEdBQUcsQ0FBQztpQkFDckM7Z0JBQ0Qsa0JBQWtCO2dCQUNsQixJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzFDLFNBQVMsR0FBRyxLQUFLLENBQUM7b0JBQ2xCLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDdEIsU0FBUyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsT0FBTyxDQUFDO29CQUM1QyxDQUFDLENBQUMsQ0FBQztvQkFDSCxzQkFBc0I7b0JBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUM1RDtnQkFDRCxvQkFBb0I7Z0JBQ3BCLElBQUksUUFBUSxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDMUMsU0FBUyxHQUFHLEtBQUssQ0FBQztvQkFDbEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO3dCQUN0QixTQUFTLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxPQUFPLENBQUM7b0JBQzVDLENBQUMsQ0FBQyxDQUFDO29CQUNILHNCQUFzQjtvQkFDdEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzVEO2dCQUNELElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxXQUFXLElBQUksU0FBUyxJQUFJLFNBQVMsSUFBSSxDQUFDO1lBQ2pFLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUFBO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksTUFBTSxDQUFDLEdBQWlDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLGVBQWU7SUFXakI7UUFWUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtZQUMxQixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsaUJBQWlCO1lBQ3hCLElBQUksRUFBRSxnREFBZ0Q7U0FDekQsQ0FBQztRQUNNLFNBQUksR0FBVyxtQkFBbUIsQ0FBQztRQUNuQyxZQUFPLEdBQVcsTUFBTSxDQUFDO1FBQ3pCLFlBQU8sR0FBcUIsT0FBTyxDQUFDO1FBR3hDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLE1BQU0sU0FBUyxHQUEwQixRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRSxJQUFJLFNBQVMsRUFBRTtnQkFDWCwwREFBMEQ7Z0JBQzFELE1BQU0sS0FBSyxHQUEwQixTQUFTLENBQUMsYUFBYSxDQUN4RCxrQkFBa0IsQ0FDckIsQ0FBQztnQkFDRixJQUFJLEtBQUssRUFBRTtvQkFDUCxzQkFBc0I7b0JBQ3RCLEtBQUssQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO29CQUNsQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7b0JBQy9CLHdCQUF3QjtvQkFDeEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7d0JBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBVSxDQUFDLENBQUM7b0JBQzdCLENBQUMsQ0FBQyxDQUFDO2lCQUNOO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztpQkFDbkU7Z0JBQ0QseUJBQXlCO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtvQkFDcEIsS0FBSyxFQUFFLFVBQVUsSUFBSSxDQUFDLE9BQU8sbUJBQW1CO2lCQUNuRCxDQUFDLENBQUM7Z0JBQ0gsa0JBQWtCO2dCQUNsQixNQUFNLFlBQVksR0FBOEIsUUFBUSxDQUFDLGFBQWEsQ0FDbEUsZ0JBQWdCLENBQ25CLENBQUM7Z0JBQ0YsTUFBTSxTQUFTLEdBQTZCLFFBQVEsQ0FBQyxhQUFhLENBQzlELG9CQUFvQixDQUN2QixDQUFDO2dCQUNGLElBQUksWUFBWTtvQkFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Z0JBQ3RELElBQUksU0FBUztvQkFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Z0JBRWhELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzthQUNqRDtpQkFBTTtnQkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7YUFDekU7UUFDTCxDQUFDO0tBQUE7SUFFYSxPQUFPLENBQUMsSUFBb0I7O1lBQ3RDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxPQUFPLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztnQkFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7YUFDekI7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7YUFDMUI7WUFDRCxJQUFJLEVBQUUsQ0FBQyxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQUE7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFNBQVM7SUFVWDtRQVRRLGNBQVMsR0FBb0I7WUFDakMsS0FBSyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzFCLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxXQUFXO1lBQ2xCLElBQUksRUFBRSx1Q0FBdUM7U0FDaEQsQ0FBQztRQUNNLFNBQUksR0FBVyxNQUFNLENBQUM7UUFDdEIsV0FBTSxHQUFXLElBQUksTUFBTSxFQUFFLENBQUM7UUFnQ3RDOzs7V0FHRztRQUNLLHNCQUFpQixHQUFHLENBQUMsR0FBd0IsRUFBRSxFQUFFO1lBQ3JELE1BQU0sT0FBTyxHQUFvQixHQUFHLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRWxFLElBQUksRUFBRSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVyQywrQkFBK0I7WUFDL0IsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEUsaURBQWlEO1lBQ2pELFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCw0Q0FBNEM7WUFDNUMsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ25ELDRCQUE0QjtZQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRSwyQ0FBMkM7WUFDM0MsTUFBTSxNQUFNLEdBQTJCLEdBQUcsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDckUsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNwQztZQUVELElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDdEI7UUFDTCxDQUFDLENBQUM7UUFFRjs7OztXQUlHO1FBQ0ssaUJBQVksR0FBRyxDQUFDLElBQWMsRUFBRSxHQUFvQixFQUFFLEVBQUU7WUFDNUQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDakIseUJBQXlCO2dCQUN6QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDaEMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakQsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO2dCQUMzQixNQUFNLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsOEJBQThCO2dCQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ2pCLE1BQU0sQ0FBQyxTQUFTLElBQUksNERBQTRELGtCQUFrQixDQUM5RixHQUFHLENBQ04sdUNBQXVDLEdBQUcsTUFBTSxDQUFDO2dCQUN0RCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQyxDQUFDO1FBOUVFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFOUMsaUJBQWlCO1lBQ2pCLFdBQVc7aUJBQ04sSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUM7aUJBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUCw2QkFBNkI7Z0JBQzdCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDNUIsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQzFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDekIsdUJBQXVCO3dCQUN2QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUN6QyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztLQUFBO0lBcURELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVTtJQVNaO1FBUlEsY0FBUyxHQUFvQjtZQUNqQyxLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDMUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFlBQVk7WUFDbkIsSUFBSSxFQUFFLHFIQUFxSDtTQUM5SCxDQUFDO1FBQ00sU0FBSSxHQUFXLE1BQU0sQ0FBQztRQUcxQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDaEUsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRWEsS0FBSzs7WUFDZixJQUFJLEtBQTJCLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQVcsYUFBYSxDQUFDO1lBRXhDLG9EQUFvRDtZQUNwRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FDdEIsWUFBWSxFQUNaLFNBQVMsRUFDVCxJQUFJLEVBQ0osZUFBZSxFQUNmLGFBQWEsRUFDYixlQUFlLENBQ2xCLENBQUM7YUFDTCxDQUFDLENBQUM7WUFFSCxLQUFLO2lCQUNBLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FDaEIsT0FBTyxFQUNQLEdBQUcsRUFBRTtvQkFDRCxJQUFJLFdBQTRCLENBQUM7b0JBQ2pDLElBQUksVUFBVSxHQUFXLEVBQUUsQ0FBQztvQkFDNUIsbUNBQW1DO29CQUNuQyxNQUFNLFlBQVksR0FBeUMsQ0FDdkQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUM3QyxDQUFDO29CQUNGLHVEQUF1RDtvQkFDdkQsTUFBTSxRQUFRLEdBQVcsWUFBYSxDQUFDLE9BQU8sQ0FDMUMsWUFBWSxDQUFDLGFBQWEsQ0FDN0IsQ0FBQyxLQUFLLENBQUM7b0JBQ1IsMkVBQTJFO29CQUMzRSxRQUFRLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDdEIsS0FBSyxLQUFLOzRCQUNOLFVBQVUsR0FBRyxFQUFFLENBQUM7NEJBQ2hCLE1BQU07d0JBQ1YsS0FBSyxVQUFVOzRCQUNYLFVBQVUsR0FBRyxFQUFFLENBQUM7NEJBQ2hCLE1BQU07d0JBQ1YsS0FBSyxLQUFLOzRCQUNOLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQzs0QkFDbkMsTUFBTTt3QkFDVixLQUFLLEtBQUs7NEJBQ04sVUFBVSxHQUFHLHFCQUFxQixDQUFDOzRCQUNuQyxNQUFNO3dCQUNWLEtBQUssS0FBSzs0QkFDTixVQUFVLEdBQUcscUJBQXFCLENBQUM7NEJBQ25DLE1BQU07d0JBQ1YsS0FBSyxLQUFLOzRCQUNOLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQzs0QkFDbkMsTUFBTTt3QkFDVjs0QkFDSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dDQUM1QixVQUFVLEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3ZEO3FCQUNSO29CQUNELE9BQU8sQ0FBQyxHQUFHLENBQUM7d0JBQ1IsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUN6RCxDQUFDLENBQUM7b0JBQ0gsV0FBVzt5QkFDTixJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRTt3QkFDdEIsbUNBQW1DO3dCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUNQLGlDQUFpQyxHQUFHLGVBQWUsRUFDbkQsUUFBUSxDQUNYLENBQUM7b0JBQ04sQ0FBQyxDQUFDO3lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsRUFDRCxLQUFLLENBQ1IsQ0FBQztnQkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVyxxQkFBcUIsQ0FBQyxHQUFXOztZQUMzQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNuQyxJQUFJLFVBQTJCLENBQUM7Z0JBQ2hDLGtDQUFrQztnQkFDbEMsTUFBTSxHQUFHLEdBQUcseUdBQXlHLEdBQUcsNkhBQTZILElBQUksQ0FBQyxZQUFZLENBQ2xRLENBQUMsRUFDRCxNQUFNLENBQ1QsRUFBRSxDQUFDO2dCQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3RELFVBQVU7eUJBQ0wsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQ2YscURBQXFEO3dCQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzdDLENBQUMsQ0FBQzt5QkFDRCxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6QixDQUFDLENBQUMsQ0FBQztnQkFDWCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQ3ByQkQsa0NBQWtDO0FBQ2xDOztHQUVHO0FBQ0g7O0dBRUc7QUFDSCxNQUFNLHNCQUFzQjtJQVd4QjtRQVZRLGNBQVMsR0FBb0I7WUFDakMsS0FBSyxFQUFFLFlBQVksQ0FBQyxRQUFRO1lBQzVCLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSx3QkFBd0I7WUFDL0IsSUFBSSxFQUFFLHdCQUF3QjtTQUNqQyxDQUFDO1FBQ00sU0FBSSxHQUFXLFVBQVUsQ0FBQztRQUUxQixVQUFLLEdBQUcsSUFBSSxDQUFDO1FBR2pCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNsRSxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFdEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQVMsRUFBRTtnQkFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVPLGdCQUFnQjtRQUNwQix3REFBd0Q7UUFDeEQsSUFBSSxDQUFDLFlBQVksQ0FDYixZQUFZLEVBQ1osYUFBYSxFQUNiLEtBQUssRUFDTCwrQkFBK0IsRUFDL0IsVUFBVSxFQUNWLGVBQWUsQ0FDbEIsQ0FBQztRQUNGLGlEQUFpRDtRQUNqRCxNQUFNLFlBQVksR0FBbUMsQ0FDakQsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUMzQyxDQUFDO1FBQ0YsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDeEMsTUFBTSxVQUFVLEdBQThCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FDbkUsdUJBQXVCLENBQzFCLENBQUM7WUFFRixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ25CLFlBQVksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDO2dCQUN2QyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQztvQkFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixZQUFZLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQztnQkFDdkMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO29CQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7b0JBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztnQkFDN0IsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGVBQWU7UUFDbkIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxpQ0FBaUM7WUFDakMsS0FBSyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ25ELG9CQUFvQjtnQkFDcEIsTUFBTSxPQUFPLEdBR0ssUUFBUSxDQUFDLGdCQUFnQixDQUN2QyxrQkFBa0IsQ0FDUSxDQUFDO2dCQUUvQixJQUFJLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtvQkFDM0MsTUFBTSxDQUFDLGNBQWMsT0FBTyxFQUFFLENBQUMsQ0FBQztpQkFDbkM7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNwQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sY0FBYyxDQUFDLElBQStCO1FBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNyQixNQUFNLFNBQVMsR0FBNkIsT0FBTyxDQUFDLGFBQWEsQ0FDN0QsYUFBYSxDQUNoQixDQUFDO1lBQ0YsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Z0JBQy9CLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxnQkFBZ0I7SUFhbEI7UUFaUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsUUFBUTtZQUM1QixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsa0JBQWtCO1lBQ3pCLElBQUksRUFBRSx5REFBeUQ7U0FDbEUsQ0FBQztRQUNNLFNBQUksR0FBVyxNQUFNLENBQUM7UUFDdEIsWUFBTyxHQUFpQyxXQUFXLENBQ3ZELEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLE9BQU8sQ0FDakMsQ0FBQztRQUNNLGVBQVUsR0FBVyxFQUFFLENBQUM7UUE4S3hCLG9CQUFlLEdBQUcsR0FBdUMsRUFBRTtZQUMvRCxJQUFJLEVBQUUsQ0FBQyxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNyRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNuQyx3Q0FBd0M7Z0JBQ3hDLEtBQUssQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUMzQyw2QkFBNkI7b0JBQzdCLE1BQU0sVUFBVSxHQUF5RCxDQUNyRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FDaEQsQ0FBQztvQkFDRixJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTt3QkFDakQsTUFBTSxDQUFDLGlCQUFpQixVQUFVLEVBQUUsQ0FBQyxDQUFDO3FCQUN6Qzt5QkFBTTt3QkFDSCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ3ZCO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUM7UUEzTEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2xFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVhLEtBQUs7O1lBQ2YsSUFBSSxTQUErQixDQUFDO1lBQ3BDLElBQUksT0FBb0IsQ0FBQztZQUN6QixJQUFJLFVBQThDLENBQUM7WUFFbkQsMkRBQTJEO1lBQzNELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDZCxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUMxQixhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLEtBQUssRUFDTCxNQUFNLEVBQ04sYUFBYSxFQUNiLHVCQUF1QixDQUMxQixDQUFDO2dCQUNGLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUN4QyxDQUFDLENBQUM7WUFFSCxxQ0FBcUM7WUFDckMsVUFBVTtpQkFDTCxJQUFJLENBQUMsQ0FBTyxHQUFHLEVBQUUsRUFBRTtnQkFDaEIsd0JBQXdCO2dCQUN4QixPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUM3QixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLEtBQUssRUFDTCxpQkFBaUIsRUFDakIsVUFBVSxFQUNWLHFCQUFxQixDQUN4QixDQUFDO2dCQUNGLDBCQUEwQjtnQkFDMUIsT0FBTyxDQUFDLGtCQUFrQixDQUN0QixVQUFVLEVBQ1YsNEVBQTRFLENBQy9FLENBQUM7Z0JBQ0YsMkJBQTJCO2dCQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEQsUUFBUSxDQUFDLGFBQWEsQ0FDbEIscUJBQXFCLENBQ3ZCLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQy9CLDBCQUEwQjtnQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FBQSxDQUFDO2lCQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1AsNkJBQTZCO2dCQUM3QixLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzVCLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO29CQUM5RCxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUNwQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQU8sR0FBRyxFQUFFLEVBQUU7d0JBQzFCLDJCQUEyQjt3QkFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2xELFFBQVEsQ0FBQyxhQUFhLENBQ2xCLHFCQUFxQixDQUN2QixDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUNuQyxDQUFDLENBQUEsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFUCxrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFakMscUNBQXFDO1lBQ3JDLFNBQVM7aUJBQ0osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1YsR0FBRyxDQUFDLGdCQUFnQixDQUNoQixPQUFPLEVBQ1AsR0FBRyxFQUFFO29CQUNELDRDQUE0QztvQkFDNUMsTUFBTSxPQUFPLEdBQStCLFFBQVEsQ0FBQyxhQUFhLENBQzlELHFCQUFxQixDQUN4QixDQUFDO29CQUNGLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTt3QkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO3FCQUM3Qzt5QkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO3dCQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7d0JBQ2hDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLENBQUM7cUJBQ3BDO3lCQUFNO3dCQUNILElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzt3QkFDL0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztxQkFDcEM7Z0JBQ0wsQ0FBQyxFQUNELEtBQUssQ0FDUixDQUFDO1lBQ04sQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFUCxPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0ssYUFBYSxDQUFDLEdBQWlDO1FBQ25ELElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNuQixHQUFHLEdBQUcsT0FBTyxDQUFDO1NBQ2pCLENBQUMsZ0JBQWdCO1FBQ2xCLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUN2QixDQUFDO0lBRWEsZUFBZSxDQUFDLE9BQWtDOztZQUM1RCxJQUFJLElBQUksR0FBVyxFQUFFLENBQUM7WUFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNyQix3QkFBd0I7Z0JBQ3hCLElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxXQUFXLEdBQVcsRUFBRSxDQUFDO2dCQUM3QixJQUFJLFNBQVMsR0FBVyxFQUFFLENBQUM7Z0JBQzNCLElBQUksU0FBUyxHQUFXLEVBQUUsQ0FBQztnQkFDM0IsOENBQThDO2dCQUM5QyxNQUFNLFFBQVEsR0FBNkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDM0UsTUFBTSxVQUFVLEdBRUwsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLFFBQVEsR0FBeUMsSUFBSSxDQUFDLGdCQUFnQixDQUN4RSxTQUFTLENBQ1osQ0FBQztnQkFDRixNQUFNLFFBQVEsR0FBeUMsSUFBSSxDQUFDLGdCQUFnQixDQUN4RSxXQUFXLENBQ2QsQ0FBQztnQkFFRixJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7b0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7aUJBQ3REO3FCQUFNO29CQUNILEtBQUssR0FBRyxRQUFRLENBQUMsV0FBWSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUN4QztnQkFFRCxpQkFBaUI7Z0JBQ2pCLElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDOUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUMxQixXQUFXLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxLQUFLLENBQUM7b0JBQzlDLENBQUMsQ0FBQyxDQUFDO29CQUNILHFEQUFxRDtvQkFDckQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELFdBQVcsR0FBRyxLQUFLLFdBQVcsR0FBRyxDQUFDO2lCQUNyQztnQkFDRCxrQkFBa0I7Z0JBQ2xCLElBQUksUUFBUSxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDMUMsU0FBUyxHQUFHLEtBQUssQ0FBQztvQkFDbEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO3dCQUN0QixTQUFTLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxPQUFPLENBQUM7b0JBQzVDLENBQUMsQ0FBQyxDQUFDO29CQUNILHNCQUFzQjtvQkFDdEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzVEO2dCQUNELG9CQUFvQjtnQkFDcEIsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMxQyxTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUNsQixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQ3RCLFNBQVMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLE9BQU8sQ0FBQztvQkFDNUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsc0JBQXNCO29CQUN0QixTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDNUQ7Z0JBQ0QsSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLFdBQVcsSUFBSSxTQUFTLElBQUksU0FBUyxJQUFJLENBQUM7WUFDakUsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFvQkQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksTUFBTSxDQUFDLEdBQWlDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBRUQsTUFBTSxrQkFBa0I7SUFTcEI7UUFSUSxjQUFTLEdBQW9CO1lBQ2pDLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxvQkFBb0I7WUFDM0IsS0FBSyxFQUFFLFlBQVksQ0FBQyxRQUFRO1lBQzVCLElBQUksRUFBRSw4Q0FBOEM7U0FDdkQsQ0FBQztRQUNNLFNBQUksR0FBVyxjQUFjLENBQUM7UUFDOUIsV0FBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFFMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2xFLElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNhLEtBQUs7O1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUU1Qjs7Ozs7Ozs7Ozs7Z0NBV29CO1lBQ3BCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUMvRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXJCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQyxDQUFDO0tBQUE7SUFDRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FDbFhEOztHQUVHO0FBRUgsTUFBTSxXQUFXO0lBVWI7UUFUUSxjQUFTLEdBQW9CO1lBQ2pDLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztZQUN6QixJQUFJLEVBQUUsVUFBVTtZQUNoQixLQUFLLEVBQUUsYUFBYTtZQUNwQixJQUFJLEVBQ0Esc0hBQXNIO1NBQzdILENBQUM7UUFDTSxTQUFJLEdBQVcsV0FBVyxDQUFDO1FBRy9CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUMvRCxJQUFJLENBQUMsRUFBRTtnQkFDSCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFYSxLQUFLOztZQUNmLE1BQU0sT0FBTyxHQUFXLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sSUFBSSxHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixPQUFPLGVBQWUsQ0FBQyxDQUFDO1lBRXpELCtDQUErQztZQUMvQyxNQUFNLFNBQVMsR0FBMkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRSxNQUFNLFNBQVMsR0FBNEIsSUFBSSxDQUFDLGFBQWEsQ0FDekQsb0JBQW9CLENBQ3ZCLENBQUM7WUFDRixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUVwQixxQ0FBcUM7WUFDckMsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNwQixNQUFNLFNBQVMsR0FBcUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDNUIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQzthQUNuRDtZQUVELG9DQUFvQztZQUNwQyxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLE1BQU0sUUFBUSxHQUF1QyxDQUNqRCxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUM1QixDQUFDO2dCQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQzNDO2lCQUFNO2dCQUNILElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQzthQUNyQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQUE7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FDM0RELGtDQUFrQztBQUNsQyxtQ0FBbUM7QUFFbkM7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sZUFBZTtJQVlqQjtRQVhRLGNBQVMsR0FBbUI7WUFDaEMsS0FBSyxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFDakMsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsaUJBQWlCO1lBQ3hCLEdBQUcsRUFBRSxjQUFjO1lBQ25CLFdBQVcsRUFBRSxlQUFlO1lBQzVCLElBQUksRUFDQSxxSEFBcUg7U0FDNUgsQ0FBQztRQUNNLFNBQUksR0FBVyxZQUFZLENBQUM7UUFHaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzlELElBQUksQ0FBQyxFQUFFO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUs7UUFDVCxJQUFJLE1BQU0sRUFBRTthQUNQLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2FBQzVDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsTUFBTSxFQUFFLENBQUMsQ0FDL0QsQ0FBQztJQUNWLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLGVBQWU7SUFVakI7UUFUUSxjQUFTLEdBQW9CO1lBQ2pDLElBQUksRUFBRSxVQUFVO1lBQ2hCLEtBQUssRUFBRSxpQkFBaUI7WUFDeEIsS0FBSyxFQUFFLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFDakMsSUFBSSxFQUFFLG1EQUFtRDtTQUM1RCxDQUFDO1FBQ00sZ0JBQVcsR0FBRywwQ0FBMEMsQ0FBQztRQUN6RCxlQUFVLEdBQUcsd0NBQXdDLENBQUM7UUFDdEQsU0FBSSxHQUFXLE9BQU8sQ0FBQztRQUUzQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDOUQsSUFBSSxDQUFDLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ2EsS0FBSzs7WUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7WUFFdkQseUJBQXlCO1lBQ3pCLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUUsQ0FBQyxXQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEYsOEJBQThCO1lBQzlCLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDekUsSUFBSSxNQUFNO2dCQUFFLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUMxRSxzQ0FBc0M7WUFDdEMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0QyxZQUFZLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQztZQUMxQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0Msd0NBQXdDO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakMsVUFBVSxDQUFDLFdBQVcsR0FBRyxxQ0FBcUMsU0FBUyxHQUFHLENBQUM7WUFDM0UsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDMUIsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pDLGtCQUFrQjtZQUNsQixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekQsbUVBQW1FO1lBQ25FLElBQUksTUFBTSxFQUFFO2dCQUNSLHVCQUF1QjtnQkFDdkIsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzFELDRDQUE0QztnQkFDNUMsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO29CQUNwQixvQ0FBb0M7b0JBQ3BDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3hFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ3JFLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTt3QkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixRQUFRLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQzt3QkFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7cUJBQ3hEO29CQUNELHFCQUFxQjtvQkFDckIsVUFBVSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsSUFBSSxDQUFDLFdBQVcsWUFBWSxTQUFTLGtDQUFrQyxRQUFRLDBCQUEwQixTQUFTLGlCQUFpQixJQUFJLENBQUMsVUFBVSxZQUFZLFFBQVEsa0NBQWtDLE9BQU8sMEJBQTBCLENBQUM7b0JBQ2xSLDZCQUE2QjtvQkFDN0IsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztpQkFDaEQ7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2lCQUNuRDthQUNKO2lCQUFNO2dCQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDbkQ7UUFDTCxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0ssU0FBUyxDQUNiLE9BQTBCLEVBQzFCLElBQWdDO1FBRWhDLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixpREFBaUQ7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2pCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLDRCQUE0QjtnQkFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQzVCO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM3QjthQUNKO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxzQ0FBc0M7UUFDdEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUM3RSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQzNFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7O09BR0c7SUFDSyxVQUFVLENBQUMsT0FBMEI7UUFDekMsOENBQThDO1FBQzlDLE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBcUIsRUFBVSxFQUFFO1lBQ3JELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLEVBQUU7Z0JBQzVCLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2FBQ3JDO2lCQUFNLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7Z0JBQ2xDLE9BQU8sTUFBTSxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNILE9BQU8sK0JBQStCLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3JFO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsa0NBQWtDO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO1lBQzdCLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsUUFBUSxFQUFFLE1BQU07U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsOENBQThDO1FBQzlDLE1BQU0sS0FBSyxHQUFhLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QyxnREFBZ0Q7WUFDaEQsSUFBSSxlQUFlLEdBQVcsRUFBRSxDQUFDO1lBRWpDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2pCLGVBQWUsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDbEU7aUJBQU07Z0JBQ0gsZUFBZSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUNuRTtZQUNELHlCQUF5QjtZQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkQsT0FBTywyQkFBMkIsSUFBSSxJQUFJLGVBQWUsT0FBTyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsZ0NBQWdDO1FBQ2hDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQ3pMRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxZQUFZO0lBQ2Q7UUFDSSw4QkFBOEI7UUFDOUIsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNmLElBQUksV0FBVyxFQUFFLENBQUM7UUFDbEIsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNwQixJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLElBQUksYUFBYSxFQUFFLENBQUM7UUFDcEIsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUV0QixpQ0FBaUM7UUFDakMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNmLElBQUksVUFBVSxFQUFFLENBQUM7UUFFakIsbUNBQW1DO1FBQ25DLElBQUksY0FBYyxFQUFFLENBQUM7UUFDckIsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1FBQzNCLElBQUksZUFBZSxFQUFFLENBQUM7UUFDdEIsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUN0QixJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLElBQUksVUFBVSxFQUFFLENBQUM7UUFFakIsb0NBQW9DO1FBQ3BDLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUN6QixJQUFJLHNCQUFzQixFQUFFLENBQUM7UUFDN0IsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1FBRXZCLG9DQUFvQztRQUNwQyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3RCLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztRQUN2QixJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3JCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDbkIsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNyQixJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3JCLElBQUksY0FBYyxFQUFFLENBQUM7UUFDckIsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUV0QixnQ0FBZ0M7UUFDaEMsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNwQixJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQ3BCLElBQUksVUFBVSxFQUFFLENBQUM7UUFDakIsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNsQixJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2pCLElBQUksVUFBVSxFQUFFLENBQUM7UUFDakIsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUVqQiw2QkFBNkI7UUFDN0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUVsQixpQ0FBaUM7UUFDakMsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUN0QixJQUFJLGVBQWUsRUFBRSxDQUFDO1FBRXRCLGtDQUFrQztRQUNsQyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7Q0FDSjtBQ3RFRCxpQ0FBaUM7QUFDakMsZ0NBQWdDO0FBQ2hDLDBDQUEwQztBQUUxQzs7O0dBR0c7QUFDSCxNQUFNLFFBQVE7SUFDViwyQ0FBMkM7SUFDbkMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFzQjtRQUM1QyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDN0M7UUFDRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQXNCLEVBQUUsQ0FBQztZQUN4QyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtnQkFDNUIsTUFBTSxLQUFLLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUMsd0RBQXdEO2dCQUN4RCxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDbEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDL0IsOEJBQThCO2lCQUNqQztxQkFBTTtvQkFDSCxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDaEM7YUFDSjtZQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxxREFBcUQ7SUFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUF1QjtRQUM5QyxJQUFJLEVBQUUsQ0FBQyxLQUFLO1lBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixJQUFJLElBQUksR0FBRyw2REFBNkQsRUFBRSxDQUFDLE9BQU8sc2VBQXNlLENBQUM7WUFFempCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFXLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkMsMkJBQTJCO2dCQUMzQixJQUFJLElBQUksd0JBQXdCLFlBQVksQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUM7Z0JBQy9FLHVEQUF1RDtnQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDNUMsTUFBTSxhQUFhLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QyxNQUFNLElBQUksR0FBZSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBRXZELE1BQU0sS0FBSyxHQUFHO3dCQUNWLFFBQVEsRUFBRSxHQUFHLEVBQUU7NEJBQ1gsSUFBSSxJQUFJLDhCQUE4QixJQUFJLENBQUMsS0FBSyxrQkFBa0IsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDO3dCQUN0RixDQUFDO3dCQUNELE9BQU8sRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxJQUFJLDJCQUEyQixJQUFJLENBQUMsR0FBRyxtQ0FBbUMsSUFBSSxDQUFDLEtBQUssa0JBQWtCLElBQUksQ0FBQyxXQUFXLG9DQUFvQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUM7d0JBQ2xMLENBQUM7d0JBQ0QsUUFBUSxFQUFFLEdBQUcsRUFBRTs0QkFDWCxJQUFJLElBQUksMkJBQTJCLElBQUksQ0FBQyxHQUFHLHdCQUF3QixJQUFJLENBQUMsS0FBSyx5QkFBeUIsQ0FBQzs0QkFDdkcsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dDQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29DQUN0QyxJQUFJLElBQUksa0JBQWtCLEdBQUcsS0FDekIsSUFBSSxDQUFDLE9BQVEsQ0FBQyxHQUFHLENBQ3JCLFdBQVcsQ0FBQztnQ0FDaEIsQ0FBQyxDQUFDLENBQUM7NkJBQ047NEJBQ0QsSUFBSSxJQUFJLFlBQVksSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDO3dCQUN4QyxDQUFDO3FCQUNKLENBQUM7b0JBQ0YsSUFBSSxJQUFJLENBQUMsSUFBSTt3QkFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQyxDQUFDO2dCQUNILGdCQUFnQjtnQkFDaEIsSUFBSSxJQUFJLFlBQVksQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUNILCtDQUErQztZQUMvQyxJQUFJO2dCQUNBLDBTQUEwUyxDQUFDO1lBRS9TLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxzREFBc0Q7SUFDOUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUF1QjtRQUMvQyx3QkFBd0I7UUFDeEIsTUFBTSxTQUFTLEdBQWEsYUFBYSxFQUFFLENBQUM7UUFDNUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNqRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRWxELElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUNQLE9BQU8sRUFDUCxJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsRUFDUixXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDNUIsVUFBVSxFQUNWLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUNuQyxDQUFDO2lCQUNMO2dCQUVELElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQzNDLE1BQU0sSUFBSSxHQUF1QyxDQUM3QyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FDdkMsQ0FBQztvQkFDRixNQUFNLEtBQUssR0FBRzt3QkFDVixRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUNYLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUM1QyxDQUFDO3dCQUNELE9BQU8sRUFBRSxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQzt3QkFDbEQsQ0FBQzt3QkFDRCxRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDekMsQ0FBQztxQkFDSixDQUFDO29CQUNGLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzt3QkFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7aUJBQ3ZFO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQXNCO1FBQzlDLElBQUksRUFBRSxDQUFDLEtBQUs7WUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNoRCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRWpELElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQzNDLE1BQU0sSUFBSSxHQUF1QyxDQUM3QyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FDdkMsQ0FBQztvQkFFRixNQUFNLEtBQUssR0FBRzt3QkFDVixRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUNYLElBQUksSUFBSSxDQUFDLE9BQU87Z0NBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3BELENBQUM7d0JBQ0QsT0FBTyxFQUFFLEdBQUcsRUFBRTs0QkFDVixNQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDOzRCQUUvQixJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7Z0NBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0NBQzlCLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQzs2QkFDekM7d0JBQ0wsQ0FBQzt3QkFDRCxRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUNYLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDeEMsQ0FBQztxQkFDSixDQUFDO29CQUNGLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2lCQUM1QztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxNQUFNLENBQUMsYUFBYTtRQUN4QixNQUFNLE1BQU0sR0FBRyxhQUFhLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksR0FBdUIsRUFBRSxDQUFDO1FBRXBDLHlEQUF5RDtRQUN6RCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbkIsa0VBQWtFO1lBQ2xFLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM5QztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFTyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQWU7UUFDekMsSUFBSSxFQUFFLENBQUMsS0FBSztZQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUF5QixFQUFFLEVBQUU7WUFDM0MsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1YsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLEVBQUUsQ0FBQyxLQUFLO29CQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2RDtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHVEQUF1RDtJQUMvQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQWEsRUFBRSxHQUFzQjtRQUM5RCxJQUFJLEVBQUUsQ0FBQyxLQUFLO1lBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sU0FBUyxHQUFxQyxDQUNoRCxRQUFRLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFFLENBQy9DLENBQUM7UUFDRixNQUFNLFFBQVEsR0FBYSxhQUFhLEVBQUUsQ0FBQztRQUUzQyx3QkFBd0I7UUFDeEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTlCLHlEQUF5RDtRQUN6RCxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUM1QixJQUFJLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFVBQVUsRUFBRTtnQkFDekMsa0RBQWtEO2dCQUNsRCxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO29CQUM1RCxpQ0FBaUM7b0JBQ2pDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ3hDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQ3pDO2lCQUNKO2FBQ0o7U0FDSjtRQUVELGlDQUFpQztRQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLG1DQUFtQztRQUNuQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDOUIsSUFBSTtZQUNBLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDM0IsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ2xDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNaO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixJQUFJLEVBQUUsQ0FBQyxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakM7UUFFRCxJQUFJLEVBQUUsQ0FBQyxLQUFLO1lBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFPLElBQUksQ0FBQyxNQUFlLEVBQUUsUUFBc0I7O1lBQzVELDhFQUE4RTtZQUM5RSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7Z0JBQ2pCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtvQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7aUJBQ25DO2dCQUVELDBDQUEwQztnQkFDMUMsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7b0JBQ2pELElBQUksRUFBRSxDQUFDLEtBQUs7d0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO29CQUN0RSw0QkFBNEI7b0JBQzVCLE1BQU0sVUFBVSxHQUFZLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUUsQ0FBQztvQkFDekUsTUFBTSxZQUFZLEdBQXVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3RFLE1BQU0sWUFBWSxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2RSxJQUFJLFNBQTRCLENBQUM7b0JBRWpDLDhDQUE4QztvQkFDOUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDM0QsWUFBWSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7d0JBQ3ZCLEtBQUssRUFBRSxVQUFVO3dCQUNqQixXQUFXLEVBQUUsR0FBRzt3QkFDaEIsS0FBSyxFQUFFLDJDQUEyQztxQkFDckQsQ0FBQyxDQUFDO29CQUNILFlBQVksQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO29CQUN6Qyx5QkFBeUI7b0JBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO3dCQUNyQiw0Q0FBNEM7eUJBQzNDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUNiLFNBQVMsR0FBRyxNQUFNLENBQUM7d0JBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDO3dCQUNGLDZDQUE2Qzt5QkFDNUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7d0JBQ2IsWUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7d0JBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQzt3QkFDbkQsT0FBTyxTQUFTLENBQUM7b0JBQ3JCLENBQUMsQ0FBQzt5QkFDRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTt3QkFDYixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMxQixPQUFPLE1BQU0sQ0FBQztvQkFDbEIsQ0FBQyxDQUFDO3dCQUNGLDBDQUEwQzt5QkFDekMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7d0JBQ2IsTUFBTSxTQUFTLEdBQW1DLENBQzlDLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFFLENBQ3hDLENBQUM7d0JBQ0YsTUFBTSxPQUFPLEdBQW1DLENBQzVDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFFLENBQ3RDLENBQUM7d0JBQ0YsTUFBTSxRQUFRLEdBQW1DLENBQzdDLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFFLENBQ3hDLENBQUM7d0JBQ0YsSUFBSSxPQUFlLENBQUM7d0JBQ3BCLElBQUk7NEJBQ0EsU0FBUyxDQUFDLGdCQUFnQixDQUN0QixPQUFPLEVBQ1AsR0FBRyxFQUFFO2dDQUNELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN4QyxDQUFDLEVBQ0QsS0FBSyxDQUNSLENBQUM7NEJBQ0YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFDM0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7eUJBQ3ZEO3dCQUFDLE9BQU8sR0FBRyxFQUFFOzRCQUNWLElBQUksRUFBRSxDQUFDLEtBQUs7Z0NBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt5QkFDbkM7d0JBQ0QsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFOzRCQUNWLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQzt5QkFDdEI7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUM7S0FBQTtDQUNKO0FDL1NELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsMENBQTBDO0FBQzFDLDRDQUE0QztBQUM1QywwQ0FBMEM7QUFDMUMseUNBQXlDO0FBQ3pDLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsNENBQTRDO0FBQzVDLDZDQUE2QztBQUM3QywyQ0FBMkM7QUFDM0MsMENBQTBDO0FBQzFDLG9DQUFvQztBQUNwQyxvQ0FBb0M7QUFFcEM7Ozs7Ozs7Ozs7R0FVRztBQUNILElBQVUsRUFBRSxDQXFFWDtBQXJFRCxXQUFVLEVBQUU7SUFDSyxRQUFLLEdBQXdCLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDakUsWUFBUyxHQUFnQjtRQUNsQyxZQUFZO1FBQ1osV0FBVyxFQUFFO1lBQ1QsMEVBQTBFO1lBQzFFLHVEQUF1RDtZQUN2RCw0RkFBNEY7WUFDNUYsa0dBQWtHO1lBQ2xHLGdJQUFnSTtZQUNoSSx5RUFBeUU7U0FDaEU7UUFDYixRQUFRLEVBQUU7WUFDTiw4R0FBOEc7U0FDckc7S0FDaEIsQ0FBQztJQUNXLFlBQVMsR0FBVyxRQUFRLENBQUM7SUFDN0IsVUFBTyxHQUFXLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDL0IsV0FBUSxHQUF1QixLQUFLLENBQUMsT0FBTyxDQUFDO0lBQzdDLFdBQVEsR0FBYSxFQUFFLENBQUM7SUFDeEIsWUFBUyxHQUFXLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQzdDLFNBQU0sR0FBVSxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQzVCLGVBQVksR0FBaUIsRUFBRSxDQUFDO0lBRWhDLE1BQUcsR0FBRyxHQUFTLEVBQUU7UUFDMUI7O1dBRUc7UUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixHQUFBLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFFOUMsb0NBQW9DO1FBQ3BDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLDJEQUEyRDtRQUMzRCxRQUFRLENBQUMsTUFBTSxHQUFHLDBEQUEwRCxDQUFDO1FBQzdFLDRCQUE0QjtRQUM1QixNQUFNLE1BQU0sR0FBVyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3BDLElBQUksS0FBSyxFQUFFLENBQUM7UUFDWiw0Q0FBNEM7UUFDNUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzVCLElBQUksTUFBTTtnQkFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFBLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO1FBQ0gsMEJBQTBCO1FBQzFCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFbkI7O1dBRUc7UUFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sS0FBSyxHQUFXLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzdDLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLGVBQWUsQ0FBQyxFQUFFO2dCQUNoRSwrQkFBK0I7Z0JBQy9CLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUEsWUFBWSxDQUFDLENBQUM7YUFDdkM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVIOzs7V0FHRztRQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3RELHVCQUF1QjtZQUN2QixHQUFBLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwQiw2QkFBNkI7WUFDN0IsR0FBQSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN2QixDQUFDLENBQUEsQ0FBQztBQUNOLENBQUMsRUFyRVMsRUFBRSxLQUFGLEVBQUUsUUFxRVg7QUFFRCx5QkFBeUI7QUFDekIsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6Im1hbS1wbHVzX2Rldi51c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFR5cGVzLCBJbnRlcmZhY2VzLCBldGMuXHJcbiAqL1xyXG5cclxudHlwZSBWYWxpZFBhZ2UgPVxyXG4gICAgfCAnaG9tZSdcclxuICAgIHwgJ2Jyb3dzZSdcclxuICAgIHwgJ3JlcXVlc3RzJ1xyXG4gICAgfCAndG9ycmVudCdcclxuICAgIHwgJ3Nob3V0Ym94J1xyXG4gICAgfCAndmF1bHQnXHJcbiAgICB8ICd1c2VyJ1xyXG4gICAgfCAnZm9ydW0nXHJcbiAgICB8ICdzZXR0aW5ncyc7XHJcblxyXG50eXBlIEJvb2tEYXRhID0gJ2Jvb2snIHwgJ2F1dGhvcicgfCAnc2VyaWVzJztcclxuXHJcbmVudW0gU2V0dGluZ0dyb3VwIHtcclxuICAgICdHbG9iYWwnLFxyXG4gICAgJ0hvbWUnLFxyXG4gICAgJ1NlYXJjaCcsXHJcbiAgICAnUmVxdWVzdHMnLFxyXG4gICAgJ1RvcnJlbnQgUGFnZScsXHJcbiAgICAnU2hvdXRib3gnLFxyXG4gICAgJ1ZhdWx0JyxcclxuICAgICdVc2VyIFBhZ2VzJyxcclxuICAgICdGb3J1bScsXHJcbiAgICAnT3RoZXInLFxyXG59XHJcblxyXG50eXBlIFNob3V0Ym94VXNlclR5cGUgPSAncHJpb3JpdHknIHwgJ211dGUnO1xyXG5cclxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XHJcbiAgICBhbW91bnQ6IG51bWJlcjtcclxuICAgIG90aGVyX25hbWU6IHN0cmluZztcclxuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xyXG4gICAgdGlkOiBudW1iZXIgfCBudWxsO1xyXG4gICAgdGltZXN0YW1wOiBudW1iZXI7XHJcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIHR5cGU6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFycmF5T2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU3RyaW5nT2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEJvb2tEYXRhT2JqZWN0IGV4dGVuZHMgU3RyaW5nT2JqZWN0IHtcclxuICAgIFsnZXh0cmFjdGVkJ106IHN0cmluZztcclxuICAgIFsnZGVzYyddOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTZXR0aW5nR2xvYk9iamVjdCB7XHJcbiAgICBba2V5OiBudW1iZXJdOiBGZWF0dXJlU2V0dGluZ3NbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICBzY29wZTogU2V0dGluZ0dyb3VwO1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHR5cGU6ICdjaGVja2JveCcgfCAnZHJvcGRvd24nIHwgJ3RleHRib3gnO1xyXG4gICAgZGVzYzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQW55RmVhdHVyZSBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0YWc/OiBzdHJpbmc7XHJcbiAgICBvcHRpb25zPzogU3RyaW5nT2JqZWN0O1xyXG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBGZWF0dXJlIHtcclxuICAgIHNldHRpbmdzOiBDaGVja2JveFNldHRpbmcgfCBEcm9wZG93blNldHRpbmcgfCBUZXh0Ym94U2V0dGluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIENoZWNrYm94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0eXBlOiAnY2hlY2tib3gnO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRHJvcGRvd25TZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICdkcm9wZG93bic7XHJcbiAgICB0YWc6IHN0cmluZztcclxuICAgIG9wdGlvbnM6IFN0cmluZ09iamVjdDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFRleHRib3hTZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICd0ZXh0Ym94JztcclxuICAgIHRhZzogc3RyaW5nO1xyXG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZztcclxufVxyXG5cclxuLy8gbmF2aWdhdG9yLmNsaXBib2FyZC5kLnRzXHJcblxyXG4vLyBUeXBlIGRlY2xhcmF0aW9ucyBmb3IgQ2xpcGJvYXJkIEFQSVxyXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2xpcGJvYXJkX0FQSVxyXG5pbnRlcmZhY2UgQ2xpcGJvYXJkIHtcclxuICAgIHdyaXRlVGV4dChuZXdDbGlwVGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxuICAgIC8vIEFkZCBhbnkgb3RoZXIgbWV0aG9kcyB5b3UgbmVlZCBoZXJlLlxyXG59XHJcblxyXG5pbnRlcmZhY2UgTmF2aWdhdG9yQ2xpcGJvYXJkIHtcclxuICAgIC8vIE9ubHkgYXZhaWxhYmxlIGluIGEgc2VjdXJlIGNvbnRleHQuXHJcbiAgICByZWFkb25seSBjbGlwYm9hcmQ/OiBDbGlwYm9hcmQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBOYXZpZ2F0b3JFeHRlbmRlZCBleHRlbmRzIE5hdmlnYXRvckNsaXBib2FyZCB7fVxyXG4iLCIvKipcclxuICogQ2xhc3MgY29udGFpbmluZyBjb21tb24gdXRpbGl0eSBtZXRob2RzXHJcbiAqXHJcbiAqIElmIHRoZSBtZXRob2Qgc2hvdWxkIGhhdmUgdXNlci1jaGFuZ2VhYmxlIHNldHRpbmdzLCBjb25zaWRlciB1c2luZyBgQ29yZS50c2AgaW5zdGVhZFxyXG4gKi9cclxuXHJcbmNsYXNzIFV0aWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRpb24gZnJhbWUgdGltZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZlRpbWVyKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHNldHRpbmcgbXVsdGlwbGUgYXR0cmlidXRlcyBhdCBvbmNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0QXR0cihlbDogRWxlbWVudCwgYXR0cjogU3RyaW5nT2JqZWN0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgXCJsZW5ndGhcIiBvZiBhbiBPYmplY3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBvYmplY3RMZW5ndGgob2JqOiBPYmplY3QpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcmNlZnVsbHkgZW1wdGllcyBhbnkgR00gc3RvcmVkIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHB1cmdlU2V0dGluZ3MoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBHTV9saXN0VmFsdWVzKCkpIHtcclxuICAgICAgICAgICAgR01fZGVsZXRlVmFsdWUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZyBhIG1lc3NhZ2UgYWJvdXQgYSBjb3VudGVkIHJlc3VsdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcG9ydENvdW50KGRpZDogc3RyaW5nLCBudW06IG51bWJlciwgdGhpbmc6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNpbmd1bGFyID0gMTtcclxuICAgICAgICBpZiAobnVtICE9PSBzaW5ndWxhcikge1xyXG4gICAgICAgICAgICB0aGluZyArPSAncyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPiAke2RpZH0gJHtudW19ICR7dGhpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgYSBmZWF0dXJlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgc3RhcnRGZWF0dXJlKFxyXG4gICAgICAgIHNldHRpbmdzOiBGZWF0dXJlU2V0dGluZ3MsXHJcbiAgICAgICAgZWxlbTogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U/OiBWYWxpZFBhZ2VbXVxyXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgLy8gUXVldWUgdGhlIHNldHRpbmdzIGluIGNhc2UgdGhleSdyZSBuZWVkZWRcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaChzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIHJldHVybiB0cnVlIHdoZW4gdGhlIGVsZW1lbnQgaXMgbG9hZGVkXHJcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aW1lcjogUHJvbWlzZTxmYWxzZT4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMTUwMCwgZmFsc2UpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrRWxlbSA9IENoZWNrLmVsZW1Mb2FkKGVsZW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lciwgY2hlY2tFbGVtXSkudGhlbigodmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYHN0YXJ0RmVhdHVyZSgke3NldHRpbmdzLnRpdGxlfSkgdW5hYmxlIHRvIGluaXRpYXRlISBDb3VsZCBub3QgZmluZCBlbGVtZW50OiAke2VsZW19YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElzIHRoZSBzZXR0aW5nIGVuYWJsZWQ/XHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHNldHRpbmdzLnRpdGxlKSkge1xyXG4gICAgICAgICAgICAvLyBBIHNwZWNpZmljIHBhZ2UgaXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCByZXF1aXJlZCBwYWdlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYm9vbGVhbltdID0gW107XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLmZvckVhY2goKHApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBDaGVjay5wYWdlKHApLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKDxib29sZWFuPnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBhbnkgcmVxdWVzdGVkIHBhZ2UgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlLCBydW4gdGhlIGZlYXR1cmVcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmluY2x1ZGVzKHRydWUpID09PSB0cnVlKSByZXR1cm4gcnVuKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHRvIGVsZW1lbnQgY2hlY2tpbmdcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBydW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZXR0aW5nIGlzIG5vdCBlbmFibGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyaW1zIGEgc3RyaW5nIGxvbmdlciB0aGFuIGEgc3BlY2lmaWVkIGNoYXIgbGltaXQsIHRvIGEgZnVsbCB3b3JkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdHJpbVN0cmluZyhpbnA6IHN0cmluZywgbWF4OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChpbnAubGVuZ3RoID4gbWF4KSB7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgbWF4ICsgMSk7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgTWF0aC5taW4oaW5wLmxlbmd0aCwgaW5wLmxhc3RJbmRleE9mKCcgJykpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlucDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYnJhY2tldHMgJiBhbGwgY29udGFpbmVkIHdvcmRzIGZyb20gYSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0UmVtb3ZlcihpbnA6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGlucFxyXG4gICAgICAgICAgICAucmVwbGFjZSgveysuKj99Ky9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcW1xcW3xcXF1cXF0vZywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC88Lio/Pi9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC4qP1xcKS9nLCAnJylcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICpSZXR1cm4gdGhlIGNvbnRlbnRzIGJldHdlZW4gYnJhY2tldHNcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRDb250ZW50cyA9IChpbnA6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBpbnAubWF0Y2goL1xcKChbXildKylcXCkvKSFbMV07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYW4gYXJyYXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb0FycmF5KGlucDogc3RyaW5nLCBzcGxpdFBvaW50PzogJ3dzJyk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gc3BsaXRQb2ludCAhPT0gdW5kZWZpbmVkICYmIHNwbGl0UG9pbnQgIT09ICd3cydcclxuICAgICAgICAgICAgPyBpbnAuc3BsaXQoc3BsaXRQb2ludClcclxuICAgICAgICAgICAgOiBpbnAubWF0Y2goL1xcUysvZykgfHwgW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIGNvbW1hIChvciBvdGhlcikgc2VwYXJhdGVkIHZhbHVlIGludG8gYW4gYXJyYXlcclxuICAgICAqIEBwYXJhbSBpbnAgU3RyaW5nIHRvIGJlIGRpdmlkZWRcclxuICAgICAqIEBwYXJhbSBkaXZpZGVyIFRoZSBkaXZpZGVyIChkZWZhdWx0OiAnLCcpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3N2VG9BcnJheShpbnA6IHN0cmluZywgZGl2aWRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBpbnAuc3BsaXQoZGl2aWRlcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBhcnIucHVzaChpdGVtLnRyaW0oKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gYXJyYXkgdG8gYSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBpbnAgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZW5kIGN1dC1vZmYgcG9pbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhcnJheVRvU3RyaW5nKGlucDogc3RyaW5nW10sIGVuZD86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIGlucC5mb3JFYWNoKChrZXksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgaWYgKGVuZCAmJiB2YWwgKyAxICE9PSBpbnAubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBET00gbm9kZSByZWZlcmVuY2UgaW50byBhbiBIVE1MIEVsZW1lbnQgcmVmZXJlbmNlXHJcbiAgICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjb252ZXJ0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbm9kZVRvRWxlbShub2RlOiBOb2RlKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGlmIChub2RlLmZpcnN0Q2hpbGQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm9kZS10by1lbGVtIHdpdGhvdXQgY2hpbGRub2RlIGlzIHVudGVzdGVkJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBOb2RlOiBOb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0ZW1wTm9kZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKHRlbXBOb2RlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hdGNoIHN0cmluZ3Mgd2hpbGUgaWdub3JpbmcgY2FzZSBzZW5zaXRpdml0eVxyXG4gICAgICogQHBhcmFtIGEgRmlyc3Qgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gYiBTZWNvbmQgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2FzZWxlc3NTdHJpbmdNYXRjaChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmU6IG51bWJlciA9IGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7XHJcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiAnYmFzZScsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUgPT09IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBuZXcgVG9yRGV0Um93IGFuZCByZXR1cm4gdGhlIGlubmVyIGRpdlxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgcm93IHRvIGJlIHRhcmdldHRlZFxyXG4gICAgICogQHBhcmFtIGxhYmVsIFRoZSBuYW1lIHRvIGJlIGRpc3BsYXllZCBmb3IgdGhlIG5ldyByb3dcclxuICAgICAqIEBwYXJhbSByb3dDbGFzcyBUaGUgcm93J3MgY2xhc3NuYW1lIChzaG91bGQgc3RhcnQgd2l0aCBtcF8pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICB0YXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBsYWJlbDogc3RyaW5nLFxyXG4gICAgICAgIHJvd0NsYXNzOiBzdHJpbmdcclxuICAgICk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICBpZiAodGFyID09PSBudWxsIHx8IHRhci5wYXJlbnRFbGVtZW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQWRkIFRvciBEZXRhaWxzIFJvdzogZW1wdHkgbm9kZSBvciBwYXJlbnQgbm9kZSBAICR7dGFyfWApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRhci5wYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cInRvckRldFJvd1wiPjxkaXYgY2xhc3M9XCJ0b3JEZXRMZWZ0XCI+JHtsYWJlbH08L2Rpdj48ZGl2IGNsYXNzPVwidG9yRGV0UmlnaHQgJHtyb3dDbGFzc31cIj48c3BhbiBjbGFzcz1cImZsZXhcIj48L3NwYW4+PC9kaXY+PC9kaXY+YFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuJHtyb3dDbGFzc30gLmZsZXhgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogTWVyZ2Ugd2l0aCBgVXRpbC5jcmVhdGVCdXR0b25gXHJcbiAgICAvKipcclxuICAgICAqIEluc2VydHMgYSBsaW5rIGJ1dHRvbiB0aGF0IGlzIHN0eWxlZCBsaWtlIGEgc2l0ZSBidXR0b24gKGV4LiBpbiB0b3IgZGV0YWlscylcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgdGhlIGJ1dHRvbiBzaG91bGQgYmUgYWRkZWQgdG9cclxuICAgICAqIEBwYXJhbSB1cmwgVGhlIFVSTCB0aGUgYnV0dG9uIHdpbGwgc2VuZCB5b3UgdG9cclxuICAgICAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IG9uIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSBvcmRlciBPcHRpb25hbDogZmxleCBmbG93IG9yZGVyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGlua0J1dHRvbihcclxuICAgICAgICB0YXI6IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHVybDogc3RyaW5nID0gJ25vbmUnLFxyXG4gICAgICAgIHRleHQ6IHN0cmluZyxcclxuICAgICAgICBvcmRlcjogbnVtYmVyID0gMFxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBidXR0b25cclxuICAgICAgICBjb25zdCBidXR0b246IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgIC8vIFNldCB1cCB0aGUgYnV0dG9uXHJcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ21wX2J1dHRvbl9jbG9uZScpO1xyXG4gICAgICAgIGlmICh1cmwgIT09ICdub25lJykge1xyXG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcclxuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBidXR0b24uaW5uZXJUZXh0ID0gdGV4dDtcclxuICAgICAgICBidXR0b24uc3R5bGUub3JkZXIgPSBgJHtvcmRlcn1gO1xyXG4gICAgICAgIC8vIEluamVjdCB0aGUgYnV0dG9uXHJcbiAgICAgICAgdGFyLmluc2VydEJlZm9yZShidXR0b24sIHRhci5maXJzdENoaWxkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc2VydHMgYSBub24tbGlua2VkIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBJRCBvZiB0aGUgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBkaXNwbGF5ZWQgaW4gdGhlIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHR5cGUgVGhlIEhUTUwgZWxlbWVudCB0byBjcmVhdGUuIERlZmF1bHQ6IGBoMWBcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIEhUTUwgZWxlbWVudCB0aGUgYnV0dG9uIHdpbGwgYmUgYHJlbGF0aXZlYCB0b1xyXG4gICAgICogQHBhcmFtIHJlbGF0aXZlIFRoZSBwb3NpdGlvbiBvZiB0aGUgYnV0dG9uIHJlbGF0aXZlIHRvIHRoZSBgdGFyYC4gRGVmYXVsdDogYGFmdGVyZW5kYFxyXG4gICAgICogQHBhcmFtIGJ0bkNsYXNzIFRoZSBjbGFzc25hbWUgb2YgdGhlIGVsZW1lbnQuIERlZmF1bHQ6IGBtcF9idG5gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIHR5cGU6IHN0cmluZyA9ICdoMScsXHJcbiAgICAgICAgdGFyOiBzdHJpbmcgfCBIVE1MRWxlbWVudCxcclxuICAgICAgICByZWxhdGl2ZTogJ2JlZm9yZWJlZ2luJyB8ICdhZnRlcmVuZCcgPSAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgIGJ0bkNsYXNzOiBzdHJpbmcgPSAnbXBfYnRuJ1xyXG4gICAgKTogUHJvbWlzZTxIVE1MRWxlbWVudD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENob29zZSB0aGUgbmV3IGJ1dHRvbiBpbnNlcnQgbG9jYXRpb24gYW5kIGluc2VydCBlbGVtZW50c1xyXG4gICAgICAgICAgICAvLyBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcik7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID1cclxuICAgICAgICAgICAgICAgIHR5cGVvZiB0YXIgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpIDogdGFyO1xyXG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChgJHt0YXJ9IGlzIG51bGwhYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KHJlbGF0aXZlLCBidG4pO1xyXG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKGJ0biwge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBgbXBfJHtpZH1gLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBidG5DbGFzcyxcclxuICAgICAgICAgICAgICAgICAgICByb2xlOiAnYnV0dG9uJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgYnV0dG9uIHRleHRcclxuICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShidG4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhbiBlbGVtZW50IGludG8gYSBidXR0b24gdGhhdCwgd2hlbiBjbGlja2VkLCBjb3BpZXMgdGV4dCB0byBjbGlwYm9hcmRcclxuICAgICAqIEBwYXJhbSBidG4gQW4gSFRNTCBFbGVtZW50IGJlaW5nIHVzZWQgYXMgYSBidXR0b25cclxuICAgICAqIEBwYXJhbSBwYXlsb2FkIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBjb3BpZWQgdG8gY2xpcGJvYXJkIG9uIGJ1dHRvbiBjbGljaywgb3IgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgdXNlIHRoZSBjbGlwYm9hcmQncyBjdXJyZW50IHRleHRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGlwYm9hcmRpZnlCdG4oXHJcbiAgICAgICAgYnRuOiBIVE1MRWxlbWVudCxcclxuICAgICAgICBwYXlsb2FkOiBhbnksXHJcbiAgICAgICAgY29weTogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGJ0bi5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBIYXZlIHRvIG92ZXJyaWRlIHRoZSBOYXZpZ2F0b3IgdHlwZSB0byBwcmV2ZW50IFRTIGVycm9yc1xyXG4gICAgICAgICAgICBjb25zdCBuYXY6IE5hdmlnYXRvckV4dGVuZGVkIHwgdW5kZWZpbmVkID0gPE5hdmlnYXRvckV4dGVuZGVkPm5hdmlnYXRvcjtcclxuICAgICAgICAgICAgaWYgKG5hdiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydCgnRmFpbGVkIHRvIGNvcHkgdGV4dCwgbGlrZWx5IGR1ZSB0byBtaXNzaW5nIGJyb3dzZXIgc3VwcG9ydC4nKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJyb3dzZXIgZG9lc24ndCBzdXBwb3J0ICduYXZpZ2F0b3InP1wiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8qIE5hdmlnYXRvciBFeGlzdHMgKi9cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY29weSAmJiB0eXBlb2YgcGF5bG9hZCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb3B5IHJlc3VsdHMgdG8gY2xpcGJvYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEud3JpdGVUZXh0KHBheWxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvcGllZCB0byB5b3VyIGNsaXBib2FyZCEnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuIHBheWxvYWQgZnVuY3Rpb24gd2l0aCBjbGlwYm9hcmQgdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIG5hdi5jbGlwYm9hcmQhLnJlYWRUZXh0KCkudGhlbigodGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkKHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvcGllZCBmcm9tIHlvdXIgY2xpcGJvYXJkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnRuLnN0eWxlLmNvbG9yID0gJ2dyZWVuJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhbiBIVFRQUmVxdWVzdCBmb3IgR0VUIEpTT04sIHJldHVybnMgdGhlIGZ1bGwgdGV4dCBvZiBIVFRQIEdFVFxyXG4gICAgICogQHBhcmFtIHVybCAtIGEgc3RyaW5nIG9mIHRoZSBVUkwgdG8gc3VibWl0IGZvciBHRVQgcmVxdWVzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEpTT04odXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGdldEhUVFAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxyXG4gICAgICAgICAgICBnZXRIVFRQLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGdldEhUVFAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SFRUUC5yZWFkeVN0YXRlID09PSA0ICYmIGdldEhUVFAuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGdldEhUVFAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5zZW5kKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIHR3byBwYXJhbWV0ZXJzXHJcbiAgICAgKiBAcGFyYW0gbWluIGEgbnVtYmVyIG9mIHRoZSBib3R0b20gb2YgcmFuZG9tIG51bWJlciBwb29sXHJcbiAgICAgKiBAcGFyYW0gbWF4IGEgbnVtYmVyIG9mIHRoZSB0b3Agb2YgdGhlIHJhbmRvbSBudW1iZXIgcG9vbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJhbmRvbU51bWJlciA9IChtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNsZWVwIHV0aWwgdG8gYmUgdXNlZCBpbiBhc3luYyBmdW5jdGlvbnMgdG8gZGVsYXkgcHJvZ3JhbVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNsZWVwID0gKG06IGFueSk6IFByb21pc2U8dm9pZD4gPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbSkpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBsYXN0IHNlY3Rpb24gb2YgYW4gSFJFRlxyXG4gICAgICogQHBhcmFtIGVsZW0gQW4gYW5jaG9yIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBzcGxpdCBPcHRpb25hbCBkaXZpZGVyLiBEZWZhdWx0cyB0byBgL2BcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBlbmRPZkhyZWYgPSAoZWxlbTogSFRNTEFuY2hvckVsZW1lbnQsIHNwbGl0ID0gJy8nKSA9PlxyXG4gICAgICAgIGVsZW0uaHJlZi5zcGxpdChzcGxpdCkucG9wKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGhleCB2YWx1ZSBvZiBhIGNvbXBvbmVudCBhcyBhIHN0cmluZy5cclxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICogQG1lbWJlcm9mIFV0aWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjb21wb25lbnRUb0hleCA9IChjOiBudW1iZXIgfCBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIGNvbnN0IGhleCA9IGMudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIHJldHVybiBoZXgubGVuZ3RoID09PSAxID8gYDAke2hleH1gIDogaGV4O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGEgaGV4IGNvbG9yIGNvZGUgZnJvbSBSR0IuXHJcbiAgICAgKiBGcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzhcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJnYlRvSGV4ID0gKHI6IG51bWJlciwgZzogbnVtYmVyLCBiOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgIHJldHVybiBgIyR7VXRpbC5jb21wb25lbnRUb0hleChyKX0ke1V0aWwuY29tcG9uZW50VG9IZXgoZyl9JHtVdGlsLmNvbXBvbmVudFRvSGV4KFxyXG4gICAgICAgICAgICBiXHJcbiAgICAgICAgKX1gO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV4dHJhY3QgbnVtYmVycyAod2l0aCBmbG9hdCkgZnJvbSB0ZXh0IGFuZCByZXR1cm4gdGhlbVxyXG4gICAgICogQHBhcmFtIHRhciBBbiBIVE1MIGVsZW1lbnQgdGhhdCBjb250YWlucyBudW1iZXJzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdEZsb2F0ID0gKHRhcjogSFRNTEVsZW1lbnQpOiBudW1iZXJbXSA9PiB7XHJcbiAgICAgICAgaWYgKHRhci50ZXh0Q29udGVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRhci50ZXh0Q29udGVudCEucmVwbGFjZSgvLC9nLCAnJykubWF0Y2goL1xcZCtcXC5cXGQrLykgfHwgW10pLm1hcCgobikgPT5cclxuICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobilcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RhcmdldCBjb250YWlucyBubyB0ZXh0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgR2V0IHRoZSB1c2VyIGdpZnQgaGlzdG9yeSBiZXR3ZWVuIHRoZSBsb2dnZWQgaW4gdXNlciBhbmQgYSBnaXZlbiBJRFxyXG4gICAgICogQHBhcmFtIHVzZXJJRCBBIHVzZXIgSUQ7IGNhbiBiZSBhIHN0cmluZyBvciBudW1iZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBnZXRVc2VyR2lmdEhpc3RvcnkoXHJcbiAgICAgICAgdXNlcklEOiBudW1iZXIgfCBzdHJpbmdcclxuICAgICk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcclxuICAgICAgICBjb25zdCByYXdHaWZ0SGlzdG9yeTogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKFxyXG4gICAgICAgICAgICBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL3VzZXJCb251c0hpc3RvcnkucGhwP290aGVyX3VzZXJpZD0ke3VzZXJJRH1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeTogQXJyYXk8VXNlckdpZnRIaXN0b3J5PiA9IEpTT04ucGFyc2UocmF3R2lmdEhpc3RvcnkpO1xyXG4gICAgICAgIC8vIFJldHVybiB0aGUgZnVsbCBkYXRhXHJcbiAgICAgICAgcmV0dXJuIGdpZnRIaXN0b3J5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcHJldHR5U2l0ZVRpbWUodW5peFRpbWVzdGFtcDogbnVtYmVyLCBkYXRlPzogYm9vbGVhbiwgdGltZT86IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSh1bml4VGltZXN0YW1wICogMTAwMCkudG9JU09TdHJpbmcoKTtcclxuICAgICAgICBpZiAoZGF0ZSAmJiAhdGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMF07XHJcbiAgICAgICAgfSBlbHNlIGlmICghZGF0ZSAmJiB0aW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXAuc3BsaXQoJ1QnKVsxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgQ2hlY2sgYSBzdHJpbmcgdG8gc2VlIGlmIGl0J3MgZGl2aWRlZCB3aXRoIGEgZGFzaCwgcmV0dXJuaW5nIHRoZSBmaXJzdCBoYWxmIGlmIGl0IGRvZXNuJ3QgY29udGFpbiBhIHNwZWNpZmllZCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBvcmlnaW5hbCBUaGUgb3JpZ2luYWwgc3RyaW5nIGJlaW5nIGNoZWNrZWRcclxuICAgICAqIEBwYXJhbSBjb250YWluZWQgQSBzdHJpbmcgdGhhdCBtaWdodCBiZSBjb250YWluZWQgaW4gdGhlIG9yaWdpbmFsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2hlY2tEYXNoZXMob3JpZ2luYWw6IHN0cmluZywgY29udGFpbmVkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIGBjaGVja0Rhc2hlcyggJHtvcmlnaW5hbH0sICR7Y29udGFpbmVkfSApOiBDb3VudCAke29yaWdpbmFsLmluZGV4T2YoXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtICdcclxuICAgICAgICAgICAgICAgICl9YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGFzaGVzIGFyZSBwcmVzZW50XHJcbiAgICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJyAtICcpICE9PSAtMSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTdHJpbmcgY29udGFpbnMgYSBkYXNoYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc3BsaXQ6IHN0cmluZ1tdID0gb3JpZ2luYWwuc3BsaXQoJyAtICcpO1xyXG4gICAgICAgICAgICBpZiAoc3BsaXRbMF0gPT09IGNvbnRhaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGA+IFN0cmluZyBiZWZvcmUgZGFzaCBpcyBcIiR7Y29udGFpbmVkfVwiOyB1c2luZyBzdHJpbmcgYmVoaW5kIGRhc2hgXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzcGxpdFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzcGxpdFswXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyBVdGlsaXRpZXMgc3BlY2lmaWMgdG8gR29vZHJlYWRzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ29vZHJlYWRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUmVtb3ZlcyBzcGFjZXMgaW4gYXV0aG9yIG5hbWVzIHRoYXQgdXNlIGFkamFjZW50IGludGl0aWFscy5cclxuICAgICAgICAgKiBAcGFyYW0gYXV0aCBUaGUgYXV0aG9yKHMpXHJcbiAgICAgICAgICogQGV4YW1wbGUgXCJIIEcgV2VsbHNcIiAtPiBcIkhHIFdlbGxzXCJcclxuICAgICAgICAgKi9cclxuICAgICAgICBzbWFydEF1dGg6IChhdXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBVdGlsLnN0cmluZ1RvQXJyYXkoYXV0aCk7XHJcbiAgICAgICAgICAgIGFyci5mb3JFYWNoKChrZXksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBrZXkgaXMgYW4gaW5pdGlhbFxyXG4gICAgICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgbmV4dCBrZXkgaXMgYW4gaW5pdGlhbCwgZG9uJ3QgYWRkIGEgc3BhY2VcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuZzogbnVtYmVyID0gYXJyW3ZhbCArIDFdLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dExlbmcgPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0ga2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgJHtrZXl9IGA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBUcmltIHRyYWlsaW5nIHNwYWNlXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwLnRyaW0oKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogVHVybnMgYSBzdHJpbmcgaW50byBhIEdvb2RyZWFkcyBzZWFyY2ggVVJMXHJcbiAgICAgICAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgVVJMIHRvIG1ha2VcclxuICAgICAgICAgKiBAcGFyYW0gaW5wIFRoZSBleHRyYWN0ZWQgZGF0YSB0byBVUkkgZW5jb2RlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYnVpbGRTZWFyY2hVUkw6ICh0eXBlOiBCb29rRGF0YSB8ICdvbicsIGlucDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZ29vZHJlYWRzLmJ1aWxkR3JTZWFyY2hVUkwoICR7dHlwZX0sICR7aW5wfSApYCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBnclR5cGU6IHN0cmluZyA9IHR5cGU7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhc2VzOiBhbnkgPSB7XHJcbiAgICAgICAgICAgICAgICBib29rOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ3RpdGxlJztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzZXJpZXM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBnclR5cGUgPSAnb24nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlucCArPSAnLCAjJztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChjYXNlc1t0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZXNbdHlwZV0oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYGh0dHA6Ly93d3cuZGVyZWZlcmVyLm9yZy8/aHR0cHM6Ly93d3cuZ29vZHJlYWRzLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgIGlucC5yZXBsYWNlKCclJywgJycpXHJcbiAgICAgICAgICAgICkucmVwbGFjZShcIidcIiwgJyUyNycpfSZzZWFyY2hfdHlwZT1ib29rcyZzZWFyY2glNUJmaWVsZCU1RD0ke2dyVHlwZX1gO1xyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBSZXR1cm4gYSBjbGVhbmVkIGJvb2sgdGl0bGUgZnJvbSBhbiBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSB0aXRsZSB0ZXh0XHJcbiAgICAgKiBAcGFyYW0gYXV0aCBBIHN0cmluZyBvZiBhdXRob3JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1RpdGxlID0gYXN5bmMgKFxyXG4gICAgICAgIGRhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aDogc3RyaW5nID0gJydcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0Qm9va1RpdGxlKCkgZmFpbGVkOyBlbGVtZW50IHdhcyBudWxsIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZXh0cmFjdGVkID0gZGF0YS5pbm5lclRleHQ7XHJcbiAgICAgICAgLy8gU2hvcnRlbiB0aXRsZSBhbmQgY2hlY2sgaXQgZm9yIGJyYWNrZXRzICYgYXV0aG9yIG5hbWVzXHJcbiAgICAgICAgZXh0cmFjdGVkID0gVXRpbC50cmltU3RyaW5nKFV0aWwuYnJhY2tldFJlbW92ZXIoZXh0cmFjdGVkKSwgNTApO1xyXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwuY2hlY2tEYXNoZXMoZXh0cmFjdGVkLCBhdXRoKTtcclxuICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tBdXRob3JzID0gYXN5bmMgKFxyXG4gICAgICAgIGRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICBudW06IG51bWJlciA9IDNcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0Qm9va0F1dGhvcnMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGF1dGhMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGRhdGEuZm9yRWFjaCgoYXV0aG9yKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChudW0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5wdXNoKFV0aWwuZ29vZHJlYWRzLnNtYXJ0QXV0aChhdXRob3IuaW5uZXJUZXh0KSk7XHJcbiAgICAgICAgICAgICAgICBudW0tLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhdXRoTGlzdDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rU2VyaWVzID0gYXN5bmMgKGRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0Qm9va1NlcmllcygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBkYXRhLmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICBzZXJpZXNMaXN0LnB1c2goc2VyaWVzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHNlcmllc0xpc3Q7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxyXG4gICAgICAgIHJvd0xpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4sXHJcbiAgICAgICAgdGl0bGVDbGFzcyA9ICcudG9yRGV0TGVmdCcsXHJcbiAgICAgICAgZGF0YUNsYXNzID0gJ3RvckRldFJpZ2h0J1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgcm93czogYW55W10gPSBbXTtcclxuXHJcbiAgICAgICAgcm93TGlzdC5mb3JFYWNoKChyb3cpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJvdy5xdWVyeVNlbGVjdG9yKHRpdGxlQ2xhc3MpO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3RvcihkYXRhQ2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgcm93cy5wdXNoKHsgdGl0bGU6IHRpdGxlLCBkYXRhOiBkYXRhIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcm93cy5yZWR1Y2UoKHByZXYsIGN1cikgPT4gKHByZXZbY3VyLmtleV0gPSBjdXIudmFsdWUpKTtcclxuICAgIH07XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vKipcclxuICogIyBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsaWRhdGlvbiAmIGNvbmZpcm1hdGlvblxyXG4gKi9cclxuY2xhc3MgQ2hlY2sge1xyXG4gICAgcHVibGljIHN0YXRpYyBuZXdWZXI6IHN0cmluZyA9IEdNX2luZm8uc2NyaXB0LnZlcnNpb247XHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXZWZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdtcF92ZXJzaW9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFdhaXQgZm9yIGFuIGVsZW1lbnQgdG8gZXhpc3QsIHRoZW4gcmV0dXJuIGl0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgRE9NIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYW4gZWxlbWVudFxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxIVE1MRWxlbWVudD59IFByb21pc2Ugb2YgYW4gZWxlbWVudCB0aGF0IHdhcyBzZWxlY3RlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1Mb2FkKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYCVjIExvb2tpbmcgZm9yICR7c2VsZWN0b3J9YCwgJ2JhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjNTU1Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBfY291bnRlciA9IDA7XHJcbiAgICAgICAgY29uc3QgX2NvdW50ZXJMaW1pdCA9IDEwMDtcclxuICAgICAgICBjb25zdCBsb2dpYyA9IGFzeW5jIChzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIVE1MRWxlbWVudCB8IGZhbHNlPiA9PiB7XHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgYWN0dWFsIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBgJHtzZWxlY3Rvcn0gaXMgdW5kZWZpbmVkIWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPCBfY291bnRlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLmFmVGltZXIoKTtcclxuICAgICAgICAgICAgICAgIF9jb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgbG9naWMoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPj0gX2NvdW50ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgX2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxvZ2ljKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogUnVuIGEgZnVuY3Rpb24gd2hlbmV2ZXIgYW4gZWxlbWVudCBjaGFuZ2VzXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgZWxlbWVudCB0byBiZSBvYnNlcnZlZC4gQ2FuIGJlIGEgc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBvYnNlcnZlciB0cmlnZ2Vyc1xyXG4gICAgICogQHJldHVybiBQcm9taXNlIG9mIGEgbXV0YXRpb24gb2JzZXJ2ZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBjYWxsYmFjazogTXV0YXRpb25DYWxsYmFjayxcclxuICAgICAgICBjb25maWc6IE11dGF0aW9uT2JzZXJ2ZXJJbml0ID0ge1xyXG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgKTogUHJvbWlzZTxNdXRhdGlvbk9ic2VydmVyPiB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgJyR7c2VsZWN0b3J9J2ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIGAlYyBTZXR0aW5nIG9ic2VydmVyIG9uICR7c2VsZWN0b3J9OiAke3NlbGVjdGVkfWAsXHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1ZDhhYTgnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xyXG5cclxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHNlbGVjdGVkISwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgc2NyaXB0IGhhcyBiZWVuIHVwZGF0ZWQgZnJvbSBhbiBvbGRlciB2ZXJzaW9uXHJcbiAgICAgKiBAcmV0dXJuIFRoZSB2ZXJzaW9uIHN0cmluZyBvciBmYWxzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHVwZGF0ZWQoKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoJ0NoZWNrLnVwZGF0ZWQoKScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUFJFViBWRVIgPSAke3RoaXMucHJldlZlcn1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYE5FVyBWRVIgPSAke3RoaXMubmV3VmVyfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gRGlmZmVyZW50IHZlcnNpb25zOyB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1ZlciAhPT0gdGhpcy5wcmV2VmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGlzIG5ldyBvciB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF92ZXJzaW9uJywgdGhpcy5uZXdWZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJldlZlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzY3JpcHQgaGFzIHJ1biBiZWZvcmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgcnVuIGJlZm9yZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ3VwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QtdGltZSBydW5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgbmV2ZXIgcnVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5hYmxlIHRoZSBtb3N0IGJhc2ljIGZlYXR1cmVzXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2dvb2RyZWFkc0J0bicsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdhbGVydHMnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdmaXJzdFJ1bicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBub3QgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSB3aGF0IHBhZ2UgaXMgYmVpbmcgYWNjZXNzZWRcclxuICAgICAqIEBwYXJhbSB7VmFsaWRQYWdlfSBwYWdlUXVlcnkgLSBBbiBvcHRpb25hbCBwYWdlIHRvIHNwZWNpZmljYWxseSBjaGVjayBmb3JcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn0gQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gT3B0aW9uYWxseSwgYSBib29sZWFuIGlmIHRoZSBjdXJyZW50IHBhZ2UgbWF0Y2hlcyB0aGUgYHBhZ2VRdWVyeWBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKHBhZ2VRdWVyeT86IFZhbGlkUGFnZSk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFBhZ2UgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrLnBhZ2UoKSBoYXMgYmVlbiBydW4gYW5kIGEgdmFsdWUgd2FzIHN0b3JlZFxyXG4gICAgICAgICAgICBpZiAoc3RvcmVkUGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBzdG9yZWQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0b3JlZFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gc3RvcmVkUGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBub3QgcHJldmlvdXMgcnVuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBHcmFiIHRoZSBVUkwgYW5kIHNsaWNlIG91dCB0aGUgZ29vZCBiaXRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWdlU3RyOiBzdHJpbmcgPSBwYXRoLnNwbGl0KCcvJylbMV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJQYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBwYXRoLnNwbGl0KCcvJylbMl07XHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFBhZ2U6IHN0cmluZztcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBvYmplY3QgbGl0ZXJhbCBvZiBzb3J0cyB0byB1c2UgYXMgYSBcInN3aXRjaFwiXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYXNlczogU3RyaW5nT2JqZWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcnOiAnaG9tZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2luZGV4LnBocCc6ICdob21lJyxcclxuICAgICAgICAgICAgICAgICAgICBzaG91dGJveDogJ3Nob3V0Ym94JyxcclxuICAgICAgICAgICAgICAgICAgICB0OiAndG9ycmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICdzZXR0aW5ncycsXHJcbiAgICAgICAgICAgICAgICAgICAgdTogJ3VzZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICdmL3QnOiAnZm9ydW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcjogc3ViUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBtaWxsaW9uYWlyZXM6ICd2YXVsdCcsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLyogVE9ETzogc2V0IGBjYXNlc2AgdG8gYW55IHRvIGFsbG93IHByb3BlciBPYmplY3Qgc3dpdGNoICovXHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUGFnZSBAICR7cGFnZVN0cn1cXG5TdWJwYWdlIEAgJHtzdWJQYWdlfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhc2VzW3BhZ2VTdHJdIHx8IGNhc2VzW3BhZ2VTdHIgKyAnLycgKyBzdWJQYWdlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXNlc1twYWdlU3RyXSA9PT0gc3ViUGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFnZSA9IHN1YlBhZ2Uuc3BsaXQoJy4nKVswXS5yZXBsYWNlKC9bMC05XS9nLCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYXNlc1twYWdlU3RyICsgJy8nICsgc3ViUGFnZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSBjYXNlc1twYWdlU3RyICsgJy8nICsgc3ViUGFnZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGb3J1bSBDYXNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSBjYXNlc1twYWdlU3RyXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDdXJyZW50bHkgb24gJHtjdXJyZW50UGFnZX0gcGFnZWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBwYWdlIHRvIGJlIGFjY2Vzc2VkIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJywgY3VycmVudFBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJyZW50UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IGN1cnJlbnRQYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgcGFnZVN0ciBjYXNlIHJldHVybnMgJyR7Y2FzZXNbcGFnZVN0cl19J2ApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiBhIGdpdmVuIGNhdGVnb3J5IGlzIGFuIGVib29rL2F1ZGlvYm9vayBjYXRlZ29yeVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzQm9va0NhdChjYXQ6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIEN1cnJlbnRseSwgYWxsIGJvb2sgY2F0ZWdvcmllcyBhcmUgYXNzdW1lZCB0byBiZSBpbiB0aGUgcmFuZ2Ugb2YgMzktMTIwXHJcbiAgICAgICAgcmV0dXJuIGNhdCA+PSAzOSAmJiBjYXQgPD0gMTIwID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcblxyXG4vKipcclxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbHVlcyBhbmQgbWV0aG9kcyByZWxhdGVkIHRvIHN0eWxlc1xyXG4gKiBAY29uc3RydWN0b3IgSW5pdGlhbGl6ZXMgdGhlbWUgYmFzZWQgb24gbGFzdCBzYXZlZCB2YWx1ZTsgY2FuIGJlIGNhbGxlZCBiZWZvcmUgcGFnZSBjb250ZW50IGlzIGxvYWRlZFxyXG4gKiBAbWV0aG9kIHRoZW1lIEdldHMgb3Igc2V0cyB0aGUgY3VycmVudCB0aGVtZVxyXG4gKi9cclxuY2xhc3MgU3R5bGUge1xyXG4gICAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3ByZXZUaGVtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfY3NzRGF0YTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIFRoZSBsaWdodCB0aGVtZSBpcyB0aGUgZGVmYXVsdCB0aGVtZSwgc28gdXNlIE0rIExpZ2h0IHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gJ2xpZ2h0JztcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBwcmV2aW91c2x5IHVzZWQgdGhlbWUgb2JqZWN0XHJcbiAgICAgICAgdGhpcy5fcHJldlRoZW1lID0gdGhpcy5fZ2V0UHJldlRoZW1lKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgZXhpc3RzLCBhc3N1bWUgdGhlIGN1cnJlbnQgdGhlbWUgaXMgaWRlbnRpY2FsXHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZUaGVtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcHJldlRoZW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2Fybignbm8gcHJldmlvdXMgdGhlbWUnKTtcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggdGhlIENTUyBkYXRhXHJcbiAgICAgICAgdGhpcy5fY3NzRGF0YSA9IEdNX2dldFJlc291cmNlVGV4dCgnTVBfQ1NTJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSByZXR1cm5lZCAqL1xyXG4gICAgZ2V0IHRoZW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgc2V0ICovXHJcbiAgICBzZXQgdGhlbWUodmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl90aGVtZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyB0aGUgTSsgdGhlbWUgYmFzZWQgb24gdGhlIHNpdGUgdGhlbWUgKi9cclxuICAgIHB1YmxpYyBhc3luYyBhbGlnblRvU2l0ZVRoZW1lKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHRoZW1lOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZXRTaXRlQ1NTKCk7XHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGVtZS5pbmRleE9mKCdkYXJrJykgPiAwID8gJ2RhcmsnIDogJ2xpZ2h0JztcclxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB0aGlzLl90aGVtZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRQcmV2VGhlbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluamVjdCB0aGUgQ1NTIGNsYXNzIHVzZWQgYnkgTSsgZm9yIHRoZW1pbmdcclxuICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xyXG4gICAgICAgICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKGBtcF8ke3RoaXMuX3RoZW1lfWApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEJvZHkgaXMgJHtib2R5fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEluamVjdHMgdGhlIHN0eWxlc2hlZXQgbGluayBpbnRvIHRoZSBoZWFkZXIgKi9cclxuICAgIHB1YmxpYyBpbmplY3RMaW5rKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkOiBzdHJpbmcgPSAnbXBfY3NzJztcclxuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkge1xyXG4gICAgICAgICAgICBjb25zdCBzdHlsZTogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHN0eWxlLmlubmVyVGV4dCA9IHRoaXMuX2Nzc0RhdGEgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2Nzc0RhdGEgOiAnJztcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpIS5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBhbiBlbGVtZW50IHdpdGggdGhlIGlkIFwiJHtpZH1cIiBhbHJlYWR5IGV4aXN0c2ApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgaWYgaXQgZXhpc3RzICovXHJcbiAgICBwcml2YXRlIF9nZXRQcmV2VGhlbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gR01fZ2V0VmFsdWUoJ3N0eWxlX3RoZW1lJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNhdmVzIHRoZSBjdXJyZW50IHRoZW1lIGZvciBmdXR1cmUgcmVmZXJlbmNlICovXHJcbiAgICBwcml2YXRlIF9zZXRQcmV2VGhlbWUoKTogdm9pZCB7XHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3N0eWxlX3RoZW1lJywgdGhpcy5fdGhlbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFNpdGVDU1MoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhlbWVVUkw6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2hlYWQgbGlua1tocmVmKj1cIklDR3N0YXRpb25cIl0nKSFcclxuICAgICAgICAgICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVtZVVSTCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUodGhlbWVVUkwpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oYHRoZW1lVXJsIGlzIG5vdCBhIHN0cmluZzogJHt0aGVtZVVSTH1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxyXG4vKipcclxuICogQ09SRSBGRUFUVVJFU1xyXG4gKlxyXG4gKiBZb3VyIGZlYXR1cmUgYmVsb25ncyBoZXJlIGlmIHRoZSBmZWF0dXJlOlxyXG4gKiBBKSBpcyBjcml0aWNhbCB0byB0aGUgdXNlcnNjcmlwdFxyXG4gKiBCKSBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG90aGVyIGZlYXR1cmVzXHJcbiAqIEMpIHdpbGwgaGF2ZSBzZXR0aW5ncyBkaXNwbGF5ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2VcclxuICogSWYgQSAmIEIgYXJlIG1ldCBidXQgbm90IEMgY29uc2lkZXIgdXNpbmcgYFV0aWxzLnRzYCBpbnN0ZWFkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZmVhdHVyZSBjcmVhdGVzIGEgcG9wLXVwIG5vdGlmaWNhdGlvblxyXG4gKi9cclxuY2xhc3MgQWxlcnRzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2FsZXJ0cycsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNKyBBbGVydCBwYW5lbCBmb3IgdXBkYXRlIGluZm9ybWF0aW9uLCBldGMuJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2godGhpcy5fc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3RpZnkoa2luZDogc3RyaW5nIHwgYm9vbGVhbiwgbG9nOiBBcnJheU9iamVjdCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFsZXJ0cy5ub3RpZnkoICR7a2luZH0gKWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFZlcmlmeSBhIG5vdGlmaWNhdGlvbiByZXF1ZXN0IHdhcyBtYWRlXHJcbiAgICAgICAgICAgIGlmIChraW5kKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgbm90aWZpY2F0aW9ucyBhcmUgYWxsb3dlZFxyXG4gICAgICAgICAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdhbGVydHMnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG1zZyB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRNc2cgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycjogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICApOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZE1zZyggJHt0aXRsZX0gKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYXJyYXkgaXNuJ3QgZW1wdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPiAwICYmIGFyclswXSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNlY3Rpb24gaGVhZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1zZzogc3RyaW5nID0gYDxoND4ke3RpdGxlfTo8L2g0Pjx1bD5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaXRlbSBpbiB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gYDxsaT4ke2l0ZW19PC9saT5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJzwvdWw+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBub3RpZmljYXRpb24gcGFuZWxcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsZFBhbmVsID0gKG1zZzogc3RyaW5nKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkUGFuZWwoICR7bXNnfSApYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSdtcF9ub3RpZmljYXRpb24nPiR7bXNnfTxzcGFuPlg8L3NwYW4+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0JveDogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9ub3RpZmljYXRpb24nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnRuOiBIVE1MU3BhbkVsZW1lbnQgPSBtc2dCb3gucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VCdG4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLCByZW1vdmUgaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1zZ0JveCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2dCb3gucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAndXBkYXRlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgdXBkYXRlIG1lc3NhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYDxzdHJvbmc+TUFNKyBoYXMgYmVlbiB1cGRhdGVkITwvc3Ryb25nPiBZb3UgYXJlIG5vdyB1c2luZyB2JHtNUC5WRVJTSU9OfSwgY3JlYXRlZCBvbiAke01QLlRJTUVTVEFNUH0uIERpc2N1c3MgaXQgb24gPGEgaHJlZj0nZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjMnPnRoZSBmb3J1bXM8L2E+Ljxocj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNoYW5nZWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5VUERBVEVfTElTVCwgJ0NoYW5nZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuQlVHX0xJU1QsICdLbm93biBCdWdzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAnZmlyc3RSdW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxoND5XZWxjb21lIHRvIE1BTSshPC9oND5QbGVhc2UgaGVhZCBvdmVyIHRvIHlvdXIgPGEgaHJlZj1cIi9wcmVmZXJlbmNlcy9pbmRleC5waHBcIj5wcmVmZXJlbmNlczwvYT4gdG8gZW5hYmxlIHRoZSBNQU0rIHNldHRpbmdzLjxicj5BbnkgYnVnIHJlcG9ydHMsIGZlYXR1cmUgcmVxdWVzdHMsIGV0Yy4gY2FuIGJlIG1hZGUgb24gPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy9pc3N1ZXNcIj5HaXRodWI8L2E+LCA8YSBocmVmPVwiL2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzXCI+dGhlIGZvcnVtczwvYT4sIG9yIDxhIGhyZWY9XCIvc2VuZG1lc3NhZ2UucGhwP3JlY2VpdmVyPTEwODMwM1wiPnRocm91Z2ggcHJpdmF0ZSBtZXNzYWdlPC9hPi4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyBmaXJzdCBydW4gbWVzc2FnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFJlY2VpdmVkIG1zZyBraW5kOiAke2tpbmR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFuZWwobWVzc2FnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVidWcgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZGVidWcnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdFcnJvciBsb2cgKDxlbT5DbGljayB0aGlzIGNoZWNrYm94IHRvIGVuYWJsZSB2ZXJib3NlIGxvZ2dpbmcgdG8gdGhlIGNvbnNvbGU8L2VtPiknLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBHTE9CQUwgRkVBVFVSRVNcclxuICovXHJcblxyXG5jbGFzcyBIaWRlSG9tZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnZHJvcGRvd24nLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZUhvbWUnLFxyXG4gICAgICAgIHRhZzogJ1JlbW92ZSBiYW5uZXIvaG9tZScsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnRG8gbm90IHJlbW92ZSBlaXRoZXInLFxyXG4gICAgICAgICAgICBoaWRlQmFubmVyOiAnSGlkZSB0aGUgYmFubmVyJyxcclxuICAgICAgICAgICAgaGlkZUhvbWU6ICdIaWRlIHRoZSBob21lIGJ1dHRvbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBoZWFkZXIgaW1hZ2Ugb3IgSG9tZSBidXR0b24sIGJlY2F1c2UgYm90aCBsaW5rIHRvIHRoZSBob21lcGFnZScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5tZW51JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGhpZGVyOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSh0aGlzLl9zZXR0aW5ncy50aXRsZSk7XHJcbiAgICAgICAgaWYgKGhpZGVyID09PSAnaGlkZUhvbWUnKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9ob21lJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgaG9tZSBidXR0b24hJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChoaWRlciA9PT0gJ2hpZGVCYW5uZXInKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9iYW5uZXInKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBiYW5uZXIhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBEcm9wZG93blNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVmF1bHRMaW5rIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd2YXVsdExpbmsnLFxyXG4gICAgICAgIGRlc2M6ICdNYWtlIHRoZSBWYXVsdCBsaW5rIGJ5cGFzcyB0aGUgVmF1bHQgSW5mbyBwYWdlJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKSFcclxuICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvbWlsbGlvbmFpcmVzL2RvbmF0ZS5waHAnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBNYWRlIHRoZSB2YXVsdCB0ZXh0IGxpbmsgdG8gdGhlIGRvbmF0ZSBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWluaVZhdWx0SW5mbyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnbWluaVZhdWx0SW5mbycsXHJcbiAgICAgICAgZGVzYzogJ1Nob3J0ZW4gdGhlIFZhdWx0IGxpbmsgJiByYXRpbyB0ZXh0JyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgdmF1bHRUZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc3QgcmF0aW9UZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJykhO1xyXG5cclxuICAgICAgICAvLyBTaG9ydGVuIHRoZSByYXRpbyB0ZXh0XHJcbiAgICAgICAgLy8gVE9ETzogbW92ZSB0aGlzIHRvIGl0cyBvd24gc2V0dGluZz9cclxuICAgICAgICAvKiBUaGlzIGNoYWluZWQgbW9uc3Ryb3NpdHkgZG9lcyB0aGUgZm9sbG93aW5nOlxyXG4gICAgICAgIC0gRXh0cmFjdCB0aGUgbnVtYmVyICh3aXRoIGZsb2F0KSBmcm9tIHRoZSBlbGVtZW50XHJcbiAgICAgICAgLSBGaXggdGhlIGZsb2F0IHRvIDIgZGVjaW1hbCBwbGFjZXMgKHdoaWNoIGNvbnZlcnRzIGl0IGJhY2sgaW50byBhIHN0cmluZylcclxuICAgICAgICAtIENvbnZlcnQgdGhlIHN0cmluZyBiYWNrIGludG8gYSBudW1iZXIgc28gdGhhdCB3ZSBjYW4gY29udmVydCBpdCB3aXRoYHRvTG9jYWxlU3RyaW5nYCB0byBnZXQgY29tbWFzIGJhY2sgKi9cclxuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoVXRpbC5leHRyYWN0RmxvYXQocmF0aW9UZXh0KVswXS50b0ZpeGVkKDIpKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgIHJhdGlvVGV4dC5pbm5lckhUTUwgPSBgJHtudW19IDxpbWcgc3JjPVwiL3BpYy91cGRvd25CaWcucG5nXCIgYWx0PVwicmF0aW9cIj5gO1xyXG5cclxuICAgICAgICAvLyBUdXJuIHRoZSBudW1lcmljIHBvcnRpb24gb2YgdGhlIHZhdWx0IGxpbmsgaW50byBhIG51bWJlclxyXG4gICAgICAgIGxldCBuZXdUZXh0OiBudW1iZXIgPSBwYXJzZUludChcclxuICAgICAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50IS5zcGxpdCgnOicpWzFdLnNwbGl0KCcgJylbMV0ucmVwbGFjZSgvLC9nLCAnJylcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IHRoZSB2YXVsdCBhbW91bnQgdG8gbWlsbGlvbnRoc1xyXG4gICAgICAgIG5ld1RleHQgPSBOdW1iZXIoKG5ld1RleHQgLyAxZTYpLnRvRml4ZWQoMykpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdmF1bHQgdGV4dFxyXG4gICAgICAgIHZhdWx0VGV4dC50ZXh0Q29udGVudCA9IGBWYXVsdDogJHtuZXdUZXh0fSBtaWxsaW9uYDtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaG9ydGVuZWQgdGhlIHZhdWx0ICYgcmF0aW8gbnVtYmVycyEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJvbnVzUG9pbnREZWx0YSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYm9udXNQb2ludERlbHRhJyxcclxuICAgICAgICBkZXNjOiBgRGlzcGxheSBob3cgbWFueSBib251cyBwb2ludHMgeW91J3ZlIGdhaW5lZCBzaW5jZSBsYXN0IHBhZ2Vsb2FkYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG1CUCc7XHJcbiAgICBwcml2YXRlIF9wcmV2QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9jdXJyZW50QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9kZWx0YTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50QlBFbDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG5cclxuICAgICAgICAvLyBHZXQgb2xkIEJQIHZhbHVlXHJcbiAgICAgICAgdGhpcy5fcHJldkJQID0gdGhpcy5fZ2V0QlAoKTtcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRCUEVsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgbnVtYmVyIGZyb20gdGhlIEJQIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudDogUmVnRXhwTWF0Y2hBcnJheSA9IGN1cnJlbnRCUEVsLnRleHRDb250ZW50IS5tYXRjaChcclxuICAgICAgICAgICAgICAgIC9cXGQrL2dcclxuICAgICAgICAgICAgKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IG5ldyBCUCB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50QlAgPSBwYXJzZUludChjdXJyZW50WzBdKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0QlAodGhpcy5fY3VycmVudEJQKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWx0YVxyXG4gICAgICAgICAgICB0aGlzLl9kZWx0YSA9IHRoaXMuX2N1cnJlbnRCUCAtIHRoaXMuX3ByZXZCUDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRleHQgaWYgbm90IDBcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlbHRhICE9PSAwICYmICFpc05hTih0aGlzLl9kZWx0YSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3BsYXlCUCh0aGlzLl9kZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlzcGxheUJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCBib251c0JveDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGxldCBkZWx0YUJveDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgIGRlbHRhQm94ID0gYnAgPiAwID8gYCske2JwfWAgOiBgJHticH1gO1xyXG5cclxuICAgICAgICBpZiAoYm9udXNCb3ggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgYm9udXNCb3guaW5uZXJIVE1MICs9IGA8c3BhbiBjbGFzcz0nbXBfYnBEZWx0YSc+ICgke2RlbHRhQm94fSk8L3NwYW4+YDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgX3NldEJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1WYWxgLCBgJHticH1gKTtcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9nZXRCUCA9ICgpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCk7XHJcbiAgICAgICAgaWYgKHN0b3JlZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChzdG9yZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBCbHVycmVkSGVhZGVyIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdibHVycmVkSGVhZGVyJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIgYXJlYWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NpdGVNYWluID4gaGVhZGVyJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgaGVhZGVyOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAke3RoaXMuX3Rhcn1gKTtcclxuICAgICAgICBjb25zdCBoZWFkZXJJbWc6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoYGltZ2ApO1xyXG5cclxuICAgICAgICBpZiAoaGVhZGVySW1nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlclNyYzogc3RyaW5nIHwgbnVsbCA9IGhlYWRlckltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGJhY2tncm91bmRcclxuICAgICAgICAgICAgY29uc3QgYmx1cnJlZEJhY2s6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZCgnbXBfYmx1cnJlZEJhY2snKTtcclxuICAgICAgICAgICAgaGVhZGVyLmFwcGVuZChibHVycmVkQmFjayk7XHJcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGhlYWRlclNyYyA/IGB1cmwoJHtoZWFkZXJTcmN9KWAgOiAnJztcclxuICAgICAgICAgICAgYmx1cnJlZEJhY2suY2xhc3NMaXN0LmFkZCgnbXBfY29udGFpbmVyJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBhIGJsdXJyZWQgYmFja2dyb3VuZCB0byB0aGUgaGVhZGVyIScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdHlwZSBzZWxlY3RlZCBmb3IgYHRoaXMuX3NldHRpbmdzYFxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIaWRlU2VlZGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZVNlZWRib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIGRlc2M6ICdSZW1vdmUgdGhlIFwiR2V0IEEgU2VlZGJveFwiIG1lbnUgaXRlbScsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUnO1xyXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzZWVkYm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjbWVudSAuc2JEb25DcnlwdG8nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoc2VlZGJveEJ0bikgc2VlZGJveEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiAjIyMgQWRkcyBhYmlsaXR5IHRvIGdpZnQgbmV3ZXN0IDEwIG1lbWJlcnMgdG8gTUFNIG9uIEhvbWVwYWdlIG9yIG9wZW4gdGhlaXIgdXNlciBwYWdlc1xyXG4gKi9cclxuY2xhc3MgR2lmdE5ld2VzdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dpZnROZXdlc3QnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYnV0dG9ucyB0byBHaWZ0L09wZW4gYWxsIG5ld2VzdCBtZW1iZXJzYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZnBOTSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy9lbnN1cmUgZ2lmdGVkIGxpc3QgaXMgdW5kZXIgNTAgbWVtYmVyIG5hbWVzIGxvbmdcclxuICAgICAgICB0aGlzLl90cmltR2lmdExpc3QoKTtcclxuICAgICAgICAvL2dldCB0aGUgRnJvbnRQYWdlIE5ld01lbWJlcnMgZWxlbWVudCBjb250YWluaW5nIG5ld2VzdCAxMCBtZW1iZXJzXHJcbiAgICAgICAgY29uc3QgZnBOTSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc3QgbWVtYmVyczogSFRNTEFuY2hvckVsZW1lbnRbXSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKFxyXG4gICAgICAgICAgICBmcE5NLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGxhc3RNZW0gPSBtZW1iZXJzW21lbWJlcnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgbWVtYmVycy5mb3JFYWNoKChtZW1iZXIpID0+IHtcclxuICAgICAgICAgICAgLy9hZGQgYSBjbGFzcyB0byB0aGUgZXhpc3RpbmcgZWxlbWVudCBmb3IgdXNlIGluIHJlZmVyZW5jZSBpbiBjcmVhdGluZyBidXR0b25zXHJcbiAgICAgICAgICAgIG1lbWJlci5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgYG1wX3JlZlBvaW50XyR7VXRpbC5lbmRPZkhyZWYobWVtYmVyKX1gKTtcclxuICAgICAgICAgICAgLy9pZiB0aGUgbWVtYmVyIGhhcyBiZWVuIGdpZnRlZCB0aHJvdWdoIHRoaXMgZmVhdHVyZSBwcmV2aW91c2x5XHJcbiAgICAgICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpLmluZGV4T2YoVXRpbC5lbmRPZkhyZWYobWVtYmVyKSkgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy9hZGQgY2hlY2tlZCBib3ggdG8gdGV4dFxyXG4gICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCA9IGAke21lbWJlci5pbm5lclRleHR9IFxcdTI2MTFgO1xyXG4gICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcclxuICAgICAgICBsZXQgZ2lmdFZhbHVlU2V0dGluZzogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ3VzZXJHaWZ0RGVmYXVsdF92YWwnKTtcclxuICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMCBvciBzZXQgdG8gbWF4IG9yIG1pblxyXG4gICAgICAgIC8vIFRPRE86IE1ha2UgdGhlIGdpZnQgdmFsdWUgY2hlY2sgaW50byBhIFV0aWxcclxuICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcclxuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpID4gMTAwMCB8fCBpc05hTihOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwMCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPCA1KSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY3JlYXRlIHRoZSB0ZXh0IGlucHV0IGZvciBob3cgbWFueSBwb2ludHMgdG8gZ2l2ZVxyXG4gICAgICAgIGNvbnN0IGdpZnRBbW91bnRzOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoZ2lmdEFtb3VudHMsIHtcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBzaXplOiAnMycsXHJcbiAgICAgICAgICAgIGlkOiAnbXBfZ2lmdEFtb3VudHMnLFxyXG4gICAgICAgICAgICB0aXRsZTogJ1ZhbHVlIGJldHdlZW4gNSBhbmQgMTAwMCcsXHJcbiAgICAgICAgICAgIHZhbHVlOiBnaWZ0VmFsdWVTZXR0aW5nLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vaW5zZXJ0IHRoZSB0ZXh0IGJveCBhZnRlciB0aGUgbGFzdCBtZW1iZXJzIG5hbWVcclxuICAgICAgICBsYXN0TWVtLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBnaWZ0QW1vdW50cyk7XHJcblxyXG4gICAgICAgIC8vbWFrZSB0aGUgYnV0dG9uIGFuZCBpbnNlcnQgYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lIChiZWZvcmUgdGhlIGlucHV0IHRleHQpXHJcbiAgICAgICAgY29uc3QgZ2lmdEFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAnZ2lmdEFsbCcsXHJcbiAgICAgICAgICAgICdHaWZ0IEFsbDogJyxcclxuICAgICAgICAgICAgJ2J1dHRvbicsXHJcbiAgICAgICAgICAgIGAubXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihsYXN0TWVtKX1gLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAnbXBfYnRuJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9hZGQgYSBzcGFjZSBiZXR3ZWVuIGJ1dHRvbiBhbmQgdGV4dFxyXG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcclxuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblRvcCA9ICc1cHgnO1xyXG5cclxuICAgICAgICBnaWZ0QWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBmaXJzdENhbGw6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHRoZSB0ZXh0IHRvIHNob3cgcHJvY2Vzc2luZ1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmlubmVyVGV4dCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdTZW5kaW5nIEdpZnRzLi4uIFBsZWFzZSBXYWl0JztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHVzZXIgaGFzIG5vdCBiZWVuIGdpZnRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSBtZW1iZXIuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgcG9pbnRzIGFtb3VudCBmcm9tIHRoZSBpbnB1dCBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJhbmRvbSBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0RmluYWxBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd2FpdCAzIHNlY29uZHMgYmV0d2VlbiBKU09OIGNhbGxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdENhbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0Q2FsbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCgzMDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcXVlc3Qgc2VuZGluZyBwb2ludHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvblJlc3VsdDogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgZ2lmdCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBvZmYgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuaW5uZXJUZXh0ID0gYCR7bWVtYmVyLmlubmVyVGV4dH0gXFx1MjYxMWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZCgnbXBfZ2lmdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBtZW1iZXIgdG8gdGhlIHN0b3JlZCBtZW1iZXIgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21wX2xhc3ROZXdHaWZ0ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke1V0aWwuZW5kT2ZIcmVmKG1lbWJlcil9LCR7R01fZ2V0VmFsdWUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtcF9sYXN0TmV3R2lmdGVkJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvbiBhZnRlciBzZW5kXHJcbiAgICAgICAgICAgICAgICAoZ2lmdEFsbEJ0biBhcyBIVE1MSW5wdXRFbGVtZW50KS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxyXG4gICAgICAgICAgICAgICAgICAgICdHaWZ0cyBjb21wbGV0ZWQgdG8gYWxsIENoZWNrZWQgVXNlcnMnO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vbmV3bGluZSBiZXR3ZWVuIGVsZW1lbnRzXHJcbiAgICAgICAgbWVtYmVyc1ttZW1iZXJzLmxlbmd0aCAtIDFdLmFmdGVyKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgIC8vbGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBpbnB1dCBib3ggYW5kIGVuc3VyZSBpdHMgYmV0d2VlbiA1IGFuZCAxMDAwLCBpZiBub3QgZGlzYWJsZSBidXR0b25cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlVG9OdW1iZXI6IFN0cmluZyA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxyXG4gICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRBbGwgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbCcpO1xyXG5cclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpIDwgNSB8fFxyXG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ0Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgR2lmdCBBbGwgJHt2YWx1ZVRvTnVtYmVyfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9hZGQgYSBidXR0b24gdG8gb3BlbiBhbGwgdW5naWZ0ZWQgbWVtYmVycyBpbiBuZXcgdGFic1xyXG4gICAgICAgIGNvbnN0IG9wZW5BbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ29wZW5UYWJzJyxcclxuICAgICAgICAgICAgJ09wZW4gVW5naWZ0ZWQgSW4gVGFicycsXHJcbiAgICAgICAgICAgICdidXR0b24nLFxyXG4gICAgICAgICAgICAnW2lkPW1wX2dpZnRBbW91bnRzXScsXHJcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICdtcF9idG4nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgb3BlbkFsbEJ0bi5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ09wZW4gbmV3IHRhYiBmb3IgZWFjaCcpO1xyXG4gICAgICAgIG9wZW5BbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWVtYmVyLmNsYXNzTGlzdC5jb250YWlucygnbXBfZ2lmdGVkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4obWVtYmVyLmhyZWYsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2dldCB0aGUgY3VycmVudCBhbW91bnQgb2YgYm9udXMgcG9pbnRzIGF2YWlsYWJsZSB0byBzcGVuZFxyXG4gICAgICAgIGxldCBib251c1BvaW50c0F2YWlsOiBzdHJpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG1CUCcpIS5pbm5lclRleHQ7XHJcbiAgICAgICAgLy9nZXQgcmlkIG9mIHRoZSBkZWx0YSBkaXNwbGF5XHJcbiAgICAgICAgaWYgKGJvbnVzUG9pbnRzQXZhaWwuaW5kZXhPZignKCcpID49IDApIHtcclxuICAgICAgICAgICAgYm9udXNQb2ludHNBdmFpbCA9IGJvbnVzUG9pbnRzQXZhaWwuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgIGJvbnVzUG9pbnRzQXZhaWwuaW5kZXhPZignKCcpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcmVjcmVhdGUgdGhlIGJvbnVzIHBvaW50cyBpbiBuZXcgc3BhbiBhbmQgaW5zZXJ0IGludG8gZnBOTVxyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VTcGFuOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBtZXNzYWdlU3Bhbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2dpZnRBbGxNc2cnKTtcclxuICAgICAgICBtZXNzYWdlU3Bhbi5pbm5lclRleHQgPSAnQXZhaWxhYmxlICcgKyBib251c1BvaW50c0F2YWlsO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpIS5hZnRlcihtZXNzYWdlU3Bhbik7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuYWZ0ZXIoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XHJcbiAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhXHJcbiAgICAgICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgJzxicj4nKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgZ2lmdCBuZXcgbWVtYmVycyBidXR0b24gdG8gSG9tZSBwYWdlLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFRyaW1zIHRoZSBnaWZ0ZWQgbGlzdCB0byBsYXN0IDUwIG5hbWVzIHRvIGF2b2lkIGdldHRpbmcgdG9vIGxhcmdlIG92ZXIgdGltZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdHJpbUdpZnRMaXN0KCkge1xyXG4gICAgICAgIC8vaWYgdmFsdWUgZXhpc3RzIGluIEdNXHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykpIHtcclxuICAgICAgICAgICAgLy9HTSB2YWx1ZSBpcyBhIGNvbW1hIGRlbGltIHZhbHVlLCBzcGxpdCB2YWx1ZSBpbnRvIGFycmF5IG9mIG5hbWVzXHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnROYW1lcyA9IEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgbGV0IG5ld0dpZnROYW1lczogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0TmFtZXMubGVuZ3RoID4gNTApIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2lmdE5hbWUgb2YgZ2lmdE5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnROYW1lcy5pbmRleE9mKGdpZnROYW1lKSA8PSA0OSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlYnVpbGQgYSBjb21tYSBkZWxpbSBzdHJpbmcgb3V0IG9mIHRoZSBmaXJzdCA0OSBuYW1lc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdHaWZ0TmFtZXMgPSBuZXdHaWZ0TmFtZXMgKyBnaWZ0TmFtZSArICcsJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXQgbmV3IHN0cmluZyBpbiBHTVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsIG5ld0dpZnROYW1lcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9zZXQgdmFsdWUgaWYgZG9lc250IGV4aXN0XHJcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJywgJycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyMgQWRkcyBhYmlsaXR5IHRvIGhpZGUgbmV3cyBpdGVtcyBvbiB0aGUgcGFnZVxyXG4gKi9cclxuY2xhc3MgSGlkZU5ld3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Ib21lLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZU5ld3MnLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgZGVzYzogJ1RpZHkgdGhlIGhvbWVwYWdlIGFuZCBhbGxvdyBOZXdzIHRvIGJlIGhpZGRlbicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLm1haW5QYWdlTmV3c0hlYWQnO1xyXG4gICAgcHJpdmF0ZSBfdmFsdWVUaXRsZTogc3RyaW5nID0gYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9X3ZhbGA7XHJcbiAgICBwcml2YXRlIF9pY29uID0gJ1xcdTI3NGUnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gTk9URTogZm9yIGRldmVsb3BtZW50XHJcbiAgICAgICAgLy8gR01fZGVsZXRlVmFsdWUodGhpcy5fdmFsdWVUaXRsZSk7Y29uc29sZS53YXJuKGBWYWx1ZSBvZiAke3RoaXMuX3ZhbHVlVGl0bGV9IHdpbGwgYmUgZGVsZXRlZCFgKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlQ2xvY2soKTtcclxuICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5fY2hlY2tGb3JTZWVuKCk7XHJcbiAgICAgICAgdGhpcy5fYWRkSGlkZXJCdXR0b24oKTtcclxuICAgICAgICAvLyB0aGlzLl9jbGVhblZhbHVlcygpOyAvLyBGSVg6IE5vdCB3b3JraW5nIGFzIGludGVuZGVkXHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENsZWFuZWQgdXAgdGhlIGhvbWUgcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBfY2hlY2tGb3JTZWVuID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gICAgICAgIGNvbnN0IHByZXZWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSk7XHJcbiAgICAgICAgY29uc3QgbmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGhpcy5fdmFsdWVUaXRsZSwgJzpcXG4nLCBwcmV2VmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAocHJldlZhbHVlICYmIG5ld3MpIHtcclxuICAgICAgICAgICAgLy8gVXNlIHRoZSBpY29uIHRvIHNwbGl0IG91dCB0aGUga25vd24gaGlkZGVuIG1lc3NhZ2VzXHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkFycmF5ID0gcHJldlZhbHVlLnNwbGl0KHRoaXMuX2ljb24pO1xyXG4gICAgICAgICAgICAvKiBJZiBhbnkgb2YgdGhlIGhpZGRlbiBtZXNzYWdlcyBtYXRjaCBhIGN1cnJlbnQgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgcmVtb3ZlIHRoZSBjdXJyZW50IG1lc3NhZ2UgZnJvbSB0aGUgRE9NICovXHJcbiAgICAgICAgICAgIGhpZGRlbkFycmF5LmZvckVhY2goKGhpZGRlbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbmV3cy5mb3JFYWNoKChlbnRyeSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS50ZXh0Q29udGVudCA9PT0gaGlkZGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGN1cnJlbnQgbWVzc2FnZXMsIGhpZGUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluUGFnZU5ld3NTdWInKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9yZW1vdmVDbG9jayA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBjbG9jazogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5IC5mcFRpbWUnKTtcclxuICAgICAgICBpZiAoY2xvY2spIGNsb2NrLnJlbW92ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBfYWRqdXN0SGVhZGVyU2l6ZSA9IChzZWxlY3Rvcjogc3RyaW5nLCB2aXNpYmxlPzogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld3NIZWFkZXI6IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICBpZiAobmV3c0hlYWRlcikge1xyXG4gICAgICAgICAgICBpZiAodmlzaWJsZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIG5ld3NIZWFkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5ld3NIZWFkZXIuc3R5bGUuZm9udFNpemUgPSAnMmVtJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgX2FkZEhpZGVyQnV0dG9uID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuICAgICAgICBpZiAoIW5ld3MpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggbmV3cyBlbnRyeVxyXG4gICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgYnV0dG9uXHJcbiAgICAgICAgICAgIGNvbnN0IHhidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgeGJ1dHRvbi50ZXh0Q29udGVudCA9IHRoaXMuX2ljb247XHJcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cih4YnV0dG9uLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZTogJ2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbi1yaWdodDowLjdlbTtjdXJzb3I6cG9pbnRlcjsnLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6ICdtcF9jbGVhckJ0bicsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrc1xyXG4gICAgICAgICAgICB4YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiBjbGlja2VkLCBhcHBlbmQgdGhlIGNvbnRlbnQgb2YgdGhlIGN1cnJlbnQgbmV3cyBwb3N0IHRvIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gbGlzdCBvZiByZW1lbWJlcmVkIG5ld3MgaXRlbXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpXHJcbiAgICAgICAgICAgICAgICAgICAgPyBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKVxyXG4gICAgICAgICAgICAgICAgICAgIDogJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEhpZGluZy4uLiAke3ByZXZpb3VzVmFsdWV9JHtlbnRyeS50ZXh0Q29udGVudH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCBgJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XHJcbiAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBtb3JlIG5ld3MgaXRlbXMsIHJlbW92ZSB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkTmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVkTmV3cyAmJiB1cGRhdGVkTmV3cy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIGJ1dHRvbiBhcyB0aGUgZmlyc3QgY2hpbGQgb2YgdGhlIGVudHJ5XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS5maXJzdENoaWxkKSBlbnRyeS5maXJzdENoaWxkLmJlZm9yZSh4YnV0dG9uKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgX2NsZWFuVmFsdWVzID0gKG51bSA9IDMpID0+IHtcclxuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYEdNX2dldFZhbHVlKCR7dGhpcy5fdmFsdWVUaXRsZX0pYCwgdmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGxhc3QgMyBzdG9yZWQgaXRlbXMgYWZ0ZXIgc3BsaXR0aW5nIHRoZW0gYXQgdGhlIGljb25cclxuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmFycmF5VG9TdHJpbmcodmFsdWUuc3BsaXQodGhpcy5faWNvbikuc2xpY2UoMCAtIG51bSkpO1xyXG4gICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZhbHVlXHJcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9nZXROZXdzSXRlbXMgPSAoKTogTm9kZUxpc3RPZjxIVE1MRGl2RWxlbWVudD4gfCBudWxsID0+IHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZGl2W2NsYXNzXj1cIm1haW5QYWdlTmV3c1wiXScpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHR5cGUgc2VsZWN0ZWQgZm9yIGB0aGlzLl9zZXR0aW5nc2BcclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqIFNIQVJFRCBDT0RFXHJcbiAqXHJcbiAqIFRoaXMgaXMgZm9yIGFueXRoaW5nIHRoYXQncyBzaGFyZWQgYmV0d2VlbiBmaWxlcywgYnV0IGlzIG5vdCBnZW5lcmljIGVub3VnaCB0b1xyXG4gKiB0byBiZWxvbmcgaW4gYFV0aWxzLnRzYC4gSSBjYW4ndCB0aGluayBvZiBhIGJldHRlciB3YXkgdG8gY2F0ZWdvcml6ZSBEUlkgY29kZS5cclxuICovXHJcblxyXG5jbGFzcyBTaGFyZWQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWNlaXZlIGEgdGFyZ2V0IGFuZCBgdGhpcy5fc2V0dGluZ3MudGl0bGVgXHJcbiAgICAgKiBAcGFyYW0gdGFyIENTUyBzZWxlY3RvciBmb3IgYSB0ZXh0IGlucHV0IGJveFxyXG4gICAgICovXHJcbiAgICAvLyBUT0RPOiB3aXRoIGFsbCBDaGVja2luZyBiZWluZyBkb25lIGluIGBVdGlsLnN0YXJ0RmVhdHVyZSgpYCBpdCdzIG5vIGxvbmdlciBuZWNlc3NhcnkgdG8gQ2hlY2sgaW4gdGhpcyBmdW5jdGlvblxyXG4gICAgcHVibGljIGZpbGxHaWZ0Qm94ID0gKFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIHNldHRpbmdUaXRsZTogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5maWxsR2lmdEJveCggJHt0YXJ9LCAke3NldHRpbmdUaXRsZX0gKWApO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQodGFyKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50Qm94OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGlmIChwb2ludEJveCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJTZXRQb2ludHM6IG51bWJlciA9IHBhcnNlSW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtzZXR0aW5nVGl0bGV9X3ZhbGApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF4UG9pbnRzOiBudW1iZXIgPSBwYXJzZUludChwb2ludEJveC5nZXRBdHRyaWJ1dGUoJ21heCcpISk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTih1c2VyU2V0UG9pbnRzKSAmJiB1c2VyU2V0UG9pbnRzIDw9IG1heFBvaW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhQb2ludHMgPSB1c2VyU2V0UG9pbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwb2ludEJveC52YWx1ZSA9IG1heFBvaW50cy50b0ZpeGVkKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWF4UG9pbnRzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGxpc3Qgb2YgYWxsIHJlc3VsdHMgZnJvbSBCcm93c2UgcGFnZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0U2VhcmNoTGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZ2V0U2VhcmNoTGlzdCggKWApO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBzZWFyY2ggcmVzdWx0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3NzciB0cltpZCBePSBcInRkclwiXSB0ZCcpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiA9IDxcclxuICAgICAgICAgICAgICAgICAgICBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+XHJcbiAgICAgICAgICAgICAgICA+ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3NzciB0cltpZCBePSBcInRkclwiXScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBzbmF0Y2hMaXN0IGlzICR7c25hdGNoTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnb29kcmVhZHNCdXR0b25zID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zLi4uJyk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMhYCk7XHJcbiAgICB9O1xyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy5cclxuICovXHJcbmNsYXNzIFRvckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9yR2lmdERlZmF1bHQnLFxyXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gNTAwMCwgbWF4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RoYW5rc0FyZWEgaW5wdXRbbmFtZT1wb2ludHNdJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBuZXcgU2hhcmVkKClcclxuICAgICAgICAgICAgLmZpbGxHaWZ0Qm94KHRoaXMuX3RhciwgdGhpcy5fc2V0dGluZ3MudGl0bGUpXHJcbiAgICAgICAgICAgIC50aGVuKChwb2ludHMpID0+XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogQWRkcyB2YXJpb3VzIGxpbmtzIHRvIEdvb2RyZWFkc1xyXG4gKi9cclxuY2xhc3MgR29vZHJlYWRzQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b24nLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucycsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmVhdHVyZSBzaG91bGQgb25seSBydW4gb24gYm9vayBjYXRlZ29yaWVzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8gW2NsYXNzXj1jYXRdJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2F0ICYmIENoZWNrLmlzQm9va0NhdChwYXJzZUludChjYXQuY2xhc3NOYW1lLnN1YnN0cigzKSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBOb3QgYSBib29rIGNhdGVnb3J5OyBza2lwcGluZyBHb29kcmVhZHMgYnV0dG9ucycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucy4uLicpO1xyXG5cclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgbGV0IHNlcmllc1A6IFByb21pc2U8c3RyaW5nW10+LCBhdXRob3JQOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xyXG5cclxuICAgICAgICBVdGlsLmFkZFRvckRldGFpbHNSb3codGFyZ2V0LCAnU2VhcmNoIEdvb2RyZWFkcycsICdtcF9nclJvdycpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IHRoZSBTZXJpZXMgYW5kIEF1dGhvclxyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxyXG4gICAgICAgICAgICAoYXV0aG9yUCA9IFV0aWwuZ2V0Qm9va0F1dGhvcnMoYXV0aG9yRGF0YSkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLm1wX2dyUm93IC5mbGV4Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdyAuZmxleCcpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnV0dG9uIHJvdyBjYW5ub3QgYmUgdGFyZ2V0ZWQhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCdWlsZCBTZXJpZXMgYnV0dG9uc1xyXG4gICAgICAgIHNlcmllc1AudGhlbigoc2VyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidXR0b25UaXRsZSA9IHNlci5sZW5ndGggPiAxID8gYFNlcmllczogJHtpdGVtfWAgOiAnU2VyaWVzJztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnc2VyaWVzJywgaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCBidXR0b25UaXRsZSwgNCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgIGF1dGhvclBcclxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2F1dGhvcicsIGF1dGhvcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ0F1dGhvcicsIDMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGF1dGhvciBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyBCdWlsZCBUaXRsZSBidXR0b25zXHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXdhaXQgVXRpbC5nZXRCb29rVGl0bGUoYm9va0RhdGEsIGF1dGhvcnMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdib29rJywgdGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgJ1RpdGxlJywgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSB0aXRsZSBhbmQgYXV0aG9yIGJvdGggZXhpc3QsIG1ha2UgYSBUaXRsZSArIEF1dGhvciBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aG9ycyAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYm90aFVSTCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RpdGxlfSAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCBib3RoVVJMLCAnVGl0bGUgKyBBdXRob3InLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyFgKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlcyBhIGZpZWxkIGZvciBcIkN1cnJlbnRseSBSZWFkaW5nXCIgYmJjb2RlXHJcbiAqL1xyXG5jbGFzcyBDdXJyZW50bHlSZWFkaW5nIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGl0bGU6ICdjdXJyZW50bHlSZWFkaW5nJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGdlbmVyYXRlIGEgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGZvcnVtIHNuaXBwZXRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIEN1cnJlbnRseSBSZWFkaW5nIHNlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBHZXQgdGhlIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgY29uc3QgdGl0bGU6IHN0cmluZyA9IGRvY3VtZW50IS5xdWVyeVNlbGVjdG9yKCcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJykhXHJcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCE7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHRvcklEOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsyXTtcclxuICAgICAgICBjb25zdCByb3dUYXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbycpO1xyXG5cclxuICAgICAgICAvLyBUaXRsZSBjYW4ndCBiZSBudWxsXHJcbiAgICAgICAgaWYgKHRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGl0bGUgZmllbGQgd2FzIG51bGxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGEgbmV3IHRhYmxlIHJvd1xyXG4gICAgICAgIGNvbnN0IGNyUm93OiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IFV0aWwuYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICAgICAgcm93VGFyLFxyXG4gICAgICAgICAgICAnQ3VycmVudGx5IFJlYWRpbmcnLFxyXG4gICAgICAgICAgICAnbXBfY3JSb3cnXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBQcm9jZXNzIGRhdGEgaW50byBzdHJpbmdcclxuICAgICAgICBjb25zdCBibHVyYjogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2VuZXJhdGVTbmlwcGV0KHRvcklELCB0aXRsZSwgYXV0aG9ycyk7XHJcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXHJcbiAgICAgICAgY29uc3QgYnRuOiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IHRoaXMuX2J1aWxkQnV0dG9uKGNyUm93LCBibHVyYik7XHJcbiAgICAgICAgLy8gSW5pdCBidXR0b25cclxuICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihidG4sIGJsdXJiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQnVpbGQgYSBCQiBDb2RlIHRleHQgc25pcHBldCB1c2luZyB0aGUgYm9vayBpbmZvLCB0aGVuIHJldHVybiBpdFxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBzdHJpbmcgSUQgb2YgdGhlIGJvb2tcclxuICAgICAqIEBwYXJhbSB0aXRsZSBUaGUgc3RyaW5nIHRpdGxlIG9mIHRoZSBib29rXHJcbiAgICAgKiBAcGFyYW0gYXV0aG9ycyBBIG5vZGUgbGlzdCBvZiBhdXRob3IgbGlua3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTbmlwcGV0KFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PlxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIEFkZCBBdXRob3IgTGlua1xyXG4gICAgICAgICAqIEBwYXJhbSBhdXRob3JFbGVtIEEgbGluayBjb250YWluaW5nIGF1dGhvciBpbmZvcm1hdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGFkZEF1dGhvckxpbmsgPSAoYXV0aG9yRWxlbTogSFRNTEFuY2hvckVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGBbdXJsPSR7YXV0aG9yRWxlbS5ocmVmLnJlcGxhY2UoJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQnLCAnJyl9XSR7XHJcbiAgICAgICAgICAgICAgICBhdXRob3JFbGVtLnRleHRDb250ZW50XHJcbiAgICAgICAgICAgIH1bL3VybF1gO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIE5vZGVMaXN0IGludG8gYW4gQXJyYXkgd2hpY2ggaXMgZWFzaWVyIHRvIHdvcmsgd2l0aFxyXG4gICAgICAgIGxldCBhdXRob3JBcnJheTogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBhdXRob3JzLmZvckVhY2goKGF1dGhvckVsZW0pID0+IGF1dGhvckFycmF5LnB1c2goYWRkQXV0aG9yTGluayhhdXRob3JFbGVtKSkpO1xyXG4gICAgICAgIC8vIERyb3AgZXh0cmEgaXRlbXNcclxuICAgICAgICBpZiAoYXV0aG9yQXJyYXkubGVuZ3RoID4gMykge1xyXG4gICAgICAgICAgICBhdXRob3JBcnJheSA9IFsuLi5hdXRob3JBcnJheS5zbGljZSgwLCAzKSwgJ2V0Yy4nXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgW3VybD0vdC8ke2lkfV0ke3RpdGxlfVsvdXJsXSBieSBbaV0ke2F1dGhvckFycmF5LmpvaW4oJywgJyl9Wy9pXWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEJ1aWxkIGEgYnV0dG9uIG9uIHRoZSB0b3IgZGV0YWlscyBwYWdlXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFyZWEgd2hlcmUgdGhlIGJ1dHRvbiB3aWxsIGJlIGFkZGVkIGludG9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IENvbnRlbnQgdGhhdCB3aWxsIGJlIGFkZGVkIGludG8gdGhlIHRleHRhcmVhXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2J1aWxkQnV0dG9uKHRhcjogSFRNTERpdkVsZW1lbnQsIGNvbnRlbnQ6IHN0cmluZyk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICAvLyBCdWlsZCB0ZXh0IGRpc3BsYXlcclxuICAgICAgICB0YXIuaW5uZXJIVE1MID0gYDx0ZXh0YXJlYSByb3dzPVwiMVwiIGNvbHM9XCI4MFwiIHN0eWxlPSdtYXJnaW4tcmlnaHQ6NXB4Jz4ke2NvbnRlbnR9PC90ZXh0YXJlYT5gO1xyXG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbih0YXIsICdub25lJywgJ0NvcHknLCAyKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfY3JSb3cgLm1wX2J1dHRvbl9jbG9uZScpIS5jbGFzc0xpc3QuYWRkKCdtcF9yZWFkaW5nJyk7XHJcbiAgICAgICAgLy8gUmV0dXJuIGJ1dHRvblxyXG4gICAgICAgIHJldHVybiA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3JlYWRpbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIFByb3RlY3RzIHRoZSB1c2VyIGZyb20gcmF0aW8gdHJvdWJsZXMgYnkgYWRkaW5nIHdhcm5pbmdzIGFuZCBkaXNwbGF5aW5nIHJhdGlvIGRlbHRhXHJcbiAqL1xyXG5jbGFzcyBSYXRpb1Byb3RlY3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdCcsXHJcbiAgICAgICAgZGVzYzogYFByb3RlY3QgeW91ciByYXRpbyB3aXRoIHdhcm5pbmdzICZhbXA7IHJhdGlvIGNhbGN1bGF0aW9uc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIHJhdGlvIHByb3RlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBUaGUgZG93bmxvYWQgdGV4dCBhcmVhXHJcbiAgICAgICAgY29uc3QgZGxCdG46IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0ZGRsJyk7XHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnRseSB1bnVzZWQgbGFiZWwgYXJlYSBhYm92ZSB0aGUgZG93bmxvYWQgdGV4dFxyXG4gICAgICAgIGNvbnN0IGRsTGFiZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjZG93bmxvYWQgLnRvckRldElubmVyVG9wJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXHJcbiAgICAgICAgY29uc3Qgck5ldzogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIC8vIEN1cnJlbnQgcmF0aW9cclxuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xyXG4gICAgICAgIC8vIFNlZWRpbmcgb3IgZG93bmxvYWRpbmdcclxuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIGN1c3RvbSByYXRpbyBhbW91bnRzICh3aWxsIHJldHVybiBkZWZhdWx0IHZhbHVlcyBvdGhlcndpc2UpXHJcbiAgICAgICAgY29uc3QgW3IxLCByMiwgcjNdID0gdGhpcy5fY2hlY2tDdXN0b21TZXR0aW5ncygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFJhdGlvIHByb3RlY3Rpb24gbGV2ZWxzIHNldCB0bzogJHtyMX0sICR7cjJ9LCAke3IzfWApO1xyXG5cclxuICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY29kZSBpZiB0aGUgcmF0aW8gZXhpc3RzXHJcbiAgICAgICAgaWYgKHJOZXcgJiYgckN1cikge1xyXG4gICAgICAgICAgICBjb25zdCByRGlmZiA9IFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdIC0gVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF07XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgIGBDdXJyZW50ICR7VXRpbC5leHRyYWN0RmxvYXQockN1cilbMF19IHwgTmV3ICR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSB8IERpZiAke3JEaWZmfWBcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IGFjdGl2YXRlIGlmIGEgcmF0aW8gY2hhbmdlIGlzIGV4cGVjdGVkXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ockRpZmYpICYmIHJEaWZmID4gMC4wMDkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghc2VlZGluZyAmJiBkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgTk9UIGFscmVhZHkgc2VlZGluZyBvciBkb3dubG9hZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuaW5uZXJIVE1MID0gYFJhdGlvIGxvc3MgJHtyRGlmZi50b0ZpeGVkKDIpfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7IC8vVG8gZGlzdGluZ3Vpc2ggZnJvbSBCT0xEIFRpdGxlc1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChkbEJ0biAmJiBkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJ0cml2aWFsIHJhdGlvIGxvc3NcIiB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBjaGFuZ2VzIHdpbGwgYWx3YXlzIGhhcHBlbiBpZiB0aGUgcmF0aW8gY29uZGl0aW9ucyBhcmUgbWV0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJEaWZmID4gcjEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1NwcmluZ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuY29sb3IgPSAnYmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJJIG5ldmVyIHdhbnQgdG8gZGwgdy9vIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHVzZXMgdGhlIE1pbmltdW0gUmF0aW8sIGlmIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIGRpc2FibGUgYnV0dG9uIHdpdGggYnV5IEZMIGJ1dHRvblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCBHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TWluX3ZhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy8vRGlzYWJsZSBsaW5rIHRvIHByZXZlbnQgZG93bmxvYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8vLyBkbEJ0bi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm8tZHJvcCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1heWJlIGhpZGUgdGhlIGJ1dHRvbiwgYW5kIGFkZCB0aGUgUmF0aW8gTG9zcyB3YXJuaW5nIGluIGl0cyBwbGFjZT9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uaW5uZXJIVE1MID0gJ0ZMIFJlY29tbWVuZGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyRGlmZiA+IHIyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0N1c3RvbVNldHRpbmdzKCkge1xyXG4gICAgICAgIGxldCBsMSA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwxX3ZhbCcpKTtcclxuICAgICAgICBsZXQgbDIgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMl92YWwnKSk7XHJcbiAgICAgICAgbGV0IGwzID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDNfdmFsJykpO1xyXG5cclxuICAgICAgICBpZiAoaXNOYU4obDMpKSBsMyA9IDE7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSAyIC8gMztcclxuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IDEgLyAzO1xyXG5cclxuICAgICAgICAvLyBJZiBzb21lb25lIHB1dCB0aGluZ3MgaW4gYSBkdW1iIG9yZGVyLCBpZ25vcmUgc21hbGxlciBudW1iZXJzXHJcbiAgICAgICAgaWYgKGwyID4gbDMpIGwyID0gbDM7XHJcbiAgICAgICAgaWYgKGwxID4gbDIpIGwxID0gbDI7XHJcblxyXG4gICAgICAgIC8vIElmIGN1c3RvbSBudW1iZXJzIGFyZSBzbWFsbGVyIHRoYW4gZGVmYXVsdCB2YWx1ZXMsIGlnbm9yZSB0aGUgbG93ZXIgd2FybmluZ1xyXG4gICAgICAgIGlmIChpc05hTihsMikpIGwyID0gbDMgPCAyIC8gMyA/IGwzIDogMiAvIDM7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSBsMiA8IDEgLyAzID8gbDIgOiAxIC8gMztcclxuXHJcbiAgICAgICAgcmV0dXJuIFtsMSwgbDIsIGwzXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIExvdyByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMScsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMScsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjMnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIHNtYWxsZXN0IHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBzbGlnaHQgY29sb3IgY2hhbmdlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTZXQgY3VzdG9tIEwxIFJhdGlvIFByb3RlY3Rpb24hJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIE1lZGl1bSByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDIgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMicsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMicsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjYnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIG1lZGlhbiB0aHJlc2hob2xkIHRvIHdhcm4gb2YgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgbm90aWNlYWJsZSBjb2xvciBjaGFuZ2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNldCBjdXN0b20gTDIgUmF0aW8gUHJvdGVjdGlvbiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogSGlnaCByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMycsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAxJyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBoaWdoZXN0IHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgZGlzYWJsZXMgZG93bmxvYWQgd2l0aG91dCBGTCB1c2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNldCBjdXN0b20gTDIgUmF0aW8gUHJvdGVjdGlvbiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TWluIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TWluJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0YWc6ICdNaW5pbXVtIFJhdGlvJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMDAnLFxyXG4gICAgICAgIGRlc2M6ICdUcmlnZ2VyIHRoZSBtYXhpbXVtIHdhcm5pbmcgaWYgeW91ciByYXRpbyB3b3VsZCBkcm9wIGJlbG93IHRoaXMgbnVtYmVyLicsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgY3VzdG9tIG1pbmltdW0gcmF0aW8hJyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogQWxsb3dzIGdpZnRpbmcgb2YgRkwgd2VkZ2UgdG8gbWVtYmVycyB0aHJvdWdoIGZvcnVtLlxyXG4gKi9cclxuY2xhc3MgRm9ydW1GTEdpZnQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkZvcnVtLFxyXG4gICAgICAgIHRpdGxlOiAnZm9ydW1GTEdpZnQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBUaGFuayBidXR0b24gdG8gZm9ydW0gcG9zdHMuICg8ZW0+U2VuZHMgYSBGTCB3ZWRnZTwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLmZvcnVtTGluayc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmb3J1bSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxpbmcgRm9ydW0gR2lmdCBCdXR0b24uLi4nKTtcclxuICAgICAgICAvL21haW5Cb2R5IGlzIGJlc3QgZWxlbWVudCB3aXRoIGFuIElEIEkgY291bGQgZmluZCB0aGF0IGlzIGEgcGFyZW50IHRvIGFsbCBmb3J1bSBwb3N0c1xyXG4gICAgICAgIGNvbnN0IG1haW5Cb2R5ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xyXG4gICAgICAgIC8vbWFrZSBhcnJheSBvZiBmb3J1bSBwb3N0cyAtIHRoZXJlIGlzIG9ubHkgb25lIGN1cnNvciBjbGFzc2VkIG9iamVjdCBwZXIgZm9ydW0gcG9zdCwgc28gdGhpcyB3YXMgYmVzdCB0byBrZXkgb2ZmIG9mLiB3aXNoIHRoZXJlIHdlcmUgbW9yZSBJRHMgYW5kIHN1Y2ggdXNlZCBpbiBmb3J1bXNcclxuICAgICAgICBjb25zdCBmb3J1bVBvc3RzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXHJcbiAgICAgICAgICAgIG1haW5Cb2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbHRhYmxlJylcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vZm9yIGVhY2ggcG9zdCBvbiB0aGUgcGFnZVxyXG4gICAgICAgIGZvcnVtUG9zdHMuZm9yRWFjaCgoZm9ydW1Qb3N0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vd29yayBvdXIgd2F5IGRvd24gdGhlIHN0cnVjdHVyZSBvZiB0aGUgSFRNTCB0byBnZXQgdG8gb3VyIHBvc3RcclxuICAgICAgICAgICAgbGV0IGJvdHRvbVJvdyA9IGZvcnVtUG9zdC5jaGlsZE5vZGVzWzFdO1xyXG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1s0XTtcclxuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbM107XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBJRCBvZiB0aGUgZm9ydW0gZnJvbSB0aGUgY3VzdG9tIE1BTSBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgbGV0IHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+Zm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAvL21hbSBkZWNpZGVkIHRvIGhhdmUgYSBkaWZmZXJlbnQgc3RydWN0dXJlIGZvciBsYXN0IGZvcnVtLiB3aXNoIHRoZXkganVzdCBoYWQgSURzIG9yIHNvbWV0aGluZyBpbnN0ZWFkIG9mIGFsbCB0aGlzIGp1bXBpbmcgYXJvdW5kXHJcbiAgICAgICAgICAgIGlmIChwb3N0SUQgPT09ICdsYXN0Jykge1xyXG4gICAgICAgICAgICAgICAgcG9zdElEID0gKDxIVE1MRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEucHJldmlvdXNTaWJsaW5nIVxyXG4gICAgICAgICAgICAgICAgKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgZWxlbWVudCBmb3Igb3VyIGZlYXR1cmVcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgIC8vc2V0IHNhbWUgY2xhc3MgYXMgb3RoZXIgb2JqZWN0cyBpbiBhcmVhIGZvciBzYW1lIHBvaW50ZXIgYW5kIGZvcm1hdHRpbmcgb3B0aW9uc1xyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2N1cnNvcicpO1xyXG4gICAgICAgICAgICAvL2dpdmUgb3VyIGVsZW1lbnQgYW4gSUQgZm9yIGZ1dHVyZSBzZWxlY3Rpb24gYXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfJyArIHBvc3RJRCArICdfdGV4dCcpO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBuZXcgaW1nIGVsZW1lbnQgdG8gbGVhZCBvdXIgbmV3IGZlYXR1cmUgdmlzdWFsc1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0SWNvbkdpZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAvL3VzZSBzaXRlIGZyZWVsZWVjaCBnaWYgaWNvbiBmb3Igb3VyIGZlYXR1cmVcclxuICAgICAgICAgICAgZ2lmdEljb25HaWYuc2V0QXR0cmlidXRlKFxyXG4gICAgICAgICAgICAgICAgJ3NyYycsXHJcbiAgICAgICAgICAgICAgICAnaHR0cHM6Ly9jZG4ubXlhbm9uYW1vdXNlLm5ldC9pbWFnZWJ1Y2tldC8xMDgzMDMvdGhhbmsuZ2lmJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAvL21ha2UgdGhlIGdpZiBpY29uIHRoZSBmaXJzdCBjaGlsZCBvZiBlbGVtZW50XHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKGdpZnRJY29uR2lmKTtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgZWxlbWVudCBpbiBsaW5lIHdpdGggdGhlIGN1cnNvciBvYmplY3Qgd2hpY2ggaXMgdGhlIHF1b3RlIGFuZCByZXBvcnQgYnV0dG9ucyBhdCBib3R0b21cclxuICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZENoaWxkKGdpZnRFbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIC8vbWFrZSBpdCBhIGJ1dHRvbiB2aWEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90byBhdm9pZCBidXR0b24gdHJpZ2dlcmluZyBtb3JlIHRoYW4gb25jZSBwZXIgcGFnZSBsb2FkLCBjaGVjayBpZiBhbHJlYWR5IGhhdmUganNvbiByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2R1ZSB0byBsYWNrIG9mIElEcyBhbmQgY29uZmxpY3RpbmcgcXVlcnkgc2VsZWN0YWJsZSBlbGVtZW50cywgbmVlZCB0byBqdW1wIHVwIGEgZmV3IHBhcmVudCBsZXZlbHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFBhcmVudE5vZGUgPSBnaWZ0RWxlbWVudC5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL29uY2UgYXQgcGFyZW50IG5vZGUgb2YgdGhlIHBvc3QsIGZpbmQgdGhlIHBvc3RlcidzIHVzZXIgaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlckVsZW0gPSBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL3UvXCJdYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBVUkwgb2YgdGhlIHBvc3QgdG8gYWRkIHRvIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFVSTCA9ICg8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi9mL3QvXCJdYCkhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBNQU0gdXNlciBzZW5kaW5nIGdpZnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbmRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTWVudScpIS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xlYW4gdXAgdGV4dCBvZiBzZW5kZXIgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlciA9IHNlbmRlci5zdWJzdHJpbmcoMCwgc2VuZGVyLmluZGV4T2YoJyAnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB0aXRsZSBvZiB0aGUgcGFnZSBzbyB3ZSBjYW4gd3JpdGUgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9ydW1UaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2N1dCBkb3duIGZsdWZmIGZyb20gcGFnZSB0aXRsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlID0gZm9ydW1UaXRsZS5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcnVtVGl0bGUuaW5kZXhPZignfCcpIC0gMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbWVtYmVycyBuYW1lIGZvciBKU09OIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9ICg8SFRNTEVsZW1lbnQ+dXNlckVsZW0hKS5pbm5lclRleHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgYSBnaWZ0IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPXNlbmRXZWRnZSZnaWZ0VG89JHt1c2VyTmFtZX0mbWVzc2FnZT0ke3NlbmRlcn0gd2FudHMgdG8gdGhhbmsgeW91IGZvciB5b3VyIGNvbnRyaWJ1dGlvbiB0byB0aGUgZm9ydW0gdG9waWMgW3VybD1odHRwczovL215YW5vbmFtb3VzZS5uZXQke3Bvc3RVUkx9XSR7Zm9ydW1UaXRsZX1bL3VybF1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL21ha2UgIyBVUkkgY29tcGF0aWJsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgnIycsICclMjMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy91c2UgTUFNKyBqc29uIGdldCB1dGlsaXR5IHRvIHByb2Nlc3MgVVJMIGFuZCByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSB0ZXh0IHRvIHNob3cgc3VjY2Vzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgU3VjY2Vzc2Z1bCEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYmFzZWQgb24gZmFpbHVyZSwgYWRkIGZlYXR1cmUgdGV4dCB0byBzaG93IGZhaWx1cmUgcmVhc29uIG9yIGdlbmVyaWNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWW91IGNhbiBvbmx5IHNlbmQgYSB1c2VyIG9uZSB3ZWRnZSBwZXIgZGF5LidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogQWxyZWFkeSBHaWZ0ZWQgVGhpcyBVc2VyIFRvZGF5ISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvciA9PT1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbnZhbGlkIHVzZXIsIHRoaXMgdXNlciBpcyBub3QgY3VycmVudGx5IGFjY2VwdGluZyB3ZWRnZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IFRoaXMgVXNlciBEb2VzIE5vdCBBY2NlcHQgR2lmdHMhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29ubHkga25vd24gZXhhbXBsZSBvZiB0aGlzICdvdGhlcicgaXMgd2hlbiBnaWZ0aW5nIHlvdXJzZWxmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBGYWlsZWQhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIFByb2Nlc3MgJiByZXR1cm4gaW5mb3JtYXRpb24gZnJvbSB0aGUgc2hvdXRib3hcclxuICovXHJcbmNsYXNzIFByb2Nlc3NTaG91dHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gbmFtZXMgKE9wdGlvbmFsKSBMaXN0IG9mIHVzZXJuYW1lcy9JRHMgdG8gZmlsdGVyIGZvclxyXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIChPcHRpb25hbCkgV2hhdCBmaWx0ZXIgdGhlIG5hbWVzIGFyZSBmb3IuIFJlcXVpcmVkIGlmIGBuYW1lc2AgaXMgcHJvdmlkZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB3YXRjaFNob3V0Ym94KFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIG5hbWVzPzogc3RyaW5nW10sXHJcbiAgICAgICAgdXNlcnR5cGU/OiBTaG91dGJveFVzZXJUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyBPYnNlcnZlIHRoZSBzaG91dGJveFxyXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcclxuICAgICAgICAgICAgdGFyLFxyXG4gICAgICAgICAgICAobXV0TGlzdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2hvdXRib3ggdXBkYXRlcywgcHJvY2VzcyB0aGUgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIG11dExpc3QuZm9yRWFjaCgobXV0UmVjKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjaGFuZ2VkIG5vZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0UmVjLmFkZGVkTm9kZXMuZm9yRWFjaCgobm9kZTogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShub2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBub2RlIGlzIGFkZGVkIGJ5IE1BTSsgZm9yIGdpZnQgYnV0dG9uLCBpZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpZ25vcmUgaWYgdGhlIG5vZGUgaXMgYSBkYXRlIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9ebXBfLy50ZXN0KG5vZGVEYXRhLmdldEF0dHJpYnV0ZSgnaWQnKSEpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGF0YS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGxvb2tpbmcgZm9yIHNwZWNpZmljIHVzZXJzLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lcyAhPT0gdW5kZWZpbmVkICYmIG5hbWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VydHlwZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVXNlcnR5cGUgbXVzdCBiZSBkZWZpbmVkIGlmIGZpbHRlcmluZyBuYW1lcyEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJRDogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FbaHJlZl49XCIvdS9cIl0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdocmVmJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSA+IHNwYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYC91LyR7bmFtZX1gID09PSB1c2VySUQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jYXNlbGVzc1N0cmluZ01hdGNoKG5hbWUsIHVzZXJOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlU2hvdXQobm9kZSwgdXNlcnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9ucyBOdW1iZXIgdG8gcmVwcmVzZW50IGNoZWNrYm94IHNlbGVjdGlvbnMgMSA9IFJlcGx5LCAyID0gUmVwbHkgV2l0aCBRdW90ZVxyXG4gICAgICogQHBhcmFtIGNoYXJMaW1pdCBOdW1iZXIgb2YgY2hhcmFjdGVycyB0byBpbmNsdWRlIGluIHF1b3RlLCAsIGNoYXJMaW1pdD86bnVtYmVyIC0gQ3VycmVudGx5IHVudXNlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2hvdXRib3hSZXBseSh0YXI6IHN0cmluZywgYnV0dG9ucz86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ3dhdGNoU2hvdXRib3hSZXBseSgnLCB0YXIsIGJ1dHRvbnMsICcpJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IF9nZXRSYXdDb2xvciA9IChlbGVtOiBIVE1MU3BhbkVsZW1lbnQpOiBzdHJpbmcgfCBudWxsID0+IHtcclxuICAgICAgICAgICAgaWYgKGVsZW0uc3R5bGUuYmFja2dyb3VuZENvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbS5zdHlsZS5jb2xvcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW0uc3R5bGUuY29sb3I7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgX2dldE5hbWVDb2xvciA9IChlbGVtOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsKTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByYXdDb2xvcjogc3RyaW5nIHwgbnVsbCA9IF9nZXRSYXdDb2xvcihlbGVtKTtcclxuICAgICAgICAgICAgICAgIGlmIChyYXdDb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gaGV4XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmdiOiBzdHJpbmdbXSA9IFV0aWwuYnJhY2tldENvbnRlbnRzKHJhd0NvbG9yKS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlsLnJnYlRvSGV4KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZ2JbMl0pXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVsZW1lbnQgaXMgbnVsbCFcXG4ke2VsZW19YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IF9tYWtlTmFtZVRhZyA9IChuYW1lOiBzdHJpbmcsIGhleDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmICghaGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYEBbaV0ke25hbWV9Wy9pXWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYEBbY29sb3I9JHtoZXh9XVtpXSR7bmFtZX1bL2ldWy9jb2xvcl1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSByZXBseSBib3hcclxuICAgICAgICBjb25zdCByZXBseUJveCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XHJcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgICAgIHRhcixcclxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBuYW1lIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3V0TmFtZTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgKS5xdWVyeVNlbGVjdG9yKCdhW2hyZWZePVwiL3UvXCJdIHNwYW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR3JhYiB0aGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgbmFtZSwgb3IgdGV4dCBjb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lQ29sb3I6IHN0cmluZyB8IG51bGwgPSBfZ2V0TmFtZUNvbG9yKHNob3V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZXh0cmFjdCB0aGUgdXNlcm5hbWUgZnJvbSBub2RlIGZvciB1c2UgaW4gcmVwbHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSA+IHNwYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgc3BhbiBlbGVtZW50IHRvIGJlIGJvZHkgb2YgYnV0dG9uIGFkZGVkIHRvIHBhZ2UgLSBidXR0b24gdXNlcyByZWxhdGl2ZSBub2RlIGNvbnRleHQgYXQgY2xpY2sgdGltZSB0byBkbyBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbHlCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIGEgUmVwbHlTaW1wbGUgcmVxdWVzdCwgdGhlbiBjcmVhdGUgUmVwbHkgU2ltcGxlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnV0dG9ucyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYnV0dG9uIHdpdGggb25jbGljayBhY3Rpb24gb2Ygc2V0dGluZyBzYiB0ZXh0IGZpZWxkIHRvIHVzZXJuYW1lIHdpdGggcG90ZW50aWFsIGNvbG9yIGJsb2NrIHdpdGggYSBjb2xvbiBhbmQgc3BhY2UgdG8gcmVwbHksIGZvY3VzIGN1cnNvciBpbiB0ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uaW5uZXJIVE1MID0gJzxidXR0b24+XFx1MjkzYTwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgc3R5bGVkIG5hbWUgdGFnIHRvIHRoZSByZXBseSBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgbm90aGluZyB3YXMgaW4gdGhlIHJlcGx5IGJveCwgYWRkIGEgY29sb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGx5Qm94LnZhbHVlID09PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtfbWFrZU5hbWVUYWcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gJHtfbWFrZU5hbWVUYWcodXNlck5hbWUsIG5hbWVDb2xvcil9IGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgYSByZXBseVF1b3RlIHJlcXVlc3QsIHRoZW4gY3JlYXRlIHJlcGx5IHF1b3RlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChidXR0b25zID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBidXR0b24gd2l0aCBvbmNsaWNrIGFjdGlvbiBvZiBnZXR0aW5nIHRoYXQgbGluZSdzIHRleHQsIHN0cmlwcGluZyBkb3duIHRvIDY1IGNoYXIgd2l0aCBubyB3b3JkIGJyZWFrLCB0aGVuIGluc2VydCBpbnRvIFNCIHRleHQgZmllbGQsIGZvY3VzIGN1cnNvciBpbiB0ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uaW5uZXJIVE1MID0gJzxidXR0b24+XFx1MjkzZDwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnF1b3RlU2hvdXQobm9kZSwgNjUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHF1b3RlIHRvIHJlcGx5IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9OiBcXHUyMDFjW2ldJHt0ZXh0fVsvaV1cXHUyMDFkIGA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9naXZlIHNwYW4gYW4gSUQgZm9yIHBvdGVudGlhbCB1c2UgbGF0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdtcF9yZXBseUJ1dHRvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2luc2VydCBidXR0b24gcHJpb3IgdG8gdXNlcm5hbWUgb3IgYW5vdGhlciBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUocmVwbHlCdXR0b24sIG5vZGUuY2hpbGROb2Rlc1syXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBxdW90ZVNob3V0KHNob3V0OiBOb2RlLCBsZW5ndGg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHRleHRBcnI6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgLy8gR2V0IG51bWJlciBvZiByZXBseSBidXR0b25zIHRvIHJlbW92ZSBmcm9tIHRleHRcclxuICAgICAgICBjb25zdCBidG5Db3VudCA9IHNob3V0LmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICcubXBfcmVwbHlCdXR0b24nXHJcbiAgICAgICAgKS5sZW5ndGg7XHJcbiAgICAgICAgLy8gR2V0IHRoZSB0ZXh0IG9mIGFsbCBjaGlsZCBub2Rlc1xyXG4gICAgICAgIHNob3V0LmNoaWxkTm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgLy8gTGlua3MgYXJlbid0IGNsaWNrYWJsZSBhbnl3YXkgc28gZ2V0IHJpZCBvZiB0aGVtXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlTmFtZSA9PT0gJ0EnKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goJ1tMaW5rXScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBNYWtlIGEgc3RyaW5nLCBidXQgdG9zcyBvdXQgdGhlIGZpcnN0IGZldyBub2Rlc1xyXG4gICAgICAgIGxldCBub2RlVGV4dCA9IHRleHRBcnIuc2xpY2UoMyArIGJ0bkNvdW50KS5qb2luKCcnKTtcclxuICAgICAgICBpZiAobm9kZVRleHQuaW5kZXhPZignOicpID09PSAwKSB7XHJcbiAgICAgICAgICAgIG5vZGVUZXh0ID0gbm9kZVRleHQuc3Vic3RyKDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIHNob3VsZCBoYXZlIGp1c3QgdGhlIG1lc3NhZ2UgdGV4dC5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IHF1b3RlcyB0aGF0IG1pZ2h0IGJlIGNvbnRhaW5lZDpcclxuICAgICAgICBub2RlVGV4dCA9IG5vZGVUZXh0LnJlcGxhY2UoL1xcdXsyMDFjfSguKj8pXFx1ezIwMWR9L2d1LCAnJyk7XHJcbiAgICAgICAgLy8gVHJpbSB0aGUgdGV4dCB0byBhIG1heCBsZW5ndGggYW5kIGFkZCAuLi4gaWYgc2hvcnRlbmVkXHJcbiAgICAgICAgbGV0IHRyaW1tZWRUZXh0ID0gVXRpbC50cmltU3RyaW5nKG5vZGVUZXh0LnRyaW0oKSwgbGVuZ3RoKTtcclxuICAgICAgICBpZiAodHJpbW1lZFRleHQgIT09IG5vZGVUZXh0LnRyaW0oKSkge1xyXG4gICAgICAgICAgICB0cmltbWVkVGV4dCArPSAnIFtcXHUyMDI2XSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIERvbmUhXHJcbiAgICAgICAgcmV0dXJuIHRyaW1tZWRUZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHNob3V0IFRoZSBub2RlIGNvbnRhaW5pbmcgc2hvdXQgaW5mb1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgZWxlbWVudCBzZWxlY3RvciBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBnZXQgVGhlIHJlcXVlc3RlZCBpbmZvIChocmVmIG9yIHRleHQpXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgc3RyaW5nIHRoYXQgd2FzIHNwZWNpZmllZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgc2hvdXQ6IE5vZGUsXHJcbiAgICAgICAgdGFyOiBzdHJpbmcsXHJcbiAgICAgICAgZ2V0OiAnaHJlZicgfCAndGV4dCdcclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJyk7XHJcblxyXG4gICAgICAgIGlmIChzaG91dCAhPT0gbnVsbCAmJiAhbm9kZURhdGEpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2hvdXRFbGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICB0YXJcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKHNob3V0RWxlbSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV4dHJhY3RlZDogc3RyaW5nIHwgbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmIChnZXQgIT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS5nZXRBdHRyaWJ1dGUoZ2V0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhY3RlZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleHRyYWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEF0dHJpYnV0ZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgRWxlbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgTm9kZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYW5nZSB0aGUgc3R5bGUgb2YgYSBzaG91dCBiYXNlZCBvbiBmaWx0ZXIgbGlzdHNcclxuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cclxuICAgICAqIEBwYXJhbSB1c2VydHlwZSBUaGUgdHlwZSBvZiB1c2VycyB0aGF0IGhhdmUgYmVlbiBmaWx0ZXJlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHN0eWxlU2hvdXQoc2hvdXQ6IE5vZGUsIHVzZXJ0eXBlOiBTaG91dGJveFVzZXJUeXBlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2hvdXRFbGVtOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCk7XHJcbiAgICAgICAgaWYgKHVzZXJ0eXBlID09PSAncHJpb3JpdHknKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVN0eWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgncHJpb3JpdHlTdHlsZV92YWwnKTtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbVN0eWxlKSB7XHJcbiAgICAgICAgICAgICAgICBzaG91dEVsZW0uc3R5bGUuYmFja2dyb3VuZCA9IGBoc2xhKCR7Y3VzdG9tU3R5bGV9KWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG91dEVsZW0uc3R5bGUuYmFja2dyb3VuZCA9ICdoc2xhKDAsMCUsNTAlLDAuMyknO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh1c2VydHlwZSA9PT0gJ211dGUnKSB7XHJcbiAgICAgICAgICAgIHNob3V0RWxlbS5jbGFzc0xpc3QuYWRkKCdtcF9tdXRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUHJpb3JpdHlVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncHJpb3JpdHlVc2VycycsXHJcbiAgICAgICAgdGFnOiAnRW1waGFzaXplIFVzZXJzJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiBzeXN0ZW0sIDI1NDIwLCA3NzYxOCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0VtcGhhc2l6ZXMgbWVzc2FnZXMgZnJvbSB0aGUgbGlzdGVkIHVzZXJzIGluIHRoZSBzaG91dGJveC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcHJpb3JpdHlVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBnbVZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShgJHt0aGlzLnNldHRpbmdzLnRpdGxlfV92YWxgKTtcclxuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByaW9yaXR5VXNlcnMgPSBhd2FpdCBVdGlsLmNzdlRvQXJyYXkoZ21WYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94KHRoaXMuX3RhciwgdGhpcy5fcHJpb3JpdHlVc2VycywgdGhpcy5fdXNlclR5cGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEhpZ2hsaWdodGluZyB1c2VycyBpbiB0aGUgc2hvdXRib3guLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gcHJpb3JpdHkgdXNlcnNcclxuICovXHJcbmNsYXNzIFByaW9yaXR5U3R5bGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5U3R5bGUnLFxyXG4gICAgICAgIHRhZzogJ0VtcGhhc2lzIFN0eWxlJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDAsIDAlLCA1MCUsIDAuMycsXHJcbiAgICAgICAgZGVzYzogYENoYW5nZSB0aGUgY29sb3Ivb3BhY2l0eSBvZiB0aGUgaGlnaGxpZ2h0aW5nIHJ1bGUgZm9yIGVtcGhhc2l6ZWQgdXNlcnMnIHBvc3RzLiAoPGVtPlRoaXMgaXMgZm9ybWF0dGVkIGFzIEh1ZSAoMC0zNjApLCBTYXR1cmF0aW9uICgwLTEwMCUpLCBMaWdodG5lc3MgKDAtMTAwJSksIE9wYWNpdHkgKDAtMSk8L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXR0aW5nIGN1c3RvbSBoaWdobGlnaHQgZm9yIHByaW9yaXR5IHVzZXJzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgYSBjdXN0b20gYmFja2dyb3VuZCB0byBiZSBhcHBsaWVkIHRvIGRlc2lyZWQgbXV0ZWQgdXNlcnNcclxuICovXHJcbmNsYXNzIE11dGVkVXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ211dGVkVXNlcnMnLFxyXG4gICAgICAgIHRhZzogJ011dGUgdXNlcnMnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEyMzQsIGdhcmRlbnNoYWRlJyxcclxuICAgICAgICBkZXNjOiBgT2JzY3VyZXMgbWVzc2FnZXMgZnJvbSB0aGUgbGlzdGVkIHVzZXJzIGluIHRoZSBzaG91dGJveCB1bnRpbCBob3ZlcmVkLiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9tdXRlZFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfdXNlclR5cGU6IFNob3V0Ym94VXNlclR5cGUgPSAnbXV0ZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5zZXR0aW5ncy50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgaWYgKGdtVmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tdXRlZFVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlcmxpc3QgaXMgbm90IGRlZmluZWQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveCh0aGlzLl90YXIsIHRoaXMuX211dGVkVXNlcnMsIHRoaXMuX3VzZXJUeXBlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBPYnNjdXJpbmcgbXV0ZWQgdXNlcnMuLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBHaWZ0IGJ1dHRvbiB0byBiZSBhZGRlZCB0byBTaG91dCBUcmlwbGUgZG90IG1lbnVcclxuICovXHJcbmNsYXNzIEdpZnRCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZ2lmdEJ1dHRvbicsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIEdpZnQgYnV0dG9uIGluIFNob3V0Ym94IGRvdC1tZW51YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBJbml0aWFsaXplZCBHaWZ0IEJ1dHRvbi5gKTtcclxuICAgICAgICBjb25zdCBzYmZEaXYgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiZicpITtcclxuICAgICAgICBjb25zdCBzYmZEaXZDaGlsZCA9IHNiZkRpdiEuZmlyc3RDaGlsZDtcclxuXHJcbiAgICAgICAgLy9hZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHdoZW5ldmVyIHNvbWV0aGluZyBpcyBjbGlja2VkIGluIHRoZSBzYmYgZGl2XHJcbiAgICAgICAgc2JmRGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICAgICAgLy9wdWxsIHRoZSBldmVudCB0YXJnZXQgaW50byBhbiBIVE1MIEVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSBUcmlwbGUgRG90IE1lbnUgYXMgYW4gZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCBzYk1lbnVFbGVtID0gdGFyZ2V0IS5jbG9zZXN0KCcuc2JfbWVudScpO1xyXG4gICAgICAgICAgICAvL2ZpbmQgdGhlIG1lc3NhZ2UgZGl2XHJcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudVBhcmVudCA9IHRhcmdldCEuY2xvc2VzdChgZGl2YCk7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBmdWxsIHRleHQgb2YgdGhlIG1lc3NhZ2UgZGl2XHJcbiAgICAgICAgICAgIGxldCBnaWZ0TWVzc2FnZSA9IHNiTWVudVBhcmVudCEuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAvL2Zvcm1hdCBtZXNzYWdlIHdpdGggc3RhbmRhcmQgdGV4dCArIG1lc3NhZ2UgY29udGVudHMgKyBzZXJ2ZXIgdGltZSBvZiB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICBnaWZ0TWVzc2FnZSA9XHJcbiAgICAgICAgICAgICAgICBgU2VudCBvbiBTaG91dGJveCBtZXNzYWdlOiBcImAgK1xyXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKGdpZnRNZXNzYWdlLmluZGV4T2YoJzogJykgKyAyKSArXHJcbiAgICAgICAgICAgICAgICBgXCIgYXQgYCArXHJcbiAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZS5zdWJzdHJpbmcoMCwgOCk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHRhcmdldCBvZiB0aGUgY2xpY2sgaXMgbm90IHRoZSBUcmlwbGUgRG90IE1lbnUgT1JcclxuICAgICAgICAgICAgLy9pZiBtZW51IGlzIG9uZSBvZiB5b3VyIG93biBjb21tZW50cyAob25seSB3b3JrcyBmb3IgZmlyc3QgMTAgbWludXRlcyBvZiBjb21tZW50IGJlaW5nIHNlbnQpXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICF0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51JykgfHxcclxuICAgICAgICAgICAgICAgIHNiTWVudUVsZW0hLmdldEF0dHJpYnV0ZSgnZGF0YS1lZScpISA9PT0gJzEnXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBNZW51IGFmdGVyIGl0IHBvcHMgdXBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIEdpZnQgQnV0dG9uLi4uYCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcHVwTWVudTogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudU1haW4nKTtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5zbGVlcCg1KTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoIXBvcHVwTWVudSEuaGFzQ2hpbGROb2RlcygpKTtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIHVzZXIgZGV0YWlscyBmcm9tIHRoZSBwb3B1cCBtZW51IGRldGFpbHNcclxuICAgICAgICAgICAgY29uc3QgcG9wdXBVc2VyOiBIVE1MRWxlbWVudCA9IFV0aWwubm9kZVRvRWxlbShwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0pO1xyXG4gICAgICAgICAgICAvL21ha2UgdXNlcm5hbWUgZXF1YWwgdGhlIGRhdGEtdWlkLCBmb3JjZSBub3QgbnVsbFxyXG4gICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogU3RyaW5nID0gcG9wdXBVc2VyIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdWlkJykhO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxyXG4gICAgICAgICAgICBsZXQgZ2lmdFZhbHVlU2V0dGluZzogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ3VzZXJHaWZ0RGVmYXVsdF92YWwnKTtcclxuICAgICAgICAgICAgLy9pZiB0aGV5IGRpZCBub3Qgc2V0IGEgdmFsdWUgaW4gcHJlZmVyZW5jZXMsIHNldCB0byAxMDBcclxuICAgICAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICBOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICBpc05hTihOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAwJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBIVE1MIGRvY3VtZW50IHRoYXQgaG9sZHMgdGhlIGJ1dHRvbiBhbmQgdmFsdWUgdGV4dFxyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QnV0dG9uOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24uc2V0QXR0cmlidXRlKCdpZCcsICdnaWZ0QnV0dG9uJyk7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHRoZSBidXR0b24gZWxlbWVudCBhcyB3ZWxsIGFzIGEgdGV4dCBlbGVtZW50IGZvciB2YWx1ZSBvZiBnaWZ0LiBQb3B1bGF0ZSB3aXRoIHZhbHVlIGZyb20gc2V0dGluZ3NcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5pbm5lckhUTUwgPSBgPGJ1dHRvbj5HaWZ0OiA8L2J1dHRvbj48c3Bhbj4mbmJzcDs8L3NwYW4+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgc2l6ZT1cIjNcIiBpZD1cIm1wX2dpZnRWYWx1ZVwiIHRpdGxlPVwiVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAwXCIgdmFsdWU9XCIke2dpZnRWYWx1ZVNldHRpbmd9XCI+YDtcclxuICAgICAgICAgICAgLy9hZGQgZ2lmdCBlbGVtZW50IHdpdGggYnV0dG9uIGFuZCB0ZXh0IHRvIHRoZSBtZW51XHJcbiAgICAgICAgICAgIHBvcHVwTWVudSEuY2hpbGROb2Rlc1swXS5hcHBlbmRDaGlsZChnaWZ0QnV0dG9uKTtcclxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgbGlzdGVuZXIgZm9yIHdoZW4gZ2lmdCBidXR0b24gaXMgY2xpY2tlZFxyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vcHVsbCB3aGF0ZXZlciB0aGUgZmluYWwgdmFsdWUgb2YgdGhlIHRleHQgYm94IGVxdWFsc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2lmdEZpbmFsQW1vdW50ID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcclxuICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIC8vYmVnaW4gc2V0dGluZyB1cCB0aGUgR0VUIHJlcXVlc3QgdG8gTUFNIEpTT05cclxuICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRIVFRQID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgcmVzdWx0cyB3aXRoIHRoZSBhbW91bnQgZW50ZXJlZCBieSB1c2VyIHBsdXMgdGhlIHVzZXJuYW1lIGZvdW5kIG9uIHRoZSBtZW51IHNlbGVjdGVkXHJcbiAgICAgICAgICAgICAgICAvL2FkZGVkIG1lc3NhZ2UgY29udGVudHMgZW5jb2RlZCB0byBwcmV2ZW50IHVuaW50ZW5kZWQgY2hhcmFjdGVycyBmcm9tIGJyZWFraW5nIEpTT04gVVJMXHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL2JvbnVzQnV5LnBocD9zcGVuZHR5cGU9Z2lmdCZhbW91bnQ9JHtnaWZ0RmluYWxBbW91bnR9JmdpZnRUbz0ke3VzZXJOYW1lfSZtZXNzYWdlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlXHJcbiAgICAgICAgICAgICAgICApfWA7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnaWZ0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShnaWZ0SFRUUC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBsaW5lIGluIFNCIHRoYXQgc2hvd3MgZ2lmdCB3YXMgc3VjY2Vzc2Z1bCB0byBhY2tub3dsZWRnZSBnaWZ0IHdvcmtlZC9mYWlsZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2dpZnRTdGF0dXNFbGVtJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNiZkRpdkNoaWxkIS5hcHBlbmRDaGlsZChuZXdEaXYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBnaWZ0IHN1Y2NlZWRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNvbi5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWNjZXNzTXNnID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BvaW50cyBHaWZ0IFN1Y2Nlc3NmdWw6IFZhbHVlOiAnICsgZ2lmdEZpbmFsQW1vdW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKHN1Y2Nlc3NNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoJ21wX3N1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhaWxlZE1zZyA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBGYWlsZWQ6IEVycm9yOiAnICsganNvbi5lcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5hcHBlbmRDaGlsZChmYWlsZWRNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmNsYXNzTGlzdC5hZGQoJ21wX2ZhaWwnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FmdGVyIHdlIGFkZCBsaW5lIGluIFNCLCBzY3JvbGwgdG8gYm90dG9tIHRvIHNob3cgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL2FmdGVyIHdlIGFkZCBsaW5lIGluIFNCLCBzY3JvbGwgdG8gYm90dG9tIHRvIHNob3cgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLnNlbmQoKTtcclxuICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRvIG1haW4gU0Igd2luZG93IGFmdGVyIGdpZnQgaXMgY2xpY2tlZCAtIHRoZXNlIGFyZSB0d28gc3RlcHMgdGFrZW4gYnkgTUFNIHdoZW4gY2xpY2tpbmcgb3V0IG9mIE1lbnVcclxuICAgICAgICAgICAgICAgIHNiZkRpdlxyXG4gICAgICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzYl9jbGlja2VkX3JvdycpWzBdIVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50QnlJZCgnc2JNZW51TWFpbicpIVxyXG4gICAgICAgICAgICAgICAgICAgIC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ3NiQm90dG9tIGhpZGVNZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpIS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlVG9OdW1iZXI6IFN0cmluZyA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRWYWx1ZScpXHJcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcclxuICAgICAgICAgICAgICAgICAgICBpc05hTihOdW1iZXIodmFsdWVUb051bWJlcikpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBHaWZ0IEJ1dHRvbiBhZGRlZCFgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgUmVwbHkgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XHJcbiAqL1xyXG5jbGFzcyBSZXBseVNpbXBsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyZXBseVNpbXBsZScsXHJcbiAgICAgICAgLy90YWc6IFwiUmVwbHlcIixcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgUmVwbHkgYnV0dG9uIGluIFNob3V0Ym94OiAmIzEwNTU0O2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcmVwbHlTaW1wbGU6IG51bWJlciA9IDE7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94UmVwbHkodGhpcy5fdGFyLCB0aGlzLl9yZXBseVNpbXBsZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFJlcGx5IEJ1dHRvbi4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBSZXBseSBXaXRoIFF1b3RlIGJ1dHRvbiB0byBiZSBhZGRlZCB0byBTaG91dFxyXG4gKi9cclxuY2xhc3MgUmVwbHlRdW90ZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyZXBseVF1b3RlJyxcclxuICAgICAgICAvL3RhZzogXCJSZXBseSBXaXRoIFF1b3RlXCIsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIFJlcGx5IHdpdGggUXVvdGUgYnV0dG9uIGluIFNob3V0Ym94OiAmIzEwNTU3O2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfcmVwbHlRdW90ZTogbnVtYmVyID0gMjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3hSZXBseSh0aGlzLl90YXIsIHRoaXMuX3JlcGx5UXVvdGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBSZXBseSB3aXRoIFF1b3RlIEJ1dHRvbi4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgZmVhdHVyZSBmb3IgYnVpbGRpbmcgYSBsaWJyYXJ5IG9mIHF1aWNrIHNob3V0IGl0ZW1zIHRoYXQgY2FuIGFjdCBhcyBhIGNvcHkvcGFzdGUgcmVwbGFjZW1lbnQuXHJcbiAqL1xyXG5jbGFzcyBRdWlja1Nob3V0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3F1aWNrU2hvdXQnLFxyXG4gICAgICAgIGRlc2M6IGBDcmVhdGUgZmVhdHVyZSBiZWxvdyBzaG91dGJveCB0byBzdG9yZSBwcmUtc2V0IG1lc3NhZ2VzLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBRdWljayBTaG91dCBCdXR0b25zLi4uYCk7XHJcbiAgICAgICAgLy9nZXQgdGhlIG1haW4gc2hvdXRib3ggaW5wdXQgZmllbGRcclxuICAgICAgICBjb25zdCByZXBseUJveCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XHJcbiAgICAgICAgLy9lbXB0eSBKU09OIHdhcyBnaXZpbmcgbWUgaXNzdWVzLCBzbyBkZWNpZGVkIHRvIGp1c3QgbWFrZSBhbiBpbnRybyBmb3Igd2hlbiB0aGUgR00gdmFyaWFibGUgaXMgZW1wdHlcclxuICAgICAgICBsZXQganNvbkxpc3QgPSBKU09OLnBhcnNlKFxyXG4gICAgICAgICAgICBgeyBcIkludHJvXCI6XCJXZWxjb21lIHRvIFF1aWNrU2hvdXQgTUFNK2VyISBIZXJlIHlvdSBjYW4gY3JlYXRlIHByZXNldCBTaG91dCBtZXNzYWdlcyBmb3IgcXVpY2sgcmVzcG9uc2VzIGFuZCBrbm93bGVkZ2Ugc2hhcmluZy4gJ0NsZWFyJyBjbGVhcnMgdGhlIGVudHJ5IHRvIHN0YXJ0IHNlbGVjdGlvbiBwcm9jZXNzIG92ZXIuICdTZWxlY3QnIHRha2VzIHdoYXRldmVyIFF1aWNrU2hvdXQgaXMgaW4gdGhlIFRleHRBcmVhIGFuZCBwdXRzIGluIHlvdXIgU2hvdXQgcmVzcG9uc2UgYXJlYS4gJ1NhdmUnIHdpbGwgc3RvcmUgdGhlIFNlbGVjdGlvbiBOYW1lIGFuZCBUZXh0IEFyZWEgQ29tYm8gZm9yIGZ1dHVyZSB1c2UgYXMgYSBRdWlja1Nob3V0LCBhbmQgaGFzIGNvbG9yIGluZGljYXRvcnMuIEdyZWVuID0gc2F2ZWQgYXMtaXMuIFllbGxvdyA9IFF1aWNrU2hvdXQgTmFtZSBleGlzdHMgYW5kIGlzIHNhdmVkLCBidXQgY29udGVudCBkb2VzIG5vdCBtYXRjaCB3aGF0IGlzIHN0b3JlZC4gT3JhbmdlID0gbm8gZW50cnkgbWF0Y2hpbmcgdGhhdCBuYW1lLCBub3Qgc2F2ZWQuICdEZWxldGUnIHdpbGwgcGVybWFuZW50bHkgcmVtb3ZlIHRoYXQgZW50cnkgZnJvbSB5b3VyIHN0b3JlZCBRdWlja1Nob3V0cyAoYnV0dG9uIG9ubHkgc2hvd3Mgd2hlbiBleGlzdHMgaW4gc3RvcmFnZSkuIEZvciBuZXcgZW50cmllcyBoYXZlIHlvdXIgUXVpY2tTaG91dCBOYW1lIHR5cGVkIGluIEJFRk9SRSB5b3UgY3JhZnQgeW91ciB0ZXh0IG9yIHJpc2sgaXQgYmVpbmcgb3ZlcndyaXR0ZW4gYnkgc29tZXRoaW5nIHRoYXQgZXhpc3RzIGFzIHlvdSB0eXBlIGl0LiBUaGFua3MgZm9yIHVzaW5nIE1BTSshXCIgfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vZ2V0IFNob3V0Ym94IERJVlxyXG4gICAgICAgIGNvbnN0IHNob3V0Qm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZwU2hvdXQnKTtcclxuICAgICAgICAvL2dldCB0aGUgZm9vdGVyIHdoZXJlIHdlIHdpbGwgaW5zZXJ0IG91ciBmZWF0dXJlXHJcbiAgICAgICAgY29uc3Qgc2hvdXRGb290ID0gPEhUTUxFbGVtZW50PnNob3V0Qm94IS5xdWVyeVNlbGVjdG9yKCcuYmxvY2tGb290Jyk7XHJcbiAgICAgICAgLy9naXZlIGl0IGFuIElEIGFuZCBzZXQgdGhlIHNpemVcclxuICAgICAgICBzaG91dEZvb3QhLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfYmxvY2tGb290Jyk7XHJcbiAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xyXG4gICAgICAgIC8vY3JlYXRlIGEgbmV3IGRpdmUgdG8gaG9sZCBvdXIgY29tYm9Cb3ggYW5kIGJ1dHRvbnMgYW5kIHNldCB0aGUgc3R5bGUgZm9yIGZvcm1hdHRpbmdcclxuICAgICAgICBjb25zdCBjb21ib0JveERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLmZsb2F0ID0gJ2xlZnQnO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnLjVlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luVG9wID0gJy41ZW0nO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBsYWJlbCB0ZXh0IGVsZW1lbnQgYW5kIGFkZCB0aGUgdGV4dCBhbmQgYXR0cmlidXRlcyBmb3IgSURcclxuICAgICAgICBjb25zdCBjb21ib0JveExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcclxuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnZm9yJywgJ3F1aWNrU2hvdXREYXRhJyk7XHJcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5pbm5lclRleHQgPSAnQ2hvb3NlIGEgUXVpY2tTaG91dCc7XHJcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94TGFiZWwnKTtcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgaW5wdXQgZmllbGQgdG8gbGluayB0byBkYXRhbGlzdCBhbmQgZm9ybWF0IHN0eWxlXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zdHlsZS5tYXJnaW5MZWZ0ID0gJy41ZW0nO1xyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuc2V0QXR0cmlidXRlKCdsaXN0JywgJ21wX2NvbWJvQm94TGlzdCcpO1xyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveElucHV0Jyk7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBkYXRhbGlzdCB0byBzdG9yZSBvdXIgcXVpY2tzaG91dHNcclxuICAgICAgICBjb25zdCBjb21ib0JveExpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRhbGlzdCcpO1xyXG4gICAgICAgIGNvbWJvQm94TGlzdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94TGlzdCcpO1xyXG4gICAgICAgIC8vaWYgdGhlIEdNIHZhcmlhYmxlIGV4aXN0c1xyXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcpKSB7XHJcbiAgICAgICAgICAgIC8vb3ZlcndyaXRlIGpzb25MaXN0IHZhcmlhYmxlIHdpdGggcGFyc2VkIGRhdGFcclxuICAgICAgICAgICAganNvbkxpc3QgPSBKU09OLnBhcnNlKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpO1xyXG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IE9wdGlvbiBlbGVtZW50IGFuZCBhZGQgb3VyIGRhdGEgZm9yIGRpc3BsYXkgdG8gdXNlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vaWYgbm8gR00gdmFyaWFibGVcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSB2YXJpYWJsZSB3aXRoIG91dCBJbnRybyBkYXRhXHJcbiAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcclxuICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaXRlbVxyXG4gICAgICAgICAgICAvLyBUT0RPOiBwcm9iYWJseSBjYW4gZ2V0IHJpZCBvZiB0aGUgZm9yRWFjaCBhbmQganVzdCBkbyBzaW5nbGUgZXhlY3V0aW9uIHNpbmNlIHdlIGtub3cgdGhpcyBpcyBJbnRybyBvbmx5XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9hcHBlbmQgdGhlIGFib3ZlIGVsZW1lbnRzIHRvIG91ciBESVYgZm9yIHRoZSBjb21ibyBib3hcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveExhYmVsKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveElucHV0KTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChjb21ib0JveExpc3QpO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBjbGVhciBidXR0b24gYW5kIGFkZCBzdHlsZVxyXG4gICAgICAgIGNvbnN0IGNsZWFyQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgY2xlYXJCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIGNsZWFyQnV0dG9uLmlubmVySFRNTCA9ICdDbGVhcic7XHJcbiAgICAgICAgLy9jcmVhdGUgZGVsZXRlIGJ1dHRvbiwgYWRkIHN0eWxlLCBhbmQgdGhlbiBoaWRlIGl0IGZvciBsYXRlciB1c2VcclxuICAgICAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICc2ZW0nO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnUmVkJztcclxuICAgICAgICBkZWxldGVCdXR0b24uaW5uZXJIVE1MID0gJ0RFTEVURSc7XHJcbiAgICAgICAgLy9jcmVhdGUgc2VsZWN0IGJ1dHRvbiBhbmQgc3R5bGUgaXRcclxuICAgICAgICBjb25zdCBzZWxlY3RCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBzZWxlY3RCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5pbm5lckhUTUwgPSAnU2VsZWN0JztcclxuICAgICAgICAvL2NyZWF0ZSBzYXZlIGJ1dHRvbiBhbmQgc3R5bGUgaXRcclxuICAgICAgICBjb25zdCBzYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgc2F2ZUJ1dHRvbi5pbm5lckhUTUwgPSAnU2F2ZSc7XHJcbiAgICAgICAgLy9hZGQgYWxsIDQgYnV0dG9ucyB0byB0aGUgY29tYm9Cb3ggRElWXHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY2xlYXJCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNlbGVjdEJ1dHRvbik7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoc2F2ZUJ1dHRvbik7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoZGVsZXRlQnV0dG9uKTtcclxuICAgICAgICAvL2NyZWF0ZSBvdXIgdGV4dCBhcmVhIGFuZCBzdHlsZSBpdCwgdGhlbiBoaWRlIGl0XHJcbiAgICAgICAgY29uc3QgcXVpY2tTaG91dFRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmhlaWdodCA9ICc1MCUnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLm1hcmdpbiA9ICcxZW0nO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLndpZHRoID0gJzk3JSc7XHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuaWQgPSAnbXBfcXVpY2tTaG91dFRleHQnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIC8vZXhlY3V0ZXMgd2hlbiBjbGlja2luZyBzZWxlY3QgYnV0dG9uXHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgc29tZXRoaW5nIGluc2lkZSBvZiB0aGUgcXVpY2tzaG91dCBhcmVhXHJcbiAgICAgICAgICAgICAgICBpZiAocXVpY2tTaG91dFRleHQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3B1dCB0aGUgdGV4dCBpbiB0aGUgbWFpbiBzaXRlIHJlcGx5IGZpZWxkIGFuZCBmb2N1cyBvbiBpdFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gcXVpY2tTaG91dFRleHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL2NyZWF0ZSBhIHF1aWNrU2hvdXQgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgbm90IHRoZSBsYXN0IHF1aWNrU2hvdXRcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhqc29uTGlzdCkubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlbnRyeSBmcm9tIHRoZSBKU09OIGFuZCB1cGRhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb24gbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpXTtcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gZm9yIG5ldyB1bnNhdmVkIHN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIG5vdCBhIHNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIG9wdGlvbnMgZnJvbSBkYXRhbGlzdCB0byByZXNldCB3aXRoIG5ld2x5IGNyZWF0ZWQganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBpdGVtIGluIG5ldyBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZXcgb3B0aW9uIGVsZW1lbnQgdG8gYWRkIHRvIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGN1cnJlbnQga2V5IHZhbHVlIHRvIHRoZSBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBlbGVtZW50IHRvIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgbGFzdCBpdGVtIGluIHRoZSBqc29ubGlzdFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBpdGVtIGZyb20ganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC/gsqAvZywgJ+CyoCcpXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBlbnRpcmUgdmFyaWFibGUgc28gaXRzIG5vdCBlbXB0eSBHTSB2YXJpYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKCdtcF9xdWlja1Nob3V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gZm9yIG5ldyB1bnNhdmVkIHN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIG5vdCBhIHNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgZXZlbnQgb24gc2F2ZSBidXR0b24gdG8gc2F2ZSBxdWlja3Nob3V0XHJcbiAgICAgICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIGRhdGEgaW4gdGhlIGtleSBhbmQgdmFsdWUgR1VJIGZpZWxkcywgcHJvY2VlZFxyXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlICYmIGNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3dhcyBoYXZpbmcgaXNzdWUgd2l0aCBldmFsIHByb2Nlc3NpbmcgdGhlIC5yZXBsYWNlIGRhdGEgc28gbWFkZSBhIHZhcmlhYmxlIHRvIGludGFrZSBpdFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VkVGV4dCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mdW4gd2F5IHRvIGR5bmFtaWNhbGx5IGNyZWF0ZSBzdGF0ZW1lbnRzIC0gdGhpcyB0YWtlcyB3aGF0ZXZlciBpcyBpbiBsaXN0IGZpZWxkIHRvIGNyZWF0ZSBhIGtleSB3aXRoIHRoYXQgdGV4dCBhbmQgdGhlIHZhbHVlIGZyb20gdGhlIHRleHRhcmVhXHJcbiAgICAgICAgICAgICAgICAgICAgZXZhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYGpzb25MaXN0LmAgKyByZXBsYWNlZFRleHQgKyBgPSBcImAgKyBxdWlja1Nob3V0VGV4dC52YWx1ZSArIGBcIjtgXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL292ZXJ3cml0ZSBvciBjcmVhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gbm93IHRoYXQgaXRzIHNhdmVkIGFzLWlzXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL3Nob3cgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZXhpc3RpbmcgZGF0YWxpc3QgZWxlbWVudHMgdG8gcmVidWlsZCB3aXRoIG5ldyBqc29ubGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBvcHRpb24gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBrZXkgbmFtZSB0byB0aGUgb3B0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE86IHRoaXMgbWF5IG9yIG1heSBub3QgYmUgbmVjZXNzYXJ5LCBidXQgd2FzIGhhdmluZyBpc3N1ZXMgd2l0aCB0aGUgdW5pcXVlIHN5bWJvbCBzdGlsbCByYW5kb21seSBzaG93aW5nIHVwIGFmdGVyIHNhdmVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0gY29tYm9Cb3hPcHRpb24udmFsdWUucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRvIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9hZGQgZXZlbnQgZm9yIGNsZWFyIGJ1dHRvbiB0byByZXNldCB0aGUgZGF0YWxpc3RcclxuICAgICAgICBjbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NsZWFyIHRoZSBpbnB1dCBmaWVsZCBhbmQgdGV4dGFyZWEgZmllbGRcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQudmFsdWUgPSAnJztcclxuICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9OZXh0IHR3byBpbnB1dCBmdW5jdGlvbnMgYXJlIG1lYXQgYW5kIHBvdGF0b2VzIG9mIHRoZSBsb2dpYyBmb3IgdXNlciBmdW5jdGlvbmFsaXR5XHJcblxyXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGNoYW5nZWQgd2hpdGhpbiB0aGUgaW5wdXQgZmllbGRcclxuICAgICAgICBjb21ib0JveElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdpbnB1dCcsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIHRleHRhcmVhIGlzIGFsc28gYmxhbmsgbWluaW1pemUgcmVhbCBlc3RhdGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgdGV4dCBhcmVhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hyaW5rIHRoZSBmb290ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBzb21ldGhpbmcgaXMgc3RpbGwgaW4gdGhlIHRleHRhcmVhIHdlIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCB1bnNhdmVkIGFuZCB1bm5hbWVkIGRhdGEgaXMgdGhlcmVcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N0eWxlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkIGlzIG9yZ2FuZ2Ugc2F2ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vZWl0aGVyIHdheSwgaGlkZSB0aGUgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaGFzIGFueSB0ZXh0IGluIGl0XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Nob3cgdGhlIHRleHQgYXJlYSBmb3IgaW5wdXRcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9leHBhbmQgdGhlIGZvb3RlciB0byBhY2NvbW9kYXRlIGFsbCBmZWF0dXJlIGFzcGVjdHNcclxuICAgICAgICAgICAgICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcxMWVtJztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHdoYXQgaXMgaW4gdGhlIGlucHV0IGZpZWxkIGlzIGEgc2F2ZWQgZW50cnkga2V5XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBjYW4gYmUgYSBzdWNreSBsaW5lIG9mIGNvZGUgYmVjYXVzZSBpdCBjYW4gd2lwZSBvdXQgdW5zYXZlZCBkYXRhLCBidXQgaSBjYW5ub3QgdGhpbmsgb2YgYmV0dGVyIHdheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcGxhY2UgdGhlIHRleHQgYXJlYSBjb250ZW50cyB3aXRoIHdoYXQgdGhlIHZhbHVlIGlzIGluIHRoZSBtYXRjaGVkIHBhaXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGlzIG5vdyBleGFjdCBtYXRjaCB0byBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gc2hvdyBpdHMgYSBzYXZlZCBjb21ib1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCBhIHJlZ2lzdGVyZWQga2V5IG5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgdGhlIHNhdmUgYnV0dG9uIHRvIGJlIGFuIHVuc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGNhbm5vdCBiZSBzYXZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgZGVsZXRlZCBvdXQgb2YgdGV4dGFyZWFcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnaW5wdXQnLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBpbnB1dCBmaWVsZCBpcyBibGFua1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9pZiBpbnB1dCBmaWVsZCBoYXMgdGV4dCBpbiBpdFxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV0gJiZcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV1cclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBhcyB5ZWxsb3cgZm9yIGVkaXR0ZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdZZWxsb3cnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIGEgbWF0Y2ggYW5kIHRoZSBkYXRhIGlzIGEgbWF0Y2ggdGhlbiB3ZSBoYXZlIGEgMTAwJSBzYXZlZCBlbnRyeSBhbmQgY2FuIHB1dCBldmVyeXRoaW5nIGJhY2sgdG8gc2F2ZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV0gJiZcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9PT1cclxuICAgICAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV1cclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBncmVlbiBmb3Igc2F2ZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIG5vdCBmb3VuZCBpbiB0aGUgc2F2ZWQgbGlzdCwgb3JhbmdlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2FkZCB0aGUgY29tYm9ib3ggYW5kIHRleHQgYXJlYSBlbGVtZW50cyB0byB0aGUgZm9vdGVyXHJcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKGNvbWJvQm94RGl2KTtcclxuICAgICAgICBzaG91dEZvb3QuYXBwZW5kQ2hpbGQocXVpY2tTaG91dFRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLyoqXHJcbiAqICNCUk9XU0UgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgU25hdGNoZWQgdG9ycmVudHMgdG8gYmUgaGlkZGVuL3Nob3duXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVTbmF0Y2hlZCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU25hdGNoZWQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gaGlkZS9zaG93IHJlc3VsdHMgdGhhdCB5b3UndmUgc25hdGNoZWRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfaXNWaXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9zbmF0Y2hlZEhvb2s6IHN0cmluZyA9ICd0ZCBkaXZbY2xhc3NePVwiYnJvd3NlXCJdJztcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgdG9nZ2xlOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PjtcclxuICAgICAgICBsZXQgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PjtcclxuICAgICAgICBjb25zdCBzdG9yZWRTdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChzdG9yZWRTdGF0ZSA9PT0gJ2ZhbHNlJyAmJiBHTV9nZXRWYWx1ZSgnc3RpY2t5U25hdGNoZWRUb2dnbGUnKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0b2dnbGVUZXh0OiBzdHJpbmcgPSB0aGlzLl9pc1Zpc2libGUgPyAnSGlkZSBTbmF0Y2hlZCcgOiAnU2hvdyBTbmF0Y2hlZCc7XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICh0b2dnbGUgPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdzbmF0Y2hlZFRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVUZXh0LFxyXG4gICAgICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdG9nZ2xlXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBiYXNlZCBvbiB2aXMgc3RhdGVcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNWaXNpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ1Nob3cgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXN1bHRMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFRvZ2dsZSBTbmF0Y2hlZCBidXR0b24hJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIGxpc3QgYSBzZWFyY2ggcmVzdWx0cyBsaXN0XHJcbiAgICAgKiBAcGFyYW0gc3ViVGFyIHRoZSBlbGVtZW50cyB0aGF0IG11c3QgYmUgY29udGFpbmVkIGluIG91ciBmaWx0ZXJlZCByZXN1bHRzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ZpbHRlclJlc3VsdHMobGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Piwgc3ViVGFyOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBsaXN0LmZvckVhY2goKHNuYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidG46IEhUTUxIZWFkaW5nRWxlbWVudCA9IDxIVE1MSGVhZGluZ0VsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3NuYXRjaGVkVG9nZ2xlJykhXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBTZWxlY3Qgb25seSB0aGUgaXRlbXMgdGhhdCBtYXRjaCBvdXIgc3ViIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc25hdGNoLnF1ZXJ5U2VsZWN0b3Ioc3ViVGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhpZGUvc2hvdyBhcyByZXF1aXJlZFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ1Nob3cgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXRjaC5zdHlsZS5kaXNwbGF5ID0gJ3RhYmxlLXJvdyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRWaXNTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NuYXRjaCB2aXMgc3RhdGU6JywgdGhpcy5faXNWaXNpYmxlLCAnXFxudmFsOicsIHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEdNX3NldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYCwgYCR7dmFsfWApO1xyXG4gICAgICAgIHRoaXMuX2lzVmlzaWJsZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNlYXJjaExpc3QoKTogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXJjaGxpc3QgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWFyY2hMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2aXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc1Zpc2libGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZpc2libGUodmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbWVtYmVycyB0aGUgc3RhdGUgb2YgVG9nZ2xlU25hdGNoZWQgYmV0d2VlbiBwYWdlIGxvYWRzXHJcbiAqL1xyXG5jbGFzcyBTdGlja3lTbmF0Y2hlZFRvZ2dsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc3RpY2t5U25hdGNoZWRUb2dnbGUnLFxyXG4gICAgICAgIGRlc2M6IGBNYWtlIHRvZ2dsZSBzdGF0ZSBwZXJzaXN0IGJldHdlZW4gcGFnZSBsb2Fkc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBSZW1lbWJlcmVkIHNuYXRjaCB2aXNpYmlsaXR5IHN0YXRlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHNcclxuICovXHJcbmNsYXNzIFBsYWludGV4dFNlYXJjaCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0U2VhcmNoJyxcclxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyBhdCB0b3Agb2YgcGFnZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NzciBoMSc7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICk7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGxldCB0b2dnbGVCdG46IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCBjb3B5QnRuOiBIVE1MRWxlbWVudDtcclxuICAgICAgICBsZXQgcmVzdWx0TGlzdDogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PjtcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIHRvZ2dsZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICh0b2dnbGVCdG4gPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdwbGFpblRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICAnU2hvdyBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAnI3NzcicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ21wX3RvZ2dsZSBtcF9wbGFpbkJ0bidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgIChyZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvcHkgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdtcF9jb3B5IG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBwbGFpbnRleHQgYm94XHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGA8YnI+PHRleHRhcmVhIGNsYXNzPSdtcF9wbGFpbnRleHRTZWFyY2gnIHN0eWxlPSdkaXNwbGF5OiBub25lJz48L3RleHRhcmVhPmBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCBvcGVuIHN0YXRlXHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCB0b2dnbGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICB0b2dnbGVCdG5cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHRib3ggc2hvdWxkIGV4aXN0LCBidXQganVzdCBpbiBjYXNlLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ0hpZGUgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBPcGVuIFN0YXRlIHRvIHRydWUvZmFsc2UgaW50ZXJuYWxseSBhbmQgaW4gc2NyaXB0IHN0b3JhZ2VcclxuICAgICAqIEBwYXJhbSB2YWwgc3RyaW5naWZpZWQgYm9vbGVhblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zZXRPcGVuU3RhdGUodmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhbCA9ICdmYWxzZSc7XHJcbiAgICAgICAgfSAvLyBEZWZhdWx0IHZhbHVlXHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3RvZ2dsZVNuYXRjaGVkU3RhdGUnLCB2YWwpO1xyXG4gICAgICAgIHRoaXMuX2lzT3BlbiA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9wcm9jZXNzUmVzdWx0cyhcclxuICAgICAgICByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+XHJcbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXHJcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzZXJpZXNUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IHRoZSBpbXBvcnRhbnQgZGF0YSBmcm9tIGVhY2ggbm9kZVxyXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLmF1dGhvcidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcubmFycmF0b3InXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmF3VGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xyXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGxhc3Qgc2VyaWVzLCB0aGVuIHN0eWxlXHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcclxuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9ICdCWSAnO1xyXG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcclxuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9ICdGVCAnO1xyXG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3V0cDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzT3BlbigpOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNPcGVuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBpc09wZW4odmFsOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHZhbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgdGhlIHNlYXJjaCBmZWF0dXJlcyB0byBiZSBoaWRkZW4vc2hvd25cclxuICovXHJcbmNsYXNzIFRvZ2dsZVNlYXJjaGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlU2VhcmNoYm94JyxcclxuICAgICAgICBkZXNjOiBgQ29sbGFwc2UgdGhlIFNlYXJjaCBib3ggYW5kIG1ha2UgaXQgdG9nZ2xlYWJsZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclNlYXJjaENvbnRyb2wnO1xyXG4gICAgcHJpdmF0ZSBfaGVpZ2h0OiBzdHJpbmcgPSAnMjZweCc7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgPSAnZmFsc2UnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3Qgc2VhcmNoYm94OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgaWYgKHNlYXJjaGJveCkge1xyXG4gICAgICAgICAgICAvLyBBZGp1c3QgdGhlIHRpdGxlIHRvIG1ha2UgaXQgY2xlYXIgaXQgaXMgYSB0b2dnbGUgYnV0dG9uXHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBzZWFyY2hib3gucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcuYmxvY2tIZWFkQ29uIGg0J1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAodGl0bGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIEFkanVzdCB0ZXh0ICYgc3R5bGVcclxuICAgICAgICAgICAgICAgIHRpdGxlLmlubmVySFRNTCA9ICdUb2dnbGUgU2VhcmNoJztcclxuICAgICAgICAgICAgICAgIHRpdGxlLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgdGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdG9nZ2xlKHNlYXJjaGJveCEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3Qgc2V0IHVwIHRvZ2dsZSEgVGFyZ2V0IGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ29sbGFwc2UgdGhlIHNlYXJjaGJveFxyXG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoYm94LCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZTogYGhlaWdodDoke3RoaXMuX2hlaWdodH07b3ZlcmZsb3c6aGlkZGVuO2AsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBIaWRlIGV4dHJhIHRleHRcclxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMydcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgZ3VpZGVMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJyNtYWluQm9keSA+IGgzIH4gYSdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbikgbm90aWZpY2F0aW9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGlmIChndWlkZUxpbmspIGd1aWRlTGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29sbGFwc2VkIHRoZSBTZWFyY2ggYm94IScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBjb2xsYXBzZSBTZWFyY2ggYm94ISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfdG9nZ2xlKGVsZW06IEhUTUxEaXZFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlLmhlaWdodCA9ICd1bnNldCc7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9ICd0cnVlJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlLmhlaWdodCA9IHRoaXMuX2hlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ2ZhbHNlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnVG9nZ2xlZCBTZWFyY2ggYm94IScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogR2VuZXJhdGVzIGxpbmtlZCB0YWdzIGZyb20gdGhlIHNpdGUncyBwbGFpbnRleHQgdGFnIGZpZWxkXHJcbiAqL1xyXG5jbGFzcyBCdWlsZFRhZ3MgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2J1aWxkVGFncycsXHJcbiAgICAgICAgZGVzYzogYEdlbmVyYXRlIGNsaWNrYWJsZSBUYWdzIGF1dG9tYXRpY2FsbHlgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGxldCByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3NcclxuICAgICAgICByZXN1bHRzTGlzdFxyXG4gICAgICAgICAgICAudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEJ1aWx0IHRhZyBsaW5rcyEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzTGlzdC50aGVuKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSB0YWdzIGFnYWluXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEJ1aWx0IHRhZyBsaW5rcyEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ29kZSB0byBydW4gZm9yIGV2ZXJ5IHNlYXJjaCByZXN1bHRcclxuICAgICAqIEBwYXJhbSByZXMgQSBzZWFyY2ggcmVzdWx0IHJvd1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9wcm9jZXNzVGFnU3RyaW5nID0gKHJlczogSFRNTFRhYmxlUm93RWxlbWVudCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhZ2xpbmUgPSA8SFRNTFNwYW5FbGVtZW50PnJlcy5xdWVyeVNlbGVjdG9yKCcudG9yUm93RGVzYycpO1xyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAodGFnbGluZSk7XHJcblxyXG4gICAgICAgIC8vIEFzc3VtZSBicmFja2V0cyBjb250YWluIHRhZ3NcclxuICAgICAgICBsZXQgdGFnU3RyaW5nID0gdGFnbGluZS5pbm5lckhUTUwucmVwbGFjZSgvKD86XFxbfFxcXXxcXCh8XFwpfCQpL2dpLCAnLCcpO1xyXG4gICAgICAgIC8vIFJlbW92ZSBIVE1MIEVudGl0aWVzIGFuZCB0dXJuIHRoZW0gaW50byBicmVha3NcclxuICAgICAgICB0YWdTdHJpbmcgPSB0YWdTdHJpbmcuc3BsaXQoLyg/OiYuezEsNX07KS9nKS5qb2luKCc7Jyk7XHJcbiAgICAgICAgLy8gU3BsaXQgdGFncyBhdCAnLCcgYW5kICc7JyBhbmQgJz4nIGFuZCAnfCdcclxuICAgICAgICBsZXQgdGFncyA9IHRhZ1N0cmluZy5zcGxpdCgvXFxzKig/Ojt8LHw+fFxcfHwkKVxccyovKTtcclxuICAgICAgICAvLyBSZW1vdmUgZW1wdHkgb3IgbG9uZyB0YWdzXHJcbiAgICAgICAgdGFncyA9IHRhZ3MuZmlsdGVyKCh0YWcpID0+IHRhZy5sZW5ndGggPD0gMzAgJiYgdGFnLmxlbmd0aCA+IDApO1xyXG4gICAgICAgIC8vIEFyZSB0YWdzIGFscmVhZHkgYWRkZWQ/IE9ubHkgYWRkIGlmIG51bGxcclxuICAgICAgICBjb25zdCB0YWdCb3g6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSByZXMucXVlcnlTZWxlY3RvcignLm1wX3RhZ3MnKTtcclxuICAgICAgICBpZiAodGFnQm94ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luamVjdExpbmtzKHRhZ3MsIHRhZ2xpbmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhZ3MpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICogSW5qZWN0cyB0aGUgZ2VuZXJhdGVkIHRhZ3NcclxuICAgICAqIEBwYXJhbSB0YWdzIEFycmF5IG9mIHRhZ3MgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzZWFyY2ggcmVzdWx0IHJvdyB0aGF0IHRoZSB0YWdzIHdpbGwgYmUgYWRkZWQgdG9cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaW5qZWN0TGlua3MgPSAodGFnczogc3RyaW5nW10sIHRhcjogSFRNTFNwYW5FbGVtZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKHRhZ3MubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAvLyBJbnNlcnQgdGhlIG5ldyB0YWcgcm93XHJcbiAgICAgICAgICAgIGNvbnN0IHRhZ1JvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgdGFnUm93LmNsYXNzTGlzdC5hZGQoJ21wX3RhZ3MnKTtcclxuICAgICAgICAgICAgdGFyLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCB0YWdSb3cpO1xyXG4gICAgICAgICAgICB0YXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGFnUm93Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICAgICAgLy8gQWRkIHRoZSB0YWdzIHRvIHRoZSB0YWcgcm93XHJcbiAgICAgICAgICAgIHRhZ3MuZm9yRWFjaCgodGFnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YWdSb3cuaW5uZXJIVE1MICs9IGA8YSBjbGFzcz0nbXBfdGFnJyBocmVmPScvdG9yL2Jyb3dzZS5waHA/dG9yJTVCdGV4dCU1RD0lMjIke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgICAgICB0YWdcclxuICAgICAgICAgICAgICAgICl9JTIyJnRvciU1QnNyY2hJbiU1RCU1QnRhZ3MlNUQ9dHJ1ZSc+JHt0YWd9PC9hPmA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmFuZG9tIEJvb2sgZmVhdHVyZSB0byBvcGVuIGEgbmV3IHRhYi93aW5kb3cgd2l0aCBhIHJhbmRvbSBNQU0gQm9va1xyXG4gKi9cclxuY2xhc3MgUmFuZG9tQm9vayBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmFuZG9tQm9vaycsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBvcGVuIGEgcmFuZG9tbHkgc2VsZWN0ZWQgYm9vayBwYWdlLiAoPGVtPlVzZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjYXRlZ29yeSBpbiB0aGUgZHJvcGRvd248L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IHJhbmRvOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBjb25zdCByYW5kb1RleHQ6IHN0cmluZyA9ICdSYW5kb20gQm9vayc7XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSBidXR0b24gYW5kIGdldHRpbmcgdGhlIHJlc3VsdHNcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChyYW5kbyA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3JhbmRvbUJvb2snLFxyXG4gICAgICAgICAgICAgICAgcmFuZG9UZXh0LFxyXG4gICAgICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgICAgICcjcmVzZXROZXdJY29uJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcclxuICAgICAgICAgICAgKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHJhbmRvXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY291bnRSZXN1bHQ6IFByb21pc2U8bnVtYmVyPjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNhdGVnb3JpZXM6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgQ2F0ZWdvcnkgZHJvcGRvd24gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRTZWxlY3Rpb246IEhUTUxTZWxlY3RFbGVtZW50ID0gPEhUTUxTZWxlY3RFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXRlZ29yeVBhcnRpYWwnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdmFsdWUgY3VycmVudGx5IHNlbGVjdGVkIGluIENhdGVnb3J5IERyb3Bkb3duXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdFZhbHVlOiBzdHJpbmcgPSBjYXRTZWxlY3Rpb24hLm9wdGlvbnNbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRTZWxlY3Rpb24uc2VsZWN0ZWRJbmRleFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2RlcGVuZGluZyBvbiBjYXRlZ29yeSBzZWxlY3RlZCwgY3JlYXRlIGEgY2F0ZWdvcnkgc3RyaW5nIGZvciB0aGUgSlNPTiBHRVRcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChTdHJpbmcoY2F0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBTEwnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlZmF1bHRzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xMyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTUnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtMTYnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvclttYWluX2NhdF1bXT0xNic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRWYWx1ZS5jaGFyQXQoMCkgPT09ICdjJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbY2F0XVtdPScgKyBjYXRWYWx1ZS5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb3VudFJlc3VsdCA9IHRoaXMuX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdGVnb3JpZXMpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50UmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoZ2V0UmFuZG9tUmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vcGVuIG5ldyB0YWIgd2l0aCB0aGUgcmFuZG9tIGJvb2tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdC8nICsgZ2V0UmFuZG9tUmVzdWx0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnX2JsYW5rJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgUmFuZG9tIEJvb2sgYnV0dG9uIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsdGVycyBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICogQHBhcmFtIGNhdCBhIHN0cmluZyBjb250YWluaW5nIHRoZSBjYXRlZ29yaWVzIG5lZWRlZCBmb3IgSlNPTiBHZXRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBfZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0OiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBqc29uUmVzdWx0OiBQcm9taXNlPHN0cmluZz47XHJcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvdG9yL2pzL2xvYWRTZWFyY2hKU09OYmFzaWMucGhwP3RvcltzZWFyY2hUeXBlXT1hbGwmdG9yW3NlYXJjaEluXT10b3JyZW50cyR7Y2F0fSZ0b3JbcGVycGFnZV09NSZ0b3JbYnJvd3NlRmxhZ3NIaWRlVnNTaG93XT0wJnRvcltzdGFydERhdGVdPSZ0b3JbZW5kRGF0ZV09JnRvcltoYXNoXT0mdG9yW3NvcnRUeXBlXT1yYW5kb20mdGh1bWJuYWlsPXRydWU/JHtVdGlsLnJhbmRvbU51bWJlcihcclxuICAgICAgICAgICAgICAgIDEsXHJcbiAgICAgICAgICAgICAgICAxMDAwMDBcclxuICAgICAgICAgICAgKX1gO1xyXG4gICAgICAgICAgICBQcm9taXNlLmFsbChbKGpzb25SZXN1bHQgPSBVdGlsLmdldEpTT04odXJsKSldKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGpzb25SZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoanNvbkZ1bGwpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXR1cm4gdGhlIGZpcnN0IHRvcnJlbnQgSUQgb2YgdGhlIHJhbmRvbSBKU09OIHRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGpzb25GdWxsKS5kYXRhWzBdLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjIFJFUVVFU1QgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuLyoqXHJcbiAqICogSGlkZSByZXF1ZXN0ZXJzIHdobyBhcmUgc2V0IHRvIFwiaGlkZGVuXCJcclxuICovXHJcbmNsYXNzIFRvZ2dsZUhpZGRlblJlcXVlc3RlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlSGlkZGVuUmVxdWVzdGVycycsXHJcbiAgICAgICAgZGVzYzogYEhpZGUgaGlkZGVuIHJlcXVlc3RlcnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JSb3dzJztcclxuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9oaWRlID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3RzJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5fYWRkVG9nZ2xlU3dpdGNoKCk7XHJcbiAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcclxuXHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKHRoaXMuX3RhciwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gYXdhaXQgdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyh0aGlzLl9zZWFyY2hMaXN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9hZGRUb2dnbGVTd2l0Y2goKSB7XHJcbiAgICAgICAgLy8gTWFrZSBhIG5ldyBidXR0b24gYW5kIGluc2VydCBiZXNpZGUgdGhlIFNlYXJjaCBidXR0b25cclxuICAgICAgICBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ3Nob3dIaWRkZW4nLFxyXG4gICAgICAgICAgICAnU2hvdyBIaWRkZW4nLFxyXG4gICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgJyNyZXF1ZXN0U2VhcmNoIC50b3JyZW50U2VhcmNoJyxcclxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIG5ldyBidXR0b24gYW5kIGFkZCBhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgY29uc3QgdG9nZ2xlU3dpdGNoOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zaG93SGlkZGVuJylcclxuICAgICAgICApO1xyXG4gICAgICAgIHRvZ2dsZVN3aXRjaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaGlkZGVuTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnI3RvclJvd3MgPiAubXBfaGlkZGVuJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSAnSGlkZSBIaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuTGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ2xpc3QtaXRlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5vcGFjaXR5ID0gJzAuNSc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdG9nZ2xlU3dpdGNoLmlubmVyVGV4dCA9ICdTaG93IEhpZGRlbic7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSZXF1ZXN0TGlzdCgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVxdWVzdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyN0b3JSb3dzIC50b3JSb3cgLnRvclJpZ2h0JykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBHcmFiIGFsbCByZXF1ZXN0c1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVxTGlzdDpcclxuICAgICAgICAgICAgICAgICAgICB8IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD5cclxuICAgICAgICAgICAgICAgICAgICB8IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB8IHVuZGVmaW5lZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAgICAgJyN0b3JSb3dzIC50b3JSb3cnXHJcbiAgICAgICAgICAgICAgICApIGFzIE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD47XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlcUxpc3QgPT09IG51bGwgfHwgcmVxTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGByZXFMaXN0IGlzICR7cmVxTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXFMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZmlsdGVyUmVzdWx0cyhsaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+KSB7XHJcbiAgICAgICAgbGlzdC5mb3JFYWNoKChyZXF1ZXN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RlcjogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gcmVxdWVzdC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJy50b3JSaWdodCBhJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAocmVxdWVzdGVyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZSBhIHBsYWludGV4dCBsaXN0IG9mIHJlcXVlc3QgcmVzdWx0c1xyXG4gKi9cclxuY2xhc3MgUGxhaW50ZXh0UmVxdWVzdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwbGFpbnRleHRSZXF1ZXN0JyxcclxuICAgICAgICBkZXNjOiBgSW5zZXJ0IHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMgYXQgdG9wIG9mIHJlcXVlc3QgcGFnZWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9pc09wZW46ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICk7XHJcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdHMnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgY29weUJ0bjogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj47XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSB0b2dnbGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgJyNzc3InLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cclxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICAgICAncGxhaW5Db3B5JyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCBvcGVuIHN0YXRlXHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCB0b2dnbGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICB0b2dnbGVCdG5cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHRib3ggc2hvdWxkIGV4aXN0LCBidXQganVzdCBpbiBjYXNlLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ0hpZGUgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXHJcbiAgICAgKiBAcGFyYW0gdmFsIHN0cmluZ2lmaWVkIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xyXG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxyXG4gICAgICAgIEdNX3NldFZhbHVlKCd0b2dnbGVTbmF0Y2hlZFN0YXRlJywgdmFsKTtcclxuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pik6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcclxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXHJcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xyXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xyXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XHJcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0ID0gKCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3QgcmVzdWx0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyBhJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHJlcXVlc3QgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IDxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yUm93cyAudG9yUm93JylcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc25hdGNoTGlzdCA9PT0gbnVsbCB8fCBzbmF0Y2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNuYXRjaExpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBHb29kcmVhZHNCdXR0b25SZXEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvblJlcScsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyBmb3IgcmVxdWVzdHMnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNmaWxsVG9ycmVudCc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdHMnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5Sl8J+UpfCflKXwn5Sl8J+UpfCflKUnKTtcclxuXHJcbiAgICAgICAgLyogY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcclxuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XHJcbiAgICAgICAgbGV0IGF1dGhvcnMgPSAnJzsgKi9cclxuICAgICAgICBjb25zdCByZXFSb3dzID0gVXRpbC5yb3dzVG9PYmooZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndG9yRGV0TWFpbkNvbiBkaXYnKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2cocmVxUm93cyk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoKTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogVkFVTFQgRkVBVFVSRVNcclxuICovXHJcblxyXG5jbGFzcyBTaW1wbGVWYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzaW1wbGVWYXVsdCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ1NpbXBsaWZ5IHRoZSBWYXVsdCBwYWdlcy4gKDxlbT5UaGlzIHJlbW92ZXMgZXZlcnl0aGluZyBleGNlcHQgdGhlIGRvbmF0ZSBidXR0b24gJmFtcDsgbGlzdCBvZiByZWNlbnQgZG9uYXRpb25zPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbkJvZHknO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndmF1bHQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzdWJQYWdlOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBjb25zdCBwYWdlID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zb2xlLmdyb3VwKGBBcHBseWluZyBWYXVsdCAoJHtzdWJQYWdlfSkgc2V0dGluZ3MuLi5gKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcclxuICAgICAgICBjb25zdCBkb25hdGVCdG46IEhUTUxGb3JtRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcclxuICAgICAgICBjb25zdCBkb25hdGVUYmw6IEhUTUxUYWJsZUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAndGFibGU6bGFzdC1vZi10eXBlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgYnV0dG9uIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgIGlmIChkb25hdGVCdG4gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3RG9uYXRlOiBIVE1MRm9ybUVsZW1lbnQgPSA8SFRNTEZvcm1FbGVtZW50PmRvbmF0ZUJ0bi5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3RG9uYXRlKTtcclxuICAgICAgICAgICAgbmV3RG9uYXRlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYWdlLmlubmVySFRNTCA9ICc8aDE+Q29tZSBiYWNrIHRvbW9ycm93ITwvaDE+JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIHRhYmxlIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgIGlmIChkb25hdGVUYmwgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb25hdGVUYmwuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xyXG4gICAgICAgICAgICBuZXdUYWJsZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFnZS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzI1cHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaW1wbGlmaWVkIHRoZSB2YXVsdCBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICMgVVNFUiBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqICMjIyMgRGVmYXVsdCBVc2VyIEdpZnQgQW1vdW50XHJcbiAqL1xyXG5jbGFzcyBVc2VyR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnREZWZhdWx0JyxcclxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMDAsIG1heCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNib251c2dpZnQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIyBVc2VyIEdpZnQgSGlzdG9yeVxyXG4gKi9cclxuY2xhc3MgVXNlckdpZnRIaXN0b3J5IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdEhpc3RvcnknLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcclxuICAgICAgICBkZXNjOiAnRGlzcGxheSBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB5b3UgYW5kIGFub3RoZXIgdXNlcicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfc2VuZFN5bWJvbCA9IGA8c3BhbiBzdHlsZT0nY29sb3I6b3JhbmdlJz5cXHUyN0YwPC9zcGFuPmA7XHJcbiAgICBwcml2YXRlIF9nZXRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOnRlYWwnPlxcdTI3RjE8L3NwYW4+YDtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJ3Rib2R5JztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5pdGlhbGxpemluZyB1c2VyIGdpZnQgaGlzdG9yeS4uLicpO1xyXG5cclxuICAgICAgICAvLyBOYW1lIG9mIHRoZSBvdGhlciB1c2VyXHJcbiAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gaDEnKSEudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSByb3dcclxuICAgICAgICBjb25zdCBoaXN0b3J5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBjb25zdCBpbnNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgdGJvZHkgdHI6bGFzdC1vZi10eXBlJyk7XHJcbiAgICAgICAgaWYgKGluc2VydCkgaW5zZXJ0Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCBoaXN0b3J5Q29udGFpbmVyKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSB0aXRsZSBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgaGlzdG9yeVRpdGxlLmNsYXNzTGlzdC5hZGQoJ3Jvd2hlYWQnKTtcclxuICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnR2lmdCBoaXN0b3J5JztcclxuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlUaXRsZSk7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3RvcnkgY29udGVudCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgICAgIGhpc3RvcnlCb3guY2xhc3NMaXN0LmFkZCgncm93MScpO1xyXG4gICAgICAgIGhpc3RvcnlCb3gudGV4dENvbnRlbnQgPSBgWW91IGhhdmUgbm90IGV4Y2hhbmdlZCBnaWZ0cyB3aXRoICR7b3RoZXJVc2VyfS5gO1xyXG4gICAgICAgIGhpc3RvcnlCb3guYWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5Qm94KTtcclxuICAgICAgICAvLyBHZXQgdGhlIFVzZXIgSURcclxuICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcclxuICAgICAgICAvLyBUT0RPOiB1c2UgYGNkbi5gIGluc3RlYWQgb2YgYHd3dy5gOyBjdXJyZW50bHkgY2F1c2VzIGEgNDAzIGVycm9yXHJcbiAgICAgICAgaWYgKHVzZXJJRCkge1xyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGdpZnQgaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeSA9IGF3YWl0IFV0aWwuZ2V0VXNlckdpZnRIaXN0b3J5KHVzZXJJRCk7XHJcbiAgICAgICAgICAgIC8vIE9ubHkgZGlzcGxheSBhIGxpc3QgaWYgdGhlcmUgaXMgYSBoaXN0b3J5XHJcbiAgICAgICAgICAgIGlmIChnaWZ0SGlzdG9yeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBQb2ludCAmIEZMIHRvdGFsIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgW3BvaW50c0luLCBwb2ludHNPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0UG9pbnRzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBbd2VkZ2VJbiwgd2VkZ2VPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0V2VkZ2UnKTtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQb2ludHMgSW4vT3V0OiAke3BvaW50c0lufS8ke3BvaW50c091dH1gKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2VkZ2VzIEluL091dDogJHt3ZWRnZUlufS8ke3dlZGdlT3V0fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5Qm94LmlubmVySFRNTCA9IGBZb3UgaGF2ZSBzZW50ICR7dGhpcy5fc2VuZFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c091dH0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZU91dH0gRkwgd2VkZ2VzPC9zdHJvbmc+IHRvICR7b3RoZXJVc2VyfSBhbmQgcmVjZWl2ZWQgJHt0aGlzLl9nZXRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNJbn0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZUlufSBGTCB3ZWRnZXM8L3N0cm9uZz4uPGhyPmA7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG1lc3NhZ2UgdG8gdGhlIGJveFxyXG4gICAgICAgICAgICAgICAgaGlzdG9yeUJveC5hcHBlbmRDaGlsZCh0aGlzLl9zaG93R2lmdHMoZ2lmdEhpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFVzZXIgZ2lmdCBoaXN0b3J5IGFkZGVkIScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm8gdXNlciBnaWZ0IGhpc3RvcnkgZm91bmQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZXIgSUQgbm90IGZvdW5kOiAke3VzZXJJRH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFN1bSB0aGUgdmFsdWVzIG9mIGEgZ2l2ZW4gZ2lmdCB0eXBlIGFzIEluZmxvdyAmIE91dGZsb3cgc3Vtc1xyXG4gICAgICogQHBhcmFtIGhpc3RvcnkgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5XHJcbiAgICAgKiBAcGFyYW0gdHlwZSBwb2ludHMgb3Igd2VkZ2VzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3N1bUdpZnRzKFxyXG4gICAgICAgIGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdLFxyXG4gICAgICAgIHR5cGU6ICdnaWZ0UG9pbnRzJyB8ICdnaWZ0V2VkZ2UnXHJcbiAgICApOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBjb25zdCBvdXRmbG93ID0gWzBdO1xyXG4gICAgICAgIGNvbnN0IGluZmxvdyA9IFswXTtcclxuICAgICAgICAvLyBPbmx5IHJldHJpZXZlIGFtb3VudHMgb2YgYSBzcGVjaWZpZWQgZ2lmdCB0eXBlXHJcbiAgICAgICAgaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU3BsaXQgaW50byBJbmZsb3cvT3V0Zmxvd1xyXG4gICAgICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0Zmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFN1bSBhbGwgaXRlbXMgaW4gdGhlIGZpbHRlcmVkIGFycmF5XHJcbiAgICAgICAgY29uc3Qgc3VtT3V0ID0gb3V0Zmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICBjb25zdCBzdW1JbiA9IGluZmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICByZXR1cm4gW3N1bUluLCBNYXRoLmFicyhzdW1PdXQpXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgQ3JlYXRlcyBhIGxpc3Qgb2YgdGhlIG1vc3QgcmVjZW50IGdpZnRzXHJcbiAgICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgZnVsbCBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0d28gdXNlcnNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2hvd0dpZnRzKGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGdpZnQgd2FzIGEgd2VkZ2UsIHJldHVybiBjdXN0b20gdGV4dFxyXG4gICAgICAgIGNvbnN0IF93ZWRnZU9yUG9pbnRzID0gKGdpZnQ6IFVzZXJHaWZ0SGlzdG9yeSk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0UG9pbnRzJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke01hdGguYWJzKGdpZnQuYW1vdW50KX1gO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnKEZMKSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVycm9yOiB1bmtub3duIGdpZnQgdHlwZS4uLiAke2dpZnQudHlwZX06ICR7Z2lmdC5hbW91bnR9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgbGlzdCBmb3IgdGhlIGhpc3RvcnlcclxuICAgICAgICBjb25zdCBoaXN0b3J5TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5TGlzdC5zdHlsZSwge1xyXG4gICAgICAgICAgICBsaXN0U3R5bGU6ICdub25lJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJ2luaXRpYWwnLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMGVtJyxcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBMb29wIG92ZXIgaGlzdG9yeSBpdGVtcyBhbmQgYWRkIHRvIGFuIGFycmF5XHJcbiAgICAgICAgY29uc3QgZ2lmdHM6IHN0cmluZ1tdID0gaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgLy8gQWRkIHNvbWUgc3R5bGluZyBkZXBlbmRpbmcgb24gcG9zL25lZyBudW1iZXJzXHJcbiAgICAgICAgICAgIGxldCBmYW5jeUdpZnRBbW91bnQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fZ2V0U3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmYW5jeUdpZnRBbW91bnQgPSBgJHt0aGlzLl9zZW5kU3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgZGF0ZSByZWFkYWJsZVxyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gVXRpbC5wcmV0dHlTaXRlVGltZShnaWZ0LnRpbWVzdGFtcCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBgPGxpIGNsYXNzPSdtcF9naWZ0SXRlbSc+JHtkYXRlfSAke2ZhbmN5R2lmdEFtb3VudH08L2xpPmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gQWRkIGhpc3RvcnkgaXRlbXMgdG8gdGhlIGxpc3RcclxuICAgICAgICBoaXN0b3J5TGlzdC5pbm5lckhUTUwgPSBnaWZ0cy5qb2luKCcnKTtcclxuICAgICAgICByZXR1cm4gaGlzdG9yeUxpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogUExBQ0UgQUxMIE0rIEZFQVRVUkVTIEhFUkVcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqXHJcbiAqIE5lYXJseSBhbGwgZmVhdHVyZXMgYmVsb25nIGhlcmUsIGFzIHRoZXkgc2hvdWxkIGhhdmUgaW50ZXJuYWwgY2hlY2tzXHJcbiAqIGZvciBET00gZWxlbWVudHMgYXMgbmVlZGVkLiBPbmx5IGNvcmUgZmVhdHVyZXMgc2hvdWxkIGJlIHBsYWNlZCBpbiBgYXBwLnRzYFxyXG4gKlxyXG4gKiBUaGlzIGRldGVybWluZXMgdGhlIG9yZGVyIGluIHdoaWNoIHNldHRpbmdzIHdpbGwgYmUgZ2VuZXJhdGVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlLlxyXG4gKiBTZXR0aW5ncyB3aWxsIGJlIGdyb3VwZWQgYnkgdHlwZSBhbmQgRmVhdHVyZXMgb2Ygb25lIHR5cGUgdGhhdCBhcmUgY2FsbGVkIGJlZm9yZVxyXG4gKiBvdGhlciBGZWF0dXJlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgYXBwZWFyIGZpcnN0LlxyXG4gKlxyXG4gKiBUaGUgb3JkZXIgb2YgdGhlIGZlYXR1cmUgZ3JvdXBzIGlzIG5vdCBkZXRlcm1pbmVkIGhlcmUuXHJcbiAqL1xyXG5jbGFzcyBJbml0RmVhdHVyZXMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBHbG9iYWwgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEhpZGVIb21lKCk7XHJcbiAgICAgICAgbmV3IEhpZGVTZWVkYm94KCk7XHJcbiAgICAgICAgbmV3IEJsdXJyZWRIZWFkZXIoKTtcclxuICAgICAgICBuZXcgVmF1bHRMaW5rKCk7XHJcbiAgICAgICAgbmV3IE1pbmlWYXVsdEluZm8oKTtcclxuICAgICAgICBuZXcgQm9udXNQb2ludERlbHRhKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgSG9tZSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBIaWRlTmV3cygpO1xyXG4gICAgICAgIG5ldyBHaWZ0TmV3ZXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2VhcmNoIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFRvZ2dsZVNuYXRjaGVkKCk7XHJcbiAgICAgICAgbmV3IFN0aWNreVNuYXRjaGVkVG9nZ2xlKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFNlYXJjaCgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVTZWFyY2hib3goKTtcclxuICAgICAgICBuZXcgQnVpbGRUYWdzKCk7XHJcbiAgICAgICAgbmV3IFJhbmRvbUJvb2soKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBSZXF1ZXN0IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvblJlcSgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFJlcXVlc3QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUb3JyZW50IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvbigpO1xyXG4gICAgICAgIG5ldyBDdXJyZW50bHlSZWFkaW5nKCk7XHJcbiAgICAgICAgbmV3IFRvckdpZnREZWZhdWx0KCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdCgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMSgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMigpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMygpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RNaW4oKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBTaG91dGJveCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgUHJpb3JpdHlVc2VycygpO1xyXG4gICAgICAgIG5ldyBQcmlvcml0eVN0eWxlKCk7XHJcbiAgICAgICAgbmV3IE11dGVkVXNlcnMoKTtcclxuICAgICAgICBuZXcgUmVwbHlTaW1wbGUoKTtcclxuICAgICAgICBuZXcgUmVwbHlRdW90ZSgpO1xyXG4gICAgICAgIG5ldyBHaWZ0QnV0dG9uKCk7XHJcbiAgICAgICAgbmV3IFF1aWNrU2hvdXQoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBWYXVsdCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgU2ltcGxlVmF1bHQoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVc2VyIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFVzZXJHaWZ0RGVmYXVsdCgpO1xyXG4gICAgICAgIG5ldyBVc2VyR2lmdEhpc3RvcnkoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBGb3J1bSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBGb3J1bUZMR2lmdCgpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9jb3JlLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBDbGFzcyBmb3IgaGFuZGxpbmcgc2V0dGluZ3MgYW5kIHRoZSBQcmVmZXJlbmNlcyBwYWdlXHJcbiAqIEBtZXRob2QgaW5pdDogdHVybnMgZmVhdHVyZXMnIHNldHRpbmdzIGluZm8gaW50byBhIHVzZWFibGUgdGFibGVcclxuICovXHJcbmNsYXNzIFNldHRpbmdzIHtcclxuICAgIC8vIEZ1bmN0aW9uIGZvciBnYXRoZXJpbmcgdGhlIG5lZWRlZCBzY29wZXNcclxuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTY29wZXMoc2V0dGluZ3M6IEFueUZlYXR1cmVbXSk6IFByb21pc2U8U2V0dGluZ0dsb2JPYmplY3Q+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ19nZXRTY29wZXMoJywgc2V0dGluZ3MsICcpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzY29wZUxpc3Q6IFNldHRpbmdHbG9iT2JqZWN0ID0ge307XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2V0dGluZyBvZiBzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IE51bWJlcihzZXR0aW5nLnNjb3BlKTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBTY29wZSBleGlzdHMsIHB1c2ggdGhlIHNldHRpbmdzIGludG8gdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGVMaXN0W2luZGV4XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0ucHVzaChzZXR0aW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGNyZWF0ZSB0aGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVMaXN0W2luZGV4XSA9IFtzZXR0aW5nXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNvbHZlKHNjb3BlTGlzdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gZm9yIGNvbnN0cnVjdGluZyB0aGUgdGFibGUgZnJvbSBhbiBvYmplY3RcclxuICAgIHByaXZhdGUgc3RhdGljIF9idWlsZFRhYmxlKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdfYnVpbGRUYWJsZSgnLCBwYWdlLCAnKScpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3V0cCA9IGA8dGJvZHk+PHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxicj48c3Ryb25nPk1BTSsgdiR7TVAuVkVSU0lPTn08L3N0cm9uZz4gLSBIZXJlIHlvdSBjYW4gZW5hYmxlICZhbXA7IGRpc2FibGUgYW55IGZlYXR1cmUgZnJvbSB0aGUgPGEgaHJlZj1cIi9mL3QvNDE4NjNcIj5NQU0rIHVzZXJzY3JpcHQ8L2E+ISBIb3dldmVyLCB0aGVzZSBzZXR0aW5ncyBhcmUgPHN0cm9uZz5OT1Q8L3N0cm9uZz4gc3RvcmVkIG9uIE1BTTsgdGhleSBhcmUgc3RvcmVkIHdpdGhpbiB0aGUgVGFtcGVybW9ua2V5L0dyZWFzZW1vbmtleSBleHRlbnNpb24gaW4geW91ciBicm93c2VyLCBhbmQgbXVzdCBiZSBjdXN0b21pemVkIG9uIGVhY2ggb2YgeW91ciBicm93c2Vycy9kZXZpY2VzIHNlcGFyYXRlbHkuPGJyPjxicj5Gb3IgYSBkZXRhaWxlZCBsb29rIGF0IHRoZSBhdmFpbGFibGUgZmVhdHVyZXMsIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvd2lraS9GZWF0dXJlLU92ZXJ2aWV3XCI+Y2hlY2sgdGhlIFdpa2khPC9hPjxicj48YnI+PC90ZD48L3RyPmA7XHJcblxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcGVOdW06IG51bWJlciA9IE51bWJlcihzY29wZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIHNlY3Rpb24gdGl0bGVcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gYDx0cj48dGQgY2xhc3M9J3JvdzInPiR7U2V0dGluZ0dyb3VwW3Njb3BlTnVtXX08L3RkPjx0ZCBjbGFzcz0ncm93MSc+YDtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgaW5wdXQgZmllbGQgYmFzZWQgb24gdGhlIHNldHRpbmdcclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2Vbc2NvcGVOdW1dKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ051bWJlcjogbnVtYmVyID0gTnVtYmVyKHNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW06IEFueUZlYXR1cmUgPSBwYWdlW3Njb3BlTnVtXVtzZXR0aW5nTnVtYmVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8aW5wdXQgdHlwZT0nY2hlY2tib3gnIGlkPScke2l0ZW0udGl0bGV9JyB2YWx1ZT0ndHJ1ZSc+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPGlucHV0IHR5cGU9J3RleHQnIGlkPScke2l0ZW0udGl0bGV9JyBwbGFjZWhvbGRlcj0nJHtpdGVtLnBsYWNlaG9sZGVyfScgY2xhc3M9J21wX3RleHRJbnB1dCcgc2l6ZT0nMjUnPiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8c2VsZWN0IGlkPScke2l0ZW0udGl0bGV9JyBjbGFzcz0nbXBfZHJvcElucHV0Jz5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGl0ZW0ub3B0aW9ucykuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxvcHRpb24gdmFsdWU9JyR7a2V5fSc+JHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3B0aW9ucyFba2V5XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC9vcHRpb24+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDwvc2VsZWN0PiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSkgY2FzZXNbaXRlbS50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgcm93XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICc8L3RkPjwvdHI+JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2F2ZSBidXR0b24gJiBsYXN0IHBhcnQgb2YgdGhlIHRhYmxlXHJcbiAgICAgICAgICAgIG91dHAgKz1cclxuICAgICAgICAgICAgICAgICc8dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGRpdiBpZD1cIm1wX3N1Ym1pdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlNhdmUgTSsgU2V0dGluZ3M/PzwvZGl2PjxkaXYgaWQ9XCJtcF9jb3B5XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+Q29weSBTZXR0aW5nczwvZGl2PjxkaXYgaWQ9XCJtcF9pbmplY3RcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5QYXN0ZSBTZXR0aW5nczwvZGl2PjxzcGFuIGNsYXNzPVwibXBfc2F2ZXN0YXRlXCIgc3R5bGU9XCJvcGFjaXR5OjBcIj5TYXZlZCE8L3NwYW4+PC90ZD48L3RyPjwvdGJvZHk+JztcclxuXHJcbiAgICAgICAgICAgIHJlc29sdmUob3V0cCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgc2V0dGluZ3MgdmFsdWVzXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0U2V0dGluZ3MocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICAvLyBVdGlsLnB1cmdlU2V0dGluZ3MoKTtcclxuICAgICAgICBjb25zdCBhbGxWYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNldHRpbmdzKCcsIHBhZ2UsICcpXFxuU3RvcmVkIEdNIGtleXM6JywgYWxsVmFsdWVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZVtOdW1iZXIoc2NvcGUpXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IHBhZ2VbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1ByZWY6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZi50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgU2V0OicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9YCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IFZhbHVlOicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUocHJlZi50aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSAmJiBHTV9nZXRWYWx1ZShwcmVmLnRpdGxlKSkgY2FzZXNbcHJlZi50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfc2V0U2V0dGluZ3Mob2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYF9zZXRTZXR0aW5ncyhgLCBvYmosICcpJyk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmpbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWYgPSBvYmpbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLmNoZWNrZWQpIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnA6IHN0cmluZyA9IGVsZW0udmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgLCBpbnApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgZWxlbS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSkgY2FzZXNbcHJlZi50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZlZCEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY29weVNldHRpbmdzKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgZ21MaXN0ID0gR01fbGlzdFZhbHVlcygpO1xyXG4gICAgICAgIGNvbnN0IG91dHA6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtdO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHN0b3JlZCBzZXR0aW5ncyBhbmQgcHVzaCB0byBvdXRwdXQgYXJyYXlcclxuICAgICAgICBnbUxpc3QubWFwKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IGV4cG9ydCBtcF8gc2V0dGluZ3MgYXMgdGhleSBzaG91bGQgb25seSBiZSBzZXQgYXQgcnVudGltZVxyXG4gICAgICAgICAgICBpZiAoc2V0dGluZy5pbmRleE9mKCdtcF8nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgIG91dHAucHVzaChbc2V0dGluZywgR01fZ2V0VmFsdWUoc2V0dGluZyldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0cCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3Bhc3RlU2V0dGluZ3MocGF5bG9hZDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfcGFzdGVTZXR0aW5ncyggKWApO1xyXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShwYXlsb2FkKTtcclxuICAgICAgICBzZXR0aW5ncy5mb3JFYWNoKCh0dXBsZTogW3N0cmluZywgc3RyaW5nXVtdKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0dXBsZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7dHVwbGVbMF19YCwgYCR7dHVwbGVbMV19YCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHR1cGxlWzBdLCAnOiAnLCB0dXBsZVsxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiB0aGF0IHNhdmVzIHRoZSB2YWx1ZXMgb2YgdGhlIHNldHRpbmdzIHRhYmxlXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfc2F2ZVNldHRpbmdzKHRpbWVyOiBudW1iZXIsIG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9zYXZlU2V0dGluZ3MoKWApO1xyXG5cclxuICAgICAgICBjb25zdCBzYXZlc3RhdGU6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLm1wX3NhdmVzdGF0ZScpIVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aW1lciAmIG1lc3NhZ2VcclxuICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2F2aW5nLi4uJyk7XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgdmFsdWVzIHN0b3JlZCBpbiBHTSBhbmQgcmVzZXQgZXZlcnl0aGluZ1xyXG4gICAgICAgIGZvciAoY29uc3QgZmVhdHVyZSBpbiBnbVZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGdtVmFsdWVzW2ZlYXR1cmVdICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGxvb3Agb3ZlciB2YWx1ZXMgdGhhdCBhcmUgZmVhdHVyZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgaWYgKCFbJ21wX3ZlcnNpb24nLCAnc3R5bGVfdGhlbWUnXS5pbmNsdWRlcyhnbVZhbHVlc1tmZWF0dXJlXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIG5vdCBwYXJ0IG9mIHByZWZlcmVuY2VzIHBhZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ21WYWx1ZXNbZmVhdHVyZV0uaW5kZXhPZignbXBfJykgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoZ21WYWx1ZXNbZmVhdHVyZV0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNhdmUgdGhlIHNldHRpbmdzIHRvIEdNIHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3NldFNldHRpbmdzKG9iaik7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbmZpcm1hdGlvbiBtZXNzYWdlXHJcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICAgICAgfSwgMjM0NSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyB0aGUgc2V0dGluZ3MgcGFnZS5cclxuICAgICAqIEBwYXJhbSByZXN1bHQgVmFsdWUgdGhhdCBtdXN0IGJlIHBhc3NlZCBkb3duIGZyb20gYENoZWNrLnBhZ2UoJ3NldHRpbmdzJylgXHJcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRvIHByb3ZpZGUgc2V0dGluZ3MgZm9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgaW5pdChyZXN1bHQ6IGJvb2xlYW4sIHNldHRpbmdzOiBBbnlGZWF0dXJlW10pIHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgb25seSBydW4gaWYgYENoZWNrLnBhZ2UoJ3NldHRpbmdzKWAgcmV0dXJucyB0cnVlICYgaXMgcGFzc2VkIGhlcmVcclxuICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChgbmV3IFNldHRpbmdzKClgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyB0YWJsZSBoYXMgbG9hZGVkXHJcbiAgICAgICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcjbWFpbkJvZHkgPiB0YWJsZScpLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFtNK10gU3RhcnRpbmcgdG8gYnVpbGQgU2V0dGluZ3MgdGFibGUuLi5gKTtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgdGFibGUgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOYXY6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgPiB0YWJsZScpITtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUaXRsZTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZVNjb3BlOiBTZXR0aW5nR2xvYk9iamVjdDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGFibGUgZWxlbWVudHMgYWZ0ZXIgdGhlIFByZWYgbmF2YmFyXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nTmF2Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNldHRpbmdUYWJsZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnY29sdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGxzcGFjaW5nOiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICd3aWR0aDoxMDAlO21pbi13aWR0aDoxMDAlO21heC13aWR0aDoxMDAlOycsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdUaXRsZS5pbm5lckhUTUwgPSAnTUFNKyBTZXR0aW5ncyc7XHJcbiAgICAgICAgICAgICAgICAvLyBHcm91cCBzZXR0aW5ncyBieSBwYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9nZXRTY29wZXMoc2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgdGFibGUgSFRNTCBmcm9tIGZlYXR1cmUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VTY29wZSA9IHNjb3BlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkVGFibGUoc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBjb250ZW50IGludG8gdGhlIG5ldyB0YWJsZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ1RhYmxlLmlubmVySFRNTCA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIE1BTSsgU2V0dGluZ3MgdGFibGUhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlU2NvcGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFNldHRpbmdzKHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNldHRpbmdzIGFyZSBkb25lIGxvYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdEJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3N1Ym1pdCcpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5QnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfY29weScpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXN0ZUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2luamVjdCcpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3NUaW1lcjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVTZXR0aW5ncyhzc1RpbWVyLCBzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihwYXN0ZUJ0biwgdGhpcy5fcGFzdGVTZXR0aW5ncywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fY29weVNldHRpbmdzKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBlcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzdHlsZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvZ2xvYmFsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9ob21lLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy90b3IudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2ZvcnVtLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9zaG91dC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvYnJvd3NlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9yZXF1ZXN0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy92YXVsdC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdXNlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJmZWF0dXJlcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzZXR0aW5ncy50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBVc2Vyc2NyaXB0IG5hbWVzcGFjZVxyXG4gKiBAY29uc3RhbnQgQ0hBTkdFTE9HOiBPYmplY3QgY29udGFpbmluZyBhIGxpc3Qgb2YgY2hhbmdlcyBhbmQga25vd24gYnVnc1xyXG4gKiBAY29uc3RhbnQgVElNRVNUQU1QOiBQbGFjZWhvbGRlciBob29rIGZvciB0aGUgY3VycmVudCBidWlsZCB0aW1lXHJcbiAqIEBjb25zdGFudCBWRVJTSU9OOiBUaGUgY3VycmVudCB1c2Vyc2NyaXB0IHZlcnNpb25cclxuICogQGNvbnN0YW50IFBSRVZfVkVSOiBUaGUgbGFzdCBpbnN0YWxsZWQgdXNlcnNjcmlwdCB2ZXJzaW9uXHJcbiAqIEBjb25zdGFudCBFUlJPUkxPRzogVGhlIHRhcmdldCBhcnJheSBmb3IgbG9nZ2luZyBlcnJvcnNcclxuICogQGNvbnN0YW50IFBBR0VfUEFUSDogVGhlIGN1cnJlbnQgcGFnZSBVUkwgd2l0aG91dCB0aGUgc2l0ZSBhZGRyZXNzXHJcbiAqIEBjb25zdGFudCBNUF9DU1M6IFRoZSBNQU0rIHN0eWxlc2hlZXRcclxuICogQGNvbnN0YW50IHJ1bigpOiBTdGFydHMgdGhlIHVzZXJzY3JpcHRcclxuICovXHJcbm5hbWVzcGFjZSBNUCB7XHJcbiAgICBleHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgnZGVidWcnKSA/IHRydWUgOiBmYWxzZTtcclxuICAgIGV4cG9ydCBjb25zdCBDSEFOR0VMT0c6IEFycmF5T2JqZWN0ID0ge1xyXG4gICAgICAgIC8qIPCfhpXimbvvuI/wn5CeICovXHJcbiAgICAgICAgVVBEQVRFX0xJU1Q6IFtcclxuICAgICAgICAgICAgJ+KZu++4jzogQ3VycmVudGx5IFJlYWRpbmcgbm8gbG9uZ2VyIGxpc3RzIGFsbCBhdXRob3JzOyB0aGUgZmlyc3QgMyBhcmUgdXNlZC4nLFxyXG4gICAgICAgICAgICAn4pm777iPOiBDdXJyZW50bHkgUmVhZGluZyBub3cgZ2VuZXJhdGVzIGxpbmtzIHRvIGF1dGhvcnMuJyxcclxuICAgICAgICAgICAgJ+KZu++4jzogR29vZHJlYWRzIEJ1dHRvbnMgZm9yIGJvb2tzIHdpdGggbXVsdGlwbGUgc2VyaWVzIG5vdyBnZW5lcmF0ZSBhIGJ1dHRvbiBmb3IgZWFjaCBzZXJpZXMnLFxyXG4gICAgICAgICAgICAn8J+QnjogTGFyZ2UgcmF0aW8gbnVtYmVycyBzaG91bGQgYmUgY29ycmVjdGx5IHNob3J0ZW5lZCBieSB0aGUgU2hvcnRlbiBWYXVsdCAmIFJhdGlvIFRleHQgZmVhdHVyZS4nLFxyXG4gICAgICAgICAgICAn8J+QnjogSG9wZWZ1bGx5IGZpeGVkIGJ1ZyB0aGF0IG1pZ2h0IGNhdXNlIHVuZWNjZXNzYXJ5IHJlc291cmNlIHVzZSBvciBibG9ja2VkIGZlYXR1cmVzIGlmIGFuIGV4cGVjdGVkIHBhZ2UgZWxlbWVudCB3YXMgbWlzc2luZy4nLFxyXG4gICAgICAgICAgICAn8J+QnjogRml4ZWQgYW4gaXNzdWUgd2hlcmUgc2hvdXRib3ggZmVhdHVyZXMgbWlnaHQgZmFpbCB0byBsb2FkIGluaXRpYWxseScsXHJcbiAgICAgICAgXSBhcyBzdHJpbmdbXSxcclxuICAgICAgICBCVUdfTElTVDogW1xyXG4gICAgICAgICAgICAnUGxlYXNlIGJlIG9uIHRoZSBsb29rb3V0IGZvciBidWdzIHJlbGF0ZWQgdG8gR29vZHJlYWRzIEJ1dHRvbnMsIGFzIHRoZSBjb2RlIHdhcyBkcmFzdGljYWxseSBjaGFuZ2VkLCB0aGFua3MhJyxcclxuICAgICAgICBdIGFzIHN0cmluZ1tdLFxyXG4gICAgfTtcclxuICAgIGV4cG9ydCBjb25zdCBUSU1FU1RBTVA6IHN0cmluZyA9ICcjI21ldGFfdGltZXN0YW1wIyMnO1xyXG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBQUkVWX1ZFUjogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ2hlY2sucHJldlZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBFUlJPUkxPRzogc3RyaW5nW10gPSBbXTtcclxuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGV4cG9ydCBjb25zdCBNUF9DU1M6IFN0eWxlID0gbmV3IFN0eWxlKCk7XHJcbiAgICBleHBvcnQgY29uc3Qgc2V0dGluZ3NHbG9iOiBBbnlGZWF0dXJlW10gPSBbXTtcclxuXHJcbiAgICBleHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUFJFIFNDUklQVFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFdlbGNvbWUgdG8gTUFNKyB2JHtWRVJTSU9OfSFgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgcGFnZSBpcyBub3QgeWV0IGtub3duXHJcbiAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xyXG4gICAgICAgIC8vIEFkZCBhIHNpbXBsZSBjb29raWUgdG8gYW5ub3VuY2UgdGhlIHNjcmlwdCBpcyBiZWluZyB1c2VkXHJcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gJ21wX2VuYWJsZWQ9MTtkb21haW49bXlhbm9uYW1vdXNlLm5ldDtwYXRoPS87c2FtZXNpdGU9bGF4JztcclxuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXHJcbiAgICAgICAgY29uc3QgYWxlcnRzOiBBbGVydHMgPSBuZXcgQWxlcnRzKCk7XHJcbiAgICAgICAgbmV3IERlYnVnKCk7XHJcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICBDaGVjay51cGRhdGVkKCkudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIGFsZXJ0cy5ub3RpZnkocmVzdWx0LCBDSEFOR0VMT0cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZlYXR1cmVzXHJcbiAgICAgICAgbmV3IEluaXRGZWF0dXJlcygpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFNFVFRJTkdTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3ViUGc6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2V0dGluZ3MgcGFnZVxyXG4gICAgICAgICAgICAgICAgU2V0dGluZ3MuaW5pdChyZXN1bHQsIHNldHRpbmdzR2xvYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBTVFlMRVNcclxuICAgICAgICAgKiBJbmplY3RzIENTU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjdXN0b20gQ1NTIHNoZWV0XHJcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzaXRlIHRoZW1lXHJcbiAgICAgICAgICAgIE1QX0NTUy5hbGlnblRvU2l0ZVRoZW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcclxuTVAucnVuKCk7XHJcbiJdfQ==
