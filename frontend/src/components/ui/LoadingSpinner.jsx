const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Spinner con gradiente */}
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-4 border-gray-200`}></div>
        <div className={`${sizes[size]} rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-500 animate-spin absolute top-0 left-0`}></div>
      </div>
      
      {/* Texto */}
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
