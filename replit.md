# Voice Of Prophecy Virtual School - Replit Setup

## Overview
Voice Of Prophecy Virtual School is a web-based Learning Management System by Kellzman Tech Ltd for the Voice of Prophecy initiative within the SDA Church. It aims to empower learners across Kenya with structured Bible study courses, interactive lessons, and comprehensive assessments, enabling online training through permanent course modules, quizzes, reports, and certificate generation.

## User Preferences
- The user prefers detailed explanations.
- The user wants iterative development.
- The user prefers to be asked before major changes are made.
- The user prefers simple language.
- The user prefers functional programming.
- Do not make changes to the folder `Z`.
- Do not make changes to the file `Y`.

## System Architecture
The project features a **React frontend** with **Clerk authentication** and **Tailwind CSS** for styling, operating on Node.js. The **backend** uses **Express.js**, planned for **MySQL database integration**.

**User Roles & Access Control:**
The system implements a three-tier role-based access control system:
- **Admins**: Full system access with ability to add/manage instructors, link instructors to churches, view national-level reports with hierarchical filtering (Conference → Station → District → Church), and manage all system configurations.
- **Instructors**: Church-level access only. Admins assign instructors to specific churches. Instructors can manage students, monitor progress, view course enrollment, and export reports for their assigned church only.
- **Learners**: Student access to enroll in courses, complete lessons, take assessments, track personal progress, and earn certificates upon course completion.

Upon authentication via Clerk, users are automatically routed to their role-specific dashboard based on their assigned role in the database.

**UI/UX Decisions:**
The platform features a modern design with an orange/amber gradient color scheme. Key UI/UX elements include:
- **Branding**: "Voice Of Prophecy Virtual School" across all components.
- **Navigation**: Enhanced navbar with glassmorphism effects and animated underlines.
- **Landing Page**: A hero section with animated background orbs, bold typography, enhanced feature cards with hover effects, and a statistics section.
- **Dashboards**: Modernized Admin, Instructor, and Learner dashboards with improved visual hierarchy.
- **Course Pages**: Gradient headers and improved lesson viewing experience.
- **Onboarding**: A beautiful step-by-step interface with modern form design, routing new users to onboarding after sign-up/login and tracking completion via localStorage.
- **Global CSS**: Custom animations (fadeIn, blob, float), utility classes, and a custom scrollbar.
- **Feedback System**: A professional feedback form with categories (Technical Issues, General Feedback) and local storage for submissions.
- **Offline Indicators**: An authentication-gated `OfflineIndicator` component displays real-time online/offline status on protected pages.
- **Lesson Test Page**: A professional test/assessment page with MCQ/True-False questions, real-time grading (50% pass mark), retry functionality, and score persistence using localStorage. Auto-redirects from lesson completion to the test page.
- **Hierarchical Dashboard System**:
    - **Data Structure**: Uses real API data from `https://test.adventist.or.ke/api/` with 4-level church hierarchy: Conference → Station → District → Church.
    - **API Integration**: Fetches conferences, stations, districts, and churches from external API with error handling and offline fallback.
    - **Instructor Dashboard**: Church-level management interface with auto-assignment to instructor's designated church (configured by admins). Displays statistics cards (total learners, graduated, active, average progress), course breakdowns, student search/filter functionality, progress monitoring with visual indicators, and CSV export. Currently includes church selection dropdown for development/testing; production version will auto-load assigned church from user profile.
    - **Admin Dashboard**: Provides national-level statistics with hierarchical filtering (Conference → Station → District → Church), age/gender distribution, regional reports, and graduation analytics, all exportable as CSV.
    - **Data Visualization**: Utilizes gradient progress bars, color-coded status indicators, and percentage-based visual representations.

**Technical Implementations:**
- **Authentication**: Clerk for user authentication (email/social login) with role-based access.
- **Routing**: React Router for navigation, with protected routes.
- **Data Handling**: Integrates with Adventist Church API (`https://test.adventist.or.ke/api/`) for real church hierarchy data (conferences, stations, districts, churches). Uses mock data for learner information, designed for seamless MySQL backend integration.
- **Environment**: Node.js 20, configured for Replit with proxy support, and deployment as an autoscale stateless web app.

## External Dependencies
- **Clerk**: For user authentication (email/social login).
- **Adventist Church API**: External API (`https://test.adventist.or.ke/api/`) providing church hierarchy data (conferences, stations, districts, churches).
- **Node.js**: Runtime environment.
- **Express.js**: Backend web framework.
- **React**: Frontend library.
- **React Router**: For client-side routing.
- **Tailwind CSS**: For styling and UI development.
- **MySQL (Planned)**: Database management system.