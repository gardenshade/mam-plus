/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * Autofills the Gift box with a specified number of points.
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
        Util.startFeature(this._settings, this._tar, ['torrent'])
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
        Util.startFeature(this._settings, this._tar, ['torrent'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        console.log('[M+] Adding the MAM-to-Goodreads buttons...');

        let authorData:NodeListOf<HTMLAnchorElement>|null = document.querySelectorAll('#torDetMainCon .torAuthors a');
        let bookData: HTMLSpanElement|null = document.querySelector('#torDetMainCon .TorrentTitle');
        let seriesData: NodeListOf<HTMLAnchorElement>|null = document.querySelectorAll('#Series a');
        let target:HTMLDivElement|null = document.querySelector(this._tar);
        let series: Promise<BookDataObject>, author: Promise<BookDataObject>;

        Util.addTorDetailsRow( target,'Search Goodreads','mp_grRow' );

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
                Util.injectTorButton(buttonTar, url, ser.desc, 4);
            }
        });

        // Build Author button, then extract Book data (requires Author data)
        await author.then( auth => {
            if(auth.extracted !== ''){
                let url: string = this._buildGrSearchURL('author', auth.extracted);
                Util.injectTorButton(buttonTar, url, auth.desc, 3);
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
            Util.injectTorButton(buttonTar, url, book.desc, 2);
            // If a title and author both exist, make an extra button
            if (auth.extracted !== '' && book.extracted !== '') {
                let bothURL: string = this._buildGrSearchURL('on', `${book.extracted} ${auth.extracted}`);
                Util.injectTorButton(buttonTar, bothURL, 'Title + Author', 1);
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
        return `http://www.dereferer.org/?https://www.goodreads.com/search?q=${encodeURIComponent(inp).replace('\'', '&apos;')}&search_type=books&search%5Bfield%5D=${grType}`;

        // Return a value eventually
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class CurrentlyReading implements Feature {
    private _settings: CheckboxSetting = {
        type: "checkbox",
        scope: SettingGroup['Torrent Page'],
        title: "currentlyReading",
        desc: `Add a button to generate a "Currently Reading" forum snippet`
    }
    private _tar: string = '#torDetMainCon .TorrentTitle';
    constructor() {
        Util.startFeature(this._settings, this._tar, ['torrent'])
        .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        // Get the required information
        const title: string = document!.querySelector('#torDetMainCon .TorrentTitle')!.textContent!;
        const authors:NodeListOf<HTMLAnchorElement> = document.querySelectorAll('#torDetMainCon .torAuthors a');
        const torID: string = window.location.pathname.split('/')[2];
        const rowTar: HTMLDivElement|null = document.querySelector('#fInfo');

        // Title can't be null
        if(title === null){throw new Error(`Title field was null`);}

        // Build a new table row
        const crRow:HTMLDivElement = await Util.addTorDetailsRow(rowTar, 'Currently Reading', 'mp_crRow');
        // Process data into string
        const blurb:string = await this._generateSnippet(torID,title,authors);
        // Build button
        const btn:HTMLDivElement = await this._buildButton( crRow, blurb );

        btn.addEventListener( 'click', () => {
            //
        } );

    }

    // Build a BB Code text snippet using the book info, then return it
    private _generateSnippet( id:string, title:string, authors:NodeListOf<HTMLAnchorElement> ):string {
        let authorText = '';
        authors.forEach( authorElem => {
            authorText += `[i]${authorElem.textContent}[/i], `;
        } );
        // Return the string, but remove unneeded punctuation
        return `[url=/t/${id}]${title}[/url] by ${authorText.slice(0, -2)}`;
    }

    // Build a button on the tor details page
    private _buildButton( tar:HTMLDivElement, content:string ): HTMLDivElement{

        // Build text display & button
        tar.innerHTML = `<textarea rows="1" cols="80">${content}</textarea>`;
        // Return button
        return <HTMLDivElement>document.querySelector('.mp_reading');
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
