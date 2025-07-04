import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { loadKanbanData } from "../utils/localStorage";
import ChartCard from "./ChartCard";

const Dashboard: React.FC = () => {
  const data = useMemo(() => loadKanbanData(), []);

  const chartData = useMemo(() => {
    if (!data) return null;

    // Tasks per status (bar chart data)
    const statusData = Object.keys(data.columns).map((columnId) => {
      const column = data.columns[columnId];
      return {
        status: column.title,
        count: column.taskIds.length,
      };
    });

    // Tasks completed per day (line chart data)
    const completedTasks =
      data.columns["column-3"]?.taskIds
        .map((taskId) => data.tasks[taskId])
        .filter((task) => task.completedAt) || [];

    const tasksByDate = completedTasks.reduce((acc, task) => {
      const date = new Date(task.completedAt!).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lineData = Object.entries(tasksByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, completed: count }));

    // Tasks by priority (pie chart data)
    const allTasks = Object.values(data.tasks);
    const priorityData = allTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(priorityData).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      priority,
    }));

    return { statusData, lineData, pieData, allTasks };
  }, [data]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  if (!data || !chartData) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>No data available. Create some tasks first!</p>
        </div>
      </div>
    );
  }

  const { statusData, lineData, pieData, allTasks } = chartData;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visualize your task data with beautiful charts</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{allTasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {statusData.find((s) => s.status === "Done")?.count || 0}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {statusData.find((s) => s.status === "In Progress")?.count || 0}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {
              allTasks.filter(
                (t) => t.dueDate && new Date(t.dueDate) < new Date()
              ).length
            }
          </div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="dashboard-charts">
        <ChartCard title="Tasks by Status" className="chart-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statusData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by Priority" className="chart-half">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPriorityColor(entry.priority)}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {lineData.length > 0 && (
          <ChartCard title="Tasks Completed Per Day" className="chart-half">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
