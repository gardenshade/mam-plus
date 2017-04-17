# An object full of helper functions
MP_HELPERS =
    # Currently unused
    timestamp : ->
        theDate = new Date()
            .toUTCString()
            .split(' ')
        return theDate[2]+' '+theDate[1]

    # This func creates a notification panel
    triggerNote : (type) ->
        try
            # Internal func to build message text
            buildMsg = (arr,title) ->
                if arr.length > 0 and arr[0] isnt ''
                    message += "<h4>#{title}:</h4><ul>"
                    message += "<li>#{item}</li>" for item in arr
                    message += '</ul>'
                    return
            # Internal func to display the notification panel
            showPanel = (msg) ->
                document.body.innerHTML += "<div class='mp_notification'>#{msg}<span>X</span></div>"
                msgBox = document.querySelector '.mp_notification'
                closeBtn = msgBox.querySelector 'span'
                try
                    closeBtn.addEventListener 'click',(-> do msgBox.remove), false
                    return
                catch e
                    console.warn e if MP_DEBUG is yes
                    false

            # Basic message frameworks
            message = ''
            if type is 'update'
                message += "<strong>MAM+ has been updated!</strong> You are now using v#{MP.VERSION}, published on #{MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>"
                buildMsg MP.UPDATE_LIST,'Changes'
                buildMsg MP.BUG_LIST,'New Bugs'
                return
            else if type is 'firstRun'
                message += '<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a> or <a href="/sendmessage.php?receiver=108303">through private message</a>.'
            # Show the message
            showPanel message
        catch e
            console.warn e if MP_DEBUG is yes
            false
