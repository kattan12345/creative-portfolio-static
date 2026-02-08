# 構造的差分レポート: WordPress版 vs 静的版

**比較対象**
- **WordPress版（正解）**: `comparison/sources/wordpress-clean.html`
- **静的版（修正対象）**: `index.html`

---

## 1. ドキュメント構造レベル

| 項目 | WordPress版 | 静的版 | 備考 |
|------|-------------|--------|------|
| DOCTYPE / html | 同一 | 同一 | 問題なし |
| body クラス | `antialiased bg-neutral-950 text-white font-sans` + data-aria-* | 同一 | 一致 |
| main の id | `id="content"` + `class="site-main"` | なし（`<main>` のみ） | 静的版で main に id を付与するとスキップリンクと一貫する |
| スキップリンク | `href="#home"` | `href="#home"` | 一致 |

---

## 🚨 CRITICAL差分（即座に修正必要 - レイアウト・機能に影響）

### C1: ヘッダーの pointer-events とラッパー構造

**WordPress版:**
```html
<header class="creative-header fixed left-0 right-0 top-0 z-50 ..." data-header>
  <div class="header-inner relative ... bg-black/0 backdrop-blur-none" data-header-inner>
```
- ヘッダー全体に `pointer-events-none` は付与されていない。クリックは通常通り。

**静的版:**
```html
<header data-header class="fixed top-0 left-0 right-0 z-50 pointer-events-none">
  <div data-header-inner class="pointer-events-auto ...">
```
- ヘッダーが `pointer-events-none`、内側のみ `pointer-events-auto`。

**影響:** グラスモーフィズム用の意図的な設計の差。静的版の方がオーバーレイ時のクリック抜けを防ぎやすい。**修正方針:** 維持で可。互換性を優先するなら WordPress に合わせて pointer-events を外す選択も可。

---

### C2: ロゴの実装（アイコン + ワードマーク）

**WordPress版:**
```html
<a href="#home" ... data-logo>
  <div class="relative">
    <div class="absolute -inset-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 ..."></div>
    <div class="relative flex h-8 w-8 ... rounded-lg bg-black ring-1 ring-white/10 ...">
      <span class="... text-transparent">C</span>
    </div>
  </div>
  <span class="logo-wordmark ..." data-logo-wordmark>Creative Portfolio</span>
</a>
```

**静的版:**
```html
<a href="#home" ...>
  <span data-logo-wordmark class="...">CREATIVE</span>
</a>
```

**影響:** 見た目が大きく異なる（WP は「C」アイコン + "Creative Portfolio"、静的は "CREATIVE" のみ）。**修正方針:** デザイン仕様が「CREATIVE」のみなら静的版でよい。WP に合わせる場合はロゴ部分の HTML を WP 版に揃える。

---

### C3: ナビゲーション — About の有無とラップ要素

**WordPress版:**
- ナビに **About** あり（`#about`）。`<ul><li>...</li></ul>` でラップ。
- リンク: Home, Work, **About**, Services, Contact（5項目）。

**静的版:**
- About なし。Home, Work, Services, Contact（4項目）。
- `<nav>` 直下に `<a>` のみ（`<ul>/<li>` なし）。

**影響:** セクション構成の差（WP に #about がある）。静的版に #about セクションが無いためナビから削除されている。**修正方針:** #about を追加する場合はナビに「About」を追加し、WP と同様 `<ul><li>` でラップするか検討。

---

### C4: ポートフォリオ — フィルタータブの数とカード構造

**WordPress版（clean）:**
- フィルターは **「All」のみ**（1ボタン）。`data-filter="all"`。
- カードは `<a href="#">` でラップ、ホバーでオーバーレイ・タイトル表示。`data-categories="uncategorized"`。
- 画像は `./assets/images/placeholder.jpg`（クリーンアップ時に置換）。

**静的版:**
- フィルターは **All, Web Design, Branding, App Development, Marketing**（5ボタン）。
- カードは `<article>` のみ（リンクでラップなし）。タイトル・年は常時表示。
- `data-categories="web-design,app-development"` など複数カテゴリ。
- `data-portfolio-empty` の空状態あり。

**影響:** フィルター機能は静的版の方が充実。WP 版は比較用にクリーンアップした結果「All」のみの可能性あり。**修正方針:** 静的版のフィルター・data-categories を維持。WP 版のカードを「リンク + ホバーオーバーレイ」に合わせるかはデザイン次第。

---

### C5: コンタクト — フォーム周りのマークアップと status 領域

**WordPress版:**
- `#contact-status` が**ない**。送信結果表示用のブロックなし。
- 送信ボタンに `data-contact-submit` や `.contact-submit-text` / `.contact-submit-loading` なし。
- `success_url` の hidden で `/thank-you.html` を指定。

