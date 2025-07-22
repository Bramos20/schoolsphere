import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  DollarSign, 
  Package, 
  Building2,
  MessageSquare,
  AlertTriangle,
  Edit,
  ArrowLeft,
  Eye
} from 'lucide-react';

export default function Show({ school, requisition, canApprove, canReject, userRole }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    rejection_reason: '',
    comments: ''
  });

  const handleApprove = () => {
    if (data.comments.trim()) {
      post(route('requisitions.approve', [school.id, requisition.id]), {
        onSuccess: () => setShowApprovalModal(false)
      });
    } else {
      post(route('requisitions.approve', [school.id, requisition.id]));
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    post(route('requisitions.reject', [school.id, requisition.id]), {
      onSuccess: () => {
        setShowRejectModal(false);
        setData('rejection_reason', '');
      }
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_accountant_approval': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        text: 'Pending Accountant Approval'
      },
      'pending_admin_approval': {
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="h-4 w-4" />,
        text: 'Pending Admin Approval'
      },
      'approved': {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Approved'
      },
      'rejected': {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-4 w-4" />,
        text: 'Rejected'
      }
    };
    
    const badge = badges[status] || badges['pending_accountant_approval'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[priority] || badges['medium']}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
      </span>
    );
  };

  const totalCost = requisition.items?.reduce((total, item) => 
    total + (parseFloat(item.estimated_cost || 0) * parseInt(item.quantity || 0)), 0
  ) || 0;

  return (
    <AppLayout>
      <Head title={`Requisition: ${requisition.title}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href={route('requisitions.index', school.id)} className="hover:text-gray-700">
                Requisitions
              </Link>
              <span>/</span>
              <span>#{requisition.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{requisition.title}</h1>
          </div>
          <div className="flex gap-2">
            {requisition.canBeEdited && (
              <Link href={route('requisitions.edit', [school.id, requisition.id])}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            <Link href={route('requisitions.index', school.id)}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Requisition Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(requisition.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <div className="mt-1">
                      {getPriorityBadge(requisition.priority)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{requisition.department?.name || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted By</label>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{requisition.user.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submission Date</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(requisition.submission_date || requisition.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Estimated Cost</label>
                    <div className="mt-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-lg">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {requisition.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-gray-900">{requisition.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Requested Items ({requisition.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requisition.items?.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                          {item.category && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                              {item.category}
                            </span>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Quantity</label>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Est. Cost</label>
                          <p className="font-medium">
                            ${parseFloat(item.estimated_cost || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: ${(parseFloat(item.estimated_cost || 0) * parseInt(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No items specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Approval History */}
            {requisition.approvals?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Approval History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {requisition.approvals.map((approval, index) => (
                      <div key={approval.id} className="border-l-4 border-blue-400 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {approval.status === 'approved' ? 'Approved' : 'Rejected'} by {approval.user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {approval.approval_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            {approval.comments && (
                              <p className="text-sm text-gray-700 mt-1">{approval.comments}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(approval.approved_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {(canApprove || canReject) && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canApprove && (
                    <Button 
                      onClick={() => setShowApprovalModal(true)}
                      className="w-full"
                      disabled={processing}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {canReject && (
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowRejectModal(true)}
                      className="w-full"
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Approval Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${
                    ['pending_accountant_approval', 'pending_admin_approval', 'approved'].includes(requisition.status)
                      ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Accountant Approval</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    ['pending_admin_approval', 'approved'].includes(requisition.status)
                      ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Admin Approval</span>
                  </div>
                  <div className={`flex items-center gap-3 ${
                    requisition.status === 'approved' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Ready for Procurement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Items:</span>
                  <span className="font-medium">{requisition.items?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Quantity:</span>
                  <span className="font-medium">
                    {requisition.items?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total Cost:</span>
                  <span className="font-bold text-lg">${totalCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Approve Requisition</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={data.comments}
                  onChange={(e) => setData('comments', e.target.value)}
                  placeholder="Add any comments about this approval"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleApprove} disabled={processing} className="flex-1">
                  {processing ? 'Approving...' : 'Confirm Approval'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowApprovalModal(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Requisition</h3>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  value={data.rejection_reason}
                  onChange={(e) => setData('rejection_reason', e.target.value)}
                  placeholder="Please provide a reason for rejecting this requisition"
                  required
                />
                {errors.rejection_reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.rejection_reason}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="destructive" disabled={processing} className="flex-1">
                  {processing ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}