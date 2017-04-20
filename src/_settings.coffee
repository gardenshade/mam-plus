MP_SETTINGS =
    # GLOBAL SETTINGS
    global :
        pageTitle : 'Global'
        alerts :
            id   : 'mp_alerts'
            type : 'checkbox'
            desc : 'Enable the MAM+ Alert panel for update information, etc.'
        hideBanner :
            id   : 'mp_hide_banner'
            type : 'checkbox'
            desc : 'Remove the header image. (Not recommended if the below is enabled)'
        hideHome :
            id   : 'mp_hide_home'
            type : 'checkbox'
            desc : 'Remove the home button. (Not recommended if the above is enabled)'
        hideBrowse :
            id   : 'mp_hide_browse'
            type : 'checkbox'
            desc : 'Remove the Browse button, because Browse &amp; Search are the same'
        vaultLink :
            id   : 'mp_vault_link'
            type : 'checkbox'
            desc : 'Make the Vault link bypass the Vault Info page'
        shortInfo :
            id   : 'mp_short_info'
            type : 'checkbox'
            desc : 'Shorten the Vault link text'
    # BROWSE / REQUESTS SETTINGS
    browse :
        pageTitle : 'Browse &amp; Search'
        hideSnatched :
            id   : 'mp_hide_snatched'
            type : 'checkbox'
            desc : 'Enable the Hide Snatched button'
    # TORRENT SETTINGS
    torrent :
        pageTitle : 'Torrent Page'
        grBtn :
            id   : 'mp_gr_btns'
            type : 'checkbox'
            desc : 'Enable the MAM-to-Goodreads buttons'
        moveBookmark :
            id   : 'mp_move_bookmark'
            type : 'checkbox'
            desc : 'Move the bookmark icon up to the title'
        placeholderCovers :
            id   : 'mp_placeholder_covers'
            type : 'checkbox'
            desc : 'Display a placeholder cover for torrents with no picture'
    # SHOUTBOX SETTINGS
    shoutbox :
        pageTitle : 'Shoutbox'
        tabNotify :
            id   : 'mp_tab_notify'
            type : 'checkbox'
            desc : 'Show the current number of messages + keyword alerts in the browser tab'
        blockUsers :
            id   : 'mp_block_users'
            type : 'textbox'
            tag  : 'Block Users'
            desc : 'Hides messages from the listed users in the shoutbox'
            placeholder : 'ex. 1234,108303,10000'
        priorityUsers :
            id   : 'mp_priority_users'
            type : 'textbox'
            tag  : 'Emphasize Users'
            desc : 'Emphasizes messages from the listed users in the shoutbox'
            placeholder : 'ex. 6,25420,77618'
        keywords :
            id   : 'mp_shout_keywords'
            type : 'textbox'
            tag  : 'Keyword Alerts'
            desc : 'Emphasizes messages containing key words'
            placeholder : 'ex. GardenShade,sci-fi,rhombus'
    # VAULT SETTINGS
    vault :
        pageTitle : 'Mil. Vault'
        simpleVault :
            id   : 'mp_simple_vault'
            type : 'checkbox'
            desc : 'Simplify the Vault pages. (This removes everything except the donate button &amp; list of recent donations)'
        donateDefault :
            id   : 'mp_donate_default'
            type : 'checkbox'
            desc : 'Select the largest possible donation amount by default'
    # USER PAGE SETTINGS
    user :
        pageTitle : 'User Pages'
        giftDefault :
            id   : 'mp_gift_default'
            type : 'checkbox'
            desc : 'Select the largest possible gift amount by default'
