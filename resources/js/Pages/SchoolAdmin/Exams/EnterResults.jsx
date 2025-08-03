import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Save, 
    AlertTriangle, 
    CheckCircle, 
    Users, 
    FileText,
    ArrowLeft,
    Calculator,
    Eye,
    EyeOff,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnterResults({ 
    school, 
    exam, 
    subject, 
    students, 
    studentsByStream,
    examPapers, 
    existingResults,
    teacherStreams,
    userRole,
    auth 
}) {
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [showAbsentOnly, setShowAbsentOnly] = useState(false);
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);
    const [selectedStream, setSelectedStream] = useState('all');
    const [bulkAction, setBulkAction] = useState('');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        results: students.map(student => {
            const existingResult = existingResults[student.id];
            const paperResults = examPapers.map(paper => {
                const existingPaper = existingResult?.paper_results?.find(pr => pr.exam_paper_id === paper.id);
                return {
                    exam_paper_id: paper.id,
                    marks: existingPaper?.marks || '',
                    is_absent: existingPaper?.is_absent || false
                };
            });

            return {
                student_id: student.id,
                is_absent: existingResult?.is_absent || false,
                paper_results: paperResults
            };
        })
    });

    // Check if user has students assigned
    const hasStudents = students && students.length > 0;
    const streamOptions = Object.keys(studentsByStream || {});

    const handleStudentAbsentChange = (studentIndex, isAbsent) => {
        const newResults = [...data.results];
        newResults[studentIndex].is_absent = isAbsent;
        
        // If marking as absent, clear all paper marks
        if (isAbsent) {
            newResults[studentIndex].paper_results = newResults[studentIndex].paper_results.map(paper => ({
                ...paper,
                marks: '',
                is_absent: true
            }));
        } else {
            // If unmarking absent, set paper results to not absent
            newResults[studentIndex].paper_results = newResults[studentIndex].paper_results.map(paper => ({
                ...paper,
                is_absent: false
            }));
        }
        
        setData('results', newResults);
    };

    const handlePaperMarksChange = (studentIndex, paperIndex, marks) => {
        const newResults = [...data.results];
        newResults[studentIndex].paper_results[paperIndex].marks = marks;
        setData('results', newResults);
    };

    const calculateTotalMarks = (studentResult) => {
        if (studentResult.is_absent) return 0;
        
        let totalWeighted = 0;
        studentResult.paper_results.forEach((paperResult, index) => {
            const paper = examPapers[index];
            const marks = parseFloat(paperResult.marks) || 0;
            const weight = paper.percentage_weight / 100;
            totalWeighted += marks * weight;
        });
        
        return Math.round(totalWeighted * 100) / 100;
    };

    const getGradeForMarks = (marks) => {
        // This would typically come from your grading system
        if (marks >= 80) return { grade: 'A', color: 'bg-green-500' };
        if (marks >= 75) return { grade: 'A-', color: 'bg-green-400' };
        if (marks >= 70) return { grade: 'B+', color: 'bg-blue-500' };
        if (marks >= 65) return { grade: 'B', color: 'bg-blue-400' };
        if (marks >= 60) return { grade: 'B-', color: 'bg-blue-300' };
        if (marks >= 55) return { grade: 'C+', color: 'bg-yellow-500' };
        if (marks >= 50) return { grade: 'C', color: 'bg-yellow-400' };
        if (marks >= 45) return { grade: 'C-', color: 'bg-yellow-300' };
        if (marks >= 40) return { grade: 'D+', color: 'bg-orange-500' };
        if (marks >= 35) return { grade: 'D', color: 'bg-orange-400' };
        if (marks >= 30) return { grade: 'D-', color: 'bg-orange-300' };
        return { grade: 'E', color: 'bg-red-500' };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!hasStudents) {
            toast.error('No students assigned to you for this subject and exam.');
            return;
        }
        
        // Validate that all non-absent students have marks entered
        const incompleteResults = data.results.filter(result => {
            if (result.is_absent) return false;
            return result.paper_results.some(paper => !paper.marks || paper.marks === '');
        });

        if (incompleteResults.length > 0) {
            toast.error(`Please enter marks for all students or mark them as absent. ${incompleteResults.length} students have incomplete results.`);
            return;
        }

        post(route('exams.store-results', [school.id, exam.id, subject.id]), {
            onSuccess: () => {
                toast.success('Results saved successfully!');
            },
            onError: () => {
                toast.error('Error saving results. Please check your entries and try again.');
            }
        });
    };

    const handleBulkAbsent = () => {
        if (selectedStudents.size === 0) {
            toast.error('Please select students first');
            return;
        }

        const newResults = data.results.map((result, index) => {
            if (selectedStudents.has(index)) {
                return {
                    ...result,
                    is_absent: true,
                    paper_results: result.paper_results.map(paper => ({
                        ...paper,
                        marks: '',
                        is_absent: true
                    }))
                };
            }
            return result;
        });

        setData('results', newResults);
        setSelectedStudents(new Set());
        toast.success(`Marked ${selectedStudents.size} students as absent`);
    };

    const filteredStudents = students.filter((student, index) => {
        const result = data.results[index];
        
        // Stream filter
        if (selectedStream !== 'all') {
            const studentStream = `${student.class.name} - ${student.stream?.name ?? 'No Stream'}`;
            if (studentStream !== selectedStream) return false;
        }
        
        // Absent filter
        if (showAbsentOnly && !result.is_absent) return false;
        
        // Completed filter
        if (showCompletedOnly) {
            const isComplete = result.is_absent || result.paper_results.every(paper => paper.marks && paper.marks !== '');
            if (!isComplete) return false;
        }
        
        return true;
    });

    const completedCount = data.results.filter(result => 
        result.is_absent || result.paper_results.every(paper => paper.marks && paper.marks !== '')
    ).length;

    const absentCount = data.results.filter(result => result.is_absent).length;

    // Show warning if no students
    if (!hasStudents) {
        return (
            <AppLayout
                user={auth.user}
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Enter Results - {subject.name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {exam.name} • {exam.exam_series?.name} • {exam.exam_category?.name}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('exams.show', [school.id, exam.id]))}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Exam
                        </Button>
                    </div>
                }
            >
                <Head title={`Enter Results - ${subject.name}`} />
                
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <Alert className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>No students assigned:</strong> You don't have any students assigned for this subject in this exam. 
                                {userRole === 'teacher' && (
                                    <span> Please contact your school administrator to verify your subject and stream assignments.</span>
                                )}
                            </AlertDescription>
                        </Alert>
                        
                        {teacherStreams && teacherStreams.length > 0 && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Your Assigned Streams</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {teacherStreams.map((assignment, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span>{assignment.stream.class.name} - {assignment.stream.name}</span>
                                                <Badge variant="secondary">No students in exam</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Enter Results - {subject.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {exam.name} • {exam.exam_series?.name} • {exam.exam_category?.name}
                        </p>
                        {userRole === 'teacher' && (
                            <p className="text-xs text-blue-600 mt-1">
                                You can only enter results for students in your assigned streams
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('exams.show', [school.id, exam.id]))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Exam
                    </Button>
                </div>
            }
        >
            <Head title={`Enter Results - ${subject.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Total Students</p>
                                        <p className="text-2xl font-bold">{students.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">Completed</p>
                                        <p className="text-2xl font-bold">{completedCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <div>
                                        <p className="text-sm font-medium">Absent</p>
                                        <p className="text-2xl font-bold">{absentCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Papers</p>
                                        <p className="text-2xl font-bold">{examPapers.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* Stream Filter - Only show if multiple streams */}
                                {streamOptions.length > 1 && (
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="stream-filter">Filter by Stream:</Label>
                                        <Select value={selectedStream} onValueChange={setSelectedStream}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select stream" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Streams</SelectItem>
                                                {streamOptions.map((stream) => (
                                                    <SelectItem key={stream} value={stream}>
                                                        {stream} ({studentsByStream[stream].length} students)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="show-absent"
                                        checked={showAbsentOnly}
                                        onCheckedChange={setShowAbsentOnly}
                                    />
                                    <Label htmlFor="show-absent">Show absent only</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="show-completed"
                                        checked={showCompletedOnly}
                                        onCheckedChange={setShowCompletedOnly}
                                    />
                                    <Label htmlFor="show-completed">Show completed only</Label>
                                </div>

                                {selectedStudents.size > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                            {selectedStudents.size} selected
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleBulkAbsent}
                                        >
                                            Mark as Absent
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedStudents(new Set())}
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Your Assigned Streams Info (for teachers) */}
                    {userRole === 'teacher' && teacherStreams && teacherStreams.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Your Assigned Streams</CardTitle>
                                <CardDescription>
                                    You can enter results for students in these streams only
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teacherStreams.map((assignment, index) => {
                                        const streamKey = `${assignment.stream.class.name} - ${assignment.stream.name}`;
                                        const studentCount = studentsByStream[streamKey]?.length || 0;
                                        return (
                                            <div key={index} className="p-3 border rounded-lg">
                                                <h4 className="font-medium">{assignment.stream.class.name}</h4>
                                                <p className="text-sm text-gray-600">{assignment.stream.name}</p>
                                                <Badge variant={studentCount > 0 ? "default" : "secondary"} className="mt-2">
                                                    {studentCount} students
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Paper Information */}
                    {examPapers.length > 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Paper Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {examPapers.map((paper, index) => (
                                        <div key={paper.id} className="p-3 border rounded-lg">
                                            <h4 className="font-medium">{paper.paper_name}</h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>Total Marks: {paper.total_marks}</p>
                                                <p>Pass Mark: {paper.pass_mark}</p>
                                                <p>Weight: {paper.percentage_weight}%</p>
                                                <p>Duration: {Math.floor(paper.duration_minutes / 60)}h {paper.duration_minutes % 60}m</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Results Entry Form */}
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Enter Results</CardTitle>
                                        <CardDescription>
                                            {filteredStudents.length} of {students.length} students shown
                                        </CardDescription>
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Results'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 w-8">
                                                    <Checkbox
                                                        checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                const newSelection = new Set();
                                                                filteredStudents.forEach((_, index) => {
                                                                    const originalIndex = students.indexOf(students.find(s => s.id === filteredStudents[index].id));
                                                                    newSelection.add(originalIndex);
                                                                });
                                                                setSelectedStudents(newSelection);
                                                            } else {
                                                                setSelectedStudents(new Set());
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th className="text-left p-3 min-w-[200px]">Student</th>
                                                <th className="text-left p-3 w-20">Absent</th>
                                                {examPapers.map((paper) => (
                                                    <th key={paper.id} className="text-left p-3 min-w-[120px]">
                                                        <div>
                                                            <div className="font-medium">{paper.paper_name}</div>
                                                            <div className="text-xs text-gray-500">/{paper.total_marks}</div>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="text-left p-3 w-24">Total</th>
                                                <th className="text-left p-3 w-16">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student, filteredIndex) => {
                                                const originalIndex = students.findIndex(s => s.id === student.id);
                                                const result = data.results[originalIndex];
                                                const totalMarks = calculateTotalMarks(result);
                                                const grade = getGradeForMarks(totalMarks);
                                                
                                                return (
                                                    <tr key={student.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3">
                                                            <Checkbox
                                                                checked={selectedStudents.has(originalIndex)}
                                                                onCheckedChange={(checked) => {
                                                                    const newSelection = new Set(selectedStudents);
                                                                    if (checked) {
                                                                        newSelection.add(originalIndex);
                                                                    } else {
                                                                        newSelection.delete(originalIndex);
                                                                    }
                                                                    setSelectedStudents(newSelection);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div>
                                                                <div className="font-medium">{student.user.name}</div>
                                                                <div className="text-sm text-gray-600">
                                                                    {student.class?.name} {student.stream?.name}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <Checkbox
                                                                checked={result.is_absent}
                                                                onCheckedChange={(checked) => handleStudentAbsentChange(originalIndex, checked)}
                                                            />
                                                        </td>
                                                        {examPapers.map((paper, paperIndex) => (
                                                            <td key={paper.id} className="p-3">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max={paper.total_marks}
                                                                    step="0.01"
                                                                    value={result.paper_results[paperIndex]?.marks || ''}
                                                                    onChange={(e) => handlePaperMarksChange(originalIndex, paperIndex, e.target.value)}
                                                                    disabled={result.is_absent}
                                                                    className="w-20"
                                                                    placeholder="0"
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="p-3">
                                                            <span className="font-medium">
                                                                {result.is_absent ? 'ABS' : totalMarks.toFixed(1)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            {!result.is_absent && (
                                                                <Badge className={`${grade.color} text-white`}>
                                                                    {grade.grade}
                                                                </Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {filteredStudents.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No students match the current filters.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </form>

                    {/* Save Button - Fixed at bottom on mobile */}
                    <div className="sticky bottom-4 flex justify-end">
                        <Button 
                            type="submit" 
                            size="lg"
                            disabled={processing}
                            onClick={handleSubmit}
                            className="shadow-lg"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save All Results'}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}