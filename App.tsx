import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import RestroomCard from './components/RestroomCard';
import LoadingView from './components/LoadingView';
import { findRestroomsNearby } from './services/geminiService';
import { AppState, SearchResult, Coordinates } from './types';
import { MapPinOff, RefreshCw, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [location, setLocation] = useState<Coordinates | null>(null);

  const requestLocation = useCallback(() => {
    setAppState(AppState.REQUESTING_LOCATION);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      setAppState(AppState.ERROR);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        fetchRestrooms(coords);
      },
      (error) => {
        console.error("Geo Error", error);
        setErrorMsg('Unable to retrieve your location. Please enable location permissions.');
        setAppState(AppState.ERROR);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRestrooms = async (coords: Coordinates) => {
    setAppState(AppState.FETCHING_DATA);
    try {
      const data = await findRestroomsNearby(coords);
      setSearchResult(data);
      setAppState(AppState.DISPLAY_RESULTS);
    } catch (err) {
      setErrorMsg('Failed to find restrooms nearby. Please try again.');
      setAppState(AppState.ERROR);
    }
  };

  const handleRetry = () => {
    if (location) {
      fetchRestrooms(location);
    } else {
      requestLocation();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      <Header />

      <main className="flex-1 overflow-y-auto scrollbar-hide relative">
        
        {/* IDLE STATE */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-10">
            <div className="w-48 h-48 bg-sky-100 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce-slow">
               <span className="text-9xl">🧻</span>
            </div>
            <div>
              <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-tight">Doody Calls?</h2>
              <p className="text-2xl text-slate-600 leading-relaxed font-medium">
                One click to find the nearest public restrooms and business-friendly facilities immediately.
              </p>
            </div>
            <button
              onClick={requestLocation}
              className="w-full bg-primary hover:bg-sky-600 text-white text-2xl font-bold py-8 rounded-3xl shadow-xl transform transition active:scale-95 flex items-center justify-center gap-4"
            >
              <RefreshCw className="w-10 h-10" />
              Find Relief Now
            </button>
          </div>
        )}

        {/* LOADING STATES */}
        {(appState === AppState.REQUESTING_LOCATION || appState === AppState.FETCHING_DATA) && (
          <LoadingView status={appState === AppState.REQUESTING_LOCATION ? "Pinpointing your location..." : "Scouting nearby facilities..."} />
        )}

        {/* ERROR STATE */}
        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-red-100 p-8 rounded-full mb-8">
              <MapPinOff className="w-20 h-20 text-red-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Location Not Found</h3>
            <p className="text-xl text-slate-600 mb-12">{errorMsg}</p>
            <button
              onClick={requestLocation}
              className="w-full py-6 bg-slate-800 text-white text-xl font-bold rounded-2xl hover:bg-slate-900 transition-colors shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === AppState.DISPLAY_RESULTS && searchResult && (
          <div className="p-5 space-y-8 pb-32">
            {/* AI Summary Section - Enlarged and whitespace handled */}
            <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="bg-indigo-100 p-3 rounded-xl shrink-0 mt-1">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                {/* whitespace-pre-wrap ensures newlines from Gemini are rendered as spaces/breaks */}
                <div className="text-xl text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                   {searchResult.textSummary.replace(/\*/g, '')}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2 pt-2">
                 <h3 className="font-black text-slate-800 text-3xl">Nearby Spots</h3>
                 <span className="text-base font-bold px-4 py-2 bg-green-100 text-green-700 rounded-full">
                    {searchResult.places.length} found
                 </span>
               </div>
              
              {searchResult.places.length === 0 ? (
                <div className="text-center py-20 text-gray-400 px-6">
                  <p className="text-2xl font-medium">No specific businesses found nearby, but check the summary above for general advice.</p>
                </div>
              ) : (
                searchResult.places.map((place, index) => (
                  <RestroomCard key={`${place.uri}-${index}`} place={place} />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Reset (Only visible in results) */}
      {appState === AppState.DISPLAY_RESULTS && (
        <div className="absolute bottom-8 right-6 z-50">
           <button 
            onClick={handleRetry}
            className="bg-slate-900 text-white p-6 rounded-full shadow-2xl hover:bg-slate-800 transition-all active:scale-90 border-4 border-white"
            aria-label="Search again"
          >
             <RefreshCw className="w-10 h-10" />
           </button>
        </div>
      )}
    </div>
  );
};

export default App;