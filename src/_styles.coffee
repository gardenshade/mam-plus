MP_STYLE =
    # THIS SHOULD EVENTUALLY BE INSERTED INTO A STYLESHEET
    # Then reference with .mp_dark and .mp_light, etc
    setStyle : ->
        siteTheme = document
            .querySelector 'head link[href*="ICGstation"]'
            .getAttribute 'href'
        if siteTheme.indexOf('dark') > 0
            @.theme     = 'dark'
            @.btnBorder = '1px solid #bbaa77'
            @.btnColor  = '#aaa'
        GM_addStyle '''
            .mp_notification{
                position: fixed;
                padding: 20px 40px;
                width: 100%;
                bottom:0;
                left:0;
                background: #333;
                color: #bbb;
                box-shadow: 0 0 4px 0 rgba(0,0,0,0.3);
                z-index: 99998;
            }
            .mp_notification span{
                position: absolute;
                padding: 5px 10px;
                display: inline-block;
                top: -10px;
                right: 90px;
                background: #333;
                color: red;
                box-shadow: 0 0 4px 0 rgba(0,0,0,0.3);
                border-radius: 50px;
                cursor: pointer;
                z-index: 99999;
            }
            '''
        return @.theme
    # Default Values
    theme     : 'light'
    btnBorder : '1px solid #d0d0d0'
    btnColor  : '#000'
