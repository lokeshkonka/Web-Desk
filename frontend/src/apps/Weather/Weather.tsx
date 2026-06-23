import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  time: string;
}

interface Location {
  name: string;
  lat: number;
  lon: number;
}

const LOCATIONS: Location[] = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 }
];

const WEATHER_CODES: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear sky', icon: '☀️' },
  1: { text: 'Mainly clear', icon: '🌤️' },
  2: { text: 'Partly cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Fog', icon: '🌫️' },
  48: { text: 'Depositing rime fog', icon: '🌫️' },
  51: { text: 'Drizzle: Light', icon: '🌧️' },
  53: { text: 'Drizzle: Moderate', icon: '🌧️' },
  55: { text: 'Drizzle: Dense', icon: '🌧️' },
  61: { text: 'Rain: Slight', icon: '🌧️' },
  63: { text: 'Rain: Moderate', icon: '🌧️' },
  65: { text: 'Rain: Heavy', icon: '🌧️' },
  71: { text: 'Snow: Slight', icon: '❄️' },
  73: { text: 'Snow: Moderate', icon: '❄️' },
  75: { text: 'Snow: Heavy', icon: '❄️' },
  95: { text: 'Thunderstorm', icon: '⛈️' },
};

export const WeatherApp: React.FC<{ id: string }> = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (loc: Location) => {
    setLoading(true);
    setError('');
    try {
      // Open-Meteo API doesn't require an API key
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`
      );
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (err: any) {
      setError(err.message || 'Error fetching weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLocation);
  }, [selectedLocation]);

  const weatherInfo = weather ? WEATHER_CODES[weather.weathercode] || { text: 'Unknown', icon: '❓' } : null;

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-white p-6 font-content shadow-polished">
      <div className="flex items-center justify-between mb-6 border-b border-gray-600 pb-4">
        <h1 className="text-2xl font-heading font-bold text-[#f5c2e7]">Weather Forecast</h1>
        <select
          className="bg-[#313244] border border-gray-600 rounded-md p-2 text-white outline-none focus:border-[#f5c2e7] transition-colors"
          value={selectedLocation.name}
          onChange={(e) => {
            const loc = LOCATIONS.find(l => l.name === e.target.value);
            if (loc) setSelectedLocation(loc);
          }}
        >
          {LOCATIONS.map(loc => (
            <option key={loc.name} value={loc.name}>{loc.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f5c2e7]"></div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && weather && weatherInfo && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="text-[6rem] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {weatherInfo.icon}
          </div>
          
          <div className="text-center">
            <h2 className="text-6xl font-bold text-white mb-2 tracking-tighter">
              {weather.temperature}°C
            </h2>
            <p className="text-xl text-[#bac2de] font-medium tracking-wide">
              {weatherInfo.text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
            <div className="bg-[#313244]/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center border border-white/5 hover:bg-[#313244]/80 transition-all cursor-default">
              <span className="text-sm text-gray-400 mb-1">Wind Speed</span>
              <span className="text-xl font-semibold text-[#f5c2e7]">{weather.windspeed} km/h</span>
            </div>
            <div className="bg-[#313244]/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center border border-white/5 hover:bg-[#313244]/80 transition-all cursor-default">
              <span className="text-sm text-gray-400 mb-1">Time</span>
              <span className="text-xl font-semibold text-[#f5c2e7]">
                {new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
