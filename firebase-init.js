const firebaseConfig = {
  apiKey: 'AIzaSyCpMxKkdhjGj0rQe2Rtq0L2SysnxFueDws',
  authDomain: 'pacificfoodinternational-1fa57.firebaseapp.com',
  projectId: 'pacificfoodinternational-1fa57',
  storageBucket: 'pacificfoodinternational-1fa57.firebasestorage.app',
  messagingSenderId: '853978821203',
  appId: '1:853978821203:web:09cbda3e7fbe9ee79c4ca6',
  measurementId: 'G-CJPM4DK6DX'
};

const CONSENT_STORAGE_KEY = 'pf-analytics-consent';
const firebaseVersion = '13.2.0';

async function enableAnalytics() {
  try {
    const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-analytics.js`)
    ]);

    const app = initializeApp(firebaseConfig);
    if (await isSupported()) {
      getAnalytics(app);
    }
  } catch (error) {
    console.warn('Firebase Analytics could not be initialized.', error);
  }
}

function saveConsent(choice, banner) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch (error) {
    console.warn('Analytics preference could not be saved in this browser.', error);
  }

  banner.remove();
  if (choice === 'accepted') {
    enableAnalytics();
  }
}

function showConsentBanner() {
  const banner = document.createElement('aside');
  banner.className = 'analytics-consent';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Analytics preference');
  banner.innerHTML = `
    <div class="analytics-consent__copy">
      <strong>Help us improve this website</strong>
      <p>Firebase Analytics measures site usage. It starts only if you accept. <a href="privacy-policy.html">Privacy policy</a></p>
    </div>
    <div class="analytics-consent__actions">
      <button type="button" data-analytics-choice="rejected">Reject analytics</button>
      <button type="button" data-analytics-choice="accepted">Accept analytics</button>
    </div>
  `;

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-analytics-choice]');
    if (button) {
      saveConsent(button.dataset.analyticsChoice, banner);
    }
  });

  document.body.appendChild(banner);
}

let consent = null;
try {
  consent = localStorage.getItem(CONSENT_STORAGE_KEY);
} catch (error) {
  console.warn('Analytics preference could not be read in this browser.', error);
}

if (consent === 'accepted') {
  enableAnalytics();
} else if (consent !== 'rejected') {
  showConsentBanner();
}

const manageConsentButton = document.getElementById('manageAnalyticsConsent');
if (manageConsentButton) {
  manageConsentButton.addEventListener('click', () => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch (error) {
      console.warn('Analytics preference could not be cleared in this browser.', error);
    }
    window.location.reload();
  });
}