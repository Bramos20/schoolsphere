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
use App\Http\Controllers\RequisitionController;
use App\Http\Controllers\ExamResultController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\GradingSystemController;
use App\Http\Controllers\ExamCategoryController;
use App\Http\Controllers\ExamSeriesController;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\GradingSystem;

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

Route::middleware(['auth'])->group(function () {
    Route::prefix('schools/{school}')->group(function () {
        Route::get('requisitions', [RequisitionController::class, 'index'])->name('requisitions.index');
        Route::get('requisitions/create', [RequisitionController::class, 'create'])->name('requisitions.create');
        Route::post('requisitions', [RequisitionController::class, 'store'])->name('requisitions.store');
        Route::get('requisitions/{requisition}', [RequisitionController::class, 'show'])->name('requisitions.show');
        Route::post('requisitions/{requisition}/approve', [RequisitionController::class, 'approve'])->name('requisitions.approve');
        Route::post('requisitions/{requisition}/reject', [RequisitionController::class, 'reject'])->name('requisitions.reject');
    });

    Route::prefix('schools/{school}')->group(function () {
        Route::resource('timetables', TimetableController::class);
    });
});

// Grading Systems Routes
Route::prefix('schools/{school}')->group(function () {
    Route::get('/grading-systems', [GradingSystemController::class, 'index'])->name('grading-systems.index');
    Route::get('/grading-systems/create', [GradingSystemController::class, 'create'])->name('grading-systems.create');
    Route::post('/grading-systems', [GradingSystemController::class, 'store'])->name('grading-systems.store');
    Route::get('/grading-systems/{gradingSystem}/edit', [GradingSystemController::class, 'edit'])->name('grading-systems.edit');
    Route::put('/grading-systems/{gradingSystem}', [GradingSystemController::class, 'update'])->name('grading-systems.update');
    Route::delete('/grading-systems/{gradingSystem}', [GradingSystemController::class, 'destroy'])->name('grading-systems.destroy');
    Route::post('/grading-systems/{gradingSystem}/set-default', [GradingSystemController::class, 'setDefault'])->name('grading-systems.set-default');
});

// Exam Categories Routes
Route::prefix('schools/{school}')->group(function () {
    Route::get('/exam-categories', [ExamCategoryController::class, 'index'])->name('exam-categories.index');
    Route::post('/exam-categories', [ExamCategoryController::class, 'store'])->name('exam-categories.store');
    Route::put('/exam-categories/{examCategory}', [ExamCategoryController::class, 'update'])->name('exam-categories.update');
    Route::delete('/exam-categories/{examCategory}', [ExamCategoryController::class, 'destroy'])->name('exam-categories.destroy');
});

// Exam Series Routes
Route::prefix('schools/{school}')->group(function () {
    Route::get('/exam-series', [ExamSeriesController::class, 'index'])->name('exam-series.index');
    Route::get('/exam-series/create', [ExamSeriesController::class, 'create'])->name('exam-series.create');
    Route::post('/exam-series', [ExamSeriesController::class, 'store'])->name('exam-series.store');
    Route::get('/exam-series/{examSeries}', [ExamSeriesController::class, 'show'])->name('exam-series.show');
    Route::get('/exam-series/{examSeries}/edit', [ExamSeriesController::class, 'edit'])->name('exam-series.edit');
    Route::put('/exam-series/{examSeries}', [ExamSeriesController::class, 'update'])->name('exam-series.update');
    Route::delete('/exam-series/{examSeries}', [ExamSeriesController::class, 'destroy'])->name('exam-series.destroy');
    Route::get('/exam-series/{examSeries}/reports', [ExamSeriesController::class, 'generateTermReports'])->name('exam-series.reports');
    Route::post('/exam-series/{examSeries}/publish', [ExamSeriesController::class, 'publish'])->name('exam-series.publish');
});

