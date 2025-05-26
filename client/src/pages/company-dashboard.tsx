import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { CreateJobModal } from "@/components/jobs/create-job-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { 
  Briefcase, 
  Users, 
  Clock, 
  Calendar, 
  Plus,
  Edit,
  Eye,
  BarChart
} from "lucide-react";

export default function CompanyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateJob, setShowCreateJob] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    } else if (user?.role !== 'company') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/company'],
    enabled: !!user && user.role === 'company',
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/my-jobs'],
    enabled: !!user && user.role === 'company',
  });

  if (!isAuthenticated || user?.role !== 'company') {
    return null;
  }

  const getJobStatusBadge = (status: string) => {
    const statusMap = {
      active: { variant: "default" as const, label: "Active", className: "status-active" },
      paused: { variant: "secondary" as const, label: "Paused", className: "status-pending" },
      closed: { variant: "destructive" as const, label: "Closed", className: "status-rejected" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Company Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your job postings and review candidates
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateJob(true)}
            className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <Briefcase className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Active Jobs
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.activeJobs || 0}
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
                  <Users className="text-accent text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Applications
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalApplications || 0}
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
                    Pending Reviews
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.pendingReviews || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                  <Calendar className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Interviews This Week
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
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Postings List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Job Postings</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      Filter
                    </Button>
                    <Button variant="ghost" size="sm">
                      Sort
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job: any) => (
                      <div
                        key={job.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:border-primary/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              {job.department || 'General'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getJobStatusBadge(job.status)}
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {Math.floor(Math.random() * 30) + 5} applications
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Applications
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No job postings yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Start by posting your first job opening.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowCreateJob(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Post Your First Job
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* This would be populated with real data */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent applications to display.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  View All Applications
                </Button>
              </CardContent>
            </Card>

            {/* Hiring Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Hiring Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Applications</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats?.totalApplications || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Phone Screens</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor((stats?.totalApplications || 0) * 0.3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Interviews</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats?.interviews || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Offers</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor((stats?.totalApplications || 0) * 0.05)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowCreateJob(true)}
                  className="w-full btn-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Candidates
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateJobModal 
        open={showCreateJob} 
        onOpenChange={setShowCreateJob}
      />
    </div>
  );
}
