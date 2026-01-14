import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, collection, runTransaction, serverTimestamp, getDocs, query, where, addDoc, updateDoc, setDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, getIdTokenResult } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

(() => {
  // UI elementer
  const scanInput = document.getElementById('scanInput');
  const scanBtn = document.getElementById('scanBtn');
  const result = document.getElementById('result');
  const activeCount = document.getElementById('activeCount');
  const availableCount = document.getElementById('availableCount');
  const maintenanceCount = document.getElementById('maintenanceCount');
  const totalEquipment = document.getElementById('totalEquipment');
  const loanedCount = document.getElementById('loanedCount');
  const userCount = document.getElementById('userCount');
  const overdueCount = document.getElementById('overdueCount');
  const activeLoans = document.getElementById('activeLoans');
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminCancel = document.getElementById('adminCancel');
  const adminLogin = document.getElementById('adminLogin');
  const featured = document.getElementById('featured');
  const categoriesBtn = document.getElementById('categoriesBtn');

  // Lokal fallback (demo)
  const demoUsers = { 
    U1001: { name: "Ola Nordmann", loans: ["P1002"], uid: "U1001" },
    U1002: { name: "Kari Andersen", loans: [], uid: "U1002" }
  };
  const demoProducts = {
    P1001: { name: "📊 Projektor 4K", status: "available", category: "AV" },
    P1002: { name: "🎵 Tromme", status: "loaned", category: "Musikk" },
    P1003: { name: "🔌 Mac-lader", status: "available", category: "Tilbehør" },
    P1004: { name: "💻 Laptop Dell", status: "maintenance", category: "Elektronikk" },
    P1005: { name: "📱 iPad Pro", status: "available", category: "Elektronikk" },
    P1006: { name: "🎮 VR Headset", status: "loaned", category: "Elektronikk" }
  };
  
  const demoLoans = [
    { id: 1, user: "Ola Nordmann", product: "Tromme", dueDate: "2026-01-20", days: 8 },
    { id: 2, user: "Kari Andersen", product: "VR Headset", dueDate: "2026-01-18", days: 6 }
  ];

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
      const statusEmoji = p.status === 'available' ? '✅' : p.status === 'loaned' ? '📤' : '⚠️';
      const statusText = p.status === 'available' ? 'Ledig' : p.status === 'loaned' ? 'Utlånt' : 'Vedlikehold';
      el.innerHTML = `<div class="title">${p.name}</div>
                      <div class="meta">${statusEmoji} ${statusText}</div>`;
      featured.appendChild(el);
    });
  }

  async function loadFirestoreData() {
    if (!useFirebase) {
      console.warn('Firebase not available, using demo data');
      updateMetrics();
      return;
    }

    try {
      console.log('🔄 Loading data from Firestore...');
      
      // Load equipment
      const equipmentSnap = await getDocs(collection(db, 'equipment'));
      const equipmentData = {};
      equipmentSnap.forEach(doc => {
        equipmentData[doc.id] = { id: doc.id, ...doc.data() };
      });
      
      // Load users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = {};
      usersSnap.forEach(doc => {
        usersData[doc.id] = { id: doc.id, ...doc.data() };
      });
      
      // Load loans
      const loansSnap = await getDocs(collection(db, 'loans'));
      const loansData = [];
      loansSnap.forEach(doc => {
        loansData.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Loaded: ${equipmentSnap.size} equipment, ${usersSnap.size} users, ${loansSnap.size} loans`);
      
      // Update metrics with real data
      const totalEq = equipmentSnap.size;
      const available = Object.values(equipmentData).filter(p => p.status === 'available').length;
      const loaned = Object.values(equipmentData).filter(p => p.status === 'loaned').length;
      const maintenance = Object.values(equipmentData).filter(p => p.status === 'maintenance').length;
      const users = usersSnap.size;
      
      totalEquipment.textContent = totalEq;
      availableCount.textContent = available;
      maintenanceCount.textContent = maintenance;
      loanedCount.textContent = loaned;
      activeCount.textContent = loaned;
      userCount.textContent = users;
      overdueCount.textContent = loansData.length;
      
      // Render active loans from Firestore
      if (loansData.length > 0) {
        activeLoans.innerHTML = loansData.map(loan => `
          <div class="loan-item">
            <div>
              <strong>${loan.equipmentSnapshot?.name || 'Ukjent produkt'}</strong> lånt av <strong>${loan.userSnapshot?.displayName || 'Ukjent bruker'}</strong>
              <br/><small style="color: var(--neutral-500);">Lånt: ${loan.loanDate?.toDate ? loan.loanDate.toDate().toLocaleDateString('nb-NO') : 'Ukjent dato'}</small>
            </div>
            <div style="text-align: right; font-size: var(--text-sm); color: var(--info);">
              <strong>${loan.status === 'active' ? 'Aktiv' : loan.status}</strong>
            </div>
          </div>
        `).join('');
      } else {
        activeLoans.innerHTML = '<p class="empty-state">Ingen aktive lån nå</p>';
      }
      
      // Render featured products from Firestore
      renderFeatured(equipmentData);
      
    } catch (error) {
      console.error('❌ Error loading Firestore data:', error);
      console.warn('Falling back to demo data');
      updateMetrics();
    }
  }

  function updateMetrics() {
    const totalEq = Object.keys(demoProducts).length;
    const available = Object.values(demoProducts).filter(p => p.status === 'available').length;
    const loaned = Object.values(demoProducts).filter(p => p.status === 'loaned').length;
    const maintenance = Object.values(demoProducts).filter(p => p.status === 'maintenance').length;
    const users = Object.keys(demoUsers).length;
    
    totalEquipment.textContent = totalEq;
    availableCount.textContent = available;
    maintenanceCount.textContent = maintenance;
    loanedCount.textContent = loaned;
    activeCount.textContent = loaned;
    userCount.textContent = users;
    overdueCount.textContent = demoLoans.length;
    
    // Render active loans
    if (demoLoans.length > 0) {
      activeLoans.innerHTML = demoLoans.map(loan => `
        <div class="loan-item">
          <div>
            <strong>${loan.product}</strong> lånt av <strong>${loan.user}</strong>
            <br/><small style="color: var(--neutral-500);">Faller forfall ${loan.dueDate}</small>
          </div>
          <div style="text-align: right; font-size: var(--text-sm); color: var(--warning);">
            <strong>${loan.days} dager igjen</strong>
          </div>
        </div>
      `).join('');
    }
  }

  function renderResult(html) {
    result.innerHTML = html;
    result.classList.remove('hidden');
  }
    result.classList.remove('hidden');
  }

  async function fetchProductFromFirestore(barcode) {
    if (!useFirebase) return null;
    try {
      const ref = doc(db, 'equipment', barcode);
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
        if (pendingLoan.productId) {
          await completeLoan(value, pendingLoan.productId);
        } else {
          renderResult(`<strong>👤 Bruker:</strong> ${user.name || user.displayName || value}<div class="muted">Lån: ${user.loans ? user.loans.join(', ') : 'ingen aktive lån'}</div>
            <div style="margin-top:10px;display:flex;gap:8px;"><button class="btn btn-primary" onclick="window.startLoan('${value}')">📦 Skann produkt for lån</button>
            <button class="btn btn-outline" onclick="window.showUserLoans('${value}')">📋 Vis lån</button></div>`);
        }
      } else {
        renderResult(`<strong>❌ Ukjent bruker</strong><div class="muted">Registrer bruker i admin-panelet først</div>`);
      }
    } else if (value.startsWith('P')) {
      const p = useFirebase ? await fetchProductFromFirestore(value) : demoProducts[value];
      if (p) {
        const statusEmoji = p.status === 'available' ? '✅' : p.status === 'loaned' ? '📤' : '⚠️';
        const statusText = p.status === 'available' ? 'Tilgjengelig' : p.status === 'loaned' ? 'Utlånt' : 'Vedlikehold';
        
        if (p.status === 'loaned') {
          renderResult(`<strong>📦 Produkt:</strong> ${p.name || value}<div class="muted">${statusEmoji} Status: ${statusText}</div>
            <div style="margin-top:10px;display:flex;gap:8px;"><button class="btn btn-primary" onclick="window.confirmReturn('${value}')">✅ Lever tilbake</button>
            <button class="btn btn-outline" onclick="window.extendLoan('${value}')">⏱️ Forleng lån</button></div>`);
        } else if (p.status === 'available') {
          if (pendingLoan.userId) {
            await completeLoan(pendingLoan.userId, value);
          } else {
            renderResult(`<strong>📦 Produkt:</strong> ${p.name || value}<div class="muted">${statusEmoji} Status: ${statusText}</div>
              <div style="margin-top:10px;"><button class="btn btn-primary" onclick="window.startLoanByProduct('${value}')">👤 Skann bruker for lån</button></div>`);
          }
        } else {
          renderResult(`<strong>📦 Produkt:</strong> ${p.name || value}<div class="muted">${statusEmoji} Status: ${statusText} - Kan ikke lånes ut</div>`);
        }
      } else {
        renderResult(`<strong>❌ Ukjent produkt</strong><div class="muted">Registrer produkt i admin-panelet først</div>`);
      }
    } else {
      renderResult(`<strong>❌ Ukjent strekkode-format</strong><div class="muted">Bruk prefiks U (bruker) eller P (produkt). Eksempel: U1001 eller P1002</div>`);
    }
  }

  let pendingLoan = { userId: null, productId: null };

  window.startLoan = function(userId) {
    pendingLoan.userId = userId;
    pendingLoan.productId = null;
    renderResult(`<div><strong>✅ Bruker valgt: ${userId}</strong><div class="muted">Skann produkt for å fullføre lån</div></div>`);
    scanInput.value = '';
    scanInput.focus();
  };

  window.startLoanByProduct = function(productId) {
    pendingLoan.productId = productId;
    pendingLoan.userId = null;
    renderResult(`<div><strong>✅ Produkt valgt: ${productId}</strong><div class="muted">Skann bruker for å fullføre lån</div></div>`);
    scanInput.value = '';
    scanInput.focus();
  };

  async function completeLoan(userId, productId) {
    if (useFirebase) {
      try {
        const equipmentRef = doc(db, 'equipment', productId);
        const userRef = doc(db, 'users', userId);
        
        const [equipmentSnap, userSnap] = await Promise.all([
          getDoc(equipmentRef),
          getDoc(userRef)
        ]);

        if (!equipmentSnap.exists()) {
          renderResult(`<div style="color: var(--danger);">❌ Produkt ${productId} finnes ikke</div>`);
          return;
        }
        if (!userSnap.exists()) {
          renderResult(`<div style="color: var(--danger);">❌ Bruker ${userId} finnes ikke</div>`);
          return;
        }

        const equipment = equipmentSnap.data();
        if (equipment.status === 'loaned') {
          renderResult(`<div style="color: var(--danger);">❌ Produktet er allerede utlånt</div>`);
          return;
        }

        const loanData = {
          userId: userId,
          equipmentId: productId,
          userSnapshot: userSnap.data(),
          equipmentSnapshot: equipment,
          loanDate: serverTimestamp(),
          dueDate: null,
          returnDate: null,
          status: 'active'
        };

        await addDoc(collection(db, 'loans'), loanData);
        await updateDoc(equipmentRef, { status: 'loaned' });

        renderResult(`<div style="color: var(--success); font-size: var(--text-lg);">✅ Lån opprettet!<br/><strong>${equipment.name}</strong> lånt til <strong>${userSnap.data().displayName}</strong></div>`);
        
        pendingLoan = { userId: null, productId: null };
        loadFirestoreData();
      } catch (error) {
        console.error('Error creating loan:', error);
        renderResult(`<div style="color: var(--danger);">❌ Feil: ${error.message}</div>`);
      }
    } else {
      if (demoProducts[productId] && demoUsers[userId]) {
        demoProducts[productId].status = 'loaned';
        if (!demoUsers[userId].loans) demoUsers[userId].loans = [];
        demoUsers[userId].loans.push(productId);
        renderResult(`<div style="color: var(--success); font-size: var(--text-lg);">✅ Lån opprettet (demo)!<br/><strong>${demoProducts[productId].name}</strong> lånt til <strong>${demoUsers[userId].name}</strong></div>`);
        pendingLoan = { userId: null, productId: null };
        updateMetrics();
        renderFeatured();
      } else {
        renderResult(`<div style="color: var(--danger);">❌ Ugyldig bruker eller produkt</div>`);
      }
    }
  }

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
        const loansQuery = query(
          collection(db, 'loans'),
          where('equipmentId', '==', productId),
          where('status', '==', 'active')
        );
        const loansSnap = await getDocs(loansQuery);
        
        if (!loansSnap.empty) {
          const loanDoc = loansSnap.docs[0];
          await updateDoc(doc(db, 'loans', loanDoc.id), {
            status: 'returned',
            returnDate: serverTimestamp()
          });
        }
        
        const equipmentRef = doc(db, 'equipment', productId);
        await updateDoc(equipmentRef, { status: 'available' });
        
        renderResult(`<div style="color: var(--success); font-size: var(--text-lg);">✅ Produkt ${productId} registrert som levert</div>`);
        loadFirestoreData();
      } catch (e) {
        console.error(e);
        renderResult(`<div style="color: var(--danger);">❌ Feil ved registrering: ${e.message}</div>`);
      }
    } else {
      if (demoProducts[productId]) {
        demoProducts[productId].status = 'available';
        Object.values(demoUsers).forEach(u => {
          if (u.loans) u.loans = u.loans.filter(l => l !== productId);
        });
      }
      renderResult(`<div style="color: var(--success); font-size: var(--text-lg);">✅ Produkt ${productId} registrert som levert (demo)</div>`);
      updateMetrics();
      renderFeatured();
    }
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
    updateMetrics();
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
        showAdminDashboard(cred.user.email);
      } catch (e) {
        alert('Innlogging feilet: ' + (e.message || e));
      }
    } else {
      if (userEmail === 'lager' && pass === '2IKAdm1n') {
        window.isAdmin = true;
        showAdminDashboard(userEmail);
      } else {
        alert('Ugyldig e-post eller passord (demo: lager / 2IKAdm1n)');
      }
    }
  });

  function showAdminDashboard(email) {
    document.getElementById('adminLoginView').classList.add('hidden');
    document.getElementById('adminDashboardView').classList.remove('hidden');
    adminBtn.textContent = `👤 ${email}`;
    adminBtn.classList.add('btn-primary');
    loadAdminData();
  }

  async function loadAdminData() {
    loadAdminEquipment();
    loadAdminUsers();
    loadAdminCategories();
    loadAdminLoans();
  }

  async function loadAdminEquipment() {
    const list = document.getElementById('equipmentList');
    if (useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'equipment'));
        list.innerHTML = snap.docs.map(doc => {
          const eq = doc.data();
          const statusColor = eq.status === 'available' ? 'var(--success)' : eq.status === 'loaned' ? 'var(--warning)' : 'var(--danger)';
          return `<div class="admin-item">
            <div><strong>${eq.name}</strong> <span style="color: var(--neutral-500);">(${doc.id})</span><br/>
            <small style="color: ${statusColor};">${eq.status}</small> • <small>${eq.category || 'Ingen kategori'}</small></div>
            <button class="btn btn-outline btn-sm" onclick="window.editEquipment('${doc.id}')">✏️ Rediger</button>
          </div>`;
        }).join('') || '<p class="empty-state">Ingen utstyr registrert</p>';
      } catch (e) {
        list.innerHTML = `<p style="color: var(--danger);">Feil ved lasting: ${e.message}</p>`;
      }
    } else {
      list.innerHTML = Object.entries(demoProducts).map(([id, eq]) => {
        const statusColor = eq.status === 'available' ? 'var(--success)' : eq.status === 'loaned' ? 'var(--warning)' : 'var(--danger)';
        return `<div class="admin-item">
          <div><strong>${eq.name}</strong> <span style="color: var(--neutral-500);">(${id})</span><br/>
          <small style="color: ${statusColor};">${eq.status}</small> • <small>${eq.category || 'Ingen kategori'}</small></div>
          <button class="btn btn-outline btn-sm" onclick="alert('Demo-modus: Kan ikke redigere')">✏️ Rediger</button>
        </div>`;
      }).join('');
    }
  }

  async function loadAdminUsers() {
    const list = document.getElementById('usersList');
    if (useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        list.innerHTML = snap.docs.map(doc => {
          const user = doc.data();
          return `<div class="admin-item">
            <div><strong>${user.displayName}</strong> <span style="color: var(--neutral-500);">(${doc.id})</span><br/>
            <small>${user.email || 'Ingen e-post'}</small></div>
            <button class="btn btn-outline btn-sm" onclick="window.editUser('${doc.id}')">✏️ Rediger</button>
          </div>`;
        }).join('') || '<p class="empty-state">Ingen brukere registrert</p>';
      } catch (e) {
        list.innerHTML = `<p style="color: var(--danger);">Feil ved lasting: ${e.message}</p>`;
      }
    } else {
      list.innerHTML = Object.entries(demoUsers).map(([id, user]) => `<div class="admin-item">
        <div><strong>${user.name}</strong> <span style="color: var(--neutral-500);">(${id})</span></div>
        <button class="btn btn-outline btn-sm" onclick="alert('Demo-modus: Kan ikke redigere')">✏️ Rediger</button>
      </div>`).join('');
    }
  }

  async function loadAdminCategories() {
    const list = document.getElementById('categoriesList');
    if (useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        list.innerHTML = snap.docs.map(doc => {
          const cat = doc.data();
          return `<div class="admin-item">
            <div><strong>${cat.name}</strong> <span style="color: var(--neutral-500);">(${doc.id})</span></div>
          </div>`;
        }).join('') || '<p class="empty-state">Ingen kategorier</p>';
      } catch (e) {
        list.innerHTML = `<p style="color: var(--danger);">Feil: ${e.message}</p>`;
      }
    } else {
      list.innerHTML = '<p class="empty-state">Demo: Elektronikk, AV, Musikk, Sport, Tilbehør</p>';
    }
  }

  async function loadAdminLoans() {
    const list = document.getElementById('allLoansList');
    if (useFirebase) {
      try {
        const snap = await getDocs(collection(db, 'loans'));
        list.innerHTML = snap.docs.map(doc => {
          const loan = doc.data();
          const statusColor = loan.status === 'active' ? 'var(--info)' : 'var(--success)';
          return `<div class="admin-item">
            <div><strong>${loan.equipmentSnapshot?.name || 'Ukjent'}</strong> → <strong>${loan.userSnapshot?.displayName || 'Ukjent'}</strong><br/>
            <small style="color: ${statusColor};">${loan.status}</small> • <small>${loan.loanDate?.toDate ? loan.loanDate.toDate().toLocaleDateString('nb-NO') : ''}</small></div>
          </div>`;
        }).join('') || '<p class="empty-state">Ingen lån</p>';
      } catch (e) {
        list.innerHTML = `<p style="color: var(--danger);">Feil: ${e.message}</p>`;
      }
    } else {
      list.innerHTML = demoLoans.map(loan => `<div class="admin-item">
        <div><strong>${loan.product}</strong> → <strong>${loan.user}</strong><br/>
        <small>Forfaller: ${loan.dueDate}</small></div>
      </div>`).join('');
    }
  }

  // Admin tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      const content = document.querySelector(`[data-content="${tab.dataset.tab}"]`);
      if (content) content.classList.remove('hidden');
    });
  });

  // Add equipment
  document.getElementById('addEquipmentBtn')?.addEventListener('click', () => {
    document.getElementById('equipmentForm').classList.remove('hidden');
    document.getElementById('equipmentFormTitle').textContent = 'Legg til nytt utstyr';
    document.getElementById('eqId').value = '';
    document.getElementById('eqName').value = '';
    document.getElementById('eqId').disabled = false;
  });

  document.getElementById('cancelEquipment')?.addEventListener('click', () => {
    document.getElementById('equipmentForm').classList.add('hidden');
  });

  document.getElementById('saveEquipment')?.addEventListener('click', async () => {
    const id = document.getElementById('eqId').value.trim();
    const name = document.getElementById('eqName').value.trim();
    const category = document.getElementById('eqCategory').value;
    const status = document.getElementById('eqStatus').value;
    
    if (!id || !name) {
      alert('Fyll ut alle obligatoriske felt');
      return;
    }
    
    if (useFirebase) {
      try {
        await setDoc(doc(db, 'equipment', id), {
          name,
          category,
          status,
          createdAt: serverTimestamp()
        });
        alert('Utstyr lagret!');
        document.getElementById('equipmentForm').classList.add('hidden');
        loadAdminEquipment();
        loadFirestoreData();
      } catch (e) {
        alert('Feil ved lagring: ' + e.message);
      }
    } else {
      demoProducts[id] = { name, category, status };
      alert('Utstyr lagret (demo)!');
      document.getElementById('equipmentForm').classList.add('hidden');
      loadAdminEquipment();
    }
  });

  // Add user
  document.getElementById('addUserBtn')?.addEventListener('click', () => {
    document.getElementById('userForm').classList.remove('hidden');
    document.getElementById('userFormTitle').textContent = 'Legg til ny bruker';
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userId').disabled = false;
  });

  document.getElementById('cancelUser')?.addEventListener('click', () => {
    document.getElementById('userForm').classList.add('hidden');
  });

  document.getElementById('saveUser')?.addEventListener('click', async () => {
    const id = document.getElementById('userId').value.trim();
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    if (!id || !name) {
      alert('Fyll ut alle obligatoriske felt');
      return;
    }
    
    if (useFirebase) {
      try {
        await setDoc(doc(db, 'users', id), {
          displayName: name,
          email: email || '',
          createdAt: serverTimestamp()
        });
        alert('Bruker lagret!');
        document.getElementById('userForm').classList.add('hidden');
        loadAdminUsers();
        loadFirestoreData();
      } catch (e) {
        alert('Feil ved lagring: ' + e.message);
      }
    } else {
      demoUsers[id] = { name, email, loans: [] };
      alert('Bruker lagret (demo)!');
      document.getElementById('userForm').classList.add('hidden');
      loadAdminUsers();
    }
  });

  document.getElementById('adminLogout')?.addEventListener('click', () => {
    window.isAdmin = false;
    if (auth && useFirebase) signOut(auth);
    document.getElementById('adminLoginView').classList.remove('hidden');
    document.getElementById('adminDashboardView').classList.add('hidden');
    adminModal.classList.add('hidden');
    adminBtn.textContent = '🔐 Admin Panel';
    adminBtn.classList.remove('btn-primary');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
  });

  categoriesBtn.addEventListener('click', () => {
    renderResult(`<div><strong>Kategorier</strong><div class="muted">Vis kategorier og filtrer produkter (implementer senere).</div></div>`);
  });

  // Window functions for admin
  window.editEquipment = async function(id) {
    document.getElementById('equipmentForm').classList.remove('hidden');
    document.getElementById('equipmentFormTitle').textContent = 'Rediger utstyr';
    document.getElementById('eqId').value = id;
    document.getElementById('eqId').disabled = true;
    
    if (useFirebase) {
      const snap = await getDoc(doc(db, 'equipment', id));
      if (snap.exists()) {
        const eq = snap.data();
        document.getElementById('eqName').value = eq.name || '';
        document.getElementById('eqCategory').value = eq.category || 'Elektronikk';
        document.getElementById('eqStatus').value = eq.status || 'available';
      }
    } else {
      const eq = demoProducts[id];
      if (eq) {
        document.getElementById('eqName').value = eq.name || '';
        document.getElementById('eqCategory').value = eq.category || 'Elektronikk';
        document.getElementById('eqStatus').value = eq.status || 'available';
      }
    }
  };

  window.editUser = async function(id) {
    document.getElementById('userForm').classList.remove('hidden');
    document.getElementById('userFormTitle').textContent = 'Rediger bruker';
    document.getElementById('userId').value = id;
    document.getElementById('userId').disabled = true;
    
    if (useFirebase) {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        const user = snap.data();
        document.getElementById('userName').value = user.displayName || '';
        document.getElementById('userEmail').value = user.email || '';
      }
    } else {
      const user = demoUsers[id];
      if (user) {
        document.getElementById('userName').value = user.name || '';
        document.getElementById('userEmail').value = user.email || '';
      }
    }
  };

  // Init - Load data from Firestore or fallback to demo
  console.log('🚀 Initializing app...');
  if (useFirebase) {
    console.log('🔥 Firebase connected - loading real data');
    loadFirestoreData();
  } else {
    console.log('💾 Using demo data (Firebase not available)');
    updateMetrics();
    renderFeatured();
  }

  window.createLoanFirestore = createLoanFirestore;

})();