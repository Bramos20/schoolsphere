import React from 'react';
import { Head, router } from '@inertiajs/react';
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
  AlertTriangle, 
  Download,
  Users,
  AlertCircle,
  Info,
  DollarSign,
  Filter,
  Calendar,
  GraduationCap,
  School,
  FileText
} from 'lucide-react';

export default function DefaultersReport({
  school,
  students,
  year,
  term,
  class_id,
  stream_id,
  classes,
  streams
}) {
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  const handleFilterChange = (key, value) => {
    const query = {
      term,
      year,
      class_id,
      stream_id,
      [key]: value,
    };

    router.get(route('defaulters.index', school.id), query, { preserveScroll: true });
  };

  const handlePdfDownload = () => {
    const url = route('defaulters.exportPdf', school.id)
      + `?term=${term}&year=${year}&class_id=${class_id || ''}&stream_id=${stream_id || ''}`;
    window.open(url, '_blank');
  };

  // Calculate statistics
  const totalDefaulters = students.length;
  const totalExpected = students.reduce((sum, s) => sum + Number(s.expected), 0);
  const totalPaid = students.reduce((sum, s) => sum + Number(s.paid), 0);
  const totalBalance = students.reduce((sum, s) => sum + Number(s.balance), 0);

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
      <Head title="Defaulters Report" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Defaulters Report</h1>
            <p className="text-gray-600 mt-1">
              Track outstanding fee payments for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={handlePdfDownload}
            className="gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Defaulters"
            value={totalDefaulters}
            icon={AlertTriangle}
            color="red"
            subtitle="Students with outstanding fees"
          />
          <StatCard
            title="Total Expected"
            value={`KES ${totalExpected.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
            subtitle="Total fees expected"
          />
          <StatCard
            title="Total Paid"
            value={`KES ${totalPaid.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="Amount collected"
          />
          <StatCard
            title="Outstanding Balance"
            value={`KES ${totalBalance.toLocaleString()}`}
            icon={AlertCircle}
            color="orange"
            subtitle="Amount still owed"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This report shows students with outstanding fee balances. Use the filters below to narrow down your search by term, year, class, or stream.
          </AlertDescription>
        </Alert>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Filter the defaulters report by term, year, class, and stream
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Select 
                  value={term} 
                  onValueChange={(value) => handleFilterChange('term', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map(t => (
                      <SelectItem key={t} value={t}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={String(year)} 
                  onValueChange={(value) => handleFilterChange('year', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={class_id || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('class_id', value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        All Classes
                      </div>
                    </SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          {cls.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                <Select
                  value={stream_id || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('stream_id', value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        All Streams
                      </div>
                    </SelectItem>
                    {streams.map(stream => (
                      <SelectItem key={stream.id} value={String(stream.id)}>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          {stream.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-transparent">Action</Label>
                <Button 
                  onClick={handlePdfDownload}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Filters Display */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Current Filters:</span>
              <Badge variant="secondary">{term}</Badge>
              <Badge variant="secondary">{year}</Badge>
              {class_id && (
                <Badge variant="outline">
                  Class: {classes.find(c => c.id === parseInt(class_id))?.name}
                </Badge>
              )}
              {stream_id && (
                <Badge variant="outline">
                  Stream: {streams.find(s => s.id === parseInt(stream_id))?.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Defaulters List
            </CardTitle>
            <CardDescription>
              Students with outstanding fee balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No defaulters found</h3>
                <p className="text-gray-600 mb-4">
                  Great news! No students have outstanding fees for the selected filters.
                </p>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  All fees are up to date
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {students.length} students with outstanding fees
                    </span>
                  </div>
                  <Badge variant="destructive" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    KES {totalBalance.toLocaleString()} owed
                  </Badge>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead className="text-right">Expected</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              {student.student_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {student.class_name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {student.stream_name ? (
                              <Badge variant="secondary" className="gap-1">
                                <School className="h-3 w-3" />
                                {student.stream_name}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 italic">No stream</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className="text-blue-600">
                              KES {Number(student.expected).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className="text-green-600">
                              KES {Number(student.paid).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className="text-red-600">
                              KES {Number(student.balance).toLocaleString()}
                            </span>
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