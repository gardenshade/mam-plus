/// <reference path="check.ts" />
/// <reference path="util.ts" />
/// <reference path="./modules/core.ts" />

/**
 * Class for handling settings and the Preferences page
 * @method init: turns features' settings info into a useable table
 */
class Settings {
    // Function for gathering the needed scopes
    private static _getScopes(settings: AnyFeature[]): Promise<SettingGlobObject> {
        if (MP.DEBUG) {
            console.log('_getScopes(', settings, ')');
        }
        return new Promise((resolve) => {
            const scopeList: SettingGlobObject = {};
            for (const setting of settings) {
                const index: number = Number(setting.scope);
                // If the Scope exists, push the settings into the array
                if (scopeList[index]) {
                    scopeList[index].push(setting);
                    // Otherwise, create the array
                } else {
                    scopeList[index] = [setting];
                }
            }
            resolve(scopeList);
        });
    }

    // Function for constructing the table from an object
    private static _buildTable(page: SettingGlobObject): Promise<string> {
        if (MP.DEBUG) console.log('_buildTable(', page, ')');
        return new Promise((resolve) => {
            let outp =
                '<tbody><tr><td class="row1" colspan="2"><br>Here you can enable &amp; disable any feature from the <a href="/forums.php?action=viewtopic&topicid=41863&page=p376355#376355">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br>For a detailed look at the available features, <a href="https://github.com/gardenshade/mam-plus/wiki/Feature-Overview">check the Wiki!</a><br><br></td></tr>';

            Object.keys(page).forEach((scope) => {
                const scopeNum: number = Number(scope);
                // Insert the section title
                outp += `<tr><td class='row2'>${SettingGroup[scopeNum]}</td><td class='row1'>`;
                // Create the required input field based on the setting
                Object.keys(page[scopeNum]).forEach((setting) => {
                    const settingNumber: number = Number(setting);
                    const item: AnyFeature = page[scopeNum][settingNumber];

                    const cases = {
                        checkbox: () => {
                            outp += `<input type='checkbox' id='${item.title}' value='true'>${item.desc}<br>`;
                        },
                        textbox: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <input type='text' id='${item.title}' placeholder='${item.placeholder}' class='mp_textInput' size='25'>${item.desc}<br>`;
                        },
                        dropdown: () => {
                            outp += `<span class='mp_setTag'>${item.tag}:</span> <select id='${item.title}' class='mp_dropInput'>`;
                            if (item.options) {
                                Object.keys(item.options).forEach((key) => {
                                    outp += `<option value='${key}'>${
                                        item.options![key]
                                    }</option>`;
                                });
                            }
                            outp += `</select>${item.desc}<br>`;
                        },
                    };
                    if (item.type) cases[item.type]();
                });
                // Close the row
                outp += '</td></tr>';
            });
            // Add the save button & last part of the table
            outp +=
                '<tr><td class="row1" colspan="2"><div id="mp_submit" class="mp_settingBtn">Save M+ Settings??</div><div id="mp_copy" class="mp_settingBtn">Copy Settings</div><div id="mp_inject" class="mp_settingBtn">Paste Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>';

            resolve(outp);
        });
    }

    // Function for retrieving the current settings values
    private static _getSettings(page: SettingGlobObject) {
        // Util.purgeSettings();
        const allValues: string[] = GM_listValues();
        if (MP.DEBUG) {
            console.log('_getSettings(', page, ')\nStored GM keys:', allValues);
        }
        Object.keys(page).forEach((scope) => {
            Object.keys(page[Number(scope)]).forEach((setting) => {
                const pref = page[Number(scope)][Number(setting)];

                if (MP.DEBUG) {
                    console.log(
                        'Pref:',
                        pref.title,
                        '| Set:',
                        GM_getValue(`${pref.title}`),
                        '| Value:',
                        GM_getValue(`${pref.title}_val`)
                    );
                }

                if (pref !== null && typeof pref === 'object') {
                    const elem: HTMLInputElement = <HTMLInputElement>(
                        document.getElementById(pref.title)!
                    );
                    const cases = {
                        checkbox: () => {
                            elem.setAttribute('checked', 'checked');
                        },
                        textbox: () => {
                            elem.value = GM_getValue(`${pref.title}_val`);
                        },
                        dropdown: () => {
                            elem.value = GM_getValue(pref.title);
                        },
                    };
                    if (cases[pref.type] && GM_getValue(pref.title)) cases[pref.type]();
                }
            });
        });
    }

    private static _setSettings(obj: SettingGlobObject) {
        if (MP.DEBUG) console.log(`_setSettings(`, obj, ')');
        Object.keys(obj).forEach((scope) => {
            Object.keys(obj[Number(scope)]).forEach((setting) => {
                const pref = obj[Number(scope)][Number(setting)];

                if (pref !== null && typeof pref === 'object') {
                    const elem: HTMLInputElement = <HTMLInputElement>(
                        document.getElementById(pref.title)!
                    );

                    const cases = {
                        checkbox: () => {
                            if (elem.checked) GM_setValue(pref.title, true);
                        },
                        textbox: () => {
                            const inp: string = elem.value;

                            if (inp !== '') {
                                GM_setValue(pref.title, true);
                                GM_setValue(`${pref.title}_val`, inp);
                            }
                        },
                        dropdown: () => {
                            GM_setValue(pref.title, elem.value);
                        },
                    };
                    if (cases[pref.type]) cases[pref.type]();
                }
            });
        });
        console.log('[M+] Saved!');
    }

    private static _copySettings(): string {
        const gmList = GM_listValues();
        const outp: [string, string][] = [];

        // Loop over all stored settings and push to output array
        gmList.map((setting) => {
            // Don't export mp_ settings as they should only be set at runtime
            if (setting.indexOf('mp_') < 0) {
                outp.push([setting, GM_getValue(setting)]);
            }
        });

        return JSON.stringify(outp);
    }

    private static _pasteSettings(payload: string) {
        if (MP.DEBUG) console.group(`_pasteSettings( )`);
        const settings = JSON.parse(payload);
        settings.forEach((tuple: [string, string][]) => {
            if (tuple[1]) {
                GM_setValue(`${tuple[0]}`, `${tuple[1]}`);
                if (MP.DEBUG) console.log(tuple[0], ': ', tuple[1]);
            }
        });
    }

    // Function that saves the values of the settings table
    private static _saveSettings(timer: number, obj: SettingGlobObject) {
        if (MP.DEBUG) console.group(`_saveSettings()`);

        const savestate: HTMLSpanElement = <HTMLSpanElement>(
            document.querySelector('span.mp_savestate')!
        );
        const gmValues: string[] = GM_listValues();

        // Reset timer & message
        savestate.style.opacity = '0';
        window.clearTimeout(timer);

        console.log('[M+] Saving...');

        // Loop over all values stored in GM and reset everything
        for (const feature in gmValues) {
            if (typeof gmValues[feature] !== 'function') {
                // Only loop over values that are feature settings
                if (!['mp_version', 'style_theme'].includes(gmValues[feature])) {
                    GM_setValue(gmValues[feature], false);
                }
            }
        }

        // Save the settings to GM values
        this._setSettings(obj);

        // Display the confirmation message
        savestate.style.opacity = '1';
        try {
            timer = window.setTimeout(() => {
                savestate.style.opacity = '0';
            }, 2345);
        } catch (e) {
            if (MP.DEBUG) console.warn(e);
        }

        if (MP.DEBUG) console.groupEnd();
    }

    /**
     * Inserts the settings page.
     * @param result Value that must be passed down from `Check.page('settings')`
     * @param settings The array of features to provide settings for
     */
    public static async init(result: boolean, settings: AnyFeature[]) {
        // This will only run if `Check.page('settings)` returns true & is passed here
        if (result === true) {
            if (MP.DEBUG) {
                console.group(`new Settings()`);
            }

            // Make sure the settings table has loaded
            await Check.elemLoad('#mainBody > table').then((r) => {
                if (MP.DEBUG) console.log(`[M+] Starting to build Settings table...`);
                // Create new table elements
                const settingNav: Element = document.querySelector('#mainBody > table')!;
                const settingTitle: HTMLHeadingElement = document.createElement('h1');
                const settingTable: HTMLTableElement = document.createElement('table');
                let pageScope: SettingGlobObject;

                // Insert table elements after the Pref navbar
                settingNav.insertAdjacentElement('afterend', settingTitle);
                settingTitle.insertAdjacentElement('afterend', settingTable);
                Util.setAttr(settingTable, {
                    class: 'coltable',
                    cellspacing: '1',
                    style: 'width:100%;min-width:100%;max-width:100%;',
                });
                settingTitle.innerHTML = 'MAM+ Settings';
                // Group settings by page
                this._getScopes(settings)
                    // Generate table HTML from feature settings
                    .then((scopes) => {
                        pageScope = scopes;
                        return this._buildTable(scopes);
                    })
                    // Insert content into the new table elements
                    .then((result) => {
                        settingTable.innerHTML = result;
                        console.log('[M+] Added the MAM+ Settings table!');
                        return pageScope;
                    })
                    .then((scopes) => {
                        this._getSettings(scopes);
                        return scopes;
                    })
                    // Make sure the settings are done loading
                    .then((scopes) => {
                        const submitBtn: HTMLDivElement = <HTMLDivElement>(
                            document.querySelector('#mp_submit')!
                        );
                        const copyBtn: HTMLDivElement = <HTMLDivElement>(
                            document.querySelector('#mp_copy')!
                        );
                        const pasteBtn: HTMLDivElement = <HTMLDivElement>(
                            document.querySelector('#mp_inject')!
                        );
                        let ssTimer: number;
                        try {
                            submitBtn.addEventListener(
                                'click',
                                () => {
                                    this._saveSettings(ssTimer, scopes);
                                },
                                false
                            );
                            Util.clipboardifyBtn(pasteBtn, this._pasteSettings, false);
                            Util.clipboardifyBtn(copyBtn, this._copySettings());
                        } catch (err) {
                            if (MP.DEBUG) console.warn(err);
                        }
                        if (MP.DEBUG) {
                            console.groupEnd();
                        }
                    });
            });
        }
    }
}
