import React from 'react';
import { MapPin, Info } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <span className="text-2xl">💩</span>
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Call Of Doody
          </h1>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          onClick={() => alert("Call Of Doody helps you find public restrooms nearby using Google Maps data via Gemini.")}
        >
          <Info className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
};

export default Header;