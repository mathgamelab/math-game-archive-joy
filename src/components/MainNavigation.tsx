import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";

export interface MainNavItem {
  id: string;
  label: string;
  href?: string;
  children?: {
    id: string;
    label: string;
    description: string;
  }[];
}

interface MainNavigationProps {
  items: MainNavItem[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  items,
  activeSection,
  onSectionChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">📐</div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Play Math Archive
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {items.map((item) => {
              if (item.children) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`flex items-center space-x-1 ${
                          activeSection === item.id ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {item.children.map((child) => (
                        <DropdownMenuItem
                          key={child.id}
                          onClick={() => onSectionChange(child.id)}
                          className="flex flex-col items-start p-4 cursor-pointer"
                        >
                          <div className="font-medium">{child.label}</div>
                          <div className="text-sm text-muted-foreground">{child.description}</div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onSectionChange(item.id)}
                  className={`${
                    activeSection === item.id ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {items.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="font-medium text-muted-foreground px-2 py-1">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Button
                          key={child.id}
                          variant="ghost"
                          onClick={() => {
                            onSectionChange(child.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className="justify-start pl-6"
                        >
                          <div className="text-left">
                            <div className="font-medium">{child.label}</div>
                            <div className="text-sm text-muted-foreground">{child.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  );
                }
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}; 