import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Clock, BookOpen, Users, Settings, Check } from 'lucide-react';

export default function CreateExam({ school, classes, subjects, examSeries, categories, gradingSystems }) {
    const [selectedClass, setSelectedClass] = useState(null);
    const [availableStreams, setAvailableStreams] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        exam_series_id: examSeries.find(s => s.is_active)?.id || '',
        exam_category_id: categories[0]?.id || '',
        grading_system_id: gradingSystems.find(g => g.is_default)?.id || gradingSystems[0]?.id || '',
        class_id: '',
        stream_id: '',
        subject_id: '',
        name: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_minutes: 120,
        total_marks: 100,
        pass_mark: 50,
        has_practical: false,
        practical_percentage: 30,
        theory_percentage: 70,
        instructions: ''
    });

    useEffect(() => {
        if (data.class_id) {
            const classData = classes.find(c => c.id === parseInt(data.class_id));
            setSelectedClass(classData);
            setAvailableStreams(classData?.streams || []);
            setData('stream_id', ''); // Reset stream selection
        }
    }, [data.class_id]);

    useEffect(() => {
        if (data.has_practical && (data.practical_percentage + data.theory_percentage !== 100)) {
            setData('theory_percentage', 100 - data.practical_percentage);
        }
    }, [data.practical_percentage, data.has_practical]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exams.store', school.id));
    };

    const generateExamName = () => {
        const category = categories.find(c => c.id === parseInt(data.exam_category_id));
        const subject = subjects.find(s => s.id === parseInt(data.subject_id));
        const className = classes.find(c => c.id === parseInt(data.class_id));
        const stream = availableStreams.find(s => s.id === parseInt(data.stream_id));
        
        if (category && subject && className) {
            let name = `${category.name} - ${subject.name} - ${className.name}`;
            if (stream) name += ` ${stream.name}`;
            setData('name', name);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Head title="Create Exam" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
                    <p className="text-gray-600 mt-2">Set up a new examination for {school.name}</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-900">Basic Info</span>
                            </div>
                            <div className="w-16 h-1 bg-gray-200 rounded"></div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    2
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-600">Schedule</span>
                            </div>
                            <div className="w-16 h-1 bg-gray-200 rounded"></div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-600">Settings</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Exam Series */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Series <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.exam_series_id}
                                    onChange={(e) => setData('exam_series_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select exam series...</option>
                                    {examSeries.map(series => (
                                        <option key={series.id} value={series.id}>
                                            {series.name} - {series.academic_year} Term {series.term}
                                        </option>
                                    ))}
                                </select>
                                {errors.exam_series_id && <p className="text-red-500 text-sm mt-1">{errors.exam_series_id}</p>}
                            </div>

                            {/* Exam Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.exam_category_id}
                                    onChange={(e) => setData('exam_category_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} ({category.weight_percentage}% weight)
                                        </option>
                                    ))}
                                </select>
                                {errors.exam_category_id && <p className="text-red-500 text-sm mt-1">{errors.exam_category_id}</p>}
                            </div>

                            {/* Class */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData('class_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select class...</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && <p className="text-red-500 text-sm mt-1">{errors.class_id}</p>}
                            </div>

                            {/* Stream */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stream (Optional)
                                </label>
                                <select
                                    value={data.stream_id}
                                    onChange={(e) => setData('stream_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    disabled={!data.class_id}
                                >
                                    <option value="">All streams in class</option>
                                    {availableStreams.map(stream => (
                                        <option key={stream.id} value={stream.id}>
                                            {stream.name}
                                        </option>
                                    ))}
                                </select>
                                {!data.class_id && (
                                    <p className="text-gray-500 text-sm mt-1">Select a class first to choose streams</p>
                                )}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select subject...</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
                            </div>

                            {/* Grading System */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grading System <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.grading_system_id}
                                    onChange={(e) => setData('grading_system_id', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                >
                                    {gradingSystems.map(system => (
                                        <option key={system.id} value={system.id}>
                                            {system.name} {system.is_default && '(Default)'}
                                        </option>
                                    ))}
                                </select>
                                {errors.grading_system_id && <p className="text-red-500 text-sm mt-1">{errors.grading_system_id}</p>}
                            </div>
                        </div>

                        {/* Exam Name */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Exam Name <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="e.g., CAT 1 - Mathematics - Form 1A"
                                />
                                <button
                                    type="button"
                                    onClick={generateExamName}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
                                    disabled={!data.exam_category_id || !data.subject_id || !data.class_id}
                                >
                                    Auto-generate
                                </button>
                            </div>
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Additional details about this exam..."
                            />
                        </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <Calendar className="w-6 h-6 text-green-600 mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">Schedule & Timing</h2>
                        </div>Icon className="w-6 h-6 text-green-600 mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">Schedule & Timing</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (Minutes) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                min="1"
                            />
                            {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                        </div>
                    </div>

                    {/* Exam Settings Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Settings className="w-6 h-6 text-purple-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Exam Settings</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Marks */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Marks <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.total_marks}
                                    onChange={(e) => setData('total_marks', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    min="1"
                                />
                                {errors.total_marks && <p className="text-red-500 text-sm mt-1">{errors.total_marks}</p>}
                            </div>

                            {/* Pass Mark */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pass Mark <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={data.pass_mark}
                                    onChange={(e) => setData('pass_mark', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    min="0"
                                    max={data.total_marks}
                                />
                                {errors.pass_mark && <p className="text-red-500 text-sm mt-1">{errors.pass_mark}</p>}
                            </div>
                        </div>

                        {/* Practical Component */}
                        <div className="mt-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.has_practical}
                                    onChange={(e) => setData('has_practical', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    This exam has a practical component
                                </label>
                            </div>

                            {data.has_practical && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Theory Percentage
                                        </label>
                                        <input
                                            type="number"
                                            value={data.theory_percentage}
                                            onChange={(e) => setData('theory_percentage', parseFloat(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Practical Percentage
                                        </label>
                                        <input
                                            type="number"
                                            value={data.practical_percentage}
                                            onChange={(e) => setData('practical_percentage', parseFloat(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>
                                    {(data.theory_percentage + data.practical_percentage) !== 100 && (
                                        <div className="col-span-2">
                                            <p className="text-red-500 text-sm">
                                                Theory and practical percentages must add up to 100%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Advanced Options */}
                        {showAdvanced && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Instructions</h3>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Special instructions for students, teachers, or invigilators..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Exam...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Create Exam
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}