import React from 'react';
import { SparklesIcon } from './Icons';

interface SpinnerProps {
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center text-gray-400">
      <SparklesIcon className="w-10 h-10 animate-pulse text-pink-400" />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};
