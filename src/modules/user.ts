/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * # USER PAGE FEATURES
 */

/**
 * #### Default User Gift Amount
 */
class UserGiftDefault implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup['User Pages'],
        type: 'textbox',
        title: 'userGiftDefault',
        tag: 'Default Gift',
        placeholder: 'ex. 1000, max',
        desc:
            'Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)',
    };
    private _tar: string = '#bonusgift';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private _init() {
        new Shared()
            .fillGiftBox(this._tar, this._settings.title)
            .then((points) =>
                console.log(`[M+] Set the default gift amount to ${points}`)
            );
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * #### User Gift History
 */
class UserGiftHistory implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'userGiftHistory',
        scope: SettingGroup['User Pages'],
        desc: 'Display gift history between you and another user',
    };
    private _sendSymbol = `<span style='color:orange' title='sent'>\u27F0</span>`;
    private _getSymbol = `<span style='color:teal' title='received'>\u27F1</span>`;
    private _tar: string = 'tbody';
    constructor() {
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Initiallizing user gift history...');

        // Name of the other user
        const otherUser = document.querySelector('#mainBody > h1')!.textContent!.trim();
        // Create the gift history row
        const historyContainer = document.createElement('tr');
        const insert = document.querySelector('#mainBody tbody tr:last-of-type');
        if (insert) insert.insertAdjacentElement('beforebegin', historyContainer);
        // Create the gift history title field
        const historyTitle = document.createElement('td');
        historyTitle.classList.add('rowhead');
        historyTitle.textContent = 'Gift history';
        historyContainer.appendChild(historyTitle);
        // Create the gift history content field
        const historyBox = document.createElement('td');
        historyBox.classList.add('row1');
        historyBox.textContent = `You have not exchanged gifts with ${otherUser}.`;
        historyBox.align = 'left';
        historyContainer.appendChild(historyBox);
        // Get the User ID
        const userID = window.location.pathname.split('/').pop();

        const currentUserID = Util.getCurrentUserID();

        // TODO: use `cdn.` instead of `www.`; currently causes a 403 error
        if (userID) {
            if (userID === currentUserID) {
                historyTitle.textContent = 'Recent Gift History';
                return this._historyWithAll(historyBox);
            }
            return this._historyWithUserID(userID, historyBox);
        } else {
            throw new Error(`User ID not found: ${userID}`);
        }
    }

    /**
     * #### Fill out history box
     * @param userID the user to get history from
     * @param historyBox the box to put it in
     */
    private async _historyWithUserID(userID: string, historyBox: HTMLElement) {
        // Get the gift history
        const giftHistory = await Util.getUserGiftHistory(userID);
        // Only display a list if there is a history
        if (giftHistory.length) {
            // Determine Point & FL total values
            const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
            const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
            if (MP.DEBUG) {
                console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
            }
            const otherUser = giftHistory[0].other_name;
            // Generate a message
            historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> to ${otherUser} and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
            // Add the message to the box
            historyBox.appendChild(this._showGifts(giftHistory));
            console.log('[M+] User gift history added!');
        } else {
            console.log(`[M+] No user gift history found with ${userID}.`);
        }
    }

    /**
     * #### Fill out history box
     * @param historyBox the box to put it in
     */
    private async _historyWithAll(historyBox: HTMLElement) {
        // Get the gift history
        const giftHistory = await Util.getAllUserGiftHistory();
        // Only display a list if there is a history
        if (giftHistory.length) {
            // Determine Point & FL total values
            const [pointsIn, pointsOut] = this._sumGifts(giftHistory, 'giftPoints');
            const [wedgeIn, wedgeOut] = this._sumGifts(giftHistory, 'giftWedge');
            if (MP.DEBUG) {
                console.log(`Points In/Out: ${pointsIn}/${pointsOut}`);
                console.log(`Wedges In/Out: ${wedgeIn}/${wedgeOut}`);
            }
            // Generate a message
            historyBox.innerHTML = `You have sent ${this._sendSymbol} <strong>${pointsOut} points</strong> &amp; <strong>${wedgeOut} FL wedges</strong> and received ${this._getSymbol} <strong>${pointsIn} points</strong> &amp; <strong>${wedgeIn} FL wedges</strong>.<hr>`;
            // Add the message to the box
            historyBox.appendChild(this._showGifts(giftHistory));
            console.log('[M+] User gift history added!');
        } else {
            console.log(`[M+] No user gift history found for current user.`);
        }
    }

    /**
     * #### Sum the values of a given gift type as Inflow & Outflow sums
     * @param history the user gift history
     * @param type points or wedges
     */
    private _sumGifts(
        history: UserGiftHistory[],
        type: 'giftPoints' | 'giftWedge'
    ): [number, number] {
        const outflow = [0];
        const inflow = [0];
        // Only retrieve amounts of a specified gift type
        history.map((gift) => {
            if (gift.type === type) {
                // Split into Inflow/Outflow
                if (gift.amount > 0) {
                    inflow.push(gift.amount);
                } else {
                    outflow.push(gift.amount);
                }
            }
        });
        // Sum all items in the filtered array
        const sumOut = outflow.reduce((accumulate, current) => accumulate + current);
        const sumIn = inflow.reduce((accumulate, current) => accumulate + current);
        return [sumIn, Math.abs(sumOut)];
    }

    /**
     * #### Creates a list of the most recent gifts
     * @param history The full gift history between two users
     */
    private _showGifts(history: UserGiftHistory[]) {
        // If the gift was a wedge, return custom text
        const _wedgeOrPoints = (gift: UserGiftHistory): string => {
            if (gift.type === 'giftPoints') {
                return `${Math.abs(gift.amount)}`;
            } else if (gift.type === 'giftWedge') {
                return '(FL)';
            } else {
                return `Error: unknown gift type... ${gift.type}: ${gift.amount}`;
            }
        };

        // Generate a list for the history
        const historyList = document.createElement('ul');
        Object.assign(historyList.style, {
            listStyle: 'none',
            padding: 'initial',
            height: '10em',
            overflow: 'auto',
        });
        // Loop over history items and add to an array
        const gifts: string[] = history
            .filter((gift) => gift.type === 'giftPoints' || gift.type === 'giftWedge')
            .map((gift) => {
                // Add some styling depending on pos/neg numbers
                let fancyGiftAmount: string = '';
                let fromTo: string = '';

                if (gift.amount > 0) {
                    fancyGiftAmount = `${this._getSymbol} ${_wedgeOrPoints(gift)}`;
                    fromTo = 'from';
                } else {
                    fancyGiftAmount = `${this._sendSymbol} ${_wedgeOrPoints(gift)}`;
                    fromTo = 'to';
                }

                // Make the date readable
                const date = Util.prettySiteTime(gift.timestamp, true);
                return `<li class='mp_giftItem'>${date} you ${fancyGiftAmount} ${fromTo} <a href='/u/${gift.other_userid}'>${gift.other_name}</a></li>`;
            });
        // Add history items to the list
        historyList.innerHTML = gifts.join('');
        return historyList;
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

class Notes implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        title: 'Notes',
        scope: SettingGroup['User Pages'],
        desc: 'Adds a notes textbox',
    };

    private _tar: string = 'tbody';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        // Locate the table with the class "coltable"
        const table = document.querySelector('.coltable') as HTMLTableElement;

        if (table) {
            let tbody = table.querySelector('tbody');

            const userID = window.location.pathname.match(/\/u\/(\d+)/)?.[1];
            if (!userID) {
                console.error("User ID not found in URL.");
                return;
            }

            const newRow = document.createElement('tr');
            const newCell = document.createElement('td');
            newCell.setAttribute('colspan', '2');
            newCell.setAttribute('class', 'row1');

            const inputField = document.createElement('textarea');
            inputField.rows = 4;
            inputField.cols = 100;
            inputField.placeholder = 'Enter your notes here';
            inputField.value = GM_getValue(`user_notes_${userID}_val`, '');

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save Note';

            // Create the "Saved!" message span
            const savedMessage = document.createElement('span');
            savedMessage.className = 'mp_savestate'; // Apply the style similar to the example
            savedMessage.textContent = 'Saved!';
            savedMessage.style.opacity = '0'; // Start hidden

            // Add a click event listener to save the note and display "Saved!" message
            saveButton.addEventListener('click', () => {
                const noteValue = inputField.value.trim();

                if (noteValue === '') {
                    GM_deleteValue(`user_notes_${userID}_val`);
                    console.log(`Note for user ${userID} has been cleared.`);
                } else {
                    GM_setValue(`user_notes_${userID}_val`, noteValue);
                    console.log(`Note for user ${userID} saved: ${noteValue}`);
                }

                // Show the "Saved!" message briefly
                savedMessage.style.opacity = '1';
                setTimeout(() => {
                    savedMessage.style.opacity = '0';
                }, 2000); // Hide after 2 seconds
            });

            newCell.appendChild(inputField);
            newCell.appendChild(saveButton);
            newCell.appendChild(savedMessage); // Add the "Saved!" message span to the cell
            newRow.appendChild(newCell);
            tbody.appendChild(newRow);
        } else {
            console.error('Table with class "coltable" not found.');
        }
    }


    get settings(): CheckboxSetting {
        return this._settings;
    }
}