import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  title: string;
  value: number;
  filter: string;
  color: string;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Total de cadastros", value: 0, filter: "all", color: "text-blue-600" },
    { title: "Cadastros nos últimos 30 dias", value: 0, filter: "last30days", color: "text-green-600" },
    { title: "Cadastros com pendência de revisão", value: 0, filter: "pending", color: "text-red-600" },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // TODO: Replace with actual Supabase RPC calls when database is set up
    // For now, using mock data that matches the reference image
    setStats([
      { title: "Total de cadastros", value: 43, filter: "all", color: "text-blue-600" },
      { title: "Cadastros nos últimos 30 dias", value: 20, filter: "last30days", color: "text-green-600" },
      { title: "Cadastros com pendência de revisão", value: 14, filter: "pending", color: "text-red-600" },
    ]);
  };

  const handleCardClick = (filter: string) => {
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
          className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:bg-[#e3eff0] transition-colors border-2 border-transparent hover:border-cyan-400"
        >
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-gray-600 text-sm">
              {stat.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};