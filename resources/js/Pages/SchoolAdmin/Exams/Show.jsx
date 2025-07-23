import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Show({ school, exam }) {
    return (
        <AppLayout>
            <Head title="Exam Details" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold">Exam Details</h1>
                                <Link href={route('exam_results.create', exam)} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                                    Add Result
                                </Link>
                            </div>
                            <div className="mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold">Name</h2>
                                        <p>{exam.name}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Class</h2>
                                        <p>{exam.class.name}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Subject</h2>
                                        <p>{exam.subject.name}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Date</h2>
                                        <p>{exam.date}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Start Time</h2>
                                        <p>{exam.start_time}</p>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">End Time</h2>
                                        <p>{exam.end_time}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h2 className="text-lg font-bold">Results</h2>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Grade
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {exam.results.map((result) => (
                                            <tr key={result.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{result.student.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{result.score}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{result.grade}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
