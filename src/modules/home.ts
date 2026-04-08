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
        this._trimGiftList();
        
        // Wait for the container to render to avoid the empty array race condition
        await Check.elemLoad('#newestMembers');

        // Helper to sync visual state with persistent history
        const syncState = () => {
            const container = document.querySelector('#newestMembers');
            if (!container) return;
            
            const historyStr = GM_getValue('mp_lastNewGifted', '') as string;
            const history = historyStr.split(',');
            const members = Array.from(container.getElementsByTagName('a'));

            members.forEach((member) => {
                const id = Util.endOfHref(member);
                member.setAttribute('class', `mp_refPoint_${id}`);
                
                // Exact match checking and gold color override
                if (history.includes(id) && !member.classList.contains('mp_gifted')) {
                    member.classList.add('mp_gifted');
                    const span = member.querySelector('span');
                    if (span) span.style.color = 'rgb(187, 170, 119)';
                }
            });
        };

        // Run initial sync
        syncState();
        
        // Watch for MAM's native AJAX refresh button
        Check.elemObserver('#newestMembers', syncState);

        //get the default value of gifts set in preferences for user page
        let giftValueSetting: string = GM_getValue('userGiftDefault_val', '100') as string;
        //make sure the value falls within the acceptable range
        if (Number(giftValueSetting) > 100 || isNaN(Number(giftValueSetting))) {
            giftValueSetting = '100';
        } else if (Number(giftValueSetting) < 5) {
            giftValueSetting = '5';
        }

        // Hijack the block footer for UI controls
        const footerWrapper = <HTMLDivElement>document.querySelector('#fpNM .blockFoot');
        footerWrapper.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 6px; padding: 2px 0; min-height: 32px; white-space: nowrap;';

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
                // DYNAMIC FETCH: Get fresh container in case it was refreshed
                const container = document.querySelector('#newestMembers');
                if (!container) return;
                
                syncState();
                const members = Array.from(container.getElementsByTagName('a'));
                const statusMsg = document.getElementById('mp_giftAllMsg')!;
                const giftFinalAmount = (<HTMLInputElement>document.getElementById('mp_giftAmounts')).value;
                let firstCall: boolean = true;

                for (const member of members) {
                    if (!member.classList.contains('mp_gifted')) {
                        statusMsg.innerText = 'Sending...';
                        
                        const userName = member.innerText.trim();
                        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
                        
                        if (firstCall) {
                            firstCall = false;
                        } else {
                            await Util.sleep(3000);
                        }
                        
                        const jsonResult: string = await Util.getJSON(url);
                        if (MP.DEBUG) console.log('Gift Result', jsonResult);
                        
                        const res = JSON.parse(jsonResult);
                        
                        // "Adopt" if success OR if they are already maxed out for the day
                        if (res.success || (res.error && res.error.includes('daily cap'))) {
                            member.classList.add('mp_gifted');
                            const span = member.querySelector('span');
                            if (span) span.style.color = 'rgb(187, 170, 119)';
                            
                            const id = Util.endOfHref(member);
                            const h = GM_getValue('mp_lastNewGifted', '') as string;
                            GM_setValue('mp_lastNewGifted', id + (h ? ',' + h : ''));
                        } else {
                            console.warn(res.error);
                        }
                    }
                }

                (giftAllBtn as HTMLInputElement).disabled = true;
                statusMsg.innerText = 'Done!';
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
                const container = document.querySelector('#newestMembers');
                if (container) {
                    const members = Array.from(container.getElementsByTagName('a'));
                    for (const member of members) {
                        if (!member.classList.contains('mp_gifted')) {
                            window.open(member.href, '_blank');
                        }
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
        this._trimGiftList();

        const fpNM = document.querySelector('.blockCon') as HTMLDivElement;
        const footer = document.querySelector('.blockFoot') as HTMLDivElement;
        const memberLabels = Array.from(fpNM.querySelectorAll('label'));

        // Use includes() for exact matching and add fallback for undefined
        const historyStr = GM_getValue('mp_lastNewGifted', '') as string;
        const history = historyStr.split(',');

        memberLabels.forEach((label) => {
            const member = label.querySelector('a') as HTMLAnchorElement;
            const checkbox = label.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const id = Util.endOfHref(member);
            const memberRef = `mp_refPoint_${id}`;
            member.classList.add(memberRef);

            if (history.includes(id)) {
                member.innerText += ' ✅';
                member.classList.add('mp_gifted');
            }
        });

        let giftValueSetting = GM_getValue('userGiftDefault_val') || '100';
        giftValueSetting = Math.min(100, Math.max(5, Number(giftValueSetting))) || 100;

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

        giftAllBtn.addEventListener('click', async () => {
            document.getElementById('mp_giftAllMsg')!.innerText = 'Sending Gifts... Please Wait';
            let firstCall = true;
            const giftAmount = (document.getElementById('mp_giftAmounts') as HTMLInputElement).value;

            for (const label of memberLabels) {
                const member = label.querySelector('a') as HTMLAnchorElement;
                const checkbox = label.querySelector('input[type="checkbox"]') as HTMLInputElement;

                if (checkbox.checked && !member.classList.contains('mp_gifted')) {
                    // Strip the checkmark if it exists so we just send the name
                    const userName = member.innerText.replace(' ✅', '').trim();
                    const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${userName}`;

                    if (!firstCall) await Util.sleep(3000);
                    firstCall = false;

                    const jsonResult = await Util.getJSON(url);
                    if (MP.DEBUG) console.log('Gift Result', jsonResult);

                    const res = JSON.parse(jsonResult);

                    // Apply the "daily cap" adoption fix here as well
                    if (res.success || (res.error && res.error.includes('daily cap'))) {
                        member.innerText += ' ✅';
                        member.classList.add('mp_gifted');
                        
                        const id = Util.endOfHref(member);
                        const h = GM_getValue('mp_lastNewGifted', '') as string;
                        GM_setValue('mp_lastNewGifted', id + (h ? ',' + h : ''));
                    } else {
                        console.warn(res.error);
                    }
                }
            }

            (giftAllBtn as HTMLButtonElement).disabled = true;
            document.getElementById('mp_giftAllMsg')!.innerText = 'Gifts completed to all Checked Users';
        });

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

        let bonusPointsAvail = document.getElementById('tmBP')!.innerText.split(':')[1];
        const messageSpan = document.createElement('span');
        messageSpan.id = 'mp_giftAllMsg';
        messageSpan.innerText = ` Available Points: ${bonusPointsAvail}`;

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

                if (!member.classList.contains('mp_gifted') && !checkbox.checked) {
                    checkbox.checked = true;  
                    count++;
                    if (count >= 100) break;
                }
            }
            console.log(`[M+] Selected ${count} ungifted users.`);
        });

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
        const historyStr = GM_getValue('mp_lastNewGifted') as string;
        if (historyStr) {
            const giftNames = historyStr.split(',');
            let newGiftNames: string = '';
            if (giftNames.length > 500) {
                for (const giftName of giftNames) {
                    // Update bounds to use includes or strict indexing
                    if (giftNames.indexOf(giftName) <= 499) {
                        newGiftNames = newGiftNames + giftName + ',';
                        GM_setValue('mp_lastNewGifted', newGiftNames);
                    } else {
                        break;
                    }
                }
            }
        } else {
            GM_setValue('mp_lastNewGifted', '');
        }
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
