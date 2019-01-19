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
    public static updated():Promise<string|boolean> {
        if (MP.DEBUG) {
            console.group('Check.updated()');
            console.log(`PREV VER = ${this.prevVer}`);
            console.log(`NEW VER = ${this.newVer}`);
        }
        return new Promise( (resolve) => {
            // Different versions; the script was updated
            if (this.newVer !== this.prevVer) {
                if (MP.DEBUG) { console.log('Script is new or updated'); }
                // Store the new version
                GM_setValue('mp_version', this.newVer);
                if (this.prevVer) {
                    // The script has run before
                    if (MP.DEBUG) {
                        console.log('Script has run before'); console.groupEnd();
                    }
                    resolve('updated');
                } else {
                    // First-time run
                    if (MP.DEBUG) {
                        console.log('Script has never run'); console.groupEnd();
                    }
                    // Enable the most basic features
                    GM_setValue('goodreadsBtn', true);
                    GM_setValue('alerts', true);
                    resolve('firstRun');
                }
            } else {
                if (MP.DEBUG) {
                    console.log('Script not updated'); console.groupEnd();
                }
                resolve(false);
            }
        } );
    }

    /**
     * Check to see what page is being accessed
     */
    public static page(pageQuery?:ValidPage):Promise<string|boolean>{
        if (MP.DEBUG) { console.group(`Check.page()`); }
        return new Promise( (resolve) => {
            // Grab the URL and slice out the good bits
            const path:string = window.location.pathname;
            const pageStr:string = path.split('/')[1];
            const subPage:string|undefined = path.split('/')[2];
            let currentPage: string;
            // Create an object literal of sorts to use as a "switch"
            const cases:StringObject = {
                ''           : 'home',
                'index.php'  : 'home',
                'shoutbox'   : 'shoutbox',
                't'          : 'torrent',
                'preferences': 'settings',
                'u'          : 'user',
                'tor'        : subPage,
                'millionaires': subPage,
            };
        /* I can't figure out how to provide typing for an object-literal with
         * functions inside it, so we use IFs on the subPage after the fact */
            if (MP.DEBUG) { console.log(`Page @ ${pageStr}\nSubpage @ ${subPage}`); }
            if( cases[pageStr] ){
                if( cases[pageStr] === subPage ){
                    currentPage = subPage.split('.')[0];
                }else{
                    currentPage = cases[pageStr];
                }
                if (MP.DEBUG) { console.log(`Currently on ${currentPage} page`); }

                // If we're just checking what page we're on, return the page
                if (!pageQuery) {
                    resolve(currentPage);
                // If we're checking for a specific page, return TRUE/FALSE
                } else if (pageQuery === currentPage) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }else{
                if (MP.DEBUG) { console.warn(`pageStr case returns '${cases[pageStr]}'`); }
            }
            if (MP.DEBUG) { console.groupEnd(); }
        } );
    }
}
