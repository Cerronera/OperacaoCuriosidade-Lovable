import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          description: "Invalid email or password",
        });
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-full border-4 border-cyan-400 flex items-center justify-center bg-background">
              <span className="text-2xl font-bold text-foreground">OC</span>
            </div>
            <span className="text-sm text-muted-foreground">Operação Curiosidade</span>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">LOGIN</h1>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90"
              disabled={loading}
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
