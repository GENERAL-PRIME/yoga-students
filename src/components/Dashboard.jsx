import { useState, useEffect } from "react";
import { Info, Users, History } from "lucide-react";
import { supabase } from "../lib/supabase";
import StudentModal from "./StudentModal";
import BatchInfoCard from "./BatchInfoCard";
import StudentList from "./StudentList"; // Reused!
import { useBatches, useStudents } from "../hooks/useYogaData"; // Reused!

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("students");

  // Reuse Hooks
  const { batches, loading: batchesLoading } = useBatches();
  const [selectedBatchId, setSelectedBatchId] = useState("");

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId)
      setSelectedBatchId(batches[0].id);
  }, [batches, selectedBatchId]);

  const {
    students,
    processingPaymentId,
    handlePayment,
    handleReceiptReceived,
    handleDeleteStudent,
    refreshStudents,
  } = useStudents(selectedBatchId);

  // Dashboard Specific State (History)
  const [historyMonth, setHistoryMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal States
  const [showBatchInfo, setShowBatchInfo] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // History Effect
  useEffect(() => {
    if (activeTab === "history") fetchPaymentHistory();
  }, [activeTab, historyMonth]);

  const fetchPaymentHistory = async () => {
    setLoadingHistory(true);
    try {
      const [year, month] = historyMonth.split("-");
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

      const { data, error } = await supabase
        .from("payment_history")
        .select(`amount, payment_date, students (name)`)
        .gte("payment_date", startDate)
        .lte("payment_date", endDate)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const currentBatch = batches.find((b) => b.id === selectedBatchId);

  // Action Wrappers
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (studentToDelete) {
      await handleDeleteStudent(studentToDelete.id);
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "students"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={18} /> Student List
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "history"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <History size={18} /> Payment History
        </button>
      </div>

      {activeTab === "students" ? (
        <>
          <div className="shrink-0 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="mt-7 p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Info size={24} />
                </button>
              )}
            </div>
          </div>

          <StudentList
            students={students}
            processingPaymentId={processingPaymentId}
            onPay={handlePayment}
            onReceipt={handleReceiptReceived}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </>
      ) : (
        /* HISTORY TAB CONTENT */
        <div className="flex flex-col flex-1 gap-6 min-h-0">
          <div className="shrink-0 bg-white rounded-lg shadow-md p-6">
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Month
              </label>
              <input
                type="month"
                value={historyMonth}
                onChange={(e) => setHistoryMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-white rounded-lg shadow-md overflow-hidden min-h-0">
            {/* ... History Table Code (kept same as before, omitted for brevity) ... */}
            {loadingHistory ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No payment history found for this month.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full relative">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentHistory.map((record, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {record.students?.name || "Unknown Student"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs. {record.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reused Modals logic similar to StudentDashboard */}
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
          batchId={selectedBatchId}
          onClose={() => {
            setShowStudentModal(false);
            refreshStudents();
          }}
        />
      )}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          {/* ... Delete Modal UI ... */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Delete Student?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                {studentToDelete.name}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
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
