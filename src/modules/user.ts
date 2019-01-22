/// <reference path="shared.ts" />

/**
 * USER PAGE FEATURES
 */

class UserGiftDefault implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['User Pages'],
        type: 'textbox',
        title: 'userGiftDefault',
        tag: "Default Gift",
        placeholder: "ex. 1000, max",
        desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
    }

    get settings(): TextboxSetting {
        return this._settings;
    }

    constructor() {
        if (GM_getValue(this._settings.title)) {
            Check.page('user')
            .then((result) => {
                if (result === true) {
                    Shared.fillGiftBox('#bonusgift', this._settings.title)
                    .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
                }
            });
        }
    }
}
