import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Briefcase, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Building,
  GraduationCap,
  Users
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'company':
        return <Building className="h-4 w-4 text-white" />;
      case 'agency':
        return <GraduationCap className="h-4 w-4 text-white" />;
      default:
        return <User className="h-4 w-4 text-white" />;
    }
  };

  const getRoleName = () => {
    switch (user.role) {
      case 'company':
        return user.companyName || user.name;
      case 'agency':
        return user.agencyName || user.name;
      default:
        return user.name;
    }
  };

  const getDashboardPath = () => {
    switch (user.role) {
      case 'company':
        return '/company-dashboard';
      case 'agency':
        return '/agency-dashboard';
      default:
        return '/candidate-dashboard';
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => setLocation(getDashboardPath())}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Briefcase className="text-primary text-2xl mr-3" />
              <span className="text-gray-900 dark:text-white text-xl font-bold">
                JobPortal Pro
              </span>
            </button>
          </div>

          {/* Navigation Links - can be expanded based on role */}
          <div className="hidden md:flex items-center space-x-6">
            {user.role === 'candidate' && (
              <>
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Browse Jobs
                </Button>
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  My Applications
                </Button>
              </>
            )}
            
            {(user.role === 'company' || user.role === 'agency') && (
              <>
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  My Jobs
                </Button>
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Applications
                </Button>
              </>
            )}

            {user.role === 'agency' && (
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Candidates
              </Button>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:block text-gray-700 dark:text-gray-300">
              Welcome, <span className="font-medium">{getRoleName()}</span>
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    {getRoleIcon()}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation(getDashboardPath())}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                
                {user.role === 'company' && (
                  <DropdownMenuItem>
                    <Building className="mr-2 h-4 w-4" />
                    Company Profile
                  </DropdownMenuItem>
                )}
                
                {user.role === 'agency' && (
                  <DropdownMenuItem>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Agency Profile
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
