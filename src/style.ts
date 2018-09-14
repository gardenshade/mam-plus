/// <reference path="check.ts" />
interface StyleObj{
    name:string;
    btnBorder:string;
    btnColor:string;
    btnBack:string;
    placeholderColor:string;
}

/**
 * Class for handling values and methods related to styles
 * @constructor Inits theme based on last saved value; can be called before page content is loaded
 */
class MP_Style {

    private _siteTheme:string;
    private _prevTheme:StyleObj|null;
    private _theme:StyleObj;

        /**
         * TODO:
         * (PRELOAD)
         * x Initialize default theme values
         * x Read previously used theme
         * x Update current theme
         * (POSTLOAD)
         * Read current site theme
         * Check against current theme
         * Update current theme if different
         */

    constructor() {

        // The light theme is the default theme, so use M+ Light values
        this._theme = {
            name: 'light',
            btnBorder: '1px solid #d0d0d0',
            btnColor: '#000',
            placeholderColor: '#575757',
            btnBack: 'radial-gradient(ellipse at center,rgba(136,136,136,0) 0,rgba(136,136,136,0) 25%,rgba(136,136,136,0) 62%,rgba(136,136,136,0.65) 100%)',
        };

        // Get the previously used theme object
        this._prevTheme = JSON.parse( this._getPrevTheme() );

        // If the previous theme object exists, assume the current theme is identical
        if( this._prevTheme !== null ){
            this._theme = this._prevTheme;
        }else{
            MP_Check.elemLoad( 'head link[href*="ICGstation"]' )
            .then( () => { GM_setValue('mp-style-theme',JSON.stringify(this._theme)) } );
        }
    }

    /** Returns the previous theme object if it exists */
    private _getPrevTheme():string|null {
        return GM_getValue( 'mp-style_theme' );
    }

    /** Returns a promise of the stylesheet name currently being used */
    private _getSiteTheme():Promise<string> {
        return new Promise( (resolve) => {
            let siteTheme:string|null = document.querySelector('head link[href*="ICGstation"]')
                .getAttribute('href');
            if( siteTheme === typeof 'string' ){
                resolve(siteTheme);
            }
        } );
    }

    /**
     * Sets the M+ theme based on the site theme
     */
    private async _alignToSiteTheme():Promise<void> {
        let theme = await this._getSiteTheme();
        if (theme.indexOf('dark') > 0) {
            this._theme.name = 'dark';
            this._theme.btnBorder = '1px solid #bbaa77';
            this._theme.btnColor = '#aaa';
            this._theme.placeholderColor = '#8d5d5d'
            this._theme.btnBack = 'radial-gradient(ellipse at center,rgba(136,136,136,0) 0,rgba(136,136,136,0) 25%,rgba(136,136,136,0) 62%,rgba(136,136,136,0.65) 100%)';
        }
    }

    get theme():StyleObj {
        return this._theme;
    }
}
