/// <reference path="shared.ts" />

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

    get settings(): TextboxSetting {
        return this._settings;
    }

    constructor(){
        if(GM_getValue(this._settings.title)){
            Check.page('torrent')
            .then( (result) => {
                if(result === true){
                    Shared.fillGiftBox('#thanksArea input[name=points]', this._settings.title)
                        .then((points) => console.log(`[M+] Set the default gift amount to ${points}`) );
                }
            } );
        }
    }
}
