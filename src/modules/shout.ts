


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
        Util.startFeature(this._settings, this._tar, 'shoutbox')
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
        Util.startFeature(this._settings, this._tar, 'shoutbox')
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
 * Allows a custom background to be applied to priority users
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
        Util.startFeature(this._settings, this._tar, 'shoutbox')
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
