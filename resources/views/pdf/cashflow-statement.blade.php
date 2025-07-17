<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cash Flow Statement</title>
    <style>
        body { font-family: sans-serif; font-size: 13px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 6px; text-align: left; border: 1px solid #ccc; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <h2>Cash Flow Statement - {{ $school->name }}</h2>
    <p><strong>Term:</strong> {{ $term }} | <strong>Year:</strong> {{ $year }}</p>

    <table>
        <tr>
            <th colspan="2">Cash Inflows</th>
        </tr>
        <tr>
            <td>Fees Collected</td>
            <td>KES {{ number_format($feesCollected) }}</td>
        </tr>
        <tr>
            <td>Government Capitation</td>
            <td>KES {{ number_format($capitationReceived) }}</td>
        </tr>

        <tr>
            <th colspan="2">Cash Outflows</th>
        </tr>
        <tr>
            <td>Expenditures</td>
            <td>KES {{ number_format($expenditures) }}</td>
        </tr>

        <tr>
            <th colspan="2">Net Cash Flow</th>
        </tr>
        <tr>
            <td colspan="2" style="font-weight: bold; color: {{ $net >= 0 ? 'green' : 'red' }}">
                {{ $net >= 0 ? 'Surplus' : 'Deficit' }}: KES {{ number_format($net) }}
            </td>
        </tr>
    </table>
</body>
</html>