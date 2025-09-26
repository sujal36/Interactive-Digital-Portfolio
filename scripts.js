// scripts.js — Full consolidated version
document.addEventListener('DOMContentLoaded', () => {
  // Optional: clear previous data on load (remove this line if you want persistence)
  try { localStorage.clear(); } catch(e) {}

    /* ---------------- Smooth scroll for hero buttons ---------------- */
  const resumeBtn = document.getElementById('downloadResume');
  const contactBtn = document.getElementById('contactMe');

  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('download-callout-section');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (contactBtn) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('contact');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }


  /* ---------------- Typing effect ---------------- */
  const typeEl = document.getElementById('type');
  const phrases = ['Frontend Engineer', 'UI Enthusiast', 'Performance-focused', 'Accessible-first'];
  let pi = 0, ci = 0, forward = true;
  function tick() {
    const s = phrases[pi];
    if (forward) {
      ci++;
      if (ci > s.length) { forward = false; setTimeout(tick, 900); return; }
    } else {
      ci--;
      if (ci === 0) { forward = true; pi = (pi+1) % phrases.length; }
    }
    if (typeEl) typeEl.textContent = s.slice(0, ci);
    setTimeout(tick, forward ? 90 : 40);
  }
  tick();

  /* ---------------- Theme toggle (single implementation) ----------------
     Uses localStorage 'portfolio_theme_pref' and falls back to system preference.
     Only one event listener and one place to change theme behavior.
  */
  (function initThemeToggle() {
    const THEME_KEY = 'portfolio_theme_pref';
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');

    function applyTheme(theme) {
      if (theme === 'dark') html.setAttribute('data-theme', 'dark');
      else html.setAttribute('data-theme', 'light');

      // Optional icon updates if your toggle contains .theme-icon.sun/.theme-icon.moon
      if (toggle) {
        const sun = toggle.querySelector('.theme-icon.sun');
        const moon = toggle.querySelector('.theme-icon.moon');
        if (sun) sun.style.display = theme === 'dark' ? 'none' : 'inline-block';
        if (moon) moon.style.display = theme === 'dark' ? 'inline-block' : 'none';
      }
    }

    function getInitialTheme() {
      try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
      } catch(e){}
      try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch(e){}
      return 'light';
    }

    const initial = getInitialTheme();
    applyTheme(initial);

    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const cur = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch(e){}
    });

    // Optional: adopt system changes only if user hasn't explicitly saved preference
    try {
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener?.('change', (e) => {
            try {
              const saved = localStorage.getItem(THEME_KEY);
              if (!saved) applyTheme(e.matches ? 'dark' : 'light');
            } catch(e){}
          });
      }
    } catch(e){}
  })();

  /* ---------------- Basic elements ---------------- */
  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  const inputName = document.getElementById('inputName');
  const inputRole = document.getElementById('inputRole');
  const inputLocation = document.getElementById('inputLocation');
  const inputAvail = document.getElementById('inputAvail');
  const inputStack = document.getElementById('inputStack');
  const bulletsEl = document.getElementById('bullets');
  const aboutText = document.getElementById('aboutText');

  const photoUpload = document.getElementById('photoUpload'); // hidden or visible input
  const heroAvatar = document.getElementById('heroAvatar'); // hero image
  const avatarPlaceholder = document.getElementById('avatarPlaceholder'); // click to upload
  const brandPhoto = document.getElementById('brandPhoto'); // top-left small image
  const logoInitial = document.getElementById('logoInitial');

  const generateBtn = document.getElementById('generateAbout');
  const saveBtn = document.getElementById('saveAbout');
  const resetBtn = document.getElementById('resetAbout');
  const downloadPDFBtn = document.getElementById('downloadPDF');

  // store uploaded dataURL globally for PDF embedding
  window.__portfolio_uploaded_photo = window.__portfolio_uploaded_photo || null;

  /* ---------------- Validation ---------------- */
  function validateRequiredFields() {
    const name = (inputName && inputName.value || '').trim();
    const role = (inputRole && inputRole.value || '').trim();
    const location = (inputLocation && inputLocation.value || '').trim();
    const avail = (inputAvail && inputAvail.value || '').trim();
    const stack = (inputStack && inputStack.value || '').trim();
    const bullets = (bulletsEl && bulletsEl.value || '').trim();
    const ok = name && role && location && avail && stack && bullets;
    if (generateBtn) generateBtn.disabled = !ok;
    // Keep download enabled (user wanted it available). You can choose to disable if you want strict validation.
    if (downloadPDFBtn) downloadPDFBtn.disabled = false;
    return ok;
  }

  [inputName, inputRole, inputLocation, inputAvail, inputStack, bulletsEl].forEach(el => {
    if (!el) return;
    el.addEventListener('input', validateRequiredFields);
  });

  /* ---------------- Avatar upload ---------------- */
  if (avatarPlaceholder) {
    avatarPlaceholder.addEventListener('click', () => {
      if (photoUpload) photoUpload.click();
    });
  }

  if (photoUpload) {
    photoUpload.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) { alert('Please upload an image file'); return; }
      const reader = new FileReader();
      reader.onload = function(ev) {
        const dataUrl = ev.target.result;
        window.__portfolio_uploaded_photo = dataUrl;
        if (heroAvatar) { heroAvatar.src = dataUrl; heroAvatar.style.display = 'block'; heroAvatar.setAttribute('data-loaded','1'); }
        if (brandPhoto) { brandPhoto.src = dataUrl; brandPhoto.style.display = 'block'; brandPhoto.setAttribute('data-loaded','1'); }
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        if (logoInitial) logoInitial.style.display = 'none';
        validateRequiredFields();
        flash('Photo uploaded');
      };
      reader.readAsDataURL(f);
    });
  }

  /* ---------------- About generation ---------------- */
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (!validateRequiredFields()) {
        alert('Please fill all required fields before generating the About text.');
        return;
      }
      const name = inputName.value.trim();
      const role = inputRole.value.trim();
      const location = inputLocation.value.trim();
      const avail = inputAvail.value.trim();
      const stack = inputStack.value.trim();

      const lines = (bulletsEl.value || '').split('\n').map(s => s.replace(/^[-•\s]+/,'').trim()).filter(Boolean);
      let result = '';
      if (lines.length === 0) {
        result = 'I build accessible, performant front-end experiences using HTML, CSS and JavaScript.';
      } else {
        const first = lines[0];
        if (/developer|engineer|designer|student|lead/i.test(first) || /\d/.test(first)) result += first.endsWith('.')? first+' ': first+'. ';
        result += lines.slice(1).map(l=>{
          if (/\d+\s*yrs?/i.test(l)) return 'I have '+l+'.';
          if (/built|created|launched|developed/i.test(l)) return l+'.';
          return l+'.';
        }).join(' ');
        if (!result.includes('I enjoy')) result += ' I enjoy building useful web experiences.';
      }
      if (aboutText) aboutText.textContent = result.trim();
      const profile = { name, role, location, availability: avail, stack, about: aboutText.textContent };
      applyProfileToUI(profile);
      flash('Profile applied to page (session only).');
    });
  }

  function applyProfileToUI(profile) {
    const hname = document.getElementById('heroName');
    const aname = document.getElementById('accentName');
    const heroRoleEl = document.getElementById('heroRole');
    const metaTitle = document.getElementById('metaTitle');
    const metaSub = document.getElementById('metaSub');
    const factLocation = document.getElementById('factLocation');
    const factAvail = document.getElementById('factAvail');
    const factStack = document.getElementById('factStack');
    const footerName = document.getElementById('footerName');

    if (hname) hname.textContent = profile.name;
    if (aname) aname.textContent = profile.name;
    if (heroRoleEl) heroRoleEl.textContent = profile.role;
    if (metaTitle) metaTitle.textContent = profile.role;
    if (metaSub) metaSub.textContent = profile.stack;
    if (factLocation) factLocation.textContent = 'Location: ' + profile.location;
    if (factAvail) factAvail.textContent = 'Availability: ' + profile.availability;
    if (factStack) factStack.textContent = 'Preferred stack: ' + profile.stack;
    if (footerName) footerName.textContent = profile.name;
  }

  if (saveBtn) saveBtn.addEventListener('click', ()=> flash('Profile saved for this session (not persisted after reload)'));

  if (resetBtn) resetBtn.addEventListener('click', ()=> {
    if (bulletsEl) bulletsEl.value = '';
    if (aboutText) aboutText.textContent = 'Write short bullets in the textarea and click "Generate About".';
    if (inputName) inputName.value = '';
    if (inputRole) inputRole.value = '';
    if (inputLocation) inputLocation.value = '';
    if (inputAvail) inputAvail.value = '';
    if (inputStack) inputStack.value = '';
    if (photoUpload) photoUpload.value = '';
    if (heroAvatar) { heroAvatar.removeAttribute('data-loaded'); heroAvatar.src=''; heroAvatar.style.display='none'; }
    if (brandPhoto) { brandPhoto.removeAttribute('data-loaded'); brandPhoto.src=''; brandPhoto.style.display='none'; }
    if (logoInitial) logoInitial.style.display = 'flex';
    if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    window.__portfolio_uploaded_photo = null;
    validateRequiredFields();
    flash('Reset done (session cleared)');
  });

  /* ---------------- Skills (localStorage) ---------------- */
  const skillsListEl = document.getElementById('skillsList');
  const addSkillBtn = document.getElementById('addSkill');
  const newSkillInput = document.getElementById('newSkill');

  function loadSkills(){
    const raw = localStorage.getItem('portfolio_skills');
    let arr = raw ? JSON.parse(raw) : ['HTML','CSS','JavaScript'];
    if (skillsListEl) skillsListEl.innerHTML = '';
    arr.forEach(s => {
      const el = document.createElement('div');
      el.className = 'skill';
      el.textContent = s;
      el.addEventListener('click', () => {
        if (confirm('Remove skill "'+s+'"?')) {
          arr = arr.filter(x => x !== s);
          localStorage.setItem('portfolio_skills', JSON.stringify(arr));
          loadSkills();
          flash('Skill removed');
          validateRequiredFields();
        }
      });
      skillsListEl && skillsListEl.appendChild(el);
    });
  }
  loadSkills();

  if (addSkillBtn) addSkillBtn.addEventListener('click', ()=> {
    const v = (newSkillInput.value || '').trim();
    if (!v) return;
    const raw = localStorage.getItem('portfolio_skills');
    let arr = raw ? JSON.parse(raw) : ['HTML','CSS','JavaScript'];
    v.split(',').map(x => x.trim()).filter(Boolean).forEach(x => { if (!arr.includes(x)) arr.push(x); });
    localStorage.setItem('portfolio_skills', JSON.stringify(arr));
    newSkillInput.value = '';
    loadSkills();
    flash('Skill(s) added');
    validateRequiredFields();
  });

  /* ---------------- Projects (localStorage) ---------------- */
  const projectGrid = document.getElementById('projectGrid');
  const projectForm = document.getElementById('projectForm');

  function loadProjects(){
    const raw = localStorage.getItem('portfolio_projects');
    let arr = raw ? JSON.parse(raw) : [];
    if (projectGrid) projectGrid.innerHTML = '';
    arr.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div>
          <div class="title">${escapeHtml(p.title)}</div>
          <div class="project-meta">${escapeHtml(p.tech)}</div>
          <div class="desc">${escapeHtml(p.desc).slice(0,160)}</div>
          <div class="project-actions">
            <button class="btn small view" data-idx="${idx}">View</button>
            <button class="btn small ghost del" data-idx="${idx}">Delete</button>
          </div>
        </div>
      `;
      projectGrid && projectGrid.appendChild(card);
    });

    // view & delete handlers
    projectGrid && projectGrid.querySelectorAll('.view').forEach(b => {
      b.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.idx);
        const arr = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        const p = arr[idx];
        if (!p) return showModal('<p>Project not found</p>');
        const html = `<h3>${escapeHtml(p.title)}</h3>
                      <p><strong>Tech:</strong> ${escapeHtml(p.tech)}</p>
                      <p>${escapeHtml(p.desc)}</p>
                      ${p.link?'<p><a href="'+escapeHtml(p.link)+'" target="_blank">Open link</a></p>':''}`;
        showModal(html);
      });
    });

    projectGrid && projectGrid.querySelectorAll('.del').forEach(b => {
      b.addEventListener('click', (e) => {
        const i = Number(e.currentTarget.dataset.idx);
        if (!confirm('Delete this project?')) return;
        let arr = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        arr.splice(i,1);
        localStorage.setItem('portfolio_projects', JSON.stringify(arr));
        loadProjects();
        flash('Project deleted');
      });
    });
  }
  loadProjects();

  if (projectForm) projectForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const title = (document.getElementById('projTitle').value || '').trim();
    const tech = (document.getElementById('projTech').value || '').trim();
    const link = (document.getElementById('projLink').value || '').trim();
    const desc = (document.getElementById('projDesc').value || '').trim();
    if (!title) { alert('Please enter a project title'); return; }
    let arr = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
    arr.unshift({ title, tech, link, desc, created: Date.now() });
    localStorage.setItem('portfolio_projects', JSON.stringify(arr));
    projectForm.reset();
    loadProjects();
    flash('Project added');
    validateRequiredFields();
  });

  const clearProjectsBtn = document.getElementById('clearProjects');
  if (clearProjectsBtn) clearProjectsBtn.addEventListener('click', ()=> {
    if (!confirm('Clear all projects?')) return;
    localStorage.removeItem('portfolio_projects');
    loadProjects();
    flash('All projects cleared');
  });

  /* ---------------- Contact (localStorage inbox) ---------------- */
 /* ===== Contact (replace the old contact submit & viewInbox handler) ===== */
// assume these elements exist in DOM:
// <form id="contactForm"> with inputs: #cname, #cemail, #contactGithubInput, #contactLinkedinInput, #cmessage
// and button #viewInbox

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    // read all fields (trim)
    const name = (document.getElementById('cname').value || '').trim();
    const email = (document.getElementById('cemail').value || '').trim();
    const github = (document.getElementById('contactGithubInput').value || '').trim();
    const linkedin = (document.getElementById('contactLinkedinInput').value || '').trim();
    const msg = (document.getElementById('cmessage').value || '').trim();

    if (!name || !email || !msg) {
      return alert('Please fill your name, email and message.');
    }

    // load existing messages, push new one at start
    let arr = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    arr.unshift({
      name,
      email,
      github: github || '',
      linkedin: linkedin || '',
      msg,
      time: Date.now()
    });
    localStorage.setItem('portfolio_messages', JSON.stringify(arr));

    // clear form (optional)
    contactForm.reset();

    flash('Message saved'); // existing helper
  });
}

// View Inbox: show full details (email + github + linkedin + message + timestamp)
const viewInboxBtn = document.getElementById('viewInbox');
if (viewInboxBtn) {
  viewInboxBtn.addEventListener('click', () => {
    const arr = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    if (!arr || arr.length === 0) {
      return showModal('<p>No messages yet.</p>');
    }

    // build html with clickable links and full details
    const html = '<h3>Inbox</h3>' + arr.map(m => {
      const when = new Date(m.time).toLocaleString();
      // escapeHtml helper used previously (ensure it exists in your file)
      const eName = escapeHtml(m.name || '');
      const eEmail = escapeHtml(m.email || '');
      const eGithub = escapeHtml(m.github || '');
      const eLinkedin = escapeHtml(m.linkedin || '');
      const eMsg = escapeHtml(m.msg || '');

      // make email clickable mailto:, github/linkedin clickable (if present)
      const emailLine = eEmail ? `<p><strong>Email:</strong> <a href="mailto:${eEmail}">${eEmail}</a></p>` : '';
      const githubLine = eGithub ? `<p><strong>GitHub:</strong> <a href="${eGithub}" target="_blank" rel="noopener noreferrer">${eGithub}</a></p>` : '';
      const linkedinLine = eLinkedin ? `<p><strong>LinkedIn:</strong> <a href="${eLinkedin}" target="_blank" rel="noopener noreferrer">${eLinkedin}</a></p>` : '';

      return `<div style="margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.03)">
                <div style="margin-bottom:6px"><strong>${eName}</strong> — ${when}</div>
                ${emailLine}
                ${githubLine}
                ${linkedinLine}
                <div style="margin-top:6px">${eMsg ? `<p>${eMsg}</p>` : ''}</div>
              </div>`;
    }).join('');

    showModal(html);
  });
}

  /* ---------------- PDF Generation (jsPDF) ----------------
     Embeds uploaded photo on the LEFT (if present), shifts text to the right.
     downloadPDFBtn is clickable; if missing required fields it will ask for confirmation.
  */
  const { jsPDF } = window.jspdf || {};
  if (downloadPDFBtn && jsPDF) {
    downloadPDFBtn.addEventListener('click', async () => {
      const ok = validateRequiredFields();
      if (!ok) {
        if (!confirm('Some required fields are missing. Continue and generate PDF with available info?')) return;
      }

      const profile = {
        name: (document.getElementById('heroName') && document.getElementById('heroName').textContent) || 'Your Name',
        role: (document.getElementById('heroRole') && document.getElementById('heroRole').textContent) || 'Developer',
        location: (document.getElementById('factLocation') && document.getElementById('factLocation').textContent.replace('Location: ','') ) || 'Remote',
        availability: (document.getElementById('factAvail') && document.getElementById('factAvail').textContent.replace('Availability: ','') ) || 'Open to work',
        stack: (document.getElementById('factStack') && document.getElementById('factStack').textContent.replace('Preferred stack: ','') ) || 'HTML, CSS, JavaScript',
        about: (document.getElementById('aboutText') && document.getElementById('aboutText').textContent) || ''
      };
      const skills = JSON.parse(localStorage.getItem('portfolio_skills') || '["HTML","CSS","JavaScript"]');
      const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      let y = 40;

      // embed uploaded photo on left if available
      const uploaded = window.__portfolio_uploaded_photo;
      let textStartX = margin;
      const imgW = 72, imgH = 72;
      if (uploaded) {
        let fmt = 'JPEG';
        if (uploaded.startsWith('data:image/png')) fmt = 'PNG';
        try {
          doc.addImage(uploaded, fmt, margin, y - 6, imgW, imgH);
          textStartX = margin + imgW + 12;
        } catch (err) {
          try { doc.addImage(uploaded, 'PNG', margin, y - 6, imgW, imgH); textStartX = margin + imgW + 12; }
          catch(e){ console.warn('addImage failed', e); }
        }
      }

      // Title area (right of image if present)
      doc.setFontSize(18);
      doc.text(profile.name, textStartX, y);
      doc.setFontSize(12);
      doc.text(profile.role, textStartX, y + 22);
      doc.setFontSize(10);
      doc.text('Location: ' + profile.location + '    Availability: ' + profile.availability, textStartX, y + 40);
      doc.setFontSize(11);
      doc.text('Preferred stack: ' + profile.stack, textStartX, y + 60);

      // Move y down, ensuring we don't collide with image height
      const titleBlockHeight = 90;
      const imageBottom = uploaded ? (y - 6 + imgH) : 0;
      y += titleBlockHeight;
      if (uploaded && imageBottom + 12 > y) y = imageBottom + 18;

      // About
      doc.setFontSize(12);
      doc.text('About:', margin, y);
      const splitAbout = doc.splitTextToSize(profile.about || '—', 520 - (margin - 0));
      doc.setFontSize(10);
      doc.text(splitAbout, margin, y + 16);
      y += 16 + splitAbout.length * 12;

      // Skills
      doc.setFontSize(12);
      doc.text('Skills:', margin, y + 10);
      doc.setFontSize(10);
      doc.text((skills && skills.length ? skills.join(', ') : '—'), margin, y + 28);
      y += 40;

      // Projects
      doc.setFontSize(12);
      doc.text('Projects:', margin, y + 10);
      doc.setFontSize(10);
      if (!projects || projects.length === 0) {
        doc.text('No projects added.', margin, y + 28);
        y += 40;
      } else {
        projects.slice(0,10).forEach(p => {
          const title = p.title || 'Untitled';
          const tech = p.tech || '';
          const desc = p.desc || '';
          const block = `${title} — ${tech}\n${desc}`;
          const spl = doc.splitTextToSize(block, 520);
          doc.text(spl, margin, y + 28);
          y += spl.length * 12 + 10;
          if (y > 720) { doc.addPage(); y = 40; }
        });
      }

      doc.setFontSize(9);
      doc.text('Generated from Interactive Portfolio', margin, 780);
      const fname = (profile.name || 'portfolio').replace(/\s+/g,'_').toLowerCase();
      doc.save(fname + '.pdf');
      flash('PDF generated');
    });
  } else if (downloadPDFBtn && !jsPDF) {
    // If jsPDF wasn't loaded, keep button disabled and log
    downloadPDFBtn.disabled = true;
    console.warn('jsPDF not found - include jsPDF script for PDF generation.');
  }

  /* ---------------- Modal helpers ---------------- */
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', () => hideModal());
  function showModal(html) {
    if (!modal || !modalContent) return;
    modalContent.innerHTML = html;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  }
  function hideModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }
  window.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

  /* ---------------- Utilities ---------------- */
  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function flash(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.right = '18px';
    el.style.bottom = '18px';
    el.style.background = 'linear-gradient(90deg,#6a11cb,#2575fc)';
    el.style.color = '#fff';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '10px';
    el.style.boxShadow = '0 10px 30px rgba(37,117,252,0.18)';
    el.style.zIndex = 9999;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  /* ---------------- GSAP reveal (optional) ---------------- */
  if (window.gsap) {
    try {
      gsap.from('.hero-content h1', { y:20, opacity:0, duration:0.7 });
      gsap.from('.hero-meta, .hero-card', { y:20, opacity:0, duration:0.7, delay:0.2 });
      gsap.utils.toArray('.card, .project-card, .about-right').forEach((el,i) => gsap.from(el, { y:14, opacity:0, duration:0.6, delay: 0.15 + i*0.06 }));
    } catch(e){}
  }
}); // DOMContentLoaded end
