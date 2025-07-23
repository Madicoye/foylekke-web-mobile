import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentInstructions = ({ provider, instructions, isVerifying, onBack }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Instructions
        </h3>
      </div>

      {/* Verification Status */}
      <div className={`mb-6 p-4 rounded-lg ${
        isVerifying ? 'bg-blue-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3">
          {isVerifying ? (
            <>
              <Loader2 size={20} className="text-blue-500 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">
                  Waiting for payment...
                </p>
                <p className="text-sm text-blue-700">
                  Follow the instructions below to complete your payment
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} className="text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">
                  Payment not started
                </p>
                <p className="text-sm text-gray-700">
                  Please follow the instructions below
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {instructions.steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
              {step.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {step.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {step.description}
              </p>
              {step.title.toLowerCase().includes('reference') && (
                <button
                  onClick={() => copyToClipboard(step.description.split(': ')[1])}
                  className="mt-2 flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Copy size={14} />
                  <span>Copy reference</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">
          Important Information
        </h4>
        <ul className="space-y-2">
          {instructions.additionalInfo.map((info, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start space-x-2 text-sm text-gray-600"
            >
              <span className="flex-shrink-0 w-4 h-4 mt-0.5">•</span>
              <span>{info}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Having trouble? Contact support at{' '}
          <a href="tel:+221338238383" className="text-primary-600 hover:text-primary-700">
            +221 33 823 83 83
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentInstructions; 