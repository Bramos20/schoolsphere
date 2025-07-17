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
  Users, 
  Plus,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  GraduationCap,
  Trash2,
  UserCheck,
  School,
  ChevronRight
} from 'lucide-react';

export default function SubjectStreamTeacher({ school, subjects, streams, teachers, assignments }) {
  const [showForm, setShowForm] = useState(false);
  
  const { delete: destroy, processing: deleteProcessing } = useForm();

  const form = useForm({
    subject_id: '',
    stream_id: '',
    teacher_id: ''
  });

  const handleChange = (key, value) => {
    form.setData(key, value);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    form.post(route('subject-stream-teachers.assign', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        form.reset();
        setShowForm(false);
      }
    });
  };

  const handleUnassign = (assignment) => {
    if (confirm('Are you sure you want to remove this teacher assignment?')) {
      destroy(route('subject-stream-teachers.unassign', school.id), {
        preserveScroll: true,
        data: {
          teacher_id: assignment.teacher_id,
          subject_id: assignment.subject_id,
          stream_id: assignment.stream_id,
        }
      });
    }
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const uniqueTeachers = [...new Set(assignments.map(a => a.teacher_id))].length;
  const uniqueSubjects = [...new Set(assignments.map(a => a.subject_id))].length;
  const uniqueStreams = [...new Set(assignments.map(a => a.stream_id))].length;

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
      <Head title="Teacher Subject Assignments" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Subject Assignments</h1>
            <p className="text-gray-600 mt-1">
              Assign teachers to subjects in specific streams for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'New Assignment'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assignments"
            value={totalAssignments}
            icon={UserCheck}
            color="blue"
            subtitle="Active assignments"
          />
          <StatCard
            title="Active Teachers"
            value={uniqueTeachers}
            icon={Users}
            color="green"
            subtitle="Teachers with assignments"
          />
          <StatCard
            title="Subjects Assigned"
            value={uniqueSubjects}
            icon={BookOpen}
            color="purple"
            subtitle="Subjects being taught"
          />
          <StatCard
            title="Streams Covered"
            value={uniqueStreams}
            icon={School}
            color="orange"
            subtitle="Streams with teachers"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Each assignment links a teacher to a specific subject in a particular stream. Teachers can be assigned to multiple subjects and streams.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Assignment
              </CardTitle>
              <CardDescription>
                Assign a teacher to teach a specific subject in a particular stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssign} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject_id">Subject</Label>
                    <Select 
                      value={form.data.subject_id} 
                      onValueChange={(value) => handleChange('subject_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={String(subject.id)}>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.subject_id && (
                      <p className="text-sm text-red-600">{form.errors.subject_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream_id">Stream</Label>
                    <Select 
                      value={form.data.stream_id} 
                      onValueChange={(value) => handleChange('stream_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {streams.map((stream) => (
                          <SelectItem key={stream.id} value={String(stream.id)}>
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              {stream.class?.name} - {stream.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.stream_id && (
                      <p className="text-sm text-red-600">{form.errors.stream_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacher_id">Teacher</Label>
                    <Select 
                      value={form.data.teacher_id} 
                      onValueChange={(value) => handleChange('teacher_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={String(teacher.id)}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {teacher.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.teacher_id && (
                      <p className="text-sm text-red-600">{form.errors.teacher_id}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={form.processing}
                    className="gap-2"
                  >
                    {form.processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Create Assignment
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

        {/* Assignments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Current Assignments
            </CardTitle>
            <CardDescription>
              All active teacher-subject-stream assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first teacher-subject assignment
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {assignments.length} assignments
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {uniqueTeachers} teachers
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {uniqueSubjects} subjects
                    </Badge>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={`${assignment.subject_id}-${assignment.stream_id}-${assignment.teacher_id}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              {assignment.teacher.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <BookOpen className="h-3 w-3" />
                              {assignment.subject.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="gap-1">
                                <School className="h-3 w-3" />
                                {assignment.stream.class.name}
                              </Badge>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                              <Badge variant="outline">
                                {assignment.stream.name}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleUnassign(assignment)}
                              disabled={deleteProcessing}
                              className="gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
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