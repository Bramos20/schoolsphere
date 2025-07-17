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
  GraduationCap, 
  Users, 
  Plus,
  Minus,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  School,
  List
} from 'lucide-react';

export default function Classes({ school, classes }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    class_name: '',
    streams: [''],
  });

  const handleStreamChange = (index, value) => {
    const updated = [...data.streams];
    updated[index] = value;
    setData('streams', updated);
  };

  const addStream = () => {
    setData('streams', [...data.streams, '']);
  };

  const removeStream = (index) => {
    const updated = data.streams.filter((_, i) => i !== index);
    setData('streams', updated.length ? updated : ['']);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('classes.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('class_name', 'streams');
        setData('streams', ['']);
        setShowForm(false);
      },
    });
  };

  // Calculate statistics
  const totalClasses = classes.length;
  const totalStreams = classes.reduce((sum, cls) => sum + cls.streams.length, 0);
  const avgStreamsPerClass = totalClasses > 0 ? (totalStreams / totalClasses).toFixed(1) : 0;

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
      <Head title="Class Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600 mt-1">
              Manage classes and streams for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Class'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Classes"
            value={totalClasses}
            icon={GraduationCap}
            color="blue"
            subtitle="Active classes"
          />
          <StatCard
            title="Total Streams"
            value={totalStreams}
            icon={Users}
            color="green"
            subtitle="All streams"
          />
          <StatCard
            title="Average Streams"
            value={avgStreamsPerClass}
            icon={BookOpen}
            color="purple"
            subtitle="Per class"
          />
          <StatCard
            title="School Level"
            value={school?.level || 'N/A'}
            icon={School}
            color="orange"
            subtitle="Education level"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Organize your school structure by creating classes and their corresponding streams for better student management.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Class
              </CardTitle>
              <CardDescription>
                Create a new class with its streams for student organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="class_name">Class Name</Label>
                  <Input
                    id="class_name"
                    placeholder="e.g., Form 1, Grade 5, Class 8"
                    value={data.class_name}
                    onChange={(e) => setData('class_name', e.target.value)}
                  />
                  {errors.class_name && (
                    <p className="text-sm text-red-600">{errors.class_name}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Streams</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addStream}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Stream
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {data.streams.map((stream, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder={`Stream ${index + 1} (e.g., A, B, East, West)`}
                            value={stream}
                            onChange={(e) => handleStreamChange(index, e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStream(index)}
                          disabled={data.streams.length === 1}
                          className="gap-2"
                        >
                          <Minus className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {errors.streams && (
                    <p className="text-sm text-red-600">{errors.streams}</p>
                  )}
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
                        Create Class
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

        {/* Classes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Existing Classes
            </CardTitle>
            <CardDescription>
              All classes and their streams in your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first class with streams
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Class
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {totalClasses} classes with {totalStreams} streams
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {avgStreamsPerClass} avg streams/class
                  </Badge>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Streams Count</TableHead>
                        <TableHead>Stream Names</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-500" />
                              {cls.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {cls.streams.length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {cls.streams.map((stream, index) => (
                                <Badge key={stream.id} variant="secondary" className="text-xs">
                                  {stream.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {cls.created_at ? new Date(cls.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid gap-4">
                  {classes.map((cls) => (
                    <Card key={cls.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <GraduationCap className="h-5 w-5 text-blue-500" />
                          {cls.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {cls.streams.length} streams
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Streams:</p>
                            <div className="flex flex-wrap gap-1">
                              {cls.streams.map((stream) => (
                                <Badge key={stream.id} variant="secondary" className="text-xs">
                                  {stream.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
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