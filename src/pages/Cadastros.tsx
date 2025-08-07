import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CadastrosTable } from "@/components/dashboard/CadastrosTable";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Customer {
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
  status: boolean;
  revisado: boolean;
}

const Cadastros = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const { error } = await supabase
        .from('Customers')
        .delete()
        .eq('id', parseInt(customerToDelete));

      if (error) throw error;

      toast({
        description: "Cliente deletado com sucesso",
        className: "bg-cyan-50 text-cyan-900 border-cyan-200",
      });

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        variant: "destructive",
        description: "Erro ao deletar cliente",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          user={user} 
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">Cadastros</h1>
            <Button 
              onClick={handleNewCustomer}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              NOVO CADASTRO
            </Button>
          </div>
          
          <CadastrosTable 
            showActionsColumn={true}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            searchQuery={searchQuery}
            refreshTrigger={refreshTrigger}
          />
        </main>
      </div>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cadastros;