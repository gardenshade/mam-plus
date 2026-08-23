/// <reference path="check.ts" />

/**
 * Class for handling values and methods related to styles
 * @constructor Initializes theme based on last saved value; can be called before page content is loaded
 * @method theme Gets or sets the current theme
 */
class Style {
    private _theme: string;
    private _prevTheme: string | undefined;
    private _cssURL: string;

    constructor() {
        // The light theme is the default theme, so use M+ Light values
        this._theme = 'light';
        this._prevTheme = undefined;

        // Use the release CSS URL directly instead of userscript resources
        this._cssURL = `https://raw.githubusercontent.com/gardenshade/mam-plus/master/release/main.css?v=${MP.VERSION}`;
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
        this._prevTheme = await this._getPrevTheme();

        // If the previous theme object exists, assume the current theme is identical
        if (this._prevTheme !== undefined) {
            this._theme = this._prevTheme;
        } else if (MP.DEBUG) {
            console.warn('no previous theme');
        }

        const theme: string = await this._getSiteCSS();
        this._theme = theme.indexOf('dark') > 0 ? 'dark' : 'light';
        if (this._prevTheme !== this._theme) {
            await this._setPrevTheme();
        }

        // Inject the CSS class used by M+ for theming
        Check.elemLoad('body').then(() => {
            const body: HTMLBodyElement | null = document.querySelector('body');
            if (body) {
                body.classList.add(`mp_${this._theme}`);
            } else if (MP.DEBUG) {
                console.warn(`Body is ${body}`);
            }
        });
    }

    /** Injects the stylesheet using userscript APIs to avoid page CSP issues */
    public async injectLink(): Promise<void> {
        const id: string = 'mp_css';
        if (document.getElementById(id)) {
            if (MP.DEBUG)
                console.warn(`an element with the id "${id}" already exists`);
            return;
        }

        try {
            const cssText = await this._getRemoteCSS();

            // Prefer GM.addStyle because it is not restricted by site CSP in userscript managers
            if (GM.addStyle) {
                const styleElem = await GM.addStyle(cssText);
                if (styleElem && !styleElem.id) {
                    styleElem.id = id;
                }
                return;
            }

            // Fallback: inline <style>
            const style: HTMLStyleElement = document.createElement('style');
            style.id = id;
            style.textContent = cssText;
            document.querySelector('head')!.appendChild(style);
        } catch (err) {
            if (MP.DEBUG) {
                console.warn('[M+] Failed CSS API injection; falling back to <link>.', err);
            }

            // Last resort fallback
            const link: HTMLLinkElement = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = this._cssURL;
            document.querySelector('head')!.appendChild(link);
        }
    }

    /** Fetches CSS text using userscript HTTP privileges (preferred) */
    private async _getRemoteCSS(): Promise<string> {
        if (GM.xmlHttpRequest) {
            const response = await GM.xmlHttpRequest({
                method: 'GET',
                url: this._cssURL,
            });
            if (!response.responseText) {
                throw new Error('GM.xmlHttpRequest returned empty CSS response');
            }
            return response.responseText;
        }

        const response = await fetch(this._cssURL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`CSS fetch failed: ${response.status} ${response.statusText}`);
        }
        return response.text();
    }

    /** Returns the previous theme object if it exists */
    private async _getPrevTheme(): Promise<string | undefined> {
        return GM.getValue<string | undefined>('style_theme');
    }

    /** Saves the current theme for future reference */
    private async _setPrevTheme(): Promise<void> {
        await GM.setValue('style_theme', this._theme);
    }

    private _getSiteCSS(): Promise<string> {
        return new Promise((resolve) => {
            const themeURL: string | null = document
                .querySelector('head link[href*="ICGstation"]')!
                .getAttribute('href');
            if (typeof themeURL === 'string') {
                resolve(themeURL);
            } else if (MP.DEBUG) console.warn(`themeUrl is not a string: ${themeURL}`);
        });
    }
}
