/// <reference path="check.ts" />

/**
 * Class for handling values and methods related to styles
 * @constructor Initializes theme based on last saved value; can be called before page content is loaded
 * @method theme Gets or sets the current theme
 */
class Style {
    private _theme: string;
    private _prevTheme: string | undefined;

    constructor() {
        // The light theme is the default theme, so use M+ Light values
        this._theme = 'light';

        // Get the previously used theme object
        this._prevTheme = this._getPrevTheme();

        // If the previous theme object exists, assume the current theme is identical
        if (this._prevTheme !== undefined) {
            this._theme = this._prevTheme;
        } else {
            if (MP.DEBUG) console.warn('no previous theme');
        }
    }

    /** Allows the current theme to be returned */
    get theme(): string {
        return this._theme;
    }

    /** Allows the current theme to be set */
    set theme(val: string) {
        this._theme = val;
    }

    /** Sets the M+ theme based on the site theme */
    public async alignToSiteTheme(): Promise<void> {
        const theme: string = await this._getSiteCSS();
        this._theme = (theme.indexOf('dark') > 0) ? 'dark' : 'light';
        if (this._prevTheme !== this._theme) {
            this._setPrevTheme();
        }
        // Inject the CSS class used by M+ for theming
        const body: HTMLBodyElement | null = document.querySelector('body');
        if (body) { body.classList.add(`mp_${this._theme}`); }
    }

    /** Injects the stylesheet link into the header */
    public injectLink(): void {
        const id: string = 'mp_css';
        if (!document.getElementById(id)) {
            const style: HTMLStyleElement = document.createElement('style');
            style.id = id;
            style.innerText = GM_getResourceText('MP_CSS');
            document.querySelector('head')!.appendChild(style);
        } else {
            if (MP.DEBUG) console.warn(`an element with the id "${id}" already exists`);
        }
    }

    /** Returns the previous theme object if it exists */
    private _getPrevTheme(): string | undefined {
        return GM_getValue('style_theme');
    }

    /** Saves the current theme for future reference */
    private _setPrevTheme(): void {
        GM_setValue('style_theme', this._theme);
    }

    private _getSiteCSS(): Promise<string> {
        return new Promise((resolve) => {
            const themeURL: string | null = document.querySelector('head link[href*="ICGstation"]')!
                .getAttribute('href');
            if (typeof themeURL === 'string') {
                resolve(themeURL);
            } else {
                if (MP.DEBUG) console.warn(`themeUrl is not a string: ${themeURL}`);
            }
        });
    }
}