**静的版:**
- `#contact-status` あり（`.contact-status-icon`, `.contact-status-message`）。
- ボタンに `data-contact-submit`、`aria-busy`、`.contact-submit-text` / `.contact-submit-loading` あり。
- `action="/#contact"`。Netlify 用。

**影響:** 静的版は contact-form.js のバリデーション・エラー表示・ローディング表示が動作する。WP 版（clean）は status 要素がないため、エラー表示を追加しないと UX が劣る。**修正方針:** 静的版の #contact-status と data-contact-submit 構造を維持。WP 側を静的化する場合は WP に同構造を追加するのがよい。

---

## ⚠️ HIGH差分（見た目・動作に明確な影響）

### H1: ヒーロー — 背景グラデーションと eyebrow / 階層

**WordPress版:**
- 背景: `bg-gradient-to-b from-purple-950 via-slate-900 to-black`。
- **eyebrow**: 「Creative Digital Agency」（グラデーション）、`data-hero-animate="fade-up" data-delay="500"`。
- 見出し: 「We Create Digital Experiences」（white→neutral-400 グラデ）、`data-delay="700"`。
- サブヘッド・CTA: `data-delay="900"`, `1100`, `1300`。スクロール文言は「Scroll to explore」。オーブは `blur-3xl` / `lg:h-96` 等。

**静的版:**
- 背景: `from-purple-950 via-neutral-950 to-black`（via が neutral-950）。
- eyebrow なし。見出しのみ「We Create」+「Digital Experiences」（fuchsia〜pink グラデ）。
- `data-delay="0","150","300"`。スクロールは「Scroll」+ dot のみ。

**影響:** ヒーローの階層・トーンが異なる。**修正方針:** 必要なら静的版に eyebrow と WP に近い data-delay を追加。背景は `via-slate-900` にするかはデザインで判断。

---

### H2: ヒーロー — オーブのサイズ・クラス

**WordPress版:**
- オーブ: `h-64 w-64 lg:h-96 lg:w-96` / `h-80 w-80 lg:h-[28rem] lg:w-[28rem]` / `h-56 w-56 lg:h-80 lg:w-80`。`blur-3xl`。
- グリッドオーバーレイ: `style="background-image: linear-gradient(...)"` の div あり。

**静的版:**
- オーブ: `w-64 h-64 lg:w-[500px] lg:h-[500px]` 等。`blur-3xl` / `blur-[120px]` 混在。
- グリッドオーバーレイなし。

**影響:** オーブの大きさ・ぼかしで雰囲気が変わる。**修正方針:** 必要に応じて WP のサイズ・blur に合わせる。グリッドは好みで追加。

---

### H3: スクロールプログレスバーのマークアップ

**WordPress版:**
```html
<div class="absolute bottom-0 left-0 right-0 h-[2px] origin-left" data-scroll-progress>
  <div class="h-full w-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-400"></div>
</div>
```

**静的版:**
```html
<div data-scroll-progress class="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-fuchsia-500 to-pink-500 ..."></div>
```
- 高さ `h-1`、子要素なしで 1 本の div。JS で `scaleX` する想定。

**影響:** WP は 2px + via 入りグラデ、静的は 1 本線。**修正方針:** header.js が `data-scroll-progress` の style.transform を触るなら、どちらでも動作する。見た目を揃えるなら WP の 2px + 子 div に合わせる。

---

### H4: モバイルメニュー — クラス名とナビ番号

**WordPress版:**
- パネル: `mobile-panel`, `mobile-menu`。`data-mobile-nav-links` は親の div。
- ナビ番号: 01〜**05**（Contact が 05）。`data-mobile-nav-num`, `data-mobile-nav-label`, `data-mobile-nav-line`。

**静的版:**
- パネル: `data-mobile-panel`。`data-mobile-nav-links` は各 `<a>` に付与。
- ナビ番号: 01〜04（Contact が 04）。About がないため 1 つ少ない。

**影響:** header.js のセレクタが `[data-mobile-nav-links]` のため、WP は「親」・静的は「リンク」で参照が異なる可能性。**修正方針:** JS が「親の子の a」と「a[data-mobile-nav-links]」のどちらを前提か確認し、HTML を合わせる。

---

### H5: Back to top の href とクラス

**WordPress版:**
- `href="#home"`。`class="back-to-top fixed ... rounded-full bg-neutral-800 p-3 ..."`。`data-back-to-top` あり。

**静的版:**
- `href="#"`。main.js の scrollToTop でトップへ。`w-12 h-12`、`border border-white/10` 等。

**影響:** 静的版は href="#" で JS に任せているため機能的には問題なし。**修正方針:** アクセシビリティや一貫性のため `href="#home"` や `href="#"` + 同一ラベルで統一可。

---

## 📝 MEDIUM差分（細かな調整・最適化）

### M1: main の id と role

