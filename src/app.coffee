MP =
    # CONSTANTS
    VERSION     : GM_info.script.version
    PREV_VER    : GM_getValue 'mp_version'
    TIMESTAMP   : 'Apr 19th'
    UPDATE_LIST : [
        'Completely rewrote back-end for <em>n</em>th time'
        'Improved error handling'
        'Minimized all the code, so hopefully it\'ll run faster!'
    ]
    BUG_LIST    : []
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
                    do cases[result.type] if cases[result.type]
                # Close the row
                outp += '</td></tr>'
            # Add the save button & last part of the table
            outp += '<tr><td class="row1" colspan="2"><div id="mp_submit">Save M+ Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>'
            return outp

        # Function for retrieving the settings states
        getSettings = (obj) ->
            Object.keys( obj ).forEach (page) ->
                Object.keys( obj[page] ).forEach (pref) ->
                    ppref = obj[page][pref]
                    if ppref isnt null and typeof ppref is 'object'
                        element = document.getElementById ppref.id
                        cases =
                            'checkbox' : -> element.setAttribute 'checked','checked'
                            'textbox'  : -> element.value = GM_getValue "#{element}_val"
                        do cases[ppref.type] if cases[ppref.type] and GM_getValue ppref.id

        # Function for setting the settings states
        setSettings = (obj) ->
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
                        do cases[ppref.type] if cases[ppref.type]

        # CURRENTLY UNUSED
        logicLoop = (obj,func) ->
            Object.keys( obj ).forEach (page) ->
                Object.keys( obj[page] ).forEach (pref) ->
                    result = obj[page][pref]
                    func result if typeof result is 'object'

        # Function that saves the values of the settings table
        saveSettings = (timer) ->
            console.group 'saveSettings()'
            savestate = document.querySelector '.mp_savestate'

            # Reset timer & message
            savestate.style.opacity = '0'
            window.clearTimeout timer

            console.log 'Saving...'

            # For some reason I can't convert this to coffeescript that works
            `for( let item in GM_listValues() ){
                console.log( GM_listValues()[item] )
                if( GM_listValues()[item] !== 'mp_version' ){
                    GM_setValue( GM_listValues()[item],false );
                }
            }`

            console.log 'values >>',do GM_listValues

            # Loop over the features and enable as requested
            setSettings MP_SETTINGS
            console.log 'Saved!'

            # Display the confirmation message
            savestate.style.opacity = '1'
            try
                timer = window.setTimeout (-> savestate.style.opacity = '0'),2345
            catch e
                console.warn e if MP_DEBUG is on

        # Create new table elements
        settingNav   = document.querySelector '#mainBody > table'
        settingTitle = document.createElement 'h1'
        settingTable = document.createElement 'table'

        # Insert table elements after the Pref navbar
        MP_HELPERS.insertAfter settingTitle,settingNav
        MP_HELPERS.insertAfter settingTable,settingTitle
        # CURENTLY BROKEN
        ###MP_HELPERS.setAttr settingTable,{
            'class':'coltable',
            'cellspacing':'1',
            'style':'width:100%;min-width:100%;max-width:100%;'
        }###
        settingTable.setAttribute 'class','coltable'
        settingTable.setAttribute 'cellspacing','1'
        settingTable.setAttribute 'style','width:100%;min-width:100%;max-width:100%;'

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

# Start the script
do MP.run
