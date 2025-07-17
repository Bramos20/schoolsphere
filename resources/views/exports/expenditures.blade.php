<table>
    <thead>
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Paid To</th>
            <th>Amount</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($expenditures as $exp)
        <tr>
            <td>{{ $exp->date }}</td>
            <td>{{ $exp->description }}</td>
            <td>{{ $exp->category }}</td>
            <td>{{ $exp->paid_to }}</td>
            <td>{{ $exp->amount }}</td>
        </tr>
        @endforeach
    </tbody>
</table>