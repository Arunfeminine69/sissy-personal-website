const gallery = document.getElementById('gallery');
const uploadForm = document.getElementById('uploadForm');
const statusEl = document.getElementById('uploadStatus');
const fileInput = document.getElementById('fileInput');
document.getElementById('year').textContent = new Date().getFullYear();

function esc(s='') { return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function render(items) {
  if (!items.length) { gallery.innerHTML = '<div class="loading">No uploads yet. Be the first one ✨</div>'; return; }
  gallery.innerHTML = items.map(x => {
    const media = x.mimetype.startsWith('video/')
      ? `<video controls preload="metadata" src="/uploads/${encodeURIComponent(x.filename)}"></video>`
      : `<img loading="lazy" src="/uploads/${encodeURIComponent(x.filename)}" alt="${esc(x.caption || 'Gallery photo')}">`;
    return `<article class="media">${media}<div class="media-body"><button class="media-delete" data-id="${x.id}" title="Delete">delete</button><div class="media-caption">${esc(x.caption || '')}</div><div class="media-date">${new Date(x.createdAt).toLocaleString()}</div></div></article>`;
  }).join('');
  gallery.querySelectorAll('.media-delete').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this upload?')) return;
    const r = await fetch('/api/media/' + btn.dataset.id, { method:'DELETE' });
    if (r.ok) loadGallery();
  }));
}
async function loadGallery() {
  try { const r = await fetch('/api/media'); render(await r.json()); }
  catch { gallery.innerHTML = '<div class="loading">Gallery service is not connected yet.</div>'; }
}
uploadForm.addEventListener('submit', async e => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;
  statusEl.textContent = 'Uploading… please wait.';
  const form = new FormData(uploadForm);
  try {
    const r = await fetch('/api/media', { method:'POST', body:form });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Upload failed');
    uploadForm.reset();
    statusEl.textContent = 'Uploaded ✨';
    loadGallery();
  } catch (err) { statusEl.textContent = err.message; }
});
loadGallery();
