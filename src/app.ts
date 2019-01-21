/// <reference path="style.ts" />
/// <reference path="./modules/core.ts" />
/// <reference path="./modules/global.ts" />
/// <reference path="settings.ts" />

/**
 * BREAKING CHANGES INTRODUCED WHILE CODING
 * FIXME: Search result ID changed on site, but not reflected in old build code.
 * FIXME: Stylesheet hardcoded to v4 branch; change to main when needed
 * FIXME: Goodreads links must be derefered
 * All styling is done via stylesheet. Use `.mp_dark` & `.mp_light` as needed.
 * Settings are now named `simplyLikeThis`; they now reside in classes
 * Fused hide banner/home settings. Now uses a dropdown. 'hideHome'
 * Browse/Search page is being updated and might have new DOM pointers/lazyload
 * default user gift now uses dropdown.
 */

type ValidPage = 'browse' | 'torrent' | 'shoutbox' | 'vault' | 'user' | 'settings';

enum SettingGroup {
    'Global',
    'Browse & Search',
    'Torrent Page',
    'Shoutbox',
    'Mil. Vault',
    'User Pages',
    'Other'
}

interface ArrayObject {
    [key:string]: string[];
}

interface StringObject {
    [key:string]: string;
}

interface SettingGlobObject {
    [key:number]: FeatureSettings[]
}

interface FeatureSettings {
    scope: SettingGroup;
    title: string;
    type: 'checkbox'|'dropdown'|'textbox';
    desc: string;
}

interface AnyFeature extends FeatureSettings {
    tag?:string;
    options?:StringObject;
    placeholder?:string;
}

interface Feature {
    settings: CheckboxSetting|DropdownSetting|TextboxSetting;
}

interface CheckboxSetting extends FeatureSettings{
    type: 'checkbox';
}

interface DropdownSetting extends FeatureSettings {
    type: 'dropdown';
    tag: string;
    options: StringObject;
}

interface TextboxSetting extends FeatureSettings {
    type: 'textbox';
    tag: string;
    placeholder: string;
}

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
            'CODE: Moved from Coffeescript to Typescript to allow for better practices and easier contribution. This likely introduced bugs.',
            'CODE: Script starts before the page loads and uses a CSS sheet to hopefully prevent flashing content. This likely introduced bugs. ',
            'CODE: Made features modular. This hopefully speeds up development',
            'FIX: Home page features were not running if navigated to via the Home button',
        ] as string[],
        BUG_LIST: [
            //
        ] as string[],
    };
    export const TIMESTAMP:string = '##meta_timestamp##';
    export const VERSION:string = Check.newVer;
    export const PREV_VER:string|undefined = Check.prevVer;
    export let errorLog:string[] = [];
    export let pagePath:string = window.location.pathname;
    export let mpCss:Style = new Style();
    export let settingsGlob:AnyFeature[] = [];

    export const run = () => {
        /************
         * PRE SCRIPT
         ************/
        console.group(`Welcome to MAM+ v${VERSION}!!!`);

        // Add a simple cookie to announce the script is being used
        document.cookie = 'mp_enabled=1;domain=myanonamouse.net;path=/';

        /**************
         * BEFORE PAGE LOAD
         * Nearly all features belong here, as they should have internal checks
         * for DOM elements as needed
         **************/

        // initialize core functions
        const alerts:Alerts = new Alerts();
        const debug:Debug = new Debug();

        // Notify the user if the script was updated
        Check.updated()
        .then( (result) => { if(result) alerts.notify(result, CHANGELOG); } );

        // Initialize global functions
        const hideHome: HideHome = new HideHome();
        const hideBrowse: HideBrowse = new HideBrowse();
        const vaultLink: VaultLink = new VaultLink();
        const miniVaultInfo: MiniVaultInfo = new MiniVaultInfo();

        /************
         * SETTINGS
         * Any feature above should have its settings pushed here
         ************/

        Check.page('settings')
        .then(result => {
            if (result === true) {
                // Push all settings here
                /** While all settings are grouped by their page (as defined by
                 * `SettingGroup`), the order they are pushed will determine their
                 * order relative to other settings in that group */
                // TODO: Auto-push settings when each feature is constructed
                settingsGlob.push(
                    alerts.settings,
                    hideHome.settings,
                    hideBrowse.settings,
                    vaultLink.settings,
                    miniVaultInfo.settings,
                    // This should be on the bottom
                    debug.settings,
                );

                // Initialize the settings page
                Settings.init(result, settingsGlob);
            }
        });

        /******************
         * STYLES
         *
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
