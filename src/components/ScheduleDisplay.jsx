import { Clock, Wifi, MapPin, X } from "lucide-react";

export default function ScheduleDisplay({
  schedule,
  onDelete,
  compact = false,
}) {
  return (
    <div
      className={`
      ${compact ? "p-2 text-sm" : "p-4"} 
      bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start
    `}
    >
      <div className="flex-1">
        {/* Header: Timing & Icon */}
        <div className={`flex items-center gap-2 ${compact ? "mb-1" : "mb-2"}`}>
          {schedule.mode === "Online" ? (
            <Wifi size={compact ? 12 : 18} className="text-blue-500" />
          ) : (
            <MapPin size={compact ? 12 : 18} className="text-red-500" />
          )}

          <div
            className={`flex items-center gap-2 font-medium ${
              compact ? "text-gray-700" : "text-gray-800"
            }`}
          >
            {!compact && <Clock size={16} className="text-gray-400" />}
            <span>{schedule.timing}</span>
          </div>

          {/* Badge for Mode (only in compact view, as icon is enough for expanded) */}
          {compact && (
            <span
              className={`uppercase font-bold tracking-wider text-[10px] ${
                schedule.mode === "Online" ? "text-blue-700" : "text-red-700"
              }`}
            >
              {schedule.mode}
            </span>
          )}
        </div>

        {/* Days Tags */}
        <div className="flex flex-wrap gap-1">
          {schedule.days.map((day) => (
            <span
              key={day}
              className={`
                ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"} 
                bg-green-100 text-green-700 rounded-full font-medium
              `}
            >
              {compact ? day.substring(0, 3) : day}
            </span>
          ))}
        </div>
      </div>

      {/* Optional Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 hover:bg-red-100 p-1 rounded ml-2"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
