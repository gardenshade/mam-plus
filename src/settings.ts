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
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <select id='${item.title}' class='mp_dropInput'>`;
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

                if (MP.DEBUG) {console.log('Pref:',pref.title,'| Set:',GM_getValue(`${pref.title}`),'| Value:', GM_getValue(`${pref.title}_val`));}

                if(pref !== null && typeof pref === 'object'){
                    let elem: HTMLInputElement = <HTMLInputElement>document.getElementById(pref.title)!;
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

    private static _setSettings( obj: SettingGlobObject ){
        if (MP.DEBUG) console.log(`_setSettings(`,obj,')');
        Object.keys(obj).forEach(scope => {
            Object.keys(obj[Number(scope)]).forEach(setting => {
                let pref = obj[Number(scope)][Number(setting)];

                if( pref !== null && typeof pref === 'object' ){
                    let elem: HTMLInputElement = <HTMLInputElement>document.getElementById(pref.title)!;

                    const cases = {
                        'checkbox': () => {
                            if(elem.checked) GM_setValue( pref.title,true)
                        },
                        'textbox': () => {
                            const inp:string = elem.value;
                            if(inp !== ''){
                                GM_setValue( pref.title,true );
                                GM_setValue(`${pref.title}_val`,inp );
                            }
                        },
                        'dropdown': () => {
                            GM_setValue( pref.title,elem.value );
                        },
                    };
                    if (cases[pref.type]) cases[pref.type]();
                }
            });
        });
        console.log('[M+] Saved!');
    }

    // Function that saves the values of the settings table
    private static _saveSettings( timer:number, obj:SettingGlobObject ){
        if (MP.DEBUG) console.group(`_saveSettings()`);

        const savestate:HTMLSpanElement = <HTMLSpanElement>document.querySelector('span.mp_savestate')!;
        const gmValues:string[] = GM_listValues();

        // Reset timer & message
        savestate.style.opacity = '0';
        window.clearTimeout( timer );

        console.log('[M+] Saving...');

        // Loop over all values stored in GM and reset everything
        for(let feature in gmValues){
            if( typeof gmValues[feature] !== 'function' ){
                // Only loop over values that are feature settings
                if (!['mp_version', 'style_theme'].includes(gmValues[feature])) {
                    GM_setValue( gmValues[feature],false );
                }
            }
        }

        // Save the settings to GM values
        this._setSettings(obj);

        // Display the confirmation message
        savestate.style.opacity = '1';
        try{
            timer = window.setTimeout( () => {
                savestate.style.opacity = '0';
            },2345);
        }catch(e){
            if(MP.DEBUG) console.warn(e);
        }

        if (MP.DEBUG) console.groupEnd();
    }

    /**
     * Inserts the settings page.
     * @param result Value that must be passed down from `Check.page('settings')`
     * @param settings The array of features to provide settings for
     */
    public static init( result:boolean, settings:AnyFeature[] ){
        // This will only run if `Check.page('settings)` returns true & is passed here
        if(result === true){
            if (MP.DEBUG) { console.group(`new Settings()`); }

            // Make sure the settings table has loaded
            Check.elemLoad('#mainBody > table')
            .then(() => {
                if (MP.DEBUG) console.log(`[M+] Starting to build Settings table...`);
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
                    console.log('[M+] Added the MAM+ Settings table!');
                    return pageScope;
                })
                .then( scopes => {
                    this._getSettings( scopes );
                    return scopes;
                } )
                // Make sure the settings are done loading
                .then( (scopes) => {
                    const submitBtn: HTMLDivElement = <HTMLDivElement>document.querySelector('#mp_submit')!;
                    let ssTimer: number;
                    try {
                        submitBtn.addEventListener('click', () => {
                            this._saveSettings(ssTimer,scopes);
                        }, false);
                    }
                    catch (err) {
                        if (MP.DEBUG) console.warn(err);
                    }
                    if (MP.DEBUG) { console.groupEnd(); }
                });
            });
        }
    }

    // FIXME: Move all settings into a Feature, then delete this
    public static obj: object = {
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
    };
}
