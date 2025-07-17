import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/Components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { 
  BookOpen, 
  Plus,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Building,
  Trash2,
  GraduationCap
} from 'lucide-react';

export default function Subjects({ school, departments, subjects }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    department_id: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('subjects.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('name', 'department_id');
        setShowForm(false);
      },
    });
  };

  const deleteSubject = (id) => {
    if (confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      router.delete(route('subjects.destroy', id));
    }
  };

  // Calculate statistics
  const totalSubjects = subjects.length;
  const subjectsWithDepartments = subjects.filter(s => s.department).length;
  const subjectsWithoutDepartments = subjects.filter(s => !s.department).length;
  const departmentsWithSubjects = [...new Set(subjects.filter(s => s.department).map(s => s.department.id))].length;

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
      <Head title="Subjects Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
            <p className="text-gray-600 mt-1">
              Manage academic subjects for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Subject'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Subjects"
            value={totalSubjects}
            icon={BookOpen}
            color="blue"
            subtitle="All subjects"
          />
          <StatCard
            title="With Departments"
            value={subjectsWithDepartments}
            icon={Building}
            color="green"
            subtitle="Assigned to departments"
          />
          <StatCard
            title="Without Departments"
            value={subjectsWithoutDepartments}
            icon={GraduationCap}
            color="orange"
            subtitle="Unassigned subjects"
          />
          <StatCard
            title="Active Departments"
            value={departmentsWithSubjects}
            icon={Users}
            color="purple"
            subtitle="Departments with subjects"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Subjects can be assigned to departments for better organization. You can also create subjects without departments if needed.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Subject
              </CardTitle>
              <CardDescription>
                Create a new subject for your school curriculum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Mathematics, English, Science"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department (Optional)</Label>
                    <Select 
                      value={data.department_id} 
                      onValueChange={(val) => setData('department_id', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department_id && (
                      <p className="text-sm text-red-600">{errors.department_id}</p>
                    )}
                  </div>
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
                        Create Subject
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

        {/* Subjects Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Subjects
            </CardTitle>
            <CardDescription>
              Manage and organize your school subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first subject
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Subject
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {subjects.length} subjects
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Building className="h-3 w-3" />
                      {subjectsWithDepartments} with departments
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {subjectsWithoutDepartments} independent
                    </Badge>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              {subject.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {subject.department ? (
                              <Badge variant="outline" className="gap-1">
                                <Building className="h-3 w-3" />
                                {subject.department.name}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 italic">No department</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteSubject(subject.id)}
                              className="gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}