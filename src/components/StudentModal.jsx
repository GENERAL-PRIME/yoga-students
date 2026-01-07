import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function StudentModal({ student, batchId, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    whatsapp_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    due_date: 1,
    fees_amount: "",
    payment_bank: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        whatsapp_number: student.whatsapp_number || "",
        admission_date: student.admission_date,
        due_date: student.due_date,
        fees_amount: String(student.fees_amount),
        payment_bank: student.payment_bank || "",
      });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseStudentData = {
        name: formData.name.trim(),
        whatsapp_number: formData.whatsapp_number.trim(),
        admission_date: formData.admission_date,
        due_date: Number(formData.due_date),
        fees_amount: Number(formData.fees_amount),
        payment_bank: formData.payment_bank?.trim() || null,
        batch_id: batchId || null,
      };
      if (
        !baseStudentData.name ||
        !baseStudentData.whatsapp_number ||
        Number.isNaN(baseStudentData.due_date) ||
        Number.isNaN(baseStudentData.fees_amount)
      ) {
        alert("Please fill all required fields correctly.");
        setLoading(false);
        return;
      }

      if (student) {
        const { error } = await supabase
          .from("students")
          .update(baseStudentData)
          .eq("id", student.id);

        if (error) throw error;
      } else {
        const insertStudentData = {
          ...baseStudentData,
          payment_status: "unpaid",
          receipt_provided: false,
        };
        const { error } = await supabase
          .from("students")
          .insert([insertStudentData]);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error("FULL ERROR:", JSON.stringify(error, null, 2));
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">
            {student ? "Student Details" : "Add New Student"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp_number: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Date *
              </label>
              <input
                type="date"
                value={formData.admission_date}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setFormData({
                    ...formData,
                    admission_date: e.target.value,
                    due_date: date.getDate(),
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Day of Month) *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    due_date: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fees Amount (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.fees_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fees_amount: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Bank
              </label>
              <input
                type="text"
                value={formData.payment_bank}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_bank: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              {loading
                ? "Saving..."
                : student
                ? "Update Student"
                : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
