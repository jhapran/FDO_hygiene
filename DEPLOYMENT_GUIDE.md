# FDO Hygiene Monitoring - Deployment Guide

## 📦 Two Deployment Options

This prototype supports **two deployment modes**:

### Option 1: Standalone Demo (Works Anywhere) ✅ **RECOMMENDED FOR TESTING**
### Option 2: API-Connected (Published Environment) 🚀 **RECOMMENDED FOR PRODUCTION**

---

## Option 1: Standalone Demo Mode

### ✨ Features
- ✅ Works by opening `index.html` directly in any browser
- ✅ No server or API required
- ✅ Uses built-in mock data for demonstration
- ✅ Perfect for presentations and offline demos
- ✅ All features functional (view-only mode)

### 📝 How to Use

1. **Download/Extract** all project files to a folder
2. **Open** `index.html` in your web browser
3. **That's it!** The demo will load with sample data

### 💾 What You'll See
- 5 sample projects with varying hygiene scores
- 9 hygiene issues across different severity levels  
- 6 notifications demonstrating the alert workflow
- Fully functional UI with navigation

### ⚠️ Limitations
- Data changes are temporary (refresh resets)
- No data persistence
- API write operations (create, update, delete) show alerts but don't persist
- Best for: Demos, presentations, stakeholder reviews

---

## Option 2: API-Connected Mode (Published)

### ✨ Features
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Data persistence across sessions
- ✅ Real-time updates
- ✅ Multiple users can interact
- ✅ Production-ready

### 📝 How to Deploy

#### Step 1: Publish the Application
1. Go to the **Publish tab** in this development environment
2. Click **"Publish"** or **"Deploy"** button
3. Wait for deployment to complete
4. Copy the provided URL

#### Step 2: Access Your Application
1. Open the provided URL in your browser
2. The application will automatically connect to the API
3. Full functionality with data persistence

### 💾 What You'll Have
- Persistent data storage
- Create new issues that stay saved
- Resolve issues with permanent status updates
- Real user workflow simulation
- Multi-user collaboration capability

### ⚠️ Requirements
- Must be deployed via the Publish tab
- Requires network connection
- API endpoints must be accessible

---

## 🔄 How Data Loading Works

The application is **smart** and automatically detects which mode to use:

```javascript
1. Try to connect to API endpoints
   ├─ Success? → Use live API data ✅
   └─ Failed? → Fall back to mock data ✅
```

### In Standalone Mode:
- `js/mock-data.js` provides sample data
- All JavaScript files work offline
- Instant loading, no network required

### In Published Mode:
- Real API calls to `tables/projects`, `tables/hygiene_issues`, `tables/notifications`
- Data persists in database
- Full CRUD operations available

---

## 🎯 Which Mode Should You Use?

### Use **Standalone Mode** when:
- 📊 Presenting to stakeholders
- 🎓 Training new users
- 💻 Working offline
- 🧪 Testing UI/UX changes
- 📱 Quick demos on any device

### Use **Published Mode** when:
- 🏢 Rolling out to actual users
- 💾 Need to save real data
- 👥 Multiple people need access
- 📈 Tracking real hygiene metrics
- 🔄 Need data to persist long-term

---

## 📂 File Structure (All Modes)

```
FDO_Hygiene_Monitoring/
├── index.html              # Dashboard (entry point)
├── projects.html           # Projects page
├── issues.html             # Issues page
├── css/
│   └── style.css          # All styles
├── js/
│   ├── mock-data.js       # ⭐ Sample data for standalone mode
│   ├── main.js            # Dashboard logic
│   ├── projects.js        # Projects logic
│   └── issues.js          # Issues logic
└── docs/
    ├── README.md
    ├── GETTING_STARTED.md
    ├── DEMO_SCRIPT.md
    └── QUICK_REFERENCE.md
```

---

## 🚀 Quick Start Commands

### For Standalone Demo:
```bash
# Windows
start index.html

# Mac
open index.html

# Linux
xdg-open index.html

# Or just double-click index.html
```

### For Published Deployment:
```
1. Use the Publish tab ➡️ Click Publish
2. Get your URL ➡️ Share with team
3. Done! ✅
```

---

## 🐛 Troubleshooting

### Issue: Dashboard shows "0" for all metrics
**Cause:** Data not loading  
**Solution:**
1. Check browser console (F12) for errors
2. Ensure `js/mock-data.js` is loaded (check Network tab)
3. Refresh the page (Ctrl+F5 / Cmd+Shift+R)
4. Try a different browser

### Issue: "Loading notifications..." never completes
**Cause:** JavaScript not executing  
**Solution:**
1. Check if JavaScript is enabled in browser
2. Look for JavaScript errors in console (F12)
3. Ensure all `.js` files are in the `js/` folder
4. Clear browser cache and reload

### Issue: Changes don't save in standalone mode
**Cause:** This is expected behavior  
**Solution:** This is normal for standalone mode. Use Published mode for data persistence.

### Issue: Published version shows no data
**Cause:** Database tables may be empty  
**Solution:**
1. Use the Table Data tools to add sample data
2. Or let users create data through the UI
3. Check API connectivity in browser Network tab

---

## 📊 Sample Data Included

### Standalone Mode Includes:
- **5 Projects:** Customer Portal, Mobile App, Data Migration, API Integration, Security Audit
- **9 Issues:** Mix of Critical (6), High (2), Medium (1) severity
- **6 Notifications:** Alerts, Reminders, and Resolution confirmations

### Published Mode Includes:
- Whatever data you add through the Table Data tools
- Or starts empty for fresh data entry

---

## 🔐 Security Notes

### Standalone Mode:
- ✅ No network requests = No security concerns
- ✅ All data stays in browser memory
- ✅ Safe for public demos

### Published Mode:
- ⚠️ API endpoints are accessible to anyone with URL
- ⚠️ No authentication in prototype (add in production)
- ⚠️ Consider adding user login for production use

---

## 📞 Support

### For Technical Issues:
- Check browser console for errors
- Review GETTING_STARTED.md
- See QUICK_REFERENCE.md for common tasks

### For Feature Requests:
- Document in README.md "Features Not Yet Implemented"
- Discuss with development team
- Plan for Phase 2 development

---

## ✅ Verification Checklist

After deployment, verify these work:

**Standalone Mode:**
- [ ] Dashboard loads with statistics
- [ ] Notifications panel shows 6 items
- [ ] Hygiene chart displays
- [ ] Projects page shows 5 projects
- [ ] Issues page shows 9 issues
- [ ] Navigation works between pages

**Published Mode:**
- [ ] Dashboard loads with API data
- [ ] Can create new issues
- [ ] Can resolve existing issues
- [ ] Changes persist after refresh
- [ ] Multiple browsers can see same data
- [ ] Notifications update in real-time

---

## 🎓 Next Steps

1. **Test in Standalone Mode** - Verify all features work
2. **Present to Stakeholders** - Get feedback on UI/UX
3. **Deploy Published Version** - When ready for real usage
4. **Add Initial Data** - Populate with your projects
5. **Train Users** - Use GETTING_STARTED.md guide
6. **Monitor Usage** - Track hygiene improvements

---

**Both modes are fully supported!** Choose the one that fits your current need.

For more details, see:
- **README.md** - Technical documentation
- **GETTING_STARTED.md** - User guide
- **DEMO_SCRIPT.md** - Presentation guide
