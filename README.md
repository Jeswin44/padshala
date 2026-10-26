# Padshala (पाठशाला) – Digital Learning Portal

A robust, full-stack educational web application built with the **MERN Stack** (MongoDB, Express, React, Node.js) following the official ICTAK Full Stack Development Project Guidelines.

---

## 1. Project Definition (Milestone 1)

### 1.1 Problem Statement
Students lack a single, clutter-free space to discover organized study materials, access structured lessons, and track their course enrollments, while educators struggle with complex, bloated enterprise learning systems to publish course content and manage student access simply.

---

### 1.2 Target Users & Roles

| Role | Description & Permissions |
|---|---|
| **Student** | Can register/log in, browse public courses, search/filter by title/category, enroll in courses, view lessons and study materials of enrolled courses, and track progress. Cannot create or edit courses. |
| **Instructor** | Can register/log in, create new courses, edit/delete *their own* courses and lessons, view enrolled student counts, and manage course content. Cannot modify courses created by other instructors. |

---

### 1.3 MVP Scope

#### **Must-Have (Core MVP for Submission)**
- **Authentication & RBAC:** Secure user registration, login, and role-based access control (`student` and `instructor`) using JWT and bcrypt.
- **Course Catalog:** Searchable and filterable list of published courses for all users.
- **Instructor Course Management (CRUD):** Instructors can create, read, update, and delete their own courses with title, description, category, and lessons.
- **Enrollment Flow:** Authenticated students can enroll in available courses with duplicate-enrollment prevention.
- **Lesson Viewer:** Students can view course lessons and resources with progress tracking.
- **All 4 UI States on Every View:** Loading (skeleton/spinners), Success (content), Empty (friendly call-to-action), Error (user-friendly message with retry option).
- **Security Guardrails:** Centralized API error handling, input validation, server-side ownership verification, protected routes, and zero plain-text secrets.
- **Mobile-Responsive UI:** Fluid layout optimized for mobile, tablet, and desktop screens.

#### **Later (Post-MVP / Future Roadmap)**
- Automated quiz modules and certificate generation.
- Integrated payment gateway (Stripe/Razorpay) for paid courses.
- Real-time discussion forum using WebSockets.

---

### 1.4 User Stories & Acceptance Criteria

#### **Story 1: User Registration & Authentication**
* *As a* new user (Student or Instructor),  
* *I want to* securely create an account and log in,  
* *So that* I can access role-specific learning features.
* **Acceptance Criteria:**
  - Registration requires a valid name, valid email format, password (min 6 chars), and role selection (`student` or `instructor`).
  - Attempting to register an existing email returns `409 Conflict` with a clear user message.
  - Submitting with missing fields triggers client and server validation errors (`400 Bad Request`).
  - Passwords are encrypted with `bcryptjs` before saving; tokens are signed with JWT.
  - Successfully logging in stores the token and redirects to the appropriate dashboard.

#### **Story 2: Browse and Search Courses**
* *As a* student,  
* *I want to* search and filter courses by title and category,  
* *So that* I can find topics relevant to my studies.
* **Acceptance Criteria:**
  - Displays paginated cards of all published courses with title, instructor name, and category.
  - If no courses match the search query, an **Empty State** is displayed with a "Clear search" button.
  - While fetching, a **Loading Skeleton** is shown.
  - If the server is unreachable, an **Error State** with a "Try Again" button is displayed.

#### **Story 3: Instructor Course Creation & Ownership**
* *As an* instructor,  
* *I want to* create and edit courses with modules/lessons,  
* *So that* my students have organized material to study.
* **Acceptance Criteria:**
  - Only authenticated users with role `instructor` can access `POST /api/courses`.
  - An instructor can only edit or delete courses where `course.instructorId === currentUserId` (enforced on server, returning `403 Forbidden` otherwise).
  - Empty course title/description displays inline validation and prevents submission.
  - After successful creation (`201 Created`), the instructor dashboard updates without manual page refresh.

#### **Story 4: Course Enrollment**
* *As a* registered student,  
* *I want to* enroll in a course with one click,  
* *So that* I can access all lessons and study materials.
* **Acceptance Criteria:**
  - A student cannot enroll in the same course twice (`400 Bad Request` / duplicate check).
  - Enrolled courses immediately appear under the student's "My Learning" tab.
  - Unauthenticated users clicking "Enroll" are redirected to the login page.

---

### 1.5 Data Model (MongoDB / Mongoose Schemas)

