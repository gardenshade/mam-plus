/// <reference path="shared.ts" />
/// <reference path="../util.ts" />

/**
 * * Allows gifting of FL wedge to members through forum.
 */
class ForumFLGift implements Feature {
    private _settings: CheckboxSetting = {
        type: 'checkbox',
        scope: SettingGroup['Forum Pages'],
        title: 'forumFLGift',
        desc: `Enables Button to Gift FL Wedges in Forum Posts`,
    };
    private _tar: string = '.forumLink';

    constructor() {
        Util.startFeature(this._settings, this._tar, ['forum']).then((t) => {
            if (t) {
                this._init();
            }
        });
    }
    private async _init() {
        console.log('[M+] Enabling Forum Gift Button...');
        //mainBody is best element with an ID I could find that is a parent to all forum posts
        const mainBody = <HTMLDivElement>document.querySelector('#mainBody');
        //make array of forum posts - there is only one cursor classed object per forum post, so this was best to key off of. wish there were more IDs and such used in forums
        const forumPosts: HTMLAnchorElement[] = Array.prototype.slice.call(
            mainBody.getElementsByClassName('coltable')
        );
        //for each post on the page
        forumPosts.forEach((forumPost) => {
            //work our way down the structure of the HTML to get to our post
            let bottomRow = forumPost.childNodes[1];
            bottomRow = bottomRow.childNodes[4];
            bottomRow = bottomRow.childNodes[3];
            //get the ID of the forum from the custom MAM attribute
            let postID = (<HTMLElement>forumPost.previousSibling!).getAttribute('name');
            //mam decided to have a different structure for last forum. wish they just had IDs or something instead of all this jumping around
            if (postID === 'last') {
                postID = (<HTMLElement>(
                    forumPost.previousSibling!.previousSibling!
                )).getAttribute('name');
            }
            //create a new element for our feature
            const giftElement = document.createElement('a');
            //set same class as other objects in area for same pointer and formatting options
            giftElement.setAttribute('class', 'cursor');
            //give our element an ID for future selection as needed
            giftElement.setAttribute('id', 'mp_' + postID + '_text');
            //create new img element to lead our new feature visuals
            const giftIconGif = document.createElement('img');
            //use site freeleech gif icon for our feature
            giftIconGif.setAttribute(
                'src',
                'https://cdn.myanonamouse.net/imagebucket/108303/thank.gif'
            );
            //make the gif icon the first child of element
            giftElement.appendChild(giftIconGif);
            //add the feature element in line with the cursor object which is the quote and report buttons at bottom
            bottomRow.appendChild(giftElement);

            //make it a button via click listener
            giftElement.addEventListener(
                'click',
                async () => {
                    //to avoid button triggering more than once per page load, check if already have json result
                    if (giftElement.childNodes.length <= 1) {
                        //due to lack of IDs and conflicting query selectable elements, need to jump up a few parent levels
                        const postParentNode = giftElement.parentElement!.parentElement!
                            .parentElement!;
                        //once at parent node of the post, find the poster's user id
                        const userElem = postParentNode.querySelector(`a[href^="/u/"]`);
                        //get the URL of the post to add to message
                        const postURL = (<HTMLElement>(
                            postParentNode.querySelector(`a[href^="/f/t/"]`)!
                        )).getAttribute('href');
                        //get the name of the current MAM user sending gift
                        let sender = document.getElementById('userMenu')!.innerText;
                        //clean up text of sender obj
                        sender = sender.substring(0, sender.indexOf(' '));
                        //get the title of the page so we can write in message
                        let forumTitle = document.title;
                        //cut down fluff from page title
                        forumTitle = forumTitle.substring(
                            22,
                            forumTitle.indexOf('|') - 1
                        );
                        //get the members name for JSON string
                        const userName = (<HTMLElement>userElem!).innerText;

                        //URL to GET a gift result
                        let url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=sendWedge&giftTo=${userName}&message=${sender} wants to thank you for your contribution to the forum topic [url=https://myanonamouse.net${postURL}]${forumTitle}[/url]`;
                        //make # URI compatible
                        url = url.replace('#', '%23');
                        //use MAM+ json get utility to process URL and return results
                        const jsonResult: string = await Util.getJSON(url);
                        if (MP.DEBUG) console.log('Gift Result', jsonResult);
                        //if gift was successfully sent
                        if (JSON.parse(jsonResult).success) {
                            //add the feature text to show success
                            giftElement.appendChild(
                                document.createTextNode('FL Gift Successful!')
                            );
                            //based on failure, add feature text to show failure reason or generic
                        } else if (
                            JSON.parse(jsonResult).error ===
                            'You can only send a user one wedge per day.'
                        ) {
                            giftElement.appendChild(
                                document.createTextNode(
                                    'Failed: Already Gifted This User Today!'
                                )
                            );
                        } else if (
                            JSON.parse(jsonResult).error ===
                            'Invalid user, this user is not currently accepting wedges'
                        ) {
                            giftElement.appendChild(
                                document.createTextNode(
                                    'Failed: This User Does Not Accept Gifts!'
                                )
                            );
                        } else {
                            //only known example of this 'other' is when gifting yourself
                            giftElement.appendChild(
                                document.createTextNode('FL Gift Failed!')
                            );
                        }
                    }
                },
                false
            );
        });
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
