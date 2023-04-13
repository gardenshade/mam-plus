// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.3.11
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://*.myanonamouse.net/*
// @exclude      https://cdn.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.3.11
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_getResourceText
// ==/UserScript==
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
var _a;
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
        if (MP.DEBUG)
            console.log(tar);
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
    /**
     * #### Get the user gift history between the logged in user and everyone
     */
    static getAllUserGiftHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawGiftHistory = yield Util.getJSON(`https://www.myanonamouse.net/json/userBonusHistory.php`);
            const giftHistory = JSON.parse(rawGiftHistory);
            // Return the full data
            return giftHistory;
        });
    }
    /**
     * #### Gets the logged in user's userid
     */
    static getCurrentUserID() {
        const myInfo = (document.querySelector('.mmUserStats .avatar a'));
        if (myInfo) {
            const userID = this.endOfHref(myInfo);
            console.log(`[M+] Logged in userID is ${userID}`);
            return userID;
        }
        console.log('No logged in user found.');
        return '';
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
_a = Util;
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
Util.getBookTitle = (data, auth = '') => __awaiter(_a, void 0, void 0, function* () {
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
Util.getBookAuthors = (data, num = 3) => __awaiter(_a, void 0, void 0, function* () {
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
Util.getBookSeries = (data) => __awaiter(_a, void 0, void 0, function* () {
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
        ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][index]);
};
Util.derefer = (url) => {
    return `https://r.mrd.ninja/${encodeURI(url)}`;
};
Util.delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
            const _counterLimit = 200;
            const logic = (selector) => __awaiter(this, void 0, void 0, function* () {
                // Select the actual element
                const elem = typeof selector === 'string'
                    ? document.querySelector(selector)
                    : selector;
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
                    newUsers: () => 'new users',
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
        this._tar = '#menu .sbDonCrypto';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const seedboxBtn = document.querySelector(this._tar);
            if (seedboxBtn) {
                seedboxBtn.style.display = 'none';
                console.log('[M+] Hid the Seedbox button!');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * ## Hide the donation link
 */
class HideDonationBox {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'hideDonationBox',
            scope: SettingGroup.Global,
            desc: 'Remove the Donations menu item',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#menu .mmDonBox';
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const donationBoxBtn = document.querySelector(this._tar);
            if (donationBoxBtn) {
                donationBoxBtn.style.display = 'none';
                console.log('[M+] Hid the Donation Box button!');
            }
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * # Fixed navigation & search
 */
class FixedNav {
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'fixedNav',
            scope: SettingGroup.Global,
            desc: 'Fix the navigation/search to the top of the page.',
        };
        this._tar = 'body';
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            document.querySelector('body').classList.add('mp_fixed_nav');
            console.log('[M+] Pinned the nav/search to the top!');
        });
    }
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
        // TODO: Make goodreadsButtons() into a generic framework for other site's buttons
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
        this.audibleButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-Audible buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search Audible', 'mp_auRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_auRow .flex');
            const buttonTar = (document.querySelector('.mp_auRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = `https://www.audible.com/search?keywords=${item}`;
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
                    const url = `https://www.audible.com/search?author_author=${authors}`;
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
                    const url = `https://www.audible.com/search?title=${title}`;
                    Util.createLinkButton(buttonTar, url, 'Title', 2);
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://www.audible.com/search?title=${title}&author_author=${authors}`;
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
            console.log(`[M+] Added the MAM-to-Audible buttons!`);
        });
        // TODO: Switch to StoryGraph API once it becomes available? Or advanced search
        this.storyGraphButtons = (bookData, authorData, seriesData, target) => __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Adding the MAM-to-StoryGraph buttons...');
            let seriesP, authorP;
            let authors = '';
            Util.addTorDetailsRow(target, 'Search TheStoryGraph', 'mp_sgRow');
            // Extract the Series and Author
            yield Promise.all([
                (seriesP = Util.getBookSeries(seriesData)),
                (authorP = Util.getBookAuthors(authorData)),
            ]);
            yield Check.elemLoad('.mp_sgRow .flex');
            const buttonTar = (document.querySelector('.mp_sgRow .flex'));
            if (buttonTar === null) {
                throw new Error('Button row cannot be targeted!');
            }
            // Build Series buttons
            seriesP.then((ser) => {
                if (ser.length > 0) {
                    ser.forEach((item) => {
                        const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                        const url = `https://app.thestorygraph.com/browse?search_term=${item}`;
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
                    const url = `https://app.thestorygraph.com/browse?search_term=${authors}`;
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
                    const url = `https://app.thestorygraph.com/browse?search_term=${title}`;
                    Util.createLinkButton(buttonTar, url, 'Title', 2);
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://app.thestorygraph.com/browse?search_term=${title} ${authors}`;
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
            console.log(`[M+] Added the MAM-to-StoryGraph buttons!`);
        });
        this.getRatioProtectLevels = () => __awaiter(this, void 0, void 0, function* () {
            let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
            let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
            let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));
            const l1_def = 0.5;
            const l2_def = 1;
            const l3_def = 2;
            // Default values if empty
            if (isNaN(l3))
                l3 = l3_def;
            if (isNaN(l2))
                l2 = l2_def;
            if (isNaN(l1))
                l1 = l1_def;
            // If someone put things in a dumb order, ignore smaller numbers
            if (l2 > l3)
                l2 = l3;
            if (l1 > l2)
                l1 = l2;
            // If custom numbers are smaller than default values, ignore the lower warning
            if (isNaN(l2))
                l2 = l3 < l2_def ? l3 : l2_def;
            if (isNaN(l1))
                l1 = l2 < l1_def ? l2 : l1_def;
            return [l1, l2, l3];
        });
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
            //make sure the value falls within the acceptable range
            // TODO: Make the gift value check into a Util
            if (!giftValueSetting) {
                giftValueSetting = '100';
            }
            else if (Number(giftValueSetting) > 100 || isNaN(Number(giftValueSetting))) {
                giftValueSetting = '100';
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
                title: 'Value between 5 and 100',
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
        this._valueTitle = `mp_${this._settings.title}_val`;
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
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
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
 * * Adds various links to Audible
 */
class AudibleButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'audibleButton',
            desc: 'Enable the MAM-to-Audible buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping Audible buttons');
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
            let target = document.querySelector(this._tar);
            if (document.querySelector('.mp_sgRow')) {
                target = document.querySelector('.mp_sgRow');
            }
            else if (document.querySelector('.mp_grRow')) {
                target = document.querySelector('.mp_grRow');
            }
            // Generate buttons
            this._share.audibleButtons(bookData, authorData, seriesData, target);
        });
    }
    get settings() {
        return this._settings;
    }
}
/**
 * * Adds various links to StoryGraph
 */
class StoryGraphButton {
    constructor() {
        this._settings = {
            scope: SettingGroup['Torrent Page'],
            type: 'checkbox',
            title: 'storyGraphButton',
            desc: 'Enable the MAM-to-StoryGraph buttons',
        };
        this._tar = '#submitInfo';
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                }
                else {
                    console.log('[M+] Not a book category; skipping StroyGraph buttons');
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
            let target = document.querySelector(this._tar);
            if (document.querySelector('.mp_grRow')) {
                target = document.querySelector('.mp_grRow');
            }
            // Generate buttons
            this._share.storyGraphButtons(bookData, authorData, seriesData, target);
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
        this._share = new Shared();
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[M+] Enabling ratio protection...');
            // TODO: Move this block to shared
            // The download text area
            const dlBtn = document.querySelector('#tddl');
            // The currently unused label area above the download text
            const dlLabel = document.querySelector('#download .torDetInnerTop');
            // Insertion target for messages
            const descBlock = yield Check.elemLoad('.torDetBottom');
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // User has a ratio
            const userHasRatio = rCur.textContent.indexOf('Inf') < 0 ? true : false;
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            if (MP.DEBUG)
                console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);
            // Create the box we will display text in
            if (descBlock) {
                // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
                descBlock.insertAdjacentHTML('beforebegin', `<div class="torDetRow" id="mp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}" style="flex-direction:column;align-items:flex-start;"><span id="mp_foobar"></span></div></div>`);
            }
            else {
                throw new Error(`'.torDetRow is ${descBlock}`);
            }
            // Only run the code if the ratio exists
            if (rNew && rCur && !seeding && userHasRatio) {
                const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
                if (MP.DEBUG)
                    console.log(`Current ${Util.extractFloat(rCur)[0]} | New ${Util.extractFloat(rNew)[0]} | Dif ${rDiff}`);
                // Only activate if a ratio change is expected
                if (!isNaN(rDiff) && rDiff > 0.009) {
                    if (dlLabel) {
                        dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                        dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                    }
                    // Calculate & Display cost of download w/o FL
                    // Always show calculations when there is a ratio loss
                    const sizeElem = document.querySelector('#size span');
                    if (sizeElem) {
                        const size = sizeElem.textContent.split(/\s+/);
                        const sizeMap = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
                        // Convert human readable size to bytes
                        const byteSized = Number(size[0]) * Math.pow(1024, sizeMap.indexOf(size[1]));
                        const recovery = byteSized * Util.extractFloat(rCur)[0];
                        const pointAmnt = Math.floor((125 * recovery) / 268435456).toLocaleString();
                        const dayAmount = Math.floor((5 * recovery) / 2147483648);
                        const wedgeStoreCost = Util.formatBytes((268435456 * 50000) / (Util.extractFloat(rCur)[0] * 125));
                        const wedgeVaultCost = Util.formatBytes((268435456 * 200) / (Util.extractFloat(rCur)[0] * 125));
                        // Update the ratio cost row
                        document.querySelector(`.${this._rcRow}`).innerHTML = `<span><b>${Util.formatBytes(recovery)}</b>&nbsp;upload (${pointAmnt} BP; or one FL wedge per day for ${dayAmount} days).&nbsp;<abbr title='Contributing 2,000 BP to each vault cycle gives you almost one FL wedge per day on average.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
                    <span>Wedge store price: <i>${wedgeStoreCost}</i>&nbsp;<abbr title='If you buy wedges from the store, this is how large a torrent must be to break even on the cost (50,000 BP) of a single wedge.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>
                    <span>Wedge vault price: <i>${wedgeVaultCost}</i>&nbsp;<abbr title='If you contribute to the vault, this is how large a torrent must be to break even on the cost (200 BP) of 10 wedges for the maximum contribution of 2,000 BP.' style='text-decoration:none;cursor:help;'>&#128712;</abbr></span>`;
                    }
                    // Style the download button based on Ratio Protect level settings
                    if (dlBtn && dlLabel) {
                        // * This is the "trivial ratio loss" threshold
                        // These changes will always happen if the ratio conditions are met
                        if (rDiff > r1) {
                            this._setButtonState(dlBtn, '1_notify');
                        }
                        // * This is the "I never want to dl w/o FL" threshold
                        // This also uses the Minimum Ratio, if enabled
                        // This also prevents going below 2 ratio (PU requirement)
                        // TODO: Replace disable button with buy FL button
                        if (rDiff > r3 ||
                            Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                            Util.extractFloat(rNew)[0] < 2) {
                            this._setButtonState(dlBtn, '3_alert');
                            // * This is the "I need to think about using a FL" threshold
                        }
                        else if (rDiff > r2) {
                            this._setButtonState(dlBtn, '2_warn');
                        }
                    }
                }
                // If the user does not have a ratio, display a short message
            }
            else if (!userHasRatio) {
                this._setButtonState(dlBtn, '1_notify');
                document.querySelector(`.${this._rcRow}`).innerHTML = `<span>Ratio points and cost to restore ratio will appear here after your ratio is a real number.</span>`;
            }
        });
    }
    _setButtonState(tar, state, label) {
        if (state === '1_notify') {
            tar.style.backgroundColor = 'SpringGreen';
            tar.style.color = 'black';
            tar.innerHTML = 'Download?';
        }
        else if (state === '2_warn') {
            tar.style.backgroundColor = 'Orange';
            tar.innerHTML = 'Suggest FL';
        }
        else if (state === '3_alert') {
            if (!label) {
                console.warn(`No label provided in _setButtonState()!`);
            }
            tar.style.backgroundColor = 'Red';
            tar.style.cursor = 'no-drop';
            tar.innerHTML = 'FL Needed';
            label.style.fontWeight = 'bold';
        }
        else {
            throw new Error(`State "${state}" does not exist.`);
        }
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
            placeholder: 'default: 0.5',
            desc: `Set the smallest threshhold to indicate ratio changes. (<em>This is a slight color change</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L1!');
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
            placeholder: 'default: 1',
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
        console.log('[M+] Enabled custom Ratio Protection L2!');
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
            placeholder: 'default: 2',
            desc: `Set the highest threshhold to prevent ratio changes. (<em>This disables download without FL use</em>).`,
        };
        this._tar = '#download';
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        console.log('[M+] Enabled custom Ratio Protection L3!');
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
            desc: 'Trigger Ratio Warn L3 if your ratio would drop below this number.',
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
            console.log('[M+] Enabled custom Ratio Protection minimum!');
        });
    }
    get settings() {
        return this._settings;
    }
}
class RatioProtectIcons {
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        this._settings = {
            type: 'checkbox',
            title: 'ratioProtectIcons',
            scope: SettingGroup['Torrent Page'],
            desc: 'Enable custom browser favicons based on Ratio Protect conditions?',
        };
        // An element that must exist in order for the feature to run
        this._tar = '#ratio';
        this._userID = 164109;
        this._share = new Shared();
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[M+] Enabling custom Ratio Protect favicons from user ${this._userID}...`);
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Difference between new and old ratio
            const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // VIP status
            const vipstat = document.querySelector('#ratio .torDetInnerBottomSpan')
                ? document.querySelector('#ratio .torDetInnerBottomSpan').textContent
                : null;
            // Bookclub status
            const bookclub = document.querySelector("div[id='bcfl'] span");
            // Find favicon links and load a simple default.
            const siteFavicons = document.querySelectorAll("link[rel$='icon']");
            if (siteFavicons)
                this._buildIconLinks(siteFavicons, 'tm_32x32');
            // Test if VIP
            if (vipstat) {
                if (MP.DEBUG)
                    console.log(`VIP = ${vipstat}`);
                if (vipstat.search('VIP expires') > -1) {
                    this._buildIconLinks(siteFavicons, 'mouseclock');
                    document.title = document.title.replace(' | My Anonamouse', ` | Expires ${vipstat.substring(26)}`);
                }
                else if (vipstat.search('VIP not set to expire') > -1) {
                    this._buildIconLinks(siteFavicons, '0cir');
                    document.title = document.title.replace(' | My Anonamouse', ' | Not set to expire');
                }
                else if (vipstat.search('This torrent is freeleech!') > -1) {
                    this._buildIconLinks(siteFavicons, 'mouseclock');
                    // Test if bookclub
                    if (bookclub && bookclub.textContent.search('Bookclub Freeleech') > -1) {
                        document.title = document.title.replace(' | My Anonamouse', ` | Club expires ${bookclub.textContent.substring(25)}`);
                    }
                    else {
                        document.title = document.title.replace(' | My Anonamouse', " | 'till next Site FL"
                        // TODO: Calculate when FL ends
                        // ` | 'till ${this._nextFLDate()}`
                        );
                    }
                }
            }
            // Test if seeding/downloading
            if (seeding) {
                this._buildIconLinks(siteFavicons, '13egg');
                // * Similar icons: 13seed8, 13seed7, 13egg, 13, 13cir, 13WhiteCir
            }
            else if (vipstat.search('This torrent is personal freeleech') > -1) {
                this._buildIconLinks(siteFavicons, '5');
            }
            // Test if there will be ratio loss
            if (rNew && rCur && !seeding) {
                // Change icon based on Ratio Protect states
                if (rDiff > r3 ||
                    Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                    Util.extractFloat(rNew)[0] < 2) {
                    this._buildIconLinks(siteFavicons, '12');
                }
                else if (rDiff > r2) {
                    this._buildIconLinks(siteFavicons, '3Qmouse');
                    // Also try Orange, OrangeRed, Gold, or 14
                }
                else if (rDiff > r1) {
                    this._buildIconLinks(siteFavicons, 'SpringGreen');
                }
                // Check if future VIP
                if (vipstat.search('On list for next FL pick') > -1) {
                    this._buildIconLinks(siteFavicons, 'MirrorGreenClock'); // Also try greenclock
                    document.title = document.title.replace(' | My Anonamouse', ' | Next FL pick');
                }
            }
            console.log('[M+] Custom Ratio Protect favicons enabled!');
        });
    }
    // TODO: Function for calculating when FL ends
    // ? How are we able to determine when the current FL period started?
    /* private async _nextFLDate() {
        const d = new Date('Jun 14, 2022 00:00:00 UTC'); // seed date over two weeks ago
        const now = new Date(); //Place test dates here like Date("Jul 14, 2022 00:00:00 UTC")
        let mssince = now.getTime() - d.getTime(); //time since FL start seed date
        let dayssince = mssince / 86400000;
        let q = Math.floor(dayssince / 14); // FL periods since seed date

        const addDays = (date, days) => {
            const current = new Date(date);
            return current.setDate(current.getDate() + days);
        };

        return d
            .addDays(q * 14 + 14)
            .toISOString()
            .substr(0, 10);
    } */
    _buildIconLinks(elems, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            elems.forEach((elem) => {
                elem.href = `https://cdn.myanonamouse.net/imagebucket/${this._userID}/${filename}.png`;
            });
        });
    }
    get settings() {
        return this._settings;
    }
    set userID(newID) {
        this._userID = newID;
    }
}
// TODO: Add feature to set RatioProtectIcon's `_userID` value. Only necessary once other icon sets exist.
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
        this._sendSymbol = `<span style='color:orange' title='sent'>\u27F0</span>`;
        this._getSymbol = `<span style='color:teal' title='received'>\u27F1</span>`;
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
            const currentUserID = Util.getCurrentUserID();
            // TODO: use `cdn.` instead of `www.`; currently causes a 403 error
            if (userID) {
                if (userID === currentUserID) {
                    historyTitle.textContent = 'Recent Gift History';
                    return this._historyWithAll(historyBox);
                }
                return this._historyWithUserID(userID, historyBox);
            }
            else {
                throw new Error(`User ID not found: ${userID}`);
            }
        });
    }
    /**
     * #### Fill out history box
     * @param userID the user to get history from
     * @param historyBox the box to put it in
     */
    _historyWithUserID(userID, historyBox) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const otherUser = giftHistory[0].other_name;
                // Generate a message
                historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> to ${otherUser} and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                // Add the message to the box
                historyBox.appendChild(this._showGifts(giftHistory));
                console.log('[M+] User gift history added!');
            }
            else {
                console.log(`[M+] No user gift history found with ${userID}.`);
            }
        });
    }
    /**
     * #### Fill out history box
     * @param historyBox the box to put it in
     */
    _historyWithAll(historyBox) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the gift history
            const giftHistory = yield Util.getAllUserGiftHistory();
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
                historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
                // Add the message to the box
                historyBox.appendChild(this._showGifts(giftHistory));
                console.log('[M+] User gift history added!');
            }
            else {
                console.log(`[M+] No user gift history found for current user.`);
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
        const gifts = history
            .filter((gift) => gift.type === 'giftPoints' || gift.type === 'giftWedge')
            .map((gift) => {
            // Add some styling depending on pos/neg numbers
            let fancyGiftAmount = '';
            let fromTo = '';
            if (gift.amount > 0) {
                fancyGiftAmount = `${this._getSymbol} ${_wedgeOrPoints(gift)}`;
                fromTo = 'from';
            }
            else {
                fancyGiftAmount = `${this._sendSymbol} ${_wedgeOrPoints(gift)}`;
                fromTo = 'to';
            }
            // Make the date readable
            const date = Util.prettySiteTime(gift.timestamp, true);
            return `<li class='mp_giftItem'>${date} you ${fancyGiftAmount} ${fromTo} <a href='/u/${gift.other_userid}'>${gift.other_name}</a></li>`;
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
class PotHistory {
    constructor() {
        this._settings = {
            scope: SettingGroup.Vault,
            type: 'checkbox',
            title: 'potHistory',
            desc: 'Add the list of recent donations to the donation page.',
        };
        this._tar = '#mainBody';
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    _init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const subPage = GM_getValue('mp_currentPage');
            const form = (document.querySelector(this._tar + ' form[method="post"]'));
            if (!form) {
                return;
            }
            const potPageResp = yield fetch('/millionaires/pot.php');
            if (!potPageResp.ok) {
                console.group(`failed to get /millionaires/pot.php: ${potPageResp.status}/${potPageResp.statusText}`);
                return;
            }
            console.group(`Applying Vault (${subPage}) settings...`);
            const potPageText = yield potPageResp.text();
            const parser = new DOMParser();
            const potPage = parser.parseFromString(potPageText, 'text/html');
            // Clone the important parts and reset the page
            const donateTbl = potPage.querySelector('#mainTable table:last-of-type');
            // Add the donate table if it exists
            if (donateTbl !== null && form !== null) {
                const newTable = (donateTbl.cloneNode(true));
                (_a = form.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(newTable);
                newTable.classList.add('mp_vaultClone');
            }
            console.log('[M+] Added the donation history to the donation page!');
        });
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
        new HideDonationBox();
        new BlurredHeader();
        new VaultLink();
        new MiniVaultInfo();
        new BonusPointDelta();
        new FixedNav();
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
        new StoryGraphButton();
        new AudibleButton();
        new CurrentlyReading();
        new TorGiftDefault();
        new RatioProtect();
        new RatioProtectIcons();
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
        new PotHistory();
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
            let outp = `<tbody><tr><td class="row1" colspan="2"><br><strong>MAM+ v${MP.VERSION}</strong> - Here you can enable &amp; disable any feature from the <a href="/f/t/41863">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br>For a detailed look at the available features, <a href="${Util.derefer('https://github.com/gardenshade/mam-plus/wiki/Feature-Overview')}">check the Wiki!</a><br><br></td></tr>`;
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
/// <reference path="./modules/browse.ts" />
/// <reference path="./modules/forum.ts" />
/// <reference path="./modules/home.ts" />
/// <reference path="./modules/request.ts" />
/// <reference path="./modules/shout.ts" />
/// <reference path="./modules/tor.ts" />
/// <reference path="./modules/upload.ts" />
/// <reference path="./modules/user.ts" />
/// <reference path="./modules/vault.ts" />
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
        UPDATE_LIST: [],
        BUG_LIST: [],
    };
    MP.TIMESTAMP = 'Apr 13';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL3NoYXJlZC50cyIsInNyYy9tb2R1bGVzL2Jyb3dzZS50cyIsInNyYy9tb2R1bGVzL2ZvcnVtLnRzIiwic3JjL21vZHVsZXMvaG9tZS50cyIsInNyYy9tb2R1bGVzL3JlcXVlc3QudHMiLCJzcmMvbW9kdWxlcy9zaG91dC50cyIsInNyYy9tb2R1bGVzL3Rvci50cyIsInNyYy9tb2R1bGVzL3VwbG9hZC50cyIsInNyYy9tb2R1bGVzL3VzZXIudHMiLCJzcmMvbW9kdWxlcy92YXVsdC50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFrQkgsSUFBSyxZQVlKO0FBWkQsV0FBSyxZQUFZO0lBQ2IsbURBQVEsQ0FBQTtJQUNSLCtDQUFNLENBQUE7SUFDTixtREFBUSxDQUFBO0lBQ1IsdURBQVUsQ0FBQTtJQUNWLCtEQUFjLENBQUE7SUFDZCx1REFBVSxDQUFBO0lBQ1YsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWiw2REFBYSxDQUFBO0lBQ2IsaURBQU8sQ0FBQTtJQUNQLGtEQUFPLENBQUE7QUFDWCxDQUFDLEVBWkksWUFBWSxLQUFaLFlBQVksUUFZaEI7QUNoQ0Q7Ozs7R0FJRzs7QUFFSCxNQUFNLElBQUk7SUFDTjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENB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RTtZQUNuQyxNQUFNLEtBQUssR0FBVyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM3QyxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxlQUFlLENBQUMsRUFBRTtnQkFDaEUsK0JBQStCO2dCQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFBLFlBQVksQ0FBQyxDQUFDO2FBQ3ZDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSDs7O1dBR0c7UUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLCtCQUErQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUN0RCx1QkFBdUI7WUFDdkIsR0FBQSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDcEIsNkJBQTZCO1lBQzdCLEdBQUEsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkIsQ0FBQyxDQUFBLENBQUM7QUFDTixDQUFDLEVBOURTLEVBQUUsS0FBRixFQUFFLFFBOERYO0FBRUQseUJBQXlCO0FBQ3pCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyIsImZpbGUiOiJtYW0tcGx1c19kZXYudXNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBUeXBlcywgSW50ZXJmYWNlcywgZXRjLlxyXG4gKi9cclxuXHJcbnR5cGUgVmFsaWRQYWdlID1cclxuICAgIHwgJ2hvbWUnXHJcbiAgICB8ICdicm93c2UnXHJcbiAgICB8ICdyZXF1ZXN0J1xyXG4gICAgfCAncmVxdWVzdCBkZXRhaWxzJ1xyXG4gICAgfCAndG9ycmVudCdcclxuICAgIHwgJ3Nob3V0Ym94J1xyXG4gICAgfCAndmF1bHQnXHJcbiAgICB8ICd1c2VyJ1xyXG4gICAgfCAndXBsb2FkJ1xyXG4gICAgfCAnZm9ydW0gdGhyZWFkJ1xyXG4gICAgfCAnc2V0dGluZ3MnXHJcbiAgICB8ICduZXcgdXNlcnMnO1xyXG5cclxudHlwZSBCb29rRGF0YSA9ICdib29rJyB8ICdhdXRob3InIHwgJ3Nlcmllcyc7XHJcblxyXG5lbnVtIFNldHRpbmdHcm91cCB7XHJcbiAgICAnR2xvYmFsJyxcclxuICAgICdIb21lJyxcclxuICAgICdTZWFyY2gnLFxyXG4gICAgJ1JlcXVlc3RzJyxcclxuICAgICdUb3JyZW50IFBhZ2UnLFxyXG4gICAgJ1Nob3V0Ym94JyxcclxuICAgICdWYXVsdCcsXHJcbiAgICAnVXNlciBQYWdlcycsXHJcbiAgICAnVXBsb2FkIFBhZ2UnLFxyXG4gICAgJ0ZvcnVtJyxcclxuICAgICdPdGhlcicsXHJcbn1cclxuXHJcbnR5cGUgU2hvdXRib3hVc2VyVHlwZSA9ICdwcmlvcml0eScgfCAnbXV0ZSc7XHJcblxyXG50eXBlIFN0b3JlU291cmNlID1cclxuICAgIHwgMVxyXG4gICAgfCAnMi41J1xyXG4gICAgfCAnNCdcclxuICAgIHwgJzUnXHJcbiAgICB8ICc4J1xyXG4gICAgfCAnMjAnXHJcbiAgICB8ICcxMDAnXHJcbiAgICB8ICdwb2ludHMnXHJcbiAgICB8ICdjaGVlc2UnXHJcbiAgICB8ICdtYXgnXHJcbiAgICB8ICdNYXggQWZmb3JkYWJsZSdcclxuICAgIHwgJ3NlZWR0aW1lJ1xyXG4gICAgfCAnU2VsbCdcclxuICAgIHwgJ3JhdGlvJ1xyXG4gICAgfCAnRm9ydW0nO1xyXG5cclxuaW50ZXJmYWNlIFVzZXJHaWZ0SGlzdG9yeSB7XHJcbiAgICBhbW91bnQ6IG51bWJlcjtcclxuICAgIG90aGVyX25hbWU6IHN0cmluZztcclxuICAgIG90aGVyX3VzZXJpZDogbnVtYmVyO1xyXG4gICAgdGlkOiBudW1iZXIgfCBudWxsO1xyXG4gICAgdGltZXN0YW1wOiBudW1iZXI7XHJcbiAgICB0aXRsZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIHR5cGU6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFycmF5T2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU3RyaW5nT2JqZWN0IHtcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEJvb2tEYXRhT2JqZWN0IGV4dGVuZHMgU3RyaW5nT2JqZWN0IHtcclxuICAgIFsnZXh0cmFjdGVkJ106IHN0cmluZztcclxuICAgIFsnZGVzYyddOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEaXZSb3dPYmplY3Qge1xyXG4gICAgWyd0aXRsZSddOiBzdHJpbmc7XHJcbiAgICBbJ2RhdGEnXTogSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTZXR0aW5nR2xvYk9iamVjdCB7XHJcbiAgICBba2V5OiBudW1iZXJdOiBGZWF0dXJlU2V0dGluZ3NbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICBzY29wZTogU2V0dGluZ0dyb3VwO1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHR5cGU6ICdjaGVja2JveCcgfCAnZHJvcGRvd24nIHwgJ3RleHRib3gnO1xyXG4gICAgZGVzYzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQW55RmVhdHVyZSBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0YWc/OiBzdHJpbmc7XHJcbiAgICBvcHRpb25zPzogU3RyaW5nT2JqZWN0O1xyXG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBGZWF0dXJlIHtcclxuICAgIHNldHRpbmdzOiBDaGVja2JveFNldHRpbmcgfCBEcm9wZG93blNldHRpbmcgfCBUZXh0Ym94U2V0dGluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIENoZWNrYm94U2V0dGluZyBleHRlbmRzIEZlYXR1cmVTZXR0aW5ncyB7XHJcbiAgICB0eXBlOiAnY2hlY2tib3gnO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRHJvcGRvd25TZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICdkcm9wZG93bic7XHJcbiAgICB0YWc6IHN0cmluZztcclxuICAgIG9wdGlvbnM6IFN0cmluZ09iamVjdDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFRleHRib3hTZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICd0ZXh0Ym94JztcclxuICAgIHRhZzogc3RyaW5nO1xyXG4gICAgcGxhY2Vob2xkZXI6IHN0cmluZztcclxufVxyXG5cclxuLy8gbmF2aWdhdG9yLmNsaXBib2FyZC5kLnRzXHJcblxyXG4vLyBUeXBlIGRlY2xhcmF0aW9ucyBmb3IgQ2xpcGJvYXJkIEFQSVxyXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2xpcGJvYXJkX0FQSVxyXG5pbnRlcmZhY2UgQ2xpcGJvYXJkIHtcclxuICAgIHdyaXRlVGV4dChuZXdDbGlwVGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxuICAgIC8vIEFkZCBhbnkgb3RoZXIgbWV0aG9kcyB5b3UgbmVlZCBoZXJlLlxyXG59XHJcblxyXG5pbnRlcmZhY2UgTmF2aWdhdG9yQ2xpcGJvYXJkIHtcclxuICAgIC8vIE9ubHkgYXZhaWxhYmxlIGluIGEgc2VjdXJlIGNvbnRleHQuXHJcbiAgICByZWFkb25seSBjbGlwYm9hcmQ/OiBDbGlwYm9hcmQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBOYXZpZ2F0b3JFeHRlbmRlZCBleHRlbmRzIE5hdmlnYXRvckNsaXBib2FyZCB7fVxyXG4iLCIvKipcclxuICogQ2xhc3MgY29udGFpbmluZyBjb21tb24gdXRpbGl0eSBtZXRob2RzXHJcbiAqXHJcbiAqIElmIHRoZSBtZXRob2Qgc2hvdWxkIGhhdmUgdXNlci1jaGFuZ2VhYmxlIHNldHRpbmdzLCBjb25zaWRlciB1c2luZyBgQ29yZS50c2AgaW5zdGVhZFxyXG4gKi9cclxuXHJcbmNsYXNzIFV0aWwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbmltYXRpb24gZnJhbWUgdGltZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZlRpbWVyKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWxsb3dzIHNldHRpbmcgbXVsdGlwbGUgYXR0cmlidXRlcyBhdCBvbmNlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2V0QXR0cihlbDogRWxlbWVudCwgYXR0cjogU3RyaW5nT2JqZWN0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgXCJsZW5ndGhcIiBvZiBhbiBPYmplY3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBvYmplY3RMZW5ndGgob2JqOiBPYmplY3QpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcmNlZnVsbHkgZW1wdGllcyBhbnkgR00gc3RvcmVkIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHB1cmdlU2V0dGluZ3MoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBHTV9saXN0VmFsdWVzKCkpIHtcclxuICAgICAgICAgICAgR01fZGVsZXRlVmFsdWUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZyBhIG1lc3NhZ2UgYWJvdXQgYSBjb3VudGVkIHJlc3VsdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcG9ydENvdW50KGRpZDogc3RyaW5nLCBudW06IG51bWJlciwgdGhpbmc6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNpbmd1bGFyID0gMTtcclxuICAgICAgICBpZiAobnVtICE9PSBzaW5ndWxhcikge1xyXG4gICAgICAgICAgICB0aGluZyArPSAncyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPiAke2RpZH0gJHtudW19ICR7dGhpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgYSBmZWF0dXJlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgc3RhcnRGZWF0dXJlKFxyXG4gICAgICAgIHNldHRpbmdzOiBGZWF0dXJlU2V0dGluZ3MsXHJcbiAgICAgICAgZWxlbTogc3RyaW5nLFxyXG4gICAgICAgIHBhZ2U/OiBWYWxpZFBhZ2VbXVxyXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgLy8gUXVldWUgdGhlIHNldHRpbmdzIGluIGNhc2UgdGhleSdyZSBuZWVkZWRcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaChzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIHJldHVybiB0cnVlIHdoZW4gdGhlIGVsZW1lbnQgaXMgbG9hZGVkXHJcbiAgICAgICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aW1lcjogUHJvbWlzZTxmYWxzZT4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMjAwMCwgZmFsc2UpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrRWxlbSA9IENoZWNrLmVsZW1Mb2FkKGVsZW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lciwgY2hlY2tFbGVtXSkudGhlbigodmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYHN0YXJ0RmVhdHVyZSgke3NldHRpbmdzLnRpdGxlfSkgVW5hYmxlIHRvIGluaXRpYXRlISBDb3VsZCBub3QgZmluZCBlbGVtZW50OiAke2VsZW19YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElzIHRoZSBzZXR0aW5nIGVuYWJsZWQ/XHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKHNldHRpbmdzLnRpdGxlKSkge1xyXG4gICAgICAgICAgICAvLyBBIHNwZWNpZmljIHBhZ2UgaXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCByZXF1aXJlZCBwYWdlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYm9vbGVhbltdID0gW107XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLmZvckVhY2goKHApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBDaGVjay5wYWdlKHApLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKDxib29sZWFuPnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBhbnkgcmVxdWVzdGVkIHBhZ2UgbWF0Y2hlcyB0aGUgY3VycmVudCBwYWdlLCBydW4gdGhlIGZlYXR1cmVcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmluY2x1ZGVzKHRydWUpID09PSB0cnVlKSByZXR1cm4gcnVuKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHRvIGVsZW1lbnQgY2hlY2tpbmdcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBydW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZXR0aW5nIGlzIG5vdCBlbmFibGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyaW1zIGEgc3RyaW5nIGxvbmdlciB0aGFuIGEgc3BlY2lmaWVkIGNoYXIgbGltaXQsIHRvIGEgZnVsbCB3b3JkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdHJpbVN0cmluZyhpbnA6IHN0cmluZywgbWF4OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChpbnAubGVuZ3RoID4gbWF4KSB7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgbWF4ICsgMSk7XHJcbiAgICAgICAgICAgIGlucCA9IGlucC5zdWJzdHJpbmcoMCwgTWF0aC5taW4oaW5wLmxlbmd0aCwgaW5wLmxhc3RJbmRleE9mKCcgJykpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlucDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYnJhY2tldHMgJiBhbGwgY29udGFpbmVkIHdvcmRzIGZyb20gYSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBicmFja2V0UmVtb3ZlcihpbnA6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGlucFxyXG4gICAgICAgICAgICAucmVwbGFjZSgveysuKj99Ky9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcW1xcW3xcXF1cXF0vZywgJycpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC88Lio/Pi9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC4qP1xcKS9nLCAnJylcclxuICAgICAgICAgICAgLnRyaW0oKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICpSZXR1cm4gdGhlIGNvbnRlbnRzIGJldHdlZW4gYnJhY2tldHNcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRDb250ZW50cyA9IChpbnA6IHN0cmluZykgPT4ge1xyXG4gICAgICAgIHJldHVybiBpbnAubWF0Y2goL1xcKChbXildKylcXCkvKSFbMV07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBzdHJpbmcgdG8gYW4gYXJyYXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmdUb0FycmF5KGlucDogc3RyaW5nLCBzcGxpdFBvaW50PzogJ3dzJyk6IHN0cmluZ1tdIHtcclxuICAgICAgICByZXR1cm4gc3BsaXRQb2ludCAhPT0gdW5kZWZpbmVkICYmIHNwbGl0UG9pbnQgIT09ICd3cydcclxuICAgICAgICAgICAgPyBpbnAuc3BsaXQoc3BsaXRQb2ludClcclxuICAgICAgICAgICAgOiBpbnAubWF0Y2goL1xcUysvZykgfHwgW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIGNvbW1hIChvciBvdGhlcikgc2VwYXJhdGVkIHZhbHVlIGludG8gYW4gYXJyYXlcclxuICAgICAqIEBwYXJhbSBpbnAgU3RyaW5nIHRvIGJlIGRpdmlkZWRcclxuICAgICAqIEBwYXJhbSBkaXZpZGVyIFRoZSBkaXZpZGVyIChkZWZhdWx0OiAnLCcpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3N2VG9BcnJheShpbnA6IHN0cmluZywgZGl2aWRlcjogc3RyaW5nID0gJywnKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBpbnAuc3BsaXQoZGl2aWRlcikuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBhcnIucHVzaChpdGVtLnRyaW0oKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgYW4gYXJyYXkgdG8gYSBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBpbnAgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZW5kIGN1dC1vZmYgcG9pbnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhcnJheVRvU3RyaW5nKGlucDogc3RyaW5nW10sIGVuZD86IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIGlucC5mb3JFYWNoKChrZXksIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgaWYgKGVuZCAmJiB2YWwgKyAxICE9PSBpbnAubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBET00gbm9kZSByZWZlcmVuY2UgaW50byBhbiBIVE1MIEVsZW1lbnQgcmVmZXJlbmNlXHJcbiAgICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSB0byBjb252ZXJ0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbm9kZVRvRWxlbShub2RlOiBOb2RlKTogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGlmIChub2RlLmZpcnN0Q2hpbGQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm9kZS10by1lbGVtIHdpdGhvdXQgY2hpbGRub2RlIGlzIHVudGVzdGVkJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRlbXBOb2RlOiBOb2RlID0gbm9kZTtcclxuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0ZW1wTm9kZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5ub2RlLmZpcnN0Q2hpbGQhLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKHRlbXBOb2RlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hdGNoIHN0cmluZ3Mgd2hpbGUgaWdub3JpbmcgY2FzZSBzZW5zaXRpdml0eVxyXG4gICAgICogQHBhcmFtIGEgRmlyc3Qgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gYiBTZWNvbmQgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2FzZWxlc3NTdHJpbmdNYXRjaChhOiBzdHJpbmcsIGI6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGNvbXBhcmU6IG51bWJlciA9IGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7XHJcbiAgICAgICAgICAgIHNlbnNpdGl2aXR5OiAnYmFzZScsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUgPT09IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBuZXcgVG9yRGV0Um93IGFuZCByZXR1cm4gdGhlIGlubmVyIGRpdlxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgcm93IHRvIGJlIHRhcmdldHRlZFxyXG4gICAgICogQHBhcmFtIGxhYmVsIFRoZSBuYW1lIHRvIGJlIGRpc3BsYXllZCBmb3IgdGhlIG5ldyByb3dcclxuICAgICAqIEBwYXJhbSByb3dDbGFzcyBUaGUgcm93J3MgY2xhc3NuYW1lIChzaG91bGQgc3RhcnQgd2l0aCBtcF8pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICB0YXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBsYWJlbDogc3RyaW5nLFxyXG4gICAgICAgIHJvd0NsYXNzOiBzdHJpbmdcclxuICAgICk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHRhcik7XHJcblxyXG4gICAgICAgIGlmICh0YXIgPT09IG51bGwgfHwgdGFyLnBhcmVudEVsZW1lbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBZGQgVG9yIERldGFpbHMgUm93OiBlbXB0eSBub2RlIG9yIHBhcmVudCBub2RlIEAgJHt0YXJ9YCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGFyLnBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidG9yRGV0Um93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj4ke2xhYmVsfTwvZGl2PjxkaXYgY2xhc3M9XCJ0b3JEZXRSaWdodCAke3Jvd0NsYXNzfVwiPjxzcGFuIGNsYXNzPVwiZmxleFwiPjwvc3Bhbj48L2Rpdj48L2Rpdj5gXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3Jvd0NsYXNzfSAuZmxleGApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBNZXJnZSB3aXRoIGBVdGlsLmNyZWF0ZUJ1dHRvbmBcclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyBhIGxpbmsgYnV0dG9uIHRoYXQgaXMgc3R5bGVkIGxpa2UgYSBzaXRlIGJ1dHRvbiAoZXguIGluIHRvciBkZXRhaWxzKVxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgZWxlbWVudCB0aGUgYnV0dG9uIHNob3VsZCBiZSBhZGRlZCB0b1xyXG4gICAgICogQHBhcmFtIHVybCBUaGUgVVJMIHRoZSBidXR0b24gd2lsbCBzZW5kIHlvdSB0b1xyXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgb24gdGhlIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIG9yZGVyIE9wdGlvbmFsOiBmbGV4IGZsb3cgb3JkZXJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVMaW5rQnV0dG9uKFxyXG4gICAgICAgIHRhcjogSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcgPSAnbm9uZScsXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIG9yZGVyOiBudW1iZXIgPSAwXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvbjogSFRNTEFuY2hvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgLy8gU2V0IHVwIHRoZSBidXR0b25cclxuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnbXBfYnV0dG9uX2Nsb25lJyk7XHJcbiAgICAgICAgaWYgKHVybCAhPT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgICAgICBidXR0b24uc2V0QXR0cmlidXRlKCd0YXJnZXQnLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJ1dHRvbi5pbm5lclRleHQgPSB0ZXh0O1xyXG4gICAgICAgIGJ1dHRvbi5zdHlsZS5vcmRlciA9IGAke29yZGVyfWA7XHJcbiAgICAgICAgLy8gSW5qZWN0IHRoZSBidXR0b25cclxuICAgICAgICB0YXIuaW5zZXJ0QmVmb3JlKGJ1dHRvbiwgdGFyLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyBhIG5vbi1saW5rZWQgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gaWQgVGhlIElEIG9mIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IGRpc3BsYXllZCBpbiB0aGUgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gdHlwZSBUaGUgSFRNTCBlbGVtZW50IHRvIGNyZWF0ZS4gRGVmYXVsdDogYGgxYFxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgSFRNTCBlbGVtZW50IHRoZSBidXR0b24gd2lsbCBiZSBgcmVsYXRpdmVgIHRvXHJcbiAgICAgKiBAcGFyYW0gcmVsYXRpdmUgVGhlIHBvc2l0aW9uIG9mIHRoZSBidXR0b24gcmVsYXRpdmUgdG8gdGhlIGB0YXJgLiBEZWZhdWx0OiBgYWZ0ZXJlbmRgXHJcbiAgICAgKiBAcGFyYW0gYnRuQ2xhc3MgVGhlIGNsYXNzbmFtZSBvZiB0aGUgZWxlbWVudC4gRGVmYXVsdDogYG1wX2J0bmBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGVCdXR0b24oXHJcbiAgICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgICB0ZXh0OiBzdHJpbmcsXHJcbiAgICAgICAgdHlwZTogc3RyaW5nID0gJ2gxJyxcclxuICAgICAgICB0YXI6IHN0cmluZyB8IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHJlbGF0aXZlOiAnYmVmb3JlYmVnaW4nIHwgJ2FmdGVyZW5kJyA9ICdhZnRlcmVuZCcsXHJcbiAgICAgICAgYnRuQ2xhc3M6IHN0cmluZyA9ICdtcF9idG4nXHJcbiAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gQ2hvb3NlIHRoZSBuZXcgYnV0dG9uIGluc2VydCBsb2NhdGlvbiBhbmQgaW5zZXJ0IGVsZW1lbnRzXHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHRhcmdldDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPVxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIHRhciA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcikgOiB0YXI7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGAke3Rhcn0gaXMgbnVsbCFgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5pbnNlcnRBZGphY2VudEVsZW1lbnQocmVsYXRpdmUsIGJ0bik7XHJcbiAgICAgICAgICAgICAgICBVdGlsLnNldEF0dHIoYnRuLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBtcF8ke2lkfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGJ0bkNsYXNzLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdidXR0b24nLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCBidXR0b24gdGV4dFxyXG4gICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJ0bik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGFuIGVsZW1lbnQgaW50byBhIGJ1dHRvbiB0aGF0LCB3aGVuIGNsaWNrZWQsIGNvcGllcyB0ZXh0IHRvIGNsaXBib2FyZFxyXG4gICAgICogQHBhcmFtIGJ0biBBbiBIVE1MIEVsZW1lbnQgYmVpbmcgdXNlZCBhcyBhIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHBheWxvYWQgVGhlIHRleHQgdGhhdCB3aWxsIGJlIGNvcGllZCB0byBjbGlwYm9hcmQgb24gYnV0dG9uIGNsaWNrLCBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCB1c2UgdGhlIGNsaXBib2FyZCdzIGN1cnJlbnQgdGV4dFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNsaXBib2FyZGlmeUJ0bihcclxuICAgICAgICBidG46IEhUTUxFbGVtZW50LFxyXG4gICAgICAgIHBheWxvYWQ6IGFueSxcclxuICAgICAgICBjb3B5OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgYnRuLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEhhdmUgdG8gb3ZlcnJpZGUgdGhlIE5hdmlnYXRvciB0eXBlIHRvIHByZXZlbnQgVFMgZXJyb3JzXHJcbiAgICAgICAgICAgIGNvbnN0IG5hdjogTmF2aWdhdG9yRXh0ZW5kZWQgfCB1bmRlZmluZWQgPSA8TmF2aWdhdG9yRXh0ZW5kZWQ+bmF2aWdhdG9yO1xyXG4gICAgICAgICAgICBpZiAobmF2ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gY29weSB0ZXh0LCBsaWtlbHkgZHVlIHRvIG1pc3NpbmcgYnJvd3NlciBzdXBwb3J0LicpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgJ25hdmlnYXRvcic/XCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLyogTmF2aWdhdG9yIEV4aXN0cyAqL1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb3B5ICYmIHR5cGVvZiBwYXlsb2FkID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvcHkgcmVzdWx0cyB0byBjbGlwYm9hcmRcclxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS53cml0ZVRleHQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIHRvIHlvdXIgY2xpcGJvYXJkIScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBSdW4gcGF5bG9hZCBmdW5jdGlvbiB3aXRoIGNsaXBib2FyZCB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgbmF2LmNsaXBib2FyZCEucmVhZFRleHQoKS50aGVuKCh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQodGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQ29waWVkIGZyb20geW91ciBjbGlwYm9hcmQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBidG4uc3R5bGUuY29sb3IgPSAnZ3JlZW4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIEhUVFBSZXF1ZXN0IGZvciBHRVQgSlNPTiwgcmV0dXJucyB0aGUgZnVsbCB0ZXh0IG9mIEhUVFAgR0VUXHJcbiAgICAgKiBAcGFyYW0gdXJsIC0gYSBzdHJpbmcgb2YgdGhlIFVSTCB0byBzdWJtaXQgZm9yIEdFVCByZXF1ZXN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SlNPTih1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZ2V0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAvL1VSTCB0byBHRVQgcmVzdWx0cyB3aXRoIHRoZSBhbW91bnQgZW50ZXJlZCBieSB1c2VyIHBsdXMgdGhlIHVzZXJuYW1lIGZvdW5kIG9uIHRoZSBtZW51IHNlbGVjdGVkXHJcbiAgICAgICAgICAgIGdldEhUVFAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgZ2V0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICBnZXRIVFRQLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnZXRIVFRQLnJlYWR5U3RhdGUgPT09IDQgJiYgZ2V0SFRUUC5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZ2V0SFRUUC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBnZXRIVFRQLnNlbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gdHdvIHBhcmFtZXRlcnNcclxuICAgICAqIEBwYXJhbSBtaW4gYSBudW1iZXIgb2YgdGhlIGJvdHRvbSBvZiByYW5kb20gbnVtYmVyIHBvb2xcclxuICAgICAqIEBwYXJhbSBtYXggYSBudW1iZXIgb2YgdGhlIHRvcCBvZiB0aGUgcmFuZG9tIG51bWJlciBwb29sXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmFuZG9tTnVtYmVyID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2xlZXAgdXRpbCB0byBiZSB1c2VkIGluIGFzeW5jIGZ1bmN0aW9ucyB0byBkZWxheSBwcm9ncmFtXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2xlZXAgPSAobTogYW55KTogUHJvbWlzZTx2b2lkPiA9PiBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCBtKSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGxhc3Qgc2VjdGlvbiBvZiBhbiBIUkVGXHJcbiAgICAgKiBAcGFyYW0gZWxlbSBBbiBhbmNob3IgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHNwbGl0IE9wdGlvbmFsIGRpdmlkZXIuIERlZmF1bHRzIHRvIGAvYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGVuZE9mSHJlZiA9IChlbGVtOiBIVE1MQW5jaG9yRWxlbWVudCwgc3BsaXQgPSAnLycpID0+XHJcbiAgICAgICAgZWxlbS5ocmVmLnNwbGl0KHNwbGl0KS5wb3AoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgaGV4IHZhbHVlIG9mIGEgY29tcG9uZW50IGFzIGEgc3RyaW5nLlxyXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKiBAbWVtYmVyb2YgVXRpbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbXBvbmVudFRvSGV4ID0gKGM6IG51bWJlciB8IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgY29uc3QgaGV4ID0gYy50b1N0cmluZygxNik7XHJcbiAgICAgICAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyBgMCR7aGV4fWAgOiBoZXg7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBoZXggY29sb3IgY29kZSBmcm9tIFJHQi5cclxuICAgICAqIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOFxyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmdiVG9IZXggPSAocjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGAjJHtVdGlsLmNvbXBvbmVudFRvSGV4KHIpfSR7VXRpbC5jb21wb25lbnRUb0hleChnKX0ke1V0aWwuY29tcG9uZW50VG9IZXgoXHJcbiAgICAgICAgICAgIGJcclxuICAgICAgICApfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXh0cmFjdCBudW1iZXJzICh3aXRoIGZsb2F0KSBmcm9tIHRleHQgYW5kIHJldHVybiB0aGVtXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFuIEhUTUwgZWxlbWVudCB0aGF0IGNvbnRhaW5zIG51bWJlcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0RmxvYXQgPSAodGFyOiBIVE1MRWxlbWVudCk6IG51bWJlcltdID0+IHtcclxuICAgICAgICBpZiAodGFyLnRleHRDb250ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGFyLnRleHRDb250ZW50IS5yZXBsYWNlKC8sL2csICcnKS5tYXRjaCgvXFxkK1xcLlxcZCsvKSB8fCBbXSkubWFwKChuKSA9PlxyXG4gICAgICAgICAgICAgICAgcGFyc2VGbG9hdChuKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGFyZ2V0IGNvbnRhaW5zIG5vIHRleHQnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBHZXQgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdGhlIGxvZ2dlZCBpbiB1c2VyIGFuZCBhIGdpdmVuIElEXHJcbiAgICAgKiBAcGFyYW0gdXNlcklEIEEgdXNlciBJRDsgY2FuIGJlIGEgc3RyaW5nIG9yIG51bWJlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGdldFVzZXJHaWZ0SGlzdG9yeShcclxuICAgICAgICB1c2VySUQ6IG51bWJlciB8IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxVc2VyR2lmdEhpc3RvcnlbXT4ge1xyXG4gICAgICAgIGNvbnN0IHJhd0dpZnRIaXN0b3J5OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04oXHJcbiAgICAgICAgICAgIGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vdXNlckJvbnVzSGlzdG9yeS5waHA/b3RoZXJfdXNlcmlkPSR7dXNlcklEfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5OiBBcnJheTxVc2VyR2lmdEhpc3Rvcnk+ID0gSlNPTi5wYXJzZShyYXdHaWZ0SGlzdG9yeSk7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBmdWxsIGRhdGFcclxuICAgICAgICByZXR1cm4gZ2lmdEhpc3Rvcnk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIEdldCB0aGUgdXNlciBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0aGUgbG9nZ2VkIGluIHVzZXIgYW5kIGV2ZXJ5b25lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0QWxsVXNlckdpZnRIaXN0b3J5KCk6IFByb21pc2U8VXNlckdpZnRIaXN0b3J5W10+IHtcclxuICAgICAgICBjb25zdCByYXdHaWZ0SGlzdG9yeTogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKFxyXG4gICAgICAgICAgICBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC9qc29uL3VzZXJCb251c0hpc3RvcnkucGhwYFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ2lmdEhpc3Rvcnk6IEFycmF5PFVzZXJHaWZ0SGlzdG9yeT4gPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxyXG4gICAgICAgIHJldHVybiBnaWZ0SGlzdG9yeTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgR2V0cyB0aGUgbG9nZ2VkIGluIHVzZXIncyB1c2VyaWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRDdXJyZW50VXNlcklEKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgbXlJbmZvID0gPEhUTUxBbmNob3JFbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1tVXNlclN0YXRzIC5hdmF0YXIgYScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAobXlJbmZvKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJRCA9IDxzdHJpbmc+dGhpcy5lbmRPZkhyZWYobXlJbmZvKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gTG9nZ2VkIGluIHVzZXJJRCBpcyAke3VzZXJJRH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHVzZXJJRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ05vIGxvZ2dlZCBpbiB1c2VyIGZvdW5kLicpO1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXR0eVNpdGVUaW1lKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgZGF0ZT86IGJvb2xlYW4sIHRpbWU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUodW5peFRpbWVzdGFtcCAqIDEwMDApLnRvSVNPU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKGRhdGUgJiYgIXRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWRhdGUgJiYgdGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENoZWNrIGEgc3RyaW5nIHRvIHNlZSBpZiBpdCdzIGRpdmlkZWQgd2l0aCBhIGRhc2gsIHJldHVybmluZyB0aGUgZmlyc3QgaGFsZiBpZiBpdCBkb2Vzbid0IGNvbnRhaW4gYSBzcGVjaWZpZWQgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gb3JpZ2luYWwgVGhlIG9yaWdpbmFsIHN0cmluZyBiZWluZyBjaGVja2VkXHJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVkIEEgc3RyaW5nIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkIGluIHRoZSBvcmlnaW5hbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNoZWNrRGFzaGVzKG9yaWdpbmFsOiBzdHJpbmcsIGNvbnRhaW5lZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICBgY2hlY2tEYXNoZXMoICR7b3JpZ2luYWx9LCAke2NvbnRhaW5lZH0gKTogQ291bnQgJHtvcmlnaW5hbC5pbmRleE9mKFxyXG4gICAgICAgICAgICAgICAgICAgICcgLSAnXHJcbiAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERhc2hlcyBhcmUgcHJlc2VudFxyXG4gICAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcgLSAnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RyaW5nIGNvbnRhaW5zIGEgZGFzaGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IG9yaWdpbmFsLnNwbGl0KCcgLSAnKTtcclxuICAgICAgICAgICAgaWYgKHNwbGl0WzBdID09PSBjb250YWluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgPiBTdHJpbmcgYmVmb3JlIGRhc2ggaXMgXCIke2NvbnRhaW5lZH1cIjsgdXNpbmcgc3RyaW5nIGJlaGluZCBkYXNoYFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMgVXRpbGl0aWVzIHNwZWNpZmljIHRvIEdvb2RyZWFkc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdvb2RyZWFkcyA9IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFJlbW92ZXMgc3BhY2VzIGluIGF1dGhvciBuYW1lcyB0aGF0IHVzZSBhZGphY2VudCBpbnRpdGlhbHMuXHJcbiAgICAgICAgICogQHBhcmFtIGF1dGggVGhlIGF1dGhvcihzKVxyXG4gICAgICAgICAqIEBleGFtcGxlIFwiSCBHIFdlbGxzXCIgLT4gXCJIRyBXZWxsc1wiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc21hcnRBdXRoOiAoYXV0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gVXRpbC5zdHJpbmdUb0FycmF5KGF1dGgpO1xyXG4gICAgICAgICAgICBhcnIuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQga2V5IGlzIGFuIGluaXRpYWxcclxuICAgICAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5leHQga2V5IGlzIGFuIGluaXRpYWwsIGRvbid0IGFkZCBhIHNwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dExlbmc6IG51bWJlciA9IGFyclt2YWwgKyAxXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW5nIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBzcGFjZVxyXG4gICAgICAgICAgICByZXR1cm4gb3V0cC50cmltKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFR1cm5zIGEgc3RyaW5nIGludG8gYSBHb29kcmVhZHMgc2VhcmNoIFVSTFxyXG4gICAgICAgICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIFVSTCB0byBtYWtlXHJcbiAgICAgICAgICogQHBhcmFtIGlucCBUaGUgZXh0cmFjdGVkIGRhdGEgdG8gVVJJIGVuY29kZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGJ1aWxkU2VhcmNoVVJMOiAodHlwZTogQm9va0RhdGEgfCAnb24nLCBpbnA6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGdvb2RyZWFkcy5idWlsZEdyU2VhcmNoVVJMKCAke3R5cGV9LCAke2lucH0gKWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZ3JUeXBlOiBzdHJpbmcgPSB0eXBlO1xyXG4gICAgICAgICAgICBjb25zdCBjYXNlczogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgYm9vazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ29uJztcclxuICAgICAgICAgICAgICAgICAgICBpbnAgKz0gJywgIyc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoY2FzZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2VzW3R5cGVdKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphL2h0dHBzOi8vd3d3Lmdvb2RyZWFkcy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICBpbnAucmVwbGFjZSgnJScsICcnKVxyXG4gICAgICAgICAgICApLnJlcGxhY2UoXCInXCIsICclMjcnKX0mc2VhcmNoX3R5cGU9Ym9va3Mmc2VhcmNoJTVCZmllbGQlNUQ9JHtnclR5cGV9YDtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgY2xlYW5lZCBib29rIHRpdGxlIGZyb20gYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGl0bGUgdGV4dFxyXG4gICAgICogQHBhcmFtIGF1dGggQSBzdHJpbmcgb2YgYXV0aG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tUaXRsZSA9IGFzeW5jIChcclxuICAgICAgICBkYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGF1dGg6IHN0cmluZyA9ICcnXHJcbiAgICApID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEJvb2tUaXRsZSgpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGV4dHJhY3RlZCA9IGRhdGEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vIFNob3J0ZW4gdGl0bGUgYW5kIGNoZWNrIGl0IGZvciBicmFja2V0cyAmIGF1dGhvciBuYW1lc1xyXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwudHJpbVN0cmluZyhVdGlsLmJyYWNrZXRSZW1vdmVyKGV4dHJhY3RlZCksIDUwKTtcclxuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLmNoZWNrRGFzaGVzKGV4dHJhY3RlZCwgYXV0aCk7XHJcbiAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBHUi1mb3JtYXR0ZWQgYXV0aG9ycyBhcyBhbiBhcnJheSBsaW1pdGVkIHRvIGBudW1gXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBhdXRob3IgbGlua3NcclxuICAgICAqIEBwYXJhbSBudW0gVGhlIG51bWJlciBvZiBhdXRob3JzIHRvIHJldHVybi4gRGVmYXVsdCAzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va0F1dGhvcnMgPSBhc3luYyAoXHJcbiAgICAgICAgZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIG51bTogbnVtYmVyID0gM1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZXRCb29rQXV0aG9ycygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKGF1dGhvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoTGlzdC5wdXNoKFV0aWwuZ29vZHJlYWRzLnNtYXJ0QXV0aChhdXRob3IuaW5uZXJUZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gYXV0aExpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIHNlcmllcyBhcyBhbiBhcnJheVxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgc2VyaWVzIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1NlcmllcyA9IGFzeW5jIChkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tTZXJpZXMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmllc0xpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgdGFibGUtbGlrZSBhcnJheSBvZiByb3dzIGFzIGFuIG9iamVjdC5cclxuICAgICAqIFN0b3JlIHRoZSByZXR1cm5lZCBvYmplY3QgYW5kIGFjY2VzcyB1c2luZyB0aGUgcm93IHRpdGxlLCBleC4gYHN0b3JlZFsnVGl0bGU6J11gXHJcbiAgICAgKiBAcGFyYW0gcm93TGlzdCBBbiBhcnJheSBvZiB0YWJsZS1saWtlIHJvd3NcclxuICAgICAqIEBwYXJhbSB0aXRsZUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSB0aXRsZSBjZWxscy4gRGVmYXVsdCBgLnRvckRldExlZnRgXHJcbiAgICAgKiBAcGFyYW0gZGF0YUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSBkYXRhIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0UmlnaHRgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxyXG4gICAgICAgIHJvd0xpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4sXHJcbiAgICAgICAgdGl0bGVDbGFzcyA9ICcudG9yRGV0TGVmdCcsXHJcbiAgICAgICAgZGF0YUNsYXNzID0gJy50b3JEZXRSaWdodCdcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChyb3dMaXN0Lmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVdGlsLnJvd3NUb09iaiggJHtyb3dMaXN0fSApOiBSb3cgbGlzdCB3YXMgZW1wdHkhYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJvd3M6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIHJvd0xpc3QuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3Rvcih0aXRsZUNsYXNzKTtcclxuICAgICAgICAgICAgY29uc3QgZGF0YTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoZGF0YUNsYXNzKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGl0bGUudGV4dENvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUm93IHRpdGxlIHdhcyBlbXB0eSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcm93cy5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKChvYmpbaXRlbS5rZXldID0gaXRlbS52YWx1ZSksIG9iaiksIHt9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENvbnZlcnQgYnl0ZXMgaW50byBhIGh1bWFuLXJlYWRhYmxlIHN0cmluZ1xyXG4gICAgICogQ3JlYXRlZCBieSB5eXl6eno5OTlcclxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlcyB0byBiZSBmb3JtYXR0ZWRcclxuICAgICAqIEBwYXJhbSBiID9cclxuICAgICAqIEByZXR1cm5zIFN0cmluZyBpbiB0aGUgZm9ybWF0IG9mIGV4LiBgMTIzIE1CYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGZvcm1hdEJ5dGVzID0gKGJ5dGVzOiBudW1iZXIsIGIgPSAyKSA9PiB7XHJcbiAgICAgICAgaWYgKGJ5dGVzID09PSAwKSByZXR1cm4gJzAgQnl0ZXMnO1xyXG4gICAgICAgIGNvbnN0IGMgPSAwID4gYiA/IDAgOiBiO1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZygxMDI0KSk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdygxMDI0LCBpbmRleCkpLnRvRml4ZWQoYykpICtcclxuICAgICAgICAgICAgJyAnICtcclxuICAgICAgICAgICAgWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ11baW5kZXhdXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBkZXJlZmVyID0gKHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphLyR7ZW5jb2RlVVJJKHVybCl9YDtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBkZWxheSA9IChtczogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcbiAgICB9O1xyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLyoqXHJcbiAqICMgQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbGlkYXRpb24gJiBjb25maXJtYXRpb25cclxuICovXHJcbmNsYXNzIENoZWNrIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgbmV3VmVyOiBzdHJpbmcgPSBHTV9pbmZvLnNjcmlwdC52ZXJzaW9uO1xyXG4gICAgcHVibGljIHN0YXRpYyBwcmV2VmVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgnbXBfdmVyc2lvbicpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBXYWl0IGZvciBhbiBlbGVtZW50IHRvIGV4aXN0LCB0aGVuIHJldHVybiBpdFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIC0gVGhlIERPTSBzdHJpbmcgdGhhdCB3aWxsIGJlIHVzZWQgdG8gc2VsZWN0IGFuIGVsZW1lbnRcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8SFRNTEVsZW1lbnQ+fSBQcm9taXNlIG9mIGFuIGVsZW1lbnQgdGhhdCB3YXMgc2VsZWN0ZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbGVtTG9hZChcclxuICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnRcclxuICAgICk6IFByb21pc2U8SFRNTEVsZW1lbnQgfCBmYWxzZT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJWMgTG9va2luZyBmb3IgJHtzZWxlY3Rvcn1gLCAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1NTUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IF9jb3VudGVyID0gMDtcclxuICAgICAgICBjb25zdCBfY291bnRlckxpbWl0ID0gMjAwO1xyXG4gICAgICAgIGNvbnN0IGxvZ2ljID0gYXN5bmMgKFxyXG4gICAgICAgICAgICBzZWxlY3Rvcjogc3RyaW5nIHwgSFRNTEVsZW1lbnRcclxuICAgICAgICApOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+ID0+IHtcclxuICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBhY3R1YWwgZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MRWxlbWVudCB8IG51bGwgPVxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgICAgICAgICAgID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcclxuICAgICAgICAgICAgICAgICAgICA6IHNlbGVjdG9yO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVsZW0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgYCR7c2VsZWN0b3J9IGlzIHVuZGVmaW5lZCFgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtID09PSBudWxsICYmIF9jb3VudGVyIDwgX2NvdW50ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgVXRpbC5hZlRpbWVyKCk7XHJcbiAgICAgICAgICAgICAgICBfY291bnRlcisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGxvZ2ljKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtID09PSBudWxsICYmIF9jb3VudGVyID49IF9jb3VudGVyTGltaXQpIHtcclxuICAgICAgICAgICAgICAgIF9jb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBsb2dpYyhzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFJ1biBhIGZ1bmN0aW9uIHdoZW5ldmVyIGFuIGVsZW1lbnQgY2hhbmdlc1xyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIC0gVGhlIGVsZW1lbnQgdG8gYmUgb2JzZXJ2ZWQuIENhbiBiZSBhIHN0cmluZy5cclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBydW4gd2hlbiB0aGUgb2JzZXJ2ZXIgdHJpZ2dlcnNcclxuICAgICAqIEByZXR1cm4gUHJvbWlzZSBvZiBhIG11dGF0aW9uIG9ic2VydmVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZWxlbU9ic2VydmVyKFxyXG4gICAgICAgIHNlbGVjdG9yOiBzdHJpbmcgfCBIVE1MRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgY2FsbGJhY2s6IE11dGF0aW9uQ2FsbGJhY2ssXHJcbiAgICAgICAgY29uZmlnOiBNdXRhdGlvbk9ic2VydmVySW5pdCA9IHtcclxuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxyXG4gICAgICAgIH1cclxuICAgICk6IFByb21pc2U8TXV0YXRpb25PYnNlcnZlcj4ge1xyXG4gICAgICAgIGxldCBzZWxlY3RlZDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBzZWxlY3RlZCA9IDxIVE1MRWxlbWVudCB8IG51bGw+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZG4ndCBmaW5kICcke3NlbGVjdG9yfSdgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICBgJWMgU2V0dGluZyBvYnNlcnZlciBvbiAke3NlbGVjdG9yfTogJHtzZWxlY3RlZH1gLFxyXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjNWQ4YWE4J1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShzZWxlY3RlZCEsIGNvbmZpZyk7XHJcbiAgICAgICAgcmV0dXJuIG9ic2VydmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDaGVjayB0byBzZWUgaWYgdGhlIHNjcmlwdCBoYXMgYmVlbiB1cGRhdGVkIGZyb20gYW4gb2xkZXIgdmVyc2lvblxyXG4gICAgICogQHJldHVybiBUaGUgdmVyc2lvbiBzdHJpbmcgb3IgZmFsc2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB1cGRhdGVkKCk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKCdDaGVjay51cGRhdGVkKCknKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFBSRVYgVkVSID0gJHt0aGlzLnByZXZWZXJ9YCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBORVcgVkVSID0gJHt0aGlzLm5ld1Zlcn1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIERpZmZlcmVudCB2ZXJzaW9uczsgdGhlIHNjcmlwdCB3YXMgdXBkYXRlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5uZXdWZXIgIT09IHRoaXMucHJldlZlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBpcyBuZXcgb3IgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhlIG5ldyB2ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfdmVyc2lvbicsIHRoaXMubmV3VmVyKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZXZWZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgc2NyaXB0IGhhcyBydW4gYmVmb3JlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaGFzIHJ1biBiZWZvcmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCd1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0LXRpbWUgcnVuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgaGFzIG5ldmVyIHJ1bicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVuYWJsZSB0aGUgbW9zdCBiYXNpYyBmZWF0dXJlc1xyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdnb29kcmVhZHNCdG4nLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnYWxlcnRzJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgnZmlyc3RSdW4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTY3JpcHQgbm90IHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDaGVjayB0byBzZWUgd2hhdCBwYWdlIGlzIGJlaW5nIGFjY2Vzc2VkXHJcbiAgICAgKiBAcGFyYW0ge1ZhbGlkUGFnZX0gcGFnZVF1ZXJ5IC0gQW4gb3B0aW9uYWwgcGFnZSB0byBzcGVjaWZpY2FsbHkgY2hlY2sgZm9yXHJcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZz59IEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IHBhZ2VcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8Ym9vbGVhbj59IE9wdGlvbmFsbHksIGEgYm9vbGVhbiBpZiB0aGUgY3VycmVudCBwYWdlIG1hdGNoZXMgdGhlIGBwYWdlUXVlcnlgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcGFnZShwYWdlUXVlcnk/OiBWYWxpZFBhZ2UpOiBQcm9taXNlPHN0cmluZyB8IGJvb2xlYW4+IHtcclxuICAgICAgICBjb25zdCBzdG9yZWRQYWdlID0gR01fZ2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRQYWdlOiBWYWxpZFBhZ2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDaGVjay5wYWdlKCkgaGFzIGJlZW4gcnVuIGFuZCBhIHZhbHVlIHdhcyBzdG9yZWRcclxuICAgICAgICAgICAgaWYgKHN0b3JlZFBhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UncmUganVzdCBjaGVja2luZyB3aGF0IHBhZ2Ugd2UncmUgb24sIHJldHVybiB0aGUgc3RvcmVkIHBhZ2VcclxuICAgICAgICAgICAgICAgIGlmICghcGFnZVF1ZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzdG9yZWRQYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBjaGVja2luZyBmb3IgYSBzcGVjaWZpYyBwYWdlLCByZXR1cm4gVFJVRS9GQUxTRVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IHN0b3JlZFBhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrLnBhZ2UoKSBoYXMgbm90IHByZXZpb3VzIHJ1blxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBhZ2VcclxuICAgICAgICAgICAgICAgIGxldCBwYXRoOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5pbmRleE9mKCcucGhwJykgPyBwYXRoLnNwbGl0KCcucGhwJylbMF0gOiBwYXRoO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFnZSA9IHBhdGguc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIHBhZ2Uuc2hpZnQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUGFnZSBVUkwgQCAke3BhZ2Uuam9pbignIC0+ICcpfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBvYmplY3QgbGl0ZXJhbCBvZiBzb3J0cyB0byB1c2UgYXMgYSBcInN3aXRjaFwiXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYXNlczogeyBba2V5OiBzdHJpbmddOiAoKSA9PiBWYWxpZFBhZ2UgfCB1bmRlZmluZWQgfSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnJzogKCkgPT4gJ2hvbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAoKSA9PiAnaG9tZScsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRib3g6ICgpID0+ICdzaG91dGJveCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6ICgpID0+ICdzZXR0aW5ncycsXHJcbiAgICAgICAgICAgICAgICAgICAgbWlsbGlvbmFpcmVzOiAoKSA9PiAndmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHQ6ICgpID0+ICd0b3JyZW50JyxcclxuICAgICAgICAgICAgICAgICAgICB1OiAoKSA9PiAndXNlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZVsxXSA9PT0gJ3QnKSByZXR1cm4gJ2ZvcnVtIHRocmVhZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB0b3I6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhZ2VbMV0gPT09ICdicm93c2UnKSByZXR1cm4gJ2Jyb3dzZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICdyZXF1ZXN0czInKSByZXR1cm4gJ3JlcXVlc3QnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwYWdlWzFdID09PSAndmlld1JlcXVlc3QnKSByZXR1cm4gJ3JlcXVlc3QgZGV0YWlscyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICd1cGxvYWQnKSByZXR1cm4gJ3VwbG9hZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBuZXdVc2VyczogKCkgPT4gJ25ldyB1c2VycycsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgY2FzZSB0aGF0IG1hdGNoZXMgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhc2VzW3BhZ2VbMF1dKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSBjYXNlc1twYWdlWzBdXSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFBhZ2UgXCIke3BhZ2V9XCIgaXMgbm90IGEgdmFsaWQgTSsgcGFnZS4gUGF0aDogJHtwYXRofWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBwYWdlIHRvIGJlIGFjY2Vzc2VkIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2N1cnJlbnRQYWdlJywgY3VycmVudFBhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjdXJyZW50UGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYWdlUXVlcnkgPT09IGN1cnJlbnRQYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiBhIGdpdmVuIGNhdGVnb3J5IGlzIGFuIGVib29rL2F1ZGlvYm9vayBjYXRlZ29yeVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzQm9va0NhdChjYXQ6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIEN1cnJlbnRseSwgYWxsIGJvb2sgY2F0ZWdvcmllcyBhcmUgYXNzdW1lZCB0byBiZSBpbiB0aGUgcmFuZ2Ugb2YgMzktMTIwXHJcbiAgICAgICAgcmV0dXJuIGNhdCA+PSAzOSAmJiBjYXQgPD0gMTIwID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcblxyXG4vKipcclxuICogQ2xhc3MgZm9yIGhhbmRsaW5nIHZhbHVlcyBhbmQgbWV0aG9kcyByZWxhdGVkIHRvIHN0eWxlc1xyXG4gKiBAY29uc3RydWN0b3IgSW5pdGlhbGl6ZXMgdGhlbWUgYmFzZWQgb24gbGFzdCBzYXZlZCB2YWx1ZTsgY2FuIGJlIGNhbGxlZCBiZWZvcmUgcGFnZSBjb250ZW50IGlzIGxvYWRlZFxyXG4gKiBAbWV0aG9kIHRoZW1lIEdldHMgb3Igc2V0cyB0aGUgY3VycmVudCB0aGVtZVxyXG4gKi9cclxuY2xhc3MgU3R5bGUge1xyXG4gICAgcHJpdmF0ZSBfdGhlbWU6IHN0cmluZztcclxuICAgIHByaXZhdGUgX3ByZXZUaGVtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfY3NzRGF0YTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIFRoZSBsaWdodCB0aGVtZSBpcyB0aGUgZGVmYXVsdCB0aGVtZSwgc28gdXNlIE0rIExpZ2h0IHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gJ2xpZ2h0JztcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBwcmV2aW91c2x5IHVzZWQgdGhlbWUgb2JqZWN0XHJcbiAgICAgICAgdGhpcy5fcHJldlRoZW1lID0gdGhpcy5fZ2V0UHJldlRoZW1lKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgZXhpc3RzLCBhc3N1bWUgdGhlIGN1cnJlbnQgdGhlbWUgaXMgaWRlbnRpY2FsXHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZUaGVtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcHJldlRoZW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2Fybignbm8gcHJldmlvdXMgdGhlbWUnKTtcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggdGhlIENTUyBkYXRhXHJcbiAgICAgICAgdGhpcy5fY3NzRGF0YSA9IEdNX2dldFJlc291cmNlVGV4dCgnTVBfQ1NTJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0aGUgY3VycmVudCB0aGVtZSB0byBiZSByZXR1cm5lZCAqL1xyXG4gICAgZ2V0IHRoZW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RoZW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgc2V0ICovXHJcbiAgICBzZXQgdGhlbWUodmFsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl90aGVtZSA9IHZhbDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyB0aGUgTSsgdGhlbWUgYmFzZWQgb24gdGhlIHNpdGUgdGhlbWUgKi9cclxuICAgIHB1YmxpYyBhc3luYyBhbGlnblRvU2l0ZVRoZW1lKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHRoZW1lOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9nZXRTaXRlQ1NTKCk7XHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGVtZS5pbmRleE9mKCdkYXJrJykgPiAwID8gJ2RhcmsnIDogJ2xpZ2h0JztcclxuICAgICAgICBpZiAodGhpcy5fcHJldlRoZW1lICE9PSB0aGlzLl90aGVtZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRQcmV2VGhlbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluamVjdCB0aGUgQ1NTIGNsYXNzIHVzZWQgYnkgTSsgZm9yIHRoZW1pbmdcclxuICAgICAgICBDaGVjay5lbGVtTG9hZCgnYm9keScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xyXG4gICAgICAgICAgICBpZiAoYm9keSkge1xyXG4gICAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKGBtcF8ke3RoaXMuX3RoZW1lfWApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEJvZHkgaXMgJHtib2R5fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEluamVjdHMgdGhlIHN0eWxlc2hlZXQgbGluayBpbnRvIHRoZSBoZWFkZXIgKi9cclxuICAgIHB1YmxpYyBpbmplY3RMaW5rKCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGlkOiBzdHJpbmcgPSAnbXBfY3NzJztcclxuICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSkge1xyXG4gICAgICAgICAgICBjb25zdCBzdHlsZTogSFRNTFN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHN0eWxlLmlubmVyVGV4dCA9IHRoaXMuX2Nzc0RhdGEgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2Nzc0RhdGEgOiAnJztcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpIS5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBhbiBlbGVtZW50IHdpdGggdGhlIGlkIFwiJHtpZH1cIiBhbHJlYWR5IGV4aXN0c2ApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aGVtZSBvYmplY3QgaWYgaXQgZXhpc3RzICovXHJcbiAgICBwcml2YXRlIF9nZXRQcmV2VGhlbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gR01fZ2V0VmFsdWUoJ3N0eWxlX3RoZW1lJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNhdmVzIHRoZSBjdXJyZW50IHRoZW1lIGZvciBmdXR1cmUgcmVmZXJlbmNlICovXHJcbiAgICBwcml2YXRlIF9zZXRQcmV2VGhlbWUoKTogdm9pZCB7XHJcbiAgICAgICAgR01fc2V0VmFsdWUoJ3N0eWxlX3RoZW1lJywgdGhpcy5fdGhlbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFNpdGVDU1MoKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGhlbWVVUkw6IHN0cmluZyB8IG51bGwgPSBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2hlYWQgbGlua1tocmVmKj1cIklDR3N0YXRpb25cIl0nKSFcclxuICAgICAgICAgICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVtZVVSTCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUodGhlbWVVUkwpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oYHRoZW1lVXJsIGlzIG5vdCBhIHN0cmluZzogJHt0aGVtZVVSTH1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY2hlY2sudHNcIiAvPlxyXG4vKipcclxuICogQ09SRSBGRUFUVVJFU1xyXG4gKlxyXG4gKiBZb3VyIGZlYXR1cmUgYmVsb25ncyBoZXJlIGlmIHRoZSBmZWF0dXJlOlxyXG4gKiBBKSBpcyBjcml0aWNhbCB0byB0aGUgdXNlcnNjcmlwdFxyXG4gKiBCKSBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG90aGVyIGZlYXR1cmVzXHJcbiAqIEMpIHdpbGwgaGF2ZSBzZXR0aW5ncyBkaXNwbGF5ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2VcclxuICogSWYgQSAmIEIgYXJlIG1ldCBidXQgbm90IEMgY29uc2lkZXIgdXNpbmcgYFV0aWxzLnRzYCBpbnN0ZWFkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZmVhdHVyZSBjcmVhdGVzIGEgcG9wLXVwIG5vdGlmaWNhdGlvblxyXG4gKi9cclxuY2xhc3MgQWxlcnRzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2FsZXJ0cycsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNKyBBbGVydCBwYW5lbCBmb3IgdXBkYXRlIGluZm9ybWF0aW9uLCBldGMuJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2godGhpcy5fc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBub3RpZnkoa2luZDogc3RyaW5nIHwgYm9vbGVhbiwgbG9nOiBBcnJheU9iamVjdCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFsZXJ0cy5ub3RpZnkoICR7a2luZH0gKWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFZlcmlmeSBhIG5vdGlmaWNhdGlvbiByZXF1ZXN0IHdhcyBtYWRlXHJcbiAgICAgICAgICAgIGlmIChraW5kKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBWZXJpZnkgbm90aWZpY2F0aW9ucyBhcmUgYWxsb3dlZFxyXG4gICAgICAgICAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdhbGVydHMnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEludGVybmFsIGZ1bmN0aW9uIHRvIGJ1aWxkIG1zZyB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRNc2cgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycjogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICApOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZE1zZyggJHt0aXRsZX0gKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYXJyYXkgaXNuJ3QgZW1wdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPiAwICYmIGFyclswXSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIHNlY3Rpb24gaGVhZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1zZzogc3RyaW5nID0gYDxoND4ke3RpdGxlfTo8L2g0Pjx1bD5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggaXRlbSBpbiB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gYDxsaT4ke2l0ZW19PC9saT5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJzwvdWw+JztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBub3RpZmljYXRpb24gcGFuZWxcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWlsZFBhbmVsID0gKG1zZzogc3RyaW5nKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGJ1aWxkUGFuZWwoICR7bXNnfSApYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPSdtcF9ub3RpZmljYXRpb24nPiR7bXNnfTxzcGFuPlg8L3NwYW4+PC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZ0JveDogRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9ub3RpZmljYXRpb24nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlQnRuOiBIVE1MU3BhbkVsZW1lbnQgPSBtc2dCb3gucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VCdG4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNsb3NlIGJ1dHRvbiBpcyBjbGlja2VkLCByZW1vdmUgaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1zZ0JveCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2dCb3gucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAndXBkYXRlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgdXBkYXRlIG1lc3NhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYDxzdHJvbmc+TUFNKyBoYXMgYmVlbiB1cGRhdGVkITwvc3Ryb25nPiBZb3UgYXJlIG5vdyB1c2luZyB2JHtNUC5WRVJTSU9OfSwgY3JlYXRlZCBvbiAke01QLlRJTUVTVEFNUH0uIERpc2N1c3MgaXQgb24gPGEgaHJlZj0nZm9ydW1zLnBocD9hY3Rpb249dmlld3RvcGljJnRvcGljaWQ9NDE4NjMnPnRoZSBmb3J1bXM8L2E+Ljxocj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGNoYW5nZWxvZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IGJ1aWxkTXNnKGxvZy5VUERBVEVfTElTVCwgJ0NoYW5nZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuQlVHX0xJU1QsICdLbm93biBCdWdzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAnZmlyc3RSdW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxoND5XZWxjb21lIHRvIE1BTSshPC9oND5QbGVhc2UgaGVhZCBvdmVyIHRvIHlvdXIgPGEgaHJlZj1cIi9wcmVmZXJlbmNlcy9pbmRleC5waHBcIj5wcmVmZXJlbmNlczwvYT4gdG8gZW5hYmxlIHRoZSBNQU0rIHNldHRpbmdzLjxicj5BbnkgYnVnIHJlcG9ydHMsIGZlYXR1cmUgcmVxdWVzdHMsIGV0Yy4gY2FuIGJlIG1hZGUgb24gPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy9pc3N1ZXNcIj5HaXRodWI8L2E+LCA8YSBocmVmPVwiL2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzXCI+dGhlIGZvcnVtczwvYT4sIG9yIDxhIGhyZWY9XCIvc2VuZG1lc3NhZ2UucGhwP3JlY2VpdmVyPTEwODMwM1wiPnRocm91Z2ggcHJpdmF0ZSBtZXNzYWdlPC9hPi4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCdWlsZGluZyBmaXJzdCBydW4gbWVzc2FnZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFJlY2VpdmVkIG1zZyBraW5kOiAke2tpbmR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFuZWwobWVzc2FnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RpZmljYXRpb25zIGFyZSBkaXNhYmxlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVidWcgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5PdGhlcixcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZGVidWcnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdFcnJvciBsb2cgKDxlbT5DbGljayB0aGlzIGNoZWNrYm94IHRvIGVuYWJsZSB2ZXJib3NlIGxvZ2dpbmcgdG8gdGhlIGNvbnNvbGU8L2VtPiknLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBNUC5zZXR0aW5nc0dsb2IucHVzaCh0aGlzLl9zZXR0aW5ncyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiAjIEdMT0JBTCBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiAjIyBIaWRlIHRoZSBob21lIGJ1dHRvbiBvciB0aGUgYmFubmVyXHJcbiAqL1xyXG5jbGFzcyBIaWRlSG9tZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnZHJvcGRvd24nLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZUhvbWUnLFxyXG4gICAgICAgIHRhZzogJ1JlbW92ZSBiYW5uZXIvaG9tZScsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnRG8gbm90IHJlbW92ZSBlaXRoZXInLFxyXG4gICAgICAgICAgICBoaWRlQmFubmVyOiAnSGlkZSB0aGUgYmFubmVyJyxcclxuICAgICAgICAgICAgaGlkZUhvbWU6ICdIaWRlIHRoZSBob21lIGJ1dHRvbicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNjOiAnUmVtb3ZlIHRoZSBoZWFkZXIgaW1hZ2Ugb3IgSG9tZSBidXR0b24sIGJlY2F1c2UgYm90aCBsaW5rIHRvIHRoZSBob21lcGFnZScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21haW5tZW51JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGhpZGVyOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSh0aGlzLl9zZXR0aW5ncy50aXRsZSk7XHJcbiAgICAgICAgaWYgKGhpZGVyID09PSAnaGlkZUhvbWUnKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9ob21lJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgaG9tZSBidXR0b24hJyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChoaWRlciA9PT0gJ2hpZGVCYW5uZXInKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZV9iYW5uZXInKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBiYW5uZXIhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBEcm9wZG93blNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIEJ5cGFzcyB0aGUgdmF1bHQgaW5mbyBwYWdlXHJcbiAqL1xyXG5jbGFzcyBWYXVsdExpbmsgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3ZhdWx0TGluaycsXHJcbiAgICAgICAgZGVzYzogJ01ha2UgdGhlIFZhdWx0IGxpbmsgYnlwYXNzIHRoZSBWYXVsdCBJbmZvIHBhZ2UnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtaWxsaW9uSW5mbyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBkb2N1bWVudFxyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpIVxyXG4gICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdocmVmJywgJy9taWxsaW9uYWlyZXMvZG9uYXRlLnBocCcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE1hZGUgdGhlIHZhdWx0IHRleHQgbGluayB0byB0aGUgZG9uYXRlIHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgU2hvcnRlbiB0aGUgdmF1bHQgJiByYXRpbyB0ZXh0XHJcbiAqL1xyXG5jbGFzcyBNaW5pVmF1bHRJbmZvIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdtaW5pVmF1bHRJbmZvJyxcclxuICAgICAgICBkZXNjOiAnU2hvcnRlbiB0aGUgVmF1bHQgbGluayAmIHJhdGlvIHRleHQnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtaWxsaW9uSW5mbyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCB2YXVsdFRleHQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zdCByYXRpb1RleHQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKSE7XHJcblxyXG4gICAgICAgIC8vIFNob3J0ZW4gdGhlIHJhdGlvIHRleHRcclxuICAgICAgICAvLyBUT0RPOiBtb3ZlIHRoaXMgdG8gaXRzIG93biBzZXR0aW5nP1xyXG4gICAgICAgIC8qIFRoaXMgY2hhaW5lZCBtb25zdHJvc2l0eSBkb2VzIHRoZSBmb2xsb3dpbmc6XHJcbiAgICAgICAgLSBFeHRyYWN0IHRoZSBudW1iZXIgKHdpdGggZmxvYXQpIGZyb20gdGhlIGVsZW1lbnRcclxuICAgICAgICAtIEZpeCB0aGUgZmxvYXQgdG8gMiBkZWNpbWFsIHBsYWNlcyAod2hpY2ggY29udmVydHMgaXQgYmFjayBpbnRvIGEgc3RyaW5nKVxyXG4gICAgICAgIC0gQ29udmVydCB0aGUgc3RyaW5nIGJhY2sgaW50byBhIG51bWJlciBzbyB0aGF0IHdlIGNhbiBjb252ZXJ0IGl0IHdpdGhgdG9Mb2NhbGVTdHJpbmdgIHRvIGdldCBjb21tYXMgYmFjayAqL1xyXG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihVdGlsLmV4dHJhY3RGbG9hdChyYXRpb1RleHQpWzBdLnRvRml4ZWQoMikpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgcmF0aW9UZXh0LmlubmVySFRNTCA9IGAke251bX0gPGltZyBzcmM9XCIvcGljL3VwZG93bkJpZy5wbmdcIiBhbHQ9XCJyYXRpb1wiPmA7XHJcblxyXG4gICAgICAgIC8vIFR1cm4gdGhlIG51bWVyaWMgcG9ydGlvbiBvZiB0aGUgdmF1bHQgbGluayBpbnRvIGEgbnVtYmVyXHJcbiAgICAgICAgbGV0IG5ld1RleHQ6IG51bWJlciA9IHBhcnNlSW50KFxyXG4gICAgICAgICAgICB2YXVsdFRleHQudGV4dENvbnRlbnQhLnNwbGl0KCc6JylbMV0uc3BsaXQoJyAnKVsxXS5yZXBsYWNlKC8sL2csICcnKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIHZhdWx0IGFtb3VudCB0byBtaWxsaW9udGhzXHJcbiAgICAgICAgbmV3VGV4dCA9IE51bWJlcigobmV3VGV4dCAvIDFlNikudG9GaXhlZCgzKSk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSB2YXVsdCB0ZXh0XHJcbiAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50ID0gYFZhdWx0OiAke25ld1RleHR9IG1pbGxpb25gO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNob3J0ZW5lZCB0aGUgdmF1bHQgJiByYXRpbyBudW1iZXJzIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIERpc3BsYXkgYm9udXMgcG9pbnQgZGVsdGFcclxuICovXHJcbmNsYXNzIEJvbnVzUG9pbnREZWx0YSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYm9udXNQb2ludERlbHRhJyxcclxuICAgICAgICBkZXNjOiBgRGlzcGxheSBob3cgbWFueSBib251cyBwb2ludHMgeW91J3ZlIGdhaW5lZCBzaW5jZSBsYXN0IHBhZ2Vsb2FkYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG1CUCc7XHJcbiAgICBwcml2YXRlIF9wcmV2QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9jdXJyZW50QlA6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIF9kZWx0YTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50QlBFbDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG5cclxuICAgICAgICAvLyBHZXQgb2xkIEJQIHZhbHVlXHJcbiAgICAgICAgdGhpcy5fcHJldkJQID0gdGhpcy5fZ2V0QlAoKTtcclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRCUEVsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIEV4dHJhY3Qgb25seSB0aGUgbnVtYmVyIGZyb20gdGhlIEJQIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudDogUmVnRXhwTWF0Y2hBcnJheSA9IGN1cnJlbnRCUEVsLnRleHRDb250ZW50IS5tYXRjaChcclxuICAgICAgICAgICAgICAgIC9cXGQrL2dcclxuICAgICAgICAgICAgKSBhcyBSZWdFeHBNYXRjaEFycmF5O1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IG5ldyBCUCB2YWx1ZVxyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50QlAgPSBwYXJzZUludChjdXJyZW50WzBdKTtcclxuICAgICAgICAgICAgdGhpcy5fc2V0QlAodGhpcy5fY3VycmVudEJQKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZWx0YVxyXG4gICAgICAgICAgICB0aGlzLl9kZWx0YSA9IHRoaXMuX2N1cnJlbnRCUCAtIHRoaXMuX3ByZXZCUDtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRleHQgaWYgbm90IDBcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RlbHRhICE9PSAwICYmICFpc05hTih0aGlzLl9kZWx0YSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3BsYXlCUCh0aGlzLl9kZWx0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlzcGxheUJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCBib251c0JveDogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGxldCBkZWx0YUJveDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgIGRlbHRhQm94ID0gYnAgPiAwID8gYCske2JwfWAgOiBgJHticH1gO1xyXG5cclxuICAgICAgICBpZiAoYm9udXNCb3ggIT09IG51bGwpIHtcclxuICAgICAgICAgICAgYm9udXNCb3guaW5uZXJIVE1MICs9IGA8c3BhbiBjbGFzcz0nbXBfYnBEZWx0YSc+ICgke2RlbHRhQm94fSk8L3NwYW4+YDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgX3NldEJQID0gKGJwOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1WYWxgLCBgJHticH1gKTtcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF9nZXRCUCA9ICgpOiBudW1iZXIgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCk7XHJcbiAgICAgICAgaWYgKHN0b3JlZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChzdG9yZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgQmx1ciB0aGUgaGVhZGVyIGJhY2tncm91bmRcclxuICovXHJcbmNsYXNzIEJsdXJyZWRIZWFkZXIgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2JsdXJyZWRIZWFkZXInLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBibHVycmVkIGJhY2tncm91bmQgdG8gdGhlIGhlYWRlciBhcmVhYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc2l0ZU1haW4gPiBoZWFkZXInO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBoZWFkZXI6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCR7dGhpcy5fdGFyfWApO1xyXG4gICAgICAgIGNvbnN0IGhlYWRlckltZzogSFRNTEltYWdlRWxlbWVudCB8IG51bGwgPSBoZWFkZXIucXVlcnlTZWxlY3RvcihgaW1nYCk7XHJcblxyXG4gICAgICAgIGlmIChoZWFkZXJJbWcpIHtcclxuICAgICAgICAgICAgY29uc3QgaGVhZGVyU3JjOiBzdHJpbmcgfCBudWxsID0gaGVhZGVySW1nLmdldEF0dHJpYnV0ZSgnc3JjJyk7XHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgY29udGFpbmVyIGZvciB0aGUgYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBibHVycmVkQmFjazogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdtcF9ibHVycmVkQmFjaycpO1xyXG4gICAgICAgICAgICBoZWFkZXIuYXBwZW5kKGJsdXJyZWRCYWNrKTtcclxuICAgICAgICAgICAgYmx1cnJlZEJhY2suc3R5bGUuYmFja2dyb3VuZEltYWdlID0gaGVhZGVyU3JjID8gYHVybCgke2hlYWRlclNyY30pYCA6ICcnO1xyXG4gICAgICAgICAgICBibHVycmVkQmFjay5jbGFzc0xpc3QuYWRkKCdtcF9jb250YWluZXInKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBIaWRlIHRoZSBzZWVkYm94IGxpbmtcclxuICovXHJcbmNsYXNzIEhpZGVTZWVkYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdoaWRlU2VlZGJveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgXCJHZXQgQSBTZWVkYm94XCIgbWVudSBpdGVtJyxcclxuICAgIH07XHJcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWVudSAuc2JEb25DcnlwdG8nO1xyXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzZWVkYm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBpZiAoc2VlZGJveEJ0bikge1xyXG4gICAgICAgICAgICBzZWVkYm94QnRuLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgU2VlZGJveCBidXR0b24hJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgSGlkZSB0aGUgZG9uYXRpb24gbGlua1xyXG4gKi9cclxuY2xhc3MgSGlkZURvbmF0aW9uQm94IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdoaWRlRG9uYXRpb25Cb3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIGRlc2M6ICdSZW1vdmUgdGhlIERvbmF0aW9ucyBtZW51IGl0ZW0nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtZW51IC5tbURvbkJveCc7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGRvbmF0aW9uQm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBpZiAoZG9uYXRpb25Cb3hCdG4pIHtcclxuICAgICAgICAgICAgZG9uYXRpb25Cb3hCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSGlkIHRoZSBEb25hdGlvbiBCb3ggYnV0dG9uIScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMgRml4ZWQgbmF2aWdhdGlvbiAmIHNlYXJjaFxyXG4gKi9cclxuXHJcbmNsYXNzIEZpeGVkTmF2IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdmaXhlZE5hdicsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgZGVzYzogJ0ZpeCB0aGUgbmF2aWdhdGlvbi9zZWFyY2ggdG8gdGhlIHRvcCBvZiB0aGUgcGFnZS4nLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJ2JvZHknO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykhLmNsYXNzTGlzdC5hZGQoJ21wX2ZpeGVkX25hdicpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFBpbm5lZCB0aGUgbmF2L3NlYXJjaCB0byB0aGUgdG9wIScpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jaGVjay50c1wiIC8+XHJcblxyXG4vKipcclxuICogU0hBUkVEIENPREVcclxuICpcclxuICogVGhpcyBpcyBmb3IgYW55dGhpbmcgdGhhdCdzIHNoYXJlZCBiZXR3ZWVuIGZpbGVzLCBidXQgaXMgbm90IGdlbmVyaWMgZW5vdWdoIHRvXHJcbiAqIHRvIGJlbG9uZyBpbiBgVXRpbHMudHNgLiBJIGNhbid0IHRoaW5rIG9mIGEgYmV0dGVyIHdheSB0byBjYXRlZ29yaXplIERSWSBjb2RlLlxyXG4gKi9cclxuXHJcbmNsYXNzIFNoYXJlZCB7XHJcbiAgICAvKipcclxuICAgICAqIFJlY2VpdmUgYSB0YXJnZXQgYW5kIGB0aGlzLl9zZXR0aW5ncy50aXRsZWBcclxuICAgICAqIEBwYXJhbSB0YXIgQ1NTIHNlbGVjdG9yIGZvciBhIHRleHQgaW5wdXQgYm94XHJcbiAgICAgKi9cclxuICAgIC8vIFRPRE86IHdpdGggYWxsIENoZWNraW5nIGJlaW5nIGRvbmUgaW4gYFV0aWwuc3RhcnRGZWF0dXJlKClgIGl0J3Mgbm8gbG9uZ2VyIG5lY2Vzc2FyeSB0byBDaGVjayBpbiB0aGlzIGZ1bmN0aW9uXHJcbiAgICBwdWJsaWMgZmlsbEdpZnRCb3ggPSAoXHJcbiAgICAgICAgdGFyOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0dGluZ1RpdGxlOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiA9PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmZpbGxHaWZ0Qm94KCAke3Rhcn0sICR7c2V0dGluZ1RpdGxlfSApYCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCh0YXIpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRCb3g6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvaW50Qm94KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlclNldFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3NldHRpbmdUaXRsZX1fdmFsYClcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXhQb2ludHM6IG51bWJlciA9IHBhcnNlSW50KHBvaW50Qm94LmdldEF0dHJpYnV0ZSgnbWF4JykhKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKHVzZXJTZXRQb2ludHMpICYmIHVzZXJTZXRQb2ludHMgPD0gbWF4UG9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFBvaW50cyA9IHVzZXJTZXRQb2ludHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHBvaW50Qm94LnZhbHVlID0gbWF4UG9pbnRzLnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXhQb2ludHMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgbGlzdCBvZiBhbGwgcmVzdWx0cyBmcm9tIEJyb3dzZSBwYWdlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRTZWFyY2hMaXN0ID0gKCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHNlYXJjaCByZXN1bHRzIHRvIGV4aXN0XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjc3NyIHRyW2lkIF49IFwidGRyXCJdIHRkJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbmF0Y2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+ID0gPFxyXG4gICAgICAgICAgICAgICAgICAgIE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cclxuICAgICAgICAgICAgICAgID5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjc3NyIHRyW2lkIF49IFwidGRyXCJdJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc25hdGNoTGlzdCA9PT0gbnVsbCB8fCBzbmF0Y2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNuYXRjaExpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVE9ETzogTWFrZSBnb29kcmVhZHNCdXR0b25zKCkgaW50byBhIGdlbmVyaWMgZnJhbWV3b3JrIGZvciBvdGhlciBzaXRlJ3MgYnV0dG9uc1xyXG4gICAgcHVibGljIGdvb2RyZWFkc0J1dHRvbnMgPSBhc3luYyAoXHJcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMuLi4nKTtcclxuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xyXG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XHJcblxyXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggR29vZHJlYWRzJywgJ21wX2dyUm93Jyk7XHJcblxyXG4gICAgICAgIC8vIEV4dHJhY3QgdGhlIFNlcmllcyBhbmQgQXV0aG9yXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAoc2VyaWVzUCA9IFV0aWwuZ2V0Qm9va1NlcmllcyhzZXJpZXNEYXRhKSksXHJcbiAgICAgICAgICAgIChhdXRob3JQID0gVXRpbC5nZXRCb29rQXV0aG9ycyhhdXRob3JEYXRhKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcubXBfZ3JSb3cgLmZsZXgnKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnV0dG9uVGFyOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93IC5mbGV4JylcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChidXR0b25UYXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdXR0b24gcm93IGNhbm5vdCBiZSB0YXJnZXRlZCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIFNlcmllcyBidXR0b25zXHJcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKHNlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXIuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdzZXJpZXMnLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsIGJ1dHRvblRpdGxlLCA0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZXJpZXMgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCdWlsZCBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgYXV0aG9yUFxyXG4gICAgICAgICAgICAudGhlbigoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF1dGgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcnMgPSBhdXRoLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnYXV0aG9yJywgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnQXV0aG9yJywgMyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ2Jvb2snLCB0aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGl0bGV9ICR7YXV0aG9yc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIGJvdGhVUkwsICdUaXRsZSArIEF1dGhvcicsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGdlbmVyYXRlIFRpdGxlK0F1dGhvciBsaW5rIVxcblRpdGxlOiAke3RpdGxlfVxcbkF1dGhvcnM6ICR7YXV0aG9yc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRlZCB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zIWApO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgYXVkaWJsZUJ1dHRvbnMgPSBhc3luYyAoXHJcbiAgICAgICAgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwsXHJcbiAgICAgICAgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbFxyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zLi4uJyk7XHJcbiAgICAgICAgbGV0IHNlcmllc1A6IFByb21pc2U8c3RyaW5nW10+LCBhdXRob3JQOiBQcm9taXNlPHN0cmluZ1tdPjtcclxuICAgICAgICBsZXQgYXV0aG9ycyA9ICcnO1xyXG5cclxuICAgICAgICBVdGlsLmFkZFRvckRldGFpbHNSb3codGFyZ2V0LCAnU2VhcmNoIEF1ZGlibGUnLCAnbXBfYXVSb3cnKTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcclxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9hdVJvdyAuZmxleCcpO1xyXG5cclxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfYXVSb3cgLmZsZXgnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcclxuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD9rZXl3b3Jkcz0ke2l0ZW19YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsIGJ1dHRvblRpdGxlLCA0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBzZXJpZXMgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBCdWlsZCBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgYXV0aG9yUFxyXG4gICAgICAgICAgICAudGhlbigoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF1dGgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcnMgPSBhdXRoLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP2F1dGhvcl9hdXRob3I9JHthdXRob3JzfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnQXV0aG9yJywgMyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD90aXRsZT0ke3RpdGxlfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vd3d3LmF1ZGlibGUuY29tL3NlYXJjaD90aXRsZT0ke3RpdGxlfSZhdXRob3JfYXV0aG9yPSR7YXV0aG9yc31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCBib3RoVVJMLCAnVGl0bGUgKyBBdXRob3InLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1BdWRpYmxlIGJ1dHRvbnMhYCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRPRE86IFN3aXRjaCB0byBTdG9yeUdyYXBoIEFQSSBvbmNlIGl0IGJlY29tZXMgYXZhaWxhYmxlPyBPciBhZHZhbmNlZCBzZWFyY2hcclxuICAgIHB1YmxpYyBzdG9yeUdyYXBoQnV0dG9ucyA9IGFzeW5jIChcclxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXHJcbiAgICApID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1TdG9yeUdyYXBoIGJ1dHRvbnMuLi4nKTtcclxuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xyXG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XHJcblxyXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggVGhlU3RvcnlHcmFwaCcsICdtcF9zZ1JvdycpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IHRoZSBTZXJpZXMgYW5kIEF1dGhvclxyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxyXG4gICAgICAgICAgICAoYXV0aG9yUCA9IFV0aWwuZ2V0Qm9va0F1dGhvcnMoYXV0aG9yRGF0YSkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLm1wX3NnUm93IC5mbGV4Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9zZ1JvdyAuZmxleCcpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnV0dG9uIHJvdyBjYW5ub3QgYmUgdGFyZ2V0ZWQhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCdWlsZCBTZXJpZXMgYnV0dG9uc1xyXG4gICAgICAgIHNlcmllc1AudGhlbigoc2VyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidXR0b25UaXRsZSA9IHNlci5sZW5ndGggPiAxID8gYFNlcmllczogJHtpdGVtfWAgOiAnU2VyaWVzJztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7aXRlbX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cclxuICAgICAgICBhdXRob3JQXHJcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHthdXRob3JzfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnQXV0aG9yJywgMyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gYXV0aG9yIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIEJ1aWxkIFRpdGxlIGJ1dHRvbnNcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBVdGlsLmdldEJvb2tUaXRsZShib29rRGF0YSwgYXV0aG9ycyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLnRoZXN0b3J5Z3JhcGguY29tL2Jyb3dzZT9zZWFyY2hfdGVybT0ke3RpdGxlfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCAnVGl0bGUnLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHRpdGxlIGFuZCBhdXRob3IgYm90aCBleGlzdCwgbWFrZSBhIFRpdGxlICsgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRob3JzICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBib3RoVVJMID0gYGh0dHBzOi8vYXBwLnRoZXN0b3J5Z3JhcGguY29tL2Jyb3dzZT9zZWFyY2hfdGVybT0ke3RpdGxlfSAke2F1dGhvcnN9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gdGl0bGUgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zIWApO1xyXG4gICAgfTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0UmF0aW9Qcm90ZWN0TGV2ZWxzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGxldCBsMSA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwxX3ZhbCcpKTtcclxuICAgICAgICBsZXQgbDIgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMMl92YWwnKSk7XHJcbiAgICAgICAgbGV0IGwzID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDNfdmFsJykpO1xyXG4gICAgICAgIGNvbnN0IGwxX2RlZiA9IDAuNTtcclxuICAgICAgICBjb25zdCBsMl9kZWYgPSAxO1xyXG4gICAgICAgIGNvbnN0IGwzX2RlZiA9IDI7XHJcblxyXG4gICAgICAgIC8vIERlZmF1bHQgdmFsdWVzIGlmIGVtcHR5XHJcbiAgICAgICAgaWYgKGlzTmFOKGwzKSkgbDMgPSBsM19kZWY7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSBsMl9kZWY7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSBsMV9kZWY7XHJcblxyXG4gICAgICAgIC8vIElmIHNvbWVvbmUgcHV0IHRoaW5ncyBpbiBhIGR1bWIgb3JkZXIsIGlnbm9yZSBzbWFsbGVyIG51bWJlcnNcclxuICAgICAgICBpZiAobDIgPiBsMykgbDIgPSBsMztcclxuICAgICAgICBpZiAobDEgPiBsMikgbDEgPSBsMjtcclxuXHJcbiAgICAgICAgLy8gSWYgY3VzdG9tIG51bWJlcnMgYXJlIHNtYWxsZXIgdGhhbiBkZWZhdWx0IHZhbHVlcywgaWdub3JlIHRoZSBsb3dlciB3YXJuaW5nXHJcbiAgICAgICAgaWYgKGlzTmFOKGwyKSkgbDIgPSBsMyA8IGwyX2RlZiA/IGwzIDogbDJfZGVmO1xyXG4gICAgICAgIGlmIChpc05hTihsMSkpIGwxID0gbDIgPCBsMV9kZWYgPyBsMiA6IGwxX2RlZjtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtsMSwgbDIsIGwzXTtcclxuICAgIH07XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjQlJPV1NFIFBBR0UgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogQWxsb3dzIFNuYXRjaGVkIHRvcnJlbnRzIHRvIGJlIGhpZGRlbi9zaG93blxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlU25hdGNoZWQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3RvZ2dsZVNuYXRjaGVkJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGhpZGUvc2hvdyByZXN1bHRzIHRoYXQgeW91J3ZlIHNuYXRjaGVkYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuICAgIHByaXZhdGUgX2lzVmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwcml2YXRlIF9zZWFyY2hMaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHwgdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBfc25hdGNoZWRIb29rOiBzdHJpbmcgPSAndGQgZGl2W2NsYXNzXj1cImJyb3dzZVwiXSc7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgbGV0IHRvZ2dsZTogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XHJcbiAgICAgICAgbGV0IHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD47XHJcbiAgICAgICAgY29uc3Qgc3RvcmVkU3RhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxyXG4gICAgICAgICAgICBgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWBcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoc3RvcmVkU3RhdGUgPT09ICdmYWxzZScgJiYgR01fZ2V0VmFsdWUoJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJykgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdG9nZ2xlVGV4dDogc3RyaW5nID0gdGhpcy5faXNWaXNpYmxlID8gJ0hpZGUgU25hdGNoZWQnIDogJ1Nob3cgU25hdGNoZWQnO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAnc25hdGNoZWRUb2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlVGV4dCxcclxuICAgICAgICAgICAgICAgICdoMScsXHJcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHRvZ2dsZVxyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgYmFzZWQgb24gdmlzIHN0YXRlXHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzVmlzaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IHJlcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBUb2dnbGUgU25hdGNoZWQgYnV0dG9uIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHMocmVzdWx0cywgdGhpcy5fc25hdGNoZWRIb29rKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbHRlcnMgc2VhcmNoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSBsaXN0IGEgc2VhcmNoIHJlc3VsdHMgbGlzdFxyXG4gICAgICogQHBhcmFtIHN1YlRhciB0aGUgZWxlbWVudHMgdGhhdCBtdXN0IGJlIGNvbnRhaW5lZCBpbiBvdXIgZmlsdGVyZWQgcmVzdWx0c1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4sIHN1YlRhcjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgbGlzdC5mb3JFYWNoKChzbmF0Y2gpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYnRuOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSA8SFRNTEhlYWRpbmdFbGVtZW50PihcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zbmF0Y2hlZFRvZ2dsZScpIVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2VsZWN0IG9ubHkgdGhlIGl0ZW1zIHRoYXQgbWF0Y2ggb3VyIHN1YiBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHNuYXRjaC5xdWVyeVNlbGVjdG9yKHN1YlRhcik7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIaWRlL3Nob3cgYXMgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdTaG93IFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICBzbmF0Y2guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdIaWRlIFNuYXRjaGVkJztcclxuICAgICAgICAgICAgICAgICAgICBzbmF0Y2guc3R5bGUuZGlzcGxheSA9ICd0YWJsZS1yb3cnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0VmlzU3RhdGUodmFsOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTbmF0Y2ggdmlzIHN0YXRlOicsIHRoaXMuX2lzVmlzaWJsZSwgJ1xcbnZhbDonLCB2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBHTV9zZXRWYWx1ZShgJHt0aGlzLl9zZXR0aW5ncy50aXRsZX1TdGF0ZWAsIGAke3ZhbH1gKTtcclxuICAgICAgICB0aGlzLl9pc1Zpc2libGUgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZWFyY2hMaXN0KCk6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9zZWFyY2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hsaXN0IGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VhcmNoTGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB2aXNpYmxlKHZhbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKHZhbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZW1lbWJlcnMgdGhlIHN0YXRlIG9mIFRvZ2dsZVNuYXRjaGVkIGJldHdlZW4gcGFnZSBsb2Fkc1xyXG4gKi9cclxuY2xhc3MgU3RpY2t5U25hdGNoZWRUb2dnbGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3N0aWNreVNuYXRjaGVkVG9nZ2xlJyxcclxuICAgICAgICBkZXNjOiBgTWFrZSB0b2dnbGUgc3RhdGUgcGVyc2lzdCBiZXR3ZWVuIHBhZ2UgbG9hZHNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gUmVtZW1iZXJlZCBzbmF0Y2ggdmlzaWJpbGl0eSBzdGF0ZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSBhIHBsYWludGV4dCBsaXN0IG9mIHNlYXJjaCByZXN1bHRzXHJcbiAqL1xyXG5jbGFzcyBQbGFpbnRleHRTZWFyY2ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFNlYXJjaCcsXHJcbiAgICAgICAgZGVzYzogYEluc2VydCBwbGFpbnRleHQgc2VhcmNoIHJlc3VsdHMgYXQgdG9wIG9mIHBhZ2VgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3IgaDEnO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICApO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcclxuICAgIHByaXZhdGUgX3BsYWluVGV4dDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgY29weUJ0bjogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50Pj47XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSB0b2dnbGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgJyNzc3InLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHJlc3VsdHMgaW50byBwbGFpbnRleHRcclxuICAgICAgICByZXN1bHRMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb3B5IGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgY29weUJ0biA9IGF3YWl0IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgICAgICdwbGFpbkNvcHknLFxyXG4gICAgICAgICAgICAgICAgICAgICdDb3B5IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyNtcF9wbGFpblRvZ2dsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICAnbXBfY29weSBtcF9wbGFpbkJ0bidcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgcGxhaW50ZXh0IGJveFxyXG4gICAgICAgICAgICAgICAgY29weUJ0bi5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgICAgICAgICBgPGJyPjx0ZXh0YXJlYSBjbGFzcz0nbXBfcGxhaW50ZXh0U2VhcmNoJyBzdHlsZT0nZGlzcGxheTogbm9uZSc+PC90ZXh0YXJlYT5gXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgIC8vIFNldCB1cCBhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihjb3B5QnRuLCB0aGlzLl9wbGFpblRleHQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9wbGFpbnRleHRTZWFyY2gnKSEuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdCA9IHRoaXMuX3NoYXJlLmdldFNlYXJjaExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh0aGlzLl9pc09wZW4pO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgdG9nZ2xlQnRuXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Ym94OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRib3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1Nob3cgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCBzZWFyY2ggcmVzdWx0cyEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXHJcbiAgICAgKiBAcGFyYW0gdmFsIHN0cmluZ2lmaWVkIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xyXG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxyXG4gICAgICAgIEdNX3NldFZhbHVlKCd0b2dnbGVTbmF0Y2hlZFN0YXRlJywgdmFsKTtcclxuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMoXHJcbiAgICAgICAgcmVzdWx0czogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGVhY2ggdGV4dCBmaWVsZFxyXG4gICAgICAgICAgICBsZXQgdGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgc2VyaWVzVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgYXV0aFRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IG5hcnJUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIC8vIEJyZWFrIG91dCB0aGUgaW1wb3J0YW50IGRhdGEgZnJvbSBlYWNoIG5vZGVcclxuICAgICAgICAgICAgY29uc3QgcmF3VGl0bGU6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvcignLnRvclRpdGxlJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcmllc0xpc3Q6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgICAgICA+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnLnNlcmllcycpO1xyXG4gICAgICAgICAgICBjb25zdCBhdXRoTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5hdXRob3InXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hcnJMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLm5hcnJhdG9yJ1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJhd1RpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIE5vZGU6Jywgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc3VsdCB0aXRsZSBzaG91bGQgbm90IGJlIG51bGxgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlID0gcmF3VGl0bGUudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBzZXJpZXNcclxuICAgICAgICAgICAgaWYgKHNlcmllc0xpc3QgIT09IG51bGwgJiYgc2VyaWVzTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNMaXN0LmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlICs9IGAke3Nlcmllcy50ZXh0Q29udGVudH0gLyBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgc2xhc2ggZnJvbSBsYXN0IHNlcmllcywgdGhlbiBzdHlsZVxyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBzZXJpZXNUaXRsZS5zdWJzdHJpbmcoMCwgc2VyaWVzVGl0bGUubGVuZ3RoIC0gMyk7XHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IGAgKCR7c2VyaWVzVGl0bGV9KWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBhdXRob3JzXHJcbiAgICAgICAgICAgIGlmIChhdXRoTGlzdCAhPT0gbnVsbCAmJiBhdXRoTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSAnQlkgJztcclxuICAgICAgICAgICAgICAgIGF1dGhMaXN0LmZvckVhY2goKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoVGl0bGUgKz0gYCR7YXV0aC50ZXh0Q29udGVudH0gQU5EIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9IGF1dGhUaXRsZS5zdWJzdHJpbmcoMCwgYXV0aFRpdGxlLmxlbmd0aCAtIDUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgbmFycmF0b3JzXHJcbiAgICAgICAgICAgIGlmIChuYXJyTGlzdCAhPT0gbnVsbCAmJiBuYXJyTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSAnRlQgJztcclxuICAgICAgICAgICAgICAgIG5hcnJMaXN0LmZvckVhY2goKG5hcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBuYXJyVGl0bGUgKz0gYCR7bmFyci50ZXh0Q29udGVudH0gQU5EIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBBTkRcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9IG5hcnJUaXRsZS5zdWJzdHJpbmcoMCwgbmFyclRpdGxlLmxlbmd0aCAtIDUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHAgKz0gYCR7dGl0bGV9JHtzZXJpZXNUaXRsZX0gJHthdXRoVGl0bGV9ICR7bmFyclRpdGxlfVxcbmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG91dHA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIHRoZSBzZWFyY2ggZmVhdHVyZXMgdG8gYmUgaGlkZGVuL3Nob3duXHJcbiAqL1xyXG5jbGFzcyBUb2dnbGVTZWFyY2hib3ggaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3RvZ2dsZVNlYXJjaGJveCcsXHJcbiAgICAgICAgZGVzYzogYENvbGxhcHNlIHRoZSBTZWFyY2ggYm94IGFuZCBtYWtlIGl0IHRvZ2dsZWFibGVgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JTZWFyY2hDb250cm9sJztcclxuICAgIHByaXZhdGUgX2hlaWdodDogc3RyaW5nID0gJzI2cHgnO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnID0gJ2ZhbHNlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHNlYXJjaGJveDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGlmIChzZWFyY2hib3gpIHtcclxuICAgICAgICAgICAgLy8gQWRqdXN0IHRoZSB0aXRsZSB0byBtYWtlIGl0IGNsZWFyIGl0IGlzIGEgdG9nZ2xlIGJ1dHRvblxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gc2VhcmNoYm94LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnLmJsb2NrSGVhZENvbiBoNCdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3QgdGV4dCAmIHN0eWxlXHJcbiAgICAgICAgICAgICAgICB0aXRsZS5pbm5lckhUTUwgPSAnVG9nZ2xlIFNlYXJjaCc7XHJcbiAgICAgICAgICAgICAgICB0aXRsZS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RvZ2dsZShzZWFyY2hib3ghKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IHNldCB1cCB0b2dnbGUhIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENvbGxhcHNlIHRoZSBzZWFyY2hib3hcclxuICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNlYXJjaGJveCwge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IGBoZWlnaHQ6JHt0aGlzLl9oZWlnaHR9O292ZXJmbG93OmhpZGRlbjtgLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gSGlkZSBleHRyYSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbjogSFRNTEhlYWRpbmdFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGd1aWRlTGluazogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcjbWFpbkJvZHkgPiBoMyB+IGEnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChub3RpZmljYXRpb24pIG5vdGlmaWNhdGlvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBpZiAoZ3VpZGVMaW5rKSBndWlkZUxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIENvbGxhcHNlZCB0aGUgU2VhcmNoIGJveCEnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgY29sbGFwc2UgU2VhcmNoIGJveCEgVGFyZ2V0IGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3RvZ2dsZShlbGVtOiBIVE1MRGl2RWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSAndW5zZXQnO1xyXG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSAndHJ1ZSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5oZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9ICdmYWxzZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ1RvZ2dsZWQgU2VhcmNoIGJveCEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlcyBsaW5rZWQgdGFncyBmcm9tIHRoZSBzaXRlJ3MgcGxhaW50ZXh0IHRhZyBmaWVsZFxyXG4gKi9cclxuY2xhc3MgQnVpbGRUYWdzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdidWlsZFRhZ3MnLFxyXG4gICAgICAgIGRlc2M6IGBHZW5lcmF0ZSBjbGlja2FibGUgVGFncyBhdXRvbWF0aWNhbGx5YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSB0YWdzXHJcbiAgICAgICAgcmVzdWx0c0xpc3RcclxuICAgICAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgocikgPT4gdGhpcy5fcHJvY2Vzc1RhZ1N0cmluZyhyKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0xpc3QudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgdGFncyBhZ2FpblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLmZvckVhY2goKHIpID0+IHRoaXMuX3Byb2Nlc3NUYWdTdHJpbmcocikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBCdWlsdCB0YWcgbGlua3MhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENvZGUgdG8gcnVuIGZvciBldmVyeSBzZWFyY2ggcmVzdWx0XHJcbiAgICAgKiBAcGFyYW0gcmVzIEEgc2VhcmNoIHJlc3VsdCByb3dcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcHJvY2Vzc1RhZ1N0cmluZyA9IChyZXM6IEhUTUxUYWJsZVJvd0VsZW1lbnQpID0+IHtcclxuICAgICAgICBjb25zdCB0YWdsaW5lID0gPEhUTUxTcGFuRWxlbWVudD5yZXMucXVlcnlTZWxlY3RvcignLnRvclJvd0Rlc2MnKTtcclxuXHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKHRhZ2xpbmUpO1xyXG5cclxuICAgICAgICAvLyBBc3N1bWUgYnJhY2tldHMgY29udGFpbiB0YWdzXHJcbiAgICAgICAgbGV0IHRhZ1N0cmluZyA9IHRhZ2xpbmUuaW5uZXJIVE1MLnJlcGxhY2UoLyg/OlxcW3xcXF18XFwofFxcKXwkKS9naSwgJywnKTtcclxuICAgICAgICAvLyBSZW1vdmUgSFRNTCBFbnRpdGllcyBhbmQgdHVybiB0aGVtIGludG8gYnJlYWtzXHJcbiAgICAgICAgdGFnU3RyaW5nID0gdGFnU3RyaW5nLnNwbGl0KC8oPzomLnsxLDV9OykvZykuam9pbignOycpO1xyXG4gICAgICAgIC8vIFNwbGl0IHRhZ3MgYXQgJywnIGFuZCAnOycgYW5kICc+JyBhbmQgJ3wnXHJcbiAgICAgICAgbGV0IHRhZ3MgPSB0YWdTdHJpbmcuc3BsaXQoL1xccyooPzo7fCx8PnxcXHx8JClcXHMqLyk7XHJcbiAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IG9yIGxvbmcgdGFnc1xyXG4gICAgICAgIHRhZ3MgPSB0YWdzLmZpbHRlcigodGFnKSA9PiB0YWcubGVuZ3RoIDw9IDMwICYmIHRhZy5sZW5ndGggPiAwKTtcclxuICAgICAgICAvLyBBcmUgdGFncyBhbHJlYWR5IGFkZGVkPyBPbmx5IGFkZCBpZiBudWxsXHJcbiAgICAgICAgY29uc3QgdGFnQm94OiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVzLnF1ZXJ5U2VsZWN0b3IoJy5tcF90YWdzJyk7XHJcbiAgICAgICAgaWYgKHRhZ0JveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbmplY3RMaW5rcyh0YWdzLCB0YWdsaW5lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0YWdzKTtcclxuICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEluamVjdHMgdGhlIGdlbmVyYXRlZCB0YWdzXHJcbiAgICAgKiBAcGFyYW0gdGFncyBBcnJheSBvZiB0YWdzIHRvIGFkZFxyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2VhcmNoIHJlc3VsdCByb3cgdGhhdCB0aGUgdGFncyB3aWxsIGJlIGFkZGVkIHRvXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2luamVjdExpbmtzID0gKHRhZ3M6IHN0cmluZ1tdLCB0YXI6IEhUTUxTcGFuRWxlbWVudCkgPT4ge1xyXG4gICAgICAgIGlmICh0YWdzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBuZXcgdGFnIHJvd1xyXG4gICAgICAgICAgICBjb25zdCB0YWdSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgICAgIHRhZ1Jvdy5jbGFzc0xpc3QuYWRkKCdtcF90YWdzJyk7XHJcbiAgICAgICAgICAgIHRhci5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWJlZ2luJywgdGFnUm93KTtcclxuICAgICAgICAgICAgdGFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRhZ1Jvdy5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgdGFncyB0byB0aGUgdGFnIHJvd1xyXG4gICAgICAgICAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFnUm93LmlubmVySFRNTCArPSBgPGEgY2xhc3M9J21wX3RhZycgaHJlZj0nL3Rvci9icm93c2UucGhwP3RvciU1QnRleHQlNUQ9JTIyJHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgdGFnXHJcbiAgICAgICAgICAgICAgICApfSUyMiZ0b3IlNUJzcmNoSW4lNUQlNUJ0YWdzJTVEPXRydWUnPiR7dGFnfTwvYT5gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJhbmRvbSBCb29rIGZlYXR1cmUgdG8gb3BlbiBhIG5ldyB0YWIvd2luZG93IHdpdGggYSByYW5kb20gTUFNIEJvb2tcclxuICovXHJcbmNsYXNzIFJhbmRvbUJvb2sgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TZWFyY2gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JhbmRvbUJvb2snLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBidXR0b24gdG8gb3BlbiBhIHJhbmRvbWx5IHNlbGVjdGVkIGJvb2sgcGFnZS4gKDxlbT5Vc2VzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgY2F0ZWdvcnkgaW4gdGhlIGRyb3Bkb3duPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxldCByYW5kbzogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgY29uc3QgcmFuZG9UZXh0OiBzdHJpbmcgPSAnUmFuZG9tIEJvb2snO1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAocmFuZG8gPSBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICdyYW5kb21Cb29rJyxcclxuICAgICAgICAgICAgICAgIHJhbmRvVGV4dCxcclxuICAgICAgICAgICAgICAgICdoMScsXHJcbiAgICAgICAgICAgICAgICAnI3Jlc2V0TmV3SWNvbicsXHJcbiAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgJ3RvckZvcm1CdXR0b24nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICByYW5kb1xyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvdW50UmVzdWx0OiBQcm9taXNlPG51bWJlcj47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yaWVzOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIENhdGVnb3J5IGRyb3Bkb3duIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0U2VsZWN0aW9uOiBIVE1MU2VsZWN0RWxlbWVudCA9IDxIVE1MU2VsZWN0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0ZWdvcnlQYXJ0aWFsJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHZhbHVlIGN1cnJlbnRseSBzZWxlY3RlZCBpbiBDYXRlZ29yeSBEcm9wZG93blxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRWYWx1ZTogc3RyaW5nID0gY2F0U2VsZWN0aW9uIS5vcHRpb25zW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0U2VsZWN0aW9uLnNlbGVjdGVkSW5kZXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kZXBlbmRpbmcgb24gY2F0ZWdvcnkgc2VsZWN0ZWQsIGNyZWF0ZSBhIGNhdGVnb3J5IHN0cmluZyBmb3IgdGhlIEpTT04gR0VUXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoU3RyaW5nKGNhdFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQUxMJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdkZWZhdWx0cyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTEzJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE1JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbTE2JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gJyZ0b3JbbWFpbl9jYXRdW109MTYnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0VmFsdWUuY2hhckF0KDApID09PSAnYycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW2NhdF1bXT0nICsgY2F0VmFsdWUuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY291bnRSZXN1bHQgPSB0aGlzLl9nZXRSYW5kb21Cb29rUmVzdWx0cyhjYXRlZ29yaWVzKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudFJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGdldFJhbmRvbVJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vb3BlbiBuZXcgdGFiIHdpdGggdGhlIHJhbmRvbSBib29rXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3QvJyArIGdldFJhbmRvbVJlc3VsdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ19ibGFuaydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIFJhbmRvbSBCb29rIGJ1dHRvbiEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbHRlcnMgc2VhcmNoIHJlc3VsdHNcclxuICAgICAqIEBwYXJhbSBjYXQgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgY2F0ZWdvcmllcyBuZWVkZWQgZm9yIEpTT04gR2V0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX2dldFJhbmRvbUJvb2tSZXN1bHRzKGNhdDogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQganNvblJlc3VsdDogUHJvbWlzZTxzdHJpbmc+O1xyXG4gICAgICAgICAgICAvL1VSTCB0byBHRVQgcmFuZG9tIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L3Rvci9qcy9sb2FkU2VhcmNoSlNPTmJhc2ljLnBocD90b3Jbc2VhcmNoVHlwZV09YWxsJnRvcltzZWFyY2hJbl09dG9ycmVudHMke2NhdH0mdG9yW3BlcnBhZ2VdPTUmdG9yW2Jyb3dzZUZsYWdzSGlkZVZzU2hvd109MCZ0b3Jbc3RhcnREYXRlXT0mdG9yW2VuZERhdGVdPSZ0b3JbaGFzaF09JnRvcltzb3J0VHlwZV09cmFuZG9tJnRodW1ibmFpbD10cnVlPyR7VXRpbC5yYW5kb21OdW1iZXIoXHJcbiAgICAgICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICAgICAgMTAwMDAwXHJcbiAgICAgICAgICAgICl9YDtcclxuICAgICAgICAgICAgUHJvbWlzZS5hbGwoWyhqc29uUmVzdWx0ID0gVXRpbC5nZXRKU09OKHVybCkpXSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBqc29uUmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGpzb25GdWxsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmV0dXJuIHRoZSBmaXJzdCB0b3JyZW50IElEIG9mIHRoZSByYW5kb20gSlNPTiB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShqc29uRnVsbCkuZGF0YVswXS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBBbGxvd3MgZ2lmdGluZyBvZiBGTCB3ZWRnZSB0byBtZW1iZXJzIHRocm91Z2ggZm9ydW0uXHJcbiAqL1xyXG5jbGFzcyBGb3J1bUZMR2lmdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuRm9ydW0sXHJcbiAgICAgICAgdGl0bGU6ICdmb3J1bUZMR2lmdCcsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIFRoYW5rIGJ1dHRvbiB0byBmb3J1bSBwb3N0cy4gKDxlbT5TZW5kcyBhIEZMIHdlZGdlPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuZm9ydW1MaW5rJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2ZvcnVtIHRocmVhZCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxpbmcgRm9ydW0gR2lmdCBCdXR0b24uLi4nKTtcclxuICAgICAgICAvL21haW5Cb2R5IGlzIGJlc3QgZWxlbWVudCB3aXRoIGFuIElEIEkgY291bGQgZmluZCB0aGF0IGlzIGEgcGFyZW50IHRvIGFsbCBmb3J1bSBwb3N0c1xyXG4gICAgICAgIGNvbnN0IG1haW5Cb2R5ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xyXG4gICAgICAgIC8vbWFrZSBhcnJheSBvZiBmb3J1bSBwb3N0cyAtIHRoZXJlIGlzIG9ubHkgb25lIGN1cnNvciBjbGFzc2VkIG9iamVjdCBwZXIgZm9ydW0gcG9zdCwgc28gdGhpcyB3YXMgYmVzdCB0byBrZXkgb2ZmIG9mLiB3aXNoIHRoZXJlIHdlcmUgbW9yZSBJRHMgYW5kIHN1Y2ggdXNlZCBpbiBmb3J1bXNcclxuICAgICAgICBjb25zdCBmb3J1bVBvc3RzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXHJcbiAgICAgICAgICAgIG1haW5Cb2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2NvbHRhYmxlJylcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vZm9yIGVhY2ggcG9zdCBvbiB0aGUgcGFnZVxyXG4gICAgICAgIGZvcnVtUG9zdHMuZm9yRWFjaCgoZm9ydW1Qb3N0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vd29yayBvdXIgd2F5IGRvd24gdGhlIHN0cnVjdHVyZSBvZiB0aGUgSFRNTCB0byBnZXQgdG8gb3VyIHBvc3RcclxuICAgICAgICAgICAgbGV0IGJvdHRvbVJvdyA9IGZvcnVtUG9zdC5jaGlsZE5vZGVzWzFdO1xyXG4gICAgICAgICAgICBib3R0b21Sb3cgPSBib3R0b21Sb3cuY2hpbGROb2Rlc1s0XTtcclxuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbM107XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBJRCBvZiB0aGUgZm9ydW0gZnJvbSB0aGUgY3VzdG9tIE1BTSBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgbGV0IHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+Zm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAvL21hbSBkZWNpZGVkIHRvIGhhdmUgYSBkaWZmZXJlbnQgc3RydWN0dXJlIGZvciBsYXN0IGZvcnVtLiB3aXNoIHRoZXkganVzdCBoYWQgSURzIG9yIHNvbWV0aGluZyBpbnN0ZWFkIG9mIGFsbCB0aGlzIGp1bXBpbmcgYXJvdW5kXHJcbiAgICAgICAgICAgIGlmIChwb3N0SUQgPT09ICdsYXN0Jykge1xyXG4gICAgICAgICAgICAgICAgcG9zdElEID0gKDxIVE1MRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ydW1Qb3N0LnByZXZpb3VzU2libGluZyEucHJldmlvdXNTaWJsaW5nIVxyXG4gICAgICAgICAgICAgICAgKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgZWxlbWVudCBmb3Igb3VyIGZlYXR1cmVcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgIC8vc2V0IHNhbWUgY2xhc3MgYXMgb3RoZXIgb2JqZWN0cyBpbiBhcmVhIGZvciBzYW1lIHBvaW50ZXIgYW5kIGZvcm1hdHRpbmcgb3B0aW9uc1xyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2N1cnNvcicpO1xyXG4gICAgICAgICAgICAvL2dpdmUgb3VyIGVsZW1lbnQgYW4gSUQgZm9yIGZ1dHVyZSBzZWxlY3Rpb24gYXMgbmVlZGVkXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfJyArIHBvc3RJRCArICdfdGV4dCcpO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBuZXcgaW1nIGVsZW1lbnQgdG8gbGVhZCBvdXIgbmV3IGZlYXR1cmUgdmlzdWFsc1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0SWNvbkdpZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAvL3VzZSBzaXRlIGZyZWVsZWVjaCBnaWYgaWNvbiBmb3Igb3VyIGZlYXR1cmVcclxuICAgICAgICAgICAgZ2lmdEljb25HaWYuc2V0QXR0cmlidXRlKFxyXG4gICAgICAgICAgICAgICAgJ3NyYycsXHJcbiAgICAgICAgICAgICAgICAnaHR0cHM6Ly9jZG4ubXlhbm9uYW1vdXNlLm5ldC9pbWFnZWJ1Y2tldC8xMDgzMDMvdGhhbmsuZ2lmJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAvL21ha2UgdGhlIGdpZiBpY29uIHRoZSBmaXJzdCBjaGlsZCBvZiBlbGVtZW50XHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKGdpZnRJY29uR2lmKTtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgZWxlbWVudCBpbiBsaW5lIHdpdGggdGhlIGN1cnNvciBvYmplY3Qgd2hpY2ggaXMgdGhlIHF1b3RlIGFuZCByZXBvcnQgYnV0dG9ucyBhdCBib3R0b21cclxuICAgICAgICAgICAgYm90dG9tUm93LmFwcGVuZENoaWxkKGdpZnRFbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIC8vbWFrZSBpdCBhIGJ1dHRvbiB2aWEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90byBhdm9pZCBidXR0b24gdHJpZ2dlcmluZyBtb3JlIHRoYW4gb25jZSBwZXIgcGFnZSBsb2FkLCBjaGVjayBpZiBhbHJlYWR5IGhhdmUganNvbiByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2lmdEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2R1ZSB0byBsYWNrIG9mIElEcyBhbmQgY29uZmxpY3RpbmcgcXVlcnkgc2VsZWN0YWJsZSBlbGVtZW50cywgbmVlZCB0byBqdW1wIHVwIGEgZmV3IHBhcmVudCBsZXZlbHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFBhcmVudE5vZGUgPSBnaWZ0RWxlbWVudC5wYXJlbnRFbGVtZW50IS5wYXJlbnRFbGVtZW50IVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudEVsZW1lbnQhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL29uY2UgYXQgcGFyZW50IG5vZGUgb2YgdGhlIHBvc3QsIGZpbmQgdGhlIHBvc3RlcidzIHVzZXIgaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlckVsZW0gPSBwb3N0UGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKGBhW2hyZWZePVwiL3UvXCJdYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBVUkwgb2YgdGhlIHBvc3QgdG8gYWRkIHRvIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zdFVSTCA9ICg8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi9mL3QvXCJdYCkhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBNQU0gdXNlciBzZW5kaW5nIGdpZnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlbmRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTWVudScpIS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY2xlYW4gdXAgdGV4dCBvZiBzZW5kZXIgb2JqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRlciA9IHNlbmRlci5zdWJzdHJpbmcoMCwgc2VuZGVyLmluZGV4T2YoJyAnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB0aXRsZSBvZiB0aGUgcGFnZSBzbyB3ZSBjYW4gd3JpdGUgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZm9ydW1UaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2N1dCBkb3duIGZsdWZmIGZyb20gcGFnZSB0aXRsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlID0gZm9ydW1UaXRsZS5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcnVtVGl0bGUuaW5kZXhPZignfCcpIC0gMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgbWVtYmVycyBuYW1lIGZvciBKU09OIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZSA9ICg8SFRNTEVsZW1lbnQ+dXNlckVsZW0hKS5pbm5lclRleHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1VSTCB0byBHRVQgYSBnaWZ0IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPXNlbmRXZWRnZSZnaWZ0VG89JHt1c2VyTmFtZX0mbWVzc2FnZT0ke3NlbmRlcn0gd2FudHMgdG8gdGhhbmsgeW91IGZvciB5b3VyIGNvbnRyaWJ1dGlvbiB0byB0aGUgZm9ydW0gdG9waWMgW3VybD1odHRwczovL215YW5vbmFtb3VzZS5uZXQke3Bvc3RVUkx9XSR7Zm9ydW1UaXRsZX1bL3VybF1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL21ha2UgIyBVUkkgY29tcGF0aWJsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgnIycsICclMjMnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy91c2UgTUFNKyBqc29uIGdldCB1dGlsaXR5IHRvIHByb2Nlc3MgVVJMIGFuZCByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uUmVzdWx0OiBzdHJpbmcgPSBhd2FpdCBVdGlsLmdldEpTT04odXJsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZygnR2lmdCBSZXN1bHQnLCBqc29uUmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBnaWZ0IHdhcyBzdWNjZXNzZnVsbHkgc2VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5wYXJzZShqc29uUmVzdWx0KS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0aGUgZmVhdHVyZSB0ZXh0IHRvIHNob3cgc3VjY2Vzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgU3VjY2Vzc2Z1bCEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYmFzZWQgb24gZmFpbHVyZSwgYWRkIGZlYXR1cmUgdGV4dCB0byBzaG93IGZhaWx1cmUgcmVhc29uIG9yIGdlbmVyaWNcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWW91IGNhbiBvbmx5IHNlbmQgYSB1c2VyIG9uZSB3ZWRnZSBwZXIgZGF5LidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0ZhaWxlZDogQWxyZWFkeSBHaWZ0ZWQgVGhpcyBVc2VyIFRvZGF5ISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShqc29uUmVzdWx0KS5lcnJvciA9PT1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbnZhbGlkIHVzZXIsIHRoaXMgdXNlciBpcyBub3QgY3VycmVudGx5IGFjY2VwdGluZyB3ZWRnZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IFRoaXMgVXNlciBEb2VzIE5vdCBBY2NlcHQgR2lmdHMhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29ubHkga25vd24gZXhhbXBsZSBvZiB0aGlzICdvdGhlcicgaXMgd2hlbiBnaWZ0aW5nIHlvdXJzZWxmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRkwgR2lmdCBGYWlsZWQhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqICMjIyBBZGRzIGFiaWxpdHkgdG8gZ2lmdCBuZXdlc3QgMTAgbWVtYmVycyB0byBNQU0gb24gSG9tZXBhZ2Ugb3Igb3BlbiB0aGVpciB1c2VyIHBhZ2VzXHJcbiAqL1xyXG5jbGFzcyBHaWZ0TmV3ZXN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZ2lmdE5ld2VzdCcsXHJcbiAgICAgICAgZGVzYzogYEFkZCBidXR0b25zIHRvIEdpZnQvT3BlbiBhbGwgbmV3ZXN0IG1lbWJlcnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNmcE5NJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvL2Vuc3VyZSBnaWZ0ZWQgbGlzdCBpcyB1bmRlciA1MCBtZW1iZXIgbmFtZXMgbG9uZ1xyXG4gICAgICAgIHRoaXMuX3RyaW1HaWZ0TGlzdCgpO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBGcm9udFBhZ2UgTmV3TWVtYmVycyBlbGVtZW50IGNvbnRhaW5pbmcgbmV3ZXN0IDEwIG1lbWJlcnNcclxuICAgICAgICBjb25zdCBmcE5NID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zdCBtZW1iZXJzOiBIVE1MQW5jaG9yRWxlbWVudFtdID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoXHJcbiAgICAgICAgICAgIGZwTk0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgbGFzdE1lbSA9IG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICBtZW1iZXJzLmZvckVhY2goKG1lbWJlcikgPT4ge1xyXG4gICAgICAgICAgICAvL2FkZCBhIGNsYXNzIHRvIHRoZSBleGlzdGluZyBlbGVtZW50IGZvciB1c2UgaW4gcmVmZXJlbmNlIGluIGNyZWF0aW5nIGJ1dHRvbnNcclxuICAgICAgICAgICAgbWVtYmVyLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBgbXBfcmVmUG9pbnRfJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfWApO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSBtZW1iZXIgaGFzIGJlZW4gZ2lmdGVkIHRocm91Z2ggdGhpcyBmZWF0dXJlIHByZXZpb3VzbHlcclxuICAgICAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9sYXN0TmV3R2lmdGVkJykuaW5kZXhPZihVdGlsLmVuZE9mSHJlZihtZW1iZXIpKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL2FkZCBjaGVja2VkIGJveCB0byB0ZXh0XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuaW5uZXJUZXh0ID0gYCR7bWVtYmVyLmlubmVyVGV4dH0gXFx1MjYxMWA7XHJcbiAgICAgICAgICAgICAgICBtZW1iZXIuY2xhc3NMaXN0LmFkZCgnbXBfZ2lmdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2dldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBnaWZ0cyBzZXQgaW4gcHJlZmVyZW5jZXMgZm9yIHVzZXIgcGFnZVxyXG4gICAgICAgIGxldCBnaWZ0VmFsdWVTZXR0aW5nOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgndXNlckdpZnREZWZhdWx0X3ZhbCcpO1xyXG4gICAgICAgIC8vbWFrZSBzdXJlIHRoZSB2YWx1ZSBmYWxscyB3aXRoaW4gdGhlIGFjY2VwdGFibGUgcmFuZ2VcclxuICAgICAgICAvLyBUT0RPOiBNYWtlIHRoZSBnaWZ0IHZhbHVlIGNoZWNrIGludG8gYSBVdGlsXHJcbiAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA+IDEwMCB8fCBpc05hTihOdW1iZXIoZ2lmdFZhbHVlU2V0dGluZykpKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcclxuICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICc1JztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIHRleHQgaW5wdXQgZm9yIGhvdyBtYW55IHBvaW50cyB0byBnaXZlXHJcbiAgICAgICAgY29uc3QgZ2lmdEFtb3VudHM6IEhUTUxJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIFV0aWwuc2V0QXR0cihnaWZ0QW1vdW50cywge1xyXG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgIHNpemU6ICczJyxcclxuICAgICAgICAgICAgaWQ6ICdtcF9naWZ0QW1vdW50cycsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnVmFsdWUgYmV0d2VlbiA1IGFuZCAxMDAnLFxyXG4gICAgICAgICAgICB2YWx1ZTogZ2lmdFZhbHVlU2V0dGluZyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2luc2VydCB0aGUgdGV4dCBib3ggYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lXHJcbiAgICAgICAgbGFzdE1lbS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZ2lmdEFtb3VudHMpO1xyXG5cclxuICAgICAgICAvL21ha2UgdGhlIGJ1dHRvbiBhbmQgaW5zZXJ0IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZSAoYmVmb3JlIHRoZSBpbnB1dCB0ZXh0KVxyXG4gICAgICAgIGNvbnN0IGdpZnRBbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ2dpZnRBbGwnLFxyXG4gICAgICAgICAgICAnR2lmdCBBbGw6ICcsXHJcbiAgICAgICAgICAgICdidXR0b24nLFxyXG4gICAgICAgICAgICBgLm1wX3JlZlBvaW50XyR7VXRpbC5lbmRPZkhyZWYobGFzdE1lbSl9YCxcclxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgJ21wX2J0bidcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vYWRkIGEgc3BhY2UgYmV0d2VlbiBidXR0b24gYW5kIHRleHRcclxuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblJpZ2h0ID0gJzVweCc7XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5Ub3AgPSAnNXB4JztcclxuXHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RDYWxsOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgdGV4dCB0byBzaG93IHByb2Nlc3NpbmdcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2VuZGluZyBHaWZ0cy4uLiBQbGVhc2UgV2FpdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB1c2VyIGhhcyBub3QgYmVlbiBnaWZ0ZWRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBtZW1iZXJzIG5hbWUgZm9yIEpTT04gc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gbWVtYmVyLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHBvaW50cyBhbW91bnQgZnJvbSB0aGUgaW5wdXQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRGaW5hbEFtb3VudCA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEZpbmFsQW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3dhaXQgMyBzZWNvbmRzIGJldHdlZW4gSlNPTiBjYWxsc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RDYWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXF1ZXN0IHNlbmRpbmcgcG9pbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGdpZnQgd2FzIHN1Y2Nlc3NmdWxseSBzZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgb2ZmIGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCA9IGAke21lbWJlci5pbm5lclRleHR9IFxcdTI2MTFgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgbWVtYmVyIHRvIHRoZSBzdG9yZWQgbWVtYmVyIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtcF9sYXN0TmV3R2lmdGVkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfSwke0dNX2dldFZhbHVlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbXBfbGFzdE5ld0dpZnRlZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIUpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b24gYWZ0ZXIgc2VuZFxyXG4gICAgICAgICAgICAgICAgKGdpZnRBbGxCdG4gYXMgSFRNTElucHV0RWxlbWVudCkuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cclxuICAgICAgICAgICAgICAgICAgICAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL25ld2xpbmUgYmV0d2VlbiBlbGVtZW50c1xyXG4gICAgICAgIG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXS5hZnRlcihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICAvL2xpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgaW5wdXQgYm94IGFuZCBlbnN1cmUgaXRzIGJldHdlZW4gNSBhbmQgMTAwMCwgaWYgbm90IGRpc2FibGUgYnV0dG9uXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcclxuICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcclxuICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuc2V0QXR0cmlidXRlKCd0aXRsZScsICdEaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYEdpZnQgQWxsICR7dmFsdWVUb051bWJlcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vYWRkIGEgYnV0dG9uIHRvIG9wZW4gYWxsIHVuZ2lmdGVkIG1lbWJlcnMgaW4gbmV3IHRhYnNcclxuICAgICAgICBjb25zdCBvcGVuQWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICdvcGVuVGFicycsXHJcbiAgICAgICAgICAgICdPcGVuIFVuZ2lmdGVkIEluIFRhYnMnLFxyXG4gICAgICAgICAgICAnYnV0dG9uJyxcclxuICAgICAgICAgICAgJ1tpZD1tcF9naWZ0QW1vdW50c10nLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAnbXBfYnRuJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG9wZW5BbGxCdG4uc2V0QXR0cmlidXRlKCd0aXRsZScsICdPcGVuIG5ldyB0YWIgZm9yIGVhY2gnKTtcclxuICAgICAgICBvcGVuQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKG1lbWJlci5ocmVmLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIGJvbnVzIHBvaW50cyBhdmFpbGFibGUgdG8gc3BlbmRcclxuICAgICAgICBsZXQgYm9udXNQb2ludHNBdmFpbDogc3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vZ2V0IHJpZCBvZiB0aGUgZGVsdGEgZGlzcGxheVxyXG4gICAgICAgIGlmIChib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGJvbnVzUG9pbnRzQXZhaWwgPSBib251c1BvaW50c0F2YWlsLnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICBib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3JlY3JlYXRlIHRoZSBib251cyBwb2ludHMgaW4gbmV3IHNwYW4gYW5kIGluc2VydCBpbnRvIGZwTk1cclxuICAgICAgICBjb25zdCBtZXNzYWdlU3BhbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0QWxsTXNnJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gJ0F2YWlsYWJsZSAnICsgYm9udXNQb2ludHNBdmFpbDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWZ0ZXIobWVzc2FnZVNwYW4pO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmFmdGVyKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIVxyXG4gICAgICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsICc8YnI+Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIGdpZnQgbmV3IG1lbWJlcnMgYnV0dG9uIHRvIEhvbWUgcGFnZS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBUcmltcyB0aGUgZ2lmdGVkIGxpc3QgdG8gbGFzdCA1MCBuYW1lcyB0byBhdm9pZCBnZXR0aW5nIHRvbyBsYXJnZSBvdmVyIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3RyaW1HaWZ0TGlzdCgpIHtcclxuICAgICAgICAvL2lmIHZhbHVlIGV4aXN0cyBpbiBHTVxyXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgIC8vR00gdmFsdWUgaXMgYSBjb21tYSBkZWxpbSB2YWx1ZSwgc3BsaXQgdmFsdWUgaW50byBhcnJheSBvZiBuYW1lc1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0TmFtZXMgPSBHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIGxldCBuZXdHaWZ0TmFtZXM6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoZ2lmdE5hbWVzLmxlbmd0aCA+IDUwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGdpZnROYW1lIG9mIGdpZnROYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0TmFtZXMuaW5kZXhPZihnaWZ0TmFtZSkgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZWJ1aWxkIGEgY29tbWEgZGVsaW0gc3RyaW5nIG91dCBvZiB0aGUgZmlyc3QgNDkgbmFtZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3R2lmdE5hbWVzID0gbmV3R2lmdE5hbWVzICsgZ2lmdE5hbWUgKyAnLCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IG5ldyBzdHJpbmcgaW4gR01cclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnLCBuZXdHaWZ0TmFtZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vc2V0IHZhbHVlIGlmIGRvZXNudCBleGlzdFxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsICcnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBoaWRlIG5ld3MgaXRlbXMgb24gdGhlIHBhZ2VcclxuICovXHJcbmNsYXNzIEhpZGVOZXdzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcclxuICAgICAgICB0aXRsZTogJ2hpZGVOZXdzJyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIGRlc2M6ICdUaWR5IHRoZSBob21lcGFnZSBhbmQgYWxsb3cgTmV3cyB0byBiZSBoaWRkZW4nLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5tYWluUGFnZU5ld3NIZWFkJztcclxuICAgIHByaXZhdGUgX3ZhbHVlVGl0bGU6IHN0cmluZyA9IGBtcF8ke3RoaXMuX3NldHRpbmdzLnRpdGxlfV92YWxgO1xyXG4gICAgcHJpdmF0ZSBfaWNvbiA9ICdcXHUyNzRlJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIE5PVEU6IGZvciBkZXZlbG9wbWVudFxyXG4gICAgICAgIC8vIEdNX2RlbGV0ZVZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO2NvbnNvbGUud2FybihgVmFsdWUgb2YgJHt0aGlzLl92YWx1ZVRpdGxlfSB3aWxsIGJlIGRlbGV0ZWQhYCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX2NoZWNrRm9yU2VlbigpO1xyXG4gICAgICAgIHRoaXMuX2FkZEhpZGVyQnV0dG9uKCk7XHJcbiAgICAgICAgLy8gdGhpcy5fY2xlYW5WYWx1ZXMoKTsgLy8gRklYOiBOb3Qgd29ya2luZyBhcyBpbnRlbmRlZFxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDbGVhbmVkIHVwIHRoZSBob21lIHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgX2NoZWNrRm9yU2VlbiA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgICAgICBjb25zdCBwcmV2VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xyXG4gICAgICAgIGNvbnN0IG5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHRoaXMuX3ZhbHVlVGl0bGUsICc6XFxuJywgcHJldlZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKHByZXZWYWx1ZSAmJiBuZXdzKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgaWNvbiB0byBzcGxpdCBvdXQgdGhlIGtub3duIGhpZGRlbiBtZXNzYWdlc1xyXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5BcnJheSA9IHByZXZWYWx1ZS5zcGxpdCh0aGlzLl9pY29uKTtcclxuICAgICAgICAgICAgLyogSWYgYW55IG9mIHRoZSBoaWRkZW4gbWVzc2FnZXMgbWF0Y2ggYSBjdXJyZW50IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHJlbW92ZSB0aGUgY3VycmVudCBtZXNzYWdlIGZyb20gdGhlIERPTSAqL1xyXG4gICAgICAgICAgICBoaWRkZW5BcnJheS5mb3JFYWNoKChoaWRkZW4pID0+IHtcclxuICAgICAgICAgICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkudGV4dENvbnRlbnQgPT09IGhpZGRlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBjdXJyZW50IG1lc3NhZ2VzLCBoaWRlIHRoZSBoZWFkZXJcclxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpblBhZ2VOZXdzU3ViJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfcmVtb3ZlQ2xvY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2xvY2s6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSAuZnBUaW1lJyk7XHJcbiAgICAgICAgaWYgKGNsb2NrKSBjbG9jay5yZW1vdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgX2FkanVzdEhlYWRlclNpemUgPSAoc2VsZWN0b3I6IHN0cmluZywgdmlzaWJsZT86IGJvb2xlYW4pID0+IHtcclxuICAgICAgICBjb25zdCBuZXdzSGVhZGVyOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgaWYgKG5ld3NIZWFkZXIpIHtcclxuICAgICAgICAgICAgaWYgKHZpc2libGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmZvbnRTaXplID0gJzJlbSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9hZGRIaWRlckJ1dHRvbiA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcbiAgICAgICAgaWYgKCFuZXdzKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIG5ld3MgZW50cnlcclxuICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIGJ1dHRvblxyXG4gICAgICAgICAgICBjb25zdCB4YnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIHhidXR0b24udGV4dENvbnRlbnQgPSB0aGlzLl9pY29uO1xyXG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoeGJ1dHRvbiwge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OmlubGluZS1ibG9jazttYXJnaW4tcmlnaHQ6MC43ZW07Y3Vyc29yOnBvaW50ZXI7JyxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiAnbXBfY2xlYXJCdG4nLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGlja3NcclxuICAgICAgICAgICAgeGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gY2xpY2tlZCwgYXBwZW5kIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IG5ld3MgcG9zdCB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGxpc3Qgb2YgcmVtZW1iZXJlZCBuZXdzIGl0ZW1zXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1ZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKVxyXG4gICAgICAgICAgICAgICAgICAgID8gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcclxuICAgICAgICAgICAgICAgICAgICA6ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIaWRpbmcuLi4gJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSwgYCR7cHJldmlvdXNWYWx1ZX0ke2VudHJ5LnRleHRDb250ZW50fWApO1xyXG4gICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbW9yZSBuZXdzIGl0ZW1zLCByZW1vdmUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZE5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlZE5ld3MgJiYgdXBkYXRlZE5ld3MubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBidXR0b24gYXMgdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBlbnRyeVxyXG4gICAgICAgICAgICBpZiAoZW50cnkuZmlyc3RDaGlsZCkgZW50cnkuZmlyc3RDaGlsZC5iZWZvcmUoeGJ1dHRvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIF9jbGVhblZhbHVlcyA9IChudW0gPSAzKSA9PiB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBHTV9nZXRWYWx1ZSgke3RoaXMuX3ZhbHVlVGl0bGV9KWAsIHZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBsYXN0IDMgc3RvcmVkIGl0ZW1zIGFmdGVyIHNwbGl0dGluZyB0aGVtIGF0IHRoZSBpY29uXHJcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5hcnJheVRvU3RyaW5nKHZhbHVlLnNwbGl0KHRoaXMuX2ljb24pLnNsaWNlKDAgLSBudW0pKTtcclxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIG5ldyB2YWx1ZVxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfZ2V0TmV3c0l0ZW1zID0gKCk6IE5vZGVMaXN0T2Y8SFRNTERpdkVsZW1lbnQ+IHwgbnVsbCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2RpdltjbGFzc149XCJtYWluUGFnZU5ld3NcIl0nKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8qKlxyXG4gKiAjIFJFUVVFU1QgUEFHRSBGRUFUVVJFU1xyXG4gKi9cclxuLyoqXHJcbiAqICogSGlkZSByZXF1ZXN0ZXJzIHdobyBhcmUgc2V0IHRvIFwiaGlkZGVuXCJcclxuICovXHJcbmNsYXNzIFRvZ2dsZUhpZGRlblJlcXVlc3RlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9nZ2xlSGlkZGVuUmVxdWVzdGVycycsXHJcbiAgICAgICAgZGVzYzogYEhpZGUgaGlkZGVuIHJlcXVlc3RlcnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JSb3dzJztcclxuICAgIHByaXZhdGUgX3NlYXJjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gfCB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIF9oaWRlID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0aGlzLl9hZGRUb2dnbGVTd2l0Y2goKTtcclxuICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gYXdhaXQgdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xyXG5cclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIodGhpcy5fdGFyLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHRoaXMuX3NlYXJjaExpc3QpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2FkZFRvZ2dsZVN3aXRjaCgpIHtcclxuICAgICAgICAvLyBNYWtlIGEgbmV3IGJ1dHRvbiBhbmQgaW5zZXJ0IGJlc2lkZSB0aGUgU2VhcmNoIGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAnc2hvd0hpZGRlbicsXHJcbiAgICAgICAgICAgICdTaG93IEhpZGRlbicsXHJcbiAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAnI3JlcXVlc3RTZWFyY2ggLnRvcnJlbnRTZWFyY2gnLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAndG9yRm9ybUJ1dHRvbidcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgbmV3IGJ1dHRvbiBhbmQgYWRkIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICBjb25zdCB0b2dnbGVTd2l0Y2g6IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3Nob3dIaWRkZW4nKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdG9nZ2xlU3dpdGNoLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5MaXN0OiBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcjdG9yUm93cyA+IC5tcF9oaWRkZW4nXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faGlkZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdG9nZ2xlU3dpdGNoLmlubmVyVGV4dCA9ICdIaWRlIEhpZGRlbic7XHJcbiAgICAgICAgICAgICAgICBoaWRkZW5MaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbGlzdC1pdGVtJztcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMC41JztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ1Nob3cgSGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGhpZGRlbkxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlLm9wYWNpdHkgPSAnMCc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0KCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXF1ZXN0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyAudG9yUmlnaHQnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEdyYWIgYWxsIHJlcXVlc3RzXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXFMaXN0OlxyXG4gICAgICAgICAgICAgICAgICAgIHwgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PlxyXG4gICAgICAgICAgICAgICAgICAgIHwgbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHwgdW5kZWZpbmVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICAgICAnI3RvclJvd3MgLnRvclJvdydcclxuICAgICAgICAgICAgICAgICkgYXMgTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmVxTGlzdCA9PT0gbnVsbCB8fCByZXFMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHJlcUxpc3QgaXMgJHtyZXFMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcUxpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9maWx0ZXJSZXN1bHRzKGxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pIHtcclxuICAgICAgICBsaXN0LmZvckVhY2goKHJlcXVlc3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdGVyOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSByZXF1ZXN0LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnLnRvclJpZ2h0IGEnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0ZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3Quc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIHJlcXVlc3QuY2xhc3NMaXN0LmFkZCgnbXBfaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlIGEgcGxhaW50ZXh0IGxpc3Qgb2YgcmVxdWVzdCByZXN1bHRzXHJcbiAqL1xyXG5jbGFzcyBQbGFpbnRleHRSZXF1ZXN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3BsYWludGV4dFJlcXVlc3QnLFxyXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyBhdCB0b3Agb2YgcmVxdWVzdCBwYWdlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxyXG4gICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxyXG4gICAgKTtcclxuICAgIHByaXZhdGUgX3BsYWluVGV4dDogc3RyaW5nID0gJyc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydyZXF1ZXN0J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgbGV0IGNvcHlCdG46IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+O1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgdG9nZ2xlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICdTaG93IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICcjc3NyJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVzdWx0cyBpbnRvIHBsYWludGV4dFxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIGNvcHkgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAgICAgJ3BsYWluQ29weScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvcHkgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAnI21wX3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdtcF9jb3B5IG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBwbGFpbnRleHQgYm94XHJcbiAgICAgICAgICAgICAgICBjb3B5QnRuLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGA8YnI+PHRleHRhcmVhIGNsYXNzPSdtcF9wbGFpbnRleHRTZWFyY2gnIHN0eWxlPSdkaXNwbGF5OiBub25lJz48L3RleHRhcmVhPmBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGEgY2xpY2sgbGlzdGVuZXJcclxuICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX3BsYWluVGV4dCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE9ic2VydmUgdGhlIFNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoJyNzc3InLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3BsYWludGV4dFNlYXJjaCcpIS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fZ2V0UmVxdWVzdExpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgcGxhaW50ZXh0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgb3BlbiBzdGF0ZVxyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh0aGlzLl9pc09wZW4pO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgdG9nZ2xlIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XHJcbiAgICAgICAgdG9nZ2xlQnRuXHJcbiAgICAgICAgICAgIC50aGVuKChidG4pID0+IHtcclxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXh0Ym94IHNob3VsZCBleGlzdCwgYnV0IGp1c3QgaW4gY2FzZS4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Ym94OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHRib3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdGV4dGJveCBkb2Vzbid0IGV4aXN0IWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3BlbiA9PT0gJ2ZhbHNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdIaWRlIFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ2ZhbHNlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ1Nob3cgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEluc2VydGVkIHBsYWludGV4dCByZXF1ZXN0IHJlc3VsdHMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxyXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsID0gJ2ZhbHNlJztcclxuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcclxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGVuID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NSZXN1bHRzKHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4pOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGxldCBvdXRwOiBzdHJpbmcgPSAnJztcclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgLy8gUmVzZXQgZWFjaCB0ZXh0IGZpZWxkXHJcbiAgICAgICAgICAgIGxldCB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBzZXJpZXNUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBhdXRoVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgbmFyclRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgLy8gQnJlYWsgb3V0IHRoZSBpbXBvcnRhbnQgZGF0YSBmcm9tIGVhY2ggbm9kZVxyXG4gICAgICAgICAgICBjb25zdCByYXdUaXRsZTogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yKCcudG9yVGl0bGUnKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VyaWVzTGlzdDogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgICAgID4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuc2VyaWVzJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXHJcbiAgICAgICAgICAgICAgICAnLmF1dGhvcidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgbmFyckxpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcubmFycmF0b3InXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmF3VGl0bGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3IgTm9kZTonLCBub2RlKTtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzdWx0IHRpdGxlIHNob3VsZCBub3QgYmUgbnVsbGApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgPSByYXdUaXRsZS50ZXh0Q29udGVudCEudHJpbSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIHNlcmllc1xyXG4gICAgICAgICAgICBpZiAoc2VyaWVzTGlzdCAhPT0gbnVsbCAmJiBzZXJpZXNMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlcmllc0xpc3QuZm9yRWFjaCgoc2VyaWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgKz0gYCR7c2VyaWVzLnRleHRDb250ZW50fSAvIGA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGxhc3Qgc2VyaWVzLCB0aGVuIHN0eWxlXHJcbiAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSA9IHNlcmllc1RpdGxlLnN1YnN0cmluZygwLCBzZXJpZXNUaXRsZS5sZW5ndGggLSAzKTtcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gYCAoJHtzZXJpZXNUaXRsZX0pYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIGF1dGhvcnNcclxuICAgICAgICAgICAgaWYgKGF1dGhMaXN0ICE9PSBudWxsICYmIGF1dGhMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGF1dGhUaXRsZSA9ICdCWSAnO1xyXG4gICAgICAgICAgICAgICAgYXV0aExpc3QuZm9yRWFjaCgoYXV0aCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhUaXRsZSArPSBgJHthdXRoLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gYXV0aFRpdGxlLnN1YnN0cmluZygwLCBhdXRoVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvY2VzcyBuYXJyYXRvcnNcclxuICAgICAgICAgICAgaWYgKG5hcnJMaXN0ICE9PSBudWxsICYmIG5hcnJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG5hcnJUaXRsZSA9ICdGVCAnO1xyXG4gICAgICAgICAgICAgICAgbmFyckxpc3QuZm9yRWFjaCgobmFycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hcnJUaXRsZSArPSBgJHtuYXJyLnRleHRDb250ZW50fSBBTkQgYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIEFORFxyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gbmFyclRpdGxlLnN1YnN0cmluZygwLCBuYXJyVGl0bGUubGVuZ3RoIC0gNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cCArPSBgJHt0aXRsZX0ke3Nlcmllc1RpdGxlfSAke2F1dGhUaXRsZX0gJHtuYXJyVGl0bGV9XFxuYDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gb3V0cDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSZXF1ZXN0TGlzdCA9ICgpOiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZ2V0U2VhcmNoTGlzdCggKWApO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXF1ZXN0IHJlc3VsdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyN0b3JSb3dzIC50b3JSb3cgYScpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCByZXF1ZXN0IHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSA8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvclJvd3MgLnRvclJvdycpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNuYXRjaExpc3QgPT09IG51bGwgfHwgc25hdGNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGBzbmF0Y2hMaXN0IGlzICR7c25hdGNoTGlzdH1gKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzbmF0Y2hMaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgR29vZHJlYWRzQnV0dG9uUmVxIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b25SZXEnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuUmVxdWVzdHMsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMgZm9yIHJlcXVlc3RzJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZmlsbFRvcnJlbnQnO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QgZGV0YWlscyddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gQ29udmVydCByb3cgc3RydWN0dXJlIGludG8gc2VhcmNoYWJsZSBvYmplY3RcclxuICAgICAgICBjb25zdCByZXFSb3dzID0gVXRpbC5yb3dzVG9PYmooZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gPiBkaXYnKSk7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snVGl0bGU6J10ucXVlcnlTZWxlY3Rvcignc3BhbicpO1xyXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IHJlcVJvd3NbXHJcbiAgICAgICAgICAgICdBdXRob3Iocyk6J1xyXG4gICAgICAgIF0ucXVlcnlTZWxlY3RvckFsbCgnYScpO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IHJlcVJvd3NbJ1NlcmllczonXVxyXG4gICAgICAgICAgICA/IHJlcVJvd3NbJ1NlcmllczonXS5xdWVyeVNlbGVjdG9yQWxsKCdhJylcclxuICAgICAgICAgICAgOiBudWxsO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcmVxUm93c1snUmVsZWFzZSBEYXRlJ107XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqIFByb2Nlc3MgJiByZXR1cm4gaW5mb3JtYXRpb24gZnJvbSB0aGUgc2hvdXRib3hcclxuICovXHJcbmNsYXNzIFByb2Nlc3NTaG91dHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gbmFtZXMgKE9wdGlvbmFsKSBMaXN0IG9mIHVzZXJuYW1lcy9JRHMgdG8gZmlsdGVyIGZvclxyXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIChPcHRpb25hbCkgV2hhdCBmaWx0ZXIgdGhlIG5hbWVzIGFyZSBmb3IuIFJlcXVpcmVkIGlmIGBuYW1lc2AgaXMgcHJvdmlkZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB3YXRjaFNob3V0Ym94KFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIG5hbWVzPzogc3RyaW5nW10sXHJcbiAgICAgICAgdXNlcnR5cGU/OiBTaG91dGJveFVzZXJUeXBlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICAvLyBPYnNlcnZlIHRoZSBzaG91dGJveFxyXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcihcclxuICAgICAgICAgICAgdGFyLFxyXG4gICAgICAgICAgICAobXV0TGlzdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2hvdXRib3ggdXBkYXRlcywgcHJvY2VzcyB0aGUgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgICAgIG11dExpc3QuZm9yRWFjaCgobXV0UmVjKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBjaGFuZ2VkIG5vZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0UmVjLmFkZGVkTm9kZXMuZm9yRWFjaCgobm9kZTogTm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShub2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBub2RlIGlzIGFkZGVkIGJ5IE1BTSsgZm9yIGdpZnQgYnV0dG9uLCBpZ25vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyBpZ25vcmUgaWYgdGhlIG5vZGUgaXMgYSBkYXRlIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9ebXBfLy50ZXN0KG5vZGVEYXRhLmdldEF0dHJpYnV0ZSgnaWQnKSEpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGF0YS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGxvb2tpbmcgZm9yIHNwZWNpZmljIHVzZXJzLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lcyAhPT0gdW5kZWZpbmVkICYmIG5hbWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VydHlwZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVXNlcnR5cGUgbXVzdCBiZSBkZWZpbmVkIGlmIGZpbHRlcmluZyBuYW1lcyEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJRDogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FbaHJlZl49XCIvdS9cIl0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdocmVmJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSA+IHNwYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYC91LyR7bmFtZX1gID09PSB1c2VySUQgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jYXNlbGVzc1N0cmluZ01hdGNoKG5hbWUsIHVzZXJOYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0eWxlU2hvdXQobm9kZSwgdXNlcnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgeyBjaGlsZExpc3Q6IHRydWUgfVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXYXRjaCB0aGUgc2hvdXRib3ggZm9yIGNoYW5nZXMsIHRyaWdnZXJpbmcgYWN0aW9ucyBmb3IgZmlsdGVyZWQgc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBzaG91dGJveCBlbGVtZW50IHNlbGVjdG9yXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9ucyBOdW1iZXIgdG8gcmVwcmVzZW50IGNoZWNrYm94IHNlbGVjdGlvbnMgMSA9IFJlcGx5LCAyID0gUmVwbHkgV2l0aCBRdW90ZVxyXG4gICAgICogQHBhcmFtIGNoYXJMaW1pdCBOdW1iZXIgb2YgY2hhcmFjdGVycyB0byBpbmNsdWRlIGluIHF1b3RlLCAsIGNoYXJMaW1pdD86bnVtYmVyIC0gQ3VycmVudGx5IHVudXNlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHdhdGNoU2hvdXRib3hSZXBseSh0YXI6IHN0cmluZywgYnV0dG9ucz86IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ3dhdGNoU2hvdXRib3hSZXBseSgnLCB0YXIsIGJ1dHRvbnMsICcpJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IF9nZXRVSUQgPSAobm9kZTogTm9kZSk6IHN0cmluZyA9PlxyXG4gICAgICAgICAgICB0aGlzLmV4dHJhY3RGcm9tU2hvdXQobm9kZSwgJ2FbaHJlZl49XCIvdS9cIl0nLCAnaHJlZicpO1xyXG5cclxuICAgICAgICBjb25zdCBfZ2V0UmF3Q29sb3IgPSAoZWxlbTogSFRNTFNwYW5FbGVtZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW0uc3R5bGUuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0uc3R5bGUuY29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmNvbG9yO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IF9nZXROYW1lQ29sb3IgPSAoZWxlbTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Q29sb3I6IHN0cmluZyB8IG51bGwgPSBfZ2V0UmF3Q29sb3IoZWxlbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmF3Q29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRvIGhleFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJnYjogc3RyaW5nW10gPSBVdGlsLmJyYWNrZXRDb250ZW50cyhyYXdDb2xvcikuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbC5yZ2JUb0hleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzFdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmdiWzJdKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbGVtZW50IGlzIG51bGwhXFxuJHtlbGVtfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBfbWFrZU5hbWVUYWcgPSAobmFtZTogc3RyaW5nLCBoZXg6IHN0cmluZyB8IG51bGwsIHVpZDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgdWlkID0gdWlkLm1hdGNoKC9cXGQrL2cpIS5qb2luKCcnKTsgLy8gR2V0IHRoZSBVSUQsIGJ1dCBvbmx5IHRoZSBkaWdpdHNcclxuICAgICAgICAgICAgaGV4ID0gaGV4ID8gYDske2hleH1gIDogJyc7IC8vIElmIHRoZXJlIGlzIGEgaGV4IHZhbHVlLCBwcmVwZW5kIGA7YFxyXG4gICAgICAgICAgICByZXR1cm4gYEBbdWxpbms9JHt1aWR9JHtoZXh9XSR7bmFtZX1bL3VsaW5rXWA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSByZXBseSBib3hcclxuICAgICAgICBjb25zdCByZXBseUJveCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGJveF90ZXh0Jyk7XHJcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgICAgIHRhcixcclxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBuYW1lIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3V0TmFtZTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgKS5xdWVyeVNlbGVjdG9yKCdhW2hyZWZePVwiL3UvXCJdIHNwYW4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR3JhYiB0aGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgbmFtZSwgb3IgdGV4dCBjb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lQ29sb3I6IHN0cmluZyB8IG51bGwgPSBfZ2V0TmFtZUNvbG9yKHNob3V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZXh0cmFjdCB0aGUgdXNlcm5hbWUgZnJvbSBub2RlIGZvciB1c2UgaW4gcmVwbHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSA+IHNwYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJRDogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWZePVwiL3UvXCJdJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdocmVmJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIHNwYW4gZWxlbWVudCB0byBiZSBib2R5IG9mIGJ1dHRvbiBhZGRlZCB0byBwYWdlIC0gYnV0dG9uIHVzZXMgcmVsYXRpdmUgbm9kZSBjb250ZXh0IGF0IGNsaWNrIHRpbWUgdG8gZG8gY2FsY3VsYXRpb25zXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGx5QnV0dG9uOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBhIFJlcGx5U2ltcGxlIHJlcXVlc3QsIHRoZW4gY3JlYXRlIFJlcGx5IFNpbXBsZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ1dHRvbnMgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGJ1dHRvbiB3aXRoIG9uY2xpY2sgYWN0aW9uIG9mIHNldHRpbmcgc2IgdGV4dCBmaWVsZCB0byB1c2VybmFtZSB3aXRoIHBvdGVudGlhbCBjb2xvciBibG9jayB3aXRoIGEgY29sb24gYW5kIHNwYWNlIHRvIHJlcGx5LCBmb2N1cyBjdXJzb3IgaW4gdGV4dCBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLmlubmVySFRNTCA9ICc8YnV0dG9uPlxcdTI5M2E8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignYnV0dG9uJykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIHN0eWxlZCBuYW1lIHRhZyB0byB0aGUgcmVwbHkgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG5vdGhpbmcgd2FzIGluIHRoZSByZXBseSBib3gsIGFkZCBhIGNvbG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXBseUJveC52YWx1ZSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7X21ha2VOYW1lVGFnKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVDb2xvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySURcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9OiBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSAke19tYWtlTmFtZVRhZyh1c2VyTmFtZSwgbmFtZUNvbG9yLCB1c2VySUQpfSBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIGEgcmVwbHlRdW90ZSByZXF1ZXN0LCB0aGVuIGNyZWF0ZSByZXBseSBxdW90ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYnV0dG9ucyA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYnV0dG9uIHdpdGggb25jbGljayBhY3Rpb24gb2YgZ2V0dGluZyB0aGF0IGxpbmUncyB0ZXh0LCBzdHJpcHBpbmcgZG93biB0byA2NSBjaGFyIHdpdGggbm8gd29yZCBicmVhaywgdGhlbiBpbnNlcnQgaW50byBTQiB0ZXh0IGZpZWxkLCBmb2N1cyBjdXJzb3IgaW4gdGV4dCBib3hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLmlubmVySFRNTCA9ICc8YnV0dG9uPlxcdTI5M2Q8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCdXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcignYnV0dG9uJykhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5xdW90ZVNob3V0KG5vZGUsIDY1KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRleHQgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgcXVvdGUgdG8gcmVwbHkgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogXFx1MjAxY1tpXSR7dGV4dH1bL2ldXFx1MjAxZCBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEp1c3QgcmVwbHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7X21ha2VOYW1lVGFnKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVDb2xvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySURcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9OiBgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2l2ZSBzcGFuIGFuIElEIGZvciBwb3RlbnRpYWwgdXNlIGxhdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbXBfcmVwbHlCdXR0b24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pbnNlcnQgYnV0dG9uIHByaW9yIHRvIHVzZXJuYW1lIG9yIGFub3RoZXIgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKHJlcGx5QnV0dG9uLCBub2RlLmNoaWxkTm9kZXNbMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcXVvdGVTaG91dChzaG91dDogTm9kZSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB0ZXh0QXJyOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIC8vIEdldCBudW1iZXIgb2YgcmVwbHkgYnV0dG9ucyB0byByZW1vdmUgZnJvbSB0ZXh0XHJcbiAgICAgICAgY29uc3QgYnRuQ291bnQgPSBzaG91dC5maXJzdENoaWxkIS5wYXJlbnRFbGVtZW50IS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAnLm1wX3JlcGx5QnV0dG9uJ1xyXG4gICAgICAgICkubGVuZ3RoO1xyXG4gICAgICAgIC8vIEdldCB0aGUgdGV4dCBvZiBhbGwgY2hpbGQgbm9kZXNcclxuICAgICAgICBzaG91dC5jaGlsZE5vZGVzLmZvckVhY2goKGNoaWxkKSA9PiB7XHJcbiAgICAgICAgICAgIC8qIElmIHRoZSBjaGlsZCBpcyBhIG5vZGUgd2l0aCBjaGlsZHJlbiAoZXguIG5vdCBwbGFpbiB0ZXh0KSBjaGVjayB0byBzZWUgaWZcclxuICAgICAgICAgICAgdGhlIGNoaWxkIGlzIGEgbGluay4gSWYgdGhlIGxpbmsgZG9lcyBOT1Qgc3RhcnQgd2l0aCBgL3UvYCAoaW5kaWNhdGluZyBhIHVzZXIpXHJcbiAgICAgICAgICAgIHRoZW4gY2hhbmdlIHRoZSBsaW5rIHRvIHRoZSBzdHJpbmcgYFtMaW5rXWAuXHJcbiAgICAgICAgICAgIEluIGFsbCBvdGhlciBjYXNlcywgcmV0dXJuIHRoZSBjaGlsZCB0ZXh0IGNvbnRlbnQuICovXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRWxlbSA9IFV0aWwubm9kZVRvRWxlbShjaGlsZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFjaGlsZEVsZW0uaGFzQXR0cmlidXRlKCdocmVmJykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goY2hpbGQudGV4dENvbnRlbnQhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGRFbGVtLmdldEF0dHJpYnV0ZSgnaHJlZicpIS5pbmRleE9mKCcvdS8nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goJ1tMaW5rXScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goY2hpbGQudGV4dENvbnRlbnQhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRleHRBcnIucHVzaChjaGlsZC50ZXh0Q29udGVudCEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gTWFrZSBhIHN0cmluZywgYnV0IHRvc3Mgb3V0IHRoZSBmaXJzdCBmZXcgbm9kZXNcclxuICAgICAgICBsZXQgbm9kZVRleHQgPSB0ZXh0QXJyLnNsaWNlKDMgKyBidG5Db3VudCkuam9pbignJyk7XHJcbiAgICAgICAgaWYgKG5vZGVUZXh0LmluZGV4T2YoJzonKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBub2RlVGV4dCA9IG5vZGVUZXh0LnN1YnN0cigyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBzaG91bGQgaGF2ZSBqdXN0IHRoZSBtZXNzYWdlIHRleHQuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBxdW90ZXMgdGhhdCBtaWdodCBiZSBjb250YWluZWQ6XHJcbiAgICAgICAgbm9kZVRleHQgPSBub2RlVGV4dC5yZXBsYWNlKC9cXHV7MjAxY30oLio/KVxcdXsyMDFkfS9ndSwgJycpO1xyXG4gICAgICAgIC8vIFRyaW0gdGhlIHRleHQgdG8gYSBtYXggbGVuZ3RoIGFuZCBhZGQgLi4uIGlmIHNob3J0ZW5lZFxyXG4gICAgICAgIGxldCB0cmltbWVkVGV4dCA9IFV0aWwudHJpbVN0cmluZyhub2RlVGV4dC50cmltKCksIGxlbmd0aCk7XHJcbiAgICAgICAgaWYgKHRyaW1tZWRUZXh0ICE9PSBub2RlVGV4dC50cmltKCkpIHtcclxuICAgICAgICAgICAgdHJpbW1lZFRleHQgKz0gJyBbXFx1MjAyNl0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBEb25lIVxyXG4gICAgICAgIHJldHVybiB0cmltbWVkVGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEV4dHJhY3QgaW5mb3JtYXRpb24gZnJvbSBzaG91dHNcclxuICAgICAqIEBwYXJhbSBzaG91dCBUaGUgbm9kZSBjb250YWluaW5nIHNob3V0IGluZm9cclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIGVsZW1lbnQgc2VsZWN0b3Igc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gZ2V0IFRoZSByZXF1ZXN0ZWQgaW5mbyAoaHJlZiBvciB0ZXh0KVxyXG4gICAgICogQHJldHVybnMgVGhlIHN0cmluZyB0aGF0IHdhcyBzcGVjaWZpZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBleHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgIHNob3V0OiBOb2RlLFxyXG4gICAgICAgIHRhcjogc3RyaW5nLFxyXG4gICAgICAgIGdldDogJ2hyZWYnIHwgJ3RleHQnXHJcbiAgICApOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KS5jbGFzc0xpc3QuY29udGFpbnMoJ2RhdGVCcmVhaycpO1xyXG5cclxuICAgICAgICBpZiAoc2hvdXQgIT09IG51bGwgJiYgIW5vZGVEYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgfCBudWxsID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KS5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgdGFyXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChzaG91dEVsZW0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBleHRyYWN0ZWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2V0ICE9PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBleHRyYWN0ZWQgPSBzaG91dEVsZW0uZ2V0QXR0cmlidXRlKGdldCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZCA9IHNob3V0RWxlbS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChleHRyYWN0ZWQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBBdHRyaWJ1dGUgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIEVsZW1lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGV4dHJhY3Qgc2hvdXQhIE5vZGUgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2UgdGhlIHN0eWxlIG9mIGEgc2hvdXQgYmFzZWQgb24gZmlsdGVyIGxpc3RzXHJcbiAgICAgKiBAcGFyYW0gc2hvdXQgVGhlIG5vZGUgY29udGFpbmluZyBzaG91dCBpbmZvXHJcbiAgICAgKiBAcGFyYW0gdXNlcnR5cGUgVGhlIHR5cGUgb2YgdXNlcnMgdGhhdCBoYXZlIGJlZW4gZmlsdGVyZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzdHlsZVNob3V0KHNob3V0OiBOb2RlLCB1c2VydHlwZTogU2hvdXRib3hVc2VyVHlwZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNob3V0RWxlbTogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0oc2hvdXQpO1xyXG4gICAgICAgIGlmICh1c2VydHlwZSA9PT0gJ3ByaW9yaXR5Jykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21TdHlsZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoJ3ByaW9yaXR5U3R5bGVfdmFsJyk7XHJcbiAgICAgICAgICAgIGlmIChjdXN0b21TdHlsZSkge1xyXG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSBgaHNsYSgke2N1c3RvbVN0eWxlfSlgO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvdXRFbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnaHNsYSgwLDAlLDUwJSwwLjMpJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodXNlcnR5cGUgPT09ICdtdXRlJykge1xyXG4gICAgICAgICAgICBzaG91dEVsZW0uY2xhc3NMaXN0LmFkZCgnbXBfbXV0ZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFByaW9yaXR5VXNlcnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3ByaW9yaXR5VXNlcnMnLFxyXG4gICAgICAgIHRhZzogJ0VtcGhhc2l6ZSBVc2VycycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gc3lzdGVtLCAyNTQyMCwgNzc2MTgnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdFbXBoYXNpemVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3guICg8ZW0+VGhpcyBhY2NlcHRzIHVzZXIgSURzIGFuZCB1c2VybmFtZXMuIEl0IGlzIG5vdCBjYXNlIHNlbnNpdGl2ZS48L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3ByaW9yaXR5VXNlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdwcmlvcml0eSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoYCR7dGhpcy5zZXR0aW5ncy50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgaWYgKGdtVmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmlvcml0eVVzZXJzID0gYXdhaXQgVXRpbC5jc3ZUb0FycmF5KGdtVmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlcmxpc3QgaXMgbm90IGRlZmluZWQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveCh0aGlzLl90YXIsIHRoaXMuX3ByaW9yaXR5VXNlcnMsIHRoaXMuX3VzZXJUeXBlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBIaWdobGlnaHRpbmcgdXNlcnMgaW4gdGhlIHNob3V0Ym94Li4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgYSBjdXN0b20gYmFja2dyb3VuZCB0byBiZSBhcHBsaWVkIHRvIHByaW9yaXR5IHVzZXJzXHJcbiAqL1xyXG5jbGFzcyBQcmlvcml0eVN0eWxlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwcmlvcml0eVN0eWxlJyxcclxuICAgICAgICB0YWc6ICdFbXBoYXNpcyBTdHlsZScsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLCAwJSwgNTAlLCAwLjMnLFxyXG4gICAgICAgIGRlc2M6IGBDaGFuZ2UgdGhlIGNvbG9yL29wYWNpdHkgb2YgdGhlIGhpZ2hsaWdodGluZyBydWxlIGZvciBlbXBoYXNpemVkIHVzZXJzJyBwb3N0cy4gKDxlbT5UaGlzIGlzIGZvcm1hdHRlZCBhcyBIdWUgKDAtMzYwKSwgU2F0dXJhdGlvbiAoMC0xMDAlKSwgTGlnaHRuZXNzICgwLTEwMCUpLCBPcGFjaXR5ICgwLTEpPC9lbT4pYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gU2V0dGluZyBjdXN0b20gaGlnaGxpZ2h0IGZvciBwcmlvcml0eSB1c2Vycy4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBkZXNpcmVkIG11dGVkIHVzZXJzXHJcbiAqL1xyXG5jbGFzcyBNdXRlZFVzZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdtdXRlZFVzZXJzJyxcclxuICAgICAgICB0YWc6ICdNdXRlIHVzZXJzJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiAxMjM0LCBnYXJkZW5zaGFkZScsXHJcbiAgICAgICAgZGVzYzogYE9ic2N1cmVzIG1lc3NhZ2VzIGZyb20gdGhlIGxpc3RlZCB1c2VycyBpbiB0aGUgc2hvdXRib3ggdW50aWwgaG92ZXJlZC4gKDxlbT5UaGlzIGFjY2VwdHMgdXNlciBJRHMgYW5kIHVzZXJuYW1lcy4gSXQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLjwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG4gICAgcHJpdmF0ZSBfbXV0ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcclxuICAgIHByaXZhdGUgX3VzZXJUeXBlOiBTaG91dGJveFVzZXJUeXBlID0gJ211dGUnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgIGlmIChnbVZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbXV0ZWRVc2VycyA9IGF3YWl0IFV0aWwuY3N2VG9BcnJheShnbVZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXJsaXN0IGlzIG5vdCBkZWZpbmVkIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9tdXRlZFVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gT2JzY3VyaW5nIG11dGVkIHVzZXJzLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgR2lmdCBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXQgVHJpcGxlIGRvdCBtZW51XHJcbiAqL1xyXG5jbGFzcyBHaWZ0QnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dpZnRCdXR0b24nLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBHaWZ0IGJ1dHRvbiBpbiBTaG91dGJveCBkb3QtbWVudWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSW5pdGlhbGl6ZWQgR2lmdCBCdXR0b24uYCk7XHJcbiAgICAgICAgY29uc3Qgc2JmRGl2ID0gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYmYnKSE7XHJcbiAgICAgICAgY29uc3Qgc2JmRGl2Q2hpbGQgPSBzYmZEaXYhLmZpcnN0Q2hpbGQ7XHJcblxyXG4gICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyIGZvciB3aGVuZXZlciBzb21ldGhpbmcgaXMgY2xpY2tlZCBpbiB0aGUgc2JmIGRpdlxyXG4gICAgICAgIHNiZkRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vcHVsbCB0aGUgZXZlbnQgdGFyZ2V0IGludG8gYW4gSFRNTCBFbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICAvL2FkZCB0aGUgVHJpcGxlIERvdCBNZW51IGFzIGFuIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3Qgc2JNZW51RWxlbSA9IHRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKTtcclxuICAgICAgICAgICAgLy9maW5kIHRoZSBtZXNzYWdlIGRpdlxyXG4gICAgICAgICAgICBjb25zdCBzYk1lbnVQYXJlbnQgPSB0YXJnZXQhLmNsb3Nlc3QoYGRpdmApO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgZnVsbCB0ZXh0IG9mIHRoZSBtZXNzYWdlIGRpdlxyXG4gICAgICAgICAgICBsZXQgZ2lmdE1lc3NhZ2UgPSBzYk1lbnVQYXJlbnQhLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgLy9mb3JtYXQgbWVzc2FnZSB3aXRoIHN0YW5kYXJkIHRleHQgKyBtZXNzYWdlIGNvbnRlbnRzICsgc2VydmVyIHRpbWUgb2YgdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgZ2lmdE1lc3NhZ2UgPVxyXG4gICAgICAgICAgICAgICAgYFNlbnQgb24gU2hvdXRib3ggbWVzc2FnZTogXCJgICtcclxuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZyhnaWZ0TWVzc2FnZS5pbmRleE9mKCc6ICcpICsgMikgK1xyXG4gICAgICAgICAgICAgICAgYFwiIGF0IGAgK1xyXG4gICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2Uuc3Vic3RyaW5nKDAsIDgpO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSB0YXJnZXQgb2YgdGhlIGNsaWNrIGlzIG5vdCB0aGUgVHJpcGxlIERvdCBNZW51IE9SXHJcbiAgICAgICAgICAgIC8vaWYgbWVudSBpcyBvbmUgb2YgeW91ciBvd24gY29tbWVudHMgKG9ubHkgd29ya3MgZm9yIGZpcnN0IDEwIG1pbnV0ZXMgb2YgY29tbWVudCBiZWluZyBzZW50KVxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAhdGFyZ2V0IS5jbG9zZXN0KCcuc2JfbWVudScpIHx8XHJcbiAgICAgICAgICAgICAgICBzYk1lbnVFbGVtIS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZWUnKSEgPT09ICcxJ1xyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2dldCB0aGUgTWVudSBhZnRlciBpdCBwb3BzIHVwXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBHaWZ0IEJ1dHRvbi4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCBwb3B1cE1lbnU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJyk7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoNSk7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKCFwb3B1cE1lbnUhLmhhc0NoaWxkTm9kZXMoKSk7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSB1c2VyIGRldGFpbHMgZnJvbSB0aGUgcG9wdXAgbWVudSBkZXRhaWxzXHJcbiAgICAgICAgICAgIGNvbnN0IHBvcHVwVXNlcjogSFRNTEVsZW1lbnQgPSBVdGlsLm5vZGVUb0VsZW0ocG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgLy9tYWtlIHVzZXJuYW1lIGVxdWFsIHRoZSBkYXRhLXVpZCwgZm9yY2Ugbm90IG51bGxcclxuICAgICAgICAgICAgY29uc3QgdXNlck5hbWU6IFN0cmluZyA9IHBvcHVwVXNlciEuZ2V0QXR0cmlidXRlKCdkYXRhLXVpZCcpITtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgZ2lmdHMgc2V0IGluIHByZWZlcmVuY2VzIGZvciB1c2VyIHBhZ2VcclxuICAgICAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhleSBkaWQgbm90IHNldCBhIHZhbHVlIGluIHByZWZlcmVuY2VzLCBzZXQgdG8gMTAwXHJcbiAgICAgICAgICAgIGlmICghZ2lmdFZhbHVlU2V0dGluZykge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICcxMDAnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpID4gMTAwMCB8fFxyXG4gICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwMCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgZ2lmdFZhbHVlU2V0dGluZyA9ICc1JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgSFRNTCBkb2N1bWVudCB0aGF0IGhvbGRzIHRoZSBidXR0b24gYW5kIHZhbHVlIHRleHRcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEJ1dHRvbjogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ2lmdEJ1dHRvbicpO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgYXMgd2VsbCBhcyBhIHRleHQgZWxlbWVudCBmb3IgdmFsdWUgb2YgZ2lmdC4gUG9wdWxhdGUgd2l0aCB2YWx1ZSBmcm9tIHNldHRpbmdzXHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24uaW5uZXJIVE1MID0gYDxidXR0b24+R2lmdDogPC9idXR0b24+PHNwYW4+Jm5ic3A7PC9zcGFuPjxpbnB1dCB0eXBlPVwidGV4dFwiIHNpemU9XCIzXCIgaWQ9XCJtcF9naWZ0VmFsdWVcIiB0aXRsZT1cIlZhbHVlIGJldHdlZW4gNSBhbmQgMTAwMFwiIHZhbHVlPVwiJHtnaWZ0VmFsdWVTZXR0aW5nfVwiPmA7XHJcbiAgICAgICAgICAgIC8vYWRkIGdpZnQgZWxlbWVudCB3aXRoIGJ1dHRvbiBhbmQgdGV4dCB0byB0aGUgbWVudVxyXG4gICAgICAgICAgICBwb3B1cE1lbnUhLmNoaWxkTm9kZXNbMF0uYXBwZW5kQ2hpbGQoZ2lmdEJ1dHRvbik7XHJcbiAgICAgICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyIGZvciB3aGVuIGdpZnQgYnV0dG9uIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL3B1bGwgd2hhdGV2ZXIgdGhlIGZpbmFsIHZhbHVlIG9mIHRoZSB0ZXh0IGJveCBlcXVhbHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRGaW5hbEFtb3VudCA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRWYWx1ZScpXHJcbiAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAvL2JlZ2luIHNldHRpbmcgdXAgdGhlIEdFVCByZXF1ZXN0IHRvIE1BTSBKU09OXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnaWZ0SFRUUCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJlc3VsdHMgd2l0aCB0aGUgYW1vdW50IGVudGVyZWQgYnkgdXNlciBwbHVzIHRoZSB1c2VybmFtZSBmb3VuZCBvbiB0aGUgbWVudSBzZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgLy9hZGRlZCBtZXNzYWdlIGNvbnRlbnRzIGVuY29kZWQgdG8gcHJldmVudCB1bmludGVuZGVkIGNoYXJhY3RlcnMgZnJvbSBicmVha2luZyBKU09OIFVSTFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEZpbmFsQW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX0mbWVzc2FnZT0ke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgKX1gO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRIVFRQLnJlYWR5U3RhdGUgPT09IDQgJiYgZ2lmdEhUVFAuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoZ2lmdEhUVFAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgbGluZSBpbiBTQiB0aGF0IHNob3dzIGdpZnQgd2FzIHN1Y2Nlc3NmdWwgdG8gYWNrbm93bGVkZ2UgZ2lmdCB3b3JrZWQvZmFpbGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0U3RhdHVzRWxlbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXZDaGlsZCEuYXBwZW5kQ2hpbGQobmV3RGl2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgZ2lmdCBzdWNjZWVkZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb24uc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc01zZyA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQb2ludHMgR2lmdCBTdWNjZXNzZnVsOiBWYWx1ZTogJyArIGdpZnRGaW5hbEFtb3VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5hcHBlbmRDaGlsZChzdWNjZXNzTXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5jbGFzc0xpc3QuYWRkKCdtcF9zdWNjZXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWlsZWRNc2cgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUG9pbnRzIEdpZnQgRmFpbGVkOiBFcnJvcjogJyArIGpzb24uZXJyb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuYXBwZW5kQ2hpbGQoZmFpbGVkTXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rpdi5jbGFzc0xpc3QuYWRkKCdtcF9mYWlsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZnRlciB3ZSBhZGQgbGluZSBpbiBTQiwgc2Nyb2xsIHRvIGJvdHRvbSB0byBzaG93IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYmZEaXYuc2Nyb2xsVG9wID0gc2JmRGl2LnNjcm9sbEhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9hZnRlciB3ZSBhZGQgbGluZSBpbiBTQiwgc2Nyb2xsIHRvIGJvdHRvbSB0byBzaG93IHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIHNiZkRpdi5zY3JvbGxUb3AgPSBzYmZEaXYuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAvL3JldHVybiB0byBtYWluIFNCIHdpbmRvdyBhZnRlciBnaWZ0IGlzIGNsaWNrZWQgLSB0aGVzZSBhcmUgdHdvIHN0ZXBzIHRha2VuIGJ5IE1BTSB3aGVuIGNsaWNraW5nIG91dCBvZiBNZW51XHJcbiAgICAgICAgICAgICAgICBzYmZEaXZcclxuICAgICAgICAgICAgICAgICAgICAuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2JfY2xpY2tlZF9yb3cnKVswXSFcclxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoJ3NiTWVudU1haW4nKSFcclxuICAgICAgICAgICAgICAgICAgICAuc2V0QXR0cmlidXRlKCdjbGFzcycsICdzYkJvdHRvbSBoaWRlTWUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignaW5wdXQnKSEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0VmFsdWUnKVxyXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPCA1IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgaXNOYU4oTnVtYmVyKHZhbHVlVG9OdW1iZXIpKVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNK10gR2lmdCBCdXR0b24gYWRkZWQhYCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIFJlcGx5IGJ1dHRvbiB0byBiZSBhZGRlZCB0byBTaG91dFxyXG4gKi9cclxuY2xhc3MgUmVwbHlTaW1wbGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmVwbHlTaW1wbGUnLFxyXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5XCIsXHJcbiAgICAgICAgZGVzYzogYFBsYWNlcyBhIFJlcGx5IGJ1dHRvbiBpbiBTaG91dGJveDogJiMxMDU1NDtgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3JlcGx5U2ltcGxlOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlTaW1wbGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBSZXBseSBCdXR0b24uLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBbGxvd3MgUmVwbHkgV2l0aCBRdW90ZSBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXRcclxuICovXHJcbmNsYXNzIFJlcGx5UXVvdGUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmVwbHlRdW90ZScsXHJcbiAgICAgICAgLy90YWc6IFwiUmVwbHkgV2l0aCBRdW90ZVwiLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSB3aXRoIFF1b3RlIGJ1dHRvbiBpbiBTaG91dGJveDogJiMxMDU1NztgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX3JlcGx5UXVvdGU6IG51bWJlciA9IDI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94UmVwbHkodGhpcy5fdGFyLCB0aGlzLl9yZXBseVF1b3RlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgd2l0aCBRdW90ZSBCdXR0b24uLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGZlYXR1cmUgZm9yIGJ1aWxkaW5nIGEgbGlicmFyeSBvZiBxdWljayBzaG91dCBpdGVtcyB0aGF0IGNhbiBhY3QgYXMgYSBjb3B5L3Bhc3RlIHJlcGxhY2VtZW50LlxyXG4gKi9cclxuY2xhc3MgUXVpY2tTaG91dCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdxdWlja1Nob3V0JyxcclxuICAgICAgICBkZXNjOiBgQ3JlYXRlIGZlYXR1cmUgYmVsb3cgc2hvdXRib3ggdG8gc3RvcmUgcHJlLXNldCBtZXNzYWdlcy5gLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUXVpY2sgU2hvdXQgQnV0dG9ucy4uLmApO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBtYWluIHNob3V0Ym94IGlucHV0IGZpZWxkXHJcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xyXG4gICAgICAgIC8vZW1wdHkgSlNPTiB3YXMgZ2l2aW5nIG1lIGlzc3Vlcywgc28gZGVjaWRlZCB0byBqdXN0IG1ha2UgYW4gaW50cm8gZm9yIHdoZW4gdGhlIEdNIHZhcmlhYmxlIGlzIGVtcHR5XHJcbiAgICAgICAgbGV0IGpzb25MaXN0ID0gSlNPTi5wYXJzZShcclxuICAgICAgICAgICAgYHsgXCJJbnRyb1wiOlwiV2VsY29tZSB0byBRdWlja1Nob3V0IE1BTStlciEgSGVyZSB5b3UgY2FuIGNyZWF0ZSBwcmVzZXQgU2hvdXQgbWVzc2FnZXMgZm9yIHF1aWNrIHJlc3BvbnNlcyBhbmQga25vd2xlZGdlIHNoYXJpbmcuICdDbGVhcicgY2xlYXJzIHRoZSBlbnRyeSB0byBzdGFydCBzZWxlY3Rpb24gcHJvY2VzcyBvdmVyLiAnU2VsZWN0JyB0YWtlcyB3aGF0ZXZlciBRdWlja1Nob3V0IGlzIGluIHRoZSBUZXh0QXJlYSBhbmQgcHV0cyBpbiB5b3VyIFNob3V0IHJlc3BvbnNlIGFyZWEuICdTYXZlJyB3aWxsIHN0b3JlIHRoZSBTZWxlY3Rpb24gTmFtZSBhbmQgVGV4dCBBcmVhIENvbWJvIGZvciBmdXR1cmUgdXNlIGFzIGEgUXVpY2tTaG91dCwgYW5kIGhhcyBjb2xvciBpbmRpY2F0b3JzLiBHcmVlbiA9IHNhdmVkIGFzLWlzLiBZZWxsb3cgPSBRdWlja1Nob3V0IE5hbWUgZXhpc3RzIGFuZCBpcyBzYXZlZCwgYnV0IGNvbnRlbnQgZG9lcyBub3QgbWF0Y2ggd2hhdCBpcyBzdG9yZWQuIE9yYW5nZSA9IG5vIGVudHJ5IG1hdGNoaW5nIHRoYXQgbmFtZSwgbm90IHNhdmVkLiAnRGVsZXRlJyB3aWxsIHBlcm1hbmVudGx5IHJlbW92ZSB0aGF0IGVudHJ5IGZyb20geW91ciBzdG9yZWQgUXVpY2tTaG91dHMgKGJ1dHRvbiBvbmx5IHNob3dzIHdoZW4gZXhpc3RzIGluIHN0b3JhZ2UpLiBGb3IgbmV3IGVudHJpZXMgaGF2ZSB5b3VyIFF1aWNrU2hvdXQgTmFtZSB0eXBlZCBpbiBCRUZPUkUgeW91IGNyYWZ0IHlvdXIgdGV4dCBvciByaXNrIGl0IGJlaW5nIG92ZXJ3cml0dGVuIGJ5IHNvbWV0aGluZyB0aGF0IGV4aXN0cyBhcyB5b3UgdHlwZSBpdC4gVGhhbmtzIGZvciB1c2luZyBNQU0rIVwiIH1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2dldCBTaG91dGJveCBESVZcclxuICAgICAgICBjb25zdCBzaG91dEJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcFNob3V0Jyk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGZvb3RlciB3aGVyZSB3ZSB3aWxsIGluc2VydCBvdXIgZmVhdHVyZVxyXG4gICAgICAgIGNvbnN0IHNob3V0Rm9vdCA9IDxIVE1MRWxlbWVudD5zaG91dEJveCEucXVlcnlTZWxlY3RvcignLmJsb2NrRm9vdCcpO1xyXG4gICAgICAgIC8vZ2l2ZSBpdCBhbiBJRCBhbmQgc2V0IHRoZSBzaXplXHJcbiAgICAgICAgc2hvdXRGb290IS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2Jsb2NrRm9vdCcpO1xyXG4gICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzIuNWVtJztcclxuICAgICAgICAvL2NyZWF0ZSBhIG5ldyBkaXZlIHRvIGhvbGQgb3VyIGNvbWJvQm94IGFuZCBidXR0b25zIGFuZCBzZXQgdGhlIHN0eWxlIGZvciBmb3JtYXR0aW5nXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5mbG9hdCA9ICdsZWZ0JztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luQm90dG9tID0gJy41ZW0nO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpblRvcCA9ICcuNWVtJztcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgbGFiZWwgdGV4dCBlbGVtZW50IGFuZCBhZGQgdGhlIHRleHQgYW5kIGF0dHJpYnV0ZXMgZm9yIElEXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XHJcbiAgICAgICAgY29tYm9Cb3hMYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsICdxdWlja1Nob3V0RGF0YScpO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuaW5uZXJUZXh0ID0gJ0Nob29zZSBhIFF1aWNrU2hvdXQnO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveExhYmVsJyk7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGlucHV0IGZpZWxkIHRvIGxpbmsgdG8gZGF0YWxpc3QgYW5kIGZvcm1hdCBzdHlsZVxyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94SW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIGNvbWJvQm94SW5wdXQuc3R5bGUubWFyZ2luTGVmdCA9ICcuNWVtJztcclxuICAgICAgICBjb21ib0JveElucHV0LnNldEF0dHJpYnV0ZSgnbGlzdCcsICdtcF9jb21ib0JveExpc3QnKTtcclxuICAgICAgICBjb21ib0JveElucHV0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hJbnB1dCcpO1xyXG4gICAgICAgIC8vY3JlYXRlIGEgZGF0YWxpc3QgdG8gc3RvcmUgb3VyIHF1aWNrc2hvdXRzXHJcbiAgICAgICAgY29uc3QgY29tYm9Cb3hMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0YWxpc3QnKTtcclxuICAgICAgICBjb21ib0JveExpc3Quc2V0QXR0cmlidXRlKCdpZCcsICdtcF9jb21ib0JveExpc3QnKTtcclxuICAgICAgICAvL2lmIHRoZSBHTSB2YXJpYWJsZSBleGlzdHNcclxuICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSkge1xyXG4gICAgICAgICAgICAvL292ZXJ3cml0ZSBqc29uTGlzdCB2YXJpYWJsZSB3aXRoIHBhcnNlZCBkYXRhXHJcbiAgICAgICAgICAgIGpzb25MaXN0ID0gSlNPTi5wYXJzZShHTV9nZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcpKTtcclxuICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaXRlbVxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBhIG5ldyBPcHRpb24gZWxlbWVudCBhbmQgYWRkIG91ciBkYXRhIGZvciBkaXNwbGF5IHRvIHVzZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvL2lmIG5vIEdNIHZhcmlhYmxlXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9jcmVhdGUgdmFyaWFibGUgd2l0aCBvdXQgSW50cm8gZGF0YVxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XHJcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cclxuICAgICAgICAgICAgLy8gVE9ETzogcHJvYmFibHkgY2FuIGdldCByaWQgb2YgdGhlIGZvckVhY2ggYW5kIGp1c3QgZG8gc2luZ2xlIGV4ZWN1dGlvbiBzaW5jZSB3ZSBrbm93IHRoaXMgaXMgSW50cm8gb25seVxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vYXBwZW5kIHRoZSBhYm92ZSBlbGVtZW50cyB0byBvdXIgRElWIGZvciB0aGUgY29tYm8gYm94XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hMYWJlbCk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hJbnB1dCk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY29tYm9Cb3hMaXN0KTtcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgY2xlYXIgYnV0dG9uIGFuZCBhZGQgc3R5bGVcclxuICAgICAgICBjb25zdCBjbGVhckJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGNsZWFyQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBjbGVhckJ1dHRvbi5pbm5lckhUTUwgPSAnQ2xlYXInO1xyXG4gICAgICAgIC8vY3JlYXRlIGRlbGV0ZSBidXR0b24sIGFkZCBzdHlsZSwgYW5kIHRoZW4gaGlkZSBpdCBmb3IgbGF0ZXIgdXNlXHJcbiAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnNmVtJztcclxuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1JlZCc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLmlubmVySFRNTCA9ICdERUxFVEUnO1xyXG4gICAgICAgIC8vY3JlYXRlIHNlbGVjdCBidXR0b24gYW5kIHN0eWxlIGl0XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLnN0eWxlLm1hcmdpbkxlZnQgPSAnMWVtJztcclxuICAgICAgICBzZWxlY3RCdXR0b24uaW5uZXJIVE1MID0gJ1xcdTIxOTEgU2VsZWN0JztcclxuICAgICAgICAvL2NyZWF0ZSBzYXZlIGJ1dHRvbiBhbmQgc3R5bGUgaXRcclxuICAgICAgICBjb25zdCBzYXZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcbiAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgc2F2ZUJ1dHRvbi5pbm5lckhUTUwgPSAnU2F2ZSc7XHJcbiAgICAgICAgLy9hZGQgYWxsIDQgYnV0dG9ucyB0byB0aGUgY29tYm9Cb3ggRElWXHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoY2xlYXJCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNlbGVjdEJ1dHRvbik7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoc2F2ZUJ1dHRvbik7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuYXBwZW5kQ2hpbGQoZGVsZXRlQnV0dG9uKTtcclxuICAgICAgICAvL2NyZWF0ZSBvdXIgdGV4dCBhcmVhIGFuZCBzdHlsZSBpdCwgdGhlbiBoaWRlIGl0XHJcbiAgICAgICAgY29uc3QgcXVpY2tTaG91dFRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmhlaWdodCA9ICc1MCUnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLm1hcmdpbiA9ICcxZW0nO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLndpZHRoID0gJzk3JSc7XHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuaWQgPSAnbXBfcXVpY2tTaG91dFRleHQnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIC8vZXhlY3V0ZXMgd2hlbiBjbGlja2luZyBzZWxlY3QgYnV0dG9uXHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgc29tZXRoaW5nIGluc2lkZSBvZiB0aGUgcXVpY2tzaG91dCBhcmVhXHJcbiAgICAgICAgICAgICAgICBpZiAocXVpY2tTaG91dFRleHQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3B1dCB0aGUgdGV4dCBpbiB0aGUgbWFpbiBzaXRlIHJlcGx5IGZpZWxkIGFuZCBmb2N1cyBvbiBpdFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gcXVpY2tTaG91dFRleHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3guZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL2NyZWF0ZSBhIHF1aWNrU2hvdXQgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgbm90IHRoZSBsYXN0IHF1aWNrU2hvdXRcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhqc29uTGlzdCkubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlbnRyeSBmcm9tIHRoZSBKU09OIGFuZCB1cGRhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb24gbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBqc29uTGlzdFtjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpXTtcclxuICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfcXVpY2tTaG91dCcsIEpTT04uc3RyaW5naWZ5KGpzb25MaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gZm9yIG5ldyB1bnNhdmVkIHN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIG5vdCBhIHNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIG9wdGlvbnMgZnJvbSBkYXRhbGlzdCB0byByZXNldCB3aXRoIG5ld2x5IGNyZWF0ZWQganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBpdGVtIGluIG5ldyBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpzb25MaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9uZXcgb3B0aW9uIGVsZW1lbnQgdG8gYWRkIHRvIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGN1cnJlbnQga2V5IHZhbHVlIHRvIHRoZSBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBlbGVtZW50IHRvIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUgbGFzdCBpdGVtIGluIHRoZSBqc29ubGlzdFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBpdGVtIGZyb20ganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC/gsqAvZywgJ+CyoCcpXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBlbnRpcmUgdmFyaWFibGUgc28gaXRzIG5vdCBlbXB0eSBHTSB2YXJpYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIEdNX2RlbGV0ZVZhbHVlKCdtcF9xdWlja1Nob3V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gZm9yIG5ldyB1bnNhdmVkIHN0YXR1c1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIG5vdCBhIHNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgZXZlbnQgb24gc2F2ZSBidXR0b24gdG8gc2F2ZSBxdWlja3Nob3V0XHJcbiAgICAgICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIGRhdGEgaW4gdGhlIGtleSBhbmQgdmFsdWUgR1VJIGZpZWxkcywgcHJvY2VlZFxyXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlICYmIGNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3dhcyBoYXZpbmcgaXNzdWUgd2l0aCBldmFsIHByb2Nlc3NpbmcgdGhlIC5yZXBsYWNlIGRhdGEgc28gbWFkZSBhIHZhcmlhYmxlIHRvIGludGFrZSBpdFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VkVGV4dCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mdW4gd2F5IHRvIGR5bmFtaWNhbGx5IGNyZWF0ZSBzdGF0ZW1lbnRzIC0gdGhpcyB0YWtlcyB3aGF0ZXZlciBpcyBpbiBsaXN0IGZpZWxkIHRvIGNyZWF0ZSBhIGtleSB3aXRoIHRoYXQgdGV4dCBhbmQgdGhlIHZhbHVlIGZyb20gdGhlIHRleHRhcmVhXHJcbiAgICAgICAgICAgICAgICAgICAgZXZhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgYGpzb25MaXN0LmAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZWRUZXh0ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA9IFwiYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQocXVpY2tTaG91dFRleHQudmFsdWUpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcIjtgXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL292ZXJ3cml0ZSBvciBjcmVhdGUgdGhlIEdNIHZhcmlhYmxlIHdpdGggbmV3IGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gbm93IHRoYXQgaXRzIHNhdmVkIGFzLWlzXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL3Nob3cgZGVsZXRlIGJ1dHRvbiBub3cgdGhhdCBpdHMgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZXhpc3RpbmcgZGF0YWxpc3QgZWxlbWVudHMgdG8gcmVidWlsZCB3aXRoIG5ldyBqc29ubGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIG5ldyBvcHRpb24gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCBrZXkgbmFtZSB0byB0aGUgb3B0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RPRE86IHRoaXMgbWF5IG9yIG1heSBub3QgYmUgbmVjZXNzYXJ5LCBidXQgd2FzIGhhdmluZyBpc3N1ZXMgd2l0aCB0aGUgdW5pcXVlIHN5bWJvbCBzdGlsbCByYW5kb21seSBzaG93aW5nIHVwIGFmdGVyIHNhdmVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0gY29tYm9Cb3hPcHRpb24udmFsdWUucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRvIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbWJvQm94T3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbWJvQm94TGlzdC5hcHBlbmRDaGlsZChjb21ib0JveE9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9hZGQgZXZlbnQgZm9yIGNsZWFyIGJ1dHRvbiB0byByZXNldCB0aGUgZGF0YWxpc3RcclxuICAgICAgICBjbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2NsZWFyIHRoZSBpbnB1dCBmaWVsZCBhbmQgdGV4dGFyZWEgZmllbGRcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQudmFsdWUgPSAnJztcclxuICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAvL2NyZWF0ZSBpbnB1dCBldmVudCBvbiBpbnB1dCB0byBmb3JjZSBzb21lIHVwZGF0ZXMgYW5kIGRpc3BhdGNoIGl0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBFdmVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94SW5wdXQuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9OZXh0IHR3byBpbnB1dCBmdW5jdGlvbnMgYXJlIG1lYXQgYW5kIHBvdGF0b2VzIG9mIHRoZSBsb2dpYyBmb3IgdXNlciBmdW5jdGlvbmFsaXR5XHJcblxyXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGNoYW5nZWQgd2hpdGhpbiB0aGUgaW5wdXQgZmllbGRcclxuICAgICAgICBjb21ib0JveElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdpbnB1dCcsXHJcbiAgICAgICAgICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIHRleHRhcmVhIGlzIGFsc28gYmxhbmsgbWluaW1pemUgcmVhbCBlc3RhdGVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgdGV4dCBhcmVhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hyaW5rIHRoZSBmb290ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMi41ZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBkZWZhdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiBzb21ldGhpbmcgaXMgc3RpbGwgaW4gdGhlIHRleHRhcmVhIHdlIG5lZWQgdG8gaW5kaWNhdGUgdGhhdCB1bnNhdmVkIGFuZCB1bm5hbWVkIGRhdGEgaXMgdGhlcmVcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N0eWxlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkIGlzIG9yZ2FuZ2Ugc2F2ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vZWl0aGVyIHdheSwgaGlkZSB0aGUgZGVsZXRlIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaGFzIGFueSB0ZXh0IGluIGl0XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IHRoZSB0ZXh0IGFyZWEgZm9yIGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZXhwYW5kIHRoZSBmb290ZXIgdG8gYWNjb21vZGF0ZSBhbGwgZmVhdHVyZSBhc3BlY3RzXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdXRGb290IS5zdHlsZS5oZWlnaHQgPSAnMTFlbSc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB3aGF0IGlzIGluIHRoZSBpbnB1dCBmaWVsZCBpcyBhIHNhdmVkIGVudHJ5IGtleVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqc29uTGlzdFtpbnB1dFZhbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIGNhbiBiZSBhIHN1Y2t5IGxpbmUgb2YgY29kZSBiZWNhdXNlIGl0IGNhbiB3aXBlIG91dCB1bnNhdmVkIGRhdGEsIGJ1dCBpIGNhbm5vdCB0aGluayBvZiBiZXR0ZXIgd2F5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vcmVwbGFjZSB0aGUgdGV4dCBhcmVhIGNvbnRlbnRzIHdpdGggd2hhdCB0aGUgdmFsdWUgaXMgaW4gdGhlIG1hdGNoZWQgcGFpclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBxdWlja1Nob3V0VGV4dC52YWx1ZSA9IGpzb25MaXN0W0pTT04ucGFyc2UoaW5wdXRWYWwpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGlzIG5vdyBleGFjdCBtYXRjaCB0byBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gc2hvdyBpdHMgYSBzYXZlZCBjb21ib1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCBhIHJlZ2lzdGVyZWQga2V5IG5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgdGhlIHNhdmUgYnV0dG9uIHRvIGJlIGFuIHVuc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgZGVsZXRlIGJ1dHRvbiBzaW5jZSB0aGlzIGNhbm5vdCBiZSBzYXZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy93aGVuZXZlciBzb21ldGhpbmcgaXMgdHlwZWQgb3IgZGVsZXRlZCBvdXQgb2YgdGV4dGFyZWFcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnaW5wdXQnLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGNvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgvIC9nLCAn4LKgJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgaW5wdXQgZmllbGQgaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIGlmICghY29tYm9Cb3hJbnB1dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGRlbGV0ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vaWYgaW5wdXQgZmllbGQgaGFzIHRleHQgaW4gaXRcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgIGpzb25MaXN0W2lucHV0VmFsXSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlICE9PSBkZWNvZGVVUklDb21wb25lbnQoanNvbkxpc3RbaW5wdXRWYWxdKVxyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIGFzIHllbGxvdyBmb3IgZWRpdHRlZFxyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1llbGxvdyc7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICdCbGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBrZXkgaXMgYSBtYXRjaCBhbmQgdGhlIGRhdGEgaXMgYSBtYXRjaCB0aGVuIHdlIGhhdmUgYSAxMDAlIHNhdmVkIGVudHJ5IGFuZCBjYW4gcHV0IGV2ZXJ5dGhpbmcgYmFjayB0byBzYXZlZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9PT0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiB0byBncmVlbiBmb3Igc2F2ZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIG5vdCBmb3VuZCBpbiB0aGUgc2F2ZWQgbGlzdCwgb3JhbmdlIGZvciB1bnNhdmVkIGFuZCB1bm5hbWVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFqc29uTGlzdFtpbnB1dFZhbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9hZGQgdGhlIGNvbWJvYm94IGFuZCB0ZXh0IGFyZWEgZWxlbWVudHMgdG8gdGhlIGZvb3RlclxyXG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChjb21ib0JveERpdik7XHJcbiAgICAgICAgc2hvdXRGb290LmFwcGVuZENoaWxkKHF1aWNrU2hvdXRUZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNoYXJlZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi91dGlsLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAqIEF1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLlxyXG4gKi9cclxuY2xhc3MgVG9yR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b3JHaWZ0RGVmYXVsdCcsXHJcbiAgICAgICAgdGFnOiAnRGVmYXVsdCBHaWZ0JyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2V4LiA1MDAwLCBtYXgnLFxyXG4gICAgICAgIGRlc2M6XHJcbiAgICAgICAgICAgICdBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy4gKDxlbT5PciB0aGUgbWF4IGFsbG93YWJsZSB2YWx1ZSwgd2hpY2hldmVyIGlzIGxvd2VyPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdGhhbmtzQXJlYSBpbnB1dFtuYW1lPXBvaW50c10nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gR29vZHJlYWRzXHJcbiAqL1xyXG5jbGFzcyBHb29kcmVhZHNCdXR0b24gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvbicsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLUdvb2RyZWFkcyBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgR29vZHJlYWRzIGJ1dHRvbnMnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBkYXRhIHBvaW50c1xyXG4gICAgICAgIGNvbnN0IGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiAudG9yQXV0aG9ycyBhJyk7XHJcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHNlcmllc0RhdGE6IE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxBbmNob3JFbGVtZW50XHJcbiAgICAgICAgPiB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjU2VyaWVzIGEnKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuZ29vZHJlYWRzQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBBdWRpYmxlXHJcbiAqL1xyXG5jbGFzcyBBdWRpYmxlQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdhdWRpYmxlQnV0dG9uJyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tQXVkaWJsZSBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgQXVkaWJsZSBidXR0b25zJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9zZ1JvdycpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLl9zaGFyZS5hdWRpYmxlQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEFkZHMgdmFyaW91cyBsaW5rcyB0byBTdG9yeUdyYXBoXHJcbiAqL1xyXG5jbGFzcyBTdG9yeUdyYXBoQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzdG9yeUdyYXBoQnV0dG9uJyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIHRoZSBNQU0tdG8tU3RvcnlHcmFwaCBidXR0b25zJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3VibWl0SW5mbyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGZlYXR1cmUgc2hvdWxkIG9ubHkgcnVuIG9uIGJvb2sgY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2F0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZJbmZvIFtjbGFzc149Y2F0XScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdCAmJiBDaGVjay5pc0Jvb2tDYXQocGFyc2VJbnQoY2F0LmNsYXNzTmFtZS5zdWJzdHJpbmcoMykpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm90IGEgYm9vayBjYXRlZ29yeTsgc2tpcHBpbmcgU3Ryb3lHcmFwaCBidXR0b25zJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXQ6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuXHJcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9nclJvdycpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLl9zaGFyZS5zdG9yeUdyYXBoQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEdlbmVyYXRlcyBhIGZpZWxkIGZvciBcIkN1cnJlbnRseSBSZWFkaW5nXCIgYmJjb2RlXHJcbiAqL1xyXG5jbGFzcyBDdXJyZW50bHlSZWFkaW5nIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGl0bGU6ICdjdXJyZW50bHlSZWFkaW5nJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIGdlbmVyYXRlIGEgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGZvcnVtIHNuaXBwZXRgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkaW5nIEN1cnJlbnRseSBSZWFkaW5nIHNlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBHZXQgdGhlIHJlcXVpcmVkIGluZm9ybWF0aW9uXHJcbiAgICAgICAgY29uc3QgdGl0bGU6IHN0cmluZyA9IGRvY3VtZW50IS5xdWVyeVNlbGVjdG9yKCcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJykhXHJcbiAgICAgICAgICAgIC50ZXh0Q29udGVudCE7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYSdcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHRvcklEOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsyXTtcclxuICAgICAgICBjb25zdCByb3dUYXI6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbycpO1xyXG5cclxuICAgICAgICAvLyBUaXRsZSBjYW4ndCBiZSBudWxsXHJcbiAgICAgICAgaWYgKHRpdGxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGl0bGUgZmllbGQgd2FzIG51bGxgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIGEgbmV3IHRhYmxlIHJvd1xyXG4gICAgICAgIGNvbnN0IGNyUm93OiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IFV0aWwuYWRkVG9yRGV0YWlsc1JvdyhcclxuICAgICAgICAgICAgcm93VGFyLFxyXG4gICAgICAgICAgICAnQ3VycmVudGx5IFJlYWRpbmcnLFxyXG4gICAgICAgICAgICAnbXBfY3JSb3cnXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBQcm9jZXNzIGRhdGEgaW50byBzdHJpbmdcclxuICAgICAgICBjb25zdCBibHVyYjogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2VuZXJhdGVTbmlwcGV0KHRvcklELCB0aXRsZSwgYXV0aG9ycyk7XHJcbiAgICAgICAgLy8gQnVpbGQgYnV0dG9uXHJcbiAgICAgICAgY29uc3QgYnRuOiBIVE1MRGl2RWxlbWVudCA9IGF3YWl0IHRoaXMuX2J1aWxkQnV0dG9uKGNyUm93LCBibHVyYik7XHJcbiAgICAgICAgLy8gSW5pdCBidXR0b25cclxuICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihidG4sIGJsdXJiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogQnVpbGQgYSBCQiBDb2RlIHRleHQgc25pcHBldCB1c2luZyB0aGUgYm9vayBpbmZvLCB0aGVuIHJldHVybiBpdFxyXG4gICAgICogQHBhcmFtIGlkIFRoZSBzdHJpbmcgSUQgb2YgdGhlIGJvb2tcclxuICAgICAqIEBwYXJhbSB0aXRsZSBUaGUgc3RyaW5nIHRpdGxlIG9mIHRoZSBib29rXHJcbiAgICAgKiBAcGFyYW0gYXV0aG9ycyBBIG5vZGUgbGlzdCBvZiBhdXRob3IgbGlua3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2VuZXJhdGVTbmlwcGV0KFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBhdXRob3JzOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PlxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIEFkZCBBdXRob3IgTGlua1xyXG4gICAgICAgICAqIEBwYXJhbSBhdXRob3JFbGVtIEEgbGluayBjb250YWluaW5nIGF1dGhvciBpbmZvcm1hdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0IGFkZEF1dGhvckxpbmsgPSAoYXV0aG9yRWxlbTogSFRNTEFuY2hvckVsZW1lbnQpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGBbdXJsPSR7YXV0aG9yRWxlbS5ocmVmLnJlcGxhY2UoJ2h0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQnLCAnJyl9XSR7XHJcbiAgICAgICAgICAgICAgICBhdXRob3JFbGVtLnRleHRDb250ZW50XHJcbiAgICAgICAgICAgIH1bL3VybF1gO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIE5vZGVMaXN0IGludG8gYW4gQXJyYXkgd2hpY2ggaXMgZWFzaWVyIHRvIHdvcmsgd2l0aFxyXG4gICAgICAgIGxldCBhdXRob3JBcnJheTogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBhdXRob3JzLmZvckVhY2goKGF1dGhvckVsZW0pID0+IGF1dGhvckFycmF5LnB1c2goYWRkQXV0aG9yTGluayhhdXRob3JFbGVtKSkpO1xyXG4gICAgICAgIC8vIERyb3AgZXh0cmEgaXRlbXNcclxuICAgICAgICBpZiAoYXV0aG9yQXJyYXkubGVuZ3RoID4gMykge1xyXG4gICAgICAgICAgICBhdXRob3JBcnJheSA9IFsuLi5hdXRob3JBcnJheS5zbGljZSgwLCAzKSwgJ2V0Yy4nXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgW3VybD0vdC8ke2lkfV0ke3RpdGxlfVsvdXJsXSBieSBbaV0ke2F1dGhvckFycmF5LmpvaW4oJywgJyl9Wy9pXWA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEJ1aWxkIGEgYnV0dG9uIG9uIHRoZSB0b3IgZGV0YWlscyBwYWdlXHJcbiAgICAgKiBAcGFyYW0gdGFyIEFyZWEgd2hlcmUgdGhlIGJ1dHRvbiB3aWxsIGJlIGFkZGVkIGludG9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IENvbnRlbnQgdGhhdCB3aWxsIGJlIGFkZGVkIGludG8gdGhlIHRleHRhcmVhXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2J1aWxkQnV0dG9uKHRhcjogSFRNTERpdkVsZW1lbnQsIGNvbnRlbnQ6IHN0cmluZyk6IEhUTUxEaXZFbGVtZW50IHtcclxuICAgICAgICAvLyBCdWlsZCB0ZXh0IGRpc3BsYXlcclxuICAgICAgICB0YXIuaW5uZXJIVE1MID0gYDx0ZXh0YXJlYSByb3dzPVwiMVwiIGNvbHM9XCI4MFwiIHN0eWxlPSdtYXJnaW4tcmlnaHQ6NXB4Jz4ke2NvbnRlbnR9PC90ZXh0YXJlYT5gO1xyXG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxyXG4gICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbih0YXIsICdub25lJywgJ0NvcHknLCAyKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfY3JSb3cgLm1wX2J1dHRvbl9jbG9uZScpIS5jbGFzc0xpc3QuYWRkKCdtcF9yZWFkaW5nJyk7XHJcbiAgICAgICAgLy8gUmV0dXJuIGJ1dHRvblxyXG4gICAgICAgIHJldHVybiA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3JlYWRpbmcnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIFByb3RlY3RzIHRoZSB1c2VyIGZyb20gcmF0aW8gdHJvdWJsZXMgYnkgYWRkaW5nIHdhcm5pbmdzIGFuZCBkaXNwbGF5aW5nIHJhdGlvIGRlbHRhXHJcbiAqL1xyXG5jbGFzcyBSYXRpb1Byb3RlY3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdCcsXHJcbiAgICAgICAgZGVzYzogYFByb3RlY3QgeW91ciByYXRpbyB3aXRoIHdhcm5pbmdzICZhbXA7IHJhdGlvIGNhbGN1bGF0aW9uc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcclxuICAgIHByaXZhdGUgX3JjUm93OiBzdHJpbmcgPSAnbXBfcmF0aW9Db3N0Um93JztcclxuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxpbmcgcmF0aW8gcHJvdGVjdGlvbi4uLicpO1xyXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdGhpcyBibG9jayB0byBzaGFyZWRcclxuICAgICAgICAvLyBUaGUgZG93bmxvYWQgdGV4dCBhcmVhXHJcbiAgICAgICAgY29uc3QgZGxCdG46IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0ZGRsJyk7XHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnRseSB1bnVzZWQgbGFiZWwgYXJlYSBhYm92ZSB0aGUgZG93bmxvYWQgdGV4dFxyXG4gICAgICAgIGNvbnN0IGRsTGFiZWw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjZG93bmxvYWQgLnRvckRldElubmVyVG9wJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gSW5zZXJ0aW9uIHRhcmdldCBmb3IgbWVzc2FnZXNcclxuICAgICAgICBjb25zdCBkZXNjQmxvY2sgPSBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLnRvckRldEJvdHRvbScpO1xyXG4gICAgICAgIC8vIFdvdWxkIGJlY29tZSByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJOZXc6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICAvLyBDdXJyZW50IHJhdGlvXHJcbiAgICAgICAgY29uc3QgckN1cjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKTtcclxuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXHJcbiAgICAgICAgY29uc3Qgc2VlZGluZzogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNETGhpc3RvcnknKTtcclxuICAgICAgICAvLyBVc2VyIGhhcyBhIHJhdGlvXHJcbiAgICAgICAgY29uc3QgdXNlckhhc1JhdGlvID0gckN1ci50ZXh0Q29udGVudC5pbmRleE9mKCdJbmYnKSA8IDAgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgY3VzdG9tIHJhdGlvIGFtb3VudHMgKHdpbGwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzIG90aGVyd2lzZSlcclxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSBhd2FpdCB0aGlzLl9zaGFyZS5nZXRSYXRpb1Byb3RlY3RMZXZlbHMoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBSYXRpbyBwcm90ZWN0aW9uIGxldmVscyBzZXQgdG86ICR7cjF9LCAke3IyfSwgJHtyM31gKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBib3ggd2Ugd2lsbCBkaXNwbGF5IHRleHQgaW5cclxuICAgICAgICBpZiAoZGVzY0Jsb2NrKSB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBsaW5lIHVuZGVyIFRvcnJlbnQ6IGRldGFpbCBmb3IgQ29zdCBkYXRhIFwiQ29zdCB0byBSZXN0b3JlIFJhdGlvXCJcclxuICAgICAgICAgICAgZGVzY0Jsb2NrLmluc2VydEFkamFjZW50SFRNTChcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cInRvckRldFJvd1wiIGlkPVwibXBfcm93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj5Db3N0IHRvIFJlc3RvcmUgUmF0aW88L2Rpdj48ZGl2IGNsYXNzPVwidG9yRGV0UmlnaHQgJHt0aGlzLl9yY1Jvd31cIiBzdHlsZT1cImZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O1wiPjxzcGFuIGlkPVwibXBfZm9vYmFyXCI+PC9zcGFuPjwvZGl2PjwvZGl2PmBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcudG9yRGV0Um93IGlzICR7ZGVzY0Jsb2NrfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gT25seSBydW4gdGhlIGNvZGUgaWYgdGhlIHJhdGlvIGV4aXN0c1xyXG4gICAgICAgIGlmIChyTmV3ICYmIHJDdXIgJiYgIXNlZWRpbmcgJiYgdXNlckhhc1JhdGlvKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJEaWZmID0gVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gLSBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRylcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgIGBDdXJyZW50ICR7VXRpbC5leHRyYWN0RmxvYXQockN1cilbMF19IHwgTmV3ICR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSB8IERpZiAke3JEaWZmfWBcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IGFjdGl2YXRlIGlmIGEgcmF0aW8gY2hhbmdlIGlzIGV4cGVjdGVkXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ockRpZmYpICYmIHJEaWZmID4gMC4wMDkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkbExhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5pbm5lckhUTUwgPSBgUmF0aW8gbG9zcyAke3JEaWZmLnRvRml4ZWQoMil9YDtcclxuICAgICAgICAgICAgICAgICAgICBkbExhYmVsLnN0eWxlLmZvbnRXZWlnaHQgPSAnbm9ybWFsJzsgLy9UbyBkaXN0aW5ndWlzaCBmcm9tIEJPTEQgVGl0bGVzXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlICYgRGlzcGxheSBjb3N0IG9mIGRvd25sb2FkIHcvbyBGTFxyXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIHNob3cgY2FsY3VsYXRpb25zIHdoZW4gdGhlcmUgaXMgYSByYXRpbyBsb3NzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzaXplRWxlbTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJyNzaXplIHNwYW4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNpemVFbGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IHNpemVFbGVtLnRleHRDb250ZW50IS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemVNYXAgPSBbJ0J5dGVzJywgJ0tpQicsICdNaUInLCAnR2lCJywgJ1RpQiddO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgaHVtYW4gcmVhZGFibGUgc2l6ZSB0byBieXRlc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ5dGVTaXplZCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlcihzaXplWzBdKSAqIE1hdGgucG93KDEwMjQsIHNpemVNYXAuaW5kZXhPZihzaXplWzFdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjb3ZlcnkgPSBieXRlU2l6ZWQgKiBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb2ludEFtbnQgPSBNYXRoLmZsb29yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMTI1ICogcmVjb3ZlcnkpIC8gMjY4NDM1NDU2XHJcbiAgICAgICAgICAgICAgICAgICAgKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRheUFtb3VudCA9IE1hdGguZmxvb3IoKDUgKiByZWNvdmVyeSkgLyAyMTQ3NDgzNjQ4KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWRnZVN0b3JlQ29zdCA9IFV0aWwuZm9ybWF0Qnl0ZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgyNjg0MzU0NTYgKiA1MDAwMCkgLyAoVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gKiAxMjUpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3ZWRnZVZhdWx0Q29zdCA9IFV0aWwuZm9ybWF0Qnl0ZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgyNjg0MzU0NTYgKiAyMDApIC8gKFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdICogMTI1KVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmF0aW8gY29zdCByb3dcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7dGhpcy5fcmNSb3d9YFxyXG4gICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IGA8c3Bhbj48Yj4ke1V0aWwuZm9ybWF0Qnl0ZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY292ZXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgKX08L2I+Jm5ic3A7dXBsb2FkICgke3BvaW50QW1udH0gQlA7IG9yIG9uZSBGTCB3ZWRnZSBwZXIgZGF5IGZvciAke2RheUFtb3VudH0gZGF5cykuJm5ic3A7PGFiYnIgdGl0bGU9J0NvbnRyaWJ1dGluZyAyLDAwMCBCUCB0byBlYWNoIHZhdWx0IGN5Y2xlIGdpdmVzIHlvdSBhbG1vc3Qgb25lIEZMIHdlZGdlIHBlciBkYXkgb24gYXZlcmFnZS4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+V2VkZ2Ugc3RvcmUgcHJpY2U6IDxpPiR7d2VkZ2VTdG9yZUNvc3R9PC9pPiZuYnNwOzxhYmJyIHRpdGxlPSdJZiB5b3UgYnV5IHdlZGdlcyBmcm9tIHRoZSBzdG9yZSwgdGhpcyBpcyBob3cgbGFyZ2UgYSB0b3JyZW50IG11c3QgYmUgdG8gYnJlYWsgZXZlbiBvbiB0aGUgY29zdCAoNTAsMDAwIEJQKSBvZiBhIHNpbmdsZSB3ZWRnZS4nIHN0eWxlPSd0ZXh0LWRlY29yYXRpb246bm9uZTtjdXJzb3I6aGVscDsnPiYjMTI4NzEyOzwvYWJicj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+V2VkZ2UgdmF1bHQgcHJpY2U6IDxpPiR7d2VkZ2VWYXVsdENvc3R9PC9pPiZuYnNwOzxhYmJyIHRpdGxlPSdJZiB5b3UgY29udHJpYnV0ZSB0byB0aGUgdmF1bHQsIHRoaXMgaXMgaG93IGxhcmdlIGEgdG9ycmVudCBtdXN0IGJlIHRvIGJyZWFrIGV2ZW4gb24gdGhlIGNvc3QgKDIwMCBCUCkgb2YgMTAgd2VkZ2VzIGZvciB0aGUgbWF4aW11bSBjb250cmlidXRpb24gb2YgMiwwMDAgQlAuJyBzdHlsZT0ndGV4dC1kZWNvcmF0aW9uOm5vbmU7Y3Vyc29yOmhlbHA7Jz4mIzEyODcxMjs8L2FiYnI+PC9zcGFuPmA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3R5bGUgdGhlIGRvd25sb2FkIGJ1dHRvbiBiYXNlZCBvbiBSYXRpbyBQcm90ZWN0IGxldmVsIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICBpZiAoZGxCdG4gJiYgZGxMYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICogVGhpcyBpcyB0aGUgXCJ0cml2aWFsIHJhdGlvIGxvc3NcIiB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBjaGFuZ2VzIHdpbGwgYWx3YXlzIGhhcHBlbiBpZiB0aGUgcmF0aW8gY29uZGl0aW9ucyBhcmUgbWV0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJEaWZmID4gcjEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICcxX25vdGlmeScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gKiBUaGlzIGlzIHRoZSBcIkkgbmV2ZXIgd2FudCB0byBkbCB3L28gRkxcIiB0aHJlc2hvbGRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGFsc28gdXNlcyB0aGUgTWluaW11bSBSYXRpbywgaWYgZW5hYmxlZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxzbyBwcmV2ZW50cyBnb2luZyBiZWxvdyAyIHJhdGlvIChQVSByZXF1aXJlbWVudClcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIGRpc2FibGUgYnV0dG9uIHdpdGggYnV5IEZMIGJ1dHRvblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJEaWZmID4gcjMgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCBHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TWluX3ZhbCcpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgMlxyXG4gICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRCdXR0b25TdGF0ZShkbEJ0biwgJzNfYWxlcnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKiBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyRGlmZiA+IHIyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEJ1dHRvblN0YXRlKGRsQnRuLCAnMl93YXJuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSB1c2VyIGRvZXMgbm90IGhhdmUgYSByYXRpbywgZGlzcGxheSBhIHNob3J0IG1lc3NhZ2VcclxuICAgICAgICB9IGVsc2UgaWYgKCF1c2VySGFzUmF0aW8pIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0QnV0dG9uU3RhdGUoZGxCdG4sICcxX25vdGlmeScpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgYC4ke3RoaXMuX3JjUm93fWBcclxuICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gYDxzcGFuPlJhdGlvIHBvaW50cyBhbmQgY29zdCB0byByZXN0b3JlIHJhdGlvIHdpbGwgYXBwZWFyIGhlcmUgYWZ0ZXIgeW91ciByYXRpbyBpcyBhIHJlYWwgbnVtYmVyLjwvc3Bhbj5gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRCdXR0b25TdGF0ZShcclxuICAgICAgICB0YXI6IEhUTUxBbmNob3JFbGVtZW50LFxyXG4gICAgICAgIHN0YXRlOiAnMV9ub3RpZnknIHwgJzJfd2FybicgfCAnM19hbGVydCcsXHJcbiAgICAgICAgbGFiZWw/OiBIVE1MRGl2RWxlbWVudFxyXG4gICAgKSB7XHJcbiAgICAgICAgaWYgKHN0YXRlID09PSAnMV9ub3RpZnknKSB7XHJcbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnU3ByaW5nR3JlZW4nO1xyXG4gICAgICAgICAgICB0YXIuc3R5bGUuY29sb3IgPSAnYmxhY2snO1xyXG4gICAgICAgICAgICB0YXIuaW5uZXJIVE1MID0gJ0Rvd25sb2FkPyc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJzJfd2FybicpIHtcclxuICAgICAgICAgICAgdGFyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICB0YXIuaW5uZXJIVE1MID0gJ1N1Z2dlc3QgRkwnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICczX2FsZXJ0Jykge1xyXG4gICAgICAgICAgICBpZiAoIWxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vIGxhYmVsIHByb3ZpZGVkIGluIF9zZXRCdXR0b25TdGF0ZSgpIWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnUmVkJztcclxuICAgICAgICAgICAgdGFyLnN0eWxlLmN1cnNvciA9ICduby1kcm9wJztcclxuICAgICAgICAgICAgdGFyLmlubmVySFRNTCA9ICdGTCBOZWVkZWQnO1xyXG4gICAgICAgICAgICBsYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdGUgXCIke3N0YXRlfVwiIGRvZXMgbm90IGV4aXN0LmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIExvdyByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMScsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMScsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAwLjUnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIHNtYWxsZXN0IHRocmVzaGhvbGQgdG8gaW5kaWNhdGUgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgc2xpZ2h0IGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gUmF0aW8gUHJvdGVjdGlvbiBMMSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogTWVkaXVtIHJhdGlvIHByb3RlY3Rpb24gYW1vdW50XHJcbiAqL1xyXG5jbGFzcyBSYXRpb1Byb3RlY3RMMiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdEwyJyxcclxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwyJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDEnLFxyXG4gICAgICAgIGRlc2M6IGBTZXQgdGhlIG1lZGlhbiB0aHJlc2hob2xkIHRvIHdhcm4gb2YgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGlzIGEgbm90aWNlYWJsZSBjb2xvciBjaGFuZ2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gTDIhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAqIEhpZ2ggcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdEwzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDMnLFxyXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDMnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMicsXHJcbiAgICAgICAgZGVzYzogYFNldCB0aGUgaGlnaGVzdCB0aHJlc2hob2xkIHRvIHByZXZlbnQgcmF0aW8gY2hhbmdlcy4gKDxlbT5UaGlzIGRpc2FibGVzIGRvd25sb2FkIHdpdGhvdXQgRkwgdXNlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIEwzIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBSYXRpb1Byb3RlY3RNaW4gaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RNaW4nLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHRhZzogJ01pbmltdW0gUmF0aW8nLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMCcsXHJcbiAgICAgICAgZGVzYzogJ1RyaWdnZXIgUmF0aW8gV2FybiBMMyBpZiB5b3VyIHJhdGlvIHdvdWxkIGRyb3AgYmVsb3cgdGhpcyBudW1iZXIuJyxcclxuICAgIH07XHJcbiAgICAvLyBBbiBlbGVtZW50IHRoYXQgbXVzdCBleGlzdCBpbiBvcmRlciBmb3IgdGhlIGZlYXR1cmUgdG8gcnVuXHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIG1pbmltdW0hJyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUmF0aW9Qcm90ZWN0SWNvbnMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdEljb25zJyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIGN1c3RvbSBicm93c2VyIGZhdmljb25zIGJhc2VkIG9uIFJhdGlvIFByb3RlY3QgY29uZGl0aW9ucz8nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XHJcbiAgICBwcml2YXRlIF91c2VySUQ6IG51bWJlciA9IDE2NDEwOTtcclxuICAgIHByaXZhdGUgX3NoYXJlID0gbmV3IFNoYXJlZCgpO1xyXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgYFtNK10gRW5hYmxpbmcgY3VzdG9tIFJhdGlvIFByb3RlY3QgZmF2aWNvbnMgZnJvbSB1c2VyICR7dGhpcy5fdXNlcklEfS4uLmBcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIGN1c3RvbSByYXRpbyBhbW91bnRzICh3aWxsIHJldHVybiBkZWZhdWx0IHZhbHVlcyBvdGhlcndpc2UpXHJcbiAgICAgICAgY29uc3QgW3IxLCByMiwgcjNdID0gYXdhaXQgdGhpcy5fc2hhcmUuZ2V0UmF0aW9Qcm90ZWN0TGV2ZWxzKCk7XHJcbiAgICAgICAgLy8gV291bGQgYmVjb21lIHJhdGlvXHJcbiAgICAgICAgY29uc3Qgck5ldzogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIC8vIEN1cnJlbnQgcmF0aW9cclxuICAgICAgICBjb25zdCByQ3VyOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RtUicpO1xyXG4gICAgICAgIC8vIERpZmZlcmVuY2UgYmV0d2VlbiBuZXcgYW5kIG9sZCByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJEaWZmID0gVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF0gLSBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXTtcclxuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXHJcbiAgICAgICAgY29uc3Qgc2VlZGluZzogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNETGhpc3RvcnknKTtcclxuICAgICAgICAvLyBWSVAgc3RhdHVzXHJcbiAgICAgICAgY29uc3Qgdmlwc3RhdDogc3RyaW5nIHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjcmF0aW8gLnRvckRldElubmVyQm90dG9tU3BhbidcclxuICAgICAgICApXHJcbiAgICAgICAgICAgID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JhdGlvIC50b3JEZXRJbm5lckJvdHRvbVNwYW4nKS50ZXh0Q29udGVudFxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICAgICAgLy8gQm9va2NsdWIgc3RhdHVzXHJcbiAgICAgICAgY29uc3QgYm9va2NsdWI6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICBcImRpdltpZD0nYmNmbCddIHNwYW5cIlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEZpbmQgZmF2aWNvbiBsaW5rcyBhbmQgbG9hZCBhIHNpbXBsZSBkZWZhdWx0LlxyXG4gICAgICAgIGNvbnN0IHNpdGVGYXZpY29ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaW5rW3JlbCQ9J2ljb24nXVwiKSBhcyBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MTGlua0VsZW1lbnRcclxuICAgICAgICA+O1xyXG4gICAgICAgIGlmIChzaXRlRmF2aWNvbnMpIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ3RtXzMyeDMyJyk7XHJcblxyXG4gICAgICAgIC8vIFRlc3QgaWYgVklQXHJcbiAgICAgICAgaWYgKHZpcHN0YXQpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgVklQID0gJHt2aXBzdGF0fWApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHZpcHN0YXQuc2VhcmNoKCdWSVAgZXhwaXJlcycpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ21vdXNlY2xvY2snKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcclxuICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXHJcbiAgICAgICAgICAgICAgICAgICAgYCB8IEV4cGlyZXMgJHt2aXBzdGF0LnN1YnN0cmluZygyNil9YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh2aXBzdGF0LnNlYXJjaCgnVklQIG5vdCBzZXQgdG8gZXhwaXJlJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnMGNpcicpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcclxuICAgICAgICAgICAgICAgICAgICAnIHwgTm90IHNldCB0byBleHBpcmUnXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdUaGlzIHRvcnJlbnQgaXMgZnJlZWxlZWNoIScpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ21vdXNlY2xvY2snKTtcclxuICAgICAgICAgICAgICAgIC8vIFRlc3QgaWYgYm9va2NsdWJcclxuICAgICAgICAgICAgICAgIGlmIChib29rY2x1YiAmJiBib29rY2x1Yi50ZXh0Q29udGVudC5zZWFyY2goJ0Jvb2tjbHViIEZyZWVsZWVjaCcpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYCB8IENsdWIgZXhwaXJlcyAke2Jvb2tjbHViLnRleHRDb250ZW50LnN1YnN0cmluZygyNSl9YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiB8ICd0aWxsIG5leHQgU2l0ZSBGTFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IENhbGN1bGF0ZSB3aGVuIEZMIGVuZHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYCB8ICd0aWxsICR7dGhpcy5fbmV4dEZMRGF0ZSgpfWBcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUZXN0IGlmIHNlZWRpbmcvZG93bmxvYWRpbmdcclxuICAgICAgICBpZiAoc2VlZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcxM2VnZycpO1xyXG4gICAgICAgICAgICAvLyAqIFNpbWlsYXIgaWNvbnM6IDEzc2VlZDgsIDEzc2VlZDcsIDEzZWdnLCAxMywgMTNjaXIsIDEzV2hpdGVDaXJcclxuICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdUaGlzIHRvcnJlbnQgaXMgcGVyc29uYWwgZnJlZWxlZWNoJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICc1Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUZXN0IGlmIHRoZXJlIHdpbGwgYmUgcmF0aW8gbG9zc1xyXG4gICAgICAgIGlmIChyTmV3ICYmIHJDdXIgJiYgIXNlZWRpbmcpIHtcclxuICAgICAgICAgICAgLy8gQ2hhbmdlIGljb24gYmFzZWQgb24gUmF0aW8gUHJvdGVjdCBzdGF0ZXNcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgckRpZmYgPiByMyB8fFxyXG4gICAgICAgICAgICAgICAgVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF0gPCBHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TWluX3ZhbCcpIHx8XHJcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IDJcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcxMicpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzNRbW91c2UnKTtcclxuICAgICAgICAgICAgICAgIC8vIEFsc28gdHJ5IE9yYW5nZSwgT3JhbmdlUmVkLCBHb2xkLCBvciAxNFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ1NwcmluZ0dyZWVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGZ1dHVyZSBWSVBcclxuICAgICAgICAgICAgaWYgKHZpcHN0YXQuc2VhcmNoKCdPbiBsaXN0IGZvciBuZXh0IEZMIHBpY2snKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICdNaXJyb3JHcmVlbkNsb2NrJyk7IC8vIEFsc28gdHJ5IGdyZWVuY2xvY2tcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcclxuICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyB8IE5leHQgRkwgcGljaydcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEN1c3RvbSBSYXRpbyBQcm90ZWN0IGZhdmljb25zIGVuYWJsZWQhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogRnVuY3Rpb24gZm9yIGNhbGN1bGF0aW5nIHdoZW4gRkwgZW5kc1xyXG4gICAgLy8gPyBIb3cgYXJlIHdlIGFibGUgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIGN1cnJlbnQgRkwgcGVyaW9kIHN0YXJ0ZWQ/XHJcbiAgICAvKiBwcml2YXRlIGFzeW5jIF9uZXh0RkxEYXRlKCkge1xyXG4gICAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSgnSnVuIDE0LCAyMDIyIDAwOjAwOjAwIFVUQycpOyAvLyBzZWVkIGRhdGUgb3ZlciB0d28gd2Vla3MgYWdvXHJcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTsgLy9QbGFjZSB0ZXN0IGRhdGVzIGhlcmUgbGlrZSBEYXRlKFwiSnVsIDE0LCAyMDIyIDAwOjAwOjAwIFVUQ1wiKVxyXG4gICAgICAgIGxldCBtc3NpbmNlID0gbm93LmdldFRpbWUoKSAtIGQuZ2V0VGltZSgpOyAvL3RpbWUgc2luY2UgRkwgc3RhcnQgc2VlZCBkYXRlXHJcbiAgICAgICAgbGV0IGRheXNzaW5jZSA9IG1zc2luY2UgLyA4NjQwMDAwMDtcclxuICAgICAgICBsZXQgcSA9IE1hdGguZmxvb3IoZGF5c3NpbmNlIC8gMTQpOyAvLyBGTCBwZXJpb2RzIHNpbmNlIHNlZWQgZGF0ZVxyXG5cclxuICAgICAgICBjb25zdCBhZGREYXlzID0gKGRhdGUsIGRheXMpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudC5zZXREYXRlKGN1cnJlbnQuZ2V0RGF0ZSgpICsgZGF5cyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRcclxuICAgICAgICAgICAgLmFkZERheXMocSAqIDE0ICsgMTQpXHJcbiAgICAgICAgICAgIC50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIC5zdWJzdHIoMCwgMTApO1xyXG4gICAgfSAqL1xyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2J1aWxkSWNvbkxpbmtzKGVsZW1zOiBOb2RlTGlzdE9mPEhUTUxMaW5rRWxlbWVudD4sIGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBlbGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IGBodHRwczovL2Nkbi5teWFub25hbW91c2UubmV0L2ltYWdlYnVja2V0LyR7dGhpcy5fdXNlcklEfS8ke2ZpbGVuYW1lfS5wbmdgO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdXNlcklEKG5ld0lEOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl91c2VySUQgPSBuZXdJRDtcclxuICAgIH1cclxufVxyXG5cclxuLy8gVE9ETzogQWRkIGZlYXR1cmUgdG8gc2V0IFJhdGlvUHJvdGVjdEljb24ncyBgX3VzZXJJRGAgdmFsdWUuIE9ubHkgbmVjZXNzYXJ5IG9uY2Ugb3RoZXIgaWNvbiBzZXRzIGV4aXN0LlxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogI1VQTE9BRCBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBlYXNpZXIgY2hlY2tpbmcgZm9yIGR1cGxpY2F0ZSB1cGxvYWRzXHJcbiAqL1xyXG5cclxuY2xhc3MgU2VhcmNoRm9yRHVwbGljYXRlcyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc2VhcmNoRm9yRHVwbGljYXRlcycsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXBsb2FkIFBhZ2UnXSxcclxuICAgICAgICBkZXNjOiAnRWFzaWVyIHNlYXJjaGluZyBmb3IgZHVwbGljYXRlcyB3aGVuIHVwbG9hZGluZyBjb250ZW50JyxcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3VwbG9hZEZvcm0gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1cGxvYWQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xyXG5cclxuICAgICAgICBpZiAocGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIHRpdGxlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXRbbmFtZT1cInRvclt0aXRsZV1cIl0nLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDcsXHJcbiAgICAgICAgICAgICAgICB1c2VXaWxkY2FyZDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIGF1dGhvcihzKScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXV0aG9yJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19hdXRob3InLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDEwLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gc2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdzZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX3NlcmllcycsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTEsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBuYXJyYXRvcihzKScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbmFycmF0b3InLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX25hcnJhdG9yJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBzZWFyY2ggdG8gdXBsb2FkcyFgKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgIHRpdGxlLFxyXG4gICAgICAgIHR5cGUsXHJcbiAgICAgICAgaW5wdXRTZWxlY3RvcixcclxuICAgICAgICByb3dQb3NpdGlvbixcclxuICAgICAgICB1c2VXaWxkY2FyZCA9IGZhbHNlLFxyXG4gICAgfToge1xyXG4gICAgICAgIHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICAgICAgdHlwZTogc3RyaW5nO1xyXG4gICAgICAgIGlucHV0U2VsZWN0b3I6IHN0cmluZztcclxuICAgICAgICByb3dQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgICAgIHVzZVdpbGRjYXJkPzogYm9vbGVhbjtcclxuICAgIH0pIHtcclxuICAgICAgICBjb25zdCBzZWFyY2hFbGVtZW50OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoRWxlbWVudCwge1xyXG4gICAgICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnLFxyXG4gICAgICAgICAgICBzdHlsZTogJ3RleHQtZGVjb3JhdGlvbjogbm9uZTsgY3Vyc29yOiBwb2ludGVyOycsXHJcbiAgICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlYXJjaEVsZW1lbnQudGV4dENvbnRlbnQgPSAnIPCflI0nO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rQmFzZSA9IGAvdG9yL2Jyb3dzZS5waHA/dG9yJTVCc2VhcmNoVHlwZSU1RD1hbGwmdG9yJTVCc2VhcmNoSW4lNUQ9dG9ycmVudHMmdG9yJTVCY2F0JTVEJTVCJTVEPTAmdG9yJTVCYnJvd3NlRmxhZ3NIaWRlVnNTaG93JTVEPTAmdG9yJTVCc29ydFR5cGUlNUQ9ZGF0ZURlc2MmdG9yJTVCc3JjaEluJTVEJTVCJHt0eXBlfSU1RD10cnVlJnRvciU1QnRleHQlNUQ9YDtcclxuXHJcbiAgICAgICAgcGFyZW50RWxlbWVudFxyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgIGAjdXBsb2FkRm9ybSA+IHRib2R5ID4gdHI6bnRoLWNoaWxkKCR7cm93UG9zaXRpb259KSA+IHRkOm50aC1jaGlsZCgxKWBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICA/Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgc2VhcmNoRWxlbWVudCk7XHJcblxyXG4gICAgICAgIHNlYXJjaEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXRzOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudFxyXG4gICAgICAgICAgICA+IHwgbnVsbCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChpbnB1dFNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dHMgJiYgaW5wdXRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRzTGlzdDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzTGlzdC5wdXNoKGlucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IGlucHV0c0xpc3Quam9pbignICcpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2hTdHJpbmcgPSB1c2VXaWxkY2FyZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAqJHtlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpfSpgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0c0xpc3Quam9pbignICcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBsaW5rQmFzZSArIHNlYXJjaFN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICMgVVNFUiBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqICMjIyMgRGVmYXVsdCBVc2VyIEdpZnQgQW1vdW50XHJcbiAqL1xyXG5jbGFzcyBVc2VyR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnREZWZhdWx0JyxcclxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMDAsIG1heCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNib251c2dpZnQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIyBVc2VyIEdpZnQgSGlzdG9yeVxyXG4gKi9cclxuY2xhc3MgVXNlckdpZnRIaXN0b3J5IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdEhpc3RvcnknLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcclxuICAgICAgICBkZXNjOiAnRGlzcGxheSBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB5b3UgYW5kIGFub3RoZXIgdXNlcicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfc2VuZFN5bWJvbCA9IGA8c3BhbiBzdHlsZT0nY29sb3I6b3JhbmdlJyB0aXRsZT0nc2VudCc+XFx1MjdGMDwvc3Bhbj5gO1xyXG4gICAgcHJpdmF0ZSBfZ2V0U3ltYm9sID0gYDxzcGFuIHN0eWxlPSdjb2xvcjp0ZWFsJyB0aXRsZT0ncmVjZWl2ZWQnPlxcdTI3RjE8L3NwYW4+YDtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJ3Rib2R5JztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5pdGlhbGxpemluZyB1c2VyIGdpZnQgaGlzdG9yeS4uLicpO1xyXG5cclxuICAgICAgICAvLyBOYW1lIG9mIHRoZSBvdGhlciB1c2VyXHJcbiAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gaDEnKSEudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSByb3dcclxuICAgICAgICBjb25zdCBoaXN0b3J5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBjb25zdCBpbnNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgdGJvZHkgdHI6bGFzdC1vZi10eXBlJyk7XHJcbiAgICAgICAgaWYgKGluc2VydCkgaW5zZXJ0Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCBoaXN0b3J5Q29udGFpbmVyKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSB0aXRsZSBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgaGlzdG9yeVRpdGxlLmNsYXNzTGlzdC5hZGQoJ3Jvd2hlYWQnKTtcclxuICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnR2lmdCBoaXN0b3J5JztcclxuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlUaXRsZSk7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3RvcnkgY29udGVudCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgICAgIGhpc3RvcnlCb3guY2xhc3NMaXN0LmFkZCgncm93MScpO1xyXG4gICAgICAgIGhpc3RvcnlCb3gudGV4dENvbnRlbnQgPSBgWW91IGhhdmUgbm90IGV4Y2hhbmdlZCBnaWZ0cyB3aXRoICR7b3RoZXJVc2VyfS5gO1xyXG4gICAgICAgIGhpc3RvcnlCb3guYWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5Qm94KTtcclxuICAgICAgICAvLyBHZXQgdGhlIFVzZXIgSURcclxuICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcclxuXHJcbiAgICAgICAgY29uc3QgY3VycmVudFVzZXJJRCA9IFV0aWwuZ2V0Q3VycmVudFVzZXJJRCgpO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiB1c2UgYGNkbi5gIGluc3RlYWQgb2YgYHd3dy5gOyBjdXJyZW50bHkgY2F1c2VzIGEgNDAzIGVycm9yXHJcbiAgICAgICAgaWYgKHVzZXJJRCkge1xyXG4gICAgICAgICAgICBpZiAodXNlcklEID09PSBjdXJyZW50VXNlcklEKSB7XHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnUmVjZW50IEdpZnQgSGlzdG9yeSc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faGlzdG9yeVdpdGhBbGwoaGlzdG9yeUJveCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlXaXRoVXNlcklEKHVzZXJJRCwgaGlzdG9yeUJveCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVc2VyIElEIG5vdCBmb3VuZDogJHt1c2VySUR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBGaWxsIG91dCBoaXN0b3J5IGJveFxyXG4gICAgICogQHBhcmFtIHVzZXJJRCB0aGUgdXNlciB0byBnZXQgaGlzdG9yeSBmcm9tXHJcbiAgICAgKiBAcGFyYW0gaGlzdG9yeUJveCB0aGUgYm94IHRvIHB1dCBpdCBpblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9oaXN0b3J5V2l0aFVzZXJJRCh1c2VySUQ6IHN0cmluZywgaGlzdG9yeUJveDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAvLyBHZXQgdGhlIGdpZnQgaGlzdG9yeVxyXG4gICAgICAgIGNvbnN0IGdpZnRIaXN0b3J5ID0gYXdhaXQgVXRpbC5nZXRVc2VyR2lmdEhpc3RvcnkodXNlcklEKTtcclxuICAgICAgICAvLyBPbmx5IGRpc3BsYXkgYSBsaXN0IGlmIHRoZXJlIGlzIGEgaGlzdG9yeVxyXG4gICAgICAgIGlmIChnaWZ0SGlzdG9yeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIFBvaW50ICYgRkwgdG90YWwgdmFsdWVzXHJcbiAgICAgICAgICAgIGNvbnN0IFtwb2ludHNJbiwgcG9pbnRzT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFBvaW50cycpO1xyXG4gICAgICAgICAgICBjb25zdCBbd2VkZ2VJbiwgd2VkZ2VPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0V2VkZ2UnKTtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUG9pbnRzIEluL091dDogJHtwb2ludHNJbn0vJHtwb2ludHNPdXR9YCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2VkZ2VzIEluL091dDogJHt3ZWRnZUlufS8ke3dlZGdlT3V0fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG90aGVyVXNlciA9IGdpZnRIaXN0b3J5WzBdLm90aGVyX25hbWU7XHJcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbWVzc2FnZVxyXG4gICAgICAgICAgICBoaXN0b3J5Qm94LmlubmVySFRNTCA9IGBZb3UgaGF2ZSBzZW50ICR7dGhpcy5fc2VuZFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c091dH0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZU91dH0gRkwgd2VkZ2VzPC9zdHJvbmc+IHRvICR7b3RoZXJVc2VyfSBhbmQgcmVjZWl2ZWQgJHt0aGlzLl9nZXRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNJbn0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZUlufSBGTCB3ZWRnZXM8L3N0cm9uZz4uPGhyPmA7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbWVzc2FnZSB0byB0aGUgYm94XHJcbiAgICAgICAgICAgIGhpc3RvcnlCb3guYXBwZW5kQ2hpbGQodGhpcy5fc2hvd0dpZnRzKGdpZnRIaXN0b3J5KSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFVzZXIgZ2lmdCBoaXN0b3J5IGFkZGVkIScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE5vIHVzZXIgZ2lmdCBoaXN0b3J5IGZvdW5kIHdpdGggJHt1c2VySUR9LmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgRmlsbCBvdXQgaGlzdG9yeSBib3hcclxuICAgICAqIEBwYXJhbSBoaXN0b3J5Qm94IHRoZSBib3ggdG8gcHV0IGl0IGluXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgX2hpc3RvcnlXaXRoQWxsKGhpc3RvcnlCb3g6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgLy8gR2V0IHRoZSBnaWZ0IGhpc3RvcnlcclxuICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeSA9IGF3YWl0IFV0aWwuZ2V0QWxsVXNlckdpZnRIaXN0b3J5KCk7XHJcbiAgICAgICAgLy8gT25seSBkaXNwbGF5IGEgbGlzdCBpZiB0aGVyZSBpcyBhIGhpc3RvcnlcclxuICAgICAgICBpZiAoZ2lmdEhpc3RvcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBQb2ludCAmIEZMIHRvdGFsIHZhbHVlc1xyXG4gICAgICAgICAgICBjb25zdCBbcG9pbnRzSW4sIHBvaW50c091dF0gPSB0aGlzLl9zdW1HaWZ0cyhnaWZ0SGlzdG9yeSwgJ2dpZnRQb2ludHMnKTtcclxuICAgICAgICAgICAgY29uc3QgW3dlZGdlSW4sIHdlZGdlT3V0XSA9IHRoaXMuX3N1bUdpZnRzKGdpZnRIaXN0b3J5LCAnZ2lmdFdlZGdlJyk7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBvaW50cyBJbi9PdXQ6ICR7cG9pbnRzSW59LyR7cG9pbnRzT3V0fWApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFdlZGdlcyBJbi9PdXQ6ICR7d2VkZ2VJbn0vJHt3ZWRnZU91dH1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG1lc3NhZ2VcclxuICAgICAgICAgICAgaGlzdG9yeUJveC5pbm5lckhUTUwgPSBgWW91IGhhdmUgc2VudCAke3RoaXMuX3NlbmRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNPdXR9IHBvaW50czwvc3Ryb25nPiAmYW1wOyA8c3Ryb25nPiR7d2VkZ2VPdXR9IEZMIHdlZGdlczwvc3Ryb25nPiBhbmQgcmVjZWl2ZWQgJHt0aGlzLl9nZXRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNJbn0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZUlufSBGTCB3ZWRnZXM8L3N0cm9uZz4uPGhyPmA7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbWVzc2FnZSB0byB0aGUgYm94XHJcbiAgICAgICAgICAgIGhpc3RvcnlCb3guYXBwZW5kQ2hpbGQodGhpcy5fc2hvd0dpZnRzKGdpZnRIaXN0b3J5KSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFVzZXIgZ2lmdCBoaXN0b3J5IGFkZGVkIScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE5vIHVzZXIgZ2lmdCBoaXN0b3J5IGZvdW5kIGZvciBjdXJyZW50IHVzZXIuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMjIyBTdW0gdGhlIHZhbHVlcyBvZiBhIGdpdmVuIGdpZnQgdHlwZSBhcyBJbmZsb3cgJiBPdXRmbG93IHN1bXNcclxuICAgICAqIEBwYXJhbSBoaXN0b3J5IHRoZSB1c2VyIGdpZnQgaGlzdG9yeVxyXG4gICAgICogQHBhcmFtIHR5cGUgcG9pbnRzIG9yIHdlZGdlc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zdW1HaWZ0cyhcclxuICAgICAgICBoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSxcclxuICAgICAgICB0eXBlOiAnZ2lmdFBvaW50cycgfCAnZ2lmdFdlZGdlJ1xyXG4gICAgKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgY29uc3Qgb3V0ZmxvdyA9IFswXTtcclxuICAgICAgICBjb25zdCBpbmZsb3cgPSBbMF07XHJcbiAgICAgICAgLy8gT25seSByZXRyaWV2ZSBhbW91bnRzIG9mIGEgc3BlY2lmaWVkIGdpZnQgdHlwZVxyXG4gICAgICAgIGhpc3RvcnkubWFwKChnaWZ0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09IHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNwbGl0IGludG8gSW5mbG93L091dGZsb3dcclxuICAgICAgICAgICAgICAgIGlmIChnaWZ0LmFtb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZsb3cucHVzaChnaWZ0LmFtb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dGZsb3cucHVzaChnaWZ0LmFtb3VudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBTdW0gYWxsIGl0ZW1zIGluIHRoZSBmaWx0ZXJlZCBhcnJheVxyXG4gICAgICAgIGNvbnN0IHN1bU91dCA9IG91dGZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XHJcbiAgICAgICAgY29uc3Qgc3VtSW4gPSBpbmZsb3cucmVkdWNlKChhY2N1bXVsYXRlLCBjdXJyZW50KSA9PiBhY2N1bXVsYXRlICsgY3VycmVudCk7XHJcbiAgICAgICAgcmV0dXJuIFtzdW1JbiwgTWF0aC5hYnMoc3VtT3V0KV07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENyZWF0ZXMgYSBsaXN0IG9mIHRoZSBtb3N0IHJlY2VudCBnaWZ0c1xyXG4gICAgICogQHBhcmFtIGhpc3RvcnkgVGhlIGZ1bGwgZ2lmdCBoaXN0b3J5IGJldHdlZW4gdHdvIHVzZXJzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Nob3dHaWZ0cyhoaXN0b3J5OiBVc2VyR2lmdEhpc3RvcnlbXSkge1xyXG4gICAgICAgIC8vIElmIHRoZSBnaWZ0IHdhcyBhIHdlZGdlLCByZXR1cm4gY3VzdG9tIHRleHRcclxuICAgICAgICBjb25zdCBfd2VkZ2VPclBvaW50cyA9IChnaWZ0OiBVc2VyR2lmdEhpc3RvcnkpOiBzdHJpbmcgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZ2lmdC50eXBlID09PSAnZ2lmdFBvaW50cycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtNYXRoLmFicyhnaWZ0LmFtb3VudCl9YDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0V2VkZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyhGTCknO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBFcnJvcjogdW5rbm93biBnaWZ0IHR5cGUuLi4gJHtnaWZ0LnR5cGV9OiAke2dpZnQuYW1vdW50fWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBhIGxpc3QgZm9yIHRoZSBoaXN0b3J5XHJcbiAgICAgICAgY29uc3QgaGlzdG9yeUxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24oaGlzdG9yeUxpc3Quc3R5bGUsIHtcclxuICAgICAgICAgICAgbGlzdFN0eWxlOiAnbm9uZScsXHJcbiAgICAgICAgICAgIHBhZGRpbmc6ICdpbml0aWFsJyxcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTBlbScsXHJcbiAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bycsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGhpc3RvcnkgaXRlbXMgYW5kIGFkZCB0byBhbiBhcnJheVxyXG4gICAgICAgIGNvbnN0IGdpZnRzOiBzdHJpbmdbXSA9IGhpc3RvcnlcclxuICAgICAgICAgICAgLmZpbHRlcigoZ2lmdCkgPT4gZ2lmdC50eXBlID09PSAnZ2lmdFBvaW50cycgfHwgZ2lmdC50eXBlID09PSAnZ2lmdFdlZGdlJylcclxuICAgICAgICAgICAgLm1hcCgoZ2lmdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHNvbWUgc3R5bGluZyBkZXBlbmRpbmcgb24gcG9zL25lZyBudW1iZXJzXHJcbiAgICAgICAgICAgICAgICBsZXQgZmFuY3lHaWZ0QW1vdW50OiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgICAgIGxldCBmcm9tVG86IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChnaWZ0LmFtb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBmYW5jeUdpZnRBbW91bnQgPSBgJHt0aGlzLl9nZXRTeW1ib2x9ICR7X3dlZGdlT3JQb2ludHMoZ2lmdCl9YDtcclxuICAgICAgICAgICAgICAgICAgICBmcm9tVG8gPSAnZnJvbSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZhbmN5R2lmdEFtb3VudCA9IGAke3RoaXMuX3NlbmRTeW1ib2x9ICR7X3dlZGdlT3JQb2ludHMoZ2lmdCl9YDtcclxuICAgICAgICAgICAgICAgICAgICBmcm9tVG8gPSAndG8nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGRhdGUgcmVhZGFibGVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBVdGlsLnByZXR0eVNpdGVUaW1lKGdpZnQudGltZXN0YW1wLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBgPGxpIGNsYXNzPSdtcF9naWZ0SXRlbSc+JHtkYXRlfSB5b3UgJHtmYW5jeUdpZnRBbW91bnR9ICR7ZnJvbVRvfSA8YSBocmVmPScvdS8ke2dpZnQub3RoZXJfdXNlcmlkfSc+JHtnaWZ0Lm90aGVyX25hbWV9PC9hPjwvbGk+YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gQWRkIGhpc3RvcnkgaXRlbXMgdG8gdGhlIGxpc3RcclxuICAgICAgICBoaXN0b3J5TGlzdC5pbm5lckhUTUwgPSBnaWZ0cy5qb2luKCcnKTtcclxuICAgICAgICByZXR1cm4gaGlzdG9yeUxpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBWQVVMVCBGRUFUVVJFU1xyXG4gKi9cclxuXHJcbmNsYXNzIFNpbXBsZVZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuVmF1bHQsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3NpbXBsZVZhdWx0JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnU2ltcGxpZnkgdGhlIFZhdWx0IHBhZ2VzLiAoPGVtPlRoaXMgcmVtb3ZlcyBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgZG9uYXRlIGJ1dHRvbiAmYW1wOyBsaXN0IG9mIHJlY2VudCBkb25hdGlvbnM8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd2YXVsdCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHN1YlBhZ2U6IHN0cmluZyA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xyXG4gICAgICAgIGNvbnN0IHBhZ2UgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYEFwcGx5aW5nIFZhdWx0ICgke3N1YlBhZ2V9KSBzZXR0aW5ncy4uLmApO1xyXG5cclxuICAgICAgICAvLyBDbG9uZSB0aGUgaW1wb3J0YW50IHBhcnRzIGFuZCByZXNldCB0aGUgcGFnZVxyXG4gICAgICAgIGNvbnN0IGRvbmF0ZUJ0bjogSFRNTEZvcm1FbGVtZW50IHwgbnVsbCA9IHBhZ2UucXVlcnlTZWxlY3RvcignZm9ybScpO1xyXG4gICAgICAgIGNvbnN0IGRvbmF0ZVRibDogSFRNTFRhYmxlRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICd0YWJsZTpsYXN0LW9mLXR5cGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBwYWdlLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIGRvbmF0ZSBidXR0b24gaWYgaXQgZXhpc3RzXHJcbiAgICAgICAgaWYgKGRvbmF0ZUJ0biAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdEb25hdGU6IEhUTUxGb3JtRWxlbWVudCA9IDxIVE1MRm9ybUVsZW1lbnQ+ZG9uYXRlQnRuLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICAgICAgcGFnZS5hcHBlbmRDaGlsZChuZXdEb25hdGUpO1xyXG4gICAgICAgICAgICBuZXdEb25hdGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhZ2UuaW5uZXJIVE1MID0gJzxoMT5Db21lIGJhY2sgdG9tb3Jyb3chPC9oMT4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgdGFibGUgaWYgaXQgZXhpc3RzXHJcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IDxIVE1MVGFibGVFbGVtZW50PihcclxuICAgICAgICAgICAgICAgIGRvbmF0ZVRibC5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcGFnZS5hcHBlbmRDaGlsZChuZXdUYWJsZSk7XHJcbiAgICAgICAgICAgIG5ld1RhYmxlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYWdlLnN0eWxlLnBhZGRpbmdCb3R0b20gPSAnMjVweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNpbXBsaWZpZWQgdGhlIHZhdWx0IHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBQb3RIaXN0b3J5IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuVmF1bHQsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3BvdEhpc3RvcnknLFxyXG4gICAgICAgIGRlc2M6ICdBZGQgdGhlIGxpc3Qgb2YgcmVjZW50IGRvbmF0aW9ucyB0byB0aGUgZG9uYXRpb24gcGFnZS4nLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWluQm9keSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd2YXVsdCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHN1YlBhZ2U6IHN0cmluZyA9IEdNX2dldFZhbHVlKCdtcF9jdXJyZW50UGFnZScpO1xyXG4gICAgICAgIGNvbnN0IGZvcm0gPSA8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3RhciArICcgZm9ybVttZXRob2Q9XCJwb3N0XCJdJylcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWZvcm0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcG90UGFnZVJlc3AgPSBhd2FpdCBmZXRjaCgnL21pbGxpb25haXJlcy9wb3QucGhwJyk7XHJcbiAgICAgICAgaWYgKCFwb3RQYWdlUmVzcC5vaykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKFxyXG4gICAgICAgICAgICAgICAgYGZhaWxlZCB0byBnZXQgL21pbGxpb25haXJlcy9wb3QucGhwOiAke3BvdFBhZ2VSZXNwLnN0YXR1c30vJHtwb3RQYWdlUmVzcC5zdGF0dXNUZXh0fWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmdyb3VwKGBBcHBseWluZyBWYXVsdCAoJHtzdWJQYWdlfSkgc2V0dGluZ3MuLi5gKTtcclxuICAgICAgICBjb25zdCBwb3RQYWdlVGV4dDogc3RyaW5nID0gYXdhaXQgcG90UGFnZVJlc3AudGV4dCgpO1xyXG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcclxuICAgICAgICBjb25zdCBwb3RQYWdlOiBEb2N1bWVudCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcocG90UGFnZVRleHQsICd0ZXh0L2h0bWwnKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcclxuICAgICAgICBjb25zdCBkb25hdGVUYmw6IEhUTUxUYWJsZUVsZW1lbnQgfCBudWxsID0gcG90UGFnZS5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI21haW5UYWJsZSB0YWJsZTpsYXN0LW9mLXR5cGUnXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgdGFibGUgaWYgaXQgZXhpc3RzXHJcbiAgICAgICAgaWYgKGRvbmF0ZVRibCAhPT0gbnVsbCAmJiBmb3JtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhYmxlOiBIVE1MVGFibGVFbGVtZW50ID0gPEhUTUxUYWJsZUVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9uYXRlVGJsLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBmb3JtLnBhcmVudEVsZW1lbnQ/LmFwcGVuZENoaWxkKG5ld1RhYmxlKTtcclxuICAgICAgICAgICAgbmV3VGFibGUuY2xhc3NMaXN0LmFkZCgnbXBfdmF1bHRDbG9uZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgZG9uYXRpb24gaGlzdG9yeSB0byB0aGUgZG9uYXRpb24gcGFnZSEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBQTEFDRSBBTEwgTSsgRkVBVFVSRVMgSEVSRVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICpcclxuICogTmVhcmx5IGFsbCBmZWF0dXJlcyBiZWxvbmcgaGVyZSwgYXMgdGhleSBzaG91bGQgaGF2ZSBpbnRlcm5hbCBjaGVja3NcclxuICogZm9yIERPTSBlbGVtZW50cyBhcyBuZWVkZWQuIE9ubHkgY29yZSBmZWF0dXJlcyBzaG91bGQgYmUgcGxhY2VkIGluIGBhcHAudHNgXHJcbiAqXHJcbiAqIFRoaXMgZGV0ZXJtaW5lcyB0aGUgb3JkZXIgaW4gd2hpY2ggc2V0dGluZ3Mgd2lsbCBiZSBnZW5lcmF0ZWQgb24gdGhlIFNldHRpbmdzIHBhZ2UuXHJcbiAqIFNldHRpbmdzIHdpbGwgYmUgZ3JvdXBlZCBieSB0eXBlIGFuZCBGZWF0dXJlcyBvZiBvbmUgdHlwZSB0aGF0IGFyZSBjYWxsZWQgYmVmb3JlXHJcbiAqIG90aGVyIEZlYXR1cmVzIG9mIHRoZSBzYW1lIHR5cGUgd2lsbCBhcHBlYXIgZmlyc3QuXHJcbiAqXHJcbiAqIFRoZSBvcmRlciBvZiB0aGUgZmVhdHVyZSBncm91cHMgaXMgbm90IGRldGVybWluZWQgaGVyZS5cclxuICovXHJcbmNsYXNzIEluaXRGZWF0dXJlcyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBJbml0aWFsaXplIEdsb2JhbCBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgSGlkZUhvbWUoKTtcclxuICAgICAgICBuZXcgSGlkZVNlZWRib3goKTtcclxuICAgICAgICBuZXcgSGlkZURvbmF0aW9uQm94KCk7XHJcbiAgICAgICAgbmV3IEJsdXJyZWRIZWFkZXIoKTtcclxuICAgICAgICBuZXcgVmF1bHRMaW5rKCk7XHJcbiAgICAgICAgbmV3IE1pbmlWYXVsdEluZm8oKTtcclxuICAgICAgICBuZXcgQm9udXNQb2ludERlbHRhKCk7XHJcbiAgICAgICAgbmV3IEZpeGVkTmF2KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgSG9tZSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBIaWRlTmV3cygpO1xyXG4gICAgICAgIG5ldyBHaWZ0TmV3ZXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2VhcmNoIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFRvZ2dsZVNuYXRjaGVkKCk7XHJcbiAgICAgICAgbmV3IFN0aWNreVNuYXRjaGVkVG9nZ2xlKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFNlYXJjaCgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVTZWFyY2hib3goKTtcclxuICAgICAgICBuZXcgQnVpbGRUYWdzKCk7XHJcbiAgICAgICAgbmV3IFJhbmRvbUJvb2soKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBSZXF1ZXN0IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvblJlcSgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFJlcXVlc3QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUb3JyZW50IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvbigpO1xyXG4gICAgICAgIG5ldyBTdG9yeUdyYXBoQnV0dG9uKCk7XHJcbiAgICAgICAgbmV3IEF1ZGlibGVCdXR0b24oKTtcclxuICAgICAgICBuZXcgQ3VycmVudGx5UmVhZGluZygpO1xyXG4gICAgICAgIG5ldyBUb3JHaWZ0RGVmYXVsdCgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3QoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0SWNvbnMoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDEoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDIoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDMoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TWluKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2hvdXRib3ggZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFByaW9yaXR5VXNlcnMoKTtcclxuICAgICAgICBuZXcgUHJpb3JpdHlTdHlsZSgpO1xyXG4gICAgICAgIG5ldyBNdXRlZFVzZXJzKCk7XHJcbiAgICAgICAgbmV3IFJlcGx5U2ltcGxlKCk7XHJcbiAgICAgICAgbmV3IFJlcGx5UXVvdGUoKTtcclxuICAgICAgICBuZXcgR2lmdEJ1dHRvbigpO1xyXG4gICAgICAgIG5ldyBRdWlja1Nob3V0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVmF1bHQgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFNpbXBsZVZhdWx0KCk7XHJcbiAgICAgICAgbmV3IFBvdEhpc3RvcnkoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVc2VyIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFVzZXJHaWZ0RGVmYXVsdCgpO1xyXG4gICAgICAgIG5ldyBVc2VyR2lmdEhpc3RvcnkoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBGb3J1bSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBGb3J1bUZMR2lmdCgpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIFVwbG9hZCBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBTZWFyY2hGb3JEdXBsaWNhdGVzKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNoZWNrLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2NvcmUudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciBoYW5kbGluZyBzZXR0aW5ncyBhbmQgdGhlIFByZWZlcmVuY2VzIHBhZ2VcclxuICogQG1ldGhvZCBpbml0OiB0dXJucyBmZWF0dXJlcycgc2V0dGluZ3MgaW5mbyBpbnRvIGEgdXNlYWJsZSB0YWJsZVxyXG4gKi9cclxuY2xhc3MgU2V0dGluZ3Mge1xyXG4gICAgLy8gRnVuY3Rpb24gZm9yIGdhdGhlcmluZyB0aGUgbmVlZGVkIHNjb3Blc1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNjb3BlcyhzZXR0aW5nczogQW55RmVhdHVyZVtdKTogUHJvbWlzZTxTZXR0aW5nR2xvYk9iamVjdD4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNjb3BlcygnLCBzZXR0aW5ncywgJyknKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjb3BlTGlzdDogU2V0dGluZ0dsb2JPYmplY3QgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzZXR0aW5nIG9mIHNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleDogbnVtYmVyID0gTnVtYmVyKHNldHRpbmcuc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIFNjb3BlIGV4aXN0cywgcHVzaCB0aGUgc2V0dGluZ3MgaW50byB0aGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIGlmIChzY29wZUxpc3RbaW5kZXhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVMaXN0W2luZGV4XS5wdXNoKHNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgY3JlYXRlIHRoZSBhcnJheVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZUxpc3RbaW5kZXhdID0gW3NldHRpbmddO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc29sdmUoc2NvcGVMaXN0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiBmb3IgY29uc3RydWN0aW5nIHRoZSB0YWJsZSBmcm9tIGFuIG9iamVjdFxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2J1aWxkVGFibGUocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ19idWlsZFRhYmxlKCcsIHBhZ2UsICcpJyk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBvdXRwID0gYDx0Ym9keT48dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGJyPjxzdHJvbmc+TUFNKyB2JHtcclxuICAgICAgICAgICAgICAgIE1QLlZFUlNJT05cclxuICAgICAgICAgICAgfTwvc3Ryb25nPiAtIEhlcmUgeW91IGNhbiBlbmFibGUgJmFtcDsgZGlzYWJsZSBhbnkgZmVhdHVyZSBmcm9tIHRoZSA8YSBocmVmPVwiL2YvdC80MTg2M1wiPk1BTSsgdXNlcnNjcmlwdDwvYT4hIEhvd2V2ZXIsIHRoZXNlIHNldHRpbmdzIGFyZSA8c3Ryb25nPk5PVDwvc3Ryb25nPiBzdG9yZWQgb24gTUFNOyB0aGV5IGFyZSBzdG9yZWQgd2l0aGluIHRoZSBUYW1wZXJtb25rZXkvR3JlYXNlbW9ua2V5IGV4dGVuc2lvbiBpbiB5b3VyIGJyb3dzZXIsIGFuZCBtdXN0IGJlIGN1c3RvbWl6ZWQgb24gZWFjaCBvZiB5b3VyIGJyb3dzZXJzL2RldmljZXMgc2VwYXJhdGVseS48YnI+PGJyPkZvciBhIGRldGFpbGVkIGxvb2sgYXQgdGhlIGF2YWlsYWJsZSBmZWF0dXJlcywgPGEgaHJlZj1cIiR7VXRpbC5kZXJlZmVyKFxyXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9nYXJkZW5zaGFkZS9tYW0tcGx1cy93aWtpL0ZlYXR1cmUtT3ZlcnZpZXcnXHJcbiAgICAgICAgICAgICl9XCI+Y2hlY2sgdGhlIFdpa2khPC9hPjxicj48YnI+PC90ZD48L3RyPmA7XHJcblxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcGVOdW06IG51bWJlciA9IE51bWJlcihzY29wZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIHNlY3Rpb24gdGl0bGVcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gYDx0cj48dGQgY2xhc3M9J3JvdzInPiR7U2V0dGluZ0dyb3VwW3Njb3BlTnVtXX08L3RkPjx0ZCBjbGFzcz0ncm93MSc+YDtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgcmVxdWlyZWQgaW5wdXQgZmllbGQgYmFzZWQgb24gdGhlIHNldHRpbmdcclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2Vbc2NvcGVOdW1dKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ051bWJlcjogbnVtYmVyID0gTnVtYmVyKHNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW06IEFueUZlYXR1cmUgPSBwYWdlW3Njb3BlTnVtXVtzZXR0aW5nTnVtYmVyXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8aW5wdXQgdHlwZT0nY2hlY2tib3gnIGlkPScke2l0ZW0udGl0bGV9JyB2YWx1ZT0ndHJ1ZSc+JHtpdGVtLmRlc2N9PGJyPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPGlucHV0IHR5cGU9J3RleHQnIGlkPScke2l0ZW0udGl0bGV9JyBwbGFjZWhvbGRlcj0nJHtpdGVtLnBsYWNlaG9sZGVyfScgY2xhc3M9J21wX3RleHRJbnB1dCcgc2l6ZT0nMjUnPiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPHNwYW4gY2xhc3M9J21wX3NldFRhZyc+JHtpdGVtLnRhZ306PC9zcGFuPiA8c2VsZWN0IGlkPScke2l0ZW0udGl0bGV9JyBjbGFzcz0nbXBfZHJvcElucHV0Jz5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGl0ZW0ub3B0aW9ucykuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxvcHRpb24gdmFsdWU9JyR7a2V5fSc+JHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3B0aW9ucyFba2V5XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC9vcHRpb24+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDwvc2VsZWN0PiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSkgY2FzZXNbaXRlbS50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgcm93XHJcbiAgICAgICAgICAgICAgICBvdXRwICs9ICc8L3RkPjwvdHI+JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2F2ZSBidXR0b24gJiBsYXN0IHBhcnQgb2YgdGhlIHRhYmxlXHJcbiAgICAgICAgICAgIG91dHAgKz1cclxuICAgICAgICAgICAgICAgICc8dHI+PHRkIGNsYXNzPVwicm93MVwiIGNvbHNwYW49XCIyXCI+PGRpdiBpZD1cIm1wX3N1Ym1pdFwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPlNhdmUgTSsgU2V0dGluZ3M/PzwvZGl2PjxkaXYgaWQ9XCJtcF9jb3B5XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+Q29weSBTZXR0aW5nczwvZGl2PjxkaXYgaWQ9XCJtcF9pbmplY3RcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5QYXN0ZSBTZXR0aW5nczwvZGl2PjxzcGFuIGNsYXNzPVwibXBfc2F2ZXN0YXRlXCIgc3R5bGU9XCJvcGFjaXR5OjBcIj5TYXZlZCE8L3NwYW4+PC90ZD48L3RyPjwvdGJvZHk+JztcclxuXHJcbiAgICAgICAgICAgIHJlc29sdmUob3V0cCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgc2V0dGluZ3MgdmFsdWVzXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ2V0U2V0dGluZ3MocGFnZTogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICAvLyBVdGlsLnB1cmdlU2V0dGluZ3MoKTtcclxuICAgICAgICBjb25zdCBhbGxWYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnX2dldFNldHRpbmdzKCcsIHBhZ2UsICcpXFxuU3RvcmVkIEdNIGtleXM6JywgYWxsVmFsdWVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZVtOdW1iZXIoc2NvcGUpXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZiA9IHBhZ2VbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1ByZWY6JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZi50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3wgU2V0OicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9YCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IFZhbHVlOicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLnZhbHVlID0gR01fZ2V0VmFsdWUocHJlZi50aXRsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSAmJiBHTV9nZXRWYWx1ZShwcmVmLnRpdGxlKSkgY2FzZXNbcHJlZi50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfc2V0U2V0dGluZ3Mob2JqOiBTZXR0aW5nR2xvYk9iamVjdCkge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYF9zZXRTZXR0aW5ncyhgLCBvYmosICcpJyk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChzY29wZSkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmpbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWYgPSBvYmpbTnVtYmVyKHNjb3BlKV1bTnVtYmVyKHNldHRpbmcpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJlZiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtOiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmLnRpdGxlKSFcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLmNoZWNrZWQpIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnA6IHN0cmluZyA9IGVsZW0udmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHTV9zZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgLCBpbnApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgZWxlbS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FzZXNbcHJlZi50eXBlXSkgY2FzZXNbcHJlZi50eXBlXSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTYXZlZCEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY29weVNldHRpbmdzKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgZ21MaXN0ID0gR01fbGlzdFZhbHVlcygpO1xyXG4gICAgICAgIGNvbnN0IG91dHA6IFtzdHJpbmcsIHN0cmluZ11bXSA9IFtdO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHN0b3JlZCBzZXR0aW5ncyBhbmQgcHVzaCB0byBvdXRwdXQgYXJyYXlcclxuICAgICAgICBnbUxpc3QubWFwKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IGV4cG9ydCBtcF8gc2V0dGluZ3MgYXMgdGhleSBzaG91bGQgb25seSBiZSBzZXQgYXQgcnVudGltZVxyXG4gICAgICAgICAgICBpZiAoc2V0dGluZy5pbmRleE9mKCdtcF8nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgIG91dHAucHVzaChbc2V0dGluZywgR01fZ2V0VmFsdWUoc2V0dGluZyldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0cCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3Bhc3RlU2V0dGluZ3MocGF5bG9hZDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfcGFzdGVTZXR0aW5ncyggKWApO1xyXG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gSlNPTi5wYXJzZShwYXlsb2FkKTtcclxuICAgICAgICBzZXR0aW5ncy5mb3JFYWNoKCh0dXBsZTogW3N0cmluZywgc3RyaW5nXVtdKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0dXBsZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7dHVwbGVbMF19YCwgYCR7dHVwbGVbMV19YCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHR1cGxlWzBdLCAnOiAnLCB0dXBsZVsxXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiB0aGF0IHNhdmVzIHRoZSB2YWx1ZXMgb2YgdGhlIHNldHRpbmdzIHRhYmxlXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfc2F2ZVNldHRpbmdzKHRpbWVyOiBudW1iZXIsIG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXAoYF9zYXZlU2V0dGluZ3MoKWApO1xyXG5cclxuICAgICAgICBjb25zdCBzYXZlc3RhdGU6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzcGFuLm1wX3NhdmVzdGF0ZScpIVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ21WYWx1ZXM6IHN0cmluZ1tdID0gR01fbGlzdFZhbHVlcygpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aW1lciAmIG1lc3NhZ2VcclxuICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2F2aW5nLi4uJyk7XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBhbGwgdmFsdWVzIHN0b3JlZCBpbiBHTSBhbmQgcmVzZXQgZXZlcnl0aGluZ1xyXG4gICAgICAgIGZvciAoY29uc3QgZmVhdHVyZSBpbiBnbVZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGdtVmFsdWVzW2ZlYXR1cmVdICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGxvb3Agb3ZlciB2YWx1ZXMgdGhhdCBhcmUgZmVhdHVyZSBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgaWYgKCFbJ21wX3ZlcnNpb24nLCAnc3R5bGVfdGhlbWUnXS5pbmNsdWRlcyhnbVZhbHVlc1tmZWF0dXJlXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIG5vdCBwYXJ0IG9mIHByZWZlcmVuY2VzIHBhZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ21WYWx1ZXNbZmVhdHVyZV0uaW5kZXhPZignbXBfJykgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoZ21WYWx1ZXNbZmVhdHVyZV0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNhdmUgdGhlIHNldHRpbmdzIHRvIEdNIHZhbHVlc1xyXG4gICAgICAgIHRoaXMuX3NldFNldHRpbmdzKG9iaik7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGNvbmZpcm1hdGlvbiBtZXNzYWdlXHJcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMSc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzYXZlc3RhdGUuc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICAgICAgfSwgMjM0NSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0cyB0aGUgc2V0dGluZ3MgcGFnZS5cclxuICAgICAqIEBwYXJhbSByZXN1bHQgVmFsdWUgdGhhdCBtdXN0IGJlIHBhc3NlZCBkb3duIGZyb20gYENoZWNrLnBhZ2UoJ3NldHRpbmdzJylgXHJcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgVGhlIGFycmF5IG9mIGZlYXR1cmVzIHRvIHByb3ZpZGUgc2V0dGluZ3MgZm9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgaW5pdChyZXN1bHQ6IGJvb2xlYW4sIHNldHRpbmdzOiBBbnlGZWF0dXJlW10pIHtcclxuICAgICAgICAvLyBUaGlzIHdpbGwgb25seSBydW4gaWYgYENoZWNrLnBhZ2UoJ3NldHRpbmdzKWAgcmV0dXJucyB0cnVlICYgaXMgcGFzc2VkIGhlcmVcclxuICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5ncm91cChgbmV3IFNldHRpbmdzKClgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyB0YWJsZSBoYXMgbG9hZGVkXHJcbiAgICAgICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcjbWFpbkJvZHkgPiB0YWJsZScpLnRoZW4oKHIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFtNK10gU3RhcnRpbmcgdG8gYnVpbGQgU2V0dGluZ3MgdGFibGUuLi5gKTtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgdGFibGUgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOYXY6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgPiB0YWJsZScpITtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUaXRsZTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDEnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdUYWJsZTogSFRNTFRhYmxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZVNjb3BlOiBTZXR0aW5nR2xvYk9iamVjdDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGFibGUgZWxlbWVudHMgYWZ0ZXIgdGhlIFByZWYgbmF2YmFyXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nTmF2Lmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ1RpdGxlLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBzZXR0aW5nVGFibGUpO1xyXG4gICAgICAgICAgICAgICAgVXRpbC5zZXRBdHRyKHNldHRpbmdUYWJsZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiAnY29sdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNlbGxzcGFjaW5nOiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICd3aWR0aDoxMDAlO21pbi13aWR0aDoxMDAlO21heC13aWR0aDoxMDAlOycsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdUaXRsZS5pbm5lckhUTUwgPSAnTUFNKyBTZXR0aW5ncyc7XHJcbiAgICAgICAgICAgICAgICAvLyBHcm91cCBzZXR0aW5ncyBieSBwYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9nZXRTY29wZXMoc2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgdGFibGUgSFRNTCBmcm9tIGZlYXR1cmUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VTY29wZSA9IHNjb3BlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkVGFibGUoc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBjb250ZW50IGludG8gdGhlIG5ldyB0YWJsZSBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ1RhYmxlLmlubmVySFRNTCA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQWRkZWQgdGhlIE1BTSsgU2V0dGluZ3MgdGFibGUhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlU2NvcGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldFNldHRpbmdzKHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY29wZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNldHRpbmdzIGFyZSBkb25lIGxvYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoc2NvcGVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdEJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX3N1Ym1pdCcpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5QnRuOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfY29weScpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXN0ZUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2luamVjdCcpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3NUaW1lcjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVTZXR0aW5ncyhzc1RpbWVyLCBzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNsaXBib2FyZGlmeUJ0bihwYXN0ZUJ0biwgdGhpcy5fcGFzdGVTZXR0aW5ncywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fY29weVNldHRpbmdzKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0eXBlcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzdHlsZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvY29yZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvZ2xvYmFsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9icm93c2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2ZvcnVtLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9ob21lLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9yZXF1ZXN0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9zaG91dC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdG9yLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy91cGxvYWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VzZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3ZhdWx0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZlYXR1cmVzLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNldHRpbmdzLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiAqIFVzZXJzY3JpcHQgbmFtZXNwYWNlXHJcbiAqIEBjb25zdGFudCBDSEFOR0VMT0c6IE9iamVjdCBjb250YWluaW5nIGEgbGlzdCBvZiBjaGFuZ2VzIGFuZCBrbm93biBidWdzXHJcbiAqIEBjb25zdGFudCBUSU1FU1RBTVA6IFBsYWNlaG9sZGVyIGhvb2sgZm9yIHRoZSBjdXJyZW50IGJ1aWxkIHRpbWVcclxuICogQGNvbnN0YW50IFZFUlNJT046IFRoZSBjdXJyZW50IHVzZXJzY3JpcHQgdmVyc2lvblxyXG4gKiBAY29uc3RhbnQgUFJFVl9WRVI6IFRoZSBsYXN0IGluc3RhbGxlZCB1c2Vyc2NyaXB0IHZlcnNpb25cclxuICogQGNvbnN0YW50IEVSUk9STE9HOiBUaGUgdGFyZ2V0IGFycmF5IGZvciBsb2dnaW5nIGVycm9yc1xyXG4gKiBAY29uc3RhbnQgUEFHRV9QQVRIOiBUaGUgY3VycmVudCBwYWdlIFVSTCB3aXRob3V0IHRoZSBzaXRlIGFkZHJlc3NcclxuICogQGNvbnN0YW50IE1QX0NTUzogVGhlIE1BTSsgc3R5bGVzaGVldFxyXG4gKiBAY29uc3RhbnQgcnVuKCk6IFN0YXJ0cyB0aGUgdXNlcnNjcmlwdFxyXG4gKi9cclxubmFtZXNwYWNlIE1QIHtcclxuICAgIGV4cG9ydCBjb25zdCBERUJVRzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdkZWJ1ZycpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgZXhwb3J0IGNvbnN0IENIQU5HRUxPRzogQXJyYXlPYmplY3QgPSB7XHJcbiAgICAgICAgLyog8J+GleKZu++4j/CfkJ4gKi9cclxuICAgICAgICBVUERBVEVfTElTVDogW1xyXG4gICAgICAgIF0gYXMgc3RyaW5nW10sXHJcbiAgICAgICAgQlVHX0xJU1Q6IFtcclxuICAgICAgICBdIGFzIHN0cmluZ1tdLFxyXG4gICAgfTtcclxuICAgIGV4cG9ydCBjb25zdCBUSU1FU1RBTVA6IHN0cmluZyA9ICcjI21ldGFfdGltZXN0YW1wIyMnO1xyXG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBQUkVWX1ZFUjogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ2hlY2sucHJldlZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBFUlJPUkxPRzogc3RyaW5nW10gPSBbXTtcclxuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGV4cG9ydCBjb25zdCBNUF9DU1M6IFN0eWxlID0gbmV3IFN0eWxlKCk7XHJcbiAgICBleHBvcnQgY29uc3Qgc2V0dGluZ3NHbG9iOiBBbnlGZWF0dXJlW10gPSBbXTtcclxuXHJcbiAgICBleHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUFJFIFNDUklQVFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFdlbGNvbWUgdG8gTUFNKyB2JHtWRVJTSU9OfSFgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgcGFnZSBpcyBub3QgeWV0IGtub3duXHJcbiAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xyXG4gICAgICAgIC8vIEFkZCBhIHNpbXBsZSBjb29raWUgdG8gYW5ub3VuY2UgdGhlIHNjcmlwdCBpcyBiZWluZyB1c2VkXHJcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gJ21wX2VuYWJsZWQ9MTtkb21haW49bXlhbm9uYW1vdXNlLm5ldDtwYXRoPS87c2FtZXNpdGU9bGF4JztcclxuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXHJcbiAgICAgICAgY29uc3QgYWxlcnRzOiBBbGVydHMgPSBuZXcgQWxlcnRzKCk7XHJcbiAgICAgICAgbmV3IERlYnVnKCk7XHJcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICBDaGVjay51cGRhdGVkKCkudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIGFsZXJ0cy5ub3RpZnkocmVzdWx0LCBDSEFOR0VMT0cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZlYXR1cmVzXHJcbiAgICAgICAgbmV3IEluaXRGZWF0dXJlcygpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFNFVFRJTkdTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3ViUGc6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2V0dGluZ3MgcGFnZVxyXG4gICAgICAgICAgICAgICAgU2V0dGluZ3MuaW5pdChyZXN1bHQsIHNldHRpbmdzR2xvYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBTVFlMRVNcclxuICAgICAgICAgKiBJbmplY3RzIENTU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjdXN0b20gQ1NTIHNoZWV0XHJcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzaXRlIHRoZW1lXHJcbiAgICAgICAgICAgIE1QX0NTUy5hbGlnblRvU2l0ZVRoZW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcclxuTVAucnVuKCk7XHJcbiJdfQ==