#### **1. User Schema (`users`)**
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 6 }, // Hashed with bcrypt
  role: { type: String, enum: ['student', 'instructor'], default: 'student', required: true },
  createdAt: { type: Date, default: Date.now }
}
```

#### **2. Course Schema (`courses`)**
*Lessons are embedded as subdocuments because they are accessed together with the parent course.*
```javascript
const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  order: { type: Number, default: 1 }
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessons: [LessonSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
```

#### **3. Enrollment Schema (`enrollments`)**
*References both `User` and `Course` to keep records lean and prevent unbounded array growth.*
```javascript
const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  enrolledAt: { type: Date, default: Date.now },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }]
});

// Compound unique index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
```

---

### 1.6 API Contract

| Method | Endpoint | Description | Auth / Role | Request Body / Params | Success Status | Error Statuses |
|---|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public | `{ name, email, password, role }` | `201 Created` + token & user info | `400` (Validation), `409` (Email exists) |
| `POST` | `/api/auth/login` | Authenticate user | Public | `{ email, password }` | `200 OK` + token & user info | `400` (Missing fields), `401` (Invalid credentials) |
| `GET` | `/api/auth/me` | Get current user profile | Authenticated | None (Bearer token) | `200 OK` + user | `401` (Unauthorized) |
| `GET` | `/api/courses` | List published courses (search & pagination) | Public | Query: `?page=1&limit=10&search=&category=` | `200 OK` + courses array & pagination meta | `500` (Server Error) |
| `GET` | `/api/courses/:id` | Get single course details | Public | Param: `:id` | `200 OK` + course | `404` (Not Found) |
| `POST` | `/api/courses` | Create new course | Instructor only | `{ title, description, category, lessons }` | `201 Created` + course | `400` (Invalid data), `401` (No token), `403` (Not instructor) |
| `PUT` | `/api/courses/:id` | Update course | Course Owner | `{ title, description, category, lessons }` | `200 OK` + updated course | `400`, `401`, `403` (Not owner), `404` |
| `DELETE` | `/api/courses/:id` | Delete course | Course Owner | Param: `:id` | `200 OK` + `{ message: "Course deleted" }` | `401`, `403` (Not owner), `404` |
| `POST` | `/api/enrollments` | Enroll in a course | Student only | `{ courseId }` | `201 Created` + enrollment | `400` (Already enrolled), `401`, `404` |
| `GET` | `/api/enrollments/my` | Get current student's enrolled courses | Student only | None (Bearer token) | `200 OK` + array of enrolled courses | `401` (Unauthorized) |

---

### 1.7 Screen & Navigation Wireframe Flow

```text
               +----------------------------------+
               |          Navbar / Header         |
               | [Logo: Padshala] [Catalog] [Auth]|
               +----------------------------------+
                                |
        +-----------------------+-----------------------+
        |                                               |
        v                                               v
+-------------------------------+               +-------------------------------+
|       Public Catalog          |               |         Login / Register      |
|  - Search Bar & Category Tabs |               |  - Role Selector              |
|  - Course Card Grid           |               |  - Form with validation       |
|  - Pagination Controls        |               +-------------------------------+
+-------------------------------+                               |
        |                                                       v
        | (View Course Details)                 +-------------------------------+
        v                                       |          Dashboard            |
+-------------------------------+               |  - If Student: "My Courses"   |
|     Course Details Screen     |               |  - If Instructor: Manage &    |
|  - Title, Description, Tutor  |               |    Create Course Form         |
|  - Lesson Outline             |               +-------------------------------+
|  - [Enroll Now] Button        |                               |
+-------------------------------+                               v
        | (Enrolled Student)                    +-------------------------------+
        v                                       |         Lesson Viewer         |
+-------------------------------+               |  - Left: Lesson list/nav      |
|     4 States on Each View:    |               |  - Right: Lesson content      |
| [Loading | Success |          |               |  - [Mark as Completed] button |
|  Empty   | Error with Retry]  |               +-------------------------------+
+-------------------------------+
```

---

### 1.8 Non-Functional & Security Requirements

1. **Password Hashing:** Passwords hashed with `bcryptjs` (salt rounds $\ge 10$). Plain text passwords or hashes are never returned in API responses.
2. **Server-Side Authorization:** Every mutation (`PUT`, `DELETE`) verifies token validity and tests resource ownership on the database model (`course.instructor.toString() === req.user._id.toString()`).
3. **Environment Security:** Secrets (`MONGODB_URI`, `JWT_SECRET`, `PORT`) managed solely via `.env` and kept strictly out of version control.
4. **Clean Error Responses:** Express global error handler returns structured JSON (`{ success: false, message: "..." }`) and hides technical call stacks in production.
5. **Accessibility & Responsive Design:** Semantic HTML tags (`<main>`, `<header>`, `<nav>`, `<section>`), fully readable color contrast ratios, accessible form labels, and mobile-first CSS.
