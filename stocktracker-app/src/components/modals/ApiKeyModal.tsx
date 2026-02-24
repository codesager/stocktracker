import React from 'react';
import { Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSubmit: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  apiKey,
  onApiKeyChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 w-96">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Enter Financial Modeling Prep API Key
        </h3>
        <input
          type="text"
          placeholder="Enter FMP API key..."
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        />
        <div className="flex justify-end space-x-2 mt-3">
          <button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
          >
            <Check className="mr-1" size={14} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal; 