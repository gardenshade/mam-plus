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
            .then( () => Check.elemLoad('#thanksArea') )
            .then( () => {
                const torPointBox: HTMLInputElement = <HTMLInputElement> document.querySelector('#thanksArea input[name=points]');

                if(torPointBox){
                    const userSetPoints:number = parseInt(GM_getValue(`${this._settings.title}_val`));
                    let maxPoints:number = parseInt( torPointBox.getAttribute('max')! );
                    /* FIXME: */console.log('>>>>>>',userSetPoints);
                    if( userSetPoints !== NaN && userSetPoints <= maxPoints ){
                        maxPoints = userSetPoints;
                    }
                    torPointBox.value = maxPoints.toFixed(0);
                }
            } );
        }
    }
}
