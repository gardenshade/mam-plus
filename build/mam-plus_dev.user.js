// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.3.5
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://www.myanonamouse.net/*
// @include      https://*.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.3.5
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
/**
 * #### Convert bytes into a human-readable string
 * Created by yyyzzz999
 * @param bytes Bytes to be formatted
 * @param b ?
 * @returns String in the format of ex. `123 MB`
 */
Util.formatBytes = (bytes, b = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const c = 0 > b ? 0 : b;
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return (parseFloat((bytes / Math.pow(1024, index)).toFixed(c)) +
        ' ' +
        ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][index]);
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
 * # GLOBAL FEATURES
 */
/**
 * ## Hide the home button or the banner
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
/**
 * ## Bypass the vault info page
 */
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
/**
 * ## Shorten the vault & ratio text
 */
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
/**
 * ## Display bonus point delta
 */
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
/**
 * ## Blur the header background
 */
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
/**
 * ## Hide the seedbox link
 */
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
        this._rcRow = 'mp_ratioCostRow';
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
                    // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
                    document
                        .querySelector('.torDetBottom')
                        .insertAdjacentHTML('beforebegin', `<div class="torDetRow" id="Mrp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}"><span id="mp_foobar"></span></div></div>`);
                    // Calculate & Display cost of download w/o FL
                    // Always show calculations when there is a ratio loss
                    const sizeElem = document.querySelector('#size span');
                    if (sizeElem) {
                        const size = sizeElem.textContent.split(/\s+/);
                        const sizeMap = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                        // Convert human readable size to bytes
                        const byteSized = Number(size[0]) * Math.pow(1024, sizeMap.indexOf(size[1]));
                        const recovery = byteSized * Number(rCur.innerText);
                        const pointAmnt = Math.floor((125 * recovery) / 268435456).toLocaleString();
                        // Update the ratio cost row
                        document.querySelector(`.${this._rcRow}`).innerHTML = `<b>${Util.formatBytes(recovery)}</b>&nbsp;upload (${pointAmnt} BP).&nbsp;<abbr title='Contributing 2,000 BP to each vault cycle gives you almost one FL wedge per day on average.'>[info]</abbr>`;
                    }
                    // Style the download button based on Ratio Protect level settings
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
                            if (text !== '') {
                                // Add quote to reply box
                                replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: \u201c[i]${text}[/i]\u201d `;
                                replyBox.focus();
                            }
                            else {
                                // Just reply
                                replyBox.value = `${_makeNameTag(userName, nameColor, userID)}: `;
                                replyBox.focus();
                            }
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
            `🆕: Updated Ratio Protect to v1.8; this version adds a Cost To Restore Ratio info field.`,
        ],
        BUG_LIST: [],
    };
    MP.TIMESTAMP = 'Jul 18';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL2hvbWUudHMiLCJzcmMvbW9kdWxlcy9zaGFyZWQudHMiLCJzcmMvbW9kdWxlcy90b3IudHMiLCJzcmMvbW9kdWxlcy9mb3J1bS50cyIsInNyYy9tb2R1bGVzL3Nob3V0LnRzIiwic3JjL21vZHVsZXMvYnJvd3NlLnRzIiwic3JjL21vZHVsZXMvcmVxdWVzdC50cyIsInNyYy9tb2R1bGVzL3ZhdWx0LnRzIiwic3JjL21vZHVsZXMvdXBsb2FkLnRzIiwic3JjL21vZHVsZXMvdXNlci50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVHO0FBaUJILElBQUssWUFZSjtBQVpELFdBQUssWUFBWTtJQUNiLG1EQUFRLENBQUE7SUFDUiwrQ0FBTSxDQUFBO0lBQ04sbURBQVEsQ0FBQTtJQUNSLHVEQUFVLENBQUE7SUFDViwrREFBYyxDQUFBO0lBQ2QsdURBQVUsQ0FBQTtJQUNWLGlEQUFPLENBQUE7SUFDUCwyREFBWSxDQUFBO0lBQ1osNkRBQWEsQ0FBQTtJQUNiLGlEQUFPLENBQUE7SUFDUCxrREFBTyxDQUFBO0FBQ1gsQ0FBQyxFQVpJLFlBQVksS0FBWixZQUFZLFFBWWhCO0FDL0JEOzs7O0dBSUc7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENB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c19kZXYudXNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUeXBlcywgSW50ZXJmYWNlcywgZXRjLlxyXG4gKi9cclxuXHJcbnR5cGUgVmFsaWRQYWdlID1cclxuICAgIHwgJ2hvbWUnXHJcbiAgICB8ICdicm93c2UnXHJcbiAgICB8ICdyZXF1ZXN0J1xyXG4gICAgfCAncmVxdWVzdCBkZXRhaWxzJ1xyXG4gICAgfCAndG9ycmVudCdcclxuICAgIHwgJ3Nob3V0Ym94J1xyXG4gICAgfCAndmF1bHQnXHJcbiAgICB8ICd1c2VyJ1xyXG4gICAgfCAndXBsb2FkJ1xyXG4gICAgfCAnZm9ydW0gdGhyZWFkJ1xyXG4gICAgfCAnc2V0dGluZ3MnO1xyXG5cclxudHlwZSBCb29rRGF0YSA9ICdib29rJyB8ICdhdXRob3InIHwgJ3Nlcmllcyc7XHJcblxyXG5lbnVtIFNldHRpbmdHcm91cCB7XHJcbiAgICAnR2xvYmFsJyxcclxuICAgICdIb21lJyxcclxuICAgICdTZWFyY2gnLFxyXG4gICAgJ1JlcXVlc3RzJyxcclxuICAgICdUb3JyZW50IFBhZ2UnLFxyXG4gICAgJ1Nob3V0Ym94JyxcclxuICAgICdWYXVsdCcsXHJcbiAgICAnVXNlciBQYWdlcycsXHJcbiAgICAnVXBsb2FkIFBhZ2UnLFxyXG4gICAgJ0ZvcnVtJyxcclxuICAgICdPdGhlcicsXHJcbn1cclxuXHJcbnR5cGUgU2hvdXRib3hVc2VyVHlwZSA9ICdwcmlvcml0eScgfCAnbXV0ZSc7XHJcblxyXG5pbnRlcmZhY2UgVXNlckdpZnRIaXN0b3J5IHtcclxuICAgIGFtb3VudDogbnVtYmVyO1xyXG4gICAgb3RoZXJfbmFtZTogc3RyaW5nO1xyXG4gICAgb3RoZXJfdXNlcmlkOiBudW1iZXI7XHJcbiAgICB0aWQ6IG51bWJlciB8IG51bGw7XHJcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcclxuICAgIHRpdGxlOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgdHlwZTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQXJyYXlPYmplY3Qge1xyXG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBTdHJpbmdPYmplY3Qge1xyXG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQm9va0RhdGFPYmplY3QgZXh0ZW5kcyBTdHJpbmdPYmplY3Qge1xyXG4gICAgWydleHRyYWN0ZWQnXTogc3RyaW5nO1xyXG4gICAgWydkZXNjJ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIERpdlJvd09iamVjdCB7XHJcbiAgICBbJ3RpdGxlJ106IHN0cmluZztcclxuICAgIFsnZGF0YSddOiBIVE1MRGl2RWxlbWVudDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFNldHRpbmdHbG9iT2JqZWN0IHtcclxuICAgIFtrZXk6IG51bWJlcl06IEZlYXR1cmVTZXR0aW5nc1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHNjb3BlOiBTZXR0aW5nR3JvdXA7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgdHlwZTogJ2NoZWNrYm94JyB8ICdkcm9wZG93bicgfCAndGV4dGJveCc7XHJcbiAgICBkZXNjOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBbnlGZWF0dXJlIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHRhZz86IHN0cmluZztcclxuICAgIG9wdGlvbnM/OiBTdHJpbmdPYmplY3Q7XHJcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEZlYXR1cmUge1xyXG4gICAgc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyB8IERyb3Bkb3duU2V0dGluZyB8IFRleHRib3hTZXR0aW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2hlY2tib3hTZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICdjaGVja2JveCc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEcm9wZG93blNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgdHlwZTogJ2Ryb3Bkb3duJztcclxuICAgIHRhZzogc3RyaW5nO1xyXG4gICAgb3B0aW9uczogU3RyaW5nT2JqZWN0O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgVGV4dGJveFNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgdHlwZTogJ3RleHRib3gnO1xyXG4gICAgdGFnOiBzdHJpbmc7XHJcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nO1xyXG59XHJcblxyXG4vLyBuYXZpZ2F0b3IuY2xpcGJvYXJkLmQudHNcclxuXHJcbi8vIFR5cGUgZGVjbGFyYXRpb25zIGZvciBDbGlwYm9hcmQgQVBJXHJcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DbGlwYm9hcmRfQVBJXHJcbmludGVyZmFjZSBDbGlwYm9hcmQge1xyXG4gICAgd3JpdGVUZXh0KG5ld0NsaXBUZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLy8gQWRkIGFueSBvdGhlciBtZXRob2RzIHlvdSBuZWVkIGhlcmUuXHJcbn1cclxuXHJcbmludGVyZmFjZSBOYXZpZ2F0b3JDbGlwYm9hcmQge1xyXG4gICAgLy8gT25seSBhdmFpbGFibGUgaW4gYSBzZWN1cmUgY29udGV4dC5cclxuICAgIHJlYWRvbmx5IGNsaXBib2FyZD86IENsaXBib2FyZDtcclxufVxyXG5cclxuaW50ZXJmYWNlIE5hdmlnYXRvckV4dGVuZGVkIGV4dGVuZHMgTmF2aWdhdG9yQ2xpcGJvYXJkIHt9XHJcbiIsIi8qKlxyXG4gKiBDbGFzcyBjb250YWluaW5nIGNvbW1vbiB1dGlsaXR5IG1ldGhvZHNcclxuICpcclxuICogSWYgdGhlIG1ldGhvZCBzaG91bGQgaGF2ZSB1c2VyLWNoYW5nZWFibGUgc2V0dGluZ3MsIGNvbnNpZGVyIHVzaW5nIGBDb3JlLnRzYCBpbnN0ZWFkXHJcbiAqL1xyXG5cclxuY2xhc3MgVXRpbCB7XHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGlvbiBmcmFtZSB0aW1lclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFmVGltZXIoKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlc29sdmUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3Mgc2V0dGluZyBtdWx0aXBsZSBhdHRyaWJ1dGVzIGF0IG9uY2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzZXRBdHRyKGVsOiBFbGVtZW50LCBhdHRyOiBTdHJpbmdPYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cikge1xyXG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cltrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIG9mIGFuIE9iamVjdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG9iamVjdExlbmd0aChvYmo6IE9iamVjdCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yY2VmdWxseSBlbXB0aWVzIGFueSBHTSBzdG9yZWQgdmFsdWVzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcHVyZ2VTZXR0aW5ncygpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIEdNX2xpc3RWYWx1ZXMoKSkge1xyXG4gICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9nIGEgbWVzc2FnZSBhYm91dCBhIGNvdW50ZWQgcmVzdWx0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVwb3J0Q291bnQoZGlkOiBzdHJpbmcsIG51bTogbnVtYmVyLCB0aGluZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2luZ3VsYXIgPSAxO1xyXG4gICAgICAgIGlmIChudW0gIT09IHNpbmd1bGFyKSB7XHJcbiAgICAgICAgICAgIHRoaW5nICs9ICdzJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA+ICR7ZGlkfSAke251bX0gJHt0aGluZ31gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplcyBhIGZlYXR1cmVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBzdGFydEZlYXR1cmUoXHJcbiAgICAgICAgc2V0dGluZ3M6IEZlYXR1cmVTZXR0aW5ncyxcclxuICAgICAgICBlbGVtOiBzdHJpbmcsXHJcbiAgICAgICAgcGFnZT86IFZhbGlkUGFnZVtdXHJcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAvLyBRdWV1ZSB0aGUgc2V0dGluZ3MgaW4gY2FzZSB0aGV5J3JlIG5lZWRlZFxyXG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gcmV0dXJuIHRydWUgd2hlbiB0aGUgZWxlbWVudCBpcyBsb2FkZWRcclxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW4oKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbWVyOiBQcm9taXNlPGZhbHNlPiA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCAyMDAwLCBmYWxzZSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tFbGVtID0gQ2hlY2suZWxlbUxvYWQoZWxlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVyLCBjaGVja0VsZW1dKS50aGVuKCh2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgc3RhcnRGZWF0dXJlKCR7c2V0dGluZ3MudGl0bGV9KSBVbmFibGUgdG8gaW5pdGlhdGUhIENvdWxkIG5vdCBmaW5kIGVsZW1lbnQ6ICR7ZWxlbX1gXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSXMgdGhlIHNldHRpbmcgZW5hYmxlZD9cclxuICAgICAgICBpZiAoR01fZ2V0VmFsdWUoc2V0dGluZ3MudGl0bGUpKSB7XHJcbiAgICAgICAgICAgIC8vIEEgc3BlY2lmaWMgcGFnZSBpcyBuZWVkZWRcclxuICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHJlcXVpcmVkIHBhZ2VzXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzOiBib29sZWFuW10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZm9yRWFjaCgocCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIENoZWNrLnBhZ2UocCkudGhlbigocikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goPGJvb2xlYW4+cik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIElmIGFueSByZXF1ZXN0ZWQgcGFnZSBtYXRjaGVzIHRoZSBjdXJyZW50IHBhZ2UsIHJ1biB0aGUgZmVhdHVyZVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMuaW5jbHVkZXModHJ1ZSkgPT09IHRydWUpIHJldHVybiBydW4oKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNraXAgdG8gZWxlbWVudCBjaGVja2luZ1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFNldHRpbmcgaXMgbm90IGVuYWJsZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJpbXMgYSBzdHJpbmcgbG9uZ2VyIHRoYW4gYSBzcGVjaWZpZWQgY2hhciBsaW1pdCwgdG8gYSBmdWxsIHdvcmRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB0cmltU3RyaW5nKGlucDogc3RyaW5nLCBtYXg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGlucC5sZW5ndGggPiBtYXgpIHtcclxuICAgICAgICAgICAgaW5wID0gaW5wLnN1YnN0cmluZygwLCBtYXggKyAxKTtcclxuICAgICAgICAgICAgaW5wID0gaW5wLnN1YnN0cmluZygwLCBNYXRoLm1pbihpbnAubGVuZ3RoLCBpbnAubGFzdEluZGV4T2YoJyAnKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5wO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBicmFja2V0cyAmIGFsbCBjb250YWluZWQgd29yZHMgZnJvbSBhIHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRSZW1vdmVyKGlucDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gaW5wXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC97Ky4qP30rL2csICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbXFxbfFxcXVxcXS9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwuKj8+L2csICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwoLio/XFwpL2csICcnKVxyXG4gICAgICAgICAgICAudHJpbSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKlJldHVybiB0aGUgY29udGVudHMgYmV0d2VlbiBicmFja2V0c1xyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYnJhY2tldENvbnRlbnRzID0gKGlucDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGlucC5tYXRjaCgvXFwoKFteKV0rKVxcKS8pIVsxXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIHN0cmluZyB0byBhbiBhcnJheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1RvQXJyYXkoaW5wOiBzdHJpbmcsIHNwbGl0UG9pbnQ/OiAnd3MnKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiBzcGxpdFBvaW50ICE9PSB1bmRlZmluZWQgJiYgc3BsaXRQb2ludCAhPT0gJ3dzJ1xyXG4gICAgICAgICAgICA/IGlucC5zcGxpdChzcGxpdFBvaW50KVxyXG4gICAgICAgICAgICA6IGlucC5tYXRjaCgvXFxTKy9nKSB8fCBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgY29tbWEgKG9yIG90aGVyKSBzZXBhcmF0ZWQgdmFsdWUgaW50byBhbiBhcnJheVxyXG4gICAgICogQHBhcmFtIGlucCBTdHJpbmcgdG8gYmUgZGl2aWRlZFxyXG4gICAgICogQHBhcmFtIGRpdmlkZXIgVGhlIGRpdmlkZXIgKGRlZmF1bHQ6ICcsJylcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjc3ZUb0FycmF5KGlucDogc3RyaW5nLCBkaXZpZGVyOiBzdHJpbmcgPSAnLCcpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGlucC5zcGxpdChkaXZpZGVyKS5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKGl0ZW0udHJpbSgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBhbiBhcnJheSB0byBhIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGlucCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBlbmQgY3V0LW9mZiBwb2ludFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFycmF5VG9TdHJpbmcoaW5wOiBzdHJpbmdbXSwgZW5kPzogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgaW5wLmZvckVhY2goKGtleSwgdmFsKSA9PiB7XHJcbiAgICAgICAgICAgIG91dHAgKz0ga2V5O1xyXG4gICAgICAgICAgICBpZiAoZW5kICYmIHZhbCArIDEgIT09IGlucC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gJyAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG91dHA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIERPTSBub2RlIHJlZmVyZW5jZSBpbnRvIGFuIEhUTUwgRWxlbWVudCByZWZlcmVuY2VcclxuICAgICAqIEBwYXJhbSBub2RlIFRoZSBub2RlIHRvIGNvbnZlcnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBub2RlVG9FbGVtKG5vZGU6IE5vZGUpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgaWYgKG5vZGUuZmlyc3RDaGlsZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxFbGVtZW50Pm5vZGUuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdOb2RlLXRvLWVsZW0gd2l0aG91dCBjaGlsZG5vZGUgaXMgdW50ZXN0ZWQnKTtcclxuICAgICAgICAgICAgY29uc3QgdGVtcE5vZGU6IE5vZGUgPSBub2RlO1xyXG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRlbXBOb2RlKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50Pm5vZGUuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCE7XHJcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQodGVtcE5vZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWF0Y2ggc3RyaW5ncyB3aGlsZSBpZ25vcmluZyBjYXNlIHNlbnNpdGl2aXR5XHJcbiAgICAgKiBAcGFyYW0gYSBGaXJzdCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBiIFNlY29uZCBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjYXNlbGVzc1N0cmluZ01hdGNoKGE6IHN0cmluZywgYjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgY29tcGFyZTogbnVtYmVyID0gYS5sb2NhbGVDb21wYXJlKGIsICdlbicsIHtcclxuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6ICdiYXNlJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gY29tcGFyZSA9PT0gMCA/IHRydWUgOiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIG5ldyBUb3JEZXRSb3cgYW5kIHJldHVybiB0aGUgaW5uZXIgZGl2XHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSByb3cgdG8gYmUgdGFyZ2V0dGVkXHJcbiAgICAgKiBAcGFyYW0gbGFiZWwgVGhlIG5hbWUgdG8gYmUgZGlzcGxheWVkIGZvciB0aGUgbmV3IHJvd1xyXG4gICAgICogQHBhcmFtIHJvd0NsYXNzIFRoZSByb3cncyBjbGFzc25hbWUgKHNob3VsZCBzdGFydCB3aXRoIG1wXylcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZGRUb3JEZXRhaWxzUm93KFxyXG4gICAgICAgIHRhcjogSFRNTERpdkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGxhYmVsOiBzdHJpbmcsXHJcbiAgICAgICAgcm93Q2xhc3M6IHN0cmluZ1xyXG4gICAgKTogSFRNTERpdkVsZW1lbnQge1xyXG4gICAgICAgIGlmICh0YXIgPT09IG51bGwgfHwgdGFyLnBhcmVudEVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBZGQgVG9yIERldGFpbHMgUm93OiBlbXB0eSBub2RlIG9yIHBhcmVudCBub2RlIEAgJHt0YXJ9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGFyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj4ke2xhYmVsfTwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3Jvd0NsYXNzfVwiPjxzcGFuIGNsYXNzPVwiZmxleFwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3Jvd0NsYXNzfSAuZmxleGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBNZXJnZSB3aXRoIGBVdGlsLmNyZWF0ZUJ1dHRvbmBcclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyBhIGxpbmsgYnV0dG9uIHRoYXQgaXMgc3R5bGVkIGxpa2UgYSBzaXRlIGJ1dHRvbiAoZXguIGluIHRvciBkZXRhaWxzKVxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgZWxlbWVudCB0aGUgYnV0dG9uIHNob3VsZCBiZSBhZGRlZCB0b1xyXG4gICAgICogQHBhcmFtIHVybCBUaGUgVVJMIHRoZSBidXR0b24gd2lsbCBzZW5kIHlvdSB0b1xyXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgb24gdGhlIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIG9yZGVyIE9wdGlvbmFsOiBmbGV4IGZsb3cgb3JkZXJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVMaW5rQnV0dG9uKFxyXG4gICAgICAgIHRhcjogSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcgPSAnbm9uZScsXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIG9yZGVyOiBudW1iZXIgPSAwXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvbjogSFRNTEFuY2hvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgLy8gU2V0IHVwIHRoZSBidXR0b25cclxuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnbXBfYnV0dG9uX2Nsb25lJyk7XHJcbiAgICAgICAgaWYgKHVybCAhPT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJ1dHRvbi5pbm5lclRleHQgPSB0ZXh0O1xyXG4gICAgICAgIGJ1dHRvbi5zdHlsZS5vcmRlciA9IGAke29yZGVyfWA7XHJcbiAgICAgICAgLy8gSW5qZWN0IHRoZSBidXR0b25cclxuICAgICAgICB0YXIuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgdGFyLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyBhIG5vbi1saW5rZWQgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gaWQgVGhlIElEIG9mIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IGRpc3BsYXllZCBpbiB0aGUgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gdHlwZSBUaGUgSFRNTCBlbGVtZW50IHRvIGNyZWF0ZS4gRGVmYXVsdDogYGgxYFxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgSFRNTCBlbGVtZW50IHRoZSBidXR0b24gd2lsbCBiZSBgcmVsYXRpdmVgIHRvXHJcbiAgICAgKiBAcGFyYW0gcmVsYXRpdmUgVGhlIHBvc2l0aW9uIG9mIHRoZSBidXR0b24gcmVsYXRpdmUgdG8gdGhlIGB0YXJgLiBEZWZhdWx0OiBgYWZ0ZXJlbmRgXHJcbiAgICAgKiBAcGFyYW0gYnRuQ2xhc3MgVGhlIGNsYXNzbmFtZSBvZiB0aGUgZWxlbWVudC4gRGVmYXVsdDogYG1wX2J0bmBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVCdXR0b24oXHJcbiAgICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgICB0ZXh0OiBzdHJpbmcsXHJcbiAgICAgICAgdHlwZTogc3RyaW5nID0gJ2gxJyxcclxuICAgICAgICB0YXI6IHN0cmluZyB8IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHJlbGF0aXZlOiAnYmVmb3JlYmVnaW4nIHwgJ2FmdGVyZW5kJyA9ICdhZnRlcmVuZCcsXHJcbiAgICAgICAgYnRuQ2xhc3M6IHN0cmluZyA9ICdtcF9idG4nXHJcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gQ2hvb3NlIHRoZSBuZXcgYnV0dG9uIGluc2VydCBsb2NhdGlvbiBhbmQgaW5zZXJ0IGVsZW1lbnRzXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPVxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIHRhciA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcikgOiB0YXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGAke3Rhcn0gaXMgbnVsbCFgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQocmVsYXRpdmUsIGJ0bik7XHJcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoYnRuLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBtcF8ke2lkfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGJ0bkNsYXNzLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdidXR0b24nLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCBidXR0b24gdGV4dFxyXG4gICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJ0bik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGFuIGVsZW1lbnQgaW50byBhIGJ1dHRvbiB0aGF0LCB3aGVuIGNsaWNrZWQsIGNvcGllcyB0ZXh0IHRvIGNsaXBib2FyZFxyXG4gICAgICogQHBhcmFtIGJ0biBBbiBIVE1MIEVsZW1lbnQgYmVpbmcgdXNlZCBhcyBhIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHBheWxvYWQgVGhlIHRleHQgdGhhdCB3aWxsIGJlIGNvcGllZCB0byBjbGlwYm9hcmQgb24gYnV0dG9uIGNsaWNrLCBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCB1c2UgdGhlIGNsaXBib2FyZCdzIGN1cnJlbnQgdGV4dFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNsaXBib2FyZGlmeUJ0bihcclxuICAgICAgICBidG46IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHBheWxvYWQ6IGFueSxcclxuICAgICAgICBjb3B5OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgYnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEhhdmUgdG8gb3ZlcnJpZGUgdGhlIE5hdmlnYXRvciB0eXBlIHRvIHByZXZlbnQgVFMgZXJyb3JzXHJcbiAgICAgICAgICAgIGNvbnN0IG5hdjogTmF2aWdhdG9yRXh0ZW5kZWQgfCB1bmRlZmluZWQgPSA8TmF2aWdhdG9yRXh0ZW5kZWQ+bmF2aWdhdG9yO1xyXG4gICAgICAgICAgICBpZiAobmF2ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSB0ZXh0LCBsaWtlbHkgZHVlIHRvIG1pc3NpbmcgYnJvd3NlciBzdXBwb3J0LicpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgJ25hdmlnYXRvcic/XCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLyogTmF2aWdhdG9yIEV4aXN0cyAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb3B5ICYmIHR5cGVvZiBwYXlsb2FkID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgcmVzdWx0cyB0byBjbGlwYm9hcmRcclxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS53cml0ZVRleHQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIHRvIHlvdXIgY2xpcGJvYXJkIScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBSdW4gcGF5bG9hZCBmdW5jdGlvbiB3aXRoIGNsaXBib2FyZCB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEucmVhZFRleHQoKS50aGVuKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQodGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIGZyb20geW91ciBjbGlwYm9hcmQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBidG4uc3R5bGUuY29sb3IgPSAnZ3JlZW4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIEhUVFBSZXF1ZXN0IGZvciBHRVQgSlNPTiwgcmV0dXJucyB0aGUgZnVsbCB0ZXh0IG9mIEhUVFAgR0VUXHJcbiAgICAgKiBAcGFyYW0gdXJsIC0gYSBzdHJpbmcgb2YgdGhlIFVSTCB0byBzdWJtaXQgZm9yIEdFVCByZXF1ZXN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SlNPTih1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZ2V0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAvL1VSTCB0byBHRVQgcmVzdWx0cyB3aXRoIHRoZSBhbW91bnQgZW50ZXJlZCBieSB1c2VyIHBsdXMgdGhlIHVzZXJuYW1lIGZvdW5kIG9uIHRoZSBtZW51IHNlbGVjdGVkXHJcbiAgICAgICAgICAgIGdldEhUVFAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICBnZXRIVFRQLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnZXRIVFRQLnJlYWR5U3RhdGUgPT09IDQgJiYgZ2V0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZ2V0SFRUUC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBnZXRIVFRQLnNlbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIHBhcmFtZXRlcnNcclxuICAgICAqIEBwYXJhbSBtaW4gYSBudW1iZXIgb2YgdGhlIGJvdHRvbSBvZiByYW5kb20gbnVtYmVyIHBvb2xcclxuICAgICAqIEBwYXJhbSBtYXggYSBudW1iZXIgb2YgdGhlIHRvcCBvZiB0aGUgcmFuZG9tIG51bWJlciBwb29sXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmFuZG9tTnVtYmVyID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2xlZXAgdXRpbCB0byBiZSB1c2VkIGluIGFzeW5jIGZ1bmN0aW9ucyB0byBkZWxheSBwcm9ncmFtXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2xlZXAgPSAobTogYW55KTogUHJvbWlzZTx2b2lkPiA9PiBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCBtKSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGxhc3Qgc2VjdGlvbiBvZiBhbiBIUkVGXHJcbiAgICAgKiBAcGFyYW0gZWxlbSBBbiBhbmNob3IgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHNwbGl0IE9wdGlvbmFsIGRpdmlkZXIuIERlZmF1bHRzIHRvIGAvYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGVuZE9mSHJlZiA9IChlbGVtOiBIVE1MQW5jaG9yRWxlbWVudCwgc3BsaXQgPSAnLycpID0+XHJcbiAgICAgICAgZWxlbS5ocmVmLnNwbGl0KHNwbGl0KS5wb3AoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgaGV4IHZhbHVlIG9mIGEgY29tcG9uZW50IGFzIGEgc3RyaW5nLlxyXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbXBvbmVudFRvSGV4ID0gKGM6IG51bWJlciB8IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XHJcbiAgICAgICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBoZXggY29sb3IgY29kZSBmcm9tIFJHQi5cclxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmdiVG9IZXggPSAocjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGAjJHtVdGlsLmNvbXBvbmVudFRvSGV4KHIpfSR7VXRpbC5jb21wb25lbnRUb0hleChnKX0ke1V0aWwuY29tcG9uZW50VG9IZXgoXHJcbiAgICAgICAgICAgIGJcclxuICAgICAgICApfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXh0cmFjdCBudW1iZXJzICh3aXRoIGZsb2F0KSBmcm9tIHRleHQgYW5kIHJldHVybiB0aGVtXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFuIEhUTUwgZWxlbWVudCB0aGF0IGNvbnRhaW5zIG51bWJlcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0RmxvYXQgPSAodGFyOiBIVE1MRWxlbWVudCk6IG51bWJlcltdID0+IHtcclxuICAgICAgICBpZiAodGFyLnRleHRDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGFyLnRleHRDb250ZW50IS5yZXBsYWNlKC8sL2csICcnKS5tYXRjaCgvXFxkK1xcLlxcZCsvKSB8fCBbXSkubWFwKChuKSA9PlxyXG4gICAgICAgICAgICAgICAgcGFyc2VGbG9hdChuKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGFyZ2V0IGNvbnRhaW5zIG5vIHRleHQnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBHZXQgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdGhlIGxvZ2dlZCBpbiB1c2VyIGFuZCBhIGdpdmVuIElEXHJcbiAgICAgKiBAcGFyYW0gdXNlcklEIEEgdXNlciBJRDsgY2FuIGJlIGEgc3RyaW5nIG9yIG51bWJlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGdldFVzZXJHaWZ0SGlzdG9yeShcclxuICAgICAgICB1c2VySUQ6IG51bWJlciB8IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxVc2VyR2lmdEhpc3RvcnlbXT4ge1xyXG4gICAgICAgIGNvbnN0IHJhd0dpZnRIaXN0b3J5OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04oXHJcbiAgICAgICAgICAgIGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vdXNlckJvbnVzSGlzdG9yeS5waHA/b3RoZXJfdXNlcmlkPSR7dXNlcklEfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5OiBBcnJheTxVc2VyR2lmdEhpc3Rvcnk+ID0gSlNPTi5wYXJzZShyYXdHaWZ0SGlzdG9yeSk7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBmdWxsIGRhdGFcclxuICAgICAgICByZXR1cm4gZ2lmdEhpc3Rvcnk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBwcmV0dHlTaXRlVGltZSh1bml4VGltZXN0YW1wOiBudW1iZXIsIGRhdGU/OiBib29sZWFuLCB0aW1lPzogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKHVuaXhUaW1lc3RhbXAgKiAxMDAwKS50b0lTT1N0cmluZygpO1xyXG4gICAgICAgIGlmIChkYXRlICYmICF0aW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXAuc3BsaXQoJ1QnKVswXTtcclxuICAgICAgICB9IGVsc2UgaWYgKCFkYXRlICYmIHRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBDaGVjayBhIHN0cmluZyB0byBzZWUgaWYgaXQncyBkaXZpZGVkIHdpdGggYSBkYXNoLCByZXR1cm5pbmcgdGhlIGZpcnN0IGhhbGYgaWYgaXQgZG9lc24ndCBjb250YWluIGEgc3BlY2lmaWVkIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIG9yaWdpbmFsIFRoZSBvcmlnaW5hbCBzdHJpbmcgYmVpbmcgY2hlY2tlZFxyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lZCBBIHN0cmluZyB0aGF0IG1pZ2h0IGJlIGNvbnRhaW5lZCBpbiB0aGUgb3JpZ2luYWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjaGVja0Rhc2hlcyhvcmlnaW5hbDogc3RyaW5nLCBjb250YWluZWQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgYGNoZWNrRGFzaGVzKCAke29yaWdpbmFsfSwgJHtjb250YWluZWR9ICk6IENvdW50ICR7b3JpZ2luYWwuaW5kZXhPZihcclxuICAgICAgICAgICAgICAgICAgICAnIC0gJ1xyXG4gICAgICAgICAgICAgICAgKX1gXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEYXNoZXMgYXJlIHByZXNlbnRcclxuICAgICAgICBpZiAob3JpZ2luYWwuaW5kZXhPZignIC0gJykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFN0cmluZyBjb250YWlucyBhIGRhc2hgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzcGxpdDogc3RyaW5nW10gPSBvcmlnaW5hbC5zcGxpdCgnIC0gJyk7XHJcbiAgICAgICAgICAgIGlmIChzcGxpdFswXSA9PT0gY29udGFpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgYD4gU3RyaW5nIGJlZm9yZSBkYXNoIGlzIFwiJHtjb250YWluZWR9XCI7IHVzaW5nIHN0cmluZyBiZWhpbmQgZGFzaGBcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwbGl0WzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNwbGl0WzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIFV0aWxpdGllcyBzcGVjaWZpYyB0byBHb29kcmVhZHNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnb29kcmVhZHMgPSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBSZW1vdmVzIHNwYWNlcyBpbiBhdXRob3IgbmFtZXMgdGhhdCB1c2UgYWRqYWNlbnQgaW50aXRpYWxzLlxyXG4gICAgICAgICAqIEBwYXJhbSBhdXRoIFRoZSBhdXRob3IocylcclxuICAgICAgICAgKiBAZXhhbXBsZSBcIkggRyBXZWxsc1wiIC0+IFwiSEcgV2VsbHNcIlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNtYXJ0QXV0aDogKGF1dGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFV0aWwuc3RyaW5nVG9BcnJheShhdXRoKTtcclxuICAgICAgICAgICAgYXJyLmZvckVhY2goKGtleSwgdmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IGtleSBpcyBhbiBpbml0aWFsXHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBuZXh0IGtleSBpcyBhbiBpbml0aWFsLCBkb24ndCBhZGQgYSBzcGFjZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRMZW5nOiBudW1iZXIgPSBhcnJbdmFsICsgMV0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGVuZyA8IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBrZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgJHtrZXl9IGA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIFRyaW0gdHJhaWxpbmcgc3BhY2VcclxuICAgICAgICAgICAgcmV0dXJuIG91dHAudHJpbSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBUdXJucyBhIHN0cmluZyBpbnRvIGEgR29vZHJlYWRzIHNlYXJjaCBVUkxcclxuICAgICAgICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBVUkwgdG8gbWFrZVxyXG4gICAgICAgICAqIEBwYXJhbSBpbnAgVGhlIGV4dHJhY3RlZCBkYXRhIHRvIFVSSSBlbmNvZGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBidWlsZFNlYXJjaFVSTDogKHR5cGU6IEJvb2tEYXRhIHwgJ29uJywgaW5wOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBnb29kcmVhZHMuYnVpbGRHclNlYXJjaFVSTCggJHt0eXBlfSwgJHtpbnB9IClgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGdyVHlwZTogc3RyaW5nID0gdHlwZTtcclxuICAgICAgICAgICAgY29uc3QgY2FzZXM6IGFueSA9IHtcclxuICAgICAgICAgICAgICAgIGJvb2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBnclR5cGUgPSAndGl0bGUnO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNlcmllczogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICdvbic7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wICs9ICcsICMnO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGNhc2VzW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlc1t0eXBlXSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBgaHR0cHM6Ly9yLm1yZC5uaW5qYS9odHRwczovL3d3dy5nb29kcmVhZHMuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgaW5wLnJlcGxhY2UoJyUnLCAnJylcclxuICAgICAgICAgICAgKS5yZXBsYWNlKFwiJ1wiLCAnJTI3Jyl9JnNlYXJjaF90eXBlPWJvb2tzJnNlYXJjaCU1QmZpZWxkJTVEPSR7Z3JUeXBlfWA7XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBhIGNsZWFuZWQgYm9vayB0aXRsZSBmcm9tIGFuIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHRpdGxlIHRleHRcclxuICAgICAqIEBwYXJhbSBhdXRoIEEgc3RyaW5nIG9mIGF1dGhvcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRCb29rVGl0bGUgPSBhc3luYyAoXHJcbiAgICAgICAgZGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBhdXRoOiBzdHJpbmcgPSAnJ1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRCb29rVGl0bGUoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBleHRyYWN0ZWQgPSBkYXRhLmlubmVyVGV4dDtcclxuICAgICAgICAvLyBTaG9ydGVuIHRpdGxlIGFuZCBjaGVjayBpdCBmb3IgYnJhY2tldHMgJiBhdXRob3IgbmFtZXNcclxuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLnRyaW1TdHJpbmcoVXRpbC5icmFja2V0UmVtb3ZlcihleHRyYWN0ZWQpLCA1MCk7XHJcbiAgICAgICAgZXh0cmFjdGVkID0gVXRpbC5jaGVja0Rhc2hlcyhleHRyYWN0ZWQsIGF1dGgpO1xyXG4gICAgICAgIHJldHVybiBleHRyYWN0ZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBSZXR1cm4gR1ItZm9ybWF0dGVkIGF1dGhvcnMgYXMgYW4gYXJyYXkgbGltaXRlZCB0byBgbnVtYFxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgYXV0aG9yIGxpbmtzXHJcbiAgICAgKiBAcGFyYW0gbnVtIFRoZSBudW1iZXIgb2YgYXV0aG9ycyB0byByZXR1cm4uIERlZmF1bHQgM1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tBdXRob3JzID0gYXN5bmMgKFxyXG4gICAgICAgIGRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICBudW06IG51bWJlciA9IDNcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignZ2V0Qm9va0F1dGhvcnMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKChhdXRob3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChudW0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aExpc3QucHVzaChVdGlsLmdvb2RyZWFkcy5zbWFydEF1dGgoYXV0aG9yLmlubmVyVGV4dCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG51bS0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGF1dGhMaXN0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBzZXJpZXMgYXMgYW4gYXJyYXlcclxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHNlcmllcyBsaW5rc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tTZXJpZXMgPSBhc3luYyAoZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZXRCb29rU2VyaWVzKCkgZmFpbGVkOyBlbGVtZW50IHdhcyBudWxsIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QucHVzaChzZXJpZXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpZXNMaXN0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBhIHRhYmxlLWxpa2UgYXJyYXkgb2Ygcm93cyBhcyBhbiBvYmplY3QuXHJcbiAgICAgKiBTdG9yZSB0aGUgcmV0dXJuZWQgb2JqZWN0IGFuZCBhY2Nlc3MgdXNpbmcgdGhlIHJvdyB0aXRsZSwgZXguIGBzdG9yZWRbJ1RpdGxlOiddYFxyXG4gICAgICogQHBhcmFtIHJvd0xpc3QgQW4gYXJyYXkgb2YgdGFibGUtbGlrZSByb3dzXHJcbiAgICAgKiBAcGFyYW0gdGl0bGVDbGFzcyBUaGUgY2xhc3MgdXNlZCBieSB0aGUgdGl0bGUgY2VsbHMuIERlZmF1bHQgYC50b3JEZXRMZWZ0YFxyXG4gICAgICogQHBhcmFtIGRhdGFDbGFzcyBUaGUgY2xhc3MgdXNlZCBieSB0aGUgZGF0YSBjZWxscy4gRGVmYXVsdCBgLnRvckRldFJpZ2h0YFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJvd3NUb09iaiA9IChcclxuICAgICAgICByb3dMaXN0OiBOb2RlTGlzdE9mPEVsZW1lbnQ+LFxyXG4gICAgICAgIHRpdGxlQ2xhc3MgPSAnLnRvckRldExlZnQnLFxyXG4gICAgICAgIGRhdGFDbGFzcyA9ICcudG9yRGV0UmlnaHQnXHJcbiAgICApID0+IHtcclxuICAgICAgICBpZiAocm93TGlzdC5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVXRpbC5yb3dzVG9PYmooICR7cm93TGlzdH0gKTogUm93IGxpc3Qgd2FzIGVtcHR5IWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByb3dzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgICAgICByb3dMaXN0LmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0aXRsZTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IodGl0bGVDbGFzcyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGE6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHJvdy5xdWVyeVNlbGVjdG9yKGRhdGFDbGFzcyk7XHJcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IHRpdGxlLnRleHRDb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1JvdyB0aXRsZSB3YXMgZW1wdHkhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJvd3MucmVkdWNlKChvYmosIGl0ZW0pID0+ICgob2JqW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWUpLCBvYmopLCB7fSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBDb252ZXJ0IGJ5dGVzIGludG8gYSBodW1hbi1yZWFkYWJsZSBzdHJpbmdcclxuICAgICAqIENyZWF0ZWQgYnkgeXl5enp6OTk5XHJcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQnl0ZXMgdG8gYmUgZm9ybWF0dGVkXHJcbiAgICAgKiBAcGFyYW0gYiA/XHJcbiAgICAgKiBAcmV0dXJucyBTdHJpbmcgaW4gdGhlIGZvcm1hdCBvZiBleC4gYDEyMyBNQmBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBmb3JtYXRCeXRlcyA9IChieXRlczogbnVtYmVyLCBiID0gMikgPT4ge1xyXG4gICAgICAgIGlmIChieXRlcyA9PT0gMCkgcmV0dXJuICcwIEJ5dGVzJztcclxuICAgICAgICBjb25zdCBjID0gMCA+IGIgPyAwIDogYjtcclxuICAgICAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5sb2coYnl0ZXMpIC8gTWF0aC5sb2coMTAyNCkpO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHBhcnNlRmxvYXQoKGJ5dGVzIC8gTWF0aC5wb3coMTAyNCwgaW5kZXgpKS50b0ZpeGVkKGMpKSArXHJcbiAgICAgICAgICAgICcgJyArXHJcbiAgICAgICAgICAgIFsnQnl0ZXMnLCAnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXVtpbmRleF1cclxuICAgICAgICApO1xyXG4gICAgfTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjIENsYXNzIGZvciBoYW5kbGluZyB2YWxpZGF0aW9uICYgY29uZmlybWF0aW9uXHJcbiAqL1xyXG5jbGFzcyBDaGVjayB7XHJcbiAgICBwdWJsaWMgc3RhdGljIG5ld1Zlcjogc3RyaW5nID0gR01faW5mby5zY3JpcHQudmVyc2lvbjtcclxuICAgIHB1YmxpYyBzdGF0aWMgcHJldlZlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ21wX3ZlcnNpb24nKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICogV2FpdCBmb3IgYW4gZWxlbWVudCB0byBleGlzdCwgdGhlbiByZXR1cm4gaXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIFRoZSBET00gc3RyaW5nIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHNlbGVjdCBhbiBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEhUTUxFbGVtZW50Pn0gUHJvbWlzZSBvZiBhbiBlbGVtZW50IHRoYXQgd2FzIHNlbGVjdGVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZWxlbUxvYWQoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBmYWxzZT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgTG9va2luZyBmb3IgJHtzZWxlY3Rvcn1gLCAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1NTUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IF9jb3VudGVyID0gMDtcclxuICAgICAgICBjb25zdCBfY291bnRlckxpbWl0ID0gMTAwO1xyXG4gICAgICAgIGNvbnN0IGxvZ2ljID0gYXN5bmMgKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+ID0+IHtcclxuICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBhY3R1YWwgZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChlbGVtID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IGAke3NlbGVjdG9yfSBpcyB1bmRlZmluZWQhYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA8IF9jb3VudGVyTGltaXQpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuYWZUaW1lcigpO1xyXG4gICAgICAgICAgICAgICAgX2NvdW50ZXIrKztcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBsb2dpYyhzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbSA9PT0gbnVsbCAmJiBfY291bnRlciA+PSBfY291bnRlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBfY291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbG9naWMoc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBSdW4gYSBmdW5jdGlvbiB3aGVuZXZlciBhbiBlbGVtZW50IGNoYW5nZXNcclxuICAgICAqIEBwYXJhbSBzZWxlY3RvciAtIFRoZSBlbGVtZW50IHRvIGJlIG9ic2VydmVkLiBDYW4gYmUgYSBzdHJpbmcuXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlIG9ic2VydmVyIHRyaWdnZXJzXHJcbiAgICAgKiBAcmV0dXJuIFByb21pc2Ugb2YgYSBtdXRhdGlvbiBvYnNlcnZlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1PYnNlcnZlcihcclxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGNhbGxiYWNrOiBNdXRhdGlvbkNhbGxiYWNrLFxyXG4gICAgICAgIGNvbmZpZzogTXV0YXRpb25PYnNlcnZlckluaXQgPSB7XHJcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcclxuICAgICAgICB9XHJcbiAgICApOiBQcm9taXNlPE11dGF0aW9uT2JzZXJ2ZXI+IHtcclxuICAgICAgICBsZXQgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgc2VsZWN0ZWQgPSA8SFRNTEVsZW1lbnQgfCBudWxsPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGRuJ3QgZmluZCAnJHtzZWxlY3Rvcn0nYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgYCVjIFNldHRpbmcgb2JzZXJ2ZXIgb24gJHtzZWxlY3Rvcn06ICR7c2VsZWN0ZWR9YCxcclxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kOiAjMjIyOyBjb2xvcjogIzVkOGFhOCdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihjYWxsYmFjayk7XHJcblxyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoc2VsZWN0ZWQhLCBjb25maWcpO1xyXG4gICAgICAgIHJldHVybiBvYnNlcnZlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBzY3JpcHQgaGFzIGJlZW4gdXBkYXRlZCBmcm9tIGFuIG9sZGVyIHZlcnNpb25cclxuICAgICAqIEByZXR1cm4gVGhlIHZlcnNpb24gc3RyaW5nIG9yIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlZCgpOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5ncm91cCgnQ2hlY2sudXBkYXRlZCgpJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQUkVWIFZFUiA9ICR7dGhpcy5wcmV2VmVyfWApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTkVXIFZFUiA9ICR7dGhpcy5uZXdWZXJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBEaWZmZXJlbnQgdmVyc2lvbnM7IHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMubmV3VmVyICE9PSB0aGlzLnByZXZWZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaXMgbmV3IG9yIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmVyc2lvblxyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3ZlcnNpb24nLCB0aGlzLm5ld1Zlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcmV2VmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNjcmlwdCBoYXMgcnVuIGJlZm9yZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGhhcyBydW4gYmVmb3JlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgndXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBGaXJzdC10aW1lIHJ1blxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGhhcyBuZXZlciBydW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIG1vc3QgYmFzaWMgZmVhdHVyZXNcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnZ29vZHJlYWRzQnRuJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2FsZXJ0cycsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ2ZpcnN0UnVuJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IG5vdCB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQ2hlY2sgdG8gc2VlIHdoYXQgcGFnZSBpcyBiZWluZyBhY2Nlc3NlZFxyXG4gICAgICogQHBhcmFtIHtWYWxpZFBhZ2V9IHBhZ2VRdWVyeSAtIEFuIG9wdGlvbmFsIHBhZ2UgdG8gc3BlY2lmaWNhbGx5IGNoZWNrIGZvclxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmc+fSBBIHByb21pc2UgY29udGFpbmluZyB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPGJvb2xlYW4+fSBPcHRpb25hbGx5LCBhIGJvb2xlYW4gaWYgdGhlIGN1cnJlbnQgcGFnZSBtYXRjaGVzIHRoZSBgcGFnZVF1ZXJ5YFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UocGFnZVF1ZXJ5PzogVmFsaWRQYWdlKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3Qgc3RvcmVkUGFnZSA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xyXG4gICAgICAgIGxldCBjdXJyZW50UGFnZTogVmFsaWRQYWdlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBiZWVuIHJ1biBhbmQgYSB2YWx1ZSB3YXMgc3RvcmVkXHJcbiAgICAgICAgICAgIGlmIChzdG9yZWRQYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGp1c3QgY2hlY2tpbmcgd2hhdCBwYWdlIHdlJ3JlIG9uLCByZXR1cm4gdGhlIHN0b3JlZCBwYWdlXHJcbiAgICAgICAgICAgICAgICBpZiAoIXBhZ2VRdWVyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc3RvcmVkUGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUgY2hlY2tpbmcgZm9yIGEgc3BlY2lmaWMgcGFnZSwgcmV0dXJuIFRSVUUvRkFMU0VcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFnZVF1ZXJ5ID09PSBzdG9yZWRQYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjay5wYWdlKCkgaGFzIG5vdCBwcmV2aW91cyBydW5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwYWdlXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGguaW5kZXhPZignLnBocCcpID8gcGF0aC5zcGxpdCgnLnBocCcpWzBdIDogcGF0aDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBwYXRoLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICBwYWdlLnNoaWZ0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBhZ2UgVVJMIEAgJHtwYWdlLmpvaW4oJyAtPiAnKX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IGxpdGVyYWwgb2Ygc29ydHMgdG8gdXNlIGFzIGEgXCJzd2l0Y2hcIlxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FzZXM6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gVmFsaWRQYWdlIHwgdW5kZWZpbmVkIH0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJyc6ICgpID0+ICdob21lJyxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogKCkgPT4gJ2hvbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3V0Ym94OiAoKSA9PiAnc2hvdXRib3gnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiAoKSA9PiAnc2V0dGluZ3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbGxpb25haXJlczogKCkgPT4gJ3ZhdWx0JyxcclxuICAgICAgICAgICAgICAgICAgICB0OiAoKSA9PiAndG9ycmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdTogKCkgPT4gJ3VzZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGY6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VbMV0gPT09ICd0JykgcmV0dXJuICdmb3J1bSB0aHJlYWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG9yOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAnYnJvd3NlJykgcmV0dXJuICdicm93c2UnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAncmVxdWVzdHMyJykgcmV0dXJuICdyZXF1ZXN0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3ZpZXdSZXF1ZXN0JykgcmV0dXJuICdyZXF1ZXN0IGRldGFpbHMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndXBsb2FkJykgcmV0dXJuICd1cGxvYWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgY2FzZSB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhc2VzW3BhZ2VbMF1dKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSBjYXNlc1twYWdlWzBdXSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFBhZ2UgXCIke3BhZ2V9XCIgaXMgbm90IGEgdmFsaWQgTSsgcGFnZS4gUGF0aDogJHtwYXRofWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBwYWdlIHRvIGJlIGFjY2Vzc2VkIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJywgY3VycmVudFBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJyZW50UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IGN1cnJlbnRQYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiBhIGdpdmVuIGNhdGVnb3J5IGlzIGFuIGVib29rL2F1ZGlvYm9vayBjYXRlZ29yeVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzQm9va0NhdChjYXQ6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIEN1cnJlbnRseSwgYWxsIGJvb2sgY2F0ZWdvcmllcyBhcmUgYXNzdW1lZCB0byBiZSBpbiB0aGUgcmFuZ2Ugb2YgMzktMTIwXHJcbiAgICAgICAgcmV0dXJuIGNhdCA+PSAzOSAmJiBjYXQgPD0gMTIwID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcblxyXG4vKipcclxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbHVlcyBhbmQgbWV0aG9kcyByZWxhdGVkIHRvIHN0eWxlc1xyXG4gKiBAY29uc3RydWN0b3IgSW5pdGlhbGl6ZXMgdGhlbWUgYmFzZWQgb24gbGFzdCBzYXZlZCB2YWx1ZTsgY2FuIGJlIGNhbGxlZCBiZWZvcmUgcGFnZSBjb250ZW50IGlzIGxvYWRlZFxyXG4gKiBAbWV0aG9kIHRoZW1lIEdldHMgb3Igc2V0cyB0aGUgY3VycmVudCB0aGVtZVxyXG4gKi9cclxuY2xhc3MgU3R5bGUge1xyXG4gICAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3ByZXZUaGVtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfY3NzRGF0YTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIFRoZSBsaWdodCB0aGVtZSBpcyB0aGUgZGVmYXVsdCB0aGVtZSwgc28gdXNlIE0rIExpZ2h0IHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gJ2xpZ2h0JztcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBwcmV2aW91c2x5IHVzZWQgdGhlbWUgb2JqZWN0XHJcbiAgICAgICAgdGhpcy5fcHJldlRoZW1lID0gdGhpcy5fZ2V0UHJldlRoZW1lKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgZXhpc3RzLCBhc3N1bWUgdGhlIGN1cnJlbnQgdGhlbWUgaXMgaWRlbnRpY2FsXHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZUaGVtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcHJldlRoZW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2Fybignbm8gcHJldmlvdXMgdGhlbWUnKTtcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggdGhlIENTUyBkYXRhXHJcbiAgICAgICAgdGhpcy5fY3NzRGF0YSA9IEdNX2dldFJlc291cmNlVGV4dCgnTVBfQ1NTJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSByZXR1cm5lZCAqL1xyXG4gICAgZ2V0IHRoZW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgc2V0ICovXHJcbiAgICBzZXQgdGhlbWUodmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl90aGVtZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyB0aGUgTSsgdGhlbWUgYmFzZWQgb24gdGhlIHNpdGUgdGhlbWUgKi9cclxuICAgIHB1YmxpYyBhc3luYyBhbGlnblRvU2l0ZVRoZW1lKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHRoZW1lOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZXRTaXRlQ1NTKCk7XHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGVtZS5pbmRleE9mKCdkYXJrJykgPiAwID8gJ2RhcmsnIDogJ2xpZ2h0JztcclxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB0aGlzLl90aGVtZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRQcmV2VGhlbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluamVjdCB0aGUgQ1NTIGNsYXNzIHVzZWQgYnkgTSsgZm9yIHRoZW1pbmdcclxuICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xyXG4gICAgICAgICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKGBtcF8ke3RoaXMuX3RoZW1lfWApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEJvZHkgaXMgJHtib2R5fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEluamVjdHMgdGhlIHN0eWxlc2hlZXQgbGluayBpbnRvIHRoZSBoZWFkZXIgKi9cclxuICAgIHB1YmxpYyBpbmplY3RMaW5rKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkOiBzdHJpbmcgPSAnbXBfY3NzJztcclxuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkge1xyXG4gICAgICAgICAgICBjb25zdCBzdHlsZTogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHN0eWxlLmlubmVyVGV4dCA9IHRoaXMuX2Nzc0RhdGEgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2Nzc0RhdGEgOiAnJztcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpIS5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBhbiBlbGVtZW50IHdpdGggdGhlIGlkIFwiJHtpZH1cIiBhbHJlYWR5IGV4aXN0c2ApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgaWYgaXQgZXhpc3RzICovXHJcbiAgICBwcml2YXRlIF9nZXRQcmV2VGhlbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gR01fZ2V0VmFsdWUoJ3N0eWxlX3RoZW1lJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNhdmVzIHRoZSBjdXJyZW50IHRoZW1lIGZvciBmdXR1cmUgcmVmZXJlbmNlICovXHJcbiAgICBwcml2YXRlIF9zZXRQcmV2VGhlbWUoKTogdm9pZCB7XHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3N0eWxlX3RoZW1lJywgdGhpcy5fdGhlbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFNpdGVDU1MoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhlbWVVUkw6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2hlYWQgbGlua1tocmVmKj1cIklDR3N0YXRpb25cIl0nKSFcclxuICAgICAgICAgICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVtZVVSTCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUodGhlbWVVUkwpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oYHRoZW1lVXJsIGlzIG5vdCBhIHN0cmluZzogJHt0aGVtZVVSTH1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxyXG4vKipcclxuICogQ09SRSBGRUFUVVJFU1xyXG4gKlxyXG4gKiBZb3VyIGZlYXR1cmUgYmVsb25ncyBoZXJlIGlmIHRoZSBmZWF0dXJlOlxyXG4gKiBBKSBpcyBjcml0aWNhbCB0byB0aGUgdXNlcnNjcmlwdFxyXG4gKiBCKSBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG90aGVyIGZlYXR1cmVzXHJcbiAqIEMpIHdpbGwgaGF2ZSBzZXR0aW5ncyBkaXNwbGF5ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2VcclxuICogSWYgQSAmIEIgYXJlIG1ldCBidXQgbm90IEMgY29uc2lkZXIgdXNpbmcgYFV0aWxzLnRzYCBpbnN0ZWFkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZmVhdHVyZSBjcmVhdGVzIGEgcG9wLXVwIG5vdGlmaWNhdGlvblxyXG4gKi9cclxuY2xhc3MgQWxlcnRzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2FsZXJ0cycsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNKyBBbGVydCBwYW5lbCBmb3IgdXBkYXRlIGluZm9ybWF0aW9uLCBldGMuJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2godGhpcy5fc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3RpZnkoa2luZDogc3RyaW5nIHwgYm9vbGVhbiwgbG9nOiBBcnJheU9iamVjdCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFsZXJ0cy5ub3RpZnkoICR7a2luZH0gKWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFZlcmlmeSBhIG5vdGlmaWNhdGlvbiByZXF1ZXN0IHdhcyBtYWRlXHJcbiAgICAgICAgICAgIGlmIChraW5kKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgbm90aWZpY2F0aW9ucyBhcmUgYWxsb3dlZFxyXG4gICAgICAgICAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdhbGVydHMnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG1zZyB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRNc2cgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycjogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICApOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZE1zZyggJHt0aXRsZX0gKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYXJyYXkgaXNuJ3QgZW1wdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPiAwICYmIGFyclswXSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNlY3Rpb24gaGVhZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1zZzogc3RyaW5nID0gYDxoND4ke3RpdGxlfTo8L2g0Pjx1bD5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaXRlbSBpbiB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gYDxsaT4ke2l0ZW19PC9saT5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJzwvdWw+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBub3RpZmljYXRpb24gcGFuZWxcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsZFBhbmVsID0gKG1zZzogc3RyaW5nKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkUGFuZWwoICR7bXNnfSApYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSdtcF9ub3RpZmljYXRpb24nPiR7bXNnfTxzcGFuPlg8L3NwYW4+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0JveDogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9ub3RpZmljYXRpb24nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnRuOiBIVE1MU3BhbkVsZW1lbnQgPSBtc2dCb3gucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VCdG4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLCByZW1vdmUgaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1zZ0JveCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2dCb3gucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAndXBkYXRlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgdXBkYXRlIG1lc3NhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYDxzdHJvbmc+TUFNKyBoYXMgYmVlbiB1cGRhdGVkITwvc3Ryb25nPiBZb3UgYXJlIG5vdyB1c2luZyB2JHtNUC5WRVJTSU9OfSwgY3JlYXRlZCBvbiAke01QLlRJTUVTVEFNUH0uIERpc2N1c3MgaXQgb24gPGEgaHJlZj0nZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjMnPnRoZSBmb3J1bXM8L2E+Ljxocj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNoYW5nZWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5VUERBVEVfTElTVCwgJ0NoYW5nZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuQlVHX0xJU1QsICdLbm93biBCdWdzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAnZmlyc3RSdW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxoND5XZWxjb21lIHRvIE1BTSshPC9oND5QbGVhc2UgaGVhZCBvdmVyIHRvIHlvdXIgPGEgaHJlZj1cIi9wcmVmZXJlbmNlcy9pbmRleC5waHBcIj5wcmVmZXJlbmNlczwvYT4gdG8gZW5hYmxlIHRoZSBNQU0rIHNldHRpbmdzLjxicj5BbnkgYnVnIHJlcG9ydHMsIGZlYXR1cmUgcmVxdWVzdHMsIGV0Yy4gY2FuIGJlIG1hZGUgb24gPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy9pc3N1ZXNcIj5HaXRodWI8L2E+LCA8YSBocmVmPVwiL2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzXCI+dGhlIGZvcnVtczwvYT4sIG9yIDxhIGhyZWY9XCIvc2VuZG1lc3NhZ2UucGhwP3JlY2VpdmVyPTEwODMwM1wiPnRocm91Z2ggcHJpdmF0ZSBtZXNzYWdlPC9hPi4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyBmaXJzdCBydW4gbWVzc2FnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFJlY2VpdmVkIG1zZyBraW5kOiAke2tpbmR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFuZWwobWVzc2FnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVidWcgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZGVidWcnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdFcnJvciBsb2cgKDxlbT5DbGljayB0aGlzIGNoZWNrYm94IHRvIGVuYWJsZSB2ZXJib3NlIGxvZ2dpbmcgdG8gdGhlIGNvbnNvbGU8L2VtPiknLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiAjIEdMT0JBTCBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiAjIyBIaWRlIHRoZSBob21lIGJ1dHRvbiBvciB0aGUgYmFubmVyXHJcbiAqL1xyXG5jbGFzcyBIaWRlSG9tZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnZHJvcGRvd24nLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZUhvbWUnLFxyXG4gICAgICAgIHRhZzogJ1JlbW92ZSBiYW5uZXIvaG9tZScsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnRG8gbm90IHJlbW92ZSBlaXRoZXInLFxyXG4gICAgICAgICAgICBoaWRlQmFubmVyOiAnSGlkZSB0aGUgYmFubmVyJyxcclxuICAgICAgICAgICAgaGlkZUhvbWU6ICdIaWRlIHRoZSBob21lIGJ1dHRvbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBoZWFkZXIgaW1hZ2Ugb3IgSG9tZSBidXR0b24sIGJlY2F1c2UgYm90aCBsaW5rIHRvIHRoZSBob21lcGFnZScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5tZW51JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGhpZGVyOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSh0aGlzLl9zZXR0aW5ncy50aXRsZSk7XHJcbiAgICAgICAgaWYgKGhpZGVyID09PSAnaGlkZUhvbWUnKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9ob21lJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgaG9tZSBidXR0b24hJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChoaWRlciA9PT0gJ2hpZGVCYW5uZXInKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9iYW5uZXInKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBiYW5uZXIhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBEcm9wZG93blNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIEJ5cGFzcyB0aGUgdmF1bHQgaW5mbyBwYWdlXHJcbiAqL1xyXG5jbGFzcyBWYXVsdExpbmsgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3ZhdWx0TGluaycsXHJcbiAgICAgICAgZGVzYzogJ01ha2UgdGhlIFZhdWx0IGxpbmsgYnlwYXNzIHRoZSBWYXVsdCBJbmZvIHBhZ2UnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtaWxsaW9uSW5mbyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBkb2N1bWVudFxyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpIVxyXG4gICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdocmVmJywgJy9taWxsaW9uYWlyZXMvZG9uYXRlLnBocCcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE1hZGUgdGhlIHZhdWx0IHRleHQgbGluayB0byB0aGUgZG9uYXRlIHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgU2hvcnRlbiB0aGUgdmF1bHQgJiByYXRpbyB0ZXh0XHJcbiAqL1xyXG5jbGFzcyBNaW5pVmF1bHRJbmZvIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdtaW5pVmF1bHRJbmZvJyxcclxuICAgICAgICBkZXNjOiAnU2hvcnRlbiB0aGUgVmF1bHQgbGluayAmIHJhdGlvIHRleHQnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtaWxsaW9uSW5mbyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCB2YXVsdFRleHQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zdCByYXRpb1RleHQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKSE7XHJcblxyXG4gICAgICAgIC8vIFNob3J0ZW4gdGhlIHJhdGlvIHRleHRcclxuICAgICAgICAvLyBUT0RPOiBtb3ZlIHRoaXMgdG8gaXRzIG93biBzZXR0aW5nP1xyXG4gICAgICAgIC8qIFRoaXMgY2hhaW5lZCBtb25zdHJvc2l0eSBkb2VzIHRoZSBmb2xsb3dpbmc6XHJcbiAgICAgICAgLSBFeHRyYWN0IHRoZSBudW1iZXIgKHdpdGggZmxvYXQpIGZyb20gdGhlIGVsZW1lbnRcclxuICAgICAgICAtIEZpeCB0aGUgZmxvYXQgdG8gMiBkZWNpbWFsIHBsYWNlcyAod2hpY2ggY29udmVydHMgaXQgYmFjayBpbnRvIGEgc3RyaW5nKVxyXG4gICAgICAgIC0gQ29udmVydCB0aGUgc3RyaW5nIGJhY2sgaW50byBhIG51bWJlciBzbyB0aGF0IHdlIGNhbiBjb252ZXJ0IGl0IHdpdGhgdG9Mb2NhbGVTdHJpbmdgIHRvIGdldCBjb21tYXMgYmFjayAqL1xyXG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihVdGlsLmV4dHJhY3RGbG9hdChyYXRpb1RleHQpWzBdLnRvRml4ZWQoMikpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgcmF0aW9UZXh0LmlubmVySFRNTCA9IGAke251bX0gPGltZyBzcmM9XCIvcGljL3VwZG93bkJpZy5wbmdcIiBhbHQ9XCJyYXRpb1wiPmA7XHJcblxyXG4gICAgICAgIC8vIFR1cm4gdGhlIG51bWVyaWMgcG9ydGlvbiBvZiB0aGUgdmF1bHQgbGluayBpbnRvIGEgbnVtYmVyXHJcbiAgICAgICAgbGV0IG5ld1RleHQ6IG51bWJlciA9IHBhcnNlSW50KFxyXG4gICAgICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQhLnNwbGl0KCc6JylbMV0uc3BsaXQoJyAnKVsxXS5yZXBsYWNlKC8sL2csICcnKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIHZhdWx0IGFtb3VudCB0byBtaWxsaW9udGhzXHJcbiAgICAgICAgbmV3VGV4dCA9IE51bWJlcigobmV3VGV4dCAvIDFlNikudG9GaXhlZCgzKSk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSB2YXVsdCB0ZXh0XHJcbiAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50ID0gYFZhdWx0OiAke25ld1RleHR9IG1pbGxpb25gO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNob3J0ZW5lZCB0aGUgdmF1bHQgJiByYXRpbyBudW1iZXJzIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIERpc3BsYXkgYm9udXMgcG9pbnQgZGVsdGFcclxuICovXHJcbmNsYXNzIEJvbnVzUG9pbnREZWx0YSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYm9udXNQb2ludERlbHRhJyxcclxuICAgICAgICBkZXNjOiBgRGlzcGxheSBob3cgbWFueSBib251cyBwb2ludHMgeW91J3ZlIGdhaW5lZCBzaW5jZSBsYXN0IHBhZ2Vsb2FkYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG1CUCc7XHJcbiAgICBwcml2YXRlIF9wcmV2QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9jdXJyZW50QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9kZWx0YTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50QlBFbDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG5cclxuICAgICAgICAvLyBHZXQgb2xkIEJQIHZhbHVlXHJcbiAgICAgICAgdGhpcy5fcHJldkJQID0gdGhpcy5fZ2V0QlAoKTtcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRCUEVsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgbnVtYmVyIGZyb20gdGhlIEJQIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudDogUmVnRXhwTWF0Y2hBcnJheSA9IGN1cnJlbnRCUEVsLnRleHRDb250ZW50IS5tYXRjaChcclxuICAgICAgICAgICAgICAgIC9cXGQrL2dcclxuICAgICAgICAgICAgKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IG5ldyBCUCB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50QlAgPSBwYXJzZUludChjdXJyZW50WzBdKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0QlAodGhpcy5fY3VycmVudEJQKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWx0YVxyXG4gICAgICAgICAgICB0aGlzLl9kZWx0YSA9IHRoaXMuX2N1cnJlbnRCUCAtIHRoaXMuX3ByZXZCUDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRleHQgaWYgbm90IDBcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlbHRhICE9PSAwICYmICFpc05hTih0aGlzLl9kZWx0YSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3BsYXlCUCh0aGlzLl9kZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlzcGxheUJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCBib251c0JveDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGxldCBkZWx0YUJveDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgIGRlbHRhQm94ID0gYnAgPiAwID8gYCske2JwfWAgOiBgJHticH1gO1xyXG5cclxuICAgICAgICBpZiAoYm9udXNCb3ggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgYm9udXNCb3guaW5uZXJIVE1MICs9IGA8c3BhbiBjbGFzcz0nbXBfYnBEZWx0YSc+ICgke2RlbHRhQm94fSk8L3NwYW4+YDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgX3NldEJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1WYWxgLCBgJHticH1gKTtcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9nZXRCUCA9ICgpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCk7XHJcbiAgICAgICAgaWYgKHN0b3JlZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChzdG9yZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgQmx1ciB0aGUgaGVhZGVyIGJhY2tncm91bmRcclxuICovXHJcbmNsYXNzIEJsdXJyZWRIZWFkZXIgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2JsdXJyZWRIZWFkZXInLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBibHVycmVkIGJhY2tncm91bmQgdG8gdGhlIGhlYWRlciBhcmVhYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc2l0ZU1haW4gPiBoZWFkZXInO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBoZWFkZXI6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCR7dGhpcy5fdGFyfWApO1xyXG4gICAgICAgIGNvbnN0IGhlYWRlckltZzogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBoZWFkZXIucXVlcnlTZWxlY3RvcihgaW1nYCk7XHJcblxyXG4gICAgICAgIGlmIChoZWFkZXJJbWcpIHtcclxuICAgICAgICAgICAgY29uc3QgaGVhZGVyU3JjOiBzdHJpbmcgfCBudWxsID0gaGVhZGVySW1nLmdldEF0dHJpYnV0ZSgnc3JjJyk7XHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgY29udGFpbmVyIGZvciB0aGUgYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBibHVycmVkQmFjazogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdtcF9ibHVycmVkQmFjaycpO1xyXG4gICAgICAgICAgICBoZWFkZXIuYXBwZW5kKGJsdXJyZWRCYWNrKTtcclxuICAgICAgICAgICAgYmx1cnJlZEJhY2suc3R5bGUuYmFja2dyb3VuZEltYWdlID0gaGVhZGVyU3JjID8gYHVybCgke2hlYWRlclNyY30pYCA6ICcnO1xyXG4gICAgICAgICAgICBibHVycmVkQmFjay5jbGFzc0xpc3QuYWRkKCdtcF9jb250YWluZXInKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBIaWRlIHRoZSBzZWVkYm94IGxpbmtcclxuICovXHJcbmNsYXNzIEhpZGVTZWVkYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdoaWRlU2VlZGJveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgXCJHZXQgQSBTZWVkYm94XCIgbWVudSBpdGVtJyxcclxuICAgIH07XHJcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWVudSc7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHNlZWRib3hCdG46IEhUTUxMSUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyNtZW51IC5zYkRvbkNyeXB0bydcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChzZWVkYm94QnRuKSBzZWVkYm94QnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqICMjIyBBZGRzIGFiaWxpdHkgdG8gZ2lmdCBuZXdlc3QgMTAgbWVtYmVycyB0byBNQU0gb24gSG9tZXBhZ2Ugb3Igb3BlbiB0aGVpciB1c2VyIHBhZ2VzXHJcbiAqL1xyXG5jbGFzcyBHaWZ0TmV3ZXN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZ2lmdE5ld2VzdCcsXHJcbiAgICAgICAgZGVzYzogYEFkZCBidXR0b25zIHRvIEdpZnQvT3BlbiBhbGwgbmV3ZXN0IG1lbWJlcnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNmcE5NJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvL2Vuc3VyZSBnaWZ0ZWQgbGlzdCBpcyB1bmRlciA1MCBtZW1iZXIgbmFtZXMgbG9uZ1xyXG4gICAgICAgIHRoaXMuX3RyaW1HaWZ0TGlzdCgpO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBGcm9udFBhZ2UgTmV3TWVtYmVycyBlbGVtZW50IGNvbnRhaW5pbmcgbmV3ZXN0IDEwIG1lbWJlcnNcclxuICAgICAgICBjb25zdCBmcE5NID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zdCBtZW1iZXJzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXHJcbiAgICAgICAgICAgIGZwTk0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgbGFzdE1lbSA9IG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICBtZW1iZXJzLmZvckVhY2goKG1lbWJlcikgPT4ge1xyXG4gICAgICAgICAgICAvL2FkZCBhIGNsYXNzIHRvIHRoZSBleGlzdGluZyBlbGVtZW50IGZvciB1c2UgaW4gcmVmZXJlbmNlIGluIGNyZWF0aW5nIGJ1dHRvbnNcclxuICAgICAgICAgICAgbWVtYmVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgbXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfWApO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSBtZW1iZXIgaGFzIGJlZW4gZ2lmdGVkIHRocm91Z2ggdGhpcyBmZWF0dXJlIHByZXZpb3VzbHlcclxuICAgICAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykuaW5kZXhPZihVdGlsLmVuZE9mSHJlZihtZW1iZXIpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2FkZCBjaGVja2VkIGJveCB0byB0ZXh0XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuaW5uZXJUZXh0ID0gYCR7bWVtYmVyLmlubmVyVGV4dH0gXFx1MjYxMWA7XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZCgnbXBfZ2lmdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxyXG4gICAgICAgIGxldCBnaWZ0VmFsdWVTZXR0aW5nOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgndXNlckdpZnREZWZhdWx0X3ZhbCcpO1xyXG4gICAgICAgIC8vaWYgdGhleSBkaWQgbm90IHNldCBhIHZhbHVlIGluIHByZWZlcmVuY2VzLCBzZXQgdG8gMTAwIG9yIHNldCB0byBtYXggb3IgbWluXHJcbiAgICAgICAgLy8gVE9ETzogTWFrZSB0aGUgZ2lmdCB2YWx1ZSBjaGVjayBpbnRvIGEgVXRpbFxyXG4gICAgICAgIGlmICghZ2lmdFZhbHVlU2V0dGluZykge1xyXG4gICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykgPiAxMDAwIHx8IGlzTmFOKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSkpIHtcclxuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAwJztcclxuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcclxuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICc1JztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIHRleHQgaW5wdXQgZm9yIGhvdyBtYW55IHBvaW50cyB0byBnaXZlXHJcbiAgICAgICAgY29uc3QgZ2lmdEFtb3VudHM6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIFV0aWwuc2V0QXR0cihnaWZ0QW1vdW50cywge1xyXG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgIHNpemU6ICczJyxcclxuICAgICAgICAgICAgaWQ6ICdtcF9naWZ0QW1vdW50cycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAwJyxcclxuICAgICAgICAgICAgdmFsdWU6IGdpZnRWYWx1ZVNldHRpbmcsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9pbnNlcnQgdGhlIHRleHQgYm94IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZVxyXG4gICAgICAgIGxhc3RNZW0uaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGdpZnRBbW91bnRzKTtcclxuXHJcbiAgICAgICAgLy9tYWtlIHRoZSBidXR0b24gYW5kIGluc2VydCBhZnRlciB0aGUgbGFzdCBtZW1iZXJzIG5hbWUgKGJlZm9yZSB0aGUgaW5wdXQgdGV4dClcclxuICAgICAgICBjb25zdCBnaWZ0QWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICdnaWZ0QWxsJyxcclxuICAgICAgICAgICAgJ0dpZnQgQWxsOiAnLFxyXG4gICAgICAgICAgICAnYnV0dG9uJyxcclxuICAgICAgICAgICAgYC5tcF9yZWZQb2ludF8ke1V0aWwuZW5kT2ZIcmVmKGxhc3RNZW0pfWAsXHJcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICdtcF9idG4nXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2FkZCBhIHNwYWNlIGJldHdlZW4gYnV0dG9uIGFuZCB0ZXh0XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5SaWdodCA9ICc1cHgnO1xyXG4gICAgICAgIGdpZnRBbGxCdG4uc3R5bGUubWFyZ2luVG9wID0gJzVweCc7XHJcblxyXG4gICAgICAgIGdpZnRBbGxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0Q2FsbDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy91cGRhdGUgdGhlIHRleHQgdG8gc2hvdyBwcm9jZXNzaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1NlbmRpbmcgR2lmdHMuLi4gUGxlYXNlIFdhaXQnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdXNlciBoYXMgbm90IGJlZW4gZ2lmdGVkXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbWVtYmVycyBuYW1lIGZvciBKU09OIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9IG1lbWJlci5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBwb2ludHMgYW1vdW50IGZyb20gdGhlIGlucHV0IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnaWZ0RmluYWxBbW91bnQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgcmFuZG9tIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRGaW5hbEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy93YWl0IDMgc2Vjb25kcyBiZXR3ZWVuIEpTT04gY2FsbHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0Q2FsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLnNsZWVwKDMwMDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVxdWVzdCBzZW5kaW5nIHBvaW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NoZWNrIG9mZiBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSBcXHUyNjExYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKCdtcF9naWZ0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIG1lbWJlciB0byB0aGUgc3RvcmVkIG1lbWJlciBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbXBfbGFzdE5ld0dpZnRlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7VXRpbC5lbmRPZkhyZWYobWVtYmVyKX0sJHtHTV9nZXRWYWx1ZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21wX2xhc3ROZXdHaWZ0ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL2Rpc2FibGUgYnV0dG9uIGFmdGVyIHNlbmRcclxuICAgICAgICAgICAgICAgIChnaWZ0QWxsQnRuIGFzIEhUTUxJbnB1dEVsZW1lbnQpLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmlubmVyVGV4dCA9XHJcbiAgICAgICAgICAgICAgICAgICAgJ0dpZnRzIGNvbXBsZXRlZCB0byBhbGwgQ2hlY2tlZCBVc2Vycyc7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9uZXdsaW5lIGJldHdlZW4gZWxlbWVudHNcclxuICAgICAgICBtZW1iZXJzW21lbWJlcnMubGVuZ3RoIC0gMV0uYWZ0ZXIoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XHJcbiAgICAgICAgLy9saXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGlucHV0IGJveCBhbmQgZW5zdXJlIGl0cyBiZXR3ZWVuIDUgYW5kIDEwMDAsIGlmIG5vdCBkaXNhYmxlIGJ1dHRvblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpIS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWVUb051bWJlcjogU3RyaW5nID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QW1vdW50cycpXHJcbiAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEFsbCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPCA1IHx8XHJcbiAgICAgICAgICAgICAgICBpc05hTihOdW1iZXIodmFsdWVUb051bWJlcikpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCAnRGlzYWJsZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuc2V0QXR0cmlidXRlKCd0aXRsZScsIGBHaWZ0IEFsbCAke3ZhbHVlVG9OdW1iZXJ9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2FkZCBhIGJ1dHRvbiB0byBvcGVuIGFsbCB1bmdpZnRlZCBtZW1iZXJzIGluIG5ldyB0YWJzXHJcbiAgICAgICAgY29uc3Qgb3BlbkFsbEJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAnb3BlblRhYnMnLFxyXG4gICAgICAgICAgICAnT3BlbiBVbmdpZnRlZCBJbiBUYWJzJyxcclxuICAgICAgICAgICAgJ2J1dHRvbicsXHJcbiAgICAgICAgICAgICdbaWQ9bXBfZ2lmdEFtb3VudHNdJyxcclxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgJ21wX2J0bidcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBvcGVuQWxsQnRuLnNldEF0dHJpYnV0ZSgndGl0bGUnLCAnT3BlbiBuZXcgdGFiIGZvciBlYWNoJyk7XHJcbiAgICAgICAgb3BlbkFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtcF9naWZ0ZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihtZW1iZXIuaHJlZiwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBjdXJyZW50IGFtb3VudCBvZiBib251cyBwb2ludHMgYXZhaWxhYmxlIHRvIHNwZW5kXHJcbiAgICAgICAgbGV0IGJvbnVzUG9pbnRzQXZhaWw6IHN0cmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0bUJQJykhLmlubmVyVGV4dDtcclxuICAgICAgICAvL2dldCByaWQgb2YgdGhlIGRlbHRhIGRpc3BsYXlcclxuICAgICAgICBpZiAoYm9udXNQb2ludHNBdmFpbC5pbmRleE9mKCcoJykgPj0gMCkge1xyXG4gICAgICAgICAgICBib251c1BvaW50c0F2YWlsID0gYm9udXNQb2ludHNBdmFpbC5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgYm9udXNQb2ludHNBdmFpbC5pbmRleE9mKCcoJylcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9yZWNyZWF0ZSB0aGUgYm9udXMgcG9pbnRzIGluIG5ldyBzcGFuIGFuZCBpbnNlcnQgaW50byBmcE5NXHJcbiAgICAgICAgY29uc3QgbWVzc2FnZVNwYW46IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgIG1lc3NhZ2VTcGFuLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdEFsbE1zZycpO1xyXG4gICAgICAgIG1lc3NhZ2VTcGFuLmlubmVyVGV4dCA9ICdBdmFpbGFibGUgJyArIGJvbnVzUG9pbnRzQXZhaWw7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFmdGVyKG1lc3NhZ2VTcGFuKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5hZnRlcihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICBkb2N1bWVudFxyXG4gICAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSFcclxuICAgICAgICAgICAgLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCAnPGJyPicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBnaWZ0IG5ldyBtZW1iZXJzIGJ1dHRvbiB0byBIb21lIHBhZ2UuLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogVHJpbXMgdGhlIGdpZnRlZCBsaXN0IHRvIGxhc3QgNTAgbmFtZXMgdG8gYXZvaWQgZ2V0dGluZyB0b28gbGFyZ2Ugb3ZlciB0aW1lLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF90cmltR2lmdExpc3QoKSB7XHJcbiAgICAgICAgLy9pZiB2YWx1ZSBleGlzdHMgaW4gR01cclxuICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKSkge1xyXG4gICAgICAgICAgICAvL0dNIHZhbHVlIGlzIGEgY29tbWEgZGVsaW0gdmFsdWUsIHNwbGl0IHZhbHVlIGludG8gYXJyYXkgb2YgbmFtZXNcclxuICAgICAgICAgICAgY29uc3QgZ2lmdE5hbWVzID0gR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICBsZXQgbmV3R2lmdE5hbWVzOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgaWYgKGdpZnROYW1lcy5sZW5ndGggPiA1MCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBnaWZ0TmFtZSBvZiBnaWZ0TmFtZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdE5hbWVzLmluZGV4T2YoZ2lmdE5hbWUpIDw9IDQ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVidWlsZCBhIGNvbW1hIGRlbGltIHN0cmluZyBvdXQgb2YgdGhlIGZpcnN0IDQ5IG5hbWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0dpZnROYW1lcyA9IG5ld0dpZnROYW1lcyArIGdpZnROYW1lICsgJywnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NldCBuZXcgc3RyaW5nIGluIEdNXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJywgbmV3R2lmdE5hbWVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL3NldCB2YWx1ZSBpZiBkb2VzbnQgZXhpc3RcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnLCAnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIyBBZGRzIGFiaWxpdHkgdG8gaGlkZSBuZXdzIGl0ZW1zIG9uIHRoZSBwYWdlXHJcbiAqL1xyXG5jbGFzcyBIaWRlTmV3cyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkhvbWUsXHJcbiAgICAgICAgdGl0bGU6ICdoaWRlTmV3cycsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBkZXNjOiAnVGlkeSB0aGUgaG9tZXBhZ2UgYW5kIGFsbG93IE5ld3MgdG8gYmUgaGlkZGVuJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcubWFpblBhZ2VOZXdzSGVhZCc7XHJcbiAgICBwcml2YXRlIF92YWx1ZVRpdGxlOiBzdHJpbmcgPSBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1fdmFsYDtcclxuICAgIHByaXZhdGUgX2ljb24gPSAnXFx1Mjc0ZSc7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBOT1RFOiBmb3IgZGV2ZWxvcG1lbnRcclxuICAgICAgICAvLyBHTV9kZWxldGVWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtjb25zb2xlLndhcm4oYFZhbHVlIG9mICR7dGhpcy5fdmFsdWVUaXRsZX0gd2lsbCBiZSBkZWxldGVkIWApO1xyXG5cclxuICAgICAgICB0aGlzLl9yZW1vdmVDbG9jaygpO1xyXG4gICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyKTtcclxuICAgICAgICBhd2FpdCB0aGlzLl9jaGVja0ZvclNlZW4oKTtcclxuICAgICAgICB0aGlzLl9hZGRIaWRlckJ1dHRvbigpO1xyXG4gICAgICAgIC8vIHRoaXMuX2NsZWFuVmFsdWVzKCk7IC8vIEZJWDogTm90IHdvcmtpbmcgYXMgaW50ZW5kZWRcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ2xlYW5lZCB1cCB0aGUgaG9tZSBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIF9jaGVja0ZvclNlZW4gPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICAgICAgY29uc3QgcHJldlZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcclxuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyh0aGlzLl92YWx1ZVRpdGxlLCAnOlxcbicsIHByZXZWYWx1ZSk7XHJcblxyXG4gICAgICAgIGlmIChwcmV2VmFsdWUgJiYgbmV3cykge1xyXG4gICAgICAgICAgICAvLyBVc2UgdGhlIGljb24gdG8gc3BsaXQgb3V0IHRoZSBrbm93biBoaWRkZW4gbWVzc2FnZXNcclxuICAgICAgICAgICAgY29uc3QgaGlkZGVuQXJyYXkgPSBwcmV2VmFsdWUuc3BsaXQodGhpcy5faWNvbik7XHJcbiAgICAgICAgICAgIC8qIElmIGFueSBvZiB0aGUgaGlkZGVuIG1lc3NhZ2VzIG1hdGNoIGEgY3VycmVudCBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICByZW1vdmUgdGhlIGN1cnJlbnQgbWVzc2FnZSBmcm9tIHRoZSBET00gKi9cclxuICAgICAgICAgICAgaGlkZGVuQXJyYXkuZm9yRWFjaCgoaGlkZGVuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5LnRleHRDb250ZW50ID09PSBoaWRkZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gY3VycmVudCBtZXNzYWdlcywgaGlkZSB0aGUgaGVhZGVyXHJcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW5QYWdlTmV3c1N1YicpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3RhciwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgX3JlbW92ZUNsb2NrID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNsb2NrOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgLmZwVGltZScpO1xyXG4gICAgICAgIGlmIChjbG9jaykgY2xvY2sucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIF9hZGp1c3RIZWFkZXJTaXplID0gKHNlbGVjdG9yOiBzdHJpbmcsIHZpc2libGU/OiBib29sZWFuKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3c0hlYWRlcjogSFRNTEhlYWRpbmdFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgICAgIGlmIChuZXdzSGVhZGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh2aXNpYmxlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmV3c0hlYWRlci5zdHlsZS5mb250U2l6ZSA9ICcyZW0nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfYWRkSGlkZXJCdXR0b24gPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3cyA9IHRoaXMuX2dldE5ld3NJdGVtcygpO1xyXG4gICAgICAgIGlmICghbmV3cykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCBuZXdzIGVudHJ5XHJcbiAgICAgICAgbmV3cy5mb3JFYWNoKChlbnRyeSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBidXR0b25cclxuICAgICAgICAgICAgY29uc3QgeGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICB4YnV0dG9uLnRleHRDb250ZW50ID0gdGhpcy5faWNvbjtcclxuICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHhidXR0b24sIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTppbmxpbmUtYmxvY2s7bWFyZ2luLXJpZ2h0OjAuN2VtO2N1cnNvcjpwb2ludGVyOycsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogJ21wX2NsZWFyQnRuJyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2tzXHJcbiAgICAgICAgICAgIHhidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXaGVuIGNsaWNrZWQsIGFwcGVuZCB0aGUgY29udGVudCBvZiB0aGUgY3VycmVudCBuZXdzIHBvc3QgdG8gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBsaXN0IG9mIHJlbWVtYmVyZWQgbmV3cyBpdGVtc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcclxuICAgICAgICAgICAgICAgICAgICA/IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnJztcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgSGlkaW5nLi4uICR7cHJldmlvdXNWYWx1ZX0ke2VudHJ5LnRleHRDb250ZW50fWApO1xyXG5cclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUsIGAke3ByZXZpb3VzVmFsdWV9JHtlbnRyeS50ZXh0Q29udGVudH1gKTtcclxuICAgICAgICAgICAgICAgIGVudHJ5LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vcmUgbmV3cyBpdGVtcywgcmVtb3ZlIHRoZSBoZWFkZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWROZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWROZXdzICYmIHVwZGF0ZWROZXdzLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGp1c3RIZWFkZXJTaXplKHRoaXMuX3RhciwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgYnV0dG9uIGFzIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgZW50cnlcclxuICAgICAgICAgICAgaWYgKGVudHJ5LmZpcnN0Q2hpbGQpIGVudHJ5LmZpcnN0Q2hpbGQuYmVmb3JlKHhidXR0b24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBfY2xlYW5WYWx1ZXMgPSAobnVtID0gMykgPT4ge1xyXG4gICAgICAgIGxldCB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgR01fZ2V0VmFsdWUoJHt0aGlzLl92YWx1ZVRpdGxlfSlgLCB2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIC8vIFJldHVybiB0aGUgbGFzdCAzIHN0b3JlZCBpdGVtcyBhZnRlciBzcGxpdHRpbmcgdGhlbSBhdCB0aGUgaWNvblxyXG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuYXJyYXlUb1N0cmluZyh2YWx1ZS5zcGxpdCh0aGlzLl9pY29uKS5zbGljZSgwIC0gbnVtKSk7XHJcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBuZXcgdmFsdWVcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgX2dldE5ld3NJdGVtcyA9ICgpOiBOb2RlTGlzdE9mPEhUTUxEaXZFbGVtZW50PiB8IG51bGwgPT4ge1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXZbY2xhc3NePVwibWFpblBhZ2VOZXdzXCJdJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdHlwZSBzZWxlY3RlZCBmb3IgYHRoaXMuX3NldHRpbmdzYFxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jaGVjay50c1wiIC8+XHJcblxyXG4vKipcclxuICogU0hBUkVEIENPREVcclxuICpcclxuICogVGhpcyBpcyBmb3IgYW55dGhpbmcgdGhhdCdzIHNoYXJlZCBiZXR3ZWVuIGZpbGVzLCBidXQgaXMgbm90IGdlbmVyaWMgZW5vdWdoIHRvXHJcbiAqIHRvIGJlbG9uZyBpbiBgVXRpbHMudHNgLiBJIGNhbid0IHRoaW5rIG9mIGEgYmV0dGVyIHdheSB0byBjYXRlZ29yaXplIERSWSBjb2RlLlxyXG4gKi9cclxuXHJcbmNsYXNzIFNoYXJlZCB7XHJcbiAgICAvKipcclxuICAgICAqIFJlY2VpdmUgYSB0YXJnZXQgYW5kIGB0aGlzLl9zZXR0aW5ncy50aXRsZWBcclxuICAgICAqIEBwYXJhbSB0YXIgQ1NTIHNlbGVjdG9yIGZvciBhIHRleHQgaW5wdXQgYm94XHJcbiAgICAgKi9cclxuICAgIC8vIFRPRE86IHdpdGggYWxsIENoZWNraW5nIGJlaW5nIGRvbmUgaW4gYFV0aWwuc3RhcnRGZWF0dXJlKClgIGl0J3Mgbm8gbG9uZ2VyIG5lY2Vzc2FyeSB0byBDaGVjayBpbiB0aGlzIGZ1bmN0aW9uXHJcbiAgICBwdWJsaWMgZmlsbEdpZnRCb3ggPSAoXHJcbiAgICAgICAgdGFyOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0dGluZ1RpdGxlOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiA9PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmZpbGxHaWZ0Qm94KCAke3Rhcn0sICR7c2V0dGluZ1RpdGxlfSApYCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCh0YXIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRCb3g6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50Qm94KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlclNldFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3NldHRpbmdUaXRsZX1fdmFsYClcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXhQb2ludHM6IG51bWJlciA9IHBhcnNlSW50KHBvaW50Qm94LmdldEF0dHJpYnV0ZSgnbWF4JykhKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKHVzZXJTZXRQb2ludHMpICYmIHVzZXJTZXRQb2ludHMgPD0gbWF4UG9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFBvaW50cyA9IHVzZXJTZXRQb2ludHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50Qm94LnZhbHVlID0gbWF4UG9pbnRzLnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXhQb2ludHMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgbGlzdCBvZiBhbGwgcmVzdWx0cyBmcm9tIEJyb3dzZSBwYWdlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRTZWFyY2hMaXN0ID0gKCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHNlYXJjaCByZXN1bHRzIHRvIGV4aXN0XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjc3NyIHRyW2lkIF49IFwidGRyXCJdIHRkJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbmF0Y2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+ID0gPFxyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cclxuICAgICAgICAgICAgICAgID5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc3NyIHRyW2lkIF49IFwidGRyXCJdJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc25hdGNoTGlzdCA9PT0gbnVsbCB8fCBzbmF0Y2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNuYXRjaExpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIGdvb2RyZWFkc0J1dHRvbnMgPSBhc3luYyAoXHJcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMuLi4nKTtcclxuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xyXG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XHJcblxyXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggR29vZHJlYWRzJywgJ21wX2dyUm93Jyk7XHJcblxyXG4gICAgICAgIC8vIEV4dHJhY3QgdGhlIFNlcmllcyBhbmQgQXV0aG9yXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAoc2VyaWVzUCA9IFV0aWwuZ2V0Qm9va1NlcmllcyhzZXJpZXNEYXRhKSksXHJcbiAgICAgICAgICAgIChhdXRob3JQID0gVXRpbC5nZXRCb29rQXV0aG9ycyhhdXRob3JEYXRhKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcubXBfZ3JSb3cgLmZsZXgnKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnV0dG9uVGFyOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93IC5mbGV4JylcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChidXR0b25UYXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdXR0b24gcm93IGNhbm5vdCBiZSB0YXJnZXRlZCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIFNlcmllcyBidXR0b25zXHJcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKHNlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXIuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdzZXJpZXMnLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsIGJ1dHRvblRpdGxlLCA0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZXJpZXMgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCdWlsZCBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgYXV0aG9yUFxyXG4gICAgICAgICAgICAudGhlbigoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF1dGgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcnMgPSBhdXRoLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnYXV0aG9yJywgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnQXV0aG9yJywgMyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2Jvb2snLCB0aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGl0bGV9ICR7YXV0aG9yc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIGJvdGhVUkwsICdUaXRsZSArIEF1dGhvcicsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGdlbmVyYXRlIFRpdGxlK0F1dGhvciBsaW5rIVxcblRpdGxlOiAke3RpdGxlfVxcbkF1dGhvcnM6ICR7YXV0aG9yc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRlZCB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIWApO1xyXG4gICAgfTtcclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuXHJcbiAqL1xyXG5jbGFzcyBUb3JHaWZ0RGVmYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3RvckdpZnREZWZhdWx0JyxcclxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDUwMDAsIG1heCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0aGFua3NBcmVhIGlucHV0W25hbWU9cG9pbnRzXSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgbmV3IFNoYXJlZCgpXHJcbiAgICAgICAgICAgIC5maWxsR2lmdEJveCh0aGlzLl90YXIsIHRoaXMuX3NldHRpbmdzLnRpdGxlKVxyXG4gICAgICAgICAgICAudGhlbigocG9pbnRzKSA9PlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0IHRoZSBkZWZhdWx0IGdpZnQgYW1vdW50IHRvICR7cG9pbnRzfWApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBHb29kcmVhZHNcclxuICovXHJcbmNsYXNzIEdvb2RyZWFkc0J1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZ29vZHJlYWRzQnV0dG9uJyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzdWJtaXRJbmZvJztcclxuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgZmVhdHVyZSBzaG91bGQgb25seSBydW4gb24gYm9vayBjYXRlZ29yaWVzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8gW2NsYXNzXj1jYXRdJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2F0ICYmIENoZWNrLmlzQm9va0NhdChwYXJzZUludChjYXQuY2xhc3NOYW1lLnN1YnN0cigzKSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBOb3QgYSBib29rIGNhdGVnb3J5OyBza2lwcGluZyBHb29kcmVhZHMgYnV0dG9ucycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXHJcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcclxuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLl9zaGFyZS5nb29kcmVhZHNCdXR0b25zKGJvb2tEYXRhLCBhdXRob3JEYXRhLCBzZXJpZXNEYXRhLCB0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogR2VuZXJhdGVzIGEgZmllbGQgZm9yIFwiQ3VycmVudGx5IFJlYWRpbmdcIiBiYmNvZGVcclxuICovXHJcbmNsYXNzIEN1cnJlbnRseVJlYWRpbmcgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0aXRsZTogJ2N1cnJlbnRseVJlYWRpbmcnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gZ2VuZXJhdGUgYSBcIkN1cnJlbnRseSBSZWFkaW5nXCIgZm9ydW0gc25pcHBldGAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSc7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgQ3VycmVudGx5IFJlYWRpbmcgc2VjdGlvbi4uLicpO1xyXG4gICAgICAgIC8vIEdldCB0aGUgcmVxdWlyZWQgaW5mb3JtYXRpb25cclxuICAgICAgICBjb25zdCB0aXRsZTogc3RyaW5nID0gZG9jdW1lbnQhLnF1ZXJ5U2VsZWN0b3IoJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnKSFcclxuICAgICAgICAgICAgLnRleHRDb250ZW50ITtcclxuICAgICAgICBjb25zdCBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgdG9ySUQ6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpWzJdO1xyXG4gICAgICAgIGNvbnN0IHJvd1RhcjogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvJyk7XHJcblxyXG4gICAgICAgIC8vIFRpdGxlIGNhbid0IGJlIG51bGxcclxuICAgICAgICBpZiAodGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaXRsZSBmaWVsZCB3YXMgbnVsbGApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgYSBuZXcgdGFibGUgcm93XHJcbiAgICAgICAgY29uc3QgY3JSb3c6IEhUTUxEaXZFbGVtZW50ID0gYXdhaXQgVXRpbC5hZGRUb3JEZXRhaWxzUm93KFxyXG4gICAgICAgICAgICByb3dUYXIsXHJcbiAgICAgICAgICAgICdDdXJyZW50bHkgUmVhZGluZycsXHJcbiAgICAgICAgICAgICdtcF9jclJvdydcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFByb2Nlc3MgZGF0YSBpbnRvIHN0cmluZ1xyXG4gICAgICAgIGNvbnN0IGJsdXJiOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZW5lcmF0ZVNuaXBwZXQodG9ySUQsIHRpdGxlLCBhdXRob3JzKTtcclxuICAgICAgICAvLyBCdWlsZCBidXR0b25cclxuICAgICAgICBjb25zdCBidG46IEhUTUxEaXZFbGVtZW50ID0gYXdhaXQgdGhpcy5fYnVpbGRCdXR0b24oY3JSb3csIGJsdXJiKTtcclxuICAgICAgICAvLyBJbml0IGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGJ0biwgYmx1cmIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBCdWlsZCBhIEJCIENvZGUgdGV4dCBzbmlwcGV0IHVzaW5nIHRoZSBib29rIGluZm8sIHRoZW4gcmV0dXJuIGl0XHJcbiAgICAgKiBAcGFyYW0gaWQgVGhlIHN0cmluZyBJRCBvZiB0aGUgYm9va1xyXG4gICAgICogQHBhcmFtIHRpdGxlIFRoZSBzdHJpbmcgdGl0bGUgb2YgdGhlIGJvb2tcclxuICAgICAqIEBwYXJhbSBhdXRob3JzIEEgbm9kZSBsaXN0IG9mIGF1dGhvciBsaW5rc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZW5lcmF0ZVNuaXBwZXQoXHJcbiAgICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIGF1dGhvcnM6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+XHJcbiAgICApOiBzdHJpbmcge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogQWRkIEF1dGhvciBMaW5rXHJcbiAgICAgICAgICogQHBhcmFtIGF1dGhvckVsZW0gQSBsaW5rIGNvbnRhaW5pbmcgYXV0aG9yIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3QgYWRkQXV0aG9yTGluayA9IChhdXRob3JFbGVtOiBIVE1MQW5jaG9yRWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gYFt1cmw9JHthdXRob3JFbGVtLmhyZWYucmVwbGFjZSgnaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldCcsICcnKX1dJHtcclxuICAgICAgICAgICAgICAgIGF1dGhvckVsZW0udGV4dENvbnRlbnRcclxuICAgICAgICAgICAgfVsvdXJsXWA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCB0aGUgTm9kZUxpc3QgaW50byBhbiBBcnJheSB3aGljaCBpcyBlYXNpZXIgdG8gd29yayB3aXRoXHJcbiAgICAgICAgbGV0IGF1dGhvckFycmF5OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGF1dGhvcnMuZm9yRWFjaCgoYXV0aG9yRWxlbSkgPT4gYXV0aG9yQXJyYXkucHVzaChhZGRBdXRob3JMaW5rKGF1dGhvckVsZW0pKSk7XHJcbiAgICAgICAgLy8gRHJvcCBleHRyYSBpdGVtc1xyXG4gICAgICAgIGlmIChhdXRob3JBcnJheS5sZW5ndGggPiAzKSB7XHJcbiAgICAgICAgICAgIGF1dGhvckFycmF5ID0gWy4uLmF1dGhvckFycmF5LnNsaWNlKDAsIDMpLCAnZXRjLiddO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGBbdXJsPS90LyR7aWR9XSR7dGl0bGV9Wy91cmxdIGJ5IFtpXSR7YXV0aG9yQXJyYXkuam9pbignLCAnKX1bL2ldYDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQnVpbGQgYSBidXR0b24gb24gdGhlIHRvciBkZXRhaWxzIHBhZ2VcclxuICAgICAqIEBwYXJhbSB0YXIgQXJlYSB3aGVyZSB0aGUgYnV0dG9uIHdpbGwgYmUgYWRkZWQgaW50b1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgQ29udGVudCB0aGF0IHdpbGwgYmUgYWRkZWQgaW50byB0aGUgdGV4dGFyZWFcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfYnVpbGRCdXR0b24odGFyOiBIVE1MRGl2RWxlbWVudCwgY29udGVudDogc3RyaW5nKTogSFRNTERpdkVsZW1lbnQge1xyXG4gICAgICAgIC8vIEJ1aWxkIHRleHQgZGlzcGxheVxyXG4gICAgICAgIHRhci5pbm5lckhUTUwgPSBgPHRleHRhcmVhIHJvd3M9XCIxXCIgY29scz1cIjgwXCIgc3R5bGU9J21hcmdpbi1yaWdodDo1cHgnPiR7Y29udGVudH08L3RleHRhcmVhPmA7XHJcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXHJcbiAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKHRhciwgJ25vbmUnLCAnQ29weScsIDIpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9jclJvdyAubXBfYnV0dG9uX2Nsb25lJykhLmNsYXNzTGlzdC5hZGQoJ21wX3JlYWRpbmcnKTtcclxuICAgICAgICAvLyBSZXR1cm4gYnV0dG9uXHJcbiAgICAgICAgcmV0dXJuIDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcmVhZGluZycpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogUHJvdGVjdHMgdGhlIHVzZXIgZnJvbSByYXRpbyB0cm91YmxlcyBieSBhZGRpbmcgd2FybmluZ3MgYW5kIGRpc3BsYXlpbmcgcmF0aW8gZGVsdGFcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0JyxcclxuICAgICAgICBkZXNjOiBgUHJvdGVjdCB5b3VyIHJhdGlvIHdpdGggd2FybmluZ3MgJmFtcDsgcmF0aW8gY2FsY3VsYXRpb25zYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjcmF0aW8nO1xyXG4gICAgcHJpdmF0ZSBfcmNSb3c6IHN0cmluZyA9ICdtcF9yYXRpb0Nvc3RSb3cnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxpbmcgcmF0aW8gcHJvdGVjdGlvbi4uLicpO1xyXG4gICAgICAgIC8vIFRoZSBkb3dubG9hZCB0ZXh0IGFyZWFcclxuICAgICAgICBjb25zdCBkbEJ0bjogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RkZGwnKTtcclxuICAgICAgICAvLyBUaGUgY3VycmVudGx5IHVudXNlZCBsYWJlbCBhcmVhIGFib3ZlIHRoZSBkb3dubG9hZCB0ZXh0XHJcbiAgICAgICAgY29uc3QgZGxMYWJlbDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyNkb3dubG9hZCAudG9yRGV0SW5uZXJUb3AnXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBXb3VsZCBiZWNvbWUgcmF0aW9cclxuICAgICAgICBjb25zdCByTmV3OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgLy8gQ3VycmVudCByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJDdXI6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJyk7XHJcbiAgICAgICAgLy8gU2VlZGluZyBvciBkb3dubG9hZGluZ1xyXG4gICAgICAgIGNvbnN0IHNlZWRpbmc6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjRExoaXN0b3J5Jyk7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgY3VzdG9tIHJhdGlvIGFtb3VudHMgKHdpbGwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzIG90aGVyd2lzZSlcclxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSB0aGlzLl9jaGVja0N1c3RvbVNldHRpbmdzKCk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgUmF0aW8gcHJvdGVjdGlvbiBsZXZlbHMgc2V0IHRvOiAke3IxfSwgJHtyMn0sICR7cjN9YCk7XHJcblxyXG4gICAgICAgIC8vIE9ubHkgcnVuIHRoZSBjb2RlIGlmIHRoZSByYXRpbyBleGlzdHNcclxuICAgICAgICBpZiAock5ldyAmJiByQ3VyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJEaWZmID0gVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gLSBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXTtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgYEN1cnJlbnQgJHtVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXX0gfCBOZXcgJHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF1cclxuICAgICAgICAgICAgICAgICAgICB9IHwgRGlmICR7ckRpZmZ9YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIE9ubHkgYWN0aXZhdGUgaWYgYSByYXRpbyBjaGFuZ2UgaXMgZXhwZWN0ZWRcclxuICAgICAgICAgICAgaWYgKCFpc05hTihyRGlmZikgJiYgckRpZmYgPiAwLjAwOSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWVkaW5nICYmIGRsTGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBOT1QgYWxyZWFkeSBzZWVkaW5nIG9yIGRvd25sb2FkaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5pbm5lckhUTUwgPSBgUmF0aW8gbG9zcyAke3JEaWZmLnRvRml4ZWQoMil9YDtcclxuICAgICAgICAgICAgICAgICAgICBkbExhYmVsLnN0eWxlLmZvbnRXZWlnaHQgPSAnbm9ybWFsJzsgLy9UbyBkaXN0aW5ndWlzaCBmcm9tIEJPTEQgVGl0bGVzXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIGxpbmUgdW5kZXIgVG9ycmVudDogZGV0YWlsIGZvciBDb3N0IGRhdGEgXCJDb3N0IHRvIFJlc3RvcmUgUmF0aW9cIlxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignLnRvckRldEJvdHRvbScpIVxyXG4gICAgICAgICAgICAgICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCIgaWQ9XCJNcnBfcm93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj5Db3N0IHRvIFJlc3RvcmUgUmF0aW88L2Rpdj48ZGl2IGNsYXNzPVwidG9yRGV0UmlnaHQgJHt0aGlzLl9yY1Jvd31cIj48c3BhbiBpZD1cIm1wX2Zvb2JhclwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgJiBEaXNwbGF5IGNvc3Qgb2YgZG93bmxvYWQgdy9vIEZMXHJcbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgc2hvdyBjYWxjdWxhdGlvbnMgd2hlbiB0aGVyZSBpcyBhIHJhdGlvIGxvc3NcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNpemVFbGVtOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAnI3NpemUgc3BhbidcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZUVsZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gc2l6ZUVsZW0udGV4dENvbnRlbnQhLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2l6ZU1hcCA9IFsnQnl0ZXMnLCAnS0InLCAnTUInLCAnR0InLCAnVEInXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IGh1bWFuIHJlYWRhYmxlIHNpemUgdG8gYnl0ZXNcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBieXRlU2l6ZWQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIoc2l6ZVswXSkgKiBNYXRoLnBvdygxMDI0LCBzaXplTWFwLmluZGV4T2Yoc2l6ZVsxXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY292ZXJ5ID0gYnl0ZVNpemVkICogTnVtYmVyKHJDdXIuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb2ludEFtbnQgPSBNYXRoLmZsb29yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMTI1ICogcmVjb3ZlcnkpIC8gMjY4NDM1NDU2XHJcbiAgICAgICAgICAgICAgICAgICAgKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmF0aW8gY29zdCByb3dcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7dGhpcy5fcmNSb3d9YFxyXG4gICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IGA8Yj4ke1V0aWwuZm9ybWF0Qnl0ZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY292ZXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgKX08L2I+Jm5ic3A7dXBsb2FkICgke3BvaW50QW1udH0gQlApLiZuYnNwOzxhYmJyIHRpdGxlPSdDb250cmlidXRpbmcgMiwwMDAgQlAgdG8gZWFjaCB2YXVsdCBjeWNsZSBnaXZlcyB5b3UgYWxtb3N0IG9uZSBGTCB3ZWRnZSBwZXIgZGF5IG9uIGF2ZXJhZ2UuJz5baW5mb108L2FiYnI+YDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdHlsZSB0aGUgZG93bmxvYWQgYnV0dG9uIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgbGV2ZWwgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIGlmIChkbEJ0biAmJiBkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJ0cml2aWFsIHJhdGlvIGxvc3NcIiB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBjaGFuZ2VzIHdpbGwgYWx3YXlzIGhhcHBlbiBpZiB0aGUgcmF0aW8gY29uZGl0aW9ucyBhcmUgbWV0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJEaWZmID4gcjEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1NwcmluZ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuY29sb3IgPSAnYmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJJIG5ldmVyIHdhbnQgdG8gZGwgdy9vIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHVzZXMgdGhlIE1pbmltdW0gUmF0aW8sIGlmIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIGRpc2FibGUgYnV0dG9uIHdpdGggYnV5IEZMIGJ1dHRvblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCBHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TWluX3ZhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy8vRGlzYWJsZSBsaW5rIHRvIHByZXZlbnQgZG93bmxvYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8vLyBkbEJ0bi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5jdXJzb3IgPSAnbm8tZHJvcCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1heWJlIGhpZGUgdGhlIGJ1dHRvbiwgYW5kIGFkZCB0aGUgUmF0aW8gTG9zcyB3YXJuaW5nIGluIGl0cyBwbGFjZT9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uaW5uZXJIVE1MID0gJ0ZMIFJlY29tbWVuZGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyRGlmZiA+IHIyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jaGVja0N1c3RvbVNldHRpbmdzKCkge1xyXG4gICAgICAgIGxldCBsMSA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwxX3ZhbCcpKTtcclxuICAgICAgICBsZXQgbDIgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMl92YWwnKSk7XHJcbiAgICAgICAgbGV0IGwzID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDNfdmFsJykpO1xyXG5cclxuICAgICAgICBpZiAoaXNOYU4obDMpKSBsMyA9IDE7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSAyIC8gMztcclxuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IDEgLyAzO1xyXG5cclxuICAgICAgICAvLyBJZiBzb21lb25lIHB1dCB0aGluZ3MgaW4gYSBkdW1iIG9yZGVyLCBpZ25vcmUgc21hbGxlciBudW1iZXJzXHJcbiAgICAgICAgaWYgKGwyID4gbDMpIGwyID0gbDM7XHJcbiAgICAgICAgaWYgKGwxID4gbDIpIGwxID0gbDI7XHJcblxyXG4gICAgICAgIC8vIElmIGN1c3RvbSBudW1iZXJzIGFyZSBzbWFsbGVyIHRoYW4gZGVmYXVsdCB2YWx1ZXMsIGlnbm9yZSB0aGUgbG93ZXIgd2FybmluZ1xyXG4gICAgICAgIGlmIChpc05hTihsMikpIGwyID0gbDMgPCAyIC8gMyA/IGwzIDogMiAvIDM7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSBsMiA8IDEgLyAzID8gbDIgOiAxIC8gMztcclxuXHJcbiAgICAgICAgcmV0dXJuIFtsMSwgbDIsIGwzXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIExvdyByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMScsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMScsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjMnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIHNtYWxsZXN0IHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBzbGlnaHQgY29sb3IgY2hhbmdlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTZXQgY3VzdG9tIEwxIFJhdGlvIFByb3RlY3Rpb24hJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIE1lZGl1bSByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDIgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMicsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMicsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjYnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIG1lZGlhbiB0aHJlc2hob2xkIHRvIHdhcm4gb2YgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgbm90aWNlYWJsZSBjb2xvciBjaGFuZ2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNldCBjdXN0b20gTDIgUmF0aW8gUHJvdGVjdGlvbiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogSGlnaCByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMycsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAxJyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBoaWdoZXN0IHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgZGlzYWJsZXMgZG93bmxvYWQgd2l0aG91dCBGTCB1c2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNldCBjdXN0b20gTDIgUmF0aW8gUHJvdGVjdGlvbiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TWluIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TWluJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0YWc6ICdNaW5pbXVtIFJhdGlvJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMDAnLFxyXG4gICAgICAgIGRlc2M6ICdUcmlnZ2VyIHRoZSBtYXhpbXVtIHdhcm5pbmcgaWYgeW91ciByYXRpbyB3b3VsZCBkcm9wIGJlbG93IHRoaXMgbnVtYmVyLicsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuICAgIC8vIFRoZSBjb2RlIHRoYXQgcnVucyB3aGVuIHRoZSBmZWF0dXJlIGlzIGNyZWF0ZWQgb24gYGZlYXR1cmVzLnRzYC5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIEFkZCAxKyB2YWxpZCBwYWdlIHR5cGUuIEV4Y2x1ZGUgZm9yIGdsb2JhbFxyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgY3VzdG9tIG1pbmltdW0gcmF0aW8hJyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogQWxsb3dzIGdpZnRpbmcgb2YgRkwgd2VkZ2UgdG8gbWVtYmVycyB0aHJvdWdoIGZvcnVtLlxyXG4gKi9cclxuY2xhc3MgRm9ydW1GTEdpZnQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkZvcnVtLFxyXG4gICAgICAgIHRpdGxlOiAnZm9ydW1GTEdpZnQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBUaGFuayBidXR0b24gdG8gZm9ydW0gcG9zdHMuICg8ZW0+U2VuZHMgYSBGTCB3ZWRnZTwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLmZvcnVtTGluayc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmb3J1bSB0aHJlYWQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIEZvcnVtIEdpZnQgQnV0dG9uLi4uJyk7XHJcbiAgICAgICAgLy9tYWluQm9keSBpcyBiZXN0IGVsZW1lbnQgd2l0aCBhbiBJRCBJIGNvdWxkIGZpbmQgdGhhdCBpcyBhIHBhcmVudCB0byBhbGwgZm9ydW0gcG9zdHNcclxuICAgICAgICBjb25zdCBtYWluQm9keSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKTtcclxuICAgICAgICAvL21ha2UgYXJyYXkgb2YgZm9ydW0gcG9zdHMgLSB0aGVyZSBpcyBvbmx5IG9uZSBjdXJzb3IgY2xhc3NlZCBvYmplY3QgcGVyIGZvcnVtIHBvc3QsIHNvIHRoaXMgd2FzIGJlc3QgdG8ga2V5IG9mZiBvZi4gd2lzaCB0aGVyZSB3ZXJlIG1vcmUgSURzIGFuZCBzdWNoIHVzZWQgaW4gZm9ydW1zXHJcbiAgICAgICAgY29uc3QgZm9ydW1Qb3N0czogSFRNTEFuY2hvckVsZW1lbnRbXSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKFxyXG4gICAgICAgICAgICBtYWluQm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2x0YWJsZScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2ZvciBlYWNoIHBvc3Qgb24gdGhlIHBhZ2VcclxuICAgICAgICBmb3J1bVBvc3RzLmZvckVhY2goKGZvcnVtUG9zdCkgPT4ge1xyXG4gICAgICAgICAgICAvL3dvcmsgb3VyIHdheSBkb3duIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwgdG8gZ2V0IHRvIG91ciBwb3N0XHJcbiAgICAgICAgICAgIGxldCBib3R0b21Sb3cgPSBmb3J1bVBvc3QuY2hpbGROb2Rlc1sxXTtcclxuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbNF07XHJcbiAgICAgICAgICAgIGJvdHRvbVJvdyA9IGJvdHRvbVJvdy5jaGlsZE5vZGVzWzNdO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgSUQgb2YgdGhlIGZvcnVtIGZyb20gdGhlIGN1c3RvbSBNQU0gYXR0cmlidXRlXHJcbiAgICAgICAgICAgIGxldCBwb3N0SUQgPSAoPEhUTUxFbGVtZW50PmZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgLy9tYW0gZGVjaWRlZCB0byBoYXZlIGEgZGlmZmVyZW50IHN0cnVjdHVyZSBmb3IgbGFzdCBmb3J1bS4gd2lzaCB0aGV5IGp1c3QgaGFkIElEcyBvciBzb21ldGhpbmcgaW5zdGVhZCBvZiBhbGwgdGhpcyBqdW1waW5nIGFyb3VuZFxyXG4gICAgICAgICAgICBpZiAocG9zdElEID09PSAnbGFzdCcpIHtcclxuICAgICAgICAgICAgICAgIHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchLnByZXZpb3VzU2libGluZyFcclxuICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGVsZW1lbnQgZm9yIG91ciBmZWF0dXJlXHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgICAgICAvL3NldCBzYW1lIGNsYXNzIGFzIG90aGVyIG9iamVjdHMgaW4gYXJlYSBmb3Igc2FtZSBwb2ludGVyIGFuZCBmb3JtYXR0aW5nIG9wdGlvbnNcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjdXJzb3InKTtcclxuICAgICAgICAgICAgLy9naXZlIG91ciBlbGVtZW50IGFuIElEIGZvciBmdXR1cmUgc2VsZWN0aW9uIGFzIG5lZWRlZFxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wXycgKyBwb3N0SUQgKyAnX3RleHQnKTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbmV3IGltZyBlbGVtZW50IHRvIGxlYWQgb3VyIG5ldyBmZWF0dXJlIHZpc3VhbHNcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEljb25HaWYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgLy91c2Ugc2l0ZSBmcmVlbGVlY2ggZ2lmIGljb24gZm9yIG91ciBmZWF0dXJlXHJcbiAgICAgICAgICAgIGdpZnRJY29uR2lmLnNldEF0dHJpYnV0ZShcclxuICAgICAgICAgICAgICAgICdzcmMnLFxyXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvMTA4MzAzL3RoYW5rLmdpZidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgLy9tYWtlIHRoZSBnaWYgaWNvbiB0aGUgZmlyc3QgY2hpbGQgb2YgZWxlbWVudFxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChnaWZ0SWNvbkdpZik7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSBmZWF0dXJlIGVsZW1lbnQgaW4gbGluZSB3aXRoIHRoZSBjdXJzb3Igb2JqZWN0IHdoaWNoIGlzIHRoZSBxdW90ZSBhbmQgcmVwb3J0IGJ1dHRvbnMgYXQgYm90dG9tXHJcbiAgICAgICAgICAgIGJvdHRvbVJvdy5hcHBlbmRDaGlsZChnaWZ0RWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICAvL21ha2UgaXQgYSBidXR0b24gdmlhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdG8gYXZvaWQgYnV0dG9uIHRyaWdnZXJpbmcgbW9yZSB0aGFuIG9uY2UgcGVyIHBhZ2UgbG9hZCwgY2hlY2sgaWYgYWxyZWFkeSBoYXZlIGpzb24gcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kdWUgdG8gbGFjayBvZiBJRHMgYW5kIGNvbmZsaWN0aW5nIHF1ZXJ5IHNlbGVjdGFibGUgZWxlbWVudHMsIG5lZWQgdG8ganVtcCB1cCBhIGZldyBwYXJlbnQgbGV2ZWxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RQYXJlbnROb2RlID0gZ2lmdEVsZW1lbnQucGFyZW50RWxlbWVudCEucGFyZW50RWxlbWVudCFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnRFbGVtZW50ITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmNlIGF0IHBhcmVudCBub2RlIG9mIHRoZSBwb3N0LCBmaW5kIHRoZSBwb3N0ZXIncyB1c2VyIGlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJFbGVtID0gcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi91L1wiXWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgVVJMIG9mIHRoZSBwb3N0IHRvIGFkZCB0byBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RVUkwgPSAoPEhUTUxFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoYGFbaHJlZl49XCIvZi90L1wiXWApIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgTUFNIHVzZXIgc2VuZGluZyBnaWZ0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZW5kZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck1lbnUnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFuIHVwIHRleHQgb2Ygc2VuZGVyIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIgPSBzZW5kZXIuc3Vic3RyaW5nKDAsIHNlbmRlci5pbmRleE9mKCcgJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdGl0bGUgb2YgdGhlIHBhZ2Ugc28gd2UgY2FuIHdyaXRlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcnVtVGl0bGUgPSBkb2N1bWVudC50aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jdXQgZG93biBmbHVmZiBmcm9tIHBhZ2UgdGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ydW1UaXRsZSA9IGZvcnVtVGl0bGUuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlLmluZGV4T2YoJ3wnKSAtIDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSAoPEhUTUxFbGVtZW50PnVzZXJFbGVtISkuaW5uZXJUZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIGEgZ2lmdCByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1zZW5kV2VkZ2UmZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtzZW5kZXJ9IHdhbnRzIHRvIHRoYW5rIHlvdSBmb3IgeW91ciBjb250cmlidXRpb24gdG8gdGhlIGZvcnVtIHRvcGljIFt1cmw9aHR0cHM6Ly9teWFub25hbW91c2UubmV0JHtwb3N0VVJMfV0ke2ZvcnVtVGl0bGV9Wy91cmxdYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlICMgVVJJIGNvbXBhdGlibGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJyMnLCAnJTIzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlIE1BTSsganNvbiBnZXQgdXRpbGl0eSB0byBwcm9jZXNzIFVSTCBhbmQgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvblJlc3VsdDogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgZ2lmdCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgdGV4dCB0byBzaG93IHN1Y2Nlc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdGTCBHaWZ0IFN1Y2Nlc3NmdWwhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Jhc2VkIG9uIGZhaWx1cmUsIGFkZCBmZWF0dXJlIHRleHQgdG8gc2hvdyBmYWlsdXJlIHJlYXNvbiBvciBnZW5lcmljXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yID09PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1lvdSBjYW4gb25seSBzZW5kIGEgdXNlciBvbmUgd2VkZ2UgcGVyIGRheS4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IEFscmVhZHkgR2lmdGVkIFRoaXMgVXNlciBUb2RheSEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSW52YWxpZCB1c2VyLCB0aGlzIHVzZXIgaXMgbm90IGN1cnJlbnRseSBhY2NlcHRpbmcgd2VkZ2VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkOiBUaGlzIFVzZXIgRG9lcyBOb3QgQWNjZXB0IEdpZnRzISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmx5IGtub3duIGV4YW1wbGUgb2YgdGhpcyAnb3RoZXInIGlzIHdoZW4gZ2lmdGluZyB5b3Vyc2VsZlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgRmFpbGVkIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBQcm9jZXNzICYgcmV0dXJuIGluZm9ybWF0aW9uIGZyb20gdGhlIHNob3V0Ym94XHJcbiAqL1xyXG5jbGFzcyBQcm9jZXNzU2hvdXRzIHtcclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIHNob3V0Ym94IGZvciBjaGFuZ2VzLCB0cmlnZ2VyaW5nIGFjdGlvbnMgZm9yIGZpbHRlcmVkIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIG5hbWVzIChPcHRpb25hbCkgTGlzdCBvZiB1c2VybmFtZXMvSURzIHRvIGZpbHRlciBmb3JcclxuICAgICAqIEBwYXJhbSB1c2VydHlwZSAoT3B0aW9uYWwpIFdoYXQgZmlsdGVyIHRoZSBuYW1lcyBhcmUgZm9yLiBSZXF1aXJlZCBpZiBgbmFtZXNgIGlzIHByb3ZpZGVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTaG91dGJveChcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBuYW1lcz86IHN0cmluZ1tdLFxyXG4gICAgICAgIHVzZXJ0eXBlPzogU2hvdXRib3hVc2VyVHlwZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgICAgIHRhcixcclxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGU6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBsb29raW5nIGZvciBzcGVjaWZpYyB1c2Vycy4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXMgIT09IHVuZGVmaW5lZCAmJiBuYW1lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlcnR5cGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZXJ0eXBlIG11c3QgYmUgZGVmaW5lZCBpZiBmaWx0ZXJpbmcgbmFtZXMhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySUQ6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWZePVwiL3UvXCJdJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHJlZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAvdS8ke25hbWV9YCA9PT0gdXNlcklEIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2FzZWxlc3NTdHJpbmdNYXRjaChuYW1lLCB1c2VyTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZVNob3V0KG5vZGUsIHVzZXJ0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIHNob3V0Ym94IGZvciBjaGFuZ2VzLCB0cmlnZ2VyaW5nIGFjdGlvbnMgZm9yIGZpbHRlcmVkIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIGJ1dHRvbnMgTnVtYmVyIHRvIHJlcHJlc2VudCBjaGVja2JveCBzZWxlY3Rpb25zIDEgPSBSZXBseSwgMiA9IFJlcGx5IFdpdGggUXVvdGVcclxuICAgICAqIEBwYXJhbSBjaGFyTGltaXQgTnVtYmVyIG9mIGNoYXJhY3RlcnMgdG8gaW5jbHVkZSBpbiBxdW90ZSwgLCBjaGFyTGltaXQ/Om51bWJlciAtIEN1cnJlbnRseSB1bnVzZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB3YXRjaFNob3V0Ym94UmVwbHkodGFyOiBzdHJpbmcsIGJ1dHRvbnM/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCd3YXRjaFNob3V0Ym94UmVwbHkoJywgdGFyLCBidXR0b25zLCAnKScpO1xyXG5cclxuICAgICAgICBjb25zdCBfZ2V0VUlEID0gKG5vZGU6IE5vZGUpOiBzdHJpbmcgPT5cclxuICAgICAgICAgICAgdGhpcy5leHRyYWN0RnJvbVNob3V0KG5vZGUsICdhW2hyZWZePVwiL3UvXCJdJywgJ2hyZWYnKTtcclxuXHJcbiAgICAgICAgY29uc3QgX2dldFJhd0NvbG9yID0gKGVsZW06IEhUTUxTcGFuRWxlbWVudCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtLnN0eWxlLmNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5zdHlsZS5jb2xvcjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBfZ2V0TmFtZUNvbG9yID0gKGVsZW06IEhUTUxTcGFuRWxlbWVudCB8IG51bGwpOiBzdHJpbmcgfCBudWxsID0+IHtcclxuICAgICAgICAgICAgaWYgKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0NvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldFJhd0NvbG9yKGVsZW0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJhd0NvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0byBoZXhcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZ2I6IHN0cmluZ1tdID0gVXRpbC5icmFja2V0Q29udGVudHMocmF3Q29sb3IpLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWwucmdiVG9IZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlsxXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlsyXSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBudWxsIVxcbiR7ZWxlbX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgX21ha2VOYW1lVGFnID0gKG5hbWU6IHN0cmluZywgaGV4OiBzdHJpbmcgfCBudWxsLCB1aWQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIHVpZCA9IHVpZC5tYXRjaCgvXFxkKy9nKSEuam9pbignJyk7IC8vIEdldCB0aGUgVUlELCBidXQgb25seSB0aGUgZGlnaXRzXHJcbiAgICAgICAgICAgIGhleCA9IGhleCA/IGA7JHtoZXh9YCA6ICcnOyAvLyBJZiB0aGVyZSBpcyBhIGhleCB2YWx1ZSwgcHJlcGVuZCBgO2BcclxuICAgICAgICAgICAgcmV0dXJuIGBAW3VsaW5rPSR7dWlkfSR7aGV4fV0ke25hbWV9Wy91bGlua11gO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcmVwbHkgYm94XHJcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xyXG4gICAgICAgIC8vIE9ic2VydmUgdGhlIHNob3V0Ym94XHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKFxyXG4gICAgICAgICAgICB0YXIsXHJcbiAgICAgICAgICAgIChtdXRMaXN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzaG91dGJveCB1cGRhdGVzLCBwcm9jZXNzIHRoZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgbXV0TGlzdC5mb3JFYWNoKChtdXRSZWMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGNoYW5nZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgICAgICBtdXRSZWMuYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYWRkZWQgYnkgTUFNKyBmb3IgZ2lmdCBidXR0b24sIGlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIGlnbm9yZSBpZiB0aGUgbm9kZSBpcyBhIGRhdGUgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15tcF8vLnRlc3Qobm9kZURhdGEuZ2V0QXR0cmlidXRlKCdpZCcpISkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgbmFtZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG91dE5hbWU6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBVdGlsLm5vZGVUb0VsZW0oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkucXVlcnlTZWxlY3RvcignYVtocmVmXj1cIi91L1wiXSBzcGFuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyYWIgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIG5hbWUsIG9yIHRleHQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZUNvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldE5hbWVDb2xvcihzaG91dE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2V4dHJhY3QgdGhlIHVzZXJuYW1lIGZyb20gbm9kZSBmb3IgdXNlIGluIHJlcGx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySUQ6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHJlZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBzcGFuIGVsZW1lbnQgdG8gYmUgYm9keSBvZiBidXR0b24gYWRkZWQgdG8gcGFnZSAtIGJ1dHRvbiB1c2VzIHJlbGF0aXZlIG5vZGUgY29udGV4dCBhdCBjbGljayB0aW1lIHRvIGRvIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBseUJ1dHRvbjogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgYSBSZXBseVNpbXBsZSByZXF1ZXN0LCB0aGVuIGNyZWF0ZSBSZXBseSBTaW1wbGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidXR0b25zID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBidXR0b24gd2l0aCBvbmNsaWNrIGFjdGlvbiBvZiBzZXR0aW5nIHNiIHRleHQgZmllbGQgdG8gdXNlcm5hbWUgd2l0aCBwb3RlbnRpYWwgY29sb3IgYmxvY2sgd2l0aCBhIGNvbG9uIGFuZCBzcGFjZSB0byByZXBseSwgZm9jdXMgY3Vyc29yIGluIHRleHQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5pbm5lckhUTUwgPSAnPGJ1dHRvbj5cXHUyOTNhPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBzdHlsZWQgbmFtZSB0YWcgdG8gdGhlIHJlcGx5IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBub3RoaW5nIHdhcyBpbiB0aGUgcmVwbHkgYm94LCBhZGQgYSBjb2xvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVwbHlCb3gudmFsdWUgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gJHtfbWFrZU5hbWVUYWcodXNlck5hbWUsIG5hbWVDb2xvciwgdXNlcklEKX0gYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBhIHJlcGx5UXVvdGUgcmVxdWVzdCwgdGhlbiBjcmVhdGUgcmVwbHkgcXVvdGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGJ1dHRvbnMgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGJ1dHRvbiB3aXRoIG9uY2xpY2sgYWN0aW9uIG9mIGdldHRpbmcgdGhhdCBsaW5lJ3MgdGV4dCwgc3RyaXBwaW5nIGRvd24gdG8gNjUgY2hhciB3aXRoIG5vIHdvcmQgYnJlYWssIHRoZW4gaW5zZXJ0IGludG8gU0IgdGV4dCBmaWVsZCwgZm9jdXMgY3Vyc29yIGluIHRleHQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5pbm5lckhUTUwgPSAnPGJ1dHRvbj5cXHUyOTNkPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMucXVvdGVTaG91dChub2RlLCA2NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHF1b3RlIHRvIHJlcGx5IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtfbWFrZU5hbWVUYWcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJRFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX06IFxcdTIwMWNbaV0ke3RleHR9Wy9pXVxcdTIwMWQgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHJlcGx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dpdmUgc3BhbiBhbiBJRCBmb3IgcG90ZW50aWFsIHVzZSBsYXRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ21wX3JlcGx5QnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaW5zZXJ0IGJ1dHRvbiBwcmlvciB0byB1c2VybmFtZSBvciBhbm90aGVyIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZShyZXBseUJ1dHRvbiwgbm9kZS5jaGlsZE5vZGVzWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7IGNoaWxkTGlzdDogdHJ1ZSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHF1b3RlU2hvdXQoc2hvdXQ6IE5vZGUsIGxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgdGV4dEFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAvLyBHZXQgbnVtYmVyIG9mIHJlcGx5IGJ1dHRvbnMgdG8gcmVtb3ZlIGZyb20gdGV4dFxyXG4gICAgICAgIGNvbnN0IGJ0bkNvdW50ID0gc2hvdXQuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgJy5tcF9yZXBseUJ1dHRvbidcclxuICAgICAgICApLmxlbmd0aDtcclxuICAgICAgICAvLyBHZXQgdGhlIHRleHQgb2YgYWxsIGNoaWxkIG5vZGVzXHJcbiAgICAgICAgc2hvdXQuY2hpbGROb2Rlcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAvKiBJZiB0aGUgY2hpbGQgaXMgYSBub2RlIHdpdGggY2hpbGRyZW4gKGV4LiBub3QgcGxhaW4gdGV4dCkgY2hlY2sgdG8gc2VlIGlmXHJcbiAgICAgICAgICAgIHRoZSBjaGlsZCBpcyBhIGxpbmsuIElmIHRoZSBsaW5rIGRvZXMgTk9UIHN0YXJ0IHdpdGggYC91L2AgKGluZGljYXRpbmcgYSB1c2VyKVxyXG4gICAgICAgICAgICB0aGVuIGNoYW5nZSB0aGUgbGluayB0byB0aGUgc3RyaW5nIGBbTGlua11gLlxyXG4gICAgICAgICAgICBJbiBhbGwgb3RoZXIgY2FzZXMsIHJldHVybiB0aGUgY2hpbGQgdGV4dCBjb250ZW50LiAqL1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVsZW0gPSBVdGlsLm5vZGVUb0VsZW0oY2hpbGQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY2hpbGRFbGVtLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkRWxlbS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSEuaW5kZXhPZignL3UvJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKCdbTGlua10nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goY2hpbGQudGV4dENvbnRlbnQhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIE1ha2UgYSBzdHJpbmcsIGJ1dCB0b3NzIG91dCB0aGUgZmlyc3QgZmV3IG5vZGVzXHJcbiAgICAgICAgbGV0IG5vZGVUZXh0ID0gdGV4dEFyci5zbGljZSgzICsgYnRuQ291bnQpLmpvaW4oJycpO1xyXG4gICAgICAgIGlmIChub2RlVGV4dC5pbmRleE9mKCc6JykgPT09IDApIHtcclxuICAgICAgICAgICAgbm9kZVRleHQgPSBub2RlVGV4dC5zdWJzdHIoMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGhhdmUganVzdCB0aGUgbWVzc2FnZSB0ZXh0LlxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgcXVvdGVzIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkOlxyXG4gICAgICAgIG5vZGVUZXh0ID0gbm9kZVRleHQucmVwbGFjZSgvXFx1ezIwMWN9KC4qPylcXHV7MjAxZH0vZ3UsICcnKTtcclxuICAgICAgICAvLyBUcmltIHRoZSB0ZXh0IHRvIGEgbWF4IGxlbmd0aCBhbmQgYWRkIC4uLiBpZiBzaG9ydGVuZWRcclxuICAgICAgICBsZXQgdHJpbW1lZFRleHQgPSBVdGlsLnRyaW1TdHJpbmcobm9kZVRleHQudHJpbSgpLCBsZW5ndGgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkVGV4dCAhPT0gbm9kZVRleHQudHJpbSgpKSB7XHJcbiAgICAgICAgICAgIHRyaW1tZWRUZXh0ICs9ICcgW1xcdTIwMjZdJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG9uZSFcclxuICAgICAgICByZXR1cm4gdHJpbW1lZFRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeHRyYWN0IGluZm9ybWF0aW9uIGZyb20gc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gc2hvdXQgVGhlIG5vZGUgY29udGFpbmluZyBzaG91dCBpbmZvXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHNlbGVjdG9yIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGdldCBUaGUgcmVxdWVzdGVkIGluZm8gKGhyZWYgb3IgdGV4dClcclxuICAgICAqIEByZXR1cm5zIFRoZSBzdHJpbmcgdGhhdCB3YXMgc3BlY2lmaWVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICBzaG91dDogTm9kZSxcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBnZXQ6ICdocmVmJyB8ICd0ZXh0J1xyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKTtcclxuXHJcbiAgICAgICAgaWYgKHNob3V0ICE9PSBudWxsICYmICFub2RlRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgIHRhclxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoc2hvdXRFbGVtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXh0cmFjdGVkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldCAhPT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLmdldEF0dHJpYnV0ZShnZXQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBleHRyYWN0ZWQgPSBzaG91dEVsZW0udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFjdGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgQXR0cmlidXRlIHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBFbGVtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBOb2RlIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIHRoZSBzdHlsZSBvZiBhIHNob3V0IGJhc2VkIG9uIGZpbHRlciBsaXN0c1xyXG4gICAgICogQHBhcmFtIHNob3V0IFRoZSBub2RlIGNvbnRhaW5pbmcgc2hvdXQgaW5mb1xyXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIFRoZSB0eXBlIG9mIHVzZXJzIHRoYXQgaGF2ZSBiZWVuIGZpbHRlcmVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc3R5bGVTaG91dChzaG91dDogTm9kZSwgdXNlcnR5cGU6IFNob3V0Ym94VXNlclR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50ID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KTtcclxuICAgICAgICBpZiAodXNlcnR5cGUgPT09ICdwcmlvcml0eScpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tU3R5bGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdwcmlvcml0eVN0eWxlX3ZhbCcpO1xyXG4gICAgICAgICAgICBpZiAoY3VzdG9tU3R5bGUpIHtcclxuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gYGhzbGEoJHtjdXN0b21TdHlsZX0pYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gJ2hzbGEoMCwwJSw1MCUsMC4zKSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHVzZXJ0eXBlID09PSAnbXV0ZScpIHtcclxuICAgICAgICAgICAgc2hvdXRFbGVtLmNsYXNzTGlzdC5hZGQoJ21wX211dGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBQcmlvcml0eVVzZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwcmlvcml0eVVzZXJzJyxcclxuICAgICAgICB0YWc6ICdFbXBoYXNpemUgVXNlcnMnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIHN5c3RlbSwgMjU0MjAsIDc3NjE4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnRW1waGFzaXplcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94LiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9wcmlvcml0eVVzZXJzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfdXNlclR5cGU6IFNob3V0Ym94VXNlclR5cGUgPSAncHJpb3JpdHknO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgIGlmIChnbVZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJpb3JpdHlVc2VycyA9IGF3YWl0IFV0aWwuY3N2VG9BcnJheShnbVZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXJsaXN0IGlzIG5vdCBkZWZpbmVkIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9wcmlvcml0eVVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSGlnaGxpZ2h0aW5nIHVzZXJzIGluIHRoZSBzaG91dGJveC4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBwcmlvcml0eSB1c2Vyc1xyXG4gKi9cclxuY2xhc3MgUHJpb3JpdHlTdHlsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncHJpb3JpdHlTdHlsZScsXHJcbiAgICAgICAgdGFnOiAnRW1waGFzaXMgU3R5bGUnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMCwgMCUsIDUwJSwgMC4zJyxcclxuICAgICAgICBkZXNjOiBgQ2hhbmdlIHRoZSBjb2xvci9vcGFjaXR5IG9mIHRoZSBoaWdobGlnaHRpbmcgcnVsZSBmb3IgZW1waGFzaXplZCB1c2VycycgcG9zdHMuICg8ZW0+VGhpcyBpcyBmb3JtYXR0ZWQgYXMgSHVlICgwLTM2MCksIFNhdHVyYXRpb24gKDAtMTAwJSksIExpZ2h0bmVzcyAoMC0xMDAlKSwgT3BhY2l0eSAoMC0xKTwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldHRpbmcgY3VzdG9tIGhpZ2hsaWdodCBmb3IgcHJpb3JpdHkgdXNlcnMuLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gZGVzaXJlZCBtdXRlZCB1c2Vyc1xyXG4gKi9cclxuY2xhc3MgTXV0ZWRVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnbXV0ZWRVc2VycycsXHJcbiAgICAgICAgdGFnOiAnTXV0ZSB1c2VycycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTIzNCwgZ2FyZGVuc2hhZGUnLFxyXG4gICAgICAgIGRlc2M6IGBPYnNjdXJlcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94IHVudGlsIGhvdmVyZWQuICg8ZW0+VGhpcyBhY2NlcHRzIHVzZXIgSURzIGFuZCB1c2VybmFtZXMuIEl0IGlzIG5vdCBjYXNlIHNlbnNpdGl2ZS48L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX211dGVkVXNlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdtdXRlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBnbVZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShgJHt0aGlzLnNldHRpbmdzLnRpdGxlfV92YWxgKTtcclxuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX211dGVkVXNlcnMgPSBhd2FpdCBVdGlsLmNzdlRvQXJyYXkoZ21WYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94KHRoaXMuX3RhciwgdGhpcy5fbXV0ZWRVc2VycywgdGhpcy5fdXNlclR5cGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE9ic2N1cmluZyBtdXRlZCB1c2Vycy4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIEdpZnQgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0IFRyaXBsZSBkb3QgbWVudVxyXG4gKi9cclxuY2xhc3MgR2lmdEJ1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnaWZ0QnV0dG9uJyxcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgR2lmdCBidXR0b24gaW4gU2hvdXRib3ggZG90LW1lbnVgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEluaXRpYWxpemVkIEdpZnQgQnV0dG9uLmApO1xyXG4gICAgICAgIGNvbnN0IHNiZkRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJykhO1xyXG4gICAgICAgIGNvbnN0IHNiZkRpdkNoaWxkID0gc2JmRGl2IS5maXJzdENoaWxkO1xyXG5cclxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbmV2ZXIgc29tZXRoaW5nIGlzIGNsaWNrZWQgaW4gdGhlIHNiZiBkaXZcclxuICAgICAgICBzYmZEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvL3B1bGwgdGhlIGV2ZW50IHRhcmdldCBpbnRvIGFuIEhUTUwgRWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIFRyaXBsZSBEb3QgTWVudSBhcyBhbiBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudUVsZW0gPSB0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51Jyk7XHJcbiAgICAgICAgICAgIC8vZmluZCB0aGUgbWVzc2FnZSBkaXZcclxuICAgICAgICAgICAgY29uc3Qgc2JNZW51UGFyZW50ID0gdGFyZ2V0IS5jbG9zZXN0KGBkaXZgKTtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIGZ1bGwgdGV4dCBvZiB0aGUgbWVzc2FnZSBkaXZcclxuICAgICAgICAgICAgbGV0IGdpZnRNZXNzYWdlID0gc2JNZW51UGFyZW50IS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgIC8vZm9ybWF0IG1lc3NhZ2Ugd2l0aCBzdGFuZGFyZCB0ZXh0ICsgbWVzc2FnZSBjb250ZW50cyArIHNlcnZlciB0aW1lIG9mIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgIGdpZnRNZXNzYWdlID1cclxuICAgICAgICAgICAgICAgIGBTZW50IG9uIFNob3V0Ym94IG1lc3NhZ2U6IFwiYCArXHJcbiAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZS5zdWJzdHJpbmcoZ2lmdE1lc3NhZ2UuaW5kZXhPZignOiAnKSArIDIpICtcclxuICAgICAgICAgICAgICAgIGBcIiBhdCBgICtcclxuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZygwLCA4KTtcclxuICAgICAgICAgICAgLy9pZiB0aGUgdGFyZ2V0IG9mIHRoZSBjbGljayBpcyBub3QgdGhlIFRyaXBsZSBEb3QgTWVudSBPUlxyXG4gICAgICAgICAgICAvL2lmIG1lbnUgaXMgb25lIG9mIHlvdXIgb3duIGNvbW1lbnRzIChvbmx5IHdvcmtzIGZvciBmaXJzdCAxMCBtaW51dGVzIG9mIGNvbW1lbnQgYmVpbmcgc2VudClcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgIXRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKSB8fFxyXG4gICAgICAgICAgICAgICAgc2JNZW51RWxlbSEuZ2V0QXR0cmlidXRlKCdkYXRhLWVlJykhID09PSAnMSdcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXQgdGhlIE1lbnUgYWZ0ZXIgaXQgcG9wcyB1cFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgR2lmdCBCdXR0b24uLi5gKTtcclxuICAgICAgICAgICAgY29uc3QgcG9wdXBNZW51OiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JNZW51TWFpbicpO1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLnNsZWVwKDUpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghcG9wdXBNZW51IS5oYXNDaGlsZE5vZGVzKCkpO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgdXNlciBkZXRhaWxzIGZyb20gdGhlIHBvcHVwIG1lbnUgZGV0YWlsc1xyXG4gICAgICAgICAgICBjb25zdCBwb3B1cFVzZXI6IEhUTUxFbGVtZW50ID0gVXRpbC5ub2RlVG9FbGVtKHBvcHVwTWVudSEuY2hpbGROb2Rlc1swXSk7XHJcbiAgICAgICAgICAgIC8vbWFrZSB1c2VybmFtZSBlcXVhbCB0aGUgZGF0YS11aWQsIGZvcmNlIG5vdCBudWxsXHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBTdHJpbmcgPSBwb3B1cFVzZXIhLmdldEF0dHJpYnV0ZSgnZGF0YS11aWQnKSE7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGdpZnRzIHNldCBpbiBwcmVmZXJlbmNlcyBmb3IgdXNlciBwYWdlXHJcbiAgICAgICAgICAgIGxldCBnaWZ0VmFsdWVTZXR0aW5nOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgndXNlckdpZnREZWZhdWx0X3ZhbCcpO1xyXG4gICAgICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMFxyXG4gICAgICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgIE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMDAnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jcmVhdGUgdGhlIEhUTUwgZG9jdW1lbnQgdGhhdCBob2xkcyB0aGUgYnV0dG9uIGFuZCB2YWx1ZSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2dpZnRCdXR0b24nKTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgdGhlIGJ1dHRvbiBlbGVtZW50IGFzIHdlbGwgYXMgYSB0ZXh0IGVsZW1lbnQgZm9yIHZhbHVlIG9mIGdpZnQuIFBvcHVsYXRlIHdpdGggdmFsdWUgZnJvbSBzZXR0aW5nc1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLmlubmVySFRNTCA9IGA8YnV0dG9uPkdpZnQ6IDwvYnV0dG9uPjxzcGFuPiZuYnNwOzwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiM1wiIGlkPVwibXBfZ2lmdFZhbHVlXCIgdGl0bGU9XCJWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDBcIiB2YWx1ZT1cIiR7Z2lmdFZhbHVlU2V0dGluZ31cIj5gO1xyXG4gICAgICAgICAgICAvL2FkZCBnaWZ0IGVsZW1lbnQgd2l0aCBidXR0b24gYW5kIHRleHQgdG8gdGhlIG1lbnVcclxuICAgICAgICAgICAgcG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdLmFwcGVuZENoaWxkKGdpZnRCdXR0b24pO1xyXG4gICAgICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbiBnaWZ0IGJ1dHRvbiBpcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9wdWxsIHdoYXRldmVyIHRoZSBmaW5hbCB2YWx1ZSBvZiB0aGUgdGV4dCBib3ggZXF1YWxzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnaWZ0RmluYWxBbW91bnQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0VmFsdWUnKVxyXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgLy9iZWdpbiBzZXR0aW5nIHVwIHRoZSBHRVQgcmVxdWVzdCB0byBNQU0gSlNPTlxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2lmdEhUVFAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByZXN1bHRzIHdpdGggdGhlIGFtb3VudCBlbnRlcmVkIGJ5IHVzZXIgcGx1cyB0aGUgdXNlcm5hbWUgZm91bmQgb24gdGhlIG1lbnUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgIC8vYWRkZWQgbWVzc2FnZSBjb250ZW50cyBlbmNvZGVkIHRvIHByZXZlbnQgdW5pbnRlbmRlZCBjaGFyYWN0ZXJzIGZyb20gYnJlYWtpbmcgSlNPTiBVUkxcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRGaW5hbEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICl9YDtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0SFRUUC5yZWFkeVN0YXRlID09PSA0ICYmIGdpZnRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGdpZnRIVFRQLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGxpbmUgaW4gU0IgdGhhdCBzaG93cyBnaWZ0IHdhcyBzdWNjZXNzZnVsIHRvIGFja25vd2xlZGdlIGdpZnQgd29ya2VkL2ZhaWxlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdFN0YXR1c0VsZW0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2Q2hpbGQhLmFwcGVuZENoaWxkKG5ld0Rpdik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGdpZnQgc3VjY2VlZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NNc2cgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUG9pbnRzIEdpZnQgU3VjY2Vzc2Z1bDogVmFsdWU6ICcgKyBnaWZ0RmluYWxBbW91bnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuYXBwZW5kQ2hpbGQoc3VjY2Vzc01zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuY2xhc3NMaXN0LmFkZCgnbXBfc3VjY2VzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkTXNnID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BvaW50cyBHaWZ0IEZhaWxlZDogRXJyb3I6ICcgKyBqc29uLmVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKGZhaWxlZE1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuY2xhc3NMaXN0LmFkZCgnbXBfZmFpbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICBzYmZEaXYuc2Nyb2xsVG9wID0gc2JmRGl2LnNjcm9sbEhlaWdodDtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAuc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gdG8gbWFpbiBTQiB3aW5kb3cgYWZ0ZXIgZ2lmdCBpcyBjbGlja2VkIC0gdGhlc2UgYXJlIHR3byBzdGVwcyB0YWtlbiBieSBNQU0gd2hlbiBjbGlja2luZyBvdXQgb2YgTWVudVxyXG4gICAgICAgICAgICAgICAgc2JmRGl2XHJcbiAgICAgICAgICAgICAgICAgICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NiX2NsaWNrZWRfcm93JylbMF0hXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJykhXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnc2JCb3R0b20gaGlkZU1lJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVUb051bWJlcjogU3RyaW5nID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcclxuICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpIDwgNSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEdpZnQgQnV0dG9uIGFkZGVkIWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBSZXBseSBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXRcclxuICovXHJcbmNsYXNzIFJlcGx5U2ltcGxlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JlcGx5U2ltcGxlJyxcclxuICAgICAgICAvL3RhZzogXCJSZXBseVwiLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTQ7YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9yZXBseVNpbXBsZTogbnVtYmVyID0gMTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3hSZXBseSh0aGlzLl90YXIsIHRoaXMuX3JlcGx5U2ltcGxlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIFJlcGx5IFdpdGggUXVvdGUgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XHJcbiAqL1xyXG5jbGFzcyBSZXBseVF1b3RlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JlcGx5UXVvdGUnLFxyXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5IFdpdGggUXVvdGVcIixcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgUmVwbHkgd2l0aCBRdW90ZSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTc7YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9yZXBseVF1b3RlOiBudW1iZXIgPSAyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlRdW90ZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFJlcGx5IHdpdGggUXVvdGUgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBmZWF0dXJlIGZvciBidWlsZGluZyBhIGxpYnJhcnkgb2YgcXVpY2sgc2hvdXQgaXRlbXMgdGhhdCBjYW4gYWN0IGFzIGEgY29weS9wYXN0ZSByZXBsYWNlbWVudC5cclxuICovXHJcbmNsYXNzIFF1aWNrU2hvdXQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncXVpY2tTaG91dCcsXHJcbiAgICAgICAgZGVzYzogYENyZWF0ZSBmZWF0dXJlIGJlbG93IHNob3V0Ym94IHRvIHN0b3JlIHByZS1zZXQgbWVzc2FnZXMuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFF1aWNrIFNob3V0IEJ1dHRvbnMuLi5gKTtcclxuICAgICAgICAvL2dldCB0aGUgbWFpbiBzaG91dGJveCBpbnB1dCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IHJlcGx5Qm94ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYm94X3RleHQnKTtcclxuICAgICAgICAvL2VtcHR5IEpTT04gd2FzIGdpdmluZyBtZSBpc3N1ZXMsIHNvIGRlY2lkZWQgdG8ganVzdCBtYWtlIGFuIGludHJvIGZvciB3aGVuIHRoZSBHTSB2YXJpYWJsZSBpcyBlbXB0eVxyXG4gICAgICAgIGxldCBqc29uTGlzdCA9IEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgIGB7IFwiSW50cm9cIjpcIldlbGNvbWUgdG8gUXVpY2tTaG91dCBNQU0rZXIhIEhlcmUgeW91IGNhbiBjcmVhdGUgcHJlc2V0IFNob3V0IG1lc3NhZ2VzIGZvciBxdWljayByZXNwb25zZXMgYW5kIGtub3dsZWRnZSBzaGFyaW5nLiAnQ2xlYXInIGNsZWFycyB0aGUgZW50cnkgdG8gc3RhcnQgc2VsZWN0aW9uIHByb2Nlc3Mgb3Zlci4gJ1NlbGVjdCcgdGFrZXMgd2hhdGV2ZXIgUXVpY2tTaG91dCBpcyBpbiB0aGUgVGV4dEFyZWEgYW5kIHB1dHMgaW4geW91ciBTaG91dCByZXNwb25zZSBhcmVhLiAnU2F2ZScgd2lsbCBzdG9yZSB0aGUgU2VsZWN0aW9uIE5hbWUgYW5kIFRleHQgQXJlYSBDb21ibyBmb3IgZnV0dXJlIHVzZSBhcyBhIFF1aWNrU2hvdXQsIGFuZCBoYXMgY29sb3IgaW5kaWNhdG9ycy4gR3JlZW4gPSBzYXZlZCBhcy1pcy4gWWVsbG93ID0gUXVpY2tTaG91dCBOYW1lIGV4aXN0cyBhbmQgaXMgc2F2ZWQsIGJ1dCBjb250ZW50IGRvZXMgbm90IG1hdGNoIHdoYXQgaXMgc3RvcmVkLiBPcmFuZ2UgPSBubyBlbnRyeSBtYXRjaGluZyB0aGF0IG5hbWUsIG5vdCBzYXZlZC4gJ0RlbGV0ZScgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgdGhhdCBlbnRyeSBmcm9tIHlvdXIgc3RvcmVkIFF1aWNrU2hvdXRzIChidXR0b24gb25seSBzaG93cyB3aGVuIGV4aXN0cyBpbiBzdG9yYWdlKS4gRm9yIG5ldyBlbnRyaWVzIGhhdmUgeW91ciBRdWlja1Nob3V0IE5hbWUgdHlwZWQgaW4gQkVGT1JFIHlvdSBjcmFmdCB5b3VyIHRleHQgb3IgcmlzayBpdCBiZWluZyBvdmVyd3JpdHRlbiBieSBzb21ldGhpbmcgdGhhdCBleGlzdHMgYXMgeW91IHR5cGUgaXQuIFRoYW5rcyBmb3IgdXNpbmcgTUFNKyFcIiB9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9nZXQgU2hvdXRib3ggRElWXHJcbiAgICAgICAgY29uc3Qgc2hvdXRCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnBTaG91dCcpO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBmb290ZXIgd2hlcmUgd2Ugd2lsbCBpbnNlcnQgb3VyIGZlYXR1cmVcclxuICAgICAgICBjb25zdCBzaG91dEZvb3QgPSA8SFRNTEVsZW1lbnQ+c2hvdXRCb3ghLnF1ZXJ5U2VsZWN0b3IoJy5ibG9ja0Zvb3QnKTtcclxuICAgICAgICAvL2dpdmUgaXQgYW4gSUQgYW5kIHNldCB0aGUgc2l6ZVxyXG4gICAgICAgIHNob3V0Rm9vdCEuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9ibG9ja0Zvb3QnKTtcclxuICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcyLjVlbSc7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBuZXcgZGl2ZSB0byBob2xkIG91ciBjb21ib0JveCBhbmQgYnV0dG9ucyBhbmQgc2V0IHRoZSBzdHlsZSBmb3IgZm9ybWF0dGluZ1xyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcuNWVtJztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Ub3AgPSAnLjVlbSc7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGxhYmVsIHRleHQgZWxlbWVudCBhbmQgYWRkIHRoZSB0ZXh0IGFuZCBhdHRyaWJ1dGVzIGZvciBJRFxyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAncXVpY2tTaG91dERhdGEnKTtcclxuICAgICAgICBjb21ib0JveExhYmVsLmlubmVyVGV4dCA9ICdDaG9vc2UgYSBRdWlja1Nob3V0JztcclxuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMYWJlbCcpO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBpbnB1dCBmaWVsZCB0byBsaW5rIHRvIGRhdGFsaXN0IGFuZCBmb3JtYXQgc3R5bGVcclxuICAgICAgICBjb25zdCBjb21ib0JveElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBjb21ib0JveElucHV0LnN0eWxlLm1hcmdpbkxlZnQgPSAnLjVlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94SW5wdXQnKTtcclxuICAgICAgICAvL2NyZWF0ZSBhIGRhdGFsaXN0IHRvIHN0b3JlIG91ciBxdWlja3Nob3V0c1xyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGFsaXN0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hMaXN0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XHJcbiAgICAgICAgLy9pZiB0aGUgR00gdmFyaWFibGUgZXhpc3RzXHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpIHtcclxuICAgICAgICAgICAgLy9vdmVyd3JpdGUganNvbkxpc3QgdmFyaWFibGUgd2l0aCBwYXJzZWQgZGF0YVxyXG4gICAgICAgICAgICBqc29uTGlzdCA9IEpTT04ucGFyc2UoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSk7XHJcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgT3B0aW9uIGVsZW1lbnQgYW5kIGFkZCBvdXIgZGF0YSBmb3IgZGlzcGxheSB0byB1c2VyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9pZiBubyBHTSB2YXJpYWJsZVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHZhcmlhYmxlIHdpdGggb3V0IEludHJvIGRhdGFcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXHJcbiAgICAgICAgICAgIC8vIFRPRE86IHByb2JhYmx5IGNhbiBnZXQgcmlkIG9mIHRoZSBmb3JFYWNoIGFuZCBqdXN0IGRvIHNpbmdsZSBleGVjdXRpb24gc2luY2Ugd2Uga25vdyB0aGlzIGlzIEludHJvIG9ubHlcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FwcGVuZCB0aGUgYWJvdmUgZWxlbWVudHMgdG8gb3VyIERJViBmb3IgdGhlIGNvbWJvIGJveFxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGFiZWwpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94SW5wdXQpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGlzdCk7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGNsZWFyIGJ1dHRvbiBhbmQgYWRkIHN0eWxlXHJcbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBjbGVhckJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgY2xlYXJCdXR0b24uaW5uZXJIVE1MID0gJ0NsZWFyJztcclxuICAgICAgICAvL2NyZWF0ZSBkZWxldGUgYnV0dG9uLCBhZGQgc3R5bGUsIGFuZCB0aGVuIGhpZGUgaXQgZm9yIGxhdGVyIHVzZVxyXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzZlbSc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5pbm5lckhUTUwgPSAnREVMRVRFJztcclxuICAgICAgICAvL2NyZWF0ZSBzZWxlY3QgYnV0dG9uIGFuZCBzdHlsZSBpdFxyXG4gICAgICAgIGNvbnN0IHNlbGVjdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLmlubmVySFRNTCA9ICdcXHUyMTkxIFNlbGVjdCc7XHJcbiAgICAgICAgLy9jcmVhdGUgc2F2ZSBidXR0b24gYW5kIHN0eWxlIGl0XHJcbiAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNhdmVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHNhdmVCdXR0b24uaW5uZXJIVE1MID0gJ1NhdmUnO1xyXG4gICAgICAgIC8vYWRkIGFsbCA0IGJ1dHRvbnMgdG8gdGhlIGNvbWJvQm94IERJVlxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNsZWFyQnV0dG9uKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzZWxlY3RCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGRlbGV0ZUJ1dHRvbik7XHJcbiAgICAgICAgLy9jcmVhdGUgb3VyIHRleHQgYXJlYSBhbmQgc3R5bGUgaXQsIHRoZW4gaGlkZSBpdFxyXG4gICAgICAgIGNvbnN0IHF1aWNrU2hvdXRUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5oZWlnaHQgPSAnNTAlJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5tYXJnaW4gPSAnMWVtJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS53aWR0aCA9ICc5NyUnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LmlkID0gJ21wX3F1aWNrU2hvdXRUZXh0JztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvL2V4ZWN1dGVzIHdoZW4gY2xpY2tpbmcgc2VsZWN0IGJ1dHRvblxyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIHNvbWV0aGluZyBpbnNpZGUgb2YgdGhlIHF1aWNrc2hvdXQgYXJlYVxyXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9wdXQgdGhlIHRleHQgaW4gdGhlIG1haW4gc2l0ZSByZXBseSBmaWVsZCBhbmQgZm9jdXMgb24gaXRcclxuICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IHF1aWNrU2hvdXRUZXh0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgYSBxdWlja1Nob3V0IGRlbGV0ZSBidXR0b25cclxuICAgICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCB0aGUgbGFzdCBxdWlja1Nob3V0XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoanNvbkxpc3QpLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgZW50cnkgZnJvbSB0aGUgSlNPTiBhbmQgdXBkYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBvcHRpb25zIGZyb20gZGF0YWxpc3QgdG8gcmVzZXQgd2l0aCBuZXdseSBjcmVhdGVkIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2ggaXRlbSBpbiBuZXcganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbmV3IG9wdGlvbiBlbGVtZW50IHRvIGFkZCB0byBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjdXJyZW50IGtleSB2YWx1ZSB0byB0aGUgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgZWxlbWVudCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGxhc3QgaXRlbSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgaXRlbSBmcm9tIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgv4LKgL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZW50aXJlIHZhcmlhYmxlIHNvIGl0cyBub3QgZW1wdHkgR00gdmFyaWFibGVcclxuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfcXVpY2tTaG91dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vY3JlYXRlIGV2ZW50IG9uIHNhdmUgYnV0dG9uIHRvIHNhdmUgcXVpY2tzaG91dFxyXG4gICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBkYXRhIGluIHRoZSBrZXkgYW5kIHZhbHVlIEdVSSBmaWVsZHMsIHByb2NlZWRcclxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSAmJiBjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy93YXMgaGF2aW5nIGlzc3VlIHdpdGggZXZhbCBwcm9jZXNzaW5nIHRoZSAucmVwbGFjZSBkYXRhIHNvIG1hZGUgYSB2YXJpYWJsZSB0byBpbnRha2UgaXRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlZFRleHQgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZnVuIHdheSB0byBkeW5hbWljYWxseSBjcmVhdGUgc3RhdGVtZW50cyAtIHRoaXMgdGFrZXMgd2hhdGV2ZXIgaXMgaW4gbGlzdCBmaWVsZCB0byBjcmVhdGUgYSBrZXkgd2l0aCB0aGF0IHRleHQgYW5kIHRoZSB2YWx1ZSBmcm9tIHRoZSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICAgICAgICAgIGV2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBqc29uTGlzdC5gICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VkVGV4dCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgPSBcImAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHF1aWNrU2hvdXRUZXh0LnZhbHVlKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgXCI7YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9vdmVyd3JpdGUgb3IgY3JlYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHNhdmUgYnV0dG9uIHRvIGdyZWVuIG5vdyB0aGF0IGl0cyBzYXZlZCBhcy1pc1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIGEgc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGV4aXN0aW5nIGRhdGFsaXN0IGVsZW1lbnRzIHRvIHJlYnVpbGQgd2l0aCBuZXcganNvbmxpc3RcclxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaW4gdGhlIGpzb25saXN0XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBuZXcgb3B0aW9uIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQga2V5IG5hbWUgdG8gdGhlIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiB0aGlzIG1heSBvciBtYXkgbm90IGJlIG5lY2Vzc2FyeSwgYnV0IHdhcyBoYXZpbmcgaXNzdWVzIHdpdGggdGhlIHVuaXF1ZSBzeW1ib2wgc3RpbGwgcmFuZG9tbHkgc2hvd2luZyB1cCBhZnRlciBzYXZlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGNvbWJvQm94T3B0aW9uLnZhbHVlLnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjb21ib0JveE9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vYWRkIGV2ZW50IGZvciBjbGVhciBidXR0b24gdG8gcmVzZXQgdGhlIGRhdGFsaXN0XHJcbiAgICAgICAgY2xlYXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jbGVhciB0aGUgaW5wdXQgZmllbGQgYW5kIHRleHRhcmVhIGZpZWxkXHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vTmV4dCB0d28gaW5wdXQgZnVuY3Rpb25zIGFyZSBtZWF0IGFuZCBwb3RhdG9lcyBvZiB0aGUgbG9naWMgZm9yIHVzZXIgZnVuY3Rpb25hbGl0eVxyXG5cclxuICAgICAgICAvL3doZW5ldmVyIHNvbWV0aGluZyBpcyB0eXBlZCBvciBjaGFuZ2VkIHdoaXRoaW4gdGhlIGlucHV0IGZpZWxkXHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnaW5wdXQnLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGlzIGJsYW5rXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSB0ZXh0YXJlYSBpcyBhbHNvIGJsYW5rIG1pbmltaXplIHJlYWwgZXN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFxdWlja1Nob3V0VGV4dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIHRleHQgYXJlYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NocmluayB0aGUgZm9vdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzIuNWVtJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gdG8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgc29tZXRoaW5nIGlzIHN0aWxsIGluIHRoZSB0ZXh0YXJlYSB3ZSBuZWVkIHRvIGluZGljYXRlIHRoYXQgdW5zYXZlZCBhbmQgdW5uYW1lZCBkYXRhIGlzIHRoZXJlXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zdHlsZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZCBpcyBvcmdhbmdlIHNhdmUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL2VpdGhlciB3YXksIGhpZGUgdGhlIGRlbGV0ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIGlucHV0IGZpZWxkIGhhcyBhbnkgdGV4dCBpbiBpdFxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgdGV4dCBhcmVhIGZvciBpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2V4cGFuZCB0aGUgZm9vdGVyIHRvIGFjY29tb2RhdGUgYWxsIGZlYXR1cmUgYXNwZWN0c1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzExZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgd2hhdCBpcyBpbiB0aGUgaW5wdXQgZmllbGQgaXMgYSBzYXZlZCBlbnRyeSBrZXlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbkxpc3RbaW5wdXRWYWxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBjYW4gYmUgYSBzdWNreSBsaW5lIG9mIGNvZGUgYmVjYXVzZSBpdCBjYW4gd2lwZSBvdXQgdW5zYXZlZCBkYXRhLCBidXQgaSBjYW5ub3QgdGhpbmsgb2YgYmV0dGVyIHdheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcGxhY2UgdGhlIHRleHQgYXJlYSBjb250ZW50cyB3aXRoIHdoYXQgdGhlIHZhbHVlIGlzIGluIHRoZSBtYXRjaGVkIHBhaXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVpY2tTaG91dFRleHQudmFsdWUgPSBqc29uTGlzdFtKU09OLnBhcnNlKGlucHV0VmFsKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Nob3cgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBpcyBub3cgZXhhY3QgbWF0Y2ggdG8gc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIHRvIHNob3cgaXRzIGEgc2F2ZWQgY29tYm9cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBub3QgYSByZWdpc3RlcmVkIGtleSBuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBiZSBhbiB1bnNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBjYW5ub3QgYmUgc2F2ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGRlbGV0ZWQgb3V0IG9mIHRleHRhcmVhXHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2lucHV0JyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIGlucHV0IGZpZWxkIGlzIGJsYW5rXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGZpZWxkIGhhcyB0ZXh0IGluIGl0XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSAhPT0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBhcyB5ZWxsb3cgZm9yIGVkaXR0ZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdZZWxsb3cnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIGEgbWF0Y2ggYW5kIHRoZSBkYXRhIGlzIGEgbWF0Y2ggdGhlbiB3ZSBoYXZlIGEgMTAwJSBzYXZlZCBlbnRyeSBhbmQgY2FuIHB1dCBldmVyeXRoaW5nIGJhY2sgdG8gc2F2ZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbaW5wdXRWYWxdICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPT09IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gZm9yIHNhdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBub3QgZm91bmQgaW4gdGhlIHNhdmVkIGxpc3QsIG9yYW5nZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghanNvbkxpc3RbaW5wdXRWYWxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vYWRkIHRoZSBjb21ib2JveCBhbmQgdGV4dCBhcmVhIGVsZW1lbnRzIHRvIHRoZSBmb290ZXJcclxuICAgICAgICBzaG91dEZvb3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hEaXYpO1xyXG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChxdWlja1Nob3V0VGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vKipcclxuICogI0JST1dTRSBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBTbmF0Y2hlZCB0b3JyZW50cyB0byBiZSBoaWRkZW4vc2hvd25cclxuICovXHJcbmNsYXNzIFRvZ2dsZVNuYXRjaGVkIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVTbmF0Y2hlZCcsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBoaWRlL3Nob3cgcmVzdWx0cyB0aGF0IHlvdSd2ZSBzbmF0Y2hlZGAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9pc1Zpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX3NuYXRjaGVkSG9vazogc3RyaW5nID0gJ3RkIGRpdltjbGFzc149XCJicm93c2VcIl0nO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxldCB0b2dnbGU6IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xyXG4gICAgICAgIGxldCByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+O1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFN0YXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHN0b3JlZFN0YXRlID09PSAnZmFsc2UnICYmIEdNX2dldFZhbHVlKCdzdGlja3lTbmF0Y2hlZFRvZ2dsZScpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVRleHQ6IHN0cmluZyA9IHRoaXMuX2lzVmlzaWJsZSA/ICdIaWRlIFNuYXRjaGVkJyA6ICdTaG93IFNuYXRjaGVkJztcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHRvZ2dsZSA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3NuYXRjaGVkVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVRleHQsXHJcbiAgICAgICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICAgICAgJyNyZXNldE5ld0ljb24nLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGJhc2VkIG9uIHZpcyBzdGF0ZVxyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgVG9nZ2xlIFNuYXRjaGVkIGJ1dHRvbiEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWx0ZXJzIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0gbGlzdCBhIHNlYXJjaCByZXN1bHRzIGxpc3RcclxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZmlsdGVyUmVzdWx0cyhsaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+LCBzdWJUYXI6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaCgoc25hdGNoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEhlYWRpbmdFbGVtZW50ID0gPEhUTUxIZWFkaW5nRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc25hdGNoZWRUb2dnbGUnKSFcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCBvbmx5IHRoZSBpdGVtcyB0aGF0IG1hdGNoIG91ciBzdWIgZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzbmF0Y2gucXVlcnlTZWxlY3RvcihzdWJUYXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSGlkZS9zaG93IGFzIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNWaXNpYmxlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAndGFibGUtcm93JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFZpc1N0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU25hdGNoIHZpcyBzdGF0ZTonLCB0aGlzLl9pc1Zpc2libGUsICdcXG52YWw6JywgdmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgLCBgJHt2YWx9YCk7XHJcbiAgICAgICAgdGhpcy5faXNWaXNpYmxlID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcclxuICAgICAgICBpZiAodGhpcy5fc2VhcmNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2VhcmNobGlzdCBpcyB1bmRlZmluZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlYXJjaExpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzVmlzaWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmlzaWJsZSh2YWw6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVtZW1iZXJzIHRoZSBzdGF0ZSBvZiBUb2dnbGVTbmF0Y2hlZCBiZXR3ZWVuIHBhZ2UgbG9hZHNcclxuICovXHJcbmNsYXNzIFN0aWNreVNuYXRjaGVkVG9nZ2xlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzdGlja3lTbmF0Y2hlZFRvZ2dsZScsXHJcbiAgICAgICAgZGVzYzogYE1ha2UgdG9nZ2xlIHN0YXRlIHBlcnNpc3QgYmV0d2VlbiBwYWdlIGxvYWRzYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFJlbWVtYmVyZWQgc25hdGNoIHZpc2liaWxpdHkgc3RhdGUhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYSBwbGFpbnRleHQgbGlzdCBvZiBzZWFyY2ggcmVzdWx0c1xyXG4gKi9cclxuY2xhc3MgUGxhaW50ZXh0U2VhcmNoIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwbGFpbnRleHRTZWFyY2gnLFxyXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIGF0IHRvcCBvZiBwYWdlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyIGgxJztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxyXG4gICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxyXG4gICAgKTtcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgbGV0IGNvcHlCdG46IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgdG9nZ2xlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICdTaG93IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICcjc3NyJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cclxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICAgICAncGxhaW5Db3B5JyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0IG9wZW4gc3RhdGVcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIHRvZ2dsZSBidXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIHRvZ2dsZUJ0blxyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGV4dGJveCBzaG91bGQgZXhpc3QsIGJ1dCBqdXN0IGluIGNhc2UuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRleHRib3ggZG9lc24ndCBleGlzdCFgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnSGlkZSBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCdmYWxzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbnNlcnRlZCBwbGFpbnRleHQgc2VhcmNoIHJlc3VsdHMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxyXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsID0gJ2ZhbHNlJztcclxuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcclxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGVuID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NSZXN1bHRzKFxyXG4gICAgICAgIHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cclxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcclxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXHJcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xyXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xyXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XHJcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyB0aGUgc2VhcmNoIGZlYXR1cmVzIHRvIGJlIGhpZGRlbi9zaG93blxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlU2VhcmNoYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVTZWFyY2hib3gnLFxyXG4gICAgICAgIGRlc2M6IGBDb2xsYXBzZSB0aGUgU2VhcmNoIGJveCBhbmQgbWFrZSBpdCB0b2dnbGVhYmxlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yU2VhcmNoQ29udHJvbCc7XHJcbiAgICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyA9ICcyNnB4JztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyA9ICdmYWxzZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBzZWFyY2hib3g6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBpZiAoc2VhcmNoYm94KSB7XHJcbiAgICAgICAgICAgIC8vIEFkanVzdCB0aGUgdGl0bGUgdG8gbWFrZSBpdCBjbGVhciBpdCBpcyBhIHRvZ2dsZSBidXR0b25cclxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHNlYXJjaGJveC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJy5ibG9ja0hlYWRDb24gaDQnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHRleHQgJiBzdHlsZVxyXG4gICAgICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gJ1RvZ2dsZSBTZWFyY2gnO1xyXG4gICAgICAgICAgICAgICAgdGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICB0aXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2dnbGUoc2VhcmNoYm94ISk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBzZXQgdXAgdG9nZ2xlISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDb2xsYXBzZSB0aGUgc2VhcmNoYm94XHJcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hib3gsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiBgaGVpZ2h0OiR7dGhpcy5faGVpZ2h0fTtvdmVyZmxvdzpoaWRkZW47YCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEhpZGUgZXh0cmEgdGV4dFxyXG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb246IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJyNtYWluQm9keSA+IGgzJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBndWlkZUxpbms6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMgfiBhJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uKSBub3RpZmljYXRpb24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgaWYgKGd1aWRlTGluaykgZ3VpZGVMaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb2xsYXBzZWQgdGhlIFNlYXJjaCBib3ghJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNvbGxhcHNlIFNlYXJjaCBib3ghIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF90b2dnbGUoZWxlbTogSFRNTERpdkVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gJ3Vuc2V0JztcclxuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ3RydWUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSAnZmFsc2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdUb2dnbGVkIFNlYXJjaCBib3ghJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZXMgbGlua2VkIHRhZ3MgZnJvbSB0aGUgc2l0ZSdzIHBsYWludGV4dCB0YWcgZmllbGRcclxuICovXHJcbmNsYXNzIEJ1aWxkVGFncyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYnVpbGRUYWdzJyxcclxuICAgICAgICBkZXNjOiBgR2VuZXJhdGUgY2xpY2thYmxlIFRhZ3MgYXV0b21hdGljYWxseWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHNMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgICAvLyBCdWlsZCB0aGUgdGFnc1xyXG4gICAgICAgIHJlc3VsdHNMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZvckVhY2goKHIpID0+IHRoaXMuX3Byb2Nlc3NUYWdTdHJpbmcocikpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQnVpbHQgdGFnIGxpbmtzIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNMaXN0LnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3MgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQnVpbHQgdGFnIGxpbmtzIScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDb2RlIHRvIHJ1biBmb3IgZXZlcnkgc2VhcmNoIHJlc3VsdFxyXG4gICAgICogQHBhcmFtIHJlcyBBIHNlYXJjaCByZXN1bHQgcm93XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Byb2Nlc3NUYWdTdHJpbmcgPSAocmVzOiBIVE1MVGFibGVSb3dFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGFnbGluZSA9IDxIVE1MU3BhbkVsZW1lbnQ+cmVzLnF1ZXJ5U2VsZWN0b3IoJy50b3JSb3dEZXNjJyk7XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cCh0YWdsaW5lKTtcclxuXHJcbiAgICAgICAgLy8gQXNzdW1lIGJyYWNrZXRzIGNvbnRhaW4gdGFnc1xyXG4gICAgICAgIGxldCB0YWdTdHJpbmcgPSB0YWdsaW5lLmlubmVySFRNTC5yZXBsYWNlKC8oPzpcXFt8XFxdfFxcKHxcXCl8JCkvZ2ksICcsJyk7XHJcbiAgICAgICAgLy8gUmVtb3ZlIEhUTUwgRW50aXRpZXMgYW5kIHR1cm4gdGhlbSBpbnRvIGJyZWFrc1xyXG4gICAgICAgIHRhZ1N0cmluZyA9IHRhZ1N0cmluZy5zcGxpdCgvKD86Ji57MSw1fTspL2cpLmpvaW4oJzsnKTtcclxuICAgICAgICAvLyBTcGxpdCB0YWdzIGF0ICcsJyBhbmQgJzsnIGFuZCAnPicgYW5kICd8J1xyXG4gICAgICAgIGxldCB0YWdzID0gdGFnU3RyaW5nLnNwbGl0KC9cXHMqKD86O3wsfD58XFx8fCQpXFxzKi8pO1xyXG4gICAgICAgIC8vIFJlbW92ZSBlbXB0eSBvciBsb25nIHRhZ3NcclxuICAgICAgICB0YWdzID0gdGFncy5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA8PSAzMCAmJiB0YWcubGVuZ3RoID4gMCk7XHJcbiAgICAgICAgLy8gQXJlIHRhZ3MgYWxyZWFkeSBhZGRlZD8gT25seSBhZGQgaWYgbnVsbFxyXG4gICAgICAgIGNvbnN0IHRhZ0JveDogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IHJlcy5xdWVyeVNlbGVjdG9yKCcubXBfdGFncycpO1xyXG4gICAgICAgIGlmICh0YWdCb3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5qZWN0TGlua3ModGFncywgdGFnbGluZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGFncyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBJbmplY3RzIHRoZSBnZW5lcmF0ZWQgdGFnc1xyXG4gICAgICogQHBhcmFtIHRhZ3MgQXJyYXkgb2YgdGFncyB0byBhZGRcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIHNlYXJjaCByZXN1bHQgcm93IHRoYXQgdGhlIHRhZ3Mgd2lsbCBiZSBhZGRlZCB0b1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pbmplY3RMaW5rcyA9ICh0YWdzOiBzdHJpbmdbXSwgdGFyOiBIVE1MU3BhbkVsZW1lbnQpID0+IHtcclxuICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgbmV3IHRhZyByb3dcclxuICAgICAgICAgICAgY29uc3QgdGFnUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICB0YWdSb3cuY2xhc3NMaXN0LmFkZCgnbXBfdGFncycpO1xyXG4gICAgICAgICAgICB0YXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIHRhZ1Jvdyk7XHJcbiAgICAgICAgICAgIHRhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0YWdSb3cuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHRhZ3MgdG8gdGhlIHRhZyByb3dcclxuICAgICAgICAgICAgdGFncy5mb3JFYWNoKCh0YWcpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhZ1Jvdy5pbm5lckhUTUwgKz0gYDxhIGNsYXNzPSdtcF90YWcnIGhyZWY9Jy90b3IvYnJvd3NlLnBocD90b3IlNUJ0ZXh0JTVEPSUyMiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ1xyXG4gICAgICAgICAgICAgICAgKX0lMjImdG9yJTVCc3JjaEluJTVEJTVCdGFncyU1RD10cnVlJz4ke3RhZ308L2E+YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSYW5kb20gQm9vayBmZWF0dXJlIHRvIG9wZW4gYSBuZXcgdGFiL3dpbmRvdyB3aXRoIGEgcmFuZG9tIE1BTSBCb29rXHJcbiAqL1xyXG5jbGFzcyBSYW5kb21Cb29rIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYW5kb21Cb29rJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIG9wZW4gYSByYW5kb21seSBzZWxlY3RlZCBib29rIHBhZ2UuICg8ZW0+VXNlcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGNhdGVnb3J5IGluIHRoZSBkcm9wZG93bjwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgcmFuZG86IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGNvbnN0IHJhbmRvVGV4dDogc3RyaW5nID0gJ1JhbmRvbSBCb29rJztcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHJhbmRvID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncmFuZG9tQm9vaycsXHJcbiAgICAgICAgICAgICAgICByYW5kb1RleHQsXHJcbiAgICAgICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICAgICAgJyNyZXNldE5ld0ljb24nLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgcmFuZG9cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb3VudFJlc3VsdDogUHJvbWlzZTxudW1iZXI+O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2F0ZWdvcmllczogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBDYXRlZ29yeSBkcm9wZG93biBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdFNlbGVjdGlvbjogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhdGVnb3J5UGFydGlhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB2YWx1ZSBjdXJyZW50bHkgc2VsZWN0ZWQgaW4gQ2F0ZWdvcnkgRHJvcGRvd25cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0VmFsdWU6IHN0cmluZyA9IGNhdFNlbGVjdGlvbiEub3B0aW9uc1tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdFNlbGVjdGlvbi5zZWxlY3RlZEluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZGVwZW5kaW5nIG9uIGNhdGVnb3J5IHNlbGVjdGVkLCBjcmVhdGUgYSBjYXRlZ29yeSBzdHJpbmcgZm9yIHRoZSBKU09OIEdFVFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFN0cmluZyhjYXRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0FMTCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGVmYXVsdHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xMyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTEzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTE0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTE1JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTE2JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdFZhbHVlLmNoYXJBdCgwKSA9PT0gJ2MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvcltjYXRdW109JyArIGNhdFZhbHVlLnN1YnN0cmluZygxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvdW50UmVzdWx0ID0gdGhpcy5fZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0ZWdvcmllcykpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRSZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChnZXRSYW5kb21SZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29wZW4gbmV3IHRhYiB3aXRoIHRoZSByYW5kb20gYm9va1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC90LycgKyBnZXRSYW5kb21SZXN1bHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdfYmxhbmsnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBSYW5kb20gQm9vayBidXR0b24hJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWx0ZXJzIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0gY2F0IGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNhdGVnb3JpZXMgbmVlZGVkIGZvciBKU09OIEdldFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9nZXRSYW5kb21Cb29rUmVzdWx0cyhjYXQ6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgbGV0IGpzb25SZXN1bHQ6IFByb21pc2U8c3RyaW5nPjtcclxuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJhbmRvbSBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC90b3IvanMvbG9hZFNlYXJjaEpTT05iYXNpYy5waHA/dG9yW3NlYXJjaFR5cGVdPWFsbCZ0b3Jbc2VhcmNoSW5dPXRvcnJlbnRzJHtjYXR9JnRvcltwZXJwYWdlXT01JnRvclticm93c2VGbGFnc0hpZGVWc1Nob3ddPTAmdG9yW3N0YXJ0RGF0ZV09JnRvcltlbmREYXRlXT0mdG9yW2hhc2hdPSZ0b3Jbc29ydFR5cGVdPXJhbmRvbSZ0aHVtYm5haWw9dHJ1ZT8ke1V0aWwucmFuZG9tTnVtYmVyKFxyXG4gICAgICAgICAgICAgICAgMSxcclxuICAgICAgICAgICAgICAgIDEwMDAwMFxyXG4gICAgICAgICAgICApfWA7XHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFsoanNvblJlc3VsdCA9IFV0aWwuZ2V0SlNPTih1cmwpKV0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAganNvblJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChqc29uRnVsbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JldHVybiB0aGUgZmlyc3QgdG9ycmVudCBJRCBvZiB0aGUgcmFuZG9tIEpTT04gdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoanNvbkZ1bGwpLmRhdGFbMF0uaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLyoqXHJcbiAqICMgUkVRVUVTVCBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG4vKipcclxuICogKiBIaWRlIHJlcXVlc3RlcnMgd2hvIGFyZSBzZXQgdG8gXCJoaWRkZW5cIlxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlSGlkZGVuUmVxdWVzdGVycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVIaWRkZW5SZXF1ZXN0ZXJzJyxcclxuICAgICAgICBkZXNjOiBgSGlkZSBoaWRkZW4gcmVxdWVzdGVyc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclJvd3MnO1xyXG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX2hpZGUgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRoaXMuX2FkZFRvZ2dsZVN3aXRjaCgpO1xyXG4gICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHModGhpcy5fc2VhcmNoTGlzdCk7XHJcblxyXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcih0aGlzLl90YXIsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHModGhpcy5fc2VhcmNoTGlzdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkVG9nZ2xlU3dpdGNoKCkge1xyXG4gICAgICAgIC8vIE1ha2UgYSBuZXcgYnV0dG9uIGFuZCBpbnNlcnQgYmVzaWRlIHRoZSBTZWFyY2ggYnV0dG9uXHJcbiAgICAgICAgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICdzaG93SGlkZGVuJyxcclxuICAgICAgICAgICAgJ1Nob3cgSGlkZGVuJyxcclxuICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICcjcmVxdWVzdFNlYXJjaCAudG9ycmVudFNlYXJjaCcsXHJcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBuZXcgYnV0dG9uIGFuZCBhZGQgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVN3aXRjaDogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc2hvd0hpZGRlbicpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0b2dnbGVTd2l0Y2guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJyN0b3JSb3dzID4gLm1wX2hpZGRlbidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ0hpZGUgSGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGhpZGRlbkxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdsaXN0LWl0ZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSAnU2hvdyBIaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuTGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3RzIHRvIGV4aXN0XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjdG9yUm93cyAudG9yUm93IC50b3JSaWdodCcpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gR3JhYiBhbGwgcmVxdWVzdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcUxpc3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgfCBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+XHJcbiAgICAgICAgICAgICAgICAgICAgfCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfCB1bmRlZmluZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgICAgICcjdG9yUm93cyAudG9yUm93J1xyXG4gICAgICAgICAgICAgICAgKSBhcyBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXFMaXN0ID09PSBudWxsIHx8IHJlcUxpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgcmVxTGlzdCBpcyAke3JlcUxpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZpbHRlclJlc3VsdHMobGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pikge1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaCgocmVxdWVzdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ZXI6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IHJlcXVlc3QucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcudG9yUmlnaHQgYSdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKHJlcXVlc3RlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5jbGFzc0xpc3QuYWRkKCdtcF9oaWRkZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogR2VuZXJhdGUgYSBwbGFpbnRleHQgbGlzdCBvZiByZXF1ZXN0IHJlc3VsdHNcclxuICovXHJcbmNsYXNzIFBsYWludGV4dFJlcXVlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0UmVxdWVzdCcsXHJcbiAgICAgICAgZGVzYzogYEluc2VydCBwbGFpbnRleHQgcmVxdWVzdCByZXN1bHRzIGF0IHRvcCBvZiByZXF1ZXN0IHBhZ2VgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICApO1xyXG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgY29weUJ0bjogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj47XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSB0b2dnbGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgJyNzc3InLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cclxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICAgICAncGxhaW5Db3B5JyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCBvcGVuIHN0YXRlXHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCB0b2dnbGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICB0b2dnbGVCdG5cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHRib3ggc2hvdWxkIGV4aXN0LCBidXQganVzdCBpbiBjYXNlLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ0hpZGUgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXHJcbiAgICAgKiBAcGFyYW0gdmFsIHN0cmluZ2lmaWVkIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xyXG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxyXG4gICAgICAgIEdNX3NldFZhbHVlKCd0b2dnbGVTbmF0Y2hlZFN0YXRlJywgdmFsKTtcclxuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pik6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcclxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXHJcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xyXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xyXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XHJcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0ID0gKCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3QgcmVzdWx0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyBhJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHJlcXVlc3QgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IDxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yUm93cyAudG9yUm93JylcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc25hdGNoTGlzdCA9PT0gbnVsbCB8fCBzbmF0Y2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNuYXRjaExpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBHb29kcmVhZHNCdXR0b25SZXEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvblJlcScsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyBmb3IgcmVxdWVzdHMnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNmaWxsVG9ycmVudCc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCBkZXRhaWxzJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBDb252ZXJ0IHJvdyBzdHJ1Y3R1cmUgaW50byBzZWFyY2hhYmxlIG9iamVjdFxyXG4gICAgICAgIGNvbnN0IHJlcVJvd3MgPSBVdGlsLnJvd3NUb09iaihkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiA+IGRpdicpKTtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXHJcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSByZXFSb3dzWydUaXRsZTonXS5xdWVyeVNlbGVjdG9yKCdzcGFuJyk7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1tcclxuICAgICAgICAgICAgJ0F1dGhvcihzKTonXHJcbiAgICAgICAgXS5xdWVyeVNlbGVjdG9yQWxsKCdhJyk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1snU2VyaWVzOiddXHJcbiAgICAgICAgICAgID8gcmVxUm93c1snU2VyaWVzOiddLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKVxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByZXFSb3dzWydSZWxlYXNlIERhdGUnXTtcclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuZ29vZHJlYWRzQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogVkFVTFQgRkVBVFVSRVNcclxuICovXHJcblxyXG5jbGFzcyBTaW1wbGVWYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzaW1wbGVWYXVsdCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ1NpbXBsaWZ5IHRoZSBWYXVsdCBwYWdlcy4gKDxlbT5UaGlzIHJlbW92ZXMgZXZlcnl0aGluZyBleGNlcHQgdGhlIGRvbmF0ZSBidXR0b24gJmFtcDsgbGlzdCBvZiByZWNlbnQgZG9uYXRpb25zPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbkJvZHknO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndmF1bHQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzdWJQYWdlOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBjb25zdCBwYWdlID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zb2xlLmdyb3VwKGBBcHBseWluZyBWYXVsdCAoJHtzdWJQYWdlfSkgc2V0dGluZ3MuLi5gKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcclxuICAgICAgICBjb25zdCBkb25hdGVCdG46IEhUTUxGb3JtRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcclxuICAgICAgICBjb25zdCBkb25hdGVUYmw6IEhUTUxUYWJsZUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAndGFibGU6bGFzdC1vZi10eXBlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgYnV0dG9uIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgIGlmIChkb25hdGVCdG4gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3RG9uYXRlOiBIVE1MRm9ybUVsZW1lbnQgPSA8SFRNTEZvcm1FbGVtZW50PmRvbmF0ZUJ0bi5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3RG9uYXRlKTtcclxuICAgICAgICAgICAgbmV3RG9uYXRlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYWdlLmlubmVySFRNTCA9ICc8aDE+Q29tZSBiYWNrIHRvbW9ycm93ITwvaDE+JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIHRhYmxlIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgIGlmIChkb25hdGVUYmwgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb25hdGVUYmwuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xyXG4gICAgICAgICAgICBuZXdUYWJsZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFnZS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzI1cHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaW1wbGlmaWVkIHRoZSB2YXVsdCBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogI1VQTE9BRCBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBlYXNpZXIgY2hlY2tpbmcgZm9yIGR1cGxpY2F0ZSB1cGxvYWRzXHJcbiAqL1xyXG5cclxuY2xhc3MgU2VhcmNoRm9yRHVwbGljYXRlcyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc2VhcmNoRm9yRHVwbGljYXRlcycsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXBsb2FkIFBhZ2UnXSxcclxuICAgICAgICBkZXNjOiAnRWFzaWVyIHNlYXJjaGluZyBmb3IgZHVwbGljYXRlcyB3aGVuIHVwbG9hZGluZyBjb250ZW50JyxcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3VwbG9hZEZvcm0gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1cGxvYWQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xyXG5cclxuICAgICAgICBpZiAocGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIHRpdGxlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXRbbmFtZT1cInRvclt0aXRsZV1cIl0nLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDcsXHJcbiAgICAgICAgICAgICAgICB1c2VXaWxkY2FyZDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIGF1dGhvcihzKScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXV0aG9yJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19hdXRob3InLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDEwLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gc2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdzZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX3NlcmllcycsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTEsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBuYXJyYXRvcihzKScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbmFycmF0b3InLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX25hcnJhdG9yJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBzZWFyY2ggdG8gdXBsb2FkcyFgKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgIHRpdGxlLFxyXG4gICAgICAgIHR5cGUsXHJcbiAgICAgICAgaW5wdXRTZWxlY3RvcixcclxuICAgICAgICByb3dQb3NpdGlvbixcclxuICAgICAgICB1c2VXaWxkY2FyZCA9IGZhbHNlLFxyXG4gICAgfToge1xyXG4gICAgICAgIHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICAgICAgdHlwZTogc3RyaW5nO1xyXG4gICAgICAgIGlucHV0U2VsZWN0b3I6IHN0cmluZztcclxuICAgICAgICByb3dQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgICAgIHVzZVdpbGRjYXJkPzogYm9vbGVhbjtcclxuICAgIH0pIHtcclxuICAgICAgICBjb25zdCBzZWFyY2hFbGVtZW50OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoRWxlbWVudCwge1xyXG4gICAgICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnLFxyXG4gICAgICAgICAgICBzdHlsZTogJ3RleHQtZGVjb3JhdGlvbjogbm9uZTsgY3Vyc29yOiBwb2ludGVyOycsXHJcbiAgICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlYXJjaEVsZW1lbnQudGV4dENvbnRlbnQgPSAnIPCflI0nO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rQmFzZSA9IGAvdG9yL2Jyb3dzZS5waHA/dG9yJTVCc2VhcmNoVHlwZSU1RD1hbGwmdG9yJTVCc2VhcmNoSW4lNUQ9dG9ycmVudHMmdG9yJTVCY2F0JTVEJTVCJTVEPTAmdG9yJTVCYnJvd3NlRmxhZ3NIaWRlVnNTaG93JTVEPTAmdG9yJTVCc29ydFR5cGUlNUQ9ZGF0ZURlc2MmdG9yJTVCc3JjaEluJTVEJTVCJHt0eXBlfSU1RD10cnVlJnRvciU1QnRleHQlNUQ9YDtcclxuXHJcbiAgICAgICAgcGFyZW50RWxlbWVudFxyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgIGAjdXBsb2FkRm9ybSA+IHRib2R5ID4gdHI6bnRoLWNoaWxkKCR7cm93UG9zaXRpb259KSA+IHRkOm50aC1jaGlsZCgxKWBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICA/Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgc2VhcmNoRWxlbWVudCk7XHJcblxyXG4gICAgICAgIHNlYXJjaEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXRzOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudFxyXG4gICAgICAgICAgICA+IHwgbnVsbCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChpbnB1dFNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dHMgJiYgaW5wdXRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRzTGlzdDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzTGlzdC5wdXNoKGlucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IGlucHV0c0xpc3Quam9pbignICcpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2hTdHJpbmcgPSB1c2VXaWxkY2FyZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAqJHtlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpfSpgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0c0xpc3Quam9pbignICcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBsaW5rQmFzZSArIHNlYXJjaFN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICMgVVNFUiBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqICMjIyMgRGVmYXVsdCBVc2VyIEdpZnQgQW1vdW50XHJcbiAqL1xyXG5jbGFzcyBVc2VyR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnREZWZhdWx0JyxcclxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMDAsIG1heCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNib251c2dpZnQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIyBVc2VyIEdpZnQgSGlzdG9yeVxyXG4gKi9cclxuY2xhc3MgVXNlckdpZnRIaXN0b3J5IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdEhpc3RvcnknLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcclxuICAgICAgICBkZXNjOiAnRGlzcGxheSBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB5b3UgYW5kIGFub3RoZXIgdXNlcicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfc2VuZFN5bWJvbCA9IGA8c3BhbiBzdHlsZT0nY29sb3I6b3JhbmdlJz5cXHUyN0YwPC9zcGFuPmA7XHJcbiAgICBwcml2YXRlIF9nZXRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOnRlYWwnPlxcdTI3RjE8L3NwYW4+YDtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJ3Rib2R5JztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5pdGlhbGxpemluZyB1c2VyIGdpZnQgaGlzdG9yeS4uLicpO1xyXG5cclxuICAgICAgICAvLyBOYW1lIG9mIHRoZSBvdGhlciB1c2VyXHJcbiAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gaDEnKSEudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSByb3dcclxuICAgICAgICBjb25zdCBoaXN0b3J5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBjb25zdCBpbnNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgdGJvZHkgdHI6bGFzdC1vZi10eXBlJyk7XHJcbiAgICAgICAgaWYgKGluc2VydCkgaW5zZXJ0Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCBoaXN0b3J5Q29udGFpbmVyKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSB0aXRsZSBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgaGlzdG9yeVRpdGxlLmNsYXNzTGlzdC5hZGQoJ3Jvd2hlYWQnKTtcclxuICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnR2lmdCBoaXN0b3J5JztcclxuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlUaXRsZSk7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3RvcnkgY29udGVudCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgICAgIGhpc3RvcnlCb3guY2xhc3NMaXN0LmFkZCgncm93MScpO1xyXG4gICAgICAgIGhpc3RvcnlCb3gudGV4dENvbnRlbnQgPSBgWW91IGhhdmUgbm90IGV4Y2hhbmdlZCBnaWZ0cyB3aXRoICR7b3RoZXJVc2VyfS5gO1xyXG4gICAgICAgIGhpc3RvcnlCb3guYWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5Qm94KTtcclxuICAgICAgICAvLyBHZXQgdGhlIFVzZXIgSURcclxuICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcclxuICAgICAgICAvLyBUT0RPOiB1c2UgYGNkbi5gIGluc3RlYWQgb2YgYHd3dy5gOyBjdXJyZW50bHkgY2F1c2VzIGEgNDAzIGVycm9yXHJcbiAgICAgICAgaWYgKHVzZXJJRCkge1xyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGdpZnQgaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeSA9IGF3YWl0IFV0aWwuZ2V0VXNlckdpZnRIaXN0b3J5KHVzZXJJRCk7XHJcbiAgICAgICAgICAgIC8vIE9ubHkgZGlzcGxheSBhIGxpc3QgaWYgdGhlcmUgaXMgYSBoaXN0b3J5XHJcbiAgICAgICAgICAgIGlmIChnaWZ0SGlzdG9yeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBQb2ludCAmIEZMIHRvdGFsIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgW3BvaW50c0luLCBwb2ludHNPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0UG9pbnRzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBbd2VkZ2VJbiwgd2VkZ2VPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0V2VkZ2UnKTtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQb2ludHMgSW4vT3V0OiAke3BvaW50c0lufS8ke3BvaW50c091dH1gKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2VkZ2VzIEluL091dDogJHt3ZWRnZUlufS8ke3dlZGdlT3V0fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5Qm94LmlubmVySFRNTCA9IGBZb3UgaGF2ZSBzZW50ICR7dGhpcy5fc2VuZFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c091dH0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZU91dH0gRkwgd2VkZ2VzPC9zdHJvbmc+IHRvICR7b3RoZXJVc2VyfSBhbmQgcmVjZWl2ZWQgJHt0aGlzLl9nZXRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNJbn0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZUlufSBGTCB3ZWRnZXM8L3N0cm9uZz4uPGhyPmA7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG1lc3NhZ2UgdG8gdGhlIGJveFxyXG4gICAgICAgICAgICAgICAgaGlzdG9yeUJveC5hcHBlbmRDaGlsZCh0aGlzLl9zaG93R2lmdHMoZ2lmdEhpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFVzZXIgZ2lmdCBoaXN0b3J5IGFkZGVkIScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm8gdXNlciBnaWZ0IGhpc3RvcnkgZm91bmQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZXIgSUQgbm90IGZvdW5kOiAke3VzZXJJRH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFN1bSB0aGUgdmFsdWVzIG9mIGEgZ2l2ZW4gZ2lmdCB0eXBlIGFzIEluZmxvdyAmIE91dGZsb3cgc3Vtc1xyXG4gICAgICogQHBhcmFtIGhpc3RvcnkgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5XHJcbiAgICAgKiBAcGFyYW0gdHlwZSBwb2ludHMgb3Igd2VkZ2VzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3N1bUdpZnRzKFxyXG4gICAgICAgIGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdLFxyXG4gICAgICAgIHR5cGU6ICdnaWZ0UG9pbnRzJyB8ICdnaWZ0V2VkZ2UnXHJcbiAgICApOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBjb25zdCBvdXRmbG93ID0gWzBdO1xyXG4gICAgICAgIGNvbnN0IGluZmxvdyA9IFswXTtcclxuICAgICAgICAvLyBPbmx5IHJldHJpZXZlIGFtb3VudHMgb2YgYSBzcGVjaWZpZWQgZ2lmdCB0eXBlXHJcbiAgICAgICAgaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU3BsaXQgaW50byBJbmZsb3cvT3V0Zmxvd1xyXG4gICAgICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0Zmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFN1bSBhbGwgaXRlbXMgaW4gdGhlIGZpbHRlcmVkIGFycmF5XHJcbiAgICAgICAgY29uc3Qgc3VtT3V0ID0gb3V0Zmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICBjb25zdCBzdW1JbiA9IGluZmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICByZXR1cm4gW3N1bUluLCBNYXRoLmFicyhzdW1PdXQpXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgQ3JlYXRlcyBhIGxpc3Qgb2YgdGhlIG1vc3QgcmVjZW50IGdpZnRzXHJcbiAgICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgZnVsbCBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0d28gdXNlcnNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2hvd0dpZnRzKGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGdpZnQgd2FzIGEgd2VkZ2UsIHJldHVybiBjdXN0b20gdGV4dFxyXG4gICAgICAgIGNvbnN0IF93ZWRnZU9yUG9pbnRzID0gKGdpZnQ6IFVzZXJHaWZ0SGlzdG9yeSk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0UG9pbnRzJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke01hdGguYWJzKGdpZnQuYW1vdW50KX1gO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnKEZMKSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVycm9yOiB1bmtub3duIGdpZnQgdHlwZS4uLiAke2dpZnQudHlwZX06ICR7Z2lmdC5hbW91bnR9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgbGlzdCBmb3IgdGhlIGhpc3RvcnlcclxuICAgICAgICBjb25zdCBoaXN0b3J5TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5TGlzdC5zdHlsZSwge1xyXG4gICAgICAgICAgICBsaXN0U3R5bGU6ICdub25lJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJ2luaXRpYWwnLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMGVtJyxcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBMb29wIG92ZXIgaGlzdG9yeSBpdGVtcyBhbmQgYWRkIHRvIGFuIGFycmF5XHJcbiAgICAgICAgY29uc3QgZ2lmdHM6IHN0cmluZ1tdID0gaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgLy8gQWRkIHNvbWUgc3R5bGluZyBkZXBlbmRpbmcgb24gcG9zL25lZyBudW1iZXJzXHJcbiAgICAgICAgICAgIGxldCBmYW5jeUdpZnRBbW91bnQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fZ2V0U3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmYW5jeUdpZnRBbW91bnQgPSBgJHt0aGlzLl9zZW5kU3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgZGF0ZSByZWFkYWJsZVxyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gVXRpbC5wcmV0dHlTaXRlVGltZShnaWZ0LnRpbWVzdGFtcCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBgPGxpIGNsYXNzPSdtcF9naWZ0SXRlbSc+JHtkYXRlfSAke2ZhbmN5R2lmdEFtb3VudH08L2xpPmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gQWRkIGhpc3RvcnkgaXRlbXMgdG8gdGhlIGxpc3RcclxuICAgICAgICBoaXN0b3J5TGlzdC5pbm5lckhUTUwgPSBnaWZ0cy5qb2luKCcnKTtcclxuICAgICAgICByZXR1cm4gaGlzdG9yeUxpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogUExBQ0UgQUxMIE0rIEZFQVRVUkVTIEhFUkVcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqXHJcbiAqIE5lYXJseSBhbGwgZmVhdHVyZXMgYmVsb25nIGhlcmUsIGFzIHRoZXkgc2hvdWxkIGhhdmUgaW50ZXJuYWwgY2hlY2tzXHJcbiAqIGZvciBET00gZWxlbWVudHMgYXMgbmVlZGVkLiBPbmx5IGNvcmUgZmVhdHVyZXMgc2hvdWxkIGJlIHBsYWNlZCBpbiBgYXBwLnRzYFxyXG4gKlxyXG4gKiBUaGlzIGRldGVybWluZXMgdGhlIG9yZGVyIGluIHdoaWNoIHNldHRpbmdzIHdpbGwgYmUgZ2VuZXJhdGVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlLlxyXG4gKiBTZXR0aW5ncyB3aWxsIGJlIGdyb3VwZWQgYnkgdHlwZSBhbmQgRmVhdHVyZXMgb2Ygb25lIHR5cGUgdGhhdCBhcmUgY2FsbGVkIGJlZm9yZVxyXG4gKiBvdGhlciBGZWF0dXJlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgYXBwZWFyIGZpcnN0LlxyXG4gKlxyXG4gKiBUaGUgb3JkZXIgb2YgdGhlIGZlYXR1cmUgZ3JvdXBzIGlzIG5vdCBkZXRlcm1pbmVkIGhlcmUuXHJcbiAqL1xyXG5jbGFzcyBJbml0RmVhdHVyZXMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBHbG9iYWwgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEhpZGVIb21lKCk7XHJcbiAgICAgICAgbmV3IEhpZGVTZWVkYm94KCk7XHJcbiAgICAgICAgbmV3IEJsdXJyZWRIZWFkZXIoKTtcclxuICAgICAgICBuZXcgVmF1bHRMaW5rKCk7XHJcbiAgICAgICAgbmV3IE1pbmlWYXVsdEluZm8oKTtcclxuICAgICAgICBuZXcgQm9udXNQb2ludERlbHRhKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgSG9tZSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBIaWRlTmV3cygpO1xyXG4gICAgICAgIG5ldyBHaWZ0TmV3ZXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2VhcmNoIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFRvZ2dsZVNuYXRjaGVkKCk7XHJcbiAgICAgICAgbmV3IFN0aWNreVNuYXRjaGVkVG9nZ2xlKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFNlYXJjaCgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVTZWFyY2hib3goKTtcclxuICAgICAgICBuZXcgQnVpbGRUYWdzKCk7XHJcbiAgICAgICAgbmV3IFJhbmRvbUJvb2soKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBSZXF1ZXN0IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvblJlcSgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFJlcXVlc3QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUb3JyZW50IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvbigpO1xyXG4gICAgICAgIG5ldyBDdXJyZW50bHlSZWFkaW5nKCk7XHJcbiAgICAgICAgbmV3IFRvckdpZnREZWZhdWx0KCk7XHJcbiAgICAgICAgbmV3IFJhdGlvUHJvdGVjdCgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMSgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMigpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RMMygpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3RNaW4oKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBTaG91dGJveCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgUHJpb3JpdHlVc2VycygpO1xyXG4gICAgICAgIG5ldyBQcmlvcml0eVN0eWxlKCk7XHJcbiAgICAgICAgbmV3IE11dGVkVXNlcnMoKTtcclxuICAgICAgICBuZXcgUmVwbHlTaW1wbGUoKTtcclxuICAgICAgICBuZXcgUmVwbHlRdW90ZSgpO1xyXG4gICAgICAgIG5ldyBHaWZ0QnV0dG9uKCk7XHJcbiAgICAgICAgbmV3IFF1aWNrU2hvdXQoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBWYXVsdCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgU2ltcGxlVmF1bHQoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVc2VyIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFVzZXJHaWZ0RGVmYXVsdCgpO1xyXG4gICAgICAgIG5ldyBVc2VyR2lmdEhpc3RvcnkoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBGb3J1bSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBGb3J1bUZMR2lmdCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFVwbG9hZCBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBTZWFyY2hGb3JEdXBsaWNhdGVzKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNoZWNrLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2NvcmUudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciBoYW5kbGluZyBzZXR0aW5ncyBhbmQgdGhlIFByZWZlcmVuY2VzIHBhZ2VcclxuICogQG1ldGhvZCBpbml0OiB0dXJucyBmZWF0dXJlcycgc2V0dGluZ3MgaW5mbyBpbnRvIGEgdXNlYWJsZSB0YWJsZVxyXG4gKi9cclxuY2xhc3MgU2V0dGluZ3Mge1xyXG4gICAgLy8gRnVuY3Rpb24gZm9yIGdhdGhlcmluZyB0aGUgbmVlZGVkIHNjb3Blc1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNjb3BlcyhzZXR0aW5nczogQW55RmVhdHVyZVtdKTogUHJvbWlzZTxTZXR0aW5nR2xvYk9iamVjdD4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNjb3BlcygnLCBzZXR0aW5ncywgJyknKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjb3BlTGlzdDogU2V0dGluZ0dsb2JPYmplY3QgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzZXR0aW5nIG9mIHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gTnVtYmVyKHNldHRpbmcuc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIFNjb3BlIGV4aXN0cywgcHVzaCB0aGUgc2V0dGluZ3MgaW50byB0aGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIGlmIChzY29wZUxpc3RbaW5kZXhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVMaXN0W2luZGV4XS5wdXNoKHNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgY3JlYXRlIHRoZSBhcnJheVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZUxpc3RbaW5kZXhdID0gW3NldHRpbmddO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc29sdmUoc2NvcGVMaXN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiBmb3IgY29uc3RydWN0aW5nIHRoZSB0YWJsZSBmcm9tIGFuIG9iamVjdFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2J1aWxkVGFibGUocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ19idWlsZFRhYmxlKCcsIHBhZ2UsICcpJyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvdXRwID0gYDx0Ym9keT48dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGJyPjxzdHJvbmc+TUFNKyB2JHtNUC5WRVJTSU9OfTwvc3Ryb25nPiAtIEhlcmUgeW91IGNhbiBlbmFibGUgJmFtcDsgZGlzYWJsZSBhbnkgZmVhdHVyZSBmcm9tIHRoZSA8YSBocmVmPVwiL2YvdC80MTg2M1wiPk1BTSsgdXNlcnNjcmlwdDwvYT4hIEhvd2V2ZXIsIHRoZXNlIHNldHRpbmdzIGFyZSA8c3Ryb25nPk5PVDwvc3Ryb25nPiBzdG9yZWQgb24gTUFNOyB0aGV5IGFyZSBzdG9yZWQgd2l0aGluIHRoZSBUYW1wZXJtb25rZXkvR3JlYXNlbW9ua2V5IGV4dGVuc2lvbiBpbiB5b3VyIGJyb3dzZXIsIGFuZCBtdXN0IGJlIGN1c3RvbWl6ZWQgb24gZWFjaCBvZiB5b3VyIGJyb3dzZXJzL2RldmljZXMgc2VwYXJhdGVseS48YnI+PGJyPkZvciBhIGRldGFpbGVkIGxvb2sgYXQgdGhlIGF2YWlsYWJsZSBmZWF0dXJlcywgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy93aWtpL0ZlYXR1cmUtT3ZlcnZpZXdcIj5jaGVjayB0aGUgV2lraSE8L2E+PGJyPjxicj48L3RkPjwvdHI+YDtcclxuXHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2UpLmZvckVhY2goKHNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzY29wZU51bTogbnVtYmVyID0gTnVtYmVyKHNjb3BlKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCB0aGUgc2VjdGlvbiB0aXRsZVxyXG4gICAgICAgICAgICAgICAgb3V0cCArPSBgPHRyPjx0ZCBjbGFzcz0ncm93Mic+JHtTZXR0aW5nR3JvdXBbc2NvcGVOdW1dfTwvdGQ+PHRkIGNsYXNzPSdyb3cxJz5gO1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSByZXF1aXJlZCBpbnB1dCBmaWVsZCBiYXNlZCBvbiB0aGUgc2V0dGluZ1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZVtzY29wZU51bV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nTnVtYmVyOiBudW1iZXIgPSBOdW1iZXIoc2V0dGluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbTogQW55RmVhdHVyZSA9IHBhZ2Vbc2NvcGVOdW1dW3NldHRpbmdOdW1iZXJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxpbnB1dCB0eXBlPSdjaGVja2JveCcgaWQ9JyR7aXRlbS50aXRsZX0nIHZhbHVlPSd0cnVlJz4ke2l0ZW0uZGVzY308YnI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8aW5wdXQgdHlwZT0ndGV4dCcgaWQ9JyR7aXRlbS50aXRsZX0nIHBsYWNlaG9sZGVyPScke2l0ZW0ucGxhY2Vob2xkZXJ9JyBjbGFzcz0nbXBfdGV4dElucHV0JyBzaXplPScyNSc+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8c3BhbiBjbGFzcz0nbXBfc2V0VGFnJz4ke2l0ZW0udGFnfTo8L3NwYW4+IDxzZWxlY3QgaWQ9JyR7aXRlbS50aXRsZX0nIGNsYXNzPSdtcF9kcm9wSW5wdXQnPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaXRlbS5vcHRpb25zKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPG9wdGlvbiB2YWx1ZT0nJHtrZXl9Jz4ke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5vcHRpb25zIVtrZXldXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L29wdGlvbj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPC9zZWxlY3Q+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlKSBjYXNlc1tpdGVtLnR5cGVdKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSByb3dcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gJzwvdGQ+PC90cj4nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBzYXZlIGJ1dHRvbiAmIGxhc3QgcGFydCBvZiB0aGUgdGFibGVcclxuICAgICAgICAgICAgb3V0cCArPVxyXG4gICAgICAgICAgICAgICAgJzx0cj48dGQgY2xhc3M9XCJyb3cxXCIgY29sc3Bhbj1cIjJcIj48ZGl2IGlkPVwibXBfc3VibWl0XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+U2F2ZSBNKyBTZXR0aW5ncz8/PC9kaXY+PGRpdiBpZD1cIm1wX2NvcHlcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5Db3B5IFNldHRpbmdzPC9kaXY+PGRpdiBpZD1cIm1wX2luamVjdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlBhc3RlIFNldHRpbmdzPC9kaXY+PHNwYW4gY2xhc3M9XCJtcF9zYXZlc3RhdGVcIiBzdHlsZT1cIm9wYWNpdHk6MFwiPlNhdmVkITwvc3Bhbj48L3RkPjwvdHI+PC90Ym9keT4nO1xyXG5cclxuICAgICAgICAgICAgcmVzb2x2ZShvdXRwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgY3VycmVudCBzZXR0aW5ncyB2YWx1ZXNcclxuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTZXR0aW5ncyhwYWdlOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIC8vIFV0aWwucHVyZ2VTZXR0aW5ncygpO1xyXG4gICAgICAgIGNvbnN0IGFsbFZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdfZ2V0U2V0dGluZ3MoJywgcGFnZSwgJylcXG5TdG9yZWQgR00ga2V5czonLCBhbGxWYWx1ZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBPYmplY3Qua2V5cyhwYWdlKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmID0gcGFnZVtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnUHJlZjonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCBTZXQ6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1gKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgVmFsdWU6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYClcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmVmICE9PSBudWxsICYmIHR5cGVvZiBwcmVmID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWYudGl0bGUpIVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZSgnY2hlY2tlZCcsICdjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0udmFsdWUgPSBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0udmFsdWUgPSBHTV9nZXRWYWx1ZShwcmVmLnRpdGxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXNlc1twcmVmLnR5cGVdICYmIEdNX2dldFZhbHVlKHByZWYudGl0bGUpKSBjYXNlc1twcmVmLnR5cGVdKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9zZXRTZXR0aW5ncyhvYmo6IFNldHRpbmdHbG9iT2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgX3NldFNldHRpbmdzKGAsIG9iaiwgJyknKTtcclxuICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKHNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9ialtOdW1iZXIoc2NvcGUpXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IG9ialtOdW1iZXIoc2NvcGUpXVtOdW1iZXIoc2V0dGluZyldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcmVmICE9PSBudWxsICYmIHR5cGVvZiBwcmVmID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsZW06IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWYudGl0bGUpIVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0uY2hlY2tlZCkgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucDogc3RyaW5nID0gZWxlbS52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGAsIGlucCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCBlbGVtLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXNlc1twcmVmLnR5cGVdKSBjYXNlc1twcmVmLnR5cGVdKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmVkIScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9jb3B5U2V0dGluZ3MoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBnbUxpc3QgPSBHTV9saXN0VmFsdWVzKCk7XHJcbiAgICAgICAgY29uc3Qgb3V0cDogW3N0cmluZywgc3RyaW5nXVtdID0gW107XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgc3RvcmVkIHNldHRpbmdzIGFuZCBwdXNoIHRvIG91dHB1dCBhcnJheVxyXG4gICAgICAgIGdtTGlzdC5tYXAoKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgLy8gRG9uJ3QgZXhwb3J0IG1wXyBzZXR0aW5ncyBhcyB0aGV5IHNob3VsZCBvbmx5IGJlIHNldCBhdCBydW50aW1lXHJcbiAgICAgICAgICAgIGlmIChzZXR0aW5nLmluZGV4T2YoJ21wXycpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cC5wdXNoKFtzZXR0aW5nLCBHTV9nZXRWYWx1ZShzZXR0aW5nKV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfcGFzdGVTZXR0aW5ncyhwYXlsb2FkOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9wYXN0ZVNldHRpbmdzKCApYCk7XHJcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBKU09OLnBhcnNlKHBheWxvYWQpO1xyXG4gICAgICAgIHNldHRpbmdzLmZvckVhY2goKHR1cGxlOiBbc3RyaW5nLCBzdHJpbmddW10pID0+IHtcclxuICAgICAgICAgICAgaWYgKHR1cGxlWzFdKSB7XHJcbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHt0dXBsZVswXX1gLCBgJHt0dXBsZVsxXX1gKTtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codHVwbGVbMF0sICc6ICcsIHR1cGxlWzFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZ1bmN0aW9uIHRoYXQgc2F2ZXMgdGhlIHZhbHVlcyBvZiB0aGUgc2V0dGluZ3MgdGFibGVcclxuICAgIHByaXZhdGUgc3RhdGljIF9zYXZlU2V0dGluZ3ModGltZXI6IG51bWJlciwgb2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cChgX3NhdmVTZXR0aW5ncygpYCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNhdmVzdGF0ZTogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ubXBfc2F2ZXN0YXRlJykhXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBnbVZhbHVlczogc3RyaW5nW10gPSBHTV9saXN0VmFsdWVzKCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRpbWVyICYgbWVzc2FnZVxyXG4gICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZpbmcuLi4nKTtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCB2YWx1ZXMgc3RvcmVkIGluIEdNIGFuZCByZXNldCBldmVyeXRoaW5nXHJcbiAgICAgICAgZm9yIChjb25zdCBmZWF0dXJlIGluIGdtVmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZ21WYWx1ZXNbZmVhdHVyZV0gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIC8vIE9ubHkgbG9vcCBvdmVyIHZhbHVlcyB0aGF0IGFyZSBmZWF0dXJlIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICBpZiAoIVsnbXBfdmVyc2lvbicsICdzdHlsZV90aGVtZSddLmluY2x1ZGVzKGdtVmFsdWVzW2ZlYXR1cmVdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgbm90IHBhcnQgb2YgcHJlZmVyZW5jZXMgcGFnZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnbVZhbHVlc1tmZWF0dXJlXS5pbmRleE9mKCdtcF8nKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShnbVZhbHVlc1tmZWF0dXJlXSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2F2ZSB0aGUgc2V0dGluZ3MgdG8gR00gdmFsdWVzXHJcbiAgICAgICAgdGhpcy5fc2V0U2V0dGluZ3Mob2JqKTtcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSB0aGUgY29uZmlybWF0aW9uIG1lc3NhZ2VcclxuICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcxJztcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzAnO1xyXG4gICAgICAgICAgICB9LCAyMzQ1KTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIHRoZSBzZXR0aW5ncyBwYWdlLlxyXG4gICAgICogQHBhcmFtIHJlc3VsdCBWYWx1ZSB0aGF0IG11c3QgYmUgcGFzc2VkIGRvd24gZnJvbSBgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKWBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyBUaGUgYXJyYXkgb2YgZmVhdHVyZXMgdG8gcHJvdmlkZSBzZXR0aW5ncyBmb3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBpbml0KHJlc3VsdDogYm9vbGVhbiwgc2V0dGluZ3M6IEFueUZlYXR1cmVbXSkge1xyXG4gICAgICAgIC8vIFRoaXMgd2lsbCBvbmx5IHJ1biBpZiBgQ2hlY2sucGFnZSgnc2V0dGluZ3MpYCByZXR1cm5zIHRydWUgJiBpcyBwYXNzZWQgaGVyZVxyXG4gICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBuZXcgU2V0dGluZ3MoKWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNldHRpbmdzIHRhYmxlIGhhcyBsb2FkZWRcclxuICAgICAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJyNtYWluQm9keSA+IHRhYmxlJykudGhlbigocikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgW00rXSBTdGFydGluZyB0byBidWlsZCBTZXR0aW5ncyB0YWJsZS4uLmApO1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyB0YWJsZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ05hdjogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSA+IHRhYmxlJykhO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RpdGxlOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMScpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1RhYmxlOiBIVE1MVGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGxldCBwYWdlU2NvcGU6IFNldHRpbmdHbG9iT2JqZWN0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCB0YWJsZSBlbGVtZW50cyBhZnRlciB0aGUgUHJlZiBuYXZiYXJcclxuICAgICAgICAgICAgICAgIHNldHRpbmdOYXYuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHNldHRpbmdUaXRsZSk7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIHNldHRpbmdUYWJsZSk7XHJcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoc2V0dGluZ1RhYmxlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdjb2x0YWJsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNwYWNpbmc6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ3dpZHRoOjEwMCU7bWluLXdpZHRoOjEwMCU7bWF4LXdpZHRoOjEwMCU7JyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmlubmVySFRNTCA9ICdNQU0rIFNldHRpbmdzJztcclxuICAgICAgICAgICAgICAgIC8vIEdyb3VwIHNldHRpbmdzIGJ5IHBhZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dldFNjb3BlcyhzZXR0aW5ncylcclxuICAgICAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0YWJsZSBIVE1MIGZyb20gZmVhdHVyZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVNjb3BlID0gc2NvcGVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRUYWJsZShzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGNvbnRlbnQgaW50byB0aGUgbmV3IHRhYmxlIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nVGFibGUuaW5uZXJIVE1MID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgTUFNKyBTZXR0aW5ncyB0YWJsZSEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VTY29wZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2V0dGluZ3Moc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlcztcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgYXJlIGRvbmUgbG9hZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChzY29wZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VibWl0QnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc3VibWl0JykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcHlCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9jb3B5JykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhc3RlQnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfaW5qZWN0JykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzc1RpbWVyOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2F2ZVNldHRpbmdzKHNzVGltZXIsIHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKHBhc3RlQnRuLCB0aGlzLl9wYXN0ZVNldHRpbmdzLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9jb3B5U2V0dGluZ3MoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInR5cGVzLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInN0eWxlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9jb3JlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9nbG9iYWwudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2hvbWUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3Rvci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvZm9ydW0udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3Nob3V0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9icm93c2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3JlcXVlc3QudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3ZhdWx0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91cGxvYWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VzZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZmVhdHVyZXMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic2V0dGluZ3MudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogVXNlcnNjcmlwdCBuYW1lc3BhY2VcclxuICogQGNvbnN0YW50IENIQU5HRUxPRzogT2JqZWN0IGNvbnRhaW5pbmcgYSBsaXN0IG9mIGNoYW5nZXMgYW5kIGtub3duIGJ1Z3NcclxuICogQGNvbnN0YW50IFRJTUVTVEFNUDogUGxhY2Vob2xkZXIgaG9vayBmb3IgdGhlIGN1cnJlbnQgYnVpbGQgdGltZVxyXG4gKiBAY29uc3RhbnQgVkVSU0lPTjogVGhlIGN1cnJlbnQgdXNlcnNjcmlwdCB2ZXJzaW9uXHJcbiAqIEBjb25zdGFudCBQUkVWX1ZFUjogVGhlIGxhc3QgaW5zdGFsbGVkIHVzZXJzY3JpcHQgdmVyc2lvblxyXG4gKiBAY29uc3RhbnQgRVJST1JMT0c6IFRoZSB0YXJnZXQgYXJyYXkgZm9yIGxvZ2dpbmcgZXJyb3JzXHJcbiAqIEBjb25zdGFudCBQQUdFX1BBVEg6IFRoZSBjdXJyZW50IHBhZ2UgVVJMIHdpdGhvdXQgdGhlIHNpdGUgYWRkcmVzc1xyXG4gKiBAY29uc3RhbnQgTVBfQ1NTOiBUaGUgTUFNKyBzdHlsZXNoZWV0XHJcbiAqIEBjb25zdGFudCBydW4oKTogU3RhcnRzIHRoZSB1c2Vyc2NyaXB0XHJcbiAqL1xyXG5uYW1lc3BhY2UgTVAge1xyXG4gICAgZXhwb3J0IGNvbnN0IERFQlVHOiBib29sZWFuIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ2RlYnVnJykgPyB0cnVlIDogZmFsc2U7XHJcbiAgICBleHBvcnQgY29uc3QgQ0hBTkdFTE9HOiBBcnJheU9iamVjdCA9IHtcclxuICAgICAgICAvKiDwn4aV4pm777iP8J+QniAqL1xyXG4gICAgICAgIFVQREFURV9MSVNUOiBbXHJcbiAgICAgICAgICAgIGDwn4aVOiBVcGRhdGVkIFJhdGlvIFByb3RlY3QgdG8gdjEuODsgdGhpcyB2ZXJzaW9uIGFkZHMgYSBDb3N0IFRvIFJlc3RvcmUgUmF0aW8gaW5mbyBmaWVsZC5gLFxyXG4gICAgICAgIF0gYXMgc3RyaW5nW10sXHJcbiAgICAgICAgQlVHX0xJU1Q6IFtdIGFzIHN0cmluZ1tdLFxyXG4gICAgfTtcclxuICAgIGV4cG9ydCBjb25zdCBUSU1FU1RBTVA6IHN0cmluZyA9ICcjI21ldGFfdGltZXN0YW1wIyMnO1xyXG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBQUkVWX1ZFUjogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ2hlY2sucHJldlZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBFUlJPUkxPRzogc3RyaW5nW10gPSBbXTtcclxuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGV4cG9ydCBjb25zdCBNUF9DU1M6IFN0eWxlID0gbmV3IFN0eWxlKCk7XHJcbiAgICBleHBvcnQgY29uc3Qgc2V0dGluZ3NHbG9iOiBBbnlGZWF0dXJlW10gPSBbXTtcclxuXHJcbiAgICBleHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUFJFIFNDUklQVFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFdlbGNvbWUgdG8gTUFNKyB2JHtWRVJTSU9OfSFgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgcGFnZSBpcyBub3QgeWV0IGtub3duXHJcbiAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xyXG4gICAgICAgIC8vIEFkZCBhIHNpbXBsZSBjb29raWUgdG8gYW5ub3VuY2UgdGhlIHNjcmlwdCBpcyBiZWluZyB1c2VkXHJcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gJ21wX2VuYWJsZWQ9MTtkb21haW49bXlhbm9uYW1vdXNlLm5ldDtwYXRoPS87c2FtZXNpdGU9bGF4JztcclxuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXHJcbiAgICAgICAgY29uc3QgYWxlcnRzOiBBbGVydHMgPSBuZXcgQWxlcnRzKCk7XHJcbiAgICAgICAgbmV3IERlYnVnKCk7XHJcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICBDaGVjay51cGRhdGVkKCkudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIGFsZXJ0cy5ub3RpZnkocmVzdWx0LCBDSEFOR0VMT0cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZlYXR1cmVzXHJcbiAgICAgICAgbmV3IEluaXRGZWF0dXJlcygpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFNFVFRJTkdTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3ViUGc6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2V0dGluZ3MgcGFnZVxyXG4gICAgICAgICAgICAgICAgU2V0dGluZ3MuaW5pdChyZXN1bHQsIHNldHRpbmdzR2xvYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBTVFlMRVNcclxuICAgICAgICAgKiBJbmplY3RzIENTU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjdXN0b20gQ1NTIHNoZWV0XHJcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzaXRlIHRoZW1lXHJcbiAgICAgICAgICAgIE1QX0NTUy5hbGlnblRvU2l0ZVRoZW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcclxuTVAucnVuKCk7XHJcbiJdfQ==
