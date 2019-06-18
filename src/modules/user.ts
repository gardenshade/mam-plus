/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

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
    private _tar: string = '#bonusgift';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['user'])
        .then(t => { if (t) { this._init()} });
    }

    private _init() {
        new Shared().fillGiftBox(this._tar, this._settings.title)
        .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}
