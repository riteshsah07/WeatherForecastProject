const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast'

export async function geocodeCity(name, { signal } = {}) {
  const url = new URL(GEO_BASE)
  url.searchParams.set('name', name)
  url.searchParams.set('count', '5')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Failed to search for that city.')
  const data = await res.json()

  const results = Array.isArray(data?.results) ? data.results : []
  return results.map((r) => ({
    id: `${r.id ?? ''}-${r.latitude}-${r.longitude}`,
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }))
}

export async function fetchForecast({ latitude, longitude }, { signal } = {}) {
  const url = new URL(FORECAST_BASE)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
  )
  url.searchParams.set(
    'daily',
    [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
    ].join(','),
  )
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('Failed to load forecast.')
  return await res.json()
}

