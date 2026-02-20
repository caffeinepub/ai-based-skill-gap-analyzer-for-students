# Specification

## Summary
**Goal:** Add admin permission levels and skill proficiency management to the existing admin panel.

**Planned changes:**
- Implement backend admin registry to control access based on Principal IDs
- Add proficiency level selection (beginner, intermediate, advanced) when adding/editing skills in job roles
- Enforce admin-only access to the AdminPanel using authentication checks
- Display skill proficiency levels in admin panel and job role selector
- Update skill matching logic to consider proficiency levels when analyzing gaps

**User-visible outcome:** Admins can securely access the admin panel with permission-based authentication, assign proficiency levels to job role skills, and users see more accurate skill gap analysis that accounts for proficiency requirements.
