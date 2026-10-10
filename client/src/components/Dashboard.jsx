import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import ActivityHistory from "./ActivityHistory";

export default function Dashboard() {
  const { token, user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isManager = user?.role === "manager";

  const request = useCallback(
    async (url, options = {}) => {
      const response = await fetch(`http://localhost:5000${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      return data;
    },
    [token, logout]
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const taskData = await request("/api/tasks");
      setTasks(taskData.tasks || []);

      if (isManager) {
        const userData = await request("/api/auth/users");
        setUsers(userData.users || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [request, isManager]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  async function createTask(taskData) {
    await request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    setShowForm(false);
    await loadData();
  }

  async function updateTask(taskId, updates) {
    await request(`/api/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    await loadData();
  }

  async function deleteTask(taskId) {
    await request(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (selectedTask?._id === taskId) {
      setSelectedTask(null);
    }

    await loadData();
  }

  function handleLogout() {
    logout();
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Task Manager
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Collaborative Task Management System
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {user?.name} · {user?.role}
            </span>

            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-bold">
            {isManager ? "Manager Dashboard" : "My Dashboard"}
          </h2>

          <p className="mt-2 text-blue-100">
            {isManager
              ? "Create tasks, assign work, and track your team's progress."
              : "View your assigned tasks and keep your progress updated."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-lg bg-white/15 px-4 py-3">
              <p className="text-sm text-blue-100">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>

            <div className="rounded-lg bg-white/15 px-4 py-3">
              <p className="text-sm text-blue-100">In Progress</p>
              <p className="text-2xl font-bold">
                {tasks.filter((task) => task.status === "in-progress").length}
              </p>
            </div>

            <div className="rounded-lg bg-white/15 px-4 py-3">
              <p className="text-sm text-blue-100">Completed</p>
              <p className="text-2xl font-bold">
                {tasks.filter((task) => task.status === "completed").length}
              </p>
            </div>
          </div>
        </section>

        {isManager && (
          <section>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {showForm ? "Close Task Form" : "+ Create New Task"}
            </button>

            {showForm && (
              <div className="mt-5">
                <TaskForm
                  users={users}
                  onCreate={createTask}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={loadData}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-300">
              Loading tasks...
            </p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            user={user}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onViewActivity={setSelectedTask}
          />
        )}

        {selectedTask && (
          <ActivityHistory
            key={selectedTask._id}
            task={selectedTask}
            request={request}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Collaborative Task Manager
      </footer>
    </div>
  );
}