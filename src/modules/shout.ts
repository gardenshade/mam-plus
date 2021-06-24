/**
 * Process & return information from the shoutbox
 */
class ProcessShouts {
    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param names (Optional) List of usernames/IDs to filter for
     * @param usertype (Optional) What filter the names are for. Required if `names` is provided
     */
    public static watchShoutbox(
        tar: string,
        names?: string[],
        usertype?: ShoutboxUserType
    ): void {
        // Observe the shoutbox
        Check.elemObserver(
            tar,
            (mutList) => {
                // When the shoutbox updates, process the information
                mutList.forEach((mutRec) => {
                    // Get the changed nodes
                    mutRec.addedNodes.forEach((node: Node) => {
                        const nodeData = Util.nodeToElem(node);

                        // If the node is added by MAM+ for gift button, ignore
                        // Also ignore if the node is a date break
                        if (
                            /^mp_/.test(nodeData.getAttribute('id')!) ||
                            nodeData.classList.contains('dateBreak')
                        ) {
                            return;
                        }
                        // If we're looking for specific users...
                        if (names !== undefined && names.length > 0) {
                            if (usertype === undefined) {
                                throw new Error(
                                    'Usertype must be defined if filtering names!'
                                );
                            }
                            // Extract
                            const userID: string = this.extractFromShout(
                                node,
                                'a[href^="/u/"]',
                                'href'
                            );
                            const userName: string = this.extractFromShout(
                                node,
                                'a > span',
                                'text'
                            );
                            // Filter
                            names.forEach((name) => {
                                if (
                                    `/u/${name}` === userID ||
                                    Util.caselessStringMatch(name, userName)
                                ) {
                                    this.styleShout(node, usertype);
                                }
                            });
                        }
                    });
                });
            },
            { childList: true }
        );
    }

