/// <reference path="shared.ts" />
/**
 * # REQUEST PAGE FEATURES
 */
/**
 * * Hide requesters who are set to "hidden"
 */
class ToggleHiddenRequesters implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Requests,
        type: 'checkbox',
        title: 'toggleHiddenRequesters',
        desc: `Hide hidden requesters`,
    };
    private _tar: string = '#torRows';
    private _searchList: NodeListOf<HTMLLIElement> | undefined;
    private _hide = true;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init(): Promise<void> {
        this._addToggleSwitch();
        this._searchList = await this._getRequestList();
        this._filterResults(this._searchList);

        Check.elemObserver(this._tar, async () => {
            this._searchList = await this._getRequestList();
            this._filterResults(this._searchList);
        });
    }

    private _addToggleSwitch() {
        // Make a new button and insert beside the Search button
        Util.createButton(
            'showHidden',
            'Show Hidden',
            'div',
            '#requestSearch .torrentSearch',
            'afterend',
            'torFormButton'
        );
        // Select the new button and add a click listener
        const toggleSwitch: HTMLDivElement = <HTMLDivElement>(
            document.querySelector('#mp_showHidden')
        );
        toggleSwitch.addEventListener('click', () => {
            const hiddenList: NodeListOf<HTMLLIElement> = document.querySelectorAll(
                '#torRows > .mp_hidden'
            );

            if (this._hide) {
                this._hide = false;
                toggleSwitch.innerText = 'Hide Hidden';
                hiddenList.forEach((item) => {
                    item.style.display = 'list-item';
                    item.style.opacity = '0.5';
                });
            } else {
                this._hide = true;
                toggleSwitch.innerText = 'Show Hidden';
                hiddenList.forEach((item) => {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                });
            }
        });
    }

    private _getRequestList(): Promise<NodeListOf<HTMLLIElement>> {
        return new Promise((resolve, reject) => {
            // Wait for the requests to exist
            Check.elemLoad('#torRows .torRow .torRight').then(() => {
                // Grab all requests
                const reqList:
                    | NodeListOf<HTMLLIElement>
                    | null
                    | undefined = document.querySelectorAll(
                    '#torRows .torRow'
                ) as NodeListOf<HTMLLIElement>;

                if (reqList === null || reqList === undefined) {
                    reject(`reqList is ${reqList}`);
                } else {
                    resolve(reqList);
                }
            });
        });
    }

    private _filterResults(list: NodeListOf<HTMLLIElement>) {
        list.forEach((request) => {
            const requester: HTMLAnchorElement | null = request.querySelector(
                '.torRight a'
            );
            if (requester === null) {
                request.style.display = 'none';
                request.classList.add('mp_hidden');
            }
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * * Generate a plaintext list of request results
 */
class PlaintextRequest implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Requests,
        type: 'checkbox',
        title: 'plaintextRequest',
        desc: `Insert plaintext request results at top of request page`,
    };
    private _tar: string = '#ssr';
    private _isOpen: 'true' | 'false' | undefined = GM_getValue(
        `${this._settings.title}State`
    );
    private _plainText: string = '';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['request']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        let toggleBtn: Promise<HTMLElement>;
        let copyBtn: HTMLElement;
        let resultList: Promise<NodeListOf<HTMLLIElement>>;

        // Queue building the toggle button and getting the results
        await Promise.all([
            (toggleBtn = Util.createButton(
                'plainToggle',
                'Show Plaintext',
                'div',
                '#ssr',
                'beforebegin',
                'mp_toggle mp_plainBtn'
            )),
            (resultList = this._getRequestList()),
        ]);

        // Process the results into plaintext
        resultList
            .then(async (res) => {
                // Build the copy button
                copyBtn = await Util.createButton(
                    'plainCopy',
                    'Copy Plaintext',
                    'div',
                    '#mp_plainToggle',
                    'afterend',
                    'mp_copy mp_plainBtn'
                );
                // Build the plaintext box
                copyBtn.insertAdjacentHTML(
                    'afterend',
                    `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`
                );
                // Insert plaintext results
                this._plainText = await this._processResults(res);
                document.querySelector(
                    '.mp_plaintextSearch'
                )!.innerHTML = this._plainText;
                // Set up a click listener
                Util.clipboardifyBtn(copyBtn, this._plainText);
            })
            .then(() => {
                // Observe the Search results
                Check.elemObserver('#ssr', () => {
                    document.querySelector('.mp_plaintextSearch')!.innerHTML = '';
                    resultList = this._getRequestList();
                    resultList.then(async (res) => {
                        // Insert plaintext results
                        this._plainText = await this._processResults(res);
                        document.querySelector(
                            '.mp_plaintextSearch'
                        )!.innerHTML = this._plainText;
                    });
                });
            });

        // Init open state
        this._setOpenState(this._isOpen);

        // Set up toggle button functionality
        toggleBtn
            .then((btn) => {
                btn.addEventListener(
                    'click',
                    () => {
                        // Textbox should exist, but just in case...
                        const textbox: HTMLTextAreaElement | null = document.querySelector(
                            '.mp_plaintextSearch'
                        );
                        if (textbox === null) {
                            throw new Error(`textbox doesn't exist!`);
                        } else if (this._isOpen === 'false') {
                            this._setOpenState('true');
                            textbox.style.display = 'block';
                            btn.innerText = 'Hide Plaintext';
                        } else {
                            this._setOpenState('false');
                            textbox.style.display = 'none';
                            btn.innerText = 'Show Plaintext';
                        }
                    },
                    false
                );
            })
            .catch((err) => {
                throw new Error(err);
            });

        console.log('[M+] Inserted plaintext request results!');
    }

    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    private _setOpenState(val: 'true' | 'false' | undefined): void {
        if (val === undefined) {
            val = 'false';
        } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }

    private async _processResults(results: NodeListOf<HTMLLIElement>): Promise<string> {
        let outp: string = '';
        results.forEach((node) => {
            // Reset each text field
            let title: string = '';
            let seriesTitle: string = '';
            let authTitle: string = '';
            let narrTitle: string = '';
            // Break out the important data from each node
            const rawTitle: HTMLAnchorElement | null = node.querySelector('.torTitle');
            const seriesList: NodeListOf<
                HTMLAnchorElement
            > | null = node.querySelectorAll('.series');
            const authList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll(
                '.author'
            );
            const narrList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll(
                '.narrator'
            );

            if (rawTitle === null) {
                console.warn('Error Node:', node);
                throw new Error(`Result title should not be null`);
            } else {
                title = rawTitle.textContent!.trim();
            }

            // Process series
            if (seriesList !== null && seriesList.length > 0) {
                seriesList.forEach((series) => {
                    seriesTitle += `${series.textContent} / `;
                });
                // Remove trailing slash from last series, then style
                seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                seriesTitle = ` (${seriesTitle})`;
            }
            // Process authors
            if (authList !== null && authList.length > 0) {
                authTitle = 'BY ';
                authList.forEach((auth) => {
                    authTitle += `${auth.textContent} AND `;
                });
                // Remove trailing AND
                authTitle = authTitle.substring(0, authTitle.length - 5);
            }
            // Process narrators
            if (narrList !== null && narrList.length > 0) {
                narrTitle = 'FT ';
                narrList.forEach((narr) => {
                    narrTitle += `${narr.textContent} AND `;
                });
                // Remove trailing AND
                narrTitle = narrTitle.substring(0, narrTitle.length - 5);
            }
            outp += `${title}${seriesTitle} ${authTitle} ${narrTitle}\n`;
        });
        return outp;
    }

    private _getRequestList = (): Promise<NodeListOf<HTMLLIElement>> => {
        if (MP.DEBUG) console.log(`Shared.getSearchList( )`);
        return new Promise((resolve, reject) => {
            // Wait for the request results to exist
            Check.elemLoad('#torRows .torRow a').then(() => {
                // Select all request results
                const snatchList: NodeListOf<HTMLLIElement> = <NodeListOf<HTMLLIElement>>(
                    document.querySelectorAll('#torRows .torRow')
                );
                if (snatchList === null || snatchList === undefined) {
                    reject(`snatchList is ${snatchList}`);
                } else {
                    resolve(snatchList);
                }
            });
        });
    };

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get isOpen(): 'true' | 'false' | undefined {
        return this._isOpen;
    }

    set isOpen(val: 'true' | 'false' | undefined) {
        this._setOpenState(val);
    }
}

class GoodreadsButtonReq implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'goodreadsButtonReq',
        scope: SettingGroup.Requests,
        desc: 'Enable MAM-to-Goodreads buttons for requests',
    };
    private _tar: string = '#fillTorrent';
    private _share = new Shared();
    constructor() {
        Util.startFeature(this._settings, this._tar, ['request details']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        // Convert row structure into searchable object
        const reqRows = Util.rowsToObj(document.querySelectorAll('#torDetMainCon > div'));
        // Select the data points
        const bookData: HTMLSpanElement | null = reqRows['Title:'].querySelector('span');
        const authorData: NodeListOf<HTMLAnchorElement> | null = reqRows[
            'Author(s):'
        ].querySelectorAll('a');
        const seriesData: NodeListOf<HTMLAnchorElement> | null = reqRows['Series:']
            ? reqRows['Series:'].querySelectorAll('a')
            : null;
        const target: HTMLDivElement | null = reqRows['Release Date'];
        // Generate buttons
        this._share.goodreadsButtons(bookData, authorData, seriesData, target);
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
