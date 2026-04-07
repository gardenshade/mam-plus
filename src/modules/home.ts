/**
 * ### Adds ability to gift newest 30 members to MAM on Homepage or open their user pages
 */
class GiftNewest implements Feature {
    /* TODO: Refactor code to reduce duplication. */
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Home,
        type: 'checkbox',
        title: 'giftNewest',
        desc: `Add buttons to Gift/Open all newest members`,
    };
    private _tar: string = '#mainTable';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['home', 'new users']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    /**
     * * Decide which page to run on
     */
    private _init() {
        Check.page().then((page:ValidPage) => {
            if(MP.DEBUG) console.log('User gifting init on',page);

            if(page === 'home'){
                this._homePageGifting();
            }else if(page === 'new users'){
                this._newUsersPageGifting();
            }
        })
    }

    /**
     * * Function that runs on the Home page
     */
    private async _homePageGifting() {
        //ensure gifted list is under 500 member names long
        this._trimGiftList();
        
        //get the element containing newest 30 members
        const memberContainer = <HTMLDivElement>document.querySelector('#newestMembers');
        const members: HTMLAnchorElement[] = Array.prototype.slice.call(
            memberContainer.getElementsByTagName('a')
        );

        members.forEach((member) => {
            //add a class to the existing element for use in reference in creating buttons
            member.setAttribute('class', `mp_refPoint_${Util.endOfHref(member)}`);
            //if the member has been gifted through this feature previously
            if (GM_getValue('mp_lastNewGifted').indexOf(Util.endOfHref(member)) >= 0) {
                //add checked box to text
                member.innerText = `${member.innerText} ✅`;
                member.classList.add('mp_gifted');
            }
        });

        //get the default value of gifts set in preferences for user page
        let giftValueSetting: string | undefined = GM_getValue('userGiftDefault_val');
        //make sure the value falls within the acceptable range
        if (!giftValueSetting) {
            giftValueSetting = '100';
        } else if (Number(giftValueSetting) > 100 || isNaN(Number(giftValueSetting))) {
            giftValueSetting = '100';
        } else if (Number(giftValueSetting) < 5) {
            giftValueSetting = '5';
        }

        // Hijack the block footer for UI controls
        const footerWrapper = <HTMLDivElement>document.querySelector('#fpNM .blockFoot');
        footerWrapper.style.display = 'flex';
        footerWrapper.style.alignItems = 'center';
        footerWrapper.style.justifyContent = 'center';
        footerWrapper.style.gap = '6px';
        footerWrapper.style.padding = '2px 0';
        footerWrapper.style.minHeight = '32px';
        footerWrapper.style.whiteSpace = 'nowrap';

        //create the text input for how many points to give
        const giftAmounts: HTMLInputElement = document.createElement('input');
        Util.setAttr(giftAmounts, {
            type: 'text',
            size: '3',
            id: 'mp_giftAmounts',
            title: 'Value between 5 and 100',
            value: giftValueSetting,
        });
        // Vertical alignment fix for input
        giftAmounts.style.height = '22px';
        giftAmounts.style.boxSizing = 'border-box';
        
        // append input to footer
        footerWrapper.appendChild(giftAmounts);

        //make the button and insert before the input text
        const giftAllBtn = await Util.createButton(
            'giftAll',
            'Gift All',
            'button',
            giftAmounts,
            'beforebegin',
            'mp_btn'
        );
        // Vertical alignment fix for button
        giftAllBtn.style.height = '22px';
        giftAllBtn.style.display = 'inline-flex';
        giftAllBtn.style.alignItems = 'center';

        giftAllBtn.addEventListener(
            'click',
            async () => {
                let firstCall: boolean = true;
                for (const member of members) {
                    //update the text to show processing
                    document.getElementById('mp_giftAllMsg')!.innerText = 'Sending...';
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
                document.getElementById('mp_giftAllMsg')!.innerText = 'Done!';
            },
            false
        );

        //listen for changes to the input box and ensure its between 5 and 1000, if not disable button
        document.getElementById('mp_giftAmounts')!.addEventListener('input', () => {
            const valueToNumber: string = (<HTMLInputElement>(
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
            'Open Ungifted',
            'button',
            giftAmounts,
            'afterend',
            'mp_btn'
        );
        // Vertical alignment fix for button
        openAllBtn.style.height = '22px';
        openAllBtn.style.display = 'inline-flex';
        openAllBtn.style.alignItems = 'center';

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
        //clean up string for just the points
        bonusPointsAvail = bonusPointsAvail.includes(':') ? bonusPointsAvail.split(':')[1] : bonusPointsAvail;
        bonusPointsAvail = bonusPointsAvail.includes('(') ? bonusPointsAvail.split('(')[0] : bonusPointsAvail;

        //recreate the bonus points in new span and insert into footer
        const messageSpan: HTMLElement = document.createElement('span');
        messageSpan.setAttribute('id', 'mp_giftAllMsg');
        messageSpan.style.lineHeight = '1';
        messageSpan.style.display = 'inline-flex';
        messageSpan.style.alignItems = 'center';
        messageSpan.innerText = 'BP: ' + bonusPointsAvail.trim();
        
        footerWrapper.appendChild(messageSpan);
        
        console.log(`[M+] Adding gift new members button to Home page...`);
    }

    /**
     * * Function that runs on the New Users page
     */
    private async _newUsersPageGifting() {
        // Ensure the gifted list is under 500 members
        this._trimGiftList();

        // Select the container holding the newest members
        const fpNM = document.querySelector('.blockCon') as HTMLDivElement;
        const footer = document.querySelector('.blockFoot') as HTMLDivElement;
        const memberLabels = Array.from(fpNM.querySelectorAll('label'));

        // Loop through each member and check if they were previously gifted
        memberLabels.forEach((label) => {
            const member = label.querySelector('a') as HTMLAnchorElement;
            const checkbox = label.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const memberRef = `mp_refPoint_${Util.endOfHref(member)}`;
            member.classList.add(memberRef);

            // If the member has already been gifted, update the display
            if (GM_getValue('mp_lastNewGifted').includes(Util.endOfHref(member))) {
                member.innerText += ' ✅';
                member.classList.add('mp_gifted');
            }
        });

        // Retrieve or default the gift value setting
        let giftValueSetting = GM_getValue('userGiftDefault_val') || '100';
        giftValueSetting = Math.min(100, Math.max(5, Number(giftValueSetting))) || 100;

        // Create input box for gift amount
        const giftAmounts = document.createElement('input');
        Util.setAttr(giftAmounts, {
            type: 'text',
            size: '3',
            id: 'mp_giftAmounts',
            title: 'Value between 5 and 100',
            value: String(giftValueSetting),
        });
        let bpText = document.createElement('span');
        bpText.innerText = 'points ';

        // Create "Gift All Checked Users" button
        const giftAllBtn = await Util.createButton(
            'mp_giftAll',
            'Gift All Selected',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        giftAllBtn.style.marginRight = '5px';
        giftAllBtn.style.marginTop = '5px';

        // Event listener for gifting action
        giftAllBtn.addEventListener('click', async () => {
            document.getElementById('mp_giftAllMsg')!.innerText = 'Sending Gifts... Please Wait';
            let firstCall = true;
            const giftAmount = (document.getElementById('mp_giftAmounts') as HTMLInputElement).value;

            for (const label of memberLabels) {
                const member = label.querySelector('a') as HTMLAnchorElement;
                const checkbox = label.querySelector('input[type="checkbox"]') as HTMLInputElement;

                if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                    const userName = member.innerText;
                    const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${userName}`;

                    if (!firstCall) await Util.sleep(3000);
                    firstCall = false;

                    const jsonResult = await Util.getJSON(url);
                    if (MP.DEBUG) console.log('Gift Result', jsonResult);

                    if (JSON.parse(jsonResult).success) {
                        member.innerText += ' ✅';
                        member.classList.add('mp_gifted');
                        GM_setValue('mp_lastNewGifted', `${Util.endOfHref(member)},${GM_getValue('mp_lastNewGifted')}`);
                    } else {
                        console.warn(JSON.parse(jsonResult).error);
                    }
                }
            }

            (giftAllBtn as HTMLButtonElement).disabled = true;
            document.getElementById('mp_giftAllMsg')!.innerText = 'Gifts completed to all Checked Users';
        });

        // Input validation for gift amount
        giftAmounts.addEventListener('input', () => {
            const giftAllBtn = document.getElementById('mp_giftAll') as HTMLButtonElement;
            const value = Number(giftAmounts.value);

            if (value < 5 || value > 100 || isNaN(value)) {
                giftAllBtn.disabled = true;
                giftAllBtn.title = 'Disabled';
            } else {
                giftAllBtn.disabled = false;
                giftAllBtn.title = `Gift All ${value}`;
            }
        });

        // Create "Open Ungifted in Tabs" button
        const openAllBtn = await Util.createButton(
            'mp_openTabs',
            'Open Ungifted in Tabs',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        openAllBtn.title = 'Open a new tab for each ungifted member';
        openAllBtn.addEventListener('click', () => {
            for (const label of memberLabels) {
                const member = label.querySelector('a') as HTMLAnchorElement;
                const checkbox = label.querySelector('input[type="checkbox"]') as HTMLInputElement;
                if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                    window.open(member.href, '_blank');
                }
            }
        });

        // Display available bonus points in the footer
        let bonusPointsAvail = document.getElementById('tmBP')!.innerText.split(':')[1];
        const messageSpan = document.createElement('span');
        messageSpan.id = 'mp_giftAllMsg';
        messageSpan.innerText = ` Available Points: ${bonusPointsAvail}`;

        // Add "Deselect All" button
        const deselectBtn = await Util.createButton(
            'mp_deselectAll',
            'Unselect all',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        deselectBtn.addEventListener('click', () => {
            const boxList = document.querySelectorAll('input[type=checkbox]') as NodeListOf<HTMLInputElement>;

            boxList.forEach((box: HTMLInputElement) => {
                box.checked = false;
            });
        });

        // Add "Select 100 Ungifted" button
        const selectUngiftedBtn = await Util.createButton(
            'mp_selectUngifted',
            'Select 100 Ungifted',
            'button',
            footer,
            'afterend',
            'mp_btn'
        );
        selectUngiftedBtn.title = 'Select the first 100 ungifted users';
        selectUngiftedBtn.addEventListener('click', () => {
            let count = 0;
            for (const label of memberLabels) {
                const member = label.querySelector('a') as HTMLAnchorElement;
                const checkbox = label.querySelector('input[type="checkbox"]') as HTMLInputElement;

                // Check if the member is not gifted and if the checkbox is not yet selected
                if (!member.classList.contains('mp_gifted') && !checkbox.checked) {
                    checkbox.checked = true;  // Select the checkbox
                    count++;
                    // Stop after selecting 100 users
                    if (count >= 100) break;
                }
            }
            console.log(`[M+] Selected ${count} ungifted users.`);
        });


        // Append all elements to the footer
        footer.appendChild(selectUngiftedBtn);
        footer.appendChild(deselectBtn);
        footer.appendChild(giftAmounts);
        footer.appendChild(bpText);
        footer.appendChild(giftAllBtn);
        footer.appendChild(openAllBtn);
        footer.appendChild(messageSpan);

        console.log('[M+] Added gifting options to the footer of the page.');
    }

    /**
     * * Trims the gifted list to last 500 names to avoid getting too large over time.
     */
    private _trimGiftList() {
        //if value exists in GM
        if (GM_getValue('mp_lastNewGifted')) {
            //GM value is a comma delim value, split value into array of names
            const giftNames = GM_getValue('mp_lastNewGifted').split(',');
            let newGiftNames: string = '';
            if (giftNames.length > 500) {
                for (const giftName of giftNames) {
                    if (giftNames.indexOf(giftName) <= 499) {
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
