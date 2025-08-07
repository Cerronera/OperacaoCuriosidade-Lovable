import { Search, Sun, Moon, User, LogOut, UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  user: any;
  onSearchChange?: (query: string) => void;
}

export const Header = ({ user, onSearchChange }: HeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        description: "Logout realizado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erro ao fazer logout",
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual theme switching
  };

  return (
    <header className="bg-white rounded-lg m-4 mb-0 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="pl-10 border-gray-200"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-[#e3eff0]"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-black" />
            ) : (
              <Moon className="w-5 h-5 text-black" />
            )}
          </Button>

          {/* New Administrator Button */}
          <Button 
            variant="outline" 
            className="text-black border-gray-200 hover:bg-[#e3eff0]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Administrador
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-[#e3eff0] text-black"
              >
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem className="text-black">
                <User className="w-4 h-4 mr-2" />
                Administrador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-black">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};