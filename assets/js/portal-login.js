const RASHEED_ARABIC_SUPABASE_URL="https://wcyamoqmpwpribsgspjn.supabase.co";
const RASHEED_ARABIC_KEY="sb_publishable_3eJET0uhZw4D4DowMK13fQ_oWK3PdIQ";
const PORTAL_SESSION_KEY="rasheed_arabic_portal_session_v1";
const LEGACY_ADMIN_SESSION_KEY="rasheed_arabic_admin_session_v1";

function savePortalSession(session,role){
  localStorage.setItem(PORTAL_SESSION_KEY,JSON.stringify({
    role,user:session.user,access_token:session.access_token,refresh_token:session.refresh_token,expires_at:session.expires_at
  }));
  if(role==="admin") localStorage.setItem(LEGACY_ADMIN_SESSION_KEY,JSON.stringify(session));
}
function clearPortalSession(){localStorage.removeItem(PORTAL_SESSION_KEY)}
async function portalRpc(session,fn,body={}){
  return fetch(`${RASHEED_ARABIC_SUPABASE_URL}/rest/v1/rpc/${fn}`,{
    method:"POST",
    headers:{apikey:RASHEED_ARABIC_KEY,Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
}
function targetFor(role){
  return ({student:"student/dashboard.html",teacher:"teacher-dashboard.html",parent:"parent/dashboard.html",admin:"admin-hub.html"})[role]||"index.html";
}
async function detectRole(session){
  const r=await portalRpc(session,"get_my_portal_role",{});
  if(!r.ok) throw new Error("تعذر التحقق من صلاحية الحساب. شغّل ملف إعداد الحسابات في Supabase أولًا.");
  return await r.json();
}
document.addEventListener("DOMContentLoaded",()=>{
  const form=document.getElementById("portalLoginForm"); if(!form)return;
  const err=document.getElementById("loginError"), btn=document.getElementById("portalLoginBtn");
  form.addEventListener("submit",async e=>{
    e.preventDefault(); err.classList.add("hide"); btn.disabled=true; btn.textContent="جارٍ التحقق...";
    try{
      clearPortalSession();
      const r=await fetch(`${RASHEED_ARABIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,{
        method:"POST",headers:{apikey:RASHEED_ARABIC_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value})
      });
      if(!r.ok) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      const session=await r.json();
      const role=await detectRole(session);
      if(!role) throw new Error("الحساب صحيح، لكنه لم يُربط بعد بدور طالب أو معلم أو ولي أمر أو مدير.");
      savePortalSession(session,role);
      location.href=targetFor(role);
    }catch(ex){err.textContent=ex.message||"تعذر تسجيل الدخول.";err.classList.remove("hide");btn.disabled=false;btn.textContent="تسجيل الدخول"}
  });
});