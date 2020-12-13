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

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                // The feature should only run on book categories
                const cat = document.querySelector('#fInfo [class^=cat]');
                if (cat && Check.isBookCat(parseInt(cat.className.substr(3)))) {
                    this._init();
                } else {
                    console.log('[M+] Not a book category; skipping Goodreads buttons');
                }
            }
        });
    }

    private async _init() {
        console.log('[M+] Adding the MAM-to-Goodreads buttons...');

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
        let series: Promise<BookDataObject>, author: Promise<BookDataObject>;

        Util.addTorDetailsRow(target, 'Search Goodreads', 'mp_grRow');

        // Extract the Series and Author
        await Promise.all([
            (series = this._extractData('series', seriesData)),
            (author = this._extractData('author', authorData)),
        ]);

        await Check.elemLoad('.mp_grRow .flex');

        const buttonTar: HTMLSpanElement = <HTMLSpanElement>(
            document.querySelector('.mp_grRow .flex')
        );
        if (buttonTar === null) {
            throw new Error('Button row cannot be targeted!');
        }

        // Build Series button
        series.then((ser) => {
            if (ser.extracted !== '') {
                const url: string = this._buildGrSearchURL('series', ser.extracted);
                Util.createLinkButton(buttonTar, url, ser.desc, 4);
            }
        });

        // Build Author button, then extract Book data (requires Author data)
        await author
            .then((auth) => {
                if (auth.extracted !== '') {
                    const url: string = this._buildGrSearchURL('author', auth.extracted);
                    Util.createLinkButton(buttonTar, url, auth.desc, 3);
                } else if (MP.DEBUG) {
                    console.warn('No author data detected!');
                }
                return {
                    auth: auth,
                    book: this._extractData('book', bookData, auth.extracted),
                };
            })
            // Build Book button
            .then(async (result) => {
                const auth: BookDataObject = result.auth;
                const book: BookDataObject = await result.book;
                const url: string = this._buildGrSearchURL('book', book.extracted);
                Util.createLinkButton(buttonTar, url, book.desc, 2);
                // If a title and author both exist, make an extra button
                if (auth.extracted !== '' && book.extracted !== '') {
                    const bothURL: string = this._buildGrSearchURL(
                        'on',
                        `${book.extracted} ${auth.extracted}`
                    );
                    Util.createLinkButton(buttonTar, bothURL, 'Title + Author', 1);
                } else if (MP.DEBUG) {
                    console.log(
                        `Book+Author failed.\nBook: ${book.extracted}\nAuthor: ${auth.extracted}`
                    );
                }
            });

        console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
    }

    /**
     * Extracts data from title/auth/etc
     */
    private _extractData(
        type: BookData,
        data: HTMLSpanElement | NodeListOf<HTMLAnchorElement> | null,
        auth?: string
    ): Promise<BookDataObject> {
        if (auth === undefined) {
            auth = '';
        }
        return new Promise((resolve) => {
            if (data === null) {
                throw new Error(`${type} data is null`);
            } else {
                let extracted: string = '';
                let desc: string = '';
                const cases: any = {
                    author: () => {
                        desc = 'Author';
                        const nodeData: NodeListOf<HTMLAnchorElement> = <
                            NodeListOf<HTMLAnchorElement>
                        >data;
                        const length: number = nodeData.length;
                        let authList: string = '';
                        // Only use a few authors, if more authors exist
                        for (let i = 0; i < length && i < 3; i++) {
                            authList += `${nodeData[i].innerText} `;
                        }
                        // Check author for initials
                        extracted = this._smartAuth(authList);
                    },
                    book: () => {
                        extracted = (data as HTMLSpanElement).innerText;
                        desc = 'Title';
                        // Check title for brackets & shorten it
                        extracted = Util.trimString(Util.bracketRemover(extracted), 50);
                        extracted = this._checkDashes(extracted, auth!);
                    },
                    series: () => {
                        desc = 'Series';
                        const nodeData: NodeListOf<HTMLAnchorElement> = <
                            NodeListOf<HTMLAnchorElement>
                        >data;
                        nodeData.forEach((series) => {
                            extracted += `${series.innerText} `;
                        });
                    },
                };
                if (cases[type]) {
                    cases[type]();
                }
                resolve({ extracted: extracted, desc: desc });
            }
        });
    }

    /**
     * Returns a title without author name if the title was split with a dash
     */
    private _checkDashes(title: string, checkAgainst: string): string {
        if (MP.DEBUG) {
            console.log(
                `GoodreadsButton._checkDashes( ${title}, ${checkAgainst} ): Count ${title.indexOf(
                    ' - '
                )}`
            );
        }

        // Dashes are present
        if (title.indexOf(' - ') !== -1) {
            if (MP.DEBUG) {
                console.log(`> Book title contains a dash`);
            }
            const split: string[] = title.split(' - ');
            if (split[0] === checkAgainst) {
                if (MP.DEBUG) {
                    console.log(
                        `> String before dash is author; using string behind dash`
                    );
                }
                return split[1];
            } else {
                return split[0];
            }
        } else {
            return title;
        }
    }

    /**
     * Removes spaces in author names that use adjacent intitials. This is for compatibility with the Goodreads search engine
     * @example "H G Wells G R R Martin" -> "HG Wells GRR Martin"
     * @param auth author string
     */
    private _smartAuth(auth: string): string {
        let outp: string = '';
        const arr: string[] = Util.stringToArray(auth);
        arr.forEach((key, val) => {
            // Current key is an initial
            if (key.length < 2) {
                // If next key is an initial, don't add a space
                const nextLeng: number = arr[val + 1].length;
                if (nextLeng < 2) {
                    outp += key;
                } else {
                    outp += `${key} `;
                }
            } else {
                outp += `${key} `;
            }
        });
        // Trim trailing space
        return outp.trim();
    }

    /**
     * Turns a string into a Goodreads search URL
     * @param type The type of URL to make
     * @param inp The extracted data to URI encode
     */
    private _buildGrSearchURL(type: BookData | 'on', inp: string): string {
        if (MP.DEBUG) {
            console.log(`GoodreadsButton._buildGrSearchURL( ${type}, ${inp} )`);
        }

        let grType: string = type;
        const cases: any = {
            book: () => {
                grType = 'title';
            },
            series: () => {
                grType = 'on';
                inp += ', #';
            },
        };
        if (cases[type]) {
            cases[type]();
        }
        return `http://www.dereferer.org/?https://www.goodreads.com/search?q=${encodeURIComponent(
            inp.replace('%', '')
        ).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;

        // Return a value eventually
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

    // Build a BB Code text snippet using the book info, then return it
    private _generateSnippet(
        id: string,
        title: string,
        authors: NodeListOf<HTMLAnchorElement>
    ): string {
        let authorText = '';
        authors.forEach((authorElem) => {
            authorText += `[i]${authorElem.textContent}[/i], `;
        });
        // Return the string, but remove unneeded punctuation
        return `[url=/t/${id}]${title}[/url] by ${authorText.slice(0, -2)}`;
    }

    // Build a button on the tor details page
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

    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Enabling ratio protection...');
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

                if (dlBtn && dlLabel) {
                    // This is the "trivial ratio loss" threshold
                    // These changes will always happen if the ratio conditions are met
                    if (rDiff > r1) {
                        dlBtn.style.backgroundColor = 'SpringGreen';
                        dlBtn.style.color = 'black';
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
                        dlBtn.innerHTML = 'FL Recommended';
                        dlLabel.style.fontWeight = 'bold';
                        // This is the "I need to think about using a FL" threshold
                    } else if (rDiff > r2) {
                        dlBtn.style.backgroundColor = 'Orange';
                    }
                }
            }
        }
    }

    private _checkCustomSettings() {
        let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
        let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
        let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));

        if (isNaN(l3)) l3 = 1;
        if (isNaN(l2)) l2 = 2 / 3;
        if (isNaN(l1)) l1 = 1 / 3;

        // If someone put things in a dumb order, ignore smaller numbers
        if (l2 > l3) l2 = l3;
        if (l1 > l2) l1 = l2;

        // If custom numbers are smaller than default values, ignore the lower warning
        if (isNaN(l2)) l2 = l3 < 2 / 3 ? l3 : 2 / 3;
        if (isNaN(l1)) l1 = l2 < 1 / 3 ? l2 : 1 / 3;

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
        placeholder: 'default: 0.3',
        desc: `Set the smallest threshhold to warn of ratio changes. (<em>This is a slight color change</em>).`,
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
        console.log('[M+] Set custom L1 Ratio Protection!');
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
        placeholder: 'default: 0.6',
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
        console.log('[M+] Set custom L2 Ratio Protection!');
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
        placeholder: 'default: 1',
        desc: `Set the highest threshhold to warn of ratio changes. (<em>This disables download without FL use</em>).`,
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
        console.log('[M+] Set custom L2 Ratio Protection!');
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
        desc: 'Trigger the maximum warning if your ratio would drop below this number.',
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
        console.log('[M+] Added custom minimum ratio!');
    }
    get settings(): TextboxSetting {
        return this._settings;
    }
}
