/**
 * GLOBAL FEATURES
 */

class HideHome implements Feature {
    private _settings: DropdownSetting = {
        scope: SettingGroup.Global,
        type: 'dropdown',
        title: 'hideHome',
        tag: 'Remove banner/home',
        options: {
            default: 'Do not remove either',
            hideBanner: 'Hide the banner',
            hideHome: 'Hide the home button',
        },
        desc: 'Remove the header image or Home button, because both link to the homepage',
    };
    private _tar: string = '#mainmenu';

    constructor() {
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        const hider: string = GM_getValue(this._settings.title);
        if (hider === 'hideHome') {
            document.body.classList.add('mp_hide_home');
            console.log('[M+] Hid the home button!');
        } else if (hider === 'hideBanner') {
            document.body.classList.add('mp_hide_banner');
            console.log('[M+] Hid the banner!');
        }
    }

    get settings(): DropdownSetting {
        return this._settings;
    }
}

class VaultLink implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'vaultLink',
        desc: 'Make the Vault link bypass the Vault Info page',
    };
    private _tar: string = '#millionInfo';

    constructor() {
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        document
            .querySelector(this._tar)!
            .setAttribute('href', '/millionaires/donate.php');
        console.log('[M+] Made the vault text link to the donate page!');
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
        desc: 'Shorten the Vault link & ratio text',
    };
    private _tar: string = '#millionInfo';

    constructor() {
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        const vaultText: HTMLElement = <HTMLElement>document.querySelector(this._tar);
        const ratioText: HTMLElement = <HTMLElement>document.querySelector('#tmR')!;

        // Shorten the ratio text
        // TODO: move this to its own setting?
        ratioText.innerHTML = `${parseFloat(ratioText.innerText).toFixed(
            2
        )} <img src="/pic/updownBig.png" alt="ratio">`;

        // Turn the numeric portion of the vault link into a number
        let newText: number = parseInt(
            vaultText.textContent!.split(':')[1].split(' ')[1].replace(/,/g, '')
        );

        // Convert the vault amount to millionths
        newText = Number((newText / 1e6).toFixed(3));
        // Update the vault text
        vaultText.textContent = `Vault: ${newText} million`;
        console.log('[M+] Shortened the vault & ratio numbers!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class BonusPointDelta implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'bonusPointDelta',
        desc: `Display how many bonus points you've gained since last pageload`,
    };
    private _tar: string = '#tmBP';
    private _prevBP: number = 0;
    private _currentBP: number = 0;
    private _delta: number = 0;

    constructor() {
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    _init() {
        const currentBPEl: HTMLAnchorElement | null = document.querySelector(this._tar);

        // Get old BP value
        this._prevBP = this._getBP();

        if (currentBPEl !== null) {
            // Extract only the number from the BP element
            const current: RegExpMatchArray = currentBPEl.textContent!.match(
                /\d+/g
            ) as RegExpMatchArray;

            // Set new BP value
            this._currentBP = parseInt(current[0]);
            this._setBP(this._currentBP);

            // Calculate delta
            this._delta = this._currentBP - this._prevBP;

            // Show the text if not 0
            if (this._delta !== 0 && !isNaN(this._delta)) {
                this._displayBP(this._delta);
            }
        }
    }

    private _displayBP = (bp: number): void => {
        const bonusBox: HTMLAnchorElement | null = document.querySelector(this._tar);
        let deltaBox: string = '';

        deltaBox = bp > 0 ? `+${bp}` : `${bp}`;

        if (bonusBox !== null) {
            bonusBox.innerHTML += `<span class='mp_bpDelta'> (${deltaBox})</span>`;
        }
    };

    private _setBP = (bp: number): void => {
        GM_setValue(`${this._settings.title}Val`, `${bp}`);
    };
    private _getBP = (): number => {
        const stored: string | undefined = GM_getValue(`${this._settings.title}Val`);
        if (stored === undefined) {
            return 0;
        } else {
            return parseInt(stored);
        }
    };

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class BlurredHeader implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'blurredHeader',
        desc: `Add a blurred background to the header area`,
    };
    private _tar: string = '#siteMain > header';
    constructor() {
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        const header: HTMLElement = <HTMLElement>document.querySelector(`${this._tar}`);
        const headerImg: HTMLImageElement | null = header.querySelector(`img`);

        if (headerImg) {
            const headerSrc: string | null = headerImg.getAttribute('src');
            // Generate a container for the background
            const blurredBack: HTMLDivElement = document.createElement('div');

            header.classList.add('mp_blurredBack');
            header.append(blurredBack);
            blurredBack.style.backgroundImage = headerSrc ? `url(${headerSrc})` : '';
        }

        console.log('[M+] Added a blurred background to the header!');
    }

    // This must match the type selected for `this._settings`
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
