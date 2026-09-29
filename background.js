// Background Service Worker para atalhos de teclado e comunicação

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "quick_lock") {
    // Busca a aba ativa na janela atual
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (activeTab && activeTab.url && activeTab.url.includes("web.whatsapp.com")) {
      chrome.tabs.sendMessage(activeTab.id, { action: "trigger_lock" }).catch((err) => {
        console.warn("Não foi possível enviar comando para a aba do WhatsApp:", err);
      });
      return;
    }

    // Se a aba ativa não for o WhatsApp, procura qualquer aba aberta com WhatsApp Web
    const whatsappTabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
    if (whatsappTabs.length > 0) {
      const targetTab = whatsappTabs[0];
      chrome.tabs.sendMessage(targetTab.id, { action: "trigger_lock" }).catch((err) => {
        console.warn("Não foi possível enviar comando para a aba do WhatsApp:", err);
      });
    }
  }
});
