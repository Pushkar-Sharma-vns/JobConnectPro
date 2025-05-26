import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, 
  Calendar, 
  Clock, 
  Trophy, 
  Search, 
  UserPen, 
  Upload,
  Eye,
  CalendarCheck
} from "lucide-react";

export default function CandidateDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    } else if (user?.role !== 'candidate') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/candidate'],
    enabled: !!user && user.role === 'candidate',
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/my-applications'],
    enabled: !!user && user.role === 'candidate',
  });

  if (!isAuthenticated || user?.role !== 'candidate') {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "secondary" as const, label: "Pending" },
      reviewed: { variant: "default" as const, label: "Under Review" },
      interview: { variant: "default" as const, label: "Interview Scheduled" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
      hired: { variant: "default" as const, label: "Hired" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge variant={statusInfo.variant} className={
        status === 'interview' ? 'status-interview' :
        status === 'hired' ? 'status-hired' :
        status === 'rejected' ? 'status-rejected' :
        status === 'reviewed' ? 'status-pending' : ''
      }>
        {statusInfo.label}
      </Badge>
    );
  };

  const upcomingInterviews = applications?.filter((app: any) => 
    app.status === 'interview' && app.interviewDate
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Candidate Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your job applications and interview progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <Send className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Applications Sent
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.applications || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                  <CalendarCheck className="text-accent text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Interviews Scheduled
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.interviews || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
                  <Clock className="text-warning text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pending Responses
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.pending || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                  <Trophy className="text-accent text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Profile Views
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.views || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Applications</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <div
                        key={application.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:border-primary/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {application.job?.title || 'Job Title'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              {application.job?.department || 'Company Name'}
                            </p>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                          {application.interviewDate && (
                            <span className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              Interview: {new Date(application.interviewDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Send className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No applications yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Start applying to jobs to see your applications here.
                    </p>
                    <div className="mt-6">
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Browse Jobs
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-primary">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Jobs
                </Button>
                <Button variant="outline" className="w-full">
                  <UserPen className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingInterviews.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingInterviews.map((interview: any) => (
                      <div key={interview.id} className="border-l-4 border-primary pl-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {interview.job?.title || 'Job Title'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {interview.job?.department || 'Company'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="inline mr-1 h-3 w-3" />
                          {interview.interviewDate ? 
                            new Date(interview.interviewDate).toLocaleDateString() : 
                            'Date TBD'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No upcoming interviews scheduled.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>Profile Strength</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add skills and experience to improve your profile visibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
