import { X, Clock, Wifi, MapPin } from "lucide-react";

export default function BatchInfoCard({ batch, studentCount, onClose }) {
  // Safe fallback if schedule is undefined
  const schedules = batch.schedule || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            Batch Information
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <h4 className="text-2xl font-bold text-gray-900">{batch.name}</h4>
            <p className="text-sm text-gray-500 mt-1">
              {studentCount} Students Enrolled
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-gray-700 border-b pb-2">
              Schedule
            </h5>
            {schedules.length === 0 && <p>No schedule defined.</p>}

            {schedules.map((sched, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-4 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  {sched.mode === "Online" ? (
                    <Wifi size={18} className="text-blue-500" />
                  ) : (
                    <MapPin size={18} className="text-red-500" />
                  )}
                  <span className="font-bold text-gray-800">
                    {sched.mode} Class
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Clock size={16} />
                  <span>{sched.timing}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {sched.days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
