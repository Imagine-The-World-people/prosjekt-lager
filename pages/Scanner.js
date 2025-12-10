/**
 * Scanner-side
 * Håndterer skanning av strekkoder for utlån og retur
 * Format: U<id> = Bruker, P<id> = Produkt/Utstyr
 */

class Scanner {
  constructor() {
    this.lastScan = null;
    this.currentUser = null;
    this.selectedEquipment = null;
    this.scanHistory = [];
  }

  async render() {
    return `
      <div style="max-width: 800px; margin: 0 auto;">
        <!-- Scanner Input -->
        <div class="card" style="margin-bottom: var(--spacing-2xl);">
          <h2 style="margin-bottom: var(--spacing-lg);">📱 Skanner</h2>
          
          <div style="margin-bottom: var(--spacing-lg);">
            <label for="scannerInput" style="
              display: block;
              font-weight: 600;
              margin-bottom: var(--spacing-sm);
            ">Strekkode eller ID:</label>
            <div style="display: flex; gap: var(--spacing-md);">
              <input 
                id="scannerInput"
                type="text"
                placeholder="Eks: U12345 eller P98765"
                autofocus
                style="flex: 1;"
              />
              <button id="scanBtn" class="btn btn-primary">Skann</button>
            </div>
            <p style="
              margin-top: var(--spacing-sm);
              font-size: var(--text-xs);
              color: var(--neutral-500);
            ">
              💡 Prefiks: <strong>U</strong> = Bruker, <strong>P</strong> = Produkt
            </p>
          </div>

          <!-- Status -->
          <div id="scanStatus" style="
            padding: var(--spacing-md);
            background: var(--neutral-50);
            border-radius: var(--radius-md);
            border-left: 3px solid var(--neutral-300);
            display: none;
          "></div>
        </div>

        <!-- Current Transaction -->
        <div id="transactionSection" style="margin-bottom: var(--spacing-2xl); display: none;">
          <div class="card">
            <h3 style="margin-top: 0;">Gjeldende transaksjon</h3>
            
            <div style="
              padding: var(--spacing-lg);
              background: linear-gradient(135deg, #f0f7ff 0%, #f5f9ff 100%);
              border-radius: var(--radius-md);
              margin-bottom: var(--spacing-lg);
              border-left: 4px solid var(--primary);
            ">
              <div style="margin-bottom: var(--spacing-md);">
                <p style="
                  margin: 0 0 var(--spacing-xs) 0;
                  font-size: var(--text-xs);
                  color: var(--neutral-500);
                  text-transform: uppercase;
                  font-weight: 600;
                ">Bruker</p>
                <p style="
                  margin: 0;
                  font-size: var(--text-lg);
                  font-weight: 700;
                " id="txnUser">-</p>
              </div>

              <div>
                <p style="
                  margin: 0 0 var(--spacing-xs) 0;
                  font-size: var(--text-xs);
                  color: var(--neutral-500);
                  text-transform: uppercase;
                  font-weight: 600;
                ">Utstyr</p>
                <p style="
                  margin: 0;
                  font-size: var(--text-lg);
                  font-weight: 700;
                " id="txnEquipment">-</p>
              </div>
            </div>

            <div style="display: flex; gap: var(--spacing-md);">
              <button id="completeBtn" class="btn btn-success" style="flex: 1; background: var(--success);">
                ✓ Fullfør
              </button>
              <button id="cancelBtn" class="btn btn-outline" style="flex: 1;">
                Avbryt
              </button>
            </div>
          </div>
        </div>

        <!-- Scan History -->
        <div class="card">
          <h3 style="margin-top: 0;">Skanningshistorikk</h3>
          <div id="historyList" style="
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
          ">
            <p style="
              color: var(--neutral-500);
              text-align: center;
              padding: var(--spacing-lg) 0;
            ">Ingen skannelser ennå</p>
          </div>
        </div>
      </div>
    `;
  }

  async mount(parentId = 'main') {
    const parent = document.getElementById(parentId);
    if (!parent) {
      console.error(`Parent element with id '${parentId}' not found`);
      return;
    }
    parent.innerHTML = await this.render();
    this.attachEvents();
  }

  attachEvents() {
    const input = document.getElementById('scannerInput');
    const scanBtn = document.getElementById('scanBtn');
    const completeBtn = document.getElementById('completeBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Scan on Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.processScan(input.value);
    });

    // Scan button
    scanBtn.addEventListener('click', () => {
      this.processScan(input.value);
      input.value = '';
      input.focus();
    });

