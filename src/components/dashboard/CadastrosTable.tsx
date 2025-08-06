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
    
    try {
      let query = (supabase as any)
        .from('Customers')
        .select('id, nome, email, telefone, status, created_at')
        .order('created_at', { ascending: false });

      // Apply filter logic
      if (filterType === "last30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      } else if (filterType === "pending") {
        query = query.eq('revisado', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        setCadastros([]);
        return;
      }

      // Transform data to match interface
      const transformedData: Cadastro[] = (data || []).map(customer => ({
        id: customer.id.toString(),
        nome: customer.nome,
        email: customer.email,
        telefone: customer.telefone,
        status: customer.status ? "Ativo" : "Inativo",
        data: new Date(customer.created_at).toLocaleDateString('pt-BR')
      }));

      setCadastros(transformedData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCadastros([]);
    } finally {
      setLoading(false);
    }
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