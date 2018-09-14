// ==UserScript==
// @name         mam-plus
// @namespace    https://github.com/GardenShade
// @version      4.0.0
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://myanonamouse.net/*
// @include      https://www.myanonamouse.net/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS MAM_Plus.css
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_getResourceURL
// ==/UserScript==
"use strict";var MP,__awaiter=this&&this.__awaiter||function(e,t,r,n){return new(r||(r=Promise))(function(i,o){function a(e){try{h(n.next(e))}catch(e){o(e)}}function s(e){try{h(n.throw(e))}catch(e){o(e)}}function h(e){e.done?i(e.value):new r(function(t){t(e.value)}).then(a,s)}h((n=n.apply(e,t||[])).next())})};class MP_Util{static afTimer(){return new Promise(e=>{requestAnimationFrame(e)})}}class MP_Check{static elemLoad(e){return null===document.querySelector(e)?MP_Util.afTimer().then(()=>{this.elemLoad(e)}):Promise.resolve(document.querySelector(e))}}class MP_Style{constructor(){this._theme={name:"light",btnBorder:"1px solid #d0d0d0",btnColor:"#000",placeholderColor:"#575757",btnBack:"radial-gradient(ellipse at center,rgba(136,136,136,0) 0,rgba(136,136,136,0) 25%,rgba(136,136,136,0) 62%,rgba(136,136,136,0.65) 100%)"},this._prevTheme=JSON.parse(this._getPrevTheme()),null!==this._prevTheme?this._theme=this._prevTheme:MP_Check.elemLoad('head link[href*="ICGstation"]').then(()=>{GM_setValue("mp-style-theme",JSON.stringify(this._theme))})}_getPrevTheme(){return GM_getValue("mp-style_theme")}_getSiteTheme(){return new Promise(e=>{let t=document.querySelector('head link[href*="ICGstation"]').getAttribute("href");"string"===t&&e(t)})}_alignToSiteTheme(){return __awaiter(this,void 0,void 0,function*(){(yield this._getSiteTheme()).indexOf("dark")>0&&(this._theme.name="dark",this._theme.btnBorder="1px solid #bbaa77",this._theme.btnColor="#aaa",this._theme.placeholderColor="#8d5d5d",this._theme.btnBack="radial-gradient(ellipse at center,rgba(136,136,136,0) 0,rgba(136,136,136,0) 25%,rgba(136,136,136,0) 62%,rgba(136,136,136,0.65) 100%)")})}get theme(){return this._theme}}!function(e){e.CHANGELOG={UPDATE_LIST:["CODE: Moved from Coffeescript to Typescript to allow for better practices and easier contribution"],BUG_LIST:[]},e.TIMESTAMP="Sep 14",e.VERSION=GM_info.script.version,e.PREV_VER=GM_getValue("mp_version"),e.errorLog=[],e.pagePath=window.location.pathname,e.mpCss=new MP_Style,e.run=(()=>{console.group(`Welcome to MAM+ v${e.VERSION}!`),document.cookie="mp_enabled=1;domain=myanonamouse.net;path=/",GM_addStyle(GM_getResourceText("MP_CSS")),window.addEventListener("load",()=>{}),console.groupEnd()})}(MP||(MP={})),MP.run();