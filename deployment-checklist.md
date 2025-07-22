# ✅ Iframe Area Analysis Tool - Deployment Checklist

## Pre-Deployment Verification

### Code Preparation
- [ ] All files are in your project folder
- [ ] Terminal/command prompt access available
- [ ] Git is installed on your computer
- [ ] GitHub account is ready

### Required Files Check
- [ ] `vercel.json` exists in root folder
- [ ] `src/App.tsx` has iframe mode detection
- [ ] `src/components/StandaloneAreaAnalysisTool.tsx` exists
- [ ] `src/utils/urlConfig.ts` exists

## Deployment Steps

### GitHub Setup
- [ ] Git repository initialized (`git init`)
- [ ] Files added and committed (`git add . && git commit`)
- [ ] GitHub repository created online
- [ ] Local repository connected to GitHub (`git remote add origin`)
- [ ] Code pushed to GitHub (`git push -u origin main`)

### Vercel Deployment
- [ ] Vercel account created/logged in
- [ ] GitHub repository imported to Vercel
- [ ] Build completed successfully
- [ ] Deployment URL generated

## Post-Deployment Testing

### Basic Functionality
- [ ] Direct URL works: `https://your-app.vercel.app`
- [ ] Iframe mode works: `https://your-app.vercel.app?iframe=true`
- [ ] Map loads successfully
- [ ] Sketch tool draws rectangles
- [ ] Analysis runs and shows results
- [ ] Download features work (CSV, JSON)

### Parameter Testing
- [ ] Custom title: `?title=Test%20Analysis`
- [ ] Basemap change: `?basemap=satellite`
- [ ] Map extent: `?extent=-98,39.5,4`
- [ ] Multiple parameters work together

### iframe Integration
- [ ] Embeds in HTML iframe without errors
- [ ] Works in Experience Builder Embed widget
- [ ] No CORS errors in browser console
- [ ] Responsive design works in different sizes
- [ ] Full functionality available within iframe

## External Access Verification

### Cross-Platform Testing
- [ ] Works in Chrome browser
- [ ] Works in Firefox browser
- [ ] Works in Safari browser
- [ ] Works in Edge browser
- [ ] Works on mobile devices
- [ ] No authentication required

### Performance Check
- [ ] Initial load time < 5 seconds
- [ ] Map interaction is smooth
- [ ] Analysis completes in reasonable time
- [ ] Downloads work quickly

## Experience Builder Integration

### Widget Setup
- [ ] Embed widget added to Experience Builder app
- [ ] Iframe URL configured correctly
- [ ] Widget dimensions set (min 600px height)
- [ ] Experience Builder app published

### End-to-End Test
- [ ] Open published Experience Builder app
- [ ] Verify iframe loads correctly
- [ ] Test complete workflow:
  - [ ] Sketch an area on the map
  - [ ] Run analysis
  - [ ] View results
  - [ ] Download report
- [ ] Confirm external users can access

## Documentation and Sharing

### User Materials
- [ ] Deployment URL documented
- [ ] Iframe embed code prepared
- [ ] Configuration examples ready
- [ ] Support contact provided

### Version Control
- [ ] Stable version tagged in Git
- [ ] Repository documentation updated
- [ ] Change log maintained

## Production Readiness

### Security and Performance
- [ ] HTTPS enforced
- [ ] No sensitive data in URLs
- [ ] Error handling is user-friendly
- [ ] Performance is acceptable for users

### Maintenance Plan
- [ ] Update process documented
- [ ] Backup plan for critical changes
- [ ] User notification process established

## Final Verification

### Complete Workflow Test
1. [ ] **Create test Experience Builder app**
2. [ ] **Add Embed widget with your iframe URL**
3. [ ] **Publish and share with test user**
4. [ ] **Test user completes full analysis workflow**
5. [ ] **Verify all features work for external users**

### Go-Live Checklist
- [ ] All tests passed
- [ ] External users can access tool
- [ ] Documentation is complete
- [ ] Support process is ready
- [ ] Tool is ready for production use

---

## 🎉 Deployment Complete!

When all items are checked:
1. **Share your iframe URL** with external users
2. **Provide configuration examples** for customization
3. **Monitor usage** and gather feedback
4. **Update as needed** using the Git workflow

Your Area Analysis Tool is now live and ready for embedding! 🚀

## Quick Reference

**Your Iframe URL Pattern:**
```
https://your-project-name.vercel.app?iframe=true&[optional-parameters]
```

**Experience Builder Integration:**
1. Add Embed widget
2. Use your iframe URL
3. Set width: 100%, height: 600px+
4. Publish app