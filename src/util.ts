/**
 * Class containing common utility methods
 *
 * If the method should have user-changeable settings, consider using `Core.ts` instead
 */

class Util {
    /**
     * Animation frame timer
     */
    public static afTimer():Promise<number> {
        return new Promise( (resolve) => {
            requestAnimationFrame(resolve);
        } );
    }
    /**
     * Allows setting multiple attributes at once
     */
    public static setAttr(el:Element,attr:StringObject):Promise<void>{
        return new Promise( resolve => {
            for(const key in attr){
                el.setAttribute(key,attr[key]);
            }
            resolve();
        });
    }

    /**
     * Returns the "length" of an Object
     */
    public static objectLength( obj:Object ):number{
        return Object.keys(obj).length;
    }

    /**
     * Forcefully empties any GM stored values
     */
    public static purgeSettings():void{
        for ( let value of GM_listValues() ) {
            GM_deleteValue(value);
        }
    }

    /**
     * Log a message about a counted result
     */
    public static reportCount(did:string,num:number,thing:string):void{
        if(num !== 1){ thing += 's' }
        if(MP.DEBUG) { console.log(`> ${did} ${num} ${thing}`);}
    }

    /**
     * Initializes a feature
     */
    public static async startFeature(
        settings:FeatureSettings,
        elem:string,
        page?:ValidPage[]
    ): Promise<boolean>{
        // Queue the settings in case they're needed
        MP.settingsGlob.push(settings);

        // Function to return true when the element is loaded
        async function run () {
            await Check.elemLoad(elem);
            return true;
        }

        // Is the setting enabled?
        if (GM_getValue(settings.title)) {
            // A specific page is needed
            if( page && page.length > 0 ){
                // Loop over all required pages
                let results:boolean[] = [];
                await page.forEach( p => {
                    Check.page(p)
                    .then( r => { results.push( <boolean>r ); });
                } );
                // If any requested page matches the current page, run the feature
                if (results.includes(true) === true) return run();
                else return false;

            // Skip to element checking
            } else {
                return run();
            }
        // Setting is not enabled
        }else{
            return false;
        }
    }

    /**
     * Trims a string longer than a specified char limit, to a full word
     */
    public static trimString( inp:string,max:number ):string{
        if(inp.length > max){
            inp = inp.substring( 0,max+1 );
            inp = inp.substring( 0, (Math.min( inp.length,inp.lastIndexOf(' ') )) )
        }
        return inp;
    }

    /**
     * Removes brackets & all contained words from a string
     */
    public static bracketRemover( inp:string ):string{
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
    public static stringToArray( inp:string, splitPoint?:"ws" ):string[]{
        return ((splitPoint != null) && (splitPoint !== 'ws') ? inp.split(splitPoint) : inp.match(/\S+/g) || []);
    }

    /**
     * Converts a comma (or other) separated value into an array
     * @param inp String to be divided
     * @param divider The divider (default: ',')
     */
    public static csvToArray( inp:string, divider:string = ',' ):string[]{
        let arr: string[] = [];
        inp.split(divider).forEach(item => {
            arr.push(item.trim());
        })
        return arr;
    }

    /**
     * Convert an array to a string
     * @param inp string
     * @param end cut-off point
     */
    public static arrayToString( inp:string[], end?:number ):string {
        let outp:string = '';
        inp.forEach( (key, val) => {
            outp += key;
            if(end && (val+1 !== inp.length)){
                outp += ' ';
            }
        } );
        return outp;
    }

    /**
     * Converts a DOM node reference into an HTML Element reference
     * @param node The node to convert
     */
    public static nodeToElem( node:Node ):HTMLElement{
        if(node.firstChild !== null){
            return <HTMLElement>node.firstChild!.parentElement!;
        }else{
            console.warn('🔥 Node-to-elem without childnode is untested');
            let tempNode:Node = node;
            node.appendChild(tempNode);
            let selected:HTMLElement = <HTMLElement>node.firstChild!.parentElement!;
            node.removeChild(tempNode);
            return selected;
        }
    }

    /**
     * Match strings while ignoring case sensitivity
     * @param a First string
     * @param b Second string
     */
    public static caselessStringMatch( a:string, b:string ):boolean{
        let compare: number = a.localeCompare(b, 'en', { sensitivity: 'base' });
        return (compare === 0) ? true : false;
    }

    /**
     * Add a new TorDetRow and return the inner div
     * @param tar The row to be targetted
     * @param label The name to be displayed for the new row
     * @param rowClass The row's classname (should start with mp_)
     */
    public static async addTorDetailsRow( tar:HTMLDivElement|null, label:string, rowClass:string ):Promise<HTMLDivElement>{
        if (tar === null || tar.parentElement === null) {
            throw new Error(`Add Tor Details Row: empty node or parent node @ ${tar}`)
        } else {
            tar.parentElement.insertAdjacentHTML('afterend', `<div class="torDetRow"><div class="torDetLeft">${label}</div><div class="torDetRight ${rowClass}"><span class="flex"></span></div></div>`);

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
    public static createLinkButton(tar: HTMLElement, url: string = 'none', text: string, order: number = 0 ):void {
        // Create the button
        let button: HTMLAnchorElement = document.createElement('a');
        // Set up the button
        button.classList.add('mp_button_clone');
        if(url !== 'none'){
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
    public static createButton(id: string, text: string, type: string = 'h1', tar: string, relative: "beforebegin" | "afterend" = "afterend", btnClass: string = "mp_btn"): Promise<HTMLElement> {
        return new Promise((resolve, reject) => {
            // Choose the new button insert location and insert elements
            const target: HTMLElement | null = <HTMLElement>document.querySelector(tar);
            const btn: HTMLElement = document.createElement(type);

            if (target === null) {
                reject(`${tar} is null!`);
            }

            target.insertAdjacentElement(relative, btn);
            Util.setAttr(btn, {
                "id": `mp_${id}`,
                "class": btnClass,
                "role": "button"
            });
            // Set initial button text
            btn.innerHTML = text;
            resolve(btn);
        });
    }

    /**
     * Converts an element into a button that, when clicked, copies text to clipboard
     * @param btn An HTML Element being used as a button
     * @param text The text that will be copied to clipboard on button click
     */
    public static clipboardifyBtn(btn:HTMLElement,text:string):void{
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            // Have to override the Navigator type to prevent TS errors
            let nav: NavigatorExtended | undefined = <NavigatorExtended>navigator;
            if (nav === undefined) {
                alert('Failed to copy text, likely due to missing browser support.');
                throw new Error("browser doesn't support 'navigator'?")
            } else {
                // Copy results to clipboard
                nav.clipboard!.writeText(text);
                btn.style.color = 'green';
                console.log('[M+] Copied to your clipboard!');
            }
        } );
    }
}
