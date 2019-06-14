/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * TORRENT PAGE FEATURES
 */

class TorGiftDefault implements Feature{
    private _settings: TextboxSetting = {
        scope: SettingGroup['Torrent Page'],
        type: 'textbox',
        title: 'torGiftDefault',
        tag: "Default Gift",
        placeholder: "ex. 5000, max",
        desc: 'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
    }
    private _tar: string = '#thanksArea input[name=points]';

    constructor(){
        Util.startFeature(this._settings, this._tar, 'torrent')
        .then(t => { if (t) { this._init() } });
    }

    private _init() {
        new Shared().fillGiftBox(this._tar, this._settings.title)
        .then((points) => console.log(`[M+] Set the default gift amount to ${points}`));
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
    }
    private _tar: string = '#submitInfo';

    constructor() {
        Util.startFeature(this._settings, this._tar, 'torrent')
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        console.log('[M+] Adding the MAM-to-Goodreads buttons...');

        let authorData:NodeListOf<HTMLAnchorElement>|null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        let bookData: HTMLSpanElement|null = document.querySelector('#torDetMainCon .TorrentTitle');
        let seriesData: NodeListOf<HTMLAnchorElement>|null = document.querySelectorAll('#Series a');
        let target:HTMLDivElement|null = document.querySelector(this._tar);
        let series: Promise<BookDataObject>, author: Promise<BookDataObject>;

        if(target === null || target.parentElement === null){
            throw new Error(`Goodreads Btn: empty node or parent node @ ${this._tar}`)
        }else{
            target.parentElement.insertAdjacentHTML('afterend','<div class="torDetRow"><div class="torDetLeft">Search Goodreads</div><div class="torDetRight mp_grRow"><span class="flex"></span></div></div>');
        }

        // Extract the Series and Author
        await Promise.all([
            series = this._extractData( 'series', seriesData ),
            author = this._extractData( 'author', authorData )
        ]);

        if(MP.DEBUG){ console.log('Checking for Goodreads Row, this should only take a sec...') }
        await Check.elemLoad('.mp_grRow .flex');

        let buttonTar:HTMLSpanElement = <HTMLSpanElement>document.querySelector('.mp_grRow .flex');
        if(buttonTar === null){ throw new Error('Button row cannot be targeted!') }

        // Build Series button
        series.then( ser => {
            if(ser.extracted !== ''){
                let url: string = this._buildGrSearchURL('series', ser.extracted);
                this._injectButton(buttonTar, url, ser.desc, 4);
            }
        });

        // Build Author button, then extract Book data (requires Author data)
        await author.then( auth => {
            if(auth.extracted !== ''){
                let url: string = this._buildGrSearchURL('author', auth.extracted);
                this._injectButton(buttonTar, url, auth.desc, 3);
            }else{
                if(MP.DEBUG){ console.warn('No author data detected!'); }
            }
            return {
                'auth': auth,
                'book': this._extractData('book', bookData, auth.extracted)
            };
        } )
        // Build Book button
        .then( async result => {
            let auth:BookDataObject = result.auth;
            let book:BookDataObject = await result.book;
            let url:string = this._buildGrSearchURL('book', book.extracted);
            await this._injectButton(buttonTar, url, book.desc,2);
            // If a title and author both exist, make an extra button
            if (auth.extracted !== '' && book.extracted !== '') {
                let bothURL: string = this._buildGrSearchURL('on', `${book.extracted} ${auth.extracted}`);
                this._injectButton(buttonTar, bothURL, 'Title + Author',1);
            }else{
                if(MP.DEBUG){console.log(`Book+Author failed.\nBook: ${book.extracted}\nAuthor: ${auth.extracted}`);}
            }
        });


        console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
    }

