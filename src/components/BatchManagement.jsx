import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    timing: "",
    weekly_days: [],
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
      setFormData({
        name: batch.name,
        timing: batch.timing,
        weekly_days: batch.weekly_days,
      });
    } else {
      setEditingBatch(null);
      setFormData({ name: "", timing: "", weekly_days: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
    setFormData({ name: "", timing: "", weekly_days: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBatch) {
        const { error } = await supabase
          .from("batches")
          .update(formData)
          .eq("id", editingBatch.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("batches").insert([formData]);

        if (error) throw error;
      }

      fetchBatches();
      closeModal();
    } catch (error) {
      console.error("Error saving batch:", error);
      alert("Failed to save batch. Please try again.");
    }
  };

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
      alert("Failed to delete batch. Please try again.");
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      weekly_days: prev.weekly_days.includes(day)
        ? prev.weekly_days.filter((d) => d !== day)
        : [...prev.weekly_days, day],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Batch Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Add Batch
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {batch.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{batch.timing}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(batch)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => confirmDelete(batch)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Weekly Days:</p>
                <div className="flex flex-wrap gap-1">
                  {batch.weekly_days.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                    >
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {batches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No batches found. Create your first batch to get started.
            </p>
          </div>
        )}
      </div>

      {showDeleteConfirm && batchToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Delete Batch
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-medium">{batchToDelete.name}</span>? This
                action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingBatch ? "Edit Batch" : "Add New Batch"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Morning Yoga"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timing
                </label>
                <input
                  type="text"
                  value={formData.timing}
                  onChange={(e) =>
                    setFormData({ ...formData, timing: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 6:00 AM - 7:00 AM"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Days
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.weekly_days.includes(day)
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingBatch ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
