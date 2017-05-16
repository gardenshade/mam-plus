MP_STYLE =
    # THIS SHOULD EVENTUALLY BE INSERTED INTO A STYLESHEET
    # Then reference with .mp_dark and .mp_light, etc
    setStyle : ->
        siteTheme = document
            .querySelector 'head link[href*="ICGstation"]'
            .getAttribute 'href'
        if siteTheme.indexOf('dark') > 0
            @theme     = 'dark'
            @btnBorder = '1px solid #bbaa77'
            @btnColor  = '#aaa'
            @phColor   = '#8d5d5d'
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
            .mp_hide_banner #header{
                display: none;
            }
            .mp_hide_banner body{
                padding-top: 15px;
            }
            .mp_hide_home #menu .homeLink{
                display: none;
            }
            .mp_hide_browse #menu .mmTorrents li:first-of-type{
                display: none;
            }
            .mp_setTag{
                display: inline-block;
                min-width:120px;
            }
            .mp_textInput{
                padding: 5px;
            }
            .mp_textInput::placeholder{
                color: '''+@phColor+''';
            }
            #mp_submit{
                border: '''+@btnBorder+''';
                color: '''+@btnColor+''';
                background-image: '''+@btnBack+''';
                box-sizing: border-box;
                padding: 0 8px;
                display: inline-block;
                height: 25px;
                line-height: 25px;
                cursor: pointer;
            }
            #mp_submit ~ .mp_savestate{
                font-weight: bold;
                color: green;
                padding: 0 20px;
                cursor: default;
            }
            a.mp_button_clone{
                border: '''+@btnBorder+''';
                color: '''+@btnColor+''';
                background-image: '''+@btnBack+''';
                box-sizing: border-box;
                padding: 0 4px;
            }
            #mp_bookmark{
                display: inline-block;
                position: relative;
                top: 3px;
                padding-left: 20px;
            }
            .mp_cover{
                display: inline-block;
                width: 130px;
                height: 200px;
                line-height: 200px;
                background: #333;
                color: #777;
                text-align: center;
            }
            '''
        return @theme
    # Default Values
    theme     : 'light'
    btnBorder : '1px solid #d0d0d0'
    btnColor  : '#000'
    btnBack   : 'radial-gradient(at center center, rgba(136, 136, 136, 0) 0px, rgba(136, 136, 136, 0) 25%, rgba(136, 136, 136, 0) 62%, rgba(136, 136, 136, 0.65098) 100%)'
    phColor   : '#575757'
