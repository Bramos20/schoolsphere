import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Upload, Users, BookOpen, Calculator, Save, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BulkResultsImport({ school, exam, students }) {
    const [importMethod, setImportMethod] = useState('manual'); // 'manual' or 'excel'
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    
    const { data, setData, post, processing, errors } = useForm({
        results: students.map(student => ({
            student_id: student.id,
            theory_score: '',
            practical_score: exam.has_practical ? '' : null,
            is_absent: false
        }))
    });

    const handleStudentSelection = (studentId, checked) => {
        const newSelected = new Set(selectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const selectAllStudents = () => {
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(students.map(s => s.id)));
        }
    };

    const updateResult = (studentIndex, field, value) => {
        const newResults = [...data.results];
        newResults[studentIndex][field] = value;
        
        // If marking as absent, clear scores
        if (field === 'is_absent' && value) {
            newResults[studentIndex].theory_score = '';
            newResults[studentIndex].practical_score = '';
        }
        
        setData('results', newResults);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter only results with data
        const filteredResults = data.results.filter(result => 
            result.theory_score !== '' || 
            result.practical_score !== '' || 
            result.is_absent
        );

        post(route('exams.bulk-results.store', [school.id, exam.id]), {
            data: { results: filteredResults }
        });
    };

    const calculateTotalScore = (theoryScore, practicalScore) => {
        if (!theoryScore && !practicalScore) return '';
        
        const theory = parseFloat(theoryScore) || 0;
        const practical = parseFloat(practicalScore) || 0;
        
        if (exam.has_practical) {
            const theoryContribution = (theory * exam.theory_percentage) / 100;
            const practicalContribution = (practical * exam.practical_percentage) / 100;
            return Math.round((theoryContribution + practicalContribution) * 100) / 100;
        }
        
        return theory;
    };

    const getGradeForScore = (score) => {
        if (!score) return '';
        
        // This would normally come from the grading system
        // For demo purposes, using basic grading
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'E';
    };

    const validResults = data.results.filter(result => 
        result.theory_score !== '' || result.practical_score !== '' || result.is_absent
    ).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Head title={`Import Results - ${exam.name}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Import Exam Results</h1>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {exam.name}
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {students.length} students
                        </div>
                        <div className="flex items-center">
                            <Calculator className="w-4 h-4 mr-1" />
                            Total: {exam.total_marks} marks
                        </div>
                    </div>
                </div>

                {/* Exam Info Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{exam.total_marks}</div>
                            <div className="text-sm text-gray-600">Total Marks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{exam.pass_mark}</div>
                            <div className="text-sm text-gray-600">Pass Mark</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{exam.duration_minutes}</div>
                            <div className="text-sm text-gray-600">Minutes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {exam.has_practical ? 'Theory + Practical' : 'Theory Only'}
                            </div>
                            <div className="text-sm text-gray-600">Components</div>
                        </div>
                    </div>

                    {exam.has_practical && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex justify-center space-x-8 text-sm">
                                <div>
                                    <span className="font-medium text-blue-700">Theory:</span>
                                    <span className="ml-1">{exam.theory_percentage}%</span>
                                </div>
                                <div>
                                    <span className="font-medium text-green-700">Practical:</span>
                                    <span className="ml-1">{exam.practical_percentage}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Import Method Selection */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Method</h2>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="manual"
                                checked={importMethod === 'manual'}
                                onChange={(e) => setImportMethod(e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Manual Entry</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="excel"
                                checked={importMethod === 'excel'}
                                onChange={(e) => setImportMethod(e.target.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Excel Upload</span>
                        </label>
                    </div>
                </div>

                {importMethod === 'excel' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                        <div className="text-center py-12">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Excel File</h3>
                            <p className="text-gray-600 mb-4">
                                Download the template, fill in the results, and upload the completed file.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Download Template
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Upload Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {importMethod === 'manual' && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Results Summary */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                        <span className="text-sm font-medium">
                                            {validResults} of {students.length} results entered
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                                        <span className="text-sm font-medium">
                                            {students.length - validResults} pending
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        type="button"
                                        onClick={selectAllStudents}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.size === students.length}
                                                onChange={(e) => selectAllStudents()}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Theory Score
                                        </th>
                                        {exam.has_practical && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Practical Score
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Grade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student, index) => {
                                        const result = data.results[index];
                                        const totalScore = calculateTotalScore(result.theory_score, result.practical_score);
                                        const grade = getGradeForScore(totalScore);
                                        
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.has(student.id)}
                                                        onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.first_name} {student.last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {student.admission_number}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={result.theory_score}
                                                        onChange={(e) => updateResult(index, 'theory_score', e.target.value)}
                                                        disabled={result.is_absent}
                                                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                                        min="0"
                                                        max={exam.total_marks}
                                                        placeholder="0"
                                                    />
                                                </td>
                                                {exam.has_practical && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            value={result.practical_score}
                                                            onChange={(e) => updateResult(index, 'practical_score', e.target.value)}
                                                            disabled={result.is_absent}
                                                            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                                            min="0"
                                                            max={exam.total_marks}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {result.is_absent ? 'ABS' : totalScore || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        result.is_absent ? 'bg-red-100 text-red-800' :
                                                        grade === 'A' ? 'bg-green-100 text-green-800' :
                                                        grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                                        grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                                        grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                                        grade === 'E' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {result.is_absent ? 'ABS' : grade || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={result.is_absent}
                                                            onChange={(e) => updateResult(index, 'is_absent', e.target.checked)}
                                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-600">Absent</span>
                                                    </label>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Submit Section */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div>Results entered: {validResults}/{students.length}</div>
                                    <div>Pass rate: {validResults > 0 ? Math.round((data.results.filter(r => calculateTotalScore(r.theory_score, r.practical_score) >= exam.pass_mark).length / validResults) * 100) : 0}%</div>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing || validResults === 0}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving Results...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Results ({validResults})
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}