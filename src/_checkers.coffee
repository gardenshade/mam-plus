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
        # null
