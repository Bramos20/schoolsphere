import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Copy, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GradingSystemCreate({ school, templates }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        type: 'letter',
        grades: [],
        is_default: false
    });

    const [selectedTemplate, setSelectedTemplate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('grading-systems.store', school.id));
    };

    const handleTemplateSelect = (templateKey) => {
        if (templateKey && templates[templateKey]) {
            const template = templates[templateKey];
            setData({
                ...data,
                name: template.name,
                type: template.type,
                grades: template.grades
            });
            setSelectedTemplate(templateKey);
        }
    };

    const addGrade = () => {
        setData('grades', [
            ...data.grades,
            {
                grade: '',
                min_score: '',
                max_score: '',
                points: '',
                remarks: ''
            }
        ]);
    };

    const updateGrade = (index, field, value) => {
        const updatedGrades = [...data.grades];
        updatedGrades[index][field] = value;
        setData('grades', updatedGrades);
    };

    const removeGrade = (index) => {
        const updatedGrades = data.grades.filter((_, i) => i !== index);
        setData('grades', updatedGrades);
    };

    const validateGrades = () => {
        const issues = [];
        
        // Check for overlapping score ranges
        for (let i = 0; i < data.grades.length; i++) {
            for (let j = i + 1; j < data.grades.length; j++) {
                const grade1 = data.grades[i];
                const grade2 = data.grades[j];
                
                if (grade1.min_score <= grade2.max_score && grade1.max_score >= grade2.min_score) {
                    issues.push(`Grades ${grade1.grade} and ${grade2.grade} have overlapping score ranges`);
                }
            }
        }
        
        // Check for gaps in coverage
        const sortedGrades = [...data.grades].sort((a, b) => a.min_score - b.min_score);
        for (let i = 0; i < sortedGrades.length - 1; i++) {
            if (sortedGrades[i].max_score + 1 < sortedGrades[i + 1].min_score) {
                issues.push(`Gap in score coverage between ${sortedGrades[i].max_score} and ${sortedGrades[i + 1].min_score}`);
            }
        }
        
        return issues;
    };

    const validationIssues = validateGrades();

    return (
        <div className="space-y-6">
            <Head title="Create Grading System" />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={route('grading-systems.index', school.id)}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Grading System</h1>
                    <p className="text-muted-foreground">
                        Set up a new grading system for your school
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Configure the basic settings for your grading system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* System Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">System Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., KCSE Grading System"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description of this grading system"
                                    rows={3}
                                />
                            </div>

                            {/* Type and Default */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="letter">Letter Grades (A, B, C...)</SelectItem>
                                            <SelectItem value="number">Number Grades (1, 2, 3...)</SelectItem>
                                            <SelectItem value="percentage">Percentage Based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 mt-8">
                                    <Checkbox
                                        id="is_default"
                                        checked={data.is_default}
                                        onCheckedChange={(checked) => setData('is_default', checked)}
                                    />
                                    <Label htmlFor="is_default" className="text-sm font-medium">
                                        Set as default grading system
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grades Configuration */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Grade Configuration</CardTitle>
                                    <CardDescription>
                                        Define the grades and their score ranges
                                    </CardDescription>
                                </div>
                                <Button onClick={addGrade} variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Grade
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Validation Issues */}
                            {validationIssues.length > 0 && (
                                <Alert className="mb-4">
                                    <AlertDescription>
                                        <div className="space-y-1">
                                            <p className="font-medium">Please fix the following issues:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {validationIssues.map((issue, index) => (
                                                    <li key={index} className="text-sm">{issue}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {data.grades.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        <div className="grid grid-cols-6 gap-2 pb-2 border-b font-medium text-sm">
                                            <div>Grade</div>
                                            <div>Min Score</div>
                                            <div>Max Score</div>
                                            <div>Points</div>
                                            <div>Remarks</div>
                                            <div></div>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            {data.grades.map((grade, index) => (
                                                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                                                    <div>
                                                        <Input
                                                            value={grade.grade}
                                                            onChange={(e) => updateGrade(index, 'grade', e.target.value)}
                                                            placeholder="A"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={grade.min_score}
                                                            onChange={(e) => updateGrade(index, 'min_score', e.target.value)}
                                                            placeholder="80"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={grade.max_score}
                                                            onChange={(e) => updateGrade(index, 'max_score', e.target.value)}
                                                            placeholder="100"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={grade.points}
                                                            onChange={(e) => updateGrade(index, 'points', e.target.value)}
                                                            placeholder="12"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            value={grade.remarks}
                                                            onChange={(e) => updateGrade(index, 'remarks', e.target.value)}
                                                            placeholder="Excellent"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeGrade(index)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No grades defined</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Add grades to define your grading system or use a template.
                                    </p>
                                    <Button onClick={addGrade}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Grade
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={processing || data.grades.length === 0}
                                >
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Grading System
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Templates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Copy className="h-5 w-5" />
                                Templates
                            </CardTitle>
                            <CardDescription>
                                Use predefined grading systems
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(templates).map(([key, template]) => (
                                <div key={key} className="space-y-2">
                                    <Button
                                        variant={selectedTemplate === key ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => handleTemplateSelect(key)}
                                    >
                                        {template.name}
                                    </Button>
                                    <div className="text-xs text-muted-foreground px-2">
                                        {template.grades.length} grades • {template.type} based
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    {data.grades.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>
                                    How your grading system will appear
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {data.grades
                                        .sort((a, b) => b.min_score - a.min_score)
                                        .map((grade, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {grade.grade}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {grade.min_score}-{grade.max_score}%
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">{grade.points} pts</span>
                                                    {grade.remarks && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {grade.remarks}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Guidelines */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>• Ensure score ranges don't overlap</p>
                                <p>• Cover the full 0-100 score range</p>
                                <p>• Use consistent point values</p>
                                <p>• Higher scores should have higher points</p>
                                <p>• Test the system before setting as default</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Grades defined:</span>
                                <Badge variant="outline">{data.grades.length}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Validation issues:</span>
                                <Badge variant={validationIssues.length > 0 ? "destructive" : "default"}>
                                    {validationIssues.length}
                                </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Ready to save:</span>
                                <Badge variant={data.grades.length > 0 && validationIssues.length === 0 ? "default" : "outline"}>
                                    {data.grades.length > 0 && validationIssues.length === 0 ? "Yes" : "No"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}