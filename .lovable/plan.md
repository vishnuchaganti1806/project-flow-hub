

# Skill-Based Academic Project Allocation & Management System

A premium SaaS-style dashboard application with three role-based portals (Admin, Guide, Student) centered around the project idea submission and approval workflow.

---

## Phase 1: Foundation & Layout

- **App Shell**: Sidebar navigation layout with collapsible sidebar, top header with user avatar, role switcher (for demo), and dark/light mode toggle
- **Theme**: Indigo/blue professional color scheme with soft gradients, rounded components, and clean spacing
- **Role-based routing**: Separate route groups for `/admin`, `/guide`, `/student` with role-based sidebar menus
- **Shared UI patterns**: Status badges (color-coded for Draft/Submitted/Under Review/Approved/Rejected), skeleton loaders, empty states, toast notifications

---

## Phase 2: Student Portal

- **Student Dashboard**: Profile card with skill tags, team info, idea submission status card (main highlight), deadline countdown timer, progress bar, notifications panel, and rating/feedback display
- **Project Idea Submission**: Multi-section form with fields for Title, Abstract, Problem Statement, Proposed Technology Stack (tag picker), and Expected Outcome — with draft saving capability
- **Idea Tracker**: List of submitted ideas with status pipeline visualization (Draft → Submitted → Under Review → Approved/Rejected), guide feedback view, and resubmit action
- **Team Management**: Create or join a team, view team members
- **Doubt Discussion**: Threaded conversation UI for communicating with assigned guide

---

## Phase 3: Guide Portal

- **Guide Dashboard**: Overview cards (assigned students count, pending reviews, active projects), idea review queue with filters, deadline management panel, and progress tracking
- **Idea Review Queue**: Filterable/sortable data table of submitted ideas with status filters, click-through to detailed idea view
- **Idea Detail & Review Page**: Full idea display with approve/reject/suggest modifications actions, structured feedback form, and option to convert approved idea into an official project
- **Project Rating**: Rate student project progress with comments
- **Doubt Resolution Panel**: View and respond to student questions

---

## Phase 4: Admin Portal

- **Admin Dashboard**: Stat cards (total students, guides, teams, ideas submitted, approved ideas, active projects), analytics charts (idea submission trends, approval rates, idea-to-project conversion ratio), and recent activity feed
- **Student-Guide Assignment**: Interface to assign students to guides with drag-and-drop or selection UI
- **Monitoring Views**: Browse all project ideas across the system, view approval statistics and conversion metrics

---

## Phase 5: Polish & Interactions

- **Animations**: Smooth page transitions, card hover effects, and fade-in animations throughout
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile with collapsible sidebar on smaller screens
- **Interactive Data Tables**: Sortable, filterable tables with pagination for ideas, students, and projects
- **Modal Dialogs**: Elegant modals for idea review, feedback submission, and confirmations
- **Mock Data**: Rich, realistic mock data across all roles to make the app feel production-ready

---

All data will be mock/static (no backend). A role switcher in the header will allow easy demo navigation between Admin, Guide, and Student views.

