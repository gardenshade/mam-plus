# An object full of helper functions
MP_HELPERS =
    # Currently unused
    timestamp : ->
        theDate = new Date()
            .toUTCString()
            .split(' ')
        return theDate[2]+' '+theDate[1]

    # Set a whole bunch of attributes at once
    setAttr : (el,attrs) ->
        el.setAttribute key,attrs[key] for key in attrs

    # Insert a node after a node
    insertAfter: (newNode,refNode) ->
        refNode.parentNode.insertBefore newNode,refNode.nextSibling
