import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { CreateJobModal } from "@/components/jobs/create-job-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Briefcase, 
  Handshake, 
  Building, 
  Plus,
  UserPlus,
  Search,
  TrendingUp,
  Star,
  MapPin
} from "lucide-react";

export default function AgencyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateJob, setShowCreateJob] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    } else if (user?.role !== 'agency') {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/agency'],
    enabled: !!user && user.role === 'agency',
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['/api/agency-candidates'],
    enabled: !!user && user.role === 'agency',
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/my-jobs'],
    enabled: !!user && user.role === 'agency',
  });

  if (!isAuthenticated || user?.role !== 'agency') {
    return null;
  }

  const getCandidateStatusBadge = (status: string) => {
    const statusMap = {
      available: { variant: "default" as const, label: "Available", className: "status-active" },
      interviewing: { variant: "default" as const, label: "Interviewing", className: "status-interview" },
      placed: { variant: "default" as const, label: "Placed", className: "status-hired" },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const handleAddCandidate = () => {
    // This would open an add candidate modal
    alert('Add Candidate functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Agency Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your candidate pool and job placements
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={handleAddCandidate}
              className="btn-accent"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
            <Button 
              onClick={() => setShowCreateJob(true)}
              className="btn-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                  <Users className="text-accent text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Candidate Pool
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.candidatePool || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <Briefcase className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Active Placements
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.activePlacements || 0}
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
                  <Handshake className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Successful Placements
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.successfulPlacements || 0}
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
                  <Building className="text-warning text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Partner Companies
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.partnerCompanies || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Pool */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Candidate Pool</CardTitle>
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
                {candidatesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : candidates && candidates.length > 0 ? (
                  <div className="space-y-4">
                    {candidates.map((candidateItem: any) => (
                      <div
                        key={candidateItem.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:border-primary/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <Users className="text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {candidateItem.candidate?.name || 'Candidate Name'}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">
                                {candidateItem.specialization || 'Specialization'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {candidateItem.experience || 'Experience level'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getCandidateStatusBadge(candidateItem.status)}
                            <Button variant="ghost" size="sm">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              Location TBD
                            </span>
                            <span className="flex items-center">
                              <Star className="mr-1 h-4 w-4" />
                              {candidateItem.rating || 0}/5 rating
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                            <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                              Recommend
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No candidates in your pool yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Start building your candidate pool by adding talented individuals.
                    </p>
                    <div className="mt-6">
                      <Button onClick={handleAddCandidate}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Your First Candidate
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Postings */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Job Postings</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
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
                              For: Client Company
                            </p>
                          </div>
                          <Badge className="status-active">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Briefcase className="mr-1 h-4 w-4" />
                              Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {Math.floor(Math.random() * 8) + 2} recommended
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            Manage
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
                      Post jobs to connect your candidates with opportunities.
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
            {/* Recent Placements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Placements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent placements to display.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Placement Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats?.successfulPlacements && stats?.candidatePool ? 
                        Math.round((stats.successfulPlacements / stats.candidatePool) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Time to Place</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">12 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Client Satisfaction</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">4.7/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Revenue</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">$24,500</span>
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
                  onClick={handleAddCandidate}
                  className="w-full btn-accent"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
                <Button variant="outline" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Find Opportunities
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports
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
