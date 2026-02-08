#!/usr/bin/env bash
# =============================================================================
# check-before-deploy.sh - デプロイ前自動チェック
# Netlify デプロイ前に必須ファイル・CSS・HTML・画像を検証する
# =============================================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

FAIL_COUNT=0
WARN_COUNT=0

# -----------------------------------------------------------------------------
# ヘルパー
# -----------------------------------------------------------------------------
pass() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
fail() { printf "${RED}❌ %s${NC}\n" "$1"; ((FAIL_COUNT++)) || true; }
warn() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; ((WARN_COUNT++)) || true; }

# -----------------------------------------------------------------------------
# 1. 必須ファイルの存在チェック
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}[1] 必須ファイルの存在チェック${NC}"

REQUIRED_FILES=(
  "index.html"
  "thank-you.html"
  "404.html"
  "netlify.toml"
  "assets/css/style.css"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$f" ]]; then
    pass "存在: $f"
  else
    fail "不足: $f"
  fi
done

JS_FILES=(
  "assets/js/main.js"
  "assets/js/header.js"
  "assets/js/hero.js"
  "assets/js/portfolio-filter.js"
  "assets/js/services.js"
  "assets/js/contact-form.js"
  "assets/js/contact-form-netlify.js"
)

for f in "${JS_FILES[@]}"; do
  if [[ -f "$f" ]]; then
    pass "存在: $f"
  else
    fail "不足: $f"
  fi
done

# -----------------------------------------------------------------------------
# 2. CSS クラス存在チェック
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}[2] CSS クラス存在チェック（gap / space-y）${NC}"

CSS_FILE="assets/css/style.css"
CSS_MISSING=()

check_css_class() {
  local pattern="$1"
  local name="$2"
  if grep -qE "$pattern" "$CSS_FILE" 2>/dev/null; then
    pass "CSS に存在: $name"
  else
    warn "CSS に未定義: $name"
    CSS_MISSING+=("$name")
  fi
}

# .gap-4, .gap-6, .gap-8（スペースや { の前まで）
check_css_class '\.gap-4\s*\{' '.gap-4'
check_css_class '\.gap-6\s*\{' '.gap-6'
check_css_class '\.gap-8\s*\{' '.gap-8'
# メディアクエリ内の .md\:gap-8, .lg\:gap-8（エスケープコロン）
check_css_class '\.md\\:gap-8\s*\{' '.md:gap-8'
check_css_class '\.lg\\:gap-8\s*\{' '.lg:gap-8'
check_css_class '\.space-y-4\s*[>{]' '.space-y-4'
check_css_class '\.space-y-6\s*[>{]' '.space-y-6'
check_css_class '\.space-y-8\s*[>{]' '.space-y-8'

