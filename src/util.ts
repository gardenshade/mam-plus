/**
 * Class containing common utility methods
 */

class Util {
    /**
     * Animation frame timer
     */
    public static afTimer():Promise<number> {
        return new Promise( (resolve) => {
            requestAnimationFrame(resolve);
        } );
    }

    public static notify( kind:string|boolean, log:Log ):Promise<any> {
        if (MP.DEBUG) { console.group(`Util.notify( ${kind} )`); }

        return new Promise( (resolve) => {
            // Notifications are allowed
            if (GM_getValue('mp_alert')) {
                // Internal function to build msg text
                const buildMsg = (arr: string[], title: string): string|undefined => {
                    if (MP.DEBUG) { console.log(`buildMsg( ${title} )`); }
                    // Make sure the array isn't empty
                    if (arr.length > 0 && arr[0] !== '') {
                        // Display the section heading
                        let msg: string = `<h4>${title}:</h4><ul>`;
                        // Loop over each item in the message
                        arr.forEach((item) => {
                            msg += `<li>${item}</li>`;
                        }, msg);
                        // Close the message
                        msg += '</ul>';
                        return msg;
                    }
                    return undefined;
                };

                // Internal function to build notification panel
                const buildPanel = (msg: string): void => {
                    if (MP.DEBUG) { console.log(`buildPanel( ${msg} )`); }
                    document.body.innerHTML += `<div class='mp_notification'>${msg}<span>X</span></div>`;
                    const msgBox:Element = document.querySelector('.mp_notification')!;
                    const closeBtn:HTMLSpanElement = msgBox.querySelector('span')!;
                    try {
                        if( closeBtn ){
                            // If the close button is clicked, remove it
                            closeBtn.addEventListener('click', () => {
                                if (msgBox) { msgBox.remove() };
                            }, false);
                        }
                    } catch (err) {
                        if (MP.DEBUG) { console.log(err); }
                    }
                };

                let message: string = '';

                if( kind === 'updated' ) {
                    if (MP.DEBUG) { console.log('Building update message'); }
                    // Start the message
                    message = `<strong>MAM+ has been updated!</strong> You are now using v${MP.VERSION}, created on ${MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>`;
                    // Add the changelog
                    buildMsg( log.UPDATE_LIST, 'Changes' );
                    buildMsg( log.BUG_LIST, 'Known Bugs' );
                } else if( kind === 'firstRun' ) {
                    message = '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="https://github.com/gardenshade/mam-plus/issues">Github</a>, <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a>, or <a href="/sendmessage.php?receiver=108303">through private message</a>.'
                    if (MP.DEBUG) { console.log('Building first run message'); }
                } else {
                    if (MP.DEBUG) { console.warn(`Received msg kind: ${kind}`); }
                }
                buildPanel( message );

                if (MP.DEBUG) { console.groupEnd(); }
                resolve(true);
            // Notifications are disabled
            } else {
                if (MP.DEBUG) {
                    console.log('Notifications are disabled.'); console.groupEnd(); }
                resolve(false);
            }
        } );
    }
}
