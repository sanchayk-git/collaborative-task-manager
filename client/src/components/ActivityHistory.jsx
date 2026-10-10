import { useEffect, useState } from "react";

export default function ActivityHistory({
  task,
  request,
  onClose,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActivity() {
      try {
        setLoading(true);
        setError("");

        const data = await request(
          `/api/tasks/${task._id}/activity`
        );

        if (active) {
          setActivities(data.activities || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load activity history.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      active = false;
    };
  }, [task._id, request]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Activity History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Task: {task.title}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-slate-500">
          Loading activity...
        </p>
      ) : error ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      ) : activities.length === 0 ? (
        <p className="py-6 text-center text-slate-500">
          No activity has been recorded for this task yet.
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="border-l-2 border-blue-500 pl-4"
            >
              <p className="font-semibold text-slate-800">
                {(activity.user && activity.user.name) || "User"}{" "}
                <span className="font-normal text-slate-600">
                  {String(activity.action || "").replaceAll("_", " ")}
                </span>
              </p>

              {activity.details && (
                <p className="mt-1 text-sm text-slate-600">
                  {activity.details}
                </p>
              )}

              <p className="mt-1 text-xs text-slate-400">
                {activity.createdAt
                  ? new Date(activity.createdAt).toLocaleString()
                  : "Time unavailable"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}