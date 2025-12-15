# FDO Hygiene Monitoring - Quick Reference Card

## 🚀 Quick Access

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `index.html` | Overview, stats, notifications, recent issues |
| **Projects** | `projects.html` | Project health monitoring, hygiene scores |
| **Issues** | `issues.html` | Issue tracking, filtering, resolution workflow |

## 📊 Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| **Hygiene Score** | ≥80% (Green) | 60-79% (Yellow) | <60% (Red) |
| **Response Time** | <24 hours | 24-48 hours | >48 hours |
| **Open Critical Issues** | 0-2 | 3-5 | >5 |

## 🎨 Color Coding

### Hygiene Scores
- 🟢 **Green (80-100%)** → Excellent health
- 🟡 **Yellow (60-79%)** → Needs attention
- 🔴 **Red (0-59%)** → Critical state

### Issue Severity
- 🔴 **Critical** → Fix immediately
- 🟠 **High** → Fix within 24 hours
- 🔵 **Medium** → Fix within 1 week
- ⚪ **Low** → Schedule as convenient

### Issue Status
- 🔴 **Open** → Not started
- 🟠 **In Progress** → Being worked on
- 🟢 **Resolved** → Fixed and verified
- ⚪ **Closed** → Archived

## 🔧 Common Actions

### Dashboard Actions
```
✓ View notification → Click notification item
✓ Resolve issue → Click "Resolve" button in table
✓ Mark all read → Click "Mark all as read"
✓ Refresh data → Click "Refresh" button
✓ Export report → Click "Generate Report"
```

### Projects Actions
```
✓ View project details → Click project card
✓ See project issues → Click "View All Issues" in modal
✓ Sort by health → Automatically sorted (lowest first)
✓ Refresh projects → Click "Refresh" button
```

### Issues Actions
```
✓ Create issue → Click "Create Issue" button
✓ Filter issues → Use dropdown filters
✓ Search issues → Type in search box
✓ View details → Click issue row
✓ Resolve issue → Click "Resolve" button
✓ Update status → Use status buttons in modal
```

## 📋 Issue Types

| Type | Description | Example |
|------|-------------|---------|
| **Missing Data** | Required information not entered | Missing milestone dates |
| **Outdated Status** | Status not updated in time | 15-day-old status |
| **Incomplete Nomination** | Resource allocation pending | Sprint 3 resources missing |
| **Data Inconsistency** | Conflicting information | Budget mismatch |
| **Compliance Gap** | Missing regulatory documentation | Security docs missing |

## 🔄 Standard Workflows

### Daily Monitoring Workflow
```
1. Open Dashboard
2. Check critical issues count
3. Review unread notifications
4. Click through to resolve critical items
5. Monitor hygiene score improvements
```

### Issue Resolution Workflow
```
1. Identify issue (dashboard/project/issues page)
2. Click to view details
3. Mark as "In Progress"
4. Perform resolution work
5. Click "Mark as Resolved"
6. Verify notification sent
```

### Weekly Review Workflow
```
1. Go to Projects page
2. Review all project hygiene scores
3. Click low-scoring projects
4. Review active issues
5. Assign or escalate as needed
6. Generate weekly report
```

## 🎯 Priority Matrix

| Severity | Status | Action Required |
|----------|--------|----------------|
| Critical | Open | **Immediate** - Drop everything |
| Critical | In Progress | **Monitor** - Check hourly |
| High | Open | **Urgent** - Start within 4 hours |
| High | In Progress | **Monitor** - Check daily |
| Medium | Open | **Schedule** - Start within 48 hours |
| Low | Open | **Queue** - Handle in next sprint |

## 🔍 Filter Quick Keys

### Severity Filters
- All Severities
- Critical only
- High only
- Medium only
- Low only

### Status Filters
- All Statuses
- Open only
- In Progress only
- Resolved only
- Closed only

### Type Filters
- All Types
- Missing Data
- Outdated Status
- Incomplete Nomination
- Data Inconsistency
- Compliance Gap

## 💡 Pro Tips

### Efficiency Tips
- ✅ Bookmark the dashboard as your homepage
- ✅ Check notifications first thing each morning
- ✅ Use filters to focus on your assigned issues
- ✅ Mark issues "In Progress" to signal ownership
- ✅ Resolve issues immediately after fixing

### Data Quality Tips
- ✅ Write clear, specific issue descriptions
- ✅ Set accurate severity levels
- ✅ Assign to the right person
- ✅ Update status regularly
- ✅ Add notes when resolving

### Team Coordination Tips
- ✅ Review unresolved issues in daily standups
- ✅ Share hygiene scores in weekly reports
- ✅ Celebrate improvements publicly
- ✅ Escalate blocked issues quickly
- ✅ Document recurring patterns

## 📞 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Data not loading | Refresh page (F5) |
| Button not working | Check JavaScript enabled |
| Chart not showing | Wait 5 seconds, then refresh |
| Modal won't close | Click outside modal or press ESC |
| Filter not working | Clear all filters and reapply |
| Search no results | Check spelling, try partial terms |

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |

## 🔐 Data Tables

### Projects Table
- Fields: id, project_name, project_manager, status, hygiene_score, critical_issues, last_updated
- Endpoint: `tables/projects`

### Hygiene Issues Table
- Fields: id, project_id, issue_type, severity, description, status, assigned_to, detected_date, resolved_date
- Endpoint: `tables/hygiene_issues`

### Notifications Table
- Fields: id, issue_id, recipient, message, type, is_read, sent_date
- Endpoint: `tables/notifications`

## 📊 API Quick Reference

```javascript
// Get all projects
GET tables/projects?limit=100

// Get specific project
GET tables/projects/{id}

// Update project
PATCH tables/projects/{id}

// Get all issues
GET tables/hygiene_issues?limit=100

// Create issue
POST tables/hygiene_issues

// Resolve issue
PATCH tables/hygiene_issues/{id}
{ "status": "Resolved", "resolved_date": "2025-12-14T10:00:00Z" }

// Get notifications
GET tables/notifications

// Mark notification as read
PATCH tables/notifications/{id}
{ "is_read": true }
```

## 📈 Success KPIs

Track these metrics for system success:

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Avg Resolution Time** | <48 hours | Time from detected to resolved |
| **Critical Issue %** | <10% | Critical issues / total issues |
| **Avg Hygiene Score** | >80% | Average across all projects |
| **Issues Resolved/Week** | Increasing | Weekly resolution count |
| **Notification Response** | <4 hours | Time to first action |

## 🆘 Need More Help?

- 📖 **Full Documentation**: See [README.md](README.md)
- 🎓 **Getting Started Guide**: See [GETTING_STARTED.md](GETTING_STARTED.md)
- 🎬 **Demo Script**: See [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

---

**Print this card** for quick desk reference or bookmark for instant access!

*Last Updated: December 14, 2025*
