import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Login from "./components/Login";
import PendingApproval from "./components/PendingApproval"; // Import the new component
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StudentDashboard from "./components/StudentDashboard";
import BatchManagement from "./components/BatchManagement";
import ScheduleManagement from "./components/ScheduleManagement";
import Dashboard from "./components/Dashboard";
import { Loader2 } from "lucide-react";

function App() {
  const [session, setSession] = useState(null);
  const [isVerified, setIsVerified] = useState(false); // State for verification
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    // 1. Get Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkVerification(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes
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

  // Helper to check profile status
  const checkVerification = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_verified")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Handle case where profile triggers might have failed or latency
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // 1. Not Logged In -> Show Login
  if (!session) {
    return <Login />;
  }

  // 2. Logged In BUT Not Verified -> Show Pending Screen
  if (!isVerified) {
    return <PendingApproval />;
  }

  // 3. Logged In AND Verified -> Show Dashboard
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
