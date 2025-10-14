interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry,
  retryButtonText = "다시 시도" 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={onRetry}
          >
            {retryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
