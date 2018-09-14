/// <reference path="style.ts" />
/**
 * Userscript namespace
 * @constant CHANGELOG: Object containing a list of changes and known bugs
 * @constant TIMESTAMP: Placeholder hook for the current build time
 * @constant VERSION: The current userscript version
 * @constant PREV_VER: The last installed userscript version
 * @var errorLog: The target array for logging errors
 * @var pagePath: The current page URL without the site address
 */
namespace MP {
    export const CHANGELOG:object = {
        UPDATE_LIST: [
            'CODE: Moved from Coffeescript to Typescript to allow for better practices and easier contribution',
        ] as string[],
        BUG_LIST: [
            //
        ] as string[],
    };
    export const TIMESTAMP:string = '##meta_timestamp##';
    export const VERSION:string = GM_info.script.version;
    export const PREV_VER:string = GM_getValue('mp_version');
    export let errorLog:string[] = [];
    export let pagePath:string = window.location.pathname;
    export let mpCss:MP_Style = new MP_Style();

    export const run = () => {
        console.group(`Welcome to MAM+ v${VERSION}!`);

        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/'

        // Add the M+ stylesheet
        GM_addStyle( GM_getResourceText( 'MP_CSS' ) );

        /**
         * AFTER PAGE LOAD
         * For anything that requires the DOM
         */

        window.addEventListener('load', () => {
            // null
        });

        console.groupEnd();
    }
}

// Start the userscript
MP.run();
