/// <reference path="types.ts" />
/// <reference path="style.ts" />
/// <reference path="./modules/core.ts" />
/// <reference path="./modules/global.ts" />
/// <reference path="./modules/tor.ts" />
/// <reference path="./modules/shout.ts" />
/// <reference path="./modules/browse.ts" />
/// <reference path="./modules/request.ts" />
/// <reference path="./modules/vault.ts" />
/// <reference path="./modules/user.ts" />
/// <reference path="features.ts" />
/// <reference path="settings.ts" />

/**
 * BREAKING CHANGES INTRODUCED WHILE CODING
 * None yet...
 */

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
    export const DEBUG: boolean | undefined = (GM_getValue('debug')) ? true : false;
    export const CHANGELOG:ArrayObject = {
        /* 🆕🐞♻️ */
        UPDATE_LIST: [
            '🆕: Added ability to send gifts from Shoutbox dot menu',
            '🐞: Tags no longer appear twice when navigating Prev/Next',
            '🐞: Tags that contained HTML entities (ex. >) were being sliced incorrectly',
            '🐞: Added a space behind the username when using Simple Quote',
            '🐞: Fixed an issue (hopefully) where gifting a user would throw errors in the dev console',
            '🐞: Fixed an issue (hopefully) where styling of shoutbox gifting success/fail was not displaying',
        ] as string[],
        BUG_LIST: [
        ] as string[],
    };
    export const TIMESTAMP:string = '##meta_timestamp##';
    export const VERSION:string = Check.newVer;
    export const PREV_VER:string|undefined = Check.prevVer;
    export let errorLog:string[] = [];
    export let pagePath:string = window.location.pathname;
    export let mpCss:Style = new Style();
    export let settingsGlob:AnyFeature[] = [];

    export const run = async () => {
        /************
         * PRE SCRIPT
         ************/
        console.group(`Welcome to MAM+ v${VERSION}!!!`);

        // The current page is not yet known
        GM_deleteValue('mp_currentPage');
        Check.page();

        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/';

        // initialize core functions
        const alerts: Alerts = new Alerts();
        new Debug();

        // Notify the user if the script was updated
        Check.updated()
        .then((result) => { if (result) alerts.notify(result, CHANGELOG); });

        new InitFeatures();

        /************
         * SETTINGS
         ************/

        Check.page('settings')
        .then(result => {
            let subPg:string = window.location.search;
            if (result === true && (subPg === '' || subPg === '?view=general') ) {
                // Initialize the settings page
                Settings.init(result, settingsGlob);
            }
        });

        /******************
         * STYLES
         * Injects CSS
         ******************/

        // CSS stuff
        Check.elemLoad('head link[href*="ICGstation"]')
        .then(() => {
            // Add custom CSS sheet
            mpCss.injectLink();
            // Get the current site theme
            mpCss.alignToSiteTheme();
        });

        console.groupEnd();
    };
}

// Start the userscript
MP.run();
