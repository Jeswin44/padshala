# ICT ACADEMY OF KERALA
## Summer Internship & Project Report
### Full Stack Application Development with MERN Stack

---

**Project Title:** Padshala (पाठशाला) – Digital Learning & Study Portal  
**Student / Team Member:** Jeswin Jaison  
**Institution:** ICT Academy of Kerala  
**Academic Period:** October 2026  
**Repository:** [https://github.com/Jeswin44/padshala](https://github.com/Jeswin44/padshala)

---

## 1. EXECUTIVE SUMMARY

Padshala (पाठशाला) is an enterprise-grade, lightweight digital learning and study portal engineered using the complete MERN Stack (MongoDB, Express.js, React, Node.js). The application addresses a fundamental challenge in contemporary education: students frequently struggle with scattered, unstructured study materials across disparate channels, while educators are often hindered by bloated, cumbersome learning management systems (LMS) with steep learning curves.

Developed in strict accordance with the Information and Communication Technology Academy of Kerala (ICTAK) Full Stack Project Guidelines, Padshala provides a streamlined, accessible environment for course authoring, discovery, and active study. Key capabilities implemented include secure role-based access control (Student vs. Instructor), responsive course catalog browsing with real-time search, category filters, and pagination, a seamless 1-click course enrollment pipeline, and an interactive digital classroom featuring lesson-level progress tracking. All views adhere strictly to the 4 mandatory screen states (Loading, Success, Empty, and Error with retry).

The project achieves production readiness with 0 known security vulnerabilities, sub-300ms client build times via Vite, complete server-side authorization enforcement, and robust database indexing on MongoDB Atlas.

---

## 2. INTRODUCTION

In recent years, the educational paradigm has decisively shifted toward hybrid, self-paced, and digital classroom environments. However, widely adopted commercial learning platforms often suffer from feature bloat, complex multi-tenant administration, poor mobile responsiveness, and high latency. These impediments reduce student engagement and create unnecessary friction for instructors attempting to publish course content rapidly.

The Padshala project was conceived and executed during the ICT Academy of Kerala Summer Internship program to demonstrate how modern, decoupled MERN stack architecture can deliver an ultra-responsive, highly maintainable, and user-centric educational portal. The project prioritizes clean separation of concerns, defensive programming, responsive visual hierarchy, and robust error management across both client and server tiers.

---

## 3. OBJECTIVES

The primary aim of this internship project was to design, construct, test, version-control, and prepare for deployment a full-stack educational web application adhering strictly to ICTAK standards. Specific core objectives include:

- **Decoupled 3-Tier Architecture:** Implement a clear separation of concerns where React operates purely in the client browser, Express/Node.js manages business logic and RESTful routing, and MongoDB Atlas serves as the persistent cloud datastore.
- **Robust Authentication & Role Authorization:** Engineer stateless authentication using JSON Web Tokens (JWT) and industry-standard password encryption using `bcryptjs` (salt rounds: 10), enforcing strict role-based access control (RBAC) across Students and Instructors.
- **Server-Side Ownership Enforcement:** Ensure that resource mutations (course modifications and deletions) are strictly verified on the backend to prevent unauthorized access or privilege escalation.
- **Dynamic Curriculum Management:** Empower instructors to seamlessly create, edit, and organize multi-lesson courses with notes and multimedia video references.
- **Student Enrollment & Progress Persistence:** Provide students with single-click enrollment, automatic duplicate enrollment prevention via MongoDB compound indexing, and real-time lesson completion tracking.
- **Comprehensive UX Resilience (The 4 UI States):** Guarantee that every single screen gracefully handles Loading (accessible spinners), Success (rich content layouts), Empty (actionable empty states), and Error (user-friendly alerts with retry capabilities).
- **Defensible Version Control & Zero Secret Leaks:** Maintain a pristine Git commit history tagged across all milestones, with comprehensive `.gitignore` rules safeguarding environment variables.

---

## 4. SCOPE AND DELIVERABLES

The project scope was carefully defined to produce a complete Minimum Viable Product (MVP) without compromising software engineering rigor. The deliverables include:

- **Backend RESTful API Engine:** A fully structured Node.js/Express service comprising routes, controllers, middleware, and Mongoose schemas supporting all CRUD and enrollment workflows.
- **React Client Application (Vite):** A mobile-first, component-based frontend featuring React Router DOM, centralized AuthContext, and an environment-aware API client.
- **MongoDB Atlas Database Schemas:** Normalized and optimized data schemas for User accounts, Course modules (with embedded Lesson subdocuments), and student Enrollment records.
- **Production Deployment Assets:** Single Page Application (SPA) redirect rewrite configurations (`vercel.json` and `_redirects`) preventing 404 errors on deep-link refreshes, coupled with production-ready CORS middleware.
- **Documentation & Submission Artifacts:** An exhaustive `README.md` containing problem statements, architecture diagrams, local setup procedures, environment specifications, and audit checklist responses.

---

## 5. METHODOLOGY

The project adopted an iterative Agile engineering methodology, partitioned into nine distinct milestones as specified in the ICTAK Student Reference Guide:

1. **Milestone 1 – Specifications & Contract Design:** Formulating problem definitions, target user personas, MVP boundary conditions, acceptance criteria, data entity diagrams, and REST API contracts before writing code.
2. **Milestone 2 – Workspace Skeleton & Security:** Establishing the repository, initializing strict `.gitignore` rules to prevent credential leakage, and scaffolding `client/` and `server/` structures with environment templates.
3. **Milestone 3 & 4 – Backend Engineering & Security:** Configuring cloud MongoDB Atlas integration, constructing Mongoose schemas, developing centralized error handling, and implementing bcrypt password hashing with JWT token protection.
4. **Milestone 5 & 6 – Frontend Development & Integration:** Building responsive, accessible React components, controlled forms with immediate validation, and integrating the frontend via a centralized API service module.
5. **Milestone 7 – Verification & Defect Remediation:** Conducting end-to-end integration tests, diagnosing and resolving asynchronous Mongoose v9 hook lifecycle anomalies, and verifying edge-case behaviors.
6. **Milestone 8 & 9 – Deployment Readiness & Documentation:** Configuring SPA fallback rules, hardening CORS for cloud hosting, pushing verified commits to GitHub, and completing formal project reporting.

---

## 6. PROJECT ACTIVITIES

The technical implementation entailed the following detailed engineering activities:

- **Activity 1: Database Architecture & Schema Design:** Created the User schema with unique email indexing and `select: false` on password hashes; created the Course schema embedding Lesson subdocuments for optimal read locality; created the Enrollment schema with a compound unique index (`{ student: 1, course: 1 }`) to eliminate duplicate enrollments at the database engine level.
- **Activity 2: Centralized API Error Handling:** Engineered `errorHandler.js` and `asyncHandler.js` to capture Mongoose CastErrors, duplicate key conflicts (code 11000), validation errors, and expired tokens, transforming them into uniform JSON responses without exposing internal server call stacks.
- **Activity 3: Server-Side Ownership Guardrails:** Implemented rigorous authorization in `courseController.js` where course update and delete endpoints compare `course.instructor.toString()` against `req.user.id`, returning HTTP 403 Forbidden on unauthorized tampering attempts.
- **Activity 4: Responsive UI Design System:** Crafted custom mobile-first CSS with CSS variables, accessible color contrasts, a mobile drawer navigation bar, interactive course cards with hover elevations, and dynamic progress bars.
- **Activity 5: Digital Classroom Experience:** Developed `LessonViewerPage.jsx` featuring curriculum outline navigation, video resource links, formatted study notes, and instant lesson completion toggling that updates student progress seamlessly.
- **Activity 6: End-to-End Defect Isolation & Resolution:** Identified and resolved an asynchronous lifecycle defect in Mongoose 9 where pre-save hooks returning Promises caused `TypeError: next is not a function` when invoking legacy callbacks. Hardened the hook to resolve natively.

---

## 7. RESULTS & FINDINGS

Comprehensive evaluation and testing demonstrated the efficacy of the implemented architecture across multiple qualitative and quantitative dimensions:

- **Compilation & Build Velocity:** The React client compiles 39 modules in approximately 285 milliseconds via Vite, generating a lean 296 kB JavaScript bundle and 19 kB CSS stylesheet.
- **Security & Dependency Integrity:** Full npm audit scans on both client and server dependencies revealed 0 vulnerabilities. Credentials, database connection strings, and JWT secrets remain completely protected through environment variables.
- **Functional Completeness:** 100% of defined user stories passed manual verification, including student registration, instructor course authoring, public catalog filtering, one-click enrollment, and persistent classroom progress.
- **UX Resilience:** All views successfully rendered appropriate UI states under varying network conditions, displaying accessible spinners during data retrieval, actionable empty cards when filters yield no matches, and clear error banners with retry triggers.

---

## 8. CONCLUSION

The Padshala Full Stack Application Development project was completed with total adherence to the ICT Academy of Kerala project guidelines. The project successfully demonstrates the construction of a robust, scalable, and responsive MERN web application from inception to production deployment readiness.

Through this internship experience, practical mastery was attained in modern JavaScript runtime environments, cloud NoSQL database design, stateless token authentication, component-based frontend architecture, responsive CSS layout systems, and defensive software engineering practices. Padshala stands as a fully operational, defensible capstone project ready for institutional review and cloud hosting.

---

## 9. APPENDIX

- **Public GitHub Repository:** [https://github.com/Jeswin44/padshala](https://github.com/Jeswin44/padshala)
- **Cloud Database Cluster:** MongoDB Atlas (Cluster0 - AWS ap-south-1 / Mumbai)
- **Primary REST Endpoints:**
  - `POST /api/auth/register` (User registration with bcrypt encryption)
  - `POST /api/auth/login` (Credential verification & JWT generation)
  - `GET /api/auth/me` (Protected profile verification)
  - `GET /api/courses` (Course catalog with search, category filtering & pagination)
  - `GET /api/courses/:id` (Single course curriculum retrieval)
  - `POST /api/courses` (Instructor course creation)
  - `PUT /api/courses/:id` (Instructor course editing with ownership check)
  - `DELETE /api/courses/:id` (Instructor course deletion with ownership check)
  - `POST /api/enrollments` (Student one-click enrollment)
  - `GET /api/enrollments/my` (Student enrolled courses retrieval)
  - `POST /api/enrollments/:courseId/complete-lesson` (Lesson progress toggle)
- **Git Milestone Commit Log:**
  - `b56d468`: docs: complete milestone 8 and 9 - deployment configurations, spa rewrites, and final documentation checklist
  - `21cf0ed`: fix: resolve mongoose pre-save hook async next error verified in milestone 7
  - `b868dbf`: feat: complete milestones 5 and 6 - react frontend screens, responsive css, and api integration
  - `bd2445a`: feat: complete milestone 3 - database models, error handling, auth, course crud, and enrollment api
  - `22d75f2`: feat: complete milestone 2 - scaffold client and server skeletons with environment configuration
  - `97d6f71`: docs: define project scope, data models, and api contract for milestone 1
