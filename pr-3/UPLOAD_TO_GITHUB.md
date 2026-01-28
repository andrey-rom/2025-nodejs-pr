# Practical Task 3

```bash
npm install
```

---

### 1. [Basics] Create a simple HTTP Server

**Run:**
```bash
node basic-server/task-1.js
```

---

### 2. [Basics] Display request details

**Run:**
```bash
node basic-server/task-2.js
```

**Expected:** HTML page with:
- HTTP Method
- URL
- HTTP Version
- Request Headers

---

### 3. [Basics] Return HTML page

**Run:**
```bash
node basic-server/task-3.js
```

**Expected:** HTML page with CV


---

### 3.1 [Basics] [Bonus Task] Handle static paths (+ 1pt)

**Run:**
```bash
node basic-server/task-3.1.js
```

---

###  4. Migrate Student Management System logic to HTTP server

**Run:**
```bash
node express-server/task-4.js
```

| Path                        | Functionality                                             |
| --------------------------- | --------------------------------------------------------- |
| `/api/students`             | Get all students                                          |
| `/api/students`             | Add new student                                           |
| `/api/students`             | Completely replace old students collection with a new one |
| `/api/students/:id`         | Get student by ID                                         |
| `/api/students/:id`         | Update existing student by ID                             |
| `/api/students/:id`         | Remove existing student by ID                             |
| `/api/students/group/:id`   | Get all students by specific group id                     |
| `/api/students/average-age` | Calculate average age of your students                    |
| `/api/students/save`        | Save students to JSON file                                |
| `/api/students/load`        | Load students from JSON file                              |

#### 4.2 Migrate backup logic to HTTP Server

| Path                 | Functionality                                                   |
| -------------------- | --------------------------------------------------------------- |
| `/api/backup/start`  | Start backup mechanism                                          |
| `/api/backup/stop`   | Stop backup mechanism                                           |
| `/api/backup/status` | Return current status of the backup mechanism (running/stopped) |

---

### Frontend 

## Usage

### 1. Start Backend

First, make sure the backend is running:

```bash
node express-server/task-4.js
```

### 2. Start Frontend Dev Server

## Installation in frontend folder

```bash
npm install
```

```bash
npm run dev
```

### 3 Open frontend in browser

