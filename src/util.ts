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

    public static caselessStringMatch( a:string, b:string ):boolean{
        let compare: number = a.localeCompare(b, 'en', { sensitivity: 'base' });
        return (compare === 0) ? true : false;
    }

    public static async addTorDetailsRow( tar:HTMLDivElement|null, label:string, rowClass:string ):Promise<HTMLDivElement>{
        if (tar === null || tar.parentElement === null) {
            throw new Error(`Add Tor Details Row: empty node or parent node @ ${tar}`)
        } else {
            tar.parentElement.insertAdjacentHTML('afterend', `<div class="torDetRow"><div class="torDetLeft">${label}</div><div class="torDetRight ${rowClass}"><span class="flex"></span></div></div>`);

            return <HTMLDivElement>document.querySelector(`.${rowClass} .flex`);
        }
    }
}
