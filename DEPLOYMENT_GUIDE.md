# 🚀 Iframe Area Analysis Tool - Deployment Guide

## 📋 Overview

Deploy a standalone Area Analysis Tool that can be embedded in any Experience Builder app via iframe.

## 🎯 What You're Deploying

- **Standalone React App** with full ArcGIS API integration
- **URL-Configurable** - accepts parameters for custom layers, basemap, and settings
- **Iframe-Ready** - designed specifically for embedding in Experience Builder
- **No Installation Required** - external users just use the embed URL

## 🚀 Vercel Deployment (One-Click Process)

### Step 1: Prepare Your Files

**In your project folder** (where you extracted these files), open a terminal:

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial deployment of iframe area analysis tool"
```

### Step 2: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click "New repository"** (green button)
3. **Name it:** `area-analysis-tool` (or your preferred name)
4. **Don't check any boxes** (no README, .gitignore, etc.)
5. **Click "Create repository"**
6. **Copy the repository URL** (should look like: `https://github.com/yourusername/area-analysis-tool.git`)

### Step 3: Connect Your Code to GitHub

**Replace `yourusername` and `area-analysis-tool` with your actual details:**

```bash
# Add your GitHub repository
git remote add origin https://github.com/yourusername/area-analysis-tool.git
git push -u origin main
```

**Example:** If your GitHub username is `johnsmith`:
```bash
git remote add origin https://github.com/johnsmith/area-analysis-tool.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your repository** (it should appear in the list)
5. **Click "Deploy"** (Vercel auto-detects Vite settings)

### Step 5: Your Tool is Live! 🎉

- **Main URL:** `https://your-project-name.vercel.app`
- **Iframe URL:** `https://your-project-name.vercel.app?iframe=true`

## 🌐 Using Your Deployed Tool

### Basic Embed in Experience Builder

1. **Add Embed Widget** to your Experience Builder app
2. **Set URL:** `https://your-project-name.vercel.app?iframe=true`
3. **Set dimensions:** Width: 100%, Height: 600px minimum
4. **Publish** your app

### Custom Configuration

Add parameters to customize the tool:

```
https://your-project-name.vercel.app?iframe=true&title=Custom%20Analysis&basemap=satellite&extent=-95,37,5
```

### Available Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `iframe` | Enable iframe mode | `iframe=true` |
| `title` | Report title | `title=My%20Analysis` |
| `basemap` | ArcGIS basemap | `basemap=satellite` |
| `extent` | Map center (lng,lat,zoom) | `extent=-98,39.5,4` |
| `layers` | Layer URLs (comma-separated) | `layers=url1,url2` |

## ✅ Testing Your Deployment

1. **Test direct access:** Visit your main URL
2. **Test iframe mode:** Add `?iframe=true` to your URL
3. **Test in Experience Builder:** Use the Embed widget
4. **Test sketching:** Draw a rectangle and run analysis
5. **Test download:** Verify CSV/JSON downloads work

## 🔧 Updates and Maintenance

### Making Updates
1. **Edit your code** locally
2. **Commit changes:** `git add . && git commit -m "Update description"`
3. **Push to GitHub:** `git push`
4. **Vercel auto-deploys** - all embedded instances update automatically

### Version Control
Tag stable releases:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🎉 You're Done!

Your Area Analysis Tool is now:
- ✅ **Live and accessible** to anyone with the URL
- ✅ **Ready for iframe embedding** in Experience Builder
- ✅ **Automatically updating** when you push changes to GitHub
- ✅ **Fully functional** with sketching, analysis, and downloads

**Share your iframe URL with external users - no installation required!** 🚀