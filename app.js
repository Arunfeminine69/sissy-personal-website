const gallery = document.getElementById('gallery');
const uploadForm = document.getElementById('uploadForm');
const statusEl = document.getElementById('uploadStatus');
const fileInput = document.getElementById('fileInput');

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

/* =========================
   MOBILE MENU
========================= */

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-header nav');

navToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');

  navToggle.textContent = open ? '✕' : '☰';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute(
    'aria-label',
    open ? 'Close menu' : 'Open menu'
  );
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');

    if (navToggle) {
      navToggle.textContent = '☰';
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  });
});

/* =========================
   SECURITY
========================= */

function esc(s = '') {
  return String(s).replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));
}

/* =========================
   LOVE
========================= */

async function lovePost(id, button) {
  try {
    const key = 'loved-' + id;

    if (localStorage.getItem(key)) {
      button.textContent = '❤️ Loved';
      return;
    }

    const r = await fetch('/api/media/' + id + '/love', {
      method: 'POST'
    });

    const data = await r.json();

    if (!r.ok) throw new Error(data.error || 'Love failed');

    localStorage.setItem(key, '1');

    button.textContent = '❤️ ' + data.loves;
  } catch {
    button.textContent = '❤️ Try again';
  }
}

/* =========================
   VIEW COUNTER
========================= */

async function addView(id, element) {
  const key = 'viewed-' + id;

  if (sessionStorage.getItem(key)) return;

  sessionStorage.setItem(key, '1');

  try {
    const r = await fetch('/api/media/' + id + '/view', {
      method: 'POST'
    });

    const data = await r.json();

    if (r.ok && element) {
      element.textContent = '👁️ ' + data.views;
    }
  } catch {}
}

/* =========================
   TRIBUTE
========================= */

async function addTribute(id, button) {
  const message = prompt(
    'Write a tribute for this post 🕯️'
  );

  if (!message || !message.trim()) return;

  try {
    const r = await fetch(
      '/api/media/' + id + '/tribute',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim()
        })
      }
    );

    const data = await r.json();

    if (!r.ok) {
      alert(data.error || 'Tribute failed');
      return;
    }

    button.textContent =
      '🕯️ Tribute ' + data.tributes.length;
  } catch {
    alert('Could not send tribute.');
  }
}

/* =========================
   COMMENTS
========================= */

async function addComment(id, button) {
  const name = prompt('Your name:');

  if (name === null) return;

  const message = prompt('Write your comment 💬');

  if (!message || !message.trim()) return;

  try {
    const r = await fetch(
      '/api/media/' + id + '/comment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim() || 'Guest',
          message: message.trim()
        })
      }
    );

    const data = await r.json();

    if (!r.ok) {
      alert(data.error || 'Comment failed');
      return;
    }

    button.textContent =
      '💬 Comments ' + data.comments.length;
  } catch {
    alert('Could not send comment.');
  }
}

/* =========================
   SHARE
========================= */

async function sharePost(id) {
  const url =
    window.location.origin +
    window.location.pathname +
    '#post-' + id;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Sissy 🎀',
        text: 'Check out this post 🎀',
        url
      });
    } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert('Post link copied! 🔗');
    } catch {
      alert(url);
    }
  }
}

/* =========================
   RENDER GALLERY
========================= */

