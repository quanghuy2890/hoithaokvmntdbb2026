/* Compatibility wrapper: preserve the previously approved Pickleball additions from the immutable commit,
   then restore the original Agribank branch/branch + sport lookup UI and behavior. */
(function(){
  const legacy="https://raw.githubusercontent.com/quanghuy2890/hoithaokvmntdbb2026/8be831fe54cb9a0b9d4b30a735da8a2308bfdda0/assets/matches-extra.js";
  const s=document.createElement("script");
  s.src=legacy;
  s.onload=initLookup;
  s.onerror=initLookup;
  document.head.appendChild(s);

  function esc(v){return String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));}
  function normalize(v){return String(v||"").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");}
  function initLookup(){
    const panel=document.querySelector(".panel");
    if(!panel || !window.HOI_THAO_MATCHES) return;
    const branches=["Bắc Kạn","Bắc Yên Bái","Cao Bằng","Điện Biên","Hà Giang","Hòa Bình","Lai Châu","Lạng Sơn","Lào Cai","Lào Cai II","Nam Thái Nguyên","Phú Thọ","Phú Thọ II","Sơn La","Sơn La II","Thái Nguyên","Tuyên Quang","Vĩnh Phúc","Vĩnh Phúc II","Yên Bái"];
    panel.innerHTML='<h2>Tra cứu lịch và kết quả theo Agribank tỉnh/chi nhánh</h2>'+
      '<p class="meta">Chọn Agribank tỉnh/chi nhánh và môn thi đấu để xem lịch các trận có liên quan, gồm ngày, giờ/buổi, bảng/vòng, đối thủ, địa điểm và tình trạng kết quả.</p>'+
      '<div class="controls">'+
      '<select id="branchFilter" aria-label="Chọn Agribank tỉnh hoặc chi nhánh"><option value="">— Chọn Agribank tỉnh/chi nhánh —</option>'+branches.map(b=>'<option value="'+esc(b)+'">Agribank CN '+esc(b)+'</option>').join("")+"</select>"+
      '<select id="sportFilter" aria-label="Lọc theo môn"><option value="">— Tất cả các môn —</option><option value="Bóng đá mini nam">Bóng đá mini nam</option><option value="Bóng chuyền hơi nữ">Bóng chuyền hơi nữ</option><option value="Pickleball">Pickleball</option></select>"+
      '<button id="searchBtn" type="button">Tra cứu</button></div>'+
      '<div class="results" id="searchResults" aria-live="polite"><div class="empty">Chọn Agribank tỉnh/chi nhánh trong danh sách rồi bấm “Tra cứu”.</div></div>';

    const data=window.HOI_THAO_MATCHES;
    let saved={};
    const names={football:"Bóng đá mini nam",volley:"Bóng chuyền hơi nữ",pickle:"Pickleball"};
    fetch("api/results.php",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(j&&j.ok)saved=j.results||{};}).catch(()=>{});

    function resultText(id,index){
      const r=saved[id+"-"+index];
      if(!r||!r.score) return "Chưa có tỷ số chính thức";
      return "Kết quả: "+r.score+" · "+(r.status==="live"?"Đang thi đấu":r.status==="finished"?"Kết thúc":"Chưa cập nhật");
    }
    function switchSport(id){
      const btn=document.querySelector('[data-tab="'+id+'"]');
      if(btn) btn.click();
      const sec=document.getElementById(id);
      if(sec) sec.scrollIntoView({behavior:"smooth",block:"start"});
    }
    function search(){
      const branch=document.getElementById("branchFilter").value.trim();
      const sport=document.getElementById("sportFilter").value;
      const out=document.getElementById("searchResults");
      if(!branch){out.innerHTML='<div class="empty">Chọn Agribank tỉnh/chi nhánh trong danh sách rồi bấm “Tra cứu”.</div>';return;}
      const q=normalize(branch), sets=[[names.football,data.football||[],"football"],[names.volley,data.volley||[],"volley"],[names.pickle,data.pickle||[],"pickle"]];
      const found=[];
      sets.forEach(([name,rows,id])=>{
        if(sport && sport!==name) return;
        rows.forEach((r,i)=>{if(normalize(r.join(" ")).includes(q)) found.push({name,r,id,i});});
      });
      if(!found.length){out.innerHTML='<div class="empty">Chưa tìm thấy trận phù hợp của Agribank CN '+esc(branch)+' trong lịch đã nhập.</div>';return;}
      out.innerHTML='<p><strong>Agribank CN '+esc(branch)+' — tìm thấy '+found.length+' lượt trận</strong><br><span class="small">Các trận chưa thi đấu hoặc chưa được cập nhật tỷ số vẫn được hiển thị với trạng thái “Chưa có kết quả”.</span></p>'+found.map(x=>{
        const {name,r,id,i}=x;
        const match=id==="football"?"Trận "+r[2]+" · Bảng/vòng "+r[3]:id==="volley"?"Trận "+r[2]+" · Bảng/vòng "+r[3]:"Trận "+r[3]+" · Bảng/vòng "+r[5];
        const teams=id==="football"?r[4]:id==="volley"?r[4]:r[6];
        const detail=id==="football"?"Giờ "+r[1]+" · Sân "+r[5]:id==="volley"?"Buổi "+r[1]+" · "+r[5]:"Buổi "+r[1]+" · "+r[2]+" · "+r[4];
        return '<article class="result-card"><span class="tag">'+esc(name)+'</span><span class="tag">'+esc(r[0])+'</span><br><strong>'+esc(match)+'</strong><p>'+esc(teams)+'</p><span class="small">'+esc(detail)+' · '+esc(resultText(id,i))+'</span><p><a href="#'+id+'" data-open-sport="'+id+'">Mở lịch môn này →</a></p></article>';
      }).join("");
      out.querySelectorAll("[data-open-sport]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();switchSport(a.dataset.openSport);}));
    }
    document.getElementById("searchBtn").addEventListener("click",search);
  }
})();