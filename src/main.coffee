prevVer = GM_getValue 'mp_version'
pagePath = window.location.pathname

MP = ->
    # Constants
    VERSION      = '3.0'
    TIMESTAMP    = 'Apr 12th'
    UPDATE_LIST  = [
        'Completely rewrote backend for <em>n</em>th time'
    ]
    NEW_BUG_LIST = []

    # Defaults
    # Maybe move this to its own function/object?
    theme = {
        type: 'dark'
        btnBorder: '1px solid #bbaa77'
        btnColor: '#aaa'
    }

    return

do MAM_PLUS
