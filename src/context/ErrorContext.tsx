
import React, { createContext, useContext, useState, ReactNode } from 'react';
import ErrorModal from '../components/ErrorModal';

interface ErrorContextType {
  showError: (message: string, code?: number | string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<{ message: string; code?: number | string } | null>(null);

  const showError = (message: string, code?: number | string) => {
    setError({ message, code });
  };

  const closeError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {error && (
        <ErrorModal 
          message={error.message} 
          code={error.code} 
          onClose={closeError} 
        />
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}
