// Global state
let projects = [];
let issues = [];
let notifications = [];
let hygieneChart = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    initializeChart();
    updateDashboard();
    
    // Auto-refresh every 60 seconds
    setInterval(async () => {
        await loadAllData();
        updateDashboard();
    }, 60000);
});

// Load all data from API
async function loadAllData() {
    try {
        // Try to use MockAPI if available, otherwise use fetch
        const apiCall = typeof MockAPI !== 'undefined' ? MockAPI.fetch.bind(MockAPI) : fetch;
        
        const [projectsData, issuesData, notificationsData] = await Promise.all([
            apiCall('tables/projects?limit=100').then(r => r.data ? r : r.json()),
            apiCall('tables/hygiene_issues?limit=100').then(r => r.data ? r : r.json()),
            apiCall('tables/notifications?limit=100').then(r => r.data ? r : r.json())
        ]);
        
        projects = projectsData.data || [];
        issues = issuesData.data || [];
        notifications = notificationsData.data || [];
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update dashboard with current data
function updateDashboard() {
    updateStats();
    updateNotifications();
    updateIssuesTable();
    updateChart();
}

// Update statistics cards
function updateStats() {
    const criticalIssues = issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
    const pendingIssues = issues.filter(i => i.status === 'Open' || i.status === 'In Progress').length;
    const resolvedToday = issues.filter(i => {
        if (!i.resolved_date) return false;
        const today = new Date().toDateString();
        const resolvedDate = new Date(i.resolved_date).toDateString();
        return today === resolvedDate;
    }).length;
    
    const avgScore = projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + (p.hygiene_score || 0), 0) / projects.length)
        : 0;
    
    document.getElementById('criticalIssues').textContent = criticalIssues;
    document.getElementById('pendingIssues').textContent = pendingIssues;
    document.getElementById('resolvedToday').textContent = resolvedToday;
    document.getElementById('avgHygieneScore').textContent = avgScore + '%';
    
    // Update notification count
    const unreadCount = notifications.filter(n => !n.is_read).length;
    document.getElementById('notificationCount').textContent = unreadCount;
}

// Update notifications list
function updateNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<div class="loading">No notifications</div>';
        return;
    }
    
    // Sort by date, newest first
    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.sent_date) - new Date(a.sent_date)
    );
    
    notificationsList.innerHTML = sortedNotifications.map(notification => {
        const issue = issues.find(i => i.id === notification.issue_id);
        const severity = issue ? issue.severity.toLowerCase() : 'medium';
        const unreadClass = notification.is_read ? '' : 'unread';
        const alertClass = severity === 'critical' ? 'alert-critical' : severity === 'high' ? 'alert-high' : '';
        
        return `
            <div class="notification-item ${unreadClass} ${alertClass}" onclick="viewNotification('${notification.id}')">
                <div class="notification-header">
                    <div class="notification-title">${notification.recipient}</div>
                    <div class="notification-time">${formatRelativeTime(notification.sent_date)}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
                <span class="notification-badge-type badge-${notification.type.toLowerCase()}">${notification.type}</span>
            </div>
        `;
    }).join('');
}

