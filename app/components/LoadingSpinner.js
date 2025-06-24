export default function LoadingSpinner({ size = "default" }) {
  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 dark:border-blue-400 transition-colors`}></div>
  );
}