import { LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PendingApproval() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-yellow-500">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-100 rounded-full">
            <ShieldAlert className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Account Pending Approval
        </h2>

        <p className="text-gray-600 mb-8">
          Thanks for signing up! Your account is currently under review. You
          will gain access to the dashboard once an administrator verifies your
          account.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-500">
          <p>
            Please contact the institute administrator if you need immediate
            access.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
