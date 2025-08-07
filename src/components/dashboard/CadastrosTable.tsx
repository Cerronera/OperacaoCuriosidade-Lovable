import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Cadastro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: "Ativo" | "Inativo";
  data: string;
}

interface PaginatedResponse {
  items: any[];
  totalCount: number;
}

type SortDirection = "asc" | "desc";

export const CadastrosTable = () => {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearchTerm, sortBy, sortDirection]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchCadastros();
  }, [currentPage, filter, debouncedSearchTerm, sortBy, sortDirection]);

  // Listen for filter changes from stats cards
  useEffect(() => {
    const handleFilterChange = (event: any) => {
      setFilter(event.detail);
    };

    window.addEventListener("filter-changed", handleFilterChange);
    
    return () => {
      window.removeEventListener("filter-changed", handleFilterChange);
    };
  }, []);

  const fetchCadastros = async () => {
    setLoading(true);
    
    try {
      // Map filter names to match RPC function expectations
      let filterType = "todos";
      if (filter === "last30days") {
        filterType = "ultimoMes";
      } else if (filter === "pending") {
        filterType = "pendentes";
      }

      const { data, error } = await (supabase as any).rpc('get_paginated_clientes', {
        page_number: currentPage,
        page_size: pageSize,
        filter_type: filterType,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search_term: debouncedSearchTerm || null
      });

      if (error) {
        console.error('Error fetching paginated customers:', error);
        setCadastros([]);
        setTotalCount(0);
        return;
      }

      const response = data as unknown as PaginatedResponse;
      
      // Transform data to match interface
      const transformedData: Cadastro[] = (response.items || []).map(customer => ({
        id: customer.id.toString(),
        nome: customer.nome,
        email: customer.email,
        telefone: customer.telefone,
        status: customer.status ? "Ativo" : "Inativo",
        data: new Date(customer.created_at).toLocaleDateString('pt-BR')
      }));

      setCadastros(transformedData);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error calling RPC function:', error);
      setCadastros([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const getStatusColor = (status: string) => {
    return status === "Ativo" ? "text-green-600" : "text-gray-500";
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">Cadastros de Clientes</h2>
        <div className="w-80">
          <Input
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead 
                    className="text-black font-medium cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort("nome")}
                  >
                    <div className="flex items-center gap-1">
                      NOME
                      {getSortIcon("nome")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-black font-medium cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      E-MAIL
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead className="text-black font-medium">TELEFONE</TableHead>
                  <TableHead 
                    className="text-black font-medium cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      STATUS
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-black font-medium cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      DATA
                      {getSortIcon("created_at")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cadastros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum cadastro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  cadastros.map((cadastro) => (
                    <TableRow key={cadastro.id} className="hover:bg-[#e3eff0]">
                      <TableCell className="text-black">{cadastro.nome}</TableCell>
                      <TableCell className="text-black">{cadastro.email}</TableCell>
                      <TableCell className="text-black">{cadastro.telefone}</TableCell>
                      <TableCell className={getStatusColor(cadastro.status)}>
                        {cadastro.status}
                      </TableCell>
                      <TableCell className="text-black">{cadastro.data}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalCount > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} resultados
              </div>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                      />
                    </PaginationItem>
                    
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      </>
                    )}
                    
                    {renderPaginationItems()}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};