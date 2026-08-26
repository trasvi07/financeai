# Smart Personal Finance & Budgeting Platform

A full-stack personal finance application that helps users track expenses, understand spending patterns, and generate personalized monthly budgets based on their financial profile.

Built with a focus on turning raw financial data into something actually useful: instead of giving every user the same generic 50/30/20 split, the application considers factors such as income, lifestyle, housing situation, dependents, and financial goals to create a more personalized budget.

## 🚀 Live Demo

🌐 Live Application: FinanceAI
https://financeai-c6fq.onrender.com


> The backend is deployed on Render. The first request may take a few seconds if the service is waking up from inactivity.

---

## ✨ Features

### 🔐 Authentication & User Profiles

* Secure user authentication
* JWT-based authorization
* Persistent user sessions
* Personalized financial profiles
* Multi-currency support

### 💰 Personalized Budget Generation

Users complete a multi-step onboarding flow that captures:

* Monthly and additional income
* Work type
* Housing situation
* Number of dependents
* Spending lifestyle
* Financial goals

The application then generates category-wise monthly allocations for areas such as:

* Food & Dining
* Transport
* Shopping
* Entertainment
* Health
* Utilities
* Education
* Travel
* Investment
* Other expenses

The budget adapts based on the user's profile. For example, housing, dependents, lifestyle, and goals can influence category allocations.

### 📊 Budget Tracking

The dashboard helps users compare:

* Total income
* Total budgeted amount
* Actual spending
* Remaining budget

Expenses are grouped into categories such as:

* **Needs**
* **Wants**
* **Savings**
* **Other**

Users can quickly see how much they have spent, how much remains, and whether a category has exceeded its allocation.

### 🧠 Smart Spending Analysis

The application includes a spending-analysis layer that processes expense and budget data to help identify unusual or excessive spending patterns and provide a clearer view of the user's financial behavior.

### 🔄 Budget Regeneration

Users can regenerate their budget when their financial situation or preferences change.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide Icons

### Backend

* Node.js
* Express.js
* REST APIs

### Database & Authentication

* MongoDB
* JWT Authentication

### Deployment

* Render

---

## 🏗️ Architecture

```text
React + Vite Frontend
        │
        │ HTTP Requests
        ▼
   REST API Layer
        │
        ▼
Node.js + Express Backend
        │
        ├── Authentication
        ├── Expense Management
        ├── Budget Generation
        └── Spending Analysis
        │
        ▼
      MongoDB
```

The frontend communicates with the backend through REST APIs. The API layer handles application logic such as authentication, expense management, budget generation, and retrieving the user's current financial data.

---

## 📱 How It Works

### 1. Create Your Financial Profile

The onboarding flow collects information about the user's income, lifestyle, housing situation, dependents, and financial goals.

### 2. Generate a Personalized Budget

The system calculates category allocations based on the user's financial profile instead of applying a single fixed budgeting template to everyone.

### 3. Track Spending

Users can record and organize expenses to understand where their money is going.

### 4. Compare Spending Against the Budget

The application continuously compares actual spending with allocated amounts and highlights categories that are approaching or exceeding their limits.

### 5. Adjust as Things Change

Users can regenerate their budget when their income, lifestyle, or financial priorities change.

---

## 🔌 API Design

The frontend communicates with the backend through RESTful API endpoints.

Example functionality includes:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/expenses
POST   /api/expenses

GET    /api/budget/current
POST   /api/budget/generate
```

> Exact endpoint structure may vary depending on the backend configuration.

---

## 💡 Engineering Decisions

### Personalized Instead of One-Size-Fits-All

A fixed budgeting formula does not work equally well for every user. Someone living with family, someone paying rent, and someone supporting dependents have different financial constraints.

The budget generation logic therefore incorporates multiple profile variables before distributing available income across spending categories.

### Separating Needs, Wants, and Savings

Not every category should behave the same way.

The application treats different spending types differently:

* **Needs** can remain flexible when necessary.
* **Wants** can be monitored more strictly against allocations.
* **Savings** are prioritized and protected as part of the budgeting strategy.

### API-Based Architecture

The frontend is separated from the backend and communicates through APIs. This keeps UI logic independent from business logic and makes the application easier to extend.

---

## 🧪 Running Locally

### Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### Install dependencies

For the frontend:

```bash
cd client
npm install
```

For the backend:

```bash
cd server
npm install
```

### Environment Variables

Create an `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If your frontend requires an API base URL:

```env
VITE_API_URL=http://localhost:5000
```

### Start the application

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

---

## 🔮 Future Improvements

* Better spending insights and trend detection
* Recurring expense support
* Savings goal tracking
* Expense analytics and visualizations
* Budget recommendations based on historical spending
* Notifications when spending approaches category limits
* Exportable monthly financial reports

---

## 👨‍💻 What I Learned

This project involved more than building forms and CRUD endpoints. It required thinking about how user financial data flows through the application—from onboarding, to budget generation, to expense tracking, and finally to spending analysis.

Some of the main areas I worked with include:

* Designing REST APIs
* JWT authentication
* Managing application state in React
* Connecting frontend and backend systems
* Structuring MongoDB-backed application data
* Building personalized business logic from multiple user inputs
* Deploying a full-stack application

---

## 📄 License

This project is currently intended for educational and portfolio purposes.
