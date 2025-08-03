# Kanban Board

A modern, responsive Kanban board application built with React, TypeScript, and Vite. This application allows you to organize tasks with intuitive drag-and-drop functionality across different columns.

Live Demo: https://kanban-board-deploy.vercel.app/

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

## Annotation Tool Development Challenges

During the development of the annotation tool, several significant challenges were encountered that required multiple iterations and architectural changes:

### 1. React Router Navigation Conflicts

**Challenge**: The most persistent issue was that after annotating images (drawing on the canvas), React Router navigation would break completely. Users couldn't navigate to other pages after drawing.

**Root Cause**: Custom mouse event handlers were interfering with React Router's navigation system through:

- Global event listeners attached to the document
- Event propagation being stopped with `stopPropagation()`
- Canvas-specific event handling creating conflicts

**Solutions Attempted**:

- Conditional event prevention based on active tools
- Manual cleanup of event listeners in the "Finish" button
- Adding `drawingDisabled` state to prevent event handling
- Global mouseup handlers for cleanup
- Animation frame management for smooth drawing

**Final Resolution**: Initially attempted to use the `react-canvas-annotation` library, but it had compatibility issues with React 19. Ultimately rebuilt with a simpler custom solution focusing on proper event cleanup.

### 2. State Management Complexity

**Challenge**: Managing multiple interconnected states (drawing state, tool selection, canvas offset, polygon creation) led to complex useEffect dependencies and potential memory leaks.

**Issues Encountered**:

- Animation frames not being properly cancelled
- Drawing state persisting after navigation attempts
- Infinite re-renders due to complex useEffect dependencies
- State not being reset when switching between tools

**Solution**: Simplified state management by:

- Consolidating related states
- Using proper cleanup functions in useEffect
- Implementing a centralized "finish" function for state reset
- Removing unnecessary global event listeners

### 3. Canvas Drawing Performance

**Challenge**: Free-hand drawing with the pen tool needed to be smooth while maintaining good performance, especially with continuous mouse move events.

**Technical Hurdles**:

- Too many state updates during mouse move causing lag
- Canvas redrawing on every point addition
- Memory leaks from accumulating animation frames

**Optimizations Implemented**:

- RequestAnimationFrame for smooth drawing
- Debounced canvas redraws
- Proper cleanup of animation frame references
- Optimized path rendering with minimal state updates

### 4. Multi-Image Annotation Persistence

**Challenge**: Maintaining separate annotations for each image while switching between multiple uploaded images.

**Implementation Complexity**:

- localStorage key management for different images
- State synchronization when switching images
- Preventing annotation loss during navigation
- Handling both default sample images and user uploads

**Solution**: Created a robust localStorage system with:

- Image-specific keys for annotation data
- Automatic save/load on image switching
- Separate storage for paths and polygons
- Export functionality for annotation data

### 5. Package Compatibility Issues

**Challenge**: The `react-canvas-annotation` package had peer dependency conflicts with React 19, causing the application to display a white screen.

**Debugging Process**:

- Dependency resolution errors
- React version compatibility issues
- Package deprecation warnings
- Build system conflicts

**Resolution**: Reverted to a custom implementation that:

- Works natively with React 19
- Has no external dependencies for core functionality
- Provides better control over event handling
- Eliminates navigation conflicts

### 6. Cross-Browser Event Handling

**Challenge**: Different browsers handle canvas mouse events differently, especially regarding touch devices and pointer events.

**Considerations**:

- Mouse vs. touch event compatibility
- Pointer event standardization
- Browser-specific quirks with preventDefault
- Mobile device interaction patterns

### Lessons Learned

1. **Event Management**: Proper event cleanup is crucial when mixing canvas interactions with React Router
2. **Library Selection**: Always verify package compatibility with your React version before integration
3. **State Simplification**: Complex state interactions should be simplified and centralized
4. **Performance Monitoring**: Canvas operations need careful performance consideration
5. **User Experience**: Navigation should never be blocked by drawing operations

The final annotation tool, while simpler than initially envisioned, provides reliable functionality without compromising the overall application stability.

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
