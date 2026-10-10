import { useState } from "react";

export default function TaskForm({ users, onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setLoading(true);

      await onCreate({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
    } catch (err) {
      setError(err.message || "Could not create the task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-800">
        Create New Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="mb-1 block font-medium text-slate-700">
            Task Title *
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            maxLength={120}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="mb-1 block font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="task-assignee" className="mb-1 block font-medium text-slate-700">
            Assign To
          </label>
          <select
            id="task-assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">Unassigned</option>
            {users.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name} ({person.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-due-date" className="mb-1 block font-medium text-slate-700">
            Due Date
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toLocaleDateString("en-CA")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}