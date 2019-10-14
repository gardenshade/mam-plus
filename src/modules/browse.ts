/// <reference path="shared.ts" />
/**
 * BROWSE/REQUESTS FEATURES
 */

 /**
  * Allows Snatched torrents to be hidden/shown
  */
class ToggleSnatched implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Browse & Search'],
        type: 'checkbox',
        title: 'toggleSnatched',
        desc: `Add a button to hide/show results that you've snatched`,
    }
    private _tar: string = '#ssr';
    private _isVisible: boolean = true;
    private _searchList: NodeListOf<HTMLTableRowElement>|undefined;
    private _snatchedHook: string = 'td div[class^="browse"]';
    private _share: Shared = new Shared();

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init():Promise<void> {
        let toggle: Promise<HTMLElement>;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;
        let results: NodeListOf<HTMLTableRowElement>;
        const storedState:string|undefined = GM_getValue( `${this._settings.title}State` );

        if(
            storedState === 'false' &&
            GM_getValue( 'stickySnatchedToggle' ) === true
        ){
            this._setVisState(false);
        }else{
            this._setVisState(true);
        }

        const toggleText:string = this._isVisible ? 'Hide Snatched' : 'Show Snatched';

        // Queue building the button and getting the results
        await Promise.all([
            toggle = Util.createButton('snatchedToggle', toggleText, 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton'),
            resultList = this._share.getSearchList()
        ]);

        toggle.then(btn => {
            // Update based on vis state
            btn.addEventListener('click', () => {
                if (this._isVisible === true) {
                    btn.innerHTML = 'Show Snatched';
                    this._setVisState(false);
                } else {
                    btn.innerHTML = 'Hide Snatched';
                    this._setVisState(true);
                }
                this._filterResults(results, this._snatchedHook);
            }, false);
        }).catch(err => {
            throw new Error(err);
        });

        resultList.then(
            async res => {
                results = res;
                this._searchList = res;
                this._filterResults(results, this._snatchedHook);
                console.log('[M+] Added the Toggle Snatched button!');
            }
        )
        .then(() => {
            // Observe the Search results
            Check.elemObserver('#ssr', () => {
                resultList = this._share.getSearchList();

                resultList.then(async res => {
                    results = res;
                    this._searchList = res;
                    await this._filterResults(results, this._snatchedHook);
                });
            });
        });
    }

    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    private _filterResults(list: NodeListOf<HTMLTableRowElement>, subTar:string): void  {
        list.forEach((snatch) => {
            const btn:HTMLHeadingElement = <HTMLHeadingElement>document.querySelector('#mp_snatchedToggle')!;

            // Select only the items that match our sub element
            let result = snatch.querySelector(subTar);

            if(result !== null){
                // Hide/show as required
                if(this._isVisible === false){
                    btn.innerHTML = 'Show Snatched';
                    snatch.style.display = 'none';
                }else{
                    btn.innerHTML = 'Hide Snatched';
                    snatch.style.display = 'table-row';
                }
            }
        });
    }

    private _setVisState(val:boolean):void {
        if(MP.DEBUG){console.log('Snatch vis state:',this._isVisible,'\nval:',val);}
        GM_setValue(`${this._settings.title}State`, `${val}`);
        this._isVisible = val;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get searchList(): NodeListOf<HTMLTableRowElement>{
        if(this._searchList === undefined){
            throw new Error('searchlist is undefined');
        }
        return this._searchList;
    }

    get visible(): boolean{
        return this._isVisible;
    }

    set visible( val:boolean ){
        this._setVisState(val);
    }
}

/**
 * Remembers the state of ToggleSnatched between page loads
 */
class StickySnatchedToggle implements Feature{
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Browse & Search'],
        type: 'checkbox',
        title: 'stickySnatchedToggle',
        desc: `Make toggle state persist between page loads`,
    }
    private _tar: string = '#ssr';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse'])
            .then(t => { if (t) { this._init() } });
    }

    private _init() {
        console.log('[M+] Remembered snatch visibility state!');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Generate a plaintext list of search results
 */
class PlaintextSearch implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup['Browse & Search'],
        type: 'checkbox',
        title: 'plaintextSearch',
        desc: `Insert plaintext search results at top of page`,
    }
    private _tar: string = '#ssr h1';
    private _isOpen:"true"| "false" | undefined = GM_getValue(`${this._settings.title}State`);
    private _share:Shared = new Shared();
    private _plainText:string = '';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        let toggleBtn: Promise<HTMLElement>;
        let copyBtn: HTMLElement;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;

        // Queue building the toggle button and getting the results
        await Promise.all([
            toggleBtn = Util.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr', 'beforebegin', 'mp_toggle mp_plainBtn' ),
            resultList = this._share.getSearchList()
        ]);

        // Process the results into plaintext
        resultList.then( async res => {
            // Build the copy button
            copyBtn = await Util.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');
            // Build the plaintext box
            copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);
            // Insert plaintext results
            this._plainText = await this._processResults(res);
            document.querySelector('.mp_plaintextSearch')!.innerHTML = this._plainText;
            // Set up a click listener
            Util.clipboardifyBtn(copyBtn, this._plainText);
        } )
        .then( () => {
            // Observe the Search results
            Check.elemObserver('#ssr', () => {
                document.querySelector('.mp_plaintextSearch')!.innerHTML = '';
                resultList = this._share.getSearchList();
                resultList.then( async res => {
                    // Insert plaintext results
                    this._plainText = await this._processResults(res);
                    document.querySelector('.mp_plaintextSearch')!.innerHTML = this._plainText;
                } );
            });
        } );

        // Init open state
        this._setOpenState(this._isOpen);

        // Set up toggle button functionality
        toggleBtn.then(btn => {
            btn.addEventListener('click', () => {
                // Textbox should exist, but just in case...
                const textbox: HTMLTextAreaElement | null = document.querySelector('.mp_plaintextSearch');
                if (textbox === null) { throw new Error(`textbox doesn't exist!`); }
                else{
                    // Toggle
                    if (this._isOpen === "false") {
                        this._setOpenState("true");
                        textbox.style.display = 'block';
                        btn.innerText = 'Hide Plaintext';
                    } else {
                        this._setOpenState("false");
                        textbox.style.display = 'none';
                        btn.innerText = 'Show Plaintext';
                    }
                }
            }, false);
        }).catch(err => {
            throw new Error(err);
        });

        console.log('[M+] Inserted plaintext search results!');
    }

    /**
     * Sets Open State to true/false internally and in script storage
     * @param val stringified boolean
     */
    private _setOpenState(val:"true"|"false"|undefined): void {
        if (val === undefined) { val = "false"; } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }

    private  async _processResults( results:NodeListOf<HTMLTableRowElement> ):Promise<string>{
        let outp: string = '';
        results.forEach(node => {
            // Reset each text field
            let title: string = '';
            let seriesTitle: string = '';
            let authTitle: string = '';
            let narrTitle: string = '';
            // Break out the important data from each node
            let rawTitle: HTMLAnchorElement | null = node.querySelector('.torTitle');
            let seriesList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll('.series');
            let authList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll('.author');
            let narrList: NodeListOf<HTMLAnchorElement> | null = node.querySelectorAll('.narrator');

            if (rawTitle === null) {
                console.warn('Error Node:', node);
                throw new Error(`Result title should not be null`);
            } else {
                title = rawTitle.textContent!.trim();
            }

            // Process series
            if (seriesList !== null && seriesList.length > 0) {
                seriesList.forEach(series => {
                    seriesTitle += `${series.textContent} / `;
                });
                // Remove trailing slash from last series, then style
                seriesTitle = seriesTitle.substring(0, seriesTitle.length - 3);
                seriesTitle = ` (${seriesTitle})`;
            }
            // Process authors
            if (authList !== null && authList.length > 0) {
                authTitle = 'BY ';
                authList.forEach(auth => {
                    authTitle += `${auth.textContent} AND `;
                });
                // Remove trailing AND
                authTitle = authTitle.substring(0, authTitle.length - 5);
            }
            // Process narrators
            if (narrList !== null && narrList.length > 0) {
                narrTitle = 'FT ';
                narrList.forEach(narr => {
                    narrTitle += `${narr.textContent} AND `
                });
                // Remove trailing AND
                narrTitle = narrTitle.substring(0, narrTitle.length - 5);
            }
            outp += (`${title}${seriesTitle} ${authTitle} ${narrTitle}\n`);
        });
        return outp;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get isOpen(): "true"|"false" | undefined {
        return this._isOpen;
    }

    set isOpen(val: "true"|"false" | undefined) {
        this._setOpenState(val);
    }
}
