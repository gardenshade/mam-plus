// ==UserScript==
// @name         mam-plus_dev
// @namespace    https://github.com/GardenShade
// @version      4.3.10
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://www.myanonamouse.net/*
// @include      https://*.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @require      https://unpkg.com/axios/dist/axios.min.js
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=4.3.10
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
Util.getBookTitle = (data, auth = '') => __awaiter(this, void 0, void 0, function* () {
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
Util.getBookAuthors = (data, num = 3) => __awaiter(this, void 0, void 0, function* () {
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
Util.getBookSeries = (data) => __awaiter(this, void 0, void 0, function* () {
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
            console.log('[M+] Hid the Seedbox button!');
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
            // Would become ratio
            const rNew = document.querySelector(this._tar);
            // Current ratio
            const rCur = document.querySelector('#tmR');
            // Seeding or downloading
            const seeding = document.querySelector('#DLhistory');
            // Get the custom ratio amounts (will return default values otherwise)
            const [r1, r2, r3] = yield this._share.getRatioProtectLevels();
            if (MP.DEBUG)
                console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);
            // Only run the code if the ratio exists
            if (rNew && rCur && !seeding) {
                const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];
                if (MP.DEBUG)
                    console.log(`Current ${Util.extractFloat(rCur)[0]} | New ${Util.extractFloat(rNew)[0]} | Dif ${rDiff}`);
                // Only activate if a ratio change is expected
                if (!isNaN(rDiff) && rDiff > 0.009) {
                    if (dlLabel) {
                        dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                        dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                    }
                    // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
                    document
                        .querySelector('.torDetBottom')
                        .insertAdjacentHTML('beforebegin', `<div class="torDetRow" id="mp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}" style="flex-direction:column;align-items:flex-start;"><span id="mp_foobar"></span></div></div>`);
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
                        // This is the "trivial ratio loss" threshold
                        // These changes will always happen if the ratio conditions are met
                        if (rDiff > r1) {
                            dlBtn.style.backgroundColor = 'SpringGreen';
                            dlBtn.style.color = 'black';
                            dlBtn.innerHTML = 'Download?';
                        }
                        // This is the "I never want to dl w/o FL" threshold
                        // This also uses the Minimum Ratio, if enabled
                        // This also prevents going below 2 ratio (PU requirement)
                        // TODO: Replace disable button with buy FL button
                        if (rDiff > r3 ||
                            Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val') ||
                            Util.extractFloat(rNew)[0] < 2) {
                            dlBtn.style.backgroundColor = 'Red';
                            ////Disable link to prevent download
                            //// dlBtn.style.pointerEvents = 'none';
                            dlBtn.style.cursor = 'no-drop';
                            // maybe hide the button, and add the Ratio Loss warning in its place?
                            dlBtn.innerHTML = 'FL Needed';
                            dlLabel.style.fontWeight = 'bold';
                            // This is the "I need to think about using a FL" threshold
                        }
                        else if (rDiff > r2) {
                            dlBtn.style.backgroundColor = 'Orange';
                            dlBtn.innerHTML = 'Suggest FL';
                        }
                    }
                }
            }
        });
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
            const siteFavicons = document.querySelectorAll("link[rel~='icon']");
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
                        document.title = document.title.replace(' | My Anonamouse', " | 'till next Site FL");
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
            `♻️: Increased timeout delay for M+ features.`,
            `♻️: Ratio Protect has reached 2.0 feature parity with @yyyzzz999's script.`,
            `🐞: Fixed missing dereferral on Settings page. (Thanks, @Tsani!)`,
        ],
        BUG_LIST: [],
    };
    MP.TIMESTAMP = 'Jun 9';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL2NoZWNrLnRzIiwic3JjL3N0eWxlLnRzIiwic3JjL21vZHVsZXMvY29yZS50cyIsInNyYy9tb2R1bGVzL2dsb2JhbC50cyIsInNyYy9tb2R1bGVzL2hvbWUudHMiLCJzcmMvbW9kdWxlcy9zaGFyZWQudHMiLCJzcmMvbW9kdWxlcy90b3IudHMiLCJzcmMvbW9kdWxlcy9mb3J1bS50cyIsInNyYy9tb2R1bGVzL3Nob3V0LnRzIiwic3JjL21vZHVsZXMvYnJvd3NlLnRzIiwic3JjL21vZHVsZXMvcmVxdWVzdC50cyIsInNyYy9tb2R1bGVzL3ZhdWx0LnRzIiwic3JjL21vZHVsZXMvdXBsb2FkLnRzIiwic3JjL21vZHVsZXMvdXNlci50cyIsInNyYy9mZWF0dXJlcy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFpQkgsSUFBSyxZQVlKO0FBWkQsV0FBSyxZQUFZO0lBQ2IsbURBQVEsQ0FBQTtJQUNSLCtDQUFNLENBQUE7SUFDTixtREFBUSxDQUFBO0lBQ1IsdURBQVUsQ0FBQTtJQUNWLCtEQUFjLENBQUE7SUFDZCx1REFBVSxDQUFBO0lBQ1YsaURBQU8sQ0FBQTtJQUNQLDJEQUFZLENBQUE7SUFDWiw2REFBYSxDQUFBO0lBQ2IsaURBQU8sQ0FBQTtJQUNQLGtEQUFPLENBQUE7QUFDWCxDQUFDLEVBWkksWUFBWSxLQUFaLFlBQVksUUFZaEI7QUMvQkQ7Ozs7R0FJRztBQUVILE1BQU0sSUFBSTtJQUNOOztPQUVHO0lBQ0ksTUFBTSxDQUFDLE9BQU87UUFDakIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FB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QU0sS0FBSyxHQUFXLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzdDLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLGVBQWUsQ0FBQyxFQUFFO2dCQUNoRSwrQkFBK0I7Z0JBQy9CLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUEsWUFBWSxDQUFDLENBQUM7YUFDdkM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVIOzs7V0FHRztRQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3RELHVCQUF1QjtZQUN2QixHQUFBLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwQiw2QkFBNkI7WUFDN0IsR0FBQSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN2QixDQUFDLENBQUEsQ0FBQztBQUNOLENBQUMsRUFoRVMsRUFBRSxLQUFGLEVBQUUsUUFnRVg7QUFFRCx5QkFBeUI7QUFDekIsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6Im1hbS1wbHVzX2Rldi51c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFR5cGVzLCBJbnRlcmZhY2VzLCBldGMuXHJcbiAqL1xyXG5cclxudHlwZSBWYWxpZFBhZ2UgPVxyXG4gICAgfCAnaG9tZSdcclxuICAgIHwgJ2Jyb3dzZSdcclxuICAgIHwgJ3JlcXVlc3QnXHJcbiAgICB8ICdyZXF1ZXN0IGRldGFpbHMnXHJcbiAgICB8ICd0b3JyZW50J1xyXG4gICAgfCAnc2hvdXRib3gnXHJcbiAgICB8ICd2YXVsdCdcclxuICAgIHwgJ3VzZXInXHJcbiAgICB8ICd1cGxvYWQnXHJcbiAgICB8ICdmb3J1bSB0aHJlYWQnXHJcbiAgICB8ICdzZXR0aW5ncyc7XHJcblxyXG50eXBlIEJvb2tEYXRhID0gJ2Jvb2snIHwgJ2F1dGhvcicgfCAnc2VyaWVzJztcclxuXHJcbmVudW0gU2V0dGluZ0dyb3VwIHtcclxuICAgICdHbG9iYWwnLFxyXG4gICAgJ0hvbWUnLFxyXG4gICAgJ1NlYXJjaCcsXHJcbiAgICAnUmVxdWVzdHMnLFxyXG4gICAgJ1RvcnJlbnQgUGFnZScsXHJcbiAgICAnU2hvdXRib3gnLFxyXG4gICAgJ1ZhdWx0JyxcclxuICAgICdVc2VyIFBhZ2VzJyxcclxuICAgICdVcGxvYWQgUGFnZScsXHJcbiAgICAnRm9ydW0nLFxyXG4gICAgJ090aGVyJyxcclxufVxyXG5cclxudHlwZSBTaG91dGJveFVzZXJUeXBlID0gJ3ByaW9yaXR5JyB8ICdtdXRlJztcclxuXHJcbnR5cGUgU3RvcmVTb3VyY2UgPVxyXG4gICAgfCAxXHJcbiAgICB8ICcyLjUnXHJcbiAgICB8ICc0J1xyXG4gICAgfCAnNSdcclxuICAgIHwgJzgnXHJcbiAgICB8ICcyMCdcclxuICAgIHwgJzEwMCdcclxuICAgIHwgJ3BvaW50cydcclxuICAgIHwgJ2NoZWVzZSdcclxuICAgIHwgJ21heCdcclxuICAgIHwgJ01heCBBZmZvcmRhYmxlJ1xyXG4gICAgfCAnc2VlZHRpbWUnXHJcbiAgICB8ICdTZWxsJ1xyXG4gICAgfCAncmF0aW8nXHJcbiAgICB8ICdGb3J1bSc7XHJcblxyXG5pbnRlcmZhY2UgVXNlckdpZnRIaXN0b3J5IHtcclxuICAgIGFtb3VudDogbnVtYmVyO1xyXG4gICAgb3RoZXJfbmFtZTogc3RyaW5nO1xyXG4gICAgb3RoZXJfdXNlcmlkOiBudW1iZXI7XHJcbiAgICB0aWQ6IG51bWJlciB8IG51bGw7XHJcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcclxuICAgIHRpdGxlOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgdHlwZTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQXJyYXlPYmplY3Qge1xyXG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBTdHJpbmdPYmplY3Qge1xyXG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQm9va0RhdGFPYmplY3QgZXh0ZW5kcyBTdHJpbmdPYmplY3Qge1xyXG4gICAgWydleHRyYWN0ZWQnXTogc3RyaW5nO1xyXG4gICAgWydkZXNjJ106IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIERpdlJvd09iamVjdCB7XHJcbiAgICBbJ3RpdGxlJ106IHN0cmluZztcclxuICAgIFsnZGF0YSddOiBIVE1MRGl2RWxlbWVudDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFNldHRpbmdHbG9iT2JqZWN0IHtcclxuICAgIFtrZXk6IG51bWJlcl06IEZlYXR1cmVTZXR0aW5nc1tdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHNjb3BlOiBTZXR0aW5nR3JvdXA7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG4gICAgdHlwZTogJ2NoZWNrYm94JyB8ICdkcm9wZG93bicgfCAndGV4dGJveCc7XHJcbiAgICBkZXNjOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBbnlGZWF0dXJlIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHRhZz86IHN0cmluZztcclxuICAgIG9wdGlvbnM/OiBTdHJpbmdPYmplY3Q7XHJcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEZlYXR1cmUge1xyXG4gICAgc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyB8IERyb3Bkb3duU2V0dGluZyB8IFRleHRib3hTZXR0aW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2hlY2tib3hTZXR0aW5nIGV4dGVuZHMgRmVhdHVyZVNldHRpbmdzIHtcclxuICAgIHR5cGU6ICdjaGVja2JveCc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBEcm9wZG93blNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgdHlwZTogJ2Ryb3Bkb3duJztcclxuICAgIHRhZzogc3RyaW5nO1xyXG4gICAgb3B0aW9uczogU3RyaW5nT2JqZWN0O1xyXG59XHJcblxyXG5pbnRlcmZhY2UgVGV4dGJveFNldHRpbmcgZXh0ZW5kcyBGZWF0dXJlU2V0dGluZ3Mge1xyXG4gICAgdHlwZTogJ3RleHRib3gnO1xyXG4gICAgdGFnOiBzdHJpbmc7XHJcbiAgICBwbGFjZWhvbGRlcjogc3RyaW5nO1xyXG59XHJcblxyXG4vLyBuYXZpZ2F0b3IuY2xpcGJvYXJkLmQudHNcclxuXHJcbi8vIFR5cGUgZGVjbGFyYXRpb25zIGZvciBDbGlwYm9hcmQgQVBJXHJcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DbGlwYm9hcmRfQVBJXHJcbmludGVyZmFjZSBDbGlwYm9hcmQge1xyXG4gICAgd3JpdGVUZXh0KG5ld0NsaXBUZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgLy8gQWRkIGFueSBvdGhlciBtZXRob2RzIHlvdSBuZWVkIGhlcmUuXHJcbn1cclxuXHJcbmludGVyZmFjZSBOYXZpZ2F0b3JDbGlwYm9hcmQge1xyXG4gICAgLy8gT25seSBhdmFpbGFibGUgaW4gYSBzZWN1cmUgY29udGV4dC5cclxuICAgIHJlYWRvbmx5IGNsaXBib2FyZD86IENsaXBib2FyZDtcclxufVxyXG5cclxuaW50ZXJmYWNlIE5hdmlnYXRvckV4dGVuZGVkIGV4dGVuZHMgTmF2aWdhdG9yQ2xpcGJvYXJkIHt9XHJcbiIsIi8qKlxyXG4gKiBDbGFzcyBjb250YWluaW5nIGNvbW1vbiB1dGlsaXR5IG1ldGhvZHNcclxuICpcclxuICogSWYgdGhlIG1ldGhvZCBzaG91bGQgaGF2ZSB1c2VyLWNoYW5nZWFibGUgc2V0dGluZ3MsIGNvbnNpZGVyIHVzaW5nIGBDb3JlLnRzYCBpbnN0ZWFkXHJcbiAqL1xyXG5cclxuY2xhc3MgVXRpbCB7XHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGlvbiBmcmFtZSB0aW1lclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFmVGltZXIoKTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlc29sdmUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBbGxvd3Mgc2V0dGluZyBtdWx0aXBsZSBhdHRyaWJ1dGVzIGF0IG9uY2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzZXRBdHRyKGVsOiBFbGVtZW50LCBhdHRyOiBTdHJpbmdPYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cikge1xyXG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cltrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBcImxlbmd0aFwiIG9mIGFuIE9iamVjdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG9iamVjdExlbmd0aChvYmo6IE9iamVjdCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yY2VmdWxseSBlbXB0aWVzIGFueSBHTSBzdG9yZWQgdmFsdWVzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcHVyZ2VTZXR0aW5ncygpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIEdNX2xpc3RWYWx1ZXMoKSkge1xyXG4gICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9nIGEgbWVzc2FnZSBhYm91dCBhIGNvdW50ZWQgcmVzdWx0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVwb3J0Q291bnQoZGlkOiBzdHJpbmcsIG51bTogbnVtYmVyLCB0aGluZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2luZ3VsYXIgPSAxO1xyXG4gICAgICAgIGlmIChudW0gIT09IHNpbmd1bGFyKSB7XHJcbiAgICAgICAgICAgIHRoaW5nICs9ICdzJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA+ICR7ZGlkfSAke251bX0gJHt0aGluZ31gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplcyBhIGZlYXR1cmVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBzdGFydEZlYXR1cmUoXHJcbiAgICAgICAgc2V0dGluZ3M6IEZlYXR1cmVTZXR0aW5ncyxcclxuICAgICAgICBlbGVtOiBzdHJpbmcsXHJcbiAgICAgICAgcGFnZT86IFZhbGlkUGFnZVtdXHJcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAvLyBRdWV1ZSB0aGUgc2V0dGluZ3MgaW4gY2FzZSB0aGV5J3JlIG5lZWRlZFxyXG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gcmV0dXJuIHRydWUgd2hlbiB0aGUgZWxlbWVudCBpcyBsb2FkZWRcclxuICAgICAgICBhc3luYyBmdW5jdGlvbiBydW4oKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbWVyOiBQcm9taXNlPGZhbHNlPiA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCAyMDAwLCBmYWxzZSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tFbGVtID0gQ2hlY2suZWxlbUxvYWQoZWxlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJhY2UoW3RpbWVyLCBjaGVja0VsZW1dKS50aGVuKCh2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgc3RhcnRGZWF0dXJlKCR7c2V0dGluZ3MudGl0bGV9KSBVbmFibGUgdG8gaW5pdGlhdGUhIENvdWxkIG5vdCBmaW5kIGVsZW1lbnQ6ICR7ZWxlbX1gXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSXMgdGhlIHNldHRpbmcgZW5hYmxlZD9cclxuICAgICAgICBpZiAoR01fZ2V0VmFsdWUoc2V0dGluZ3MudGl0bGUpKSB7XHJcbiAgICAgICAgICAgIC8vIEEgc3BlY2lmaWMgcGFnZSBpcyBuZWVkZWRcclxuICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHJlcXVpcmVkIHBhZ2VzXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzOiBib29sZWFuW10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHBhZ2UuZm9yRWFjaCgocCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIENoZWNrLnBhZ2UocCkudGhlbigocikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goPGJvb2xlYW4+cik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIElmIGFueSByZXF1ZXN0ZWQgcGFnZSBtYXRjaGVzIHRoZSBjdXJyZW50IHBhZ2UsIHJ1biB0aGUgZmVhdHVyZVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMuaW5jbHVkZXModHJ1ZSkgPT09IHRydWUpIHJldHVybiBydW4oKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNraXAgdG8gZWxlbWVudCBjaGVja2luZ1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFNldHRpbmcgaXMgbm90IGVuYWJsZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJpbXMgYSBzdHJpbmcgbG9uZ2VyIHRoYW4gYSBzcGVjaWZpZWQgY2hhciBsaW1pdCwgdG8gYSBmdWxsIHdvcmRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB0cmltU3RyaW5nKGlucDogc3RyaW5nLCBtYXg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGlucC5sZW5ndGggPiBtYXgpIHtcclxuICAgICAgICAgICAgaW5wID0gaW5wLnN1YnN0cmluZygwLCBtYXggKyAxKTtcclxuICAgICAgICAgICAgaW5wID0gaW5wLnN1YnN0cmluZygwLCBNYXRoLm1pbihpbnAubGVuZ3RoLCBpbnAubGFzdEluZGV4T2YoJyAnKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5wO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBicmFja2V0cyAmIGFsbCBjb250YWluZWQgd29yZHMgZnJvbSBhIHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJyYWNrZXRSZW1vdmVyKGlucDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gaW5wXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC97Ky4qP30rL2csICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxbXFxbfFxcXVxcXS9nLCAnJylcclxuICAgICAgICAgICAgLnJlcGxhY2UoLzwuKj8+L2csICcnKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwoLio/XFwpL2csICcnKVxyXG4gICAgICAgICAgICAudHJpbSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKlJldHVybiB0aGUgY29udGVudHMgYmV0d2VlbiBicmFja2V0c1xyXG4gICAgICpcclxuICAgICAqIEBzdGF0aWNcclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYnJhY2tldENvbnRlbnRzID0gKGlucDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGlucC5tYXRjaCgvXFwoKFteKV0rKVxcKS8pIVsxXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIHN0cmluZyB0byBhbiBhcnJheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZ1RvQXJyYXkoaW5wOiBzdHJpbmcsIHNwbGl0UG9pbnQ/OiAnd3MnKTogc3RyaW5nW10ge1xyXG4gICAgICAgIHJldHVybiBzcGxpdFBvaW50ICE9PSB1bmRlZmluZWQgJiYgc3BsaXRQb2ludCAhPT0gJ3dzJ1xyXG4gICAgICAgICAgICA/IGlucC5zcGxpdChzcGxpdFBvaW50KVxyXG4gICAgICAgICAgICA6IGlucC5tYXRjaCgvXFxTKy9nKSB8fCBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgY29tbWEgKG9yIG90aGVyKSBzZXBhcmF0ZWQgdmFsdWUgaW50byBhbiBhcnJheVxyXG4gICAgICogQHBhcmFtIGlucCBTdHJpbmcgdG8gYmUgZGl2aWRlZFxyXG4gICAgICogQHBhcmFtIGRpdmlkZXIgVGhlIGRpdmlkZXIgKGRlZmF1bHQ6ICcsJylcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjc3ZUb0FycmF5KGlucDogc3RyaW5nLCBkaXZpZGVyOiBzdHJpbmcgPSAnLCcpOiBzdHJpbmdbXSB7XHJcbiAgICAgICAgY29uc3QgYXJyOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGlucC5zcGxpdChkaXZpZGVyKS5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKGl0ZW0udHJpbSgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBhbiBhcnJheSB0byBhIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGlucCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBlbmQgY3V0LW9mZiBwb2ludFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFycmF5VG9TdHJpbmcoaW5wOiBzdHJpbmdbXSwgZW5kPzogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgb3V0cDogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgaW5wLmZvckVhY2goKGtleSwgdmFsKSA9PiB7XHJcbiAgICAgICAgICAgIG91dHAgKz0ga2V5O1xyXG4gICAgICAgICAgICBpZiAoZW5kICYmIHZhbCArIDEgIT09IGlucC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG91dHAgKz0gJyAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG91dHA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIERPTSBub2RlIHJlZmVyZW5jZSBpbnRvIGFuIEhUTUwgRWxlbWVudCByZWZlcmVuY2VcclxuICAgICAqIEBwYXJhbSBub2RlIFRoZSBub2RlIHRvIGNvbnZlcnRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBub2RlVG9FbGVtKG5vZGU6IE5vZGUpOiBIVE1MRWxlbWVudCB7XHJcbiAgICAgICAgaWYgKG5vZGUuZmlyc3RDaGlsZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxFbGVtZW50Pm5vZGUuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdOb2RlLXRvLWVsZW0gd2l0aG91dCBjaGlsZG5vZGUgaXMgdW50ZXN0ZWQnKTtcclxuICAgICAgICAgICAgY29uc3QgdGVtcE5vZGU6IE5vZGUgPSBub2RlO1xyXG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRlbXBOb2RlKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50Pm5vZGUuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCE7XHJcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQodGVtcE5vZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWF0Y2ggc3RyaW5ncyB3aGlsZSBpZ25vcmluZyBjYXNlIHNlbnNpdGl2aXR5XHJcbiAgICAgKiBAcGFyYW0gYSBGaXJzdCBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBiIFNlY29uZCBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjYXNlbGVzc1N0cmluZ01hdGNoKGE6IHN0cmluZywgYjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgY29tcGFyZTogbnVtYmVyID0gYS5sb2NhbGVDb21wYXJlKGIsICdlbicsIHtcclxuICAgICAgICAgICAgc2Vuc2l0aXZpdHk6ICdiYXNlJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gY29tcGFyZSA9PT0gMCA/IHRydWUgOiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIG5ldyBUb3JEZXRSb3cgYW5kIHJldHVybiB0aGUgaW5uZXIgZGl2XHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSByb3cgdG8gYmUgdGFyZ2V0dGVkXHJcbiAgICAgKiBAcGFyYW0gbGFiZWwgVGhlIG5hbWUgdG8gYmUgZGlzcGxheWVkIGZvciB0aGUgbmV3IHJvd1xyXG4gICAgICogQHBhcmFtIHJvd0NsYXNzIFRoZSByb3cncyBjbGFzc25hbWUgKHNob3VsZCBzdGFydCB3aXRoIG1wXylcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZGRUb3JEZXRhaWxzUm93KFxyXG4gICAgICAgIHRhcjogSFRNTERpdkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGxhYmVsOiBzdHJpbmcsXHJcbiAgICAgICAgcm93Q2xhc3M6IHN0cmluZ1xyXG4gICAgKTogSFRNTERpdkVsZW1lbnQge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2codGFyKTtcclxuXHJcbiAgICAgICAgaWYgKHRhciA9PT0gbnVsbCB8fCB0YXIucGFyZW50RWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFkZCBUb3IgRGV0YWlscyBSb3c6IGVtcHR5IG5vZGUgb3IgcGFyZW50IG5vZGUgQCAke3Rhcn1gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0YXIucGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXHJcbiAgICAgICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJ0b3JEZXRSb3dcIj48ZGl2IGNsYXNzPVwidG9yRGV0TGVmdFwiPiR7bGFiZWx9PC9kaXY+PGRpdiBjbGFzcz1cInRvckRldFJpZ2h0ICR7cm93Q2xhc3N9XCI+PHNwYW4gY2xhc3M9XCJmbGV4XCI+PC9zcGFuPjwvZGl2PjwvZGl2PmBcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7cm93Q2xhc3N9IC5mbGV4YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IE1lcmdlIHdpdGggYFV0aWwuY3JlYXRlQnV0dG9uYFxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIGEgbGluayBidXR0b24gdGhhdCBpcyBzdHlsZWQgbGlrZSBhIHNpdGUgYnV0dG9uIChleC4gaW4gdG9yIGRldGFpbHMpXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHRoZSBidXR0b24gc2hvdWxkIGJlIGFkZGVkIHRvXHJcbiAgICAgKiBAcGFyYW0gdXJsIFRoZSBVUkwgdGhlIGJ1dHRvbiB3aWxsIHNlbmQgeW91IHRvXHJcbiAgICAgKiBAcGFyYW0gdGV4dCBUaGUgdGV4dCBvbiB0aGUgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gb3JkZXIgT3B0aW9uYWw6IGZsZXggZmxvdyBvcmRlcmluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUxpbmtCdXR0b24oXHJcbiAgICAgICAgdGFyOiBIVE1MRWxlbWVudCxcclxuICAgICAgICB1cmw6IHN0cmluZyA9ICdub25lJyxcclxuICAgICAgICB0ZXh0OiBzdHJpbmcsXHJcbiAgICAgICAgb3JkZXI6IG51bWJlciA9IDBcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgYnV0dG9uXHJcbiAgICAgICAgY29uc3QgYnV0dG9uOiBIVE1MQW5jaG9yRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICAvLyBTZXQgdXAgdGhlIGJ1dHRvblxyXG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdtcF9idXR0b25fY2xvbmUnKTtcclxuICAgICAgICBpZiAodXJsICE9PSAnbm9uZScpIHtcclxuICAgICAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RhcmdldCcsICdfYmxhbmsnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnV0dG9uLmlubmVyVGV4dCA9IHRleHQ7XHJcbiAgICAgICAgYnV0dG9uLnN0eWxlLm9yZGVyID0gYCR7b3JkZXJ9YDtcclxuICAgICAgICAvLyBJbmplY3QgdGhlIGJ1dHRvblxyXG4gICAgICAgIHRhci5pbnNlcnRCZWZvcmUoYnV0dG9uLCB0YXIuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnRzIGEgbm9uLWxpbmtlZCBidXR0b25cclxuICAgICAqIEBwYXJhbSBpZCBUaGUgSUQgb2YgdGhlIGJ1dHRvblxyXG4gICAgICogQHBhcmFtIHRleHQgVGhlIHRleHQgZGlzcGxheWVkIGluIHRoZSBidXR0b25cclxuICAgICAqIEBwYXJhbSB0eXBlIFRoZSBIVE1MIGVsZW1lbnQgdG8gY3JlYXRlLiBEZWZhdWx0OiBgaDFgXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBIVE1MIGVsZW1lbnQgdGhlIGJ1dHRvbiB3aWxsIGJlIGByZWxhdGl2ZWAgdG9cclxuICAgICAqIEBwYXJhbSByZWxhdGl2ZSBUaGUgcG9zaXRpb24gb2YgdGhlIGJ1dHRvbiByZWxhdGl2ZSB0byB0aGUgYHRhcmAuIERlZmF1bHQ6IGBhZnRlcmVuZGBcclxuICAgICAqIEBwYXJhbSBidG5DbGFzcyBUaGUgY2xhc3NuYW1lIG9mIHRoZSBlbGVtZW50LiBEZWZhdWx0OiBgbXBfYnRuYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZUJ1dHRvbihcclxuICAgICAgICBpZDogc3RyaW5nLFxyXG4gICAgICAgIHRleHQ6IHN0cmluZyxcclxuICAgICAgICB0eXBlOiBzdHJpbmcgPSAnaDEnLFxyXG4gICAgICAgIHRhcjogc3RyaW5nIHwgSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgcmVsYXRpdmU6ICdiZWZvcmViZWdpbicgfCAnYWZ0ZXJlbmQnID0gJ2FmdGVyZW5kJyxcclxuICAgICAgICBidG5DbGFzczogc3RyaW5nID0gJ21wX2J0bidcclxuICAgICk6IFByb21pc2U8SFRNTEVsZW1lbnQ+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBDaG9vc2UgdGhlIG5ldyBidXR0b24gaW5zZXJ0IGxvY2F0aW9uIGFuZCBpbnNlcnQgZWxlbWVudHNcclxuICAgICAgICAgICAgLy8gY29uc3QgdGFyZ2V0OiBIVE1MRWxlbWVudCB8IG51bGwgPSA8SFRNTEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXIpO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9XHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFyID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyKSA6IHRhcjtcclxuICAgICAgICAgICAgY29uc3QgYnRuOiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoYCR7dGFyfSBpcyBudWxsIWApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lmluc2VydEFkamFjZW50RWxlbWVudChyZWxhdGl2ZSwgYnRuKTtcclxuICAgICAgICAgICAgICAgIFV0aWwuc2V0QXR0cihidG4sIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogYG1wXyR7aWR9YCxcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogYnRuQ2xhc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ2J1dHRvbicsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIGJ1dHRvbiB0ZXh0XHJcbiAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoYnRuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYW4gZWxlbWVudCBpbnRvIGEgYnV0dG9uIHRoYXQsIHdoZW4gY2xpY2tlZCwgY29waWVzIHRleHQgdG8gY2xpcGJvYXJkXHJcbiAgICAgKiBAcGFyYW0gYnRuIEFuIEhUTUwgRWxlbWVudCBiZWluZyB1c2VkIGFzIGEgYnV0dG9uXHJcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgY29waWVkIHRvIGNsaXBib2FyZCBvbiBidXR0b24gY2xpY2ssIG9yIGEgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB3aWxsIHVzZSB0aGUgY2xpcGJvYXJkJ3MgY3VycmVudCB0ZXh0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2xpcGJvYXJkaWZ5QnRuKFxyXG4gICAgICAgIGJ0bjogSFRNTEVsZW1lbnQsXHJcbiAgICAgICAgcGF5bG9hZDogYW55LFxyXG4gICAgICAgIGNvcHk6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBidG4uc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgLy8gSGF2ZSB0byBvdmVycmlkZSB0aGUgTmF2aWdhdG9yIHR5cGUgdG8gcHJldmVudCBUUyBlcnJvcnNcclxuICAgICAgICAgICAgY29uc3QgbmF2OiBOYXZpZ2F0b3JFeHRlbmRlZCB8IHVuZGVmaW5lZCA9IDxOYXZpZ2F0b3JFeHRlbmRlZD5uYXZpZ2F0b3I7XHJcbiAgICAgICAgICAgIGlmIChuYXYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBjb3B5IHRleHQsIGxpa2VseSBkdWUgdG8gbWlzc2luZyBicm93c2VyIHN1cHBvcnQuJyk7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCAnbmF2aWdhdG9yJz9cIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvKiBOYXZpZ2F0b3IgRXhpc3RzICovXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvcHkgJiYgdHlwZW9mIHBheWxvYWQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29weSByZXN1bHRzIHRvIGNsaXBib2FyZFxyXG4gICAgICAgICAgICAgICAgICAgIG5hdi5jbGlwYm9hcmQhLndyaXRlVGV4dChwYXlsb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgdG8geW91ciBjbGlwYm9hcmQhJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biBwYXlsb2FkIGZ1bmN0aW9uIHdpdGggY2xpcGJvYXJkIHRleHRcclxuICAgICAgICAgICAgICAgICAgICBuYXYuY2xpcGJvYXJkIS5yZWFkVGV4dCgpLnRoZW4oKHRleHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZCh0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb3BpZWQgZnJvbSB5b3VyIGNsaXBib2FyZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJ0bi5zdHlsZS5jb2xvciA9ICdncmVlbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYW4gSFRUUFJlcXVlc3QgZm9yIEdFVCBKU09OLCByZXR1cm5zIHRoZSBmdWxsIHRleHQgb2YgSFRUUCBHRVRcclxuICAgICAqIEBwYXJhbSB1cmwgLSBhIHN0cmluZyBvZiB0aGUgVVJMIHRvIHN1Ym1pdCBmb3IgR0VUIHJlcXVlc3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRKU09OKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBnZXRIVFRQID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByZXN1bHRzIHdpdGggdGhlIGFtb3VudCBlbnRlcmVkIGJ5IHVzZXIgcGx1cyB0aGUgdXNlcm5hbWUgZm91bmQgb24gdGhlIG1lbnUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgZ2V0SFRUUC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICBnZXRIVFRQLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIGdldEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldEhUVFAucmVhZHlTdGF0ZSA9PT0gNCAmJiBnZXRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShnZXRIVFRQLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGdldEhUVFAuc2VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJhbmRvbSBudW1iZXIgYmV0d2VlbiB0d28gcGFyYW1ldGVyc1xyXG4gICAgICogQHBhcmFtIG1pbiBhIG51bWJlciBvZiB0aGUgYm90dG9tIG9mIHJhbmRvbSBudW1iZXIgcG9vbFxyXG4gICAgICogQHBhcmFtIG1heCBhIG51bWJlciBvZiB0aGUgdG9wIG9mIHRoZSByYW5kb20gbnVtYmVyIHBvb2xcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByYW5kb21OdW1iZXIgPSAobWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyID0+IHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTbGVlcCB1dGlsIHRvIGJlIHVzZWQgaW4gYXN5bmMgZnVuY3Rpb25zIHRvIGRlbGF5IHByb2dyYW1cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzbGVlcCA9IChtOiBhbnkpOiBQcm9taXNlPHZvaWQ+ID0+IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIG0pKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgbGFzdCBzZWN0aW9uIG9mIGFuIEhSRUZcclxuICAgICAqIEBwYXJhbSBlbGVtIEFuIGFuY2hvciBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gc3BsaXQgT3B0aW9uYWwgZGl2aWRlci4gRGVmYXVsdHMgdG8gYC9gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZW5kT2ZIcmVmID0gKGVsZW06IEhUTUxBbmNob3JFbGVtZW50LCBzcGxpdCA9ICcvJykgPT5cclxuICAgICAgICBlbGVtLmhyZWYuc3BsaXQoc3BsaXQpLnBvcCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBoZXggdmFsdWUgb2YgYSBjb21wb25lbnQgYXMgYSBzdHJpbmcuXHJcbiAgICAgKiBGcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzhcclxuICAgICAqXHJcbiAgICAgKiBAc3RhdGljXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqIEBtZW1iZXJvZiBVdGlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY29tcG9uZW50VG9IZXggPSAoYzogbnVtYmVyIHwgc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICBjb25zdCBoZXggPSBjLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICByZXR1cm4gaGV4Lmxlbmd0aCA9PT0gMSA/IGAwJHtoZXh9YCA6IGhleDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIGhleCBjb2xvciBjb2RlIGZyb20gUkdCLlxyXG4gICAgICogRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4XHJcbiAgICAgKlxyXG4gICAgICogQHN0YXRpY1xyXG4gICAgICogQG1lbWJlcm9mIFV0aWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZ2JUb0hleCA9IChyOiBudW1iZXIsIGc6IG51bWJlciwgYjogbnVtYmVyKTogc3RyaW5nID0+IHtcclxuICAgICAgICByZXR1cm4gYCMke1V0aWwuY29tcG9uZW50VG9IZXgocil9JHtVdGlsLmNvbXBvbmVudFRvSGV4KGcpfSR7VXRpbC5jb21wb25lbnRUb0hleChcclxuICAgICAgICAgICAgYlxyXG4gICAgICAgICl9YDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeHRyYWN0IG51bWJlcnMgKHdpdGggZmxvYXQpIGZyb20gdGV4dCBhbmQgcmV0dXJuIHRoZW1cclxuICAgICAqIEBwYXJhbSB0YXIgQW4gSFRNTCBlbGVtZW50IHRoYXQgY29udGFpbnMgbnVtYmVyc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGV4dHJhY3RGbG9hdCA9ICh0YXI6IEhUTUxFbGVtZW50KTogbnVtYmVyW10gPT4ge1xyXG4gICAgICAgIGlmICh0YXIudGV4dENvbnRlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0YXIudGV4dENvbnRlbnQhLnJlcGxhY2UoLywvZywgJycpLm1hdGNoKC9cXGQrXFwuXFxkKy8pIHx8IFtdKS5tYXAoKG4pID0+XHJcbiAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KG4pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXJnZXQgY29udGFpbnMgbm8gdGV4dCcpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIEdldCB0aGUgdXNlciBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0aGUgbG9nZ2VkIGluIHVzZXIgYW5kIGEgZ2l2ZW4gSURcclxuICAgICAqIEBwYXJhbSB1c2VySUQgQSB1c2VyIElEOyBjYW4gYmUgYSBzdHJpbmcgb3IgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZ2V0VXNlckdpZnRIaXN0b3J5KFxyXG4gICAgICAgIHVzZXJJRDogbnVtYmVyIHwgc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPFVzZXJHaWZ0SGlzdG9yeVtdPiB7XHJcbiAgICAgICAgY29uc3QgcmF3R2lmdEhpc3Rvcnk6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTihcclxuICAgICAgICAgICAgYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi91c2VyQm9udXNIaXN0b3J5LnBocD9vdGhlcl91c2VyaWQ9JHt1c2VySUR9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZ2lmdEhpc3Rvcnk6IEFycmF5PFVzZXJHaWZ0SGlzdG9yeT4gPSBKU09OLnBhcnNlKHJhd0dpZnRIaXN0b3J5KTtcclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGZ1bGwgZGF0YVxyXG4gICAgICAgIHJldHVybiBnaWZ0SGlzdG9yeTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXR0eVNpdGVUaW1lKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgZGF0ZT86IGJvb2xlYW4sIHRpbWU/OiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUodW5peFRpbWVzdGFtcCAqIDEwMDApLnRvSVNPU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKGRhdGUgJiYgIXRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoIWRhdGUgJiYgdGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLnNwbGl0KCdUJylbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbWVzdGFtcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENoZWNrIGEgc3RyaW5nIHRvIHNlZSBpZiBpdCdzIGRpdmlkZWQgd2l0aCBhIGRhc2gsIHJldHVybmluZyB0aGUgZmlyc3QgaGFsZiBpZiBpdCBkb2Vzbid0IGNvbnRhaW4gYSBzcGVjaWZpZWQgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gb3JpZ2luYWwgVGhlIG9yaWdpbmFsIHN0cmluZyBiZWluZyBjaGVja2VkXHJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVkIEEgc3RyaW5nIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkIGluIHRoZSBvcmlnaW5hbFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNoZWNrRGFzaGVzKG9yaWdpbmFsOiBzdHJpbmcsIGNvbnRhaW5lZDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICBgY2hlY2tEYXNoZXMoICR7b3JpZ2luYWx9LCAke2NvbnRhaW5lZH0gKTogQ291bnQgJHtvcmlnaW5hbC5pbmRleE9mKFxyXG4gICAgICAgICAgICAgICAgICAgICcgLSAnXHJcbiAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERhc2hlcyBhcmUgcHJlc2VudFxyXG4gICAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcgLSAnKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU3RyaW5nIGNvbnRhaW5zIGEgZGFzaGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IG9yaWdpbmFsLnNwbGl0KCcgLSAnKTtcclxuICAgICAgICAgICAgaWYgKHNwbGl0WzBdID09PSBjb250YWluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgPiBTdHJpbmcgYmVmb3JlIGRhc2ggaXMgXCIke2NvbnRhaW5lZH1cIjsgdXNpbmcgc3RyaW5nIGJlaGluZCBkYXNoYFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BsaXRbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIyMgVXRpbGl0aWVzIHNwZWNpZmljIHRvIEdvb2RyZWFkc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdvb2RyZWFkcyA9IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFJlbW92ZXMgc3BhY2VzIGluIGF1dGhvciBuYW1lcyB0aGF0IHVzZSBhZGphY2VudCBpbnRpdGlhbHMuXHJcbiAgICAgICAgICogQHBhcmFtIGF1dGggVGhlIGF1dGhvcihzKVxyXG4gICAgICAgICAqIEBleGFtcGxlIFwiSCBHIFdlbGxzXCIgLT4gXCJIRyBXZWxsc1wiXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc21hcnRBdXRoOiAoYXV0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gVXRpbC5zdHJpbmdUb0FycmF5KGF1dGgpO1xyXG4gICAgICAgICAgICBhcnIuZm9yRWFjaCgoa2V5LCB2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQga2V5IGlzIGFuIGluaXRpYWxcclxuICAgICAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG5leHQga2V5IGlzIGFuIGluaXRpYWwsIGRvbid0IGFkZCBhIHNwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dExlbmc6IG51bWJlciA9IGFyclt2YWwgKyAxXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW5nIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGAke2tleX0gYDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYCR7a2V5fSBgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBzcGFjZVxyXG4gICAgICAgICAgICByZXR1cm4gb3V0cC50cmltKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFR1cm5zIGEgc3RyaW5nIGludG8gYSBHb29kcmVhZHMgc2VhcmNoIFVSTFxyXG4gICAgICAgICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIFVSTCB0byBtYWtlXHJcbiAgICAgICAgICogQHBhcmFtIGlucCBUaGUgZXh0cmFjdGVkIGRhdGEgdG8gVVJJIGVuY29kZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGJ1aWxkU2VhcmNoVVJMOiAodHlwZTogQm9va0RhdGEgfCAnb24nLCBpbnA6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGdvb2RyZWFkcy5idWlsZEdyU2VhcmNoVVJMKCAke3R5cGV9LCAke2lucH0gKWApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZ3JUeXBlOiBzdHJpbmcgPSB0eXBlO1xyXG4gICAgICAgICAgICBjb25zdCBjYXNlczogYW55ID0ge1xyXG4gICAgICAgICAgICAgICAgYm9vazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyVHlwZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2VyaWVzOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JUeXBlID0gJ29uJztcclxuICAgICAgICAgICAgICAgICAgICBpbnAgKz0gJywgIyc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoY2FzZXNbdHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2VzW3R5cGVdKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphL2h0dHBzOi8vd3d3Lmdvb2RyZWFkcy5jb20vc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICBpbnAucmVwbGFjZSgnJScsICcnKVxyXG4gICAgICAgICAgICApLnJlcGxhY2UoXCInXCIsICclMjcnKX0mc2VhcmNoX3R5cGU9Ym9va3Mmc2VhcmNoJTVCZmllbGQlNUQ9JHtnclR5cGV9YDtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgY2xlYW5lZCBib29rIHRpdGxlIGZyb20gYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgdGl0bGUgdGV4dFxyXG4gICAgICogQHBhcmFtIGF1dGggQSBzdHJpbmcgb2YgYXV0aG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEJvb2tUaXRsZSA9IGFzeW5jIChcclxuICAgICAgICBkYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGF1dGg6IHN0cmluZyA9ICcnXHJcbiAgICApID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dldEJvb2tUaXRsZSgpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGV4dHJhY3RlZCA9IGRhdGEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vIFNob3J0ZW4gdGl0bGUgYW5kIGNoZWNrIGl0IGZvciBicmFja2V0cyAmIGF1dGhvciBuYW1lc1xyXG4gICAgICAgIGV4dHJhY3RlZCA9IFV0aWwudHJpbVN0cmluZyhVdGlsLmJyYWNrZXRSZW1vdmVyKGV4dHJhY3RlZCksIDUwKTtcclxuICAgICAgICBleHRyYWN0ZWQgPSBVdGlsLmNoZWNrRGFzaGVzKGV4dHJhY3RlZCwgYXV0aCk7XHJcbiAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFJldHVybiBHUi1mb3JtYXR0ZWQgYXV0aG9ycyBhcyBhbiBhcnJheSBsaW1pdGVkIHRvIGBudW1gXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBUaGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBhdXRob3IgbGlua3NcclxuICAgICAqIEBwYXJhbSBudW0gVGhlIG51bWJlciBvZiBhdXRob3JzIHRvIHJldHVybi4gRGVmYXVsdCAzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va0F1dGhvcnMgPSBhc3luYyAoXHJcbiAgICAgICAgZGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIG51bTogbnVtYmVyID0gM1xyXG4gICAgKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdnZXRCb29rQXV0aG9ycygpIGZhaWxlZDsgZWxlbWVudCB3YXMgbnVsbCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKGF1dGhvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG51bSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRoTGlzdC5wdXNoKFV0aWwuZ29vZHJlYWRzLnNtYXJ0QXV0aChhdXRob3IuaW5uZXJUZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gYXV0aExpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIHNlcmllcyBhcyBhbiBhcnJheVxyXG4gICAgICogQHBhcmFtIGRhdGEgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgc2VyaWVzIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Qm9va1NlcmllcyA9IGFzeW5jIChkYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2dldEJvb2tTZXJpZXMoKSBmYWlsZWQ7IGVsZW1lbnQgd2FzIG51bGwhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKHNlcmllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5wdXNoKHNlcmllcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmllc0xpc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgUmV0dXJuIGEgdGFibGUtbGlrZSBhcnJheSBvZiByb3dzIGFzIGFuIG9iamVjdC5cclxuICAgICAqIFN0b3JlIHRoZSByZXR1cm5lZCBvYmplY3QgYW5kIGFjY2VzcyB1c2luZyB0aGUgcm93IHRpdGxlLCBleC4gYHN0b3JlZFsnVGl0bGU6J11gXHJcbiAgICAgKiBAcGFyYW0gcm93TGlzdCBBbiBhcnJheSBvZiB0YWJsZS1saWtlIHJvd3NcclxuICAgICAqIEBwYXJhbSB0aXRsZUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSB0aXRsZSBjZWxscy4gRGVmYXVsdCBgLnRvckRldExlZnRgXHJcbiAgICAgKiBAcGFyYW0gZGF0YUNsYXNzIFRoZSBjbGFzcyB1c2VkIGJ5IHRoZSBkYXRhIGNlbGxzLiBEZWZhdWx0IGAudG9yRGV0UmlnaHRgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcm93c1RvT2JqID0gKFxyXG4gICAgICAgIHJvd0xpc3Q6IE5vZGVMaXN0T2Y8RWxlbWVudD4sXHJcbiAgICAgICAgdGl0bGVDbGFzcyA9ICcudG9yRGV0TGVmdCcsXHJcbiAgICAgICAgZGF0YUNsYXNzID0gJy50b3JEZXRSaWdodCdcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGlmIChyb3dMaXN0Lmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVdGlsLnJvd3NUb09iaiggJHtyb3dMaXN0fSApOiBSb3cgbGlzdCB3YXMgZW1wdHkhYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJvd3M6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIHJvd0xpc3QuZm9yRWFjaCgocm93KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByb3cucXVlcnlTZWxlY3Rvcih0aXRsZUNsYXNzKTtcclxuICAgICAgICAgICAgY29uc3QgZGF0YTogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoZGF0YUNsYXNzKTtcclxuICAgICAgICAgICAgaWYgKHRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogdGl0bGUudGV4dENvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUm93IHRpdGxlIHdhcyBlbXB0eSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcm93cy5yZWR1Y2UoKG9iaiwgaXRlbSkgPT4gKChvYmpbaXRlbS5rZXldID0gaXRlbS52YWx1ZSksIG9iaiksIHt9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIENvbnZlcnQgYnl0ZXMgaW50byBhIGh1bWFuLXJlYWRhYmxlIHN0cmluZ1xyXG4gICAgICogQ3JlYXRlZCBieSB5eXl6eno5OTlcclxuICAgICAqIEBwYXJhbSBieXRlcyBCeXRlcyB0byBiZSBmb3JtYXR0ZWRcclxuICAgICAqIEBwYXJhbSBiID9cclxuICAgICAqIEByZXR1cm5zIFN0cmluZyBpbiB0aGUgZm9ybWF0IG9mIGV4LiBgMTIzIE1CYFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGZvcm1hdEJ5dGVzID0gKGJ5dGVzOiBudW1iZXIsIGIgPSAyKSA9PiB7XHJcbiAgICAgICAgaWYgKGJ5dGVzID09PSAwKSByZXR1cm4gJzAgQnl0ZXMnO1xyXG4gICAgICAgIGNvbnN0IGMgPSAwID4gYiA/IDAgOiBiO1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZygxMDI0KSk7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdygxMDI0LCBpbmRleCkpLnRvRml4ZWQoYykpICtcclxuICAgICAgICAgICAgJyAnICtcclxuICAgICAgICAgICAgWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ11baW5kZXhdXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBkZXJlZmVyID0gKHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGBodHRwczovL3IubXJkLm5pbmphLyR7ZW5jb2RlVVJJKHVybCl9YDtcclxuICAgIH07XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vKipcclxuICogIyBDbGFzcyBmb3IgaGFuZGxpbmcgdmFsaWRhdGlvbiAmIGNvbmZpcm1hdGlvblxyXG4gKi9cclxuY2xhc3MgQ2hlY2sge1xyXG4gICAgcHVibGljIHN0YXRpYyBuZXdWZXI6IHN0cmluZyA9IEdNX2luZm8uc2NyaXB0LnZlcnNpb247XHJcbiAgICBwdWJsaWMgc3RhdGljIHByZXZWZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdtcF92ZXJzaW9uJyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIFdhaXQgZm9yIGFuIGVsZW1lbnQgdG8gZXhpc3QsIHRoZW4gcmV0dXJuIGl0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBUaGUgRE9NIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZWxlY3QgYW4gZWxlbWVudFxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxIVE1MRWxlbWVudD59IFByb21pc2Ugb2YgYW4gZWxlbWVudCB0aGF0IHdhcyBzZWxlY3RlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGVsZW1Mb2FkKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxFbGVtZW50IHwgZmFsc2U+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYCVjIExvb2tpbmcgZm9yICR7c2VsZWN0b3J9YCwgJ2JhY2tncm91bmQ6ICMyMjI7IGNvbG9yOiAjNTU1Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBfY291bnRlciA9IDA7XHJcbiAgICAgICAgY29uc3QgX2NvdW50ZXJMaW1pdCA9IDIwMDtcclxuICAgICAgICBjb25zdCBsb2dpYyA9IGFzeW5jIChzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIVE1MRWxlbWVudCB8IGZhbHNlPiA9PiB7XHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgYWN0dWFsIGVsZW1lbnRcclxuICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoZWxlbSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBgJHtzZWxlY3Rvcn0gaXMgdW5kZWZpbmVkIWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPCBfY291bnRlckxpbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLmFmVGltZXIoKTtcclxuICAgICAgICAgICAgICAgIF9jb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgbG9naWMoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0gPT09IG51bGwgJiYgX2NvdW50ZXIgPj0gX2NvdW50ZXJMaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgX2NvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxvZ2ljKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICogUnVuIGEgZnVuY3Rpb24gd2hlbmV2ZXIgYW4gZWxlbWVudCBjaGFuZ2VzXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgLSBUaGUgZWxlbWVudCB0byBiZSBvYnNlcnZlZC4gQ2FuIGJlIGEgc3RyaW5nLlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBvYnNlcnZlciB0cmlnZ2Vyc1xyXG4gICAgICogQHJldHVybiBQcm9taXNlIG9mIGEgbXV0YXRpb24gb2JzZXJ2ZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBlbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgc2VsZWN0b3I6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBjYWxsYmFjazogTXV0YXRpb25DYWxsYmFjayxcclxuICAgICAgICBjb25maWc6IE11dGF0aW9uT2JzZXJ2ZXJJbml0ID0ge1xyXG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgKTogUHJvbWlzZTxNdXRhdGlvbk9ic2VydmVyPiB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkID0gPEhUTUxFbGVtZW50IHwgbnVsbD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgJyR7c2VsZWN0b3J9J2ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIGAlYyBTZXR0aW5nIG9ic2VydmVyIG9uICR7c2VsZWN0b3J9OiAke3NlbGVjdGVkfWAsXHJcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZDogIzIyMjsgY29sb3I6ICM1ZDhhYTgnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xyXG5cclxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHNlbGVjdGVkISwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgc2NyaXB0IGhhcyBiZWVuIHVwZGF0ZWQgZnJvbSBhbiBvbGRlciB2ZXJzaW9uXHJcbiAgICAgKiBAcmV0dXJuIFRoZSB2ZXJzaW9uIHN0cmluZyBvciBmYWxzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHVwZGF0ZWQoKTogUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoJ0NoZWNrLnVwZGF0ZWQoKScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUFJFViBWRVIgPSAke3RoaXMucHJldlZlcn1gKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYE5FVyBWRVIgPSAke3RoaXMubmV3VmVyfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgLy8gRGlmZmVyZW50IHZlcnNpb25zOyB0aGUgc2NyaXB0IHdhcyB1cGRhdGVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1ZlciAhPT0gdGhpcy5wcmV2VmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2NyaXB0IGlzIG5ldyBvciB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgbmV3IHZlcnNpb25cclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF92ZXJzaW9uJywgdGhpcy5uZXdWZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJldlZlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzY3JpcHQgaGFzIHJ1biBiZWZvcmVcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgcnVuIGJlZm9yZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ3VwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QtdGltZSBydW5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBoYXMgbmV2ZXIgcnVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5hYmxlIHRoZSBtb3N0IGJhc2ljIGZlYXR1cmVzXHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ2dvb2RyZWFkc0J0bicsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdhbGVydHMnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdmaXJzdFJ1bicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NjcmlwdCBub3QgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIENoZWNrIHRvIHNlZSB3aGF0IHBhZ2UgaXMgYmVpbmcgYWNjZXNzZWRcclxuICAgICAqIEBwYXJhbSB7VmFsaWRQYWdlfSBwYWdlUXVlcnkgLSBBbiBvcHRpb25hbCBwYWdlIHRvIHNwZWNpZmljYWxseSBjaGVjayBmb3JcclxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn0gQSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gT3B0aW9uYWxseSwgYSBib29sZWFuIGlmIHRoZSBjdXJyZW50IHBhZ2UgbWF0Y2hlcyB0aGUgYHBhZ2VRdWVyeWBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKHBhZ2VRdWVyeT86IFZhbGlkUGFnZSk6IFByb21pc2U8c3RyaW5nIHwgYm9vbGVhbj4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFBhZ2UgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBsZXQgY3VycmVudFBhZ2U6IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrLnBhZ2UoKSBoYXMgYmVlbiBydW4gYW5kIGEgdmFsdWUgd2FzIHN0b3JlZFxyXG4gICAgICAgICAgICBpZiAoc3RvcmVkUGFnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqdXN0IGNoZWNraW5nIHdoYXQgcGFnZSB3ZSdyZSBvbiwgcmV0dXJuIHRoZSBzdG9yZWQgcGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKCFwYWdlUXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0b3JlZFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIGNoZWNraW5nIGZvciBhIHNwZWNpZmljIHBhZ2UsIHJldHVybiBUUlVFL0ZBTFNFXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VRdWVyeSA9PT0gc3RvcmVkUGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sucGFnZSgpIGhhcyBub3QgcHJldmlvdXMgcnVuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGFnZVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLmluZGV4T2YoJy5waHAnKSA/IHBhdGguc3BsaXQoJy5waHAnKVswXSA6IHBhdGg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWdlID0gcGF0aC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICAgICAgcGFnZS5zaGlmdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQYWdlIFVSTCBAICR7cGFnZS5qb2luKCcgLT4gJyl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCBsaXRlcmFsIG9mIHNvcnRzIHRvIHVzZSBhcyBhIFwic3dpdGNoXCJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IFZhbGlkUGFnZSB8IHVuZGVmaW5lZCB9ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICcnOiAoKSA9PiAnaG9tZScsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICgpID0+ICdob21lJyxcclxuICAgICAgICAgICAgICAgICAgICBzaG91dGJveDogKCkgPT4gJ3Nob3V0Ym94JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogKCkgPT4gJ3NldHRpbmdzJyxcclxuICAgICAgICAgICAgICAgICAgICBtaWxsaW9uYWlyZXM6ICgpID0+ICd2YXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdDogKCkgPT4gJ3RvcnJlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHU6ICgpID0+ICd1c2VyJyxcclxuICAgICAgICAgICAgICAgICAgICBmOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWdlWzFdID09PSAndCcpIHJldHVybiAnZm9ydW0gdGhyZWFkJztcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFnZVsxXSA9PT0gJ2Jyb3dzZScpIHJldHVybiAnYnJvd3NlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3JlcXVlc3RzMicpIHJldHVybiAncmVxdWVzdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhZ2VbMV0gPT09ICd2aWV3UmVxdWVzdCcpIHJldHVybiAncmVxdWVzdCBkZXRhaWxzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocGFnZVsxXSA9PT0gJ3VwbG9hZCcpIHJldHVybiAndXBsb2FkJztcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhIGNhc2UgdGhhdCBtYXRjaGVzIHRoZSBjdXJyZW50IHBhZ2VcclxuICAgICAgICAgICAgICAgIGlmIChjYXNlc1twYWdlWzBdXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlID0gY2FzZXNbcGFnZVswXV0oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBQYWdlIFwiJHtwYWdlfVwiIGlzIG5vdCBhIHZhbGlkIE0rIHBhZ2UuIFBhdGg6ICR7cGF0aH1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFBhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgcGFnZSB0byBiZSBhY2Nlc3NlZCBsYXRlclxyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9jdXJyZW50UGFnZScsIGN1cnJlbnRQYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UncmUganVzdCBjaGVja2luZyB3aGF0IHBhZ2Ugd2UncmUgb24sIHJldHVybiB0aGUgcGFnZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFnZVF1ZXJ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3VycmVudFBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBjaGVja2luZyBmb3IgYSBzcGVjaWZpYyBwYWdlLCByZXR1cm4gVFJVRS9GQUxTRVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFnZVF1ZXJ5ID09PSBjdXJyZW50UGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDaGVjayB0byBzZWUgaWYgYSBnaXZlbiBjYXRlZ29yeSBpcyBhbiBlYm9vay9hdWRpb2Jvb2sgY2F0ZWdvcnlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBpc0Jvb2tDYXQoY2F0OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICAvLyBDdXJyZW50bHksIGFsbCBib29rIGNhdGVnb3JpZXMgYXJlIGFzc3VtZWQgdG8gYmUgaW4gdGhlIHJhbmdlIG9mIDM5LTEyMFxyXG4gICAgICAgIHJldHVybiBjYXQgPj0gMzkgJiYgY2F0IDw9IDEyMCA/IHRydWUgOiBmYWxzZTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiY2hlY2sudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciBoYW5kbGluZyB2YWx1ZXMgYW5kIG1ldGhvZHMgcmVsYXRlZCB0byBzdHlsZXNcclxuICogQGNvbnN0cnVjdG9yIEluaXRpYWxpemVzIHRoZW1lIGJhc2VkIG9uIGxhc3Qgc2F2ZWQgdmFsdWU7IGNhbiBiZSBjYWxsZWQgYmVmb3JlIHBhZ2UgY29udGVudCBpcyBsb2FkZWRcclxuICogQG1ldGhvZCB0aGVtZSBHZXRzIG9yIHNldHMgdGhlIGN1cnJlbnQgdGhlbWVcclxuICovXHJcbmNsYXNzIFN0eWxlIHtcclxuICAgIHByaXZhdGUgX3RoZW1lOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIF9wcmV2VGhlbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX2Nzc0RhdGE6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBUaGUgbGlnaHQgdGhlbWUgaXMgdGhlIGRlZmF1bHQgdGhlbWUsIHNvIHVzZSBNKyBMaWdodCB2YWx1ZXNcclxuICAgICAgICB0aGlzLl90aGVtZSA9ICdsaWdodCc7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcHJldmlvdXNseSB1c2VkIHRoZW1lIG9iamVjdFxyXG4gICAgICAgIHRoaXMuX3ByZXZUaGVtZSA9IHRoaXMuX2dldFByZXZUaGVtZSgpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgdGhlbWUgb2JqZWN0IGV4aXN0cywgYXNzdW1lIHRoZSBjdXJyZW50IHRoZW1lIGlzIGlkZW50aWNhbFxyXG4gICAgICAgIGlmICh0aGlzLl9wcmV2VGhlbWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl90aGVtZSA9IHRoaXMuX3ByZXZUaGVtZTtcclxuICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oJ25vIHByZXZpb3VzIHRoZW1lJyk7XHJcblxyXG4gICAgICAgIC8vIEZldGNoIHRoZSBDU1MgZGF0YVxyXG4gICAgICAgIHRoaXMuX2Nzc0RhdGEgPSBHTV9nZXRSZXNvdXJjZVRleHQoJ01QX0NTUycpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBbGxvd3MgdGhlIGN1cnJlbnQgdGhlbWUgdG8gYmUgcmV0dXJuZWQgKi9cclxuICAgIGdldCB0aGVtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90aGVtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogQWxsb3dzIHRoZSBjdXJyZW50IHRoZW1lIHRvIGJlIHNldCAqL1xyXG4gICAgc2V0IHRoZW1lKHZhbDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fdGhlbWUgPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgdGhlIE0rIHRoZW1lIGJhc2VkIG9uIHRoZSBzaXRlIHRoZW1lICovXHJcbiAgICBwdWJsaWMgYXN5bmMgYWxpZ25Ub1NpdGVUaGVtZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCB0aGVtZTogc3RyaW5nID0gYXdhaXQgdGhpcy5fZ2V0U2l0ZUNTUygpO1xyXG4gICAgICAgIHRoaXMuX3RoZW1lID0gdGhlbWUuaW5kZXhPZignZGFyaycpID4gMCA/ICdkYXJrJyA6ICdsaWdodCc7XHJcbiAgICAgICAgaWYgKHRoaXMuX3ByZXZUaGVtZSAhPT0gdGhpcy5fdGhlbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fc2V0UHJldlRoZW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmplY3QgdGhlIENTUyBjbGFzcyB1c2VkIGJ5IE0rIGZvciB0aGVtaW5nXHJcbiAgICAgICAgQ2hlY2suZWxlbUxvYWQoJ2JvZHknKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYm9keTogSFRNTEJvZHlFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcclxuICAgICAgICAgICAgaWYgKGJvZHkpIHtcclxuICAgICAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChgbXBfJHt0aGlzLl90aGVtZX1gKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBCb2R5IGlzICR7Ym9keX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbmplY3RzIHRoZSBzdHlsZXNoZWV0IGxpbmsgaW50byB0aGUgaGVhZGVyICovXHJcbiAgICBwdWJsaWMgaW5qZWN0TGluaygpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBpZDogc3RyaW5nID0gJ21wX2Nzcyc7XHJcbiAgICAgICAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGU6IEhUTUxTdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICBzdHlsZS5pZCA9IGlkO1xyXG4gICAgICAgICAgICBzdHlsZS5pbm5lclRleHQgPSB0aGlzLl9jc3NEYXRhICE9PSB1bmRlZmluZWQgPyB0aGlzLl9jc3NEYXRhIDogJyc7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKSEuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgYW4gZWxlbWVudCB3aXRoIHRoZSBpZCBcIiR7aWR9XCIgYWxyZWFkeSBleGlzdHNgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogUmV0dXJucyB0aGUgcHJldmlvdXMgdGhlbWUgb2JqZWN0IGlmIGl0IGV4aXN0cyAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0UHJldlRoZW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIEdNX2dldFZhbHVlKCdzdHlsZV90aGVtZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTYXZlcyB0aGUgY3VycmVudCB0aGVtZSBmb3IgZnV0dXJlIHJlZmVyZW5jZSAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0UHJldlRoZW1lKCk6IHZvaWQge1xyXG4gICAgICAgIEdNX3NldFZhbHVlKCdzdHlsZV90aGVtZScsIHRoaXMuX3RoZW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRTaXRlQ1NTKCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRoZW1lVVJMOiBzdHJpbmcgfCBudWxsID0gZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykhXHJcbiAgICAgICAgICAgICAgICAuZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhlbWVVUkwgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoZW1lVVJMKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykgY29uc29sZS53YXJuKGB0aGVtZVVybCBpcyBub3QgYSBzdHJpbmc6ICR7dGhlbWVVUkx9YCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NoZWNrLnRzXCIgLz5cclxuLyoqXHJcbiAqIENPUkUgRkVBVFVSRVNcclxuICpcclxuICogWW91ciBmZWF0dXJlIGJlbG9uZ3MgaGVyZSBpZiB0aGUgZmVhdHVyZTpcclxuICogQSkgaXMgY3JpdGljYWwgdG8gdGhlIHVzZXJzY3JpcHRcclxuICogQikgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBieSBvdGhlciBmZWF0dXJlc1xyXG4gKiBDKSB3aWxsIGhhdmUgc2V0dGluZ3MgZGlzcGxheWVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlXHJcbiAqIElmIEEgJiBCIGFyZSBtZXQgYnV0IG5vdCBDIGNvbnNpZGVyIHVzaW5nIGBVdGlscy50c2AgaW5zdGVhZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGZlYXR1cmUgY3JlYXRlcyBhIHBvcC11cCBub3RpZmljYXRpb25cclxuICovXHJcbmNsYXNzIEFsZXJ0cyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLk90aGVyLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdhbGVydHMnLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTSsgQWxlcnQgcGFuZWwgZm9yIHVwZGF0ZSBpbmZvcm1hdGlvbiwgZXRjLicsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIE1QLnNldHRpbmdzR2xvYi5wdXNoKHRoaXMuX3NldHRpbmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbm90aWZ5KGtpbmQ6IHN0cmluZyB8IGJvb2xlYW4sIGxvZzogQXJyYXlPYmplY3QpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmdyb3VwKGBBbGVydHMubm90aWZ5KCAke2tpbmR9IClgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBWZXJpZnkgYSBub3RpZmljYXRpb24gcmVxdWVzdCB3YXMgbWFkZVxyXG4gICAgICAgICAgICBpZiAoa2luZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVmVyaWZ5IG5vdGlmaWNhdGlvbnMgYXJlIGFsbG93ZWRcclxuICAgICAgICAgICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnYWxlcnRzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0byBidWlsZCBtc2cgdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1aWxkTXNnID0gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnI6IHN0cmluZ1tdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgYnVpbGRNc2coICR7dGl0bGV9IClgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGFycmF5IGlzbid0IGVtcHR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnIubGVuZ3RoID4gMCAmJiBhcnJbMF0gIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBzZWN0aW9uIGhlYWRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtc2c6IHN0cmluZyA9IGA8aDQ+JHt0aXRsZX06PC9oND48dWw+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIGl0ZW0gaW4gdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9IGA8bGk+JHtpdGVtfTwvbGk+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnICs9ICc8L3VsPic7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdG8gYnVpbGQgbm90aWZpY2F0aW9uIHBhbmVsXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbGRQYW5lbCA9IChtc2c6IHN0cmluZyk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBidWlsZFBhbmVsKCAke21zZ30gKWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCdib2R5JykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCArPSBgPGRpdiBjbGFzcz0nbXBfbm90aWZpY2F0aW9uJz4ke21zZ308c3Bhbj5YPC9zcGFuPjwvZGl2PmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2dCb3g6IEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfbm90aWZpY2F0aW9uJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUJ0bjogSFRNTFNwYW5FbGVtZW50ID0gbXNnQm94LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3NlQnRuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBjbG9zZSBidXR0b24gaXMgY2xpY2tlZCwgcmVtb3ZlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtc2dCb3gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnQm94LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2luZCA9PT0gJ3VwZGF0ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0J1aWxkaW5nIHVwZGF0ZSBtZXNzYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGA8c3Ryb25nPk1BTSsgaGFzIGJlZW4gdXBkYXRlZCE8L3N0cm9uZz4gWW91IGFyZSBub3cgdXNpbmcgdiR7TVAuVkVSU0lPTn0sIGNyZWF0ZWQgb24gJHtNUC5USU1FU1RBTVB9LiBEaXNjdXNzIGl0IG9uIDxhIGhyZWY9J2ZvcnVtcy5waHA/YWN0aW9uPXZpZXd0b3BpYyZ0b3BpY2lkPTQxODYzJz50aGUgZm9ydW1zPC9hPi48aHI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBjaGFuZ2Vsb2dcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBidWlsZE1zZyhsb2cuVVBEQVRFX0xJU1QsICdDaGFuZ2VzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gYnVpbGRNc2cobG9nLkJVR19MSVNULCAnS25vd24gQnVncycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gJ2ZpcnN0UnVuJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8aDQ+V2VsY29tZSB0byBNQU0rITwvaDQ+UGxlYXNlIGhlYWQgb3ZlciB0byB5b3VyIDxhIGhyZWY9XCIvcHJlZmVyZW5jZXMvaW5kZXgucGhwXCI+cHJlZmVyZW5jZXM8L2E+IHRvIGVuYWJsZSB0aGUgTUFNKyBzZXR0aW5ncy48YnI+QW55IGJ1ZyByZXBvcnRzLCBmZWF0dXJlIHJlcXVlc3RzLCBldGMuIGNhbiBiZSBtYWRlIG9uIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvaXNzdWVzXCI+R2l0aHViPC9hPiwgPGEgaHJlZj1cIi9mb3J1bXMucGhwP2FjdGlvbj12aWV3dG9waWMmdG9waWNpZD00MTg2M1wiPnRoZSBmb3J1bXM8L2E+LCBvciA8YSBocmVmPVwiL3NlbmRtZXNzYWdlLnBocD9yZWNlaXZlcj0xMDgzMDNcIj50aHJvdWdoIHByaXZhdGUgbWVzc2FnZTwvYT4uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgZmlyc3QgcnVuIG1lc3NhZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBSZWNlaXZlZCBtc2cga2luZDogJHtraW5kfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBidWlsZFBhbmVsKG1lc3NhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmaWNhdGlvbnMgYXJlIGRpc2FibGVkXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aWZpY2F0aW9ucyBhcmUgZGlzYWJsZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlYnVnIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuT3RoZXIsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2RlYnVnJyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnRXJyb3IgbG9nICg8ZW0+Q2xpY2sgdGhpcyBjaGVja2JveCB0byBlbmFibGUgdmVyYm9zZSBsb2dnaW5nIHRvIHRoZSBjb25zb2xlPC9lbT4pJyxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgTVAuc2V0dGluZ3NHbG9iLnB1c2godGhpcy5fc2V0dGluZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogIyBHTE9CQUwgRkVBVFVSRVNcclxuICovXHJcblxyXG4vKipcclxuICogIyMgSGlkZSB0aGUgaG9tZSBidXR0b24gb3IgdGhlIGJhbm5lclxyXG4gKi9cclxuY2xhc3MgSGlkZUhvbWUgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBEcm9wZG93blNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2Ryb3Bkb3duJyxcclxuICAgICAgICB0aXRsZTogJ2hpZGVIb21lJyxcclxuICAgICAgICB0YWc6ICdSZW1vdmUgYmFubmVyL2hvbWUnLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogJ0RvIG5vdCByZW1vdmUgZWl0aGVyJyxcclxuICAgICAgICAgICAgaGlkZUJhbm5lcjogJ0hpZGUgdGhlIGJhbm5lcicsXHJcbiAgICAgICAgICAgIGhpZGVIb21lOiAnSGlkZSB0aGUgaG9tZSBidXR0b24nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzYzogJ1JlbW92ZSB0aGUgaGVhZGVyIGltYWdlIG9yIEhvbWUgYnV0dG9uLCBiZWNhdXNlIGJvdGggbGluayB0byB0aGUgaG9tZXBhZ2UnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNtYWlubWVudSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBoaWRlcjogc3RyaW5nID0gR01fZ2V0VmFsdWUodGhpcy5fc2V0dGluZ3MudGl0bGUpO1xyXG4gICAgICAgIGlmIChoaWRlciA9PT0gJ2hpZGVIb21lJykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfaG9tZScpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBIaWQgdGhlIGhvbWUgYnV0dG9uIScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaGlkZXIgPT09ICdoaWRlQmFubmVyJykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ21wX2hpZGVfYmFubmVyJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgYmFubmVyIScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogRHJvcGRvd25TZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBCeXBhc3MgdGhlIHZhdWx0IGluZm8gcGFnZVxyXG4gKi9cclxuY2xhc3MgVmF1bHRMaW5rIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd2YXVsdExpbmsnLFxyXG4gICAgICAgIGRlc2M6ICdNYWtlIHRoZSBWYXVsdCBsaW5rIGJ5cGFzcyB0aGUgVmF1bHQgSW5mbyBwYWdlJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgZG9jdW1lbnRcclxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKSFcclxuICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnaHJlZicsICcvbWlsbGlvbmFpcmVzL2RvbmF0ZS5waHAnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBNYWRlIHRoZSB2YXVsdCB0ZXh0IGxpbmsgdG8gdGhlIGRvbmF0ZSBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIFNob3J0ZW4gdGhlIHZhdWx0ICYgcmF0aW8gdGV4dFxyXG4gKi9cclxuY2xhc3MgTWluaVZhdWx0SW5mbyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkdsb2JhbCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnbWluaVZhdWx0SW5mbycsXHJcbiAgICAgICAgZGVzYzogJ1Nob3J0ZW4gdGhlIFZhdWx0IGxpbmsgJiByYXRpbyB0ZXh0JyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWlsbGlvbkluZm8nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgdmF1bHRUZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgY29uc3QgcmF0aW9UZXh0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJykhO1xyXG5cclxuICAgICAgICAvLyBTaG9ydGVuIHRoZSByYXRpbyB0ZXh0XHJcbiAgICAgICAgLy8gVE9ETzogbW92ZSB0aGlzIHRvIGl0cyBvd24gc2V0dGluZz9cclxuICAgICAgICAvKiBUaGlzIGNoYWluZWQgbW9uc3Ryb3NpdHkgZG9lcyB0aGUgZm9sbG93aW5nOlxyXG4gICAgICAgIC0gRXh0cmFjdCB0aGUgbnVtYmVyICh3aXRoIGZsb2F0KSBmcm9tIHRoZSBlbGVtZW50XHJcbiAgICAgICAgLSBGaXggdGhlIGZsb2F0IHRvIDIgZGVjaW1hbCBwbGFjZXMgKHdoaWNoIGNvbnZlcnRzIGl0IGJhY2sgaW50byBhIHN0cmluZylcclxuICAgICAgICAtIENvbnZlcnQgdGhlIHN0cmluZyBiYWNrIGludG8gYSBudW1iZXIgc28gdGhhdCB3ZSBjYW4gY29udmVydCBpdCB3aXRoYHRvTG9jYWxlU3RyaW5nYCB0byBnZXQgY29tbWFzIGJhY2sgKi9cclxuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIoVXRpbC5leHRyYWN0RmxvYXQocmF0aW9UZXh0KVswXS50b0ZpeGVkKDIpKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgIHJhdGlvVGV4dC5pbm5lckhUTUwgPSBgJHtudW19IDxpbWcgc3JjPVwiL3BpYy91cGRvd25CaWcucG5nXCIgYWx0PVwicmF0aW9cIj5gO1xyXG5cclxuICAgICAgICAvLyBUdXJuIHRoZSBudW1lcmljIHBvcnRpb24gb2YgdGhlIHZhdWx0IGxpbmsgaW50byBhIG51bWJlclxyXG4gICAgICAgIGxldCBuZXdUZXh0OiBudW1iZXIgPSBwYXJzZUludChcclxuICAgICAgICAgICAgdmF1bHRUZXh0LnRleHRDb250ZW50IS5zcGxpdCgnOicpWzFdLnNwbGl0KCcgJylbMV0ucmVwbGFjZSgvLC9nLCAnJylcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IHRoZSB2YXVsdCBhbW91bnQgdG8gbWlsbGlvbnRoc1xyXG4gICAgICAgIG5ld1RleHQgPSBOdW1iZXIoKG5ld1RleHQgLyAxZTYpLnRvRml4ZWQoMykpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdmF1bHQgdGV4dFxyXG4gICAgICAgIHZhdWx0VGV4dC50ZXh0Q29udGVudCA9IGBWYXVsdDogJHtuZXdUZXh0fSBtaWxsaW9uYDtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaG9ydGVuZWQgdGhlIHZhdWx0ICYgcmF0aW8gbnVtYmVycyEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIyBEaXNwbGF5IGJvbnVzIHBvaW50IGRlbHRhXHJcbiAqL1xyXG5jbGFzcyBCb251c1BvaW50RGVsdGEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5HbG9iYWwsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2JvbnVzUG9pbnREZWx0YScsXHJcbiAgICAgICAgZGVzYzogYERpc3BsYXkgaG93IG1hbnkgYm9udXMgcG9pbnRzIHlvdSd2ZSBnYWluZWQgc2luY2UgbGFzdCBwYWdlbG9hZGAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RtQlAnO1xyXG4gICAgcHJpdmF0ZSBfcHJldkJQOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBfY3VycmVudEJQOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBfZGVsdGE6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhcikudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudEJQRWw6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IG9sZCBCUCB2YWx1ZVxyXG4gICAgICAgIHRoaXMuX3ByZXZCUCA9IHRoaXMuX2dldEJQKCk7XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50QlBFbCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBFeHRyYWN0IG9ubHkgdGhlIG51bWJlciBmcm9tIHRoZSBCUCBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQ6IFJlZ0V4cE1hdGNoQXJyYXkgPSBjdXJyZW50QlBFbC50ZXh0Q29udGVudCEubWF0Y2goXHJcbiAgICAgICAgICAgICAgICAvXFxkKy9nXHJcbiAgICAgICAgICAgICkgYXMgUmVnRXhwTWF0Y2hBcnJheTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCBuZXcgQlAgdmFsdWVcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudEJQID0gcGFyc2VJbnQoY3VycmVudFswXSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldEJQKHRoaXMuX2N1cnJlbnRCUCk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgZGVsdGFcclxuICAgICAgICAgICAgdGhpcy5fZGVsdGEgPSB0aGlzLl9jdXJyZW50QlAgLSB0aGlzLl9wcmV2QlA7XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSB0ZXh0IGlmIG5vdCAwXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9kZWx0YSAhPT0gMCAmJiAhaXNOYU4odGhpcy5fZGVsdGEpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwbGF5QlAodGhpcy5fZGVsdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Rpc3BsYXlCUCA9IChicDogbnVtYmVyKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgYm9udXNCb3g6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBsZXQgZGVsdGFCb3g6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICBkZWx0YUJveCA9IGJwID4gMCA/IGArJHticH1gIDogYCR7YnB9YDtcclxuXHJcbiAgICAgICAgaWYgKGJvbnVzQm94ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGJvbnVzQm94LmlubmVySFRNTCArPSBgPHNwYW4gY2xhc3M9J21wX2JwRGVsdGEnPiAoJHtkZWx0YUJveH0pPC9zcGFuPmA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIF9zZXRCUCA9IChicDogbnVtYmVyKTogdm9pZCA9PiB7XHJcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9VmFsYCwgYCR7YnB9YCk7XHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfZ2V0QlAgPSAoKTogbnVtYmVyID0+IHtcclxuICAgICAgICBjb25zdCBzdG9yZWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVZhbGApO1xyXG4gICAgICAgIGlmIChzdG9yZWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RvcmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICMjIEJsdXIgdGhlIGhlYWRlciBiYWNrZ3JvdW5kXHJcbiAqL1xyXG5jbGFzcyBCbHVycmVkSGVhZGVyIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdibHVycmVkSGVhZGVyJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYmx1cnJlZCBiYWNrZ3JvdW5kIHRvIHRoZSBoZWFkZXIgYXJlYWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3NpdGVNYWluID4gaGVhZGVyJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIpLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgaGVhZGVyOiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAke3RoaXMuX3Rhcn1gKTtcclxuICAgICAgICBjb25zdCBoZWFkZXJJbWc6IEhUTUxJbWFnZUVsZW1lbnQgfCBudWxsID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoYGltZ2ApO1xyXG5cclxuICAgICAgICBpZiAoaGVhZGVySW1nKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlclNyYzogc3RyaW5nIHwgbnVsbCA9IGhlYWRlckltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xyXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIGNvbnRhaW5lciBmb3IgdGhlIGJhY2tncm91bmRcclxuICAgICAgICAgICAgY29uc3QgYmx1cnJlZEJhY2s6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZCgnbXBfYmx1cnJlZEJhY2snKTtcclxuICAgICAgICAgICAgaGVhZGVyLmFwcGVuZChibHVycmVkQmFjayk7XHJcbiAgICAgICAgICAgIGJsdXJyZWRCYWNrLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGhlYWRlclNyYyA/IGB1cmwoJHtoZWFkZXJTcmN9KWAgOiAnJztcclxuICAgICAgICAgICAgYmx1cnJlZEJhY2suY2xhc3NMaXN0LmFkZCgnbXBfY29udGFpbmVyJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCBhIGJsdXJyZWQgYmFja2dyb3VuZCB0byB0aGUgaGVhZGVyIScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdHlwZSBzZWxlY3RlZCBmb3IgYHRoaXMuX3NldHRpbmdzYFxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMgSGlkZSB0aGUgc2VlZGJveCBsaW5rXHJcbiAqL1xyXG5jbGFzcyBIaWRlU2VlZGJveCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnaGlkZVNlZWRib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIGRlc2M6ICdSZW1vdmUgdGhlIFwiR2V0IEEgU2VlZGJveFwiIG1lbnUgaXRlbScsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI21lbnUnO1xyXG4gICAgLy8gVGhlIGNvZGUgdGhhdCBydW5zIHdoZW4gdGhlIGZlYXR1cmUgaXMgY3JlYXRlZCBvbiBgZmVhdHVyZXMudHNgLlxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gQWRkIDErIHZhbGlkIHBhZ2UgdHlwZS4gRXhjbHVkZSBmb3IgZ2xvYmFsXHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgW10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzZWVkYm94QnRuOiBIVE1MTElFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjbWVudSAuc2JEb25DcnlwdG8nXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoc2VlZGJveEJ0bikgc2VlZGJveEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEhpZCB0aGUgU2VlZGJveCBidXR0b24hJyk7XHJcbiAgICB9XHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAjIEZpeGVkIG5hdmlnYXRpb24gJiBzZWFyY2hcclxuICovXHJcblxyXG5jbGFzcyBGaXhlZE5hdiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnZml4ZWROYXYnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuR2xvYmFsLFxyXG4gICAgICAgIGRlc2M6ICdGaXggdGhlIG5hdmlnYXRpb24vc2VhcmNoIHRvIHRoZSB0b3Agb2YgdGhlIHBhZ2UuJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICdib2R5JztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFtdKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpIS5jbGFzc0xpc3QuYWRkKCdtcF9maXhlZF9uYXYnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBQaW5uZWQgdGhlIG5hdi9zZWFyY2ggdG8gdGhlIHRvcCEnKTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBnaWZ0IG5ld2VzdCAxMCBtZW1iZXJzIHRvIE1BTSBvbiBIb21lcGFnZSBvciBvcGVuIHRoZWlyIHVzZXIgcGFnZXNcclxuICovXHJcbmNsYXNzIEdpZnROZXdlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5Ib21lLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnaWZ0TmV3ZXN0JyxcclxuICAgICAgICBkZXNjOiBgQWRkIGJ1dHRvbnMgdG8gR2lmdC9PcGVuIGFsbCBuZXdlc3QgbWVtYmVyc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2ZwTk0nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vZW5zdXJlIGdpZnRlZCBsaXN0IGlzIHVuZGVyIDUwIG1lbWJlciBuYW1lcyBsb25nXHJcbiAgICAgICAgdGhpcy5fdHJpbUdpZnRMaXN0KCk7XHJcbiAgICAgICAgLy9nZXQgdGhlIEZyb250UGFnZSBOZXdNZW1iZXJzIGVsZW1lbnQgY29udGFpbmluZyBuZXdlc3QgMTAgbWVtYmVyc1xyXG4gICAgICAgIGNvbnN0IGZwTk0gPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLl90YXIpO1xyXG4gICAgICAgIGNvbnN0IG1lbWJlcnM6IEhUTUxBbmNob3JFbGVtZW50W10gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcclxuICAgICAgICAgICAgZnBOTS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBsYXN0TWVtID0gbWVtYmVyc1ttZW1iZXJzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIG1lbWJlcnMuZm9yRWFjaCgobWVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgIC8vYWRkIGEgY2xhc3MgdG8gdGhlIGV4aXN0aW5nIGVsZW1lbnQgZm9yIHVzZSBpbiByZWZlcmVuY2UgaW4gY3JlYXRpbmcgYnV0dG9uc1xyXG4gICAgICAgICAgICBtZW1iZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsIGBtcF9yZWZQb2ludF8ke1V0aWwuZW5kT2ZIcmVmKG1lbWJlcil9YCk7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIG1lbWJlciBoYXMgYmVlbiBnaWZ0ZWQgdGhyb3VnaCB0aGlzIGZlYXR1cmUgcHJldmlvdXNseVxyXG4gICAgICAgICAgICBpZiAoR01fZ2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnKS5pbmRleE9mKFV0aWwuZW5kT2ZIcmVmKG1lbWJlcikpID49IDApIHtcclxuICAgICAgICAgICAgICAgIC8vYWRkIGNoZWNrZWQgYm94IHRvIHRleHRcclxuICAgICAgICAgICAgICAgIG1lbWJlci5pbm5lclRleHQgPSBgJHttZW1iZXIuaW5uZXJUZXh0fSBcXHUyNjExYDtcclxuICAgICAgICAgICAgICAgIG1lbWJlci5jbGFzc0xpc3QuYWRkKCdtcF9naWZ0ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGdpZnRzIHNldCBpbiBwcmVmZXJlbmNlcyBmb3IgdXNlciBwYWdlXHJcbiAgICAgICAgbGV0IGdpZnRWYWx1ZVNldHRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCd1c2VyR2lmdERlZmF1bHRfdmFsJyk7XHJcbiAgICAgICAgLy9pZiB0aGV5IGRpZCBub3Qgc2V0IGEgdmFsdWUgaW4gcHJlZmVyZW5jZXMsIHNldCB0byAxMDAgb3Igc2V0IHRvIG1heCBvciBtaW5cclxuICAgICAgICAvLyBUT0RPOiBNYWtlIHRoZSBnaWZ0IHZhbHVlIGNoZWNrIGludG8gYSBVdGlsXHJcbiAgICAgICAgaWYgKCFnaWZ0VmFsdWVTZXR0aW5nKSB7XHJcbiAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA+IDEwMDAgfHwgaXNOYU4oTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpKSkge1xyXG4gICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMDAnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKGdpZnRWYWx1ZVNldHRpbmcpIDwgNSkge1xyXG4gICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzUnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NyZWF0ZSB0aGUgdGV4dCBpbnB1dCBmb3IgaG93IG1hbnkgcG9pbnRzIHRvIGdpdmVcclxuICAgICAgICBjb25zdCBnaWZ0QW1vdW50czogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgVXRpbC5zZXRBdHRyKGdpZnRBbW91bnRzLCB7XHJcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgc2l6ZTogJzMnLFxyXG4gICAgICAgICAgICBpZDogJ21wX2dpZnRBbW91bnRzJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDAnLFxyXG4gICAgICAgICAgICB2YWx1ZTogZ2lmdFZhbHVlU2V0dGluZyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2luc2VydCB0aGUgdGV4dCBib3ggYWZ0ZXIgdGhlIGxhc3QgbWVtYmVycyBuYW1lXHJcbiAgICAgICAgbGFzdE1lbS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgZ2lmdEFtb3VudHMpO1xyXG5cclxuICAgICAgICAvL21ha2UgdGhlIGJ1dHRvbiBhbmQgaW5zZXJ0IGFmdGVyIHRoZSBsYXN0IG1lbWJlcnMgbmFtZSAoYmVmb3JlIHRoZSBpbnB1dCB0ZXh0KVxyXG4gICAgICAgIGNvbnN0IGdpZnRBbGxCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgJ2dpZnRBbGwnLFxyXG4gICAgICAgICAgICAnR2lmdCBBbGw6ICcsXHJcbiAgICAgICAgICAgICdidXR0b24nLFxyXG4gICAgICAgICAgICBgLm1wX3JlZlBvaW50XyR7VXRpbC5lbmRPZkhyZWYobGFzdE1lbSl9YCxcclxuICAgICAgICAgICAgJ2FmdGVyZW5kJyxcclxuICAgICAgICAgICAgJ21wX2J0bidcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vYWRkIGEgc3BhY2UgYmV0d2VlbiBidXR0b24gYW5kIHRleHRcclxuICAgICAgICBnaWZ0QWxsQnRuLnN0eWxlLm1hcmdpblJpZ2h0ID0gJzVweCc7XHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5zdHlsZS5tYXJnaW5Ub3AgPSAnNXB4JztcclxuXHJcbiAgICAgICAgZ2lmdEFsbEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RDYWxsOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgdGV4dCB0byBzaG93IHByb2Nlc3NpbmdcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIS5pbm5lclRleHQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2VuZGluZyBHaWZ0cy4uLiBQbGVhc2UgV2FpdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB1c2VyIGhhcyBub3QgYmVlbiBnaWZ0ZWRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBtZW1iZXJzIG5hbWUgZm9yIEpTT04gc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lID0gbWVtYmVyLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIHBvaW50cyBhbW91bnQgZnJvbSB0aGUgaW5wdXQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdpZnRGaW5hbEFtb3VudCA9ICg8SFRNTElucHV0RWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKSEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByYW5kb20gc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lm15YW5vbmFtb3VzZS5uZXQvanNvbi9ib251c0J1eS5waHA/c3BlbmR0eXBlPWdpZnQmYW1vdW50PSR7Z2lmdEZpbmFsQW1vdW50fSZnaWZ0VG89JHt1c2VyTmFtZX1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3dhaXQgMyBzZWNvbmRzIGJldHdlZW4gSlNPTiBjYWxsc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RDYWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdENhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFV0aWwuc2xlZXAoMzAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXF1ZXN0IHNlbmRpbmcgcG9pbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25SZXN1bHQ6IHN0cmluZyA9IGF3YWl0IFV0aWwuZ2V0SlNPTih1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdHaWZ0IFJlc3VsdCcsIGpzb25SZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGdpZnQgd2FzIHN1Y2Nlc3NmdWxseSBzZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnBhcnNlKGpzb25SZXN1bHQpLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgb2ZmIGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmlubmVyVGV4dCA9IGAke21lbWJlci5pbm5lclRleHR9IFxcdTI2MTFgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyLmNsYXNzTGlzdC5hZGQoJ21wX2dpZnRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgbWVtYmVyIHRvIHRoZSBzdG9yZWQgbWVtYmVyIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtcF9sYXN0TmV3R2lmdGVkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtVdGlsLmVuZE9mSHJlZihtZW1iZXIpfSwke0dNX2dldFZhbHVlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbXBfbGFzdE5ld0dpZnRlZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIUpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b24gYWZ0ZXIgc2VuZFxyXG4gICAgICAgICAgICAgICAgKGdpZnRBbGxCdG4gYXMgSFRNTElucHV0RWxlbWVudCkuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGxNc2cnKSEuaW5uZXJUZXh0ID1cclxuICAgICAgICAgICAgICAgICAgICAnR2lmdHMgY29tcGxldGVkIHRvIGFsbCBDaGVja2VkIFVzZXJzJztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvL25ld2xpbmUgYmV0d2VlbiBlbGVtZW50c1xyXG4gICAgICAgIG1lbWJlcnNbbWVtYmVycy5sZW5ndGggLSAxXS5hZnRlcihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcclxuICAgICAgICAvL2xpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUgaW5wdXQgYm94IGFuZCBlbnN1cmUgaXRzIGJldHdlZW4gNSBhbmQgMTAwMCwgaWYgbm90IGRpc2FibGUgYnV0dG9uXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVRvTnVtYmVyOiBTdHJpbmcgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbW91bnRzJylcclxuICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0QWxsID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wX2dpZnRBbGwnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgIE51bWJlcih2YWx1ZVRvTnVtYmVyKSA8IDUgfHxcclxuICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0QWxsLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGdpZnRBbGwuc2V0QXR0cmlidXRlKCd0aXRsZScsICdEaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEFsbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYEdpZnQgQWxsICR7dmFsdWVUb051bWJlcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vYWRkIGEgYnV0dG9uIHRvIG9wZW4gYWxsIHVuZ2lmdGVkIG1lbWJlcnMgaW4gbmV3IHRhYnNcclxuICAgICAgICBjb25zdCBvcGVuQWxsQnRuID0gYXdhaXQgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICdvcGVuVGFicycsXHJcbiAgICAgICAgICAgICdPcGVuIFVuZ2lmdGVkIEluIFRhYnMnLFxyXG4gICAgICAgICAgICAnYnV0dG9uJyxcclxuICAgICAgICAgICAgJ1tpZD1tcF9naWZ0QW1vdW50c10nLFxyXG4gICAgICAgICAgICAnYWZ0ZXJlbmQnLFxyXG4gICAgICAgICAgICAnbXBfYnRuJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG9wZW5BbGxCdG4uc2V0QXR0cmlidXRlKCd0aXRsZScsICdPcGVuIG5ldyB0YWIgZm9yIGVhY2gnKTtcclxuICAgICAgICBvcGVuQWxsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5jbGFzc0xpc3QuY29udGFpbnMoJ21wX2dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKG1lbWJlci5ocmVmLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9nZXQgdGhlIGN1cnJlbnQgYW1vdW50IG9mIGJvbnVzIHBvaW50cyBhdmFpbGFibGUgdG8gc3BlbmRcclxuICAgICAgICBsZXQgYm9udXNQb2ludHNBdmFpbDogc3RyaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RtQlAnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgIC8vZ2V0IHJpZCBvZiB0aGUgZGVsdGEgZGlzcGxheVxyXG4gICAgICAgIGlmIChib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGJvbnVzUG9pbnRzQXZhaWwgPSBib251c1BvaW50c0F2YWlsLnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICBib251c1BvaW50c0F2YWlsLmluZGV4T2YoJygnKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3JlY3JlYXRlIHRoZSBib251cyBwb2ludHMgaW4gbmV3IHNwYW4gYW5kIGluc2VydCBpbnRvIGZwTk1cclxuICAgICAgICBjb25zdCBtZXNzYWdlU3BhbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uc2V0QXR0cmlidXRlKCdpZCcsICdtcF9naWZ0QWxsTXNnJyk7XHJcbiAgICAgICAgbWVzc2FnZVNwYW4uaW5uZXJUZXh0ID0gJ0F2YWlsYWJsZSAnICsgYm9udXNQb2ludHNBdmFpbDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFtb3VudHMnKSEuYWZ0ZXIobWVzc2FnZVNwYW4pO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0QWxsTXNnJykhLmFmdGVyKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdEFsbE1zZycpIVxyXG4gICAgICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsICc8YnI+Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIGdpZnQgbmV3IG1lbWJlcnMgYnV0dG9uIHRvIEhvbWUgcGFnZS4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBUcmltcyB0aGUgZ2lmdGVkIGxpc3QgdG8gbGFzdCA1MCBuYW1lcyB0byBhdm9pZCBnZXR0aW5nIHRvbyBsYXJnZSBvdmVyIHRpbWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3RyaW1HaWZ0TGlzdCgpIHtcclxuICAgICAgICAvL2lmIHZhbHVlIGV4aXN0cyBpbiBHTVxyXG4gICAgICAgIGlmIChHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpKSB7XHJcbiAgICAgICAgICAgIC8vR00gdmFsdWUgaXMgYSBjb21tYSBkZWxpbSB2YWx1ZSwgc3BsaXQgdmFsdWUgaW50byBhcnJheSBvZiBuYW1lc1xyXG4gICAgICAgICAgICBjb25zdCBnaWZ0TmFtZXMgPSBHTV9nZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcpLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIGxldCBuZXdHaWZ0TmFtZXM6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoZ2lmdE5hbWVzLmxlbmd0aCA+IDUwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGdpZnROYW1lIG9mIGdpZnROYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0TmFtZXMuaW5kZXhPZihnaWZ0TmFtZSkgPD0gNDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZWJ1aWxkIGEgY29tbWEgZGVsaW0gc3RyaW5nIG91dCBvZiB0aGUgZmlyc3QgNDkgbmFtZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3R2lmdE5hbWVzID0gbmV3R2lmdE5hbWVzICsgZ2lmdE5hbWUgKyAnLCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IG5ldyBzdHJpbmcgaW4gR01cclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX2xhc3ROZXdHaWZ0ZWQnLCBuZXdHaWZ0TmFtZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vc2V0IHZhbHVlIGlmIGRvZXNudCBleGlzdFxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSgnbXBfbGFzdE5ld0dpZnRlZCcsICcnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIEFkZHMgYWJpbGl0eSB0byBoaWRlIG5ld3MgaXRlbXMgb24gdGhlIHBhZ2VcclxuICovXHJcbmNsYXNzIEhpZGVOZXdzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuSG9tZSxcclxuICAgICAgICB0aXRsZTogJ2hpZGVOZXdzJyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIGRlc2M6ICdUaWR5IHRoZSBob21lcGFnZSBhbmQgYWxsb3cgTmV3cyB0byBiZSBoaWRkZW4nLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5tYWluUGFnZU5ld3NIZWFkJztcclxuICAgIHByaXZhdGUgX3ZhbHVlVGl0bGU6IHN0cmluZyA9IGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfV92YWxgO1xyXG4gICAgcHJpdmF0ZSBfaWNvbiA9ICdcXHUyNzRlJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIE5PVEU6IGZvciBkZXZlbG9wbWVudFxyXG4gICAgICAgIC8vIEdNX2RlbGV0ZVZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO2NvbnNvbGUud2FybihgVmFsdWUgb2YgJHt0aGlzLl92YWx1ZVRpdGxlfSB3aWxsIGJlIGRlbGV0ZWQhYCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3JlbW92ZUNsb2NrKCk7XHJcbiAgICAgICAgdGhpcy5fYWRqdXN0SGVhZGVyU2l6ZSh0aGlzLl90YXIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuX2NoZWNrRm9yU2VlbigpO1xyXG4gICAgICAgIHRoaXMuX2FkZEhpZGVyQnV0dG9uKCk7XHJcbiAgICAgICAgLy8gdGhpcy5fY2xlYW5WYWx1ZXMoKTsgLy8gRklYOiBOb3Qgd29ya2luZyBhcyBpbnRlbmRlZFxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDbGVhbmVkIHVwIHRoZSBob21lIHBhZ2UhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgX2NoZWNrRm9yU2VlbiA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgICAgICBjb25zdCBwcmV2VmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKHRoaXMuX3ZhbHVlVGl0bGUpO1xyXG4gICAgICAgIGNvbnN0IG5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKHRoaXMuX3ZhbHVlVGl0bGUsICc6XFxuJywgcHJldlZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKHByZXZWYWx1ZSAmJiBuZXdzKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgaWNvbiB0byBzcGxpdCBvdXQgdGhlIGtub3duIGhpZGRlbiBtZXNzYWdlc1xyXG4gICAgICAgICAgICBjb25zdCBoaWRkZW5BcnJheSA9IHByZXZWYWx1ZS5zcGxpdCh0aGlzLl9pY29uKTtcclxuICAgICAgICAgICAgLyogSWYgYW55IG9mIHRoZSBoaWRkZW4gbWVzc2FnZXMgbWF0Y2ggYSBjdXJyZW50IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHJlbW92ZSB0aGUgY3VycmVudCBtZXNzYWdlIGZyb20gdGhlIERPTSAqL1xyXG4gICAgICAgICAgICBoaWRkZW5BcnJheS5mb3JFYWNoKChoaWRkZW4pID0+IHtcclxuICAgICAgICAgICAgICAgIG5ld3MuZm9yRWFjaCgoZW50cnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkudGV4dENvbnRlbnQgPT09IGhpZGRlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBjdXJyZW50IG1lc3NhZ2VzLCBoaWRlIHRoZSBoZWFkZXJcclxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpblBhZ2VOZXdzU3ViJykpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfcmVtb3ZlQ2xvY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2xvY2s6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keSAuZnBUaW1lJyk7XHJcbiAgICAgICAgaWYgKGNsb2NrKSBjbG9jay5yZW1vdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgX2FkanVzdEhlYWRlclNpemUgPSAoc2VsZWN0b3I6IHN0cmluZywgdmlzaWJsZT86IGJvb2xlYW4pID0+IHtcclxuICAgICAgICBjb25zdCBuZXdzSGVhZGVyOiBIVE1MSGVhZGluZ0VsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgaWYgKG5ld3NIZWFkZXIpIHtcclxuICAgICAgICAgICAgaWYgKHZpc2libGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZXdzSGVhZGVyLnN0eWxlLmZvbnRTaXplID0gJzJlbSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIF9hZGRIaWRlckJ1dHRvbiA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdzID0gdGhpcy5fZ2V0TmV3c0l0ZW1zKCk7XHJcbiAgICAgICAgaWYgKCFuZXdzKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIG5ld3MgZW50cnlcclxuICAgICAgICBuZXdzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIGJ1dHRvblxyXG4gICAgICAgICAgICBjb25zdCB4YnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIHhidXR0b24udGV4dENvbnRlbnQgPSB0aGlzLl9pY29uO1xyXG4gICAgICAgICAgICBVdGlsLnNldEF0dHIoeGJ1dHRvbiwge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6ICdkaXNwbGF5OmlubGluZS1ibG9jazttYXJnaW4tcmlnaHQ6MC43ZW07Y3Vyc29yOnBvaW50ZXI7JyxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiAnbXBfY2xlYXJCdG4nLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGlja3NcclxuICAgICAgICAgICAgeGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gY2xpY2tlZCwgYXBwZW5kIHRoZSBjb250ZW50IG9mIHRoZSBjdXJyZW50IG5ld3MgcG9zdCB0byB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGxpc3Qgb2YgcmVtZW1iZXJlZCBuZXdzIGl0ZW1zXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1ZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKVxyXG4gICAgICAgICAgICAgICAgICAgID8gR01fZ2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSlcclxuICAgICAgICAgICAgICAgICAgICA6ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBIaWRpbmcuLi4gJHtwcmV2aW91c1ZhbHVlfSR7ZW50cnkudGV4dENvbnRlbnR9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgR01fc2V0VmFsdWUodGhpcy5fdmFsdWVUaXRsZSwgYCR7cHJldmlvdXNWYWx1ZX0ke2VudHJ5LnRleHRDb250ZW50fWApO1xyXG4gICAgICAgICAgICAgICAgZW50cnkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gbW9yZSBuZXdzIGl0ZW1zLCByZW1vdmUgdGhlIGhlYWRlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZE5ld3MgPSB0aGlzLl9nZXROZXdzSXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlZE5ld3MgJiYgdXBkYXRlZE5ld3MubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkanVzdEhlYWRlclNpemUodGhpcy5fdGFyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBidXR0b24gYXMgdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBlbnRyeVxyXG4gICAgICAgICAgICBpZiAoZW50cnkuZmlyc3RDaGlsZCkgZW50cnkuZmlyc3RDaGlsZC5iZWZvcmUoeGJ1dHRvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIF9jbGVhblZhbHVlcyA9IChudW0gPSAzKSA9PiB7XHJcbiAgICAgICAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBHTV9nZXRWYWx1ZSgke3RoaXMuX3ZhbHVlVGl0bGV9KWAsIHZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSBsYXN0IDMgc3RvcmVkIGl0ZW1zIGFmdGVyIHNwbGl0dGluZyB0aGVtIGF0IHRoZSBpY29uXHJcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5hcnJheVRvU3RyaW5nKHZhbHVlLnNwbGl0KHRoaXMuX2ljb24pLnNsaWNlKDAgLSBudW0pKTtcclxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIG5ldyB2YWx1ZVxyXG4gICAgICAgICAgICBHTV9zZXRWYWx1ZSh0aGlzLl92YWx1ZVRpdGxlLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBfZ2V0TmV3c0l0ZW1zID0gKCk6IE5vZGVMaXN0T2Y8SFRNTERpdkVsZW1lbnQ+IHwgbnVsbCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2RpdltjbGFzc149XCJtYWluUGFnZU5ld3NcIl0nKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB0eXBlIHNlbGVjdGVkIGZvciBgdGhpcy5fc2V0dGluZ3NgXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NoZWNrLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBTSEFSRUQgQ09ERVxyXG4gKlxyXG4gKiBUaGlzIGlzIGZvciBhbnl0aGluZyB0aGF0J3Mgc2hhcmVkIGJldHdlZW4gZmlsZXMsIGJ1dCBpcyBub3QgZ2VuZXJpYyBlbm91Z2ggdG9cclxuICogdG8gYmVsb25nIGluIGBVdGlscy50c2AuIEkgY2FuJ3QgdGhpbmsgb2YgYSBiZXR0ZXIgd2F5IHRvIGNhdGVnb3JpemUgRFJZIGNvZGUuXHJcbiAqL1xyXG5cclxuY2xhc3MgU2hhcmVkIHtcclxuICAgIC8qKlxyXG4gICAgICogUmVjZWl2ZSBhIHRhcmdldCBhbmQgYHRoaXMuX3NldHRpbmdzLnRpdGxlYFxyXG4gICAgICogQHBhcmFtIHRhciBDU1Mgc2VsZWN0b3IgZm9yIGEgdGV4dCBpbnB1dCBib3hcclxuICAgICAqL1xyXG4gICAgLy8gVE9ETzogd2l0aCBhbGwgQ2hlY2tpbmcgYmVpbmcgZG9uZSBpbiBgVXRpbC5zdGFydEZlYXR1cmUoKWAgaXQncyBubyBsb25nZXIgbmVjZXNzYXJ5IHRvIENoZWNrIGluIHRoaXMgZnVuY3Rpb25cclxuICAgIHB1YmxpYyBmaWxsR2lmdEJveCA9IChcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBzZXR0aW5nVGl0bGU6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+ID0+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBTaGFyZWQuZmlsbEdpZnRCb3goICR7dGFyfSwgJHtzZXR0aW5nVGl0bGV9IClgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKHRhcikudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludEJveDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcilcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRCb3gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyU2V0UG9pbnRzOiBudW1iZXIgPSBwYXJzZUludChcclxuICAgICAgICAgICAgICAgICAgICAgICAgR01fZ2V0VmFsdWUoYCR7c2V0dGluZ1RpdGxlfV92YWxgKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1heFBvaW50czogbnVtYmVyID0gcGFyc2VJbnQocG9pbnRCb3guZ2V0QXR0cmlidXRlKCdtYXgnKSEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4odXNlclNldFBvaW50cykgJiYgdXNlclNldFBvaW50cyA8PSBtYXhQb2ludHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4UG9pbnRzID0gdXNlclNldFBvaW50cztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRCb3gudmFsdWUgPSBtYXhQb2ludHMudG9GaXhlZCgwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1heFBvaW50cyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBsaXN0IG9mIGFsbCByZXN1bHRzIGZyb20gQnJvd3NlIHBhZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFNlYXJjaExpc3QgPSAoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+PiA9PiB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyhgU2hhcmVkLmdldFNlYXJjaExpc3QoIClgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgc2VhcmNoIHJlc3VsdHMgdG8gZXhpc3RcclxuICAgICAgICAgICAgQ2hlY2suZWxlbUxvYWQoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0gdGQnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXRjaExpc3Q6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4gPSA8XHJcbiAgICAgICAgICAgICAgICAgICAgTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PlxyXG4gICAgICAgICAgICAgICAgPmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNzc3IgdHJbaWQgXj0gXCJ0ZHJcIl0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChzbmF0Y2hMaXN0ID09PSBudWxsIHx8IHNuYXRjaExpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgc25hdGNoTGlzdCBpcyAke3NuYXRjaExpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc25hdGNoTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUT0RPOiBNYWtlIGdvb2RyZWFkc0J1dHRvbnMoKSBpbnRvIGEgZ2VuZXJpYyBmcmFtZXdvcmsgZm9yIG90aGVyIHNpdGUncyBidXR0b25zXHJcbiAgICBwdWJsaWMgZ29vZHJlYWRzQnV0dG9ucyA9IGFzeW5jIChcclxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXHJcbiAgICApID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucy4uLicpO1xyXG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XHJcbiAgICAgICAgbGV0IGF1dGhvcnMgPSAnJztcclxuXHJcbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBHb29kcmVhZHMnLCAnbXBfZ3JSb3cnKTtcclxuXHJcbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgU2VyaWVzIGFuZCBBdXRob3JcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAgIChzZXJpZXNQID0gVXRpbC5nZXRCb29rU2VyaWVzKHNlcmllc0RhdGEpKSxcclxuICAgICAgICAgICAgKGF1dGhvclAgPSBVdGlsLmdldEJvb2tBdXRob3JzKGF1dGhvckRhdGEpKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgYXdhaXQgQ2hlY2suZWxlbUxvYWQoJy5tcF9nclJvdyAuZmxleCcpO1xyXG5cclxuICAgICAgICBjb25zdCBidXR0b25UYXI6IEhUTUxTcGFuRWxlbWVudCA9IDxIVE1MU3BhbkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cgLmZsZXgnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKGJ1dHRvblRhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1dHRvbiByb3cgY2Fubm90IGJlIHRhcmdldGVkIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQnVpbGQgU2VyaWVzIGJ1dHRvbnNcclxuICAgICAgICBzZXJpZXNQLnRoZW4oKHNlcikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc2VyLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHNlci5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uVGl0bGUgPSBzZXIubGVuZ3RoID4gMSA/IGBTZXJpZXM6ICR7aXRlbX1gIDogJ1Nlcmllcyc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVXRpbC5nb29kcmVhZHMuYnVpbGRTZWFyY2hVUkwoJ3NlcmllcycsIGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cclxuICAgICAgICBhdXRob3JQXHJcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFV0aWwuZ29vZHJlYWRzLmJ1aWxkU2VhcmNoVVJMKCdhdXRob3InLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xyXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTCgnYm9vaycsIHRpdGxlKTtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdUaXRsZScsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBVdGlsLmdvb2RyZWFkcy5idWlsZFNlYXJjaFVSTChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0aXRsZX0gJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgYm90aFVSTCwgJ1RpdGxlICsgQXV0aG9yJywgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gZ2VuZXJhdGUgVGl0bGUrQXV0aG9yIGxpbmshXFxuVGl0bGU6ICR7dGl0bGV9XFxuQXV0aG9yczogJHthdXRob3JzfWBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gdGl0bGUgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGVkIHRoZSBNQU0tdG8tR29vZHJlYWRzIGJ1dHRvbnMhYCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBhdWRpYmxlQnV0dG9ucyA9IGFzeW5jIChcclxuICAgICAgICBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCxcclxuICAgICAgICBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsLFxyXG4gICAgICAgIHRhcmdldDogSFRNTERpdkVsZW1lbnQgfCBudWxsXHJcbiAgICApID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRpbmcgdGhlIE1BTS10by1BdWRpYmxlIGJ1dHRvbnMuLi4nKTtcclxuICAgICAgICBsZXQgc2VyaWVzUDogUHJvbWlzZTxzdHJpbmdbXT4sIGF1dGhvclA6IFByb21pc2U8c3RyaW5nW10+O1xyXG4gICAgICAgIGxldCBhdXRob3JzID0gJyc7XHJcblxyXG4gICAgICAgIFV0aWwuYWRkVG9yRGV0YWlsc1Jvdyh0YXJnZXQsICdTZWFyY2ggQXVkaWJsZScsICdtcF9hdVJvdycpO1xyXG5cclxuICAgICAgICAvLyBFeHRyYWN0IHRoZSBTZXJpZXMgYW5kIEF1dGhvclxyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHNlcmllc1AgPSBVdGlsLmdldEJvb2tTZXJpZXMoc2VyaWVzRGF0YSkpLFxyXG4gICAgICAgICAgICAoYXV0aG9yUCA9IFV0aWwuZ2V0Qm9va0F1dGhvcnMoYXV0aG9yRGF0YSkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnLm1wX2F1Um93IC5mbGV4Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1dHRvblRhcjogSFRNTFNwYW5FbGVtZW50ID0gPEhUTUxTcGFuRWxlbWVudD4oXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9hdVJvdyAuZmxleCcpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoYnV0dG9uVGFyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQnV0dG9uIHJvdyBjYW5ub3QgYmUgdGFyZ2V0ZWQhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCdWlsZCBTZXJpZXMgYnV0dG9uc1xyXG4gICAgICAgIHNlcmllc1AudGhlbigoc2VyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidXR0b25UaXRsZSA9IHNlci5sZW5ndGggPiAxID8gYFNlcmllczogJHtpdGVtfWAgOiAnU2VyaWVzJztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP2tleXdvcmRzPSR7aXRlbX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIHVybCwgYnV0dG9uVGl0bGUsIDQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHNlcmllcyBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIEF1dGhvciBidXR0b25cclxuICAgICAgICBhdXRob3JQXHJcbiAgICAgICAgICAgIC50aGVuKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXV0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9ycyA9IGF1dGguam9pbignICcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5hdWRpYmxlLmNvbS9zZWFyY2g/YXV0aG9yX2F1dGhvcj0ke2F1dGhvcnN9YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xyXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP3RpdGxlPSR7dGl0bGV9YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdUaXRsZScsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBgaHR0cHM6Ly93d3cuYXVkaWJsZS5jb20vc2VhcmNoP3RpdGxlPSR7dGl0bGV9JmF1dGhvcl9hdXRob3I9JHthdXRob3JzfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY3JlYXRlTGlua0J1dHRvbihidXR0b25UYXIsIGJvdGhVUkwsICdUaXRsZSArIEF1dGhvcicsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGdlbmVyYXRlIFRpdGxlK0F1dGhvciBsaW5rIVxcblRpdGxlOiAke3RpdGxlfVxcbkF1dGhvcnM6ICR7YXV0aG9yc31gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHRpdGxlIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRlZCB0aGUgTUFNLXRvLUF1ZGlibGUgYnV0dG9ucyFgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVE9ETzogU3dpdGNoIHRvIFN0b3J5R3JhcGggQVBJIG9uY2UgaXQgYmVjb21lcyBhdmFpbGFibGU/IE9yIGFkdmFuY2VkIHNlYXJjaFxyXG4gICAgcHVibGljIHN0b3J5R3JhcGhCdXR0b25zID0gYXN5bmMgKFxyXG4gICAgICAgIGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsLFxyXG4gICAgICAgIGF1dGhvckRhdGE6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCxcclxuICAgICAgICBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPEhUTUxBbmNob3JFbGVtZW50PiB8IG51bGwsXHJcbiAgICAgICAgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGxcclxuICAgICkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyB0aGUgTUFNLXRvLVN0b3J5R3JhcGggYnV0dG9ucy4uLicpO1xyXG4gICAgICAgIGxldCBzZXJpZXNQOiBQcm9taXNlPHN0cmluZ1tdPiwgYXV0aG9yUDogUHJvbWlzZTxzdHJpbmdbXT47XHJcbiAgICAgICAgbGV0IGF1dGhvcnMgPSAnJztcclxuXHJcbiAgICAgICAgVXRpbC5hZGRUb3JEZXRhaWxzUm93KHRhcmdldCwgJ1NlYXJjaCBUaGVTdG9yeUdyYXBoJywgJ21wX3NnUm93Jyk7XHJcblxyXG4gICAgICAgIC8vIEV4dHJhY3QgdGhlIFNlcmllcyBhbmQgQXV0aG9yXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAoc2VyaWVzUCA9IFV0aWwuZ2V0Qm9va1NlcmllcyhzZXJpZXNEYXRhKSksXHJcbiAgICAgICAgICAgIChhdXRob3JQID0gVXRpbC5nZXRCb29rQXV0aG9ycyhhdXRob3JEYXRhKSksXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIGF3YWl0IENoZWNrLmVsZW1Mb2FkKCcubXBfc2dSb3cgLmZsZXgnKTtcclxuXHJcbiAgICAgICAgY29uc3QgYnV0dG9uVGFyOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3NnUm93IC5mbGV4JylcclxuICAgICAgICApO1xyXG4gICAgICAgIGlmIChidXR0b25UYXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdXR0b24gcm93IGNhbm5vdCBiZSB0YXJnZXRlZCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIFNlcmllcyBidXR0b25zXHJcbiAgICAgICAgc2VyaWVzUC50aGVuKChzZXIpID0+IHtcclxuICAgICAgICAgICAgaWYgKHNlci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZXIuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1dHRvblRpdGxlID0gc2VyLmxlbmd0aCA+IDEgPyBgU2VyaWVzOiAke2l0ZW19YCA6ICdTZXJpZXMnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC50aGVzdG9yeWdyYXBoLmNvbS9icm93c2U/c2VhcmNoX3Rlcm09JHtpdGVtfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgVXRpbC5jcmVhdGVMaW5rQnV0dG9uKGJ1dHRvblRhciwgdXJsLCBidXR0b25UaXRsZSwgNCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gc2VyaWVzIGRhdGEgZGV0ZWN0ZWQhJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgQXV0aG9yIGJ1dHRvblxyXG4gICAgICAgIGF1dGhvclBcclxuICAgICAgICAgICAgLnRoZW4oKGF1dGgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChhdXRoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JzID0gYXV0aC5qb2luKCcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLnRoZXN0b3J5Z3JhcGguY29tL2Jyb3dzZT9zZWFyY2hfdGVybT0ke2F1dGhvcnN9YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdBdXRob3InLCAzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBhdXRob3IgZGF0YSBkZXRlY3RlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gQnVpbGQgVGl0bGUgYnV0dG9uc1xyXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IGF3YWl0IFV0aWwuZ2V0Qm9va1RpdGxlKGJvb2tEYXRhLCBhdXRob3JzKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7dGl0bGV9YDtcclxuICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCB1cmwsICdUaXRsZScsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGEgdGl0bGUgYW5kIGF1dGhvciBib3RoIGV4aXN0LCBtYWtlIGEgVGl0bGUgKyBBdXRob3IgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhvcnMgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJvdGhVUkwgPSBgaHR0cHM6Ly9hcHAudGhlc3RvcnlncmFwaC5jb20vYnJvd3NlP3NlYXJjaF90ZXJtPSR7dGl0bGV9ICR7YXV0aG9yc31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24oYnV0dG9uVGFyLCBib3RoVVJMLCAnVGl0bGUgKyBBdXRob3InLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBnZW5lcmF0ZSBUaXRsZStBdXRob3IgbGluayFcXG5UaXRsZTogJHt0aXRsZX1cXG5BdXRob3JzOiAke2F1dGhvcnN9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyB0aXRsZSBkYXRhIGRldGVjdGVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkZWQgdGhlIE1BTS10by1TdG9yeUdyYXBoIGJ1dHRvbnMhYCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHB1YmxpYyBnZXRSYXRpb1Byb3RlY3RMZXZlbHMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgbGV0IGwxID0gcGFyc2VGbG9hdChHTV9nZXRWYWx1ZSgncmF0aW9Qcm90ZWN0TDFfdmFsJykpO1xyXG4gICAgICAgIGxldCBsMiA9IHBhcnNlRmxvYXQoR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdEwyX3ZhbCcpKTtcclxuICAgICAgICBsZXQgbDMgPSBwYXJzZUZsb2F0KEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RMM192YWwnKSk7XHJcbiAgICAgICAgY29uc3QgbDFfZGVmID0gMC41O1xyXG4gICAgICAgIGNvbnN0IGwyX2RlZiA9IDE7XHJcbiAgICAgICAgY29uc3QgbDNfZGVmID0gMjtcclxuXHJcbiAgICAgICAgLy8gRGVmYXVsdCB2YWx1ZXMgaWYgZW1wdHlcclxuICAgICAgICBpZiAoaXNOYU4obDMpKSBsMyA9IGwzX2RlZjtcclxuICAgICAgICBpZiAoaXNOYU4obDIpKSBsMiA9IGwyX2RlZjtcclxuICAgICAgICBpZiAoaXNOYU4obDEpKSBsMSA9IGwxX2RlZjtcclxuXHJcbiAgICAgICAgLy8gSWYgc29tZW9uZSBwdXQgdGhpbmdzIGluIGEgZHVtYiBvcmRlciwgaWdub3JlIHNtYWxsZXIgbnVtYmVyc1xyXG4gICAgICAgIGlmIChsMiA+IGwzKSBsMiA9IGwzO1xyXG4gICAgICAgIGlmIChsMSA+IGwyKSBsMSA9IGwyO1xyXG5cclxuICAgICAgICAvLyBJZiBjdXN0b20gbnVtYmVycyBhcmUgc21hbGxlciB0aGFuIGRlZmF1bHQgdmFsdWVzLCBpZ25vcmUgdGhlIGxvd2VyIHdhcm5pbmdcclxuICAgICAgICBpZiAoaXNOYU4obDIpKSBsMiA9IGwzIDwgbDJfZGVmID8gbDMgOiBsMl9kZWY7XHJcbiAgICAgICAgaWYgKGlzTmFOKGwxKSkgbDEgPSBsMiA8IGwxX2RlZiA/IGwyIDogbDFfZGVmO1xyXG5cclxuICAgICAgICByZXR1cm4gW2wxLCBsMiwgbDNdO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBBdXRvZmlsbHMgdGhlIEdpZnQgYm94IHdpdGggYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBvaW50cy5cclxuICovXHJcbmNsYXNzIFRvckdpZnREZWZhdWx0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndG9yR2lmdERlZmF1bHQnLFxyXG4gICAgICAgIHRhZzogJ0RlZmF1bHQgR2lmdCcsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gNTAwMCwgbWF4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnQXV0b2ZpbGxzIHRoZSBHaWZ0IGJveCB3aXRoIGEgc3BlY2lmaWVkIG51bWJlciBvZiBwb2ludHMuICg8ZW0+T3IgdGhlIG1heCBhbGxvd2FibGUgdmFsdWUsIHdoaWNoZXZlciBpcyBsb3dlcjwvZW0+KScsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RoYW5rc0FyZWEgaW5wdXRbbmFtZT1wb2ludHNdJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBuZXcgU2hhcmVkKClcclxuICAgICAgICAgICAgLmZpbGxHaWZ0Qm94KHRoaXMuX3RhciwgdGhpcy5fc2V0dGluZ3MudGl0bGUpXHJcbiAgICAgICAgICAgIC50aGVuKChwb2ludHMpID0+XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBTZXQgdGhlIGRlZmF1bHQgZ2lmdCBhbW91bnQgdG8gJHtwb2ludHN9YClcclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogQWRkcyB2YXJpb3VzIGxpbmtzIHRvIEdvb2RyZWFkc1xyXG4gKi9cclxuY2xhc3MgR29vZHJlYWRzQnV0dG9uIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnb29kcmVhZHNCdXR0b24nLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgdGhlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucycsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyaW5nKDMpKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIEdvb2RyZWFkcyBidXR0b25zJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIC8vIFNlbGVjdCB0aGUgZGF0YSBwb2ludHNcclxuICAgICAgICBjb25zdCBhdXRob3JEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvckRldE1haW5Db24gLnRvckF1dGhvcnMgYScpO1xyXG4gICAgICAgIGNvbnN0IGJvb2tEYXRhOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC5Ub3JyZW50VGl0bGUnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBzZXJpZXNEYXRhOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICBIVE1MQW5jaG9yRWxlbWVudFxyXG4gICAgICAgID4gfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI1NlcmllcyBhJyk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuX3NoYXJlLmdvb2RyZWFkc0J1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gQXVkaWJsZVxyXG4gKi9cclxuY2xhc3MgQXVkaWJsZUJ1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYXVkaWJsZUJ1dHRvbicsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLUF1ZGlibGUgYnV0dG9ucycsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyaW5nKDMpKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIEF1ZGlibGUgYnV0dG9ucycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXHJcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcclxuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xyXG5cclxuICAgICAgICBsZXQgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcblxyXG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfc2dSb3cnKSkge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX3NnUm93Jyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKSkge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuYXVkaWJsZUJ1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBBZGRzIHZhcmlvdXMgbGlua3MgdG8gU3RvcnlHcmFwaFxyXG4gKi9cclxuY2xhc3MgU3RvcnlHcmFwaEJ1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc3RvcnlHcmFwaEJ1dHRvbicsXHJcbiAgICAgICAgZGVzYzogJ0VuYWJsZSB0aGUgTUFNLXRvLVN0b3J5R3JhcGggYnV0dG9ucycsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3N1Ym1pdEluZm8nO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBmZWF0dXJlIHNob3VsZCBvbmx5IHJ1biBvbiBib29rIGNhdGVnb3JpZXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmSW5mbyBbY2xhc3NePWNhdF0nKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYXQgJiYgQ2hlY2suaXNCb29rQ2F0KHBhcnNlSW50KGNhdC5jbGFzc05hbWUuc3Vic3RyaW5nKDMpKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIE5vdCBhIGJvb2sgY2F0ZWdvcnk7IHNraXBwaW5nIFN0cm95R3JhcGggYnV0dG9ucycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXHJcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnKTtcclxuICAgICAgICBjb25zdCBib29rRGF0YTogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxcclxuICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICA+IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNTZXJpZXMgYScpO1xyXG5cclxuICAgICAgICBsZXQgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcblxyXG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfZ3JSb3cnKSkge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSA8SFRNTERpdkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2dyUm93Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuc3RvcnlHcmFwaEJ1dHRvbnMoYm9va0RhdGEsIGF1dGhvckRhdGEsIHNlcmllc0RhdGEsIHRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZXMgYSBmaWVsZCBmb3IgXCJDdXJyZW50bHkgUmVhZGluZ1wiIGJiY29kZVxyXG4gKi9cclxuY2xhc3MgQ3VycmVudGx5UmVhZGluZyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHRpdGxlOiAnY3VycmVudGx5UmVhZGluZycsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBnZW5lcmF0ZSBhIFwiQ3VycmVudGx5IFJlYWRpbmdcIiBmb3J1bSBzbmlwcGV0YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yRGV0TWFpbkNvbiAuVG9ycmVudFRpdGxlJztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGluZyBDdXJyZW50bHkgUmVhZGluZyBzZWN0aW9uLi4uJyk7XHJcbiAgICAgICAgLy8gR2V0IHRoZSByZXF1aXJlZCBpbmZvcm1hdGlvblxyXG4gICAgICAgIGNvbnN0IHRpdGxlOiBzdHJpbmcgPSBkb2N1bWVudCEucXVlcnlTZWxlY3RvcignI3RvckRldE1haW5Db24gLlRvcnJlbnRUaXRsZScpIVxyXG4gICAgICAgICAgICAudGV4dENvbnRlbnQhO1xyXG4gICAgICAgIGNvbnN0IGF1dGhvcnM6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgJyN0b3JEZXRNYWluQ29uIC50b3JBdXRob3JzIGEnXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCB0b3JJRDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMl07XHJcbiAgICAgICAgY29uc3Qgcm93VGFyOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZkluZm8nKTtcclxuXHJcbiAgICAgICAgLy8gVGl0bGUgY2FuJ3QgYmUgbnVsbFxyXG4gICAgICAgIGlmICh0aXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRpdGxlIGZpZWxkIHdhcyBudWxsYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCdWlsZCBhIG5ldyB0YWJsZSByb3dcclxuICAgICAgICBjb25zdCBjclJvdzogSFRNTERpdkVsZW1lbnQgPSBhd2FpdCBVdGlsLmFkZFRvckRldGFpbHNSb3coXHJcbiAgICAgICAgICAgIHJvd1RhcixcclxuICAgICAgICAgICAgJ0N1cnJlbnRseSBSZWFkaW5nJyxcclxuICAgICAgICAgICAgJ21wX2NyUm93J1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gUHJvY2VzcyBkYXRhIGludG8gc3RyaW5nXHJcbiAgICAgICAgY29uc3QgYmx1cmI6IHN0cmluZyA9IGF3YWl0IHRoaXMuX2dlbmVyYXRlU25pcHBldCh0b3JJRCwgdGl0bGUsIGF1dGhvcnMpO1xyXG4gICAgICAgIC8vIEJ1aWxkIGJ1dHRvblxyXG4gICAgICAgIGNvbnN0IGJ0bjogSFRNTERpdkVsZW1lbnQgPSBhd2FpdCB0aGlzLl9idWlsZEJ1dHRvbihjclJvdywgYmx1cmIpO1xyXG4gICAgICAgIC8vIEluaXQgYnV0dG9uXHJcbiAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oYnRuLCBibHVyYik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAqIEJ1aWxkIGEgQkIgQ29kZSB0ZXh0IHNuaXBwZXQgdXNpbmcgdGhlIGJvb2sgaW5mbywgdGhlbiByZXR1cm4gaXRcclxuICAgICAqIEBwYXJhbSBpZCBUaGUgc3RyaW5nIElEIG9mIHRoZSBib29rXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgVGhlIHN0cmluZyB0aXRsZSBvZiB0aGUgYm9va1xyXG4gICAgICogQHBhcmFtIGF1dGhvcnMgQSBub2RlIGxpc3Qgb2YgYXV0aG9yIGxpbmtzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dlbmVyYXRlU25pcHBldChcclxuICAgICAgICBpZDogc3RyaW5nLFxyXG4gICAgICAgIHRpdGxlOiBzdHJpbmcsXHJcbiAgICAgICAgYXV0aG9yczogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD5cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBBZGQgQXV0aG9yIExpbmtcclxuICAgICAgICAgKiBAcGFyYW0gYXV0aG9yRWxlbSBBIGxpbmsgY29udGFpbmluZyBhdXRob3IgaW5mb3JtYXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdCBhZGRBdXRob3JMaW5rID0gKGF1dGhvckVsZW06IEhUTUxBbmNob3JFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBgW3VybD0ke2F1dGhvckVsZW0uaHJlZi5yZXBsYWNlKCdodHRwczovL3d3dy5teWFub25hbW91c2UubmV0JywgJycpfV0ke1xyXG4gICAgICAgICAgICAgICAgYXV0aG9yRWxlbS50ZXh0Q29udGVudFxyXG4gICAgICAgICAgICB9Wy91cmxdYDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IHRoZSBOb2RlTGlzdCBpbnRvIGFuIEFycmF5IHdoaWNoIGlzIGVhc2llciB0byB3b3JrIHdpdGhcclxuICAgICAgICBsZXQgYXV0aG9yQXJyYXk6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgYXV0aG9ycy5mb3JFYWNoKChhdXRob3JFbGVtKSA9PiBhdXRob3JBcnJheS5wdXNoKGFkZEF1dGhvckxpbmsoYXV0aG9yRWxlbSkpKTtcclxuICAgICAgICAvLyBEcm9wIGV4dHJhIGl0ZW1zXHJcbiAgICAgICAgaWYgKGF1dGhvckFycmF5Lmxlbmd0aCA+IDMpIHtcclxuICAgICAgICAgICAgYXV0aG9yQXJyYXkgPSBbLi4uYXV0aG9yQXJyYXkuc2xpY2UoMCwgMyksICdldGMuJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYFt1cmw9L3QvJHtpZH1dJHt0aXRsZX1bL3VybF0gYnkgW2ldJHthdXRob3JBcnJheS5qb2luKCcsICcpfVsvaV1gO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBCdWlsZCBhIGJ1dHRvbiBvbiB0aGUgdG9yIGRldGFpbHMgcGFnZVxyXG4gICAgICogQHBhcmFtIHRhciBBcmVhIHdoZXJlIHRoZSBidXR0b24gd2lsbCBiZSBhZGRlZCBpbnRvXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBDb250ZW50IHRoYXQgd2lsbCBiZSBhZGRlZCBpbnRvIHRoZSB0ZXh0YXJlYVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9idWlsZEJ1dHRvbih0YXI6IEhUTUxEaXZFbGVtZW50LCBjb250ZW50OiBzdHJpbmcpOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICAgICAgLy8gQnVpbGQgdGV4dCBkaXNwbGF5XHJcbiAgICAgICAgdGFyLmlubmVySFRNTCA9IGA8dGV4dGFyZWEgcm93cz1cIjFcIiBjb2xzPVwiODBcIiBzdHlsZT0nbWFyZ2luLXJpZ2h0OjVweCc+JHtjb250ZW50fTwvdGV4dGFyZWE+YDtcclxuICAgICAgICAvLyBCdWlsZCBidXR0b25cclxuICAgICAgICBVdGlsLmNyZWF0ZUxpbmtCdXR0b24odGFyLCAnbm9uZScsICdDb3B5JywgMik7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1wX2NyUm93IC5tcF9idXR0b25fY2xvbmUnKSEuY2xhc3NMaXN0LmFkZCgnbXBfcmVhZGluZycpO1xyXG4gICAgICAgIC8vIFJldHVybiBidXR0b25cclxuICAgICAgICByZXR1cm4gPEhUTUxEaXZFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tcF9yZWFkaW5nJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBQcm90ZWN0cyB0aGUgdXNlciBmcm9tIHJhdGlvIHRyb3VibGVzIGJ5IGFkZGluZyB3YXJuaW5ncyBhbmQgZGlzcGxheWluZyByYXRpbyBkZWx0YVxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3QnLFxyXG4gICAgICAgIGRlc2M6IGBQcm90ZWN0IHlvdXIgcmF0aW8gd2l0aCB3YXJuaW5ncyAmYW1wOyByYXRpbyBjYWxjdWxhdGlvbnNgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNyYXRpbyc7XHJcbiAgICBwcml2YXRlIF9yY1Jvdzogc3RyaW5nID0gJ21wX3JhdGlvQ29zdFJvdyc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIHJhdGlvIHByb3RlY3Rpb24uLi4nKTtcclxuICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgYmxvY2sgdG8gc2hhcmVkXHJcbiAgICAgICAgLy8gVGhlIGRvd25sb2FkIHRleHQgYXJlYVxyXG4gICAgICAgIGNvbnN0IGRsQnRuOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGRkbCcpO1xyXG4gICAgICAgIC8vIFRoZSBjdXJyZW50bHkgdW51c2VkIGxhYmVsIGFyZWEgYWJvdmUgdGhlIGRvd25sb2FkIHRleHRcclxuICAgICAgICBjb25zdCBkbExhYmVsOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAnI2Rvd25sb2FkIC50b3JEZXRJbm5lclRvcCdcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFdvdWxkIGJlY29tZSByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJOZXc6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICAvLyBDdXJyZW50IHJhdGlvXHJcbiAgICAgICAgY29uc3QgckN1cjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0bVInKTtcclxuICAgICAgICAvLyBTZWVkaW5nIG9yIGRvd25sb2FkaW5nXHJcbiAgICAgICAgY29uc3Qgc2VlZGluZzogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNETGhpc3RvcnknKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBjdXN0b20gcmF0aW8gYW1vdW50cyAod2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXMgb3RoZXJ3aXNlKVxyXG4gICAgICAgIGNvbnN0IFtyMSwgcjIsIHIzXSA9IGF3YWl0IHRoaXMuX3NoYXJlLmdldFJhdGlvUHJvdGVjdExldmVscygpO1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFJhdGlvIHByb3RlY3Rpb24gbGV2ZWxzIHNldCB0bzogJHtyMX0sICR7cjJ9LCAke3IzfWApO1xyXG5cclxuICAgICAgICAvLyBPbmx5IHJ1biB0aGUgY29kZSBpZiB0aGUgcmF0aW8gZXhpc3RzXHJcbiAgICAgICAgaWYgKHJOZXcgJiYgckN1ciAmJiAhc2VlZGluZykge1xyXG4gICAgICAgICAgICBjb25zdCByRGlmZiA9IFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdIC0gVXRpbC5leHRyYWN0RmxvYXQock5ldylbMF07XHJcblxyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgICAgICBgQ3VycmVudCAke1V0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdfSB8IE5ldyAke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXVxyXG4gICAgICAgICAgICAgICAgICAgIH0gfCBEaWYgJHtyRGlmZn1gXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gT25seSBhY3RpdmF0ZSBpZiBhIHJhdGlvIGNoYW5nZSBpcyBleHBlY3RlZFxyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHJEaWZmKSAmJiByRGlmZiA+IDAuMDA5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGxMYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRsTGFiZWwuaW5uZXJIVE1MID0gYFJhdGlvIGxvc3MgJHtyRGlmZi50b0ZpeGVkKDIpfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ25vcm1hbCc7IC8vVG8gZGlzdGluZ3Vpc2ggZnJvbSBCT0xEIFRpdGxlc1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCBsaW5lIHVuZGVyIFRvcnJlbnQ6IGRldGFpbCBmb3IgQ29zdCBkYXRhIFwiQ29zdCB0byBSZXN0b3JlIFJhdGlvXCJcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy50b3JEZXRCb3R0b20nKSFcclxuICAgICAgICAgICAgICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmVmb3JlYmVnaW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cInRvckRldFJvd1wiIGlkPVwibXBfcm93XCI+PGRpdiBjbGFzcz1cInRvckRldExlZnRcIj5Db3N0IHRvIFJlc3RvcmUgUmF0aW88L2Rpdj48ZGl2IGNsYXNzPVwidG9yRGV0UmlnaHQgJHt0aGlzLl9yY1Jvd31cIiBzdHlsZT1cImZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O1wiPjxzcGFuIGlkPVwibXBfZm9vYmFyXCI+PC9zcGFuPjwvZGl2PjwvZGl2PmBcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSAmIERpc3BsYXkgY29zdCBvZiBkb3dubG9hZCB3L28gRkxcclxuICAgICAgICAgICAgICAgIC8vIEFsd2F5cyBzaG93IGNhbGN1bGF0aW9ucyB3aGVuIHRoZXJlIGlzIGEgcmF0aW8gbG9zc1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2l6ZUVsZW06IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICcjc2l6ZSBzcGFuJ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGlmIChzaXplRWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSBzaXplRWxlbS50ZXh0Q29udGVudCEuc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaXplTWFwID0gWydCeXRlcycsICdLaUInLCAnTWlCJywgJ0dpQicsICdUaUInXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IGh1bWFuIHJlYWRhYmxlIHNpemUgdG8gYnl0ZXNcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBieXRlU2l6ZWQgPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXIoc2l6ZVswXSkgKiBNYXRoLnBvdygxMDI0LCBzaXplTWFwLmluZGV4T2Yoc2l6ZVsxXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY292ZXJ5ID0gYnl0ZVNpemVkICogVXRpbC5leHRyYWN0RmxvYXQockN1cilbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9pbnRBbW50ID0gTWF0aC5mbG9vcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDEyNSAqIHJlY292ZXJ5KSAvIDI2ODQzNTQ1NlxyXG4gICAgICAgICAgICAgICAgICAgICkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlBbW91bnQgPSBNYXRoLmZsb29yKCg1ICogcmVjb3ZlcnkpIC8gMjE0NzQ4MzY0OCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2VkZ2VTdG9yZUNvc3QgPSBVdGlsLmZvcm1hdEJ5dGVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMjY4NDM1NDU2ICogNTAwMDApIC8gKFV0aWwuZXh0cmFjdEZsb2F0KHJDdXIpWzBdICogMTI1KVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2VkZ2VWYXVsdENvc3QgPSBVdGlsLmZvcm1hdEJ5dGVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMjY4NDM1NDU2ICogMjAwKSAvIChVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAqIDEyNSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJhdGlvIGNvc3Qgcm93XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgYC4ke3RoaXMuX3JjUm93fWBcclxuICAgICAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSBgPHNwYW4+PGI+JHtVdGlsLmZvcm1hdEJ5dGVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWNvdmVyeVxyXG4gICAgICAgICAgICAgICAgICAgICl9PC9iPiZuYnNwO3VwbG9hZCAoJHtwb2ludEFtbnR9IEJQOyBvciBvbmUgRkwgd2VkZ2UgcGVyIGRheSBmb3IgJHtkYXlBbW91bnR9IGRheXMpLiZuYnNwOzxhYmJyIHRpdGxlPSdDb250cmlidXRpbmcgMiwwMDAgQlAgdG8gZWFjaCB2YXVsdCBjeWNsZSBnaXZlcyB5b3UgYWxtb3N0IG9uZSBGTCB3ZWRnZSBwZXIgZGF5IG9uIGF2ZXJhZ2UuJyBzdHlsZT0ndGV4dC1kZWNvcmF0aW9uOm5vbmU7Y3Vyc29yOmhlbHA7Jz4mIzEyODcxMjs8L2FiYnI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPldlZGdlIHN0b3JlIHByaWNlOiA8aT4ke3dlZGdlU3RvcmVDb3N0fTwvaT4mbmJzcDs8YWJiciB0aXRsZT0nSWYgeW91IGJ1eSB3ZWRnZXMgZnJvbSB0aGUgc3RvcmUsIHRoaXMgaXMgaG93IGxhcmdlIGEgdG9ycmVudCBtdXN0IGJlIHRvIGJyZWFrIGV2ZW4gb24gdGhlIGNvc3QgKDUwLDAwMCBCUCkgb2YgYSBzaW5nbGUgd2VkZ2UuJyBzdHlsZT0ndGV4dC1kZWNvcmF0aW9uOm5vbmU7Y3Vyc29yOmhlbHA7Jz4mIzEyODcxMjs8L2FiYnI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPldlZGdlIHZhdWx0IHByaWNlOiA8aT4ke3dlZGdlVmF1bHRDb3N0fTwvaT4mbmJzcDs8YWJiciB0aXRsZT0nSWYgeW91IGNvbnRyaWJ1dGUgdG8gdGhlIHZhdWx0LCB0aGlzIGlzIGhvdyBsYXJnZSBhIHRvcnJlbnQgbXVzdCBiZSB0byBicmVhayBldmVuIG9uIHRoZSBjb3N0ICgyMDAgQlApIG9mIDEwIHdlZGdlcyBmb3IgdGhlIG1heGltdW0gY29udHJpYnV0aW9uIG9mIDIsMDAwIEJQLicgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjpub25lO2N1cnNvcjpoZWxwOyc+JiMxMjg3MTI7PC9hYmJyPjwvc3Bhbj5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFN0eWxlIHRoZSBkb3dubG9hZCBidXR0b24gYmFzZWQgb24gUmF0aW8gUHJvdGVjdCBsZXZlbCBzZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgaWYgKGRsQnRuICYmIGRsTGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBcInRyaXZpYWwgcmF0aW8gbG9zc1wiIHRocmVzaG9sZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXNlIGNoYW5nZXMgd2lsbCBhbHdheXMgaGFwcGVuIGlmIHRoZSByYXRpbyBjb25kaXRpb25zIGFyZSBtZXRcclxuICAgICAgICAgICAgICAgICAgICBpZiAockRpZmYgPiByMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnU3ByaW5nR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5zdHlsZS5jb2xvciA9ICdibGFjayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLmlubmVySFRNTCA9ICdEb3dubG9hZD8nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgXCJJIG5ldmVyIHdhbnQgdG8gZGwgdy9vIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBhbHNvIHVzZXMgdGhlIE1pbmltdW0gUmF0aW8sIGlmIGVuYWJsZWRcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGFsc28gcHJldmVudHMgZ29pbmcgYmVsb3cgMiByYXRpbyAoUFUgcmVxdWlyZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogUmVwbGFjZSBkaXNhYmxlIGJ1dHRvbiB3aXRoIGJ1eSBGTCBidXR0b25cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByRGlmZiA+IHIzIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgR01fZ2V0VmFsdWUoJ3JhdGlvUHJvdGVjdE1pbl92YWwnKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IDJcclxuICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxCdG4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ1JlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLy9EaXNhYmxlIGxpbmsgdG8gcHJldmVudCBkb3dubG9hZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy8vIGRsQnRuLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmN1cnNvciA9ICduby1kcm9wJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWF5YmUgaGlkZSB0aGUgYnV0dG9uLCBhbmQgYWRkIHRoZSBSYXRpbyBMb3NzIHdhcm5pbmcgaW4gaXRzIHBsYWNlP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5pbm5lckhUTUwgPSAnRkwgTmVlZGVkJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGxMYWJlbC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBcIkkgbmVlZCB0byB0aGluayBhYm91dCB1c2luZyBhIEZMXCIgdGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyRGlmZiA+IHIyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkbEJ0bi5pbm5lckhUTUwgPSAnU3VnZ2VzdCBGTCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogTG93IHJhdGlvIHByb3RlY3Rpb24gYW1vdW50XHJcbiAqL1xyXG5jbGFzcyBSYXRpb1Byb3RlY3RMMSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdEwxJyxcclxuICAgICAgICB0YWc6ICdSYXRpbyBXYXJuIEwxJyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogJ2RlZmF1bHQ6IDAuNScsXHJcbiAgICAgICAgZGVzYzogYFNldCB0aGUgc21hbGxlc3QgdGhyZXNoaG9sZCB0byBpbmRpY2F0ZSByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBzbGlnaHQgY29sb3IgY2hhbmdlPC9lbT4pLmAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI2Rvd25sb2FkJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBFbmFibGVkIGN1c3RvbSBSYXRpbyBQcm90ZWN0aW9uIEwxIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBNZWRpdW0gcmF0aW8gcHJvdGVjdGlvbiBhbW91bnRcclxuICovXHJcbmNsYXNzIFJhdGlvUHJvdGVjdEwyIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0TDInLFxyXG4gICAgICAgIHRhZzogJ1JhdGlvIFdhcm4gTDInLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMScsXHJcbiAgICAgICAgZGVzYzogYFNldCB0aGUgbWVkaWFuIHRocmVzaGhvbGQgdG8gd2FybiBvZiByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgaXMgYSBub3RpY2VhYmxlIGNvbG9yIGNoYW5nZTwvZW0+KS5gLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd0b3JyZW50J10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gRW5hYmxlZCBjdXN0b20gUmF0aW8gUHJvdGVjdGlvbiBMMiEnKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogSGlnaCByYXRpbyBwcm90ZWN0aW9uIGFtb3VudFxyXG4gKi9cclxuY2xhc3MgUmF0aW9Qcm90ZWN0TDMgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydUb3JyZW50IFBhZ2UnXSxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYXRpb1Byb3RlY3RMMycsXHJcbiAgICAgICAgdGFnOiAnUmF0aW8gV2FybiBMMycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdkZWZhdWx0OiAyJyxcclxuICAgICAgICBkZXNjOiBgU2V0IHRoZSBoaWdoZXN0IHRocmVzaGhvbGQgdG8gcHJldmVudCByYXRpbyBjaGFuZ2VzLiAoPGVtPlRoaXMgZGlzYWJsZXMgZG93bmxvYWQgd2l0aG91dCBGTCB1c2U8L2VtPikuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjZG93bmxvYWQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndG9ycmVudCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gTDMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IFRleHRib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFJhdGlvUHJvdGVjdE1pbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICd0ZXh0Ym94JyxcclxuICAgICAgICB0aXRsZTogJ3JhdGlvUHJvdGVjdE1pbicsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVG9ycmVudCBQYWdlJ10sXHJcbiAgICAgICAgdGFnOiAnTWluaW11bSBSYXRpbycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTAwJyxcclxuICAgICAgICBkZXNjOiAnVHJpZ2dlciBSYXRpbyBXYXJuIEwzIGlmIHlvdXIgcmF0aW8gd291bGQgZHJvcCBiZWxvdyB0aGlzIG51bWJlci4nLFxyXG4gICAgfTtcclxuICAgIC8vIEFuIGVsZW1lbnQgdGhhdCBtdXN0IGV4aXN0IGluIG9yZGVyIGZvciB0aGUgZmVhdHVyZSB0byBydW5cclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNkb3dubG9hZCc7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsZWQgY3VzdG9tIFJhdGlvIFByb3RlY3Rpb24gbWluaW11bSEnKTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBSYXRpb1Byb3RlY3RJY29ucyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncmF0aW9Qcm90ZWN0SWNvbnMnLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1RvcnJlbnQgUGFnZSddLFxyXG4gICAgICAgIGRlc2M6ICdFbmFibGUgY3VzdG9tIGJyb3dzZXIgZmF2aWNvbnMgYmFzZWQgb24gUmF0aW8gUHJvdGVjdCBjb25kaXRpb25zPycsXHJcbiAgICB9O1xyXG4gICAgLy8gQW4gZWxlbWVudCB0aGF0IG11c3QgZXhpc3QgaW4gb3JkZXIgZm9yIHRoZSBmZWF0dXJlIHRvIHJ1blxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3JhdGlvJztcclxuICAgIHByaXZhdGUgX3VzZXJJRDogbnVtYmVyID0gMTY0MTA5O1xyXG4gICAgcHJpdmF0ZSBfc2hhcmUgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICAvLyBUaGUgY29kZSB0aGF0IHJ1bnMgd2hlbiB0aGUgZmVhdHVyZSBpcyBjcmVhdGVkIG9uIGBmZWF0dXJlcy50c2AuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBBZGQgMSsgdmFsaWQgcGFnZSB0eXBlLiBFeGNsdWRlIGZvciBnbG9iYWxcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3RvcnJlbnQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICBgW00rXSBFbmFibGluZyBjdXN0b20gUmF0aW8gUHJvdGVjdCBmYXZpY29ucyBmcm9tIHVzZXIgJHt0aGlzLl91c2VySUR9Li4uYFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgY3VzdG9tIHJhdGlvIGFtb3VudHMgKHdpbGwgcmV0dXJuIGRlZmF1bHQgdmFsdWVzIG90aGVyd2lzZSlcclxuICAgICAgICBjb25zdCBbcjEsIHIyLCByM10gPSBhd2FpdCB0aGlzLl9zaGFyZS5nZXRSYXRpb1Byb3RlY3RMZXZlbHMoKTtcclxuICAgICAgICAvLyBXb3VsZCBiZWNvbWUgcmF0aW9cclxuICAgICAgICBjb25zdCByTmV3OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuX3Rhcik7XHJcbiAgICAgICAgLy8gQ3VycmVudCByYXRpb1xyXG4gICAgICAgIGNvbnN0IHJDdXI6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG1SJyk7XHJcbiAgICAgICAgLy8gRGlmZmVyZW5jZSBiZXR3ZWVuIG5ldyBhbmQgb2xkIHJhdGlvXHJcbiAgICAgICAgY29uc3QgckRpZmYgPSBVdGlsLmV4dHJhY3RGbG9hdChyQ3VyKVswXSAtIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdO1xyXG4gICAgICAgIC8vIFNlZWRpbmcgb3IgZG93bmxvYWRpbmdcclxuICAgICAgICBjb25zdCBzZWVkaW5nOiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0RMaGlzdG9yeScpO1xyXG4gICAgICAgIC8vIFZJUCBzdGF0dXNcclxuICAgICAgICBjb25zdCB2aXBzdGF0OiBzdHJpbmcgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgJyNyYXRpbyAudG9yRGV0SW5uZXJCb3R0b21TcGFuJ1xyXG4gICAgICAgIClcclxuICAgICAgICAgICAgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmF0aW8gLnRvckRldElubmVyQm90dG9tU3BhbicpLnRleHRDb250ZW50XHJcbiAgICAgICAgICAgIDogbnVsbDtcclxuICAgICAgICAvLyBCb29rY2x1YiBzdGF0dXNcclxuICAgICAgICBjb25zdCBib29rY2x1YjogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgIFwiZGl2W2lkPSdiY2ZsJ10gc3BhblwiXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gRmluZCBmYXZpY29uIGxpbmtzIGFuZCBsb2FkIGEgc2ltcGxlIGRlZmF1bHQuXHJcbiAgICAgICAgY29uc3Qgc2l0ZUZhdmljb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImxpbmtbcmVsfj0naWNvbiddXCIpIGFzIE5vZGVMaXN0T2Y8XHJcbiAgICAgICAgICAgIEhUTUxMaW5rRWxlbWVudFxyXG4gICAgICAgID47XHJcbiAgICAgICAgaWYgKHNpdGVGYXZpY29ucykgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAndG1fMzJ4MzInKTtcclxuXHJcbiAgICAgICAgLy8gVGVzdCBpZiBWSVBcclxuICAgICAgICBpZiAodmlwc3RhdCkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBWSVAgPSAke3ZpcHN0YXR9YCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodmlwc3RhdC5zZWFyY2goJ1ZJUCBleHBpcmVzJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnbW91c2VjbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICcgfCBNeSBBbm9uYW1vdXNlJyxcclxuICAgICAgICAgICAgICAgICAgICBgIHwgRXhwaXJlcyAke3ZpcHN0YXQuc3Vic3RyaW5nKDI2KX1gXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdWSVAgbm90IHNldCB0byBleHBpcmUnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcwY2lyJyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICcgfCBOb3Qgc2V0IHRvIGV4cGlyZSdcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmlwc3RhdC5zZWFyY2goJ1RoaXMgdG9ycmVudCBpcyBmcmVlbGVlY2ghJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnbW91c2VjbG9jaycpO1xyXG4gICAgICAgICAgICAgICAgLy8gVGVzdCBpZiBib29rY2x1YlxyXG4gICAgICAgICAgICAgICAgaWYgKGJvb2tjbHViICYmIGJvb2tjbHViLnRleHRDb250ZW50LnNlYXJjaCgnQm9va2NsdWIgRnJlZWxlZWNoJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUucmVwbGFjZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyB8IE15IEFub25hbW91c2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgIHwgQ2x1YiBleHBpcmVzICR7Ym9va2NsdWIudGV4dENvbnRlbnQuc3Vic3RyaW5nKDI1KX1gXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnIHwgTXkgQW5vbmFtb3VzZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiIHwgJ3RpbGwgbmV4dCBTaXRlIEZMXCJcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUZXN0IGlmIHNlZWRpbmcvZG93bmxvYWRpbmdcclxuICAgICAgICBpZiAoc2VlZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICcxM2VnZycpO1xyXG4gICAgICAgICAgICAvLyAqIFNpbWlsYXIgaWNvbnM6IDEzc2VlZDgsIDEzc2VlZDcsIDEzZWdnLCAxMywgMTNjaXIsIDEzV2hpdGVDaXJcclxuICAgICAgICB9IGVsc2UgaWYgKHZpcHN0YXQuc2VhcmNoKCdUaGlzIHRvcnJlbnQgaXMgcGVyc29uYWwgZnJlZWxlZWNoJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWlsZEljb25MaW5rcyhzaXRlRmF2aWNvbnMsICc1Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUZXN0IGlmIHRoZXJlIHdpbGwgYmUgcmF0aW8gbG9zc1xyXG4gICAgICAgIGlmKHJOZXcgJiYgckN1ciAmJiAhc2VlZGluZyl7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGFuZ2UgaWNvbiBiYXNlZCBvbiBSYXRpbyBQcm90ZWN0IHN0YXRlc1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICByRGlmZiA+IHIzIHx8XHJcbiAgICAgICAgICAgICAgICBVdGlsLmV4dHJhY3RGbG9hdChyTmV3KVswXSA8IEdNX2dldFZhbHVlKCdyYXRpb1Byb3RlY3RNaW5fdmFsJykgfHxcclxuICAgICAgICAgICAgICAgIFV0aWwuZXh0cmFjdEZsb2F0KHJOZXcpWzBdIDwgMlxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzEyJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihyRGlmZiA+IHIyKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJzNRbW91c2UnKTtcclxuICAgICAgICAgICAgICAgIC8vIEFsc28gdHJ5IE9yYW5nZSwgT3JhbmdlUmVkLCBHb2xkLCBvciAxNFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJEaWZmID4gcjEpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRJY29uTGlua3Moc2l0ZUZhdmljb25zLCAnU3ByaW5nR3JlZW4nKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmdXR1cmUgVklQXHJcbiAgICAgICAgICAgIGlmKHZpcHN0YXQuc2VhcmNoKCdPbiBsaXN0IGZvciBuZXh0IEZMIHBpY2snKSA+IC0xKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1aWxkSWNvbkxpbmtzKHNpdGVGYXZpY29ucywgJ01pcnJvckdyZWVuQ2xvY2snKTsgLy8gQWxzbyB0cnkgZ3JlZW5jbG9ja1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZS5yZXBsYWNlKCcgfCBNeSBBbm9uYW1vdXNlJywgJyB8IE5leHQgRkwgcGljaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDdXN0b20gUmF0aW8gUHJvdGVjdCBmYXZpY29ucyBlbmFibGVkIScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2J1aWxkSWNvbkxpbmtzKGVsZW1zOiBOb2RlTGlzdE9mPEhUTUxMaW5rRWxlbWVudD4sIGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBlbGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGVsZW0uaHJlZiA9IGBodHRwczovL2Nkbi5teWFub25hbW91c2UubmV0L2ltYWdlYnVja2V0LyR7dGhpcy5fdXNlcklEfS8ke2ZpbGVuYW1lfS5wbmdgO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdXNlcklEKG5ld0lEOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl91c2VySUQgPSBuZXdJRDtcclxuICAgIH1cclxufVxyXG5cclxuLy8gVE9ETzogQWRkIGZlYXR1cmUgdG8gc2V0IFJhdGlvUHJvdGVjdEljb24ncyBgX3VzZXJJRGAgdmFsdWUuIE9ubHkgbmVjZXNzYXJ5IG9uY2Ugb3RoZXIgaWNvbiBzZXRzIGV4aXN0LlxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICogQWxsb3dzIGdpZnRpbmcgb2YgRkwgd2VkZ2UgdG8gbWVtYmVycyB0aHJvdWdoIGZvcnVtLlxyXG4gKi9cclxuY2xhc3MgRm9ydW1GTEdpZnQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLkZvcnVtLFxyXG4gICAgICAgIHRpdGxlOiAnZm9ydW1GTEdpZnQnLFxyXG4gICAgICAgIGRlc2M6IGBBZGQgYSBUaGFuayBidXR0b24gdG8gZm9ydW0gcG9zdHMuICg8ZW0+U2VuZHMgYSBGTCB3ZWRnZTwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLmZvcnVtTGluayc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydmb3J1bSB0aHJlYWQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEVuYWJsaW5nIEZvcnVtIEdpZnQgQnV0dG9uLi4uJyk7XHJcbiAgICAgICAgLy9tYWluQm9keSBpcyBiZXN0IGVsZW1lbnQgd2l0aCBhbiBJRCBJIGNvdWxkIGZpbmQgdGhhdCBpcyBhIHBhcmVudCB0byBhbGwgZm9ydW0gcG9zdHNcclxuICAgICAgICBjb25zdCBtYWluQm9keSA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHknKTtcclxuICAgICAgICAvL21ha2UgYXJyYXkgb2YgZm9ydW0gcG9zdHMgLSB0aGVyZSBpcyBvbmx5IG9uZSBjdXJzb3IgY2xhc3NlZCBvYmplY3QgcGVyIGZvcnVtIHBvc3QsIHNvIHRoaXMgd2FzIGJlc3QgdG8ga2V5IG9mZiBvZi4gd2lzaCB0aGVyZSB3ZXJlIG1vcmUgSURzIGFuZCBzdWNoIHVzZWQgaW4gZm9ydW1zXHJcbiAgICAgICAgY29uc3QgZm9ydW1Qb3N0czogSFRNTEFuY2hvckVsZW1lbnRbXSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKFxyXG4gICAgICAgICAgICBtYWluQm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb2x0YWJsZScpXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvL2ZvciBlYWNoIHBvc3Qgb24gdGhlIHBhZ2VcclxuICAgICAgICBmb3J1bVBvc3RzLmZvckVhY2goKGZvcnVtUG9zdCkgPT4ge1xyXG4gICAgICAgICAgICAvL3dvcmsgb3VyIHdheSBkb3duIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIEhUTUwgdG8gZ2V0IHRvIG91ciBwb3N0XHJcbiAgICAgICAgICAgIGxldCBib3R0b21Sb3cgPSBmb3J1bVBvc3QuY2hpbGROb2Rlc1sxXTtcclxuICAgICAgICAgICAgYm90dG9tUm93ID0gYm90dG9tUm93LmNoaWxkTm9kZXNbNF07XHJcbiAgICAgICAgICAgIGJvdHRvbVJvdyA9IGJvdHRvbVJvdy5jaGlsZE5vZGVzWzNdO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgSUQgb2YgdGhlIGZvcnVtIGZyb20gdGhlIGN1c3RvbSBNQU0gYXR0cmlidXRlXHJcbiAgICAgICAgICAgIGxldCBwb3N0SUQgPSAoPEhUTUxFbGVtZW50PmZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgLy9tYW0gZGVjaWRlZCB0byBoYXZlIGEgZGlmZmVyZW50IHN0cnVjdHVyZSBmb3IgbGFzdCBmb3J1bS4gd2lzaCB0aGV5IGp1c3QgaGFkIElEcyBvciBzb21ldGhpbmcgaW5zdGVhZCBvZiBhbGwgdGhpcyBqdW1waW5nIGFyb3VuZFxyXG4gICAgICAgICAgICBpZiAocG9zdElEID09PSAnbGFzdCcpIHtcclxuICAgICAgICAgICAgICAgIHBvc3RJRCA9ICg8SFRNTEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcnVtUG9zdC5wcmV2aW91c1NpYmxpbmchLnByZXZpb3VzU2libGluZyFcclxuICAgICAgICAgICAgICAgICkpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGVsZW1lbnQgZm9yIG91ciBmZWF0dXJlXHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgICAgICAvL3NldCBzYW1lIGNsYXNzIGFzIG90aGVyIG9iamVjdHMgaW4gYXJlYSBmb3Igc2FtZSBwb2ludGVyIGFuZCBmb3JtYXR0aW5nIG9wdGlvbnNcclxuICAgICAgICAgICAgZ2lmdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjdXJzb3InKTtcclxuICAgICAgICAgICAgLy9naXZlIG91ciBlbGVtZW50IGFuIElEIGZvciBmdXR1cmUgc2VsZWN0aW9uIGFzIG5lZWRlZFxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wXycgKyBwb3N0SUQgKyAnX3RleHQnKTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbmV3IGltZyBlbGVtZW50IHRvIGxlYWQgb3VyIG5ldyBmZWF0dXJlIHZpc3VhbHNcclxuICAgICAgICAgICAgY29uc3QgZ2lmdEljb25HaWYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICAgICAgLy91c2Ugc2l0ZSBmcmVlbGVlY2ggZ2lmIGljb24gZm9yIG91ciBmZWF0dXJlXHJcbiAgICAgICAgICAgIGdpZnRJY29uR2lmLnNldEF0dHJpYnV0ZShcclxuICAgICAgICAgICAgICAgICdzcmMnLFxyXG4gICAgICAgICAgICAgICAgJ2h0dHBzOi8vY2RuLm15YW5vbmFtb3VzZS5uZXQvaW1hZ2VidWNrZXQvMTA4MzAzL3RoYW5rLmdpZidcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgLy9tYWtlIHRoZSBnaWYgaWNvbiB0aGUgZmlyc3QgY2hpbGQgb2YgZWxlbWVudFxyXG4gICAgICAgICAgICBnaWZ0RWxlbWVudC5hcHBlbmRDaGlsZChnaWZ0SWNvbkdpZik7XHJcbiAgICAgICAgICAgIC8vYWRkIHRoZSBmZWF0dXJlIGVsZW1lbnQgaW4gbGluZSB3aXRoIHRoZSBjdXJzb3Igb2JqZWN0IHdoaWNoIGlzIHRoZSBxdW90ZSBhbmQgcmVwb3J0IGJ1dHRvbnMgYXQgYm90dG9tXHJcbiAgICAgICAgICAgIGJvdHRvbVJvdy5hcHBlbmRDaGlsZChnaWZ0RWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICAvL21ha2UgaXQgYSBidXR0b24gdmlhIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIGdpZnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdG8gYXZvaWQgYnV0dG9uIHRyaWdnZXJpbmcgbW9yZSB0aGFuIG9uY2UgcGVyIHBhZ2UgbG9hZCwgY2hlY2sgaWYgYWxyZWFkeSBoYXZlIGpzb24gcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9kdWUgdG8gbGFjayBvZiBJRHMgYW5kIGNvbmZsaWN0aW5nIHF1ZXJ5IHNlbGVjdGFibGUgZWxlbWVudHMsIG5lZWQgdG8ganVtcCB1cCBhIGZldyBwYXJlbnQgbGV2ZWxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RQYXJlbnROb2RlID0gZ2lmdEVsZW1lbnQucGFyZW50RWxlbWVudCEucGFyZW50RWxlbWVudCFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnRFbGVtZW50ITtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmNlIGF0IHBhcmVudCBub2RlIG9mIHRoZSBwb3N0LCBmaW5kIHRoZSBwb3N0ZXIncyB1c2VyIGlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJFbGVtID0gcG9zdFBhcmVudE5vZGUucXVlcnlTZWxlY3RvcihgYVtocmVmXj1cIi91L1wiXWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgVVJMIG9mIHRoZSBwb3N0IHRvIGFkZCB0byBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc3RVUkwgPSAoPEhUTUxFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RQYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoYGFbaHJlZl49XCIvZi90L1wiXWApIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgTUFNIHVzZXIgc2VuZGluZyBnaWZ0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZW5kZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck1lbnUnKSEuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NsZWFuIHVwIHRleHQgb2Ygc2VuZGVyIG9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXIgPSBzZW5kZXIuc3Vic3RyaW5nKDAsIHNlbmRlci5pbmRleE9mKCcgJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dldCB0aGUgdGl0bGUgb2YgdGhlIHBhZ2Ugc28gd2UgY2FuIHdyaXRlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZvcnVtVGl0bGUgPSBkb2N1bWVudC50aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jdXQgZG93biBmbHVmZiBmcm9tIHBhZ2UgdGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ydW1UaXRsZSA9IGZvcnVtVGl0bGUuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3J1bVRpdGxlLmluZGV4T2YoJ3wnKSAtIDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9nZXQgdGhlIG1lbWJlcnMgbmFtZSBmb3IgSlNPTiBzdHJpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck5hbWUgPSAoPEhUTUxFbGVtZW50PnVzZXJFbGVtISkuaW5uZXJUZXh0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwgdG8gR0VUIGEgZ2lmdCByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1zZW5kV2VkZ2UmZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtzZW5kZXJ9IHdhbnRzIHRvIHRoYW5rIHlvdSBmb3IgeW91ciBjb250cmlidXRpb24gdG8gdGhlIGZvcnVtIHRvcGljIFt1cmw9aHR0cHM6Ly9teWFub25hbW91c2UubmV0JHtwb3N0VVJMfV0ke2ZvcnVtVGl0bGV9Wy91cmxdYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlICMgVVJJIGNvbXBhdGlibGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJyMnLCAnJTIzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlIE1BTSsganNvbiBnZXQgdXRpbGl0eSB0byBwcm9jZXNzIFVSTCBhbmQgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvblJlc3VsdDogc3RyaW5nID0gYXdhaXQgVXRpbC5nZXRKU09OKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coJ0dpZnQgUmVzdWx0JywganNvblJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgZ2lmdCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEpTT04ucGFyc2UoanNvblJlc3VsdCkuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGZlYXR1cmUgdGV4dCB0byBzaG93IHN1Y2Nlc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdGTCBHaWZ0IFN1Y2Nlc3NmdWwhJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Jhc2VkIG9uIGZhaWx1cmUsIGFkZCBmZWF0dXJlIHRleHQgdG8gc2hvdyBmYWlsdXJlIHJlYXNvbiBvciBnZW5lcmljXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGpzb25SZXN1bHQpLmVycm9yID09PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1lvdSBjYW4gb25seSBzZW5kIGEgdXNlciBvbmUgd2VkZ2UgcGVyIGRheS4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdGYWlsZWQ6IEFscmVhZHkgR2lmdGVkIFRoaXMgVXNlciBUb2RheSEnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoanNvblJlc3VsdCkuZXJyb3IgPT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSW52YWxpZCB1c2VyLCB0aGlzIHVzZXIgaXMgbm90IGN1cnJlbnRseSBhY2NlcHRpbmcgd2VkZ2VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRFbGVtZW50LmFwcGVuZENoaWxkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmFpbGVkOiBUaGlzIFVzZXIgRG9lcyBOb3QgQWNjZXB0IEdpZnRzISdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmx5IGtub3duIGV4YW1wbGUgb2YgdGhpcyAnb3RoZXInIGlzIHdoZW4gZ2lmdGluZyB5b3Vyc2VsZlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEVsZW1lbnQuYXBwZW5kQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0ZMIEdpZnQgRmFpbGVkIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBQcm9jZXNzICYgcmV0dXJuIGluZm9ybWF0aW9uIGZyb20gdGhlIHNob3V0Ym94XHJcbiAqL1xyXG5jbGFzcyBQcm9jZXNzU2hvdXRzIHtcclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIHNob3V0Ym94IGZvciBjaGFuZ2VzLCB0cmlnZ2VyaW5nIGFjdGlvbnMgZm9yIGZpbHRlcmVkIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIG5hbWVzIChPcHRpb25hbCkgTGlzdCBvZiB1c2VybmFtZXMvSURzIHRvIGZpbHRlciBmb3JcclxuICAgICAqIEBwYXJhbSB1c2VydHlwZSAoT3B0aW9uYWwpIFdoYXQgZmlsdGVyIHRoZSBuYW1lcyBhcmUgZm9yLiBSZXF1aXJlZCBpZiBgbmFtZXNgIGlzIHByb3ZpZGVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTaG91dGJveChcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBuYW1lcz86IHN0cmluZ1tdLFxyXG4gICAgICAgIHVzZXJ0eXBlPzogU2hvdXRib3hVc2VyVHlwZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgc2hvdXRib3hcclxuICAgICAgICBDaGVjay5lbGVtT2JzZXJ2ZXIoXHJcbiAgICAgICAgICAgIHRhcixcclxuICAgICAgICAgICAgKG11dExpc3QpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIHNob3V0Ym94IHVwZGF0ZXMsIHByb2Nlc3MgdGhlIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBtdXRMaXN0LmZvckVhY2goKG11dFJlYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY2hhbmdlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIG11dFJlYy5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGU6IE5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBVdGlsLm5vZGVUb0VsZW0obm9kZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbm9kZSBpcyBhZGRlZCBieSBNQU0rIGZvciBnaWZ0IGJ1dHRvbiwgaWdub3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsc28gaWdub3JlIGlmIHRoZSBub2RlIGlzIGEgZGF0ZSBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXm1wXy8udGVzdChub2RlRGF0YS5nZXRBdHRyaWJ1dGUoJ2lkJykhKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURhdGEuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBsb29raW5nIGZvciBzcGVjaWZpYyB1c2Vycy4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZXMgIT09IHVuZGVmaW5lZCAmJiBuYW1lcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlcnR5cGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZXJ0eXBlIG11c3QgYmUgZGVmaW5lZCBpZiBmaWx0ZXJpbmcgbmFtZXMhJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySUQ6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhW2hyZWZePVwiL3UvXCJdJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHJlZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTmFtZTogc3RyaW5nID0gdGhpcy5leHRyYWN0RnJvbVNob3V0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAvdS8ke25hbWV9YCA9PT0gdXNlcklEIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2FzZWxlc3NTdHJpbmdNYXRjaChuYW1lLCB1c2VyTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZVNob3V0KG5vZGUsIHVzZXJ0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHsgY2hpbGRMaXN0OiB0cnVlIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2F0Y2ggdGhlIHNob3V0Ym94IGZvciBjaGFuZ2VzLCB0cmlnZ2VyaW5nIGFjdGlvbnMgZm9yIGZpbHRlcmVkIHNob3V0c1xyXG4gICAgICogQHBhcmFtIHRhciBUaGUgc2hvdXRib3ggZWxlbWVudCBzZWxlY3RvclxyXG4gICAgICogQHBhcmFtIGJ1dHRvbnMgTnVtYmVyIHRvIHJlcHJlc2VudCBjaGVja2JveCBzZWxlY3Rpb25zIDEgPSBSZXBseSwgMiA9IFJlcGx5IFdpdGggUXVvdGVcclxuICAgICAqIEBwYXJhbSBjaGFyTGltaXQgTnVtYmVyIG9mIGNoYXJhY3RlcnMgdG8gaW5jbHVkZSBpbiBxdW90ZSwgLCBjaGFyTGltaXQ/Om51bWJlciAtIEN1cnJlbnRseSB1bnVzZWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB3YXRjaFNob3V0Ym94UmVwbHkodGFyOiBzdHJpbmcsIGJ1dHRvbnM/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCd3YXRjaFNob3V0Ym94UmVwbHkoJywgdGFyLCBidXR0b25zLCAnKScpO1xyXG5cclxuICAgICAgICBjb25zdCBfZ2V0VUlEID0gKG5vZGU6IE5vZGUpOiBzdHJpbmcgPT5cclxuICAgICAgICAgICAgdGhpcy5leHRyYWN0RnJvbVNob3V0KG5vZGUsICdhW2hyZWZePVwiL3UvXCJdJywgJ2hyZWYnKTtcclxuXHJcbiAgICAgICAgY29uc3QgX2dldFJhd0NvbG9yID0gKGVsZW06IEhUTUxTcGFuRWxlbWVudCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvcjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtLnN0eWxlLmNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5zdHlsZS5jb2xvcjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBfZ2V0TmFtZUNvbG9yID0gKGVsZW06IEhUTUxTcGFuRWxlbWVudCB8IG51bGwpOiBzdHJpbmcgfCBudWxsID0+IHtcclxuICAgICAgICAgICAgaWYgKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJhd0NvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldFJhd0NvbG9yKGVsZW0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJhd0NvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCB0byBoZXhcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZ2I6IHN0cmluZ1tdID0gVXRpbC5icmFja2V0Q29udGVudHMocmF3Q29sb3IpLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFV0aWwucmdiVG9IZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlswXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlsxXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KHJnYlsyXSlcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRWxlbWVudCBpcyBudWxsIVxcbiR7ZWxlbX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgX21ha2VOYW1lVGFnID0gKG5hbWU6IHN0cmluZywgaGV4OiBzdHJpbmcgfCBudWxsLCB1aWQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIHVpZCA9IHVpZC5tYXRjaCgvXFxkKy9nKSEuam9pbignJyk7IC8vIEdldCB0aGUgVUlELCBidXQgb25seSB0aGUgZGlnaXRzXHJcbiAgICAgICAgICAgIGhleCA9IGhleCA/IGA7JHtoZXh9YCA6ICcnOyAvLyBJZiB0aGVyZSBpcyBhIGhleCB2YWx1ZSwgcHJlcGVuZCBgO2BcclxuICAgICAgICAgICAgcmV0dXJuIGBAW3VsaW5rPSR7dWlkfSR7aGV4fV0ke25hbWV9Wy91bGlua11gO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgcmVwbHkgYm94XHJcbiAgICAgICAgY29uc3QgcmVwbHlCb3ggPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hib3hfdGV4dCcpO1xyXG4gICAgICAgIC8vIE9ic2VydmUgdGhlIHNob3V0Ym94XHJcbiAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKFxyXG4gICAgICAgICAgICB0YXIsXHJcbiAgICAgICAgICAgIChtdXRMaXN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzaG91dGJveCB1cGRhdGVzLCBwcm9jZXNzIHRoZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgbXV0TGlzdC5mb3JFYWNoKChtdXRSZWMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGNoYW5nZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgICAgICBtdXRSZWMuYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gVXRpbC5ub2RlVG9FbGVtKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYWRkZWQgYnkgTUFNKyBmb3IgZ2lmdCBidXR0b24sIGlnbm9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIGlnbm9yZSBpZiB0aGUgbm9kZSBpcyBhIGRhdGUgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL15tcF8vLnRlc3Qobm9kZURhdGEuZ2V0QXR0cmlidXRlKCdpZCcpISkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLmNsYXNzTGlzdC5jb250YWlucygnZGF0ZUJyZWFrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgbmFtZSBpbmZvcm1hdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG91dE5hbWU6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSBVdGlsLm5vZGVUb0VsZW0oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkucXVlcnlTZWxlY3RvcignYVtocmVmXj1cIi91L1wiXSBzcGFuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyYWIgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIG5hbWUsIG9yIHRleHQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZUNvbG9yOiBzdHJpbmcgfCBudWxsID0gX2dldE5hbWVDb2xvcihzaG91dE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2V4dHJhY3QgdGhlIHVzZXJuYW1lIGZyb20gbm9kZSBmb3IgdXNlIGluIHJlcGx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBzdHJpbmcgPSB0aGlzLmV4dHJhY3RGcm9tU2hvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EgPiBzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VySUQ6IHN0cmluZyA9IHRoaXMuZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYVtocmVmXj1cIi91L1wiXScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHJlZidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBzcGFuIGVsZW1lbnQgdG8gYmUgYm9keSBvZiBidXR0b24gYWRkZWQgdG8gcGFnZSAtIGJ1dHRvbiB1c2VzIHJlbGF0aXZlIG5vZGUgY29udGV4dCBhdCBjbGljayB0aW1lIHRvIGRvIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBseUJ1dHRvbjogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoaXMgaXMgYSBSZXBseVNpbXBsZSByZXF1ZXN0LCB0aGVuIGNyZWF0ZSBSZXBseSBTaW1wbGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidXR0b25zID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBidXR0b24gd2l0aCBvbmNsaWNrIGFjdGlvbiBvZiBzZXR0aW5nIHNiIHRleHQgZmllbGQgdG8gdXNlcm5hbWUgd2l0aCBwb3RlbnRpYWwgY29sb3IgYmxvY2sgd2l0aCBhIGNvbG9uIGFuZCBzcGFjZSB0byByZXBseSwgZm9jdXMgY3Vyc29yIGluIHRleHQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5pbm5lckhUTUwgPSAnPGJ1dHRvbj5cXHUyOTNhPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBzdHlsZWQgbmFtZSB0YWcgdG8gdGhlIHJlcGx5IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBub3RoaW5nIHdhcyBpbiB0aGUgcmVwbHkgYm94LCBhZGQgYSBjb2xvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVwbHlCb3gudmFsdWUgPT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LnZhbHVlID0gYCR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gJHtfbWFrZU5hbWVUYWcodXNlck5hbWUsIG5hbWVDb2xvciwgdXNlcklEKX0gYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBhIHJlcGx5UXVvdGUgcmVxdWVzdCwgdGhlbiBjcmVhdGUgcmVwbHkgcXVvdGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGJ1dHRvbnMgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGJ1dHRvbiB3aXRoIG9uY2xpY2sgYWN0aW9uIG9mIGdldHRpbmcgdGhhdCBsaW5lJ3MgdGV4dCwgc3RyaXBwaW5nIGRvd24gdG8gNjUgY2hhciB3aXRoIG5vIHdvcmQgYnJlYWssIHRoZW4gaW5zZXJ0IGludG8gU0IgdGV4dCBmaWVsZCwgZm9jdXMgY3Vyc29yIGluIHRleHQgYm94XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5pbm5lckhUTUwgPSAnPGJ1dHRvbj5cXHUyOTNkPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5QnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMucXVvdGVTaG91dChub2RlLCA2NSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHF1b3RlIHRvIHJlcGx5IGJveFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlCb3gudmFsdWUgPSBgJHtfbWFrZU5hbWVUYWcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZUNvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJRFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX06IFxcdTIwMWNbaV0ke3RleHR9Wy9pXVxcdTIwMWQgYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKdXN0IHJlcGx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IGAke19tYWtlTmFtZVRhZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfTogYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2dpdmUgc3BhbiBhbiBJRCBmb3IgcG90ZW50aWFsIHVzZSBsYXRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ21wX3JlcGx5QnV0dG9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaW5zZXJ0IGJ1dHRvbiBwcmlvciB0byB1c2VybmFtZSBvciBhbm90aGVyIGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZShyZXBseUJ1dHRvbiwgbm9kZS5jaGlsZE5vZGVzWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7IGNoaWxkTGlzdDogdHJ1ZSB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHF1b3RlU2hvdXQoc2hvdXQ6IE5vZGUsIGxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgdGV4dEFycjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAvLyBHZXQgbnVtYmVyIG9mIHJlcGx5IGJ1dHRvbnMgdG8gcmVtb3ZlIGZyb20gdGV4dFxyXG4gICAgICAgIGNvbnN0IGJ0bkNvdW50ID0gc2hvdXQuZmlyc3RDaGlsZCEucGFyZW50RWxlbWVudCEucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgJy5tcF9yZXBseUJ1dHRvbidcclxuICAgICAgICApLmxlbmd0aDtcclxuICAgICAgICAvLyBHZXQgdGhlIHRleHQgb2YgYWxsIGNoaWxkIG5vZGVzXHJcbiAgICAgICAgc2hvdXQuY2hpbGROb2Rlcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgICAgICAvKiBJZiB0aGUgY2hpbGQgaXMgYSBub2RlIHdpdGggY2hpbGRyZW4gKGV4LiBub3QgcGxhaW4gdGV4dCkgY2hlY2sgdG8gc2VlIGlmXHJcbiAgICAgICAgICAgIHRoZSBjaGlsZCBpcyBhIGxpbmsuIElmIHRoZSBsaW5rIGRvZXMgTk9UIHN0YXJ0IHdpdGggYC91L2AgKGluZGljYXRpbmcgYSB1c2VyKVxyXG4gICAgICAgICAgICB0aGVuIGNoYW5nZSB0aGUgbGluayB0byB0aGUgc3RyaW5nIGBbTGlua11gLlxyXG4gICAgICAgICAgICBJbiBhbGwgb3RoZXIgY2FzZXMsIHJldHVybiB0aGUgY2hpbGQgdGV4dCBjb250ZW50LiAqL1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEVsZW0gPSBVdGlsLm5vZGVUb0VsZW0oY2hpbGQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY2hpbGRFbGVtLmhhc0F0dHJpYnV0ZSgnaHJlZicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkRWxlbS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSEuaW5kZXhPZignL3UvJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKCdbTGlua10nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFyci5wdXNoKGNoaWxkLnRleHRDb250ZW50ISk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0QXJyLnB1c2goY2hpbGQudGV4dENvbnRlbnQhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIE1ha2UgYSBzdHJpbmcsIGJ1dCB0b3NzIG91dCB0aGUgZmlyc3QgZmV3IG5vZGVzXHJcbiAgICAgICAgbGV0IG5vZGVUZXh0ID0gdGV4dEFyci5zbGljZSgzICsgYnRuQ291bnQpLmpvaW4oJycpO1xyXG4gICAgICAgIGlmIChub2RlVGV4dC5pbmRleE9mKCc6JykgPT09IDApIHtcclxuICAgICAgICAgICAgbm9kZVRleHQgPSBub2RlVGV4dC5zdWJzdHIoMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2Ugc2hvdWxkIGhhdmUganVzdCB0aGUgbWVzc2FnZSB0ZXh0LlxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgcXVvdGVzIHRoYXQgbWlnaHQgYmUgY29udGFpbmVkOlxyXG4gICAgICAgIG5vZGVUZXh0ID0gbm9kZVRleHQucmVwbGFjZSgvXFx1ezIwMWN9KC4qPylcXHV7MjAxZH0vZ3UsICcnKTtcclxuICAgICAgICAvLyBUcmltIHRoZSB0ZXh0IHRvIGEgbWF4IGxlbmd0aCBhbmQgYWRkIC4uLiBpZiBzaG9ydGVuZWRcclxuICAgICAgICBsZXQgdHJpbW1lZFRleHQgPSBVdGlsLnRyaW1TdHJpbmcobm9kZVRleHQudHJpbSgpLCBsZW5ndGgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkVGV4dCAhPT0gbm9kZVRleHQudHJpbSgpKSB7XHJcbiAgICAgICAgICAgIHRyaW1tZWRUZXh0ICs9ICcgW1xcdTIwMjZdJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRG9uZSFcclxuICAgICAgICByZXR1cm4gdHJpbW1lZFRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFeHRyYWN0IGluZm9ybWF0aW9uIGZyb20gc2hvdXRzXHJcbiAgICAgKiBAcGFyYW0gc2hvdXQgVGhlIG5vZGUgY29udGFpbmluZyBzaG91dCBpbmZvXHJcbiAgICAgKiBAcGFyYW0gdGFyIFRoZSBlbGVtZW50IHNlbGVjdG9yIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIGdldCBUaGUgcmVxdWVzdGVkIGluZm8gKGhyZWYgb3IgdGV4dClcclxuICAgICAqIEByZXR1cm5zIFRoZSBzdHJpbmcgdGhhdCB3YXMgc3BlY2lmaWVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZXh0cmFjdEZyb21TaG91dChcclxuICAgICAgICBzaG91dDogTm9kZSxcclxuICAgICAgICB0YXI6IHN0cmluZyxcclxuICAgICAgICBnZXQ6ICdocmVmJyB8ICd0ZXh0J1xyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBub2RlRGF0YSA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXRlQnJlYWsnKTtcclxuXHJcbiAgICAgICAgaWYgKHNob3V0ICE9PSBudWxsICYmICFub2RlRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCA9IFV0aWwubm9kZVRvRWxlbShzaG91dCkucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgIHRhclxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoc2hvdXRFbGVtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXh0cmFjdGVkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldCAhPT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFjdGVkID0gc2hvdXRFbGVtLmdldEF0dHJpYnV0ZShnZXQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBleHRyYWN0ZWQgPSBzaG91dEVsZW0udGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFjdGVkICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4dHJhY3RlZDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZXh0cmFjdCBzaG91dCEgQXR0cmlidXRlIHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBFbGVtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBleHRyYWN0IHNob3V0ISBOb2RlIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIHRoZSBzdHlsZSBvZiBhIHNob3V0IGJhc2VkIG9uIGZpbHRlciBsaXN0c1xyXG4gICAgICogQHBhcmFtIHNob3V0IFRoZSBub2RlIGNvbnRhaW5pbmcgc2hvdXQgaW5mb1xyXG4gICAgICogQHBhcmFtIHVzZXJ0eXBlIFRoZSB0eXBlIG9mIHVzZXJzIHRoYXQgaGF2ZSBiZWVuIGZpbHRlcmVkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc3R5bGVTaG91dChzaG91dDogTm9kZSwgdXNlcnR5cGU6IFNob3V0Ym94VXNlclR5cGUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzaG91dEVsZW06IEhUTUxFbGVtZW50ID0gVXRpbC5ub2RlVG9FbGVtKHNob3V0KTtcclxuICAgICAgICBpZiAodXNlcnR5cGUgPT09ICdwcmlvcml0eScpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tU3R5bGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKCdwcmlvcml0eVN0eWxlX3ZhbCcpO1xyXG4gICAgICAgICAgICBpZiAoY3VzdG9tU3R5bGUpIHtcclxuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gYGhzbGEoJHtjdXN0b21TdHlsZX0pYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3V0RWxlbS5zdHlsZS5iYWNrZ3JvdW5kID0gJ2hzbGEoMCwwJSw1MCUsMC4zKSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHVzZXJ0eXBlID09PSAnbXV0ZScpIHtcclxuICAgICAgICAgICAgc2hvdXRFbGVtLmNsYXNzTGlzdC5hZGQoJ21wX211dGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBQcmlvcml0eVVzZXJzIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogVGV4dGJveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAndGV4dGJveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwcmlvcml0eVVzZXJzJyxcclxuICAgICAgICB0YWc6ICdFbXBoYXNpemUgVXNlcnMnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIHN5c3RlbSwgMjU0MjAsIDc3NjE4JyxcclxuICAgICAgICBkZXNjOlxyXG4gICAgICAgICAgICAnRW1waGFzaXplcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94LiAoPGVtPlRoaXMgYWNjZXB0cyB1c2VyIElEcyBhbmQgdXNlcm5hbWVzLiBJdCBpcyBub3QgY2FzZSBzZW5zaXRpdmUuPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9wcmlvcml0eVVzZXJzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfdXNlclR5cGU6IFNob3V0Ym94VXNlclR5cGUgPSAncHJpb3JpdHknO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKGAke3RoaXMuc2V0dGluZ3MudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgIGlmIChnbVZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJpb3JpdHlVc2VycyA9IGF3YWl0IFV0aWwuY3N2VG9BcnJheShnbVZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXJsaXN0IGlzIG5vdCBkZWZpbmVkIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3godGhpcy5fdGFyLCB0aGlzLl9wcmlvcml0eVVzZXJzLCB0aGlzLl91c2VyVHlwZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gSGlnaGxpZ2h0aW5nIHVzZXJzIGluIHRoZSBzaG91dGJveC4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIGEgY3VzdG9tIGJhY2tncm91bmQgdG8gYmUgYXBwbGllZCB0byBwcmlvcml0eSB1c2Vyc1xyXG4gKi9cclxuY2xhc3MgUHJpb3JpdHlTdHlsZSBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncHJpb3JpdHlTdHlsZScsXHJcbiAgICAgICAgdGFnOiAnRW1waGFzaXMgU3R5bGUnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZGVmYXVsdDogMCwgMCUsIDUwJSwgMC4zJyxcclxuICAgICAgICBkZXNjOiBgQ2hhbmdlIHRoZSBjb2xvci9vcGFjaXR5IG9mIHRoZSBoaWdobGlnaHRpbmcgcnVsZSBmb3IgZW1waGFzaXplZCB1c2VycycgcG9zdHMuICg8ZW0+VGhpcyBpcyBmb3JtYXR0ZWQgYXMgSHVlICgwLTM2MCksIFNhdHVyYXRpb24gKDAtMTAwJSksIExpZ2h0bmVzcyAoMC0xMDAlKSwgT3BhY2l0eSAoMC0xKTwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnLnNiZiBkaXYnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldHRpbmcgY3VzdG9tIGhpZ2hsaWdodCBmb3IgcHJpb3JpdHkgdXNlcnMuLi5gKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogVGV4dGJveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBhIGN1c3RvbSBiYWNrZ3JvdW5kIHRvIGJlIGFwcGxpZWQgdG8gZGVzaXJlZCBtdXRlZCB1c2Vyc1xyXG4gKi9cclxuY2xhc3MgTXV0ZWRVc2VycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IFRleHRib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnbXV0ZWRVc2VycycsXHJcbiAgICAgICAgdGFnOiAnTXV0ZSB1c2VycycsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdleC4gMTIzNCwgZ2FyZGVuc2hhZGUnLFxyXG4gICAgICAgIGRlc2M6IGBPYnNjdXJlcyBtZXNzYWdlcyBmcm9tIHRoZSBsaXN0ZWQgdXNlcnMgaW4gdGhlIHNob3V0Ym94IHVudGlsIGhvdmVyZWQuICg8ZW0+VGhpcyBhY2NlcHRzIHVzZXIgSURzIGFuZCB1c2VybmFtZXMuIEl0IGlzIG5vdCBjYXNlIHNlbnNpdGl2ZS48L2VtPilgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYgZGl2JztcclxuICAgIHByaXZhdGUgX211dGVkVXNlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIF91c2VyVHlwZTogU2hvdXRib3hVc2VyVHlwZSA9ICdtdXRlJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBnbVZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShgJHt0aGlzLnNldHRpbmdzLnRpdGxlfV92YWxgKTtcclxuICAgICAgICBpZiAoZ21WYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX211dGVkVXNlcnMgPSBhd2FpdCBVdGlsLmNzdlRvQXJyYXkoZ21WYWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VybGlzdCBpcyBub3QgZGVmaW5lZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvY2Vzc1Nob3V0cy53YXRjaFNob3V0Ym94KHRoaXMuX3RhciwgdGhpcy5fbXV0ZWRVc2VycywgdGhpcy5fdXNlclR5cGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIE9ic2N1cmluZyBtdXRlZCB1c2Vycy4uLmApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIEdpZnQgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0IFRyaXBsZSBkb3QgbWVudVxyXG4gKi9cclxuY2xhc3MgR2lmdEJ1dHRvbiBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNob3V0Ym94LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdnaWZ0QnV0dG9uJyxcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgR2lmdCBidXR0b24gaW4gU2hvdXRib3ggZG90LW1lbnVgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJy5zYmYnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEluaXRpYWxpemVkIEdpZnQgQnV0dG9uLmApO1xyXG4gICAgICAgIGNvbnN0IHNiZkRpdiA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JmJykhO1xyXG4gICAgICAgIGNvbnN0IHNiZkRpdkNoaWxkID0gc2JmRGl2IS5maXJzdENoaWxkO1xyXG5cclxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbmV2ZXIgc29tZXRoaW5nIGlzIGNsaWNrZWQgaW4gdGhlIHNiZiBkaXZcclxuICAgICAgICBzYmZEaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvL3B1bGwgdGhlIGV2ZW50IHRhcmdldCBpbnRvIGFuIEhUTUwgRWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICAgICAgLy9hZGQgdGhlIFRyaXBsZSBEb3QgTWVudSBhcyBhbiBlbGVtZW50XHJcbiAgICAgICAgICAgIGNvbnN0IHNiTWVudUVsZW0gPSB0YXJnZXQhLmNsb3Nlc3QoJy5zYl9tZW51Jyk7XHJcbiAgICAgICAgICAgIC8vZmluZCB0aGUgbWVzc2FnZSBkaXZcclxuICAgICAgICAgICAgY29uc3Qgc2JNZW51UGFyZW50ID0gdGFyZ2V0IS5jbG9zZXN0KGBkaXZgKTtcclxuICAgICAgICAgICAgLy9nZXQgdGhlIGZ1bGwgdGV4dCBvZiB0aGUgbWVzc2FnZSBkaXZcclxuICAgICAgICAgICAgbGV0IGdpZnRNZXNzYWdlID0gc2JNZW51UGFyZW50IS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgIC8vZm9ybWF0IG1lc3NhZ2Ugd2l0aCBzdGFuZGFyZCB0ZXh0ICsgbWVzc2FnZSBjb250ZW50cyArIHNlcnZlciB0aW1lIG9mIHRoZSBtZXNzYWdlXHJcbiAgICAgICAgICAgIGdpZnRNZXNzYWdlID1cclxuICAgICAgICAgICAgICAgIGBTZW50IG9uIFNob3V0Ym94IG1lc3NhZ2U6IFwiYCArXHJcbiAgICAgICAgICAgICAgICBnaWZ0TWVzc2FnZS5zdWJzdHJpbmcoZ2lmdE1lc3NhZ2UuaW5kZXhPZignOiAnKSArIDIpICtcclxuICAgICAgICAgICAgICAgIGBcIiBhdCBgICtcclxuICAgICAgICAgICAgICAgIGdpZnRNZXNzYWdlLnN1YnN0cmluZygwLCA4KTtcclxuICAgICAgICAgICAgLy9pZiB0aGUgdGFyZ2V0IG9mIHRoZSBjbGljayBpcyBub3QgdGhlIFRyaXBsZSBEb3QgTWVudSBPUlxyXG4gICAgICAgICAgICAvL2lmIG1lbnUgaXMgb25lIG9mIHlvdXIgb3duIGNvbW1lbnRzIChvbmx5IHdvcmtzIGZvciBmaXJzdCAxMCBtaW51dGVzIG9mIGNvbW1lbnQgYmVpbmcgc2VudClcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgIXRhcmdldCEuY2xvc2VzdCgnLnNiX21lbnUnKSB8fFxyXG4gICAgICAgICAgICAgICAgc2JNZW51RWxlbSEuZ2V0QXR0cmlidXRlKCdkYXRhLWVlJykhID09PSAnMSdcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXQgdGhlIE1lbnUgYWZ0ZXIgaXQgcG9wcyB1cFxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgR2lmdCBCdXR0b24uLi5gKTtcclxuICAgICAgICAgICAgY29uc3QgcG9wdXBNZW51OiBIVE1MRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2JNZW51TWFpbicpO1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBVdGlsLnNsZWVwKDUpO1xyXG4gICAgICAgICAgICB9IHdoaWxlICghcG9wdXBNZW51IS5oYXNDaGlsZE5vZGVzKCkpO1xyXG4gICAgICAgICAgICAvL2dldCB0aGUgdXNlciBkZXRhaWxzIGZyb20gdGhlIHBvcHVwIG1lbnUgZGV0YWlsc1xyXG4gICAgICAgICAgICBjb25zdCBwb3B1cFVzZXI6IEhUTUxFbGVtZW50ID0gVXRpbC5ub2RlVG9FbGVtKHBvcHVwTWVudSEuY2hpbGROb2Rlc1swXSk7XHJcbiAgICAgICAgICAgIC8vbWFrZSB1c2VybmFtZSBlcXVhbCB0aGUgZGF0YS11aWQsIGZvcmNlIG5vdCBudWxsXHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJOYW1lOiBTdHJpbmcgPSBwb3B1cFVzZXIhLmdldEF0dHJpYnV0ZSgnZGF0YS11aWQnKSE7XHJcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGdpZnRzIHNldCBpbiBwcmVmZXJlbmNlcyBmb3IgdXNlciBwYWdlXHJcbiAgICAgICAgICAgIGxldCBnaWZ0VmFsdWVTZXR0aW5nOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgndXNlckdpZnREZWZhdWx0X3ZhbCcpO1xyXG4gICAgICAgICAgICAvL2lmIHRoZXkgZGlkIG5vdCBzZXQgYSB2YWx1ZSBpbiBwcmVmZXJlbmNlcywgc2V0IHRvIDEwMFxyXG4gICAgICAgICAgICBpZiAoIWdpZnRWYWx1ZVNldHRpbmcpIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnMTAwJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgIE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA+IDEwMDAgfHxcclxuICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBnaWZ0VmFsdWVTZXR0aW5nID0gJzEwMDAnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE51bWJlcihnaWZ0VmFsdWVTZXR0aW5nKSA8IDUpIHtcclxuICAgICAgICAgICAgICAgIGdpZnRWYWx1ZVNldHRpbmcgPSAnNSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9jcmVhdGUgdGhlIEhUTUwgZG9jdW1lbnQgdGhhdCBob2xkcyB0aGUgYnV0dG9uIGFuZCB2YWx1ZSB0ZXh0XHJcbiAgICAgICAgICAgIGNvbnN0IGdpZnRCdXR0b246IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICAgICAgZ2lmdEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2dpZnRCdXR0b24nKTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgdGhlIGJ1dHRvbiBlbGVtZW50IGFzIHdlbGwgYXMgYSB0ZXh0IGVsZW1lbnQgZm9yIHZhbHVlIG9mIGdpZnQuIFBvcHVsYXRlIHdpdGggdmFsdWUgZnJvbSBzZXR0aW5nc1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLmlubmVySFRNTCA9IGA8YnV0dG9uPkdpZnQ6IDwvYnV0dG9uPjxzcGFuPiZuYnNwOzwvc3Bhbj48aW5wdXQgdHlwZT1cInRleHRcIiBzaXplPVwiM1wiIGlkPVwibXBfZ2lmdFZhbHVlXCIgdGl0bGU9XCJWYWx1ZSBiZXR3ZWVuIDUgYW5kIDEwMDBcIiB2YWx1ZT1cIiR7Z2lmdFZhbHVlU2V0dGluZ31cIj5gO1xyXG4gICAgICAgICAgICAvL2FkZCBnaWZ0IGVsZW1lbnQgd2l0aCBidXR0b24gYW5kIHRleHQgdG8gdGhlIG1lbnVcclxuICAgICAgICAgICAgcG9wdXBNZW51IS5jaGlsZE5vZGVzWzBdLmFwcGVuZENoaWxkKGdpZnRCdXR0b24pO1xyXG4gICAgICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lciBmb3Igd2hlbiBnaWZ0IGJ1dHRvbiBpcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9wdWxsIHdoYXRldmVyIHRoZSBmaW5hbCB2YWx1ZSBvZiB0aGUgdGV4dCBib3ggZXF1YWxzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBnaWZ0RmluYWxBbW91bnQgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcF9naWZ0VmFsdWUnKVxyXG4gICAgICAgICAgICAgICAgKSkhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgLy9iZWdpbiBzZXR0aW5nIHVwIHRoZSBHRVQgcmVxdWVzdCB0byBNQU0gSlNPTlxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2lmdEhUVFAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIC8vVVJMIHRvIEdFVCByZXN1bHRzIHdpdGggdGhlIGFtb3VudCBlbnRlcmVkIGJ5IHVzZXIgcGx1cyB0aGUgdXNlcm5hbWUgZm91bmQgb24gdGhlIG1lbnUgc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgIC8vYWRkZWQgbWVzc2FnZSBjb250ZW50cyBlbmNvZGVkIHRvIHByZXZlbnQgdW5pbnRlbmRlZCBjaGFyYWN0ZXJzIGZyb20gYnJlYWtpbmcgSlNPTiBVUkxcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5teWFub25hbW91c2UubmV0L2pzb24vYm9udXNCdXkucGhwP3NwZW5kdHlwZT1naWZ0JmFtb3VudD0ke2dpZnRGaW5hbEFtb3VudH0mZ2lmdFRvPSR7dXNlck5hbWV9Jm1lc3NhZ2U9JHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdE1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICl9YDtcclxuICAgICAgICAgICAgICAgIGdpZnRIVFRQLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBnaWZ0SFRUUC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnaWZ0SFRUUC5yZWFkeVN0YXRlID09PSA0ICYmIGdpZnRIVFRQLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGdpZnRIVFRQLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY3JlYXRlIGEgbmV3IGxpbmUgaW4gU0IgdGhhdCBzaG93cyBnaWZ0IHdhcyBzdWNjZXNzZnVsIHRvIGFja25vd2xlZGdlIGdpZnQgd29ya2VkL2ZhaWxlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfZ2lmdFN0YXR1c0VsZW0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2Q2hpbGQhLmFwcGVuZENoaWxkKG5ld0Rpdik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGdpZnQgc3VjY2VlZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NNc2cgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUG9pbnRzIEdpZnQgU3VjY2Vzc2Z1bDogVmFsdWU6ICcgKyBnaWZ0RmluYWxBbW91bnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuYXBwZW5kQ2hpbGQoc3VjY2Vzc01zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuY2xhc3NMaXN0LmFkZCgnbXBfc3VjY2VzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkTXNnID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BvaW50cyBHaWZ0IEZhaWxlZDogRXJyb3I6ICcgKyBqc29uLmVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGl2LmFwcGVuZENoaWxkKGZhaWxlZE1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdEaXYuY2xhc3NMaXN0LmFkZCgnbXBfZmFpbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2JmRGl2LnNjcm9sbFRvcCA9IHNiZkRpdi5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vYWZ0ZXIgd2UgYWRkIGxpbmUgaW4gU0IsIHNjcm9sbCB0byBib3R0b20gdG8gc2hvdyByZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICBzYmZEaXYuc2Nyb2xsVG9wID0gc2JmRGl2LnNjcm9sbEhlaWdodDtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZ2lmdEhUVFAuc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gdG8gbWFpbiBTQiB3aW5kb3cgYWZ0ZXIgZ2lmdCBpcyBjbGlja2VkIC0gdGhlc2UgYXJlIHR3byBzdGVwcyB0YWtlbiBieSBNQU0gd2hlbiBjbGlja2luZyBvdXQgb2YgTWVudVxyXG4gICAgICAgICAgICAgICAgc2JmRGl2XHJcbiAgICAgICAgICAgICAgICAgICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NiX2NsaWNrZWRfcm93JylbMF0hXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdzYk1lbnVNYWluJykhXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnc2JCb3R0b20gaGlkZU1lJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBnaWZ0QnV0dG9uLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykhLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVUb051bWJlcjogU3RyaW5nID0gKDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXBfZ2lmdFZhbHVlJylcclxuICAgICAgICAgICAgICAgICkpIS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBOdW1iZXIodmFsdWVUb051bWJlcikgPiAxMDAwIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgTnVtYmVyKHZhbHVlVG9OdW1iZXIpIDwgNSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTmFOKE51bWJlcih2YWx1ZVRvTnVtYmVyKSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdpZnRCdXR0b24ucXVlcnlTZWxlY3RvcignYnV0dG9uJykhLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2lmdEJ1dHRvbi5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSEuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEdpZnQgQnV0dG9uIGFkZGVkIWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBSZXBseSBidXR0b24gdG8gYmUgYWRkZWQgdG8gU2hvdXRcclxuICovXHJcbmNsYXNzIFJlcGx5U2ltcGxlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JlcGx5U2ltcGxlJyxcclxuICAgICAgICAvL3RhZzogXCJSZXBseVwiLFxyXG4gICAgICAgIGRlc2M6IGBQbGFjZXMgYSBSZXBseSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTQ7YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9yZXBseVNpbXBsZTogbnVtYmVyID0gMTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3Nob3V0Ym94JywgJ2hvbWUnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBQcm9jZXNzU2hvdXRzLndhdGNoU2hvdXRib3hSZXBseSh0aGlzLl90YXIsIHRoaXMuX3JlcGx5U2ltcGxlKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW00rXSBBZGRpbmcgUmVwbHkgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQWxsb3dzIFJlcGx5IFdpdGggUXVvdGUgYnV0dG9uIHRvIGJlIGFkZGVkIHRvIFNob3V0XHJcbiAqL1xyXG5jbGFzcyBSZXBseVF1b3RlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2hvdXRib3gsXHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ3JlcGx5UXVvdGUnLFxyXG4gICAgICAgIC8vdGFnOiBcIlJlcGx5IFdpdGggUXVvdGVcIixcclxuICAgICAgICBkZXNjOiBgUGxhY2VzIGEgUmVwbHkgd2l0aCBRdW90ZSBidXR0b24gaW4gU2hvdXRib3g6ICYjMTA1NTc7YCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcbiAgICBwcml2YXRlIF9yZXBseVF1b3RlOiBudW1iZXIgPSAyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnc2hvdXRib3gnLCAnaG9tZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIFByb2Nlc3NTaG91dHMud2F0Y2hTaG91dGJveFJlcGx5KHRoaXMuX3RhciwgdGhpcy5fcmVwbHlRdW90ZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFJlcGx5IHdpdGggUXVvdGUgQnV0dG9uLi4uYCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBmZWF0dXJlIGZvciBidWlsZGluZyBhIGxpYnJhcnkgb2YgcXVpY2sgc2hvdXQgaXRlbXMgdGhhdCBjYW4gYWN0IGFzIGEgY29weS9wYXN0ZSByZXBsYWNlbWVudC5cclxuICovXHJcbmNsYXNzIFF1aWNrU2hvdXQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5TaG91dGJveCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncXVpY2tTaG91dCcsXHJcbiAgICAgICAgZGVzYzogYENyZWF0ZSBmZWF0dXJlIGJlbG93IHNob3V0Ym94IHRvIHN0b3JlIHByZS1zZXQgbWVzc2FnZXMuYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcuc2JmIGRpdic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydzaG91dGJveCcsICdob21lJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtNK10gQWRkaW5nIFF1aWNrIFNob3V0IEJ1dHRvbnMuLi5gKTtcclxuICAgICAgICAvL2dldCB0aGUgbWFpbiBzaG91dGJveCBpbnB1dCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IHJlcGx5Qm94ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYm94X3RleHQnKTtcclxuICAgICAgICAvL2VtcHR5IEpTT04gd2FzIGdpdmluZyBtZSBpc3N1ZXMsIHNvIGRlY2lkZWQgdG8ganVzdCBtYWtlIGFuIGludHJvIGZvciB3aGVuIHRoZSBHTSB2YXJpYWJsZSBpcyBlbXB0eVxyXG4gICAgICAgIGxldCBqc29uTGlzdCA9IEpTT04ucGFyc2UoXHJcbiAgICAgICAgICAgIGB7IFwiSW50cm9cIjpcIldlbGNvbWUgdG8gUXVpY2tTaG91dCBNQU0rZXIhIEhlcmUgeW91IGNhbiBjcmVhdGUgcHJlc2V0IFNob3V0IG1lc3NhZ2VzIGZvciBxdWljayByZXNwb25zZXMgYW5kIGtub3dsZWRnZSBzaGFyaW5nLiAnQ2xlYXInIGNsZWFycyB0aGUgZW50cnkgdG8gc3RhcnQgc2VsZWN0aW9uIHByb2Nlc3Mgb3Zlci4gJ1NlbGVjdCcgdGFrZXMgd2hhdGV2ZXIgUXVpY2tTaG91dCBpcyBpbiB0aGUgVGV4dEFyZWEgYW5kIHB1dHMgaW4geW91ciBTaG91dCByZXNwb25zZSBhcmVhLiAnU2F2ZScgd2lsbCBzdG9yZSB0aGUgU2VsZWN0aW9uIE5hbWUgYW5kIFRleHQgQXJlYSBDb21ibyBmb3IgZnV0dXJlIHVzZSBhcyBhIFF1aWNrU2hvdXQsIGFuZCBoYXMgY29sb3IgaW5kaWNhdG9ycy4gR3JlZW4gPSBzYXZlZCBhcy1pcy4gWWVsbG93ID0gUXVpY2tTaG91dCBOYW1lIGV4aXN0cyBhbmQgaXMgc2F2ZWQsIGJ1dCBjb250ZW50IGRvZXMgbm90IG1hdGNoIHdoYXQgaXMgc3RvcmVkLiBPcmFuZ2UgPSBubyBlbnRyeSBtYXRjaGluZyB0aGF0IG5hbWUsIG5vdCBzYXZlZC4gJ0RlbGV0ZScgd2lsbCBwZXJtYW5lbnRseSByZW1vdmUgdGhhdCBlbnRyeSBmcm9tIHlvdXIgc3RvcmVkIFF1aWNrU2hvdXRzIChidXR0b24gb25seSBzaG93cyB3aGVuIGV4aXN0cyBpbiBzdG9yYWdlKS4gRm9yIG5ldyBlbnRyaWVzIGhhdmUgeW91ciBRdWlja1Nob3V0IE5hbWUgdHlwZWQgaW4gQkVGT1JFIHlvdSBjcmFmdCB5b3VyIHRleHQgb3IgcmlzayBpdCBiZWluZyBvdmVyd3JpdHRlbiBieSBzb21ldGhpbmcgdGhhdCBleGlzdHMgYXMgeW91IHR5cGUgaXQuIFRoYW5rcyBmb3IgdXNpbmcgTUFNKyFcIiB9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy9nZXQgU2hvdXRib3ggRElWXHJcbiAgICAgICAgY29uc3Qgc2hvdXRCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnBTaG91dCcpO1xyXG4gICAgICAgIC8vZ2V0IHRoZSBmb290ZXIgd2hlcmUgd2Ugd2lsbCBpbnNlcnQgb3VyIGZlYXR1cmVcclxuICAgICAgICBjb25zdCBzaG91dEZvb3QgPSA8SFRNTEVsZW1lbnQ+c2hvdXRCb3ghLnF1ZXJ5U2VsZWN0b3IoJy5ibG9ja0Zvb3QnKTtcclxuICAgICAgICAvL2dpdmUgaXQgYW4gSUQgYW5kIHNldCB0aGUgc2l6ZVxyXG4gICAgICAgIHNob3V0Rm9vdCEuc2V0QXR0cmlidXRlKCdpZCcsICdtcF9ibG9ja0Zvb3QnKTtcclxuICAgICAgICBzaG91dEZvb3QhLnN0eWxlLmhlaWdodCA9ICcyLjVlbSc7XHJcbiAgICAgICAgLy9jcmVhdGUgYSBuZXcgZGl2ZSB0byBob2xkIG91ciBjb21ib0JveCBhbmQgYnV0dG9ucyBhbmQgc2V0IHRoZSBzdHlsZSBmb3IgZm9ybWF0dGluZ1xyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUuZmxvYXQgPSAnbGVmdCc7XHJcbiAgICAgICAgY29tYm9Cb3hEaXYuc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LnN0eWxlLm1hcmdpbkJvdHRvbSA9ICcuNWVtJztcclxuICAgICAgICBjb21ib0JveERpdi5zdHlsZS5tYXJnaW5Ub3AgPSAnLjVlbSc7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGxhYmVsIHRleHQgZWxlbWVudCBhbmQgYWRkIHRoZSB0ZXh0IGFuZCBhdHRyaWJ1dGVzIGZvciBJRFxyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIGNvbWJvQm94TGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCAncXVpY2tTaG91dERhdGEnKTtcclxuICAgICAgICBjb21ib0JveExhYmVsLmlubmVyVGV4dCA9ICdDaG9vc2UgYSBRdWlja1Nob3V0JztcclxuICAgICAgICBjb21ib0JveExhYmVsLnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMYWJlbCcpO1xyXG4gICAgICAgIC8vY3JlYXRlIHRoZSBpbnB1dCBmaWVsZCB0byBsaW5rIHRvIGRhdGFsaXN0IGFuZCBmb3JtYXQgc3R5bGVcclxuICAgICAgICBjb25zdCBjb21ib0JveElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBjb21ib0JveElucHV0LnN0eWxlLm1hcmdpbkxlZnQgPSAnLjVlbSc7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21wX2NvbWJvQm94SW5wdXQnKTtcclxuICAgICAgICAvL2NyZWF0ZSBhIGRhdGFsaXN0IHRvIHN0b3JlIG91ciBxdWlja3Nob3V0c1xyXG4gICAgICAgIGNvbnN0IGNvbWJvQm94TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RhdGFsaXN0Jyk7XHJcbiAgICAgICAgY29tYm9Cb3hMaXN0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbXBfY29tYm9Cb3hMaXN0Jyk7XHJcbiAgICAgICAgLy9pZiB0aGUgR00gdmFyaWFibGUgZXhpc3RzXHJcbiAgICAgICAgaWYgKEdNX2dldFZhbHVlKCdtcF9xdWlja1Nob3V0JykpIHtcclxuICAgICAgICAgICAgLy9vdmVyd3JpdGUganNvbkxpc3QgdmFyaWFibGUgd2l0aCBwYXJzZWQgZGF0YVxyXG4gICAgICAgICAgICBqc29uTGlzdCA9IEpTT04ucGFyc2UoR01fZ2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnKSk7XHJcbiAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGl0ZW1cclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgYSBuZXcgT3B0aW9uIGVsZW1lbnQgYW5kIGFkZCBvdXIgZGF0YSBmb3IgZGlzcGxheSB0byB1c2VyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21ib0JveE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hPcHRpb24udmFsdWUgPSBrZXkucmVwbGFjZSgv4LKgL2csICcgJyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy9pZiBubyBHTSB2YXJpYWJsZVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIHZhcmlhYmxlIHdpdGggb3V0IEludHJvIGRhdGFcclxuICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpdGVtXHJcbiAgICAgICAgICAgIC8vIFRPRE86IHByb2JhYmx5IGNhbiBnZXQgcmlkIG9mIHRoZSBmb3JFYWNoIGFuZCBqdXN0IGRvIHNpbmdsZSBleGVjdXRpb24gc2luY2Ugd2Uga25vdyB0aGlzIGlzIEludHJvIG9ubHlcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgIGNvbWJvQm94T3B0aW9uLnZhbHVlID0ga2V5LnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmFwcGVuZENoaWxkKGNvbWJvQm94T3B0aW9uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2FwcGVuZCB0aGUgYWJvdmUgZWxlbWVudHMgdG8gb3VyIERJViBmb3IgdGhlIGNvbWJvIGJveFxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGFiZWwpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94SW5wdXQpO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNvbWJvQm94TGlzdCk7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGNsZWFyIGJ1dHRvbiBhbmQgYWRkIHN0eWxlXHJcbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcclxuICAgICAgICBjbGVhckJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgY2xlYXJCdXR0b24uaW5uZXJIVE1MID0gJ0NsZWFyJztcclxuICAgICAgICAvL2NyZWF0ZSBkZWxldGUgYnV0dG9uLCBhZGQgc3R5bGUsIGFuZCB0aGVuIGhpZGUgaXQgZm9yIGxhdGVyIHVzZVxyXG4gICAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzZlbSc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdSZWQnO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5pbm5lckhUTUwgPSAnREVMRVRFJztcclxuICAgICAgICAvL2NyZWF0ZSBzZWxlY3QgYnV0dG9uIGFuZCBzdHlsZSBpdFxyXG4gICAgICAgIGNvbnN0IHNlbGVjdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5zdHlsZS5tYXJnaW5MZWZ0ID0gJzFlbSc7XHJcbiAgICAgICAgc2VsZWN0QnV0dG9uLmlubmVySFRNTCA9ICdcXHUyMTkxIFNlbGVjdCc7XHJcbiAgICAgICAgLy9jcmVhdGUgc2F2ZSBidXR0b24gYW5kIHN0eWxlIGl0XHJcbiAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIHNhdmVCdXR0b24uc3R5bGUubWFyZ2luTGVmdCA9ICcxZW0nO1xyXG4gICAgICAgIHNhdmVCdXR0b24uaW5uZXJIVE1MID0gJ1NhdmUnO1xyXG4gICAgICAgIC8vYWRkIGFsbCA0IGJ1dHRvbnMgdG8gdGhlIGNvbWJvQm94IERJVlxyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGNsZWFyQnV0dG9uKTtcclxuICAgICAgICBjb21ib0JveERpdi5hcHBlbmRDaGlsZChzZWxlY3RCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKHNhdmVCdXR0b24pO1xyXG4gICAgICAgIGNvbWJvQm94RGl2LmFwcGVuZENoaWxkKGRlbGV0ZUJ1dHRvbik7XHJcbiAgICAgICAgLy9jcmVhdGUgb3VyIHRleHQgYXJlYSBhbmQgc3R5bGUgaXQsIHRoZW4gaGlkZSBpdFxyXG4gICAgICAgIGNvbnN0IHF1aWNrU2hvdXRUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5oZWlnaHQgPSAnNTAlJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5tYXJnaW4gPSAnMWVtJztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS53aWR0aCA9ICc5NyUnO1xyXG4gICAgICAgIHF1aWNrU2hvdXRUZXh0LmlkID0gJ21wX3F1aWNrU2hvdXRUZXh0JztcclxuICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvL2V4ZWN1dGVzIHdoZW4gY2xpY2tpbmcgc2VsZWN0IGJ1dHRvblxyXG4gICAgICAgIHNlbGVjdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIHNvbWV0aGluZyBpbnNpZGUgb2YgdGhlIHF1aWNrc2hvdXQgYXJlYVxyXG4gICAgICAgICAgICAgICAgaWYgKHF1aWNrU2hvdXRUZXh0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9wdXQgdGhlIHRleHQgaW4gdGhlIG1haW4gc2l0ZSByZXBseSBmaWVsZCBhbmQgZm9jdXMgb24gaXRcclxuICAgICAgICAgICAgICAgICAgICByZXBseUJveC52YWx1ZSA9IHF1aWNrU2hvdXRUZXh0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5Qm94LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgYSBxdWlja1Nob3V0IGRlbGV0ZSBidXR0b25cclxuICAgICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGlzIGlzIG5vdCB0aGUgbGFzdCBxdWlja1Nob3V0XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoanNvbkxpc3QpLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSB0aGUgZW50cnkgZnJvbSB0aGUgSlNPTiBhbmQgdXBkYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUganNvbkxpc3RbY29tYm9Cb3hJbnB1dC52YWx1ZS5yZXBsYWNlKC8gL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoJ21wX3F1aWNrU2hvdXQnLCBKU09OLnN0cmluZ2lmeShqc29uTGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBvcHRpb25zIGZyb20gZGF0YWxpc3QgdG8gcmVzZXQgd2l0aCBuZXdseSBjcmVhdGVkIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgY29tYm9Cb3hMaXN0LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZm9yIGVhY2ggaXRlbSBpbiBuZXcganNvbkxpc3RcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqc29uTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbmV3IG9wdGlvbiBlbGVtZW50IHRvIGFkZCB0byBsaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJvQm94T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBjdXJyZW50IGtleSB2YWx1ZSB0byB0aGUgZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgZWxlbWVudCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGxhc3QgaXRlbSBpbiB0aGUganNvbmxpc3RcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgaXRlbSBmcm9tIGpzb25MaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGpzb25MaXN0W2NvbWJvQm94SW5wdXQudmFsdWUucmVwbGFjZSgv4LKgL2csICfgsqAnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZW50aXJlIHZhcmlhYmxlIHNvIGl0cyBub3QgZW1wdHkgR00gdmFyaWFibGVcclxuICAgICAgICAgICAgICAgICAgICBHTV9kZWxldGVWYWx1ZSgnbXBfcXVpY2tTaG91dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmUtc3R5bGUgdGhlIHNhdmUgYnV0dG9uIGZvciBuZXcgdW5zYXZlZCBzdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdHcmVlbic7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5jb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uIG5vdyB0aGF0IGl0cyBub3QgYSBzYXZlZCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vY3JlYXRlIGV2ZW50IG9uIHNhdmUgYnV0dG9uIHRvIHNhdmUgcXVpY2tzaG91dFxyXG4gICAgICAgIHNhdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBkYXRhIGluIHRoZSBrZXkgYW5kIHZhbHVlIEdVSSBmaWVsZHMsIHByb2NlZWRcclxuICAgICAgICAgICAgICAgIGlmIChxdWlja1Nob3V0VGV4dC52YWx1ZSAmJiBjb21ib0JveElucHV0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy93YXMgaGF2aW5nIGlzc3VlIHdpdGggZXZhbCBwcm9jZXNzaW5nIHRoZSAucmVwbGFjZSBkYXRhIHNvIG1hZGUgYSB2YXJpYWJsZSB0byBpbnRha2UgaXRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlZFRleHQgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZnVuIHdheSB0byBkeW5hbWljYWxseSBjcmVhdGUgc3RhdGVtZW50cyAtIHRoaXMgdGFrZXMgd2hhdGV2ZXIgaXMgaW4gbGlzdCBmaWVsZCB0byBjcmVhdGUgYSBrZXkgd2l0aCB0aGF0IHRleHQgYW5kIHRoZSB2YWx1ZSBmcm9tIHRoZSB0ZXh0YXJlYVxyXG4gICAgICAgICAgICAgICAgICAgIGV2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGBqc29uTGlzdC5gICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VkVGV4dCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgPSBcImAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHF1aWNrU2hvdXRUZXh0LnZhbHVlKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgXCI7YFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9vdmVyd3JpdGUgb3IgY3JlYXRlIHRoZSBHTSB2YXJpYWJsZSB3aXRoIG5ldyBqc29uTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKCdtcF9xdWlja1Nob3V0JywgSlNPTi5zdHJpbmdpZnkoanNvbkxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3JlLXN0eWxlIHNhdmUgYnV0dG9uIHRvIGdyZWVuIG5vdyB0aGF0IGl0cyBzYXZlZCBhcy1pc1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ0dyZWVuJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IGRlbGV0ZSBidXR0b24gbm93IHRoYXQgaXRzIGEgc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGV4aXN0aW5nIGRhdGFsaXN0IGVsZW1lbnRzIHRvIHJlYnVpbGQgd2l0aCBuZXcganNvbmxpc3RcclxuICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaW4gdGhlIGpzb25saXN0XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoanNvbkxpc3QpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSBuZXcgb3B0aW9uIGVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tYm9Cb3hPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQga2V5IG5hbWUgdG8gdGhlIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGtleS5yZXBsYWNlKC/gsqAvZywgJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiB0aGlzIG1heSBvciBtYXkgbm90IGJlIG5lY2Vzc2FyeSwgYnV0IHdhcyBoYXZpbmcgaXNzdWVzIHdpdGggdGhlIHVuaXF1ZSBzeW1ib2wgc3RpbGwgcmFuZG9tbHkgc2hvd2luZyB1cCBhZnRlciBzYXZlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveE9wdGlvbi52YWx1ZSA9IGNvbWJvQm94T3B0aW9uLnZhbHVlLnJlcGxhY2UoL+CyoC9nLCAnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2FkZCB0byB0aGUgbGlzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjb21ib0JveE9wdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21ib0JveExpc3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vYWRkIGV2ZW50IGZvciBjbGVhciBidXR0b24gdG8gcmVzZXQgdGhlIGRhdGFsaXN0XHJcbiAgICAgICAgY2xlYXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9jbGVhciB0aGUgaW5wdXQgZmllbGQgYW5kIHRleHRhcmVhIGZpZWxkXHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgaW5wdXQgZXZlbnQgb24gaW5wdXQgdG8gZm9yY2Ugc29tZSB1cGRhdGVzIGFuZCBkaXNwYXRjaCBpdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgICAgICBjb21ib0JveElucHV0LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vTmV4dCB0d28gaW5wdXQgZnVuY3Rpb25zIGFyZSBtZWF0IGFuZCBwb3RhdG9lcyBvZiB0aGUgbG9naWMgZm9yIHVzZXIgZnVuY3Rpb25hbGl0eVxyXG5cclxuICAgICAgICAvL3doZW5ldmVyIHNvbWV0aGluZyBpcyB0eXBlZCBvciBjaGFuZ2VkIHdoaXRoaW4gdGhlIGlucHV0IGZpZWxkXHJcbiAgICAgICAgY29tYm9Cb3hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAnaW5wdXQnLFxyXG4gICAgICAgICAgICBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGlzIGJsYW5rXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSB0ZXh0YXJlYSBpcyBhbHNvIGJsYW5rIG1pbmltaXplIHJlYWwgZXN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFxdWlja1Nob3V0VGV4dC52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIHRleHQgYXJlYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NocmluayB0aGUgZm9vdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzIuNWVtJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZS1zdHlsZSB0aGUgc2F2ZSBidXR0b24gdG8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgc29tZXRoaW5nIGlzIHN0aWxsIGluIHRoZSB0ZXh0YXJlYSB3ZSBuZWVkIHRvIGluZGljYXRlIHRoYXQgdW5zYXZlZCBhbmQgdW5uYW1lZCBkYXRhIGlzIHRoZXJlXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zdHlsZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZCBpcyBvcmdhbmdlIHNhdmUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvL2VpdGhlciB3YXksIGhpZGUgdGhlIGRlbGV0ZSBidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIGlucHV0IGZpZWxkIGhhcyBhbnkgdGV4dCBpbiBpdFxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vc2hvdyB0aGUgdGV4dCBhcmVhIGZvciBpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAvL2V4cGFuZCB0aGUgZm9vdGVyIHRvIGFjY29tb2RhdGUgYWxsIGZlYXR1cmUgYXNwZWN0c1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3V0Rm9vdCEuc3R5bGUuaGVpZ2h0ID0gJzExZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgd2hhdCBpcyBpbiB0aGUgaW5wdXQgZmllbGQgaXMgYSBzYXZlZCBlbnRyeSBrZXlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbkxpc3RbaW5wdXRWYWxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBjYW4gYmUgYSBzdWNreSBsaW5lIG9mIGNvZGUgYmVjYXVzZSBpdCBjYW4gd2lwZSBvdXQgdW5zYXZlZCBkYXRhLCBidXQgaSBjYW5ub3QgdGhpbmsgb2YgYmV0dGVyIHdheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlcGxhY2UgdGhlIHRleHQgYXJlYSBjb250ZW50cyB3aXRoIHdoYXQgdGhlIHZhbHVlIGlzIGluIHRoZSBtYXRjaGVkIHBhaXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVpY2tTaG91dFRleHQudmFsdWUgPSBqc29uTGlzdFtKU09OLnBhcnNlKGlucHV0VmFsKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1aWNrU2hvdXRUZXh0LnZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Nob3cgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBpcyBub3cgZXhhY3QgbWF0Y2ggdG8gc2F2ZWQgZW50cnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHNhdmUgYnV0dG9uIHRvIHNob3cgaXRzIGEgc2F2ZWQgY29tYm9cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaWYgdGhpcyBpcyBub3QgYSByZWdpc3RlcmVkIGtleSBuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZXN0eWxlIHRoZSBzYXZlIGJ1dHRvbiB0byBiZSBhbiB1bnNhdmVkIGVudHJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ09yYW5nZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGRlbGV0ZSBidXR0b24gc2luY2UgdGhpcyBjYW5ub3QgYmUgc2F2ZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vd2hlbmV2ZXIgc29tZXRoaW5nIGlzIHR5cGVkIG9yIGRlbGV0ZWQgb3V0IG9mIHRleHRhcmVhXHJcbiAgICAgICAgcXVpY2tTaG91dFRleHQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgJ2lucHV0JyxcclxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBjb21ib0JveElucHV0LnZhbHVlLnJlcGxhY2UoLyAvZywgJ+CyoCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIGlucHV0IGZpZWxkIGlzIGJsYW5rXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbWJvQm94SW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gZm9yIHVuc2F2ZWQgYW5kIHVubmFtZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdPcmFuZ2UnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBkZWxldGUgYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2lmIGlucHV0IGZpZWxkIGhhcyB0ZXh0IGluIGl0XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBqc29uTGlzdFtpbnB1dFZhbF0gJiZcclxuICAgICAgICAgICAgICAgICAgICBxdWlja1Nob3V0VGV4dC52YWx1ZSAhPT0gZGVjb2RlVVJJQ29tcG9uZW50KGpzb25MaXN0W2lucHV0VmFsXSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vcmVzdHlsZSBzYXZlIGJ1dHRvbiBhcyB5ZWxsb3cgZm9yIGVkaXR0ZWRcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdZZWxsb3cnO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnQmxhY2snO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiB0aGUga2V5IGlzIGEgbWF0Y2ggYW5kIHRoZSBkYXRhIGlzIGEgbWF0Y2ggdGhlbiB3ZSBoYXZlIGEgMTAwJSBzYXZlZCBlbnRyeSBhbmQgY2FuIHB1dCBldmVyeXRoaW5nIGJhY2sgdG8gc2F2ZWRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAganNvbkxpc3RbaW5wdXRWYWxdICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcXVpY2tTaG91dFRleHQudmFsdWUgPT09IGRlY29kZVVSSUNvbXBvbmVudChqc29uTGlzdFtpbnB1dFZhbF0pXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAvL3Jlc3R5bGUgc2F2ZSBidXR0b24gdG8gZ3JlZW4gZm9yIHNhdmVkXHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnR3JlZW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmVCdXR0b24uc3R5bGUuY29sb3IgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIGtleSBpcyBub3QgZm91bmQgaW4gdGhlIHNhdmVkIGxpc3QsIG9yYW5nZSBmb3IgdW5zYXZlZCBhbmQgdW5uYW1lZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghanNvbkxpc3RbaW5wdXRWYWxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnT3JhbmdlJztcclxuICAgICAgICAgICAgICAgICAgICBzYXZlQnV0dG9uLnN0eWxlLmNvbG9yID0gJ0JsYWNrJztcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vYWRkIHRoZSBjb21ib2JveCBhbmQgdGV4dCBhcmVhIGVsZW1lbnRzIHRvIHRoZSBmb290ZXJcclxuICAgICAgICBzaG91dEZvb3QuYXBwZW5kQ2hpbGQoY29tYm9Cb3hEaXYpO1xyXG4gICAgICAgIHNob3V0Rm9vdC5hcHBlbmRDaGlsZChxdWlja1Nob3V0VGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzaGFyZWQudHNcIiAvPlxyXG4vKipcclxuICogI0JST1dTRSBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBTbmF0Y2hlZCB0b3JyZW50cyB0byBiZSBoaWRkZW4vc2hvd25cclxuICovXHJcbmNsYXNzIFRvZ2dsZVNuYXRjaGVkIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVTbmF0Y2hlZCcsXHJcbiAgICAgICAgZGVzYzogYEFkZCBhIGJ1dHRvbiB0byBoaWRlL3Nob3cgcmVzdWx0cyB0aGF0IHlvdSd2ZSBzbmF0Y2hlZGAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9pc1Zpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MVGFibGVSb3dFbGVtZW50PiB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX3NuYXRjaGVkSG9vazogc3RyaW5nID0gJ3RkIGRpdltjbGFzc149XCJicm93c2VcIl0nO1xyXG4gICAgcHJpdmF0ZSBfc2hhcmU6IFNoYXJlZCA9IG5ldyBTaGFyZWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGxldCB0b2dnbGU6IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xyXG4gICAgICAgIGxldCByZXN1bHRzOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+O1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZFN0YXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZShcclxuICAgICAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHN0b3JlZFN0YXRlID09PSAnZmFsc2UnICYmIEdNX2dldFZhbHVlKCdzdGlja3lTbmF0Y2hlZFRvZ2dsZScpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFZpc1N0YXRlKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVRleHQ6IHN0cmluZyA9IHRoaXMuX2lzVmlzaWJsZSA/ICdIaWRlIFNuYXRjaGVkJyA6ICdTaG93IFNuYXRjaGVkJztcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHRvZ2dsZSA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3NuYXRjaGVkVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVRleHQsXHJcbiAgICAgICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICAgICAgJyNyZXNldE5ld0ljb24nLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGJhc2VkIG9uIHZpcyBzdGF0ZVxyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1Zpc2libGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0hpZGUgU25hdGNoZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0VmlzU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyUmVzdWx0cyhyZXN1bHRzLCB0aGlzLl9zbmF0Y2hlZEhvb2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJlc3VsdExpc3RcclxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSByZXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBBZGRlZCB0aGUgVG9nZ2xlIFNuYXRjaGVkIGJ1dHRvbiEnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRMaXN0LnRoZW4oYXN5bmMgKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2hMaXN0ID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJSZXN1bHRzKHJlc3VsdHMsIHRoaXMuX3NuYXRjaGVkSG9vayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWx0ZXJzIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0gbGlzdCBhIHNlYXJjaCByZXN1bHRzIGxpc3RcclxuICAgICAqIEBwYXJhbSBzdWJUYXIgdGhlIGVsZW1lbnRzIHRoYXQgbXVzdCBiZSBjb250YWluZWQgaW4gb3VyIGZpbHRlcmVkIHJlc3VsdHNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZmlsdGVyUmVzdWx0cyhsaXN0OiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+LCBzdWJUYXI6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaCgoc25hdGNoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0bjogSFRNTEhlYWRpbmdFbGVtZW50ID0gPEhUTUxIZWFkaW5nRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc25hdGNoZWRUb2dnbGUnKSFcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNlbGVjdCBvbmx5IHRoZSBpdGVtcyB0aGF0IG1hdGNoIG91ciBzdWIgZWxlbWVudFxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBzbmF0Y2gucXVlcnlTZWxlY3RvcihzdWJUYXIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSGlkZS9zaG93IGFzIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNWaXNpYmxlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnU2hvdyBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSGlkZSBTbmF0Y2hlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hdGNoLnN0eWxlLmRpc3BsYXkgPSAndGFibGUtcm93JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFZpc1N0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU25hdGNoIHZpcyBzdGF0ZTonLCB0aGlzLl9pc1Zpc2libGUsICdcXG52YWw6JywgdmFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgR01fc2V0VmFsdWUoYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgLCBgJHt2YWx9YCk7XHJcbiAgICAgICAgdGhpcy5faXNWaXNpYmxlID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc2VhcmNoTGlzdCgpOiBOb2RlTGlzdE9mPEhUTUxUYWJsZVJvd0VsZW1lbnQ+IHtcclxuICAgICAgICBpZiAodGhpcy5fc2VhcmNoTGlzdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2VhcmNobGlzdCBpcyB1bmRlZmluZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlYXJjaExpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzVmlzaWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdmlzaWJsZSh2YWw6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9zZXRWaXNTdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmVtZW1iZXJzIHRoZSBzdGF0ZSBvZiBUb2dnbGVTbmF0Y2hlZCBiZXR3ZWVuIHBhZ2UgbG9hZHNcclxuICovXHJcbmNsYXNzIFN0aWNreVNuYXRjaGVkVG9nZ2xlIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzdGlja3lTbmF0Y2hlZFRvZ2dsZScsXHJcbiAgICAgICAgZGVzYzogYE1ha2UgdG9nZ2xlIHN0YXRlIHBlcnNpc3QgYmV0d2VlbiBwYWdlIGxvYWRzYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ2Jyb3dzZSddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFJlbWVtYmVyZWQgc25hdGNoIHZpc2liaWxpdHkgc3RhdGUhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgYSBwbGFpbnRleHQgbGlzdCBvZiBzZWFyY2ggcmVzdWx0c1xyXG4gKi9cclxuY2xhc3MgUGxhaW50ZXh0U2VhcmNoIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdwbGFpbnRleHRTZWFyY2gnLFxyXG4gICAgICAgIGRlc2M6IGBJbnNlcnQgcGxhaW50ZXh0IHNlYXJjaCByZXN1bHRzIGF0IHRvcCBvZiBwYWdlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjc3NyIGgxJztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCA9IEdNX2dldFZhbHVlKFxyXG4gICAgICAgIGAke3RoaXMuX3NldHRpbmdzLnRpdGxlfVN0YXRlYFxyXG4gICAgKTtcclxuICAgIHByaXZhdGUgX3NoYXJlOiBTaGFyZWQgPSBuZXcgU2hhcmVkKCk7XHJcbiAgICBwcml2YXRlIF9wbGFpblRleHQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHRvZ2dsZUJ0bjogUHJvbWlzZTxIVE1MRWxlbWVudD47XHJcbiAgICAgICAgbGV0IGNvcHlCdG46IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIGxldCByZXN1bHRMaXN0OiBQcm9taXNlPE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD4+O1xyXG5cclxuICAgICAgICAvLyBRdWV1ZSBidWlsZGluZyB0aGUgdG9nZ2xlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHRvZ2dsZUJ0biA9IFV0aWwuY3JlYXRlQnV0dG9uKFxyXG4gICAgICAgICAgICAgICAgJ3BsYWluVG9nZ2xlJyxcclxuICAgICAgICAgICAgICAgICdTaG93IFBsYWludGV4dCcsXHJcbiAgICAgICAgICAgICAgICAnZGl2JyxcclxuICAgICAgICAgICAgICAgICcjc3NyJyxcclxuICAgICAgICAgICAgICAgICdiZWZvcmViZWdpbicsXHJcbiAgICAgICAgICAgICAgICAnbXBfdG9nZ2xlIG1wX3BsYWluQnRuJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICAgICAgKHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cclxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICAgICAncGxhaW5Db3B5JyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9zaGFyZS5nZXRTZWFyY2hMaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlzdC50aGVuKGFzeW5jIChyZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHBsYWludGV4dCByZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWluVGV4dCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3NSZXN1bHRzKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLm1wX3BsYWludGV4dFNlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSEuaW5uZXJIVE1MID0gdGhpcy5fcGxhaW5UZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0IG9wZW4gc3RhdGVcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodGhpcy5faXNPcGVuKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIHRvZ2dsZSBidXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgICAgIHRvZ2dsZUJ0blxyXG4gICAgICAgICAgICAudGhlbigoYnRuKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGV4dGJveCBzaG91bGQgZXhpc3QsIGJ1dCBqdXN0IGluIGNhc2UuLi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dGJveDogSFRNTFRleHRBcmVhRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Ym94ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRleHRib3ggZG9lc24ndCBleGlzdCFgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc09wZW4gPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnSGlkZSBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKCdmYWxzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnRuLmlubmVyVGV4dCA9ICdTaG93IFBsYWludGV4dCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBJbnNlcnRlZCBwbGFpbnRleHQgc2VhcmNoIHJlc3VsdHMhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIE9wZW4gU3RhdGUgdG8gdHJ1ZS9mYWxzZSBpbnRlcm5hbGx5IGFuZCBpbiBzY3JpcHQgc3RvcmFnZVxyXG4gICAgICogQHBhcmFtIHZhbCBzdHJpbmdpZmllZCBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldE9wZW5TdGF0ZSh2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsID0gJ2ZhbHNlJztcclxuICAgICAgICB9IC8vIERlZmF1bHQgdmFsdWVcclxuICAgICAgICBHTV9zZXRWYWx1ZSgndG9nZ2xlU25hdGNoZWRTdGF0ZScsIHZhbCk7XHJcbiAgICAgICAgdGhpcy5faXNPcGVuID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX3Byb2Nlc3NSZXN1bHRzKFxyXG4gICAgICAgIHJlc3VsdHM6IE5vZGVMaXN0T2Y8SFRNTFRhYmxlUm93RWxlbWVudD5cclxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcclxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXHJcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xyXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xyXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XHJcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNPcGVuKCk6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc09wZW47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGlzT3Blbih2YWw6ICd0cnVlJyB8ICdmYWxzZScgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUodmFsKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFsbG93cyB0aGUgc2VhcmNoIGZlYXR1cmVzIHRvIGJlIGhpZGRlbi9zaG93blxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlU2VhcmNoYm94IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVTZWFyY2hib3gnLFxyXG4gICAgICAgIGRlc2M6IGBDb2xsYXBzZSB0aGUgU2VhcmNoIGJveCBhbmQgbWFrZSBpdCB0b2dnbGVhYmxlYCxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjdG9yU2VhcmNoQ29udHJvbCc7XHJcbiAgICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyA9ICcyNnB4JztcclxuICAgIHByaXZhdGUgX2lzT3BlbjogJ3RydWUnIHwgJ2ZhbHNlJyA9ICdmYWxzZSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCBzZWFyY2hib3g6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBpZiAoc2VhcmNoYm94KSB7XHJcbiAgICAgICAgICAgIC8vIEFkanVzdCB0aGUgdGl0bGUgdG8gbWFrZSBpdCBjbGVhciBpdCBpcyBhIHRvZ2dsZSBidXR0b25cclxuICAgICAgICAgICAgY29uc3QgdGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IHNlYXJjaGJveC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJy5ibG9ja0hlYWRDb24gaDQnXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmICh0aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHRleHQgJiBzdHlsZVxyXG4gICAgICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gJ1RvZ2dsZSBTZWFyY2gnO1xyXG4gICAgICAgICAgICAgICAgdGl0bGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgICAgICAgICAgLy8gU2V0IHVwIGNsaWNrIGxpc3RlbmVyXHJcbiAgICAgICAgICAgICAgICB0aXRsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl90b2dnbGUoc2VhcmNoYm94ISk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBzZXQgdXAgdG9nZ2xlISBUYXJnZXQgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDb2xsYXBzZSB0aGUgc2VhcmNoYm94XHJcbiAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZWFyY2hib3gsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiBgaGVpZ2h0OiR7dGhpcy5faGVpZ2h0fTtvdmVyZmxvdzpoaWRkZW47YCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIEhpZGUgZXh0cmEgdGV4dFxyXG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb246IEhUTUxIZWFkaW5nRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgJyNtYWluQm9keSA+IGgzJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBndWlkZUxpbms6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAnI21haW5Cb2R5ID4gaDMgfiBhJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uKSBub3RpZmljYXRpb24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgaWYgKGd1aWRlTGluaykgZ3VpZGVMaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW00rXSBDb2xsYXBzZWQgdGhlIFNlYXJjaCBib3ghJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNvbGxhcHNlIFNlYXJjaCBib3ghIFRhcmdldCBkb2VzIG5vdCBleGlzdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF90b2dnbGUoZWxlbTogSFRNTERpdkVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gJ3Vuc2V0JztcclxuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gJ3RydWUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSAnZmFsc2UnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdUb2dnbGVkIFNlYXJjaCBib3ghJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogKiBHZW5lcmF0ZXMgbGlua2VkIHRhZ3MgZnJvbSB0aGUgc2l0ZSdzIHBsYWludGV4dCB0YWcgZmllbGRcclxuICovXHJcbmNsYXNzIEJ1aWxkVGFncyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlNlYXJjaCxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnYnVpbGRUYWdzJyxcclxuICAgICAgICBkZXNjOiBgR2VuZXJhdGUgY2xpY2thYmxlIFRhZ3MgYXV0b21hdGljYWxseWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcbiAgICBwcml2YXRlIF9zaGFyZTogU2hhcmVkID0gbmV3IFNoYXJlZCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsnYnJvd3NlJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHNMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG5cclxuICAgICAgICAvLyBCdWlsZCB0aGUgdGFnc1xyXG4gICAgICAgIHJlc3VsdHNMaXN0XHJcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLmZvckVhY2goKHIpID0+IHRoaXMuX3Byb2Nlc3NUYWdTdHJpbmcocikpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQnVpbHQgdGFnIGxpbmtzIScpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBPYnNlcnZlIHRoZSBTZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgQ2hlY2suZWxlbU9ic2VydmVyKCcjc3NyJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNMaXN0ID0gdGhpcy5fc2hhcmUuZ2V0U2VhcmNoTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNMaXN0LnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHRhZ3MgYWdhaW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5mb3JFYWNoKChyKSA9PiB0aGlzLl9wcm9jZXNzVGFnU3RyaW5nKHIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gQnVpbHQgdGFnIGxpbmtzIScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBDb2RlIHRvIHJ1biBmb3IgZXZlcnkgc2VhcmNoIHJlc3VsdFxyXG4gICAgICogQHBhcmFtIHJlcyBBIHNlYXJjaCByZXN1bHQgcm93XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Byb2Nlc3NUYWdTdHJpbmcgPSAocmVzOiBIVE1MVGFibGVSb3dFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGFnbGluZSA9IDxIVE1MU3BhbkVsZW1lbnQ+cmVzLnF1ZXJ5U2VsZWN0b3IoJy50b3JSb3dEZXNjJyk7XHJcblxyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cCh0YWdsaW5lKTtcclxuXHJcbiAgICAgICAgLy8gQXNzdW1lIGJyYWNrZXRzIGNvbnRhaW4gdGFnc1xyXG4gICAgICAgIGxldCB0YWdTdHJpbmcgPSB0YWdsaW5lLmlubmVySFRNTC5yZXBsYWNlKC8oPzpcXFt8XFxdfFxcKHxcXCl8JCkvZ2ksICcsJyk7XHJcbiAgICAgICAgLy8gUmVtb3ZlIEhUTUwgRW50aXRpZXMgYW5kIHR1cm4gdGhlbSBpbnRvIGJyZWFrc1xyXG4gICAgICAgIHRhZ1N0cmluZyA9IHRhZ1N0cmluZy5zcGxpdCgvKD86Ji57MSw1fTspL2cpLmpvaW4oJzsnKTtcclxuICAgICAgICAvLyBTcGxpdCB0YWdzIGF0ICcsJyBhbmQgJzsnIGFuZCAnPicgYW5kICd8J1xyXG4gICAgICAgIGxldCB0YWdzID0gdGFnU3RyaW5nLnNwbGl0KC9cXHMqKD86O3wsfD58XFx8fCQpXFxzKi8pO1xyXG4gICAgICAgIC8vIFJlbW92ZSBlbXB0eSBvciBsb25nIHRhZ3NcclxuICAgICAgICB0YWdzID0gdGFncy5maWx0ZXIoKHRhZykgPT4gdGFnLmxlbmd0aCA8PSAzMCAmJiB0YWcubGVuZ3RoID4gMCk7XHJcbiAgICAgICAgLy8gQXJlIHRhZ3MgYWxyZWFkeSBhZGRlZD8gT25seSBhZGQgaWYgbnVsbFxyXG4gICAgICAgIGNvbnN0IHRhZ0JveDogSFRNTFNwYW5FbGVtZW50IHwgbnVsbCA9IHJlcy5xdWVyeVNlbGVjdG9yKCcubXBfdGFncycpO1xyXG4gICAgICAgIGlmICh0YWdCb3ggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5qZWN0TGlua3ModGFncywgdGFnbGluZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2codGFncyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogKiBJbmplY3RzIHRoZSBnZW5lcmF0ZWQgdGFnc1xyXG4gICAgICogQHBhcmFtIHRhZ3MgQXJyYXkgb2YgdGFncyB0byBhZGRcclxuICAgICAqIEBwYXJhbSB0YXIgVGhlIHNlYXJjaCByZXN1bHQgcm93IHRoYXQgdGhlIHRhZ3Mgd2lsbCBiZSBhZGRlZCB0b1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pbmplY3RMaW5rcyA9ICh0YWdzOiBzdHJpbmdbXSwgdGFyOiBIVE1MU3BhbkVsZW1lbnQpID0+IHtcclxuICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgbmV3IHRhZyByb3dcclxuICAgICAgICAgICAgY29uc3QgdGFnUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICB0YWdSb3cuY2xhc3NMaXN0LmFkZCgnbXBfdGFncycpO1xyXG4gICAgICAgICAgICB0YXIuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmViZWdpbicsIHRhZ1Jvdyk7XHJcbiAgICAgICAgICAgIHRhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB0YWdSb3cuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHRhZ3MgdG8gdGhlIHRhZyByb3dcclxuICAgICAgICAgICAgdGFncy5mb3JFYWNoKCh0YWcpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhZ1Jvdy5pbm5lckhUTUwgKz0gYDxhIGNsYXNzPSdtcF90YWcnIGhyZWY9Jy90b3IvYnJvd3NlLnBocD90b3IlNUJ0ZXh0JTVEPSUyMiR7ZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHRhZ1xyXG4gICAgICAgICAgICAgICAgKX0lMjImdG9yJTVCc3JjaEluJTVEJTVCdGFncyU1RD10cnVlJz4ke3RhZ308L2E+YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBnZXQgc2V0dGluZ3MoKTogQ2hlY2tib3hTZXR0aW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2V0dGluZ3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSYW5kb20gQm9vayBmZWF0dXJlIHRvIG9wZW4gYSBuZXcgdGFiL3dpbmRvdyB3aXRoIGEgcmFuZG9tIE1BTSBCb29rXHJcbiAqL1xyXG5jbGFzcyBSYW5kb21Cb29rIGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXAuU2VhcmNoLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdyYW5kb21Cb29rJyxcclxuICAgICAgICBkZXNjOiBgQWRkIGEgYnV0dG9uIHRvIG9wZW4gYSByYW5kb21seSBzZWxlY3RlZCBib29rIHBhZ2UuICg8ZW0+VXNlcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGNhdGVnb3J5IGluIHRoZSBkcm9wZG93bjwvZW0+KWAsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3Nzcic7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWydicm93c2UnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBsZXQgcmFuZG86IFByb21pc2U8SFRNTEVsZW1lbnQ+O1xyXG4gICAgICAgIGNvbnN0IHJhbmRvVGV4dDogc3RyaW5nID0gJ1JhbmRvbSBCb29rJztcclxuXHJcbiAgICAgICAgLy8gUXVldWUgYnVpbGRpbmcgdGhlIGJ1dHRvbiBhbmQgZ2V0dGluZyB0aGUgcmVzdWx0c1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgKHJhbmRvID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncmFuZG9tQm9vaycsXHJcbiAgICAgICAgICAgICAgICByYW5kb1RleHQsXHJcbiAgICAgICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICAgICAgJyNyZXNldE5ld0ljb24nLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xyXG4gICAgICAgICAgICApKSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgcmFuZG9cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb3VudFJlc3VsdDogUHJvbWlzZTxudW1iZXI+O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2F0ZWdvcmllczogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBDYXRlZ29yeSBkcm9wZG93biBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdFNlbGVjdGlvbjogSFRNTFNlbGVjdEVsZW1lbnQgPSA8SFRNTFNlbGVjdEVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhdGVnb3J5UGFydGlhbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSB2YWx1ZSBjdXJyZW50bHkgc2VsZWN0ZWQgaW4gQ2F0ZWdvcnkgRHJvcGRvd25cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0VmFsdWU6IHN0cmluZyA9IGNhdFNlbGVjdGlvbiEub3B0aW9uc1tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdFNlbGVjdGlvbi5zZWxlY3RlZEluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZGVwZW5kaW5nIG9uIGNhdGVnb3J5IHNlbGVjdGVkLCBjcmVhdGUgYSBjYXRlZ29yeSBzdHJpbmcgZm9yIHRoZSBKU09OIEdFVFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFN0cmluZyhjYXRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0FMTCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGVmYXVsdHMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xMyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTEzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTE0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTE1JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ20xNic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9ICcmdG9yW21haW5fY2F0XVtdPTE2JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdFZhbHVlLmNoYXJBdCgwKSA9PT0gJ2MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSAnJnRvcltjYXRdW109JyArIGNhdFZhbHVlLnN1YnN0cmluZygxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvdW50UmVzdWx0ID0gdGhpcy5fZ2V0UmFuZG9tQm9va1Jlc3VsdHMoY2F0ZWdvcmllcykpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRSZXN1bHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChnZXRSYW5kb21SZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL29wZW4gbmV3IHRhYiB3aXRoIHRoZSByYW5kb20gYm9va1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC90LycgKyBnZXRSYW5kb21SZXN1bHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdfYmxhbmsnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBSYW5kb20gQm9vayBidXR0b24hJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWx0ZXJzIHNlYXJjaCByZXN1bHRzXHJcbiAgICAgKiBAcGFyYW0gY2F0IGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGNhdGVnb3JpZXMgbmVlZGVkIGZvciBKU09OIEdldFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIF9nZXRSYW5kb21Cb29rUmVzdWx0cyhjYXQ6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgbGV0IGpzb25SZXN1bHQ6IFByb21pc2U8c3RyaW5nPjtcclxuICAgICAgICAgICAgLy9VUkwgdG8gR0VUIHJhbmRvbSBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cubXlhbm9uYW1vdXNlLm5ldC90b3IvanMvbG9hZFNlYXJjaEpTT05iYXNpYy5waHA/dG9yW3NlYXJjaFR5cGVdPWFsbCZ0b3Jbc2VhcmNoSW5dPXRvcnJlbnRzJHtjYXR9JnRvcltwZXJwYWdlXT01JnRvclticm93c2VGbGFnc0hpZGVWc1Nob3ddPTAmdG9yW3N0YXJ0RGF0ZV09JnRvcltlbmREYXRlXT0mdG9yW2hhc2hdPSZ0b3Jbc29ydFR5cGVdPXJhbmRvbSZ0aHVtYm5haWw9dHJ1ZT8ke1V0aWwucmFuZG9tTnVtYmVyKFxyXG4gICAgICAgICAgICAgICAgMSxcclxuICAgICAgICAgICAgICAgIDEwMDAwMFxyXG4gICAgICAgICAgICApfWA7XHJcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFsoanNvblJlc3VsdCA9IFV0aWwuZ2V0SlNPTih1cmwpKV0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAganNvblJlc3VsdFxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChqc29uRnVsbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JldHVybiB0aGUgZmlyc3QgdG9ycmVudCBJRCBvZiB0aGUgcmFuZG9tIEpTT04gdGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoanNvbkZ1bGwpLmRhdGFbMF0uaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLyoqXHJcbiAqICMgUkVRVUVTVCBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG4vKipcclxuICogKiBIaWRlIHJlcXVlc3RlcnMgd2hvIGFyZSBzZXQgdG8gXCJoaWRkZW5cIlxyXG4gKi9cclxuY2xhc3MgVG9nZ2xlSGlkZGVuUmVxdWVzdGVycyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlJlcXVlc3RzLFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd0b2dnbGVIaWRkZW5SZXF1ZXN0ZXJzJyxcclxuICAgICAgICBkZXNjOiBgSGlkZSBoaWRkZW4gcmVxdWVzdGVyc2AsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3RvclJvd3MnO1xyXG4gICAgcHJpdmF0ZSBfc2VhcmNoTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiB8IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgX2hpZGUgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRoaXMuX2FkZFRvZ2dsZVN3aXRjaCgpO1xyXG4gICAgICAgIHRoaXMuX3NlYXJjaExpc3QgPSBhd2FpdCB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHModGhpcy5fc2VhcmNoTGlzdCk7XHJcblxyXG4gICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcih0aGlzLl90YXIsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fc2VhcmNoTGlzdCA9IGF3YWl0IHRoaXMuX2dldFJlcXVlc3RMaXN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlclJlc3VsdHModGhpcy5fc2VhcmNoTGlzdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYWRkVG9nZ2xlU3dpdGNoKCkge1xyXG4gICAgICAgIC8vIE1ha2UgYSBuZXcgYnV0dG9uIGFuZCBpbnNlcnQgYmVzaWRlIHRoZSBTZWFyY2ggYnV0dG9uXHJcbiAgICAgICAgVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICdzaG93SGlkZGVuJyxcclxuICAgICAgICAgICAgJ1Nob3cgSGlkZGVuJyxcclxuICAgICAgICAgICAgJ2RpdicsXHJcbiAgICAgICAgICAgICcjcmVxdWVzdFNlYXJjaCAudG9ycmVudFNlYXJjaCcsXHJcbiAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICd0b3JGb3JtQnV0dG9uJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBuZXcgYnV0dG9uIGFuZCBhZGQgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgIGNvbnN0IHRvZ2dsZVN3aXRjaDogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXBfc2hvd0hpZGRlbicpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB0b2dnbGVTd2l0Y2guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkxpc3Q6IE5vZGVMaXN0T2Y8SFRNTExJRWxlbWVudD4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJyN0b3JSb3dzID4gLm1wX2hpZGRlbidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oaWRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTd2l0Y2guaW5uZXJUZXh0ID0gJ0hpZGUgSGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGhpZGRlbkxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdsaXN0LWl0ZW0nO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwLjUnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVN3aXRjaC5pbm5lclRleHQgPSAnU2hvdyBIaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuTGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGUub3BhY2l0eSA9ICcwJztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmVxdWVzdExpc3QoKTogUHJvbWlzZTxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3RzIHRvIGV4aXN0XHJcbiAgICAgICAgICAgIENoZWNrLmVsZW1Mb2FkKCcjdG9yUm93cyAudG9yUm93IC50b3JSaWdodCcpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gR3JhYiBhbGwgcmVxdWVzdHNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcUxpc3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgfCBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+XHJcbiAgICAgICAgICAgICAgICAgICAgfCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfCB1bmRlZmluZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgICAgICcjdG9yUm93cyAudG9yUm93J1xyXG4gICAgICAgICAgICAgICAgKSBhcyBOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXFMaXN0ID09PSBudWxsIHx8IHJlcUxpc3QgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChgcmVxTGlzdCBpcyAke3JlcUxpc3R9YCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxTGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZpbHRlclJlc3VsdHMobGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pikge1xyXG4gICAgICAgIGxpc3QuZm9yRWFjaCgocmVxdWVzdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ZXI6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IHJlcXVlc3QucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICcudG9yUmlnaHQgYSdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgaWYgKHJlcXVlc3RlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5jbGFzc0xpc3QuYWRkKCdtcF9oaWRkZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqICogR2VuZXJhdGUgYSBwbGFpbnRleHQgbGlzdCBvZiByZXF1ZXN0IHJlc3VsdHNcclxuICovXHJcbmNsYXNzIFBsYWludGV4dFJlcXVlc3QgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAncGxhaW50ZXh0UmVxdWVzdCcsXHJcbiAgICAgICAgZGVzYzogYEluc2VydCBwbGFpbnRleHQgcmVxdWVzdCByZXN1bHRzIGF0IHRvcCBvZiByZXF1ZXN0IHBhZ2VgLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNzc3InO1xyXG4gICAgcHJpdmF0ZSBfaXNPcGVuOiAndHJ1ZScgfCAnZmFsc2UnIHwgdW5kZWZpbmVkID0gR01fZ2V0VmFsdWUoXHJcbiAgICAgICAgYCR7dGhpcy5fc2V0dGluZ3MudGl0bGV9U3RhdGVgXHJcbiAgICApO1xyXG4gICAgcHJpdmF0ZSBfcGxhaW5UZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBVdGlsLnN0YXJ0RmVhdHVyZSh0aGlzLl9zZXR0aW5ncywgdGhpcy5fdGFyLCBbJ3JlcXVlc3QnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBsZXQgdG9nZ2xlQnRuOiBQcm9taXNlPEhUTUxFbGVtZW50PjtcclxuICAgICAgICBsZXQgY29weUJ0bjogSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IHJlc3VsdExpc3Q6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj47XHJcblxyXG4gICAgICAgIC8vIFF1ZXVlIGJ1aWxkaW5nIHRoZSB0b2dnbGUgYnV0dG9uIGFuZCBnZXR0aW5nIHRoZSByZXN1bHRzXHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICAodG9nZ2xlQnRuID0gVXRpbC5jcmVhdGVCdXR0b24oXHJcbiAgICAgICAgICAgICAgICAncGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgJ1Nob3cgUGxhaW50ZXh0JyxcclxuICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgJyNzc3InLFxyXG4gICAgICAgICAgICAgICAgJ2JlZm9yZWJlZ2luJyxcclxuICAgICAgICAgICAgICAgICdtcF90b2dnbGUgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICkpLFxyXG4gICAgICAgICAgICAocmVzdWx0TGlzdCA9IHRoaXMuX2dldFJlcXVlc3RMaXN0KCkpLFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHRoZSByZXN1bHRzIGludG8gcGxhaW50ZXh0XHJcbiAgICAgICAgcmVzdWx0TGlzdFxyXG4gICAgICAgICAgICAudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgY29weSBidXR0b25cclxuICAgICAgICAgICAgICAgIGNvcHlCdG4gPSBhd2FpdCBVdGlsLmNyZWF0ZUJ1dHRvbihcclxuICAgICAgICAgICAgICAgICAgICAncGxhaW5Db3B5JyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29weSBQbGFpbnRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjbXBfcGxhaW5Ub2dnbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ21wX2NvcHkgbXBfcGxhaW5CdG4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgdGhlIHBsYWludGV4dCBib3hcclxuICAgICAgICAgICAgICAgIGNvcHlCdG4uaW5zZXJ0QWRqYWNlbnRIVE1MKFxyXG4gICAgICAgICAgICAgICAgICAgICdhZnRlcmVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYDxicj48dGV4dGFyZWEgY2xhc3M9J21wX3BsYWludGV4dFNlYXJjaCcgc3R5bGU9J2Rpc3BsYXk6IG5vbmUnPjwvdGV4dGFyZWE+YFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhaW5UZXh0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzc1Jlc3VsdHMocmVzKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICApIS5pbm5lckhUTUwgPSB0aGlzLl9wbGFpblRleHQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgdXAgYSBjbGljayBsaXN0ZW5lclxyXG4gICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4oY29weUJ0biwgdGhpcy5fcGxhaW5UZXh0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gT2JzZXJ2ZSB0aGUgU2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgICAgIENoZWNrLmVsZW1PYnNlcnZlcignI3NzcicsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXBfcGxhaW50ZXh0U2VhcmNoJykhLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QgPSB0aGlzLl9nZXRSZXF1ZXN0TGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdExpc3QudGhlbihhc3luYyAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBwbGFpbnRleHQgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFpblRleHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzUmVzdWx0cyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5tcF9wbGFpbnRleHRTZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkhLmlubmVySFRNTCA9IHRoaXMuX3BsYWluVGV4dDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCBvcGVuIHN0YXRlXHJcbiAgICAgICAgdGhpcy5fc2V0T3BlblN0YXRlKHRoaXMuX2lzT3Blbik7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCB0b2dnbGUgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcclxuICAgICAgICB0b2dnbGVCdG5cclxuICAgICAgICAgICAgLnRoZW4oKGJ0bikgPT4ge1xyXG4gICAgICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHRib3ggc2hvdWxkIGV4aXN0LCBidXQganVzdCBpbiBjYXNlLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRib3g6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcubXBfcGxhaW50ZXh0U2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dGJveCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZXh0Ym94IGRvZXNuJ3QgZXhpc3QhYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPcGVuID09PSAnZmFsc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRPcGVuU3RhdGUoJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidG4uaW5uZXJUZXh0ID0gJ0hpZGUgUGxhaW50ZXh0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSgnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRib3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ0bi5pbm5lclRleHQgPSAnU2hvdyBQbGFpbnRleHQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5zZXJ0ZWQgcGxhaW50ZXh0IHJlcXVlc3QgcmVzdWx0cyEnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgT3BlbiBTdGF0ZSB0byB0cnVlL2ZhbHNlIGludGVybmFsbHkgYW5kIGluIHNjcmlwdCBzdG9yYWdlXHJcbiAgICAgKiBAcGFyYW0gdmFsIHN0cmluZ2lmaWVkIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0T3BlblN0YXRlKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YWwgPSAnZmFsc2UnO1xyXG4gICAgICAgIH0gLy8gRGVmYXVsdCB2YWx1ZVxyXG4gICAgICAgIEdNX3NldFZhbHVlKCd0b2dnbGVTbmF0Y2hlZFN0YXRlJywgdmFsKTtcclxuICAgICAgICB0aGlzLl9pc09wZW4gPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfcHJvY2Vzc1Jlc3VsdHMocmVzdWx0czogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pik6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgbGV0IG91dHA6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBlYWNoIHRleHQgZmllbGRcclxuICAgICAgICAgICAgbGV0IHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IHNlcmllc1RpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgICAgICAgICAgbGV0IGF1dGhUaXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBuYXJyVGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgICAgICAgICAvLyBCcmVhayBvdXQgdGhlIGltcG9ydGFudCBkYXRhIGZyb20gZWFjaCBub2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJhd1RpdGxlOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJy50b3JUaXRsZScpO1xyXG4gICAgICAgICAgICBjb25zdCBzZXJpZXNMaXN0OiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTEFuY2hvckVsZW1lbnRcclxuICAgICAgICAgICAgPiB8IG51bGwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZXJpZXMnKTtcclxuICAgICAgICAgICAgY29uc3QgYXV0aExpc3Q6IE5vZGVMaXN0T2Y8SFRNTEFuY2hvckVsZW1lbnQ+IHwgbnVsbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbChcclxuICAgICAgICAgICAgICAgICcuYXV0aG9yJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBuYXJyTGlzdDogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKFxyXG4gICAgICAgICAgICAgICAgJy5uYXJyYXRvcidcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyYXdUaXRsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFcnJvciBOb2RlOicsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXN1bHQgdGl0bGUgc2hvdWxkIG5vdCBiZSBudWxsYCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZSA9IHJhd1RpdGxlLnRleHRDb250ZW50IS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3Mgc2VyaWVzXHJcbiAgICAgICAgICAgIGlmIChzZXJpZXNMaXN0ICE9PSBudWxsICYmIHNlcmllc0xpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzTGlzdC5mb3JFYWNoKChzZXJpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpZXNUaXRsZSArPSBgJHtzZXJpZXMudGV4dENvbnRlbnR9IC8gYDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gbGFzdCBzZXJpZXMsIHRoZW4gc3R5bGVcclxuICAgICAgICAgICAgICAgIHNlcmllc1RpdGxlID0gc2VyaWVzVGl0bGUuc3Vic3RyaW5nKDAsIHNlcmllc1RpdGxlLmxlbmd0aCAtIDMpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWVzVGl0bGUgPSBgICgke3Nlcmllc1RpdGxlfSlgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFByb2Nlc3MgYXV0aG9yc1xyXG4gICAgICAgICAgICBpZiAoYXV0aExpc3QgIT09IG51bGwgJiYgYXV0aExpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYXV0aFRpdGxlID0gJ0JZICc7XHJcbiAgICAgICAgICAgICAgICBhdXRoTGlzdC5mb3JFYWNoKChhdXRoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aFRpdGxlICs9IGAke2F1dGgudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBhdXRoVGl0bGUgPSBhdXRoVGl0bGUuc3Vic3RyaW5nKDAsIGF1dGhUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBQcm9jZXNzIG5hcnJhdG9yc1xyXG4gICAgICAgICAgICBpZiAobmFyckxpc3QgIT09IG51bGwgJiYgbmFyckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbmFyclRpdGxlID0gJ0ZUICc7XHJcbiAgICAgICAgICAgICAgICBuYXJyTGlzdC5mb3JFYWNoKChuYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFyclRpdGxlICs9IGAke25hcnIudGV4dENvbnRlbnR9IEFORCBgO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgQU5EXHJcbiAgICAgICAgICAgICAgICBuYXJyVGl0bGUgPSBuYXJyVGl0bGUuc3Vic3RyaW5nKDAsIG5hcnJUaXRsZS5sZW5ndGggLSA1KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwICs9IGAke3RpdGxlfSR7c2VyaWVzVGl0bGV9ICR7YXV0aFRpdGxlfSAke25hcnJUaXRsZX1cXG5gO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvdXRwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJlcXVlc3RMaXN0ID0gKCk6IFByb21pc2U8Tm9kZUxpc3RPZjxIVE1MTElFbGVtZW50Pj4gPT4ge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5sb2coYFNoYXJlZC5nZXRTZWFyY2hMaXN0KCApYCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlcXVlc3QgcmVzdWx0cyB0byBleGlzdFxyXG4gICAgICAgICAgICBDaGVjay5lbGVtTG9hZCgnI3RvclJvd3MgLnRvclJvdyBhJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgYWxsIHJlcXVlc3QgcmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hdGNoTGlzdDogTm9kZUxpc3RPZjxIVE1MTElFbGVtZW50PiA9IDxOb2RlTGlzdE9mPEhUTUxMSUVsZW1lbnQ+PihcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yUm93cyAudG9yUm93JylcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc25hdGNoTGlzdCA9PT0gbnVsbCB8fCBzbmF0Y2hMaXN0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoYHNuYXRjaExpc3QgaXMgJHtzbmF0Y2hMaXN0fWApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNuYXRjaExpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc09wZW4oKTogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzT3BlbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaXNPcGVuKHZhbDogJ3RydWUnIHwgJ2ZhbHNlJyB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHRoaXMuX3NldE9wZW5TdGF0ZSh2YWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBHb29kcmVhZHNCdXR0b25SZXEgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBDaGVja2JveFNldHRpbmcgPSB7XHJcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcclxuICAgICAgICB0aXRsZTogJ2dvb2RyZWFkc0J1dHRvblJlcScsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cC5SZXF1ZXN0cyxcclxuICAgICAgICBkZXNjOiAnRW5hYmxlIE1BTS10by1Hb29kcmVhZHMgYnV0dG9ucyBmb3IgcmVxdWVzdHMnLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNmaWxsVG9ycmVudCc7XHJcbiAgICBwcml2YXRlIF9zaGFyZSA9IG5ldyBTaGFyZWQoKTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsncmVxdWVzdCBkZXRhaWxzJ10pLnRoZW4oKHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICAvLyBDb252ZXJ0IHJvdyBzdHJ1Y3R1cmUgaW50byBzZWFyY2hhYmxlIG9iamVjdFxyXG4gICAgICAgIGNvbnN0IHJlcVJvd3MgPSBVdGlsLnJvd3NUb09iaihkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9yRGV0TWFpbkNvbiA+IGRpdicpKTtcclxuICAgICAgICAvLyBTZWxlY3QgdGhlIGRhdGEgcG9pbnRzXHJcbiAgICAgICAgY29uc3QgYm9va0RhdGE6IEhUTUxTcGFuRWxlbWVudCB8IG51bGwgPSByZXFSb3dzWydUaXRsZTonXS5xdWVyeVNlbGVjdG9yKCdzcGFuJyk7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1tcclxuICAgICAgICAgICAgJ0F1dGhvcihzKTonXHJcbiAgICAgICAgXS5xdWVyeVNlbGVjdG9yQWxsKCdhJyk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWVzRGF0YTogTm9kZUxpc3RPZjxIVE1MQW5jaG9yRWxlbWVudD4gfCBudWxsID0gcmVxUm93c1snU2VyaWVzOiddXHJcbiAgICAgICAgICAgID8gcmVxUm93c1snU2VyaWVzOiddLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKVxyXG4gICAgICAgICAgICA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0OiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSByZXFSb3dzWydSZWxlYXNlIERhdGUnXTtcclxuICAgICAgICAvLyBHZW5lcmF0ZSBidXR0b25zXHJcbiAgICAgICAgdGhpcy5fc2hhcmUuZ29vZHJlYWRzQnV0dG9ucyhib29rRGF0YSwgYXV0aG9yRGF0YSwgc2VyaWVzRGF0YSwgdGFyZ2V0KTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvKipcclxuICogVkFVTFQgRkVBVFVSRVNcclxuICovXHJcblxyXG5jbGFzcyBTaW1wbGVWYXVsdCBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwLlZhdWx0LFxyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICdzaW1wbGVWYXVsdCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ1NpbXBsaWZ5IHRoZSBWYXVsdCBwYWdlcy4gKDxlbT5UaGlzIHJlbW92ZXMgZXZlcnl0aGluZyBleGNlcHQgdGhlIGRvbmF0ZSBidXR0b24gJmFtcDsgbGlzdCBvZiByZWNlbnQgZG9uYXRpb25zPC9lbT4pJyxcclxuICAgIH07XHJcbiAgICBwcml2YXRlIF90YXI6IHN0cmluZyA9ICcjbWFpbkJvZHknO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndmF1bHQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBfaW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzdWJQYWdlOiBzdHJpbmcgPSBHTV9nZXRWYWx1ZSgnbXBfY3VycmVudFBhZ2UnKTtcclxuICAgICAgICBjb25zdCBwYWdlID0gPEhUTUxFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5fdGFyKTtcclxuICAgICAgICBjb25zb2xlLmdyb3VwKGBBcHBseWluZyBWYXVsdCAoJHtzdWJQYWdlfSkgc2V0dGluZ3MuLi5gKTtcclxuXHJcbiAgICAgICAgLy8gQ2xvbmUgdGhlIGltcG9ydGFudCBwYXJ0cyBhbmQgcmVzZXQgdGhlIHBhZ2VcclxuICAgICAgICBjb25zdCBkb25hdGVCdG46IEhUTUxGb3JtRWxlbWVudCB8IG51bGwgPSBwYWdlLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcclxuICAgICAgICBjb25zdCBkb25hdGVUYmw6IEhUTUxUYWJsZUVsZW1lbnQgfCBudWxsID0gcGFnZS5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgICAgICAndGFibGU6bGFzdC1vZi10eXBlJ1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgcGFnZS5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBkb25hdGUgYnV0dG9uIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgIGlmIChkb25hdGVCdG4gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3RG9uYXRlOiBIVE1MRm9ybUVsZW1lbnQgPSA8SFRNTEZvcm1FbGVtZW50PmRvbmF0ZUJ0bi5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3RG9uYXRlKTtcclxuICAgICAgICAgICAgbmV3RG9uYXRlLmNsYXNzTGlzdC5hZGQoJ21wX3ZhdWx0Q2xvbmUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwYWdlLmlubmVySFRNTCA9ICc8aDE+Q29tZSBiYWNrIHRvbW9ycm93ITwvaDE+JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgZG9uYXRlIHRhYmxlIGlmIGl0IGV4aXN0c1xyXG4gICAgICAgIGlmIChkb25hdGVUYmwgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSA8SFRNTFRhYmxlRWxlbWVudD4oXHJcbiAgICAgICAgICAgICAgICBkb25hdGVUYmwuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3VGFibGUpO1xyXG4gICAgICAgICAgICBuZXdUYWJsZS5jbGFzc0xpc3QuYWRkKCdtcF92YXVsdENsb25lJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFnZS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzI1cHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygnW00rXSBTaW1wbGlmaWVkIHRoZSB2YXVsdCBwYWdlIScpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdXRpbC50c1wiIC8+XHJcblxyXG4vKipcclxuICogI1VQTE9BRCBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEFsbG93cyBlYXNpZXIgY2hlY2tpbmcgZm9yIGR1cGxpY2F0ZSB1cGxvYWRzXHJcbiAqL1xyXG5cclxuY2xhc3MgU2VhcmNoRm9yRHVwbGljYXRlcyBpbXBsZW1lbnRzIEZlYXR1cmUge1xyXG4gICAgcHJpdmF0ZSBfc2V0dGluZ3M6IENoZWNrYm94U2V0dGluZyA9IHtcclxuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgIHRpdGxlOiAnc2VhcmNoRm9yRHVwbGljYXRlcycsXHJcbiAgICAgICAgc2NvcGU6IFNldHRpbmdHcm91cFsnVXBsb2FkIFBhZ2UnXSxcclxuICAgICAgICBkZXNjOiAnRWFzaWVyIHNlYXJjaGluZyBmb3IgZHVwbGljYXRlcyB3aGVuIHVwbG9hZGluZyBjb250ZW50JyxcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBfdGFyOiBzdHJpbmcgPSAnI3VwbG9hZEZvcm0gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXSc7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgVXRpbC5zdGFydEZlYXR1cmUodGhpcy5fc2V0dGluZ3MsIHRoaXMuX3RhciwgWyd1cGxvYWQnXSkudGhlbigodCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQm9keScpO1xyXG5cclxuICAgICAgICBpZiAocGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIHRpdGxlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0aXRsZScsXHJcbiAgICAgICAgICAgICAgICBpbnB1dFNlbGVjdG9yOiAnaW5wdXRbbmFtZT1cInRvclt0aXRsZV1cIl0nLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDcsXHJcbiAgICAgICAgICAgICAgICB1c2VXaWxkY2FyZDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9nZW5lcmF0ZVNlYXJjaCh7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDaGVjayBmb3IgcmVzdWx0cyB3aXRoIGdpdmVuIGF1dGhvcihzKScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXV0aG9yJyxcclxuICAgICAgICAgICAgICAgIGlucHV0U2VsZWN0b3I6ICdpbnB1dC5hY19hdXRob3InLFxyXG4gICAgICAgICAgICAgICAgcm93UG9zaXRpb246IDEwLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NoZWNrIGZvciByZXN1bHRzIHdpdGggZ2l2ZW4gc2VyaWVzJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdzZXJpZXMnLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX3NlcmllcycsXHJcbiAgICAgICAgICAgICAgICByb3dQb3NpdGlvbjogMTEsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVTZWFyY2goe1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ2hlY2sgZm9yIHJlc3VsdHMgd2l0aCBnaXZlbiBuYXJyYXRvcihzKScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbmFycmF0b3InLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRTZWxlY3RvcjogJ2lucHV0LmFjX25hcnJhdG9yJyxcclxuICAgICAgICAgICAgICAgIHJvd1Bvc2l0aW9uOiAxMixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbTStdIEFkZGluZyBzZWFyY2ggdG8gdXBsb2FkcyFgKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgX2dlbmVyYXRlU2VhcmNoKHtcclxuICAgICAgICBwYXJlbnRFbGVtZW50LFxyXG4gICAgICAgIHRpdGxlLFxyXG4gICAgICAgIHR5cGUsXHJcbiAgICAgICAgaW5wdXRTZWxlY3RvcixcclxuICAgICAgICByb3dQb3NpdGlvbixcclxuICAgICAgICB1c2VXaWxkY2FyZCA9IGZhbHNlLFxyXG4gICAgfToge1xyXG4gICAgICAgIHBhcmVudEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICAgICAgdHlwZTogc3RyaW5nO1xyXG4gICAgICAgIGlucHV0U2VsZWN0b3I6IHN0cmluZztcclxuICAgICAgICByb3dQb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgICAgIHVzZVdpbGRjYXJkPzogYm9vbGVhbjtcclxuICAgIH0pIHtcclxuICAgICAgICBjb25zdCBzZWFyY2hFbGVtZW50OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICBVdGlsLnNldEF0dHIoc2VhcmNoRWxlbWVudCwge1xyXG4gICAgICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnLFxyXG4gICAgICAgICAgICBzdHlsZTogJ3RleHQtZGVjb3JhdGlvbjogbm9uZTsgY3Vyc29yOiBwb2ludGVyOycsXHJcbiAgICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlYXJjaEVsZW1lbnQudGV4dENvbnRlbnQgPSAnIPCflI0nO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rQmFzZSA9IGAvdG9yL2Jyb3dzZS5waHA/dG9yJTVCc2VhcmNoVHlwZSU1RD1hbGwmdG9yJTVCc2VhcmNoSW4lNUQ9dG9ycmVudHMmdG9yJTVCY2F0JTVEJTVCJTVEPTAmdG9yJTVCYnJvd3NlRmxhZ3NIaWRlVnNTaG93JTVEPTAmdG9yJTVCc29ydFR5cGUlNUQ9ZGF0ZURlc2MmdG9yJTVCc3JjaEluJTVEJTVCJHt0eXBlfSU1RD10cnVlJnRvciU1QnRleHQlNUQ9YDtcclxuXHJcbiAgICAgICAgcGFyZW50RWxlbWVudFxyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcihcclxuICAgICAgICAgICAgICAgIGAjdXBsb2FkRm9ybSA+IHRib2R5ID4gdHI6bnRoLWNoaWxkKCR7cm93UG9zaXRpb259KSA+IHRkOm50aC1jaGlsZCgxKWBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICA/Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgc2VhcmNoRWxlbWVudCk7XHJcblxyXG4gICAgICAgIHNlYXJjaEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXRzOiBOb2RlTGlzdE9mPFxyXG4gICAgICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudFxyXG4gICAgICAgICAgICA+IHwgbnVsbCA9IHBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChpbnB1dFNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dHMgJiYgaW5wdXRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRzTGlzdDogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRzTGlzdC5wdXNoKGlucHV0LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IGlucHV0c0xpc3Quam9pbignICcpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2hTdHJpbmcgPSB1c2VXaWxkY2FyZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAqJHtlbmNvZGVVUklDb21wb25lbnQoaW5wdXRzTGlzdC5qb2luKCcgJykpfSpgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0c0xpc3Quam9pbignICcpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBsaW5rQmFzZSArIHNlYXJjaFN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGdldCBzZXR0aW5ncygpOiBDaGVja2JveFNldHRpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic2hhcmVkLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3V0aWwudHNcIiAvPlxyXG5cclxuLyoqXHJcbiAqICMgVVNFUiBQQUdFIEZFQVRVUkVTXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqICMjIyMgRGVmYXVsdCBVc2VyIEdpZnQgQW1vdW50XHJcbiAqL1xyXG5jbGFzcyBVc2VyR2lmdERlZmF1bHQgaW1wbGVtZW50cyBGZWF0dXJlIHtcclxuICAgIHByaXZhdGUgX3NldHRpbmdzOiBUZXh0Ym94U2V0dGluZyA9IHtcclxuICAgICAgICBzY29wZTogU2V0dGluZ0dyb3VwWydVc2VyIFBhZ2VzJ10sXHJcbiAgICAgICAgdHlwZTogJ3RleHRib3gnLFxyXG4gICAgICAgIHRpdGxlOiAndXNlckdpZnREZWZhdWx0JyxcclxuICAgICAgICB0YWc6ICdEZWZhdWx0IEdpZnQnLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXguIDEwMDAsIG1heCcsXHJcbiAgICAgICAgZGVzYzpcclxuICAgICAgICAgICAgJ0F1dG9maWxscyB0aGUgR2lmdCBib3ggd2l0aCBhIHNwZWNpZmllZCBudW1iZXIgb2YgcG9pbnRzLiAoPGVtPk9yIHRoZSBtYXggYWxsb3dhYmxlIHZhbHVlLCB3aGljaGV2ZXIgaXMgbG93ZXI8L2VtPiknLFxyXG4gICAgfTtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJyNib251c2dpZnQnO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbml0KCkge1xyXG4gICAgICAgIG5ldyBTaGFyZWQoKVxyXG4gICAgICAgICAgICAuZmlsbEdpZnRCb3godGhpcy5fdGFyLCB0aGlzLl9zZXR0aW5ncy50aXRsZSlcclxuICAgICAgICAgICAgLnRoZW4oKHBvaW50cykgPT5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTStdIFNldCB0aGUgZGVmYXVsdCBnaWZ0IGFtb3VudCB0byAke3BvaW50c31gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzZXR0aW5ncygpOiBUZXh0Ym94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogIyMjIyBVc2VyIEdpZnQgSGlzdG9yeVxyXG4gKi9cclxuY2xhc3MgVXNlckdpZnRIaXN0b3J5IGltcGxlbWVudHMgRmVhdHVyZSB7XHJcbiAgICBwcml2YXRlIF9zZXR0aW5nczogQ2hlY2tib3hTZXR0aW5nID0ge1xyXG4gICAgICAgIHR5cGU6ICdjaGVja2JveCcsXHJcbiAgICAgICAgdGl0bGU6ICd1c2VyR2lmdEhpc3RvcnknLFxyXG4gICAgICAgIHNjb3BlOiBTZXR0aW5nR3JvdXBbJ1VzZXIgUGFnZXMnXSxcclxuICAgICAgICBkZXNjOiAnRGlzcGxheSBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB5b3UgYW5kIGFub3RoZXIgdXNlcicsXHJcbiAgICB9O1xyXG4gICAgcHJpdmF0ZSBfc2VuZFN5bWJvbCA9IGA8c3BhbiBzdHlsZT0nY29sb3I6b3JhbmdlJz5cXHUyN0YwPC9zcGFuPmA7XHJcbiAgICBwcml2YXRlIF9nZXRTeW1ib2wgPSBgPHNwYW4gc3R5bGU9J2NvbG9yOnRlYWwnPlxcdTI3RjE8L3NwYW4+YDtcclxuICAgIHByaXZhdGUgX3Rhcjogc3RyaW5nID0gJ3Rib2R5JztcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIFV0aWwuc3RhcnRGZWF0dXJlKHRoaXMuX3NldHRpbmdzLCB0aGlzLl90YXIsIFsndXNlciddKS50aGVuKCh0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gSW5pdGlhbGxpemluZyB1c2VyIGdpZnQgaGlzdG9yeS4uLicpO1xyXG5cclxuICAgICAgICAvLyBOYW1lIG9mIHRoZSBvdGhlciB1c2VyXHJcbiAgICAgICAgY29uc3Qgb3RoZXJVc2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gaDEnKSEudGV4dENvbnRlbnQhLnRyaW0oKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSByb3dcclxuICAgICAgICBjb25zdCBoaXN0b3J5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBjb25zdCBpbnNlcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkJvZHkgdGJvZHkgdHI6bGFzdC1vZi10eXBlJyk7XHJcbiAgICAgICAgaWYgKGluc2VydCkgaW5zZXJ0Lmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlYmVnaW4nLCBoaXN0b3J5Q29udGFpbmVyKTtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGdpZnQgaGlzdG9yeSB0aXRsZSBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgaGlzdG9yeVRpdGxlLmNsYXNzTGlzdC5hZGQoJ3Jvd2hlYWQnKTtcclxuICAgICAgICBoaXN0b3J5VGl0bGUudGV4dENvbnRlbnQgPSAnR2lmdCBoaXN0b3J5JztcclxuICAgICAgICBoaXN0b3J5Q29udGFpbmVyLmFwcGVuZENoaWxkKGhpc3RvcnlUaXRsZSk7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnaWZ0IGhpc3RvcnkgY29udGVudCBmaWVsZFxyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgICAgIGhpc3RvcnlCb3guY2xhc3NMaXN0LmFkZCgncm93MScpO1xyXG4gICAgICAgIGhpc3RvcnlCb3gudGV4dENvbnRlbnQgPSBgWW91IGhhdmUgbm90IGV4Y2hhbmdlZCBnaWZ0cyB3aXRoICR7b3RoZXJVc2VyfS5gO1xyXG4gICAgICAgIGhpc3RvcnlCb3guYWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgaGlzdG9yeUNvbnRhaW5lci5hcHBlbmRDaGlsZChoaXN0b3J5Qm94KTtcclxuICAgICAgICAvLyBHZXQgdGhlIFVzZXIgSURcclxuICAgICAgICBjb25zdCB1c2VySUQgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5wb3AoKTtcclxuICAgICAgICAvLyBUT0RPOiB1c2UgYGNkbi5gIGluc3RlYWQgb2YgYHd3dy5gOyBjdXJyZW50bHkgY2F1c2VzIGEgNDAzIGVycm9yXHJcbiAgICAgICAgaWYgKHVzZXJJRCkge1xyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGdpZnQgaGlzdG9yeVxyXG4gICAgICAgICAgICBjb25zdCBnaWZ0SGlzdG9yeSA9IGF3YWl0IFV0aWwuZ2V0VXNlckdpZnRIaXN0b3J5KHVzZXJJRCk7XHJcbiAgICAgICAgICAgIC8vIE9ubHkgZGlzcGxheSBhIGxpc3QgaWYgdGhlcmUgaXMgYSBoaXN0b3J5XHJcbiAgICAgICAgICAgIGlmIChnaWZ0SGlzdG9yeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBQb2ludCAmIEZMIHRvdGFsIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgW3BvaW50c0luLCBwb2ludHNPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0UG9pbnRzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBbd2VkZ2VJbiwgd2VkZ2VPdXRdID0gdGhpcy5fc3VtR2lmdHMoZ2lmdEhpc3RvcnksICdnaWZ0V2VkZ2UnKTtcclxuICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBQb2ludHMgSW4vT3V0OiAke3BvaW50c0lufS8ke3BvaW50c091dH1gKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgV2VkZ2VzIEluL091dDogJHt3ZWRnZUlufS8ke3dlZGdlT3V0fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5Qm94LmlubmVySFRNTCA9IGBZb3UgaGF2ZSBzZW50ICR7dGhpcy5fc2VuZFN5bWJvbH0gPHN0cm9uZz4ke3BvaW50c091dH0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZU91dH0gRkwgd2VkZ2VzPC9zdHJvbmc+IHRvICR7b3RoZXJVc2VyfSBhbmQgcmVjZWl2ZWQgJHt0aGlzLl9nZXRTeW1ib2x9IDxzdHJvbmc+JHtwb2ludHNJbn0gcG9pbnRzPC9zdHJvbmc+ICZhbXA7IDxzdHJvbmc+JHt3ZWRnZUlufSBGTCB3ZWRnZXM8L3N0cm9uZz4uPGhyPmA7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG1lc3NhZ2UgdG8gdGhlIGJveFxyXG4gICAgICAgICAgICAgICAgaGlzdG9yeUJveC5hcHBlbmRDaGlsZCh0aGlzLl9zaG93R2lmdHMoZ2lmdEhpc3RvcnkpKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFVzZXIgZ2lmdCBoaXN0b3J5IGFkZGVkIScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tNK10gTm8gdXNlciBnaWZ0IGhpc3RvcnkgZm91bmQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZXIgSUQgbm90IGZvdW5kOiAke3VzZXJJRH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAjIyMjIFN1bSB0aGUgdmFsdWVzIG9mIGEgZ2l2ZW4gZ2lmdCB0eXBlIGFzIEluZmxvdyAmIE91dGZsb3cgc3Vtc1xyXG4gICAgICogQHBhcmFtIGhpc3RvcnkgdGhlIHVzZXIgZ2lmdCBoaXN0b3J5XHJcbiAgICAgKiBAcGFyYW0gdHlwZSBwb2ludHMgb3Igd2VkZ2VzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3N1bUdpZnRzKFxyXG4gICAgICAgIGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdLFxyXG4gICAgICAgIHR5cGU6ICdnaWZ0UG9pbnRzJyB8ICdnaWZ0V2VkZ2UnXHJcbiAgICApOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBjb25zdCBvdXRmbG93ID0gWzBdO1xyXG4gICAgICAgIGNvbnN0IGluZmxvdyA9IFswXTtcclxuICAgICAgICAvLyBPbmx5IHJldHJpZXZlIGFtb3VudHMgb2YgYSBzcGVjaWZpZWQgZ2lmdCB0eXBlXHJcbiAgICAgICAgaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGdpZnQudHlwZSA9PT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU3BsaXQgaW50byBJbmZsb3cvT3V0Zmxvd1xyXG4gICAgICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0Zmxvdy5wdXNoKGdpZnQuYW1vdW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFN1bSBhbGwgaXRlbXMgaW4gdGhlIGZpbHRlcmVkIGFycmF5XHJcbiAgICAgICAgY29uc3Qgc3VtT3V0ID0gb3V0Zmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICBjb25zdCBzdW1JbiA9IGluZmxvdy5yZWR1Y2UoKGFjY3VtdWxhdGUsIGN1cnJlbnQpID0+IGFjY3VtdWxhdGUgKyBjdXJyZW50KTtcclxuICAgICAgICByZXR1cm4gW3N1bUluLCBNYXRoLmFicyhzdW1PdXQpXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICMjIyMgQ3JlYXRlcyBhIGxpc3Qgb2YgdGhlIG1vc3QgcmVjZW50IGdpZnRzXHJcbiAgICAgKiBAcGFyYW0gaGlzdG9yeSBUaGUgZnVsbCBnaWZ0IGhpc3RvcnkgYmV0d2VlbiB0d28gdXNlcnNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2hvd0dpZnRzKGhpc3Rvcnk6IFVzZXJHaWZ0SGlzdG9yeVtdKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIGdpZnQgd2FzIGEgd2VkZ2UsIHJldHVybiBjdXN0b20gdGV4dFxyXG4gICAgICAgIGNvbnN0IF93ZWRnZU9yUG9pbnRzID0gKGdpZnQ6IFVzZXJHaWZ0SGlzdG9yeSk6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChnaWZ0LnR5cGUgPT09ICdnaWZ0UG9pbnRzJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke01hdGguYWJzKGdpZnQuYW1vdW50KX1gO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdpZnQudHlwZSA9PT0gJ2dpZnRXZWRnZScpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnKEZMKSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYEVycm9yOiB1bmtub3duIGdpZnQgdHlwZS4uLiAke2dpZnQudHlwZX06ICR7Z2lmdC5hbW91bnR9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgbGlzdCBmb3IgdGhlIGhpc3RvcnlcclxuICAgICAgICBjb25zdCBoaXN0b3J5TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihoaXN0b3J5TGlzdC5zdHlsZSwge1xyXG4gICAgICAgICAgICBsaXN0U3R5bGU6ICdub25lJyxcclxuICAgICAgICAgICAgcGFkZGluZzogJ2luaXRpYWwnLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMGVtJyxcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBMb29wIG92ZXIgaGlzdG9yeSBpdGVtcyBhbmQgYWRkIHRvIGFuIGFycmF5XHJcbiAgICAgICAgY29uc3QgZ2lmdHM6IHN0cmluZ1tdID0gaGlzdG9yeS5tYXAoKGdpZnQpID0+IHtcclxuICAgICAgICAgICAgLy8gQWRkIHNvbWUgc3R5bGluZyBkZXBlbmRpbmcgb24gcG9zL25lZyBudW1iZXJzXHJcbiAgICAgICAgICAgIGxldCBmYW5jeUdpZnRBbW91bnQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdpZnQuYW1vdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmFuY3lHaWZ0QW1vdW50ID0gYCR7dGhpcy5fZ2V0U3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmYW5jeUdpZnRBbW91bnQgPSBgJHt0aGlzLl9zZW5kU3ltYm9sfSAke193ZWRnZU9yUG9pbnRzKGdpZnQpfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgZGF0ZSByZWFkYWJsZVxyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gVXRpbC5wcmV0dHlTaXRlVGltZShnaWZ0LnRpbWVzdGFtcCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBgPGxpIGNsYXNzPSdtcF9naWZ0SXRlbSc+JHtkYXRlfSAke2ZhbmN5R2lmdEFtb3VudH08L2xpPmA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gQWRkIGhpc3RvcnkgaXRlbXMgdG8gdGhlIGxpc3RcclxuICAgICAgICBoaXN0b3J5TGlzdC5pbm5lckhUTUwgPSBnaWZ0cy5qb2luKCcnKTtcclxuICAgICAgICByZXR1cm4gaGlzdG9yeUxpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNldHRpbmdzKCk6IENoZWNrYm94U2V0dGluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogUExBQ0UgQUxMIE0rIEZFQVRVUkVTIEhFUkVcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqXHJcbiAqIE5lYXJseSBhbGwgZmVhdHVyZXMgYmVsb25nIGhlcmUsIGFzIHRoZXkgc2hvdWxkIGhhdmUgaW50ZXJuYWwgY2hlY2tzXHJcbiAqIGZvciBET00gZWxlbWVudHMgYXMgbmVlZGVkLiBPbmx5IGNvcmUgZmVhdHVyZXMgc2hvdWxkIGJlIHBsYWNlZCBpbiBgYXBwLnRzYFxyXG4gKlxyXG4gKiBUaGlzIGRldGVybWluZXMgdGhlIG9yZGVyIGluIHdoaWNoIHNldHRpbmdzIHdpbGwgYmUgZ2VuZXJhdGVkIG9uIHRoZSBTZXR0aW5ncyBwYWdlLlxyXG4gKiBTZXR0aW5ncyB3aWxsIGJlIGdyb3VwZWQgYnkgdHlwZSBhbmQgRmVhdHVyZXMgb2Ygb25lIHR5cGUgdGhhdCBhcmUgY2FsbGVkIGJlZm9yZVxyXG4gKiBvdGhlciBGZWF0dXJlcyBvZiB0aGUgc2FtZSB0eXBlIHdpbGwgYXBwZWFyIGZpcnN0LlxyXG4gKlxyXG4gKiBUaGUgb3JkZXIgb2YgdGhlIGZlYXR1cmUgZ3JvdXBzIGlzIG5vdCBkZXRlcm1pbmVkIGhlcmUuXHJcbiAqL1xyXG5jbGFzcyBJbml0RmVhdHVyZXMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBHbG9iYWwgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEhpZGVIb21lKCk7XHJcbiAgICAgICAgbmV3IEhpZGVTZWVkYm94KCk7XHJcbiAgICAgICAgbmV3IEJsdXJyZWRIZWFkZXIoKTtcclxuICAgICAgICBuZXcgVmF1bHRMaW5rKCk7XHJcbiAgICAgICAgbmV3IE1pbmlWYXVsdEluZm8oKTtcclxuICAgICAgICBuZXcgQm9udXNQb2ludERlbHRhKCk7XHJcbiAgICAgICAgbmV3IEZpeGVkTmF2KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgSG9tZSBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBIaWRlTmV3cygpO1xyXG4gICAgICAgIG5ldyBHaWZ0TmV3ZXN0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2VhcmNoIFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFRvZ2dsZVNuYXRjaGVkKCk7XHJcbiAgICAgICAgbmV3IFN0aWNreVNuYXRjaGVkVG9nZ2xlKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFNlYXJjaCgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVTZWFyY2hib3goKTtcclxuICAgICAgICBuZXcgQnVpbGRUYWdzKCk7XHJcbiAgICAgICAgbmV3IFJhbmRvbUJvb2soKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBSZXF1ZXN0IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvblJlcSgpO1xyXG4gICAgICAgIG5ldyBUb2dnbGVIaWRkZW5SZXF1ZXN0ZXJzKCk7XHJcbiAgICAgICAgbmV3IFBsYWludGV4dFJlcXVlc3QoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBUb3JyZW50IFBhZ2UgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IEdvb2RyZWFkc0J1dHRvbigpO1xyXG4gICAgICAgIG5ldyBTdG9yeUdyYXBoQnV0dG9uKCk7XHJcbiAgICAgICAgbmV3IEF1ZGlibGVCdXR0b24oKTtcclxuICAgICAgICBuZXcgQ3VycmVudGx5UmVhZGluZygpO1xyXG4gICAgICAgIG5ldyBUb3JHaWZ0RGVmYXVsdCgpO1xyXG4gICAgICAgIG5ldyBSYXRpb1Byb3RlY3QoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0SWNvbnMoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDEoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDIoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TDMoKTtcclxuICAgICAgICBuZXcgUmF0aW9Qcm90ZWN0TWluKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgU2hvdXRib3ggZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFByaW9yaXR5VXNlcnMoKTtcclxuICAgICAgICBuZXcgUHJpb3JpdHlTdHlsZSgpO1xyXG4gICAgICAgIG5ldyBNdXRlZFVzZXJzKCk7XHJcbiAgICAgICAgbmV3IFJlcGx5U2ltcGxlKCk7XHJcbiAgICAgICAgbmV3IFJlcGx5UXVvdGUoKTtcclxuICAgICAgICBuZXcgR2lmdEJ1dHRvbigpO1xyXG4gICAgICAgIG5ldyBRdWlja1Nob3V0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVmF1bHQgZnVuY3Rpb25zXHJcbiAgICAgICAgbmV3IFNpbXBsZVZhdWx0KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgVXNlciBQYWdlIGZ1bmN0aW9uc1xyXG4gICAgICAgIG5ldyBVc2VyR2lmdERlZmF1bHQoKTtcclxuICAgICAgICBuZXcgVXNlckdpZnRIaXN0b3J5KCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgRm9ydW0gUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgRm9ydW1GTEdpZnQoKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBVcGxvYWQgUGFnZSBmdW5jdGlvbnNcclxuICAgICAgICBuZXcgU2VhcmNoRm9yRHVwbGljYXRlcygpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjaGVjay50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9jb3JlLnRzXCIgLz5cclxuXHJcbi8qKlxyXG4gKiBDbGFzcyBmb3IgaGFuZGxpbmcgc2V0dGluZ3MgYW5kIHRoZSBQcmVmZXJlbmNlcyBwYWdlXHJcbiAqIEBtZXRob2QgaW5pdDogdHVybnMgZmVhdHVyZXMnIHNldHRpbmdzIGluZm8gaW50byBhIHVzZWFibGUgdGFibGVcclxuICovXHJcbmNsYXNzIFNldHRpbmdzIHtcclxuICAgIC8vIEZ1bmN0aW9uIGZvciBnYXRoZXJpbmcgdGhlIG5lZWRlZCBzY29wZXNcclxuICAgIHByaXZhdGUgc3RhdGljIF9nZXRTY29wZXMoc2V0dGluZ3M6IEFueUZlYXR1cmVbXSk6IFByb21pc2U8U2V0dGluZ0dsb2JPYmplY3Q+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ19nZXRTY29wZXMoJywgc2V0dGluZ3MsICcpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzY29wZUxpc3Q6IFNldHRpbmdHbG9iT2JqZWN0ID0ge307XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2V0dGluZyBvZiBzZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXg6IG51bWJlciA9IE51bWJlcihzZXR0aW5nLnNjb3BlKTtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBTY29wZSBleGlzdHMsIHB1c2ggdGhlIHNldHRpbmdzIGludG8gdGhlIGFycmF5XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGVMaXN0W2luZGV4XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlTGlzdFtpbmRleF0ucHVzaChzZXR0aW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGNyZWF0ZSB0aGUgYXJyYXlcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVMaXN0W2luZGV4XSA9IFtzZXR0aW5nXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNvbHZlKHNjb3BlTGlzdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gZm9yIGNvbnN0cnVjdGluZyB0aGUgdGFibGUgZnJvbSBhbiBvYmplY3RcclxuICAgIHByaXZhdGUgc3RhdGljIF9idWlsZFRhYmxlKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKCdfYnVpbGRUYWJsZSgnLCBwYWdlLCAnKScpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgb3V0cCA9IGA8dGJvZHk+PHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxicj48c3Ryb25nPk1BTSsgdiR7XHJcbiAgICAgICAgICAgICAgICBNUC5WRVJTSU9OXHJcbiAgICAgICAgICAgIH08L3N0cm9uZz4gLSBIZXJlIHlvdSBjYW4gZW5hYmxlICZhbXA7IGRpc2FibGUgYW55IGZlYXR1cmUgZnJvbSB0aGUgPGEgaHJlZj1cIi9mL3QvNDE4NjNcIj5NQU0rIHVzZXJzY3JpcHQ8L2E+ISBIb3dldmVyLCB0aGVzZSBzZXR0aW5ncyBhcmUgPHN0cm9uZz5OT1Q8L3N0cm9uZz4gc3RvcmVkIG9uIE1BTTsgdGhleSBhcmUgc3RvcmVkIHdpdGhpbiB0aGUgVGFtcGVybW9ua2V5L0dyZWFzZW1vbmtleSBleHRlbnNpb24gaW4geW91ciBicm93c2VyLCBhbmQgbXVzdCBiZSBjdXN0b21pemVkIG9uIGVhY2ggb2YgeW91ciBicm93c2Vycy9kZXZpY2VzIHNlcGFyYXRlbHkuPGJyPjxicj5Gb3IgYSBkZXRhaWxlZCBsb29rIGF0IHRoZSBhdmFpbGFibGUgZmVhdHVyZXMsIDxhIGhyZWY9XCIke1V0aWwuZGVyZWZlcihcclxuICAgICAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vZ2FyZGVuc2hhZGUvbWFtLXBsdXMvd2lraS9GZWF0dXJlLU92ZXJ2aWV3J1xyXG4gICAgICAgICAgICApfVwiPmNoZWNrIHRoZSBXaWtpITwvYT48YnI+PGJyPjwvdGQ+PC90cj5gO1xyXG5cclxuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFnZSkuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNjb3BlTnVtOiBudW1iZXIgPSBOdW1iZXIoc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBzZWN0aW9uIHRpdGxlXHJcbiAgICAgICAgICAgICAgICBvdXRwICs9IGA8dHI+PHRkIGNsYXNzPSdyb3cyJz4ke1NldHRpbmdHcm91cFtzY29wZU51bV19PC90ZD48dGQgY2xhc3M9J3JvdzEnPmA7XHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHJlcXVpcmVkIGlucHV0IGZpZWxkIGJhc2VkIG9uIHRoZSBzZXR0aW5nXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhwYWdlW3Njb3BlTnVtXSkuZm9yRWFjaCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdOdW1iZXI6IG51bWJlciA9IE51bWJlcihzZXR0aW5nKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtOiBBbnlGZWF0dXJlID0gcGFnZVtzY29wZU51bV1bc2V0dGluZ051bWJlcl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cCArPSBgPGlucHV0IHR5cGU9J2NoZWNrYm94JyBpZD0nJHtpdGVtLnRpdGxlfScgdmFsdWU9J3RydWUnPiR7aXRlbS5kZXNjfTxicj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Ym94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8c3BhbiBjbGFzcz0nbXBfc2V0VGFnJz4ke2l0ZW0udGFnfTo8L3NwYW4+IDxpbnB1dCB0eXBlPSd0ZXh0JyBpZD0nJHtpdGVtLnRpdGxlfScgcGxhY2Vob2xkZXI9JyR7aXRlbS5wbGFjZWhvbGRlcn0nIGNsYXNzPSdtcF90ZXh0SW5wdXQnIHNpemU9JzI1Jz4ke2l0ZW0uZGVzY308YnI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHAgKz0gYDxzcGFuIGNsYXNzPSdtcF9zZXRUYWcnPiR7aXRlbS50YWd9Ojwvc3Bhbj4gPHNlbGVjdCBpZD0nJHtpdGVtLnRpdGxlfScgY2xhc3M9J21wX2Ryb3BJbnB1dCc+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhpdGVtLm9wdGlvbnMpLmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8b3B0aW9uIHZhbHVlPScke2tleX0nPiR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9wdGlvbnMhW2tleV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTwvb3B0aW9uPmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwICs9IGA8L3NlbGVjdD4ke2l0ZW0uZGVzY308YnI+YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUpIGNhc2VzW2l0ZW0udHlwZV0oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHJvd1xyXG4gICAgICAgICAgICAgICAgb3V0cCArPSAnPC90ZD48L3RyPic7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNhdmUgYnV0dG9uICYgbGFzdCBwYXJ0IG9mIHRoZSB0YWJsZVxyXG4gICAgICAgICAgICBvdXRwICs9XHJcbiAgICAgICAgICAgICAgICAnPHRyPjx0ZCBjbGFzcz1cInJvdzFcIiBjb2xzcGFuPVwiMlwiPjxkaXYgaWQ9XCJtcF9zdWJtaXRcIiBjbGFzcz1cIm1wX3NldHRpbmdCdG5cIj5TYXZlIE0rIFNldHRpbmdzPz88L2Rpdj48ZGl2IGlkPVwibXBfY29weVwiIGNsYXNzPVwibXBfc2V0dGluZ0J0blwiPkNvcHkgU2V0dGluZ3M8L2Rpdj48ZGl2IGlkPVwibXBfaW5qZWN0XCIgY2xhc3M9XCJtcF9zZXR0aW5nQnRuXCI+UGFzdGUgU2V0dGluZ3M8L2Rpdj48c3BhbiBjbGFzcz1cIm1wX3NhdmVzdGF0ZVwiIHN0eWxlPVwib3BhY2l0eTowXCI+U2F2ZWQhPC9zcGFuPjwvdGQ+PC90cj48L3Rib2R5Pic7XHJcblxyXG4gICAgICAgICAgICByZXNvbHZlKG91dHApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZ1bmN0aW9uIGZvciByZXRyaWV2aW5nIHRoZSBjdXJyZW50IHNldHRpbmdzIHZhbHVlc1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2dldFNldHRpbmdzKHBhZ2U6IFNldHRpbmdHbG9iT2JqZWN0KSB7XHJcbiAgICAgICAgLy8gVXRpbC5wdXJnZVNldHRpbmdzKCk7XHJcbiAgICAgICAgY29uc3QgYWxsVmFsdWVzOiBzdHJpbmdbXSA9IEdNX2xpc3RWYWx1ZXMoKTtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ19nZXRTZXR0aW5ncygnLCBwYWdlLCAnKVxcblN0b3JlZCBHTSBrZXlzOicsIGFsbFZhbHVlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5rZXlzKHBhZ2UpLmZvckVhY2goKHNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHBhZ2VbTnVtYmVyKHNjb3BlKV0pLmZvckVhY2goKHNldHRpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWYgPSBwYWdlW051bWJlcihzY29wZSldW051bWJlcihzZXR0aW5nKV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdQcmVmOicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWYudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IFNldDonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfWApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCBWYWx1ZTonLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHTV9nZXRWYWx1ZShgJHtwcmVmLnRpdGxlfV92YWxgKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZi50aXRsZSkhXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXNlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3g6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKGAke3ByZWYudGl0bGV9X3ZhbGApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wZG93bjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbS52YWx1ZSA9IEdNX2dldFZhbHVlKHByZWYudGl0bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0gJiYgR01fZ2V0VmFsdWUocHJlZi50aXRsZSkpIGNhc2VzW3ByZWYudHlwZV0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NldFNldHRpbmdzKG9iajogU2V0dGluZ0dsb2JPYmplY3QpIHtcclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBfc2V0U2V0dGluZ3MoYCwgb2JqLCAnKScpO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgoc2NvcGUpID0+IHtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqW051bWJlcihzY29wZSldKS5mb3JFYWNoKChzZXR0aW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmID0gb2JqW051bWJlcihzY29wZSldW051bWJlcihzZXR0aW5nKV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHByZWYgIT09IG51bGwgJiYgdHlwZW9mIHByZWYgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbTogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZi50aXRsZSkhXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FzZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbS5jaGVja2VkKSBHTV9zZXRWYWx1ZShwcmVmLnRpdGxlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dGJveDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wOiBzdHJpbmcgPSBlbGVtLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnAgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUocHJlZi50aXRsZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR01fc2V0VmFsdWUoYCR7cHJlZi50aXRsZX1fdmFsYCwgaW5wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcGRvd246ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKHByZWYudGl0bGUsIGVsZW0udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2VzW3ByZWYudHlwZV0pIGNhc2VzW3ByZWYudHlwZV0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1tNK10gU2F2ZWQhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NvcHlTZXR0aW5ncygpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGdtTGlzdCA9IEdNX2xpc3RWYWx1ZXMoKTtcclxuICAgICAgICBjb25zdCBvdXRwOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGFsbCBzdG9yZWQgc2V0dGluZ3MgYW5kIHB1c2ggdG8gb3V0cHV0IGFycmF5XHJcbiAgICAgICAgZ21MaXN0Lm1hcCgoc2V0dGluZykgPT4ge1xyXG4gICAgICAgICAgICAvLyBEb24ndCBleHBvcnQgbXBfIHNldHRpbmdzIGFzIHRoZXkgc2hvdWxkIG9ubHkgYmUgc2V0IGF0IHJ1bnRpbWVcclxuICAgICAgICAgICAgaWYgKHNldHRpbmcuaW5kZXhPZignbXBfJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwLnB1c2goW3NldHRpbmcsIEdNX2dldFZhbHVlKHNldHRpbmcpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dHApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9wYXN0ZVNldHRpbmdzKHBheWxvYWQ6IHN0cmluZykge1xyXG4gICAgICAgIGlmIChNUC5ERUJVRykgY29uc29sZS5ncm91cChgX3Bhc3RlU2V0dGluZ3MoIClgKTtcclxuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IEpTT04ucGFyc2UocGF5bG9hZCk7XHJcbiAgICAgICAgc2V0dGluZ3MuZm9yRWFjaCgodHVwbGU6IFtzdHJpbmcsIHN0cmluZ11bXSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHVwbGVbMV0pIHtcclxuICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGAke3R1cGxlWzBdfWAsIGAke3R1cGxlWzFdfWApO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmxvZyh0dXBsZVswXSwgJzogJywgdHVwbGVbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gdGhhdCBzYXZlcyB0aGUgdmFsdWVzIG9mIHRoZSBzZXR0aW5ncyB0YWJsZVxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3NhdmVTZXR0aW5ncyh0aW1lcjogbnVtYmVyLCBvYmo6IFNldHRpbmdHbG9iT2JqZWN0KSB7XHJcbiAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLmdyb3VwKGBfc2F2ZVNldHRpbmdzKClgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2F2ZXN0YXRlOiBIVE1MU3BhbkVsZW1lbnQgPSA8SFRNTFNwYW5FbGVtZW50PihcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc3Bhbi5tcF9zYXZlc3RhdGUnKSFcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGdtVmFsdWVzOiBzdHJpbmdbXSA9IEdNX2xpc3RWYWx1ZXMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgdGltZXIgJiBtZXNzYWdlXHJcbiAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lcik7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbTStdIFNhdmluZy4uLicpO1xyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgYWxsIHZhbHVlcyBzdG9yZWQgaW4gR00gYW5kIHJlc2V0IGV2ZXJ5dGhpbmdcclxuICAgICAgICBmb3IgKGNvbnN0IGZlYXR1cmUgaW4gZ21WYWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBnbVZhbHVlc1tmZWF0dXJlXSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgLy8gT25seSBsb29wIG92ZXIgdmFsdWVzIHRoYXQgYXJlIGZlYXR1cmUgc2V0dGluZ3NcclxuICAgICAgICAgICAgICAgIGlmICghWydtcF92ZXJzaW9uJywgJ3N0eWxlX3RoZW1lJ10uaW5jbHVkZXMoZ21WYWx1ZXNbZmVhdHVyZV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBub3QgcGFydCBvZiBwcmVmZXJlbmNlcyBwYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdtVmFsdWVzW2ZlYXR1cmVdLmluZGV4T2YoJ21wXycpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEdNX3NldFZhbHVlKGdtVmFsdWVzW2ZlYXR1cmVdLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTYXZlIHRoZSBzZXR0aW5ncyB0byBHTSB2YWx1ZXNcclxuICAgICAgICB0aGlzLl9zZXRTZXR0aW5ncyhvYmopO1xyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHRoZSBjb25maXJtYXRpb24gbWVzc2FnZVxyXG4gICAgICAgIHNhdmVzdGF0ZS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2F2ZXN0YXRlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XHJcbiAgICAgICAgICAgIH0sIDIzNDUpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKE1QLkRFQlVHKSBjb25zb2xlLndhcm4oZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluc2VydHMgdGhlIHNldHRpbmdzIHBhZ2UuXHJcbiAgICAgKiBAcGFyYW0gcmVzdWx0IFZhbHVlIHRoYXQgbXVzdCBiZSBwYXNzZWQgZG93biBmcm9tIGBDaGVjay5wYWdlKCdzZXR0aW5ncycpYFxyXG4gICAgICogQHBhcmFtIHNldHRpbmdzIFRoZSBhcnJheSBvZiBmZWF0dXJlcyB0byBwcm92aWRlIHNldHRpbmdzIGZvclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGluaXQocmVzdWx0OiBib29sZWFuLCBzZXR0aW5nczogQW55RmVhdHVyZVtdKSB7XHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIG9ubHkgcnVuIGlmIGBDaGVjay5wYWdlKCdzZXR0aW5ncylgIHJldHVybnMgdHJ1ZSAmIGlzIHBhc3NlZCBoZXJlXHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICBpZiAoTVAuREVCVUcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZ3JvdXAoYG5ldyBTZXR0aW5ncygpYCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgc2V0dGluZ3MgdGFibGUgaGFzIGxvYWRlZFxyXG4gICAgICAgICAgICBhd2FpdCBDaGVjay5lbGVtTG9hZCgnI21haW5Cb2R5ID4gdGFibGUnKS50aGVuKChyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUubG9nKGBbTStdIFN0YXJ0aW5nIHRvIGJ1aWxkIFNldHRpbmdzIHRhYmxlLi4uYCk7XHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHRhYmxlIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nTmF2OiBFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5Cb2R5ID4gdGFibGUnKSE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nVGl0bGU6IEhUTUxIZWFkaW5nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gxJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nVGFibGU6IEhUTUxUYWJsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhZ2VTY29wZTogU2V0dGluZ0dsb2JPYmplY3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHRhYmxlIGVsZW1lbnRzIGFmdGVyIHRoZSBQcmVmIG5hdmJhclxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ05hdi5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RpdGxlKTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdUaXRsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgc2V0dGluZ1RhYmxlKTtcclxuICAgICAgICAgICAgICAgIFV0aWwuc2V0QXR0cihzZXR0aW5nVGFibGUsIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFzczogJ2NvbHRhYmxlJyxcclxuICAgICAgICAgICAgICAgICAgICBjZWxsc3BhY2luZzogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnd2lkdGg6MTAwJTttaW4td2lkdGg6MTAwJTttYXgtd2lkdGg6MTAwJTsnLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nVGl0bGUuaW5uZXJIVE1MID0gJ01BTSsgU2V0dGluZ3MnO1xyXG4gICAgICAgICAgICAgICAgLy8gR3JvdXAgc2V0dGluZ3MgYnkgcGFnZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0U2NvcGVzKHNldHRpbmdzKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRhYmxlIEhUTUwgZnJvbSBmZWF0dXJlIHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlU2NvcGUgPSBzY29wZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9idWlsZFRhYmxlKHNjb3Blcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgY29udGVudCBpbnRvIHRoZSBuZXcgdGFibGUgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdUYWJsZS5pbm5lckhUTUwgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTStdIEFkZGVkIHRoZSBNQU0rIFNldHRpbmdzIHRhYmxlIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFnZVNjb3BlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXRTZXR0aW5ncyhzY29wZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzZXR0aW5ncyBhcmUgZG9uZSBsb2FkaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHNjb3BlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9zdWJtaXQnKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weUJ0bjogSFRNTERpdkVsZW1lbnQgPSA8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21wX2NvcHknKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzdGVCdG46IEhUTUxEaXZFbGVtZW50ID0gPEhUTUxEaXZFbGVtZW50PihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtcF9pbmplY3QnKSFcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNzVGltZXI6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zYXZlU2V0dGluZ3Moc3NUaW1lciwgc2NvcGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbC5jbGlwYm9hcmRpZnlCdG4ocGFzdGVCdG4sIHRoaXMuX3Bhc3RlU2V0dGluZ3MsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWwuY2xpcGJvYXJkaWZ5QnRuKGNvcHlCdG4sIHRoaXMuX2NvcHlTZXR0aW5ncygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTVAuREVCVUcpIGNvbnNvbGUud2FybihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChNUC5ERUJVRykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidHlwZXMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic3R5bGUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2NvcmUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2dsb2JhbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvaG9tZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdG9yLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vbW9kdWxlcy9mb3J1bS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvc2hvdXQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL2Jyb3dzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvcmVxdWVzdC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdmF1bHQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tb2R1bGVzL3VwbG9hZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL21vZHVsZXMvdXNlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJmZWF0dXJlcy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzZXR0aW5ncy50c1wiIC8+XHJcblxyXG4vKipcclxuICogKiBVc2Vyc2NyaXB0IG5hbWVzcGFjZVxyXG4gKiBAY29uc3RhbnQgQ0hBTkdFTE9HOiBPYmplY3QgY29udGFpbmluZyBhIGxpc3Qgb2YgY2hhbmdlcyBhbmQga25vd24gYnVnc1xyXG4gKiBAY29uc3RhbnQgVElNRVNUQU1QOiBQbGFjZWhvbGRlciBob29rIGZvciB0aGUgY3VycmVudCBidWlsZCB0aW1lXHJcbiAqIEBjb25zdGFudCBWRVJTSU9OOiBUaGUgY3VycmVudCB1c2Vyc2NyaXB0IHZlcnNpb25cclxuICogQGNvbnN0YW50IFBSRVZfVkVSOiBUaGUgbGFzdCBpbnN0YWxsZWQgdXNlcnNjcmlwdCB2ZXJzaW9uXHJcbiAqIEBjb25zdGFudCBFUlJPUkxPRzogVGhlIHRhcmdldCBhcnJheSBmb3IgbG9nZ2luZyBlcnJvcnNcclxuICogQGNvbnN0YW50IFBBR0VfUEFUSDogVGhlIGN1cnJlbnQgcGFnZSBVUkwgd2l0aG91dCB0aGUgc2l0ZSBhZGRyZXNzXHJcbiAqIEBjb25zdGFudCBNUF9DU1M6IFRoZSBNQU0rIHN0eWxlc2hlZXRcclxuICogQGNvbnN0YW50IHJ1bigpOiBTdGFydHMgdGhlIHVzZXJzY3JpcHRcclxuICovXHJcbm5hbWVzcGFjZSBNUCB7XHJcbiAgICBleHBvcnQgY29uc3QgREVCVUc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBHTV9nZXRWYWx1ZSgnZGVidWcnKSA/IHRydWUgOiBmYWxzZTtcclxuICAgIGV4cG9ydCBjb25zdCBDSEFOR0VMT0c6IEFycmF5T2JqZWN0ID0ge1xyXG4gICAgICAgICAgICAgICAvKiDwn4aV4pm777iP8J+QniAqL1xyXG4gICAgICAgICAgICAgICBVUERBVEVfTElTVDogW1xyXG4gICAgICAgICAgICAgICAgICAgYOKZu++4jzogSW5jcmVhc2VkIHRpbWVvdXQgZGVsYXkgZm9yIE0rIGZlYXR1cmVzLmAsXHJcbiAgICAgICAgICAgICAgICAgICBg4pm777iPOiBSYXRpbyBQcm90ZWN0IGhhcyByZWFjaGVkIDIuMCBmZWF0dXJlIHBhcml0eSB3aXRoIEB5eXl6eno5OTkncyBzY3JpcHQuYCxcclxuICAgICAgICAgICAgICAgICAgIGDwn5CeOiBGaXhlZCBtaXNzaW5nIGRlcmVmZXJyYWwgb24gU2V0dGluZ3MgcGFnZS4gKFRoYW5rcywgQFRzYW5pISlgLFxyXG4gICAgICAgICAgICAgICBdIGFzIHN0cmluZ1tdLFxyXG4gICAgICAgICAgICAgICBCVUdfTElTVDogW10gYXMgc3RyaW5nW10sXHJcbiAgICAgICAgICAgfTtcclxuICAgIGV4cG9ydCBjb25zdCBUSU1FU1RBTVA6IHN0cmluZyA9ICcjI21ldGFfdGltZXN0YW1wIyMnO1xyXG4gICAgZXhwb3J0IGNvbnN0IFZFUlNJT046IHN0cmluZyA9IENoZWNrLm5ld1ZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBQUkVWX1ZFUjogc3RyaW5nIHwgdW5kZWZpbmVkID0gQ2hlY2sucHJldlZlcjtcclxuICAgIGV4cG9ydCBjb25zdCBFUlJPUkxPRzogc3RyaW5nW10gPSBbXTtcclxuICAgIGV4cG9ydCBjb25zdCBQQUdFX1BBVEg6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGV4cG9ydCBjb25zdCBNUF9DU1M6IFN0eWxlID0gbmV3IFN0eWxlKCk7XHJcbiAgICBleHBvcnQgY29uc3Qgc2V0dGluZ3NHbG9iOiBBbnlGZWF0dXJlW10gPSBbXTtcclxuXHJcbiAgICBleHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICogUFJFIFNDUklQVFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYFdlbGNvbWUgdG8gTUFNKyB2JHtWRVJTSU9OfSFgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgcGFnZSBpcyBub3QgeWV0IGtub3duXHJcbiAgICAgICAgR01fZGVsZXRlVmFsdWUoJ21wX2N1cnJlbnRQYWdlJyk7XHJcbiAgICAgICAgQ2hlY2sucGFnZSgpO1xyXG4gICAgICAgIC8vIEFkZCBhIHNpbXBsZSBjb29raWUgdG8gYW5ub3VuY2UgdGhlIHNjcmlwdCBpcyBiZWluZyB1c2VkXHJcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gJ21wX2VuYWJsZWQ9MTtkb21haW49bXlhbm9uYW1vdXNlLm5ldDtwYXRoPS87c2FtZXNpdGU9bGF4JztcclxuICAgICAgICAvLyBJbml0aWFsaXplIGNvcmUgZnVuY3Rpb25zXHJcbiAgICAgICAgY29uc3QgYWxlcnRzOiBBbGVydHMgPSBuZXcgQWxlcnRzKCk7XHJcbiAgICAgICAgbmV3IERlYnVnKCk7XHJcbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIGlmIHRoZSBzY3JpcHQgd2FzIHVwZGF0ZWRcclxuICAgICAgICBDaGVjay51cGRhdGVkKCkudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIGFsZXJ0cy5ub3RpZnkocmVzdWx0LCBDSEFOR0VMT0cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGZlYXR1cmVzXHJcbiAgICAgICAgbmV3IEluaXRGZWF0dXJlcygpO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAqIFNFVFRJTkdTXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQ2hlY2sucGFnZSgnc2V0dGluZ3MnKS50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc3ViUGc6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgJiYgKHN1YlBnID09PSAnJyB8fCBzdWJQZyA9PT0gJz92aWV3PWdlbmVyYWwnKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2V0dGluZ3MgcGFnZVxyXG4gICAgICAgICAgICAgICAgU2V0dGluZ3MuaW5pdChyZXN1bHQsIHNldHRpbmdzR2xvYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKiBTVFlMRVNcclxuICAgICAgICAgKiBJbmplY3RzIENTU1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIENoZWNrLmVsZW1Mb2FkKCdoZWFkIGxpbmtbaHJlZio9XCJJQ0dzdGF0aW9uXCJdJykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEFkZCBjdXN0b20gQ1NTIHNoZWV0XHJcbiAgICAgICAgICAgIE1QX0NTUy5pbmplY3RMaW5rKCk7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgY3VycmVudCBzaXRlIHRoZW1lXHJcbiAgICAgICAgICAgIE1QX0NTUy5hbGlnblRvU2l0ZVRoZW1lKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vICogU3RhcnQgdGhlIHVzZXJzY3JpcHRcclxuTVAucnVuKCk7XHJcbiJdfQ==
