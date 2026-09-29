# WhatsApp Web - Bloqueio Rápido 🔒

<p align="center">
  <img src="icons/icon128.png" width="96" height="96" alt="WhatsApp Web Bloqueio Rápido">
</p>

<p align="center">
  <a href="https://github.com/WSTym/wa-lock/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img src="https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3"></a>
  <a href="https://web.whatsapp.com"><img src="https://img.shields.io/badge/WhatsApp%20Web-Compatible-25D366?logo=whatsapp&logoColor=white" alt="WhatsApp Web Compatible"></a>
  <a href="https://github.com/WSTym/wa-lock/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

Extensão leve e prática para o **Google Chrome** que une duas ações de segurança em um único clique ou atalho: **fecha a conversa aberta** e aciona o **Bloqueio do App** nativo do [WhatsApp Web](https://web.whatsapp.com).

---

## 🚀 Funcionalidades

- **⚡ Ação Dupla em 1 Clique:**
  - Fecha a conversa ativa (retornando à tela neutra).
  - Bloqueia o WhatsApp Web exigindo a senha/PIN para exibir as mensagens e contatos.
- **🔒 Botão Nativo Integrado:**
  - Adiciona um botão com ícone de cadeado na barra de ferramentas superior do WhatsApp Web, com mesmo tamanho, estilo visual e comportamento nativo.
- **⌨️ Atalho de Teclado Rápido:**
  - Pressione **`Alt + L`** em qualquer momento para fechar e bloquear imediatamente.
- **🪟 Menu Popup no Navegador:**
  - Clique no ícone da extensão no Chrome para verificar o status e bloquear remotamente.
- **👻 Execução Transparente (*Stealth*):**
  - O fluxo de menus do WhatsApp ocorre de forma imperceptível, sem menus piscando na tela.

---

## 📦 Como Instalar no Google Chrome

1. Clone este repositório ou baixe o código como arquivo ZIP:
   ```bash
   git clone https://github.com/WSTym/wa-lock.git
   ```
2. Abra o Chrome e acesse a página de extensões:
   ```text
   chrome://extensions/
   ```
3. No canto superior direito, ative a opção **Modo do desenvolvedor** (*Developer mode*).
4. Clique em **Carregar sem compactação** (*Load unpacked*).
5. Selecione a pasta do projeto (`wa-lock`).
6. Pronto! A extensão já estará pronta para uso.

---

## ⚙️ Pré-requisito no WhatsApp Web

Para que a função de **Bloqueio do app** funcione, a proteção nativa por senha deve estar habilitada:

1. Acesse o [WhatsApp Web](https://web.whatsapp.com).
2. Clique no menu de **3 pontinhos** no canto superior esquerdo > **Configurações**.
3. Acesse **Privacidade** > **Bloqueio de tela** (ou *Bloqueio do app*).
4. Ative a funcionalidade e defina sua senha.

---

## 🎯 Formas de Uso

| Método | Ação |
| :--- | :--- |
| **Botão na Barra** | Clique no ícone de cadeado 🔒 inserido na barra superior do WhatsApp Web. |
| **Atalho de Teclado** | Pressione `Alt + L` na página do WhatsApp. |
| **Popup da Extensão** | Clique no ícone da extensão no Chrome e aperte **Fechar & Bloquear Agora**. |

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE) © 2026 [WSTym](https://github.com/WSTym).
