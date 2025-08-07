import { Home, Users, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "Cadastro", icon: Users, path: "/cadastros" },
  { name: "Relatórios", icon: BarChart3, path: "/relatorios" },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-lg m-4 mr-0 p-4 shadow-sm">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-white dark:bg-gray-700">
          <span className="text-lg font-bold text-black dark:text-white">OC</span>
        </div>
        <span className="text-black dark:text-white font-medium">Operação Curiosidade</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? "bg-[#e3eff0] dark:bg-gray-700 text-black dark:text-white" 
                    : "text-black dark:text-white hover:bg-[#e3eff0] dark:hover:bg-gray-700"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};