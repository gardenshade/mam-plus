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
    private _visible: string | undefined = GM_getValue(`${this._settings.title}State`);
    private _searchList: NodeListOf<HTMLTableRowElement>|undefined;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['browse'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init():Promise<void> {
        let toggle: Promise<HTMLElement>;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;
        let results: NodeListOf<HTMLTableRowElement>;
        let snatchedHook: string = 'td div[class^="browse"]';
        let share:Shared = new Shared();

        if (!GM_getValue('stickySnatchedToggle')){
            this._setVisState(undefined);
        }

        // Queue building the button and getting the results
        await Promise.all([
            toggle = share.createButton('snatchedToggle', 'Hide Snatched', 'h1', '#resetNewIcon', 'beforebegin', 'torFormButton' ),
            resultList = share.getSearchList()
        ]);

        this._setVisState(this._visible);

        toggle.then(btn => {
            // Update based on vis state
            btn.addEventListener( 'click', () => {
                if(this._visible === "true"){
                    this._setVisState("false");
                }else{
                    this._setVisState("true");
                }
                this._filterResults(results,snatchedHook);
            },false );
        }).catch(err => {
            throw new Error(err);
        });

        resultList.then(
            async res => {
                results = res;
                this._searchList = res;
                await this._filterResults(results, snatchedHook);
                console.log('[M+] Added the Toggle Snatched button!');
            }
        );
    }

    /**
     * Filters search results
     * @param list a search results list
     * @param subTar the elements that must be contained in our filtered results
     */
    private _filterResults(list: NodeListOf<HTMLTableRowElement>, subTar:string): void  {
        list.forEach((key) => {
            const btn:HTMLHeadingElement = <HTMLHeadingElement>document.querySelector('#mp_snatchedToggle')!;
            // Select only the items that match our sub element
            let result = key.querySelector(subTar);
            if(result !== null){
                // Hide/show as required
                if(this._visible === 'false'){
                    btn.innerHTML = 'Show Snatched';
                    key.style.display = 'none';
                }else{
                    btn.innerHTML = 'Hide Snatched';
                    key.style.display = 'table-row';
                }
            }
        });
    }

    private _setVisState(val:string|undefined):void {
        if(MP.DEBUG){console.log('vis state:',this._visible,'\nval:',val);}
        if (val === undefined) { val = "true"; }
        GM_setValue('toggleSnatchedState', val);
        this._visible = val;
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

    get visible():string|undefined{
        return this._visible;
    }

    set visible( val:string|undefined ){
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
            toggleBtn = this._share.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr', 'beforebegin', 'mp_toggle mp_plainBtn' ),
            resultList = this._share.getSearchList()
        ]);

        // Process the results into plaintext
        resultList.then( async res => {
            // Build the copy button
            copyBtn = await this._share.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');
            // Set up a click listener
            copyBtn.addEventListener('click', () => {
                // Have to override the Navigator type to prevent TS errors
                let nav: NavigatorExtended | undefined = <NavigatorExtended>navigator;
                if (nav === undefined) {
                    alert('Failed to copy text, likely due to missing browser support.');
                    throw new Error("browser doesn't support 'navigator'?")
                } else {
                    // Copy results to clipboard
                    nav.clipboard!.writeText(this._plainText);
                    console.log('[M+] Copied plaintext results to your clipboard!');
                }
            });
            // Build the plaintext box
            copyBtn.insertAdjacentHTML('afterend', `<br><textarea class='mp_plaintextSearch' style='display: none'></textarea>`);

            // Insert plaintext results
            this._plainText = await this._processResults(res);
            document.querySelector('.mp_plaintextSearch')!.innerHTML = this._plainText;
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
