/**
 * ### Adds ability to gift newest 10 members to MAM on Homepage or open their user pages
 */
class GiftNewest implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Home,
        type: 'checkbox',
        title: 'giftNewest',
        desc: `Add buttons to Gift/Open all newest members`,
    };
    private _tar: string = '#fpNM';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        //ensure gifted list is under 50 member names long
        this._trimGiftList();
        //get the FrontPage NewMembers element containing newest 10 members
        const fpNM = <HTMLDivElement>document.querySelector(this._tar);
        const members: HTMLAnchorElement[] = Array.prototype.slice.call(
            fpNM.getElementsByTagName('a')
        );
        const lastMem = members[members.length - 1];
        members.forEach((member) => {
            //add a class to the existing element for use in reference in creating buttons
            member.setAttribute('class', `mp_refPoint_${Util.endOfHref(member)}`);
            //if the member has been gifted through this feature previously
            if (GM_getValue('mp_lastNewGifted').indexOf(Util.endOfHref(member)) >= 0) {
                //add checked box to text
                member.innerText = `${member.innerText} \u2611`;
                member.classList.add('mp_gifted');
            }
        });
        //get the default value of gifts set in preferences for user page
        let giftValueSetting: string | undefined = GM_getValue('userGiftDefault_val');
        //if they did not set a value in preferences, set to 100 or set to max or min
        // TODO: Make the gift value check into a Util
        if (!giftValueSetting) {
            giftValueSetting = '100';
        } else if (Number(giftValueSetting) > 1000 || isNaN(Number(giftValueSetting))) {
            giftValueSetting = '1000';
        } else if (Number(giftValueSetting) < 5) {
            giftValueSetting = '5';
        }
        //create the text input for how many points to give
        const giftAmounts: HTMLInputElement = document.createElement('input');
        Util.setAttr(giftAmounts, {
            type: 'text',
            size: '3',
            id: 'mp_giftAmounts',
            title: 'Value between 5 and 1000',
            value: giftValueSetting,
        });
        //insert the text box after the last members name
        lastMem.insertAdjacentElement('afterend', giftAmounts);

        //make the button and insert after the last members name (before the input text)
        const giftAllBtn = await Util.createButton(
            'giftAll',
            'Gift All: ',
            'button',
            `.mp_refPoint_${Util.endOfHref(lastMem)}`,
            'afterend',
            'mp_btn'
        );
        //add a space between button and text
        giftAllBtn.style.marginRight = '5px';
        giftAllBtn.style.marginTop = '5px';

        giftAllBtn.addEventListener(
            'click',
            async () => {
                let firstCall: boolean = true;
                for (const member of members) {
                    //update the text to show processing
                    document.getElementById('mp_giftAllMsg')!.innerText =
                        'Sending Gifts... Please Wait';
                    //if user has not been gifted
                    if (!member.classList.contains('mp_gifted')) {
                        //get the members name for JSON string
                        const userName = member.innerText;
                        //get the points amount from the input box
                        const giftFinalAmount = (<HTMLInputElement>(
                            document.getElementById('mp_giftAmounts')
                        ))!.value;
                        //URL to GET random search results
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
                        //wait 3 seconds between JSON calls
                        if (firstCall) {
                            firstCall = false;
                        } else {
                            await Util.sleep(3000);
                        }
                        //request sending points
                        const jsonResult: string = await Util.getJSON(url);
                        if (MP.DEBUG) console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //check off box
                            member.innerText = `${member.innerText} \u2611`;
                            member.classList.add('mp_gifted');
                            //add member to the stored member list
                            GM_setValue(
                                'mp_lastNewGifted',
                                `${Util.endOfHref(member)},${GM_getValue(
                                    'mp_lastNewGifted'
                                )}`
                            );
                        } else if (!JSON.parse(jsonResult).success) {
                            console.warn(JSON.parse(jsonResult).error);
                        }
                    }
                }

                //disable button after send
                (giftAllBtn as HTMLInputElement).disabled = true;
                document.getElementById('mp_giftAllMsg')!.innerText =
                    'Gifts completed to all Checked Users';
            },
            false
        );

        //newline between elements
        members[members.length - 1].after(document.createElement('br'));
        //listen for changes to the input box and ensure its between 5 and 1000, if not disable button
        document.getElementById('mp_giftAmounts')!.addEventListener('input', () => {
            const valueToNumber: String = (<HTMLInputElement>(
                document.getElementById('mp_giftAmounts')
            ))!.value;
            const giftAll = <HTMLInputElement>document.getElementById('mp_giftAll');

            if (
                Number(valueToNumber) > 1000 ||
                Number(valueToNumber) < 5 ||
                isNaN(Number(valueToNumber))
            ) {
                giftAll.disabled = true;
                giftAll.setAttribute('title', 'Disabled');
            } else {
                giftAll.disabled = false;
                giftAll.setAttribute('title', `Gift All ${valueToNumber}`);
            }
        });
        //add a button to open all ungifted members in new tabs
        const openAllBtn = await Util.createButton(
            'openTabs',
            'Open Ungifted In Tabs',
            'button',
            '[id=mp_giftAmounts]',
            'afterend',
            'mp_btn'
        );

        openAllBtn.setAttribute('title', 'Open new tab for each');
        openAllBtn.addEventListener(
            'click',
            () => {
                for (const member of members) {
                    if (!member.classList.contains('mp_gifted')) {
                        window.open(member.href, '_blank');
                    }
                }
            },
            false
        );
        //get the current amount of bonus points available to spend
        let bonusPointsAvail: string = document.getElementById('tmBP')!.innerText;
        //get rid of the delta display
        if (bonusPointsAvail.indexOf('(') >= 0) {
            bonusPointsAvail = bonusPointsAvail.substring(
                0,
                bonusPointsAvail.indexOf('(')
            );
        }
        //recreate the bonus points in new span and insert into fpNM
        const messageSpan: HTMLElement = document.createElement('span');
        messageSpan.setAttribute('id', 'mp_giftAllMsg');
        messageSpan.innerText = 'Available ' + bonusPointsAvail;
        document.getElementById('mp_giftAmounts')!.after(messageSpan);
        document.getElementById('mp_giftAllMsg')!.after(document.createElement('br'));
        document
            .getElementById('mp_giftAllMsg')!
            .insertAdjacentHTML('beforebegin', '<br>');
        console.log(`[M+] Adding gift new members button to Home page...`);
    }

    /**
     * * Trims the gifted list to last 50 names to avoid getting too large over time.
     */
    private _trimGiftList() {
        //if value exists in GM
        if (GM_getValue('mp_lastNewGifted')) {
            //GM value is a comma delim value, split value into array of names
            const giftNames = GM_getValue('mp_lastNewGifted').split(',');
            let newGiftNames: string = '';
            if (giftNames.length > 50) {
                for (const giftName of giftNames) {
                    if (giftNames.indexOf(giftName) <= 49) {
                        //rebuild a comma delim string out of the first 49 names
                        newGiftNames = newGiftNames + giftName + ',';
                        //set new string in GM
                        GM_setValue('mp_lastNewGifted', newGiftNames);
                    } else {
                        break;
                    }
                }
            }
        } else {
            //set value if doesnt exist
            GM_setValue('mp_lastNewGifted', '');
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class HideNews implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Home,
        title: 'hideNews',
        type: 'checkbox',
        desc: 'Tidy the homepage and allow News to be hidden',
    };
    private _tar: string = '.mainPageNewsHead';
    private _valueTitle: string = `${this._settings.title}_val`;
    private _icon = '\u274e';
    constructor() {
        Util.startFeature(this._settings, this._tar, ['home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        // NOTE: for development
        // GM_deleteValue(this._valueTitle);

        this._removeClock();
        this._adjustHeaderSize(this._tar);
        await this._checkForSeen();
        this._addHiderButton();
        this._cleanValues();

        console.log('[M+] Cleaned up the home page!');
    }

    _checkForSeen = async (): Promise<void> => {
        const previousValue: string | undefined = GM_getValue(this._valueTitle);
        const news = this._getNewsItems();
        if (MP.DEBUG) console.log(this._valueTitle, ':\n', previousValue);

        if (previousValue !== undefined && news) {
            // Use the icon to split out the known hidden messages
            const hiddenArray = previousValue.split(this._icon);
            /* If any of the hidden messages match a current message
                remove the current message from the DOM */
            hiddenArray.forEach((hidden) => {
                news.forEach((entry) => {
                    if (entry.textContent === hidden) {
                        entry.remove();
                    }
                });
            });
            // If there are no current messages, hide the header
            if (!document.querySelector('.mainPageNewsSub')) {
                this._adjustHeaderSize(this._tar, false);
            }
        } else {
            return;
        }
    };

    _removeClock = () => {
        const clock: HTMLDivElement | null = document.querySelector('#mainBody .fpTime');
        if (clock) clock.remove();
    };

    _adjustHeaderSize = (selector: string, visible?: boolean) => {
        const newsHeader: HTMLHeadingElement | null = document.querySelector(selector);
        if (newsHeader) {
            if (visible === false) {
                newsHeader.style.display = 'none';
            } else {
                newsHeader.style.fontSize = '2em';
            }
        }
    };

    _addHiderButton = () => {
        const news = this._getNewsItems();
        if (!news) return;

        // Loop over each news entry
        news.forEach((entry) => {
            // Create a button
            const xbutton = document.createElement('div');
            xbutton.textContent = this._icon;
            Util.setAttr(xbutton, {
                style: 'display:inline-block;margin-right:0.7em;cursor:pointer;',
                class: 'mp_clearBtn',
            });
            // Listen for clicks
            xbutton.addEventListener('click', () => {
                // When clicked, append the content of the current news post to the
                // list of remembered news items
                const previousValue: string = GM_getValue(this._valueTitle)
                    ? GM_getValue(this._valueTitle)
                    : '';
                GM_setValue(this._valueTitle, `${previousValue}${entry.textContent}`);
                entry.remove();
                // If there are no more news items, remove the header
                const updatedNews = this._getNewsItems();

                if (updatedNews && updatedNews.length < 1) {
                    this._adjustHeaderSize(this._tar, false);
                }
            });

            // Add the button as the first child of the entry
            if (entry.firstChild) entry.firstChild.before(xbutton);
        });
    };

    _cleanValues = (num = 3) => {
        let value: string | undefined = GM_getValue(this._valueTitle);
        if (value) {
            // Return the last 3 stored items after splitting them at the icon
            value = Util.arrayToString(value.split(this._icon).slice(0 - num));
            // Store the new value
            GM_setValue(this._valueTitle, value);
        }
    };

    _getNewsItems = (): NodeListOf<HTMLDivElement> | null => {
        return document.querySelectorAll('.mainPageNewsSub');
    };

    // This must match the type selected for `this._settings`
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
