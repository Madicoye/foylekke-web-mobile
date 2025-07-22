import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { placeTypeConfig, getEnabledPlaceTypes } from '../config/placeTypes';

const ConfigPage = () => {
  const [config, setConfig] = useState(placeTypeConfig);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTogglePlaceType = (type) => {
    setConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: !prev[type].enabled
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, you'd save this to localStorage or backend
    localStorage.setItem('placeTypeConfig', JSON.stringify(config));
    setHasChanges(false);
    alert('Configuration saved! Refresh the page to see changes.');
  };

  const handleReset = () => {
    setConfig(placeTypeConfig);
    setHasChanges(false);
  };

  const enabledCount = Object.values(config).filter(c => c.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="text-primary-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Place Types Configuration</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Enable or disable place types to control what appears in the frontend. 
              Currently {enabledCount} of {Object.keys(config).length} types are enabled.
            </p>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  hasChanges
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Place Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(config).map(([type, typeConfig]) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                  typeConfig.enabled 
                    ? 'border-primary-200 hover:border-primary-300' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${typeConfig.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-2xl">{typeConfig.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{typeConfig.name}</h3>
                        <p className="text-sm text-gray-500">{type}</p>
                      </div>
                    </div>
                    
                    {/* Toggle */}
                    <button
                      onClick={() => handleTogglePlaceType(type)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        typeConfig.enabled 
                          ? 'bg-primary-100 text-primary-600 hover:bg-primary-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {typeConfig.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">
                    {typeConfig.description}
                  </p>

                  {/* Status */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    typeConfig.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {typeConfig.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Enable/Disable:</strong> Click the toggle button next to each place type</li>
              <li>• <strong>Save Changes:</strong> Click "Save Changes" to apply your configuration</li>
              <li>• <strong>Reset:</strong> Click "Reset" to revert to the original configuration</li>
              <li>• <strong>Refresh:</strong> After saving, refresh the page to see changes take effect</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfigPage; 