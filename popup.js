// Controle do Popup da extensão

document.addEventListener('DOMContentLoaded', async () => {
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('statusText');
  const btnLock = document.getElementById('btnLock');

  let targetTabId = null;

  async function checkWhatsAppTab() {
    // 1. Tenta a aba ativa
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.url && activeTab.url.includes('web.whatsapp.com')) {
      targetTabId = activeTab.id;
      statusDot.className = 'status-dot online';
      statusText.textContent = 'WhatsApp Web ativo';
      btnLock.disabled = false;
      return;
    }

    // 2. Busca qualquer aba com WhatsApp Web
    const whatsappTabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    if (whatsappTabs.length > 0) {
      targetTabId = whatsappTabs[0].id;
      statusDot.className = 'status-dot online';
      statusText.textContent = 'WhatsApp Web encontrado em segundo plano';
      btnLock.disabled = false;
      return;
    }

    // 3. Nenhuma aba encontrada
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Abra o web.whatsapp.com';
    btnLock.disabled = true;
  }

  btnLock.addEventListener('click', async () => {
    if (!targetTabId) return;

    btnLock.disabled = true;
    btnLock.querySelector('span').textContent = 'Bloqueando...';

    try {
      await chrome.tabs.sendMessage(targetTabId, { action: 'trigger_lock' });
      btnLock.querySelector('span').textContent = 'Bloqueado!';
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (err) {
      console.error(err);
      statusText.textContent = 'Erro ao enviar comando';
      btnLock.disabled = false;
      btnLock.querySelector('span').textContent = 'Tentar novamente';
    }
  });

  await checkWhatsAppTab();
});
