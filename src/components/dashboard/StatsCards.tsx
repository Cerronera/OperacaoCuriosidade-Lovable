import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  title: string;
  value: number;
  filter: string;
  color: string;
}

interface DashboardStats {
  total_count: number;
  recent_count: number;
  pending_count: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Total de cadastros", value: 0, filter: "all", color: "text-blue-600" },
    { title: "Cadastros nos últimos 30 dias", value: 0, filter: "last30days", color: "text-green-600" },
    { title: "Cadastros com pendência de revisão", value: 0, filter: "pending", color: "text-red-600" },
  ]);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchStats();
    // Get initial filter from sessionStorage
    const savedFilter = sessionStorage.getItem("cadastros_filter") || "all";
    setActiveFilter(savedFilter);
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Error fetching dashboard stats:', error);
        return;
      }

      // Cast data to our interface type
      const stats = data as unknown as DashboardStats;

      // Update stats with live data
      setStats([
        { title: "Total de cadastros", value: stats.total_count, filter: "all", color: "text-blue-600" },
        { title: "Cadastros nos últimos 30 dias", value: stats.recent_count, filter: "last30days", color: "text-green-600" },
        { title: "Cadastros com pendência de revisão", value: stats.pending_count, filter: "pending", color: "text-red-600" },
      ]);
    } catch (error) {
      console.error('Error calling RPC function:', error);
    }
  };

  const handleCardClick = (filter: string) => {
    setActiveFilter(filter);
    sessionStorage.setItem("cadastros_filter", filter);
    // Dispatch custom event to notify table component
    window.dispatchEvent(new CustomEvent("filter-changed", { detail: filter }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          onClick={() => handleCardClick(stat.filter)}
          className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm cursor-pointer hover:bg-[#e3eff0] dark:hover:bg-gray-700 transition-colors border-2 ${
            activeFilter === stat.filter 
              ? 'border-cyan-400 bg-[#e3eff0] dark:bg-gray-700' 
              : 'border-transparent hover:border-cyan-400'
          }`}
        >
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              {stat.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};