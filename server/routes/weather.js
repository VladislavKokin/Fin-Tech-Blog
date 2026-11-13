let cachedWeather
let expiresAt = 0

export async function weather(req, res) {
  const key = process.env.WEATHER_API_KEY?.trim()
  if (!key) return res.json({ error: null, data: null })
  if (cachedWeather && Date.now() < expiresAt) return res.json({ error: null, data: cachedWeather })
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather')
    url.search = new URLSearchParams({ q: 'Ukhta,RU', units: 'metric', lang: 'ru', appid: key })
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!response.ok) throw new Error('Weather unavailable')
    const data = await response.json()
    if (!Number.isFinite(data.main?.temp) || !data.weather?.[0]?.description) throw new Error('Invalid weather data')
    cachedWeather = { city: data.name, temperature: Math.round(data.main.temp), description: data.weather[0].description }
    expiresAt = Date.now() + 10 * 60 * 1000
    res.json({ error: null, data: cachedWeather })
  } catch {
    res.status(503).json({ error: 'Погода временно недоступна', data: null })
  }
}