    /**
     * Extracts data from title/auth/etc
    */
    private _extractData( type:BookData,data:HTMLSpanElement|NodeListOf<HTMLAnchorElement>|null, auth?:string ): Promise<BookDataObject> {
        if(auth === undefined){ auth = '';}
        return new Promise( resolve => {
            if(data === null){
                throw new Error(`${type} data is null`);
            }else{
                let extracted:string = '';
                let desc:string = '';
                let cases:any = {
                    'author': () => {
                        desc = 'Author';
                        let nodeData: NodeListOf<HTMLAnchorElement> = <NodeListOf<HTMLAnchorElement>>data;
                        let length: number = nodeData.length;
                        let authList:string = '';
                        // Only use a few authors, if more authors exist
                        for( let i = 0; i < length && i < 3; i++){
                            authList += `${nodeData[i].innerText} `;
                        }
                        // Check author for initials
                        extracted = this._smartAuth( authList );
                    },
                    'book': () => {
                        extracted = (data as HTMLSpanElement).innerText;
                        desc = 'Title';
                        // Check title for brackets & shorten it
                        extracted = Util.trimString( Util.bracketRemover(extracted),50 );
                        extracted = this._checkDashes( extracted, auth!);
                    },
                    'series': () => {
                        desc = 'Series';
                        let nodeData: NodeListOf<HTMLAnchorElement> = <NodeListOf<HTMLAnchorElement>>data;
                        nodeData.forEach(series => {
                            extracted += `${series.innerText} `;
                        });
                    },
                }
                if (cases[type]) { cases[type](); }
                resolve({'extracted':extracted,'desc':desc});
             }
        } );
    }

    /**
     * Returns a title without author name if the title was split with a dash
     */
    private _checkDashes( title:string, checkAgainst:string ):string {
        if (MP.DEBUG) { console.log(`GoodreadsButton._checkDashes( ${title}, ${checkAgainst} ): Count ${title.indexOf(' - ')}`); }

        // Dashes are present
        if(title.indexOf(' - ') !== -1){
            if(MP.DEBUG){console.log(`> Book title contains a dash`);}
            let split:string[] = title.split(' - ');
            if(split[0] === checkAgainst){
                if (MP.DEBUG) { console.log(`> String before dash is author; using string behind dash`); }
                return split[1];
            }else{
                return split[0];
            }
        }else{
            return title;
        }
    }

    /**
     * Removes spaces in author names that use adjacent intitials. This is for compatibility with the Goodreads search engine
     * @example "H G Wells G R R Martin" -> "HG Wells GRR Martin"
     * @param auth author string
     */
    private _smartAuth( auth:string ):string {
        let outp:string = '';
        let arr:string[] = Util.stringToArray( auth );
        arr.forEach( (key,val) => {
            // Current key is an initial
            if(key.length <2){
                // If next key is an initial, don't add a space
                let nextLeng:number = arr[val + 1].length;
                if(nextLeng <2){ outp += key; }
                else{ outp += `${key} `; }
            }
            else{ outp += `${key} `; }
        } );
        // Trim trailing space
        return outp.trim();
    }

    /**
     * Turns a string into a Goodreads search URL
     * @param type The type of URL to make
     * @param inp The extracted data to URI encode
     */
    private _buildGrSearchURL( type:BookData|"on", inp:string ):string {
        if (MP.DEBUG) { console.log(`GoodreadsButton._buildURL( ${type}, ${inp} )`);}

        let grType:string = type;
        let cases:any = {
            'book': () => { grType = 'title'; },
            'series': () => {
                grType = 'on';
                inp += ', #';
            },
        }
        if (cases[type]) { cases[type](); }
        return `https://www.goodreads.com/search?q=${encodeURIComponent(inp).replace('\'', '&apos;')}&search_type=books&search%5Bfield%5D=${grType}`;

        // Return a value eventually
    }

    /**
     * Injects a URL button into an element
     * @param tar The element the button should be added to
     * @param url The URL the button will send you to
     * @param text The text on the button
     */
    private _injectButton( tar:HTMLElement, url:string, text:string, order:number):void {
        // Create the button
        let button: HTMLAnchorElement = document.createElement('a');
        // Set up the button
        button.classList.add('mp_button_clone');
        button.setAttribute('href', url);
        button.setAttribute('target', '_blank');
        button.innerText = text;
        button.style.order = `${order}`;
        // Inject the button
        tar.insertBefore(button,tar.firstChild);
    }


    get settings(): CheckboxSetting {
        return this._settings;
    }
}
