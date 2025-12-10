/**
 * Generisk Modal komponent
 * Brukes for login, bekreftelser, forms, etc.
 */

class Modal {
  constructor(id = 'modal', options = {}) {
    this.id = id;
    this.isOpen = false;
    this.title = options.title || 'Modal';
    this.content = options.content || '';
    this.actions = options.actions || [];
    this.onClose = options.onClose || (() => {});
  }

  render() {
    const actionsHTML = this.actions
      .map(action => `
        <button 
          class="btn ${action.class || 'btn-primary'} btn-sm"
          data-action="${action.id}"
        >
          ${action.label}
        </button>
      `)
      .join('');

    return `
      <div class="modal hidden" id="${this.id}" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="card" style="
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.3s ease-out;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
          ">
            <h3 style="margin: 0;">${this.title}</h3>
            <button 
              class="close-modal" 
              data-modal="${this.id}"
              style="
                background: none;
                border: none;
                font-size: var(--text-2xl);
                cursor: pointer;
                color: var(--neutral-500);
                transition: color 0.2s;
              "
              aria-label="Lukk modal"
            >
              ✕
            </button>
          </div>

          <div id="${this.id}-content" style="margin-bottom: var(--spacing-lg);">
            ${this.content}
          </div>

          ${actionsHTML ? `<div class="modal-actions" style="
            display: flex;
            gap: var(--spacing-md);
            justify-content: flex-end;
          ">${actionsHTML}</div>` : ''}
        </div>
      </div>

      <style>
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
    parent.insertAdjacentHTML('beforeend', this.render());
    this.attachEvents();
  }

  attachEvents() {
    const modal = document.getElementById(this.id);
    if (!modal) return;

    // Close on X button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Action buttons
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actionId = e.target.dataset.action;
        const action = this.actions.find(a => a.id === actionId);
        if (action?.handler) action.handler();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.remove('hidden');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.add('hidden');
      this.isOpen = false;
      document.body.style.overflow = '';
      this.onClose();
    }
  }

  setContent(html) {
    const content = document.getElementById(`${this.id}-content`);
    if (content) content.innerHTML = html;
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

export default Modal;