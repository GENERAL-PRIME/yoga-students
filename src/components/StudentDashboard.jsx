import { useState, useEffect } from "react";
import { Info, Plus } from "lucide-react";
import StudentModal from "./StudentModal";
import BatchInfoCard from "./BatchInfoCard";
import StudentList from "./StudentList";
import { useBatches, useStudents } from "../hooks/useYogaData";

export default function StudentDashboard() {
  const { batches, loading: batchesLoading } = useBatches();
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // Set default batch when loaded
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

  // Use the student hook
  const {
    students,
    loading: studentsLoading,
    processingPaymentId,
    handlePayment,
    handleReceiptReceived,
    handleDeleteStudent,
    refreshStudents, // <--- Get this function
  } = useStudents(selectedBatchId);

  // UI State
  const [showBatchInfo, setShowBatchInfo] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const currentBatch = batches.find((b) => b.id === selectedBatchId);
  const isLoading =
    batchesLoading || (studentsLoading && !students.length && selectedBatchId);

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

  // === THIS IS THE FIX ===
  const closeModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
    refreshStudents(); // Refresh list without reloading page
  };

  if (isLoading && batches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStudent(null);
              setShowStudentModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} /> Add Student
          </button>
        </div>
      </div>

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

      {batches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            No batches found. Please create a batch first.
          </p>
        </div>
      ) : (
        <StudentList
          students={students}
          processingPaymentId={processingPaymentId}
          onPay={handlePayment}
          onReceipt={handleReceiptReceived}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
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
          batchId={selectedBatchId}
          onClose={closeModal}
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
