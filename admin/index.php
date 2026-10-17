<?php
// ADMIN-V14: result entry + editable teams for provisional knockout fixtures.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('AGRIBANK_ADMIN');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']);
session_start();
if (empty($_SESSION['sports_admin'])) { header('Location: login.php'); exit; }
?><!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Cache-Control" content="no-store">
<title>ADMIN-V14 · Nhập kết quả Hội thao Agribank 2026</title>
<style>
:root{--g:#087849;--gd:#075b3b;--ink:#173b2d;--line:#dbe5df;--bg:#f3f7f4;--gold:#e5c36b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);font:16px Arial,sans-serif;color:var(--ink)}
header{background:linear-gradient(120deg,var(--gd),var(--g));color:#fff;padding:22px max(16px,calc((100vw - 1200px)/2));border-bottom:5px solid var(--gold)}
header h1{margin:0;font-size:clamp(24px,4vw,34px)}header p{margin:6px 0 0;color:#e4f3e9}.badge{display:inline-block;margin-top:8px;padding:4px 8px;border:1px solid #ffffff66;border-radius:999px;font-size:12px}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.actions a{border:1px solid #ffffff70;background:#ffffff15;color:#fff;text-decoration:none;border-radius:8px;padding:9px 12px;font-weight:bold}
main{max-width:1200px;margin:22px auto;padding:0 14px}.panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px}
.filters{display:grid;grid-template-columns:220px 1fr;gap:10px}.filters input,.filters select{width:100%;min-height:43px;padding:9px;border:1px solid #cad9d0;border-radius:8px;font-size:16px}
.stats{margin:12px 0;color:#5d7066}.message{padding:10px;border-radius:8px;background:#e8f5ed;margin:10px 0;display:none}
.help{background:#fff7df;border-left:4px solid #d7a43b;padding:12px;border-radius:8px;margin-top:12px}.help b{color:#075b3b}
.match{display:grid;grid-template-columns:minmax(0,1fr) 180px 150px 90px;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}.match:last-child{border-bottom:0}
.match strong{display:block;color:var(--gd)}.muted{font-size:13px;color:#6b7d73;margin-top:4px}.match input,.match select{width:100%;min-height:40px;border:1px solid #cbd9d0;border-radius:8px;padding:8px;font-size:15px}.save{background:var(--g);color:#fff;border:0;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer}.save:disabled{opacity:.55}
.team-edit{grid-column:1/-1;background:#f5faf7;border:1px dashed #b9d7c6;border-radius:8px;padding:10px}.team-edit label{display:block;font-size:13px;font-weight:bold;color:#075b3b;margin-bottom:5px}.team-edit input{background:#fff}.provisional{color:#9a6a00;font-size:12px;margin-top:5px}
@media(max-width:800px){.match{grid-template-columns:1fr 1fr}.match .fixture,.team-edit{grid-column:1/-1}}@media(max-width:460px){.match{grid-template-columns:1fr}}
</style>
</head>
<body data-admin="1">
<header><h1>Nhập và cập nhật kết quả thi đấu</h1><p>Hội thao Agribank lần thứ X · Khu vực Miền núi và Trung du Bắc Bộ · Năm 2026</p><span class="badge">ADMIN-V14 · NHẬP ĐỘI THAY THẾ CHO BK/TK/CK</span><div class="actions"><a href="../dia-diem-lich-thi-dau.html" target="_blank">Xem lịch công khai ↗</a><a href="logout.php">Đăng xuất</a></div></header>
<main>
<section class="panel"><div class="filters"><select id="sport"><option value="">Tất cả môn</option><option value="football">Bóng đá mini nam</option><option value="volley">Bóng chuyền hơi nữ</option><option value="pickle">Pickleball</option></select><input id="search" placeholder="Tìm đội/chi nhánh, mã trận, ngày…"></div><div id="stats" class="stats">Đang tải danh sách trận…</div><div id="message" class="message" role="status"></div><div class="help"><strong>Cách nhập:</strong> tỷ số ở ô bên phải. Với trận đang ghi <b>Nhất A / Nhì D / Thắng TK1 / BK1 / CK</b>, thêm <b>tên hai đội thực tế</b> vào ô “Đội thi đấu thực tế”, rồi bấm <b>Lưu</b>. Tên đội này được lưu trong cơ sở dữ liệu và ưu tiên hiển thị trên trang công khai. Muốn xóa kết quả và tên đội thay thế: để trống tỷ số + tên đội, chọn “Chưa cập nhật”, rồi Lưu.</div></section>
<section class="panel"><div id="matches"></div></section>
</main>
<script src="../assets/matches.js?v=admin-v14"></script><script src="../assets/matches-extra.js?v=admin-v14"></script>
<script>
const datasets=window.HOI_THAO_MATCHES||{football:[],volley:[],pickle:[]};
const names={football:'Bóng đá mini nam',volley:'Bóng chuyền hơi nữ',pickle:'Pickleball'};let saved={};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fixture(sport,row,i){const teams=sport==='pickle'?row[6]:row[4];const meta=sport==='football'?'Giờ '+row[1]+' · Sân '+row[5]+' · Bảng/vòng '+row[3]:sport==='volley'?'Buổi '+row[1]+' · '+row[5]+' · Bảng/vòng '+row[3]:'Buổi '+row[1]+' · '+row[2]+' · '+row[4]+' · Bảng/vòng '+row[5];return{key:sport+'-'+i,sport,row,date:row[0],teams,meta,idx:i}}
function allFixtures(){return Object.keys(datasets).flatMap(s=>datasets[s].map((r,i)=>fixture(s,r,i)))}
function provisional(text){return /(?:Nhất|Nhì|Thắng|TK[1-4]|BK[1-2]|CK|tứ kết|bán kết|chưa xác định)/i.test(String(text||''))}
function render(){const sport=document.getElementById('sport').value,q=document.getElementById('search').value.trim().toLocaleLowerCase('vi');const all=allFixtures().filter(f=>(!sport||f.sport===sport)&&(!q||[f.key,names[f.sport],f.date,f.teams,f.meta,(saved[f.key]||{}).teams_override||''].join(' ').toLocaleLowerCase('vi').includes(q)));document.getElementById('stats').textContent='Hiển thị '+all.length+' trận · Đã có kết quả '+all.filter(f=>saved[f.key]&&saved[f.key].score).length+' trận';document.getElementById('matches').innerHTML=all.map(f=>{const r=saved[f.key]||{}, override=r.teams_override||'', canEdit=provisional(f.teams)||!!override;return '<div class="match"><div class="fixture"><strong>'+esc(names[f.sport])+' · '+esc(f.key)+'</strong><div>'+esc(override||f.teams)+'</div><div class="muted">'+esc(f.date+' · '+f.meta)+'</div></div><input aria-label="Tỷ số '+esc(f.key)+'" data-score="'+esc(f.key)+'" value="'+esc(r.score||'')+'" placeholder="Nhập tỷ số"><select aria-label="Trạng thái '+esc(f.key)+'" data-status="'+esc(f.key)+'"><option value="pending" '+((r.status||'pending')==='pending'?'selected':'')+'>Chưa cập nhật</option><option value="live" '+(r.status==='live'?'selected':'')+'>Đang thi đấu</option><option value="finished" '+(r.status==='finished'?'selected':'')+'>Kết thúc</option></select><button class="save" data-save="'+esc(f.key)+'">Lưu</button>'+(canEdit?'<div class="team-edit"><label>Đội thi đấu thực tế · dùng cho trận TK/BK/CK hoặc trận chưa biết đội</label><input data-teams="'+esc(f.key)+'" value="'+esc(override)+'" placeholder="Ví dụ: Thái Nguyên – Tuyên Quang"><div class="provisional">Nếu chưa xác định, để trống để dùng tên theo lịch gốc.</div></div>':'')+'</div>'}).join('')||'<p>Không có trận phù hợp.</p>';document.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click',()=>save(b.dataset.save)))}
async function load(){try{const r=await fetch('../api/results.php?ts='+Date.now(),{cache:'no-store'}),j=await r.json();if(j.ok)saved=j.results||{}}catch(e){}render()}
async function save(key){const f=allFixtures().find(x=>x.key===key);if(!f)return;const btn=document.querySelector('[data-save="'+key+'"]');btn.disabled=true;const score=document.querySelector('[data-score="'+key+'"]').value.trim();const status=document.querySelector('[data-status="'+key+'"]').value;const teamEl=document.querySelector('[data-teams="'+key+'"]');const teams_override=teamEl?teamEl.value.trim():(saved[key]?.teams_override||'');const payload={fixture_key:key,sport:f.sport,score,status,teams_override};try{const r=await fetch('../api/save-result.php?ts='+Date.now(),{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(payload)}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.message||'Lỗi lưu');const msg=document.getElementById('message');msg.textContent=j.message+' ('+key+')';msg.style.display='block';await load()}catch(e){const msg=document.getElementById('message');msg.textContent='Không lưu được: '+e.message;msg.style.display='block'}finally{btn.disabled=false}}
document.getElementById('sport').addEventListener('change',render);document.getElementById('search').addEventListener('input',render);Promise.resolve(window.HOI_THAO_MATCHES_READY||Promise.resolve()).catch(()=>{}).then(load);
</script>
</body></html>
