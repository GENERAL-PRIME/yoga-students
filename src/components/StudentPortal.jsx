import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { LogOut, User, CalendarClock, Loader2, Save, X } from "lucide-react";
import Header from "./Header";

export default function StudentPortal({ session, onLogout }) {
  const [activeNav, setActiveNav] = useState("profile");
  const [student, setStudent] = useState(session);
  const [batch, setBatch] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [name, setName] = useState(session.name || "");
  const [whatsapp, setWhatsapp] = useState(session.whatsapp_number || "");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch Batch Schedule on Load
  useEffect(() => {
    if (student.batch_id) {
      supabase
        .from("batches")
        .select("*")
        .eq("id", student.batch_id)
        .single()
        .then(({ data }) => setBatch(data));
    }
  }, [student.batch_id]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from("students")
        .update({ name, whatsapp_number: whatsapp })
        .eq("id", student.id)
        .select()
        .single();

      if (error) throw error;
      setStudent(data);
      localStorage.setItem("studentSession", JSON.stringify(data));
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage("Error updating profile: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const navItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "schedule", label: "Batch Timings", icon: CalendarClock },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* FIXED: Pass the student onLogout function directly to Header
        so the top-right button logs the student out correctly.
      */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } w-64`}
        >
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 border-b bg-green-50/50">
            <p className="text-sm text-gray-500 font-medium">Logged in as</p>
            <p className="text-green-700 font-bold truncate">{student.name}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-3xl mx-auto">
            {/* Profile Tab */}
            {activeNav === "profile" && (
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <User className="text-green-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    My Profile
                  </h2>
                </div>

                {message && (
                  <div
                    className={`mb-6 p-4 rounded-lg text-sm font-medium border ${message.includes("Error") ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}
                  >
                    {message}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors w-full md:w-auto font-medium"
                  >
                    {updating ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Update Profile
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                      Account Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          Login ID
                        </label>
                        <p className="font-mono font-medium text-gray-800">
                          {student.login_id || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          Payment Status
                        </label>
                        <p
                          className={`font-medium capitalize ${student.payment_status === "paid" ? "text-green-600" : "text-red-600"}`}
                        >
                          {student.payment_status}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          Fees Amount
                        </label>
                        <p className="font-medium text-gray-800">
                          ₹{student.fees_amount}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase mb-1">
                          Due Date
                        </label>
                        <p className="font-medium text-gray-800">
                          Day {student.due_date} of every month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeNav === "schedule" && (
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <CalendarClock className="text-green-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">
                    My Batch Timings
                  </h2>
                </div>

                {batch ? (
                  <div>
                    <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <p className="text-sm text-green-800 font-medium">
                          Assigned Batch
                        </p>
                        <p className="text-xl font-bold text-green-900">
                          {batch.name}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Weekly Schedule
                    </h3>

                    {batch.schedule &&
                    Array.isArray(batch.schedule) &&
                    batch.schedule.length > 0 ? (
                      <div className="grid gap-4">
                        {batch.schedule.map((slot, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 rounded-xl bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-green-300 hover:shadow-md transition-all group"
                          >
                            <div className="flex flex-col">
                              {/* FIXED: Show days correctly */}
                              <span className="font-bold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                                {slot.days ? slot.days.join(", ") : slot.day}
                              </span>
                              {/* FIXED: Show Mode (Online/Offline) */}
                              <span
                                className={`text-sm font-medium mt-1 w-max px-2 py-0.5 rounded-md ${slot.mode === "Online" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                              >
                                {slot.mode || "Standard"} Mode
                              </span>
                            </div>

                            {/* FIXED: Show Timing Correctly */}
                            <span className="text-green-800 font-bold bg-green-50 px-4 py-2 rounded-lg border border-green-200 shadow-sm whitespace-nowrap text-center">
                              {slot.timing || slot.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        <CalendarClock
                          className="mx-auto text-gray-400 mb-3"
                          size={32}
                        />
                        <p className="text-gray-500 font-medium">
                          No timings have been set for your batch yet.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2
                      className="animate-spin mb-4 text-green-600"
                      size={32}
                    />
                    <p>Loading your schedule...</p>
                    {student.batch_id === null && (
                      <p className="mt-2 text-sm text-red-500">
                        You are not currently assigned to any batch.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
