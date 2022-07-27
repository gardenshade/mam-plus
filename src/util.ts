/**
 * Class containing common utility methods
 *
 * If the method should have user-changeable settings, consider using `Core.ts` instead
 */

class Util {
    /**
     * Animation frame timer
     */
    public static afTimer(): Promise<number> {
        return new Promise((resolve) => {
            requestAnimationFrame(resolve);
        });
    }
    /**
     * Allows setting multiple attributes at once
     */
    public static setAttr(el: Element, attr: StringObject): Promise<void> {
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
    public static objectLength(obj: Object): number {
        return Object.keys(obj).length;
    }

    /**
     * Forcefully empties any GM stored values
     */
    public static purgeSettings(): void {
        for (const value of GM_listValues()) {
            GM_deleteValue(value);
        }
    }

    /**
     * Log a message about a counted result
     */
    public static reportCount(did: string, num: number, thing: string): void {
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
    public static async startFeature(
        settings: FeatureSettings,
        elem: string,
        page?: ValidPage[]
    ): Promise<boolean> {
        // Queue the settings in case they're needed
        MP.settingsGlob.push(settings);

        // Function to return true when the element is loaded
        async function run() {
            const timer: Promise<false> = new Promise((resolve) =>
                setTimeout(resolve, 2000, false)
            );
            const checkElem = Check.elemLoad(elem);
            return Promise.race([timer, checkElem]).then((val) => {
                if (val) {
                    return true;
                } else {
                    console.warn(
                        `startFeature(${settings.title}) Unable to initiate! Could not find element: ${elem}`
                    );
                    return false;
                }
            });
        }

        // Is the setting enabled?
        if (GM_getValue(settings.title)) {
            // A specific page is needed
            if (page && page.length > 0) {
                // Loop over all required pages
                const results: boolean[] = [];
                await page.forEach((p) => {
                    Check.page(p).then((r) => {
                        results.push(<boolean>r);
                    });
                });
                // If any requested page matches the current page, run the feature
                if (results.includes(true) === true) return run();
                else return false;

                // Skip to element checking
            } else {
                return run();
            }
            // Setting is not enabled
        } else {
            return false;
        }
    }

    /**
     * Trims a string longer than a specified char limit, to a full word
     */
    public static trimString(inp: string, max: number): string {
        if (inp.length > max) {
            inp = inp.substring(0, max + 1);
            inp = inp.substring(0, Math.min(inp.length, inp.lastIndexOf(' ')));
        }
        return inp;
    }

    /**
     * Removes brackets & all contained words from a string
     */
    public static bracketRemover(inp: string): string {
        return inp
            .replace(/{+.*?}+/g, '')
            .replace(/\[\[|\]\]/g, '')
            .replace(/<.*?>/g, '')
            .replace(/\(.*?\)/g, '')
            .trim();
    }
    /**
     *Return the contents between brackets
     *
     * @static
     * @memberof Util
     */
    public static bracketContents = (inp: string) => {
        return inp.match(/\(([^)]+)\)/)![1];
    };

    /**
     * Converts a string to an array
     */
    public static stringToArray(inp: string, splitPoint?: 'ws'): string[] {
        return splitPoint !== undefined && splitPoint !== 'ws'
            ? inp.split(splitPoint)
            : inp.match(/\S+/g) || [];
    }

    /**
     * Converts a comma (or other) separated value into an array
     * @param inp String to be divided
     * @param divider The divider (default: ',')
     */
    public static csvToArray(inp: string, divider: string = ','): string[] {
        const arr: string[] = [];
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
    public static arrayToString(inp: string[], end?: number): string {
        let outp: string = '';
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
    public static nodeToElem(node: Node): HTMLElement {
        if (node.firstChild !== null) {
            return <HTMLElement>node.firstChild!.parentElement!;
        } else {
            console.warn('Node-to-elem without childnode is untested');
            const tempNode: Node = node;
            node.appendChild(tempNode);
            const selected: HTMLElement = <HTMLElement>node.firstChild!.parentElement!;
            node.removeChild(tempNode);
            return selected;
        }
    }

    /**
     * Match strings while ignoring case sensitivity
     * @param a First string
     * @param b Second string
     */
    public static caselessStringMatch(a: string, b: string): boolean {
        const compare: number = a.localeCompare(b, 'en', {
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
    public static addTorDetailsRow(
        tar: HTMLDivElement | null,
        label: string,
        rowClass: string
    ): HTMLDivElement {
        if (MP.DEBUG) console.log(tar);

        if (tar === null || tar.parentElement === null) {
            throw new Error(`Add Tor Details Row: empty node or parent node @ ${tar}`);
        } else {
            tar.parentElement.insertAdjacentHTML(
                'afterend',
                `<div class="torDetRow"><div class="torDetLeft">${label}</div><div class="torDetRight ${rowClass}"><span class="flex"></span></div></div>`
            );

            return <HTMLDivElement>document.querySelector(`.${rowClass} .flex`);
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
    public static createLinkButton(
        tar: HTMLElement,
        url: string = 'none',
        text: string,
        order: number = 0
    ): void {
        // Create the button
        const button: HTMLAnchorElement = document.createElement('a');
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
    public static createButton(
        id: string,
        text: string,
        type: string = 'h1',
        tar: string | HTMLElement,
        relative: 'beforebegin' | 'afterend' = 'afterend',
        btnClass: string = 'mp_btn'
    ): Promise<HTMLElement> {
        return new Promise((resolve, reject) => {
            // Choose the new button insert location and insert elements
            // const target: HTMLElement | null = <HTMLElement>document.querySelector(tar);
            const target: HTMLElement | null =
                typeof tar === 'string' ? document.querySelector(tar) : tar;
            const btn: HTMLElement = document.createElement(type);

            if (target === null) {
                reject(`${tar} is null!`);
            } else {
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
    public static clipboardifyBtn(
        btn: HTMLElement,
        payload: any,
        copy: boolean = true
    ): void {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            // Have to override the Navigator type to prevent TS errors
            const nav: NavigatorExtended | undefined = <NavigatorExtended>navigator;
            if (nav === undefined) {
                alert('Failed to copy text, likely due to missing browser support.');
                throw new Error("browser doesn't support 'navigator'?");
            } else {
                /* Navigator Exists */

                if (copy && typeof payload === 'string') {
                    // Copy results to clipboard
                    nav.clipboard!.writeText(payload);
                    console.log('[M+] Copied to your clipboard!');
                } else {
                    // Run payload function with clipboard text
                    nav.clipboard!.readText().then((text) => {
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
    public static getJSON(url: string): Promise<string> {
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
     * Returns a random number between two parameters
     * @param min a number of the bottom of random number pool
     * @param max a number of the top of the random number pool
     */
    public static randomNumber = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * Sleep util to be used in async functions to delay program
     */
    public static sleep = (m: any): Promise<void> => new Promise((r) => setTimeout(r, m));

    /**
     * Return the last section of an HREF
     * @param elem An anchor element
     * @param split Optional divider. Defaults to `/`
     */
    public static endOfHref = (elem: HTMLAnchorElement, split = '/') =>
        elem.href.split(split).pop();

    /**
     * Return the hex value of a component as a string.
     * From https://stackoverflow.com/questions/5623838
     *
     * @static
     * @param {number} c
     * @returns {string}
     * @memberof Util
     */
    public static componentToHex = (c: number | string): string => {
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
    public static rgbToHex = (r: number, g: number, b: number): string => {
        return `#${Util.componentToHex(r)}${Util.componentToHex(g)}${Util.componentToHex(
            b
        )}`;
    };

    /**
     * Extract numbers (with float) from text and return them
     * @param tar An HTML element that contains numbers
     */
    public static extractFloat = (tar: HTMLElement): number[] => {
        if (tar.textContent) {
            return (tar.textContent!.replace(/,/g, '').match(/\d+\.\d+/) || []).map((n) =>
                parseFloat(n)
            );
        } else {
            throw new Error('Target contains no text');
        }
    };

    /**
     * #### Get the user gift history between the logged in user and a given ID
     * @param userID A user ID; can be a string or number
     */
    public static async getUserGiftHistory(
        userID: number | string
    ): Promise<UserGiftHistory[]> {
        const rawGiftHistory: string = await Util.getJSON(
            `https://www.myanonamouse.net/json/userBonusHistory.php?other_userid=${userID}`
        );
        const giftHistory: Array<UserGiftHistory> = JSON.parse(rawGiftHistory);
        // Return the full data
        return giftHistory;
    }

    public static prettySiteTime(unixTimestamp: number, date?: boolean, time?: boolean) {
        const timestamp = new Date(unixTimestamp * 1000).toISOString();
        if (date && !time) {
            return timestamp.split('T')[0];
        } else if (!date && time) {
            return timestamp.split('T')[1];
        } else {
            return timestamp;
        }
    }

    /**
     * #### Check a string to see if it's divided with a dash, returning the first half if it doesn't contain a specified string
     * @param original The original string being checked
     * @param contained A string that might be contained in the original
     */
    public static checkDashes(original: string, contained: string): string {
        if (MP.DEBUG) {
            console.log(
                `checkDashes( ${original}, ${contained} ): Count ${original.indexOf(
                    ' - '
                )}`
            );
        }

        // Dashes are present
        if (original.indexOf(' - ') !== -1) {
            if (MP.DEBUG) {
                console.log(`String contains a dash`);
            }
            const split: string[] = original.split(' - ');
            if (split[0] === contained) {
                if (MP.DEBUG) {
                    console.log(
                        `> String before dash is "${contained}"; using string behind dash`
                    );
                }
                return split[1];
            } else {
                return split[0];
            }
        } else {
            return original;
        }
    }

    /**
     * ## Utilities specific to Goodreads
     */
    public static goodreads = {
        /**
         * * Removes spaces in author names that use adjacent intitials.
         * @param auth The author(s)
         * @example "H G Wells" -> "HG Wells"
         */
        smartAuth: (auth: string): string => {
            let outp: string = '';
            const arr: string[] = Util.stringToArray(auth);
            arr.forEach((key, val) => {
                // Current key is an initial
                if (key.length < 2) {
                    // If next key is an initial, don't add a space
                    const nextLeng: number = arr[val + 1].length;
                    if (nextLeng < 2) {
                        outp += key;
                    } else {
                        outp += `${key} `;
                    }
                } else {
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
        buildSearchURL: (type: BookData | 'on', inp: string): string => {
            if (MP.DEBUG) {
                console.log(`goodreads.buildGrSearchURL( ${type}, ${inp} )`);
            }

            let grType: string = type;
            const cases: any = {
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
            return `https://r.mrd.ninja/https://www.goodreads.com/search?q=${encodeURIComponent(
                inp.replace('%', '')
            ).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;
        },
    };

    /**
     * #### Return a cleaned book title from an element
     * @param data The element containing the title text
     * @param auth A string of authors
     */
    public static getBookTitle = async (
        data: HTMLSpanElement | null,
        auth: string = ''
    ) => {
        if (data === null) {
            throw new Error('getBookTitle() failed; element was null!');
        }
        let extracted = data.innerText;
        // Shorten title and check it for brackets & author names
        extracted = Util.trimString(Util.bracketRemover(extracted), 50);
        extracted = Util.checkDashes(extracted, auth);
        return extracted;
    };

    /**
     * #### Return GR-formatted authors as an array limited to `num`
     * @param data The element containing the author links
     * @param num The number of authors to return. Default 3
     */
    public static getBookAuthors = async (
        data: NodeListOf<HTMLAnchorElement> | null,
        num: number = 3
    ) => {
        if (data === null) {
            console.warn('getBookAuthors() failed; element was null!');
            return [];
        } else {
            const authList: string[] = [];
            data.forEach((author) => {
                if (num > 0) {
                    authList.push(Util.goodreads.smartAuth(author.innerText));
                    num--;
                }
            });
            return authList;
        }
    };

    /**
     * #### Return series as an array
     * @param data The element containing the series links
     */
    public static getBookSeries = async (data: NodeListOf<HTMLAnchorElement> | null) => {
        if (data === null) {
            console.warn('getBookSeries() failed; element was null!');
            return [];
        } else {
            const seriesList: string[] = [];
            data.forEach((series) => {
                seriesList.push(series.innerText);
            });
            return seriesList;
        }
    };

    /**
     * #### Return a table-like array of rows as an object.
     * Store the returned object and access using the row title, ex. `stored['Title:']`
     * @param rowList An array of table-like rows
     * @param titleClass The class used by the title cells. Default `.torDetLeft`
     * @param dataClass The class used by the data cells. Default `.torDetRight`
     */
    public static rowsToObj = (
        rowList: NodeListOf<Element>,
        titleClass = '.torDetLeft',
        dataClass = '.torDetRight'
    ) => {
        if (rowList.length < 1) {
            throw new Error(`Util.rowsToObj( ${rowList} ): Row list was empty!`);
        }
        const rows: any[] = [];

        rowList.forEach((row) => {
            const title: HTMLDivElement | null = row.querySelector(titleClass);
            const data: HTMLDivElement | null = row.querySelector(dataClass);
            if (title) {
                rows.push({
                    key: title.textContent,
                    value: data,
                });
            } else {
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
    public static formatBytes = (bytes: number, b = 2) => {
        if (bytes === 0) return '0 Bytes';
        const c = 0 > b ? 0 : b;
        const index = Math.floor(Math.log(bytes) / Math.log(1024));
        return (
            parseFloat((bytes / Math.pow(1024, index)).toFixed(c)) +
            ' ' +
            ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][index]
        );
    };

    public static derefer = (url: string) => {
        return `https://r.mrd.ninja/${encodeURI(url)}`;
    };

    public static delay = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };
}
