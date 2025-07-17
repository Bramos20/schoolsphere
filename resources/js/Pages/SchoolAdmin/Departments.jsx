import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { 
  Building2, 
  Users, 
  Plus,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  School,
  List,
  Calendar,
  Hash
} from 'lucide-react';

export default function Departments({ school, departments }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('departments.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('name');
        setShowForm(false);
      },
    });
  };

  // Calculate statistics
  const totalDepartments = departments.length;
  const recentDepartments = departments.filter(dept => {
    if (!dept.created_at) return false;
    const created = new Date(dept.created_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return created >= monthAgo;
  }).length;

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <Head title="Department Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600 mt-1">
              Manage academic departments for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Department'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Departments"
            value={totalDepartments}
            icon={Building2}
            color="blue"
            subtitle="Active departments"
          />
          <StatCard
            title="Recent Additions"
            value={recentDepartments}
            icon={Calendar}
            color="green"
            subtitle="Added this month"
          />
          <StatCard
            title="School Type"
            value={school?.type || 'N/A'}
            icon={School}
            color="purple"
            subtitle="Institution type"
          />
          <StatCard
            title="Academic Structure"
            value={totalDepartments > 0 ? 'Organized' : 'Setup Required'}
            icon={BookOpen}
            color="orange"
            subtitle="Department status"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Departments help organize your school's academic structure. Create departments to group subjects and manage teachers efficiently.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Department
              </CardTitle>
              <CardDescription>
                Create a new academic department for better organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mathematics, Science, Languages, Arts"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Choose a clear, descriptive name for the department
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={processing}
                    className="gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Create Department
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Departments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Existing Departments
            </CardTitle>
            <CardDescription>
              All academic departments in your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first department to organize your school structure
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Department
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {totalDepartments} departments
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    {recentDepartments} added recently
                  </Badge>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Name</TableHead>
                        <TableHead>Department ID</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              {dept.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-gray-400" />
                              <span className="text-sm font-mono">{dept.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid gap-4">
                  {departments.map((dept) => (
                    <Card key={dept.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Building2 className="h-5 w-5 text-blue-500" />
                          {dept.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-gray-400" />
                              <span className="text-sm font-mono text-gray-600">ID: {dept.id}</span>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          </div>
                          {dept.created_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Created: {new Date(dept.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}