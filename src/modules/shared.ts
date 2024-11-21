/// <reference path="../check.ts" />

/**
 * SHARED CODE
 *
 * This is for anything that's shared between files, but is not generic enough to
 * to belong in `Utils.ts`. I can't think of a better way to categorize DRY code.
 */

class Shared {
    /**
     * Receive a target and `this._settings.title`
     * @param tar CSS selector for a text input box
     */
    // TODO: with all Checking being done in `Util.startFeature()` it's no longer necessary to Check in this function
    public fillGiftBox = (
        tar: string,
        settingTitle: string
    ): Promise<number | undefined> => {
        if (MP.DEBUG) console.log(`Shared.fillGiftBox( ${tar}, ${settingTitle} )`);

        return new Promise((resolve) => {
            Check.elemLoad(tar).then(() => {
                const pointBox: HTMLInputElement = <HTMLInputElement>(
                    document.querySelector(tar)
                );
                if (pointBox) {
                    const userSetPoints: number = parseInt(
                        GM_getValue(`${settingTitle}_val`)
                    );
                    let maxPoints: number = parseInt(pointBox.getAttribute('max')!);
                    if (!isNaN(userSetPoints) && userSetPoints <= maxPoints) {
                        maxPoints = userSetPoints;
                    }
                    pointBox.value = maxPoints.toFixed(0);
                    resolve(maxPoints);
                } else {
                    resolve(undefined);
                }
            });
        });
    };

    /**
     * Returns list of all results from Browse page
     */
    public getSearchList = (): Promise<NodeListOf<HTMLTableRowElement>> => {
        if (MP.DEBUG) console.log(`Shared.getSearchList( )`);
        return new Promise((resolve, reject) => {
            // Wait for the search results to exist
            Check.elemLoad('#ssr tr[id ^= "tdr"] td').then(() => {
                // Select all search results
                const snatchList: NodeListOf<HTMLTableRowElement> = <
                    NodeListOf<HTMLTableRowElement>
                >document.querySelectorAll('#ssr tr[id ^= "tdr"]');
                if (snatchList === null || snatchList === undefined) {
                    reject(`snatchList is ${snatchList}`);
                } else {
                    resolve(snatchList);
                }
            });
        });
    };

