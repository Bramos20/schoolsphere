import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Home, 
  Building2, 
  School, 
  Users, 
  BookOpen, 
  GraduationCap, 
  User, 
  LogOut,
  Menu,
  X,
  DollarSign,
  FileText,
  UserCheck,
  Settings,
  BarChart3,
  Calendar,
  UserPlus
} from 'lucide-react';

export default function AppLayout({ children }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const roles = user?.roles?.map(role => role.slug) || [];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // State for managing collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    academic: false,
    assignments: false,
    finance: false,
    reports: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    router.post(route('logout'));
  };

  const NavItem = ({ href, icon: Icon, label, badge = null, isChild = false }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group ${
        isChild ? 'ml-6' : ''
      }`}
    >
      <Icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
      {(!sidebarCollapsed || mobileSidebarOpen) && (
        <>
          <span className="flex-1">{label}</span>
          {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
        </>
      )}
    </Link>
  );

  const SectionHeader = ({ label, isExpanded, onToggle, icon: Icon }) => (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors ${
        sidebarCollapsed ? 'justify-center' : 'justify-between'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {(!sidebarCollapsed || mobileSidebarOpen) && <span>{label}</span>}
      </div>
      {(!sidebarCollapsed || mobileSidebarOpen) && (
        isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header - Always Visible */}
      <div className={`flex items-center gap-3 px-3 py-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <School className="h-5 w-5 text-white" />
          </div>
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">SchoolSphere</h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex h-8 w-8 p-0"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* User Info - Always Visible */}
      {(!sidebarCollapsed || mobileSidebarOpen) && (
        <div className="px-3 py-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {roles.map(role => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 pb-4 space-y-1">
          <NavItem href={route('dashboard')} icon={Home} label="Dashboard" />

          {/* Super Admin Routes */}
          {roles.includes('super_admin') && (
            <>
              <div className={`px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Super Admin
                </p>
              </div>
              <NavItem href={route('companies.index')} icon={Building2} label="Companies" />
            </>
          )}

          {/* Company Admin Routes */}
          {roles.includes('company_admin') && (
            <>
              <div className={`px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Company Admin
                </p>
              </div>
              <NavItem href={route('company.dashboard')} icon={Building2} label="Company Dashboard" />
              <NavItem href={route('schools.index')} icon={School} label="Schools" />
            </>
          )}

          {/* School Admin Routes */}
          {roles.includes('school_admin') && (
            <>
              <div className={`px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  School Admin
                </p>
              </div>
              
              {/* Basic Management */}
              <NavItem href={route('departments.index', user.school_id)} icon={Building2} label="Departments" />
              <NavItem href={route('staff.index', user.school_id)} icon={Users} label="Staff" />
              <NavItem href={route('classes.index', user.school_id)} icon={School} label="Classes" />
              <NavItem href={route('subjects.index', user.school_id)} icon={BookOpen} label="Subjects" />
              <NavItem href={route('capitations.index', user.school_id)} icon={BarChart3} label="Capitation" />

              {/* Academic Assignments (Collapsible) */}
              <SectionHeader
                label="Academic Assignments"
                isExpanded={expandedSections.assignments}
                onToggle={() => toggleSection('assignments')}
                icon={GraduationCap}
              />
              {expandedSections.assignments && (!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="space-y-1">
                  <NavItem 
                    href={route('teacher-subjects.index', user.school_id)} 
                    icon={UserCheck} 
                    label="Teacher-Subject" 
                    isChild 
                  />
                  <NavItem 
                    href={route('stream-subjects.index', user.school_id)} 
                    icon={BookOpen} 
                    label="Stream-Subject" 
                    isChild 
                  />
                  <NavItem 
                    href={route('stream-teachers.index', user.school_id)} 
                    icon={Users} 
                    label="Stream-Teacher" 
                    isChild 
                  />
                  <NavItem 
                    href={route('subject-stream-teachers.index', user.school_id)} 
                    icon={GraduationCap} 
                    label="Subject-Stream-Teacher" 
                    isChild 
                  />
                </div>
              )}

              {/* Finance Management (Collapsible) */}
              <SectionHeader
                label="Finance"
                isExpanded={expandedSections.finance}
                onToggle={() => toggleSection('finance')}
                icon={DollarSign}
              />
              {expandedSections.finance && (!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="space-y-1">
                  <NavItem 
                    href={route('accounts.dashboard', user.school_id)} 
                    icon={BarChart3} 
                    label="Accounts Dashboard" 
                    isChild 
                  />
                  <NavItem 
                    href={route('fees.index', user.school_id)} 
                    icon={DollarSign} 
                    label="Fee Structures" 
                    isChild 
                  />
                  <NavItem 
                    href={route('payments.index', user.school_id)} 
                    icon={DollarSign} 
                    label="Payments" 
                    isChild 
                  />
                  <NavItem 
                    href={route('expenditures.index', user.school_id)} 
                    icon={DollarSign} 
                    label="Expenditures" 
                    isChild 
                  />
                  <NavItem 
                    href={route('accounts.cashflow', user.school_id)} 
                    icon={BarChart3} 
                    label="Cashflow" 
                    isChild 
                  />
                </div>
              )}

              {/* Reports (Collapsible) */}
              <SectionHeader
                label="Reports"
                isExpanded={expandedSections.reports}
                onToggle={() => toggleSection('reports')}
                icon={FileText}
              />
              {expandedSections.reports && (!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="space-y-1">
                  <NavItem 
                    href={route('defaulters.index', user.school_id)} 
                    icon={FileText} 
                    label="Defaulters Report" 
                    isChild 
                  />
                </div>
              )}
            </>
          )}

          {/* HOD Routes */}
          {roles.includes('hod') && (
            <>
              <div className={`px-3 py-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  HOD
                </p>
              </div>
              <NavItem href={route('students.index', user.school_id)} icon={Users} label="Students" />
              <NavItem href={route('students.create', user.school_id)} icon={UserPlus} label="Register Student" />
            </>
          )}

          <Separator className="my-4" />
          
          <NavItem href={route('profile.edit')} icon={User} label="Profile" />
        </nav>
      </div>

      {/* Logout Button - Always Visible at Bottom */}
      <div className="px-3 pb-4 border-t border-gray-200 pt-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ${sidebarCollapsed ? 'px-3' : ''}`}
        >
          <LogOut className="h-4 w-4" />
          {(!sidebarCollapsed || mobileSidebarOpen) && 'Logout'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Always Fixed & Scrollable */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}>
          {/* Mobile Close Button */}
          <div className="lg:hidden absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content Wrapper */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <SidebarContent />
          </div>
        </aside>

        {/* Main Content - Adjusted for Fixed Sidebar */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileSidebarOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <School className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">SchoolSphere</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </>
  );
}