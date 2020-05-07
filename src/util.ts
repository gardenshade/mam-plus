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
            await Check.elemLoad(elem);
            return true;
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
        tar: string,
        relative: 'beforebegin' | 'afterend' = 'afterend',
        btnClass: string = 'mp_btn'
    ): Promise<HTMLElement> {
        return new Promise((resolve, reject) => {
            // Choose the new button insert location and insert elements
            const target: HTMLElement | null = <HTMLElement>document.querySelector(tar);
            const btn: HTMLElement = document.createElement(type);

            if (target === null) {
                reject(`${tar} is null!`);
            }

            target.insertAdjacentElement(relative, btn);
            Util.setAttr(btn, {
                id: `mp_${id}`,
                class: btnClass,
                role: 'button',
            });
            // Set initial button text
            btn.innerHTML = text;
            resolve(btn);
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
	public static getJSON(
        url: string
    ): Promise<string> {
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
	public static randomNumber(
        min: number,
		max: number
    ): number {
        	return(Math.floor(Math.random() * (max - min + 1) + min));
	}
	
	/**
     * Trims the gifted list to last 50 names to avoid getting too large over time.
     */
	public static trimGiftList(
        ): void {
			//if value exists in GM
			if(GM_getValue("stor_lastNewGifted")){
				//GM value is a comma delim value, split value into array of names
				let giftNames = GM_getValue("stor_lastNewGifted").split(",");
				let newGiftNames: string = "";
				if(giftNames.length > 50){
					for (const giftName of giftNames){
						if(giftNames.indexOf(giftName)<= 49){
							//rebuild a comma delim string out of the first 49 names
							newGiftNames = newGiftNames+giftName+",";
							//set new string in GM
							GM_setValue("stor_lastNewGifted", newGiftNames);
						}
						else {break;}
					}
				}
			} else {
				//set value if doesnt exist
				GM_setValue("stor_lastNewGifted", "");
			}
	}
	
	/**
     * Sleep util to be used in async functions to delay program
     */
	public static sleep = (m: any) => new Promise(r => setTimeout(r, m))
	
}
