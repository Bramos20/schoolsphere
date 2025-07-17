<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Ledger - {{ $student->name }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
        th { background-color: #eee; }
    </style>
</head>
<body>
    <h2>Payment Ledger</h2>
    <p><strong>Name:</strong> {{ $student->name }}</p>
    <p><strong>Class:</strong> {{ $student->class ?? 'N/A' }} | <strong>Stream:</strong> {{ $student->stream ?? 'N/A' }}</p>

    @forelse($ledger as $term => $records)
        <h4>{{ $term }}</h4>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount (KES)</th>
                    <th>Method</th>
                    <th>Description</th>
                    <th>Balance After</th>
                </tr>
            </thead>
            <tbody>
                @foreach($records as $row)
                    <tr>
                        <td>{{ $row['date'] }}</td>
                        <td>{{ number_format($row['amount']) }}</td>
                        <td>{{ $row['method'] }}</td>
                        <td>{{ $row['reference'] }}</td>
                        <td>{{ number_format($row['balance']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @empty
        <p>No payment records available.</p>
    @endforelse
</body>
</html>