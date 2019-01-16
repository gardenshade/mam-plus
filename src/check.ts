/// <reference path="util.ts" />
/**
 * Class for handling validation & confirmation
 */

class Check {
    public static newVer: string = GM_info.script.version;
    public static prevVer: string | undefined = GM_getValue('mp_version');

    /**
     * Checks to see if an element exists, then resolves a promise when it exists
     */
    public static elemLoad( selector:string ):Promise<Element|void> {
        const elem:Element|null = document.querySelector(selector);
        if( elem === null ) {
            return Util.afTimer().then( () => {
                this.elemLoad( selector );
            } );
        } else {
            return Promise.resolve( elem );
        }
    }

    /**
     * Checks to see if the script has been updated from an older version
     */
    public static updated():string|boolean {
        if(MP.DEBUG) {
            console.group('Check.updated()');
            console.log(`PREV VER = ${this.prevVer}`);
            console.log(`NEW VER = ${this.newVer}`);
        }
        // Different versions; the script was updated
        if(this.newVer !== this.prevVer) {
            if(MP.DEBUG) { console.log('Script is new or updated'); }
            // Store the new version
            GM_setValue('mp_version',this.newVer);
            if( this.prevVer ) {
                // The script has run before
                if (MP.DEBUG) {
                    console.log('Script has run before'); console.groupEnd(); }
                return 'updated';
            } else {
                // First-time run
                if (MP.DEBUG) {
                    console.log('Script has never run'); console.groupEnd(); }
                // Enable the most basic features
                GM_setValue('goodreadsBtn',true);
                GM_setValue('alerts',true);
                return 'firstRun';
            }
        } else {
            if (MP.DEBUG) {
                console.log('Script not updated'); console.groupEnd(); }
            return false;
        }
    }
}
