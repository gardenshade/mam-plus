MP_PAGE =
    global: ->
        console.group 'Applying Global settings...'

        vaultLink = document.querySelector '#millionInfo'
        dateInfo  = document.querySelector '#preNav .tP'

        # Hide the banner image, if enabled
        document.body.classList.add 'mp_hide_banner' if GM_getValue 'mp_hide_banner'

        # Hide the home button, if enabled
        document.body.classList.add 'mp_hide_home' if GM_getValue 'mp_hide_home'

        # Hide the browse button, if enabled
        document.body.classList.add 'mp_hide_browse' if GM_getValue 'mp_hide_browse'

        # Make the vault link go to the donation page, if enabled
        vaultLink.setAttribute 'href','/millionaires/donate.php' if GM_getValue 'mp_vault_link'

        console.groupEnd()
    home: ->
        console.group 'Applying Home settings...'
        console.groupEnd()
    shoutbox: ->
        console.group 'Applying Shoutbox settings...'
        console.groupEnd()
    browse: (page) ->
        console.group "Applying Browse (#{page}) settings..."
        console.groupEnd()
    torrent: ->
        console.group 'Applying Torrent settings...'
        console.groupEnd()
    settings: ->
        console.group 'Applying Preference Page settings...'
        console.groupEnd()
    user: ->
        console.group 'Applying User Page settings...'
        console.groupEnd()
    vault: (page) ->
        console.group "Applying Vault (#{page}) settings..."
        console.groupEnd()


