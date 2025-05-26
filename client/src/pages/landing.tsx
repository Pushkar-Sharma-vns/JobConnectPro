import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { SignupModal } from "@/components/auth/signup-modal";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Users, Building, GraduationCap } from "lucide-react";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      switch (user.role) {
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
    }
  }, [user, setLocation]);

  const handleSignupClick = (userType?: string) => {
    setSelectedUserType(userType || null);
    setShowSignup(true);
  };

  const features = [
    {
      icon: Users,
      title: "For Candidates",
      description: "Track applications, manage interviews, and build your professional profile.",
      color: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-primary"
    },
    {
      icon: Building,
      title: "For Companies",
      description: "Post jobs, manage applications, and find the perfect candidates for your team.",
      color: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-accent"
    },
    {
      icon: GraduationCap,
      title: "For Institutions",
      description: "Manage candidate pools and connect students with career opportunities.",
      color: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="text-white text-2xl mr-3" />
              <span className="text-white text-xl font-bold">JobPortal Pro</span>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowLogin(true)}
                className="text-white hover:text-blue-200 hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleSignupClick()}
                className="bg-white text-primary hover:bg-blue-50"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Connect Talent with Opportunity
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            The comprehensive job portal for candidates, companies, and educational institutions. 
            Streamline your hiring process with our professional platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleSignupClick('candidate')}
              className="bg-white text-primary hover:bg-blue-50 px-8 py-4 text-lg"
            >
              <Users className="mr-2 h-5 w-5" />
              Find Jobs
            </Button>
            <Button
              onClick={() => handleSignupClick('company')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg bg-transparent"
            >
              <Building className="mr-2 h-5 w-5" />
              Post Jobs
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-6 transition-all card-hover"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                  <IconComponent className={`text-xl ${feature.iconColor}`} />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
      />
      <SignupModal 
        open={showSignup} 
        onOpenChange={setShowSignup}
        initialUserType={selectedUserType}
      />
    </div>
  );
}
