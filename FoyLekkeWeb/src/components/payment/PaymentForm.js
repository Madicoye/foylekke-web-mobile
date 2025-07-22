import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useQuery, useMutation } from 'react-query';
import { paymentAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import PaymentInstructions from './PaymentInstructions';

const PaymentForm = ({ adId, amount, onSuccess, onCancel }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Fetch available payment providers
  const { data: providers, isLoading: providersLoading } = useQuery(
    'paymentProviders',
    () => paymentAPI.getProviders()
  );

  // Create payment mutation
  const createPaymentMutation = useMutation(
    (data) => {
      if (selectedProvider === 'orangeMoney') {
        return paymentAPI.createOrangeMoneyPayment(data);
      } else if (selectedProvider === 'wave') {
        return paymentAPI.createWavePayment(data);
      }
    },
    {
      onSuccess: (data) => {
        setPaymentData(data);
        setShowInstructions(true);
        startVerification();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create payment');
      }
    }
  );

  // Verify payment mutation
  const verifyPaymentMutation = useMutation(
    (data) => paymentAPI.verifyPayment(data.paymentId, data.provider),
    {
      onSuccess: (data) => {
        if (data.status === 'completed') {
          toast.success('Payment completed successfully!');
          onSuccess(data);
        } else if (data.status === 'failed') {
          toast.error(data.reason || 'Payment failed');
          setIsVerifying(false);
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to verify payment');
        setIsVerifying(false);
      }
    }
  );

  // Validate phone number
  const validatePhoneMutation = useMutation(
    (data) => paymentAPI.validatePhone(data),
    {
      onSuccess: (data) => {
        if (!data.isValid) {
          toast.error(data.message);
        }
      }
    }
  );

  // Start payment verification process
  const startVerification = () => {
    setIsVerifying(true);
    setVerificationAttempts(0);
    verifyPayment();
  };

  // Verify payment status
  const verifyPayment = async () => {
    if (!paymentData || verificationAttempts >= 10) {
      setIsVerifying(false);
      return;
    }

    try {
      await verifyPaymentMutation.mutateAsync({
        paymentId: paymentData.payment.paymentId,
        provider: selectedProvider
      });

      // Continue verification if payment is still pending
      if (verificationAttempts < 10) {
        setTimeout(() => {
          setVerificationAttempts(prev => prev + 1);
          verifyPayment();
        }, 10000); // Check every 10 seconds
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);

    // Validate phone number when it reaches 9 digits
    if (value.length === 9 && selectedProvider) {
      validatePhoneMutation.mutate({
        provider: selectedProvider,
        phoneNumber: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProvider) {
      toast.error('Please select a payment provider');
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 9) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const paymentData = {
      amount,
      phoneNumber,
      adId,
      description: `Payment for advertisement ${adId}`
    };

    createPaymentMutation.mutate(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="text-gray-600">
            Amount: <span className="font-semibold">{amount.toLocaleString()} XOF</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showInstructions ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Providers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {providersLoading ? (
                      <div className="col-span-2 flex items-center justify-center py-4">
                        <Loader2 size={24} className="animate-spin text-primary-600" />
                      </div>
                    ) : (
                      providers?.map(provider => (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => setSelectedProvider(provider.id)}
                          className={`p-4 border rounded-lg transition-colors duration-200 ${
                            selectedProvider === provider.id
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{provider.icon}</div>
                            <div className="text-sm font-medium">{provider.name}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="77 123 45 67"
                      maxLength={9}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your {selectedProvider === 'orangeMoney' ? 'Orange Money' : 'Wave'} phone number
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedProvider || !phoneNumber || phoneNumber.length !== 9 || createPaymentMutation.isLoading}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {createPaymentMutation.isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Creating Payment...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Continue</span>
                      <ArrowRight size={20} className="ml-2" />
                    </div>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PaymentInstructions
                provider={selectedProvider}
                instructions={paymentData.instructions}
                isVerifying={isVerifying}
                onBack={() => {
                  setShowInstructions(false);
                  setPaymentData(null);
                  setIsVerifying(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PaymentForm; 