import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Users, TrendingUp, Award, BarChart3, Filter, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExamSeriesTermReports({ school, examSeries }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStream, setSelectedStream] = useState('');

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTermLabel = (term) => {
        const termLabels = {
            '1': 'Term 1',
            '2': 'Term 2', 
            '3': 'Term 3'
        };
        return termLabels[term] || `Term ${term}`;
    };

    // Mock data for student summaries - in real app this would come from backend
    const studentSummaries = [
        {
            id: 1,
            student: { name: 'John Doe', admission_number: 'ADM001' },
            class: { name: 'Form 1' },
            stream: { name: 'A' },
            total_subjects: 8,
            total_points: 64,
            average_score: 78.5,
            average_grade: 'B+',
            overall_position: 5,
            class_position: 2
        },
        {
            id: 2,
            student: { name: 'Jane Smith', admission_number: 'ADM002' },
            class: { name: 'Form 1' },
            stream: { name: 'A' },
            total_subjects: 8,
            total_points: 72,
            average_score: 85.2,
            average_grade: 'A-',
            overall_position: 2,
            class_position: 1
        },
        // Add more mock data as needed
    ];

    // Get unique classes and streams for filtering
    const classes = [...new Set(studentSummaries.map(s => s.class?.name))].filter(Boolean);
    const streams = [...new Set(studentSummaries.map(s => s.stream?.name))].filter(Boolean);

    // Filter students based on search and selections
    const filteredSummaries = studentSummaries.filter(summary => {
        const matchesSearch = summary.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            summary.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClass || summary.class?.name === selectedClass;
        const matchesStream = !selectedStream || summary.stream?.name === selectedStream;
        
        return matchesSearch && matchesClass && matchesStream;
    });

    // Calculate statistics
    const totalStudents = studentSummaries.length;
    const averageScore = studentSummaries.reduce((acc, s) => acc + s.average_score, 0) / totalStudents;
    const highestScore = Math.max(...studentSummaries.map(s => s.average_score));
    const lowestScore = Math.min(...studentSummaries.map(s => s.average_score));

    // Grade distribution
    const gradeDistribution = studentSummaries.reduce((acc, s) => {
        acc[s.average_grade] = (acc[s.average_grade] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <Head title={`${examSeries.name} - Term Reports`} />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link href={route('exam-series.show', [school.id, examSeries.id])}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Term Reports</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <span>{examSeries.name}</span>
                            <span>•</span>
                            <span>{examSeries.academic_year}</span>
                            <span>•</span>
                            <span>{getTermLabel(examSeries.term)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Reports
                    </Button>
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Print All
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            With complete results
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Across all subjects
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highestScore.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Top performer
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grade A</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{gradeDistribution['A'] || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Students with grade A
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="summaries" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="summaries">Student Summaries</TabsTrigger>
                    <TabsTrigger value="analysis">Class Analysis</TabsTrigger>
                    <TabsTrigger value="subject-performance">Subject Performance</TabsTrigger>
                    <TabsTrigger value="grade-distribution">Grade Distribution</TabsTrigger>
                </TabsList>

                {/* Student Summaries Tab */}
                <TabsContent value="summaries">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Student Term Summaries</CardTitle>
                                    <CardDescription>
                                        Individual student performance across all subjects
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 max-w-sm">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Classes</SelectItem>
                                        {classes.map(className => (
                                            <SelectItem key={className} value={className}>
                                                {className}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedStream} onValueChange={setSelectedStream}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Streams" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Streams</SelectItem>
                                        {streams.map(streamName => (
                                            <SelectItem key={streamName} value={streamName}>
                                                Stream {streamName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Results Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Subjects</TableHead>
                                        <TableHead>Total Points</TableHead>
                                        <TableHead>Average</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSummaries.map((summary) => (
                                        <TableRow key={summary.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{summary.student.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {summary.student.admission_number}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{summary.class?.name}</div>
                                                    {summary.stream && (
                                                        <div className="text-muted-foreground">
                                                            Stream {summary.stream.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {summary.total_subjects}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{summary.total_points}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{summary.average_score}%</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    summary.average_grade === 'A' || summary.average_grade === 'A-' ? 'bg-green-100 text-green-800' :
                                                    summary.average_grade === 'B+' || summary.average_grade === 'B' || summary.average_grade === 'B-' ? 'bg-blue-100 text-blue-800' :
                                                    summary.average_grade === 'C+' || summary.average_grade === 'C' || summary.average_grade === 'C-' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }>
                                                    {summary.average_grade}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>Overall: #{summary.overall_position}</div>
                                                    <div className="text-muted-foreground">
                                                        Class: #{summary.class_position}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredSummaries.length === 0 && (
                                <div className="text-center py-8">
                                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No students found</h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search criteria or filters.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Class Analysis Tab */}
                <TabsContent value="analysis">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Class Performance</CardTitle>
                                <CardDescription>
                                    Average performance by class
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {classes.map(className => {
                                        const classStudents = studentSummaries.filter(s => s.class?.name === className);
                                        const classAverage = classStudents.reduce((acc, s) => acc + s.average_score, 0) / classStudents.length;
                                        
                                        return (
                                            <div key={className} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{className}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {classStudents.length} students
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{classAverage.toFixed(1)}%</div>
                                                    <div className="text-sm text-muted-foreground">Average</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performers</CardTitle>
                                <CardDescription>
                                    Students with highest overall scores
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {studentSummaries
                                        .sort((a, b) => b.average_score - a.average_score)
                                        .slice(0, 5)
                                        .map((student, index) => (
                                            <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{student.student.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {student.class?.name} {student.stream?.name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{student.average_score}%</div>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        {student.average_grade}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Subject Performance Tab */}
                <TabsContent value="subject-performance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Performance Analysis</CardTitle>
                            <CardDescription>
                                Performance across different subjects in this term
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {examSeries.exams?.map(exam => (
                                    <div key={exam.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium">{exam.subject?.name}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {exam.class?.name}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Date:</span>
                                                <span>{new Date(exam.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Marks:</span>
                                                <span>{exam.total_marks}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Pass Mark:</span>
                                                <span>{exam.pass_mark}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <Badge className={exam.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {exam.is_published ? 'Published' : 'Draft'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <Link href={route('exams.show', [school.id, exam.id])}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )) || (
                                    <div className="col-span-full text-center py-8">
                                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No exams found in this series</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Grade Distribution Tab */}
                <TabsContent value="grade-distribution">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Grade Distribution</CardTitle>
                                <CardDescription>
                                    Distribution of grades across all students
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(gradeDistribution)
                                        .sort(([a], [b]) => {
                                            const gradeOrder = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
                                            return gradeOrder.indexOf(a) - gradeOrder.indexOf(b);
                                        })
                                        .map(([grade, count]) => {
                                            const percentage = (count / totalStudents) * 100;
                                            return (
                                                <div key={grade} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={
                                                                grade === 'A' || grade === 'A-' ? 'bg-green-100 text-green-800' :
                                                                grade === 'B+' || grade === 'B' || grade === 'B-' ? 'bg-blue-100 text-blue-800' :
                                                                grade === 'C+' || grade === 'C' || grade === 'C-' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }>
                                                                Grade {grade}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {count} students
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                grade === 'A' || grade === 'A-' ? 'bg-green-600' :
                                                                grade === 'B+' || grade === 'B' || grade === 'B-' ? 'bg-blue-600' :
                                                                grade === 'C+' || grade === 'C' || grade === 'C-' ? 'bg-yellow-600' :
                                                                'bg-red-600'
                                                            }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Insights</CardTitle>
                                <CardDescription>
                                    Key insights from the term results
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <span className="font-medium text-green-800">Top Performance</span>
                                        </div>
                                        <p className="text-sm text-green-700">
                                            {((gradeDistribution['A'] || 0) + (gradeDistribution['A-'] || 0))} students achieved grade A or A-
                                        </p>
                                    </div>

                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium text-blue-800">Pass Rate</span>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            {(((totalStudents - (gradeDistribution['D-'] || 0) - (gradeDistribution['E'] || 0)) / totalStudents) * 100).toFixed(1)}% of students passed
                                        </p>
                                    </div>

                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BarChart3 className="h-4 w-4 text-yellow-600" />
                                            <span className="font-medium text-yellow-800">Average Grade</span>
                                        </div>
                                        <p className="text-sm text-yellow-700">
                                            Most students achieved grades in the B-C range
                                        </p>
                                    </div>

                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-gray-800">Total Evaluated</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {totalStudents} students completed all examinations
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}