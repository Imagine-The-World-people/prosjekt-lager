/**
 * Sidebar komponent med navigasjon
 * Inkluderer meny, admin-seksjons, og brukerinfo
 */

class Sidebar {
  constructor() {
    this.isOpen = false;
  }

  render() {
    return `
      <aside class="sidebar" id="sidebar">
        <!-- Logo -->
        <div style="padding: var(--spacing-lg); border-bottom: 1px solid var(--neutral-700);">
          <div style="display: flex; gap: var(--spacing-md); align-items: center;">
            <!-- Icon SVG -->
            <div style="
              width: 40px;
              height: 40px;
              border-radius: var(--radius-lg);
              background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: var(--text-lg);
            ">
              📦
            </div>
            <div>
              <h2 style="
                margin: 0;
                font-size: var(--text-lg);
                font-weight: 700;
              ">IT Lager</h2>
              <p style="
                margin: 0;
                font-size: var(--text-xs);
                color: var(--neutral-400);
              ">Utstyrshåndtering</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav style="padding: var(--spacing-lg) 0;">
          <p style="
            padding: 0 var(--spacing-lg);
            margin-bottom: var(--spacing-md);
            font-size: var(--text-xs);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--neutral-500);
          ">Meny</p>

          <ul style="list-style: none;">
            <li>
              <a href="#/" class="nav-link active" data-page="dashboard">
                <span style="margin-right: var(--spacing-sm);">📊</span>
                Oversikt
              </a>
            </li>
            <li>
              <a href="#/scanner" class="nav-link" data-page="scanner">
                <span style="margin-right: var(--spacing-sm);">📱</span>
                Skanner
              </a>
            </li>
            <li>
              <a href="#/equipment" class="nav-link" data-page="equipment">
                <span style="margin-right: var(--spacing-sm);">⚙️</span>
                Utstyr
              </a>
            </li>
            <li>
              <a href="#/loans" class="nav-link" data-page="loans">
                <span style="margin-right: var(--spacing-sm);">📋</span>
                Utlån
              </a>
            </li>
            <li>
              <a href="#/shelves" class="nav-link" data-page="shelves">
                <span style="margin-right: var(--spacing-sm);">🗃️</span>
                Hyller
              </a>
            </li>
          </ul>
        </nav>

        <!-- Divider -->
        <div style="
          margin: var(--spacing-lg) 0;
          border-top: 1px solid var(--neutral-700);
        "></div>

        <!-- Admin Section -->
        <nav style="padding: 0 var(--spacing-lg) var(--spacing-lg);">
          <p style="
            margin-bottom: var(--spacing-md);
            font-size: var(--text-xs);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--neutral-500);
          ">Administrasjon</p>

          <ul style="list-style: none;">
            <li>
              <a href="#/admin" class="nav-link" data-page="admin">
                <span style="margin-right: var(--spacing-sm);">⚡</span>
                Admin Panel
              </a>
            </li>
            <li>
              <a href="#/settings" class="nav-link" data-page="settings">
                <span style="margin-right: var(--spacing-sm);">⚙️</span>
                Innstillinger
              </a>
            </li>
          </ul>
        </nav>

        <!-- Footer with user info -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: var(--spacing-lg);
          border-top: 1px solid var(--neutral-700);
        ">
          <div style="
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
          ">
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: var(--text-sm);
            ">
              IT
            </div>
            <div style="flex: 1; min-width: 0;">
              <p style="
                margin: 0;
                font-size: var(--text-sm);
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              " id="userName">Bruker</p>
              <p style="
                margin: 0;
                font-size: var(--text-xs);
                color: var(--neutral-400);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              " id="userRole">Gjest</p>
            </div>
          </div>
          <button id="logoutBtn" class="btn btn-outline" style="width: 100%; margin-top: var(--spacing-md); font-size: var(--text-xs);">
            Logg ut
          </button>
        </div>
      </aside>

      <style>
        .nav-link {
          display: flex;
          align-items: center;
          padding: var(--spacing-md) var(--spacing-lg);
          color: var(--neutral-300);
          transition: all 0.2s;
          border-left: 3px solid transparent;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-left-color: var(--secondary);
        }

        .nav-link.active {
          background: rgba(0, 102, 204, 0.2);
          color: var(--secondary);
          border-left-color: var(--secondary);
          font-weight: 600;
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
    parent.insertAdjacentHTML('beforeend', this.render());
    this.attachEvents();
  }

  attachEvents() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  setUser(name, role = 'Bruker') {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    if (userName) userName.textContent = name;
    if (userRole) userRole.textContent = role;
  }

  logout() {
    if (confirm('Er du sikker på at du vil logge ut?')) {
      localStorage.removeItem('user');
      window.location.href = '#/login';
    }
  }

  toggleMobile() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
      this.isOpen = !this.isOpen;
    }
  }
}

export default Sidebar;