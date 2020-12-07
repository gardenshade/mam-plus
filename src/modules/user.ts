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
    // An element that must exist in order for the feature to run
    private _tar: string = 'tbody';
    // The code that runs when the feature is created on `features.ts`.
    constructor() {
        // Add 1+ valid page type. Exclude for global
        Util.startFeature(this._settings, this._tar, ['user']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Initiallizing user gift history...');

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
        historyBox.textContent = 'You have not exchanged points or wedges.';
        historyBox.align = 'left';
        historyContainer.appendChild(historyBox);
        // Get the User ID
        const userID = window.location.pathname.split('/').pop();
        // Get the gift history
        // TODO: use `cdn.` instead of `www.`; currently causes a 403 error
        const giftHistory: Array<UserGiftHistory> = await Util.getJSON(
            `https://www.myanonamouse.net/json/userBonusHistory.php?other_userid=${userID}&type[]=giftPoints`
        ).then((json) => {
            return JSON.parse(json);
        });
        // Only display a list if there is a history
        if (giftHistory.length) {
            // Generate a list for the history
            const historyList = document.createElement('ul');
            historyBox.innerHTML = '';
            historyBox.appendChild(historyList);
            // Loop over history items and add them to the list
            const gifts = giftHistory.map((gift) => {
                // TODO: Make unixTimestamp function stand-alone
                // TODO: prettify ISO timestamp
                const date = new Date(gift.timestamp * 1000);
                return `<li class='mp_giftItem'>${date.toISOString()}: ${
                    gift.amount
                }</li>`;
            });

            historyList.innerHTML = gifts.join('');
        }
    }
    get settings(): CheckboxSetting {
        return this._settings;
    }
}
