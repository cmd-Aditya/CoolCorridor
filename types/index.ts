export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
}

export interface Place {
  id: string;
  google_place_id?: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
  is_indoor?: boolean;
  has_ac?: boolean;
  has_shade?: boolean;
  near_water?: boolean;
  photo_url?: string;
  distance?: number;
  score?: number;
  tempDiff?: number;
}