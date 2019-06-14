/// <reference path="types.ts" />
/// <reference path="style.ts" />
/// <reference path="./modules/core.ts" />
/// <reference path="./modules/global.ts" />
/// <reference path="./modules/tor.ts" />
/// <reference path="./modules/browse.ts" />
/// <reference path="./modules/vault.ts" />
/// <reference path="./modules/user.ts" />
/// <reference path="features.ts" />
/// <reference path="settings.ts" />

/**
 * BREAKING CHANGES INTRODUCED WHILE CODING
 * FIXME: Stylesheet hardcoded to v4 branch; change to main when needed
 * FIXME: Goodreads links must be derefered
 * TODO: Browse/Search page is being updated and might have new DOM pointers/lazyload
 * All styling is done via stylesheet. Use `.mp_dark` & `.mp_light` as needed.
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
        UPDATE_LIST: [
            `CODE: Moved from Coffeescript to Typescript to allow for better practices and easier contribution. This likely introduced bugs.`,
            `CODE: Script starts before the page loads and uses a CSS sheet to hopefully prevent flashing content. This likely introduced bugs. `,
            `CODE: Made features modular. This hopefully speeds up development`,
            `FIX: Home page features were not running if navigated to via the Home button`,
            `FIX: Default User Gift is now a textbox just like the Default Torrent Gift`,
            `ENHANCE: Toggle Snatched state can now be remembered`,
        ] as string[],
        BUG_LIST: [
            `M: Browse page features only work on first page`,
            `S: Currently, each function runs its own query to see what page is active; this value should be stored and reused for efficiency`,
            `S: Plaintext Results textbox causes slight horizontal scrollbar when open`
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
        .then(result => { if (result === true) {

            // Initialize the settings page
            Settings.init(result, settingsGlob);
        } });

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
