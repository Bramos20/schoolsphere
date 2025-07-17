<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Defaulters Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; }
        th { background-color: #f0f0f0; }
        h2 { text-align: center; }
    </style>
</head>
<body>
    <h2>Defaulters Report - {{ $school->name }}</h2>
    <p>
        <strong>Term:</strong> {{ $term }} |
        <strong>Year:</strong> {{ $year }}
        @if ($class_id)
            | <strong>Class:</strong> {{ \App\Models\SchoolClass::find($class_id)?->name ?? '-' }}
        @endif
        @if ($stream_id)
            | <strong>Stream:</strong> {{ \App\Models\Stream::find($stream_id)?->name ?? '-' }}
        @endif
    </p>

    <table>
        <thead>
            <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Stream</th>
                <th>Expected (KES)</th>
                <th>Paid (KES)</th>
                <th>Balance (KES)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $student)
                <tr>
                    <td>{{ $student['student_name'] }}</td>
                    <td>{{ $student['class_name'] }}</td>
                    <td>{{ $student['stream_name'] ?? '-' }}</td>
                    <td>{{ number_format($student['expected']) }}</td>
                    <td>{{ number_format($student['paid']) }}</td>
                    <td>{{ number_format($student['balance']) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>