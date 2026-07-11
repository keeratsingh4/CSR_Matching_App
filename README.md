#  CSR Volunteer Matching Platform  

A full-stack web application that connects **Corporate Volunteers**, **CSR Representatives**, and **Persons-In-Need (PIN)** to streamline corporate social responsibility (CSR) volunteer efforts.  

---

##  Overview  
This platform enables organizations to manage volunteer matching, task assignments, and service tracking — complete with role-based dashboards, volunteer hour verification, and report generation.  

Built using the **MERN stack**:  
> **MongoDB • Express.js • React.js • Node.js**

---

##  Key Features  

###  Authentication & Roles  
- Secure JWT-based login and registration  
- Role-based access control for:  
  - **Admin** – system management  
  - **CSR Representative** – verifies volunteer hours & manages reports  
  - **Corporate Volunteer** – accepts and completes tasks, logs hours  
  - **Person-In-Need (PIN)** – submits help requests  

---

###  Core Functionalities  
 **Task Management** – create, assign, and complete volunteer tasks  
 **Volunteer Hour Logging** – volunteers record hours & upload proof  
 **Verification Workflow** – CSR reps verify or dispute logged hours  
 **Role-specific Dashboards** – tailored views for each user type  
 **Volunteer History** – filter by category/date & view verified totals  
 **Demo Seeder** – auto-generate 200 demo records for presentation  

---

##  Workflow Summary  

1. **CSR Rep** creates or reviews service requests  
2. **Volunteer** accepts and completes assigned tasks  
3. **Volunteer** logs hours with notes and optional proof  
4. **CSR Rep** verifies or disputes those hours  
5. **Verified logs** contribute to reports and dashboards  

---

##  Tech Stack  

| Layer | Technology |
|-------|-------------|
| Frontend | React.js (Hooks, Context API) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Testing | Jest + Supertest |
| Dev Tools | Concurrently, Nodemon |
| CI/CD | GitHub Actions |

---

## ⚙ Installation  

### Clone and install dependencies  
```bash
git clone https://github.com/<your-username>/csr-matching-app.git
cd csr-matching-app
npm install
```

### Run full stack (frontend + backend)
```bash
npm run dev
```

### Environment variables  
Create a `.env` file in `/backend`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/csr_matching
JWT_SECRET=changeme_super_secret
```

---

##  Demo Data  

```bash
cd backend
npm run seed   # Generate 200 demo users & requests
npm run demo   # Create sample assigned tasks
```

### Test accounts  
| Role | Email | Password |
|------|--------|-----------|
| Admin | admin@csr.com | password123 |
| CSR Rep | csr1@example.com | password123 |
| Volunteer | volunteer1@example.com | password123 |
| PIN | pin1@example.com | password123 |

---

##  Example Dashboards  

- **Admin** → Manage users, monitor statistics  
- **CSR Rep** → Verify/dispute hours, view reports  
- **Volunteer** → View tasks, log hours, filter history  
- **PIN** → Submit and track service requests  

---

##  Scripts  

| Command | Description |
|----------|-------------|
| `npm run dev` | Run backend + frontend concurrently |
| `npm run seed` | Seed database with demo data |
| `npm run demo` | Create pre-assigned demo tasks |
| `npm test` | Run backend tests (Jest) |

---

##  Notes  

- Tasks marked **Disputed** are excluded from verified hour totals.  
- Filters on volunteer history allow viewing by **category** or **date range**.  
- GitHub Actions CI ensures build & test integrity before merges.  

--- 
  
