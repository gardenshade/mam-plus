// ==UserScript==
// @name         MAM Plus Dev
// @namespace    https://greasyfork.org/en/users/36444
// @version      3.0.0
// @description  Lots of tiny fixes for MAM
// @author       GardenShade
// @include      https://myanonamouse.net/*
// @include      https://www.myanonamouse.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// ==/UserScript==
var MP_DEBUG,MP_HELPERS,e;MP_DEBUG=!0;try{MP_HELPERS={timestamp:function(){var e;return e=(new Date).toUTCString().split(" "),e[2]+" "+e[1]}}}catch(t){e=t,console.warn(e)}var MP,e;try{MP={VERSION:"3.0",PREV_VER:GM_getValue("mp_version"),TIMESTAMP:"Apr 12th",UPDATE_LIST:["Completely rewrote backend for <em>n</em>th time"],BUG_LIST:[],errorLog:[],pagePath:window.location.pathname,theme:{type:"dark",btnBorder:"1px solid #bbaa77",btnColor:"#aaa"},run:function(){return console.group("Welcome to MAM+ v"+this.VERSION+"!")}},MP.run()}catch(t){e=t,MP_DEBUG&&console.warn(e)}