/**
 * CORE FEATURES
 *
 * Your feature belongs here if the feature:
 * A) is critical to the userscript
 * B) is intended to be used by other features
 * C) will have settings displayed on the Settings page
 * If A & B are met but not C consider using `Utils.ts` instead
 */

 /**
  * This feature creates a pop-up notification
  */
class Alerts implements Feature{
    private _settings:CheckboxSetting = {
        scope: SettingGroup.Global,
        type: 'checkbox',
        title: 'alerts',
        desc: 'Enable the MAM+ Alert panel for update information, etc.',
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }

    public notify(kind: string | boolean, log: ArrayObject): Promise<any> {
        if (MP.DEBUG) { console.group(`Alerts.notify( ${kind} )`); }

        return new Promise((resolve) => {
            // Verify a notification request was made
            if (kind) {
                // Verify notifications are allowed
                if (GM_getValue('alerts')) {
                    // Internal function to build msg text
                    const buildMsg = (arr: string[], title: string): string | undefined => {
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
                        return '';
                    };

                    // Internal function to build notification panel
                    const buildPanel = (msg: string): void => {
                        if (MP.DEBUG) { console.log(`buildPanel( ${msg} )`); }
                        Check.elemLoad('body')
                            .then(() => {
                                document.body.innerHTML += `<div class='mp_notification'>${msg}<span>X</span></div>`;
                                const msgBox: Element = document.querySelector('.mp_notification')!;
                                const closeBtn: HTMLSpanElement = msgBox.querySelector('span')!;
                                try {
                                    if (closeBtn) {
                                        // If the close button is clicked, remove it
                                        closeBtn.addEventListener('click', () => {
                                            if (msgBox) { msgBox.remove() };
                                        }, false);
                                    }
                                } catch (err) {
                                    if (MP.DEBUG) { console.log(err); }
                                }
                            });
                    };

                    let message: string = '';

                    if (kind === 'updated') {
                        if (MP.DEBUG) { console.log('Building update message'); }
                        // Start the message
                        message = `<strong>MAM+ has been updated!</strong> You are now using v${MP.VERSION}, created on ${MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>`;
                        // Add the changelog
                        message += buildMsg(log.UPDATE_LIST, 'Changes');
                        message += buildMsg(log.BUG_LIST, 'Known Bugs');
                    } else if (kind === 'firstRun') {
                        message = '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="https://github.com/gardenshade/mam-plus/issues">Github</a>, <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a>, or <a href="/sendmessage.php?receiver=108303">through private message</a>.'
                        if (MP.DEBUG) { console.log('Building first run message'); }
                    } else {
                        if (MP.DEBUG) { console.warn(`Received msg kind: ${kind}`); }
                    }
                    buildPanel(message);

                    if (MP.DEBUG) { console.groupEnd(); }
                    resolve(true);
                    // Notifications are disabled
                } else {
                    if (MP.DEBUG) {
                        console.log('Notifications are disabled.'); console.groupEnd();
                    }
                    resolve(false);
                }
            }
        });
    }
}

// FIXME: Delete this
class Fake implements Feature {
    private _settings: CheckboxSetting = {
        scope: SettingGroup.Shoutbox,
        type: 'checkbox',
        title: 'fake',
        desc: 'This is a fake feature for Scope testing only',
    }

    get settings(): CheckboxSetting {
        return this._settings;
    }
}
