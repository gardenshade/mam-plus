/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * * Autofills the Gift box with a specified number of points.
 */
class TorGiftDefault implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'torGiftDefault',
        tag: 'Default Gift',
        placeholder: 'ex. 5000, max',
        desc:
            'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
    };
    private _tar: string = '#thanksArea input[name=points]';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) =>
                console.log(`[M+] Set the default gift amount to ${points}`)
            );
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * * Adds various links to Goodreads
 */
class GoodreadsButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'goodreadsButton',
        desc: 'Enable the MAM-to-Goodreads buttons',
    };
    private _tar: string = '#submitInfo';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping Goodreads buttons');
                }
            }
        });
    }

    private async _init() {
        // Select the data points
        const authorData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const bookData: HTMLSpanElement | null = document.querySelector(
            '#torDetMainCon .TorrentTitle'
        );
        const seriesData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#Series a');
        const target: HTMLDivElement | null = document.querySelector(this._tar);
        // Generate buttons
        this._share.goodreadsButtons(bookData, authorData, seriesData, target);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Adds various links to Audible
 */
class AudibleButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'audibleButton',
        desc: 'Enable the MAM-to-Audible buttons',
    };
    private _tar: string = '#submitInfo';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping Audible buttons');
                }
            }
        });
    }

    private async _init() {
        // Select the data points
        const authorData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const bookData: HTMLSpanElement | null = document.querySelector(
            '#torDetMainCon .TorrentTitle'
        );
        const seriesData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#Series a');

        let target: HTMLDivElement | null = document.querySelector(this._tar);

        if (document.querySelector('.mp_sgRow')) {
            target = <HTMLDivElement>document.querySelector('.mp_sgRow');
        } else if (document.querySelector('.mp_grRow')) {
            target = <HTMLDivElement>document.querySelector('.mp_grRow');
        }

        // Generate buttons
        this._share.audibleButtons(bookData, authorData, seriesData, target);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Adds various links to StoryGraph
 */
class StoryGraphButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'checkbox',
        title: 'storyGraphButton',
        desc: 'Enable the MAM-to-StoryGraph buttons',
    };
    private _tar: string = '#submitInfo';
    private _share = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substring(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping StroyGraph buttons');
                }
            }
        });
    }

    private async _init() {
        // Select the data points
        const authorData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const bookData: HTMLSpanElement | null = document.querySelector(
            '#torDetMainCon .TorrentTitle'
        );
        const seriesData: NodeListOf<
            HTMLAnchorElement
        > | null = document.querySelectorAll('#Series a');

        let target: HTMLDivElement | null = document.querySelector(this._tar);

        if (document.querySelector('.mp_grRow')) {
            target = <HTMLDivElement>document.querySelector('.mp_grRow');
        }

        // Generate buttons
        this._share.storyGraphButtons(bookData, authorData, seriesData, target);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Generates a field for "Currently Reading" bbcode
 */
class CurrentlyReading implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        scope: SettingGroup['Torrent Page'],
        title: 'currentlyReading',
        desc: `Add a button to generate a "Currently Reading" forum snippet`,
    };
    private _tar: string = '#torDetMainCon .TorrentTitle';
    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        console.log('[M+] Adding Currently Reading section...');
        // Get the required information
        const title: string = document!.querySelector('#torDetMainCon .TorrentTitle')!
            .textContent!;
        const authors: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(
            '#torDetMainCon .torAuthors a'
        );
        const torID: string = window.location.pathname.split('/')[2];
        const rowTar: HTMLDivElement | null = document.querySelector('#fInfo');

        // Title can't be null
        if (title === null) {
            throw new Error(`Title field was null`);
        }

        // Build a new table row
        const crRow: HTMLDivElement = await Util.addTorDetailsRow(
            rowTar,
            'Currently Reading',
            'mp_crRow'
        );
        // Process data into string
        const blurb: string = await this._generateSnippet(torID, title, authors);
        // Build button
        const btn: HTMLDivElement = await this._buildButton(crRow, blurb);
        // Init button
        Util.clipboardifyBtn(btn, blurb);
    }

    /**
     * * Build a BB Code text snippet using the book info, then return it
     * @param id The string ID of the book
     * @param title The string title of the book
     * @param authors A node list of author links
     */
    private _generateSnippet(
        id: string,
        title: string,
        authors: NodeListOf<HTMLAnchorElement>
    ): string {
        /**
         * * Add Author Link
         * @param authorElem A link containing author information
         */
        const addAuthorLink = (authorElem: HTMLAnchorElement) => {
            return `[url=${authorElem.href.replace('https://www.myanonamouse.net', '')}]${
                authorElem.textContent
            }[/url]`;
        };

        // Convert the NodeList into an Array which is easier to work with
        let authorArray: string[] = [];
        authors.forEach((authorElem) => authorArray.push(addAuthorLink(authorElem)));
        // Drop extra items
        if (authorArray.length > 3) {
            authorArray = [...authorArray.slice(0, 3), 'etc.'];
        }

        return `[url=/t/${id}]${title}[/url] by [i]${authorArray.join(', ')}[/i]`;
    }

    /**
     * * Build a button on the tor details page
     * @param tar Area where the button will be added into
     * @param content Content that will be added into the textarea
     */
    private _buildButton(tar: HTMLDivElement, content: string): HTMLDivElement {
        // Build text display
        tar.innerHTML = `<textarea rows="1" cols="80" style='margin-right:5px'>${content}</textarea>`;
        // Build button
        Util.createLinkButton(tar, 'none', 'Copy', 2);
        document.querySelector('.mp_crRow .mp_button_clone')!.classList.add('mp_reading');
        // Return button
        return <HTMLDivElement>document.querySelector('.mp_reading');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Protects the user from ratio troubles by adding warnings and displaying ratio delta
 */
class RatioProtect implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        scope: SettingGroup['Torrent Page'],
        title: 'ratioProtect',
        desc: `Protect your ratio with warnings &amp; ratio calculations`,
    };
    private _tar: string = '#ratio';
    private _rcRow: string = 'mp_ratioCostRow';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Enabling ratio protection...');
        // TODO: Move this block to shared
        // The download text area
        const dlBtn: HTMLAnchorElement | null = document.querySelector('#tddl');
        // The currently unused label area above the download text
        const dlLabel: HTMLDivElement | null = document.querySelector(
            '#download .torDetInnerTop'
        );
        // Would become ratio
        const rNew: HTMLDivElement | null = document.querySelector(this._tar);
        // Current ratio
        const rCur: HTMLSpanElement | null = document.querySelector('#tmR');
        // Seeding or downloading
        const seeding: HTMLSpanElement | null = document.querySelector('#DLhistory');

        // Get the custom ratio amounts (will return default values otherwise)
        const [r1, r2, r3] = this._checkCustomSettings();
        if (MP.DEBUG) console.log(`Ratio protection levels set to: ${r1}, ${r2}, ${r3}`);

        // Only run the code if the ratio exists
        if (rNew && rCur) {
            const rDiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];

            if (MP.DEBUG)
                console.log(
                    `Current ${Util.extractFloat(rCur)[0]} | New ${
                        Util.extractFloat(rNew)[0]
                    } | Dif ${rDiff}`
                );

            // Only activate if a ratio change is expected
            if (!isNaN(rDiff) && rDiff > 0.009) {
                if (!seeding && dlLabel) {
                    // if NOT already seeding or downloading
                    dlLabel.innerHTML = `Ratio loss ${rDiff.toFixed(2)}`;
                    dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
                }

                // Add line under Torrent: detail for Cost data "Cost to Restore Ratio"
                document
                    .querySelector('.torDetBottom')!
                    .insertAdjacentHTML(
                        'beforebegin',
                        `<div class="torDetRow" id="Mrp_row"><div class="torDetLeft">Cost to Restore Ratio</div><div class="torDetRight ${this._rcRow}"><span id="mp_foobar"></span></div></div>`
                    );

                // Calculate & Display cost of download w/o FL
                // Always show calculations when there is a ratio loss
                const sizeElem: HTMLSpanElement | null = document.querySelector(
                    '#size span'
                );
                if (sizeElem) {
                    const size = sizeElem.textContent!.split(/\s+/);
                    const sizeMap = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    // Convert human readable size to bytes
                    const byteSized =
                        Number(size[0]) * Math.pow(1024, sizeMap.indexOf(size[1]));
                    const recovery = byteSized * Util.extractFloat(rCur)[0];
                    const pointAmnt = Math.floor(
                        (125 * recovery) / 268435456
                    ).toLocaleString();
                    // Update the ratio cost row
                    document.querySelector(
                        `.${this._rcRow}`
                    )!.innerHTML = `<b>${Util.formatBytes(
                        recovery
                    )}</b>&nbsp;upload (${pointAmnt} BP).&nbsp;<abbr title='Contributing 2,000 BP to each vault cycle gives you almost one FL wedge per day on average.'>[info]</abbr>`;
                }

                // Style the download button based on Ratio Protect level settings
                if (dlBtn && dlLabel) {
                    // This is the "trivial ratio loss" threshold
                    // These changes will always happen if the ratio conditions are met
                    if (rDiff > r1) {
                        dlBtn.style.backgroundColor = 'SpringGreen';
                        dlBtn.style.color = 'black';
                        dlBtn.innerHTML = 'Download?';
                    }

                    // This is the "I never want to dl w/o FL" threshold
                    // This also uses the Minimum Ratio, if enabled
                    // TODO: Replace disable button with buy FL button

                    if (
                        rDiff > r3 ||
                        Util.extractFloat(rNew)[0] < GM_getValue('ratioProtectMin_val')
                    ) {
                        dlBtn.style.backgroundColor = 'Red';
                        ////Disable link to prevent download
                        //// dlBtn.style.pointerEvents = 'none';
                        dlBtn.style.cursor = 'no-drop';
                        // maybe hide the button, and add the Ratio Loss warning in its place?
                        dlBtn.innerHTML = 'FL Needed';
                        dlLabel.style.fontWeight = 'bold';
                        // This is the "I need to think about using a FL" threshold
                    } else if (rDiff > r2) {
                        dlBtn.style.backgroundColor = 'Orange';
                        dlBtn.innerHTML = 'Suggest FL';
                    }
                }
            }
        }
    }

    private _checkCustomSettings() {
        let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
        let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
        let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));
        const l1_def = 0.5;
        const l2_def = 1;
        const l3_def = 2;

        // Default values if empty
        if (isNaN(l3)) l3 = l3_def;
        if (isNaN(l2)) l2 = l2_def;
        if (isNaN(l1)) l1 = l1_def;

        // If someone put things in a dumb order, ignore smaller numbers
        if (l2 > l3) l2 = l3;
        if (l1 > l2) l1 = l2;

        // If custom numbers are smaller than default values, ignore the lower warning
        if (isNaN(l2)) l2 = l3 < l2_def ? l3 : l2_def;
        if (isNaN(l1)) l1 = l2 < l1_def ? l2 : l1_def;

        return [l1, l2, l3];
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Low ratio protection amount
 */