    /**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param buttons Number to represent checkbox selections 1 = Reply, 2 = Reply With Quote
     * @param charLimit Number of characters to include in quote, , charLimit?:number - Currently unused
     */
    public static watchShoutboxReply(tar: string, buttons?: number): void {
        if (MP.DEBUG) console.log('watchShoutboxReply(', tar, buttons, ')');

        const _getUID = (node: Node): string =>
            this.extractFromShout(node, 'a[href^="/u/"]', 'href');

        const _getRawColor = (elem: HTMLSpanElement): string | null => {
            if (elem.style.backgroundColor) {
                return elem.style.backgroundColor;
            } else if (elem.style.color) {
                return elem.style.color;
            } else {
                return null;
            }
        };
        const _getNameColor = (elem: HTMLSpanElement | null): string | null => {
            if (elem) {
                const rawColor: string | null = _getRawColor(elem);
                if (rawColor) {
                    // Convert to hex
                    const rgb: string[] = Util.bracketContents(rawColor).split(',');
                    return Util.rgbToHex(
                        parseInt(rgb[0]),
                        parseInt(rgb[1]),
                        parseInt(rgb[2])
                    );
                } else {
                    return null;
                }
            } else {
                throw new Error(`Element is null!\n${elem}`);
            }
        };
        const _makeNameTag = (name: string, hex: string | null, uid: string): string => {
            uid = uid.match(/\d+/g)!.join(''); // Get the UID, but only the digits
            hex = hex ? `;${hex}` : ''; // If there is a hex value, prepend `;`
            return `@[ulink=${uid}${hex}]${name}[/ulink]`;
        };

        // Get the reply box
        const replyBox = <HTMLInputElement>document.getElementById('shbox_text');
        // Observe the shoutbox
        Check.elemObserver(
            tar,
            (mutList) => {
                // When the shoutbox updates, process the information
                mutList.forEach((mutRec) => {
                    // Get the changed nodes
                    mutRec.addedNodes.forEach((node) => {
                        const nodeData = Util.nodeToElem(node);

                        // If the node is added by MAM+ for gift button, ignore
                        // Also ignore if the node is a date break
                        if (
                            /^mp_/.test(nodeData.getAttribute('id')!) ||
                            nodeData.classList.contains('dateBreak')
                        ) {
                            return;
                        }

                        // Select the name information
                        const shoutName: HTMLSpanElement | null = Util.nodeToElem(
                            node
                        ).querySelector('a[href^="/u/"] span');
                        // Grab the background color of the name, or text color
                        const nameColor: string | null = _getNameColor(shoutName);
                        //extract the username from node for use in reply
                        const userName: string = this.extractFromShout(
                            node,
                            'a > span',
                            'text'
                        );
                        const userID: string = this.extractFromShout(
                            node,
                            'a[href^="/u/"]',
                            'href'
                        );
                        //create a span element to be body of button added to page - button uses relative node context at click time to do calculations
                        const replyButton: HTMLSpanElement = document.createElement(
                            'span'
                        );
                        //if this is a ReplySimple request, then create Reply Simple button
                        if (buttons === 1) {
                            //create button with onclick action of setting sb text field to username with potential color block with a colon and space to reply, focus cursor in text box
                            replyButton.innerHTML = '<button>\u293a</button>';
                            replyButton
                                .querySelector('button')!
                                .addEventListener('click', () => {
                                    // Add the styled name tag to the reply box
                                    // If nothing was in the reply box, add a colon
                                    if (replyBox.value === '') {
                                        replyBox.value = `${_makeNameTag(
                                            userName,
                                            nameColor,
                                            userID
                                        )}: `;
                                    } else {
                                        replyBox.value = `${
                                            replyBox.value
                                        } ${_makeNameTag(userName, nameColor, userID)} `;
                                    }
                                    replyBox.focus();
                                });
                        }
                        //if this is a replyQuote request, then create reply quote button
                        else if (buttons === 2) {
                            //create button with onclick action of getting that line's text, stripping down to 65 char with no word break, then insert into SB text field, focus cursor in text box
                            replyButton.innerHTML = '<button>\u293d</button>';
                            replyButton
                                .querySelector('button')!
                                .addEventListener('click', () => {
                                    const text = this.quoteShout(node, 65);
                                    if (text !== '') {
                                        // Add quote to reply box
                                        replyBox.value = `${_makeNameTag(
                                            userName,
                                            nameColor,
                                            userID
                                        )}: \u201c[i]${text}[/i]\u201d `;
                                        replyBox.focus();
                                    } else {
                                        // Just reply
                                        replyBox.value = `${_makeNameTag(
                                            userName,
                                            nameColor,
                                            userID
                                        )}: `;
                                        replyBox.focus();
                                    }
                                });
                        }
                        //give span an ID for potential use later
                        replyButton.setAttribute('class', 'mp_replyButton');
                        //insert button prior to username or another button
                        node.insertBefore(replyButton, node.childNodes[2]);
                    });
                });
            },
            { childList: true }
        );
    }

    public static quoteShout(shout: Node, length: number) {
        const textArr: string[] = [];
        // Get number of reply buttons to remove from text
        const btnCount = shout.firstChild!.parentElement!.querySelectorAll(
            '.mp_replyButton'
        ).length;
        // Get the text of all child nodes
        shout.childNodes.forEach((child) => {
            /* If the child is a node with children (ex. not plain text) check to see if
            the child is a link. If the link does NOT start with `/u/` (indicating a user)
            then change the link to the string `[Link]`.
            In all other cases, return the child text content. */
            if (child.childNodes.length > 0) {
                const childElem = Util.nodeToElem(child);

                if (!childElem.hasAttribute('href')) {
                    textArr.push(child.textContent!);
                } else if (childElem.getAttribute('href')!.indexOf('/u/') < 0) {
                    textArr.push('[Link]');
                } else {
                    textArr.push(child.textContent!);
                }
            } else {
                textArr.push(child.textContent!);
            }
        });
        // Make a string, but toss out the first few nodes
        let nodeText = textArr.slice(3 + btnCount).join('');
        if (nodeText.indexOf(':') === 0) {
            nodeText = nodeText.substr(2);
        }
        // At this point we should have just the message text.
        // Remove any quotes that might be contained:
        nodeText = nodeText.replace(/\u{201c}(.*?)\u{201d}/gu, '');
        // Trim the text to a max length and add ... if shortened
        let trimmedText = Util.trimString(nodeText.trim(), length);
        if (trimmedText !== nodeText.trim()) {
            trimmedText += ' [\u2026]';
        }
        // Done!
        return trimmedText;
    }

