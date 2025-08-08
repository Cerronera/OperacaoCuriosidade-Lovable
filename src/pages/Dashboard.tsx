import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CadastrosTable } from "@/components/dashboard/CadastrosTable";
import { useAuth } from "@/hooks/useAuth"

const Dashboard = () => {
  const {user, loading} = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] dark:bg-gray-900">
        <div className="text-lg text-black dark:text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} onSearchChange={setSearchQuery} />
        <main className="flex-1 p-6 space-y-6">
          <StatsCards />
          <CadastrosTable searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;