    // Complete transaction
    completeBtn.addEventListener('click', () => this.completeTransaction());
    cancelBtn.addEventListener('click', () => this.cancelTransaction());
  }

  processScan(input) {
    const trimmed = input.trim().toUpperCase();
    const status = document.getElementById('scanStatus');

    if (!trimmed) {
      this.showStatus('error', '❌ Tom inndata');
      return;
    }

    const prefix = trimmed[0];
    const id = trimmed.slice(1);

    if (prefix === 'U') {
      this.scanUser(id);
    } else if (prefix === 'P') {
      this.scanProduct(id);
    } else {
      this.showStatus('error', '❌ Ukjent prefiks. Bruk U (bruker) eller P (produkt)');
    }
  }

  scanUser(userId) {
    // Mock: hent bruker fra Firebase
    const mockUsers = {
      '12345': { name: 'Ola Nordmann', email: 'ola@example.com' },
      '67890': { name: 'Kari Andersen', email: 'kari@example.com' }
    };

    const user = mockUsers[userId];
    if (!user) {
      this.showStatus('error', `❌ Bruker U${userId} ikke funnet`);
      return;
    }

    this.currentUser = { id: userId, ...user };
    this.showStatus('success', `✓ Bruker: ${user.name}`);
    this.updateTransactionDisplay();
  }

  scanProduct(productId) {
    if (!this.currentUser) {
      this.showStatus('error', '❌ Skann bruker først (U<id>)');
      return;
    }

    // Mock: hent produkt fra Firebase
    const mockProducts = {
      '98765': { name: 'Laptop Dell XPS', category: 'Elektronikk', serial: 'DELL-001' },
      '54321': { name: 'iPad Pro 12.9"', category: 'Nettbrett', serial: 'IPAD-001' }
    };

    const product = mockProducts[productId];
    if (!product) {
      this.showStatus('error', `❌ Produkt P${productId} ikke funnet`);
      return;
    }

    this.selectedEquipment = { id: productId, ...product };
    this.showStatus('success', `✓ Produkt: ${product.name}`);
    this.updateTransactionDisplay();
  }

  updateTransactionDisplay() {
    const txnSection = document.getElementById('transactionSection');
    const txnUser = document.getElementById('txnUser');
    const txnEquipment = document.getElementById('txnEquipment');

    if (this.currentUser && this.selectedEquipment) {
      txnUser.textContent = this.currentUser.name;
      txnEquipment.textContent = this.selectedEquipment.name;
      txnSection.style.display = 'block';
    } else if (this.currentUser) {
      txnUser.textContent = this.currentUser.name;
      txnEquipment.textContent = '(venter på produkt)';
      txnSection.style.display = 'block';
    } else {
      txnSection.style.display = 'none';
    }
  }

  completeTransaction() {
    if (!this.currentUser || !this.selectedEquipment) {
      this.showStatus('error', '❌ Ufullstendig transaksjon');
      return;
    }

    const transaction = {
      user: this.currentUser.name,
      equipment: this.selectedEquipment.name,
      timestamp: new Date().toLocaleString('nb-NO'),
      type: 'LOAN' // eller 'RETURN'
    };

    this.scanHistory.unshift(transaction);
    this.showStatus('success', `✓ Utlån registrert: ${this.selectedEquipment.name} til ${this.currentUser.name}`);
    
    // Reset
    this.currentUser = null;
    this.selectedEquipment = null;
    this.updateTransactionDisplay();
    this.updateHistory();

    document.getElementById('scannerInput').focus();
  }

  cancelTransaction() {
    this.currentUser = null;
    this.selectedEquipment = null;
    this.updateTransactionDisplay();
    this.showStatus('info', 'ℹ️ Transaksjon avbrutt');
    document.getElementById('scannerInput').focus();
  }

  updateHistory() {
    const historyList = document.getElementById('historyList');
    if (this.scanHistory.length === 0) {
      historyList.innerHTML = '<p style="color: var(--neutral-500); text-align: center; padding: var(--spacing-lg) 0;">Ingen skannelser ennå</p>';
      return;
    }

    historyList.innerHTML = this.scanHistory.map((tx, i) => `
      <div style="
        padding: var(--spacing-md);
        background: var(--neutral-50);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <p style="margin: 0; font-weight: 600;">${tx.equipment}</p>
          <p style="margin: 0; font-size: var(--text-sm); color: var(--neutral-500);">
            ${tx.user} • ${tx.timestamp}
          </p>
        </div>
        <button class="btn btn-sm btn-danger" data-index="${i}">Angre</button>
      </div>
    `).join('');

    // Undo button listeners
    historyList.querySelectorAll('[data-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.scanHistory.splice(index, 1);
        this.updateHistory();
      });
    });
  }

  showStatus(type, message) {
    const status = document.getElementById('scanStatus');
    const colors = {
      success: { bg: '#d1fae5', border: 'var(--success)', text: 'var(--success)' },
      error: { bg: '#fee2e2', border: 'var(--danger)', text: 'var(--danger)' },
      info: { bg: '#dbeafe', border: 'var(--primary)', text: 'var(--primary)' }
    };

    const color = colors[type] || colors.info;
    status.style.borderLeftColor = color.border;
    status.style.backgroundColor = color.bg;
    status.style.color = color.text;
    status.textContent = message;
    status.style.display = 'block';

    if (type !== 'error') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
  }
}

export default Scanner;