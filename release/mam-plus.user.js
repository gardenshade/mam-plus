// ==UserScript==
// @name         mam-plus
// @namespace    https://github.com/GardenShade
// @version      4.0.0
// @description  Tweaks and features for MAM
// @author       GardenShade
// @run-at       document-start
// @include      https://myanonamouse.net/*
// @include      https://www.myanonamouse.net/*
// @connect      https://www.dropbox.com/*
// @icon         https://i.imgur.com/dX44pSv.png
// @resource     MP_CSS https://raw.githubusercontent.com/gardenshade/mam-plus/v4_ts/release/main.css
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_info
// @grant        GM_getResourceText
// ==/UserScript==
"use strict";var SettingGroup,MP,__awaiter=this&&this.__awaiter||function(t,e,s,i){return new(s||(s=Promise))(function(o,r){function n(t){try{l(i.next(t))}catch(t){r(t)}}function a(t){try{l(i.throw(t))}catch(t){r(t)}}function l(t){t.done?o(t.value):new s(function(e){e(t.value)}).then(n,a)}l((i=i.apply(t,e||[])).next())})};!function(t){t[t.Global=0]="Global",t[t["Browse & Search"]=1]="Browse & Search",t[t["Torrent Page"]=2]="Torrent Page",t[t.Shoutbox=3]="Shoutbox",t[t.Vault=4]="Vault",t[t["User Pages"]=5]="User Pages",t[t.Other=6]="Other"}(SettingGroup||(SettingGroup={}));class Util{static afTimer(){return new Promise(t=>{requestAnimationFrame(t)})}static setAttr(t,e){return new Promise(s=>{for(const s in e)t.setAttribute(s,e[s]);s()})}static objectLength(t){return Object.keys(t).length}static purgeSettings(){for(let t of GM_listValues())GM_deleteValue(t)}static reportCount(t,e,s){1!==e&&(s+="s"),MP.DEBUG&&console.log(`> ${t} ${e} ${s}`)}static startFeature(t,e,s){return __awaiter(this,void 0,void 0,function*(){function i(){return __awaiter(this,void 0,void 0,function*(){return yield Check.elemLoad(e),!0})}if(MP.settingsGlob.push(t),GM_getValue(t.title)){if(s){return!0===(yield Check.page(s))&&i()}return i()}return!1})}static trimString(t,e){return t.length>e&&(t=(t=t.substring(0,e+1)).substring(0,Math.min(t.length,t.lastIndexOf(" ")))),t}static bracketRemover(t){return t.replace(/{+.*?}+/g,"").replace(/\[\[|\]\]/g,"").replace(/<.*?>/g,"").replace(/\(.*?\)/g,"").trim()}static stringToArray(t,e){return null!=e&&"ws"!==e?t.split(e):t.match(/\S+/g)||[]}static csvToArray(t,e=","){let s=[];return t.split(e).forEach(t=>{s.push(t.trim())}),s}static arrayToString(t,e){let s="";return t.forEach((i,o)=>{s+=i,e&&o+1!==t.length&&(s+=" ")}),s}static nodeToElem(t){if(null!==t.firstChild)return t.firstChild.parentElement;{console.warn("🔥 Node-to-elem without childnode is untested");let e=t;t.appendChild(e);let s=t.firstChild.parentElement;return t.removeChild(e),s}}static caselessStringMatch(t,e){return 0===t.localeCompare(e,"en",{sensitivity:"base"})}}class Check{static elemLoad(t){return __awaiter(this,void 0,void 0,function*(){const e=document.querySelector(t);if(MP.DEBUG&&console.log(`%c Looking for ${t}: ${e}`,"background: #222; color: #555"),void 0===e)throw`${t} is undefined!`;return null===e?(yield Util.afTimer(),yield this.elemLoad(t)):e})}static elemObserver(t,e,s={childList:!0,attributes:!0}){return __awaiter(this,void 0,void 0,function*(){let i=null;if("string"==typeof t&&null===(i=document.querySelector(t)))throw new Error(`Couldn't find '${t}'`);new MutationObserver(e).observe(i,s)})}static updated(){return MP.DEBUG&&(console.group("Check.updated()"),console.log(`PREV VER = ${this.prevVer}`),console.log(`NEW VER = ${this.newVer}`)),new Promise(t=>{this.newVer!==this.prevVer?(MP.DEBUG&&console.log("Script is new or updated"),GM_setValue("mp_version",this.newVer),this.prevVer?(MP.DEBUG&&(console.log("Script has run before"),console.groupEnd()),t("updated")):(MP.DEBUG&&(console.log("Script has never run"),console.groupEnd()),GM_setValue("goodreadsBtn",!0),GM_setValue("alerts",!0),t("firstRun"))):(MP.DEBUG&&(console.log("Script not updated"),console.groupEnd()),t(!1))})}static page(t){MP.DEBUG&&console.group("Check.page()");let e=GM_getValue("mp_currentPage");return MP.DEBUG&&console.log(`Stored Page: ${e}`),new Promise(s=>{if(void 0!==e)s(t?t===e:e);else{const e=window.location.pathname,i=e.split("/")[1],o=e.split("/")[2];let r;const n={"":"home","index.php":"home",shoutbox:"shoutbox",t:"torrent",preferences:"settings",u:"user",tor:o,millionaires:"vault"};MP.DEBUG&&console.log(`Page @ ${i}\nSubpage @ ${o}`),n[i]?(r=n[i]===o?o.split(".")[0].replace(/[0-9]/g,""):n[i],MP.DEBUG&&console.log(`Currently on ${r} page`),GM_setValue("mp_currentPage",r),s(t?t===r:r)):MP.DEBUG&&console.warn(`pageStr case returns '${n[i]}'`)}MP.DEBUG&&console.groupEnd()})}}Check.newVer=GM_info.script.version,Check.prevVer=GM_getValue("mp_version");class Style{constructor(){this._theme="light",this._prevTheme=this._getPrevTheme(),void 0!==this._prevTheme?this._theme=this._prevTheme:MP.DEBUG&&console.warn("no previous theme"),this._cssData=GM_getResourceText("MP_CSS")}get theme(){return this._theme}set theme(t){this._theme=t}alignToSiteTheme(){return __awaiter(this,void 0,void 0,function*(){const t=yield this._getSiteCSS();this._theme=t.indexOf("dark")>0?"dark":"light",this._prevTheme!==this._theme&&this._setPrevTheme(),Check.elemLoad("body").then(()=>{const t=document.querySelector("body");t?t.classList.add(`mp_${this._theme}`):MP.DEBUG&&console.warn(`Body is ${t}`)})})}injectLink(){const t="mp_css";if(document.getElementById(t))MP.DEBUG&&console.warn(`an element with the id "${t}" already exists`);else{const e=document.createElement("style");e.id=t,e.innerText=void 0!==this._cssData?this._cssData:"",document.querySelector("head").appendChild(e)}}_getPrevTheme(){return GM_getValue("style_theme")}_setPrevTheme(){GM_setValue("style_theme",this._theme)}_getSiteCSS(){return new Promise(t=>{const e=document.querySelector('head link[href*="ICGstation"]').getAttribute("href");"string"==typeof e?t(e):MP.DEBUG&&console.warn(`themeUrl is not a string: ${e}`)})}}class Alerts{constructor(){this._settings={scope:SettingGroup.Other,type:"checkbox",title:"alerts",desc:"Enable the MAM+ Alert panel for update information, etc."},MP.settingsGlob.push(this._settings)}notify(t,e){return MP.DEBUG&&console.group(`Alerts.notify( ${t} )`),new Promise(s=>{if(t)if(GM_getValue("alerts")){const i=(t,e)=>{if(MP.DEBUG&&console.log(`buildMsg( ${e} )`),t.length>0&&""!==t[0]){let s=`<h4>${e}:</h4><ul>`;return t.forEach(t=>{s+=`<li>${t}</li>`},s),s+="</ul>"}return""},o=t=>{MP.DEBUG&&console.log(`buildPanel( ${t} )`),Check.elemLoad("body").then(()=>{document.body.innerHTML+=`<div class='mp_notification'>${t}<span>X</span></div>`;const e=document.querySelector(".mp_notification"),s=e.querySelector("span");try{s&&s.addEventListener("click",()=>{e&&e.remove()},!1)}catch(t){MP.DEBUG&&console.log(t)}})};let r="";"updated"===t?(MP.DEBUG&&console.log("Building update message"),r=`<strong>MAM+ has been updated!</strong> You are now using v${MP.VERSION}, created on ${MP.TIMESTAMP}. Discuss it on <a href='forums.php?action=viewtopic&topicid=41863'>the forums</a>.<hr>`,r+=i(e.UPDATE_LIST,"Changes"),r+=i(e.BUG_LIST,"Known Bugs")):"firstRun"===t?(r='<h4>Welcome to MAM+!</h4>Please head over to your <a href="/preferences/index.php">preferences</a> to enable the MAM+ settings.<br>Any bug reports, feature requests, etc. can be made on <a href="https://github.com/gardenshade/mam-plus/issues">Github</a>, <a href="/forums.php?action=viewtopic&topicid=41863">the forums</a>, or <a href="/sendmessage.php?receiver=108303">through private message</a>.',MP.DEBUG&&console.log("Building first run message")):MP.DEBUG&&console.warn(`Received msg kind: ${t}`),o(r),MP.DEBUG&&console.groupEnd(),s(!0)}else MP.DEBUG&&(console.log("Notifications are disabled."),console.groupEnd()),s(!1)})}get settings(){return this._settings}}class Debug{constructor(){this._settings={scope:SettingGroup.Other,type:"checkbox",title:"debug",desc:"Error log (<em>Click this checkbox to enable verbose logging to the console</em>)"},MP.settingsGlob.push(this._settings)}get settings(){return this._settings}}class HideHome{constructor(){this._settings={scope:SettingGroup.Global,type:"dropdown",title:"hideHome",tag:"Remove banner/home",options:{default:"Do not remove either",hideBanner:"Hide the banner",hideHome:"Hide the home button"},desc:"Remove the header image or Home button, because both link to the homepage"},this._tar="#mainmenu",Util.startFeature(this._settings,this._tar).then(t=>{t&&this._init()})}_init(){const t=GM_getValue(this._settings.title);"hideHome"===t?(document.body.classList.add("mp_hide_home"),console.log("[M+] Hid the home button!")):"hideBanner"===t&&(document.body.classList.add("mp_hide_banner"),console.log("[M+] Hid the banner!"))}get settings(){return this._settings}}class HideBrowse{constructor(){this._settings={scope:SettingGroup.Global,type:"checkbox",title:"hideBrowse",desc:"Remove the Browse button, because Browse &amp; Search are practically the same"},this._tar="#mainmenu",Util.startFeature(this._settings,this._tar).then(t=>{t&&this._init()})}_init(){document.body.classList.add("mp_hide_browse"),console.log("[M+] Hid the browse button!")}get settings(){return this._settings}}class VaultLink{constructor(){this._settings={scope:SettingGroup.Global,type:"checkbox",title:"vaultLink",desc:"Make the Vault link bypass the Vault Info page"},this._tar="#millionInfo",Util.startFeature(this._settings,this._tar).then(t=>{t&&this._init()})}_init(){document.querySelector(this._tar).setAttribute("href","/millionaires/donate.php"),console.log("[M+] Made the vault text link to the donate page!")}get settings(){return this._settings}}class MiniVaultInfo{constructor(){this._settings={scope:SettingGroup.Global,type:"checkbox",title:"miniVaultInfo",desc:"Shorten the Vault link & ratio text"},this._tar="#millionInfo",Util.startFeature(this._settings,this._tar).then(t=>{t&&this._init()})}_init(){const t=document.querySelector(this._tar),e=document.querySelector("#tmR");e.innerHTML=`${parseFloat(e.innerText).toFixed(2)} <img src="/pic/updownBig.png" alt="ratio">`;let s=parseInt(t.textContent.split(":")[1].split(" ")[1].replace(/,/g,""));s=Number((s/1e6).toFixed(3)),t.textContent=`Vault: ${s} million`,console.log("[M+] Shortened the vault & ratio numbers!")}get settings(){return this._settings}}class Shared{constructor(){this.fillGiftBox=((t,e)=>(MP.DEBUG&&console.log(`Shared.fillGiftBox( ${t}, ${e} )`),new Promise(s=>{Check.elemLoad(t).then(()=>{const i=document.querySelector(t);if(i){const t=parseInt(GM_getValue(`${e}_val`));let o=parseInt(i.getAttribute("max"));NaN!==t&&t<=o&&(o=t),i.value=o.toFixed(0),s(o)}else s(void 0)})}))),this.getSearchList=(()=>(MP.DEBUG&&console.log("Shared.getSearchList( )"),new Promise((t,e)=>__awaiter(this,void 0,void 0,function*(){yield Check.elemLoad('#ssr tr[id ^= "tdr"] td');const s=document.querySelectorAll('#ssr tr[id ^= "tdr"]');null===s||null==s?e(`snatchList is ${s}`):t(s)}))))}createButton(t,e,s="h1",i,o="afterend",r="mp_btn"){return new Promise((n,a)=>{const l=document.querySelector(i),c=document.createElement(s);null===l&&a(`${i} is null!`),l.insertAdjacentElement(o,c),Util.setAttr(c,{id:`mp_${t}`,class:r,role:"button"}),c.innerHTML=e,n(c)})}}class TorGiftDefault{constructor(){this._settings={scope:SettingGroup["Torrent Page"],type:"textbox",title:"torGiftDefault",tag:"Default Gift",placeholder:"ex. 5000, max",desc:"Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)"},this._tar="#thanksArea input[name=points]",Util.startFeature(this._settings,this._tar,"torrent").then(t=>{t&&this._init()})}_init(){(new Shared).fillGiftBox(this._tar,this._settings.title).then(t=>console.log(`[M+] Set the default gift amount to ${t}`))}get settings(){return this._settings}}class GoodreadsButton{constructor(){this._settings={scope:SettingGroup["Torrent Page"],type:"checkbox",title:"goodreadsButton",desc:"Enable the MAM-to-Goodreads buttons"},this._tar="#submitInfo",Util.startFeature(this._settings,this._tar,"torrent").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){console.log("[M+] Adding the MAM-to-Goodreads buttons...");let t,e,s=document.querySelectorAll("#torDetMainCon .torAuthors a"),i=document.querySelector("#torDetMainCon .TorrentTitle"),o=document.querySelectorAll("#Series a"),r=document.querySelector(this._tar);if(null===r||null===r.parentElement)throw new Error(`Goodreads Btn: empty node or parent node @ ${this._tar}`);r.parentElement.insertAdjacentHTML("afterend",'<div class="torDetRow"><div class="torDetLeft">Search Goodreads</div><div class="torDetRight mp_grRow"><span class="flex"></span></div></div>'),yield Promise.all([t=this._extractData("series",o),e=this._extractData("author",s)]),MP.DEBUG&&console.log("Checking for Goodreads Row, this should only take a sec..."),yield Check.elemLoad(".mp_grRow .flex");let n=document.querySelector(".mp_grRow .flex");if(null===n)throw new Error("Button row cannot be targeted!");t.then(t=>{if(""!==t.extracted){let e=this._buildGrSearchURL("series",t.extracted);this._injectButton(n,e,t.desc,4)}}),yield e.then(t=>{if(""!==t.extracted){let e=this._buildGrSearchURL("author",t.extracted);this._injectButton(n,e,t.desc,3)}else MP.DEBUG&&console.warn("No author data detected!");return{auth:t,book:this._extractData("book",i,t.extracted)}}).then(t=>__awaiter(this,void 0,void 0,function*(){let e=t.auth,s=yield t.book,i=this._buildGrSearchURL("book",s.extracted);if(yield this._injectButton(n,i,s.desc,2),""!==e.extracted&&""!==s.extracted){let t=this._buildGrSearchURL("on",`${s.extracted} ${e.extracted}`);this._injectButton(n,t,"Title + Author",1)}else MP.DEBUG&&console.log(`Book+Author failed.\nBook: ${s.extracted}\nAuthor: ${e.extracted}`)})),console.log("[M+] Added the MAM-to-Goodreads buttons!")})}_extractData(t,e,s){return void 0===s&&(s=""),new Promise(i=>{if(null===e)throw new Error(`${t} data is null`);{let o="",r="",n={author:()=>{r="Author";let t=e,s=t.length,i="";for(let e=0;e<s&&e<3;e++)i+=`${t[e].innerText} `;o=this._smartAuth(i)},book:()=>{o=e.innerText,r="Title",o=Util.trimString(Util.bracketRemover(o),50),o=this._checkDashes(o,s)},series:()=>{r="Series",e.forEach(t=>{o+=`${t.innerText} `})}};n[t]&&n[t](),i({extracted:o,desc:r})}})}_checkDashes(t,e){if(MP.DEBUG&&console.log(`GoodreadsButton._checkDashes( ${t}, ${e} ): Count ${t.indexOf(" - ")}`),-1!==t.indexOf(" - ")){MP.DEBUG&&console.log("> Book title contains a dash");let s=t.split(" - ");return s[0]===e?(MP.DEBUG&&console.log("> String before dash is author; using string behind dash"),s[1]):s[0]}return t}_smartAuth(t){let e="",s=Util.stringToArray(t);return s.forEach((t,i)=>{if(t.length<2){let o=s[i+1].length;e+=o<2?t:`${t} `}else e+=`${t} `}),e.trim()}_buildGrSearchURL(t,e){MP.DEBUG&&console.log(`GoodreadsButton._buildURL( ${t}, ${e} )`);let s=t,i={book:()=>{s="title"},series:()=>{s="on",e+=", #"}};return i[t]&&i[t](),`http://www.dereferer.org/?https://www.goodreads.com/search?q=${encodeURIComponent(e).replace("'","&apos;")}&search_type=books&search%5Bfield%5D=${s}`}_injectButton(t,e,s,i){let o=document.createElement("a");o.classList.add("mp_button_clone"),o.setAttribute("href",e),o.setAttribute("target","_blank"),o.innerText=s,o.style.order=`${i}`,t.insertBefore(o,t.firstChild)}get settings(){return this._settings}}class PriorityUsers{constructor(){this._settings={scope:SettingGroup.Shoutbox,type:"textbox",title:"priorityUsers",tag:"Emphasize Users",placeholder:"ex. system, 25420, 77618",desc:"Emphasizes messages from the listed users in the shoutbox. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)"},this._tar="#sbf",this._priorityUsers=[],this._userType="priority",Util.startFeature(this._settings,this._tar,"shoutbox").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){let t=GM_getValue(`${this.settings.title}_val`);if(void 0===t)throw new Error("Userlist is not defined!");this._priorityUsers=yield Util.csvToArray(t),ProcessShouts.watchShoutbox(this._tar,this._priorityUsers,this._userType),console.log("[M+] Highlighting users in the shoutbox...")})}get settings(){return this._settings}}class PriorityStyle{constructor(){this._settings={scope:SettingGroup.Shoutbox,type:"textbox",title:"priorityStyle",tag:"Emphasis Style",placeholder:"default: 0, 0%, 50%, 0.3",desc:"Change the color/opacity of the highlighting rule for emphasized users' posts. (<em>This is formatted as Hue,Saturation,Lightness,Opacity. H is 0-360, SL are 0-100%, and O is 0-1</em>)"},this._tar="#sbf",Util.startFeature(this._settings,this._tar,"shoutbox").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){console.log("[M+] Setting custom highlight for priority users...")})}get settings(){return this._settings}}class MutedUsers{constructor(){this._settings={scope:SettingGroup.Shoutbox,type:"textbox",title:"mutedUsers",tag:"Mute users",placeholder:"ex. 1234, gardenshade",desc:"Obscures messages from the listed users in the shoutbox until hovered. (<em>This accepts user IDs and usernames. It is not case sensitive.</em>)"},this._tar="#sbf",this._mutedUsers=[],this._userType="mute",Util.startFeature(this._settings,this._tar,"shoutbox").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){let t=GM_getValue(`${this.settings.title}_val`);if(void 0===t)throw new Error("Userlist is not defined!");this._mutedUsers=yield Util.csvToArray(t),ProcessShouts.watchShoutbox(this._tar,this._mutedUsers,this._userType),console.log("[M+] Obscuring muted users...")})}get settings(){return this._settings}}class ProcessShouts{static watchShoutbox(t,e,s){Check.elemObserver(t,t=>{t.forEach(t=>{t.addedNodes.forEach(t=>{if(void 0!==e&&e.length>0){if(void 0===s)throw new Error("Usertype must be defined if filtering names!");let i=this.extractFromShout(t,'a[href^="/u/"]',"href"),o=this.extractFromShout(t,"a > span","text");e.forEach(e=>{(`/u/${e}`===i||Util.caselessStringMatch(e,o))&&this.styleShout(t,s)})}})})},{childList:!0})}static extractFromShout(t,e,s){if(null!==t){let i=Util.nodeToElem(t).querySelector(e);if(null!==i){let t;if(null!==(t="text"!==s?i.getAttribute(s):i.textContent))return t;throw new Error("Could not extract shout! Attribute was null")}throw new Error("Could not extract shout! Element was null")}throw new Error("Could not extract shout! Node was null")}static styleShout(t,e){let s=Util.nodeToElem(t);if("priority"===e){let t=GM_getValue("priorityStyle_val");s.style.background=t?`hsla(${t})`:"hsla(0,0%,50%,0.3)"}else"mute"===e&&s.classList.add("mp_muted")}}class ToggleSnatched{constructor(){this._settings={scope:SettingGroup["Browse & Search"],type:"checkbox",title:"toggleSnatched",desc:"Add a button to hide/show results that you've snatched"},this._tar="#ssr",this._visible=GM_getValue(`${this._settings.title}State`),Util.startFeature(this._settings,this._tar,"browse").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){let t,e,s,i=new Shared;GM_getValue("stickySnatchedToggle")||this._setVisState(void 0),yield Promise.all([t=i.createButton("snatchedToggle","Hide Snatched","h1","#resetNewIcon","beforebegin","torFormButton"),e=i.getSearchList()]),this._setVisState(this._visible),t.then(t=>{t.addEventListener("click",()=>{"true"===this._visible?this._setVisState("false"):this._setVisState("true"),this._filterResults(s,'td div[class^="browse"]')},!1)}).catch(t=>{throw new Error(t)}),e.then(t=>__awaiter(this,void 0,void 0,function*(){s=t,this._searchList=t,yield this._filterResults(s,'td div[class^="browse"]'),console.log("[M+] Added the Toggle Snatched button!")}))})}_filterResults(t,e){t.forEach(t=>{const s=document.querySelector("#mp_snatchedToggle");null!==t.querySelector(e)&&("false"===this._visible?(s.innerHTML="Show Snatched",t.style.display="none"):(s.innerHTML="Hide Snatched",t.style.display="table-row"))})}_setVisState(t){MP.DEBUG&&console.log("vis state:",this._visible,"\nval:",t),void 0===t&&(t="true"),GM_setValue("toggleSnatchedState",t),this._visible=t}get settings(){return this._settings}get searchList(){if(void 0===this._searchList)throw new Error("searchlist is undefined");return this._searchList}get visible(){return this._visible}set visible(t){this._setVisState(t)}}class StickySnatchedToggle{constructor(){this._settings={scope:SettingGroup["Browse & Search"],type:"checkbox",title:"stickySnatchedToggle",desc:"Make toggle state persist between page loads"},this._tar="#ssr",Util.startFeature(this._settings,this._tar,"browse").then(t=>{t&&this._init()})}_init(){console.log("[M+] Remembered snatch visibility state!")}get settings(){return this._settings}}class PlaintextSearch{constructor(){this._settings={scope:SettingGroup["Browse & Search"],type:"checkbox",title:"plaintextSearch",desc:"Insert plaintext search results at top of page"},this._tar="#ssr h1",this._isOpen=GM_getValue(`${this._settings.title}State`),Util.startFeature(this._settings,this._tar,"browse").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){let t,e,s,i=new Shared,o="";yield Promise.all([t=i.createButton("plainToggle","Show Plaintext","div","#ssr > h1","afterend","mp_toggle mp_plainBtn"),s=i.getSearchList()]),s.then(t=>{t.forEach(e=>{let s=e.querySelector(".title"),i="",r="",n="",a="",l=e.querySelectorAll(".series"),c=e.querySelectorAll(".author"),h=e.querySelectorAll(".narrator");if(null===s)throw new Error(`Result title should not be null @ ${t}`);i=s.textContent,null!==l&&l.length>0&&(l.forEach(t=>{r+=`${t.textContent} / `}),r=`(${r=r.substring(0,r.length-3)})`),null!==c&&c.length>0&&(n="BY ",c.forEach(t=>{n+=`${t.textContent} AND `}),n=n.substring(0,n.length-5)),null!==h&&h.length>0&&(a="FT ",h.forEach(t=>{a+=`${t.textContent} AND `}),a=a.substring(0,a.length-5)),o+=`${i} ${r} ${n} ${a}\n`})}),(e=i.createButton("plainCopy","Copy Plaintext","div","#mp_plainToggle","afterend","mp_copy mp_plainBtn")).then(t=>__awaiter(this,void 0,void 0,function*(){t.insertAdjacentHTML("afterend",`<br><textarea class='mp_plaintextSearch' style='display: none'>${o}</textarea>`),t.addEventListener("click",t=>{let e=navigator;if(void 0===e)throw new Error("browser doesn't support 'navigator'?");e.clipboard.writeText(o),console.log("[M+] Copied plaintext results to your clipboard!")})})),this._setOpenState(this._isOpen),t.then(t=>{t.addEventListener("click",()=>{const e=document.querySelector(".mp_plaintextSearch");if(null===e)throw new Error("textbox doesn't exist!");"false"===this._isOpen?(this._setOpenState("true"),e.style.display="block",t.innerText="Hide Plaintext"):(this._setOpenState("false"),e.style.display="none",t.innerText="Show Plaintext")},!1)}).catch(t=>{throw new Error(t)}),console.log("[M+] Inserted plaintext search results!")})}_setOpenState(t){MP.DEBUG&&console.log("PT open state:",this._isOpen,"\nPT val:",t),void 0===t&&(t="false"),GM_setValue("toggleSnatchedState",t),this._isOpen=t}get settings(){return this._settings}get isOpen(){return this._isOpen}set isOpen(t){this._setOpenState(t)}}class SimpleVault{constructor(){this._settings={scope:SettingGroup.Vault,type:"checkbox",title:"simpleVault",desc:"Simplify the Vault pages. (<em>This removes everything except the donate button &amp; list of recent donations</em>)"},this._tar="#mainBody",Util.startFeature(this._settings,this._tar,"vault").then(t=>{t&&this._init()})}_init(){return __awaiter(this,void 0,void 0,function*(){const t=GM_getValue("mp_currentPage"),e=document.querySelector(this._tar);console.group(`Applying Vault (${t}) settings...`);const s=e.querySelector("form"),i=e.querySelector("table:last-of-type");if(e.innerHTML="",null!=s){const t=s.cloneNode(!0);e.appendChild(t),t.classList.add("mp_vaultClone")}else e.innerHTML="<h1>Come back tomorrow!</h1>";if(null!=i){const t=i.cloneNode(!0);e.appendChild(t),t.classList.add("mp_vaultClone")}else e.style.paddingBottom="25px";console.log("[M+] Simplified the vault page!")})}get settings(){return this._settings}}class UserGiftDefault{constructor(){this._settings={scope:SettingGroup["User Pages"],type:"textbox",title:"userGiftDefault",tag:"Default Gift",placeholder:"ex. 1000, max",desc:"Autofills the Gift box with a specified number of points. (<em>Or the max allowable value, whichever is lower</em>)"},this._tar="#bonusgift",Util.startFeature(this._settings,this._tar,"user").then(t=>{t&&this._init()})}_init(){(new Shared).fillGiftBox(this._tar,this._settings.title).then(t=>console.log(`[M+] Set the default gift amount to ${t}`))}get settings(){return this._settings}}class InitFeatures{constructor(){new HideHome,new HideBrowse,new VaultLink,new MiniVaultInfo,new ToggleSnatched,new StickySnatchedToggle,new PlaintextSearch,new GoodreadsButton,new TorGiftDefault,new PriorityUsers,new PriorityStyle,new MutedUsers,new SimpleVault,new UserGiftDefault}}class Settings{static _getScopes(t){return MP.DEBUG&&console.log("_getScopes(",t,")"),new Promise(e=>{let s={};for(let e of t){let t=Number(e.scope);s[t]?s[t].push(e):s[t]=[e]}e(s)})}static _buildTable(t){return MP.DEBUG&&console.log("_buildTable(",t,")"),new Promise(e=>{let s='<tbody><tr><td class="row1" colspan="2"><br>Here you can enable &amp; disable any feature from the <a href="/forums.php?action=viewtopic&topicid=41863&page=p376355#376355">MAM+ userscript</a>! However, these settings are <strong>NOT</strong> stored on MAM; they are stored within the Tampermonkey/Greasemonkey extension in your browser, and must be customized on each of your browsers/devices separately.<br><br></td></tr>';Object.keys(t).forEach(e=>{let i=Number(e);s+=`<tr><td class='row2'>${SettingGroup[i]}</td><td class='row1'>`,Object.keys(t[i]).forEach(e=>{let o=Number(e),r=t[i][o];const n={checkbox:()=>{s+=`<input type='checkbox' id='${r.title}' value='true'>${r.desc}<br>`},textbox:()=>{s+=`<span class='mp_setTag'>${r.tag}:</span> <input type='text' id='${r.title}' placeholder='${r.placeholder}' class='mp_textInput' size='25'>${r.desc}<br>`},dropdown:()=>{s+=`<span class='mp_setTag'>${r.tag}:</span> <select id='${r.title}' class='mp_dropInput'>`,r.options&&Object.keys(r.options).forEach(t=>{s+=`<option value='${t}'>${r.options[t]}</option>`}),s+=`</select>${r.desc}<br>`}};r.type&&n[r.type]()}),s+="</td></tr>"}),e(s+='<tr><td class="row1" colspan="2"><div id="mp_submit">Save M+ Settings</div><span class="mp_savestate" style="opacity:0">Saved!</span></td></tr></tbody>')})}static _getSettings(t){let e=GM_listValues();MP.DEBUG&&console.log("_getSettings(",t,")\nStored GM keys:",e),Object.keys(t).forEach(e=>{Object.keys(t[Number(e)]).forEach(s=>{let i=t[Number(e)][Number(s)];if(MP.DEBUG&&console.log("Pref:",i.title,"| Set:",GM_getValue(`${i.title}`),"| Value:",GM_getValue(`${i.title}_val`)),null!==i&&"object"==typeof i){let t=document.getElementById(i.title);const e={checkbox:()=>{t.setAttribute("checked","checked")},textbox:()=>{t.value=GM_getValue(`${i.title}_val`)},dropdown:()=>{t.value=GM_getValue(i.title)}};e[i.type]&&GM_getValue(i.title)&&e[i.type]()}})})}static _setSettings(t){MP.DEBUG&&console.log("_setSettings(",t,")"),Object.keys(t).forEach(e=>{Object.keys(t[Number(e)]).forEach(s=>{let i=t[Number(e)][Number(s)];if(null!==i&&"object"==typeof i){let t=document.getElementById(i.title);const e={checkbox:()=>{t.checked&&GM_setValue(i.title,!0)},textbox:()=>{const e=t.value;""!==e&&(GM_setValue(i.title,!0),GM_setValue(`${i.title}_val`,e))},dropdown:()=>{GM_setValue(i.title,t.value)}};e[i.type]&&e[i.type]()}})}),console.log("[M+] Saved!")}static _saveSettings(t,e){MP.DEBUG&&console.group("_saveSettings()");const s=document.querySelector("span.mp_savestate"),i=GM_listValues();s.style.opacity="0",window.clearTimeout(t),console.log("[M+] Saving...");for(let t in i)"function"!=typeof i[t]&&(["mp_version","style_theme"].includes(i[t])||GM_setValue(i[t],!1));this._setSettings(e),s.style.opacity="1";try{t=window.setTimeout(()=>{s.style.opacity="0"},2345)}catch(t){MP.DEBUG&&console.warn(t)}MP.DEBUG&&console.groupEnd()}static init(t,e){return __awaiter(this,void 0,void 0,function*(){!0===t&&(MP.DEBUG&&console.group("new Settings()"),yield Check.elemLoad("#mainBody > table").then(t=>{MP.DEBUG&&console.log("[M+] Starting to build Settings table...");const s=document.querySelector("#mainBody > table"),i=document.createElement("h1"),o=document.createElement("table");let r;s.insertAdjacentElement("afterend",i),i.insertAdjacentElement("afterend",o),Util.setAttr(o,{class:"coltable",cellspacing:"1",style:"width:100%;min-width:100%;max-width:100%;"}),i.innerHTML="MAM+ Settings",this._getScopes(e).then(t=>(r=t,this._buildTable(t))).then(t=>(o.innerHTML=t,console.log("[M+] Added the MAM+ Settings table!"),r)).then(t=>(this._getSettings(t),t)).then(t=>{const e=document.querySelector("#mp_submit");try{e.addEventListener("click",()=>{this._saveSettings(void 0,t)},!1)}catch(t){MP.DEBUG&&console.warn(t)}MP.DEBUG&&console.groupEnd()})}))})}}!function(t){t.DEBUG=!!GM_getValue("debug"),t.CHANGELOG={UPDATE_LIST:["CODE: Moved from Coffeescript to Typescript to allow for better practices and easier contribution. This likely introduced bugs.","CODE: Script starts before the page loads and uses a CSS sheet to hopefully prevent flashing content. This likely introduced bugs. ","CODE: Made features modular. This hopefully speeds up development","FIX: Home page features were not running if navigated to via the Home button","FIX: Default User Gift is now a textbox just like the Default Torrent Gift","ENHANCE: Toggle Snatched state can now be remembered","ENHANCE: Priority Users can now be matched via username <em>and</em> ID","CHANGE: Priority User Styling setting uses HSL instead of RGB"],BUG_LIST:["M: Browse page features only work on first page","S: Currently, each function runs its own query to see what page is active; this value should be stored and reused for efficiency","S: Plaintext Results textbox causes slight horizontal scrollbar when open"]},t.TIMESTAMP="Jun 17",t.VERSION=Check.newVer,t.PREV_VER=Check.prevVer,t.errorLog=[],t.pagePath=window.location.pathname,t.mpCss=new Style,t.settingsGlob=[],t.run=(()=>__awaiter(this,void 0,void 0,function*(){console.group(`Welcome to MAM+ v${t.VERSION}!!!`),GM_deleteValue("mp_currentPage"),Check.page(),document.cookie="mp_enabled=1;domain=myanonamouse.net;path=/";const e=new Alerts;new Debug,Check.updated().then(s=>{s&&e.notify(s,t.CHANGELOG)}),new InitFeatures,Check.page("settings").then(e=>{!0===e&&Settings.init(e,t.settingsGlob)}),Check.elemLoad('head link[href*="ICGstation"]').then(()=>{t.mpCss.injectLink(),t.mpCss.alignToSiteTheme()}),console.groupEnd()}))}(MP||(MP={})),MP.run();