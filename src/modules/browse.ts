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
    private _visible: string | undefined = GM_getValue('toggleSnatchedState');
    private _searchList: NodeListOf<HTMLTableRowElement>|undefined;

    constructor() {
        Util.startFeature(this._settings, this._tar, 'browse')
            .then(t => { if (t) { this._init() } });
    }

    private async _init():Promise<void> {
        let toggle: Promise<HTMLHeadingElement>;
        let resultList: Promise<NodeListOf<HTMLTableRowElement>>;
        let results: NodeListOf<HTMLTableRowElement>;
        let snatchedHook: string = 'td div[class^="browse"]';

        if (!GM_getValue('stickySnatchedToggle')){
            this.setVisState(undefined);
        }

        // Queue building the button and getting the results
        await Promise.all([
            toggle = this._buildBtn(),
            resultList = this._getSearchList()
        ]);

        this.setVisState(this._visible);

        toggle.then(btn => {
            // Update based on vis state
            btn.addEventListener( 'click', () => {
                // TODO: This is where you are
                if(this._visible === "true"){
                    this.setVisState("false");
                }else{
                    this.setVisState("true");
                }
                this._filterResults(results,snatchedHook);
            },false );
        }).catch(err => {
            throw new Error(err);
        });

        resultList.then(
            res => {
                results = res;
                this._filterResults(results, snatchedHook);
            }
        );
    }

    private _buildBtn(): Promise<HTMLHeadingElement> {
        return new Promise( resolve => {
            // Choose the new button insert location and insert elements
            const clearNewBtn: HTMLElement = <HTMLElement>document.querySelector('#resetNewIcon');
            const toggleBtn: HTMLHeadingElement = document.createElement('h1');

            clearNewBtn.insertAdjacentElement("beforebegin", toggleBtn);
            Util.setAttr(toggleBtn, {
                "id": "mp_snatchedToggle",
                "class": "torFormButton",
                "role": "button"
            });
            // Set initial button text
            toggleBtn.innerHTML = 'Hide Snatched';
            resolve( toggleBtn );
        } );
    }

    /**
     * Returns list of all snatches from Browse page
     */
    private _getSearchList(): Promise<NodeListOf<HTMLTableRowElement>> {
        return new Promise( async (resolve) => {
            // Wait for the search results to exist
            await Check.elemLoad('#ssr tr[id ^= "tdr"] td');
            const snatchList: NodeListOf<HTMLTableRowElement> = <NodeListOf<HTMLTableRowElement>>document.querySelectorAll('#ssr tr[id ^= "tdr"]')!;
            this._searchList = snatchList;
            resolve(snatchList);
        } );
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
            console.log('🔥',result);
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

    private setVisState(val:string|undefined):void {
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
        this.setVisState(val);
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
