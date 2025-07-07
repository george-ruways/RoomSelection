# Room Selection App - GitHub Pages Deployment

This repository contains a Room Selection App that can be hosted on GitHub Pages.

## 🚀 Live Demo

Once deployed, your app will be available at:
`https://[your-username].github.io/[repository-name]/`

## 📋 Deployment Steps

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it `room-selection-app` (or any name you prefer)
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we already have files)

### 2. Upload Files
**Option A: Using GitHub Web Interface**
1. Click "uploading an existing file"
2. Drag and drop all files from your `RoomSelection` folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
   - `google-apps-script.js`

**Option B: Using Git Commands**
```bash
# Navigate to your project folder
cd d:\RoomSelection

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Room Selection App"

# Add remote repository (replace with your actual repo URL)
git remote add origin https://github.com/[your-username]/[repository-name].git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch
6. Select "/ (root)" folder
7. Click "Save"

### 4. Access Your App
- GitHub will provide a URL like: `https://[your-username].github.io/[repository-name]/`
- It may take a few minutes to deploy initially
- The app will be automatically updated whenever you push changes

## 🔧 Configuration for GitHub Pages

The app is already configured to work on GitHub Pages! Here's what makes it work:

### ✅ Static Files Only
- Pure HTML, CSS, and JavaScript
- No server-side dependencies
- All assets are relative paths

### ✅ GitHub Pages Compatible
- `index.html` serves as the main entry point
- All files are in the root directory
- No build process required

### ✅ Mobile Responsive
- Works on all devices
- Touch-friendly interface
- Responsive design

## 📱 Features Available on GitHub Pages

- ✅ Room size selection
- ✅ Name selection with duplicate prevention
- ✅ Mock data demonstration
- ✅ Beautiful responsive UI
- ✅ Success/error handling
- ⚠️ Google Sheets integration (requires additional setup)

## 🔗 Google Sheets Integration

To enable full Google Sheets functionality on GitHub Pages:

1. **Set up Google Apps Script** (see main README.md)
2. **Update the live app**:
   - Fork/clone your repository
   - Edit `script.js` to add your Google Apps Script URL
   - Commit and push changes
   - GitHub Pages will auto-update

## 🛠️ Development Workflow

1. **Make changes locally**
2. **Test in browser** (open `index.html`)
3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Changes automatically deploy** to GitHub Pages

## 📊 Usage Analytics

GitHub provides basic analytics for Pages:
- Repository → Insights → Traffic
- See page views and visitor data

## 🔒 Security Notes

- App runs entirely in browser (client-side)
- No sensitive data stored in repository
- Google Sheets integration uses public API
- HTTPS automatically enabled on GitHub Pages

## 🎯 SEO Optimization

Add these meta tags to `index.html` for better discoverability:

```html
<meta name="description" content="Room Selection App - Choose participants for group activities">
<meta name="keywords" content="room selection, group activities, participant selection">
<meta name="author" content="Your Name">
<meta property="og:title" content="Room Selection App">
<meta property="og:description" content="Easy-to-use app for selecting room participants">
<meta property="og:type" content="website">
```

## 📞 Support

If you encounter issues:
1. Check GitHub Pages status
2. Verify all files are uploaded
3. Check browser console for errors
4. Review GitHub repository settings

---

**Happy hosting! 🎉**
