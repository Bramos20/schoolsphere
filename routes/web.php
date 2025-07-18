<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanyAdminController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherSubjectController;
use App\Http\Controllers\StreamSubjectController;
use App\Http\Controllers\StreamTeacherController;
use App\Http\Controllers\SubjectStreamTeacherController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ExpenditureController;
use App\Http\Controllers\CapitationController;
use App\Http\Controllers\AccountsDashboardController;
use App\Http\Controllers\DefaultersReportController;
use App\Http\Controllers\PaymentLedgerController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\StaffAttendanceController;
use App\Http\Controllers\BookCategoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BookIssueController;

/*
|--------------------------------------------------------------------------
| Public Landing Page
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated User Dashboard
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

/*
|--------------------------------------------------------------------------
| Profile Routes (All Roles)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');

    Route::get('/companies/{company}/admins', [CompanyAdminController::class, 'index'])->name('company.admins.index');
    Route::post('/companies/{company}/admins', [CompanyAdminController::class, 'store'])->name('company.admins.store');
});

/*
|--------------------------------------------------------------------------
| Company Admin Dashboard & Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:company_admin'])->group(function () {
    Route::get('/company-dashboard', function () {
        return Inertia::render('Company/Dashboard', [
            'company' => auth()->user()->company,
        ]);
    })->name('company.dashboard');

    Route::get('/schools', [SchoolController::class, 'index'])->name('schools.index');
    Route::post('/schools', [SchoolController::class, 'store'])->name('schools.store');
    Route::delete('/schools/{school}', [SchoolController::class, 'destroy'])->name('schools.destroy');
    Route::get('/schools/{school}/assign-admin', [SchoolController::class, 'showAssignAdminForm'])->name('schools.assignAdmin');
    Route::post('/schools/{school}/assign-admin', [SchoolController::class, 'assignAdmin'])->name('schools.assignAdmin');

});

/*
|--------------------------------------------------------------------------
| school Admin Dashboard & Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:school_admin'])->group(function () {
    Route::resource('/schools/{school}/books', BookController::class);
    Route::resource('/schools/{school}/book-categories', BookCategoryController::class);
    Route::resource('/schools/{school}/book-issues', BookIssueController::class);

    Route::get('/schools/{school}/departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::post('/schools/{school}/departments', [DepartmentController::class, 'store'])->name('departments.store');

    Route::get('/schools/{school}/staff', [StaffController::class, 'index'])->name('staff.index');
    Route::post('/schools/{school}/staff', [StaffController::class, 'store'])->name('staff.store');

    Route::get('/schools/{school}/classes', [ClassController::class, 'index'])->name('classes.index');
    Route::post('/schools/{school}/classes', [ClassController::class, 'store'])->name('classes.store');

    Route::get('/schools/{school}/subjects', [SubjectController::class, 'index'])->name('subjects.index');
    Route::post('/schools/{school}/subjects', [SubjectController::class, 'store'])->name('subjects.store');
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    Route::get('/schools/{school}/teacher-subjects', [TeacherSubjectController::class, 'index'])->name('teacher-subjects.index');
    Route::post('/schools/{school}/teacher-subjects/assign', [TeacherSubjectController::class, 'assign'])->name('teacher-subjects.assign');
    Route::delete('/schools/{school}/teacher-subjects/unassign', [TeacherSubjectController::class, 'unassign'])->name('teacher-subjects.unassign');

    Route::get('/schools/{school}/stream-subjects', [StreamSubjectController::class, 'index'])->name('stream-subjects.index');
    Route::post('/schools/{school}/stream-subjects/assign', [StreamSubjectController::class, 'assign'])->name('stream-subjects.assign');
    Route::delete('/schools/{school}/stream-subjects/unassign', [StreamSubjectController::class, 'unassign'])->name('stream-subjects.unassign');

    Route::get('/schools/{school}/stream-teachers', [StreamTeacherController::class, 'index'])->name('stream-teachers.index');
    Route::post('/schools/{school}/stream-teachers/assign', [StreamTeacherController::class, 'assign'])->name('stream-teachers.assign');
    Route::delete('/schools/{school}/stream-teachers/unassign', [StreamTeacherController::class, 'unassign'])->name('stream-teachers.unassign');

    Route::get('/schools/{school}/subject-stream-teachers', [SubjectStreamTeacherController::class, 'index'])->name('subject-stream-teachers.index');
    Route::post('/schools/{school}/subject-stream-teachers/assign', [SubjectStreamTeacherController::class, 'assign'])->name('subject-stream-teachers.assign');
    Route::delete('/schools/{school}/subject-stream-teachers/unassign', [SubjectStreamTeacherController::class, 'unassign'])->name('subject-stream-teachers.unassign');

    // Fee Structures
    Route::get('/schools/{school}/fees', [FeeStructureController::class, 'index'])->name('fees.index');
    Route::post('/schools/{school}/fees', [FeeStructureController::class, 'store'])->name('fees.store');

    // Student Payments
    Route::get('/schools/{school}/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/schools/{school}/payments', [PaymentController::class, 'store'])->name('payments.store');

    Route::get('/schools/{school}/expenditures', [ExpenditureController::class, 'index'])->name('expenditures.index');
    Route::post('/schools/{school}/expenditures', [ExpenditureController::class, 'store'])->name('expenditures.store');
    Route::delete('/schools/{school}/expenditures/{expenditure}', [ExpenditureController::class, 'destroy'])->name('expenditures.destroy');

    Route::get('/schools/{school}/capitations', [CapitationController::class, 'index'])->name('capitations.index');
    Route::post('/schools/{school}/capitations', [CapitationController::class, 'store'])->name('capitations.store');

    Route::get('/schools/{school}/accounts-dashboard', [AccountsDashboardController::class, 'index'])
        ->name('accounts.dashboard');
    Route::get('/schools/{school}/cashflow', [AccountsDashboardController::class, 'cashflow'])
        ->name('accounts.cashflow');
    Route::get('/schools/{school}/cashflow/export-pdf', [AccountsDashboardController::class, 'exportPdf'])
        ->name('cashflow.exportPdf');

    Route::get('/schools/{school}/defaulters-report', [DefaultersReportController::class, 'index'])
        ->name('defaulters.index');
    Route::get('/schools/{school}/defaulters-report/pdf', [DefaultersReportController::class, 'exportPdf'])
        ->name('defaulters.exportPdf');

    Route::get('/schools/{school}/students/{student}/ledger', [PaymentLedgerController::class, 'show'])
        ->name('students.ledger');
    Route::get('/schools/{school}/students/{student}/ledger/pdf', [PaymentLedgerController::class, 'exportPdf'])
        ->name('students.ledger.pdf');

    Route::put('/leaves/{leave}/status', [LeaveController::class, 'updateStatus'])->name('leaves.updateStatus');

});

Route::middleware(['auth'])->group(function () {
    Route::get('/schools/{school}/leaves', [LeaveController::class, 'index'])->name('leaves.index');
    Route::post('/schools/{school}/leaves', [LeaveController::class, 'store'])->name('leaves.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/schools/{school}/staff-attendance', [StaffAttendanceController::class, 'index'])->name('staff-attendance.index');
    Route::post('/schools/{school}/staff-attendance', [StaffAttendanceController::class, 'store'])->name('staff-attendance.store');
});

/*
|--------------------------------------------------------------------------
| HOD Dashboard & Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:hod'])->group(function () {
    Route::get('/schools/{school}/students/create', [StudentController::class, 'create'])->name('students.create');
    Route::post('/schools/{school}/students', [StudentController::class, 'store'])->name('students.store');
    Route::get('/schools/{school}/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/schools/{school}/students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
    Route::put('/schools/{school}/students/{student}', [StudentController::class, 'update'])->name('students.update');
});


Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest');
