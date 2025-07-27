import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CreditCard,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Zap,
  Star,
  Users,
  BarChart3,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { restaurantAdminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const SubscriptionManagement = ({ restaurantId }) => {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Fetch subscription data
  const { data: subscriptionData, isLoading } = useQuery(
    ['restaurant-subscription', restaurantId],
    () => restaurantAdminAPI.getSubscription(restaurantId),
    { enabled: !!restaurantId }
  );

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation(
    (planData) => restaurantAdminAPI.updateSubscription(restaurantId, planData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant-subscription', restaurantId]);
        toast.success('Subscription updated successfully');
        setSelectedPlan(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update subscription');
      }
    }
  );

  const {
    currentPlan = {},
    availablePlans = [],
    billingHistory = [],
    usage = {}
  } = subscriptionData || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800' },
      expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'basic':
        return <Users className="h-6 w-6" />;
      case 'premium':
        return <Star className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'premium':
        return 'border-purple-200 bg-purple-50';
      case 'enterprise':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant's subscription plan and billing</p>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          {currentPlan.status && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(currentPlan.status).color}`}>
              {getStatusBadge(currentPlan.status).label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${getPlanColor(currentPlan.type)}`}>
              {getPlanIcon(currentPlan.type)}
            </div>
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {currentPlan.name || 'Free'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Cost</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(currentPlan.price || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Billing</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentPlan.nextBillingDate ? formatDate(currentPlan.nextBillingDate) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Usage This Month</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{usage.views || 0}</p>
              <p className="text-sm text-gray-500">Profile Views</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (usage.views / (currentPlan.limits?.views || 1000)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{usage.hangouts || 0}</p>
              <p className="text-sm text-gray-500">Hangouts</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (usage.hangouts / (currentPlan.limits?.hangouts || 50)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{usage.menuItems || 0}</p>
              <p className="text-sm text-gray-500">Menu Items</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (usage.menuItems / (currentPlan.limits?.menuItems || 100)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{usage.reviews || 0}</p>
              <p className="text-sm text-gray-500">Reviews</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (usage.reviews / (currentPlan.limits?.reviews || 200)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-white rounded-lg shadow-sm border-2 ${
                plan.id === currentPlan.id 
                  ? 'border-primary-500' 
                  : 'border-gray-200 hover:border-primary-300'
              } p-6 cursor-pointer transition-all duration-200`}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${getPlanColor(plan.type)}`}>
                  {getPlanIcon(plan.type)}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatCurrency(plan.price)}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </p>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <ul className="space-y-3 text-left">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.id !== currentPlan.id) {
                      updateSubscriptionMutation.mutate({ planId: plan.id });
                    }
                  }}
                  disabled={plan.id === currentPlan.id || updateSubscriptionMutation.isLoading}
                  className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-colors ${
                    plan.id === currentPlan.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.id === currentPlan.id 
                    ? 'Current Plan' 
                    : updateSubscriptionMutation.isLoading 
                    ? 'Updating...' 
                    : 'Select Plan'
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
        </div>
        
        {billingHistory.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No billing history</h4>
            <p className="text-gray-600">Your billing history will appear here once you have payments.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {billingHistory.map((payment, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    payment.status === 'paid' ? 'bg-green-100' : 
                    payment.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {payment.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : payment.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.description || `${payment.planName} Plan`}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className={`text-sm capitalize ${
                    payment.status === 'paid' ? 'text-green-600' : 
                    payment.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement; 