function render(items) {

  if (!items.length) {
    gallery.innerHTML =
      '<div class="loading">No uploads yet. Be the first one ✨</div>';
    return;
  }

  gallery.innerHTML = items.map(x => {

    const loves = x.loves || 0;
    const views = x.views || 0;
    const tributes = Array.isArray(x.tributes)
      ? x.tributes.length
      : 0;
    const comments = Array.isArray(x.comments)
      ? x.comments.length
      : 0;

    const media = x.mimetype.startsWith('video/')
      ? `<video controls preload="metadata"
          src="/uploads/${encodeURIComponent(x.filename)}"></video>`
      : `<img loading="lazy"
          src="/uploads/${encodeURIComponent(x.filename)}"
          alt="${esc(x.caption || 'Gallery photo')}">`;

    return `
      <article class="media" id="post-${esc(x.id)}">

        ${media}

        <div class="media-body">

          <div class="media-caption">
            ${esc(x.caption || '')}
          </div>

          <div class="action-row">

            <button
              class="action-btn love-btn"
              data-id="${esc(x.id)}">
              ❤️ ${loves}
            </button>

            <button
              class="action-btn tribute-btn"
              data-id="${esc(x.id)}">
              🕯️ Tribute ${tributes}
            </button>

            <button
              class="action-btn comment-btn"
              data-id="${esc(x.id)}">
              💬 Comments ${comments}
            </button>

            <button
              class="action-btn view-btn"
              data-id="${esc(x.id)}">
              👁️ ${views}
            </button>

            <a
              class="action-btn"
              href="/uploads/${encodeURIComponent(x.filename)}"
              download>
              ⬇️ Download
            </a>

            <button
              class="action-btn share-btn"
              data-id="${esc(x.id)}">
              🔗 Share
            </button>

          </div>

          <div class="media-date">
            ${new Date(x.createdAt).toLocaleString()}
          </div>

          <button
            class="media-delete"
            data-id="${esc(x.id)}"
            title="Delete">
            🗑️ Delete
          </button>

        </div>
      </article>
    `;
  }).join('');

  /* Love */
  gallery.querySelectorAll('.love-btn').forEach(button => {
    button.addEventListener('click', () => {
      lovePost(button.dataset.id, button);
    });
  });

  /* Tribute */
  gallery.querySelectorAll('.tribute-btn').forEach(button => {
    button.addEventListener('click', () => {
      addTribute(button.dataset.id, button);
    });
  });

  /* Comments */
  gallery.querySelectorAll('.comment-btn').forEach(button => {
    button.addEventListener('click', () => {
      addComment(button.dataset.id, button);
    });
  });

  /* Share */
  gallery.querySelectorAll('.share-btn').forEach(button => {
    button.addEventListener('click', () => {
      sharePost(button.dataset.id);
    });
  });

  /* Views */
  gallery.querySelectorAll('.view-btn').forEach(button => {
    addView(button.dataset.id, button);
  });
/* Edit caption */
gallery.querySelectorAll('.edit-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const id = button.dataset.id;

    const current = button.dataset.caption || '';

    const caption = prompt(
      'Edit your caption ✏️',
      current
    );

    if (caption === null) return;

    try {
      const r = await fetch('/api/media/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption: caption.trim()
        })
      });

      const data = await r.json();

      if (!r.ok) {
        alert(data.error || 'Edit failed.');
        return;
      }

      loadGallery();

    } catch {
      alert('Could not edit this post.');
    }
  });
});
  /* Delete */
  gallery.querySelectorAll('.media-delete').forEach(button => {

    button.addEventListener('click', async () => {

      if (!confirm('Delete this upload?')) return;

      try {
        const r = await fetch(
          '/api/media/' + button.dataset.id,
          {
            method: 'DELETE'
          }
        );

        if (r.ok) {
          loadGallery();
        } else {
          alert('Delete failed.');
        }

      } catch {
        alert('Delete failed.');
      }
    });
  });
}

/* =========================
   LOAD GALLERY
========================= */

async function loadGallery() {

  try {

    const r = await fetch('/api/media');
    const data = await r.json();

    render(data);

  } catch {

    gallery.innerHTML =
      '<div class="loading">Gallery service is not connected yet.</div>';
  }
}

/* =========================
   UPLOAD
========================= */

uploadForm?.addEventListener('submit', async e => {

  e.preventDefault();

  const file = fileInput?.files[0];

  if (!file) return;

  statusEl.textContent =
    'Uploading… please wait.';

  const form = new FormData(uploadForm);

  try {

    const r = await fetch('/api/media', {
      method: 'POST',
      body: form
    });

    const data = await r.json();

    if (!r.ok) {
      throw new Error(
        data.error || 'Upload failed'
      );
    }

    uploadForm.reset();

    statusEl.textContent =
      'Uploaded ✨';

    loadGallery();

  } catch (err) {

    statusEl.textContent =
      err.message;
  }
});

/* Start */
loadGallery();
/* =========================
   VIP BOOKING PLAN
========================= */

let selectedVipPlan = null;

const vipSelected = document.getElementById('vipSelected');
const vipSubmit = document.getElementById('vipSubmit');

document.querySelectorAll('.vip-book').forEach(button => {
  button.addEventListener('click', () => {

    selectedVipPlan = {
      plan: button.dataset.plan,
      price: button.dataset.price
    };

    if (vipSelected) {
      vipSelected.textContent =
        `💎 Selected: ${selectedVipPlan.plan} — ₹${selectedVipPlan.price}`;
    }

    document.getElementById('vip')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

vipSubmit?.addEventListener('click', () => {

  if (!selectedVipPlan) {
    alert('Please choose a VIP plan first 💎');
    return;
  }

  const name = document.getElementById('vipName')?.value.trim();
  const email = document.getElementById('vipEmail')?.value.trim();
  const date = document.getElementById('vipDate')?.value;
  const time = document.getElementById('vipTime')?.value;

  if (!name || !email || !date || !time) {
    alert('Please fill in your name, email, date and time.');
    return;
  }

  alert(
    `Booking request ready 💎\n\n` +
    `Plan: ${selectedVipPlan.plan}\n` +
    `Price: ₹${selectedVipPlan.price}\n` +
    `Date: ${date}\n` +
    `Time: ${time}\n\n` +
    `Payment will be added in the next step.`
  );
});