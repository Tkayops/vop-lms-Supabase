import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 animate-fadeIn">
      {!isOnline && (
        <div className="mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <WifiOff size={16} />
          <span className="font-semibold text-sm">You're offline</span>
        </div>
      )}
      
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-lg ${
        isOnline 
          ? 'bg-green-100 text-green-700 border border-green-300' 
          : 'bg-amber-100 text-amber-700 border border-amber-300'
      }`}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  );
}
