(() => {
  const html = document.documentElement;
  const safeParse = value => { try { return JSON.parse(value); } catch { return null; } };
  const account = safeParse(localStorage.getItem('bolosite-account'));
  const session = localStorage.getItem('bolosite-session');
  const allowed = account && account.role === 'client' && session === account.email;
  const gate = document.getElementById('portalGate');
  const app = document.getElementById('portalApp');
  const toast = document.getElementById('toast');

  const showToast = (title, message) => {
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3500);
  };

  if (!allowed) {
    gate.hidden = false;
    return;
  }

  app.hidden = false;
  const initial = account.name.trim().charAt(0).toUpperCase();
  const company = account.website ? account.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : `${account.name.split(' ')[0]}'s website`;
  document.getElementById('portalCompanyInitial').textContent = initial;
  document.getElementById('portalCompany').textContent = company;
  document.getElementById('portalWebsite').textContent = account.website || 'Website ready to connect';
  document.getElementById('portalAvatar').textContent = initial;
  document.getElementById('portalName').textContent = account.name;
  document.getElementById('portalFirstName').textContent = account.name.split(' ')[0];

  const setTheme = theme => {
    const selected = theme === 'dark' ? 'dark' : 'light';
    html.dataset.theme = selected;
    localStorage.setItem('bolosite-theme', selected);
  };
  setTheme(html.dataset.theme);
  document.getElementById('portalThemeToggle').addEventListener('click', () => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark'));

  const switchPanel = name => {
    document.querySelectorAll('[data-portal-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.portalPanel === name));
    document.querySelectorAll('button[data-portal-tab]').forEach(button => button.classList.toggle('active', button.dataset.portalTab === name));
    document.getElementById('portalSidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  document.querySelectorAll('[data-portal-tab]').forEach(button => button.addEventListener('click', () => switchPanel(button.dataset.portalTab)));
  document.getElementById('portalMenuToggle').addEventListener('click', () => document.getElementById('portalSidebar').classList.toggle('open'));

  document.getElementById('copyInstallCode').addEventListener('click', async () => {
    const text = document.getElementById('installCode').innerText;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Script copied', 'Paste it before the closing body tag on your website.');
    } catch {
      showToast('Select the script manually', 'Clipboard access is unavailable in this browser.');
    }
  });
})();