class RatioProtectL1 implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'ratioProtectL1',
        tag: 'Ratio Warn L1',
        placeholder: 'default: 0.5',
        desc: `Set the smallest threshhold to indicate ratio changes. (<em>This is a slight color change</em>).`,
    };
    private _tar: string = '#download';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        console.log('[M+] Enabled custom Ratio Protection L1!');
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * * Medium ratio protection amount
 */
class RatioProtectL2 implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'ratioProtectL2',
        tag: 'Ratio Warn L2',
        placeholder: 'default: 1',
        desc: `Set the median threshhold to warn of ratio changes. (<em>This is a noticeable color change</em>).`,
    };
    private _tar: string = '#download';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        console.log('[M+] Enabled custom Ratio Protection L2!');
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * * High ratio protection amount
 */
class RatioProtectL3 implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'ratioProtectL3',
        tag: 'Ratio Warn L3',
        placeholder: 'default: 2',
        desc: `Set the highest threshhold to prevent ratio changes. (<em>This disables download without FL use</em>).`,
    };
    private _tar: string = '#download';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        console.log('[M+] Enabled custom Ratio Protection L3!');
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

class RatioProtectMin implements Feature {
    private _settings: TextboxSetting = {
        type: 'textbox',
        title: 'ratioProtectMin',
        scope: SettingGroup['Torrent Page'],
        tag: 'Minimum Ratio',
        placeholder: 'ex. 100',
        desc: 'Trigger Ratio Warn L3 if your ratio would drop below this number.',
    };
    // An element that must exist in order for the feature to run
    private _tar: string = '#download';
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Enabled custom Ratio Protection minimum!');
    }
    get settings(): TextboxSetting {
        return this._settings;
    }
}

