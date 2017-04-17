MP_CHECK =
    version : ->
        console.group()
        # Check to see if this is the first run since an update
        if MP.PREV_VER isnt MP.VERSION
            # this is not the first time the script has ever run (and the note is allowed)
            if MP.PREV_VER?
                # Need to implement triggernote
                ###MP.triggerNote 'update' if GM_getValue('mp_alerts')?###
            # this is the first time the script has run
            else
                # enable GR buttons, etc, by default
                GM_setValue 'mp_gr_btns',true
                GM_setValue 'mp_alerts',true
                # Need to implement triggernote
                ###MP.triggerNote 'firstRun'###
            # store the current version
            GM_setValue 'mp_version',MP.VERSION
            console.groupEnd()
            return
    page: (path) ->
        # Do site-wide fixes
        do MP_PAGE.global

        # Run functions relevant to the current page
        switch path.split('/')[1]
            when null then break
            when '' then do MP_PAGE.home; break
            when 'shoutbox' then do MP_PAGE.shoutbox; break
            when 'tor'
                if pagePath.split('/')[2].indexOf( 'browse' ) is 0
                    MP_PAGE.browse 'browse'
                if pagePath.split('/')[2].indexOf( 'request' ) is 0
                    MP_PAGE.browse 'requests'
                break
            when 't' then do MP_PAGE.torrent; break
            when 'preferences' then do MP_PAGE.settings; break
            when 'u' then do MP_PAGE.user; break
            when 'millionaires'
                if pagePath.split('/')[2].indexOf( 'pot' ) is 0
                    MP_PAGE.vault 'pot'
                if pagePath.split('/')[2].indexOf( 'donate' ) is 0
                    MP_PAGE.vault 'donate'
                break
