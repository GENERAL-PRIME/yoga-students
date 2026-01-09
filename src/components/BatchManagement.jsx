import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Clock, Wifi, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // Form State
  const [batchName, setBatchName] = useState("");
  const [schedules, setSchedules] = useState([]);

  // Temporary state for the schedule being added
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
    if (batch) {
      setEditingBatch(batch);
      setBatchName(batch.name);
      setSchedules(batch.schedule || []); // Load existing schedule
    } else {
      setEditingBatch(null);
      setBatchName("");
      setSchedules([]);
    }
    // Reset current schedule input
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
    setBatchName("");
    setSchedules([]);
  };

  // Helper to format time for display/storage (e.g. "6:00 AM - 7:00 AM")
  const formatTimeRange = (start, end) => {
    const format = (timeStr) => {
      if (!timeStr) return "";
      let [hours, minutes] = timeStr.split(":");
      hours = parseInt(hours);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    };
    return `${format(start)} - ${format(end)}`;
  };

  const addScheduleItem = () => {
    if (
      !currentSchedule.startTime ||
      !currentSchedule.endTime ||
      currentSchedule.days.length === 0
    ) {
      alert("Please select start time, end time, and at least one day.");
      return;
    }

    const timingString = formatTimeRange(
      currentSchedule.startTime,
      currentSchedule.endTime
    );

    setSchedules([
      ...schedules,
      {
        ...currentSchedule,
        timing: timingString, // Store the formatted string for compatibility
      },
    ]);

    // Reset inputs
    setCurrentSchedule((prev) => ({ ...prev, days: [] })); // Keep times/mode for easier repeated entry? Or clear all. Let's clear days.
  };

  const removeScheduleItem = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (schedules.length === 0) {
      alert("Please add at least one schedule configuration.");
      return;
    }

    const payload = {
      name: batchName,
      schedule: schedules, // Saving the JSON array
    };

    try {
      if (editingBatch) {
        const { error } = await supabase
          .from("batches")
          .update(payload)
          .eq("id", editingBatch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("batches").insert([payload]);
        if (error) throw error;
      }
      fetchBatches();
      closeModal();
    } catch (error) {
      console.error("Error saving batch:", error);
      alert("Failed to save batch.");
    }
  };

  // ... (Delete handlers remain the same: confirmDelete, cancelDelete, handleDelete) ...
  const confirmDelete = (batch) => {
    setBatchToDelete(batch);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setBatchToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    if (!batchToDelete) return;
    try {
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", batchToDelete.id);
      if (error) throw error;
      fetchBatches();
      cancelDelete();
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Failed to delete batch.");
    }
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
                  onClick={() => confirmDelete(batch)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Added max-h-48 and overflow-y-auto to limit view to approx 2 items */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {(batch.schedule || []).map((sched, idx) => (
                <div
                  key={idx}
                  className="text-sm bg-gray-50 p-2 rounded border border-gray-100"
                >
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <Clock size={14} className="text-green-600" />{" "}
                    {sched.timing}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {sched.mode === "Online" ? (
                      <Wifi size={12} />
                    ) : (
                      <MapPin size={12} />
                    )}
                    <span className="uppercase font-bold tracking-wider text-green-700">
                      {sched.mode}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sched.days.map((d) => (
                      <span
                        key={d}
                        className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full"
                      >
                        {d.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. Morning Yoga"
                  required
                />
              </div>

              {/* Schedule Builder */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3">
                  Add Schedule Entry
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500">Start Time</label>
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
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">End Time</label>
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
                </div>

                <div className="mb-3">
                  <label className="text-xs text-gray-500 block mb-1">
                    Mode
                  </label>
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

                <div className="mb-4">
                  <label className="text-xs text-gray-500 block mb-1">
                    Days
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {weekDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-2 py-1 text-xs rounded border ${
                          currentSchedule.days.includes(day)
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addScheduleItem}
                  className="w-full py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900"
                >
                  Add to List
                </button>
              </div>

              {/* Schedule List */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Schedule
                </label>
                {schedules.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No schedules added yet.
                  </p>
                )}
                {schedules.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-100"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-800">
                        {s.timing} ({s.mode})
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        {s.days.join(", ")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeScheduleItem(idx)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
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

      {/* Delete Confirmation Modal (Same as before) */}
      {showDeleteConfirm && batchToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Batch</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete {batchToDelete.name}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={cancelDelete}
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
