/**
 * # GLOBAL FEATURES
 */

/**
 * ## Hide the home button or the banner
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

/** Resolved banner probe results, cached across pageloads to avoid re-probing. */
interface BannerCache {
    main: Record<string, number | null>;
    donate: Record<string, boolean>;
}

/**
 * ## Display banners from a previous month
 * The user picks a past year-month; the current main & donate banners are
 * swapped for that month's, reusing the index the site already randomized.
 * Falls back to a lower index when the chosen month has fewer banners.
 */
class UsePreviousBanners implements Feature {
    private _settings: DropdownSetting = {
        scope: SettingGroup.Global,
        type: 'dropdown',
        title: 'usePreviousBanners',
        tag: 'Use Previous Banners',
        options: UsePreviousBanners._buildMonthOptions(),
        desc: 'Show banners from a previous month instead of the current ones (<a href="/banner/winners.php">see previous banners</a>)',
    };
    private _tar: string = '#msb';
    private _cdn: string = 'https://cdn.myanonamouse.net/banner/display.php';
    private _cacheKey: string = 'mp_usePreviousBannersCache';

    constructor() {
        Util.startFeature(this._settings, this._tar).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    /** Build the year-month dropdown options (2013-03 → last month, newest first). */
    private static _buildMonthOptions(): StringObject {
        const opts: StringObject = { default: 'Use current banners' };
        const now = new Date();
        let y: number = now.getUTCFullYear();
        let m: number = now.getUTCMonth() + 1;
        // Start from last month
        m--;
        if (m === 0) {
            m = 12;
            y--;
        }
        // Down to 2013-03 (the earliest month with banners)
        while (y > 2013 || (y === 2013 && m >= 3)) {
            const key = `${y}-${m < 10 ? '0' + m : m}`;
            opts[key] = key;
            m--;
            if (m === 0) {
                m = 12;
                y--;
            }
        }
        return opts;
    }

    private async _init() {
        const selected: string = GM_getValue(this._settings.title);
        // "default" (or empty) means keep the site's current banners
        if (!selected || selected === 'default') return;

        const month: string = selected.replace('-', ''); // 2025-12 -> 202512

        // Read the index the site already chose for the current banner
        const img = <HTMLImageElement | null>document.querySelector('#msb img');
        if (!img) return;
        const match = img.src.match(/display\.php\/m\/(\d{6})\/(\d+)/);
        if (!match) {
            console.warn('[M+] Previous Banners: could not parse the current banner URL');
            return;
        }
        const siteIndex: number = parseInt(match[2], 10);

        // Find a valid index for the chosen month, falling back to lower indexes.
        // Cached per month+siteIndex so repeat pageloads skip the probing entirely.
        const cache: BannerCache = this._loadCache();
        const mainKey = `${month}:${siteIndex}`;
        let index: number | null;
        if (mainKey in cache.main) {
            index = cache.main[mainKey];
        } else {
            index = await this._resolveIndex(month, siteIndex);
            cache.main[mainKey] = index;
            this._saveCache(cache);
        }
        if (index === null) {
            console.warn(`[M+] Previous Banners: no banners found for ${selected}`);
            return;
        }

        // Swap the header (main) banner, reusing the element we already have
        img.src = img.src.replace(/(display\.php\/m\/)\d{6}\/\d+/, `$1${month}/${index}`);
        await this._applyDonate(month, index, cache);
        console.log(`[M+] Showing previous banners from ${selected} (#${index})`);
    }

    /**
     * Probe every index from `start` down to 0 in parallel, returning the
     * highest one that has an image (same result as a sequential top-down
     * scan, but in a single round-trip instead of up to `start + 1`).
     */
    private async _resolveIndex(month: string, start: number): Promise<number | null> {
        const found: boolean[] = await Promise.all(
            Array.from({ length: start + 1 }, (_, n) =>
                this._imgExists(`${this._cdn}/m/${month}/${n}`)
            )
        );
        for (let n = start; n >= 0; n--) {
            if (found[n]) return n;
        }
        return null;
    }

    private _imgExists(url: string): Promise<boolean> {
        return new Promise((resolve) => {
            const probe = new Image();
            probe.onload = () => resolve(probe.naturalWidth > 0);
            probe.onerror = () => resolve(false);
            probe.src = url;
        });
    }

    private _loadCache(): BannerCache {
        const raw: string | undefined = GM_getValue(this._cacheKey);
        if (!raw) return { main: {}, donate: {} };
        try {
            return JSON.parse(raw);
        } catch {
            return { main: {}, donate: {} };
        }
    }

    private _saveCache(cache: BannerCache): void {
        GM_setValue(this._cacheKey, JSON.stringify(cache));
    }

    /**
     * Swap the donate popup banner (both the `/d/` frame and the `/b/` image).
     * If the chosen month has no donate banner, remove the donate box entirely.
     */
    private async _applyDonate(month: string, index: number, cache: BannerCache) {
        const donateKey = `${month}:${index}`;
        let hasDonate: boolean;
        if (donateKey in cache.donate) {
            hasDonate = cache.donate[donateKey];
        } else {
            hasDonate = await this._imgExists(`${this._cdn}/d/${month}/${index}`);
            cache.donate[donateKey] = hasDonate;
            this._saveCache(cache);
        }

        // Some months have no donate banner; drop the donate box in that case
        if (!hasDonate) {
            const donateLI = document.querySelector('#donateLI');
            if (donateLI) donateLI.remove();
            console.log(
                `[M+] Previous Banners: no donate banner for ${month}; removed the donate box`
            );
            return;
        }

        const frame = <HTMLElement | null>document.querySelector('#mainDonate');
        const image = <HTMLElement | null>(
            document.querySelector('#mainDonate .donateImage')
        );
        if (frame) {
            frame.style.backgroundImage = frame.style.backgroundImage.replace(
                /(display\.php\/d\/)\d{6}\/\d+/,
                `$1${month}/${index}`
            );
        }
        if (image) {
            image.style.backgroundImage = image.style.backgroundImage.replace(
                /(display\.php\/b\/)\d{6}\/\d+/,
                `$1${month}/${index}`
            );
        }
    }

    get settings(): DropdownSetting {
        return this._settings;
    }
}

/**
 * ## Bypass the vault info page
 */
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

/**
 * ## Shorten the vault & ratio text
 */
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
        /* This chained monstrosity does the following:
        - Extract the number (with float) from the element
        - Fix the float to 2 decimal places (which converts it back into a string)
        - Convert the string back into a number so that we can convert it with`toLocaleString` to get commas back */
        const num = Number(Util.extractFloat(ratioText)[0].toFixed(2)).toLocaleString();
        ratioText.innerHTML = `${num} <img src="/pic/updownBig.png" alt="ratio">`;

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

/**
 * ## Display bonus point delta
 */
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

/**
 * ## Blur the header background
 */
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
            blurredBack.classList.add('mp_container');
        }

        console.log('[M+] Added a blurred background to the header!');
    }

    // This must match the type selected for `this._settings`
    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * ## Hide the seedbox link
 */
