import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Download, Save, User, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function BulkResultsImport({ school, exam, students }) {
    const [results, setResults] = useState(
        students.map(student => ({
            student_id: student.id,
            theory_score: '',
            practical_score: exam.has_practical ? '' : null,
            is_absent: false,
            student: student
        }))
    );

    const { data, setData, post, processing, errors } = useForm({
        results: results
    });

    const [importMode, setImportMode] = useState('manual'); // 'manual' or 'csv'
    const [csvFile, setCsvFile] = useState(null);

    const handleResultChange = (index, field, value) => {
        const newResults = [...results];
        newResults[index][field] = value;
        
        // If marking as absent, clear scores
        if (field === 'is_absent' && value) {
            newResults[index].theory_score = '';
            newResults[index].practical_score = '';
        }
        
        setResults(newResults);
        setData('results', newResults);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exams.bulk-results.store', [school.id, exam.id]));
    };

    const handleCsvImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCsvFile(file);
            // Here you would typically parse the CSV and populate the results
            // For now, we'll just store the file reference
        }
    };

    const downloadTemplate = () => {
        // Create CSV template
        const headers = ['Student ID', 'Student Name', 'Theory Score'];
        if (exam.has_practical) {
            headers.push('Practical Score');
        }
        headers.push('Is Absent (TRUE/FALSE)');

        const csvContent = [
            headers.join(','),
            ...students.map(student => {
                const row = [student.id, student.user.name, ''];
                if (exam.has_practical) {
                    row.push('');
                }
                row.push('FALSE');
                return row.join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exam.name}_results_template.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getValidationStatus = (result) => {
        if (result.is_absent) return 'absent';
        
        const hasTheoryScore = result.theory_score !== '';
        const hasPracticalScore = !exam.has_practical || result.practical_score !== '';
        
        if (hasTheoryScore && hasPracticalScore) return 'valid';
        if (hasTheoryScore || hasPracticalScore) return 'partial';
        return 'empty';
    };

    const getValidationIcon = (status) => {
        switch (status) {
            case 'valid':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'partial':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case 'absent':
                return <User className="h-4 w-4 text-gray-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-red-600" />;
        }
    };

    const validResults = results.filter(result => getValidationStatus(result) === 'valid' || result.is_absent);
    const completionRate = (validResults.length / results.length) * 100;

    return (
        <div className="space-y-6">
            <Head title={`Import Results - ${exam.name}`} />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={route('exams.show', [school.id, exam.id])}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Exam
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Import Results</h1>
                    <p className="text-muted-foreground">
                        {exam.name} • {exam.subject.name} • {exam.class.name}
                        {exam.stream && ` - ${exam.stream.name}`}
                    </p>
                </div>
            </div>

            {/* Import Mode Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Import Method</CardTitle>
                    <CardDescription>
                        Choose how you want to import the exam results
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                importMode === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setImportMode('manual')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    {importMode === 'manual' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <div>
                                    <h3 className="font-medium">Manual Entry</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Enter results directly in the form below
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                importMode === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setImportMode('csv')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    {importMode === 'csv' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <div>
                                    <h3 className="font-medium">CSV Upload</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Upload results from a spreadsheet
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {importMode === 'csv' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={downloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Template
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="csv-file">Upload CSV File</Label>
                                <Input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCsvImport}
                                />
                            </div>

                            {csvFile && (
                                <Alert>
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <AlertDescription>
                                        CSV file "{csvFile.name}" selected. Click "Process File" to import data.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Import Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Completion Rate</span>
                            <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {results.filter(r => getValidationStatus(r) === 'valid').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Complete</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">
                                    {results.filter(r => getValidationStatus(r) === 'partial').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Partial</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-600">
                                    {results.filter(r => r.is_absent).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Absent</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">
                                    {results.filter(r => getValidationStatus(r) === 'empty').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Empty</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Manual Entry Form */}
            {importMode === 'manual' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Results</CardTitle>
                            <CardDescription>
                                Enter results for each student. Leave empty for students who didn't take the exam.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="grid gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm">
                                    <div className={`grid gap-4 ${exam.has_practical ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
                                        <div className="md:col-span-2">Student</div>
                                        <div>Theory Score</div>
                                        {exam.has_practical && <div>Practical Score</div>}
                                        <div>Absent</div>
                                        <div>Status</div>
                                    </div>
                                </div>

                                {/* Student Rows */}
                                {results.map((result, index) => {
                                    const status = getValidationStatus(result);
                                    return (
                                        <div key={result.student_id} className="grid gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className={`grid gap-4 items-center ${exam.has_practical ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
                                                {/* Student Info */}
                                                <div className="md:col-span-2">
                                                    <p className="font-medium">{result.student.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ID: {result.student.id}
                                                    </p>
                                                </div>

                                                {/* Theory Score */}
                                                <div>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={exam.total_marks}
                                                        value={result.theory_score}
                                                        onChange={(e) => handleResultChange(index, 'theory_score', e.target.value)}
                                                        disabled={result.is_absent}
                                                        placeholder="0"
                                                        className={result.is_absent ? 'bg-gray-100' : ''}
                                                    />
                                                </div>

                                                {/* Practical Score */}
                                                {exam.has_practical && (
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={exam.total_marks}
                                                            value={result.practical_score}
                                                            onChange={(e) => handleResultChange(index, 'practical_score', e.target.value)}
                                                            disabled={result.is_absent}
                                                            placeholder="0"
                                                            className={result.is_absent ? 'bg-gray-100' : ''}
                                                        />
                                                    </div>
                                                )}

                                                {/* Absent Checkbox */}
                                                <div className="flex items-center justify-center">
                                                    <Checkbox
                                                        checked={result.is_absent}
                                                        onCheckedChange={(checked) => handleResultChange(index, 'is_absent', checked)}
                                                    />
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center justify-center">
                                                    {getValidationIcon(status)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {errors.results && (
                                <Alert className="mt-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {errors.results}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Exam Info Reference */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Exam Information</h4>
                                <div className="grid gap-2 md:grid-cols-3 text-sm">
                                    <div>
                                        <span className="font-medium">Total Marks:</span> {exam.total_marks}
                                    </div>
                                    <div>
                                        <span className="font-medium">Pass Mark:</span> {exam.pass_mark}
                                    </div>
                                    {exam.has_practical && (
                                        <div>
                                            <span className="font-medium">Theory/Practical:</span> {exam.theory_percentage}%/{exam.practical_percentage}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    {validResults.length} of {results.length} students have complete results
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => {
                                            // Reset all results
                                            const resetResults = students.map(student => ({
                                                student_id: student.id,
                                                theory_score: '',
                                                practical_score: exam.has_practical ? '' : null,
                                                is_absent: false,
                                                student: student
                                            }));
                                            setResults(resetResults);
                                            setData('results', resetResults);
                                        }}
                                    >
                                        Reset All
                                    </Button>
                                    
                                    <Button 
                                        type="submit" 
                                        disabled={processing || validResults.length === 0}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Saving...' : `Save Results (${validResults.length})`}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            )}

            {/* CSV Import Section */}
            {importMode === 'csv' && csvFile && (
                <Card>
                    <CardHeader>
                        <CardTitle>CSV File Processing</CardTitle>
                        <CardDescription>
                            Review and process your uploaded CSV file
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Alert>
                                <FileSpreadsheet className="h-4 w-4" />
                                <AlertDescription>
                                    Ready to process "{csvFile.name}". Make sure your CSV follows the template format.
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-2">
                                <Button onClick={() => {
                                    // Here you would process the CSV file
                                    alert('CSV processing functionality would be implemented here');
                                }}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Process CSV File
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setCsvFile(null);
                                        document.getElementById('csv-file').value = '';
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>First row should contain headers</li>
                                    <li>Student ID column is required</li>
                                    <li>Theory Score column is required</li>
                                    {exam.has_practical && <li>Practical Score column is required</li>}
                                    <li>Is Absent column should contain TRUE or FALSE</li>
                                    <li>Empty scores will be treated as 0</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Help Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Import Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="font-medium mb-2">Scoring Rules</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Scores must be between 0 and {exam.total_marks}</li>
                                <li>• Pass mark for this exam is {exam.pass_mark}</li>
                                {exam.has_practical && (
                                    <>
                                        <li>• Theory component: {exam.theory_percentage}%</li>
                                        <li>• Practical component: {exam.practical_percentage}%</li>
                                    </>
                                )}
                                <li>• Mark students as absent if they didn't take the exam</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium mb-2">Grading System</h4>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{exam.grading_system.name}</p>
                                <div className="space-y-1">
                                    {exam.grading_system.grades?.slice(0, 3).map(grade => (
                                        <div key={grade.id} className="flex justify-between">
                                            <Badge variant="outline">{grade.grade}</Badge>
                                            <span className="text-muted-foreground">
                                                {grade.min_score}-{grade.max_score}
                                            </span>
                                        </div>
                                    ))}
                                    {exam.grading_system.grades?.length > 3 && (
                                        <p className="text-muted-foreground">
                                            +{exam.grading_system.grades.length - 3} more...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}