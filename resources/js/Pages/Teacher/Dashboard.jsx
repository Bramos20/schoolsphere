import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ClipboardList, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

export default function TeacherDashboard({ school, teachingSubjects, recentExams, pendingResults }) {
    return (
        <>
            <Head title="Teacher Dashboard" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Here's your teaching overview.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subjects Teaching</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{teachingSubjects.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Across different classes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Exams</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{recentExams.length}</div>
                            <p className="text-xs text-muted-foreground">
                                In the last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{pendingResults}</div>
                            <p className="text-xs text-muted-foreground">
                                Results to enter
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Classes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(teachingSubjects.map(ts => `${ts.stream.class.name}-${ts.stream.name}`)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Unique class-streams
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Teaching Subjects */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Your Teaching Subjects
                            </CardTitle>
                            <CardDescription>
                                Subjects and classes you're currently teaching
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teachingSubjects.map((ts, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium">{ts.subject.name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {ts.stream.class.name} {ts.stream.name}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/schools/${school.id}/teacher/classes?class_id=${ts.stream.class.id}&stream_id=${ts.stream.id}&subject_id=${ts.subject.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View Students
                                        </Link>
                                    </div>
                                ))}
                                {teachingSubjects.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                        No teaching assignments yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Exams */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Recent Exams
                            </CardTitle>
                            <CardDescription>
                                Latest exams for your subjects
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentExams.map((exam, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{exam.name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {exam.subject.name} • {exam.class.name} {exam.stream?.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {exam.exam_series.name}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(exam.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/schools/${school.id}/teacher/exams/${exam.id}/results`}
                                            className="ml-4"
                                        >
                                            <Button size="sm" variant="outline">
                                                Results
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                                {recentExams.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                        No recent exams
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks you might want to perform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Link href={`/schools/${school.id}/teacher/exams`}>
                                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                                    <ClipboardList className="h-6 w-6" />
                                    <span>View All Exams</span>
                                </Button>
                            </Link>
                            
                            <Link href={`/schools/${school.id}/teacher/classes`}>
                                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    <span>My Classes</span>
                                </Button>
                            </Link>
                            
                            <Button 
                                variant="outline" 
                                className="w-full h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => window.location.href = `/schools/${school.id}/teacher/results/pending`}
                            >
                                <TrendingUp className="h-6 w-6" />
                                <span>Enter Results</span>
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                className="w-full h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => window.location.href = `/schools/${school.id}/teacher/reports`}
                            >
                                <CheckCircle className="h-6 w-6" />
                                <span>View Reports</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}