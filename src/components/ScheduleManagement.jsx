import { useState, useEffect } from "react";
import { X, Clock, Wifi, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ScheduleManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

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

  const openModal = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const parseTimeRange = (timeStr) => {
    try {
      if (!timeStr) return null;
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
      let duration = end - start;
      if (duration < 0) duration += 24 * 60;

      return { start, duration };
    } catch (e) {
      return null;
    }
  };

  const getDayLayout = (day) => {
    // Flatten batches into individual schedule sessions for the day
    const dayItems = batches
      .flatMap((batch) => {
        const schedules = batch.schedule || [];

        // Find all schedule entries for this batch that occur on 'day'
        return schedules
          .filter((sched) => sched.days && sched.days.includes(day))
          .map((sched) => {
            const time = parseTimeRange(sched.timing);
            if (!time) return null;

            return {
              id: batch.id, // Keep original batch ID for reference
              name: batch.name,
              ...time, // start, duration
              mode: sched.mode,
              timingLabel: sched.timing,
              days: sched.days, // Pass full list of days for this specific schedule
              uniqueKey: `${batch.id}-${sched.timing}-${day}`, // Unique key for React rendering
            };
          });
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    // Calculate overlap/lane index
    const lanes = [];

    const itemsWithLane = dayItems.map((item) => {
      let laneIndex = -1;

      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] <= item.start) {
          laneIndex = i;
          lanes[i] = item.start + item.duration;
          break;
        }
      }

      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push(item.start + item.duration);
      }

      return { ...item, laneIndex };
    });

    return itemsWithLane;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const START_HOUR = 5;
  const END_HOUR = 22;
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
  const STACK_OFFSET = 6; // Pixels to offset for overlapping cards

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="shrink-0 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Class Schedule
        </h2>
        <div className="flex gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div> Offline
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div> Online
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col overflow-hidden">
        {/* Scroll Container for Mobile - Horizontal Scroll ONLY */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
          {/* Inner Content - Min Width forces horizontal scroll on mobile */}
          <div className="h-full flex flex-col min-w-[800px] md:min-w-0 md:w-full pr-6">
            {/* Time Header */}
            <div className="shrink-0 flex border-b border-gray-200 py-3 bg-gray-50">
              <div className="w-14 md:w-24 flex-shrink-0 font-semibold text-gray-500 text-center text-xs md:text-sm">
                Day
              </div>
              <div className="flex-1 relative h-4 md:h-6">
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

            {/* Schedule Rows Container */}
            <div className="flex-1 flex flex-col min-h-0">
              {weekDays.map((day) => {
                const items = getDayLayout(day);

                return (
                  <div
                    key={day}
                    className="flex-1 flex items-center group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 relative min-h-[50px]"
                  >
                    {/* Day Label */}
                    <div className="w-14 md:w-24 flex-shrink-0 flex justify-center items-center px-1 border-r border-transparent">
                      <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center text-[10px] md:text-sm font-bold">
                        {day.substring(0, 3)}
                      </span>
                    </div>

                    {/* Timeline Lane */}
                    <div className="flex-1 relative h-full border-l border-gray-100">
                      {/* Vertical Grid Lines */}
                      {Array.from({ length: END_HOUR - START_HOUR }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 border-r border-gray-100 dashed"
                            style={{
                              left: `${
                                ((i + 1) / (END_HOUR - START_HOUR)) * 100
                              }%`,
                            }}
                          />
                        )
                      )}

                      {/* Class Cards */}
                      {items.map((session) => {
                        const startOffset = session.start - START_HOUR * 60;
                        const leftPercent = (startOffset / TOTAL_MINUTES) * 100;
                        const widthPercent =
                          (session.duration / TOTAL_MINUTES) * 100;

                        const stackShift = session.laneIndex * STACK_OFFSET;

                        // Color coding based on mode
                        const isOnline = session.mode === "Online";
                        const bgColor = isOnline
                          ? "bg-blue-500"
                          : "bg-green-500";
                        const hoverColor = isOnline
                          ? "hover:bg-blue-600"
                          : "hover:bg-green-600";
                        const borderColor = isOnline
                          ? "border-blue-400/50"
                          : "border-green-400/50";

                        return (
                          <div
                            key={session.uniqueKey}
                            onClick={() => openModal(session)}
                            className={`absolute ${bgColor} ${hoverColor} rounded shadow-sm cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all hover:scale-105 border ${borderColor} z-10`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              height: "65%",
                              top: `calc(15% + ${stackShift}px)`,
                              zIndex: 10 + session.laneIndex,
                            }}
                            title={`${session.name} (${session.timingLabel}) - ${session.mode}`}
                          >
                            <span className="text-[10px] md:text-xs text-white font-medium whitespace-nowrap px-1 truncate w-full text-center">
                              {session.name}
                            </span>
                            <span className="text-[8px] text-white/90 uppercase tracking-wider font-semibold">
                              {session.mode}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedSession && (
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
                  {selectedSession.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Timing
                </label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={18} className="text-green-600" />
                  <span className="font-medium">
                    {selectedSession.timingLabel}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Mode
                </label>
                <div className="flex items-center gap-2 text-gray-700">
                  {selectedSession.mode === "Online" ? (
                    <Wifi size={18} className="text-blue-500" />
                  ) : (
                    <MapPin size={18} className="text-green-500" />
                  )}
                  <span
                    className={`font-bold ${
                      selectedSession.mode === "Online"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedSession.mode}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Scheduled Days (For this timing)
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => {
                    const isActive = selectedSession.days.includes(day);
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
