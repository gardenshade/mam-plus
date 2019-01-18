/**
 * GLOBAL FEATURES
 */

class HideHome implements Feature {
    private _settings:DropdownSetting = {
        type: 'dropdown',
        scope: 'global',
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
        //
    }

    get settings():DropdownSetting {
        return this._settings;
    }
}

class HideBrowse implements Feature {
    private _settings:CheckboxSetting = {
        type: 'checkbox',
        scope: 'global',
        title: 'hideBrowse',
        desc: 'Remove the Browse button, because Browse &amp; Search are practically the same'
    }

    constructor() {
        if( GM_getValue(this._settings.title) ){
            Check.elemLoad('body')
            .then( () => {
                document.body.classList.add('mp_hide_browse');
                console.log('[M+] Hide the browse button!');
            } )
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
