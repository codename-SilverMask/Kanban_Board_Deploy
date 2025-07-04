import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Kanban, PenTool } from "lucide-react";

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Kanban size={24} />
        <span>TaskBoard</span>
      </div>

      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          end
        >
          <Kanban size={20} />
          <span>Board</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/annotate"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <PenTool size={20} />
          <span>Annotate</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
