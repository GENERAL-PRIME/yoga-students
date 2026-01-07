import { X, Calendar, Clock, Users } from 'lucide-react';

export default function BatchInfoCard({ batch, studentCount, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Batch Information</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">{batch.name}</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Timing</p>
                <p className="font-medium">{batch.timing}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Weekly Days</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {batch.weekly_days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="font-medium">{studentCount}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-xs text-gray-500">
              <p>Created: {new Date(batch.created_at).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(batch.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
