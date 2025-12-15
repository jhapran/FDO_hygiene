// Mock data for standalone demo (no API required)
const MOCK_DATA = {
    projects: [
        {
            id: "1",
            project_name: "Customer Portal Redesign",
            project_manager: "Sarah Johnson",
            status: "Active",
            hygiene_score: 78,
            critical_issues: 2,
            last_updated: "2025-12-14T10:30:00Z"
        },
        {
            id: "2",
            project_name: "Mobile App Development",
            project_manager: "Michael Chen",
            status: "Active",
            hygiene_score: 92,
            critical_issues: 0,
            last_updated: "2025-12-14T09:15:00Z"
        },
        {
            id: "3",
            project_name: "Data Migration Project",
            project_manager: "Emily Rodriguez",
            status: "Active",
            hygiene_score: 65,
            critical_issues: 4,
            last_updated: "2025-12-14T11:45:00Z"
        },
        {
            id: "4",
            project_name: "API Integration",
            project_manager: "David Kim",
            status: "On Hold",
            hygiene_score: 55,
            critical_issues: 3,
            last_updated: "2025-12-13T16:20:00Z"
        },
        {
            id: "5",
            project_name: "Security Audit Implementation",
            project_manager: "Lisa Wang",
            status: "Active",
            hygiene_score: 88,
            critical_issues: 1,
            last_updated: "2025-12-14T08:00:00Z"
        }
    ],
    
    hygiene_issues: [
        {
            id: "issue-1",
            project_id: "1",
            issue_type: "Missing Data",
            severity: "Critical",
            description: "Project milestone dates are missing for Q1 2026",
            status: "Open",
            assigned_to: "Sarah Johnson",
            detected_date: "2025-12-14T08:00:00Z",
            resolved_date: null
        },
        {
            id: "issue-2",
            project_id: "1",
            issue_type: "Incomplete Nomination",
            severity: "High",
            description: "Resource allocation for sprint 3 not completed",
            status: "In Progress",
            assigned_to: "Sarah Johnson",
            detected_date: "2025-12-14T09:30:00Z",
            resolved_date: null
        },
        {
            id: "issue-3",
            project_id: "3",
            issue_type: "Outdated Status",
            severity: "Critical",
            description: "Project status not updated in 15 days",
            status: "Open",
            assigned_to: "Emily Rodriguez",
            detected_date: "2025-12-14T07:00:00Z",
            resolved_date: null
        },
        {
            id: "issue-4",
            project_id: "3",
            issue_type: "Data Inconsistency",
            severity: "Critical",
            description: "Budget figures don't match across different reports",
            status: "Open",
            assigned_to: "Emily Rodriguez",
            detected_date: "2025-12-14T10:15:00Z",
            resolved_date: null
        },
        {
            id: "issue-5",
            project_id: "3",
            issue_type: "Compliance Gap",
            severity: "High",
            description: "Missing compliance documentation for data handling",
            status: "Open",
            assigned_to: "Emily Rodriguez",
            detected_date: "2025-12-13T14:30:00Z",
            resolved_date: null
        },
        {
            id: "issue-6",
            project_id: "4",
            issue_type: "Missing Data",
            severity: "Critical",
            description: "API endpoint documentation incomplete",
            status: "Open",
            assigned_to: "David Kim",
            detected_date: "2025-12-13T11:00:00Z",
            resolved_date: null
        },
        {
            id: "issue-7",
            project_id: "4",
            issue_type: "Outdated Status",
            severity: "Medium",
            description: "Test results from previous sprint not archived",
            status: "In Progress",
            assigned_to: "David Kim",
            detected_date: "2025-12-12T16:00:00Z",
            resolved_date: null
        },
        {
            id: "issue-8",
            project_id: "5",
            issue_type: "Data Inconsistency",
            severity: "Medium",
            description: "Security scan results mismatch between tools",
            status: "Resolved",
            assigned_to: "Lisa Wang",
            detected_date: "2025-12-13T09:00:00Z",
            resolved_date: "2025-12-14T10:00:00Z"
        },
        {
            id: "issue-9",
            project_id: "2",
            issue_type: "Missing Data",
            severity: "Low",
            description: "User feedback survey results pending",
            status: "Resolved",
            assigned_to: "Michael Chen",
            detected_date: "2025-12-12T13:00:00Z",
            resolved_date: "2025-12-13T15:30:00Z"
        }
    ],
    
    notifications: [
        {
            id: "notif-1",
            issue_id: "issue-1",
            recipient: "Sarah Johnson",
            message: "CRITICAL: Missing milestone dates detected in Customer Portal Redesign",
            type: "Alert",
            is_read: false,
            sent_date: "2025-12-14T08:05:00Z"
        },
        {
            id: "notif-2",
            issue_id: "issue-2",
            recipient: "Sarah Johnson",
            message: "HIGH: Resource allocation incomplete for sprint 3",
            type: "Alert",
            is_read: true,
            sent_date: "2025-12-14T09:35:00Z"
        },
        {
            id: "notif-3",
            issue_id: "issue-3",
            recipient: "Emily Rodriguez",
            message: "CRITICAL: Project status update overdue by 15 days",
            type: "Alert",
            is_read: false,
            sent_date: "2025-12-14T07:05:00Z"
        },
        {
            id: "notif-4",
            issue_id: "issue-4",
            recipient: "Emily Rodriguez",
            message: "CRITICAL: Budget data inconsistency detected",
            type: "Alert",
            is_read: false,
            sent_date: "2025-12-14T10:20:00Z"
        },
        {
            id: "notif-5",
            issue_id: "issue-5",
            recipient: "Emily Rodriguez",
            message: "HIGH: Compliance documentation missing",
            type: "Reminder",
            is_read: true,
            sent_date: "2025-12-14T08:00:00Z"
        },
        {
            id: "notif-6",
            issue_id: "issue-8",
            recipient: "Lisa Wang",
            message: "Issue resolved: Security scan results reconciled",
            type: "Resolution",
            is_read: true,
            sent_date: "2025-12-14T10:05:00Z"
        }
    ]
};

// Mock API functions
const MockAPI = {
    // Check if we should use mock data (when API is not available)
    useMockData: false,
    
    async fetch(url) {
        // Try real API first
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // If we get valid data, return it
                if (data && data.data) {
                    return { data: data.data };
                }
            }
        } catch (error) {
            // API not available, use mock data
        }
        
        // Use mock data
        if (url.includes('tables/projects')) {
            return { data: MOCK_DATA.projects };
        } else if (url.includes('tables/hygiene_issues')) {
            return { data: MOCK_DATA.hygiene_issues };
        } else if (url.includes('tables/notifications')) {
            return { data: MOCK_DATA.notifications };
        }
        
        return { data: [] };
    }
};
