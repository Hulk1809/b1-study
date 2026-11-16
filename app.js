'use strict';
const { items, questions, topics, pages: photoPages, keys: answerKeys, transcriptReviews } = window.COURSE;
const $ = (s) => document.querySelector(s);
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let state;
try { state = JSON.parse(localStorage.getItem('b1-study') || '{}'); } catch { state = {}; }
if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
for (const key of ['done', 'answers', 'notes', 'practice']) if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) state[key] = {};
let timer;
let currentVideo = items.find((i) => i.name.includes('NHẬP KHÓA')).id;
let questionIndex = 0;
let topicIndex = 0;
let letterIndex = 0;
let photoIndex = 0;
let showKey = false;
let practiceTest = 1;
let practiceSkill = 'reading';
const videos = items.filter((i) => !i.folder && /RECORDING|30 CÂU/.test(i.path.join('/')) && (i.name.endsWith('.mp4') || !i.local));
videos.sort((a, b) => Number(b.name.includes('NHẬP KHÓA')) - Number(a.name.includes('NHẬP KHÓA')));
const sourceURL = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
const link = (id, label = 'Mở nguồn ↗') => `<a href="${sourceURL(id)}" target="_blank" rel="noopener">${label}</a>`;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
function save() { try { localStorage.setItem('b1-study', JSON.stringify(state)); } catch { toast('Không lưu được. Hãy xuất bản sao để tránh mất bài.'); } }
function heading(title, subtitle, eyebrow = 'B1 STUDY STUDIO') { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${subtitle}</p></div><span class="date-chip">Một chút mỗi ngày, tiến xa hơn.</span></div>`; }
function completed(prefix) { return Object.keys(state.done).filter((k) => k.startsWith(prefix) && state.done[k]).length; }
function skill(title, symbol, detail, href, prefix, total, tag) { const count = completed(prefix); return `<a class="skill-card" href="#${href}"><div class="skill-top"><span class="skill-symbol">${symbol}</span><span class="tag">${tag}</span></div><h3>${title}</h3><p>${detail}</p><div class="track"><span style="width:${Math.min(100, count / total * 100)}%"></span></div><div class="progress-caption"><span>${count}/${total} đã tự đánh dấu</span><span>↗</span></div></a>`; }
function home() {
  const done = Object.values(state.done).filter(Boolean).length;
  return heading('Chào bạn, cùng học B1 nhé.', 'Không cần vội. Mỗi bài học là một bước gần hơn đến mục tiêu.', 'GÓC HỌC TIẾNG ANH CỦA BẠN') + `
  <section class="hero"><div class="hero-copy"><div class="eyebrow">ÔN ĐÚNG PHẦN · GIỮ ĐÚNG NGUỒN</div><h2>Hiểu phạm vi.<br>Ôn tập <em>có trọng tâm.</em></h2><p>Ảnh đề Test 1 và Test 2 đã xếp đúng phần. Làm bài bên ảnh, đối chiếu đáp án gốc, giữ lại câu cần ôn.</p><a class="button" href="#practice">Ôn theo ảnh đề <span>↗</span></a></div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="book"><small>ENGLISH / STUDY</small><strong>B1</strong><span>one step at a time.</span></div><span class="art-label">Make progress, not perfect.</span><span class="art-star">✳</span></div></section>
  <section class="stats" aria-label="Tổng quan khóa học"><div class="stat"><span class="stat-icon">▷</span><div><strong>${videos.length}</strong><small>Video bài giảng</small></div></div><div class="stat"><span class="stat-icon">▤</span><div><strong>${items.filter((i) => i.local).length}</strong><small>Tài liệu đã tải</small></div></div><div class="stat"><span class="stat-icon">✎</span><div><strong>30</strong><small>Câu luyện viết</small></div></div><div class="stat"><span class="stat-icon">✓</span><div><strong>${done}</strong><small>Mục đã hoàn thành</small></div></div></section>
  <div class="columns"><section><div class="section-title"><h2>Góc luyện kỹ năng</h2><a class="text-link" href="#library">Tất cả tài liệu ↗</a></div><div class="skill-grid">
  ${skill('Listening · Nghe','♬','Test 1 có ảnh đề · Audio nguồn Drive','practice?skill=listening','listen-',10,'PHẠM VI 10 TESTS')}
  ${skill('Reading · Đọc','▤','Test 1 & 2 có đủ ảnh 5 phần đọc','practice','read-',10,'ẢNH ĐỀ MỚI')}
  ${skill('Writing · Viết','✎','30 câu viết lại & 10 bài viết thư','writing','write-',30,'THỰC HÀNH')}
  ${skill('Speaking · Nói','♧','10 chủ đề · Bài mẫu & bấm giờ','speaking','speak-',10,'10 TOPICS')}</div>
  <div class="info-strip"><span class="skill-symbol">▧</span><div><strong>Điều quan trọng trước khi bắt đầu</strong><br><span>Xem dặn dò, phạm vi ôn và cấu trúc bài thi.</span></div><a href="#scope">Đọc dặn dò ↗</a></div></section>
  <aside class="right-column"><section class="panel notice"><div class="eyebrow">ĐỌC TRƯỚC KHI HỌC</div><h3 style="margin-top:10px">Đúng tài liệu. Đúng phạm vi.</h3><p>Phạm vi hiện lấy từ ảnh dặn dò. Video đang được chép lời tự động; chưa xác minh hết phần học / bỏ.</p><a href="#scope">Xem nguồn & điểm cần đối chiếu</a></section><section class="panel"><h3>Bắt đầu từ đâu?</h3><ol class="checklist"><li>Đọc dặn dò quan trọng<small>Nắm cấu trúc & phạm vi ôn</small></li><li>Xem video nhập khóa<small>Giữ ngữ cảnh lời giảng</small></li><li>Luyện một kỹ năng hôm nay<small>Viết 5 câu hoặc nói 1 chủ đề</small></li></ol><a class="text-link" href="#videos">Mở video nhập khóa ↗</a></section></aside></div>`;
}
function videoPage() {
  const v = items.find((i) => i.id === currentVideo);
  return heading('Lớp học video', 'Giữ nguyên bài giảng gốc. Ghi lại mốc thời gian quan trọng khi học.') + `<div class="warning">Chưa xác minh toàn bộ lời giảng. Không coi tên video là kết luận về phần được bỏ.</div><div class="video-layout"><section><iframe class="player" title="${escapeHTML(v.name)}" src="https://drive.google.com/file/d/${v.id}/preview" allow="fullscreen" allowfullscreen></iframe><div class="video-detail"><h2>${escapeHTML(v.name)}</h2><div class="actions">${link(v.id, 'Mở trên Drive nếu trình phát lỗi ↗')}<label class="complete"><input type="checkbox" data-done="video-${v.id}" ${state.done['video-' + v.id] ? 'checked' : ''}> Đã xem</label></div><label for="video-notes" style="margin-top:20px">Ghi chú bài giảng · thêm mốc phút:giây và lời thầy dặn</label><textarea id="video-notes" data-note="${v.id}" placeholder="Ví dụ: 12:35 — cần đối chiếu hướng dẫn phần này…">${escapeHTML(state.notes[v.id] || '')}</textarea><p class="fine-print">Ghi chú cá nhân, không phải kết luận đã được xác minh.</p></div></section><section class="video-list" aria-label="Danh sách video">${videos.map((i, n) => `<button class="video-choice ${i.id === v.id ? 'active' : ''}" data-video="${i.id}" aria-pressed="${i.id === v.id}"><small>BÀI GIẢNG ${String(n + 1).padStart(2, '0')}</small>${escapeHTML(i.name)}</button>`).join('')}</section></div>`;
}
function writingPage() {
  const q = questions[questionIndex];
  return heading('Luyện viết, từng câu một.', 'Đề và đáp án trích nguyên tài liệu khóa học. Tự đối chiếu, không chấm sai vì khác cách diễn đạt.') + `<div class="toolbar"><label for="question-select">Chọn câu</label><select id="question-select">${questions.map((i, n) => `<option value="${n}" ${n === questionIndex ? 'selected' : ''}>Câu ${i.number}${state.done['write-' + i.number] ? ' · Đã ôn' : ''}</option>`).join('')}</select><a class="button secondary" href="#library?skill=thư">10 bài viết thư ↗</a></div><div class="split"><section class="practice"><div class="eyebrow">WRITING PART 1 · CÂU ${q.number} / 30</div><p class="question">${escapeHTML(q.prompt)}</p><p class="starter">Bắt đầu bằng: <strong>${escapeHTML(q.starter)}</strong></p><label for="writing-answer">Viết lại cả câu, giữ nguyên nghĩa</label><textarea id="writing-answer" data-answer="${q.number}" lang="en" spellcheck="true" placeholder="${escapeHTML(q.starter)}…">${escapeHTML(state.answers[q.number] || '')}</textarea><details><summary>Xem đáp án trong tài liệu</summary><ul>${q.answers.map((a) => `<li lang="en">${escapeHTML(a)}</li>`).join('')}</ul><p class="fine-print">Giữ nguyên đáp án nguồn, không tự khẳng định mọi phương án đều chuẩn ngữ pháp. Nếu nghi ngờ, đối chiếu video “30 CÂU VIẾT”.</p>${link('1xtUbJm04A_Fk8iGroaq93DqjIyukVI5y')}</details><label class="complete"><input type="checkbox" data-done="write-${q.number}" ${state.done['write-' + q.number] ? 'checked' : ''}> Tôi đã ôn và đối chiếu câu này</label><div class="actions"><button class="button secondary" data-question="${questionIndex - 1}" ${questionIndex === 0 ? 'disabled' : ''}>← Câu trước</button><button class="button" data-question="${questionIndex + 1}" ${questionIndex === 29 ? 'disabled' : ''}>Câu tiếp →</button></div></section><aside><section class="panel"><h3>Viết để hiểu, không chỉ nhớ đáp án</h3><p>Đọc câu gốc, xác định cấu trúc, viết lại rồi mới mở đáp án. Các cách viết đúng khác vẫn có thể được chấp nhận.</p><p>Ảnh dặn dò nêu: bài thi có 5 câu; 3 câu giống bộ ôn, 2 câu thay đổi nhưng cùng cấu trúc.</p>${link('1nALBDlkgPjg7pBCwP4VnF8wuW8NC_iUP', 'Xem video 30 câu viết ↗')}</section><section class="panel"><h3>Viết thư · 120–150 từ</h3><label for="letter">Bản nháp của bạn</label><textarea id="letter" data-note="letter" lang="en" placeholder="Dear…">${escapeHTML(state.notes.letter || '')}</textarea><output id="word-count"></output><p class="fine-print">Chỉ đếm từ; chưa tự chấm nội dung hay ngữ pháp.</p></section></aside></div>`;
}
function lettersPage() {
  const letter = window.COURSE.letters[letterIndex];
  const prompt = photoPages.find(p => p.test === letter.number && p.skill === 'letter');
  return heading('10 lá thư · bài mẫu gốc.', 'Tách riêng bộ 30 câu viết lại. Chép từ 10 ảnh tài liệu; không tự tạo đề thi cho test chưa có ảnh đề.') + `<div class="toolbar"><label for="letter-select">Chọn lá thư</label><select id="letter-select">${window.COURSE.letters.map((l, i) => `<option value="${i}" ${i === letterIndex ? 'selected' : ''}>Test ${l.number} · ${escapeHTML(l.title)}</option>`).join('')}</select><a class="button secondary" href="#writing">30 câu viết lại</a></div><div class="warning">Mục tiêu luyện: khoảng 120 từ trở lên theo các đoạn dặn trong bản chép recording; chưa xác minh trực tiếp hết âm thanh. Bài mẫu gốc có thể dài hơn. Thay tên và chi tiết cá nhân; không chép phần hướng dẫn trong ngoặc vào bài thi.</div><div class="split"><section class="practice"><h2>Test ${letter.number} · ${escapeHTML(letter.title)}</h2>${prompt ? `<details><summary>Đề lá thư từ ảnh sách</summary><div class="body-text">${escapeHTML(prompt.text)}</div></details>` : '<p class="fine-print">Chưa có ảnh đề Question 7 của test này để đối chiếu. Dưới đây là bài mẫu nguồn, không phải đề bài.</p>'}<p class="fine-print">${(letter.body.match(/\S+/g) || []).length} mục phân tách bằng khoảng trắng, tính cả lời chào, chữ ký và chỗ điền; không phải số từ bài thi đã hoàn thiện.</p><div class="exam-text letter-body" lang="en">${escapeHTML(letter.body)}</div><details><summary>Đối chiếu ảnh bài mẫu gốc</summary><a href="${encodeURI(letter.src)}" target="_blank" rel="noopener"><img class="source-image" src="${encodeURI(letter.src)}" alt="Bài mẫu lá thư Test ${letter.number}"></a>${link(letter.source)}</details></section><aside class="panel"><label for="photo-letter">Bản nháp thư Test ${letter.number} · lưu riêng từng test</label><textarea id="photo-letter" data-note="letter-test-${letter.number}" lang="en" rows="16">${escapeHTML(state.notes[`letter-test-${letter.number}`] || '')}</textarea><output id="photo-letter-count"></output><label class="complete"><input type="checkbox" data-done="letter-${letter.number}" ${state.done[`letter-${letter.number}`] ? 'checked' : ''}> Đã luyện và đối chiếu nguồn</label></aside></div>`;
}
function speakingPage() {
  const t = topics[topicIndex];
  return heading('Nói tự tin hơn, mỗi ngày.', '10 chủ đề và bài mẫu gốc. Đổi [Name], chi tiết cá nhân theo chính bạn.') + `<div class="toolbar"><label for="topic-select">Chủ đề</label><select id="topic-select">${topics.map((i, n) => `<option value="${n}" ${n === topicIndex ? 'selected' : ''}>Topic ${i.number}</option>`).join('')}</select></div><div class="split"><section class="practice"><div class="eyebrow">SPEAKING · TOPIC ${t.number}</div><h2 class="question" lang="en">${escapeHTML(t.title)}</h2><details open><summary>Bài mẫu trong tài liệu</summary><div class="body-text" lang="en">${escapeHTML(t.body)}</div>${link(t.source)}</details><label class="complete"><input type="checkbox" data-done="speak-${t.number}" ${state.done['speak-' + t.number] ? 'checked' : ''}> Tôi đã luyện chủ đề này</label></section><aside><section class="panel timer-panel"><h3>Bấm giờ luyện nói</h3><label for="duration">Thời lượng tự chọn</label><select id="duration"><option value="90">90 giây · theo tên thư mục</option><option value="120">120 giây · theo cấu trúc thi</option></select><div class="timer" id="timer" role="timer">01:30</div><div class="actions" style="justify-content:center"><button class="button" id="start-timer">Bắt đầu</button><button class="button secondary" id="reset-timer">Đặt lại</button></div><output id="timer-status" aria-live="polite"></output></section><div class="warning">Nguồn chưa thống nhất: tên thư mục ghi 90 giây; PDF cấu trúc ghi 2 phút. Cần đối chiếu video và thông báo thi mới nhất.</div><section class="panel"><label for="speaking-note">Ý chính & từ cần nhớ</label><textarea id="speaking-note" data-note="topic-${t.number}">${escapeHTML(state.notes['topic-' + t.number] || '')}</textarea></section></aside></div>`;
}
function libraryPage() {
  return heading('Kho tài liệu khóa B1', 'Tài liệu gốc đã tải, video và audio trên Drive. Tìm theo tên hoặc kỹ năng.') + `<div class="warning">Chưa thấy file trong danh sách công khai của thư mục Đọc hiểu và Nói Part II. Chưa đủ đề đọc/nghe để tạo bộ thi có đáp án; không dùng câu hỏi tự bịa thay thế.</div><div class="toolbar"><input type="search" id="resource-search" aria-label="Tìm tài liệu" placeholder="Tìm tài liệu, ví dụ: nghe, thư, topic…"><select id="resource-filter" aria-label="Lọc loại tài liệu"><option value="">Tất cả loại</option><option value="pdf">PDF</option><option value="image">Ảnh</option><option value="video">Video</option><option value="audio">Audio ZIP</option></select></div><div id="resources" class="resource-list"></div>`;
}
function resourceType(i) { return /\.(jpg|png)$/i.test(i.name) ? 'image' : i.name.endsWith('.zip') ? 'audio' : i.local?.endsWith('.pdf') ? 'pdf' : i.local ? 'docx' : 'video'; }
function resources(query = '', type = '') {
  const fold = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').toLowerCase();
  const list = items.filter((i) => !i.folder && fold(i.name + ' ' + i.path.join(' ')).includes(fold(query)) && (!type || resourceType(i) === type));
  $('#resources').innerHTML = list.length ? list.map((i) => `<article class="resource"><span class="resource-icon">${resourceType(i).toUpperCase()}</span><div class="resource-text"><h3>${escapeHTML(i.name)}</h3><small>${escapeHTML(i.path.slice(1).join(' / '))}</small></div>${i.local ? `<a href="${encodeURI(i.local)}" target="_blank" rel="noopener">Bản đã tải ↗</a>` : ''}${link(i.id)}</article>`).join('') : '<p class="empty">Không có tài liệu khớp tìm kiếm.</p>';
}
function scopePage() { return heading('Học phần nào? Bỏ phần nào?', 'Chỉ kết luận khi có nguồn. Phân biệt dặn dò đã đọc và lời giảng chưa kiểm chứng.') + `<div class="split"><section class="practice"><h2>Phạm vi ghi trong ảnh dặn dò</h2><ul><li>Nghe: học trọn test 1–10, 25 câu/test.</li><li>Đọc: học trọn test 1–10, 35 câu/test.</li><li>Các phần có thể được trộn giữa nhiều test. Không học tủ.</li><li>Nói: topic 1–10. Theo ảnh, trung tâm sẽ gửi 5 topic trước thi khoảng 4–5 ngày; chờ thông báo thật, không tự chọn bỏ 5 topic.</li><li>Viết Part 1: ôn 30 câu và cấu trúc tương ứng.</li><li>Viết Part 2: học lá thư test 1–10.</li></ul><p class="fine-print">Ảnh có ví dụ nhắc “test 12” dù phạm vi ghi 1–10. Giữ nguyên mâu thuẫn, cần hỏi giảng viên.</p>${link('1Lpid_iAB-L40CaKh2AbBD8OSI5nCi1vM')}<img class="source-image" src="materials/1Lpid_iAB-L40CaKh2AbBD8OSI5nCi1vM.jpg" alt="Ảnh dặn dò gốc: phạm vi ôn nghe, nói, đọc, viết B1"></section><aside><section class="panel"><h3>Cấu trúc theo PDF</h3><p>Nghe 30 phút · Đọc 60 phút · Viết 30 phút.<br>Viết thư/story: 120–150 từ.<br>Nói theo cặp, chủ đề 2 phút rồi trả lời câu hỏi.</p><p>Điều kiện đạt: trung bình 4 kỹ năng ≥ 5, không kỹ năng nào &lt; 3.</p>${link('1sgBbAMh98fnnPpMPv32IHC8-s9Fxq6hd')}</section><div class="warning">Chưa hoàn tất kiểm tra 14 video. Bản chép lời tự động không đủ để khẳng định phần được bỏ; cần nghe lại và ghi mốc thời gian.</div><section class="panel"><h3>Phần chưa đủ nguồn</h3><p>Chưa có bộ đề đọc/nghe đầy đủ trong file đã tải. Audio đang ở dạng ZIP. Chưa có danh sách bỏ phần nào được xác minh từ video.</p></section></aside></div>`; }
function notesPage() { return heading('Ghi chú của tôi', 'Lưu cục bộ trên trình duyệt này. Xuất bản sao trước khi đổi máy hoặc xóa dữ liệu trình duyệt.') + `<div class="backup"><button class="button" id="export">Xuất tiến độ & ghi chú</button></div><section class="practice"><label for="general-notes">Sổ học tập</label><textarea id="general-notes" data-note="general" style="min-height:220px">${escapeHTML(state.notes.general || '')}</textarea></section><h2 style="margin:25px 0 15px">Ghi chú theo bài</h2>${Object.entries(state.notes).filter(([key, value]) => key !== 'general' && value).map(([key, value]) => `<article class="panel"><h3>${escapeHTML(items.find((i) => i.id === key)?.name || key)}</h3><p class="body-text">${escapeHTML(value)}</p></article>`).join('')}`; }
function scopeRules() {
  return `<section class="scope-grid" aria-label="Phạm vi ôn tập"><article class="scope-card learn"><strong>HỌC</strong><h3>Đọc & nghe test 1–10</h3><p>Đọc: 5 phần, 35 câu. Nghe: 4 phần, 25 câu. Không tự bỏ test.</p><small>Nguồn: ảnh dặn dò; nhập khóa khoảng 10:27–11:09.</small></article><article class="scope-card skip"><strong>BỎ TRONG SÁCH</strong><h3>Writing Part 1 & Part 2</h3><p>Áp dụng phần viết của sách 10 test. Không nhầm với bộ 30 câu riêng.</p><small>Nhập khóa khoảng 01:10:04–01:10:25.</small></article><article class="scope-card learn"><strong>HỌC RIÊNG</strong><h3>30 câu & lá thư</h3><p>30 câu viết lại riêng + lá thư ở Part 3 trong sách. Không đưa bài story vào bài ôn thư.</p><small>Nhập khóa khoảng 11:19–12:41 và 01:10:27–01:11:00.</small></article><article class="scope-card pending"><strong>CHỜ THÔNG BÁO</strong><h3>Nói: ôn 10 topic trước</h3><p>Chỉ rút còn 5 khi có thông báo thật từ trung tâm. Miễn kỹ năng do bảo lưu là trường hợp cá nhân.</p><small>Ảnh dặn dò; nhập khóa khoảng 47:39–48:10 nói với một học viên.</small></article></section><p class="fine-print">Mốc video dựa trên bản chép lời tự động và đối chiếu khung hình nhập khóa. Chưa kiểm chứng trực tiếp toàn bộ âm thanh của 14 video.</p>`;
}
function practicePage() {
  const available = photoPages.filter((p) => p.test === practiceTest && p.skill === practiceSkill);
  photoIndex = Math.min(photoIndex, Math.max(0, available.length - 1));
  const page = available[photoIndex];
  const key = `${practiceTest}-${practiceSkill}`;
  const answers = state.practice[key] || {};
  const expected = answerKeys[key];
  let content = '<div class="empty">Chưa có ảnh cho mục này. Chọn Đọc, Nghe hoặc Thư của Test 1/2.</div>';
  if (page) {
    const letter = practiceSkill === 'letter';
    const fields = letter ? `<p class="warning">Chỉ ôn <strong>Part 3 · Question 7 (lá thư)</strong>. Part 2 và Question 8 (story) có trong ảnh gốc nhưng không đưa vào bài này.</p><label for="photo-letter">Bản nháp lá thư Test ${practiceTest}</label><textarea id="photo-letter" data-note="letter-test-${practiceTest}" lang="en" rows="12">${escapeHTML(state.notes[`letter-test-${practiceTest}`] || '')}</textarea><output id="photo-letter-count"></output><p class="fine-print">Thầy đính chính khoảng 01:11:36–01:11:46: viết khoảng 120 từ, không lấy yêu cầu 100 từ in trong sách làm mục tiêu của khóa.</p>` : `<div class="answer-grid">${Array.from({ length: page.last - page.first + 1 }, (_, index) => {
      const n = page.first + index;
      const choices = practiceSkill === 'reading' ? n <= 5 ? ['A','B','C'] : n <= 10 ? ['A','B','C','D','E','F','G','H'] : n <= 20 ? ['A','B'] : ['A','B','C','D'] : n <= 13 ? ['A','B','C'] : n >= 20 ? ['YES','NO'] : null;
      const input = choices ? `<select id="answer-${n}" data-practice="${key}" data-number="${n}"><option value="">—</option>${choices.map((c) => `<option ${answers[n] === c ? 'selected' : ''}>${c}</option>`).join('')}</select>` : `<input id="answer-${n}" data-practice="${key}" data-number="${n}" value="${escapeHTML(answers[n] || '')}" autocomplete="off" lang="en">`;
      const review = window.COURSE.answerReviews?.[key]?.[n - 1];
      return `<div class="answer-field"><label for="answer-${n}">Câu ${n}</label>${input}${showKey ? `<small class="key-answer">Đáp án nguồn: ${escapeHTML(expected[n - 1])}</small>${review ? `<details><summary>${review.status === 'conditional' ? 'Đối chiếu: có điều kiện / suy luận' : 'Căn cứ đối chiếu đề'}</summary><p>${escapeHTML(review.note)}</p><p class="fine-print">Rà độc lập theo đề chữ; chưa phải xác nhận của giảng viên.</p></details>` : '<small>Chưa xác minh từng đáp án với nội dung audio.</small>'}` : ''}</div>`;
    }).join('')}</div><div class="actions"><button class="button" id="toggle-key">${showKey ? 'Ẩn đáp án' : 'Đối chiếu đáp án'}</button><label class="complete"><input type="checkbox" data-done="${practiceSkill === 'reading' ? 'read' : 'listen'}-${practiceTest}" ${state.done[`${practiceSkill === 'reading' ? 'read' : 'listen'}-${practiceTest}`] ? 'checked' : ''}> Đã ôn test này</label></div><p class="fine-print">Không chấm máy câu điền từ để tránh đánh sai cách viết tương đương. Đọc câu 11–20: A/B theo đề. Nghe câu 20–25: YES/NO. Dấu chọn sẵn trên ảnh không phải đáp án.</p>`;
    content = `<div class="photo-layout"><section class="photo-panel"><div class="section-title"><h2>${escapeHTML(page.title)}</h2><a class="text-link" href="${encodeURI(page.original)}" target="_blank" rel="noopener">Mở ảnh gốc ↗</a></div><div class="photo-controls"><button class="button secondary" data-photo-step="-1" ${photoIndex === 0 ? 'disabled' : ''}>← Trang trước</button><span>${photoIndex + 1} / ${available.length}</span><button class="button secondary" data-photo-step="1" ${photoIndex === available.length - 1 ? 'disabled' : ''}>Trang sau →</button></div><p class="fine-print">Nhấn ảnh để mở lớn. Ảnh viết được giữ nguyên; chỉ học khu vực lá thư Question 7.</p><a href="${encodeURI(page.src)}" target="_blank" rel="noopener"><img class="exam-photo" src="${encodeURI(page.src)}" alt="Test ${page.test}, ${escapeHTML(page.title)}" decoding="async"></a></section><aside class="practice answer-panel"><div class="eyebrow">TEST ${practiceTest} · ${letter ? 'VIẾT THƯ' : practiceSkill === 'reading' ? 'ĐỌC HIỂU' : 'NGHE'}</div><h2 style="margin-top:8px">${letter ? 'Viết bên cạnh đề' : 'Phiếu trả lời của bạn'}</h2>${practiceSkill === 'listening' ? '<p class="warning">Ảnh đề không có âm thanh. Mở Audio B1.zip trong kho tài liệu, chọn đúng Test 1; video dịch không thay thế audio bài thi.</p><a class="button secondary" href="#library?skill=Audio">Mở nguồn audio ↗</a>' : ''}${fields}<details><summary>Nguồn & lưu ý</summary>${link('1S2dTmSCUHkO83Wf3SYa8GYGEWsrjxHtB', 'PDF đáp án gốc · trang 78 ↗')}<p class="fine-print">Nguồn đề: ảnh bạn cung cấp. Đáp án Test 1/2 lấy từ đúng mục trong PDF, không suy từ ghi chú viết tay.</p></details><label for="photo-note">Ghi chú câu khó</label><textarea id="photo-note" data-note="photo-${key}">${escapeHTML(state.notes['photo-' + key] || '')}</textarea></aside></div>`;
  }
  return heading('Đọc đề rõ, làm bài dễ hơn.', 'Đề và bài đọc đã chép thành chữ lớn. Ảnh gốc giữ riêng để đối chiếu, không dùng dấu viết tay làm đáp án.') + `<details class="photo-quality"><summary>Ảnh cần chụp lại · ${photoPages.filter((p) => p.quality).length} ảnh</summary>${photoPages.filter((p) => p.quality).map((p) => `<p>${escapeHTML(p.quality)}<br><strong>File: ${escapeHTML(p.original.split('/').pop())}</strong></p>`).join('')}<p>Các trang còn lại đọc được nội dung chính ở ảnh gốc hiện tại; không cần chụp lại toàn bộ. Phần trang bên cạnh bị lọt vào ảnh không được coi là trang đề đầy đủ.</p></details><div class="toolbar"><label for="practice-test">Bộ đề</label><select id="practice-test"><option value="1" ${practiceTest === 1 ? 'selected' : ''}>Test 1</option><option value="2" ${practiceTest === 2 ? 'selected' : ''}>Test 2</option></select><label for="practice-skill">Kỹ năng</label><select id="practice-skill"><option value="reading" ${practiceSkill === 'reading' ? 'selected' : ''}>Đọc hiểu</option><option value="listening" ${practiceSkill === 'listening' ? 'selected' : ''}>Nghe</option><option value="letter" ${practiceSkill === 'letter' ? 'selected' : ''}>Viết thư · Part 3</option></select><a class="button secondary" href="#scope">Học gì / bỏ gì?</a></div>${content}`;
}
const pageNames = { home: 'Tổng quan', practice: 'Ôn theo ảnh đề', videos: 'Lớp học video', writing: 'Luyện viết', letters: '10 lá thư', speaking: 'Luyện nói', library: 'Kho tài liệu', notes: 'Ghi chú của tôi', scope: 'Dặn dò & phạm vi' };
function render() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  clearInterval(timer);
  const [route, search = ''] = location.hash.slice(1).split('?');
  const view = pageNames[route] ? route : 'home';
  document.querySelectorAll('nav a').forEach((a) => { a.classList.toggle('active', a.dataset.view === view); if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#breadcrumb').textContent = pageNames[view];
  if (view === 'practice' && new URLSearchParams(search).get('skill') === 'listening') practiceSkill = 'listening';
  const pages = { home, practice: practicePage, videos: videoPage, writing: writingPage, letters: lettersPage, speaking: speakingPage, library: libraryPage, scope: scopePage, notes: notesPage };
  $('#main').innerHTML = pages[view]();
  if (view === 'writing') {
    const question = questions[questionIndex];
    const review = question.review;
    if (review) {
      const panel = document.createElement('section'); panel.className = 'panel answer-review';
      const labels = {ok: 'Phù hợp ngữ pháp và nghĩa trong ngữ cảnh bài', fix: 'Có phương án nguồn cần sửa / không nên dùng', conditional: 'Cần lưu ý điều kiện hoặc độ sát nghĩa'};
      panel.innerHTML = `<h3>Rà câu ${question.number} · ${labels[review.status]}</h3><p>${escapeHTML(review.note)}</p><details><summary>Xem phương án nên luyện theo đề hiện tại</summary><ul>${review.recommended.map(answer => `<li lang="en">${escapeHTML(answer)}</li>`).join('')}</ul></details><p class="fine-print">${escapeHTML(review.basis)}</p>`;
      $('#main .practice').append(panel);
    }
    const lettersLink = $('#main a[href="#library?skill=thư"]');
    if (lettersLink) { lettersLink.href = '#letters'; lettersLink.textContent = 'Luyện đủ 10 lá thư'; }
    const title = [...document.querySelectorAll('#main h3')].find(el => el.textContent.includes('120–150'));
    if (title) title.textContent = 'Viết thư · mục tiêu khoảng 120 từ trở lên';
    const count = $('#word-count');
    if (count) count.textContent = count.textContent.replace('120–150', 'khoảng 120 từ trở lên');
    if (qNeedsReview(questionIndex + 1)) {
      const warning = document.createElement('p'); warning.className = 'warning';
      warning.textContent = 'Câu 10 cần đối chiếu recording “30 CÂU VIẾT”, 44:28–45:40: bản nháp có lời sửa từ/thì trong câu, chưa đủ để kết luận bỏ câu 10. Đáp án PDF vẫn giữ nguyên, không tự sửa khi chưa xác minh âm thanh.';
      $('#main .practice').prepend(warning);
    }
  }
  if (view === 'videos') {
    const audit = window.COURSE.recordingAudit?.find(r => r.id === currentVideo);
    if (audit) {
      const panel = document.createElement('section'); panel.className = 'panel';
      panel.innerHTML = `<h3>Trạng thái rà recording này</h3><p>Đã có bản nháp ${audit.segments} đoạn, ${(audit.duration / 60).toFixed(1)} phút. <strong>Chưa xác minh từng lời bằng âm thanh.</strong> Có ${audit.gaps.length} khoảng trống trên 30 giây cần kiểm tra, không mặc định là im lặng.</p><details><summary>${audit.candidates.length} mốc nghi có dặn dò / sửa bài cần nghe lại</summary>${audit.candidates.map(c => { const t = Math.floor(c.start); const stamp = `${Math.floor(t/3600)}:${String(Math.floor(t%3600/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`; return `<p><a href="${sourceURL(audit.id)}?t=${t}" target="_blank" rel="noopener">${stamp} · Mở nguồn</a><br>${escapeHTML(c.context)}</p>`; }).join('')}</details><p class="fine-print">Danh sách tự động chỉ giúp tìm đoạn. Có thể nhận sai hoặc bỏ sót lời; không phải kết luận phạm vi.</p>`;
      $('#main .video-detail').append(panel);
    }
  }
  if (view === 'practice') {
    const page = photoPages.filter((p) => p.test === practiceTest && p.skill === practiceSkill)[photoIndex];
    if (page) {
      const panel = $('#main .photo-panel');
      const pagePicker = document.createElement('div'); pagePicker.className = 'toolbar';
      const available = photoPages.filter((p) => p.test === practiceTest && p.skill === practiceSkill);
      pagePicker.innerHTML = `<label for="practice-page">Đến phần cần ôn</label><select id="practice-page">${available.map((p, index) => `<option value="${index}" ${index === photoIndex ? 'selected' : ''}>${escapeHTML(p.title)}</option>`).join('')}</select><button class="button secondary" id="print-exam">In / lưu PDF đề chữ</button>`;
      panel.querySelector('.photo-controls').after(pagePicker);
      if (practiceSkill === 'listening') {
        const parts = [...new Set(Array.from({length: page.last - page.first + 1}, (_, n) => { const q = page.first + n; return q <= 7 ? 1 : q <= 13 ? 2 : q <= 19 ? 3 : 4; }))];
        const audioPanel = document.createElement('section'); audioPanel.className = 'audio-panel';
        audioPanel.innerHTML = parts.map((part) => {
          const tracks = window.COURSE.audio.filter((a) => a.test === practiceTest && a.part === part);
          if (tracks.length !== 1) return '<p class="warning">Chưa xác định duy nhất track phù hợp. Không phát track khác thay thế.</p>';
          const track = tracks[0]; const range = {1:'1–7',2:'8–13',3:'14–19',4:'20–25'}[part];
          return `<div class="audio-track"><h3>Test ${practiceTest} · Listening Part ${part} · Câu ${range}</h3><audio controls preload="metadata" aria-label="Test ${practiceTest} Listening Part ${part}"><source src="${encodeURI(track.src)}" type="audio/mpeg"></audio><small>File: ${escapeHTML(track.name)}</small><a href="${encodeURI(track.src)}" target="_blank" rel="noopener">Mở audio riêng ↗</a></div>`;
        }).join('');
        const warning = $('#main .answer-panel .warning');
        if (warning) { const oldLink = warning.nextElementSibling; if (oldLink?.tagName === 'A') oldLink.remove(); warning.replaceWith(audioPanel); }
      }
      const imageLink = panel.querySelector('a:has(.exam-photo)');
      const original = document.createElement('details');
      original.innerHTML = '<summary>Xem ảnh nguyên trang để đối chiếu</summary>';
      imageLink.replaceWith(original); original.append(imageLink);
      const section = document.createElement('section'); section.className = 'transcribed-exam';
      section.innerHTML = `${page.quality ? `<div class="warning">${escapeHTML(page.quality)}</div>` : ''}<div class="section-title"><h3>Đề dạng chữ</h3><button class="button secondary" id="toggle-exam-font" aria-pressed="false">Chữ lớn hơn</button></div><p class="fine-print">Chép từ ảnh bạn gửi, giữ nguyên nội dung; xuống dòng và dấu câu được chuẩn hóa cho dễ đọc.</p><div class="exam-text" lang="en">${escapeHTML(page.text)}</div>${page.crops.map((c) => `<figure class="question-crop"><figcaption>Câu ${c.number} · lựa chọn hình gốc</figcaption><a href="${encodeURI(c.src)}" target="_blank" rel="noopener"><img src="${encodeURI(c.src)}" alt="Ba lựa chọn hình A B C của câu ${c.number}" loading="lazy"></a></figure>`).join('')}`;
      original.before(section);
      enhanceExamText(section.querySelector('.exam-text'));
      if (practiceTest === 2 && practiceSkill === 'reading' && photoIndex === 2) {
        const warning = document.createElement('p'); warning.className = 'warning'; warning.textContent = 'Đây là đoạn văn trong sách luyện tiếng Anh, không phải hướng dẫn an toàn cháy hiện hành. Không dùng thay hướng dẫn của cơ quan cứu hỏa.'; section.prepend(warning);
      }
    }
  }
  if (['home', 'scope'].includes(view)) {
    const section = document.createElement('section');
    section.innerHTML = scopeRules();
    $('#main').querySelector(view === 'home' ? '.hero' : '.page-heading').after(section);
  }
  if (view === 'scope') {
    const section = document.createElement('section'); section.className = 'panel';
    section.innerHTML = '<h2>Trạng thái rà video — không đồng nghĩa đã nghe xác minh</h2><p class="fine-print">Đã rà các đoạn nhận dạng có từ khóa phạm vi trong bản nháp hoàn tất. Không tìm thấy từ khóa không có nghĩa video không dặn bỏ phần nào. Bản nháp có thể nhận sai lời, nhất là tiếng Anh.</p><div class="review-list">' + transcriptReviews.map((i) => `<div><span>${escapeHTML(i.name)}</span><small>${i.status === 'draft' ? 'Có bản nháp · chưa xác minh hết âm thanh' : i.status === 'partial' ? 'Đang chép lời · chưa đủ' : 'Chưa có bản chép lời'}</small>${link(i.id)}</div>`).join('') + '</div>';
    $('#main').append(section);
  }
  if (['writing', 'scope'].includes(view)) {
    const notice = document.createElement('section');
    notice.className = 'warning';
    notice.innerHTML = '<strong>Phạm vi viết · video nhập khóa, khoảng 01:09:23–01:11:00</strong><br>Trong sách 10 test: bỏ Writing Part 1 và Part 2; học phần lá thư ở Part 3 (Question 7 trong test 1 hiển thị trên video). Không nhầm với bộ 30 câu viết lại riêng: bộ này vẫn học. Đối chiếu bản chép lời tự động và khung hình; chưa kiểm chứng trực tiếp toàn bộ âm thanh. ' + link('1ZvOYO9ReXe2BkRluflFMZn_8PgHEcD1U', 'Mở video nguồn ↗');
    $('#main').querySelector('.page-heading').after(notice);
  }
  if (view === 'library') { const query = new URLSearchParams(search).get('skill') || ''; $('#resource-search').value = query; resources(query); }
  if (view === 'writing') updateWords();
  if (view === 'speaking') setupTimer();
  if (view === 'practice') updatePhotoWords();
}
function updatePhotoWords() { if ($('#photo-letter-count')) $('#photo-letter-count').textContent = `${($('#photo-letter').value.trim().match(/\S+/g) || []).length} từ · thầy hướng dẫn khoảng 120 từ`; }
function qNeedsReview(number) { return number === 10; }
function updateWords() { if ($('#word-count')) $('#word-count').textContent = `${($('#letter').value.trim().match(/\S+/g) || []).length} từ · mục tiêu khoảng 120 từ trở lên`; }
function setupTimer() {
  let remaining = Number($('#duration').value), running = false;
  const show = () => { $('#timer').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`; };
  const reset = () => { clearInterval(timer); running = false; remaining = Number($('#duration').value); $('#start-timer').textContent = 'Bắt đầu'; $('#timer-status').textContent = ''; show(); };
  $('#duration').onchange = reset;
  $('#reset-timer').onclick = reset;
  $('#start-timer').onclick = () => {
    if (running) { clearInterval(timer); running = false; $('#start-timer').textContent = 'Tiếp tục'; return; }
    if (!remaining) reset();
    running = true; $('#start-timer').textContent = 'Tạm dừng';
    const end = Date.now() + remaining * 1000;
    timer = setInterval(() => { remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000)); show(); if (!remaining) { clearInterval(timer); running = false; $('#start-timer').textContent = 'Luyện lại'; $('#timer-status').textContent = 'Hết giờ. Bạn đã hoàn thành lượt luyện.'; } }, 200);
  };
}
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.note) { state.notes[el.dataset.note] = el.value; save(); }
  if (el.dataset.answer) { state.answers[el.dataset.answer] = el.value; save(); }
  if (el.id === 'resource-search') resources(el.value, $('#resource-filter').value);
  if (el.id === 'letter') updateWords();
  if (el.dataset.practice) { (state.practice[el.dataset.practice] ||= {})[el.dataset.number] = el.value; save(); }
  if (el.id === 'photo-letter') updatePhotoWords();
});
document.addEventListener('play', (e) => {
  if (e.target.tagName === 'AUDIO') {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.querySelectorAll('audio').forEach((audio) => { if (audio !== e.target) audio.pause(); });
  }
}, true);

