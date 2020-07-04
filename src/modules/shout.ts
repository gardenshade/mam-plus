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
                        //if the node is added by MAM+ for gift button, ignore
                        if (/^mp_/.test(Util.nodeToElem(node).getAttribute('id')!)) {
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
        const _makeNameTag = (name: string, hex: string | null): string => {
            if (!hex) {
                return `@[i]${name}[/i]`;
            } else {
                return `@[color=${hex}][i]${name}[/i][/color]`;
            }
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
                        //if the node is added by MAM+ for gift button, ignore
                        if (/^mp_/.test(Util.nodeToElem(node).getAttribute('id')!)) {
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
                                            nameColor
                                        )}: `;
                                    } else {
                                        replyBox.value = `${
                                            replyBox.value
                                        } ${_makeNameTag(userName, nameColor)} `;
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

                                    // Add quote to reply box
                                    replyBox.value = `${_makeNameTag(
                                        userName,
                                        nameColor
                                    )}: \u201c[i]${text}[/i]\u201d `;
                                    replyBox.focus();
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
            // Links aren't clickable anyway so get rid of them
            if (child.nodeName === 'A') {
                textArr.push('[Link]');
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
        if (shout !== null) {
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
                const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${giftFinalAmount}&giftTo=${userName}`;
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
