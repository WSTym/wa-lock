# WhatsApp Web - Quick Lock 🔒

<p align="center">
  <img src="icons/icon128.png" width="96" height="96" alt="WhatsApp Web Quick Lock">
</p>

<p align="center">
  <a href="https://github.com/WSTym/wa-lock/releases/latest"><img src="https://img.shields.io/github/v/release/WSTym/wa-lock?color=blue&logo=github" alt="Release"></a>
  <a href="https://github.com/WSTym/wa-lock/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://brave.com"><img src="https://img.shields.io/badge/Brave-Compatible-FB542B?logo=brave&logoColor=white" alt="Brave Compatible"></a>
  <a href="https://www.google.com/chrome/"><img src="https://img.shields.io/badge/Chrome-Compatible-4285F4?logo=googlechrome&logoColor=white" alt="Chrome Compatible"></a>
  <a href="https://web.whatsapp.com"><img src="https://img.shields.io/badge/WhatsApp%20Web-Compatible-25D366?logo=whatsapp&logoColor=white" alt="WhatsApp Web Compatible"></a>
  <a href="https://github.com/WSTym/wa-lock/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

<p align="center">
  <a href="README.md">🇧🇷 Português</a> • 
  <b>🇺🇸 English</b>
</p>

---

A lightweight and practical extension for **Brave, Google Chrome, and Chromium-based browsers** that combines two privacy actions into a single click or shortcut: **closes the open chat** and triggers native **App Lock** on [WhatsApp Web](https://web.whatsapp.com).

---

## 📸 Preview

### 1. Integrated Button on WhatsApp Web Toolbar
<p align="center">
  <img src="assets/preview.png" alt="Lock Button Integrated into WhatsApp Web" style="max-width: 100%; border-radius: 8px;">
</p>

> The lock icon 🔒 seamlessly blends into WhatsApp Web's top toolbar, matching its native visual style, dimensions, and theme.

<br>

### 2. Browser Popup & Shortcut (Brave / Chrome)
<p align="center">
  <img src="assets/popup-preview.png" alt="Extension Popup in Brave Browser" style="max-width: 340px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
</p>

> Quick access via the extension icon pinned to your browser bar, featuring automatic WhatsApp Web status detection and an instant lock trigger.

---

## 🚀 Features

- **⚡ Dual Action in 1 Click:**
  - Closes the active conversation (returning to the neutral screen with no messages visible).
  - Immediately triggers WhatsApp Web's native App Lock, requiring password/PIN to view chats.
- **🔒 Seamless Native UI:**
  - Adds a lock button directly into the WhatsApp Web toolbar, horizontally aligned with native icons.
- **⌨️ Fast Keyboard Shortcut:**
  - Press **`Alt + L`** anytime to close and lock instantly.
- **🪟 Browser Popup Menu:**
  - Click the extension icon in your browser to check status and trigger lock.
- **👻 Stealth Execution:**
  - Automates menu clicks invisibly in the background with zero distracting menu flicker.
- **🌐 Wide Compatibility:**
  - Works with **Brave**, **Google Chrome**, **Microsoft Edge**, **Opera**, **Vivaldi**, and any Chromium-based browser supporting Manifest V3 extensions.

---

## 📦 How to Install

### Option A: Direct Download (No Git required)
1. Download **`wa-lock-v1.0.0.zip`** from the **[Releases](https://github.com/WSTym/wa-lock/releases/latest)** page.
2. Extract the ZIP file into a folder on your computer.
3. Open your browser's extensions page:
   - **Brave:** `brave://extensions/`
   - **Chrome:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
4. Enable **Developer mode** toggle in the top right corner.
5. Click **Load unpacked** and select the extracted folder.

### Option B: Via Git
```bash
git clone https://github.com/WSTym/wa-lock.git
```
Then load the cloned folder in your browser's extensions page.

---

## ⚙️ Prerequisite on WhatsApp Web

For the **App Lock** action to work, WhatsApp Web's native screen lock must be configured:

1. Open [WhatsApp Web](https://web.whatsapp.com).
2. Click the **3-dots menu** at the top left > **Settings**.
3. Go to **Privacy** > **Screen lock** (or *App lock*).
4. Check the box and set your unlock password.

---

## 🎯 Usage

| Method | Action |
| :--- | :--- |
| **Toolbar Button** | Click the lock icon 🔒 in WhatsApp Web's top bar. |
| **Keyboard Shortcut** | Press `Alt + L` anywhere on WhatsApp Web. |
| **Extension Popup** | Click the extension icon in your browser and click **Close & Lock Now**. |

---

## 📄 License

This project is licensed under the [MIT](LICENSE) License © 2026 [WSTym](https://github.com/WSTym).
