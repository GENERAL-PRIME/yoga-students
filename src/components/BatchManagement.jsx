import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { useBatches } from "../hooks/useYogaData"; // Updated hook
import ScheduleDisplay from "./ScheduleDisplay"; // New component

export default function BatchManagement() {
  const { batches, loading, addBatch, updateBatch, deleteBatch } = useBatches();

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // Form State
  const [batchName, setBatchName] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState({
    startTime: "",
    endTime: "",
    days: [],
    mode: "Offline",
  });

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // --- Handlers ---

  const openModal = (batch = null) => {
    setEditingBatch(batch);
    setBatchName(batch ? batch.name : "");
    setSchedules(batch ? batch.schedule || [] : []);
    setCurrentSchedule({
      startTime: "",
      endTime: "",
      days: [],
      mode: "Offline",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (schedules.length === 0)
      return alert("Please add at least one schedule configuration.");

    const payload = { name: batchName, schedule: schedules };

    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, payload);
      } else {
        await addBatch(payload);
      }
      closeModal();
    } catch (error) {
      alert("Failed to save batch: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatch(batchToDelete.id);
      setBatchToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      alert("Failed to delete batch.");
    }
  };

  // --- Schedule Helpers ---

  const formatTimeRange = (start, end) => {
    const format = (t) => {
      if (!t) return "";
      let [h, m] = t.split(":");
      h = parseInt(h);
      const ampm = h >= 12 ? "PM" : "AM";
      return `${h % 12 || 12}:${m} ${ampm}`;
    };
    return `${format(start)} - ${format(end)}`;
  };

  const addScheduleItem = () => {
    const { startTime, endTime, days } = currentSchedule;
    if (!startTime || !endTime || days.length === 0) {
      return alert("Please select start time, end time, and at least one day.");
    }

    setSchedules([
      ...schedules,
      {
        ...currentSchedule,
        timing: formatTimeRange(startTime, endTime),
      },
    ]);

    // Reset days only, keep time/mode for faster entry
    setCurrentSchedule((prev) => ({ ...prev, days: [] }));
  };

  const toggleDay = (day) => {
    setCurrentSchedule((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Batch Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} /> Add Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-lg shadow-md p-6 relative group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {batch.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(batch)}
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setBatchToDelete(batch);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {(batch.schedule || []).map((sched, idx) => (
                <ScheduleDisplay key={idx} schedule={sched} compact={true} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT/CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-xl font-bold">
                {editingBatch ? "Edit Batch" : "New Batch"}
              </h3>
              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Schedule Builder */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3">
                  Add Schedule Entry
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="time"
                    value={currentSchedule.startTime}
                    onChange={(e) =>
                      setCurrentSchedule({
                        ...currentSchedule,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full text-sm p-2 border rounded"
                  />
                  <input
                    type="time"
                    value={currentSchedule.endTime}
                    onChange={(e) =>
                      setCurrentSchedule({
                        ...currentSchedule,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full text-sm p-2 border rounded"
                  />
                </div>
                <div className="mb-3">
                  <select
                    value={currentSchedule.mode}
                    onChange={(e) =>
                      setCurrentSchedule({
                        ...currentSchedule,
                        mode: e.target.value,
                      })
                    }
                    className="w-full text-sm p-2 border rounded"
                  >
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div className="mb-4 flex flex-wrap gap-1">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2 py-1 text-xs rounded border ${
                        currentSchedule.days.includes(day)
                          ? "bg-green-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addScheduleItem}
                  className="w-full py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900"
                >
                  Add to List
                </button>
              </div>

              {/* Added Schedules List */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Schedule
                </label>
                {schedules.map((s, idx) => (
                  <ScheduleDisplay
                    key={idx}
                    schedule={s}
                    compact={true}
                    onDelete={() =>
                      setSchedules(schedules.filter((_, i) => i !== idx))
                    }
                  />
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && batchToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Batch</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete {batchToDelete.name}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
