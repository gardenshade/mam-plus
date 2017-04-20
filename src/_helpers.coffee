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

    # Returns the occurrence rate of char/str/etc in any indexable array
    count: (arr,find) ->
        [count,index] = [-1,0]
        while index isnt -1
            index = arr.indexOf find,index+1
            count++
        return count
