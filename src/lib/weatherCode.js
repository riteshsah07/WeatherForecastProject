const CODES = new Map([
  [0, { label: 'Clear', icon: '☀️' }],
  [1, { label: 'Mostly clear', icon: '🌤️' }],
  [2, { label: 'Partly cloudy', icon: '⛅' }],
  [3, { label: 'Overcast', icon: '☁️' }],
  [45, { label: 'Fog', icon: '🌫️' }],
  [48, { label: 'Depositing rime fog', icon: '🌫️' }],
  [51, { label: 'Light drizzle', icon: '🌦️' }],
  [53, { label: 'Drizzle', icon: '🌦️' }],
  [55, { label: 'Dense drizzle', icon: '🌧️' }],
  [56, { label: 'Freezing drizzle', icon: '🌧️' }],
  [57, { label: 'Freezing drizzle', icon: '🌧️' }],
  [61, { label: 'Light rain', icon: '🌧️' }],
  [63, { label: 'Rain', icon: '🌧️' }],
  [65, { label: 'Heavy rain', icon: '🌧️' }],
  [66, { label: 'Freezing rain', icon: '🌧️' }],
  [67, { label: 'Freezing rain', icon: '🌧️' }],
  [71, { label: 'Light snow', icon: '🌨️' }],
  [73, { label: 'Snow', icon: '🌨️' }],
  [75, { label: 'Heavy snow', icon: '🌨️' }],
  [77, { label: 'Snow grains', icon: '🌨️' }],
  [80, { label: 'Rain showers', icon: '🌦️' }],
  [81, { label: 'Rain showers', icon: '🌦️' }],
  [82, { label: 'Violent showers', icon: '⛈️' }],
  [85, { label: 'Snow showers', icon: '🌨️' }],
  [86, { label: 'Snow showers', icon: '🌨️' }],
  [95, { label: 'Thunderstorm', icon: '⛈️' }],
  [96, { label: 'Thunderstorm + hail', icon: '⛈️' }],
  [99, { label: 'Thunderstorm + hail', icon: '⛈️' }],
])

export function describeWeatherCode(code) {
  const c = Number(code)
  return CODES.get(c) ?? { label: 'Unknown', icon: '❔' }
}