    /**
     * Extract information from shouts
     * @param shout The node containing shout info
     * @param tar The element selector string
     * @param get The requested info (href or text)
     * @returns The string that was specified
     */
    public static extractFromShout(
        shout: Node,
        tar: string,
        get: 'href' | 'text'
    ): string {
        const nodeData = Util.nodeToElem(shout).classList.contains('dateBreak');

        if (shout !== null && !nodeData) {
            const shoutElem: HTMLElement | null = Util.nodeToElem(shout).querySelector(
                tar
            );
            if (shoutElem !== null) {
                let extracted: string | null;
                if (get !== 'text') {
                    extracted = shoutElem.getAttribute(get);
                } else {
                    extracted = shoutElem.textContent;
                }
                if (extracted !== null) {
                    return extracted;
                } else {
                    throw new Error('Could not extract shout! Attribute was null');
                }
            } else {
                throw new Error('Could not extract shout! Element was null');
            }
        } else {
            throw new Error('Could not extract shout! Node was null');
        }
    }

    /**
     * Change the style of a shout based on filter lists
     * @param shout The node containing shout info
     * @param usertype The type of users that have been filtered
     */
    public static styleShout(shout: Node, usertype: ShoutboxUserType): void {
        const shoutElem: HTMLElement = Util.nodeToElem(shout);
        if (usertype === 'priority') {
            const customStyle: string | undefined = GM_getValue('priorityStyle_val');
            if (customStyle) {
                shoutElem.style.background = `hsla(${customStyle})`;
            } else {
                shoutElem.style.background = 'hsla(0,0%,50%,0.3)';
            }
        } else if (usertype === 'mute') {
            shoutElem.classList.add('mp_muted');
        }
    }
}

class PriorityUsers implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'textbox',
        title: 'priorityUsers',
        tag: 'Emphasize Users',
        placeholder: 'ex. system, 25420, 77618',
        desc:
            'Emphasizes messages from the listed users in the shoutbox. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)',
    };
    private _tar: string = '.sbf div';
    private _priorityUsers: string[] = [];
    private _userType: ShoutboxUserType = 'priority';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        const gmValue: string | undefined = GM_getValue(`${this.settings.title}_val`);
        if (gmValue !== undefined) {
            this._priorityUsers = await Util.csvToArray(gmValue);
        } else {
            throw new Error('Userlist is not defined!');
        }
        ProcessShouts.watchShoutbox(this._tar, this._priorityUsers, this._userType);
        console.log(`[M+] Highlighting users in the shoutbox...`);
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * Allows a custom background to be applied to priority users
 */
class PriorityStyle implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'textbox',
        title: 'priorityStyle',
        tag: 'Emphasis Style',
        placeholder: 'default: 0, 0%, 50%, 0.3',
        desc: `Change the color/opacity of the highlighting rule for emphasized users' posts. (<em>This is formatted as Hue (0-360), Saturation (0-100%), Lightness (0-100%), Opacity (0-1)</em>)`,
    };
    private _tar: string = '.sbf div';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        console.log(`[M+] Setting custom highlight for priority users...`);
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * Allows a custom background to be applied to desired muted users
 */
