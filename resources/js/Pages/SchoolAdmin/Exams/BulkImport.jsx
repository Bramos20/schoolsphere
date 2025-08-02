import React, { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    Upload, 
    Download, 
    FileSpreadsheet, 
    AlertTriangle, 
    CheckCircle,
    ArrowLeft,
    FileText,
    Eye,
    X,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function BulkImportResults({ auth, school, exam, templateUrl }) {
    const [dragActive, setDragActive] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        validate_only: false
    });

    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    // Handle drop event
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, []);

    // Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid Excel (.xlsx, .xls) or CSV file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB.');
            return;
        }

        setData('file', file);
        toast.success(`File "${file.name}" selected successfully.`);
    };

    // Preview file contents
    const handlePreview = () => {
        if (!data.file) {
            toast.error('Please select a file first.');
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('validate_only', 'true');

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        post(route('exams.bulk-import.process', [school.id, exam.id]), {
            data: formData,
            forceFormData: true,
            onSuccess: (response) => {
                setUploadProgress(100);
                setIsProcessing(false);
                clearInterval(progressInterval);
                
                if (response.props?.preview_data) {
                    setPreviewData(response.props.preview_data);
                    setValidationErrors(response.props.validation_errors || []);
                    toast.success('File preview loaded successfully.');
                } else {
                    toast.error('Unable to preview file contents.');
                }
            },
            onError: (errors) => {
                setUploadProgress(0);
                setIsProcessing(false);
                clearInterval(progressInterval);
                setValidationErrors(Object.values(errors).flat());
                toast.error('Error processing file. Please check the format.');
            }
        });
    };

    // Submit import
    const handleImport = () => {
        if (!data.file) {
            toast.error('Please select a file first.');
            return;
        }

        if (validationErrors.length > 0) {
            toast.error('Please fix validation errors before importing.');
            return;
        }

        setIsProcessing(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('validate_only', 'false');

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 15;
            });
        }, 300);

        post(route('exams.bulk-import.process', [school.id, exam.id]), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                setUploadProgress(100);
                setIsProcessing(false);
                clearInterval(progressInterval);
                toast.success('Results imported successfully!');
                router.visit(route('exams.show', [school.id, exam.id]));
            },
            onError: (errors) => {
                setUploadProgress(0);
                setIsProcessing(false);
                clearInterval(progressInterval);
                toast.error('Error importing results. Please try again.');
            }
        });
    };

    // Clear file selection
    const clearFile = () => {
        setData('file', null);
        setPreviewData(null);
        setValidationErrors([]);
        setUploadProgress(0);
    };

    const getFileIcon = (filename) => {
        if (filename?.endsWith('.csv')) return '📄';
        if (filename?.endsWith('.xlsx') || filename?.endsWith('.xls')) return '📊';
        return '📁';
    };

    const hasErrors = validationErrors.length > 0;
    const canImport = data.file && !hasErrors && !isProcessing;

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.visit(route('exams.show', [school.id, exam.id]))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div>
                                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                    Bulk Import Results
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {exam.name} • {exam.exam_series?.name}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <a href={templateUrl} download>
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                        </a>
                    </Button>
                </div>
            }
        >
            <Head title="Bulk Import Results" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Import Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                                    <p>Download the template file using the button above.</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                                    <p>Fill in the student results. Do not modify the header row or student information columns.</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                                    <p>For absent students, leave the marks columns empty or enter "ABS".</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                                    <p>Save the file and upload it using the form below.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Results File</CardTitle>
                            <CardDescription>
                                Supported formats: Excel (.xlsx, .xls) and CSV files
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Drag and Drop Area */}
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                        dragActive 
                                            ? 'border-blue-400 bg-blue-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => handleFileSelect(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    
                                    {data.file ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center space-x-2">
                                                <span className="text-2xl">{getFileIcon(data.file.name)}</span>
                                                <div className="text-left">
                                                    <p className="font-medium">{data.file.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {(data.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handlePreview}
                                                    disabled={isProcessing}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearFile}
                                                    disabled={isProcessing}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto" />
                                            <div>
                                                <p className="text-lg font-medium">Drop your file here</p>
                                                <p className="text-gray-500">or click to browse</p>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Maximum file size: 5MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Progress */}
                                {isProcessing && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Processing file...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription>
                                <div className="space-y-2">
                                    <p className="font-medium text-red-800">
                                        Found {validationErrors.length} validation error(s):
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                        {validationErrors.slice(0, 10).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                        {validationErrors.length > 10 && (
                                            <li className="text-red-600">
                                                ... and {validationErrors.length - 10} more errors
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Preview Data */}
                    {previewData && (
                        <Tabs defaultValue="preview" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                                <TabsTrigger value="summary">Import Summary</TabsTrigger>
                            </TabsList>

                            <TabsContent value="preview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>File Preview</CardTitle>
                                        <CardDescription>
                                            First 10 rows of your import file
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {previewData.headers?.map((header, index) => (
                                                            <TableHead key={index}>{header}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {previewData.rows?.slice(0, 10).map((row, index) => (
                                                        <TableRow key={index}>
                                                            {row.map((cell, cellIndex) => (
                                                                <TableCell key={cellIndex} className="max-w-32 truncate">
                                                                    {cell || '-'}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        
                                        {previewData.total_rows > 10 && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Showing 10 of {previewData.total_rows} rows
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="summary">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Import Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                    <div>
                                                        <p className="font-medium">Valid Records</p>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {previewData.valid_records || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    <div>
                                                        <p className="font-medium">Invalid Records</p>
                                                        <p className="text-2xl font-bold text-red-600">
                                                            {previewData.invalid_records || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="font-medium">Total Records</p>
                                                        <p className="text-2xl font-bold text-blue-600">
                                                            {previewData.total_rows || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {previewData.subjects && (
                                            <div className="mt-6">
                                                <h4 className="font-medium mb-3">Subjects Found:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {previewData.subjects.map((subject, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {subject}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {previewData.warnings && previewData.warnings.length > 0 && (
                                            <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <AlertDescription>
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-yellow-800">Warnings:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                                                            {previewData.warnings.map((warning, index) => (
                                                                <li key={index}>{warning}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('exams.show', [school.id, exam.id]))}
                        >
                            Cancel
                        </Button>
                        
                        <div className="flex space-x-2">
                            {data.file && !previewData && (
                                <Button
                                    variant="outline"
                                    onClick={handlePreview}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 mr-2" />
                                            Preview File
                                        </>
                                    )}
                                </Button>
                            )}
                            
                            <Button
                                onClick={handleImport}
                                disabled={!canImport}
                                className={hasErrors ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import Results
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Tips */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-800 text-lg">💡 Tips for Successful Import</CardTitle>
                        </CardHeader>
                        <CardContent className="text-blue-700 space-y-2 text-sm">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Ensure all student names match exactly with those in the system</li>
                                <li>Use numerical values only for marks (no letters except "ABS" for absent)</li>
                                <li>Don't modify the template structure or column headers</li>
                                <li>Save Excel files in .xlsx format for best compatibility</li>
                                <li>Check for empty rows or cells that might cause import issues</li>
                                <li>Always preview your data before final import</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}