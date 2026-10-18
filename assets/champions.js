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
  const resultKey=(type,id,code)=>{const r=window.__HOI_THAO_RESULTS||{};return r[type+'-'+id]||r[type+'-'+code]||{};};
  const scoreParts=s=>{const m=String(s||"").match(/(\d+)\s*[-–]\s*(\d+)(?:\s*\((\d+)\s*[-–]\s*(\d+)\))?/);return m?{a:+m[1],b:+m[2],ta:m[3]?+m[3]:null,tb:m[4]?+m[4]:null}:null;};
  const winner=(teams,score)=>{const parts=String(teams||"").split(/\s+[–-]\s+/),s=scoreParts(score);if(parts.length<2||!s)return null;let a=s.a,b=s.b;if(a===b&&s.ta!==null&&s.tb!==null){a=s.ta;b=s.tb;}if(a===b)return null;return parts[a>b?0:1].trim();};
  const finalWinner=(type,code)=>{const rows=(window.HOI_THAO_MATCHES&&window.HOI_THAO_MATCHES[type])||[];const idx=rows.findIndex(r=>String(r[2])===String(code));if(idx<0)return null;const row=rows[idx],saved=resultKey(type,idx,code),teams=String(saved.teams_override||row[4]||""),champ=winner(teams,saved.score);return champ?{champ,score:saved.score,teams,status:saved.status}:null;};

  function addStyles(){
    if(document.getElementById("champions-inline-style"))return;
    const css=`
#champions-section{padding:42px clamp(20px,4vw,64px) 50px;background:linear-gradient(180deg,#fffdf6 0%,#f6f8f6 100%);border-top:1px solid #eee4ca;border-bottom:1px solid #e5e9e6}.champions-head{text-align:center;margin:0 auto 24px}.champions-head h2{margin:0;color:#263746;font-size:clamp(30px,2.8vw,40px);line-height:1.2}.champions-head>p:last-child{margin:8px 0 0;color:#62707b;font-size:18px}.champion-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;width:min(1400px,100%);margin:0 auto}.champion-card,.ranking-board{border:1px solid #e3e9e5;border-radius:22px;background:#fff;box-shadow:0 10px 28px rgba(22,40,31,.08);overflow:hidden}.champion-card{min-width:0}.champion-card-head{display:flex;align-items:center;gap:14px;padding:20px 22px 15px;border-bottom:1px solid #edf0ee}.champion-card-head>span{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#fff6d9;font-size:30px;box-shadow:0 5px 14px rgba(130,95,20,.12)}.champion-card-head small,.ranking-board-head small{display:block;color:#9a7425;font-size:12px;font-weight:800;letter-spacing:.12em}.champion-card-head h3,.ranking-board-head h3{margin:3px 0 0;color:#173d31;font-size:22px}.champion-card.football{border-top:5px solid #087849}.champion-card.volley{border-top:5px solid #2d79a9}.champion-card.pickle{border-top:5px solid #b10d2a}.champion-winner{display:flex;gap:14px;align-items:flex-start;padding:24px 22px 26px;min-height:170px;background:linear-gradient(145deg,#fff,#f5fbf7)}.champion-cup{font-size:38px;line-height:1}.champion-winner div{display:flex;flex-direction:column;gap:5px}.champion-winner small{color:#b10d2a;font-size:11px;font-weight:900;letter-spacing:.13em}.champion-winner strong{color:#087849;font-size:21px;line-height:1.35}.champion-winner span:last-child,.champion-empty span{color:#62707b;font-size:15px}.champion-empty{display:flex;flex-direction:column;justify-content:center;min-height:170px;padding:24px 22px;background:#fffaf0}.champion-empty strong{color:#9a6b08;font-size:19px}.pickle-champions{padding:8px 14px 15px}.pickle-champion{display:grid;grid-template-columns:30px minmax(0,1fr);gap:9px;align-items:start;padding:11px 8px;border-bottom:1px solid #edf0ee}.pickle-champion:last-child{border-bottom:0}.champion-rank{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#fff0df;color:#9a6b08;font:bold 12px Arial,sans-serif}.pickle-champion div{display:flex;flex-direction:column;gap:2px}.pickle-champion small{color:#68756f;font-size:13px;font-weight:700}.pickle-champion strong{color:#087849;font-size:16px;line-height:1.35}.pickle-champion span:last-child{color:#7a858b;font-size:13px}.ranking-board{width:min(1400px,100%);margin:22px auto 0}.ranking-board-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid #edf0ee;background:linear-gradient(90deg,#f4fbf7,#fffdf6)}.ranking-board-head>span{font-size:31px}.ranking-note{padding:18px 22px 22px}.ranking-note strong{color:#087849;font-size:19px}.ranking-note p{margin:6px 0 0;color:#62707b;font-size:16px}.ranking-note:before{content:'BẢNG ĐIỂM CHÍNH THỨC';display:inline-block;margin-bottom:5px;padding:4px 9px;border-radius:999px;background:#f4ead0;color:#8b6824;font:800 10px Arial,sans-serif;letter-spacing:.1em}@media(max-width:950px){.champion-grid{grid-template-columns:1fr}.champion-card{max-width:760px;margin:0 auto;width:100%}}@media(max-width:700px){#champions-section{padding:30px 12px 36px}.champion-card-head{padding:16px}.champion-winner{padding:20px 16px}.pickle-champion{padding:10px 4px}.ranking-board-head{padding:16px}.ranking-note{padding:16px}}
`;
    const style=document.createElement("style");style.id="champions-inline-style";style.textContent=css;document.head.appendChild(style);
  }
  function footballCard(){const f=finalWinner("football","31");if(!f)return '<div class="champion-empty"><strong>Đang chờ kết quả chung kết</strong><span>Thắng BK1 – Thắng BK2</span></div>';return '<div class="champion-winner"><span class="champion-cup">🏆</span><div><small>NHÀ VÔ ĐỊCH</small><strong>'+esc(f.champ)+'</strong><span>Chung kết · Kết quả '+esc(f.score)+'</span></div></div>';}
  function volleyCard(){const f=finalWinner("volley","12");if(!f)return '<div class="champion-empty"><strong>Đang chờ kết quả chung kết</strong><span>Thắng BK1 – Thắng BK2</span></div>';return '<div class="champion-winner"><span class="champion-cup">🏆</span><div><small>NHÀ VÔ ĐỊCH</small><strong>'+esc(f.champ)+'</strong><span>Chung kết · Kết quả '+esc(f.score)+'</span></div></div>';}
  function pickleCard(){return '<div class="pickle-champions">'+PICKLE_CHAMPIONS.map((x,i)=>'<div class="pickle-champion"><span class="champion-rank">'+(i+1)+'</span><div><small>'+esc(x.category)+'</small><strong>🏆 '+esc(x.winner)+'</strong><span>Chung kết · '+esc(x.score)+'</span></div></div>').join('')+'</div>';}
  function rankingCard(){return '<div class="ranking-note"><strong>Bảng tổng hợp điểm</strong><p>Chưa tự tính điểm để tránh làm sai dữ liệu chính thức. Khi có bảng tổng hợp điểm cuối cùng, chỉ cần nhập đúng bảng đó vào khu vực dữ liệu này; giao diện sẽ hiển thị đồng bộ trên trang chủ.</p></div>';}
  function render(){
    addStyles();
    let el=document.getElementById("champions-section");
    if(!el){el=document.createElement("section");el.id="champions-section";const anchor=document.querySelector(".content-section");if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(el,anchor);else document.querySelector("main")?.appendChild(el);}
    el.innerHTML='<div class="champions-head"><p class="section-kicker"><span class="kicker-icon">🏆</span> VINH DANH THÀNH TÍCH</p><h2>Những nhà vô địch Hội thao</h2><p>Ba môn thi đấu · cập nhật theo kết quả chính thức</p></div>'+
      '<div class="champion-grid">'+
      '<article class="champion-card football"><div class="champion-card-head"><span>⚽</span><div><small>BÓNG ĐÁ MINI NAM</small><h3>Nhà vô địch</h3></div></div>'+footballCard()+'</article>'+
      '<article class="champion-card volley"><div class="champion-card-head"><span>🏐</span><div><small>BÓNG CHUYỀN HƠI NỮ</small><h3>Nhà vô địch</h3></div></div>'+volleyCard()+'</article>'+
      '<article class="champion-card pickle"><div class="champion-card-head"><span>🏓</span><div><small>PICKLEBALL</small><h3>6 nội dung vô địch</h3></div></div>'+pickleCard()+'</article></div>'+
      '<div class="ranking-board"><div class="ranking-board-head"><span>🏅</span><div><small>THÀNH TÍCH TOÀN ĐOÀN</small><h3>Bảng tổng hợp điểm</h3></div></div>'+rankingCard()+'</div>';
  }
  const load=()=>fetch("api/results.php?ts="+Date.now(),{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{window.__HOI_THAO_RESULTS=(j&&j.ok)?(j.results||{}):{};render();}).catch(()=>{window.__HOI_THAO_RESULTS={};render();});
  const ready=window.HOI_THAO_MATCHES_READY||Promise.resolve();
  ready.catch(()=>{}).then(()=>{load();window.setInterval(load,60000);});
})();
