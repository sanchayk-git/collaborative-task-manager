import { useState } from "react";

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

export default function TaskList({
  tasks,
  user,
  onUpdate,
  onDelete,
  onViewActivity,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const isManager = user?.role === "manager";

  function startEditing(task) {
    setEditingId(task._id);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""
    );
    setError("");
  }

  async function saveEdit(taskId) {
    if (!editTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setSavingId(taskId);
      setError("");

      await onUpdate(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate || null,
      });

      setEditingId(null);
    } catch (err) {
      setError(err.message || "Could not update the task.");
    } finally {
      setSavingId(null);
    }
  }

  async function changeStatus(taskId, status) {
    try {
      setError("");
      await onUpdate(taskId, { status });
    } catch (err) {
      setError(err.message || "Could not update task status.");
    }
  }

  async function deleteTask(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await onDelete(taskId);
    } catch (err) {
      setError(err.message || "Could not delete the task.");
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-800">
          {isManager ? "Manage Tasks" : "My Assigned Tasks"}
        </h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
          <p className="font-medium text-slate-700">No tasks yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Tasks will appear here when they are available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isEditing = editingId === task._id;
            const isCreator =
              String(task.createdBy?._id || task.createdBy) ===
              String(user?._id || user?.id);

            return (
              <article
                key={task._id}
                className="rounded-xl border border-slate-200 p-4 transition hover:shadow-sm sm:p-5"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task title"
                      maxLength={120}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />

                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Task description"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />

                    <label className="block text-sm font-medium text-slate-700">
                      Due Date
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(task._id)}
                        disabled={savingId === task._id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {savingId === task._id ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-semibold text-slate-800">
                          {task.title}
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
                          {task.description || "No description provided."}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "in-progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {statusLabels[task.status] || task.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-700">
                          Assigned to:
                        </span>{" "}
                        {task.assignedTo?.name || "Unassigned"}
                      </p>

                      <p>
                        <span className="font-medium text-slate-700">
                          Due date:
                        </span>{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "Not set"}
                      </p>

                      {isManager && (
                        <p>
                          <span className="font-medium text-slate-700">
                            Created by:
                          </span>{" "}
                          {task.createdBy?.name || user?.name || "Manager"}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      {!isManager && (
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          Update status
                          <select
                            value={task.status}
                            onChange={(e) =>
                              changeStatus(task._id, e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </label>
                      )}

                      {isManager && isCreator && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(task)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteTask(task._id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {onViewActivity && (
                        <button
                          type="button"
                          onClick={() => onViewActivity(task)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Activity History
                        </button>
                      )}
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}