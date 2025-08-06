import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Cadastro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: "Ativo" | "Inativo";
  data: string;
}

export const CadastrosTable = () => {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCadastros();
    
    // Listen for filter changes from stats cards
    const handleFilterChange = (event: any) => {
      setFilter(event.detail);
      fetchCadastros(event.detail);
    };

    window.addEventListener("filter-changed", handleFilterChange);
    
    return () => {
      window.removeEventListener("filter-changed", handleFilterChange);
    };
  }, []);

  const fetchCadastros = async (filterType = "all") => {
    setLoading(true);
    
    // TODO: Replace with actual Supabase query when database is set up
    // For now, using mock data that matches the reference image
    const mockData: Cadastro[] = [
      {
        id: "1",
        nome: "Pablo de Arruda Santos",
        email: "pablosantos1990@hotmail.com",
        telefone: "11998208990",
        status: "Inativo",
        data: "21/07/2025"
      },
      {
        id: "2",
        nome: "Rafael Augusto Cerrone",
        email: "rafael_cerrone@hotmail.com",
        telefone: "11973900600",
        status: "Ativo",
        data: "22/06/2025"
      },
      {
        id: "3",
        nome: "Matheus Heron Ferreira dos Santos",
        email: "matheus.heron@hotmail.com.br",
        telefone: "11992391219",
        status: "Inativo",
        data: "10/05/2025"
      },
      {
        id: "4",
        nome: "Daniel Ghinato Seidenthal",
        email: "daniel.seidenthal@gmail.com",
        telefone: "11997928033",
        status: "Ativo",
        data: "10/05/2025"
      }
    ];

    // Apply filter logic
    let filteredData = mockData;
    if (filterType === "last30days") {
      // Mock filtering - in real app would filter by date
      filteredData = mockData.slice(0, 2);
    } else if (filterType === "pending") {
      // Mock filtering - in real app would filter by pending status
      filteredData = mockData.filter(c => c.status === "Inativo");
    }

    setCadastros(filteredData);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    return status === "Ativo" ? "text-green-600" : "text-gray-500";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-black mb-4">Últimos Cadastros</h2>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-black font-medium">NOME</TableHead>
                <TableHead className="text-black font-medium">E-MAIL</TableHead>
                <TableHead className="text-black font-medium">TELEFONE</TableHead>
                <TableHead className="text-black font-medium">STATUS</TableHead>
                <TableHead className="text-black font-medium">DATA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cadastros.map((cadastro) => (
                <TableRow key={cadastro.id} className="hover:bg-[#e3eff0]">
                  <TableCell className="text-black">{cadastro.nome}</TableCell>
                  <TableCell className="text-black">{cadastro.email}</TableCell>
                  <TableCell className="text-black">{cadastro.telefone}</TableCell>
                  <TableCell className={getStatusColor(cadastro.status)}>
                    {cadastro.status}
                  </TableCell>
                  <TableCell className="text-black">{cadastro.data}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};