/* Vinh danh nhà vô địch + bảng tổng hợp điểm.
   Pickleball: lấy theo 2 bảng kết quả chính thức người dùng đã cung cấp ngày 17/10.
   Bóng đá/Bóng chuyền: nhà vô địch được xác định tự động từ kết quả trận CK trong API.
   Không tự suy đoán bảng điểm tổng hợp khi chưa có bảng điểm chính thức. */
(function(){
  "use strict";
  const PICKLE_CHAMPIONS = [
    {category:"Đôi nữ dưới 46 tuổi", winner:"Trần Hương + Hương Trà (CN Thái Nguyên)", score:"15 - 13"},
    {category:"Đôi NN dưới 46 tuổi", winner:"Minh Tuấn + Khánh Huyền (CN Hòa Bình)", score:"16 - 14"},
    {category:"Đôi nam dưới 46 tuổi", winner:"Anh Tuấn + Huy Hoàng (CN Điện Biên)", score:"15 - 6"},
    {category:"Đôi nữ trên 45 tuổi", winner:"Hà Thùy + Quỳnh Loan (CN Hà Giang)", score:"15 - 12"},
    {category:"Đôi NN trên 45 tuổi", winner:"Xuân Dũng + Ngọc Anh (CN Vĩnh Phúc II)", score:"15 - 6"},
    {category:"Đôi nam trên 45 tuổi", winner:"Hồng Minh + Văn Quân (CN Hòa Bình)", score:"15 - 6"}
  ];

  const esc=s=>String(s??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));
  const resultKey=(type,id,code)=>{
    const r=window.__HOI_THAO_RESULTS||{};
    return r[type+'-'+id]||r[type+'-'+code]||{};
  };
  const scoreParts=s=>{const m=String(s||"").match(/(\d+)\s*[-–]\s*(\d+)(?:\s*\((\d+)\s*[-–]\s*(\d+)\))?/);return m?{a:+m[1],b:+m[2],ta:m[3]?+m[3]:null,tb:m[4]?+m[4]:null}:null};
  const winner=(teams,score)=>{
    const parts=String(teams||"").split(/\s+[–-]\s+/), s=scoreParts(score);
    if(parts.length<2||!s)return null;
    let a=s.a,b=s.b;
    if(a===b&&s.ta!==null&&s.tb!==null){a=s.ta;b=s.tb;}
    if(a===b)return null;
    return parts[a>b?0:1].trim();
  };
  const finalWinner=(type,code)=>{
    const rows=(window.HOI_THAO_MATCHES&&window.HOI_THAO_MATCHES[type])||[];
    const idx=rows.findIndex(r=>String(r[2])===String(code));
    if(idx<0)return null;
    const row=rows[idx], saved=resultKey(type,idx,code);
    const teams=String(saved.teams_override||row[4]||"");
    const champ=winner(teams,saved.score);
    return champ?{champ,score:saved.score,teams,status:saved.status}:null;
  };

  function footballCard(){
    const f=finalWinner("football","31");
    if(!f)return '<div class="champion-empty"><strong>Đang chờ kết quả chung kết</strong><span>Thắng BK1 – Thắng BK2</span></div>';
    return '<div class="champion-winner"><span class="champion-cup">🏆</span><div><small>NHÀ VÔ ĐỊCH</small><strong>'+esc(f.champ)+'</strong><span>Chung kết · Kết quả '+esc(f.score)+'</span></div></div>';
  }
  function volleyCard(){
    const f=finalWinner("volley","12");
    if(!f)return '<div class="champion-empty"><strong>Đang chờ kết quả chung kết</strong><span>Thắng BK1 – Thắng BK2</span></div>';
    return '<div class="champion-winner"><span class="champion-cup">🏆</span><div><small>NHÀ VÔ ĐỊCH</small><strong>'+esc(f.champ)+'</strong><span>Chung kết · Kết quả '+esc(f.score)+'</span></div></div>';
  }
  function pickleCard(){
    return '<div class="pickle-champions">'+PICKLE_CHAMPIONS.map((x,i)=>'<div class="pickle-champion"><span class="champion-rank">'+(i+1)+'</span><div><small>'+esc(x.category)+'</small><strong>🏆 '+esc(x.winner)+'</strong><span>Chung kết · '+esc(x.score)+'</span></div></div>').join('')+'</div>';
  }
  function rankingCard(){
    return '<div class="ranking-note"><strong>Bảng tổng hợp điểm</strong><p>Chưa tự tính điểm để tránh làm sai dữ liệu chính thức. Khi có bảng tổng hợp điểm cuối cùng, chỉ cần nhập đúng bảng đó vào khu vực dữ liệu này; giao diện sẽ hiển thị đồng bộ trên trang chủ.</p></div>';
  }
  function render(){
    const el=document.getElementById("champions-section");
    if(!el)return;
    el.innerHTML='<div class="champions-head"><p class="section-kicker"><span class="kicker-icon">🏆</span> VINH DANH THÀNH TÍCH</p><h2>Những nhà vô địch Hội thao</h2><p>Ba môn thi đấu · cập nhật theo kết quả chính thức</p></div>'+
      '<div class="champion-grid">'+
      '<article class="champion-card football"><div class="champion-card-head"><span>⚽</span><div><small>BÓNG ĐÁ MINI NAM</small><h3>Nhà vô địch</h3></div></div>'+footballCard()+'</article>'+
      '<article class="champion-card volley"><div class="champion-card-head"><span>🏐</span><div><small>BÓNG CHUYỀN HƠI NỮ</small><h3>Nhà vô địch</h3></div></div>'+volleyCard()+'</article>'+
      '<article class="champion-card pickle"><div class="champion-card-head"><span>🏓</span><div><small>PICKLEBALL</small><h3>6 nội dung vô địch</h3></div></div>'+pickleCard()+'</article>'+
      '</div>'+
      '<div class="ranking-board"><div class="ranking-board-head"><span>🏅</span><div><small>THÀNH TÍCH TOÀN ĐOÀN</small><h3>Bảng tổng hợp điểm</h3></div></div>'+rankingCard()+'</div>';
  }

  const load=()=>fetch("api/results.php?ts="+Date.now(),{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{window.__HOI_THAO_RESULTS=(j&&j.ok)?(j.results||{}):{};render();}).catch(()=>{window.__HOI_THAO_RESULTS={};render();});
  const ready=window.HOI_THAO_MATCHES_READY||Promise.resolve();
  ready.catch(()=>{}).then(()=>{load();window.setInterval(load,60000);});
})();
