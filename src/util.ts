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
        page?:ValidPage
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
            if (page) {
                // Are we on the right page?
                const result = await Check.page(page)
                if (result === true) return run(); // Yes
                else return false; // No
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
}
