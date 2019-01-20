/// <reference path="check.ts" />
/// <reference path="util.ts" />
/// <reference path="./modules/core.ts" />

/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a useable table
 */
class Settings {

    // Function for gathering the needed scopes
    private static _getScopes(settings: AnyFeature[]): Promise<SettingGlobObject>{
        if (MP.DEBUG) { console.log('_getScopes(',settings,')'); }
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
            resolve(scopeList);
        } );
    }

    // Function for constructing the table from an object
    private static _buildTable( page:SettingGlobObject ):Promise<string>{
        if (MP.DEBUG) console.log('_buildTable(',page,')');
        return new Promise( resolve => {
            let outp = '<tbody><tr><td class="row1" colspan="2">Here you can enable &amp; disable any feature from the <a href="/forums.php?action=viewtopic&topicid=41863&page=p376355#376355">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.</td></tr>';

            Object.keys(page).forEach( scope => {
                let scopeNum:number = Number(scope);
                // Insert the section title
                outp += `<tr><td class='row2'>${SettingGroup[scopeNum]}</td><td class='row1'>`;
                // Create the required input field based on the setting
                Object.keys( page[scopeNum] ).forEach( (setting) => {
                    let settingNumber:number = Number(setting);
                    let item:AnyFeature = page[scopeNum][settingNumber]

                    const cases = {
                        'checkbox': () => {
                            outp += `<input type='checkbox' id='${item.title}' value='true'>${item.desc}<br>`;
                        },
                        'textbox': () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <input type='text' id='${item.title}' placeholder='${item.placeholder}' class='mp_textInput' size='25'>${item.desc}<br>`;
                        },
                        'dropdown': () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <select id='${item.tag}' class='mp_dropInput'>`;
                            if(item.options){
                                Object.keys(item.options).forEach((key) => {
                                    outp += `<option value='${key}'>${item.options![key]}</option>`;
                                });
                            }
                            outp += `</select>${item.desc}<br>`;
                        },
                    }
                    if(item.type) cases[item.type]();
                } );
                // Close the row
                outp += '</td></tr>';
            } );
            // Add the save button & last part of the table
            outp += '<tr><td class="row1" colspan="2"><div id="mp_submit">Save M+ Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>'

            if (MP.DEBUG) console.log('RESULT:',outp);

            resolve(outp);
        } );
    }

    // Function for retrieving the current settings values
    private static _getSettings( page: SettingGlobObject ){
        // Util.purgeSettings();
        let allValues: string[] = GM_listValues();
        if (MP.DEBUG) {
            console.log('_getSettings(',page,')\nStored GM keys:',allValues)
        };
        Object.keys( page ).forEach( scope => {
            Object.keys( page[Number(scope)] ).forEach( setting => {
                let pref = page[Number(scope)][Number(setting)];

                if (MP.DEBUG) {console.log('Pref:',pref,'\nSet:',GM_getValue(`${pref.title}`),'\nValue:', GM_getValue(`${pref.title}_val`));}

                if(pref !== undefined && typeof pref === 'object'){
                    console.log('Setting');

                    let elem: AnyHTML = document.getElementById(pref.title)!;
                    const cases = {
                        'checkbox': () => { elem.setAttribute('checked','checked') },
                        'textbox': () => {
                            elem.value = GM_getValue( `${pref.title}_val` );
                        },
                        'dropdown': () => {
                            elem.value = GM_getValue( pref.title );
                        },
                    };
                    if( cases[pref.type] && GM_getValue(pref.title) ) cases[pref.type]();
                }
            } );
        } );
    }

    public static init( result:boolean, settings:AnyFeature[] ){
        // This will only run if `Check.page('settings)` returns true & is passed here
        if(result === true){
            if (MP.DEBUG) { console.group(`new Settings()`); }

            // Make sure the settings table has loaded
            Check.elemLoad('#mainBody > table')
            .then(() => {
                if (MP.DEBUG) console.log(`Starting to build Settings table...`);
                // Create new table elements
                const settingNav: Element = document.querySelector('#mainBody > table')!;
                const settingTitle: HTMLHeadingElement = document.createElement('h1');
                const settingTable: HTMLTableElement = document.createElement('table');
                let pageScope:SettingGlobObject;

                // Insert table elements after the Pref navbar
                settingNav.insertAdjacentElement('afterend', settingTitle);
                settingTitle.insertAdjacentElement('afterend', settingTable);
                Util.setAttr(settingTable, {
                    'class': 'coltable',
                    'cellspacing': '1',
                    'style': 'width:100%;min-width:100%;max-width:100%;',
                });
                settingTable.innerHTML = 'MAM+ Settings';
                // Group settings by page
                this._getScopes(settings)
                // Generate table HTML from feature settings
                .then(scopes => {
                    pageScope = scopes;
                    return this._buildTable(scopes)
                })
                // Insert content into the new table elements
                .then(result => {
                    settingTable.innerHTML = result;
                    if (MP.DEBUG) console.log(`Table built!`);
                    return pageScope;
                })
                .then( scopes => { this._getSettings( scopes );} );
            })
        }
    }

    // FIXME: Move all settings into a Feature, then delete this
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
