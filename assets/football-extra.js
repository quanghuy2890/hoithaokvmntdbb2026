/* Football schedule additions / corrections that can be deployed without replacing matches.js. */
(function () {
  const M = window.HOI_THAO_MATCHES || {};
  if (!Array.isArray(M.football)) return;

  // 18/10/2026: both knockout matches are scheduled at 07h30.
  const final = M.football.find(r => String(r[2]) === '31');
  if (final) final[1] = '07h30';

  // Add the third-place match if it is not already present.
  if (!M.football.some(r => String(r[2]) === '32')) {
    M.football.push([
      '18/10/2026',
      '07h30',
      '32',
      'Tranh giải ba',
      'Thua BK1 – Thua BK2',
      '1'
    ]);
  }
})();
