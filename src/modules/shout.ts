


class PriorityUsers implements Feature {
    private _settings: TextboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'textbox',
        title: 'priorityUsers',
        tag: "Emphasize Users",
        placeholder: "ex. system, 25420, 77618",
        desc: 'Emphasizes messages from the listed users in the shoutbox. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)',
    }
    private _tar: string = '#sbf';
    private _priorityUsers: string[] = [];
    private _userType:ShoutboxUserType = 'priority';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox','home'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        let gmValue: string|undefined = GM_getValue(`${this.settings.title}_val`);
        if(gmValue !== undefined){
            this._priorityUsers = await Util.csvToArray( gmValue );
        }else{
            throw new Error('Userlist is not defined!');
        }
        ProcessShouts.watchShoutbox(this._tar, this._priorityUsers, this._userType);
        console.log(`[M+] Highlighting users in the shoutbox...`)
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
        tag: "Emphasis Style",
        placeholder: "default: 0, 0%, 50%, 0.3",
        desc: `Change the color/opacity of the highlighting rule for emphasized users' posts. (<em>This is formatted as Hue,Saturation,Lightness,Opacity. H is 0-360, SL are 0-100%, and O is 0-1</em>)`,
    }
    private _tar: string = '#sbf';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox','home'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        console.log(`[M+] Setting custom highlight for priority users...`)
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
        tag: "Mute users",
        placeholder: "ex. 1234, gardenshade",
        desc: `Obscures messages from the listed users in the shoutbox until hovered. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)`,
    }
    private _tar: string = '#sbf';
    private _mutedUsers: string[] = [];
    private _userType: ShoutboxUserType = 'mute';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox','home'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        let gmValue: string | undefined = GM_getValue(`${this.settings.title}_val`);
        if (gmValue !== undefined) {
            this._mutedUsers = await Util.csvToArray(gmValue);
        } else {
            throw new Error('Userlist is not defined!');
        }
        ProcessShouts.watchShoutbox(this._tar, this._mutedUsers, this._userType);
        console.log(`[M+] Obscuring muted users...`)
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
        //tag: "Reply",
        desc: `Places a Gift button in Shoutbox: &#10554;`,
    }
    private _tar: string = '#sbf';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox','home'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
		//add event listener for all of the triple dot menus (concept pulled from MAM src)
		$("#shoutbox #sbf").on("click context", ".sb_menu", function () {
				//if menu of one of your own comments
				if ($(this).attr("data-ee")! === "1") {
					return; //No Gift for you!
				}
				//get the Menu after it pops up
				let popupMenu: HTMLElement|null = document.getElementById("sbMenuMain");
				//get the user details from the popup menu details
				let popupUser: HTMLElement = Util.nodeToElem(popupMenu!.childNodes[0]);
				//make username equal the data-uid, force not null
				let userName: String = popupUser!.getAttribute("data-uid")!;
				//get the default value of gifts set in preferences for user page
				let giftValueSetting: string|undefined = GM_getValue('userGiftDefault_val');
				//if they did not set a value in preferences, set to 100
				if (!giftValueSetting){
					giftValueSetting = "100";
				}
				//create the HTML document that holds the button and value text
                let giftButton: HTMLSpanElement = document.createElement('span');
				giftButton.setAttribute("id","giftButton");
				//create the button element as well as a text element for value of gift. Populate with value from settings
				giftButton.innerHTML = '<button>Gift: </button><span>&nbsp;</span><input type="text" size="3" id="giftValue" title="Value between 10 and 1000" value="'+giftValueSetting+'">';
				//add event listener for when gift button is clicked
				giftButton.querySelector('button')!
                            .addEventListener('click', () => {
								//pull whatever the final value of the text box equals
								var giftFinalAmount = document.getElementById("giftValue")!.getAttribute("value")!;
                                //begin setting up the GET request to MAM JSON
								var giftHTTP = new XMLHttpRequest();
								//URL to GET results with the amount entered by user plus the username found on the menu selected
								var url = "https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount="+giftFinalAmount+"&giftTo="+userName;
								giftHTTP.open("GET", url, true);	
								giftHTTP.setRequestHeader("Content-Type", "application/json"); 
								giftHTTP.onreadystatechange = function () {
									if (giftHTTP.readyState === 4 && giftHTTP.status === 200) {
										var json = JSON.parse(giftHTTP.responseText);
										//if the gift succeeded
										if(json.success){
											//create a new line in SB that shows gift was successful to acknowledge gift worked
											var newDiv = document.createElement("div");
											var successMsg = document.createTextNode("Points Gift Successful: Value: "+ giftFinalAmount);
											newDiv.appendChild(successMsg);
											newDiv.setAttribute("id","giftStatusElem");
											document.getElementById("sbf")!.appendChild(newDiv);
											//after we add line in SB, scroll to bottom to show result
											$("#sbf")[0]!.scrollTop = $("#sbf")[0]!.scrollHeight
										//create a new line in SB that shows gift failed to acknowledge gift result
										} else {
											var newDiv = document.createElement("div");
											var failedMsg = document.createTextNode("Points Gift Failed: Error: "+ json.error);
											newDiv.appendChild(failedMsg);
											newDiv.setAttribute("id","giftStatusElem");
											document.getElementById("sbf")!.appendChild(newDiv);
											//after we add line in SB, scroll to bottom to show result
											$("#sbf")[0]!.scrollTop = $("#sbf")[0]!.scrollHeight
										}
									}
								};
								giftHTTP.send();
								//return to main SB window after gift is clicked
								$(".sb_clicked_row").removeClass("sb_clicked_row");
								$("#sbMenuMain").addClass("hideMe")
								
                            })
				//add gift element with button and text to the menu
				popupMenu!.childNodes[0].appendChild(giftButton);
			});

        console.log(`[M+] Adding Gift Button...`)
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
    }
    private _tar: string = '#sbf';
    private _replySimple: number = 1;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox','home'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        ProcessShouts.watchShoutboxReply(this._tar, this._replySimple);
        console.log(`[M+] Adding Reply Button...`)
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
    }
    private _tar: string = '#sbf';
    private _replyQuote: number = 2;

    constructor() {
        Util.startFeature(this._settings, this._tar, ['shoutbox','home'])
            .then(t => { if (t) { this._init() } });
    }

    private async _init() {
        ProcessShouts.watchShoutboxReply(this._tar, this._replyQuote);
        console.log(`[M+] Adding Reply with Quote Button...`)
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}


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
    public static watchShoutbox( tar:string, names?:string[], usertype?:ShoutboxUserType ):void{
        // Observe the shoutbox
        Check.elemObserver( tar, mutList => {
            // When the shoutbox updates, process the information
            mutList.forEach( mutRec => {
                // Get the changed nodes
                mutRec.addedNodes.forEach( node => {
					//if the node is added by MAM+ for gift button, ignore
                    if(Util.nodeToElem(node).getAttribute("id")==="giftStatusElem"){
							return;
						}
					// If we're looking for specific users...
                    if(names !== undefined && names.length > 0){
                        if(usertype === undefined){ throw new Error('Usertype must be defined if filtering names!'); }
                        // Extract
                        let userID: string = this.extractFromShout(node, 'a[href^="\/u\/"]', 'href');
                        let userName: string = this.extractFromShout(node, 'a > span', 'text');
                        // Filter
                        names.forEach( name => {
                            if(`/u/${name}` === userID || Util.caselessStringMatch(name, userName)){
                                this.styleShout( node, usertype );
                            }
                        } );
                    }
                } );
            } );
        }, { childList:true }
        );
    }

	/**
     * Watch the shoutbox for changes, triggering actions for filtered shouts
     * @param tar The shoutbox element selector
     * @param buttons Number to represent checkbox selections 1 = Reply, 2 = Reply With Quote
     * @param charLimit Number of characters to include in quote, , charLimit?:number - Currently unused
     */
    public static watchShoutboxReply( tar:string, buttons?:number ):void{
        // Get the reply box
        const replyBox = <HTMLInputElement>document.getElementById('shbox_text');
        // Observe the shoutbox
        Check.elemObserver( tar, mutList => {
            // When the shoutbox updates, process the information
            mutList.forEach( mutRec => {
                // Get the changed nodes
                mutRec.addedNodes.forEach( node => {
						//if the node is added by MAM+ for gift button, ignore
                    	if(Util.nodeToElem(node).getAttribute("id")==="giftStatusElem"){
							return;
						}
						//colorBlock is the empty strings representing potential for color bbcode in text. done in array to keep paired bbcode blocks
						let colorBlock: Array<string> = ["",""];
						//idColor created as empty string placeholder
						let idColor: string = "";
						//extract the shoutbox text node containing UserID color Data
						let shoutHrefElem:HTMLElement|null = Util.nodeToElem(node).querySelector('a[href^="\/u\/"]');
                        //use queried element to pull out the attribute value of color (had issue with getting attribute by name, room for improvement here)
						if(shoutHrefElem != null ){
							idColor = Util.nodeToElem(shoutHrefElem.childNodes[0]).attributes[0].value;
						}
						//if the color extracted from href element has more than 2 attributes, then that means it is an admin/mod with background color. skip them
						if(idColor.split(";").length <= 2 && idColor != "" && idColor.indexOf("#") > 0){
						//overwrite empty string with bbcode color block
						colorBlock[0] = "[" + idColor.replace(":","=").replace(";","") + "]";
						colorBlock[1] = "[/color]";
						}
						//extract the username from node for use in reply
						let userName: string = this.extractFromShout(node, 'a > span', 'text');
						//create a span element to be body of button added to page - button uses relative node context at click time to do calculations
                        let replyButton: HTMLSpanElement = document.createElement('span');
						//if this is a ReplySimple request, then create Reply Simple button
						if(buttons === 1){
							//create button with onclick action of setting sb text field to username with potential color block with a colon and space to reply, focus cursor in text box
                            replyButton.innerHTML = '<button>\u293a</button>';
                            replyButton.querySelector('button')!
                            .addEventListener('click', () => {
                                replyBox.value = replyBox.value + `[i]${colorBlock[0]+userName+colorBlock[1]}[/i]`;
                                replyBox.focus();
                            })
						}
						//if this is a replyQuote request, then create reply quote button
						else if (buttons === 2){
							//create button with onclick action of getting that line's text, stripping down to 65 char with no word break, then insert into SB text field, focus cursor in text box
                            replyButton.innerHTML = '<button>\u293d</button>';
                            replyButton.querySelector('button')!
                            .addEventListener('click', () => {
                                let extractText:string[] = [];
                                // Get number of reply buttons to remove from text
                                let btnCount = node.firstChild!.parentElement!.querySelectorAll('.mp_replyButton').length;
                                // Get the text of all child nodes
                                node.childNodes.forEach(child => {
                                    // Links aren't clickable anyway so get rid of them
                                    if ( child.nodeName === 'A' ) {
                                        extractText.push( '[Link]' )
                                    } else {
                                        extractText.push( child.textContent! );
                                    }
                                });
                                // Make a string, but toss out the first few nodes
                                let nodeText = extractText.slice(3+btnCount).join(' ');
                                if(nodeText.indexOf(':') === 0){
                                    nodeText = nodeText.substr(2);
                                }
                                nodeText = Util.trimString(nodeText.trim(), 65);
                                // Add quote to reply box
                                replyBox.value = `\u201c[i]${colorBlock[ 0 ] + userName + colorBlock[ 1 ]}: ${nodeText}\u2026[/i]\u201d`;
                                replyBox.focus();
                            })
						}
						//give span an ID for potential use later
						replyButton.setAttribute("class","mp_replyButton");
						//insert button prior to username or another button
						node.insertBefore(replyButton,node.childNodes[2]);

                } );
            } );
        }, { childList:true }
        );
    }

    /**
     * Extract information from shouts
     * @param shout The node containing shout info
     * @param tar The element selector string
     * @param get The requested info (href or text)
     * @returns The string that was specified
     */
    public static extractFromShout( shout:Node, tar:string, get:'href'|'text' ):string{
        if(shout !== null){
            let shoutElem:HTMLElement|null = Util.nodeToElem(shout).querySelector(tar);
            if(shoutElem !== null){
                let extracted: string | null;
                if(get !== 'text'){
                    extracted = shoutElem.getAttribute(get);
                }else{
                    extracted = shoutElem.textContent;
                }
                if(extracted !== null){
                    return extracted;
                }else{
                    throw new Error('Could not extract shout! Attribute was null')
                }
            } else { throw new Error('Could not extract shout! Element was null') }

        }else{ throw new Error('Could not extract shout! Node was null') }
    }

    /**
     * Change the style of a shout based on filter lists
     * @param shout The node containing shout info
     * @param usertype The type of users that have been filtered
     */
    public static styleShout( shout:Node, usertype:ShoutboxUserType ):void{
        let shoutElem:HTMLElement = Util.nodeToElem(shout);
        if(usertype === 'priority'){
            let customStyle: string|undefined = GM_getValue('priorityStyle_val');
            if ( customStyle ){
                shoutElem.style.background = `hsla(${customStyle})`;
            }else{
                shoutElem.style.background = 'hsla(0,0%,50%,0.3)';
            }
        }else if(usertype === 'mute'){
            shoutElem.classList.add('mp_muted');
        }
    }
}
