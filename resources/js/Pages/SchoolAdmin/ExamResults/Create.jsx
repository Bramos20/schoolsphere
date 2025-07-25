import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User, Calculator, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function ExamResultCreate({ school, exam, students }) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        theory_score: '',
        practical_score: '',
        is_absent: false
    });

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [calculatedTotal, setCalculatedTotal] = useState(0);
    const [predictedGrade, setPredictedGrade] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exam-results.store', [school.id, exam.id]));
    };

    const handleStudentSelect = (studentId) => {
        const student = students.find(s => s.id === parseInt(studentId));
        setSelectedStudent(student);
        setData('student_id', studentId);
    };

    const calculateTotal = () => {
        if (data.is_absent) {
            setCalculatedTotal(0);
            setPredictedGrade(null);
            return;
        }

        let total = 0;
        
        if (exam.has_practical) {
            const theoryContribution = (parseFloat(data.theory_score) || 0) * (exam.theory_percentage / 100);
            const practicalContribution = (parseFloat(data.practical_score) || 0) * (exam.practical_percentage / 100);
            total = theoryContribution + practicalContribution;
        } else {
            total = parseFloat(data.theory_score) || 0;
        }

        setCalculatedTotal(total);

        // Find predicted grade
        const grade = exam.grading_system.grades.find(g => 
            total >= g.min_score && total <= g.max_score
        );
        setPredictedGrade(grade);
    };

    React.useEffect(() => {
        calculateTotal();
    }, [data.theory_score, data.practical_score, data.is_absent]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Add Exam Result" />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={route('exams.show', [school.id, exam.id])}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Exam
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Exam Result</h1>
                    <p className="text-muted-foreground">
                        Enter individual student result for {exam.name}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Result</CardTitle>
                            <CardDescription>
                                Enter the score details for the selected student
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Student Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="student_id">Select Student *</Label>
                                    <Select
                                        value={data.student_id}
                                        onValueChange={handleStudentSelect}
                                    >
                                        <SelectTrigger className={errors.student_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Choose a student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map(student => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{student.user?.name || student.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {student.user?.admission_number || student.admission_number}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.student_id && (
                                        <p className="text-sm text-red-600">{errors.student_id}</p>
                                    )}
                                </div>

                                {/* Absent Checkbox */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_absent"
                                        checked={data.is_absent}
                                        onCheckedChange={(checked) => setData('is_absent', checked)}
                                    />
                                    <Label htmlFor="is_absent" className="text-sm font-medium">
                                        Student was absent
                                    </Label>
                                </div>

                                {/* Score Inputs - Only show if not absent */}
                                {!data.is_absent && (
                                    <div className="space-y-4">
                                        {/* Theory Score */}
                                        <div className="space-y-2">
                                            <Label htmlFor="theory_score">
                                                {exam.has_practical ? 'Theory Score' : 'Score'} *
                                                <span className="text-sm text-muted-foreground ml-1">
                                                    (out of {exam.total_marks})
                                                </span>
                                            </Label>
                                            <Input
                                                id="theory_score"
                                                type="number"
                                                min="0"
                                                max={exam.total_marks}
                                                step="0.1"
                                                value={data.theory_score}
                                                onChange={(e) => setData('theory_score', e.target.value)}
                                                placeholder="Enter score"
                                                className={errors.theory_score ? 'border-red-500' : ''}
                                            />
                                            {errors.theory_score && (
                                                <p className="text-sm text-red-600">{errors.theory_score}</p>
                                            )}
                                        </div>

                                        {/* Practical Score - Only show if exam has practical */}
                                        {exam.has_practical && (
                                            <div className="space-y-2">
                                                <Label htmlFor="practical_score">
                                                    Practical Score *
                                                    <span className="text-sm text-muted-foreground ml-1">
                                                        (out of {exam.total_marks})
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="practical_score"
                                                    type="number"
                                                    min="0"
                                                    max={exam.total_marks}
                                                    step="0.1"
                                                    value={data.practical_score}
                                                    onChange={(e) => setData('practical_score', e.target.value)}
                                                    placeholder="Enter practical score"
                                                    className={errors.practical_score ? 'border-red-500' : ''}
                                                />
                                                {errors.practical_score && (
                                                    <p className="text-sm text-red-600">{errors.practical_score}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Score Breakdown - Show if practical exam */}
                                        {exam.has_practical && (data.theory_score || data.practical_score) && (
                                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                                <h4 className="font-medium text-sm">Score Breakdown</h4>
                                                <div className="grid gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Theory ({exam.theory_percentage}%):</span>
                                                        <span>
                                                            {((parseFloat(data.theory_score) || 0) * (exam.theory_percentage / 100)).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Practical ({exam.practical_percentage}%):</span>
                                                        <span>
                                                            {((parseFloat(data.practical_score) || 0) * (exam.practical_percentage / 100)).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between font-medium border-t pt-2">
                                                        <span>Total Score:</span>
                                                        <span>{calculatedTotal.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSubmit} disabled={processing}>
                                        {processing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Result
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Exam Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Exam Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subject:</span>
                                    <span className="font-medium">{exam.subject?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Class:</span>
                                    <span className="font-medium">
                                        {exam.class?.name} {exam.stream?.name && `- ${exam.stream.name}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">{formatDate(exam.date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Marks:</span>
                                    <span className="font-medium">{exam.total_marks}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pass Mark:</span>
                                    <span className="font-medium">{exam.pass_mark}</span>
                                </div>
                                {exam.has_practical && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Theory %:</span>
                                            <span className="font-medium">{exam.theory_percentage}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Practical %:</span>
                                            <span className="font-medium">{exam.practical_percentage}%</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Student Details */}
                    {selectedStudent && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Student Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium">
                                            {selectedStudent.user?.name || selectedStudent.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Admission No:</span>
                                        <span className="font-medium">
                                            {selectedStudent.user?.admission_number || selectedStudent.admission_number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Class:</span>
                                        <span className="font-medium">
                                            {selectedStudent.class?.name}
                                        </span>
                                    </div>
                                    {selectedStudent.stream && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Stream:</span>
                                            <span className="font-medium">{selectedStudent.stream.name}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Grade Prediction */}
                    {!data.is_absent && calculatedTotal > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade Prediction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-3">
                                    <div>
                                        <div className="text-2xl font-bold">{calculatedTotal.toFixed(1)}</div>
                                        <div className="text-sm text-muted-foreground">Total Score</div>
                                    </div>
                                    
                                    {predictedGrade && (
                                        <div>
                                            <Badge className="text-lg px-3 py-1">
                                                {predictedGrade.grade}
                                            </Badge>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {predictedGrade.points} points
                                            </div>
                                            {predictedGrade.remarks && (
                                                <div className="text-sm text-muted-foreground">
                                                    {predictedGrade.remarks}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {calculatedTotal < exam.pass_mark && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Score is below pass mark ({exam.pass_mark})
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Grading System */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Grading System</CardTitle>
                            <CardDescription>
                                {exam.grading_system?.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {exam.grading_system?.grades?.map(grade => (
                                    <div key={grade.id} className="flex items-center justify-between text-sm p-2 rounded border">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {grade.grade}
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {grade.min_score}-{grade.max_score}
                                            </span>
                                        </div>
                                        <span className="font-medium">{grade.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guidelines */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>• Enter scores accurately as they cannot be easily changed later</p>
                                <p>• Check student identity before entering results</p>
                                <p>• Mark absent students appropriately</p>
                                <p>• Verify total score calculation before saving</p>
                                {exam.has_practical && (
                                    <p>• Both theory and practical scores are required for complete results</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}