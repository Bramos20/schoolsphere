import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, BookOpen, Users, FileText, Plus, Eye, Edit, Trash2, CheckCircle, Clock, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ExamSeriesShow({ school, examSeries }) {
    const handlePublish = () => {
        if (confirm('Are you sure you want to publish this exam series? Results will be visible to students and parents.')) {
            router.post(route('exam-series.publish', [school.id, examSeries.id]));
        }
    };

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

    const getSeriesStatus = () => {
        const now = new Date();
        const startDate = new Date(examSeries.start_date);
        const endDate = new Date(examSeries.end_date);

        if (now < startDate) {
            return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
        } else if (now >= startDate && now <= endDate) {
            return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' };
        } else {
            return { status: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const statusInfo = getSeriesStatus();
    const totalExams = examSeries.exams?.length || 0;
    const publishedExams = examSeries.exams?.filter(exam => exam.is_published).length || 0;
    const completionRate = totalExams > 0 ? (publishedExams / totalExams) * 100 : 0;

    // Group exams by subject and class for better organization
    const examsBySubject = examSeries.exams?.reduce((acc, exam) => {
        const subjectName = exam.subject?.name || 'Unknown Subject';
        if (!acc[subjectName]) {
            acc[subjectName] = [];
        }
        acc[subjectName].push(exam);
        return acc;
    }, {}) || {};

    const examsByClass = examSeries.exams?.reduce((acc, exam) => {
        const className = exam.class?.name || 'Unknown Class';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(exam);
        return acc;
    }, {}) || {};

    return (
        <div className="space-y-6">
            <Head title={examSeries.name} />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link href={route('exam-series.index', school.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">{examSeries.name}</h1>
                            <Badge className={statusInfo.color}>
                                {statusInfo.label}
                            </Badge>
                            {examSeries.is_published && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Published
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {examSeries.academic_year}
                            </span>
                            <span>{getTermLabel(examSeries.term)}</span>
                            <span>
                                {formatDate(examSeries.start_date)} - {formatDate(examSeries.end_date)}
                            </span>
                        </div>
                        {examSeries.description && (
                            <p className="text-muted-foreground mt-2">{examSeries.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!examSeries.is_published && totalExams > 0 && publishedExams === totalExams && (
                        <Button onClick={handlePublish}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Publish Results
                        </Button>
                    )}

                    <Link href={route('exam-series.reports', [school.id, examSeries.id])}>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Term Reports
                        </Button>
                    </Link>

                    <Link href={route('exams.create', school.id)} className="ml-2">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Exam
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalExams}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all subjects and classes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedExams}</div>
                        <p className="text-xs text-muted-foreground">
                            Results available to students
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                        <Progress value={completionRate} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.ceil((new Date(examSeries.end_date) - new Date(examSeries.start_date)) / (1000 * 60 * 60 * 24))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Days duration
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="exams" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="exams">Exams</TabsTrigger>
                    <TabsTrigger value="by-subject">By Subject</TabsTrigger>
                    <TabsTrigger value="by-class">By Class</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>

                {/* All Exams Tab */}
                <TabsContent value="exams">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Exams</CardTitle>
                            <CardDescription>
                                Complete list of exams in this series
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {totalExams > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Exam</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {examSeries.exams.map((exam) => (
                                            <TableRow key={exam.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{exam.name}</div>
                                                        {exam.description && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {exam.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {exam.subject?.name || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{exam.class?.name || 'N/A'}</div>
                                                        {exam.stream && (
                                                            <div className="text-muted-foreground">
                                                                {exam.stream.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {new Date(exam.date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {exam.is_published ? (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Draft
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={route('exams.show', [school.id, exam.id])}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('exams.edit', [school.id, exam.id])}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No exams yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Start by creating your first exam in this series.
                                    </p>
                                    <Link href={route('exams.create', school.id)}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create First Exam
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* By Subject Tab */}
                <TabsContent value="by-subject">
                    <div className="space-y-4">
                        {Object.keys(examsBySubject).length > 0 ? (
                            Object.entries(examsBySubject).map(([subject, exams]) => (
                                <Card key={subject}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{subject}</span>
                                            <Badge variant="outline">{exams.length} exams</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {exams.map((exam) => (
                                                <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">{exam.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {exam.class?.name} {exam.stream?.name ? `- ${exam.stream.name}` : ''}
                                                            • {new Date(exam.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {exam.is_published ? (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                Published
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Draft
                                                            </Badge>
                                                        )}
                                                        <Link href={route('exams.show', [school.id, exam.id])}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No exams created yet</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* By Class Tab */}
                <TabsContent value="by-class">
                    <div className="space-y-4">
                        {Object.keys(examsByClass).length > 0 ? (
                            Object.entries(examsByClass).map(([className, exams]) => (
                                <Card key={className}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{className}</span>
                                            <Badge variant="outline">{exams.length} exams</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {exams.map((exam) => (
                                                <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">{exam.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {exam.subject?.name} 
                                                            {exam.stream?.name && ` - ${exam.stream.name}`}
                                                            • {new Date(exam.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {exam.is_published ? (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                Published
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Draft
                                                            </Badge>
                                                        )}
                                                        <Link href={route('exams.show', [school.id, exam.id])}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No exams created yet</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Series Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Series Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Academic Year:</span>
                                        <span className="font-medium">{examSeries.academic_year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Term:</span>
                                        <span className="font-medium">{getTermLabel(examSeries.term)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Start Date:</span>
                                        <span className="font-medium">{formatDate(examSeries.start_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">End Date:</span>
                                        <span className="font-medium">{formatDate(examSeries.end_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge className={statusInfo.color}>
                                            {statusInfo.label}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Published:</span>
                                        <span className="font-medium">
                                            {examSeries.is_published ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Exams:</span>
                                        <span className="font-medium text-lg">{totalExams}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Published Exams:</span>
                                        <span className="font-medium text-lg">{publishedExams}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Completion Rate:</span>
                                        <span className="font-medium text-lg">{Math.round(completionRate)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Subjects Covered:</span>
                                        <span className="font-medium text-lg">{Object.keys(examsBySubject).length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Classes Involved:</span>
                                        <span className="font-medium text-lg">{Object.keys(examsByClass).length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    <Link href={route('exams.create', school.id)}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add New Exam
                                        </Button>
                                    </Link>
                                    
                                    <Link href={route('exam-series.reports', [school.id, examSeries.id])}>
                                        <Button variant="outline">
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            View Reports
                                        </Button>
                                    </Link>

                                    <Link href={route('exam-series.edit', [school.id, examSeries.id])}>
                                        <Button variant="outline">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Series
                                        </Button>
                                    </Link>

                                    {!examSeries.is_published && totalExams > 0 && publishedExams === totalExams && (
                                        <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Publish Results
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}