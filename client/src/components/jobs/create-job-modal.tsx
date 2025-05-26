import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema, type InsertJob } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      employmentType: "full-time",
      experienceLevel: "mid",
      remoteWork: "on-site",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: InsertJob) => {
      const response = await apiRequest('POST', '/api/jobs', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/company'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/agency'] });
      onOpenChange(false);
      reset();
      toast({
        title: "Job posted successfully!",
        description: "Your job posting is now live and accepting applications.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post job",
        description: error.message || "An error occurred while posting the job",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertJob) => {
    createJobMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  if (!user || (user.role !== 'company' && user.role !== 'agency')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Post New Job
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Senior Frontend Developer"
                className="mt-1"
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </Label>
              <Select onValueChange={(value) => setValue("department", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employmentType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Employment Type
              </Label>
              <Select 
                defaultValue="full-time"
                onValueChange={(value) => setValue("employmentType", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience Level
              </Label>
              <Select 
                defaultValue="mid"
                onValueChange={(value) => setValue("experienceLevel", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead/Manager</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                className="mt-1"
                {...register("location")}
              />
            </div>
            
            <div>
              <Label htmlFor="remoteWork" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remote Work
              </Label>
              <Select 
                defaultValue="on-site"
                onValueChange={(value) => setValue("remoteWork", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-site">On-site</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Description
            </Label>
            <Textarea
              id="description"
              rows={6}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="mt-1"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="skills" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Required Skills
            </Label>
            <Input
              id="skills"
              placeholder="e.g., React, TypeScript, Node.js (comma separated)"
              className="mt-1"
              {...register("skills")}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate skills with commas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Salary Range (USD)
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  type="number"
                  placeholder="Min"
                  {...register("salaryMin", { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  {...register("salaryMax", { valueAsNumber: true })}
                />
              </div>
              {(errors.salaryMin || errors.salaryMax) && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter valid salary amounts
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Application Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                className="mt-1"
                {...register("deadline", {
                  setValueAs: (value) => value ? new Date(value) : undefined,
                })}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createJobMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-primary"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
