/**
 * Header/Topbar komponent
 * Viser tittel, statistikk, og brukerinfo
 */

class Header {
  constructor(title = 'Oversikt', subtitle = '') {
    this.title = title;
    this.subtitle = subtitle;
    this.stats = {
      activeLoans: 0,
      totalEquipment: 0,
      availableItems: 0
    };
  }

  render() {
    return `
      <header class="topbar" id="header">
        <div class="brand">
          <button id="mobileMenuBtn" style="
            display: none;
            background: none;
            border: none;
            font-size: var(--text-2xl);
            cursor: pointer;
            color: var(--neutral-800);
            padding: var(--spacing-sm);
          ">
            ☰
          </button>
          <div>
            <h1 style="margin: 0; color: var(--neutral-900);">${this.title}</h1>
            ${this.subtitle ? `<p style="margin: 0; color: var(--neutral-500); font-size: var(--text-sm);">${this.subtitle}</p>` : ''}
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <span class="label">Aktive utlån</span>
            <span class="value" id="statActiveLoans">0</span>
          </div>
          <div class="stat">
            <span class="label">Totalt utstyr</span>
            <span class="value" id="statTotalEquipment">0</span>
          </div>
          <div class="stat">
            <span class="label">Tilgjengelig</span>
            <span class="value" id="statAvailable">0</span>
          </div>

          <!-- User menu dropdown (valgfritt) -->
          <div style="
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding-left: var(--spacing-lg);
            border-left: 1px solid var(--neutral-200);
          ">
            <div style="text-align: right;">
              <p style="
                margin: 0;
                font-size: var(--text-sm);
                font-weight: 600;
                color: var(--neutral-900);
              " id="headerUserName">Bruker</p>
              <p style="
                margin: 0;
                font-size: var(--text-xs);
                color: var(--neutral-500);
              " id="headerUserEmail">user@example.com</p>
            </div>
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              cursor: pointer;
            " id="userAvatar">
              U
            </div>
          </div>
        </div>
      </header>

      <style>
        .brand {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .brand h1 {
          margin: 0;
        }

        .stats {
          display: flex;
          gap: var(--spacing-xl);
          align-items: center;
        }

        .stat {
          text-align: right;
        }

        .stat .label {
          display: block;
          font-size: var(--text-xs);
          color: var(--neutral-500);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--spacing-xs);
        }

        .stat .value {
          display: block;
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--primary);
        }

        @media (max-width: 768px) {
          #mobileMenuBtn {
            display: block !important;
          }

          .brand h1 {
            font-size: var(--text-xl);
          }

          .stats {
            gap: var(--spacing-md);
          }

          .stat {
            display: none;
          }

          .stat:first-child {
            display: block;
          }

          .stat .label,
          .stat .value {
            font-size: var(--text-xs);
          }
        }
      </style>
    `;
  }

  mount(parentId = 'root') {
    const parent = document.getElementById(parentId);
    if (!parent) {
      console.error(`Parent element with id '${parentId}' not found`);
      return;
    }
    parent.insertAdjacentHTML('afterbegin', this.render());
    this.attachEvents();
  }

  attachEvents() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        // Trigger sidebar toggle (hvis du har Sidebar instance)
        window.sidebarInstance?.toggleMobile();
      });
    }
  }

  setTitle(title, subtitle = '') {
    this.title = title;
    this.subtitle = subtitle;
    const header = document.querySelector('.brand h1');
    if (header) header.textContent = title;
  }

  setStats(activeLoans, totalEquipment, availableItems) {
    this.stats = { activeLoans, totalEquipment, availableItems };
    
    const statsLoans = document.getElementById('statActiveLoans');
    const statsTotal = document.getElementById('statTotalEquipment');
    const statsAvailable = document.getElementById('statAvailable');

    if (statsLoans) statsLoans.textContent = activeLoans;
    if (statsTotal) statsTotal.textContent = totalEquipment;
    if (statsAvailable) statsAvailable.textContent = availableItems;
  }

  setUser(name, email) {
    const userName = document.getElementById('headerUserName');
    const userEmail = document.getElementById('headerUserEmail');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = name;
    if (userEmail) userEmail.textContent = email;
    if (userAvatar) {
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      userAvatar.textContent = initials;
    }
  }
}

export default Header;