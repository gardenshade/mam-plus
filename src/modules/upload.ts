/// <reference path="../util.ts" />

/**
 * #UPLOAD PAGE FEATURES
 */

/**
 * Allows easier checking for duplicate uploads
 */

class SearchForDuplicates implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'searchForDuplicates',
        scope: SettingGroup['Upload Page'],
        desc: 'Easier searching for duplicates when uploading content',
    };

    private _tar: string = '#uploadForm input[type="submit"]';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['upload']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        const parentElement: HTMLElement | null = document.querySelector('#mainBody');

        if (parentElement) {
            this._generateSearch({
                parentElement,
                title: 'Check for results with given title',
                type: 'title',
                inputSelector: 'input[name="tor[title]"]',
                rowPosition: 7,
                useWildcard: true,
            });

            this._generateSearch({
                parentElement,
                title: 'Check for results with given author(s)',
                type: 'author',
                inputSelector: 'input.ac_author',
                rowPosition: 10,
            });

            this._generateSearch({
                parentElement,
                title: 'Check for results with given series',
                type: 'series',
                inputSelector: 'input.ac_series',
                rowPosition: 11,
            });

            this._generateSearch({
                parentElement,
                title: 'Check for results with given narrator(s)',
                type: 'narrator',
                inputSelector: 'input.ac_narrator',
                rowPosition: 12,
            });
        }
        console.log(`[M+] Adding search to uploads!`);
    }
    private _generateSearch({
        parentElement,
        title,
        type,
        inputSelector,
        rowPosition,
        useWildcard = false,
    }: {
        parentElement: HTMLElement;
        title: string;
        type: string;
        inputSelector: string;
        rowPosition: number;
        useWildcard?: boolean;
    }) {
        const searchElement: HTMLElement = document.createElement('a');
        Util.setAttr(searchElement, {
            target: '_blank',
            style: 'text-decoration: none; cursor: pointer;',
            title,
        });
        searchElement.textContent = ' 🔍';

        const linkBase = `/tor/browse.php?tor%5BsearchType%5D=all&tor%5BsearchIn%5D=torrents&tor%5Bcat%5D%5B%5D=0&tor%5BbrowseFlagsHideVsShow%5D=0&tor%5BsortType%5D=dateDesc&tor%5BsrchIn%5D%5B${type}%5D=true&tor%5Btext%5D=`;

        parentElement
            .querySelector(
                `#uploadForm > tbody > tr:nth-child(${rowPosition}) > td:nth-child(1)`
            )
            ?.insertAdjacentElement('beforeend', searchElement);

        searchElement.addEventListener('click', (event) => {
            const inputs: NodeListOf<
                HTMLInputElement
            > | null = parentElement.querySelectorAll(inputSelector);

            if (inputs && inputs.length) {
                const inputsList: string[] = [];

                inputs.forEach((input) => {
                    if (input.value) {
                        inputsList.push(input.value);
                    }
                });

                const query = inputsList.join(' ').trim();

                if (query) {
                    const searchString = useWildcard
                        ? `*${encodeURIComponent(inputsList.join(' '))}*`
                        : encodeURIComponent(inputsList.join(' '));

                    searchElement.setAttribute('href', linkBase + searchString);
                } else {
                    event.preventDefault();
                    event.stopPropagation();
                }
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
