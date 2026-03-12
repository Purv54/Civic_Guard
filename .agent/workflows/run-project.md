---
description: How to run the CivicGuard full-stack project
---
// turbo-all
# Running CivicGuard

## 1. Start the Django Backend
Open a terminal in the project root:
```powershell
cd Civic_Guard
..\venv\Scripts\python.exe manage.py runserver
```

## 2. Start the React Frontend
Open a **second** terminal in the project root:
```powershell
cd frontend
npm run dev
```

## 3. Access the Application
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Admin Panel:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
  - User: `admin` | Pass: `Admin@1234`
