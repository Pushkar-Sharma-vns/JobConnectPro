import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Building, GraduationCap } from "lucide-react";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
  initialUserType?: string | null;
}

export function SignupModal({ 
  open, 
  onOpenChange, 
  onSwitchToLogin,
  initialUserType 
}: SignupModalProps) {
  const [selectedUserType, setSelectedUserType] = useState<string>(initialUserType || 'candidate');
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      role: 'candidate' as const,
    },
  });

  useEffect(() => {
    if (initialUserType) {
      setSelectedUserType(initialUserType);
      setValue('role', initialUserType as any);
    }
  }, [initialUserType, setValue]);

  const signupMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      onOpenChange(false);
      reset();
      
      // Redirect to appropriate dashboard
      switch (data.user.role) {
        case 'candidate':
          setLocation('/candidate-dashboard');
          break;
        case 'company':
          setLocation('/company-dashboard');
          break;
        case 'agency':
          setLocation('/agency-dashboard');
          break;
      }
      
      toast({
        title: "Welcome to JobPortal Pro!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    signupMutation.mutate(data);
  };

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setValue('role', type as any);
  };

  const handleSwitchToLogin = () => {
    onOpenChange(false);
    onSwitchToLogin?.();
  };

  const userTypes = [
    {
      type: 'candidate',
      icon: Users,
      label: 'Candidate',
      description: 'Find and apply for jobs',
    },
    {
      type: 'company',
      icon: Building,
      label: 'Company',
      description: 'Post jobs and hire candidates',
    },
    {
      type: 'agency',
      icon: GraduationCap,
      label: 'Agency',
      description: 'Manage candidate pools',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </DialogTitle>
        </DialogHeader>
        
        {/* User Type Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
            I am a:
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {userTypes.map((userType) => {
              const IconComponent = userType.icon;
              return (
                <button
                  key={userType.type}
                  type="button"
                  onClick={() => handleUserTypeSelect(userType.type)}
                  className={`border-2 rounded-lg p-3 text-center transition-all ${
                    selectedUserType === userType.type
                      ? 'border-primary bg-blue-50 dark:bg-blue-900/30 text-primary'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <IconComponent className="mx-auto mb-1 h-5 w-5" />
                  <span className="text-xs font-medium block">{userType.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("role")} />
          
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedUserType === 'candidate' ? 'Full Name' : 
               selectedUserType === 'company' ? 'Company Name' : 'Agency Name'}
            </Label>
            <Input
              id="name"
              placeholder={`Enter your ${selectedUserType === 'candidate' ? 'full name' : 
                selectedUserType === 'company' ? 'company name' : 'agency name'}`}
              className="mt-1"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {selectedUserType === 'company' && (
            <div>
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="Enter your company name"
                className="mt-1"
                {...register("companyName")}
              />
            </div>
          )}

          {selectedUserType === 'agency' && (
            <div>
              <Label htmlFor="agencyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Agency/College Name
              </Label>
              <Input
                id="agencyName"
                placeholder="Enter your agency or college name"
                className="mt-1"
                {...register("agencyName")}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="mt-1"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              className="mt-1"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="mt-1"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={handleSwitchToLogin}
              className="text-primary hover:underline p-0"
            >
              Sign in
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
