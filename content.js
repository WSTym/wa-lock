// WhatsApp Web - Bloqueio Rápido (Content Script)
// Fecha a conversa atual e bloqueia o WhatsApp Web com 1 clique ou Alt+L

(function () {
  'use strict';

  let isLocking = false;

  // Mostra um toast elegante na tela
  function showToast(message, isError = false) {
    const existingToast = document.querySelector('.wa-quick-lock-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `wa-quick-lock-toast ${isError ? 'wa-toast-error' : ''}`;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24">
        ${isError 
          ? '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>'
          : '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>'}
      </svg>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('wa-toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('wa-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Simula clique real compatível com React
  function triggerClick(element) {
    if (!element) return;
    const opts = { bubbles: true, cancelable: true, view: window };
    element.dispatchEvent(new MouseEvent('mousedown', opts));
    element.dispatchEvent(new MouseEvent('mouseup', opts));
    element.click();
  }

  // Aguarda que um item do dropdown correspondente a um dos textos apareça no DOM
  function findDropdownItem(patterns, maxWaitMs = 1200) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const check = () => {
        // Seletores comuns de itens de menu no WhatsApp Web
        const selectors = [
          '[data-animate-dropdown-item="true"]',
          '[role="menuitem"]',
          'div[role="application"] li',
          'div[role="application"] [role="button"]',
          'ul[role="menu"] li',
          'div[role="menu"] div[role="button"]',
          'div[tabindex="-1"] div[role="button"]'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));
        for (const el of elements) {
          const text = (el.innerText || el.textContent || '').trim().toLowerCase();
          for (const pattern of patterns) {
            if (pattern.test ? pattern.test(text) : text.includes(pattern.toLowerCase())) {
              return resolve(el);
            }
          }
        }

        if (Date.now() - startTime >= maxWaitMs) {
          resolve(null);
        } else {
          requestAnimationFrame(check);
        }
      };

      check();
    });
  }

  // Encontra o botão de 3 pontos do cabeçalho da conversa aberta
  function getChatMenuButton() {
    const mainHeader = document.querySelector('#main header, div[role="main"] header, [data-testid="conversation-panel-wrapper"] header');
    if (!mainHeader) return null;

    // Busca pelos ícones de menu ou atributos aria dentro do cabeçalho do chat
    const candidates = mainHeader.querySelectorAll('button, div[role="button"], span[data-icon]');
    for (const el of candidates) {
      const label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
      const icon = el.querySelector('[data-icon="menu"], [data-icon="more-options"]') || (el.getAttribute('data-icon') === 'menu' ? el : null);

      if (icon || label.includes('opções') || label.includes('menu') || label.includes('options')) {
        return el.closest('button') || el.closest('[role="button"]') || el;
      }
    }
    return null;
  }

  // Encontra o botão de 3 pontos do cabeçalho principal (barra lateral esquerda)
  function getSidebarMenuButton() {
    // Procura por headers que não sejam o do #main
    const headers = document.querySelectorAll('header:not(#main header)');
    for (const h of headers) {
      const candidates = h.querySelectorAll('button, div[role="button"], span[data-icon]');
      for (const el of candidates) {
        const label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
        const hasMenuIcon = el.querySelector('[data-icon="menu"], [data-icon="more-options"]') ||
                            el.getAttribute('data-icon') === 'menu';

        if (hasMenuIcon || label === 'menu' || label.includes('mais opções') || label.includes('more options')) {
          return el.closest('button') || el.closest('[role="button"]') || el;
        }
      }
    }
    return null;
  }

  // Fecha a conversa aberta se existir
  async function closeCurrentChat() {
    const mainArea = document.querySelector('#main, div[role="main"]');
    if (!mainArea || mainArea.offsetParent === null) {
      // Nenhuma conversa aberta
      return true;
    }

    const chatMenuBtn = getChatMenuButton();
    if (!chatMenuBtn) {
      // Fallback: tenta simular tecla Escape para fechar a conversa
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      await new Promise(r => setTimeout(r, 120));
      return true;
    }

    // Clica no menu da conversa
    triggerClick(chatMenuBtn);

    // Procura por "Fechar conversa" / "Close chat" / "Cerrar chat"
    const closeItem = await findDropdownItem([
      'fechar conversa',
      'close chat',
      'cerrar chat',
      'fermer la discussion'
    ], 1000);

    if (closeItem) {
      triggerClick(closeItem);
      // Aguarda fechamento da conversa
      await new Promise(r => setTimeout(r, 150));
      return true;
    } else {
      // Se não encontrou o item no menu, fecha o menu com Escape e tenta fechar chat com Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      await new Promise(r => setTimeout(r, 100));
      return false;
    }
  }

  // Executa o "Bloqueio do app"
  async function lockApp() {
    const sidebarMenuBtn = getSidebarMenuButton();
    if (!sidebarMenuBtn) {
      throw new Error('Botão de menu principal do WhatsApp não encontrado.');
    }

    // Clica no menu lateral principal
    triggerClick(sidebarMenuBtn);

    // Procura por "Bloqueio do app" / "Lock app" / "Bloqueo de la app"
    const lockItem = await findDropdownItem([
      'bloqueio do app',
      'lock app',
      'bloqueo de la app',
      /bloqueio/i
    ], 1200);

    if (lockItem) {
      triggerClick(lockItem);
      return true;
    } else {
      // Fecha o menu aberto caso não encontre
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      throw new Error('Opção "Bloqueio do app" não encontrada. Verifique se o bloqueio por senha está ativado nas Configurações > Privacidade do WhatsApp.');
    }
  }

  // Ação principal unificada: Fechar conversa + Bloquear WhatsApp
  async function executeQuickLock() {
    if (isLocking) return;

    // Verifica se já está bloqueado
    if (document.querySelector('[data-testid="screen-lock"], input[type="password"]')) {
      showToast('O WhatsApp já está bloqueado 🔒');
      return;
    }

    isLocking = true;
    const lockBtns = document.querySelectorAll('.wa-quick-lock-btn');
    lockBtns.forEach(btn => btn.classList.add('wa-locking'));

    // Ativa modo invisível para evitar que os menus nativos fiquem piscando na tela
    document.documentElement.classList.add('wa-lock-stealth');

    try {
      // 1. Fechar conversa atual se houver
      await closeCurrentChat();

      // 2. Acionar Bloqueio do App
      await lockApp();

      showToast('WhatsApp bloqueado com sucesso! 🔒');
    } catch (err) {
      console.error('[WhatsApp Quick Lock Error]:', err);
      showToast(err.message || 'Erro ao bloquear WhatsApp', true);
    } finally {
      // Remove classes de estado
      setTimeout(() => {
        document.documentElement.classList.remove('wa-lock-stealth');
        lockBtns.forEach(btn => btn.classList.remove('wa-locking'));
        isLocking = false;
      }, 250);
    }
  }

  // Cria o elemento do botão de bloqueio
  function createLockButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wa-quick-lock-btn';
    btn.setAttribute('data-tooltip', 'Fechar conversa e bloquear (Alt + L)');
    btn.setAttribute('aria-label', 'Fechar conversa e bloquear WhatsApp');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      executeQuickLock();
    });

    return btn;
  }

  // Procura o container horizontal da barra de ferramentas (toolbar flex row)
  function findToolbarContainer(menuBtn) {
    let curr = menuBtn;
    while (curr && curr.tagName !== 'HEADER') {
      const parent = curr.parentElement;
      if (!parent) break;

      const style = window.getComputedStyle(parent);
      const isFlexRow = (style.display === 'flex' || style.display === 'inline-flex') &&
                        (!style.flexDirection || style.flexDirection === 'row' || style.flexDirection === 'row-reverse');

      // Se o elemento pai tem layout flex horizontal e múltiplos botões/filhos
      if (isFlexRow && parent.children.length >= 2) {
        return { container: parent, referenceChild: curr };
      }

      curr = parent;
    }
    return null;
  }

  // Injeta o botão na barra de ferramentas do WhatsApp
  function injectLockButton() {
    const menuBtn = getSidebarMenuButton();
    if (!menuBtn) return;

    // Remove qualquer versão antiga que tenha ficado empilhada verticalmente dentro do wrapper do menuBtn
    const misplaced = menuBtn.parentElement?.querySelector(':scope > .wa-quick-lock-btn');
    if (misplaced) {
      misplaced.remove();
    }

    // Se o botão já existir na barra na posição correta e estiver ativo no DOM
    const existing = document.querySelector('.wa-quick-lock-wrapper');
    if (existing && document.body.contains(existing)) {
      return;
    }

    // 1. Procura o container horizontal de botões (flex row)
    const toolbar = findToolbarContainer(menuBtn);
    if (toolbar && toolbar.container) {
      const wrapper = document.createElement('div');
      wrapper.className = 'wa-quick-lock-wrapper';
      const btn = createLockButton();
      wrapper.appendChild(btn);

      // Insere na mesma linha horizontal, logo antes do botão de menu (3 pontinhos)
      toolbar.container.insertBefore(wrapper, toolbar.referenceChild);
      return;
    }

    // 2. Fallback: insere no nível pai do wrapper do menu
    const targetParent = menuBtn.parentElement?.parentElement || menuBtn.parentElement;
    if (targetParent && !targetParent.querySelector('.wa-quick-lock-wrapper, .wa-quick-lock-btn')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'wa-quick-lock-wrapper';
      const btn = createLockButton();
      wrapper.appendChild(btn);

      if (menuBtn.parentElement && targetParent.contains(menuBtn.parentElement)) {
        targetParent.insertBefore(wrapper, menuBtn.parentElement);
      } else {
        targetParent.appendChild(wrapper);
      }
    }
  }

  // Observa mudanças no DOM para reinjetar o botão sempre que o WhatsApp atualizar o header
  const observer = new MutationObserver(() => {
    injectLockButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Tentativa inicial de injeção
  injectLockButton();

  // Escuta atalho de teclado direto na página: Alt + L
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'l' || e.key === 'L' || e.code === 'KeyL')) {
      // Ignora se estiver digitando em campos de texto caso desejado, mas como é Alt+L, é atalho de comando
      e.preventDefault();
      e.stopPropagation();
      executeQuickLock();
    }
  }, true);

  // Escuta mensagens vindas do popup ou do background worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'trigger_lock' || message.action === 'quick_lock') {
      executeQuickLock();
      sendResponse({ success: true });
    }
  });

})();
