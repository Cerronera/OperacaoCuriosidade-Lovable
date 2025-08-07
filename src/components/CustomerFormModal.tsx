import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

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

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSubmit: () => void;
}

export const CustomerFormModal = ({ isOpen, onClose, customer, onSubmit }: CustomerFormModalProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    idade: "",
    interesses: "",
    sentimentos: "",
    valores: "",
    outras_informacoes: "",
    status: true,
    revisado: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        nome: customer.nome || "",
        email: customer.email || "",
        telefone: customer.telefone || "",
        endereco: customer.endereco || "",
        idade: customer.idade?.toString() || "",
        interesses: customer.interesses || "",
        sentimentos: customer.sentimentos || "",
        valores: customer.valores || "",
        outras_informacoes: customer.outras_informacoes || "",
        status: customer.status,
        revisado: customer.revisado,
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        idade: "",
        interesses: "",
        sentimentos: "",
        valores: "",
        outras_informacoes: "",
        status: true,
        revisado: false,
      });
    }
  }, [customer]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        idade: parseInt(formData.idade) || 0,
        interesses: formData.interesses || null,
        sentimentos: formData.sentimentos || null,
        valores: formData.valores || null,
        outras_informacoes: formData.outras_informacoes || null,
        status: formData.status,
        revisado: formData.revisado,
      };

      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from('Customers')
          .update(data)
          .eq('id', parseInt(customer.id));

        if (error) throw error;

        toast({
          description: "Cliente atualizado com sucesso",
          className: "bg-cyan-50 text-cyan-900 border-cyan-200",
        });
      } else {
        // Create new customer
        const { error } = await supabase
          .from('Customers')
          .insert([data]);

        if (error) throw error;

        toast({
          description: "Cliente criado com sucesso",
          className: "bg-cyan-50 text-cyan-900 border-cyan-200",
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        variant: "destructive",
        description: `Erro ao ${customer ? 'atualizar' : 'criar'} cliente`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idade">Idade *</Label>
              <Input
                id="idade"
                type="number"
                value={formData.idade}
                onChange={(e) => handleInputChange('idade', e.target.value)}
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interesses">Interesses</Label>
            <Textarea
              id="interesses"
              value={formData.interesses}
              onChange={(e) => handleInputChange('interesses', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sentimentos">Sentimentos</Label>
            <Textarea
              id="sentimentos"
              value={formData.sentimentos}
              onChange={(e) => handleInputChange('sentimentos', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valores">Valores</Label>
            <Textarea
              id="valores"
              value={formData.valores}
              onChange={(e) => handleInputChange('valores', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outras_informacoes">Outras Informações</Label>
            <Textarea
              id="outras_informacoes"
              value={formData.outras_informacoes}
              onChange={(e) => handleInputChange('outras_informacoes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => handleInputChange('status', checked)}
              />
              <Label htmlFor="status">Ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="revisado"
                checked={formData.revisado}
                onCheckedChange={(checked) => handleInputChange('revisado', checked)}
              />
              <Label htmlFor="revisado">Revisado</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (customer ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};