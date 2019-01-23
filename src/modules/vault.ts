/**
 * VAULTFEATURES
 */

class SimpleVault implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Vault,
        type: 'checkbox',
        title: 'simpleVault',
        desc: 'Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)',
    }
    private _tar: string = '#mainBody';

    constructor() {
        Util.startFeature(this._settings, this._tar, 'vault')
        .then(t => { if (t) { this._init() } });
    }

    private async _init(){
        console.log('>>>>>> FEATURE');/* FIXME: */
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