class RatioProtectIcons implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'ratioProtectIcons',
        scope: SettingGroup['Torrent Page'],
        desc: 'Enable custom browser favicons based on Ratio Protect conditions?',
    };
    // An element that must exist in order for the feature to run
    private _tar: string = '#download';
    private _userID: number = 164109;
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log(
            `[M+] Enabling custom Ratio Protect favicons from user ${this._userID}...`
        );

        // The download text area
        const dlBtn: HTMLAnchorElement | null = document.querySelector('#tddl');
        // The currently unused label area above the download text
        const dlLabel: HTMLDivElement | null = document.querySelector(
            '#download .torDetInnerTop'
        );
        // Would become ratio
        const rNew: HTMLDivElement | null = document.querySelector(this._tar);
        // Current ratio
        const rCur: HTMLSpanElement | null = document.querySelector('#tmR');
        // Seeding or downloading
        const seeding: HTMLSpanElement | null = document.querySelector('#DLhistory');
        // VIP status
        const vipstat: string | null = document.querySelector(
            '#ratio .torDetInnerBottomSpan'
        )
            ? document.querySelector('#ratio .torDetInnerBottomSpan').textContent
            : null;

        // Find favicon links and load a simple default.
        const siteFavicons = document.querySelectorAll("link[rel~='icon']") as NodeListOf<
            HTMLLinkElement
        >;
        if (siteFavicons) this._buildIconLinks(siteFavicons, 'tm_32x32');

        // Test if VIP
        if (vipstat) {
            if (MP.DEBUG) console.log(`VIP = ${vipstat}`);

            if (vipstat.search('VIP expires') > -1) {
                this._buildIconLinks(siteFavicons, 'mouseclock');
                document.title = document.title.replace(
                    ' | My Anonamouse',
                    ` | Expires ${vipstat.substring(26)}`
                );
            } else if (vipstat.search('VIP not set to expire') > -1) {
                this._buildIconLinks(siteFavicons, '0cir');
                document.title = document.title.replace(
                    ' | My Anonamouse',
                    ' | not set to expire'
                );
            } else if (vipstat.search('This torrent is freeleech!') > -1) {
                this._buildIconLinks(siteFavicons, 'mouseclock');
                document.title = document.title.replace(
                    ' | My Anonamouse',
                    " | 'till next Site FL"
                );
            }
        }
        console.log('[M+] Custom Ratio Protect favicons enabled!');
    }

    private async _buildIconLinks(elems: NodeListOf<HTMLLinkElement>, filename: string) {
        elems.forEach((elem) => {
            elem.href = `https://cdn.myanonamouse.net/imagebucket/${this._userID}/${filename}.png`;
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    set userID(newID: number) {
        this._userID = newID;
    }
}

// TODO: Add feature to set RatioProtectIcon's `_userID` value. Only necessary once other icon sets exist.
