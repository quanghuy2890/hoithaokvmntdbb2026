/* Lookup UI + official Pickleball additions. */
(function(){
  "use strict";
  const legacy="https://raw.githubusercontent.com/quanghuy2890/hoithaokvmntdbb2026/8be831fe54cb9a0b9d4b30a735da8a2308bfdda0/assets/matches-extra.js";
  const panel=document.querySelector(".panel");
  const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));
  const normalize=v=>String(v||"").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/\s+/g," ").trim();
  const branches=["Bắc Kạn","Bắc Yên Bái","Cao Bằng","Điện Biên","Hà Giang","Hòa Bình","Lai Châu","Lạng Sơn","Lào Cai","Lào Cai II","Nam Thái Nguyên","Phú Thọ","Phú Thọ II","Sơn La","Sơn La II","Thái Nguyên","Tuyên Quang","Vĩnh Phúc","Vĩnh Phúc II","Yên Bái"];
  const names={football:"Bóng đá mini nam",volley:"Bóng chuyền hơi nữ",pickle:"Pickleball"};
  if(!panel) return;

  panel.innerHTML='<h2>Tra cứu lịch và kết quả theo Agribank tỉnh/chi nhánh</h2>'+
    '<p class="meta">Chọn Agribank tỉnh/chi nhánh và môn thi đấu để xem các trận có liên quan, gồm ngày, giờ/buổi, bảng/vòng, đối thủ, địa điểm và kết quả.</p>'+ 
    '<div class="controls">'+
    '<select id="branchFilter" aria-label="Chọn Agribank tỉnh hoặc chi nhánh"><option value="">— Chọn Agribank tỉnh/chi nhánh —</option>'+branches.map(b=>'<option value="'+esc(b)+'">Agribank CN '+esc(b)+'</option>').join("")+"</select>"+
    '<select id="sportFilter" aria-label="Chọn môn thi đấu"><option value="">Tất cả các môn</option><option value="football">Bóng đá mini nam</option><option value="volley">Bóng chuyền hơi nữ</option><option value="pickle">Pickleball</option></select>'+
    '<button id="searchBtn" type="button">Tra cứu</button></div>'+ 
    '<div id="searchResults" aria-live="polite"><div class="empty">Chọn Agribank tỉnh/chi nhánh rồi bấm “Tra cứu”.</div></div>';

  let saved={};
  fetch("api/results.php",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(j&&j.ok)saved=j.results||{};}).catch(()=>{});

  function resultText(id,index){
    const r=saved[id+"-"+index];
    if(!r||!r.score) return "Chưa có kết quả";
    return "Kết quả: "+r.score+(r.status==="live"?" · Đang thi đấu":r.status==="finished"?" · Kết thúc":"");
  }

  // Match an exact branch name. For example "Sơn La" matches "CN Sơn La"
  // or "(Sơn La)", but never a standalone "Sơn La II". Likewise "Sơn La II"
  // only matches the II branch. This also works when a match contains both branches.
  function branchMatches(text,branch){
    const t=normalize(text), b=normalize(branch);
    if(!b) return false;
    const escaped=b.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const suffix=b.endsWith(" ii")?"":"(?!\\s+ii\\b)";
    return new RegExp("(?:^|[^a-z0-9])"+escaped+suffix+"(?:$|[^a-z0-9])").test(t);
  }

  let extrasPromise=null;
  function ensureOfficialExtras(){
    const M=window.HOI_THAO_MATCHES||{};
    // The official additions contain Sân 3–6 and the 17/10 knockout rows.
    // If they are already present, do nothing.
    if(Array.isArray(M.pickle) && M.pickle.some(r=>r[2]==="Sân 6") && M.pickle.some(r=>r[2]==="Sân 5" && r[3]==="37")) return Promise.resolve();
    if(extrasPromise) return extrasPromise;
    extrasPromise=new Promise(resolve=>{
      const s=document.createElement("script");
      s.src=legacy+"?v=official-pickle-1";
      s.async=true;
      s.onload=()=>resolve();
      s.onerror=()=>resolve();
      document.head.appendChild(s);
    });
    return extrasPromise;
  }

  function search(){
    const branch=document.getElementById("branchFilter").value.trim();
    const sport=document.getElementById("sportFilter").value;
    const out=document.getElementById("searchResults");
    if(!branch){out.innerHTML='<div class="empty">Chọn Agribank tỉnh/chi nhánh trong danh sách rồi bấm “Tra cứu”.</div>';return;}
    const data=window.HOI_THAO_MATCHES||{};
    const q=branch, sets=[[names.football,data.football||[],"football"],[names.volley,data.volley||[],"volley"],[names.pickle,data.pickle||[],"pickle"]],found=[];
    sets.forEach(([name,rows,id])=>{if(sport&&sport!==id)return;rows.forEach((r,i)=>{if(branchMatches(r.join(" "),q))found.push({name,r,id,i});});});
    if(!found.length){out.innerHTML='<div class="empty">Chưa tìm thấy trận phù hợp của Agribank CN '+esc(branch)+' trong lịch đã nhập.</div>';return;}
    out.innerHTML='<p><strong>Agribank CN '+esc(branch)+' — tìm thấy '+found.length+' trận</strong></p>'+found.map(x=>{
      const {name,r,id,i}=x;
      const match=id==="football"?"Trận "+r[2]+" · Bảng/vòng "+r[3]:id==="volley"?"Trận "+r[2]+" · Bảng/vòng "+r[3]:"Trận "+r[3]+" · Bảng/vòng "+r[5];
      const teams=id==="football"?r[4]:id==="volley"?r[4]:r[6];
      const detail=id==="football"?"Giờ "+r[1]+" · Sân "+r[5]:id==="volley"?"Buổi "+r[1]+" · "+r[5]:"Buổi "+r[1]+" · "+r[2]+" · "+r[4];
      return '<article class="result-card"><span class="tag">'+esc(name)+'</span> <span class="tag">'+esc(r[0])+'</span><br><strong>'+esc(match)+'</strong><p>'+esc(teams)+'</p><span class="small">'+esc(detail)+' · '+esc(resultText(id,i))+'</span></article>';
    }).join("");
  }

  const btn=document.getElementById("searchBtn");
  document.getElementById("branchFilter").addEventListener("change",()=>{document.getElementById("searchResults").innerHTML='<div class="empty">Bấm “Tra cứu” để xem lịch của chi nhánh đã chọn.</div>';});

  // Do not depend on a race between the page and the optional additions.
  // Every search waits for the official additions to finish loading first.
  btn.addEventListener("click",()=>{
    const out=document.getElementById("searchResults");
    out.innerHTML='<div class="empty">Đang tải đầy đủ lịch thi đấu…</div>';
    ensureOfficialExtras().then(search);
  });
})();