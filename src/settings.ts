/// <reference path="check.ts" />
/// <reference path="./modules/core.ts" />

/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a useable table
 */
class Settings {

    // Function for gathering the needed scopes
    private static _getScopes(settings: FeatureSettings[]): Promise<SettingGlobObject>{
        if (MP.DEBUG) { console.log(`_getScopes( settings )`); }
        return new Promise( resolve => {
            let scopeList:SettingGlobObject = {};
            for( let setting of settings){
                let index: number = Number(setting.scope);
                // If the Scope exists, push the settings into the array
                if (scopeList[index]) {
                    scopeList[index].push(setting);
                // Otherwise, create the array
                }else{
                    scopeList[index] = [setting]
                }
            }
            if (MP.DEBUG) { console.log(scopeList); }
            resolve(scopeList);
        } );
    }

    // Function for constructing the table from an object
    private static _buildTable( scopes:SettingGlobObject, settings: FeatureSettings[] ):Promise<string>{
        if (MP.DEBUG) { console.log(`_buildTable( scopes,settings )`); }
        return new Promise( resolve => {
            let outp = '<tbody><tr><td class="row1" colspan="2">Here you can enable &amp; disable any feature from the <a href="/forums.php?action=viewtopic&topicid=41863&page=p376355#376355">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.</td></tr>';

            /**
             * TODO:
             * Loop over the `scope` of `scopes`
             * Add the settings for each scope
             * ......But do it in a preset order somehow
             */

            /** Example SettingGlobObject
             *
             * object = {
             *     0 : [                <- "Global Scope"
             *         {setting1},
             *         {setting3},
             *     ],
             *     3 : [                <- "Shoutbox Scope"
             *         {setting2},
             *         {setting7},
             *     ],
             * }
             */

            resolve(outp);
        } );
    }

    public static init( result:boolean, settings:FeatureSettings[] ){
        // This will only run if `Check.page('settings)` returns true & is passed here
        if(result === true){
            if (MP.DEBUG) { console.group(`new Settings()`); }

            // Make sure the settings table has loaded
            Check.elemLoad('#mainBody > table')
            .then(() => {
                if (MP.DEBUG) { console.log(`Starting to build Settings table...`); }
                // Create new table elements
                const settingNav: Element = document.querySelector('#mainBody > table')!;
                const settingTitle: HTMLHeadingElement = document.createElement('h1');
                const settingTable: HTMLTableElement = document.createElement('table');

                // Insert table elements after the Pref navbar
                settingNav.insertAdjacentElement('afterend', settingTitle);
                settingTitle.insertAdjacentElement('afterend', settingTable);
                Util.setAttr(settingTable, {
                    'class': 'coltable',
                    'cellspacing': '1',
                    'style': 'width:100%;min-width:100%;max-width:100%;',
                })
                // Insert content into the new table elements
                .then( () => {
                    settingTitle.innerHTML = 'MAM+ Settings';
                    this._getScopes( settings )
                    .then( scopes => this._buildTable( scopes, settings ) )
                    // .then( (result) => settingTable.innerHTML = result);
                } );
            });
        }
    }

    public static obj: object = {
        /** TEMPLATE */
        // section: {
        //     pageTitle: "Section",
        //     checkboxSetting: {
        //         id: "checkboxSetting",
        //         type: "checkbox",
        //         desc: "HTML description",
        //     },
        //     dropdownSetting: {
        //         id: "dropdownSetting",
        //         type: "dropdown",
        //         tag: "Simple description (ex. 'Year')",
        //         options: {
        //             opt1: "Option 1",
        //             opt2: "Option 2",
        //         },
        //         desc: "HTML description",
        //     },
        //     textboxSetting: {
        //         id: "textboxSetting",
        //         type: "textbox",
        //         tag: "Simple description (ex. 'Name')",
        //         placeholder: "Placeholder",
        //         desc: "HTML description",
        //     },
        // },
        /** GLOBAL */
        global: {
            pageTitle: "Global",
            alerts: {
                id: "alerts",
                type: "checkbox",
                desc: "Enable the MAM+ Alert panel for update information, etc.",
            },
            hideHome: {
                id: "hideHome",
                type: "dropdown",
                tag: "Remove banner/home",
                options: {
                    default: "Do not remove either",
                    hideBanner: "Hide the banner",
                    hideHome: "Hide the home button",
                },
                desc: "Remove the header image or Home button, because both link to the homepage",
            },
            hideBrowse: {
                id: "hideBrowse",
                type: "checkbox",
                desc: "Remove the Browse button, because Browse &amp; Search are practically the same",
            },
            vaultLink: {
                id: "vaultLink",
                type: "checkbox",
                desc: "Make the Vault link bypass the Vault Info page",
            },
            miniVaultInfo: {
                id: "miniVaultInfo",
                type: "checkbox",
                desc: "Shorten the Vault link text",
            },
        },
        /** BROWSE / REQUESTS */
        browse: {
            pageTitle: "Browse &amp; Requests",
            hideSnatched: {
                id: "hideSnatched",
                type: "checkbox",
                desc: "Enable the Hide Snatched button",
            },
            plaintextSearch: {
                id: "plaintextSearch",
                type: "checkbox",
                desc: "Insert plaintext search results at top of page",
            },
        },
        /** TORRENT */
        torrent: {
            pageTitle: "Torrent",
            goodreadsBtn: {
                id: "goodreadsBtn",
                type: "checkbox",
                desc: "Enable the MAM-to-Goodreads buttons",
            },
            fetchRating: {
                id: "fetchRating",
                type: "checkbox",
                desc: "Retrieve Goodreads rating info if possible",
            },
            torGiftDefault: {
                id: "torGiftDefault",
                type: "textbox",
                tag: "Default Gift",
                placeholder: "ex. 5000, max",
                desc: "Autofills the Gift box with a specified number of points.<br>(<em>Or the max allowable value, whichever is lower</em>)",
            },
        },
        /** SHOUTBOX */
        shoutbox: {
            pageTitle: "Shoutbox",
            priorityUsers: {
                id: "priorityUsers",
                type: "textbox",
                tag: "Emphasize Users",
                placeholder: "ex. 6, 25420, 77618",
                desc: "Emphasizes messages from the listed users in the shoutbox",
            },
            priorityStyle: {
                id: "priorityStyle",
                type: "textbox",
                tag: "Emphasis Style",
                placeholder: "default: 125, 125, 125, 0.3",
                desc: "Change the color/opacity of the highlighting rule for emphasized users\' posts.<br>(<em>This is formatted as R,G,B,Opacity. RGB are 0-255 and Opacity is 0-1</em>)",
            },
            blockUsers: {
                id: "blockUsers",
                type: "textbox",
                tag: "Block Users",
                placeholder: "ex. 1234, 108303, 10000",
                desc: "Obscures messages from the listed users in the shoutbox",
            },
        },
        /** VAULT */
        vault: {
            pageTitle: "Vault",
            simpleVault: {
                id: "simpleVault",
                type: "checkbox",
                desc: "Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)",
            },
        },
        /** USER PAGES */
        user: {
            pageTitle: "User Pages",
            userGiftDefault: {
                id: "userGiftDefault",
                type: "textbox",
                tag: "Default Gift",
                placeholder: "ex. 1000, max",
                desc: "Autofills the Gift box with a specified number of points.<br>(<em>Or the max allowable value, whichever is lower</em>)",
            },
        },
        /** OTHER */
        other: {
            pageTitle: "Other",
            debug: {
                id: "debug",
                type: "checkbox",
                desc: "Error log (<em>Click this checkbox to enable verbose logging to the console</em>)",
            },
        },
    };
}
