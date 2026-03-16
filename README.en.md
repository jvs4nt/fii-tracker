# FII Tracker 📈

A complete web application to track and manage your Brazilian Real Estate Investment Trusts (FII - Fundos de Investimento Imobiliário) portfolio, dividends, and get smart recommendations based on real-time data.

## 🚀 Features

*   **User Authentication**: Secure login and registration using JWT and bcrypt.
*   **Portfolio Management (Carteira)**: Add, edit, and remove FIIs from your portfolio. Tracks quantity, average price, and purchase date.
*   **Dividends Tracking (Proventos)**: 
    *   Automatically syncs or allows manual entry of dividends, JCP (Juros sobre Capital Próprio), and stock splits.
    *   Tracks pending vs. received dividends.
*   **Real-time Dashboard**: Visual breakdown of your portfolio by sector using interactive pie charts (Recharts), showing total invested, current value, and overall gain/loss.
*   **Smart Analysis**: 
    *   Automatically fetches real-time quotes and P/VP (Price to Book Ratio) data from the Brapi API.
    *   Provides "Buy", "Hold", or "Sell" recommendations based on the current P/VP ratio.
*   **Responsive UI**: Clean, modern interface built with React and Lucide icons.

## 🛠️ Technologies Used

### Frontend
*   **React 19** with **Vite**
*   **TypeScript**
*   **React Router:** For client-side navigation
*   **Axios:** For API communication
*   **Recharts:** For data visualization
*   **Lucide React:** For modern iconography

### Backend
*   **Node.js** with **Express**
*   **TypeScript**
*   **Prisma ORM:** Database management and typed queries
*   **SQLite:** Lightweight local database (zero setup required)
*   **JWT (JSON Web Tokens):** For secure API authentication
*   **Axios & Cheerio:** For fetching and scraping FII market data when necessary

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm (or yarn)

### Installation & Setup

1.  **Clone the repository** (if you haven't already).

2.  **Backend Setup:**
    ```bash
    cd src/backend
    npm install
    # The SQLite database is already configured. 
    # If needed, generate Prisma client:
    npx prisma generate
    # Start the backend development server
    npm run dev
    ```
    The backend will run on `http://localhost:3333`.

3.  **Frontend Setup:**
    Open a new terminal window.
    ```bash
    cd src/frontend
    npm install
    # Start the frontend development server
    npm run dev
    ```
    The frontend will typically run on `http://localhost:5173` (or up to `5176`).

## 📡 API Endpoints Overview

*   **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
*   **Holdings**: `GET /api/holdings`, `POST /api/holdings`, `PUT /api/holdings/:id`, `DELETE /api/holdings/:id`
*   **Dividends**: `GET /api/dividends`, `POST /api/dividends`, `PUT /api/dividends/:id/receive`, `DELETE /api/dividends/:id`
*   **FII Data**: `GET /api/fii/quote/:ticker`, `GET /api/fii/analysis`, `GET /api/fii/dashboard`

## 🔒 Security
The backend uses CORS to restrict access. By default, it accepts requests from `http://localhost:5173` through `5176`. To deploy to production, update the `FRONTEND_URL` in the backend's `.env` file.
