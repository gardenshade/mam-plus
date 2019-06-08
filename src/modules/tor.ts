/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * TORRENT PAGE FEATURES
 */

class TorGiftDefault implements Feature{
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'torGiftDefault',
        tag: "Default Gift",
        placeholder: "ex. 5000, max",
        desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
    }
    private _tar: string = '#thanksArea input[name=points]';

    constructor(){
        Util.startFeature(this._settings, this._tar, 'torrent')
        .then(t => { if (t) { this._init() } });
    }

    private _init() {
        new Shared().fillGiftBox(this._tar, this._settings.title)
        .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

class GoodreadsButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'goodreadsButton',
        desc: 'Enable the MAM-to-Goodreads buttons',
    }
    private _tar: string = '#torDetMainCon';

    constructor() {
        Util.startFeature(this._settings, this._tar, 'torrent')
            .then(t => { if (t) { this._init() } });
    }

    private _init() {
        console.log(`[M+] Added the MAM-to-Goodreads button!`);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
