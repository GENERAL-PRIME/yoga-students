import { Edit2, Trash2, CheckCircle } from "lucide-react";
import { getOrdinalSuffix } from "../lib/formatters";

export default function StudentList({
  students,
  processingPaymentId,
  onPay,
  onReceipt,
  onEdit,
  onDelete,
}) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">
          No students in this batch. Add your first student to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:flex flex-col flex-1 bg-white rounded-lg shadow-md overflow-hidden min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full relative">
            <thead className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  Sl. No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
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
                      onClick={() => onEdit(student)}
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
                      {student.payment_status === "paid" ? "Paid" : "Unpaid"}
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
                          onClick={() => onPay(student)}
                          disabled={processingPaymentId === student.id}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs"
                        >
                          <CheckCircle size={14} />
                          {processingPaymentId === student.id
                            ? "Processing..."
                            : "Paid"}
                        </button>
                      )}
                      {student.payment_status === "paid" &&
                        !student.receipt_provided && (
                          <button
                            onClick={() => onReceipt(student.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                          >
                            <CheckCircle size={14} /> Receipt
                          </button>
                        )}
                      <button
                        onClick={() => onEdit(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(student)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* MOBILE CARDS */}
      <div className="md:hidden flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
        {students.map((student, index) => (
          <div
            key={student.id}
            className="bg-white rounded-lg shadow p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">#{index + 1}</p>
                <p className="text-base font-semibold text-gray-800">
                  {student.name}
                </p>
              </div>
            </div>
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
            <div className="flex flex-wrap gap-2 pt-2">
              {student.payment_status === "unpaid" && (
                <button
                  onClick={() => onPay(student)}
                  disabled={processingPaymentId === student.id}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <CheckCircle size={14} />{" "}
                  {processingPaymentId === student.id
                    ? "Processing..."
                    : "Paid"}
                </button>
              )}
              {student.payment_status === "paid" &&
                !student.receipt_provided && (
                  <button
                    onClick={() => onReceipt(student.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    <CheckCircle size={14} /> Receipt
                  </button>
                )}
              <button
                onClick={() => onEdit(student)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(student)}
                className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
