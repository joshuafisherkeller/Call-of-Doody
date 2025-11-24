import React from 'react';
import { RestroomPlace } from '../types';
import { Navigation, ExternalLink, Coffee, Building2, Trees, Store } from 'lucide-react';

interface RestroomCardProps {
  place: RestroomPlace;
}

const RestroomCard: React.FC<RestroomCardProps> = ({ place }) => {
  
  const getIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('park') || lowerTitle.includes('garden')) return <Trees className="w-10 h-10 text-green-600" />;
    if (lowerTitle.includes('coffee') || lowerTitle.includes('cafe') || lowerTitle.includes('starbucks')) return <Coffee className="w-10 h-10 text-amber-700" />;
    if (lowerTitle.includes('market') || lowerTitle.includes('mart') || lowerTitle.includes('mall')) return <Store className="w-10 h-10 text-blue-600" />;
    return <Building2 className="w-10 h-10 text-slate-600" />;
  };

  const getCategoryColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('park')) return 'bg-green-100';
    if (lowerTitle.includes('coffee') || lowerTitle.includes('cafe')) return 'bg-amber-100';
    return 'bg-gray-100';
  };

  return (
    <div className="bg-white rounded-3xl p-7 shadow-md border-2 border-transparent hover:border-primary/20 transition-all duration-200">
      <div className="flex items-start gap-5 mb-5">
        <div className={`p-4 rounded-2xl ${getCategoryColor(place.title)} shrink-0`}>
          {getIcon(place.title)}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{place.title}</h3>
          <p className="text-base font-bold text-slate-500 uppercase tracking-wide">
            {place.source === 'maps' ? 'Google Maps Verified' : 'Web Result'}
          </p>
        </div>
      </div>
      
      {place.address && (
        <div className="mb-8 pl-[5rem]">
           <p className="text-xl text-slate-700 leading-relaxed font-medium">
            {place.address}
          </p>
        </div>
      )}

      <a 
        href={place.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full gap-3 bg-primary hover:bg-sky-600 text-white font-bold text-xl py-5 rounded-2xl shadow-sm transition-all active:scale-[0.98]"
      >
        <Navigation className="w-7 h-7" />
        <span>Get Directions</span>
        <ExternalLink className="w-6 h-6 opacity-70" />
      </a>
    </div>
  );
};

export default RestroomCard;