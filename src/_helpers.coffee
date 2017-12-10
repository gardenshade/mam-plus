# An object full of helper functions
MP_HELPERS =
    # Currently unused
    ###timestamp : ->
        theDate = new Date()
            .toUTCString()
            .split(' ')
        return theDate[2]+' '+theDate[1]###

    # Set a whole bunch of attributes at once
    setAttr : (el,attrs) ->
        for key of attrs
            el.setAttribute key,attrs[key]
        return

    # Insert a node after a node
    insertAfter : (newNode,refNode) ->
        refNode.parentNode.insertBefore newNode,refNode.nextSibling

    # Returns the occurrence rate of char/str/etc in any indexable array
    count : (arr,find) ->
        [count,index] = [-1,0]
        while index isnt -1
            index = arr.indexOf find,index+1
            count++
        return count

    # Logs a message about a counted result
    reportCount : (did,num,thing) ->
        thing += 's' if num isnt 1
        console.log '>',did,num,thing

    # Purges whitespace and replaces with spaces
    redoSpaces : (inp) ->
        @arrToStr @strToArr(inp,'ws'),yes

    arrToStr : (inp,end) ->
        [i,str] = [0,'']
        while i < inp.length
            str += inp[i]
            if end and i + 1 != inp.length
                str += ' '
            i++
        return str

    strToArr : (inp,splitPoint) ->
        outp = []

        inp = if splitPoint? and splitPoint isnt 'ws'
        then inp.split splitPoint
        else inp = inp.match(/\S+/g) or []

        outp.push item for item in inp
        return outp

    trimStr : (inp,max) ->
        if inp.length > max
            inp = inp.substring 0,max+1
            inp = inp.substring 0,Math.min inp.length,inp.lastIndexOf(' ')
        return inp

    bracketRemover : (inp) ->
        console.log 'bracket remover'
        console.log inp
        return inp
            .replace(/{+.*?}+/g, '')
            .replace(/\[\[|\]\]/g, '')
            .replace(/<.*?>/g, '')
            .replace(/\(.*?\)/g, '')
            .trim()

    # Waits for the page to load before running the desired function
    pageLoad : (func,timer) ->
        timeout = no
        # set up fallback timer in case page takes too long to indicate it loaded
        fallback = setTimeout((() ->
            console.log 'Page has timed out' if MP_DEBUG is on
            timeout = yes
            do func
        ),timer)
        # wait for the page to load
        try
            document.onreadystatechange = () ->
                if document.readyState is 'completed'
                    console.log 'Page has loaded' if MP_DEBUG is on
                    # remove the fallback
                    clearTimeout fallback
                    do func
        catch e
            console.warn e if MP_DEBUG is on
