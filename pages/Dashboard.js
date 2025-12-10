/**
 * Dashboard-side
 * Viser oversikt over utlån, utstyr, statistikk
 */

class Dashboard {
  constructor() {
    this.data = {
      activeLoans: [],
      recentActivity: [],
      equipmentStats: {}
    };
  }

  async render() {
    return `
      <div style="max-width: var(--max-width); margin: 0 auto;">
        <!-- Quick Stats Cards -->
        <div class="grid grid-3" style="margin-bottom: var(--spacing-2xl);">
          <div class="card" style="text-align: center;">
            <p style="
              margin: 0 0 var(--spacing-md) 0;
              font-size: var(--text-3xl);
            ">📊</p>
            <h3 style="margin: 0 0 var(--spacing-sm) 0;">Aktive utlån</h3>
            <p style="
              margin: 0;
              font-size: var(--text-2xl);
              font-weight: 700;
              color: var(--primary);
            " id="dashActiveLoans">0</p>
          </div>

          <div class="card" style="text-align: center;">
            <p style="
              margin: 0 0 var(--spacing-md) 0;
              font-size: var(--text-3xl);
            ">⚙️</p>
            <h3 style="margin: 0 0 var(--spacing-sm) 0;">Totalt utstyr</h3>
            <p style="
              margin: 0;
              font-size: var(--text-2xl);
              font-weight: 700;
              color: var(--secondary);
            " id="dashTotalEquipment">0</p>
          </div>

          <div class="card" style="text-align: center;">
            <p style="
              margin: 0 0 var(--spacing-md) 0;
              font-size: var(--text-3xl);
            ">✅</p>
            <h3 style="margin: 0 0 var(--spacing-sm) 0;">Tilgjengelig</h3>
            <p style="
              margin: 0;
              font-size: var(--text-2xl);
              font-weight: 700;
              color: var(--success);
            " id="dashAvailable">0</p>
          </div>
        </div>

        <!-- Recent Loans -->
        <div class="card" style="margin-bottom: var(--spacing-2xl);">
          <h2 style="margin-bottom: var(--spacing-lg);">Nylige utlån</h2>
          <div id="dashRecentLoans" style="
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          ">
            <p style="color: var(--neutral-500); text-align: center; padding: var(--spacing-xl) 0;">
              Laster data...
            </p>
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div class="card" style="
          background: linear-gradient(135deg, #fef2f2 0%, #fef5f1 100%);
          border-left: 4px solid var(--danger);
        ">
          <h3 style="
            margin-top: 0;
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
          ">
            ⚠️ Lav beholdning
          </h3>
          <p style="color: var(--neutral-600); margin: 0;">
            Følgende utstyr har få enheter igjen:
          </p>
          <div id="dashLowStock" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-md);
            margin-top: var(--spacing-lg);
          ">
            <!-- Populated by JS -->
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
    await this.loadData();
    this.attachEvents();
  }

  async loadData() {
    try {
      // Fetch fra Firebase (placeholder)
      // const loansRef = collection(db, 'loans');
      // const loansSnap = await getDocs(loansRef);

      // For nå: mock data
      this.data.activeLoans = [
        { id: 1, equipment: 'Laptop Dell', user: 'Ola Nordmann', date: '2025-12-08', dueDate: '2025-12-15' },
        { id: 2, equipment: 'iPad Pro', user: 'Kari Andersen', date: '2025-12-06', dueDate: '2025-12-13' },
      ];

      this.updateStats();
      this.renderRecentLoans();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  updateStats() {
    document.getElementById('dashActiveLoans').textContent = this.data.activeLoans.length;
    document.getElementById('dashTotalEquipment').textContent = '24';
    document.getElementById('dashAvailable').textContent = '18';
  }

  renderRecentLoans() {
    const container = document.getElementById('dashRecentLoans');
    if (!container) return;

    if (this.data.activeLoans.length === 0) {
      container.innerHTML = '<p style="color: var(--neutral-500); text-align: center; padding: var(--spacing-xl) 0;">Ingen aktive utlån</p>';
      return;
    }

    container.innerHTML = this.data.activeLoans.map(loan => `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        background: var(--neutral-50);
        border-radius: var(--radius-md);
        border-left: 3px solid var(--primary);
      ">
        <div>
          <p style="margin: 0; font-weight: 600;">${loan.equipment}</p>
          <p style="margin: 0; font-size: var(--text-sm); color: var(--neutral-500);">
            ${loan.user} • Fra ${loan.date}
          </p>
        </div>
        <div style="text-align: right;">
          <p style="
            margin: 0;
            font-size: var(--text-sm);
            font-weight: 600;
            color: ${new Date(loan.dueDate) < new Date() ? 'var(--danger)' : 'var(--success)'};
          ">
            Forfaller ${loan.dueDate}
          </p>
        </div>
      </div>
    `).join('');
  }

  attachEvents() {
    // Event listeners if needed
  }
}

export default Dashboard;