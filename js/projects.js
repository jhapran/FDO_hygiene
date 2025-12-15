// Global state
let projects = [];
let issues = [];
let notifications = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    displayProjects();
    updateStats();
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
        issues = issuesData.data || [];
        notifications = notificationsData.data || [];
        
        // Update notification count
        const unreadCount = notifications.filter(n => !n.is_read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('healthyProjects').textContent = projects.filter(p => p.hygiene_score >= 80).length;
    document.getElementById('warningProjects').textContent = projects.filter(p => p.hygiene_score >= 60 && p.hygiene_score < 80).length;
    document.getElementById('criticalProjects').textContent = projects.filter(p => p.hygiene_score < 60).length;
}

// Display projects
function displayProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<div class="loading" style="grid-column: 1 / -1;">No projects found</div>';
        return;
    }
    
    // Sort by hygiene score (lowest first to highlight problems)
    const sortedProjects = [...projects].sort((a, b) => a.hygiene_score - b.hygiene_score);
    
    projectsGrid.innerHTML = sortedProjects.map(project => {
        const projectIssues = issues.filter(i => i.project_id === project.id);
        const openIssues = projectIssues.filter(i => i.status === 'Open' || i.status === 'In Progress');
        const criticalIssues = openIssues.filter(i => i.severity === 'Critical');
        
        let scoreColor = 'var(--success-color)';
        let scoreStatus = 'Excellent';
        if (project.hygiene_score < 60) {
            scoreColor = 'var(--danger-color)';
            scoreStatus = 'Critical';
        } else if (project.hygiene_score < 80) {
            scoreColor = 'var(--warning-color)';
            scoreStatus = 'Needs Attention';
        }
        
        return `
            <div class="panel" style="cursor: pointer; transition: transform 0.2s;" 
                 onclick="viewProjectDetails('${project.id}')"
                 onmouseover="this.style.transform='translateY(-4px)'"
                 onmouseout="this.style.transform='translateY(0)'">
                <div class="panel-header" style="padding: 1.25rem;">
                    <div>
                        <h3 style="font-size: 1.125rem; margin-bottom: 0.25rem;">${project.project_name}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.875rem;">${project.project_manager}</p>
                    </div>
                    <span class="badge badge-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span>
                </div>
                
                <div class="panel-content">
                    <!-- Hygiene Score -->
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600;">Hygiene Score</span>
                            <span style="font-size: 1.5rem; font-weight: 700; color: ${scoreColor};">${project.hygiene_score}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${project.hygiene_score}%; height: 100%; background-color: ${scoreColor}; transition: width 0.3s;"></div>
                        </div>
                        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: ${scoreColor}; font-weight: 600;">
                            ${scoreStatus}
                        </div>
                    </div>
                    
                    <!-- Issue Summary -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div style="background-color: var(--bg-color); padding: 0.75rem; border-radius: 0.5rem;">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Open Issues</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${openIssues.length}</div>
                        </div>
                        <div style="background-color: var(--bg-color); padding: 0.75rem; border-radius: 0.5rem;">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Critical</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger-color);">${criticalIssues.length}</div>
                        </div>
                    </div>
                    
                    <!-- Last Updated -->
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.875rem; color: var(--text-secondary);">
                        <i class="fas fa-clock"></i> Updated ${formatRelativeTime(project.last_updated)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View project details
function viewProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const projectIssues = issues.filter(i => i.project_id === projectId);
    const openIssues = projectIssues.filter(i => i.status === 'Open' || i.status === 'In Progress');
    const resolvedIssues = projectIssues.filter(i => i.status === 'Resolved');
    
    // Group issues by severity
    const criticalIssues = openIssues.filter(i => i.severity === 'Critical');
    const highIssues = openIssues.filter(i => i.severity === 'High');
    const mediumIssues = openIssues.filter(i => i.severity === 'Medium');
    const lowIssues = openIssues.filter(i => i.severity === 'Low');
    
    let scoreColor = 'var(--success-color)';
    if (project.hygiene_score < 60) scoreColor = 'var(--danger-color)';
    else if (project.hygiene_score < 80) scoreColor = 'var(--warning-color)';
    
    const modalBody = document.getElementById('projectModalBody');
    modalBody.innerHTML = `
        <div style="display: grid; gap: 1.5rem;">
            <!-- Project Header -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${project.project_name}</h3>
                        <p style="color: var(--text-secondary);">Project Manager: ${project.project_manager}</p>
                    </div>
                    <span class="badge badge-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span>
                </div>
                
                <!-- Hygiene Score -->
                <div style="background-color: var(--bg-color); padding: 1.5rem; border-radius: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-size: 1.125rem; font-weight: 600;">Hygiene Score</span>
                        <span style="font-size: 2.5rem; font-weight: 700; color: ${scoreColor};">${project.hygiene_score}%</span>
                    </div>
                    <div style="width: 100%; height: 12px; background-color: var(--border-color); border-radius: 6px; overflow: hidden;">
                        <div style="width: ${project.hygiene_score}%; height: 100%; background-color: ${scoreColor}; transition: width 0.3s;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Issue Statistics -->
            <div>
                <h4 style="margin-bottom: 1rem;">Issue Breakdown</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div style="background-color: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--danger-color);">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Critical Issues</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--danger-color);">${criticalIssues.length}</div>
                    </div>
                    <div style="background-color: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--warning-color);">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">High Priority</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--warning-color);">${highIssues.length}</div>
                    </div>
                    <div style="background-color: rgba(6, 182, 212, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--info-color);">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Medium Priority</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--info-color);">${mediumIssues.length}</div>
                    </div>
                    <div style="background-color: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid var(--success-color);">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Resolved</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--success-color);">${resolvedIssues.length}</div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Issues -->
            ${openIssues.length > 0 ? `
                <div>
                    <h4 style="margin-bottom: 1rem;">Active Issues</h4>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${openIssues.map(issue => `
                            <div style="background-color: var(--bg-color); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem; border-left: 4px solid ${
                                issue.severity === 'Critical' ? 'var(--danger-color)' : 
                                issue.severity === 'High' ? 'var(--warning-color)' : 
                                'var(--info-color)'
                            };">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span class="badge badge-${issue.severity.toLowerCase()}">${issue.severity}</span>
                                    <span style="font-size: 0.875rem; color: var(--text-secondary);">${formatDate(issue.detected_date)}</span>
                                </div>
                                <div style="font-weight: 600; margin-bottom: 0.25rem;">${issue.issue_type}</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">${issue.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--success-color);"></i><p>No active issues! Project hygiene is good.</p></div>'}
            
            <!-- Actions -->
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-primary" onclick="window.location.href='issues.html?project=${project.id}'" style="flex: 1;">
                    <i class="fas fa-list"></i> View All Issues
                </button>
                <button class="btn btn-secondary" onclick="closeProjectModal()" style="flex: 1;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('projectModal').classList.add('active');
}

// Close project modal
function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// Refresh data
async function refreshData() {
    await loadData();
    displayProjects();
    updateStats();
    alert('Data refreshed successfully!');
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
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeProjectModal();
    }
}
