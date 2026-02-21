# Specification

## Summary
**Goal:** Add a dedicated page for admins to create new job roles.

**Planned changes:**
- Create a new frontend page at route '/admin/add-job-role' that uses the existing JobRoleForm component
- Protect the new page with AdminGuard component
- Add navigation link/button in the AdminPanel to access the job role creation page
- Update App.tsx routing configuration to include the new route
- Implement redirect to admin panel after successful job role creation

**User-visible outcome:** Admins can navigate to a dedicated page to create new job roles, with a clear path from the admin panel to the creation form.
