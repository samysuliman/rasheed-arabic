/* إعدادات عامة منشورة مسبقًا في المشروع؛ ليست أسرارًا. لا تضع service_role هنا. */
window.FEEDBACK_CONFIG={url:'https://wcyamoqmpwpribsgspjn.supabase.co',key:'sb_publishable_3eJET0uhZw4D4DowMK13fQ_oWK3PdIQ'};
window.fbRequest=async function(path,options={}){const c=window.FEEDBACK_CONFIG;const r=await fetch(c.url+'/rest/v1/'+path,{...options,headers:{'apikey':c.key,'Authorization':'Bearer '+c.key,'Content-Type':'application/json',...(options.headers||{})}});if(!r.ok)throw Error('تعذر الاتصال بخدمة التقييمات. ربما لم تُفعّل قاعدة البيانات بعد. ('+r.status+')');if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null};
window.fbEscape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
