import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Login from "./components/Login";
import PendingApproval from "./components/PendingApproval";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StudentDashboard from "./components/StudentDashboard";
import BatchManagement from "./components/BatchManagement";
import ScheduleManagement from "./components/ScheduleManagement";
import Dashboard from "./components/Dashboard";
import { Loader2 } from "lucide-react";
import StudentPortal from "./components/StudentPortal";

function App() {
  const [session, setSession] = useState(null);
  const [studentSession, setStudentSession] = useState(null); // NEW: State for student login
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    // 0. Check for Student Session in LocalStorage
    const storedStudent = localStorage.getItem("studentSession");
    if (storedStudent) {
      setStudentSession(JSON.parse(storedStudent));
    }

    // 1. Get Admin Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkVerification(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes (Admin)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkVerification(session.user.id);
      } else {
        setIsVerified(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper to check profile status for Admin
  const checkVerification = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_verified")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setIsVerified(false);
      } else {
        setIsVerified(data?.is_verified || false);
      }
    } catch (err) {
      console.error(err);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // Student Authentication Handlers
  const handleStudentLogin = (studentData) => {
    localStorage.setItem("studentSession", JSON.stringify(studentData));
    setStudentSession(studentData);
  };

  const handleStudentLogout = () => {
    localStorage.removeItem("studentSession");
    setStudentSession(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // --- RENDERING LOGIC ---

  // 1. Logged In as Student -> Show Student Portal
  if (studentSession) {
    return (
      <StudentPortal session={studentSession} onLogout={handleStudentLogout} />
    );
  }

  // 2. Not Logged In at all -> Show Combined Login
  if (!session) {
    return <Login onStudentLogin={handleStudentLogin} />;
  }

  // 3. Logged In as Admin BUT Not Verified -> Show Pending Screen
  if (!isVerified) {
    return <PendingApproval />;
  }

  // 4. Logged In as Admin AND Verified -> Show Dashboard Layout
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <StudentDashboard />;
      case "batches":
        return <BatchManagement />;
      case "schedule":
        return <ScheduleManagement />;
      case "settings":
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        );
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="container mx-auto px-4 py-8 max-w-7xl h-full flex flex-col">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
