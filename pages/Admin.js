/**
 * Admin Panel
 * Brukes av admin for å administrere utstyr, brukere, utlån, etc.
 */

class Admin {
  constructor() {
    this.currentTab = 'equipment';
    this.equipment = [];
    this.users = [];
  }

  async render() {
    return `
      <div style="max-width: var(--max-width); margin: 0 auto;">
        <h1 style="margin-bottom: var(--spacing-xl);">⚡ Admin Panel</h1>

        <!-- Tabs -->
        <div style="
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
          border-bottom: 2px solid var(--neutral-200);
        ">
          <button class="admin-tab active" data-tab="equipment" style="
            padding: var(--spacing-md) var(--spacing-lg);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-weight: 600;
            color: var(--neutral-600);
            transition: all 0.2s;
          ">
            ⚙️ Utstyr
          </button>
          <button class="admin-tab" data-tab="users" style="
            padding: var(--spacing-md) var(--spacing-lg);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-weight: 600;
            color: var(--neutral-600);
            transition: all 0.2s;
          ">
            👥 Brukere
          </button>
          <button class="admin-tab" data-tab="loans" style="
            padding: var(--spacing-md) var(--spacing-lg);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-weight: 600;
            color: var(--neutral-600);
            transition: all 0.2s;
          ">
            📋 Utlån
          </button>
          <button class="admin-tab" data-tab="settings" style="
            padding: var(--spacing-md) var(--spacing-lg);
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-weight: 600;
            color: var(--neutral-600);
            transition: all 0.2s;
          ">
            ⚙️ Innstillinger
          </button>
        </div>

        <!-- Equipment Tab -->
        <div id="equipmentTab" class="admin-tab-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);">
            <h2 style="margin: 0;">Utstyr</h2>
            <button id="addEquipmentBtn" class="btn btn-primary">+ Legg til utstyr</button>
          </div>
          <div id="equipmentList" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--spacing-lg);
          ">
            <!-- Populated by JS -->
          </div>
        </div>

        <!-- Users Tab -->
        <div id="usersTab" class="admin-tab-content hidden">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);">
            <h2 style="margin: 0;">Brukere</h2>
            <button id="addUserBtn" class="btn btn-primary">+ Legg til bruker</button>
          </div>
          <div id="usersList" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--spacing-lg);
          ">
            <!-- Populated by JS -->
          </div>
        </div>

        <!-- Loans Tab -->
        <div id="loansTab" class="admin-tab-content hidden">
          <h2 style="margin-bottom: var(--spacing-xl);">Alle utlån</h2>
          <div id="loansList" style="
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          ">
            <!-- Populated by JS -->
          </div>
        </div>

        <!-- Settings Tab -->
        <div id="settingsTab" class="admin-tab-content hidden">
          <h2 style="margin-bottom: var(--spacing-xl);">Innstillinger</h2>
          <div class="card" style="max-width: 600px;">
            <h3 style="margin-top: 0;">Systeminnstillinger</h3>
            <label style="display: block; margin-bottom: var(--spacing-lg);">
              <input type="checkbox" checked /> Aktiver pushmeldinger for forfalte utlån
            </label>
            <label style="display: block; margin-bottom: var(--spacing-lg);">
              <input type="checkbox" checked /> Krever bekreftelse ved retur
            </label>
            <button class="btn btn-primary">Lagre innstillinger</button>
          </div>
        </div>
      </div>

      <style>
        .admin-tab {
          border-bottom-color: transparent;
          color: var(--neutral-600);
        }

        .admin-tab.active {
          border-bottom-color: var(--primary);
          color: var(--primary);
        }

        .admin-tab-content.hidden {
          display: none;
        }
      </style>
    `;
  }

  async mount(parentId = 'main') {
    const parent = document.getElementById(parentId);
    if (!parent) {
      console.error(`Parent element with id '${parentId}' not found`);
      return;
    }
    parent.innerHTML = await this.render();
    await this.loadData();
    this.attachEvents();
  }

  async loadData() {
    // Mock data
    this.equipment = [
      { id: 1, name: 'Laptop Dell XPS', category: 'Elektronikk', quantity: 5, available: 3, serial: 'DELL-001' },
      { id: 2, name: 'iPad Pro', category: 'Nettbrett', quantity: 8, available: 6, serial: 'IPAD-001' }
    ];

    this.users = [
      { id: 1, name: 'Ola Nordmann', email: 'ola@example.com', role: 'Bruker', active: true },
      { id: 2, name: 'Kari Andersen', email: 'kari@example.com', role: 'Admin', active: true }
    ];

    this.renderEquipment();
    this.renderUsers();
  }

  renderEquipment() {
    const list = document.getElementById('equipmentList');
    if (!list) return;

    list.innerHTML = this.equipment.map(item => `
      <div class="card">
        <h4 style="margin-top: 0;">${item.name}</h4>
        <p style="color: var(--neutral-500); margin: 0 0 var(--spacing-md) 0;">
          ${item.category} • S/N: ${item.serial}
        </p>
        <div style="
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-md);
          background: var(--neutral-50);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-md);
        ">
          <div>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--neutral-500);">Totalt</p>
            <p style="margin: 0; font-size: var(--text-lg); font-weight: 700;">${item.quantity}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--neutral-500);">Tilgjengelig</p>
            <p style="
              margin: 0;
              font-size: var(--text-lg);
              font-weight: 700;
              color: ${item.available > 2 ? 'var(--success)' : 'var(--danger)'};
            ">${item.available}</p>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" style="width: 100%; margin-bottom: var(--spacing-sm);">Rediger</button>
        <button class="btn btn-sm btn-danger" style="width: 100%;">Slett</button>
      </div>
    `).join('');
  }

  renderUsers() {
    const list = document.getElementById('usersList');
    if (!list) return;

    list.innerHTML = this.users.map(user => `
      <div class="card">
        <h4 style="margin-top: 0;">${user.name}</h4>
        <p style="color: var(--neutral-500); margin: 0 0 var(--spacing-md) 0;">${user.email}</p>
        <div style="margin-bottom: var(--spacing-md);">
          <span style="
            display: inline-block;
            padding: var(--spacing-xs) var(--spacing-md);
            background: ${user.role === 'Admin' ? 'var(--accent-light)' : 'var(--neutral-200)'};
            color: ${user.role === 'Admin' ? 'white' : 'var(--neutral-700)'};
            border-radius: var(--radius-sm);
            font-size: var(--text-xs);
            font-weight: 600;
          ">${user.role}</span>
        </div>
        <button class="btn btn-sm btn-outline" style="width: 100%; margin-bottom: var(--spacing-sm);">Rediger</button>
        <button class="btn btn-sm btn-danger" style="width: 100%;">Fjern</button>
      </div>
    `).join('');
  }

  attachEvents() {
    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Add buttons (placeholder)
    document.getElementById('addEquipmentBtn')?.addEventListener('click', () => {
      alert('Åpne modal for å legge til utstyr');
    });

    document.getElementById('addUserBtn')?.addEventListener('click', () => {
      alert('Åpne modal for å legge til bruker');
    });
  }

  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}Tab`)?.classList.remove('hidden');
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    this.currentTab = tabName;
  }
}

export default Admin;