// Update issues table
function updateIssuesTable() {
    const tableBody = document.getElementById('issuesTableBody');
    
    if (issues.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">No issues found</td></tr>';
        return;
    }
    
    // Sort by detected date, newest first, and show only first 10
    const recentIssues = [...issues]
        .sort((a, b) => new Date(b.detected_date) - new Date(a.detected_date))
        .slice(0, 10);
    
    tableBody.innerHTML = recentIssues.map(issue => {
        const project = projects.find(p => p.id === issue.project_id);
        const projectName = project ? project.project_name : 'Unknown Project';
        
        return `
            <tr onclick="viewIssueDetails('${issue.id}')">
                <td><span class="badge badge-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></td>
                <td><span class="badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span></td>
                <td>${issue.issue_type}</td>
                <td>
                    <div style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${issue.description}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        ${projectName}
                    </div>
                </td>
                <td>${issue.assigned_to}</td>
                <td>${formatDate(issue.detected_date)}</td>
                <td>
                    ${issue.status === 'Open' || issue.status === 'In Progress' ? 
                        `<button class="btn btn-success" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="event.stopPropagation(); resolveIssue('${issue.id}')">
                            <i class="fas fa-check"></i> Resolve
                        </button>` : 
                        '<span style="color: var(--success-color);"><i class="fas fa-check-circle"></i> Resolved</span>'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize hygiene score chart
function initializeChart() {
    const ctx = document.getElementById('hygieneChart');
    if (!ctx) return;
    
    hygieneChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Hygiene Score',
                data: [],
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Score: ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update chart with current data
function updateChart() {
    if (!hygieneChart || projects.length === 0) return;
    
    // Sort by hygiene score
    const sortedProjects = [...projects].sort((a, b) => a.hygiene_score - b.hygiene_score);
    
    hygieneChart.data.labels = sortedProjects.map(p => p.project_name);
    hygieneChart.data.datasets[0].data = sortedProjects.map(p => p.hygiene_score);
    
    // Color bars based on score
    hygieneChart.data.datasets[0].backgroundColor = sortedProjects.map(p => {
        if (p.hygiene_score >= 80) return 'rgba(16, 185, 129, 0.7)';
        if (p.hygiene_score >= 60) return 'rgba(245, 158, 11, 0.7)';
        return 'rgba(239, 68, 68, 0.7)';
    });
    
    hygieneChart.update();
}

// View notification details
function viewNotification(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    const issue = issues.find(i => i.id === notification.issue_id);
    const project = issue ? projects.find(p => p.id === issue.project_id) : null;
    
    const modalBody = document.getElementById('notificationModalBody');
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h3 style="margin-bottom: 0.5rem;">${notification.message}</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">
                Sent to ${notification.recipient} on ${formatDate(notification.sent_date)}
            </p>
        </div>
        
        ${issue ? `
            <div style="background-color: var(--bg-color); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.75rem;">Issue Details</h4>
                <div style="display: grid; gap: 0.5rem;">
                    <div><strong>Project:</strong> ${project ? project.project_name : 'Unknown'}</div>
                    <div><strong>Type:</strong> ${issue.issue_type}</div>
                    <div><strong>Severity:</strong> <span class="badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span></div>
                    <div><strong>Status:</strong> <span class="badge badge-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></div>
                    <div><strong>Description:</strong> ${issue.description}</div>
                    <div><strong>Assigned To:</strong> ${issue.assigned_to}</div>
                </div>
            </div>
            
            ${issue.status !== 'Resolved' && issue.status !== 'Closed' ? `
                <button class="btn btn-success" onclick="resolveIssue('${issue.id}'); closeNotificationModal();" style="width: 100%;">
                    <i class="fas fa-check"></i> Mark as Resolved
                </button>
            ` : ''}
        ` : ''}
    `;
    
    document.getElementById('notificationModal').classList.add('active');
    
    // Mark as read
    if (!notification.is_read) {
        markNotificationAsRead(notificationId);
    }
}

// Close notification modal
function closeNotificationModal() {
    document.getElementById('notificationModal').classList.remove('active');
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        await fetch(`tables/notifications/${notificationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_read: true })
        });
        
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.is_read = true;
        }
        
        updateStats();
        updateNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all notifications as read
async function markAllAsRead() {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    try {
        await Promise.all(unreadNotifications.map(n => 
            fetch(`tables/notifications/${n.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: true })
            })
        ));
        
        notifications.forEach(n => n.is_read = true);
        updateStats();
        updateNotifications();
        
        alert('All notifications marked as read');
    } catch (error) {
        console.error('Error marking all as read:', error);
        alert('Error marking notifications as read');
    }
}

// Resolve issue
async function resolveIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const confirmed = confirm(`Are you sure you want to mark this issue as resolved?\n\n${issue.description}`);
    if (!confirmed) return;
    
    try {
        const now = new Date().toISOString();
        await fetch(`tables/hygiene_issues/${issueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'Resolved',
                resolved_date: now
            })
        });
        
        issue.status = 'Resolved';
        issue.resolved_date = now;
        
        // Create resolution notification
        await fetch('tables/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                issue_id: issueId,
                recipient: issue.assigned_to,
                message: `Issue resolved: ${issue.description}`,
                type: 'Resolution',
                is_read: false,
                sent_date: now
            })
        });
        
        await loadAllData();
        updateDashboard();
        
        alert('Issue marked as resolved!');
    } catch (error) {
        console.error('Error resolving issue:', error);
        alert('Error resolving issue');
    }
}

// View issue details
function viewIssueDetails(issueId) {
    // Navigate to issues page with specific issue
    window.location.href = `issues.html?id=${issueId}`;
}

// Refresh data
async function refreshData() {
    await loadAllData();
    updateDashboard();
    alert('Data refreshed successfully!');
}

// Generate report
function generateReport() {
    const report = {
        date: new Date().toISOString(),
        summary: {
            totalProjects: projects.length,
            averageHygieneScore: projects.length > 0 
                ? Math.round(projects.reduce((sum, p) => sum + (p.hygiene_score || 0), 0) / projects.length)
                : 0,
            criticalIssues: issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length,
            totalIssues: issues.length,
            resolvedIssues: issues.filter(i => i.status === 'Resolved').length
        },
        projects: projects,
        issues: issues
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hygiene-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRelativeTime(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('notificationModal');
    if (event.target === modal) {
        closeNotificationModal();
    }
}
