/* رشيد العربية — حماية نماذج الحصر
   الاستخدام: <script src="assets/js/census-guard.js" data-form="weak"></script>
   - إذا كان الحصر موقوفًا أو انتهى موعده: يُخفى النموذج وتظهر رسالة الإغلاق
   - إذا كان مفتوحًا وله موعد: يظهر شريط «آخر موعد»
   - الإغلاق مطبّق أيضًا في قاعدة البيانات، فهذه الصفحة للتوضيح فقط */
(function () {
  var script = document.currentScript;
  var formId = script && script.getAttribute('data-form');
  if (!formId) return;
  var URL = 'https://wcyamoqmpwpribsgspjn.supabase.co';
  var KEY = 'sb_publishable_3eJET0uhZw4D4DowMK13fQ_oWK3PdIQ';

  var css = document.createElement('style');
  css.textContent =
    '.cg-box{max-width:560px;margin:40px auto;padding:28px 22px;background:#fff;border:1px solid #efc7c7;border-radius:20px;text-align:center;font-family:Tahoma,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.06)}' +
    '.cg-box .i{font-size:46px}.cg-box h2{color:#b42318;margin:8px 0 6px;font-size:22px}' +
    '.cg-box p{color:#5b6b64;line-height:1.8;margin:4px 0}.cg-box .en{direction:ltr;color:#8a9a93;font-size:13px}' +
    '.cg-bar{max-width:900px;margin:12px auto;padding:10px 14px;border-radius:12px;background:#fff8e6;border:1px solid #f0d58c;color:#7a5a00;font:13px Tahoma,Arial,sans-serif;text-align:center}';
  document.head.appendChild(css);

  function fmt(d) {
    try { return new Intl.DateTimeFormat('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', calendar: 'gregory' }).format(new Date(d + 'T12:00:00')); }
    catch (e) { return d; }
  }

  function closed(st) {
    var forms = document.querySelectorAll('form');
    var anchor = forms[0] ? forms[0].parentNode : document.body;
    forms.forEach(function (f) { f.style.display = 'none'; });
    var box = document.createElement('div');
    box.className = 'cg-box';
    box.innerHTML =
      '<div class="i">⛔</div><h2>انتهى موعد هذا الحصر</h2>' +
      (st.closes_on ? '<p>آخر موعد كان <b>' + fmt(st.closes_on) + '</b>.</p>' : '<p>تم إيقاف استقبال البيانات في هذا الحصر.</p>') +
      '<p>للاستفسار تواصل مع الإدارة.</p><p class="en">This form is closed and no longer accepts submissions.</p>';
    anchor.insertBefore(box, forms[0] || null);
  }

  function banner(st) {
    var forms = document.querySelectorAll('form');
    if (!forms[0]) return;
    var bar = document.createElement('div');
    bar.className = 'cg-bar';
    bar.textContent = '📅 آخر موعد لهذا الحصر: ' + fmt(st.closes_on);
    forms[0].parentNode.insertBefore(bar, forms[0]);
  }

  fetch(URL + '/rest/v1/rpc/census_public_status', {
    method: 'POST',
    headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_id: formId })
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (st) {
      if (!st) return;
      if (!st.open) closed(st);
      else if (st.closes_on) banner(st);
    })
    .catch(function () { /* عند تعذر الاتصال لا نغيّر الصفحة؛ قاعدة البيانات ترفض الإرسال إن كان مغلقًا */ });
})();
