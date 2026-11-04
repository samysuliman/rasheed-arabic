// Rasheed Arabic: "install the app" banner (Android/desktop prompt + iPhone instructions).
(function () {
  var base = (document.currentScript && document.currentScript.src) ? new URL('../../', document.currentScript.src) : new URL('./', location.href);
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register(new URL('sw.js', base).href, { scope: base.pathname }).catch(function () {}); });
  }

  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return;
  var snoozed = false;
  try { snoozed = Date.now() - (+localStorage.getItem('rasheedInstallClosed') || 0) < 864e5; } catch (e) {}

  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isMobile = isIOS || /android/i.test(ua);
  var deferred = null;

  var css = '' +
    '#rsInstall{position:fixed;inset:12px 12px auto 12px;z-index:9999;max-width:460px;margin:0 auto;background:#063f34;color:#fff;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.28);padding:12px 12px 12px 14px;display:flex;align-items:center;gap:11px;font-family:inherit;direction:rtl;animation:rsUp .35s ease}' +
    '@keyframes rsUp{from{transform:translateY(-30px);opacity:0}to{transform:none;opacity:1}}' +
    '#rsInstall img{width:46px;height:46px;border-radius:12px;flex:none;background:#fff}' +
    '#rsInstall .t{flex:1;min-width:0;line-height:1.35}' +
    '#rsInstall b{display:block;font-size:14px}' +
    '#rsInstall small{display:block;font-size:11.5px;opacity:.85;direction:ltr;text-align:right}' +
    '#rsInstall .go{flex:none;background:#d9b45a;color:#063f34;border:0;border-radius:999px;padding:9px 14px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit;line-height:1.2}' +
    '#rsInstall .go span{display:block;font-size:10.5px;font-weight:700}' +
    '#rsInstall .x{flex:none;background:transparent;border:0;color:#fff;opacity:.7;font-size:20px;cursor:pointer;padding:0 2px}' +
    '#rsIos{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}' +
    '#rsIos .box{background:#fff;color:#123;border-radius:20px 20px 0 0;padding:18px 18px 26px;max-width:480px;width:100%;direction:rtl;font-family:inherit}' +
    '#rsIos h4{margin:0 0 4px;color:#063f34;font-size:17px}#rsIos .en{display:block;direction:ltr;text-align:right;color:#667;font-size:12px}' +
    '#rsIos ol{margin:12px 0 14px;padding:0 20px 0 0;line-height:1.9;font-size:14px}' +
    '#rsIos button{width:100%;background:#063f34;color:#fff;border:0;border-radius:12px;padding:11px;font-weight:900;font-family:inherit;font-size:14px}';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function hide(remember) { var b = document.getElementById('rsInstall'); if (b) b.remove(); if (remember) try { localStorage.setItem('rasheedInstallClosed', Date.now()); } catch (e) {} }

  function iosHelp() {
    var m = el('<div id="rsIos"><div class="box"><h4>ثبّت رشيد العربية على جوالك<span class="en">Install Rasheed Arabic on your iPhone</span></h4>' +
      '<ol><li>اضغط زر المشاركة <b>⬆️</b> أسفل Safari<span class="en">Tap the Share button ⬆️ in Safari</span></li>' +
      '<li>اختر <b>«إضافة إلى الشاشة الرئيسية»</b> ➕<span class="en">Choose “Add to Home Screen” ➕</span></li>' +
      '<li>اضغط <b>«إضافة»</b> وستظهر الأيقونة على شاشتك<span class="en">Tap “Add” — the icon appears on your screen</span></li></ol>' +
      '<button type="button">فهمت · Got it</button></div></div>');
    m.addEventListener('click', function (e) { if (e.target === m || e.target.tagName === 'BUTTON') m.remove(); });
    document.body.appendChild(m);
  }

  function show() {
    if (document.getElementById('rsInstall')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = el('<div id="rsInstall" role="dialog" aria-label="تثبيت التطبيق">' +
      '<img src="' + new URL('assets/app/icon-192.png', base).href + '" alt="">' +
      '<div class="t"><b>ثبّت تطبيق رشيد العربية</b><small>Install the Rasheed Arabic app</small></div>' +
      '<button type="button" class="go">تثبيت<span>Install</span></button>' +
      '<button type="button" class="x" aria-label="إغلاق">×</button></div>');
    b.querySelector('.x').onclick = function () { hide(true); };
    b.querySelector('.go').onclick = install;
    document.body.appendChild(b);
  }

  function androidHelp() {
    var m = el('<div id="rsIos"><div class="box"><h4>ثبّت رشيد العربية على جوالك<span class="en">Install Rasheed Arabic on your phone</span></h4>' +
      '<ol><li>اضغط قائمة Chrome <b>⋮</b> أعلى الشاشة<span class="en">Tap the Chrome menu ⋮ at the top</span></li>' +
      '<li>اختر <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b><span class="en">Choose “Install app” or “Add to Home screen”</span></li>' +
      '<li>اضغط <b>«تثبيت»</b><span class="en">Tap “Install”</span></li></ol>' +
      '<button type="button">فهمت · Got it</button></div></div>');
    m.addEventListener('click', function (e) { if (e.target === m || e.target.tagName === 'BUTTON') m.remove(); });
    document.body.appendChild(m);
  }
  function install() {
    if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; hide(false); }); }
    else if (isIOS) iosHelp(); else androidHelp();
  }
  window.rasheedInstall = install;

  // Permanent "install app" link in the top bar, always available.
  function addNavLink() {
    var ref = document.querySelector('.nav-learn'); if (!ref || document.getElementById('rsNavInstall')) return;
    var a = document.createElement('a'); a.href = '#'; a.id = 'rsNavInstall'; a.className = ref.className;
    a.innerHTML = '📲 ثبّت التطبيق<span class="en">Install app</span>';
    a.addEventListener('click', function (e) { e.preventDefault(); install(); });
    ref.parentNode.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addNavLink); else addNavLink();

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (!snoozed) show(); });
  window.addEventListener('appinstalled', function () { hide(false); });
  if (isMobile && !snoozed) setTimeout(function () { if (!deferred && !document.getElementById('rsInstall')) show(); }, 3500);
})();
