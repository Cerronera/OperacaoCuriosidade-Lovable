import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CadastrosTable } from "@/components/dashboard/CadastrosTable";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PrintCadastro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  idade: number;
  interesses?: string;
  sentimentos?: string;
  valores?: string;
  outras_informacoes?: string;
  status: "Ativo" | "Inativo";
  revisado: boolean;
  data: string;
}

const Relatorios = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [printData, setPrintData] = useState<PrintCadastro[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  const handlePrint = async () => {
    setIsPrinting(true);
    
    try {
      // Get current filter from localStorage or default to 'all'
      const currentFilter = localStorage.getItem('dashboard-filter') || 'all';
      
      // Map filter names to match RPC function expectations
      let filterType = "todos";
      if (currentFilter === "last30days") {
        filterType = "ultimoMes";
      } else if (currentFilter === "pending") {
        filterType = "pendentes";
      }

      // Fetch ALL records for printing
      const { data, error } = await (supabase as any).rpc('get_paginated_clientes', {
        page_number: 1,
        page_size: 10000, // Large number to get all records
        filter_type: filterType,
        sort_by: "nome",
        sort_direction: "asc",
        search_term: searchQuery || null
      });

      if (error) {
        console.error('Error fetching print data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados para impressão.",
          className: "bg-red-500 text-white",
        });
        return;
      }

      const response = data as { items: any[]; totalCount: number };
      
      // Transform data for printing
      const transformedData: PrintCadastro[] = (response.items || []).map(customer => ({
        id: customer.id.toString(),
        nome: customer.nome,
        email: customer.email,
        telefone: customer.telefone,
        endereco: customer.endereco,
        idade: customer.idade,
        interesses: customer.interesses,
        sentimentos: customer.sentimentos,
        valores: customer.valores,
        outras_informacoes: customer.outras_informacoes,
        status: customer.status ? "Ativo" : "Inativo",
        revisado: customer.revisado,
        data: new Date(customer.created_at).toLocaleDateString('pt-BR')
      }));

      setPrintData(transformedData);
      
      // Wait for data to be set, then trigger print
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);

    } catch (error) {
      console.error('Error preparing print data:', error);
      toast({
        title: "Erro",
        description: "Erro ao preparar dados para impressão.",
        className: "bg-red-500 text-white",
      });
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={null} onSearchChange={setSearchQuery} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 no-print">
              <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
              <Button 
                onClick={handlePrint}
                disabled={isPrinting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                {isPrinting ? "Preparando..." : "Imprimir"}
              </Button>
            </div>
            
            {/* Regular table view */}
            <div className="print-hidden">
              <CadastrosTable 
                showActionsColumn={false}
                searchQuery={searchQuery}
              />
            </div>

            {/* Print-only table */}
            {isPrinting && printData.length > 0 && (
              <div className="print-only">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-center">Relatório de Cadastros</h2>
                  <p className="text-sm text-center text-gray-600">
                    Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium">NOME</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium">E-MAIL</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium">TELEFONE</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium">STATUS</th>
                      <th className="border border-gray-300 px-2 py-1 text-left text-xs font-medium">DATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printData.map((cadastro) => (
                      <tr key={cadastro.id}>
                        <td className="border border-gray-300 px-2 py-1 text-xs">{cadastro.nome}</td>
                        <td className="border border-gray-300 px-2 py-1 text-xs">{cadastro.email}</td>
                        <td className="border border-gray-300 px-2 py-1 text-xs">{cadastro.telefone}</td>
                        <td className="border border-gray-300 px-2 py-1 text-xs">{cadastro.status}</td>
                        <td className="border border-gray-300 px-2 py-1 text-xs">{cadastro.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-4 text-xs text-center text-gray-600">
                  Total de registros: {printData.length}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Relatorios;