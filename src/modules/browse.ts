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
        Util.startFeature(this._settings, this._tar, 'browse')
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
        Util.startFeature(this._settings, this._tar, 'browse')
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
    private _isOpen: string | undefined = GM_getValue(`${this._settings.title}State`);

    constructor() {
        Util.startFeature(this._settings, this._tar, 'browse')
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        let toggleBtn: Promise<HTMLElement>;
        let copyBtn: Promise<HTMLElement>;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;
        let share = new Shared();

        // Queue building the button and getting the results
        await Promise.all([
            toggleBtn = share.createButton('plainToggle', 'Show Plaintext', 'div', '#ssr > h1', 'afterend', 'mp_toggle mp_plainBtn' ),
            resultList = share.getSearchList()
        ]);

        copyBtn = share.createButton('plainCopy', 'Copy Plaintext', 'div', '#mp_plainToggle', 'afterend', 'mp_copy mp_plainBtn');

        /* FIXME: */
        toggleBtn;
        copyBtn;
        resultList;

        this._setOpenState(this._isOpen);

        /* toggleBtn.then(btn => {
            // Update based on vis state
            btn.addEventListener('click', () => {
                // TODO: This is where you are
                if (this._visible === "true") {
                    this._setVisState("false");
                } else {
                    this._setVisState("true");
                }
                this._filterResults(results, snatchedHook);
            }, false);
        }).catch(err => {
            throw new Error(err);
        });

        copyBtn.then( btn => {
            btn.insertAdjacentElement('afterend','');
        } ); */

        console.log('[M+] Inserted plaintext search results!');
    }

    private _setOpenState(val: string | undefined): void {
        if (MP.DEBUG) { console.log('PT open state:', this._isOpen, '\nPT val:', val); }
        if (val === undefined) { val = "false"; } // Default value
        GM_setValue('toggleSnatchedState', val);
        this._isOpen = val;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    get isOpen(): string | undefined {
        return this._isOpen;
    }

    set isOpen(val: string | undefined) {
        this._setOpenState(val);
    }
}
