MP_STYLE =
    # THIS SHOULD EVENTUALLY BE INSERTED INTO A STYLESHEET
    # Then reference with .mp_dark and .mp_light, etc
    setStyle: ->
        siteTheme = document
            .querySelector 'head link[href*="ICGstation"]'
            .getAttribute 'href'
        if siteTheme.indexOf('dark') > 0
            @.theme     = 'dark'
            @.btnBorder = '1px solid #bbaa77'
            @.btnColor  = '#aaa'
        return @.theme
    # Default Values
    theme : 'light'
    btnBorder: '1px solid #d0d0d0'
    btnColor: '#000'
