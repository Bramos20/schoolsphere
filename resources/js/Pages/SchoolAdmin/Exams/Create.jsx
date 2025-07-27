import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus } from 'lucide-react';

export default function CreateExam({ school, classes, subjects, examSeries, categories, gradingSystems }) {
    const [selectedClass, setSelectedClass] = useState('');
    const [availableStreams, setAvailableStreams] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [isForAllClasses, setIsForAllClasses] = useState(false);
    const [isForAllSubjects, setIsForAllSubjects] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        exam_series_id: '',
        exam_category_id: '',
        grading_system_id: '',
        class_id: '',
        stream_id: '',
        subject_id: '',
        name: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_minutes: '',
        total_marks: '',
        pass_mark: '',
        has_practical: false,
        practical_percentage: '',
        theory_percentage: '',
        instructions: '',
        is_for_all_classes: false,
        is_for_all_subjects: false,
        selected_classes: [],
        selected_subjects: [],
        papers: []
    });

    const handleClassChange = (classId) => {
        setSelectedClass(classId);
        const selectedClassObj = classes.find(c => c.id == classId);
        setAvailableStreams(selectedClassObj?.streams || []);
        setData(prev => ({ ...prev, class_id: classId, stream_id: '' }));
    };

    const handleSubjectSelection = (subjectId, checked) => {
        const updated = checked 
            ? [...selectedSubjects, subjectId]
            : selectedSubjects.filter(id => id !== subjectId);
        setSelectedSubjects(updated);
        setData('selected_subjects', updated);
    };

    const addPaper = () => {
        const newPaper = {
            paper_number: data.papers.length + 1,
            paper_name: `Paper ${data.papers.length + 1}`,
            paper_type: 'theory',
            total_marks: 100,
            duration_minutes: 120,
            weight_percentage: 100 / (data.papers.length + 1)
        };
        setData('papers', [...data.papers, newPaper]);
    };

    const updatePaper = (index, field, value) => {
        const updated = [...data.papers];
        updated[index] = { ...updated[index], [field]: value };
        setData('papers', updated);
    };

    const removePaper = (index) => {
        const updated = data.papers.filter((_, i) => i !== index);
        setData('papers', updated);
    };

    const handleSubmit = () => {
        post(`/schools/${school.id}/exams`);
    };

    return (
        <>
            <Head title="Create Exam" />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/schools/${school.id}/exams`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Exams
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
                        <p className="text-gray-600 mt-2">Set up a new exam for your students</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {/* Basic Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Enter the basic details for this exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="exam_series_id">Exam Series *</Label>
                                        <Select value={data.exam_series_id} onValueChange={(value) => setData('exam_series_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select exam series" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {examSeries.map(series => (
                                                    <SelectItem key={series.id} value={series.id.toString()}>
                                                        {series.name} - {series.term} {series.year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exam_series_id && <p className="text-red-500 text-sm mt-1">{errors.exam_series_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="exam_category_id">Category *</Label>
                                        <Select value={data.exam_category_id} onValueChange={(value) => setData('exam_category_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exam_category_id && <p className="text-red-500 text-sm mt-1">{errors.exam_category_id}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="name">Exam Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Mathematics Paper 1"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of the exam"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class and Subject Selection */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Class and Subject Selection</CardTitle>
                                <CardDescription>
                                    Choose which classes and subjects this exam covers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="all_classes"
                                        checked={isForAllClasses}
                                        onCheckedChange={(checked) => {
                                            setIsForAllClasses(checked);
                                            setData('is_for_all_classes', checked);
                                        }}
                                    />
                                    <Label htmlFor="all_classes">This exam is for all classes</Label>
                                </div>

                                {!isForAllClasses && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="class_id">Class *</Label>
                                            <Select value={data.class_id} onValueChange={handleClassChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(cls => (
                                                        <SelectItem key={cls.id} value={cls.id.toString()}>
                                                            {cls.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.class_id && <p className="text-red-500 text-sm mt-1">{errors.class_id}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="stream_id">Stream</Label>
                                            <Select value={data.stream_id} onValueChange={(value) => setData('stream_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select stream (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStreams.map(stream => (
                                                        <SelectItem key={stream.id} value={stream.id.toString()}>
                                                            {stream.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="all_subjects"
                                        checked={isForAllSubjects}
                                        onCheckedChange={(checked) => {
                                            setIsForAllSubjects(checked);
                                            setData('is_for_all_subjects', checked);
                                        }}
                                    />
                                    <Label htmlFor="all_subjects">This exam covers all subjects</Label>
                                </div>

                                {!isForAllSubjects && (
                                    <div>
                                        <Label>Select Subjects *</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded p-3">
                                            {subjects.map(subject => (
                                                <div key={subject.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`subject_${subject.id}`}
                                                        checked={selectedSubjects.includes(subject.id)}
                                                        onCheckedChange={(checked) => handleSubjectSelection(subject.id, checked)}
                                                    />
                                                    <Label htmlFor={`subject_${subject.id}`} className="text-sm">
                                                        {subject.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.selected_subjects && <p className="text-red-500 text-sm mt-1">{errors.selected_subjects}</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exam Papers */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Exam Papers
                                    <Button onClick={addPaper} size="sm" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Paper
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    Set up multiple papers for this exam (e.g., Paper 1, Paper 2, Practical)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.papers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No papers added yet. Click "Add Paper" to create the first paper.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {data.papers.map((paper, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium">Paper {paper.paper_number}</h4>
                                                    <Button
                                                        onClick={() => removePaper(index)}
                                                        size="sm"
                                                        variant="destructive"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label>Paper Name</Label>
                                                        <Input
                                                            value={paper.paper_name}
                                                            onChange={(e) => updatePaper(index, 'paper_name', e.target.value)}
                                                            placeholder="e.g., Theory, Practical"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Paper Type</Label>
                                                        <Select 
                                                            value={paper.paper_type} 
                                                            onValueChange={(value) => updatePaper(index, 'paper_type', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="theory">Theory</SelectItem>
                                                                <SelectItem value="practical">Practical</SelectItem>
                                                                <SelectItem value="oral">Oral</SelectItem>
                                                                <SelectItem value="coursework">Coursework</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Total Marks</Label>
                                                        <Input
                                                            type="number"
                                                            value={paper.total_marks}
                                                            onChange={(e) => updatePaper(index, 'total_marks', e.target.value)}
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Duration (minutes)</Label>
                                                        <Input
                                                            type="number"
                                                            value={paper.duration_minutes}
                                                            onChange={(e) => updatePaper(index, 'duration_minutes', e.target.value)}
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Scheduling</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="date">Exam Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="start_time">Start Time *</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                        />
                                        {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="end_time">End Time *</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                        />
                                        {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                                    <Input
                                        id="duration_minutes"
                                        type="number"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        min="1"
                                    />
                                    {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Grading</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="grading_system_id">Grading System *</Label>
                                    <Select value={data.grading_system_id} onValueChange={(value) => setData('grading_system_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grading system" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradingSystems.map(system => (
                                                <SelectItem key={system.id} value={system.id.toString()}>
                                                    {system.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grading_system_id && <p className="text-red-500 text-sm mt-1">{errors.grading_system_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label htmlFor="total_marks">Total Marks *</Label>
                                        <Input
                                            id="total_marks"
                                            type="number"
                                            value={data.total_marks}
                                            onChange={(e) => setData('total_marks', e.target.value)}
                                            min="1"
                                        />
                                        {errors.total_marks && <p className="text-red-500 text-sm mt-1">{errors.total_marks}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="pass_mark">Pass Mark *</Label>
                                        <Input
                                            id="pass_mark"
                                            type="number"
                                            value={data.pass_mark}
                                            onChange={(e) => setData('pass_mark', e.target.value)}
                                            min="0"
                                        />
                                        {errors.pass_mark && <p className="text-red-500 text-sm mt-1">{errors.pass_mark}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} disabled={processing} className="flex-1">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Exam'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}