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
import DOMPurify from "dompurify";

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

interface FormErrors {
  nome?: string;
  idade?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  outras_informacoes?: string;
  interesses?: string;
  sentimentos?: string;
  valores?: string;
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
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setErrors({});

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
      });
    }
  }, [customer, isOpen]);


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;

      });
    }
  };

  const sanitizeInput = (input: string) => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        nome: sanitizeInput(formData.nome),
        email: sanitizeInput(formData.email),
        telefone: sanitizeInput(formData.telefone),
        endereco: sanitizeInput(formData.endereco),
        idade: parseInt(formData.idade) || 0,
        interesses: formData.interesses ? sanitizeInput(formData.interesses) : null,
        sentimentos: formData.sentimentos ? sanitizeInput(formData.sentimentos) : null,
        valores: formData.valores ? sanitizeInput(formData.valores) : null,
        outras_informacoes: formData.outras_informacoes ? sanitizeInput(formData.outras_informacoes) : null,
        status: formData.status,
        revisado: customer ? true : false
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
      let errorMessage = `Erro ao ${customer ? 'atualizar' : 'criar'} cliente`;
      let fieldErrors: FormErrors = {};
      if (error.message) {
        // Erro de e-mail duplicado (o mais específico)
        if (error.message.includes('duplicate key value') && error.message.includes('email')) {
          fieldErrors.email = "Este e-mail já está cadastrado.";
        }

        // Erros de CHECK constraint
        if (error.message.includes('nome_length_check')) {
          fieldErrors.nome = "O nome deve ter entre 3 e 100 caracteres.";
        }
        if (error.message.includes('nome_no_digits_check')) {
          fieldErrors.nome = "O nome não pode conter números.";
        }
        if (error.message.includes('idade_range_check')) {
          fieldErrors.idade = "A idade deve ser entre 16 e 100 anos.";
        }
        if (error.message.includes('email_format_check')) {
          fieldErrors.email = "O formato do e-mail é inválido.";
        }
        if (error.message.includes('duplicate key value')) {
          fieldErrors.email = "Este e-mail já está em uso.";
        }
        if (error.message.includes('telefone_format_check')) {
          fieldErrors.telefone = "O formato do telefone é inválido (apenas 10 ou 11 dígitos).";
        }
        if (error.message.includes('outras_informacoes_max_length')) {
          fieldErrors.outras_informacoes = "O campo deve ter no máximo 500 caracteres.";
        }
        if (error.message.includes('interesses_max_length')) {
          fieldErrors.interesses = "O campo deve ter no máximo 500 caracteres.";
        }
        if (error.message.includes('sentimentos_max_length')) {
          fieldErrors.sentimentos = "O campo deve ter no máximo 500 caracteres.";
        }
        if (error.message.includes('valores_max_length')) {
          fieldErrors.valores = "O campo deve ter no máximo 500 caracteres.";
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">

          <div className="flex items-end gap-4">
            <div className="flex-grow space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
                minLength={3}
                maxLength={100}
              />
              {errors.nome && <p className="text-sm text-red-500">{errors.nome} </p>}
            </div>
            <div className="flex items-center space-x-2 pb-2.5">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => handleInputChange('status', checked)}
              />
              <Label htmlFor="status">Ativo</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idade">Idade *</Label>
              <Input
                id="idade"
                type="number"
                value={formData.idade}
                onChange={(e) => handleInputChange('idade', e.target.value)}
                required
              />
              {errors.idade && <p className="text-sm text-red-500 pt-1">{errors.idade} </p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                required
              />
              {errors.telefone && <p className="text-sm text-red-500 pt-1">{errors.telefone}</p>}
            </div>
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
            {errors.email && <p className="text-sm text-red-500 pt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              required
              maxLength={500}
            />
            {errors.endereco && <p className="text-sm text-red-500 pt-1">{errors.endereco}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interesses">Interesses</Label>
            <Textarea
              id="interesses"
              value={formData.interesses}
              onChange={(e) => handleInputChange('interesses', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {errors.interesses && <p className="text-sm text-red-500 pt-1">{errors.interesses}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sentimentos">Sentimentos</Label>
            <Textarea
              id="sentimentos"
              value={formData.sentimentos}
              onChange={(e) => handleInputChange('sentimentos', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {errors.sentimentos && <p className="text-sm text-red-500 pt-1">{errors.sentimentos}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="valores">Valores</Label>
            <Textarea
              id="valores"
              value={formData.valores}
              onChange={(e) => handleInputChange('valores', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {errors.valores && <p className="text-sm text-red-500 pt-1">{errors.valores}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="outras_informacoes">Outras Informações</Label>
            <Textarea
              id="outras_informacoes"
              value={formData.outras_informacoes}
              onChange={(e) => handleInputChange('outras_informacoes', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {errors.outras_informacoes && <p className="text-sm text-red-500 pt-1">{errors.outras_informacoes}</p>}
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