function enhanceExamText(container) {
  const lines = container.textContent.split('\n');
  container.textContent = '';
  const help = document.createElement('p');
  help.className = 'speech-help';
  help.textContent = 'Đọc mẫu bằng giọng thiết bị (không phải audio đề thi). Bấm Dịch để hiện/ẩn tiếng Việt ngay dưới câu. Bản dịch hỗ trợ học, không phải đáp án hay bản dịch chính thức. Giọng đọc tùy thiết bị.';
  container.before(help);
  const stop = document.createElement('button');
  stop.className = 'button secondary speech-stop'; stop.textContent = 'Dừng đọc'; stop.type = 'button';
  stop.onclick = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  help.append(' ', stop);
  for (const line of lines) {
    const row = document.createElement('div'); row.className = 'exam-line';
    const text = document.createElement('span'); text.textContent = line || '\u00a0'; row.append(text);
    // ponytail: Vietnamese notes stay untouched; add explicit language metadata if mixed-language lines grow.
    if (/[a-zA-Z]{2}/.test(line) && !/[À-ỹĐđ]/.test(line)) {
      const controls = document.createElement('span'); controls.className = 'sentence-tools';
      const speak = document.createElement('button'); speak.type = 'button'; speak.textContent = 'Đọc';
      speak.setAttribute('aria-label', 'Đọc tiếng Anh: ' + line);
      speak.disabled = !('speechSynthesis' in window);
      speak.onclick = () => {
        document.querySelectorAll('audio').forEach(audio => audio.pause());
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(line.replace(/^\d+\.\s*|^[A-D]\.\s*/g, ''));
        utterance.lang = 'en-GB'; utterance.rate = 0.85;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en'));
        if (voice) utterance.voice = voice;
        utterance.onerror = e => { if (!['canceled', 'interrupted'].includes(e.error)) toast('Không phát được giọng đọc. Kiểm tra âm lượng hoặc thử Chrome/Edge.'); };
        window.speechSynthesis.speak(utterance);
      };
      const translate = document.createElement('button'); translate.type = 'button'; translate.textContent = 'Dịch';
      translate.setAttribute('aria-label', 'Dịch sang tiếng Việt: ' + line);
      translate.setAttribute('aria-expanded', 'false');
      const meaning = document.createElement('div'); meaning.className = 'sentence-translation'; meaning.lang = 'vi'; meaning.hidden = true;
      meaning.textContent = window.COURSE.translations?.[line] || 'Chưa có bản dịch cho câu này.';
      translate.onclick = () => {
        meaning.hidden = !meaning.hidden;
        translate.setAttribute('aria-expanded', String(!meaning.hidden));
        translate.textContent = meaning.hidden ? 'Dịch' : 'Ẩn dịch';
      };
      controls.append(speak, translate); row.append(controls);
      row.append(meaning);
    }
    container.append(row);
  }
}
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.done) { state.done[el.dataset.done] = el.checked; save(); }
  if (el.id === 'resource-filter') resources($('#resource-search').value, el.value);
  if (el.id === 'question-select') { questionIndex = Number(el.value); render(); }
  if (el.id === 'topic-select') { topicIndex = Number(el.value); render(); }
  if (el.id === 'letter-select') { letterIndex = Number(el.value); render(); }
  if (el.id === 'practice-test') { practiceTest = Number(el.value); photoIndex = 0; showKey = false; render(); }
  if (el.id === 'practice-skill') { practiceSkill = el.value; photoIndex = 0; showKey = false; history.replaceState(null, '', '#practice'); render(); }
  if (el.id === 'practice-page') { photoIndex = Number(el.value); showKey = false; render(); }
});
document.addEventListener('click', (e) => {
  const el = e.target.closest('button');
  if (!el) return;
  if (el.dataset.video) { currentVideo = el.dataset.video; render(); }
  if (el.dataset.question !== undefined) { questionIndex = Math.max(0, Math.min(29, Number(el.dataset.question))); render(); }
  if (el.dataset.photoStep) { photoIndex += Number(el.dataset.photoStep); showKey = false; render(); }
  if (el.id === 'toggle-key') { showKey = !showKey; render(); }
  if (el.id === 'toggle-exam-font') { const text = document.querySelector('.exam-text'); const large = text.classList.toggle('large'); el.setAttribute('aria-pressed', String(large)); el.textContent = large ? 'Cỡ chữ thường' : 'Chữ lớn hơn'; }
  if (el.id === 'print-exam') window.print();
  if (el.id === 'export') { const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'b1-study-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
});
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();
