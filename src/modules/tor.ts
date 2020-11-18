/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * Autofills the Gift box with a specified number of points.
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
 * Adds various links to Goodreads
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
            console.log(`GoodreadsButton._buildURL( ${type}, ${inp} )`);
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
            inp
        ).replace("'", '%27')}&search_type=books&search%5Bfield%5D=${grType}`;

        // Return a value eventually
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

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

        // Only run the code if the ratio exists
        if (rNew && rCur) {
            // Extract the number values and calculate the dif
            const rdiff = Util.extractFloat(rCur)[0] - Util.extractFloat(rNew)[0];

            if (!seeding && dlLabel) {
                // if NOT already seeding or downloading
                dlLabel.innerHTML = `Ratio loss ${rdiff.toPrecision(2)}`;
                dlLabel.style.fontWeight = 'normal'; //To distinguish from BOLD Titles
            }

            if (dlBtn && dlLabel) {
                // Change this number to your "trivial ratio loss" amount
                // These changes will always happen if the ratio conditions are met
                if (rdiff > 0.3) {
                    dlBtn.style.backgroundColor = 'SpringGreen';
                    dlBtn.style.color = 'black';
                }

                // Change this number to your I never want to dl w/o FL ratio loss amount
                if (rdiff > 1) {
                    dlBtn.style.backgroundColor = 'Red';
                    // Disable link to prevent download
                    dlBtn.style.pointerEvents = 'none';
                    // maybe hide the button, and add the Ratio Loss warning in its place?
                    dlBtn.innerHTML = 'FL Recommended';
                    dlLabel.style.fontWeight = 'bold';
                    // Change this number to your "I need to think about using a FL ratio loss" amount
                } else if (rdiff > 0.5) {
                    dlBtn.style.backgroundColor = 'Orange';
                }
            }
        }
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
