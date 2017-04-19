# An object full of helper functions
MP_HELPERS =
    # Currently unused
    timestamp : ->
        theDate = new Date()
            .toUTCString()
            .split(' ')
        return theDate[2]+' '+theDate[1]

    # Currently unused
    setAttr : (el,attrs) ->
        el.setAttribute key,attrs[key] for key in attrs
