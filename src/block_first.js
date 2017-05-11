// ==UserScript==
// @name         MAM Plus Dev
// @namespace    https://github.com/gardenshade
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
// @grant        GM_info
// ==/UserScript==

var MP = {};
// This should be user-setable eventually
var MP_DEBUG = true;

try {