class MutedUsers implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'textbox',
        title: 'mutedUsers',
        tag: 'Mute users',
        placeholder: 'ex. 1234, gardenshade',
        desc: `Obscures messages from the listed users in the shoutbox until hovered. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)`,
    };
    private _tar: string = '.sbf div';
    private _mutedUsers: string[] = [];
    private _userType: ShoutboxUserType = 'mute';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        const gmValue: string | undefined = GM_getValue(`${this.settings.title}_val`);
        if (gmValue !== undefined) {
            this._mutedUsers = await Util.csvToArray(gmValue);
        } else {
            throw new Error('Userlist is not defined!');
        }
        ProcessShouts.watchShoutbox(this._tar, this._mutedUsers, this._userType);
        console.log(`[M+] Obscuring muted users...`);
    }

    get settings(): TextboxSetting {
        return this._settings;
    }
}

/**
 * Allows Gift button to be added to Shout Triple dot menu
 */
class GiftButton implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'checkbox',
        title: 'giftButton',
        desc: `Places a Gift button in Shoutbox dot-menu`,
    };
    private _tar: string = '.sbf';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        console.log(`[M+] Initialized Gift Button.`);
        const sbfDiv = <HTMLDivElement>document.getElementById('sbf')!;
        const sbfDivChild = sbfDiv!.firstChild;

        //add event listener for whenever something is clicked in the sbf div
        sbfDiv.addEventListener('click', async (e) => {
            //pull the event target into an HTML Element
            const target = e.target as HTMLElement;
            //add the Triple Dot Menu as an element
            const sbMenuElem = target!.closest('.sb_menu');
            //find the message div
            const sbMenuParent = target!.closest(`div`);
            //get the full text of the message div
            let giftMessage = sbMenuParent!.innerText;
            //format message with standard text + message contents + server time of the message
            giftMessage =
                `Sent on Shoutbox message: "` +
                giftMessage.substring(giftMessage.indexOf(': ') + 2) +
                `" at ` +
                giftMessage.substring(0, 8);
            //if the target of the click is not the Triple Dot Menu OR
            //if menu is one of your own comments (only works for first 10 minutes of comment being sent)
            if (
                !target!.closest('.sb_menu') ||
                sbMenuElem!.getAttribute('data-ee')! === '1'
            ) {
                return;
            }
            //get the Menu after it pops up
            console.log(`[M+] Adding Gift Button...`);
            const popupMenu: HTMLElement | null = document.getElementById('sbMenuMain');
            do {
                await Util.sleep(5);
            } while (!popupMenu!.hasChildNodes());
            //get the user details from the popup menu details
            const popupUser: HTMLElement = Util.nodeToElem(popupMenu!.childNodes[0]);
            //make username equal the data-uid, force not null
            const userName: String = popupUser!.getAttribute('data-uid')!;
            //get the default value of gifts set in preferences for user page
            let giftValueSetting: string | undefined = GM_getValue('userGiftDefault_val');
            //if they did not set a value in preferences, set to 100
            if (!giftValueSetting) {
                giftValueSetting = '100';
            } else if (
                Number(giftValueSetting) > 1000 ||
                isNaN(Number(giftValueSetting))
            ) {
                giftValueSetting = '1000';
            } else if (Number(giftValueSetting) < 5) {
                giftValueSetting = '5';
            }
            //create the HTML document that holds the button and value text
            const giftButton: HTMLSpanElement = document.createElement('span');
            giftButton.setAttribute('id', 'giftButton');
            //create the button element as well as a text element for value of gift. Populate with value from settings
            giftButton.innerHTML = `<button>Gift: </button><span>&nbsp;</span><input type="text" size="3" id="mp_giftValue" title="Value between 5 and 1000" value="${giftValueSetting}">`;
            //add gift element with button and text to the menu
            popupMenu!.childNodes[0].appendChild(giftButton);
            //add event listener for when gift button is clicked
            giftButton.querySelector('button')!.addEventListener('click', () => {
                //pull whatever the final value of the text box equals
                const giftFinalAmount = (<HTMLInputElement>(
                    document.getElementById('mp_giftValue')
                ))!.value;
                //begin setting up the GET request to MAM JSON
                const giftHTTP = new XMLHttpRequest();
                //URL to GET results with the amount entered by user plus the username found on the menu selected
                //added message contents encoded to prevent unintended characters from breaking JSON URL
                const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}&message=${encodeURIComponent(
                    giftMessage
                )}`;
                giftHTTP.open('GET', url, true);
                giftHTTP.setRequestHeader('Content-Type', 'application/json');
                giftHTTP.onreadystatechange = function () {
                    if (giftHTTP.readyState === 4 && giftHTTP.status === 200) {
                        const json = JSON.parse(giftHTTP.responseText);
                        //create a new line in SB that shows gift was successful to acknowledge gift worked/failed
                        const newDiv = document.createElement('div');
                        newDiv.setAttribute('id', 'mp_giftStatusElem');
                        sbfDivChild!.appendChild(newDiv);
                        //if the gift succeeded
                        if (json.success) {
                            const successMsg = document.createTextNode(
                                'Points Gift Successful: Value: ' + giftFinalAmount
                            );
                            newDiv.appendChild(successMsg);
                            newDiv.classList.add('mp_success');
                        } else {
                            const failedMsg = document.createTextNode(
                                'Points Gift Failed: Error: ' + json.error
                            );
                            newDiv.appendChild(failedMsg);
                            newDiv.classList.add('mp_fail');
                        }
                        //after we add line in SB, scroll to bottom to show result
                        sbfDiv.scrollTop = sbfDiv.scrollHeight;
                    }
                    //after we add line in SB, scroll to bottom to show result
                    sbfDiv.scrollTop = sbfDiv.scrollHeight;
                };

                giftHTTP.send();
                //return to main SB window after gift is clicked - these are two steps taken by MAM when clicking out of Menu
                sbfDiv
                    .getElementsByClassName('sb_clicked_row')[0]!
                    .removeAttribute('class');
                document
                    .getElementById('sbMenuMain')!
                    .setAttribute('class', 'sbBottom hideMe');
            });
            giftButton.querySelector('input')!.addEventListener('input', () => {
                const valueToNumber: String = (<HTMLInputElement>(
                    document.getElementById('mp_giftValue')
                ))!.value;
                if (
                    Number(valueToNumber) > 1000 ||
                    Number(valueToNumber) < 5 ||
                    isNaN(Number(valueToNumber))
                ) {
                    giftButton.querySelector('button')!.disabled = true;
                } else {
                    giftButton.querySelector('button')!.disabled = false;
                }
            });
            console.log(`[M+] Gift Button added!`);
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Allows Reply button to be added to Shout
 */
class ReplySimple implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'checkbox',
        title: 'replySimple',
        //tag: "Reply",
        desc: `Places a Reply button in Shoutbox: &#10554;`,
    };
    private _tar: string = '.sbf div';
    private _replySimple: number = 1;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        ProcessShouts.watchShoutboxReply(this._tar, this._replySimple);
        console.log(`[M+] Adding Reply Button...`);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Allows Reply With Quote button to be added to Shout
 */
class ReplyQuote implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'checkbox',
        title: 'replyQuote',
        //tag: "Reply With Quote",
        desc: `Places a Reply with Quote button in Shoutbox: &#10557;`,
    };
    private _tar: string = '.sbf div';
    private _replyQuote: number = 2;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        ProcessShouts.watchShoutboxReply(this._tar, this._replyQuote);
        console.log(`[M+] Adding Reply with Quote Button...`);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}

