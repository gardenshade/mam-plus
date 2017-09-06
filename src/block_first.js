// ==UserScript==
// @name         MAM Plus
// @namespace    https://github.com/gardenshade
// @version      3.0.3
// @description  Lots of tiny fixes for MAM
// @author       GardenShade
// @include      https://myanonamouse.net/*
// @include      https://www.myanonamouse.net/*
// @updateURL    https://github.com/gardenshade/mam-plus/raw/master/build/release/MAM_Plus_Dev.user.js
// @icon         http://i.imgur.com/dX44pSv.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// ==/UserScript==

var MP = {};
// This should be user-setable eventually
var MP_DEBUG = GM_getValue('mp_debug') ? true : false;

try {
