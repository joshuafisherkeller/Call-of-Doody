import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import RestroomCard from './components/RestroomCard';
import LoadingView from './components/LoadingView';
import { findRestroomsNearby } from './services/geminiService';
import { AppState, SearchResult, Coordinates } from './types';
import { MapPinOff, RefreshCw, Sparkles, MapPin, AlertTriangle, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [errorType, setErrorType] = useState<'LOCATION' | 'CONNECTION'>('LOCATION');
  const [location, setLocation] = useState<Coordinates | null>(null);

  const requestLocation = useCallback(() => {
    setAppState(AppState.REQUESTING_LOCATION);
    setErrorMsg('');
    setErrorType('LOCATION');

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
        let msg = 'Unable to retrieve your location.';
        
        // Handle specific error codes for better user guidance
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permission denied. Please check your browser settings and allow location access for this site.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable. Ensure your device GPS is on and has a clear signal.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please move to an open area or try again.';
        }

        setErrorMsg(msg);
        setErrorType('LOCATION');
        setAppState(AppState.ERROR);
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,       // Increased to 25s to allow GPS lock
        maximumAge: 60000     // Accept cached positions up to 1 min old (faster)
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
    } catch (err: any) {
      if (err.message && err.message.includes("MISSING_API_KEY")) {
        setErrorMsg("System Config Error: API Key missing. Please go to Vercel Settings > Environment Variables and add 'VITE_API_KEY' with your value.");
      } else {
        setErrorMsg('Failed to connect to the restroom finder service. Please try again.');
      }
      setErrorType('CONNECTION');
      setAppState(AppState.ERROR);
    }
  };

  const handleRetry = () => {
    if (location && errorType === 'CONNECTION') {
      // If we already have location but API failed, just retry API
      fetchRestrooms(location);
    } else {
      // Full retry
      requestLocation();
    }
  };

  const openGoogleMapsFallback = () => {
    if (location) {
      const url = `https://www.google.com/maps/search/public+restroom/@${location.latitude},${location.longitude},16z`;
      window.open(url, '_blank');
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
            <div className={`p-8 rounded-full mb-8 ${errorType === 'LOCATION' ? 'bg-red-100' : 'bg-amber-100'}`}>
              {errorType === 'LOCATION' ? (
                <MapPinOff className="w-20 h-20 text-red-500" />
              ) : (
                <Settings className="w-20 h-20 text-amber-500" />
              )}
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              {errorType === 'LOCATION' ? 'Location Not Found' : 'Setup Required'}
            </h3>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">{errorMsg}</p>
            
            <div className="w-full space-y-4">
              <button
                onClick={handleRetry}
                className="w-full py-6 bg-slate-800 text-white text-xl font-bold rounded-2xl hover:bg-slate-900 transition-colors shadow-lg"
              >
                Try Again
              </button>
              
              {location && (
                <button
                  onClick={openGoogleMapsFallback}
                  className="w-full py-6 bg-white border-2 border-primary text-primary text-xl font-bold rounded-2xl hover:bg-sky-50 transition-colors flex items-center justify-center gap-3"
                >
                  <MapPin className="w-6 h-6" />
                  Open in Google Maps
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === AppState.DISPLAY_RESULTS && searchResult && (
          <div className="p-4 pb-10 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="text-accent w-6 h-6" />
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">The Situation</h2>
               </div>
               <p className="text-xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {searchResult.textSummary}
               </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-400 uppercase tracking-wider px-2">Top Recommendations</h2>
              {searchResult.places.map((place, index) => (
                <RestroomCard key={index} place={place} />
              ))}
            </div>

            <button
              onClick={requestLocation}
              className="w-full py-6 bg-gray-200 text-slate-600 text-xl font-bold rounded-2xl hover:bg-gray-300 transition-colors mt-8"
            >
              Scan Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;