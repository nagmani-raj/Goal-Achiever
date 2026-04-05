# 📋 To-Do List App — Full Stack Implementation Plan

A goal-tracking productivity app with **React** frontend and **Node.js** backend featuring monthly goals, daily task management with topics & work items, streak tracking, and performance visualization.

---

## 📁 Folder Structure

```
d:\project\to-do-list\
├── client/                          # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── PieChart.jsx
│   │   │   ├── monthly/             # Monthly Goal components
│   │   │   │   ├── MonthlyGoals.jsx
│   │   │   │   ├── GoalCard.jsx
│   │   │   │   └── AddGoalForm.jsx
│   │   │   ├── daily/               # Daily Goal components
│   │   │   │   ├── DailyGoals.jsx
│   │   │   │   ├── TopicCard.jsx
│   │   │   │   ├── WorkItem.jsx
│   │   │   │   ├── AddTopicForm.jsx
│   │   │   │   └── AddWorkForm.jsx
│   │   │   ├── streak/              # Streak & Performance
│   │   │   │   ├── StreakPanel.jsx
│   │   │   │   └── PerformanceChart.jsx
│   │   │   └── layout/              # Layout components
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Header.jsx
│   │   │       └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard page
│   │   │   ├── MonthlyPage.jsx      # Monthly goals page
│   │   │   └── DailyPage.jsx        # Daily goals page
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useGoals.js
│   │   │   └── useStreak.js
│   │   ├── services/                # API service layer
│   │   │   └── api.js
│   │   ├── utils/                   # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css                # Global styles & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js Backend (Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection
│   │   ├── models/
│   │   │   ├── MonthlyGoal.js       # Monthly goal schema
│   │   │   ├── DailyGoal.js         # Daily goal schema (topics + works)
│   │   │   └── Streak.js            # Streak tracking schema
│   │   ├── routes/
│   │   │   ├── monthlyRoutes.js
│   │   │   ├── dailyRoutes.js
│   │   │   └── streakRoutes.js
│   │   ├── controllers/
│   │   │   ├── monthlyController.js
│   │   │   ├── dailyController.js
│   │   │   └── streakController.js
│   │   └── middleware/
│   │       └── errorHandler.js
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🗄️ Database Schema (MongoDB)

### MonthlyGoal
| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| `_id`       | ObjectId | Auto-generated               |
| `month`     | String   | e.g. "2026-04"              |
| `target`    | String   | Goal description text        |
| `completed` | Boolean  | Completion status            |
| `createdAt` | Date     | Auto timestamp               |

### DailyGoal
| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| `_id`       | ObjectId | Auto-generated               |
| `date`      | String   | e.g. "2026-04-04"           |
| `topics`    | Array    | Array of Topic objects       |

**Topic Object:**
| Field        | Type     | Description               |
|--------------|----------|---------------------------|
| `_id`        | ObjectId | Auto-generated            |
| `title`      | String   | Topic name                |
| `works`      | Array    | Array of Work objects     |
| `percentage` | Number   | Auto-calculated (0-100)   |

**Work Object:**
| Field       | Type     | Description                  |
|-------------|----------|------------------------------|
| `_id`       | ObjectId | Auto-generated               |
| `text`      | String   | Work description            |
| `completed` | Boolean  | Completion status            |

### Streak
| Field           | Type    | Description                    |
|-----------------|---------|--------------------------------|
| `_id`           | ObjectId| Auto-generated                 |
| `date`          | String  | The date                       |
| `percentage`    | Number  | Daily completion %             |
| `currentStreak` | Number  | Current running streak         |
| `longestStreak` | Number  | All-time longest streak        |

---

## 🔌 API Endpoints

### Monthly Goals
| Method   | Endpoint                    | Description              |
|----------|-----------------------------|--------------------------|
| `GET`    | `/api/monthly`              | Get all monthly goals    |
| `GET`    | `/api/monthly/:month`       | Get goals for a month    |
| `POST`   | `/api/monthly`              | Create a monthly goal    |
| `PATCH`  | `/api/monthly/:id/toggle`   | Toggle goal completion   |
| `DELETE` | `/api/monthly/:id`          | Delete a goal            |

### Daily Goals
| Method   | Endpoint                              | Description                |
|----------|---------------------------------------|----------------------------|
| `GET`    | `/api/daily/:date`                    | Get daily goals for date   |
| `POST`   | `/api/daily/:date/topic`              | Add a topic                |
| `POST`   | `/api/daily/:date/topic/:topicId/work`| Add work to a topic        |
| `PATCH`  | `/api/daily/work/:workId/toggle`      | Toggle work completion     |
| `DELETE` | `/api/daily/topic/:topicId`           | Delete a topic             |
| `DELETE` | `/api/daily/work/:workId`             | Delete a work item         |

### Streak
| Method   | Endpoint                | Description                    |
|----------|-------------------------|--------------------------------|
| `GET`    | `/api/streak`           | Get streak info (current/max)  |
| `GET`    | `/api/streak/history`   | Get streak history for chart   |
| `POST`   | `/api/streak/calculate` | Calculate/update today's streak|

---

## 🎨 UI Design

### Color Palette (Dark Theme)
- **Background**: `#0a0a1a` (deep navy)
- **Cards**: `#12122a` with glassmorphism
- **Primary**: `#6c5ce7` (purple)
- **Secondary**: `#00cec9` (teal)
- **Success**: `#00b894` (green)
- **Warning**: `#fdcb6e` (yellow)
- **Danger**: `#e17055` (coral)

### Percentage Calculation
- **Topic %** = (completed works / total works) × 100
- **Daily %** = Average of all topic percentages
- **Streak**: If daily % ≥ 60% → streak + 1, else → reset to 0

### Pie Chart
- Completed vs Pending tasks distribution
- Custom SVG-based pie chart