/**
 * Creates feature for building a library of quick shout items that can act as a copy/paste replacement.
 */
class QuickShout implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'checkbox',
        title: 'quickShout',
        desc: `Create feature below shoutbox to store pre-set messages.`,
    };
    private _tar: string = '.sbf div';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox', 'home']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }

    private async _init() {
        console.log(`[M+] Adding Quick Shout Buttons...`);
        //get the main shoutbox input field
        const replyBox = <HTMLInputElement>document.getElementById('shbox_text');
        //empty JSON was giving me issues, so decided to just make an intro for when the GM variable is empty
        let jsonList = JSON.parse(
            `{ "Intro":"Welcome to QuickShout MAM+er! Here you can create preset Shout messages for quick responses and knowledge sharing. 'Clear' clears the entry to start selection process over. 'Select' takes whatever QuickShout is in the TextArea and puts in your Shout response area. 'Save' will store the Selection Name and Text Area Combo for future use as a QuickShout, and has color indicators. Green = saved as-is. Yellow = QuickShout Name exists and is saved, but content does not match what is stored. Orange = no entry matching that name, not saved. 'Delete' will permanently remove that entry from your stored QuickShouts (button only shows when exists in storage). For new entries have your QuickShout Name typed in BEFORE you craft your text or risk it being overwritten by something that exists as you type it. Thanks for using MAM+!" }`
        );
        //get Shoutbox DIV
        const shoutBox = document.getElementById('fpShout');
        //get the footer where we will insert our feature
        const shoutFoot = <HTMLElement>shoutBox!.querySelector('.blockFoot');
        //give it an ID and set the size
        shoutFoot!.setAttribute('id', 'mp_blockFoot');
        shoutFoot!.style.height = '2.5em';
        //create a new dive to hold our comboBox and buttons and set the style for formatting
        const comboBoxDiv = document.createElement('div');
        comboBoxDiv.style.float = 'left';
        comboBoxDiv.style.marginLeft = '1em';
        comboBoxDiv.style.marginBottom = '.5em';
        comboBoxDiv.style.marginTop = '.5em';
        //create the label text element and add the text and attributes for ID
        const comboBoxLabel = document.createElement('label');
        comboBoxLabel.setAttribute('for', 'quickShoutData');
        comboBoxLabel.innerText = 'Choose a QuickShout';
        comboBoxLabel.setAttribute('id', 'mp_comboBoxLabel');
        //create the input field to link to datalist and format style
        const comboBoxInput = document.createElement('input');
        comboBoxInput.style.marginLeft = '.5em';
        comboBoxInput.setAttribute('list', 'mp_comboBoxList');
        comboBoxInput.setAttribute('id', 'mp_comboBoxInput');
        //create a datalist to store our quickshouts
        const comboBoxList = document.createElement('datalist');
        comboBoxList.setAttribute('id', 'mp_comboBoxList');
        //if the GM variable exists
        if (GM_getValue('mp_quickShout')) {
            //overwrite jsonList variable with parsed data
            jsonList = JSON.parse(GM_getValue('mp_quickShout'));
            //for each key item
            Object.keys(jsonList).forEach((key) => {
                //create a new Option element and add our data for display to user
                const comboBoxOption = document.createElement('option');
                comboBoxOption.value = key.replace(/ಠ/g, ' ');
                comboBoxList.appendChild(comboBoxOption);
            });
            //if no GM variable
        } else {
            //create variable with out Intro data
            GM_setValue('mp_quickShout', JSON.stringify(jsonList));
            //for each key item
            // TODO: probably can get rid of the forEach and just do single execution since we know this is Intro only
            Object.keys(jsonList).forEach((key) => {
                const comboBoxOption = document.createElement('option');
                comboBoxOption.value = key.replace(/ಠ/g, ' ');
                comboBoxList.appendChild(comboBoxOption);
            });
        }

        //append the above elements to our DIV for the combo box
        comboBoxDiv.appendChild(comboBoxLabel);
        comboBoxDiv.appendChild(comboBoxInput);
        comboBoxDiv.appendChild(comboBoxList);
        //create the clear button and add style
        const clearButton = document.createElement('button');
        clearButton.style.marginLeft = '1em';
        clearButton.innerHTML = 'Clear';
        //create delete button, add style, and then hide it for later use
        const deleteButton = document.createElement('button');
        deleteButton.style.marginLeft = '6em';
        deleteButton.style.display = 'none';
        deleteButton.style.backgroundColor = 'Red';
        deleteButton.innerHTML = 'DELETE';
        //create select button and style it
        const selectButton = document.createElement('button');
        selectButton.style.marginLeft = '1em';
        selectButton.innerHTML = '\u2191 Select';
        //create save button and style it
        const saveButton = document.createElement('button');
        saveButton.style.marginLeft = '1em';
        saveButton.innerHTML = 'Save';
        //add all 4 buttons to the comboBox DIV
        comboBoxDiv.appendChild(clearButton);
        comboBoxDiv.appendChild(selectButton);
        comboBoxDiv.appendChild(saveButton);
        comboBoxDiv.appendChild(deleteButton);
        //create our text area and style it, then hide it
        const quickShoutText = document.createElement('textarea');
        quickShoutText.style.height = '50%';
        quickShoutText.style.margin = '1em';
        quickShoutText.style.width = '97%';
        quickShoutText.id = 'mp_quickShoutText';
        quickShoutText.style.display = 'none';

        //executes when clicking select button
        selectButton.addEventListener(
            'click',
            async () => {
                //if there is something inside of the quickshout area
                if (quickShoutText.value) {
                    //put the text in the main site reply field and focus on it
                    replyBox.value = quickShoutText.value;
                    replyBox.focus();
                }
            },
            false
        );

        //create a quickShout delete button
        deleteButton.addEventListener(
            'click',
            async () => {
                //if this is not the last quickShout
                if (Object.keys(jsonList).length > 1) {
                    //delete the entry from the JSON and update the GM variable with new json list
                    delete jsonList[comboBoxInput.value.replace(/ /g, 'ಠ')];
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                    //delete the options from datalist to reset with newly created jsonList
                    comboBoxList.innerHTML = '';
                    //for each item in new jsonList
                    Object.keys(jsonList).forEach((key) => {
                        //new option element to add to list
                        const comboBoxOption = document.createElement('option');
                        //add the current key value to the element
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //add element to the list
                        comboBoxList.appendChild(comboBoxOption);
                    });
                    //if the last item in the jsonlist
                } else {
                    //delete item from jsonList
                    delete jsonList[comboBoxInput.value.replace(/ಠ/g, 'ಠ')];
                    //delete entire variable so its not empty GM variable
                    GM_deleteValue('mp_quickShout');
                    //re-style the save button for new unsaved status
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //hide delete button now that its not a saved entry
                    deleteButton.style.display = 'none';
                }
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            },
            false
        );

        //create event on save button to save quickshout
        saveButton.addEventListener(
            'click',
            async () => {
                //if there is data in the key and value GUI fields, proceed
                if (quickShoutText.value && comboBoxInput.value) {
                    //was having issue with eval processing the .replace data so made a variable to intake it
                    const replacedText = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //fun way to dynamically create statements - this takes whatever is in list field to create a key with that text and the value from the textarea
                    eval(
                        `jsonList.` +
                            replacedText +
                            `= "` +
                            encodeURIComponent(quickShoutText.value) +
                            `";`
                    );
                    //overwrite or create the GM variable with new jsonList
                    GM_setValue('mp_quickShout', JSON.stringify(jsonList));
                    //re-style save button to green now that its saved as-is
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    //show delete button now that its a saved entry
                    deleteButton.style.display = '';
                    //delete existing datalist elements to rebuild with new jsonlist
                    comboBoxList.innerHTML = '';
                    //for each key in the jsonlist
                    Object.keys(jsonList).forEach((key) => {
                        //create new option element
                        const comboBoxOption = document.createElement('option');
                        //add key name to the option
                        comboBoxOption.value = key.replace(/ಠ/g, ' ');
                        //TODO: this may or may not be necessary, but was having issues with the unique symbol still randomly showing up after saves
                        comboBoxOption.value = comboBoxOption.value.replace(/ಠ/g, ' ');
                        //add to the list
                        // console.log(comboBoxOption);

                        comboBoxList.appendChild(comboBoxOption);
                    });
                }
            },
            false
        );

        //add event for clear button to reset the datalist
        clearButton.addEventListener(
            'click',
            async () => {
                //clear the input field and textarea field
                comboBoxInput.value = '';
                quickShoutText.value = '';
                //create input event on input to force some updates and dispatch it
                const event = new Event('input');
                comboBoxInput.dispatchEvent(event);
            },
            false
        );

        //Next two input functions are meat and potatoes of the logic for user functionality

        //whenever something is typed or changed whithin the input field
        comboBoxInput.addEventListener(
            'input',
            async () => {
                //if input is blank
                if (!comboBoxInput.value) {
                    //if the textarea is also blank minimize real estate
                    if (!quickShoutText.value) {
                        //hide the text area
                        quickShoutText.style.display = 'none';
                        //shrink the footer
                        shoutFoot!.style.height = '2.5em';
                        //re-style the save button to default
                        saveButton.style.backgroundColor = '';
                        saveButton.style.color = '';
                        //if something is still in the textarea we need to indicate that unsaved and unnamed data is there
                    } else {
                        //style for unsaved and unnamed is organge save button
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                    }
                    //either way, hide the delete button
                    deleteButton.style.display = 'none';
                }
                //if the input field has any text in it
                else {
                    const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');
                    //show the text area for input
                    quickShoutText.style.display = '';
                    //expand the footer to accomodate all feature aspects
                    shoutFoot!.style.height = '11em';
                    //if what is in the input field is a saved entry key
                    if (jsonList[inputVal]) {
                        //this can be a sucky line of code because it can wipe out unsaved data, but i cannot think of better way
                        //replace the text area contents with what the value is in the matched pair
                        // quickShoutText.value = jsonList[JSON.parse(inputVal)];
                        quickShoutText.value = decodeURIComponent(jsonList[inputVal]);

                        //show the delete button since this is now exact match to saved entry
                        deleteButton.style.display = '';
                        //restyle save button to show its a saved combo
                        saveButton.style.backgroundColor = 'Green';
                        saveButton.style.color = '';
                        //if this is not a registered key name
                    } else {
                        //restyle the save button to be an unsaved entry
                        saveButton.style.backgroundColor = 'Orange';
                        saveButton.style.color = 'Black';
                        //hide the delete button since this cannot be saved
                        deleteButton.style.display = 'none';
                    }
                }
            },
            false
        );

        //whenever something is typed or deleted out of textarea
        quickShoutText.addEventListener(
            'input',
            async () => {
                const inputVal = comboBoxInput.value.replace(/ /g, 'ಠ');

                //if the input field is blank
                if (!comboBoxInput.value) {
                    //restyle save button for unsaved and unnamed
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    //hide delete button
                    deleteButton.style.display = 'none';
                }
                //if input field has text in it
                else if (
                    jsonList[inputVal] &&
                    quickShoutText.value !== decodeURIComponent(jsonList[inputVal])
                ) {
                    //restyle save button as yellow for editted
                    saveButton.style.backgroundColor = 'Yellow';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = '';
                    //if the key is a match and the data is a match then we have a 100% saved entry and can put everything back to saved
                } else if (
                    jsonList[inputVal] &&
                    quickShoutText.value === decodeURIComponent(jsonList[inputVal])
                ) {
                    //restyle save button to green for saved
                    saveButton.style.backgroundColor = 'Green';
                    saveButton.style.color = '';
                    deleteButton.style.display = '';
                    //if the key is not found in the saved list, orange for unsaved and unnamed
                } else if (!jsonList[inputVal]) {
                    saveButton.style.backgroundColor = 'Orange';
                    saveButton.style.color = 'Black';
                    deleteButton.style.display = 'none';
                }
            },
            false
        );
        //add the combobox and text area elements to the footer
        shoutFoot.appendChild(comboBoxDiv);
        shoutFoot.appendChild(quickShoutText);
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
