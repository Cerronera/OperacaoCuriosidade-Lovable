import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { UserPlus } from "lucide-react";

interface UserProfile {
  id: string;
  nome: string;
  role: string;
  created_at: string;
  email?: string;
}

const Gerencia = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        variant: "destructive",
        description: "Erro ao carregar usuários"
      });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session?.user);

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

          if (error) throw error;

          setUserProfiles(data || []);
        } catch (error) {
          console.error('Error fetching profiles:', error);
          toast({
            variant: "destructive",
            description: "Erro ao carregar usuários"
          });
        }
      } else {
        setUser(null);
        setUserProfiles([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfiles]);


  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: newUserFullName
          }
        }
      });

      if (error) throw error;

      toast({
        description: "Usuário criado com sucesso"
      });

      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Erro ao criar usuário"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        user_id_param: userId,
        new_role_param: newRole
      });

      if (error) throw error;

      toast({
        description: "Papel do usuário atualizado com sucesso"
      });

      fetchProfiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Erro ao atualizar papel do usuário"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1" >
          <Header user={user} />
          <main className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gerência</h1>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Nome Completo</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={newUserFullName}
                          onChange={(e) => setNewUserFullName(e.target.value)}
                          required
                          className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                          className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          required
                          minLength={6}
                          className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsModalOpen(false)}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {submitting ? "Criando..." : "Criar Usuário"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-gray-700 dark:text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Papel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProfiles.map((profile) => (
                      <TableRow key={profile.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="text-gray-900 dark:text-white">
                          {profile.nome || 'Nome não informado'}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          {profile.email}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={profile.role}
                            onValueChange={(value) => handleRoleChange(profile.id, value)}
                          >
                            <SelectTrigger className="w-40 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <SelectItem value="Colaborador" className="text-black dark:text-white">Colaborador</SelectItem>
                              <SelectItem value="Administrator" className="text-black dark:text-white">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Gerencia;