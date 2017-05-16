MP_PAGE =
    global: ->
        console.group 'Applying Global settings...'

        vaultLink = document.querySelector '#millionInfo'
        dateInfo  = document.querySelector '#preNav .tP'

        # Hide the banner image, if enabled
        if GM_getValue 'mp_hide_banner'
            document.body.classList.add 'mp_hide_banner'
            console.log '[M+] Hid the banner image!'

        # Hide the home button, if enabled
        if GM_getValue 'mp_hide_home'
            document.body.classList.add 'mp_hide_home'
            console.log '[M+] Hid the home button!'

        # Hide the browse button, if enabled
        if GM_getValue 'mp_hide_browse'
            document.body.classList.add 'mp_hide_browse'
            console.log '[M+] Hid the browse button!'

        # Make the vault link go to the donation page, if enabled
        if GM_getValue 'mp_vault_link'
            vaultLink.setAttribute 'href','/millionaires/donate.php'
            console.log '[M+] Made the vault text link to the donate page!'

        # Shorten the vault link & date info
        if GM_getValue 'mp_short_info'
            # Turn the numeric portion of the vault link into a number
            newText = parseInt (vaultLink
                .textContent
                .split(':')[1]
                .split(' ')[1]
                .replace /,/g, '')
            # Convert the vault amount to millionths
            newText = (newText/1e6).toFixed 3
            # Update the vault text
            vaultLink.textContent = "Vault: #{newText} million"
            console.log '[M+] Shortened the vault number!'

        console.groupEnd()
    home: ->
        console.group 'Applying Home settings...'
        console.groupEnd()
    shoutbox: ->
        console.group 'Applying Shoutbox settings...'
        console.groupEnd()
    browse: (page) ->
        console.group "Applying (#{page}) settings..."

        do MP.processResults if page is 'browse'
        console.log 'No functions for requests' if page is 'requests'

        console.groupEnd()
    torrent: ->
        console.group 'Applying Torrent settings...'

        authors     = document.querySelectorAll '#mainBody tr:nth-child(2) td:last-of-type a'
        rawTitle    = document.querySelector '#mainBody h1'
        seriesTitle = document.querySelector '#mainBody tr:nth-child(3) td:last-of-type a'
        bookCover   = document.querySelector '#posterImage'
        torrentID   = Number MP.pagePath.split('/')[2]
        bookTitle   = MP_HELPERS.redoSpaces rawTitle.textContent

        console.log 'Extracting...',title for title in [authors,rawTitle,seriesTitle,bookCover,torrentID,bookTitle] if MP_DEBUG is on

        # Add goodreads buttons if enabled
        MP.addGoodreadsBtns authors,bookTitle,seriesTitle if GM_getValue 'mp_gr_btns'

        # Move the bookmark icon if enabled
        MP.moveBookmark rawTitle,torrentID if GM_getValue 'mp_move_bookmark'

        # Create "missing cover" cover if enabled
        if GM_getValue('mp_placeholder_covers') and not bookCover.querySelector 'img'
            MP.fakeCover bookCover,'missing'

        # Create floating list of files if enabled
        ### MP.fileList NO SETTING YET ###

        console.groupEnd()
    settings: ->
        console.group 'Applying Preference Page settings...'
        pageURL = window.location.href
        if yes in [pageURL.endsWith('preferences/index.php'),pageURL.endsWith('?view=general')]
            console.log 'On General Settings page' if MP_DEBUG is on
            do MP.insertSettings
        else
            e = "Page is #{pageURL}"
            throw e
        console.groupEnd()
    user: ->
        console.group 'Applying User Page settings...'
        console.groupEnd()
    vault: (page) ->
        console.group "Applying Vault (#{page}) settings..."
        vaultPage = document.querySelector '#mainBody'

        # Simplify the vault pages if enabled
        if GM_getValue 'mp_simple_vault'
            # clone the important parts and reset the page
            donateBtn = vaultPage.querySelector 'form'
            donateTbl = vaultPage.querySelector 'table:last-of-type'
            vaultPage.innerHTML = ''

            # add the donate button if it exists
            if donateBtn?
                newDonate = donateBtn.cloneNode true
                vaultPage.appendChild newDonate
                newDonate.classList.add 'mp_vaultClone'
            else vaultPage.innerHTML = '<h1>Come back tomorrow!</h1>'

            # add the donate table if it exists
            if donateTbl?
                newTable = donateTbl.cloneNode true
                vaultPage.appendChild newTable
                newTable.classList.add 'mp_vaultClone'
            else vaultPage.style.paddingBottom = '25px'

            console.log '[M+] Simplified the vault page!'

        # Only run these checks on the donate page
        if page is 'donate'
            # Set the donation amount by default if enabled
            if GM_getValue 'mp_donate_default'
                vaultPage.querySelector 'form option:last-of-type'
                    .selected = yes
                console.log '[M+] Overwrote the default donation amount!'
            # Set up donation reminder if enabled
            ###if GM_getValue 'mp_donate_reminder'
                timer = vaultPage.querySelector 'form input:first-of-type'
                donator = vaultPage.querySelector 'form input:last-of-type'
                try
                    donator.addEventListener 'click',( () -> GM_setValue('mp_last_donate_time',timer.value) )
                catch e
                    console.warn e if MP_DEBUG is on###

        console.groupEnd()