class HideSeedbox implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'hideSeedbox',
        scope: SettingGroup.Global,
        desc: 'Remove the "Get A Seedbox" menu item',
    };
    // An element that must exist in order for the feature to run
    private _tar: string = '#menu .sbDonCrypto';
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        const seedboxBtn: HTMLLIElement | null = document.querySelector(this._tar);
        if (seedboxBtn) {
            seedboxBtn.style.display = 'none';
            console.log('[M+] Hid the Seedbox button!');
        }
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * ## Hide the donation link
 */
class HideDonationBox implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'hideDonationBox',
        scope: SettingGroup.Global,
        desc: 'Remove the Donations menu item',
    };
    // An element that must exist in order for the feature to run
    private _tar: string = '#menu .mmDonBox';
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        const donationBoxBtn: HTMLLIElement | null = document.querySelector(this._tar);
        if (donationBoxBtn) {
            donationBoxBtn.style.display = 'none';
            console.log('[M+] Hid the Donation Box button!');
        }
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * # Fixed navigation & search
 */

class FixedNav implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'fixedNav',
        scope: SettingGroup.Global,
        desc: 'Fix the navigation/search to the top of the page.',
    };
    private _tar: string = 'body';
    constructor() {
        Util.startFeature(this._settings, this._tar, []).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        document.querySelector('body')!.classList.add('mp_fixed_nav');
        console.log('[M+] Pinned the nav/search to the top!');
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
