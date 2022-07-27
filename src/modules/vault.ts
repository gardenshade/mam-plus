/**
 * VAULT FEATURES
 */

class SimpleVault implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Vault,
        type: 'checkbox',
        title: 'simpleVault',
        desc:
            'Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)',
    };
    private _tar: string = '#mainBody';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        const subPage: string = GM_getValue('mp_currentPage');
        const page = <HTMLElement>document.querySelector(this._tar);
        console.group(`Applying Vault (${subPage}) settings...`);

        // Clone the important parts and reset the page
        const donateBtn: HTMLFormElement | null = page.querySelector('form');
        const donateTbl: HTMLTableElement | null = page.querySelector(
            'table:last-of-type'
        );
        page.innerHTML = '';

        // Add the donate button if it exists
        if (donateBtn !== null) {
            const newDonate: HTMLFormElement = <HTMLFormElement>donateBtn.cloneNode(true);
            page.appendChild(newDonate);
            newDonate.classList.add('mp_vaultClone');
        } else {
            page.innerHTML = '<h1>Come back tomorrow!</h1>';
        }

        // Add the donate table if it exists
        if (donateTbl !== null) {
            const newTable: HTMLTableElement = <HTMLTableElement>(
                donateTbl.cloneNode(true)
            );
            page.appendChild(newTable);
            newTable.classList.add('mp_vaultClone');
        } else {
            page.style.paddingBottom = '25px';
        }
        console.log('[M+] Simplified the vault page!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class PotHistory implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Vault,
        type: 'checkbox',
        title: 'potHistory',
        desc: 'Add the list of recent donations to the donation page.',
    };
    private _tar: string = '#mainBody';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['vault']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        const subPage: string = GM_getValue('mp_currentPage');
        const form = <HTMLElement>(
            document.querySelector(this._tar + ' form[method="post"]')
        );

        if (!form) {
            return;
        }

        const potPageResp = await fetch('/millionaires/pot.php');
        if (!potPageResp.ok) {
            console.group(
                `failed to get /millionaires/pot.php: ${potPageResp.status}/${potPageResp.statusText}`
            );
            return;
        }
        console.group(`Applying Vault (${subPage}) settings...`);
        const potPageText: string = await potPageResp.text();
        const parser = new DOMParser();
        const potPage: Document = parser.parseFromString(potPageText, 'text/html');

        // Clone the important parts and reset the page
        const donateTbl: HTMLTableElement | null = potPage.querySelector(
            '#mainTable table:last-of-type'
        );

        // Add the donate table if it exists
        if (donateTbl !== null && form !== null) {
            const newTable: HTMLTableElement = <HTMLTableElement>(
                donateTbl.cloneNode(true)
            );
            form.parentElement?.appendChild(newTable);
            newTable.classList.add('mp_vaultClone');
        }
        console.log('[M+] Added the donation history to the donation page!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
