/// <reference path="check.ts" />

/**
 * Class for handling values and methods related to styles
 * @constructor Inits theme based on last saved value; can be called before page content is loaded
 */
class Style {

    private _prevTheme:string|null;
    private _theme:string;

    constructor() {

        // The light theme is the default theme, so use M+ Light values
        this._theme = 'light';

        // Get the previously used theme object
        this._prevTheme = this._getPrevTheme();

        // If the previous theme object exists, assume the current theme is identical
        if( this._prevTheme !== null ) {
            this._theme = this._prevTheme;
        }
    }

    /** Sets the M+ theme based on the site theme */
    public async alignToSiteTheme(): Promise<void> {
        const theme:string = await this._getSiteCSS();
        this._theme = (theme.indexOf('dark') > 0) ? 'dark' : 'light';
        if (this._prevTheme !== this._theme) {
            this._setPrevTheme();
        }
        // Inject the css class used by M+ for themeing
        document.querySelector('head').classList.add(`mp_${this._theme}`);
    }

    /** Injects the stylesheet link into the header */
    public injectLink():void {
        const id:string = 'mp_css';
        if( !document.getElementById(id) ) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = GM_getResourceURL('MP_CSS');
            document.querySelector('head').appendChild(link);
        }
    }

    /** Allows the current theme to be returned */
    get theme(): string {
        return this._theme;
    }

    /** Returns the previous theme object if it exists */
    private _getPrevTheme():string|null {
        return GM_getValue( 'mp-style_theme' );
    }

    /** Saves the current theme for future reference */
    private _setPrevTheme():void {
        GM_setValue('mp-style_theme', this._theme);
    }

    /** Returns a promise of the stylesheet name currently being used */
    private _getSiteCSS():Promise<string> {
        return new Promise( (resolve) => {
            const siteTheme:string = document.querySelector('head link[href*="ICGstation"]')
                .getAttribute('href');
            if( siteTheme === typeof 'string' ) {
                resolve(siteTheme);
            }
        } );
    }
}
