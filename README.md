# Kanban Board

A modern, responsive Kanban board application built with React, TypeScript, and Vite. This application allows you to organize tasks with intuitive drag-and-drop functionality across different columns.

## Features

- **🎯 Drag & Drop**: Seamlessly move tasks between columns
- **📝 Task Management**: Create, edit, and delete tasks with detailed information
- **🏷️ Priority System**: Organize tasks by priority levels (High, Medium, Low)
- **📅 Due Dates**: Set and track task deadlines
- **💾 Local Storage**: Automatically saves your data locally
- **� Dashboard**: Visualize task data with interactive charts
  - Tasks per status (bar chart)
  - Tasks completed per day (line chart)
  - Tasks by priority (pie chart)
  - Key metrics and statistics
- **🎨 Annotation Tool**: Draw and annotate on images
  - Upload multiple images
  - Pen and eraser tools
  - Color picker and brush size control
  - Pan and zoom functionality
  - Download annotated images
- **�📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations
- **⚡ Fast Performance**: Built with Vite for optimal development and build speed

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing for multi-page experience
- **@dnd-kit** - Accessible drag and drop library
- **Recharts** - Responsive chart library for data visualization
- **Lucide React** - Beautiful, customizable icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd kanban-project
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Navigation

The application now includes three main sections:

- **Board** (`/`): The main Kanban board for task management
- **Dashboard** (`/dashboard`): Data visualization and analytics
- **Annotate** (`/annotate`): Image annotation tool

### Managing Tasks

- **Move Tasks**: Drag and drop tasks between columns
- **Edit Tasks**: Click the edit icon on any task card
- **Delete Tasks**: Click the trash icon on any task card
- **Reorder Tasks**: Drag tasks within the same column to reorder

### Dashboard Features

- **Task Statistics**: View total tasks, completed tasks, in-progress tasks, and overdue items
- **Status Chart**: Bar chart showing task distribution across columns
- **Priority Chart**: Pie chart showing tasks by priority level
- **Completion Trends**: Line chart showing tasks completed over time

### Annotation Tool Features

- **Upload Images**: Click "Upload Images" or drag files to the canvas area
- **Drawing Tools**:
  - **Pen Tool**: Draw with customizable colors and brush sizes
  - **Eraser Tool**: Remove drawn elements
  - **Move Tool**: Pan around the canvas to view different areas
- **Navigation**: Browse through multiple images using Previous/Next buttons
- **Export**: Download your annotated images as PNG files

### Columns

The board includes three default columns:

- **To Do**: New tasks that haven't been started
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks

## Project Structure

```
src/
├── components/          # React components
│   ├── AnnotationTool.tsx  # Image annotation component
│   ├── ChartCard.tsx       # Reusable chart container
│   ├── Column.tsx          # Individual column component
│   ├── Dashboard.tsx       # Data visualization dashboard
│   ├── KanbanBoard.tsx     # Main board component
│   ├── Navigation.tsx      # App navigation component
│   ├── TaskCard.tsx        # Task card component
│   └── TaskModal.tsx       # Task creation/editing modal
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types and interfaces
├── utils/               # Utility functions
│   ├── kanban.ts        # Board-related utilities
│   └── localStorage.ts  # Local storage management
├── App.tsx              # Main application component with routing
├── App.css              # Application styles
└── main.tsx             # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
  languageOptions: {
  parserOptions: {
  project: ['./tsconfig.node.json', './tsconfig.app.json'],
  tsconfigRootDir: import.meta.dirname,
  },
  // other options...
  },
  },
  ])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
