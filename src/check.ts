/// <reference path="util.ts" />
/**
 * # Class for handling validation & confirmation
 */
class Check {
    public static newVer: string = GM_info.script.version;
    public static prevVer: string | undefined = GM_getValue('mp_version');

    /**
     * * Wait for an element to exist, then return it
     * @param {string} selector - The DOM string that will be used to select an element
     * @return {Promise<HTMLElement>} Promise of an element that was selected
     */
    public static async elemLoad(
        selector: string | HTMLElement
    ): Promise<HTMLElement | false> {
        if (MP.DEBUG) {
            console.log(`%c Looking for ${selector}`, 'background: #222; color: #555');
        }
        let _counter = 0;
        const _counterLimit = 200;
        const logic = async (
            selector: string | HTMLElement
        ): Promise<HTMLElement | false> => {
            // Select the actual element
            const elem: HTMLElement | null =
                typeof selector === 'string'
                    ? document.querySelector(selector)
                    : selector;

            if (elem === undefined) {
                throw `${selector} is undefined!`;
            }
            if (elem === null && _counter < _counterLimit) {
                await Util.afTimer();
                _counter++;
                return await logic(selector);
            } else if (elem === null && _counter >= _counterLimit) {
                _counter = 0;
                return false;
            } else if (elem) {
                return elem;
            } else {
                return false;
            }
        };

        return logic(selector);
    }

    /**
     * * Run a function whenever an element changes
     * @param selector - The element to be observed. Can be a string.
     * @param callback - The function to run when the observer triggers
     * @return Promise of a mutation observer
     */
    public static async elemObserver(
        selector: string | HTMLElement | null,
        callback: MutationCallback,
        config: MutationObserverInit = {
            childList: true,
            attributes: true,
        }
    ): Promise<MutationObserver> {
        let selected: HTMLElement | null = null;
        if (typeof selector === 'string') {
            selected = <HTMLElement | null>document.querySelector(selector);
            if (selected === null) {
                throw new Error(`Couldn't find '${selector}'`);
            }
        }
        if (MP.DEBUG) {
            console.log(
                `%c Setting observer on ${selector}: ${selected}`,
                'background: #222; color: #5d8aa8'
            );
        }
        const observer: MutationObserver = new MutationObserver(callback);

        observer.observe(selected!, config);
        return observer;
    }

    /**
     * * Check to see if the script has been updated from an older version
     * @return The version string or false
     */
    public static updated(): Promise<string | boolean> {
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
                } else {
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
            } else {
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
    public static page(pageQuery?: ValidPage): Promise<string | boolean> {
        const storedPage = GM_getValue('mp_currentPage');
        let currentPage: ValidPage | undefined = undefined;

        return new Promise((resolve) => {
            // Check.page() has been run and a value was stored
            if (storedPage !== undefined) {
                // If we're just checking what page we're on, return the stored page
                if (!pageQuery) {
                    resolve(storedPage);
                    // If we're checking for a specific page, return TRUE/FALSE
                } else if (pageQuery === storedPage) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                // Check.page() has not previous run
            } else {
                // Get the current page
                let path: string = window.location.pathname;
                path = path.indexOf('.php') ? path.split('.php')[0] : path;
                const page = path.split('/');
                page.shift();

                if (MP.DEBUG) {
                    console.log(`Page URL @ ${page.join(' -> ')}`);
                }

                // Create an object literal of sorts to use as a "switch"
                const cases: { [key: string]: () => ValidPage | undefined } = {
                    '': () => 'home',
                    index: () => 'home',
                    shoutbox: () => 'shoutbox',
                    preferences: () => 'settings',
                    millionaires: () => 'vault',
                    t: () => 'torrent',
                    u: () => 'user',
                    f: () => {
                        if (page[1] === 't') return 'forum thread';
                    },
                    tor: () => {
                        if (page[1] === 'browse') return 'browse';
                        else if (page[1] === 'requests2') return 'request';
                        else if (page[1] === 'viewRequest') return 'request details';
                        else if (page[1] === 'upload') return 'upload';
                    },
                };

                // Check to see if we have a case that matches the current page
                if (cases[page[0]]) {
                    currentPage = cases[page[0]]();
                } else {
                    console.warn(`Page "${page}" is not a valid M+ page. Path: ${path}`);
                }

                if (currentPage !== undefined) {
                    // Save the current page to be accessed later
                    GM_setValue('mp_currentPage', currentPage);

                    // If we're just checking what page we're on, return the page
                    if (!pageQuery) {
                        resolve(currentPage);
                        // If we're checking for a specific page, return TRUE/FALSE
                    } else if (pageQuery === currentPage) {
                        resolve(true);
                    } else {
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
    public static isBookCat(cat: number): boolean {
        // Currently, all book categories are assumed to be in the range of 39-120
        return cat >= 39 && cat <= 120 ? true : false;
    }
}
