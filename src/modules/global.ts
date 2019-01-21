/**
 * GLOBAL FEATURES
 */

class HideHome implements Feature {
    private _settings:DropdownSetting = {
        scope: SettingGroup.Global,
        type: 'dropdown',
        title: 'hideHome',
        tag: 'Remove banner/home',
        options: {
            default: "Do not remove either",
            hideBanner: "Hide the banner",
            hideHome: "Hide the home button",
        },
        desc: 'Remove the header image or Home button, because both link to the homepage'
    }

    constructor(){
        if (GM_getValue(this._settings.title)) {
            const hider:string = GM_getValue(this._settings.title);
            Check.elemLoad('#mainmenu')
            .then( () => {
                if(hider === 'hideHome'){
                    document.body.classList.add('mp_hide_home');
                    console.log('[M+] Hid the home button!');
                }else if(hider === 'hideBanner'){
                    document.body.classList.add('mp_hide_banner');
                    console.log('[M+] Hid the banner!');
                }
            } );
        }
    }

    get settings():DropdownSetting {
        return this._settings;
    }
}

class HideBrowse implements Feature {
    private _settings:CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'hideBrowse',
        desc: 'Remove the Browse button, because Browse &amp; Search are practically the same'
    }

    constructor() {
        if( GM_getValue(this._settings.title) ){
            Check.elemLoad('#mainmenu')
            .then( () => {
                document.body.classList.add('mp_hide_browse');
                console.log('[M+] Hid the browse button!');
            } )
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class VaultLink implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'vaultLink',
        desc: 'Make the Vault link bypass the Vault Info page'
    }

    constructor() {
        if (GM_getValue(this._settings.title)) {
            Check.elemLoad('#millionInfo')
                .then(() => {
                    document.querySelector('#millionInfo')!
                        .setAttribute('href','/millionaires/donate.php');
                    console.log('[M+] Made the vault text link to the donate page!');
                })
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class MiniVaultInfo implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'miniVaultInfo',
        desc: 'Shorten the Vault link & ratio text'
    }

    constructor() {
        if (GM_getValue(this._settings.title)) {
            Check.elemLoad('#millionInfo')
            .then(() => {
                const vaultText:HTMLElement = <HTMLElement>document.querySelector('#millionInfo');
                const ratioText:HTMLElement = <HTMLElement>document.querySelector('#tmR')!;

                // Shorten the ratio text
                // TODO: move this to its own setting?
                ratioText.innerHTML = `${parseFloat(ratioText.innerText).toFixed(2)} <img src="/pic/updownBig.png" alt="ratio">`;

                // Turn the numeric portion of the vault link into a number
                let newText:number = parseInt( vaultText
                    .textContent!
                    .split(':')[1]
                    .split(' ')[1]
                    .replace(/,/g, '')
                );

                // Convert the vault amount to millionths
                newText = Number( (newText / 1e6).toFixed(3) );
                // Update the vault text
                vaultText.textContent = `Vault: ${newText} million`;
                console.log('[M+] Shortened the vault & ratio numbers!');
            });
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
