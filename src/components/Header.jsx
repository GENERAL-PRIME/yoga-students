import { Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="bg-gradient-to-r from-green-600 to-green-400 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
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
          <p className="text-sm text-green-50 mt-1">
            Student Management Dashboard
          </p>
        </div>
      </div>
    </header>
  );
}