**WordPress版:** `<main id="content" class="site-main" role="main">`  
**静的版:** `<main>` のみ  

**修正方針:** スキップリンクを `#content` に合わせる場合は、静的版の main に `id="content"` を追加。

---

### M2: コンテナのクラス名

**WordPress版:** `mx-auto max-w-7xl px-5 lg:px-8` 等、max-w-7xl を多用。  
**静的版:** `container`（style.css の .container で max-width 等を定義）。  

**修正方針:** レイアウト幅を完全に揃えるなら、静的版でも `max-w-7xl` を使うか、.container の定義を WP に合わせる。

---

### M3: サービスカード — フィーチャーリストとアイコン

**WordPress版:**
- 各カードに `<ul>` フィーチャーリスト（チェックアイコン + 文言）。「Learn More」リンク風のブロックあり。
- アイコン: `h-16 w-16`、`bg-gradient-to-br from-fuchsia-600 to-pink-600`。`data-service-icon`。

**静的版:**
- フィーチャーリストなし。見出し + 短文 1 つのみ。
- アイコン: `w-12 h-12`、`bg-fuchsia-500/20 text-fuchsia-400`。

**修正方針:** 情報量を揃えるなら、静的版にフィーチャーリストと「Learn More」を追加。アイコンサイズ・色は WP に合わせて変更可。

---

### M4: コンタクト — 左カラム（連絡先カード）の有無

**WordPress版:**
- 2カラム: 左に「Get In Touch」見出し + Email / Phone / Location カード。`data-contact-animate="fade-left"`。
- 右にフォーム。

**静的版:**
- 1カラム: 見出し「Get in Touch」+ 説明 + フォームのみ。左の連絡先カードなし。

**修正方針:** 静的版に Email / Phone / Location ブロックを追加すると WP と構成が近づく。

---

### M5: フッター — ソーシャルリンクと文言

**WordPress版:**
- 著作権 + 「Built with ❤️ using v0.dev + Cursor」。ソーシャルリンクなし。

**静的版:**
- 著作権 + Twitter / GitHub / LinkedIn のリンク。文言は「© 2026 Creative Portfolio. All rights reserved.」のみ。

**修正方針:** どちらを正とするかで、ソーシャル追加 or キャプション追加を検討。

---

## 💡 LOW差分（推奨改善事項）

### L1: フォームの action と success_url

**WordPress版:** `success_url` の hidden で `/thank-you.html`。  
**静的版:** `action="/#contact"`。Netlify のリダイレクトはダッシュボード設定に依存。  

**修正方針:** 静的版でも Netlify の「Success redirect」で `/thank-you.html` を指定すれば、WP と同様の遷移になる。

---

### L2: メタ情報（description, og:*）

**WordPress版:** og:title, og:description, og:url, twitter:* あり。description は空の可能性。  
**静的版:** `<meta name="description" content="...">` あり。og は未設定。  

**修正方針:** 静的版に og:title, og:description, og:url, twitter:card 等を追加すると SNS シェア時に有利。

---

### L3: スクリプト読み込み順

**WordPress版:** header.js → main.js → hero.js → portfolio-filter.js → services.js → contact-form.js。  
**静的版:** main.js → header.js → hero.js → portfolio-filter.js → services.js → contact-form.js。  

**修正方針:** ヘッダー表示・スクロール連動を早くしたい場合は、静的版でも header.js を先頭にすると WP と揃う。

---

### L4: アクセシビリティ — セクションの aria-labelledby / aria-label

**WordPress版:** `#work` に `aria-labelledby="portfolio-heading"`、`#contact` に `aria-labelledby="contact-heading"` 等。  
**静的版:** 未使用。  

**修正方針:** 静的版の該当セクションに id 付き見出しを用意し、aria-labelledby を付与するとスクリーンリーダーと整合する。

---

### L5: ポートフォリオの空状態

**WordPress版（clean):** `data-portfolio-empty` 相当のブロックなし。  
**静的版:** `data-portfolio-empty` で「No projects match this filter.» を表示。  

**修正方針:** 静的版の空状態表示を維持することを推奨。WP に合わせて導入する場合は、同じ文言で追加可。

---

## まとめ

- **CRITICAL:** ロゴ・ナビ（About の有無）・ポートフォリオのフィルター/カード構造・コンタクトの status/ボタン構造が主な差。静的版のフォーム周りとフィルターはそのまま維持し、WP に合わせる場合はロゴとナビ構造を揃えるとよい。
- **HIGH:** ヒーローの階層・オーブ・プログレスバー・モバイルメニューの data 付与先・Back to top の href を必要に応じて調整。
- **MEDIUM / LOW:** main の id、コンテナ、サービス・コンタクトの情報量、メタ・スクリプト順・aria は、優先度に応じて静的版に取り込むとよい。

**分析結果の保存先:** `comparison/analysis/diff-report.md`
