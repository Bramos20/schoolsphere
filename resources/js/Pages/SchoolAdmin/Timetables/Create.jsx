import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Create({ school, classes, subjects, teachers }) {
    const { data, setData, post, processing, errors } = useForm({
        class_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('timetables.store', school));
    };

    return (
        <AppLayout>
            <Head title="Create Timetable Entry" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold">Create Timetable Entry</h1>
                            <form onSubmit={submit}>
                                <div className="mt-4">
                                    <InputLabel htmlFor="class_id" value="Class" />
                                    <select
                                        id="class_id"
                                        name="class_id"
                                        value={data.class_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('class_id', e.target.value)}
                                    >
                                        <option value="">Select a class</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.class_id} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="subject_id" value="Subject" />
                                    <select
                                        id="subject_id"
                                        name="subject_id"
                                        value={data.subject_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.subject_id} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="teacher_id" value="Teacher" />
                                    <select
                                        id="teacher_id"
                                        name="teacher_id"
                                        value={data.teacher_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                    >
                                        <option value="">Select a teacher</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.teacher_id} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="day_of_week" value="Day of Week" />
                                    <select
                                        id="day_of_week"
                                        name="day_of_week"
                                        value={data.day_of_week}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('day_of_week', e.target.value)}
                                    >
                                        <option value="">Select a day</option>
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                    </select>
                                    <InputError message={errors.day_of_week} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="start_time" value="Start Time" />
                                    <TextInput
                                        id="start_time"
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    <InputError message={errors.start_time} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="end_time" value="End Time" />
                                    <TextInput
                                        id="end_time"
                                        type="time"
                                        name="end_time"
                                        value={data.end_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    <InputError message={errors.end_time} className="mt-2" />
                                </div>
                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Create
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
