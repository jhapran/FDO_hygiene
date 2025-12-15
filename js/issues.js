// Global state
let projects = [];
let allIssues = [];
let filteredIssues = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    displayIssues();
    populateProjectSelect();
    
    // Check if specific issue ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get('id');
    if (issueId) {
        viewIssueDetails(issueId);
    }
});

// Load data from API
async function loadData() {
    try {
        // Try to use MockAPI if available, otherwise use fetch
        const apiCall = typeof MockAPI !== 'undefined' ? MockAPI.fetch.bind(MockAPI) : fetch;
        
        const [projectsData, issuesData, notificationsData] = await Promise.all([
            apiCall('tables/projects?limit=100').then(r => r.data ? r : r.json()),
            apiCall('tables/hygiene_issues?limit=100').then(r => r.data ? r : r.json()),
            apiCall('tables/notifications?limit=100').then(r => r.data ? r : r.json())
        ]);
        
        projects = projectsData.data || [];
        allIssues = issuesData.data || [];
        filteredIssues = [...allIssues];
        
        // Update notification count
        const notifications = notificationsData.data || [];
        const unreadCount = notifications.filter(n => !n.is_read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Display issues in table
function displayIssues() {
    const tableBody = document.getElementById('issuesTableBody');
    const issueCount = document.getElementById('issueCount');
    
    issueCount.textContent = filteredIssues.length;
    
    if (filteredIssues.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading">No issues found</td></tr>';
        return;
    }
    
    // Sort by detected date, newest first
    const sortedIssues = [...filteredIssues].sort((a, b) => 
        new Date(b.detected_date) - new Date(a.detected_date)
    );
    
    tableBody.innerHTML = sortedIssues.map(issue => {
        const project = projects.find(p => p.id === issue.project_id);
        const projectName = project ? project.project_name : 'Unknown Project';
        const shortId = issue.id ? issue.id.substring(0, 8) : 'N/A';
        
        return `
            <tr onclick="viewIssueDetails('${issue.id}')" style="cursor: pointer;">
                <td><code>${shortId}</code></td>
                <td><span class="badge badge-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span></td>
                <td><span class="badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span></td>
                <td>${issue.issue_type}</td>
                <td>
                    <div style="max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${issue.description}
                    </div>
                </td>
                <td>${projectName}</td>
                <td>${issue.assigned_to}</td>
                <td>${formatDate(issue.detected_date)}</td>
                <td onclick="event.stopPropagation();">
                    ${issue.status === 'Open' || issue.status === 'In Progress' ? 
                        `<button class="btn btn-success" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="resolveIssue('${issue.id}')">
                            <i class="fas fa-check"></i> Resolve
                        </button>` : 
                        '<span style="color: var(--success-color);"><i class="fas fa-check-circle"></i></span>'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// Filter issues
function filterIssues(type) {
    if (type === 'all') {
        filteredIssues = [...allIssues];
    } else if (type === 'open') {
        filteredIssues = allIssues.filter(i => i.status === 'Open' || i.status === 'In Progress');
    }
    
    // Reapply current filters
    applyFilters();
}

// Apply filters from dropdowns
function applyFilters() {
    const severityFilter = document.getElementById('severityFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredIssues = allIssues.filter(issue => {
        const matchesSeverity = !severityFilter || issue.severity === severityFilter;
        const matchesStatus = !statusFilter || issue.status === statusFilter;
        const matchesType = !typeFilter || issue.issue_type === typeFilter;
        const matchesSearch = !searchTerm || 
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.assigned_to.toLowerCase().includes(searchTerm) ||
            issue.issue_type.toLowerCase().includes(searchTerm);
        
        return matchesSeverity && matchesStatus && matchesType && matchesSearch;
    });
    
    displayIssues();
}

// Search issues
function searchIssues() {
    applyFilters();
}

// View issue details
function viewIssueDetails(issueId) {
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    const project = projects.find(p => p.id === issue.project_id);
    const projectName = project ? project.project_name : 'Unknown Project';
    
    const modalBody = document.getElementById('issueModalBody');
    modalBody.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <div>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <span class="badge badge-${issue.status.toLowerCase().replace(' ', '-')}">${issue.status}</span>
                    <span class="badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span>
                </div>
                <h3 style="margin-bottom: 0.5rem;">${issue.issue_type}</h3>
                <p style="color: var(--text-secondary);">${issue.description}</p>
            </div>
            
            <div style="display: grid; gap: 1rem; background-color: var(--bg-color); padding: 1rem; border-radius: 0.5rem;">
                <div>
                    <strong>Project:</strong>
                    <div style="margin-top: 0.25rem;">${projectName}</div>
                </div>
                
                <div>
                    <strong>Assigned To:</strong>
                    <div style="margin-top: 0.25rem;">${issue.assigned_to}</div>
                </div>
                
                <div>
                    <strong>Detected Date:</strong>
                    <div style="margin-top: 0.25rem;">${formatDate(issue.detected_date)}</div>
                </div>
                
                ${issue.resolved_date ? `
                    <div>
                        <strong>Resolved Date:</strong>
                        <div style="margin-top: 0.25rem;">${formatDate(issue.resolved_date)}</div>
                    </div>
                ` : ''}
                
                <div>
                    <strong>Issue ID:</strong>
                    <div style="margin-top: 0.25rem;"><code>${issue.id}</code></div>
                </div>
            </div>
            
            ${issue.status !== 'Resolved' && issue.status !== 'Closed' ? `
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-success" onclick="resolveIssue('${issue.id}'); closeIssueModal();" style="flex: 1;">
                        <i class="fas fa-check"></i> Mark as Resolved
                    </button>
                    <button class="btn btn-secondary" onclick="updateIssueStatus('${issue.id}', 'In Progress'); closeIssueModal();" style="flex: 1;">
                        <i class="fas fa-clock"></i> Mark In Progress
                    </button>
                </div>
            ` : `
                <div style="padding: 1rem; background-color: rgba(16, 185, 129, 0.1); border-radius: 0.5rem; color: var(--success-color); text-align: center;">
                    <i class="fas fa-check-circle"></i> This issue has been resolved
                </div>
            `}
        </div>
    `;
    
    document.getElementById('issueModal').classList.add('active');
}

// Close issue modal
function closeIssueModal() {
    document.getElementById('issueModal').classList.remove('active');
}

// Resolve issue
async function resolveIssue(issueId) {
    const issue = allIssues.find(i => i.id === issueId);
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
        
        await loadData();
        displayIssues();
        
        alert('Issue marked as resolved!');
    } catch (error) {
        console.error('Error resolving issue:', error);
        alert('Error resolving issue');
    }
}

// Update issue status
async function updateIssueStatus(issueId, newStatus) {
    try {
        await fetch(`tables/hygiene_issues/${issueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        await loadData();
        displayIssues();
        
        alert(`Issue status updated to: ${newStatus}`);
    } catch (error) {
        console.error('Error updating issue status:', error);
        alert('Error updating issue status');
    }
}

// Open create issue modal
function openCreateIssueModal() {
    document.getElementById('createIssueModal').classList.add('active');
}

// Close create issue modal
function closeCreateIssueModal() {
    document.getElementById('createIssueModal').classList.remove('active');
    document.getElementById('createIssueForm').reset();
}

// Populate project select dropdown
function populateProjectSelect() {
    const select = document.getElementById('projectSelect');
    select.innerHTML = '<option value="">Select a project</option>' + 
        projects.map(p => `<option value="${p.id}">${p.project_name}</option>`).join('');
}

// Create new issue
async function createIssue(event) {
    event.preventDefault();
    
    const projectId = document.getElementById('projectSelect').value;
    const issueType = document.getElementById('issueType').value;
    const severity = document.getElementById('issueSeverity').value;
    const description = document.getElementById('issueDescription').value;
    const assignedTo = document.getElementById('issueAssignee').value;
    
    try {
        const now = new Date().toISOString();
        
        // Create issue
        const issueResponse = await fetch('tables/hygiene_issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                issue_type: issueType,
                severity: severity,
                description: description,
                status: 'Open',
                assigned_to: assignedTo,
                detected_date: now,
                resolved_date: null
            })
        });
        
        const newIssue = await issueResponse.json();
        
        // Create notification
        await fetch('tables/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                issue_id: newIssue.id,
                recipient: assignedTo,
                message: `${severity.toUpperCase()}: ${description}`,
                type: 'Alert',
                is_read: false,
                sent_date: now
            })
        });
        
        closeCreateIssueModal();
        await loadData();
        displayIssues();
        
        alert('Issue created successfully!');
    } catch (error) {
        console.error('Error creating issue:', error);
        alert('Error creating issue');
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const issueModal = document.getElementById('issueModal');
    const createModal = document.getElementById('createIssueModal');
    
    if (event.target === issueModal) {
        closeIssueModal();
    }
    if (event.target === createModal) {
        closeCreateIssueModal();
    }
}
