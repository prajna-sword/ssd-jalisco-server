// weather.interface.ts
export interface LocationWeather {
  id: 'ssdo' | 'pvr';
  name: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  cloudCover: number;
  windKph: number;
  conditionText: string;
  conditionIcon: string;
  visibilityKm: number;
  fogRisk: 'none' | 'low' | 'moderate' | 'high';
  updatedAt: string;
}

export interface RegionalWeatherResponse {
  locations: {
    ssdo: LocationWeather;
    pvr: LocationWeather;
  };
  cachedAt: string;
}
