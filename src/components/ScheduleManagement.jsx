import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ScheduleManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBatch(null);
  };

  // Helper to parse time string "6:00 AM - 7:00 AM" to minutes from midnight
  const parseTimeRange = (timeStr) => {
    try {
      const [startStr, endStr] = timeStr.split("-").map((s) => s.trim());

      const toMinutes = (time) => {
        const [t, period] = time.split(" ");
        let [hours, minutes] = t.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const start = toMinutes(startStr);
      const end = toMinutes(endStr);
      return { start, duration: end - start };
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Constants for Gantt Chart Limits
  const START_HOUR = 5; // 5 AM
  const END_HOUR = 22; // 10 PM
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Class Schedule</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {/* Mobile Friendly Scroll Container */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-4">
            {/* Time Header */}
            <div className="flex border-b border-gray-200 pb-2 mb-2">
              <div className="w-24 flex-shrink-0 font-semibold text-gray-500">
                Day
              </div>
              <div className="flex-1 relative h-6">
                {Array.from({ length: END_HOUR - START_HOUR + 1 }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="absolute text-xs text-gray-400 transform -translate-x-1/2"
                      style={{
                        left: `${(i / (END_HOUR - START_HOUR)) * 100}%`,
                      }}
                    >
                      {START_HOUR + i}:00
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Days Rows */}
            <div className="space-y-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="flex items-center group hover:bg-gray-50 rounded-lg transition-colors py-1"
                >
                  <div className="w-24 flex-shrink-0 font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                      {day.substring(0, 3)}
                    </span>
                  </div>

                  {/* Timeline Track */}
                  <div className="flex-1 relative h-12 bg-gray-100 rounded-lg mx-1 border border-gray-200">
                    {/* Grid Lines */}
                    {Array.from({ length: END_HOUR - START_HOUR }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-gray-200 border-dashed"
                          style={{
                            left: `${
                              ((i + 1) / (END_HOUR - START_HOUR)) * 100
                            }%`,
                          }}
                        />
                      )
                    )}

                    {/* Batch Bars */}
                    {batches
                      .filter((b) => b.weekly_days.includes(day))
                      .map((batch) => {
                        const timeData = parseTimeRange(batch.timing);
                        if (!timeData) return null;

                        const startOffset = timeData.start - START_HOUR * 60;
                        const leftPercent = (startOffset / TOTAL_MINUTES) * 100;
                        const widthPercent =
                          (timeData.duration / TOTAL_MINUTES) * 100;

                        return (
                          <div
                            key={batch.id}
                            onClick={() => openModal(batch)}
                            className="absolute top-1 bottom-1 bg-green-500 hover:bg-green-600 rounded-md shadow-sm cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-[1.02] z-10"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            title={`${batch.name} (${batch.timing})`}
                          >
                            <span className="text-xs text-white font-medium whitespace-nowrap px-2 truncate">
                              {batch.name}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal (Read-Only) */}
      {isModalOpen && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Class Details
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Class Name
                </label>
                <p className="text-lg font-medium text-gray-800">
                  {selectedBatch.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Timing
                </label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={18} className="text-green-600" />
                  <span className="font-medium">{selectedBatch.timing}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Scheduled Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => {
                    const isActive = selectedBatch.weekly_days.includes(day);
                    if (!isActive) return null;
                    return (
                      <span
                        key={day}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {day.substring(0, 3)}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
