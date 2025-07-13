import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentInstructions = ({ amount, currency = 'XOF', paymentRecord, onClose }) => {
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      color: 'blue',
      details: {
        bankName: 'Banque Atlantique Sénégal',
        accountName: 'Foy Lekke SARL',
        accountNumber: '12345678901234567890',
        swiftCode: 'BATLSNDA',
        reference: `${paymentRecord?.paymentId || 'FoyLekke'} - ${paymentRecord?.adData?.title || 'Ad Payment'}`
      }
    },
    {
      id: 'orange',
      name: 'Orange Money',
      icon: Smartphone,
      color: 'orange',
      details: {
        provider: 'Orange Money',
        number: '+221 77 123 45 67',
        name: 'Foy Lekke',
        reference: `${paymentRecord?.paymentId || 'FoyLekke'} - ${paymentRecord?.adData?.title || 'Ad Payment'}`
      }
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: CreditCard,
      color: 'indigo',
      details: {
        number: '+221 77 123 45 67',
        name: 'Foy Lekke',
        reference: `${paymentRecord?.paymentId || 'FoyLekke'} - ${paymentRecord?.adData?.title || 'Ad Payment'}`
      }
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Payment Instructions</h2>
              <p className="text-primary-100 mt-1">
                Complete your payment to activate your advertisement
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-primary-100 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ad Title</p>
                <p className="font-medium">{paymentRecord?.adData?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium font-mono">{paymentRecord?.paymentId || 'N/A'}</p>
                  {paymentRecord?.paymentId && (
                    <button
                      onClick={() => copyToClipboard(paymentRecord.paymentId, 'Payment ID')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Payment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 ${getColorClasses(method.color)}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className="h-8 w-8" />
                    <h4 className="font-semibold text-lg">{method.name}</h4>
                  </div>

                  <div className="space-y-3">
                    {method.id === 'bank' && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Bank Name</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{method.details.bankName}</p>
                            <button
                              onClick={() => copyToClipboard(method.details.bankName, 'Bank Name')}
                              className="text-current hover:opacity-70"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Account Name</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{method.details.accountName}</p>
                            <button
                              onClick={() => copyToClipboard(method.details.accountName, 'Account Name')}
                              className="text-current hover:opacity-70"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Account Number</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-mono">{method.details.accountNumber}</p>
                            <button
                              onClick={() => copyToClipboard(method.details.accountNumber, 'Account Number')}
                              className="text-current hover:opacity-70"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">SWIFT Code</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-mono">{method.details.swiftCode}</p>
                            <button
                              onClick={() => copyToClipboard(method.details.swiftCode, 'SWIFT Code')}
                              className="text-current hover:opacity-70"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {(method.id === 'orange' || method.id === 'wave') && (
                      <>
                        <div>
                          <p className="text-sm font-medium">Number</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-mono">{method.details.number}</p>
                            <button
                              onClick={() => copyToClipboard(method.details.number, 'Number')}
                              className="text-current hover:opacity-70"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Name</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{method.details.name}</p>
                            <button
                              onClick={() => copyToClipboard(method.details.name, 'Name')}
                              className="text-current hover:opacity-70"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-sm font-medium">Reference</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono break-all">{method.details.reference}</p>
                        <button
                          onClick={() => copyToClipboard(method.details.reference, 'Reference')}
                          className="text-current hover:opacity-70 ml-2"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div className="p-6 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Important Instructions</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Include the payment ID and reference in your transfer</li>
                <li>• Send proof of payment to admin@foylekke.com</li>
                <li>• Your ad will be activated after payment verification</li>
                <li>• Payment verification usually takes 24-48 hours</li>
                <li>• Contact support if you have any issues</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="mailto:admin@foylekke.com"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Contact Support</span>
                <ExternalLink size={14} />
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentInstructions; 