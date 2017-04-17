MP =
    # CONSTANTS
    VERSION     : '3.0'
    PREV_VER    : GM_getValue 'mp_version'
    TIMESTAMP   : 'Apr 17th'
    UPDATE_LIST : [
        'Completely rewrote backend for <em>n</em>th time'
        'Improved error handling'
    ]
    BUG_LIST    : []
    # VARIABLES
    errorLog : []
    pagePath : window.location.pathname

    run :  ->
        console.group "Welcome to MAM+ v#{@.VERSION}!"

        do MP_STYLE.setStyle
        console.log "Theme is #{MP_STYLE.theme}"

        do MP_CHECK.version
        do MP_CHECK.page @.pagePath

# Start the script
do MP.run