if [[ ${#CSS_MISSING[@]} -gt 0 ]]; then
  echo ""
  printf "${YELLOW}   未定義クラス: %s${NC}\n" "${CSS_MISSING[*]}"
  printf "${YELLOW}   style.css 末尾に手動ブロックを追加するか、Tailwind の Purge 設定を確認してください。${NC}\n"
  if [[ -t 0 ]]; then
    read -p "   自動で style.css にフォールバックを追加しますか？ [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      if ! grep -q "Missing TailwindCSS Classes (Manual Addition for Netlify)" "$CSS_FILE" 2>/dev/null; then
        cat >> "$CSS_FILE" << 'CSSBLOCK'

/* === Missing TailwindCSS Classes (Manual Addition for Netlify) === */
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
@media (min-width: 768px) {
  .md\:gap-4 { gap: 1rem; }
  .md\:gap-6 { gap: 1.5rem; }
  .md\:gap-8 { gap: 2rem; }
}
@media (min-width: 1024px) {
  .lg\:gap-4 { gap: 1rem; }
  .lg\:gap-6 { gap: 1.5rem; }
  .lg\:gap-8 { gap: 2rem; }
}
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }
CSSBLOCK
        pass "style.css に gap/space-y フォールバックを追加しました"
      else
        warn "既に手動ブロックが存在するためスキップしました"
      fi
    fi
  fi
fi

# -----------------------------------------------------------------------------
# 3. HTML 構文チェック（index.html）
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}[3] HTML 構文チェック（index.html）${NC}"

HTML_FILE="index.html"
HTML_ERR=0

if ! grep -qi '<!DOCTYPE html>' "$HTML_FILE" 2>/dev/null; then
  fail "<!DOCTYPE html> が存在しません"
  ((HTML_ERR++)) || true
else
  pass "<!DOCTYPE html> の存在"
fi

if ! grep -qE '<html[^>]*>' "$HTML_FILE" 2>/dev/null; then
  fail "<html> タグが存在しません"
  ((HTML_ERR++)) || true
else
  pass "<html> タグの存在"
fi

if ! grep -qE '<head[^>]*>' "$HTML_FILE" 2>/dev/null; then
  fail "<head> タグが存在しません"
  ((HTML_ERR++)) || true
else
  pass "<head> タグの存在"
fi

if ! grep -qE '<body[^>]*>' "$HTML_FILE" 2>/dev/null; then
  fail "<body> タグが存在しません"
  ((HTML_ERR++)) || true
else
  pass "<body> タグの存在"
fi

if ! grep -q '</body>' "$HTML_FILE" 2>/dev/null; then
  fail "</body> 閉じタグが存在しません"
  ((HTML_ERR++)) || true
else
  pass "</body> 閉じタグの存在"
fi

if ! grep -q '</html>' "$HTML_FILE" 2>/dev/null; then
  fail "</html> 閉じタグが存在しません"
  ((HTML_ERR++)) || true
else
  pass "</html> 閉じタグの存在"
fi

# 簡易タグ対応（div の数）
OPEN_DIV=$(grep -oE '<div[^>]*>' "$HTML_FILE" 2>/dev/null | wc -l | tr -d ' ')
CLOSE_DIV=$(grep -oE '</div>' "$HTML_FILE" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$OPEN_DIV" -eq "$CLOSE_DIV" ]]; then
  pass "div 開閉タグの対応（${OPEN_DIV} 対）"
else
  fail "div の開閉が一致しません（開: ${OPEN_DIV}, 閉: ${CLOSE_DIV}）"
  ((HTML_ERR++)) || true
fi

# -----------------------------------------------------------------------------
# 4. インラインスタイルバックアップ確認
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}[4] インラインスタイルバックアップ確認（gap-* / space-y-*）${NC}"

# class に gap-4 / gap-6 / gap-8 / space-y-4,6,8 があり、同じ行に style で gap が無いものを検出
INLINE_MISSING=0
while IFS= read -r line; do
  if echo "$line" | grep -qE 'class="[^"]*(gap-4|gap-6|gap-8|space-y-4|space-y-6|space-y-8)([^0-9-]|")'; then
    if ! echo "$line" | grep -qE 'style="[^"]*gap\s*:'; then
      # space-y は display: flex + gap のどちらかがあれば OK
      if echo "$line" | grep -qE 'space-y-[468]'; then
        if ! echo "$line" | grep -qE 'style="[^"]*(display:\s*flex|gap\s*:)'; then
          ((INLINE_MISSING++)) || true
        fi
      else
        ((INLINE_MISSING++)) || true
      fi
    fi
  fi
done < "$HTML_FILE"

if [[ $INLINE_MISSING -eq 0 ]]; then
  pass "gap-* / space-y-* 使用箇所にインラインスタイルバックアップあり"
else
  warn "インライン style が無い gap/space-y 要素が ${INLINE_MISSING} 箇所あります（Netlify Purge 対策で style を推奨）"
fi

# -----------------------------------------------------------------------------
# 5. 画像パス検証
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}[5] 画像パス検証${NC}"

IMG_ERR=0
while IFS= read -r src; do
  if [[ -z "$src" ]]; then continue; fi
  if [[ "$src" =~ ^https?:// ]]; then
    pass "外部URL: ${src:0:50}..."
    # オプション: 到達性チェック（デフォルトはスキップで高速化）
    if [[ "${CHECK_EXTERNAL_IMAGES:-0}" == "1" ]]; then
      if curl -sSf -o /dev/null -w "%{http_code}" --max-time 5 "$src" | grep -q '^2'; then
        pass "  到達可能"
      else
        warn "  到達できない可能性: $src"
      fi
    fi
  else
    # 相対パス（index.html 基準で解決）
    if [[ "$src" =~ ^\./ ]]; then
      REL="${src#./}"
    else
      REL="$src"
    fi
    if [[ -f "$REL" ]]; then
      pass "相対パス有効: $src"
    else
      fail "ファイルが存在しません: $src"
      ((IMG_ERR++)) || true
    fi
  fi
done < <(grep -oE '<img[^>]+src="[^"]+"' "$HTML_FILE" 2>/dev/null | sed 's/.*src="//;s/"$//')

# img が無い場合はスキップ済み。1枚以上あって IMG_ERR=0 なら pass は既に表示済み
if ! grep -qE '<img[^>]+src=' "$HTML_FILE" 2>/dev/null; then
  pass "画像パス: img タグなし（スキップ）"
fi

# -----------------------------------------------------------------------------
# 6. 総合結果
# -----------------------------------------------------------------------------
echo ""
echo "${BOLD}========================================${NC}"
if [[ $FAIL_COUNT -eq 0 ]]; then
  echo "${GREEN}${BOLD}✅ PASS: All checks passed. Safe to deploy.${NC}"
  exit 0
else
  echo "${RED}${BOLD}❌ FAIL: ${FAIL_COUNT} issue(s) found. Fix before deploying.${NC}"
  if [[ $WARN_COUNT -gt 0 ]]; then
    echo "${YELLOW}   (警告: ${WARN_COUNT} 件)${NC}"
  fi
  exit 1
fi
