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
}
