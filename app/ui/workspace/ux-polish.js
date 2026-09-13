/* OrbitBiz workspace — practical UX layer. Keeps workflows fast without changing business logic. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};

  const focusFirst = node => {
    const field = node?.querySelector('input:not([type="hidden"]), select, textarea');
    if (field) setTimeout(() => field.focus(), 40);
  };

  const enhanceModal = node => {
    if (!node || node.dataset.uxReady) return;
    node.dataset.uxReady = "1";
    focusFirst(node);
  };

  const enhanceTables = root => {
    root.querySelectorAll('.ob-table-scroll').forEach(scroll => {
      const table = scroll.querySelector('table');
      if (!table || table.dataset.uxSearch === "1") return;
      const rows = [...table.querySelectorAll('tbody tr')];
      if (rows.length < 7) return;
      table.dataset.uxSearch = "1";
      const panel = scroll.closest('.ob-panel');
      if (!panel || panel.querySelector('[data-table-search]')) return;
      const head = panel.querySelector('.ob-panel-head');
      if (!head) return;
      const tools = document.createElement('div');
      tools.className = 'ob-table-tools';
      tools.innerHTML = '<label class="ob-search-field ob-table-search">⌕<input type="search" data-table-search placeholder="Search this list…" autocomplete="off"></label><span class="ob-result-count" data-table-count></span>';
      head.appendChild(tools);
      const input = tools.querySelector('input');
      const count = tools.querySelector('[data-table-count]');
      const filter = () => {
        const query = input.value.trim().toLowerCase();
        let visible = 0;
        rows.forEach(row => {
          const match = !query || row.textContent.toLowerCase().includes(query);
          row.hidden = !match;
          if (match) visible++;
        });
        count.textContent = `${visible} result${visible === 1 ? '' : 's'}`;
      };
      input.addEventListener('input', filter);
      filter();
    });
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches('.ob-modal')) enhanceModal(node);
      enhanceTables(node);
    }));
  });

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {childList:true, subtree:true});
    enhanceTables(document);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const modal = document.querySelector('.ob-modal');
      if (modal) { modal.remove(); event.preventDefault(); }
      return;
    }
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable) return;
      const search = document.querySelector('.ob-top-actions [data-action="search"], [data-customer-search], [data-table-search]');
      if (search) { event.preventDefault(); search.focus(); }
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.uxBusy === '1') return;
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    form.dataset.uxBusy = '1';
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.classList.add('is-busy');
    if (!button.textContent.includes('…')) button.textContent = 'Saving…';
    setTimeout(() => {
      if (document.body.contains(form) && !form.closest('.ob-modal')) {
        form.dataset.uxBusy = '0';
        button.disabled = false;
        button.classList.remove('is-busy');
      }
    }, 12000);
  }, true);

  w.uxReady = true;
})();
