import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    ArrowLeft, Edit, Trash2, Users, BookOpen, Calendar, Clock, 
    Award, CheckCircle, AlertCircle, TrendingUp, Download, Upload,
    FileText, Eye, PenTool, BarChart3, Settings, Share, PlayCircle,
    StopCircle, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExamShow({ school, exam, statistics, eligibleStudents, teacherSubjects, userRole }) {
    const [activeTab, setActiveTab] = useState('overview');

    const handlePublishResults = () => {
        if (confirm('Are you sure you want to publish these exam results? Students and parents will be able to view them.')) {
            router.post(route('exams.publish', [school.id, exam.id]));
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            router.delete(route('exams.destroy', [school.id, exam.id]));
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'draft': { 
                color: 'bg-gray-100 text-gray-800 border-gray-200', 
                icon: Edit, 
                description: 'Exam is being prepared' 
            },
            'active': { 
                color: 'bg-blue-100 text-blue-800 border-blue-200', 
                icon: PlayCircle, 
                description: 'Exam is currently active' 
            },
            'completed': { 
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
                icon: StopCircle, 
                description: 'Exam completed, results pending' 
            },
            'published': { 
                color: 'bg-green-100 text-green-800 border-green-200', 
                icon: CheckCircle, 
                description: 'Results published and available' 
            }
        };
        return configs[status] || configs['draft'];
    };

    const statusConfig = getStatusConfig(exam.exam_status);
    const StatusIcon = statusConfig.icon;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getExamProgress = () => {
        if (!statistics || !statistics.subjects) return 0;
        
        const totalSubjects = Object.keys(statistics.subjects).length;
        const subjectsWithResults = Object.values(statistics.subjects)
            .filter(subject => subject.students_attempted > 0).length;
        
        return totalSubjects > 0 ? Math.round((subjectsWithResults / totalSubjects) * 100) : 0;
    };

    const canEnterResults = (subjectId) => {
        if (userRole === 'school_admin') return true;
        return teacherSubjects && teacherSubjects.includes(subjectId);
    };

    const getSubjectResultsStatus = (subjectStats) => {
        if (!subjectStats.students_attempted) {
            return { text: 'No results', color: 'text-gray-500' };
        }
        
        const percentage = (subjectStats.students_attempted / eligibleStudents) * 100;
        if (percentage === 100) {
            return { text: 'Complete', color: 'text-green-600' };
        } else if (percentage > 0) {
            return { text: `${Math.round(percentage)}% entered`, color: 'text-blue-600' };
        }
        return { text: 'Pending', color: 'text-gray-500' };
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <Head title={`${exam.name} - Exam Details`} />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('exams.index', school.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Exams
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
                            <p className="text-muted-foreground">
                                {exam.exam_series?.name} • {exam.exam_category?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Badge className={`${statusConfig.color} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {exam.exam_status.charAt(0).toUpperCase() + exam.exam_status.slice(1)}
                        </Badge>

                        {userRole === 'school_admin' && (
                            <>
                                {exam.exam_status !== 'published' && (
                                    <Button onClick={handlePublishResults} className="bg-green-600 hover:bg-green-700">
                                        <Share className="h-4 w-4 mr-2" />
                                        Publish Results
                                    </Button>
                                )}
                                
                                {exam.exam_status === 'draft' && (
                                    <>
                                        <Link href={route('exams.edit', [school.id, exam.id])}>
                                            <Button variant="outline">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="destructive" 
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Status Alert */}
                <Alert>
                    <StatusIcon className="h-4 w-4" />
                    <AlertDescription>
                        {statusConfig.description}
                        {exam.exam_status === 'active' && (
                            <span className="ml-2 font-medium">
                                Results can be entered until {formatDate(exam.end_date)}
                            </span>
                        )}
                    </AlertDescription>
                </Alert>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Eligible Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{eligibleStudents}</div>
                            <p className="text-xs text-muted-foreground">
                                Across {exam.classes?.length || 0} classes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{exam.subjects?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {exam.exam_papers?.length || 0} total papers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{getExamProgress()}%</div>
                            <Progress value={getExamProgress()} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Grading System</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{exam.grading_system?.name || 'Not Set'}</div>
                            <p className="text-xs text-muted-foreground">
                                {exam.grading_system?.type || 'N/A'} based
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="subjects">Subjects & Results</TabsTrigger>
                        <TabsTrigger value="statistics">Statistics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Exam Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Exam Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                            <p className="font-medium">{formatDate(exam.start_date)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                            <p className="font-medium">{formatDate(exam.end_date)}</p>
                                        </div>
                                    </div>
                                    
                                    {exam.description && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                                            <p className="text-sm mt-1">{exam.description}</p>
                                        </div>
                                    )}

                                    {exam.instructions && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                                            <p className="text-sm mt-1">{exam.instructions}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Scope Type</label>
                                            <p className="font-medium capitalize">{exam.scope_type.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Subject Scope</label>
                                            <p className="font-medium capitalize">{exam.subject_scope_type.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Classes & Streams
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {exam.classes?.map(schoolClass => (
                                            <div key={schoolClass.id} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium">{schoolClass.name}</h4>
                                                    <Badge variant="secondary">
                                                        {schoolClass.streams?.length || 0} streams
                                                    </Badge>
                                                </div>
                                                {schoolClass.streams && schoolClass.streams.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {schoolClass.streams.map(stream => (
                                                            <Badge key={stream.id} variant="outline" className="text-xs">
                                                                {stream.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Common tasks for this exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                    {exam.subjects?.map(subject => (
                                        canEnterResults(subject.id) && (
                                            <Link 
                                                key={subject.id}
                                                href={route('exams.enter-results', [school.id, exam.id, subject.id])}
                                            >
                                                <Button variant="outline" className="w-full justify-start">
                                                    <PenTool className="h-4 w-4 mr-2" />
                                                    Enter {subject.name} Results
                                                </Button>
                                            </Link>
                                        )
                                    ))}
                                    
                                    {userRole === 'school_admin' && (
                                        <>
                                            <Link href={route('exams.bulk-import', [school.id, exam.id])}>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Bulk Import Results
                                                </Button>
                                            </Link>

                                            <Link href={route('exams.export', [school.id, exam.id])}>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export Results
                                                </Button>
                                            </Link>

                                            <Link href={route('exams.reports', [school.id, exam.id])}>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Generate Reports
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subjects" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subjects & Results Status</CardTitle>
                                <CardDescription>
                                    Track result entry progress for each subject
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Papers</TableHead>
                                            <TableHead>Total Marks</TableHead>
                                            <TableHead>Pass Mark</TableHead>
                                            <TableHead>Results Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {exam.subjects?.map(subject => {
                                            const subjectStats = statistics?.subjects?.[subject.id];
                                            const resultStatus = subjectStats ? getSubjectResultsStatus(subjectStats) : { text: 'No data', color: 'text-gray-500' };
                                            const subjectPapers = exam.exam_papers?.filter(paper => paper.subject_id === subject.id) || [];

                                            return (
                                                <TableRow key={subject.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{subject.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {subject.department?.name}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {subjectPapers.length > 0 ? (
                                                                subjectPapers.map(paper => (
                                                                    <Badge key={paper.id} variant="outline" className="text-xs">
                                                                        {paper.paper_name}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Single Paper
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">
                                                            {subject.pivot?.total_marks || 100}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">
                                                            {subject.pivot?.pass_mark || 40}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`font-medium ${resultStatus.color}`}>
                                                            {resultStatus.text}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            {canEnterResults(subject.id) && (
                                                                <Link href={route('exams.enter-results', [school.id, exam.id, subject.id])}>
                                                                    <Button size="sm" variant="outline">
                                                                        <PenTool className="h-3 w-3 mr-1" />
                                                                        Enter Results
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            
                                                            <Button size="sm" variant="ghost">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Exam Papers Detail */}
                        {exam.exam_papers && exam.exam_papers.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Exam Papers</CardTitle>
                                    <CardDescription>
                                        Detailed breakdown of all exam papers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Paper</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Marks</TableHead>
                                                <TableHead>Weight</TableHead>
                                                <TableHead>Type</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {exam.exam_papers.map(paper => (
                                                <TableRow key={paper.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{paper.paper_name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Paper {paper.paper_number}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {exam.subjects?.find(s => s.id === paper.subject_id)?.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {Math.floor(paper.duration_minutes / 60)}h {paper.duration_minutes % 60}m
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium">{paper.total_marks}</span>
                                                        <span className="text-sm text-muted-foreground ml-1">
                                                            (Pass: {paper.pass_mark})
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {paper.percentage_weight}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={paper.is_practical ? "secondary" : "default"}>
                                                            {paper.is_practical ? "Practical" : "Theory"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="statistics" className="space-y-6">
                        {statistics ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Overall Progress</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold mb-2">{getExamProgress()}%</div>
                                            <Progress value={getExamProgress()} className="mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Results entered for {Object.values(statistics.subjects || {}).filter(s => s.students_attempted > 0).length} of {Object.keys(statistics.subjects || {}).length} subjects
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Student Participation</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold mb-2">{statistics.total_students || 0}</div>
                                            <p className="text-sm text-muted-foreground">
                                                Total students with results
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Subjects</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold mb-2">{Object.keys(statistics.subjects || {}).length}</div>
                                            <p className="text-sm text-muted-foreground">
                                                Total subjects in exam
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Subject Statistics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Subject Performance</CardTitle>
                                        <CardDescription>
                                            Detailed statistics for each subject
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Students</TableHead>
                                                    <TableHead>Highest</TableHead>
                                                    <TableHead>Lowest</TableHead>
                                                    <TableHead>Average</TableHead>
                                                    <TableHead>Pass Rate</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.entries(statistics.subjects || {}).map(([subjectId, stats]) => {
                                                    const subject = exam.subjects?.find(s => s.id.toString() === subjectId);
                                                    
                                                    return (
                                                        <TableRow key={subjectId}>
                                                            <TableCell>
                                                                <p className="font-medium">{subject?.name || 'Unknown'}</p>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-medium">{stats.students_attempted}</span>
                                                                <span className="text-muted-foreground"> of {eligibleStudents}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-medium text-green-600">
                                                                    {stats.highest_score || 'N/A'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-medium text-red-600">
                                                                    {stats.lowest_score || 'N/A'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-medium">
                                                                    {stats.average_score ? Math.round(stats.average_score) : 'N/A'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {stats.pass_rate || 0}%
                                                                    </span>
                                                                    <Progress 
                                                                        value={stats.pass_rate || 0} 
                                                                        className="w-16 h-2" 
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Statistics Available</h3>
                                    <p className="text-muted-foreground">
                                        Statistics will appear once results are entered for this exam.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Exam Configuration
                                </CardTitle>
                                <CardDescription>
                                    View and manage exam settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-3">General Settings</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Exam Status</span>
                                                <Badge className={statusConfig.color}>
                                                    {exam.exam_status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Results Published</span>
                                                <Badge variant={exam.is_published ? "default" : "secondary"}>
                                                    {exam.is_published ? "Yes" : "No"}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Created By</span>
                                                <span className="text-sm font-medium">
                                                    {exam.creator?.name || 'System'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Scope Settings</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Class Scope</span>
                                                <Badge variant="outline">
                                                    {exam.scope_type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Subject Scope</span>
                                                <Badge variant="outline">
                                                    {exam.subject_scope_type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Grading System</span>
                                                <span className="text-sm font-medium">
                                                    {exam.grading_system?.name || 'Not Set'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {userRole === 'school_admin' && exam.exam_status === 'draft' && (
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-3">Management Actions</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <Link href={route('exams.edit', [school.id, exam.id])}>
                                                <Button variant="outline">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Exam
                                                </Button>
                                            </Link>
                                            <Button variant="destructive" onClick={handleDelete}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Exam
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}