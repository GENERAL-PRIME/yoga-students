import { useState, useEffect } from "react";
import { Info, Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import StudentModal from "./StudentModal";
import BatchInfoCard from "./BatchInfoCard";

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatchInfo, setShowBatchInfo] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setBatches(data || []);
      if (data && data.length > 0) {
        setSelectedBatch(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("batch_id", selectedBatch)
        .order("name", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handlePayment = async (student) => {
    setProcessingPayment(student.id);

    try {
      const { error: updateError } = await supabase
        .from("students")
        .update({
          payment_status: "paid",
          last_payment_date: new Date().toISOString(),
        })
        .eq("id", student.id);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from("payment_history")
        .insert([
          {
            student_id: student.id,
            amount: student.fees_amount,
            status: "paid",
          },
        ]);

      if (historyError) throw historyError;

      fetchStudents();
    } catch (error) {
      console.error("FULL ERROR:", JSON.stringify(error, null, 2));
      alert(error.message);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleReceiptReceived = async (student) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({
          receipt_provided: true,
        })
        .eq("id", student.id);

      if (error) throw error;
      fetchStudents();
    } catch (error) {
      console.error("Error updating receipt status:", error);
      alert("Failed to update receipt status. Please try again.");
    }
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentToDelete.id);

      if (error) throw error;

      fetchStudents();
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const openStudentModal = (student) => {
    setSelectedStudent(student || null);
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
    fetchStudents();
  };

  const currentBatch = batches.find((b) => b.id === selectedBatch);

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
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>
      <div className="shrink-0 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          {currentBatch && (
            <button
              onClick={() => setShowBatchInfo(true)}
              className="mt-7 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Batch Info"
            >
              <Info size={24} />
            </button>
          )}
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            No batches found. Please create a batch first.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            No students in this batch. Add your first student to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:flex flex-col flex-1 bg-white rounded-lg shadow-md overflow-hidden min-h-0">
            <div className="flex-1 overflow-auto">
              <table className="w-full relative">
                <thead className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Sl. No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Fees Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Receipt Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openStudentModal(student)}
                          className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.due_date}
                        {getOrdinalSuffix(student.due_date)} of every month
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs. {student.fees_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            student.payment_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.payment_status === "paid"
                            ? "Paid"
                            : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            student.receipt_provided
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.receipt_provided ? "Received" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1 flex-wrap">
                          {student.payment_status === "unpaid" && (
                            <button
                              onClick={() => handlePayment(student)}
                              disabled={processingPayment === student.id}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              <CheckCircle size={14} />
                              {processingPayment === student.id
                                ? "Processing..."
                                : "Paid"}
                            </button>
                          )}
                          {student.payment_status === "paid" &&
                            !student.receipt_provided && (
                              <button
                                onClick={() => handleReceiptReceived(student)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                              >
                                <CheckCircle size={14} />
                                Receipt
                              </button>
                            )}
                          <button
                            onClick={() => openStudentModal(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== MOBILE CARDS ===== */}
          <div className="md:hidden flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
            {students.map((student, index) => (
              <div
                key={student.id}
                className="bg-white rounded-lg shadow p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">#{index + 1}</p>
                    <p className="text-base font-semibold text-gray-800">
                      {student.name}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      student.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </span>

                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      student.receipt_provided
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {student.receipt_provided
                      ? "Receipt Received"
                      : "Receipt Pending"}
                  </span>
                </div>

                {/* Important Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Fees</p>
                    <p className="font-medium">₹ {student.fees_amount}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className="font-medium">
                      {student.due_date}
                      {getOrdinalSuffix(student.due_date)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {student.payment_status === "unpaid" && (
                    <button
                      onClick={() => handlePayment(student)}
                      disabled={processingPayment === student.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      {processingPayment === student.id
                        ? "Processing..."
                        : "Paid"}
                    </button>
                  )}

                  {student.payment_status === "paid" &&
                    !student.receipt_provided && (
                      <button
                        onClick={() => handleReceiptReceived(student)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                      >
                        <CheckCircle size={14} />
                        Receipt
                      </button>
                    )}

                  <button
                    onClick={() => openStudentModal(student)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteStudent(student)}
                    className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showBatchInfo && currentBatch && (
        <BatchInfoCard
          batch={currentBatch}
          onClose={() => setShowBatchInfo(false)}
          studentCount={students.length}
        />
      )}

      {showStudentModal && (
        <StudentModal
          student={selectedStudent}
          batchId={selectedBatch}
          onClose={closeStudentModal}
        />
      )}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Delete Student?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                {studentToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
