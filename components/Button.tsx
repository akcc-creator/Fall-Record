import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    outline: "bg-transparent border-2 border-teal-600 text-teal-600 hover:bg-teal-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};