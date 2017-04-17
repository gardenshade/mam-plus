MP_CHECK =
    version : ->
        getImportantVer = (val) ->
            val = val.split '.'
            "#{val[0]}.#{val[1]}"
        prevImportantVer = getImportantVer MP.PREV_VER
        importantVersion = getImportantVer MP.VERSION
        # Debug stuff
        if MP_DEBUG is yes
            importantVersion = do Math.random
            console.group 'MP_CHECK.version()'
            console.log "PREV_VER: #{MP.PREV_VER} (#{prevImportantVer})"
            console.log "VERSION: #{MP.VERSION} (#{importantVersion})"
        # Check to see if this is the first run since an update
        if prevImportantVer isnt importantVersion
            console.log 'Dif versions; making notification...' if MP_DEBUG is yes
            # this is not the first time the script has ever run
            if prevImportantVer?
                console.log "mp_alerts: #{GM_getValue('mp_alerts')}" if MP_DEBUG is yes
                # the notification was not disabled
                if GM_getValue('mp_alerts') is yes
                    MP_HELPERS.triggerNote 'update'
            # this is the first time the script has run
            else
                # enable GR buttons, etc, by default
                GM_setValue 'mp_gr_btns',true
                GM_setValue 'mp_alerts',true
                MP_HELPERS.triggerNote 'firstRun'
            # store the current version
            GM_setValue 'mp_version',MP.VERSION
            console.groupEnd() if MP_DEBUG is yes
            return
    page : (path) ->
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
