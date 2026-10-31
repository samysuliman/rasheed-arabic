/* رشيد العربية — أدوات مشتركة للصفحات الجديدة
   الجلسة (مع تجديد تلقائي)، الاتصال بقاعدة البيانات، التصدير PDF / Word / CSV */
(function () {
  var URL = 'https://wcyamoqmpwpribsgspjn.supabase.co';
  var KEY = 'sb_publishable_3eJET0uhZw4D4DowMK13fQ_oWK3PdIQ';
  var ADMIN_KEY = 'rasheed_arabic_admin_session_v1';
  var PORTAL_KEY = 'rasheed_arabic_portal_session_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null') || JSON.parse(localStorage.getItem(PORTAL_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function write(s) {
    try {
      if (localStorage.getItem(ADMIN_KEY)) localStorage.setItem(ADMIN_KEY, JSON.stringify(s));
      var p = JSON.parse(localStorage.getItem(PORTAL_KEY) || 'null');
      if (p) localStorage.setItem(PORTAL_KEY, JSON.stringify(Object.assign({}, p, s)));
    } catch (e) {}
  }
  function expired(s) {
    try { var p = JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return p.exp * 1000 < Date.now() + 60000; }
    catch (e) { return false; }
  }
  async function refresh(s) {
    if (!s || !s.refresh_token) return s;
    var r = await fetch(URL + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    });
    if (!r.ok) return s;
    var merged = Object.assign({}, s, await r.json());
    write(merged);
    return merged;
  }
  async function api(path, opt) {
    opt = opt || {};
    var s = read();
    if (!s || !s.access_token) throw new Error('NO_SESSION');
    if (expired(s)) s = await refresh(s);
    var headers = Object.assign({ apikey: KEY, Authorization: 'Bearer ' + s.access_token },
      opt.body ? { 'Content-Type': 'application/json' } : {}, opt.headers || {});
    var r = await fetch(URL + path, Object.assign({}, opt, { headers: headers }));
    if (r.status === 401) {
      s = await refresh(s);
      headers.Authorization = 'Bearer ' + s.access_token;
      r = await fetch(URL + path, Object.assign({}, opt, { headers: headers }));
    }
    if (!r.ok) { var t = await r.text(); throw new Error(t || ('HTTP ' + r.status)); }
    if (r.status === 204) return null;
    var txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  }
  function get(p) { return api('/rest/v1/' + p); }
  function rpc(name, args) { return api('/rest/v1/rpc/' + name, { method: 'POST', body: JSON.stringify(args || {}) }); }
  async function isAdmin() { try { return (await rpc('is_rasheed_arabic_admin')) === true; } catch (e) { return false; } }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function errorText(e) {
    var m = String((e && e.message) || e);
    if (m === 'NO_SESSION') return 'انتهت الجلسة. سجّل الدخول من الصفحة الرئيسية ثم ارجع لهذه الصفحة.';
    if (/Failed to fetch/.test(m)) return 'تعذر الاتصال بقاعدة البيانات. تأكد أن مشروع Supabase غير متوقف (Paused).';
    if (/ADMIN_ONLY|42501|permission denied/.test(m)) return 'هذا الحساب لا يملك صلاحية هذا الإجراء.';
    if (/PGRST20|does not exist|Could not find/.test(m)) return 'إعداد قاعدة البيانات لهذه الميزة غير مكتمل بعد.';
    return 'حدث خطأ: ' + m.slice(0, 180);
  }

  /* التصدير الموحد: type = pdf | word | csv */
  function exportTable(type, o) {
    var title = o.title || 'تقرير', head = o.head || [], rows = o.rows || [];
    var name = (o.filename || 'rasheed_report') + '_' + new Date().toISOString().slice(0, 10);
    if (type === 'csv') {
      var csv = '\ufeff' + [head].concat(rows).map(function (r) {
        return r.map(function (x) { return '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      return download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), name + '.csv');
    }
    var date = new Date().toLocaleDateString('ar-SA', { calendar: 'gregory', day: 'numeric', month: 'long', year: 'numeric' });
    var table = '<table><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + esc(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    var style = 'body{font-family:Tahoma,Arial,sans-serif;direction:rtl;color:#17392c;margin:24px}' +
      'h1{color:#07583f;font-size:20px;margin:0 0 4px}.meta{color:#62756d;font-size:12px;margin-bottom:14px}' +
      'table{width:100%;border-collapse:collapse;font-size:12px}th{background:#07583f;color:#fff}' +
      'th,td{border:1px solid #cfdcd5;padding:6px;text-align:right}tr:nth-child(even) td{background:#f6faf8}' +
      '.foot{margin-top:14px;color:#62756d;font-size:11px}';
    var html = '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + style + '</style></head><body>' +
      '<h1>' + esc(title) + '</h1><div class="meta">رشيد العربية · ' + date + ' · ' + rows.length + ' سجل</div>' + table +
      '<div class="foot">© رشيد العربية</div></body></html>';
    if (type === 'word') {
      var doc = html.replace('<html ', '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" ');
      return download(new Blob(['\ufeff' + doc], { type: 'application/msword' }), name + '.doc');
    }
    var w = window.open('', '_blank');
    if (!w) { alert('اسمح بالنوافذ المنبثقة لحفظ ملف PDF.'); return; }
    w.document.open(); w.document.write(html.replace('</body>', '<script>setTimeout(function(){print()},300)<\/script></body>')); w.document.close();
  }
  function download(blob, filename) {
    var a = document.createElement('a');
    a.href = URL_.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL_.revokeObjectURL(a.href); }, 2000);
  }
  var URL_ = window.URL;

  function toast(msg) {
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#17392c;color:#fff;padding:10px 16px;border-radius:12px;font:13px Tahoma,Arial,sans-serif;z-index:99';
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2400);
  }
  function logout(to) {
    localStorage.removeItem(ADMIN_KEY); localStorage.removeItem(PORTAL_KEY);
    location.href = to || 'index.html';
  }

  window.Rasheed = { URL: URL, KEY: KEY, session: read, api: api, get: get, rpc: rpc, isAdmin: isAdmin,
    esc: esc, errorText: errorText, exportTable: exportTable, toast: toast, logout: logout };
})();