    // TODO: Make goodreadsButtons() into a generic framework for other site's buttons
    public goodreadsButtons = async (
        bookData: HTMLSpanElement | null,
        authorData: NodeListOf<HTMLAnchorElement> | null,
        seriesData: NodeListOf<HTMLAnchorElement> | null,
        target: HTMLDivElement | null
    ) => {
        console.log('[M+] Adding the MAM-to-Goodreads buttons...');
        let seriesP: Promise<string[]>, authorP: Promise<string[]>;
        let authors = '';

        Util.addTorDetailsRow(target, 'Search Goodreads', 'mp_grRow');

        // Extract the Series and Author
        await Promise.all([
            (seriesP = Util.getBookSeries(seriesData)),
            (authorP = Util.getBookAuthors(authorData)),
        ]);

        await Check.elemLoad('.mp_grRow .flex');

        const buttonTar: HTMLSpanElement = <HTMLSpanElement>(
            document.querySelector('.mp_grRow .flex')
        );
        if (buttonTar === null) {
            throw new Error('Button row cannot be targeted!');
        }

        // Build Series buttons
        seriesP.then((ser) => {
            if (ser.length > 0) {
                ser.forEach((item) => {
                    const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                    const url = Util.goodreads.buildSearchURL('series', item);
                    Util.createButtonElement(
                        '',
                        buttonTitle,
                        buttonTar,
                        { url: url, order: 4, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                });
            } else {
                console.warn('No series data detected!');
            }
        });

        // Build Author button
        authorP
            .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = Util.goodreads.buildSearchURL('author', authors);
                    Util.createButtonElement(
                        '',
                        'Author',
                        buttonTar,
                        { url: url, order: 3, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                } else {
                    console.warn('No author data detected!');
                }
            })
            // Build Title buttons
            .then(async () => {
                const title = await Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = Util.goodreads.buildSearchURL('book', title);
                    Util.createButtonElement(
                        '',
                        'Title',
                        buttonTar,
                        { url: url, order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = Util.goodreads.buildSearchURL(
                            'on',
                            `${title} ${authors}`
                        );
                        Util.createButtonElement(
                            '',
                            'Title + Author',
                            buttonTar,
                            { url: bothURL, order: 1, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                        );
                    } else if (MP.DEBUG) {
                        console.log(
                            `Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`
                        );
                    }
                } else {
                    console.warn('No title data detected!');
                }
            });

        console.log(`[M+] Added the MAM-to-Goodreads buttons!`);
    };

    public audibleButtons = async (
        bookData: HTMLSpanElement | null,
        authorData: NodeListOf<HTMLAnchorElement> | null,
        seriesData: NodeListOf<HTMLAnchorElement> | null,
        target: HTMLDivElement | null
    ) => {
        console.log('[M+] Adding the MAM-to-Audible buttons...');
        let seriesP: Promise<string[]>, authorP: Promise<string[]>;
        let authors = '';

        Util.addTorDetailsRow(target, 'Search Audible', 'mp_auRow');

        // Extract the Series and Author
        await Promise.all([
            (seriesP = Util.getBookSeries(seriesData)),
            (authorP = Util.getBookAuthors(authorData)),
        ]);

        await Check.elemLoad('.mp_auRow .flex');

        const buttonTar: HTMLSpanElement = <HTMLSpanElement>(
            document.querySelector('.mp_auRow .flex')
        );
        if (buttonTar === null) {
            throw new Error('Button row cannot be targeted!');
        }

        // Build Series buttons
        seriesP.then((ser) => {
            if (ser.length > 0) {
                ser.forEach((item) => {
                    const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                    const url = `https://www.audible.com/search?keywords=${item}`;
                    Util.createButtonElement(
                        '',
                        buttonTitle,
                        buttonTar,
                        { url: url, order: 4, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                });
            } else {
                console.warn('No series data detected!');
            }
        });

        // Build Author button
        authorP
            .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = `https://www.audible.com/search?author_author=${authors}`;
                    Util.createButtonElement(
                        '',
                        'Author',
                        buttonTar,
                        { url: url, order: 3, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                } else {
                    console.warn('No author data detected!');
                }
            })
            // Build Title buttons
            .then(async () => {
                const title = await Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = `https://www.audible.com/search?title=${title}`;
                    Util.createButtonElement(
                        '',
                        'Title',
                        buttonTar,
                        { url: url, order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://www.audible.com/search?title=${title}&author_author=${authors}`;
                        Util.createButtonElement(
                            '',
                            'Title + Author',
                            buttonTar,
                            { url: bothURL, order: 1, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                        );
                    } else if (MP.DEBUG) {
                        console.log(
                            `Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`
                        );
                    }
                } else {
                    console.warn('No title data detected!');
                }
            });

        console.log(`[M+] Added the MAM-to-Audible buttons!`);
    };

    // TODO: Switch to StoryGraph API once it becomes available? Or advanced search
    public storyGraphButtons = async (
        bookData: HTMLSpanElement | null,
        authorData: NodeListOf<HTMLAnchorElement> | null,
        seriesData: NodeListOf<HTMLAnchorElement> | null,
        target: HTMLDivElement | null
    ) => {
        console.log('[M+] Adding the MAM-to-StoryGraph buttons...');
        let seriesP: Promise<string[]>, authorP: Promise<string[]>;
        let authors = '';

        Util.addTorDetailsRow(target, 'Search TheStoryGraph', 'mp_sgRow');

        // Extract the Series and Author
        await Promise.all([
            (seriesP = Util.getBookSeries(seriesData)),
            (authorP = Util.getBookAuthors(authorData)),
        ]);

        await Check.elemLoad('.mp_sgRow .flex');

        const buttonTar: HTMLSpanElement = <HTMLSpanElement>(
            document.querySelector('.mp_sgRow .flex')
        );
        if (buttonTar === null) {
            throw new Error('Button row cannot be targeted!');
        }

        // Build Series buttons
        seriesP.then((ser) => {
            if (ser.length > 0) {
                ser.forEach((item) => {
                    const buttonTitle = ser.length > 1 ? `Series: ${item}` : 'Series';
                    const url = `https://app.thestorygraph.com/browse?search_term=${item}`;
                    Util.createButtonElement(
                        '',
                        buttonTitle,
                        buttonTar,
                        { url: url, order: 4, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                });
            } else {
                console.warn('No series data detected!');
            }
        });

        // Build Author button
        authorP
            .then((auth) => {
                if (auth.length > 0) {
                    authors = auth.join(' ');
                    const url = `https://app.thestorygraph.com/browse?search_term=${authors}`;
                    Util.createButtonElement(
                        '',
                        'Author',
                        buttonTar,
                        { url: url, order: 3, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                } else {
                    console.warn('No author data detected!');
                }
            })
            // Build Title buttons
            .then(async () => {
                const title = await Util.getBookTitle(bookData, authors);
                if (title !== '') {
                    const url = `https://app.thestorygraph.com/browse?search_term=${title}`;
                    Util.createButtonElement(
                        '',
                        'Title',
                        buttonTar,
                        { url: url, order: 2, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                    );
                    // If a title and author both exist, make a Title + Author button
                    if (authors !== '') {
                        const bothURL = `https://app.thestorygraph.com/browse?search_term=${title} ${authors}`;
                        Util.createButtonElement(
                            '',
                            'Title + Author',
                            buttonTar,
                            { url: bothURL, order: 1, relative: 'afterbegin', btnClass: 'mp_button_clone' }
                        );
                    } else if (MP.DEBUG) {
                        console.log(
                            `Failed to generate Title+Author link!\nTitle: ${title}\nAuthors: ${authors}`
                        );
                    }
                } else {
                    console.warn('No title data detected!');
                }
            });

        console.log(`[M+] Added the MAM-to-StoryGraph buttons!`);
    };

    public getRatioProtectLevels = async () => {
        let l1 = parseFloat(GM_getValue('ratioProtectL1_val'));
        let l2 = parseFloat(GM_getValue('ratioProtectL2_val'));
        let l3 = parseFloat(GM_getValue('ratioProtectL3_val'));
        const l1_def = 0.5;
        const l2_def = 1;
        const l3_def = 2;

        // Default values if empty
        if (isNaN(l3)) l3 = l3_def;
        if (isNaN(l2)) l2 = l2_def;
        if (isNaN(l1)) l1 = l1_def;

        // If someone put things in a dumb order, ignore smaller numbers
        if (l2 > l3) l2 = l3;
        if (l1 > l2) l1 = l2;

        // If custom numbers are smaller than default values, ignore the lower warning
        if (isNaN(l2)) l2 = l3 < l2_def ? l3 : l2_def;
        if (isNaN(l1)) l1 = l2 < l1_def ? l2 : l1_def;

        return [l1, l2, l3];
    };
}
