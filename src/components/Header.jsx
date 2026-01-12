import { Menu, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Header({ onMenuClick }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 text-center lg:text-left lg:ml-0 ml-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
              Barasat Yoga Vigyan Kendra
            </h1>
            <p className="text-sm text-green-50 mt-1 hidden sm:block">
              Student Management Dashboard
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
