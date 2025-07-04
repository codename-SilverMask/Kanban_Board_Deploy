import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KanbanBoard from "./components/KanbanBoard";
import Dashboard from "./components/Dashboard";
import AnnotationTool from "./components/AnnotationTool";
import Navigation from "./components/Navigation";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <header className="app-header">
                    <h1>Kanban Board</h1>
                    <p>Organize your tasks with drag and drop</p>
                  </header>
                  <KanbanBoard />
                </>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/annotate" element={<AnnotationTool />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
