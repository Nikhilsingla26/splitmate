# 🎓 SplitMate Campus &bull; Student Budget & Expense Splitter (PWA)

A sleek, modern, offline-capable **Progressive Web App (PWA)** engineered for college students, flatmates, and campus project teams. **SplitMate Campus** combines fintech aesthetics (Deep Slate `#0F172A`, Emerald Mint `#10B981`, and Coral Red `#F43F5E`) with mathematical debt simplification to eliminate awkward campus money talks.

---

## 🌟 Key Features

### 1. 📊 Executive Summary Dashboard & Group Management
- **3 Top Metric Cards:**
  - **Total Group Spend:** Total expenses in `₹` across the active ledger.
  - **You Are Owed (Emerald Mint):** Positive credit indicating what roommates owe you.
  - **You Owe (Coral Red):** Total negative liability owed to group members.
- **Dynamic Group Switcher:** Effortlessly switch between campus ledgers (e.g. *"Hostel Room 204"*, *"Weekend Trip - Manali"*, *"Project Team Apollo"*), or create custom student groups on the fly.
- **Monthly Campus Budget Meter:** Real-time visual progress bar tracking spending against the monthly room budget limit with warning triggers at 70% and 90%.

### 2. 🧮 Smart "Who Owes Whom" Debt Simplification
- Powered by a greedy **Min-Cash-Flow algorithm** that aggregates bilateral IOUs and computes the minimal transactions required to settle all roommate debts.
- **Interactive "Settle Up" Action:** Direct peer-to-peer balance clearance dialog that records settlement transactions instantly.

### 3. 🧾 Advanced Bill-Splitting Modal (`+ Add Expense`)
- Multi-input bill builder:
  - **Expense Title** (e.g., *"Late Night Pizza & Canteen"*).
  - **Amount (`₹`)** with live currency feedback.
  - **Category Selection:** Food & Dining, Rent & Utilities, Travel & Cabs, Books & Printouts, Entertainment.
  - **Paid By:** Roommate selector.
  - **Split Modes:**
    1. **Equal Split:** Divides the bill across selected roommates with live per-person rupee calculation.
    2. **Exact Amounts:** Allows entering custom rupee amounts per person with a live validation banner checking `Sum == Total`.
    3. **Percentage Split:** Allows typing percentage shares per person with live sum validation ensuring `Total == 100%` and showing calculated rupee equivalents.

### 4. 📈 Visual Analytics & Filterable Expense Feed
- **Interactive Doughnut Chart (Chart.js):** Dynamic visual breakdown of expenses across campus categories, showing custom center label and detailed legend breakdown.
- **Filterable Expense Feed:** Search expenses in real-time by title, payer, or amount; filter by category pills; sort by Newest, Oldest, or Amount.
- **CSV Report Generator:** Export clean, Excel-compatible CSV reports with UTF-8 BOM encoding for seamless rupee symbol (`₹`) presentation.

### 5. 📴 100% Offline Progressive Web App (PWA)
- **App Shell Pre-caching (`sw.js`):** Service Worker precaches `index.html`, `styles.css`, `app.js`, and `manifest.json`.
- **Runtime Stale-While-Revalidate:** Caches Google Fonts, FontAwesome, and Chart.js CDNs so the app runs smoothly without internet connection.
- **Offline Network Detection:** Live status badge showing "Online" (green) or "Offline" (amber) with toast notifications.
- **Standalone Installation:** Valid `manifest.json` with embedded SVG data-URI icons ready for installation on Android, iOS, Windows, and macOS.

---

## 🏗️ Architecture & File Structure

```
splitmate-campus/
├── index.html        # Semantic HTML5 markup, accessibility attributes, modal dialogs
├── styles.css        # Responsive fintech design system, glassmorphism, CSS variables
├── app.js            # ES6+ modular state, localStorage, settlement algorithm, Chart.js
├── manifest.json     # PWA Web App Manifest with inline SVG data URI icons
├── sw.js             # Service Worker caching strategies for offline support
└── README.md         # Full project documentation & deployment guide
```

---

## 💡 Algorithmic Logic: Debt Simplification

When 4 students share multiple bills, bilateral debts can quickly create confusing loops (e.g., *A owes B, B owes C, and C owes A*). 

SplitMate Campus solves this with a **Greedy Cash Flow Settlement Engine**:

1. **Calculate Net Balances:**
   $$\text{Net}[p] = \sum \text{PaidBy}(p) - \sum \text{ShareOf}(p)$$
   - $\text{Net}[p] > 0 \implies \text{Creditor}$ (paid more than their share)
   - $\text{Net}[p] < 0 \implies \text{Debtor}$ (paid less than their share)

2. **Greedy Matching:**
   - Sort debtors in descending order of debt magnitude.
   - Sort creditors in descending order of credit magnitude.
   - Greedily transfer $\min(\text{debtor.amount}, \text{creditor.amount})$ from the top debtor to the top creditor.
   - Decrement both amounts; remove either party once their balance reaches zero.
   - Continue until all balances are settled.

This guarantees the **absolute minimum number of transactions** to clear all group liabilities.

---

## 🎨 Design System & Color Palette

| Token | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| **Deep Slate** | `#0F172A` / `#1E293B` | Headers, navigation bar, hero surfaces, high-contrast text |
| **Emerald Mint** | `#10B981` / `#059669` | Positive balances ("You are owed"), primary action buttons, checks |
| **Coral Red** | `#F43F5E` / `#E11D48` | Debt liabilities ("You owe"), delete actions, validation errors |
| **Off-White Canvas**| `#F8FAFC` / `#F1F5F9` | Clean dashboard background with subtle radial glows |
| **Glass Border** | `rgba(226, 232, 240, 0.85)` | Glassmorphism cards with `backdrop-filter: blur(14px)` |

---

## 🚀 Local Development & Preview

Because SplitMate Campus uses native ES6 JavaScript and a Service Worker, serve the directory using any local HTTP server:

### Option 1: Python HTTP Server (Built-in)
```bash
cd splitmate-campus
python -m http.server 8080
```
Open your browser at `http://localhost:8080`.

### Option 2: Node `npx serve` or `live-server`
```bash
npx serve .
# or
npx live-server
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and click **"Open with Live Server"**.

---

## 🌐 GitHub Pages Deployment Guide

Deploying SplitMate Campus to GitHub Pages takes under 2 minutes:

1. **Initialize Git Repository:**
   ```bash
   cd splitmate-campus
   git init
   git add .
   git commit -m "feat: initial commit of SplitMate Campus PWA"
   ```

2. **Push to GitHub:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/splitmate-campus.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Navigate to your repository on GitHub.
   - Go to **Settings** > **Pages** (under Code and automation).
   - Under **Build and deployment** > **Branch**, select `main` branch and `/ (root)` folder.
   - Click **Save**.
   - Your PWA will be live at `https://<your-username>.github.io/splitmate-campus/` with full HTTPS (required for Service Worker PWA installation!).

---

## 📱 Installing the PWA

1. **On Chrome / Edge (Desktop):** Click the install icon in the address bar or select *Install SplitMate Campus* from the browser menu.
2. **On Android (Chrome):** Tap the triple dots $\rightarrow$ **"Add to Home screen"** or **"Install app"**.
3. **On iOS (Safari):** Tap the Share button $\rightarrow$ scroll down and tap **"Add to Home Screen"**.

---

## 📄 License
MIT License. Free for students, developers, and campus communities worldwide!
