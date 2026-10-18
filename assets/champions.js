/* Vinh danh thành tích + bảng tổng hợp điểm chính thức. */
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

  const TEAM_POINTS = [
    [1,"CN Lạng Sơn",120,"—","—",30,30,"—",20,200,1],
    [2,"CN Bắc Kạn",80,80,"—",20,"—","—","—",180,2],
    [3,"CN Hòa Bình","—","—","—",40,40,"—",20,100,3],
    [4,"CN Vĩnh Phúc","—",100,"—","—","—","—","—",100,3],
    [5,"CN Phú Thọ II",100,"—","—","—","—","—","—",100,3],
    [6,"CN Hà Giang","—","—","—",20,"—",40,30,90,6],
    [7,"CN Thái Nguyên","—","—",20,40,"—",30,"—",90,6],
    [8,"CN Bắc Yên Bái","—",60,"—","—","—","—","—",60,8],
    [9,"CN Điện Biên","—","—",40,"—","—",20,"—",60,8],
    [10,"CN Sơn La","—","—",20,20,20,"—","—",60,8],
    [11,"CN Cao Bằng","—","—",30,"—","—","—",20,50,11],
    [12,"CN Vĩnh Phúc II","—","—","—","—","—","—",40,40,12],
    [13,"CN Sơn La II","—","—","—",30,"—","—","—",30,13],
    [14,"CN Lai Châu","—","—","—","—",20,"—","—",20,14],
    [15,"CN Lào Cai","—","—","—","—","—","—",20,20,14],
    [16,"CN Tuyên Quang","—","—","—","—","—","—","—",0,16],
    [17,"CN Lào Cai II","—","—","—","—","—","—","—",0,16],
    [18,"CN Yên Bái","—","—","—","—","—","—","—",0,16],
    [19,"CN Nam Thái Nguyên","—","—","—","—","—","—","—",0,16],
    [20,"CN Phú Thọ","—","—","—","—","—","—","—",0,16]
  ];

  const esc=s=>String(s??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));
  const resultKey=(type,id,code)=>{const r=window.__HOI_THAO_RESULTS||{};return r[type+'-'+id]||r[type+'-'+code]||{};};
  const rowsOf=type=>(window.HOI_THAO_MATCHES&&window.HOI_THAO_MATCHES[type])||[];
  const scoreParts=s=>{const m=String(s||"").match(/(\d+)\s*[-–]\s*(\d+)(?:\s*\((\d+)\s*[-–]\s*(\d+)\))?/);return m?{a:+m[1],b:+m[2],ta:m[3]?+m[3]:null,tb:m[4]?+m[4]:null}:null;};
  const splitTeams=s=>String(s||"").split(/\s+[–-]\s+/).map(x=>x.trim()).filter(Boolean);
  const matchInfo=(type,code)=>{
    const rows=rowsOf(type), idx=rows.findIndex(r=>String(r[2])===String(code));
    if(idx<0)return null;
    const row=rows[idx], saved=resultKey(type,idx,code), teams=String(saved.teams_override||row[4]||"").trim(), score=String(saved.score||"").trim();
    const s=scoreParts(score), parts=splitTeams(teams);
    if(!s||parts.length<2||s.a===s.b&&!Number.isFinite(s.ta))return {teams,score,saved,row};
    let a=s.a,b=s.b;if(a===b&&s.ta!==null&&s.tb!==null){a=s.ta;b=s.tb;}
    return {teams,score,saved,row,winner:a>b?parts[0]:parts[1],loser:a>b?parts[1]:parts[0]};
  };
  const place=(label,name,score)=>'<div class="podium-place"><span class="podium-medal">'+(label==='GIẢI NHẤT'?'🥇':label==='GIẢI NHÌ'?'🥈':'🥉')+'</span><div><small>'+label+'</small><strong>'+esc(name||'Chờ cập nhật')+'</strong>'+(score?'<span>'+esc(score)+'</span>':'')+'</div></div>';

  function podiumCard(type,finalCode,thirdCodes){
    const f=matchInfo(type,finalCode);
    let third=[];
    (thirdCodes||[]).forEach(code=>{const m=matchInfo(type,code);if(m&&m.winner)third.push(m.winner);});
    if(f&&f.winner){
      return '<div class="podium-list">'+place('GIẢI NHẤT',f.winner,f.score)+' '+place('GIẢI NHÌ',f.loser,'')+(third.length?third.map(x=>place('GIẢI BA',x,'')).join(''):place('GIẢI BA','Chờ cập nhật',''))+'</div>';
    }
    return '<div class="podium-list">'+place('GIẢI NHẤT','Chờ kết quả chung kết','')+place('GIẢI NHÌ','Chờ kết quả chung kết','')+place('GIẢI BA',third.length?third.join(' · '):'Chờ cập nhật','')+'</div>';
  }

  function addStyles(){
    if(document.getElementById('champions-inline-style'))return;
    const css=`
#champions-section{padding:42px clamp(20px,4vw,64px) 50px;background:linear-gradient(180deg,#fffdf6 0%,#f6f8f6 100%);border-top:1px solid #eee4ca;border-bottom:1px solid #e5e9e6}.champions-head{text-align:center;margin:0 auto 24px}.champions-head h2{margin:0;color:#263746;font-size:clamp(30px,2.8vw,40px);line-height:1.2}.champions-head>p:last-child{margin:8px 0 0;color:#62707b;font-size:18px}.champion-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;width:min(1400px,100%);margin:0 auto}.champion-card,.ranking-board{border:1px solid #e3e9e5;border-radius:22px;background:#fff;box-shadow:0 10px 28px rgba(22,40,31,.08);overflow:hidden}.champion-card{min-width:0}.champion-card-head{display:flex;align-items:center;gap:14px;padding:20px 22px 15px;border-bottom:1px solid #edf0ee}.champion-card-head>span{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#fff6d9;font-size:30px;box-shadow:0 5px 14px rgba(130,95,20,.12)}.champion-card-head small,.ranking-board-head small{display:block;color:#9a7425;font-size:12px;font-weight:800;letter-spacing:.12em}.champion-card-head h3,.ranking-board-head h3{margin:3px 0 0;color:#173d31;font-size:22px}.champion-card.football{border-top:5px solid #087849}.champion-card.volley{border-top:5px solid #2d79a9}.champion-card.pickle{border-top:5px solid #b10d2a}.podium-list{padding:9px 14px 15px}.podium-place{display:grid;grid-template-columns:40px minmax(0,1fr);gap:10px;align-items:center;padding:13px 8px;border-bottom:1px solid #edf0ee}.podium-place:last-child{border-bottom:0}.podium-medal{font-size:27px;text-align:center}.podium-place div{display:flex;flex-direction:column;gap:3px}.podium-place small{color:#68756f;font-size:11px;font-weight:900;letter-spacing:.11em}.podium-place strong{color:#087849;font-size:17px;line-height:1.35}.podium-place span:last-child{color:#7a858b;font-size:13px}.podium-place:nth-child(1){background:linear-gradient(90deg,#fff9df,#fff)}.podium-place:nth-child(2){background:linear-gradient(90deg,#f4f8fc,#fff)}.podium-place:nth-child(3){background:linear-gradient(90deg,#fff5ef,#fff)}.pickle-champions{padding:8px 14px 15px}.pickle-champion{display:grid;grid-template-columns:30px minmax(0,1fr);gap:9px;align-items:start;padding:11px 8px;border-bottom:1px solid #edf0ee}.pickle-champion:last-child{border-bottom:0}.champion-rank{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#fff0df;color:#9a6b08;font:bold 12px Arial,sans-serif}.pickle-champion div{display:flex;flex-direction:column;gap:2px}.pickle-champion small{color:#68756f;font-size:13px;font-weight:700}.pickle-champion strong{color:#087849;font-size:16px;line-height:1.35}.pickle-champion span:last-child{color:#7a858b;font-size:13px}.ranking-board{width:min(1400px,100%);margin:22px auto 0}.ranking-board-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid #edf0ee;background:linear-gradient(90deg,#f4fbf7,#fffdf6)}.ranking-board-head>span{font-size:31px}.ranking-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}.ranking-table{width:100%;min-width:1040px;border-collapse:collapse;font-size:14px}.ranking-table th{background:#eaf5ef;color:#176047;font-weight:800;text-align:center;padding:12px 8px;border:1px solid #d7e5dd;line-height:1.25}.ranking-table th:first-child{width:45px}.ranking-table th:nth-child(2){text-align:left;min-width:165px}.ranking-table td{padding:10px 8px;border:1px solid #e1e9e5;text-align:center;color:#33434b;font-weight:600}.ranking-table td:nth-child(2){text-align:left;color:#173d31;font-weight:800}.ranking-table tbody tr:nth-child(1){background:#fff9e4}.ranking-table tbody tr:nth-child(2){background:#f4f8fc}.ranking-table tbody tr:nth-child(3){background:#fff5ef}.ranking-table td.total{font-size:17px;color:#087849;font-weight:900}.ranking-table td.rank{font-weight:900;color:#9a6b08}.ranking-note{padding:14px 22px 22px;color:#62707b;font-size:14px}.ranking-note strong{color:#087849}.ranking-note:before{content:'CẬP NHẬT MÔN BÓNG ĐÁ';display:inline-block;margin-bottom:5px;padding:4px 9px;border-radius:999px;background:#f4ead0;color:#8b6824;font:800 10px Arial,sans-serif;letter-spacing:.1em}@media(max-width:950px){.champion-grid{grid-template-columns:1fr}.champion-card{max-width:760px;margin:0 auto;width:100%}}@media(max-width:700px){#champions-section{padding:30px 12px 36px}.champion-card-head{padding:16px}.podium-place{padding:11px 4px}.pickle-champion{padding:10px 4px}.ranking-board-head{padding:16px}.ranking-table{min-width:1000px}.ranking-note{padding:14px 16px 18px}}
`;
    const style=document.createElement('style');style.id='champions-inline-style';style.textContent=css;document.head.appendChild(style);
  }

  function footballCard(){return podiumCard('football','31',['32']);}
  function volleyCard(){return podiumCard('volley','12',[]);}
  function pickleCard(){return '<div class="pickle-champions">'+PICKLE_CHAMPIONS.map((x,i)=>'<div class="pickle-champion"><span class="champion-rank">'+(i+1)+'</span><div><small>'+esc(x.category)+'</small><strong>🏆 '+esc(x.winner)+'</strong><span>Chung kết · '+esc(x.score)+'</span></div></div>').join('')+'</div>';}

  function rankingCard(){
    const rows=TEAM_POINTS.map(r=>'<tr><td>'+r[0]+'</td><td>'+esc(r[1])+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td>'+r[4]+'</td><td>'+r[5]+'</td><td>'+r[6]+'</td><td>'+r[7]+'</td><td>'+r[8]+'</td><td class="total">'+r[9]+'</td><td class="rank">'+r[10]+'</td></tr>').join('');
    return '<div class="ranking-table-wrap"><table class="ranking-table"><thead><tr><th>STT</th><th>Đơn vị (chi nhánh)</th><th>Bóng đá<br>mini nam</th><th>Bóng chuyền<br>hơi nữ</th><th>Đôi nam<br>dưới 46t</th><th>Đôi nữ<br>dưới 46t</th><th>Đôi nam nữ<br>dưới 46t</th><th>Đôi nam<br>trên 45t</th><th>Đôi nữ<br>trên 45t</th><th>Tổng<br>điểm</th><th>Xếp<br>hạng</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="ranking-note"><strong>Ghi chú:</strong> Cơ cấu điểm theo Văn bản số 506 — Bóng đá mini nam: Nhất 120, Nhì 100, Ba 80; Bóng chuyền hơi nữ: Nhất 100, Nhì 80, Ba 60; Pickleball (6 nội dung): Nhất 40, Nhì 30, Ba (đồng hạng ba) 20 điểm.</div>';
  }

  function render(){
    addStyles();
    let el=document.getElementById('champions-section');
    if(!el){el=document.createElement('section');el.id='champions-section';const anchor=document.querySelector('.content-section');if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(el,anchor);else document.querySelector('main')?.appendChild(el);}
    el.innerHTML='<div class="champions-head"><p class="section-kicker"><span class="kicker-icon">🏆</span> VINH DANH THÀNH TÍCH</p><h2>Vinh danh thành tích Hội thao</h2><p>Ba môn thi đấu · hiển thị giải nhất, giải nhì và giải ba theo kết quả đã cập nhật</p></div>'+
      '<div class="champion-grid">'+
      '<article class="champion-card football"><div class="champion-card-head"><span>⚽</span><div><small>BÓNG ĐÁ MINI NAM</small><h3>Thành tích</h3></div></div>'+footballCard()+'</article>'+ 
      '<article class="champion-card volley"><div class="champion-card-head"><span>🏐</span><div><small>BÓNG CHUYỀN HƠI NỮ</small><h3>Thành tích</h3></div></div>'+volleyCard()+'</article>'+ 
      '<article class="champion-card pickle"><div class="champion-card-head"><span>🏓</span><div><small>PICKLEBALL</small><h3>6 nội dung vô địch</h3></div></div>'+pickleCard()+'</article></div>'+ 
      '<div class="ranking-board"><div class="ranking-board-head"><span>🏅</span><div><small>THÀNH TÍCH TOÀN ĐOÀN</small><h3>Bảng tổng hợp điểm chính thức</h3></div></div>'+rankingCard()+'</div>';
  }

  const load=()=>fetch('api/results.php?ts='+Date.now(),{cache:'no-store',credentials:'same-origin'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{window.__HOI_THAO_RESULTS=(j&&j.ok)?(j.results||{}):{};render();}).catch(()=>{window.__HOI_THAO_RESULTS={};render();});
  const ready=window.HOI_THAO_MATCHES_READY||Promise.resolve();
  ready.catch(()=>{}).then(()=>{load();window.setInterval(load,60000);});
})();