// Enhanced Exam Routes
Route::prefix('schools/{school}')->group(function () {
    Route::get('/exams', [ExamController::class, 'index'])->name('exams.index');
    Route::get('/exams/create', [ExamController::class, 'create'])->name('exams.create');
    Route::post('/exams', [ExamController::class, 'store'])->name('exams.store');
    Route::get('/exams/{exam}', [ExamController::class, 'show'])->name('exams.show');
    Route::get('/exams/{exam}/edit', [ExamController::class, 'edit'])->name('exams.edit');
    Route::put('/exams/{exam}', [ExamController::class, 'update'])->name('exams.update');
    Route::delete('/exams/{exam}', [ExamController::class, 'destroy'])->name('exams.destroy');
    
    // Bulk Results Import
    Route::get('/exams/{exam}/bulk-import', [ExamController::class, 'bulkResultsImport'])->name('exams.bulk-import');
    Route::post('/exams/{exam}/bulk-results', [ExamController::class, 'processBulkResults'])->name('exams.bulk-results.store');
    
    // Results Management
    Route::post('/exams/{exam}/publish', [ExamController::class, 'publishResults'])->name('exams.publish');
    Route::get('/exams/{exam}/reports', [ExamController::class, 'generateReports'])->name('exams.reports');
    Route::get('/exams/{exam}/statistics', [ExamController::class, 'getStatistics'])->name('exams.statistics');
    
    // Individual Result Management
    Route::get('/exams/{exam}/results/create', [ExamResultController::class, 'create'])->name('exam-results.create');
    Route::post('/exams/{exam}/results', [ExamResultController::class, 'store'])->name('exam-results.store');
    Route::put('/exam-results/{examResult}', [ExamResultController::class, 'update'])->name('exam-results.update');
    Route::delete('/exam-results/{examResult}', [ExamResultController::class, 'destroy'])->name('exam-results.destroy');
});

// Student and Parent Portal Routes
// Route::prefix('students')->middleware(['auth:student'])->group(function () {
//     Route::get('/results', [StudentPortalController::class, 'results'])->name('student.results');
//     Route::get('/results/{examSeries}', [StudentPortalController::class, 'termResults'])->name('student.term-results');
//     Route::get('/results/{examSeries}/download', [StudentPortalController::class, 'downloadResults'])->name('student.results.download');
// });

// Route::prefix('parents')->middleware(['auth:parent'])->group(function () {
//     Route::get('/children/{student}/results', [ParentPortalController::class, 'childResults'])->name('parent.child-results');
//     Route::get('/children/{student}/results/{examSeries}', [ParentPortalController::class, 'childTermResults'])->name('parent.child-term-results');
// });

// API Routes for AJAX requests
Route::prefix('api/schools/{school}')->group(function () {
    Route::get('/classes/{class}/streams', function (School $school, SchoolClass $class) {
        return response()->json($class->streams);
    })->name('api.class.streams');
    
    Route::get('/grading-systems/{gradingSystem}/grades', function (School $school, GradingSystem $gradingSystem) {
        return response()->json($gradingSystem->grades);
    })->name('api.grading-system.grades');
    
    Route::get('/exams/{exam}/eligible-students', [ExamController::class, 'getEligibleStudents'])->name('api.exam.eligible-students');
});

// Excel Templates and Exports
// Route::prefix('schools/{school}/exports')->group(function () {
//     Route::get('/exam-results-template/{exam}', [ExportController::class, 'examResultsTemplate'])->name('exports.exam-results-template');
//     Route::get('/exam-results/{exam}', [ExportController::class, 'examResults'])->name('exports.exam-results');
//     Route::get('/term-reports/{examSeries}', [ExportController::class, 'termReports'])->name('exports.term-reports');
//     Route::get('/class-analysis/{examSeries}/{class}', [ExportController::class, 'classAnalysis'])->name('exports.class-analysis');
//     Route::get('/subject-analysis/{exam}', [ExportController::class, 'subjectAnalysis'])->name('exports.subject-analysis');
// });

// Import Routes
// Route::prefix('schools/{school}/imports')->group(function () {
//     Route::post('/exam-results/{exam}', [ImportController::class, 'examResults'])->name('imports.exam-results');
//     Route::post('/validate-results/{exam}', [ImportController::class, 'validateResults'])->name('imports.validate-results');
// });


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
