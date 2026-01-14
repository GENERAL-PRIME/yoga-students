import { X } from "lucide-react";
import ScheduleDisplay from "./ScheduleDisplay";

export default function BatchInfoCard({ batch, studentCount, onClose }) {
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
            {schedules.length === 0 && (
              <p className="text-gray-500">No schedule defined.</p>
            )}

            {schedules.map((sched, idx) => (
              <ScheduleDisplay key={idx} schedule={sched} compact={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
