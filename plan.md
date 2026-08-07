# AI Prompt — Build a Personal Finance Management Application

## Objective

Build a modern, production-ready Personal Finance Management application that helps users record, analyse, and manage all personal finances from a single dashboard.

The application should focus on giving users complete visibility into where their money is going and how much they are saving.

---

# Core Features

## Dashboard

Display:

* Total Monthly Income
* Total Expenses
* Total Savings
* Remaining Balance
* Monthly EMI Total
* Subscription Cost
* Daily Spending
* Net Worth
* Cash Flow Graph
* Spending Trend

---

# Income Management

Users can add multiple income sources.

Examples

* Salary
* Freelancing
* Rental Income
* Interest
* Dividends
* Business Income
* Bonus
* Other Income

Fields

* Title
* Amount
* Category
* Date
* Notes
* Payment Method

---

# Expense Management

Users can record every expense.

Examples

* Food
* Grocery
* Fuel
* Rent
* Electricity
* Water
* Internet
* Shopping
* Entertainment
* Healthcare
* Travel
* Education
* Gifts
* Investment
* Miscellaneous

Fields

* Expense Name
* Category
* Amount
* Date
* Payment Method
* Merchant
* Notes
* Receipt Upload
* Tags

Support recurring expenses.

---

# EMI Management

Allow users to manage all EMIs.

Fields

* Loan Name
* Bank
* Principal Amount
* Interest Rate
* Monthly EMI
* Remaining Balance
* Start Date
* End Date
* Due Date
* Auto Reminder
* Status

Dashboard should display

* Total EMI
* Upcoming EMI
* Overdue EMI
* Remaining Loan

---

# Subscription Management

Track recurring subscriptions.

Examples

* Netflix
* Spotify
* ChatGPT
* AWS
* Adobe
* Apple
* Google
* Microsoft
* Gym
* Insurance

Fields

* Service Name
* Monthly Cost
* Billing Cycle
* Renewal Date
* Auto Renew
* Category
* Payment Method

Dashboard

* Total Subscription Cost
* Upcoming Renewals

---

# Daily Spending Tracker

Quick Add Expense

Users should be able to add an expense in less than 5 seconds.

Examples

* Tea
* Coffee
* Petrol
* Lunch
* Snacks
* Parking

Daily dashboard

* Today's Spending
* Yesterday's Spending
* This Week
* This Month

---

# Budget Management

Users can create budgets.

Examples

* Food Budget
* Travel Budget
* Shopping Budget
* Entertainment Budget

Show

* Budget Used
* Remaining Budget
* Overspending Alerts

---

# Savings Goals

Users can create savings goals.

Examples

* Emergency Fund
* House
* Car
* Vacation
* Marriage
* Investment

Display

* Goal Amount
* Saved Amount
* Remaining Amount
* Progress Percentage
* Expected Completion Date

---

# Investments

Track investments.

Examples

* Stocks
* Mutual Funds
* Fixed Deposits
* Gold
* Crypto
* PPF
* EPF
* NPS

Display

* Invested Amount
* Current Value
* Profit/Loss
* ROI

---

# Debt Tracker

Track

* Credit Card Debt
* Personal Loan
* Home Loan
* Car Loan
* Friends & Family

Display

* Total Debt
* Interest
* Monthly Payment
* Remaining Amount

---

# Bills

Track bills.

Examples

* Electricity
* Internet
* Water
* Gas
* Mobile
* Rent

Show

* Due Today
* Due This Week
* Overdue Bills

---

# Reports

Generate reports for

* Daily
* Weekly
* Monthly
* Quarterly
* Yearly

Charts

* Expense by Category
* Income vs Expense
* Savings Trend
* EMI Trend
* Subscription Trend
* Cash Flow
* Budget Utilisation

Allow export to

* PDF
* Excel
* CSV

---

# Analytics

Provide insights such as

* Biggest Spending Category
* Average Daily Spend
* Average Monthly Spend
* Highest Expense
* Most Expensive Subscription
* EMI Percentage of Income
* Savings Rate
* Financial Health Score
* Spending Forecast
* Monthly Comparison

---

# Search & Filters

Support filtering by

* Date
* Category
* Payment Method
* Amount Range
* Merchant
* Tags

---

# Notifications

Notify users for

* EMI Due
* Subscription Renewal
* Bill Due
* Budget Limit Reached
* Savings Goal Achieved

---

# User Experience

* Responsive Design
* Dark & Light Mode
* Mobile First
* Fast Search
* Keyboard Shortcuts
* Offline Support (optional)

---

# Authentication

* Email Login
* Google Login
* Password Reset
* Profile Management

---

# Technology Stack

Frontend

* Next.js
* TypeScript
* React
* SCSS Modules

Backend

* Supabase

Database

* PostgreSQL

Authentication

* Supabase Auth

Storage

* Supabase Storage

Charts

* Recharts

State Management

* Zustand

Validation

* Zod

Forms

* React Hook Form

---

# Architecture

Follow a modular architecture.

Every page and reusable component should follow:

```text
Component/

    index.tsx

    CORE/
        actions.ts
        services.ts
        hooks.ts
        constants.ts
        imports.ts
        types.ts

    STYLE/
        desktop.scss
        tablet.scss
        mobile.scss
        index.module.scss
```

Rules

* Business logic in `actions.ts`
* API logic in `services.ts`
* Custom hooks in `hooks.ts`
* Types in `types.ts`
* Constants in `constants.ts`
* Organised imports in `imports.ts`
* Styling in `STYLE/`
* BEM naming convention
* No cross-feature implementation imports
* One module owns all of its code
* Functionality must never change during refactoring

---

# Security

* Row Level Security (RLS)
* Input Validation
* SQL Injection Protection
* Authentication Guards
* Secure File Uploads

---

# Nice-to-Have Features

* OCR receipt scanning
* AI spending insights
* Monthly financial summary
* Goal recommendations
* Duplicate transaction detection
* Bank CSV import
* UPI statement import
* Multi-currency support
* Family/shared accounts
* Recurring transaction automation

---

# Deliverables

Generate:

1. Complete project structure.
2. Database schema and relationships.
3. Supabase SQL migration scripts.
4. TypeScript types.
5. Backend services.
6. Frontend pages and components.
7. Authentication flow.
8. Dashboard with charts.
9. Responsive UI.
10. Seed data for testing.
11. Unit tests and integration tests.
12. Production-ready code with documentation.
