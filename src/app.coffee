MP =
    # CONSTANTS
    VERSION     : '3.0'
    PREV_VER    : GM_getValue 'mp_version'
    TIMESTAMP   : 'Apr 12th'
    UPDATE_LIST : [
        'Completely rewrote backend for <em>n</em>th time'
    ]
    BUG_LIST    : []
    # VARIABLES
    errorLog : []
    pagePath : window.location.pathname

    # THIS SHOULD BE INSERTED INTO A STYLESHEET
    # Reference with .mp_dark and .mp_light
    theme :
        type: 'dark'
        btnBorder: '1px solid #bbaa77'
        btnColor: '#aaa'

    run :  ->
        console.group "Welcome to MAM+ v#{@.VERSION}!"

# Start the script
do MP.run
