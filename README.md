# Creative Portfolio

Modern portfolio website showcasing web design, branding, and development projects. Static site optimized for Netlify.

---

## 🚀 Deployment Workflow

### Pre-deployment Check

```bash
# Run automated checks before deploying
./check-before-deploy.sh
```

### Deploy to Netlify

```bash
# Commit changes
git add .
git commit -m "describe your changes"
git push origin main

# Manual deploy (recommended for critical updates)
netlify deploy --prod

# Important: Clear browser cache after deployment
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + F5
```

---

## 🛡️ CSS Issue Prevention

This project includes preventive measures for TailwindCSS Purge issues:

- **Manual CSS Classes:** Missing utility classes are manually added to `assets/css/style.css`
- **Inline Style Backup:** Critical spacing uses inline styles as fallback
- **Cache Control:** HTML files have no-cache headers for instant updates
- **Pre-deployment Check:** Automated script validates CSS classes before deploy

---

## 🔧 Troubleshooting

### Grid spacing not showing on Netlify

**Cause:** TailwindCSS Purge removed `gap-*` classes  

**Solution:**

1. Check `assets/css/style.css` for manual class additions
2. Verify inline styles in HTML elements
3. Clear browser cache with Cmd+Shift+R
4. Force deploy: `netlify deploy --prod`

### Changes not reflecting on production

**Cause:** Browser or CDN cache  

**Solution:**

1. Clear browser cache (Cmd+Shift+R)
2. Test in incognito/private mode
3. Force deploy: `netlify deploy --prod`
4. Check Netlify deploy logs

---

## 📊 Performance

| Metric | Target |
|--------|--------|
| PageSpeed Mobile | 95–100/100 |
| PageSpeed Desktop | 100/100 |
| First Load | < 0.5s |
| Hosting Cost | $0/month |
