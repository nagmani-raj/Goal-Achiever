# GoalTracker

GoalTracker is a full-stack productivity application that helps users manage daily goals, monthly goals, streak tracking, and target-topic planning from one dashboard. The project is designed to make study or work planning simple, organized, and easy to track with automatically updated progress.

## Project Overview

This project allows users to:

- Add daily topics and nested work items
- Create and track monthly goals
- Maintain a streak based on daily completion percentage
- Plan target topics with checklist-based progress
- View combined progress from a central dashboard

## Main Features

- Daily goals with nested work items
- Automatically calculated topic-wise and overall daily progress
- Monthly goal tracker with month switching
- Streak system based on 60% or more daily completion
- Target topics with question lists and auto progress tracking
- Auto-managed target-topic timeline with extend-days support
- Dashboard with summary cards, progress bars, and performance chart
- REST API based client-server architecture

## Tech Stack

### Frontend

- React 19
- React Router DOM
- Axios
- Vite
- Vanilla CSS

### Backend

- Node.js
- Express 5
- Mongoose
- dotenv
- cors
- nodemon

### Database

- MongoDB

### Tooling

- ESLint
- npm

## Project Structure

```text
to-do-list/
|-- client/                 # React + Vite frontend
|   |-- src/
|   |   |-- components/     # Reusable UI components
|   |   |-- pages/          # Route-level pages
|   |   |-- services/       # API integration layer
|   |   `-- utils/          # Helper functions
|   |-- public/
|   `-- package.json
|
|-- server/                 # Express + MongoDB backend
|   |-- src/
|   |   |-- config/         # Database connection
|   |   |-- controllers/    # Request handlers
|   |   |-- middleware/     # Error handling middleware
|   |   |-- models/         # Mongoose schemas
|   |   `-- routes/         # API routes
|   |-- .env
|   |-- server.js
|   `-- package.json
|
`-- README.md
```

## How To Clone

```bash
git clone <your-repository-url>
cd to-do-list
```

If the repository is hosted on GitHub, replace `<your-repository-url>` with the actual clone URL, for example:

```bash
git clone https://github.com/username/to-do-list.git
cd to-do-list
```

## Prerequisites

Before running this project, make sure you have:

- Node.js 18 or above
- npm
- MongoDB running locally

## Environment Variables

The backend requires a `server/.env` file with the following values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todolist
```

## Installation

### 1. Install server dependencies

```bash
cd server
npm install
```

### 2. Install client dependencies

```bash
cd ../client
npm install
```

## Run The Project

Open two terminals to run the full project.

### Terminal 1: Start backend

```bash
cd server
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### Terminal 2: Start frontend

```bash
cd client
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Available Scripts

### Client

- `npm run dev` - Starts the Vite development server
- `npm run build` - Creates the production build
- `npm run preview` - Previews the production build locally
- `npm run lint` - Runs ESLint

### Server

- `npm run dev` - Starts the backend with nodemon
- `npm start` - Starts the backend with Node.js

## API Overview

Base URL:

```text
http://localhost:5000/api
```

Main route groups:

- `/api/health` - Server health check
- `/api/monthly` - Monthly goals APIs
- `/api/daily` - Daily goals APIs
- `/api/streak` - Streak calculation and history APIs
- `/api/targets` - Target topics and checklist APIs

## Application Flow

1. The user adds daily, monthly, or target-topic data from the frontend.
2. The React app sends requests to the Express API using Axios.
3. Express controllers process the requests and store or fetch data from MongoDB.
4. The UI updates progress, percentages, streak values, and summaries automatically.

## Notes

- The frontend API base URL is currently set to `http://localhost:5000/api`.
- The project currently uses a local MongoDB connection.
- The `client/dist/` folder is already present, which means a frontend build has been generated before.
- `node_modules/` folders are currently present in the project, but they are usually not committed to version control.

## Future Improvements

- Add authentication
- Add a deployment guide
- Add a `.env.example` file
- Move the client API base URL into environment variables
- Add automated tests

## Recommended Additions

- Project screenshots
- Live demo link
- Postman collection or API documentation
- Contribution guide
- License section

## Summary

This project is a practical MERN-style productivity tracker that combines daily planning, monthly tracking, streak logic, and target-topic roadmaps in one application. To run it locally, start MongoDB first, then run both the server and client in separate terminals.
