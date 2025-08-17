import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message = 'Unable to load content. Please try again.', 
  onRetry = null,
  showRetry = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{message}</p>
      
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-800 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;