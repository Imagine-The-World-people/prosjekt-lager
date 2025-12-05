import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, runTransaction, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, getIdTokenResult } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

(() => {
  // UI elementer
  const scanInput = document.getElementById('scanInput');
  const scanBtn = document.getElementById('scanBtn');
  const result = document.getElementById('result');
  const activeCount = document.getElementById('activeCount');
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminCancel = document.getElementById('adminCancel');
  const adminLogin = document.getElementById('adminLogin');
  const featured = document.getElementById('featured');
  const categoriesBtn = document.getElementById('categoriesBtn');

  // Lokal fallback (demo)
  const demoUsers = { U1001: { name: "Ola Nordmann", loans: ["P1002"] } };
  const demoProducts = {
    P1001: { name: "Projektor 4K", status: "available", category: "AV" },
    P1002: { name: "Tromme", status: "loaned", category: "Musikk" },
    P1003: { name: "Mac-lader", status: "available", category: "Tilbehør" }
  };

  // Firebase init (hvis konfigurert)
  let useFirebase = false;
  let app, db, auth;
  try {
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      useFirebase = true;
      console.info('Firebase initialized');
    }
  } catch (err) {
    console.warn('Firebase init failed, falling back to demo:', err);
    useFirebase = false;
  }

  function renderFeatured(products = demoProducts) {
    featured.innerHTML = '';
    Object.entries(products).slice(0,6).forEach(([id, p]) => {
      const el = document.createElement('div');
      el.className = 'product';
      el.innerHTML = `<div class="title">${p.name}</div>
                      <div class="meta">${id} — ${p.status === 'available' ? 'Ledig' : 'Utlånt'}</div>`;
      featured.appendChild(el);
    });
  }

  function renderResult(html) {
    result.innerHTML = html;
    result.classList.remove('hidden');
  }

  async function fetchProductFromFirestore(barcode) {
    if (!useFirebase) return null;
    try {
      const ref = doc(db, 'products', barcode);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.error('fetchProduct error', e);
      return null;
    }
  }

  async function fetchUserFromFirestore(barcode) {
    if (!useFirebase) return null;
    try {
      const ref = doc(db, 'users', barcode);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.error('fetchUser error', e);
      return null;
    }
  }

  async function createLoanFirestore(userBarcode, productBarcode) {
    if (!useFirebase) throw new Error('Firebase not configured');
    const loansCol = collection(db, 'loans');
    try {
      await runTransaction(db, async (tx) => {
        const pRef = doc(db, 'products', productBarcode);
        const pSnap = await tx.get(pRef);
        if (!pSnap.exists()) throw new Error('Product not found');
        const pData = pSnap.data();
        if (pData.status === 'loaned') throw new Error('Product already loaned');
        const loanData = {
          userBarcode,
          productBarcode,
          borrowedAt: serverTimestamp(),
          returned: false
        };
        tx.set(doc(loansCol), loanData);
        tx.update(pRef, { status: 'loaned' });
      });
      return { ok: true };
    } catch (err) {
      console.error('createLoan error', err);
      return { ok: false, error: String(err) };
    }
  }

  async function handleScan(value) {
    value = String(value || '').trim().toUpperCase();
    if (!value) return;
    if (value.startsWith('U')) {
      const user = useFirebase ? await fetchUserFromFirestore(value) : demoUsers[value];
      if (user) {
        renderResult(`<strong>Bruker:</strong> ${user.name || user.displayName || value}<div class="muted">Lån: ${user.loans ? user.loans.join(', ') : 'ukjent'}</div>
          <div style="margin-top:10px;"><button class="btn btn-primary" onclick="window.startLoan('${value}')">Skann produkt for lån</button>
          <button class="btn btn-outline" onclick="window.showUserLoans('${value}')">Vis lån</button></div>`);
      } else {
        renderResult(`<strong>Ukjent bruker</strong><div class="muted">Registrer bruker eller skann manuelt (admin)</div>`);
      }
    } else if (value.startsWith('P')) {
      const p = useFirebase ? await fetchProductFromFirestore(value) : demoProducts[value];
      if (p) {
        const status = (p.status === 'loaned') ? 'Utlånt' : 'Ledig';
        if (p.status === 'loaned') {
          renderResult(`<strong>Produkt:</strong> ${p.name || value}<div class="muted">Status: ${status}</div>
            <div style="margin-top:10px;"><button class="btn btn-primary" onclick="window.confirmReturn('${value}')">Lever tilbake</button>
            <button class="btn btn-outline" onclick="window.extendLoan('${value}')">Forleng lån</button></div>`);
        } else {
          renderResult(`<strong>Produkt:</strong> ${p.name || value}<div class="muted">Status: ${status}</div>
            <div style="margin-top:10px;"><button class="btn btn-primary" onclick="window.startLoanByProduct('${value}')">Lån ut</button></div>`);
        }
      } else {
        renderResult(`<strong>Ukjent produkt</strong><div class="muted">Flagg eller registrer produkt (admin)</div>`);
      }
    } else {
      renderResult(`<strong>Ukjent strekkode-format</strong><div class="muted">Bruk prefiks U (bruker) eller P (produkt).</div>`);
    }
  }

  window.startLoan = function(userId) {
    renderResult(`<div><strong>Skann produkt for å låne til ${userId}</strong></div>`);
    scanInput.value = '';
    scanInput.focus();
  };

  window.startLoanByProduct = function(productId) {
    renderResult(`<div><strong>Start lån for ${productId}</strong><div class="muted">Skann bruker eller velg manuelt</div></div>`);
    scanInput.value = '';
    scanInput.focus();
  };

  window.showUserLoans = function(userId) {
    const u = demoUsers[userId] || null;
    renderResult(`<div><strong>${u ? u.name : userId}</strong><div class="muted">Aktive lån: ${u ? (u.loans.join(', ') || 'ingen') : 'ukjent'}</div></div>`);
  };

  window.confirmReturn = function(productId) {
    renderResult(`<div><strong>Bekreft levering av ${productId}</strong><div style="margin-top:8px;"><button class="btn btn-primary" onclick="window.completeReturn('${productId}')">Bekreft</button></div></div>`);
  };

  window.completeReturn = async function(productId) {
    if (useFirebase) {
      try {
        const pRef = doc(db, 'products', productId);
        await runTransaction(db, async (tx) => {
          tx.update(pRef, { status: 'available' });
        });
        renderResult(`<div class="muted">Produkt ${productId} registrert som levert.</div>`);
      } catch (e) {
        console.error(e);
        renderResult(`<div class="muted">Feil ved registrering: ${String(e)}</div>`);
      }
    } else {
      if (demoProducts[productId]) demoProducts[productId].status = 'available';
      renderResult(`<div class="muted">Produkt ${productId} registrert som levert (demo).</div>`);
    }
    updateActiveCount();
    renderFeatured();
  };

  window.extendLoan = function(productId) {
    renderResult(`<div class="muted">Lån for ${productId} forlenget (demo).</div>`);
  };

  function updateActiveCount() {
    if (useFirebase) {
      activeCount.textContent = '...';
    } else {
      const count = Object.values(demoProducts).filter(p => p.status === 'loaned').length;
      activeCount.textContent = count;
    }
  }

  // Event bindings
  scanBtn.addEventListener('click', () => handleScan(scanInput.value));
  scanInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleScan(scanInput.value); });

  adminBtn.addEventListener('click', () => { adminModal.classList.remove('hidden'); adminModal.style.display = 'flex'; adminModal.setAttribute('aria-hidden','false'); });
  adminCancel && adminCancel.addEventListener('click', () => { adminModal.classList.add('hidden'); adminModal.style.display = 'none'; adminModal.setAttribute('aria-hidden','true'); });

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.classList.add('hidden');
        adminModal.style.display = 'none';
        adminModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  adminLogin && adminLogin.addEventListener('click', async () => {
    const userEmail = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    if (useFirebase && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, userEmail, pass);
        const idTokenResult = await getIdTokenResult(cred.user);
        const isAdmin = !!(idTokenResult && idTokenResult.claims && idTokenResult.claims.admin);
        if (!isAdmin) {
          await signOut(auth);
          alert('Bruker har ikke admin-rettigheter.');
          return;
        }
        window.isAdmin = true;
        if (adminModal) { adminModal.classList.add('hidden'); adminModal.style.display = 'none'; adminModal.setAttribute('aria-hidden','true'); }
        adminBtn.textContent = `Admin (${cred.user.email})`;
        adminBtn.classList.remove('btn-outline'); adminBtn.classList.add('btn-primary');
        renderResult(`<div class="muted">Innlogget som admin (Firebase).</div>`);
      } catch (e) {
        alert('Innlogging feilet: ' + (e.message || e));
      }
    } else {
      if (userEmail === 'lager' && pass === '2IKAdm1n') {
        window.isAdmin = true;
        if (adminModal) { adminModal.classList.add('hidden'); adminModal.style.display = 'none'; adminModal.setAttribute('aria-hidden','true'); }
        adminBtn.textContent = `Admin (${userEmail})`;
        adminBtn.classList.remove('btn-outline'); adminBtn.classList.add('btn-primary');
        renderResult(`<div class="muted">Innlogget som admin (demo).</div>`);
      } else {
        alert('Ugyldig e-post eller passord (test).');
      }
    }
  });

  categoriesBtn.addEventListener('click', () => {
    renderResult(`<div><strong>Kategorier</strong><div class="muted">Vis kategorier og filtrer produkter (implementer senere).</div></div>`);
  });

  // Init
  updateActiveCount();
  renderFeatured();

  window.createLoanFirestore = createLoanFirestore;

})();