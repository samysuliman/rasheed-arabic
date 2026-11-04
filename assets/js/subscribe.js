/* رشيد العربية — نموذج طلب الاشتراك (الواجهة + بوابة الطالب)
   الاستخدام: RasheedSubscribe.open({ subject:'QURAN', source:'portal', name:'', username:'RA0044' }) */
(function () {
  const SUPABASE_URL = 'https://wcyamoqmpwpribsgspjn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3eJET0uhZw4D4DowMK13fQ_oWK3PdIQ';
  const WHATSAPP = '966559461920';
  const PRICE = '100$';
  const LESSONS = 10;
  const SUBJECTS = [
    { code: 'ARABIC', ar: 'اللغة العربية', en: 'Arabic Language', icon: '📘', g: 'ar' },
    { code: 'QURAN_FOUNDATIONS', ar: 'التأسيس والقراءة', en: "Qur'an Foundations & Reading", icon: '🔤', g: 'q' },
    { code: 'QURAN_TAJWEED', ar: 'التلاوة والتجويد', en: 'Recitation & Tajweed', icon: '🎙️', g: 'q' },
    { code: 'QURAN_HIFZ', ar: 'الحفظ والإتقان', en: 'Memorization (Hifz)', icon: '🧠', g: 'q' },
    { code: 'QURAN_IJAZAH', ar: 'الإجازة والسند', en: 'Ijazah & Sanad', icon: '🎓', g: 'q' },
    { code: 'AQEEDAH', ar: 'العقيدة', en: 'Islamic Creed (Aqeedah)', icon: '🤍', g: 's' },
    { code: 'FIQH', ar: 'الفقه', en: 'Islamic Jurisprudence (Fiqh)', icon: '⚖️', g: 's' },
    { code: 'HADITH', ar: 'الحديث النبوي', en: 'Prophetic Hadith', icon: '📚', g: 's' },
    { code: 'TAFSEER', ar: 'التفسير', en: 'Tafsir', icon: '📖', g: 's' },
    { code: 'SEERAH', ar: 'السيرة النبوية', en: "Prophet's Biography (Seerah)", icon: '🕌', g: 's' }
  ];
  const ALIAS = { QURAN: 'QURAN_FOUNDATIONS', TAJWEED: 'QURAN_TAJWEED', SEERAH_KIDS: 'SEERAH' };
  const GROUPS = [['ar', 'اللغة العربية · Arabic'], ['q', 'مسارات القرآن الكريم · Qur\'an paths'], ['s', 'العلوم الشرعية · Islamic sciences']];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const css = `
  .rs-back{position:fixed;inset:0;background:rgba(6,40,29,.55);backdrop-filter:blur(3px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;font-family:inherit}
  .rs-box{background:#fff;width:min(460px,100%);max-height:92vh;overflow:auto;border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.3);color:#17392c}
  .rs-head{background:linear-gradient(135deg,#07583f,#0b6e51);color:#fff;padding:18px 20px;border-radius:22px 22px 0 0;position:relative}
  .rs-head b{font-size:19px;display:block}.rs-head small{opacity:.85}
  .rs-x{position:absolute;left:12px;top:12px;background:rgba(255,255,255,.15);border:0;color:#fff;width:32px;height:32px;border-radius:10px;font-size:18px;cursor:pointer}
  .rs-price{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.rs-price span{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:5px 11px;font-size:13px;font-weight:700}
  .rs-price span.gold{background:#c9a227;border-color:#c9a227;color:#17392c}
  .rs-body{padding:16px 20px 20px}.rs-body label{display:block;font-size:13px;font-weight:700;margin:10px 0 4px}
  .rs-body input,.rs-body select,.rs-body textarea{width:100%;box-sizing:border-box;border:1px solid #d8e6df;border-radius:12px;padding:10px 12px;font:inherit;background:#fbfdfc}
  .rs-body textarea{min-height:64px;resize:vertical}.rs-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .rs-go{width:100%;margin-top:14px;border:0;border-radius:14px;padding:13px;background:#07583f;color:#fff;font:inherit;font-weight:800;font-size:16px;cursor:pointer}
  .rs-go:disabled{opacity:.6}.rs-wa{background:#25d366}.rs-note{font-size:12px;color:#6f7f77;margin-top:8px;text-align:center}
  .rs-err{background:#fff1f1;border:1px solid #efc5c5;color:#8d2f2f;border-radius:10px;padding:8px 10px;font-size:13px;margin-top:10px}
  .rs-ok{text-align:center;padding:8px 0}.rs-ok .big{font-size:46px}.rs-ok b{display:block;font-size:18px;margin:6px 0}
  @media(max-width:420px){.rs-row{grid-template-columns:1fr}}`;

  function ensureCss() {
    if (document.getElementById('rs-css')) return;
    const s = document.createElement('style'); s.id = 'rs-css'; s.textContent = css; document.head.appendChild(s);
  }

  function open(opts = {}) {
    ensureCss();
    close();
    const want = ALIAS[opts.subject] || opts.subject;
    const sel = SUBJECTS.find(x => x.code === want) || SUBJECTS[0];
    const back = document.createElement('div'); back.className = 'rs-back'; back.id = 'rsBack';
    back.innerHTML = `<div class="rs-box" role="dialog" aria-modal="true" aria-label="طلب اشتراك">
      <div class="rs-head"><button class="rs-x" type="button" data-x aria-label="إغلاق">×</button>
        <b>✨ اشترك في رشيد العربية</b><small>Subscribe · دروس مباشرة مع المعلم سامي سليمان</small>
        <div class="rs-price"><span class="gold">${PRICE} للمادة</span><span>باقة ${LESSONS} حصص</span><span>حصص فردية مباشرة</span></div></div>
      <form class="rs-body" novalidate>
        <label>المادة · Subject</label>
        <select name="subject">${GROUPS.map(([g, label]) => `<optgroup label="${esc(label)}">` + SUBJECTS.filter(s => s.g === g).map(s => `<option value="${s.code}"${s.code === sel.code ? ' selected' : ''}>${s.icon} ${esc(s.ar)} · ${esc(s.en)}</option>`).join('') + '</optgroup>').join('')}</select>
        <label>اسم الطالب · Student name</label>
        <input name="name" required maxlength="120" value="${esc(opts.name || '')}" autocomplete="name">
        <div class="rs-row">
          <div><label>البريد الإلكتروني · Email</label><input name="email" type="email" required maxlength="200" dir="ltr" autocomplete="email" placeholder="name@example.com"></div>
          <div><label>واتساب / جوال · Phone</label><input name="phone" type="tel" maxlength="40" dir="ltr" autocomplete="tel" placeholder="+966..."></div>
        </div>
        <label>الدولة · Country</label>
        <input name="country" maxlength="80" placeholder="مثال: السعودية، بريطانيا، أمريكا">
        <label>ملاحظة (اختياري) · Note</label>
        <textarea name="message" maxlength="1000" placeholder="عمر الطالب، الأوقات المناسبة..."></textarea>
        <div class="rs-err" hidden></div>
        <button class="rs-go" type="submit">إرسال طلب الاشتراك · Send request</button>
        <div class="rs-note">سنتواصل معك عبر البريد أو واتساب لتأكيد الاشتراك وجدول الحصص.</div>
      </form></div>`;
    document.body.appendChild(back);
    back.addEventListener('click', e => { if (e.target === back || e.target.closest('[data-x]')) close(); });
    const form = back.querySelector('form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form).entries());
      const err = back.querySelector('.rs-err');
      const showErr = m => { err.textContent = m; err.hidden = false; };
      err.hidden = true;
      f.name = String(f.name || '').trim(); f.email = String(f.email || '').trim();
      if (f.name.length < 2) return showErr('اكتب اسم الطالب.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return showErr('اكتب بريدًا إلكترونيًا صحيحًا.');
      const btn = form.querySelector('.rs-go'); btn.disabled = true; btn.textContent = 'جارٍ الإرسال...';
      try {
        const r = await fetch(SUPABASE_URL + '/rest/v1/subscription_requests', {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ full_name: f.name, email: f.email, phone: String(f.phone || '').trim() || null, country: String(f.country || '').trim() || null,
            subject_code: f.subject, message: String(f.message || '').trim() || null, student_username: opts.username || null, source: opts.source === 'portal' ? 'portal' : 'home' })
        });
        if (!r.ok) throw new Error('HTTP_' + r.status);
        const s = SUBJECTS.find(x => x.code === f.subject) || sel;
        const text = `السلام عليكم، أرغب في الاشتراك في رشيد العربية\nالمادة: ${s.ar}\nاسم الطالب: ${f.name}${opts.username ? '\nرقم الطالب: ' + opts.username : ''}\nالبريد: ${f.email}${f.phone ? '\nالجوال: ' + f.phone : ''}${f.country ? '\nالدولة: ' + f.country : ''}`;
        form.innerHTML = `<div class="rs-ok"><div class="big">✅</div><b>تم استلام طلبك · Request received</b>
          <div class="rs-note">طلب الاشتراك في «${esc(s.ar)}» وصل إلينا، وسنتواصل معك على ${esc(f.email)} قريبًا.</div>
          <a class="rs-go rs-wa" style="display:block;text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}">💬 أكمل على واتساب للتأكيد السريع</a>
          <button class="rs-go" type="button" data-x style="background:#edf7f2;color:#07583f">إغلاق · Close</button></div>`;
      } catch (ex) {
        console.error(ex); btn.disabled = false; btn.textContent = 'إرسال طلب الاشتراك · Send request';
        showErr('تعذر الإرسال الآن. حاول مرة أخرى أو تواصل معنا على واتساب.');
      }
    });
    setTimeout(() => form.querySelector(opts.name ? 'input[name=email]' : 'input[name=name]')?.focus(), 50);
  }
  function close() { document.getElementById('rsBack')?.remove(); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.RasheedSubscribe = { open, close, SUBJECTS, PRICE, LESSONS };
})();
