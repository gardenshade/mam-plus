MP =
    # CONSTANTS
    VERSION     : GM_info.script.version
    PREV_VER    : GM_getValue 'mp_version'
    TIMESTAMP   : 'Oct 19th'
    UPDATE_LIST : [
        'Hopefully squashed bug causing all download links to be "Undefined". It was like 3 words...'
    ]
    BUG_LIST    : [
    ]
    # VARIABLES
    errorLog : []
    pagePath : window.location.pathname

    # Function that starts the app
    run :  ->
        console.group "Welcome to MAM+ v#{@.VERSION}!"

        do MP_STYLE.setStyle
        console.log "Theme is #{MP_STYLE.theme}"

        do MP_CHECK.version
        MP_CHECK.page @.pagePath

        console.groupEnd()

    # Function that triggers a notification panel
    triggerNote : (type) ->
        if MP_DEBUG is on
            console.group 'MP.triggerNote()'
            console.log "Note type is #{type}"
        # Internal func to build message text
        buildMsg = (arr,title) ->
            console.log "buildMsg(#{title})" if MP_DEBUG is on
            if arr.length > 0 and arr[0] isnt ''
                message += "<h4>#{title}:</h4><ul>"
                message += "<li>#{item}</li>" for item in arr
                message += '</ul>'
                return
        # Internal func to display the notification panel
        showPanel = (msg) ->
            console.log 'showPanel()' if MP_DEBUG is on
            document.body.innerHTML += "<div class='mp_notification'>#{msg}<span>X</span></div>"
            msgBox = document.querySelector '.mp_notification'
            closeBtn = msgBox.querySelector 'span'
            try
                closeBtn.addEventListener 'click',(-> do msgBox.remove), false
            catch e
                console.warn e if MP_DEBUG is on
                false

        # Basic message frameworks
        message = ''
        if type is 'update'
            console.log 'update confirmed' if MP_DEBUG is on
            message += "<strong>MAM+ has been updated!</strong> You are now using v#{MP.VERSION}, published on #{MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>"
            buildMsg MP.UPDATE_LIST,'Changes'
            buildMsg MP.BUG_LIST,'New Bugs'
        else if type is 'firstRun'
            console.log 'firstRun confirmed' if MP_DEBUG is on
            message += '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a> or <a href="/sendmessage.php?receiver=108303">through private message</a>.'
        # Show the message
        showPanel message
        do console.groupEnd if MP_DEBUG is on

    # Function that inserts the MAM+ settings
    insertSettings : ->
        console.group 'MP.insertSettings()' if MP_DEBUG is on

        # Function for constructing the table from an object
        buildTable = (obj) ->
            # Build the first part of the table
            outp = '<tbody><tr><td class="row1" colspan="2">Here you can enable &amp; disable any feature from the <a href="/forums.php?action=viewtopic&topicid=41863&page=p376355#376355">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.</td></tr>'

            Object.keys( obj ).forEach (page) ->
                # Insert the section title
                outp += "<tr><td class='row2'>#{obj[page].pageTitle}</td><td class='row1'>"
                # Create the required input field based on the setting
                Object.keys( obj[page] ).forEach (pref) ->
                    result = obj[page][pref]
                    cases =
                        'checkbox' : -> outp += "<input type='checkbox' id='#{result.id}' value='true'>#{result.desc}<br>"
                        'textbox'  : -> outp += "<span class='mp_setTag'>#{result.tag}:</span> <input type='text' id='#{result.id}' placeholder='#{result.placeholder}' class='mp_textInput' size='25'>#{result.desc}<br>"
                        'dropdown'    : ->
                            outp += "<span class='mp_setTag'>#{result.tag}:</span> <select id='#{result.id}' class='mp_dropInput'>"
                            outp += "<option value='#{key}'>#{val}</option>" for key,val of result.options
                            outp += "</select>#{result.desc}<br>"
                    do cases[result.type] if cases[result.type]
                # Close the row
                outp += '</td></tr>'
            # Add the save button & last part of the table
            outp += '<tr><td class="row1" colspan="2"><div id="mp_submit">Save M+ Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>'
            return outp

        # Function for retrieving the settings states
        getSettings = (obj) ->
            console.group 'getSettings()' if MP_DEBUG is on
            Object.keys( obj ).forEach (page) ->
                Object.keys( obj[page] ).forEach (pref) ->
                    ppref = obj[page][pref]
                    if ppref isnt null and typeof ppref is 'object'
                        element = document.getElementById ppref.id
                        cases =
                            'checkbox' : -> element.setAttribute 'checked','checked'
                            'textbox'  : -> element.value = GM_getValue "#{ppref.id}_val"
                            'dropdown' : -> element.value = GM_getValue "#{ppref.id}"
                        do cases[ppref.type] if cases[ppref.type] and GM_getValue ppref.id
            console.endGroup if MP_DEBUG is on

        # Function for setting the settings states
        setSettings = (obj) ->
            console.group 'setSettings()' if MP_DEBUG is on
            Object.keys( obj ).forEach (page) ->
                Object.keys( obj[page] ).forEach (pref) ->
                    ppref = obj[page][pref]
                    if ppref isnt null and typeof ppref is 'object'
                        element = document.getElementById ppref.id
                        cases =
                            'checkbox' : -> GM_setValue ppref.id,on if element.checked
                            'textbox'  : ->
                                inp = element.value
                                if inp isnt ''
                                    GM_setValue ppref.id,on
                                    GM_setValue "#{ppref.id}_val",inp
                            'dropdown' :  -> GM_setValue ppref.id,element.value
                        do cases[ppref.type] if cases[ppref.type]
            console.endGroup if MP_DEBUG is on

        # Function that saves the values of the settings table
        saveSettings = (timer) ->
            console.group 'saveSettings()'
            savestate = document.querySelector '.mp_savestate'

            # Reset timer & message
            savestate.style.opacity = '0'
            window.clearTimeout timer

            console.log 'Saving...'

            for feature of do GM_listValues
                if GM_listValues()[feature] isnt 'mp_version'
                    GM_setValue GM_listValues()[feature],off

            console.log 'Known settings:',GM_listValues()

            # Loop over the features and enable as requested
            setSettings MP_SETTINGS
            console.log 'Saved!'

            # Display the confirmation message
            savestate.style.opacity = '1'
            try
                timer = window.setTimeout (-> savestate.style.opacity = '0'),2345
            catch e
                console.warn e if MP_DEBUG is on
            console.endGroup

        # Create new table elements
        settingNav   = document.querySelector '#mainBody > table'
        settingTitle = document.createElement 'h1'
        settingTable = document.createElement 'table'

        # Insert table elements after the Pref navbar
        MP_HELPERS.insertAfter settingTitle,settingNav
        MP_HELPERS.insertAfter settingTable,settingTitle
        MP_HELPERS.setAttr settingTable,{
            'class':'coltable',
            'cellspacing':'1',
            'style':'width:100%;min-width:100%;max-width:100%;'
        }

        # Insert text into the table elements
        settingTitle.innerHTML = 'MAM+ Settings'
        settingTable.innerHTML = buildTable MP_SETTINGS
        getSettings MP_SETTINGS

        ssTimer = ''
        submitBtn = document.querySelector '#mp_submit'
        try
            submitBtn.addEventListener 'click',(-> saveSettings ssTimer),false
        catch e
            console.warn e if MP_DEBUG is on

        do console.groupEnd if MP_DEBUG is on

        console.log '[M+] Added the MAM+ Settings table!'

    # Function that loops over torrent results
    processResults: ->
        console.log 'processResults()' if MP_DEBUG is on
        visible = on
        # Internal function for toggling Snatched button
        toggleSnatched = (btn,state) ->
            console.log 'toggling snatched'
            snatchList = document.querySelectorAll '#searchResults tr[id^="tdr"] td div[class^="browse"]'
            MP_HELPERS.reportCount 'Hiding',snatchList.length,'snatched torrent' if state is on
            MP_HELPERS.reportCount 'Showing',snatchList.length,'snatched torrent' if state is off
            for snatch of snatchList
                row = snatchList[snatch].parentElement.parentElement
                if state is on
                    visible = off
                    row.style.display = 'none'
                    btn.innerHTML = 'Show Snatched'
                else
                    visible = on
                    row.removeAttribute 'style'
                    btn.innerHTML = 'Hide Snatched'
                console.log row if MP_DEBUG is on

        # Internal function to create the Snatched toggle button
        createToggle = ->
            console.log 'creating toggle'
            clearNewBtn = document.querySelector '#resetNewIcon'
            toggleBtn   = document.createElement 'h1'

            clearNewBtn.parentElement.insertBefore toggleBtn,clearNewBtn
            MP_HELPERS.setAttr toggleBtn,{
                'id'   : 'mp_snatchedToggle',
                'class': 'torFormButton',
                'role' : 'button'
            }
            toggleBtn.innerHTML = 'Hide Snatched'

            try
                toggleBtn.addEventListener 'click',(-> toggleSnatched toggleBtn,visible),no
            catch e
                console.warn e if MP_DEBUG is on

        do createToggle if GM_getValue 'mp_hide_snatched'

    # Function that adds Goodreads links to each book page
    addGoodreadsBtns: (authorTitle,bookTitle,seriesTitle) ->
        bookURL   = null
        seriesURL = null
        authorURL = null
        buttons   = []
        targetRow = document.querySelector('#download').parentNode
        category  = document.querySelector('#cat').textContent

        # Internal function for returning GR-formatted authors
        smartAuth = (inp) ->
            inp = MP_HELPERS.strToArr inp
            [outp,i] = ['',0]
            while i < inp.length
                if inp[i].length < 2
                    # Don't add a space if two initials are adjacent
                    if inp[i + 1].length < 2
                    then outp += inp[i]
                    else outp += inp[i] + ' '
                else outp += inp[i] + ' '
                i++
            return outp.trim()

        # Internal function for returning a title that was split with a dash
        checkDashes = (theTitle,theAuth) ->
            console.log "checkDashes(#{theTitle}, #{theAuth}, #{theTitle.indexOf(' - ')})" if MP_DEBUG is on
            if theTitle.indexOf(' - ') isnt -1
                console.log '> Book title contains a dash' if MP_DEBUG is on
                bookSplit = theTitle.split ' - '
                # If the front of the dash matches the author, use the back
                if bookSplit[0] is theAuth
                    console.log '> String before dash is author; using string behind dash' if MP_DEBUG is on
                    bookSplit[1]
                else
                    bookSplit[0]
            else
                theTitle

        # Internal function for building Goodreads URLs
        buildURL = (type,inp) ->
            console.log "buildURL(#{type}, #{inp})" if MP_DEBUG is on
            # Only allow GR search types
            if type is 'book' then type = 'title'
            if ~['title','author','series','on'].indexOf(type)
                # Correct the series searches
                if type is 'series'
                    type = 'on'
                    inp += ', #'
                # Fix apostrophe issue and return a full URL
                return 'https://www.goodreads.com/search?q='+encodeURIComponent(inp).replace( '\'','&apos;' )+'&search_type=books&search%5Bfield%5D='+type

        # Internal functino to return a button element
        makeBtn = (desc,url) -> "<a class='mp_button_clone' href='#{url}' target='_blank'>#{desc}</a> "

        # Function for processing title content
        processTitle = (type,rawTitle,urlTar) ->
            title = ''
            desc = ''
            if type is 'book'
                desc = 'Title'
                # Check the title for brackets & shorten it
                title = MP_HELPERS.trimStr( MP_HELPERS.bracketRemover(rawTitle),50 )
                # Check the title for dash divider
                title = checkDashes( title,author )

            else if type is 'author'
                desc = 'Author'
                # Only use a few authors
                i = 0
                while i < rawTitle.length and i < 3
                    title += rawTitle[i].textContent + ' '
                    i++

                # Check author for initials
                title = smartAuth( title )
            else if type is 'series'
                desc = 'Series'
                title = MP_HELPERS.redoSpaces( rawTitle.textContent )
            urlTar = buildURL( type,title )
            buttons.splice 0,0,makeBtn desc,urlTar
            console.log "> #{type}: #{title} (#{urlTar})"
            title

        # If the torrent page is a book category...
        if category.indexOf('Ebooks') is 0 or category.indexOf('Audiobooks') is 0
            buttonRow   = targetRow.parentNode.insertRow targetRow.rowIndex
            titleCell   = buttonRow.insertCell 0
            contentCell = buttonRow.insertCell 1
            titleCell.innerHTML = 'Search Goodreads'

            series = processTitle 'series',seriesTitle,seriesURL if seriesTitle?
            author = processTitle 'author',authorTitle,authorURL if authorTitle.length isnt 0
            book   = processTitle 'book',bookTitle,bookURL if bookTitle?
            if book? and author?
                bothURL = buildURL 'on',"#{book} #{author}"
                buttons.splice 0,0,makeBtn 'Title + Author',bothURL

            contentCell.innerHTML += button for button in buttons

            titleCell.setAttribute 'class','rowhead'
            contentCell.setAttribute 'class','row1'

            console.log '[M+] Added Goodreads buttons!'
        else console.log '[M+] Category does not require Goodreads button'

    # Function that moves the bookmark button
    moveBookmark: (tar,torID) ->
        # The page is a valid book
        if torID isnt 0 and not isNaN torID
            # Choose the new icon
            document.querySelector '#mainBody > a[id*="Bookmark"]'
                .setAttribute 'class',"mp_mark_#{MP_STYLE.theme}"

    # Function that creates fake covers
    fakeCover: (cover, type) ->
        if type is 'missing'
            cover.innerHTML += '<div class="mp_cover">(no image)</div>'
            console.log '[M+] Added empty cover!'

    # Function that only shows the Torrent OR Zip download links
    simpleDownload: (showLink) ->

        if showLink is 'tor'
            theLink  = document.querySelector('#dlNormal').href
            showLink = 'Torrent'
        else if showLink is 'zip'
            theLink  = document.querySelector('#dlZip').href
            showLink = 'ZIP'

        document
            .querySelector '#download'
            .innerHTML = "<h1 class='torFormButton'><a href='#{theLink}'>#{showLink}</a></h1>"

        console.log '[M+] Simplified the download link!'

    # Function that initializes a floating list of files
    fileList: () ->
        ###document.querySelector 'body'
            .innerHTML += '<div class="mp_fileList"></div>'

        fileList = document.querySelector '.mp_fileList'###

        # Need to do this without JQ
        ###$ '.mp_fileList'
            .load '/tor/filelist.php?torrentid=3514'###

        # Style for .mp_styleList
        ###position:'fixed',
        overflow:'scroll',
        background:'black',
        height:'200px',
        top:0,
        right:0,
        transition:'all 500ms ease',
        'z-index':99980###

    # Function that processes the shoutbox
    initShoutbox: () ->
        console.group 'Initializing shoutbox...'

        sbox = document.querySelector '#sbf'

        # Internal function for retrieving shoutbox settings
        getShoutParams = (getValue,allow) ->
            console.log "Running... getShoutParams( #{getValue}, #{allow} )" if MP_DEBUG is on
            arr = []
            if GM_getValue getValue
                vals = GM_getValue "#{getValue}_val"
                    .split ','
                for val in vals
                    if allow is 'num'
                        if not isNaN Number val
                            arr.push Number val
                    else if allow is 'str'
                        arr.push val

            arr = if arr[0]? then arr else no
            console.log 'Result >',arr if MP_DEBUG is on
            return arr

        # Internal function to change the style of shouts
        changeMsg = (tar,type) ->
            console.log "Running... changeMsg( #{tar.id}, #{type} )" if MP_DEBUG is on
            cases =
                'hide'  : () ->
                    tar.style.filter  = 'blur(3px)'
                    tar.style.opacity = '0.3'
                'show'  : () ->
                    tar.style.filter  = 'blur(0)'
                    tar.style.opacity = '0.5'
                'emph'  : () ->
                    console.log GM_getValue('mp_priority_style_val') if MP_DEBUG
                    if not GM_getValue ('mp_priority_style_val')
                        tar.style.background = 'rgba(125,125,125,0.3)'
                    else tar.style.background = 'rgba('+GM_getValue('mp_priority_style_val')+')'
                'alert' : () -> tar.style.color = 'red'
            do cases[type] if cases[type]

        # Internal logic for matching user shouts against settings
        findUserShouts = (shout,procList,type) ->
            # if the setting isn't empty
            if procList isnt no
                for proc in procList
                    shoutTag = shout
                        .querySelector 'a:nth-of-type(2)'
                        .href.split '/'
                    if Number(shoutTag[shoutTag.length-1]) is proc
                        # hide messages from ignored users
                        if type is 'ignore'
                            changeMsg shout,'hide'
                            # show/hide messages on hover
                            try
                                shout.addEventListener 'mouseenter',((event) -> changeMsg event.target,'show' )
                                shout.addEventListener 'mouseleave',((event) -> changeMsg event.target,'hide' )
                            catch e
                                if MP_DEBUG is on then console.warn e else return
                        # emphasize shouts from priority users
                        else if type is 'priority'
                            changeMsg shout,'emph'

        # Internal logic for matching keywords in shouts against settings
        findKeywords = (shout,procList) ->
            # if the setting isn't empty
            if procList isnt no
                buildExpr = ''
                # select text after (user class)
                shoutTxt = shout.textContent.split ')'
                MP_HELPERS.arrToStr shoutTxt.splice 0,1
                shoutTxt += ''
                # build regex logic with all user-defined keywords
                key = 0
                while key < procList.length
                    buildExpr += '\\b'+procList[key]+'\\b'
                    buildExpr += '|' if key+1 isnt procList.length
                    key++
                # define the regex and make it case insensitive
                expr = new RegExp buildExpr,'i'
                # style the text if a word is found
                changeMsg shout,'alert' if shoutTxt.search(expr) > 0

        # Internal function for iterating through shouts
        processShouts = (Processes,callback) ->
            # select any shouts that haven't been processed yet and process them
            shouts = document.querySelectorAll '#sbf div:not(.mp_processed)'
            for shout in shouts
                # possibly redundant?
                if not shout.classList.contains 'mp_processed'
                    # add the processed class and search the shout
                    shout.classList.add 'mp_processed'
                    findUserShouts shout,Processes.ignore,'ignore'
                    findUserShouts shout,Processes.priority,'priority'
                    findKeywords   shout,Processes.keywords
            do callback if callback

        # Switch the shoutbox to top-to-bottom mode if enabled
        # sbox.classList.add 'mp_flipShout' if GM_getValue 'mp_sb_order'

        # Init shoutbox checks if at least one shoutbox setting is enabled
        if GM_getValue('mp_block_users') or GM_getValue('mp_priority_users') or GM_getValue('mp_shout_keywords')
            console.log 'Shoutbox settings exist' if MP_DEBUG is on
            # check if the shoutbox exists on the page
            if sbox
                console.log 'Page has shoutbox' if MP_DEBUG is on
                Processes = new Object
                # load information stored in user's settings
                Processes.ignore   = getShoutParams 'mp_block_users','num'
                Processes.priority = getShoutParams 'mp_priority_users','num'
                Processes.keywords = getShoutParams 'mp_shout_keywords','str'

                # wait for page to load
                MP_HELPERS.pageLoad (() ->
                    # process the initial shouts, then periodically check & process new shouts
                    processShouts Processes, () -> window.setInterval (() -> processShouts(Processes,no)),500
                ),2340

        console.groupEnd

# Start the script
do MP.run
