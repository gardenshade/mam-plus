MP_SETTINGS =
    # TEMPLATES
    # templates :
    #     pageTitle : 'Templates'
    #     checkbox :
    #         id   : 'mp_check'
    #         type : 'checkbox'
    #         desc : 'Description'
    #     dropdown :
    #         id   : 'mp_drop'
    #         type : 'dropdown'
    #         tag  : 'Simple descriptor'
    #         options:
    #             false: 'Disabled'
    #             op1: 'Option1'
    #             op2: 'Option2'
    #         desc : 'Full description'
    #     textbox :
    #         id   : 'mp_text'
    #         type : 'textbox'
    #         tag  : 'Simple descriptor'
    #         desc : 'Full description'
    #         placeholder : 'Placeholder'
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
            desc : 'Remove the header image. (<em>Not recommended if the below is enabled</em>)'
        hideHome :
            id   : 'mp_hide_home'
            type : 'checkbox'
            desc : 'Remove the home button. (<em>Not recommended if the above is enabled</em>)'
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
        plaintextSearch :
            id   : 'mp_plaintext_search'
            type : 'checkbox'
            desc : 'Insert plaintext search results at top of page'
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
            desc : 'Replace the bookmark icon with a new graphic'
        torgiftDefault :
            id   : 'mp_torgift_default'
            type : 'textbox'
            tag  : 'Default Gift Amount'
            desc : 'Autofills the Gift box with a specified number of points.<br>(<em>Or the max allowable value, whichever is lower</em>)'
            placeholder : 'ex. 5000, max'
    # SHOUTBOX SETTINGS
    shoutbox :
        pageTitle : 'Shoutbox'
        blockUsers :
            id   : 'mp_block_users'
            type : 'textbox'
            tag  : 'Block Users'
            desc : 'Hides messages from the listed users in the shoutbox'
            placeholder : 'ex. 1234, 108303, 10000'
        priorityUsers :
            id   : 'mp_priority_users'
            type : 'textbox'
            tag  : 'Emphasize Users'
            desc : 'Emphasizes messages from the listed users in the shoutbox'
            placeholder : 'ex. 6, 25420, 77618'
        priorityStyle :
            id   : 'mp_priority_style'
            type : 'textbox'
            tag  : 'Emphasis Style'
            desc : 'Change the color/opacity of the highlighting rule for emphasized users\' posts.<br>(<em>This is formatted as R,G,B,Opacity. RGB are 0-255 and Opacity is 0-1</em>)'
            placeholder : 'default: 125, 125, 125, 0.3'
    # VAULT SETTINGS
    vault :
        pageTitle : 'Mil. Vault'
        simpleVault :
            id   : 'mp_simple_vault'
            type : 'checkbox'
            desc : 'Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)'
    # USER PAGE SETTINGS
    user :
        pageTitle : 'User Pages'
        giftDefault :
            id   : 'mp_gift_default'
            type : 'checkbox'
            desc : 'Select the largest possible gift amount by default'
    # OTHER
    other :
        pageTitle : 'Other'
        debug :
            id   : 'mp_debug'
            type : 'checkbox'
            desc : 'Error log (<em>Click this checkbox to enable verbose logging to the console</em>)'
