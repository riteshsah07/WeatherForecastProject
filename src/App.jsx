import React, { useEffect, useMemo, useRef, useState } from 'react'
import { fetchForecast, geocodeCity } from './lib/openMeteo.js'
import { describeWeatherCode } from './lib/weatherCode.js'

function formatPlace(p) {
  const bits = [p.name, p.admin1, p.country].filter(Boolean)
  return bits.join(', ')
}

function dayLabel(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function clampCityInput(s) {
  return String(s ?? '').trim().replace(/\s+/g, ' ').slice(0, 80)
}

export default function App() {
  const [query, setQuery] = useState(() => localStorage.getItem('wf:lastQuery') ?? 'London')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const abortRef = useRef(null)

  async function runSearch(nextQuery) {
    const q = clampCityInput(nextQuery)
    if (!q) return

    localStorage.setItem('wf:lastQuery', q)
    setError('')
    setLoading(true)
    setForecast(null)

    abortRef.current?.abort?.()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      const found = await geocodeCity(q, { signal: ac.signal })
      setResults(found)
      const first = found[0] ?? null
      setSelected(first)
    } catch (e) {
      if (e?.name === 'AbortError') return
      setResults([])
      setSelected(null)
      setError(e?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSearch(query)
  }, [])

  useEffect(() => {
    if (!selected) return

    abortRef.current?.abort?.()
    const ac = new AbortController()
    abortRef.current = ac

    setError('')
    setLoading(true)

    fetchForecast(selected, { signal: ac.signal })
      .then((data) => setForecast(data))
      .catch((e) => {
        if (e?.name === 'AbortError') return
        setForecast(null)
        setError(e?.message || 'Failed to load forecast.')
      })
      .finally(() => setLoading(false))

    return () => ac.abort()
  }, [selected])

  const current = forecast?.current
  const daily = forecast?.daily

  const dailyRows = useMemo(() => {
    if (!daily?.time?.length) return []
    return daily.time.map((date, i) => ({
      date,
      code: daily.weather_code?.[i],
      tMax: daily.temperature_2m_max?.[i],
      tMin: daily.temperature_2m_min?.[i],
      pop: daily.precipitation_probability_max?.[i],
    }))
  }, [daily])

  const currentDesc = describeWeatherCode(current?.weather_code)

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <div className="logo" aria-hidden="true">⛅</div>
          <div>
            <div className="title">Weather Forecast</div>
            <div className="subtitle">Search a city to see current conditions and a 7‑day outlook</div>
          </div>
        </div>

        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query)
          }}
        >
          <label className="srOnly" htmlFor="q">City</label>
          <input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city (e.g., Karachi, New York, Tokyo)"
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <main className="content">
        {error ? <div className="alert" role="alert">{error}</div> : null}

        <section className="panel">
          <div className="panelHeader">
            <div className="panelTitle">Location</div>
            <div className="panelHint">Choose the correct result if there are multiple matches.</div>
          </div>

          <div className="results">
            {results.length === 0 && !loading ? (
              <div className="empty">No results yet. Try searching for a city.</div>
            ) : null}

            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`pill ${selected?.id === r.id ? 'active' : ''}`}
                onClick={() => setSelected(r)}
                title={`${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}`}
              >
                {formatPlace(r)}
              </button>
            ))}
          </div>
        </section>

        <section className="grid">
          <section className="panel heroPanel">
            <div className="panelHeader">
              <div className="panelTitle">Now</div>
              <div className="panelHint">{selected ? formatPlace(selected) : '—'}</div>
            </div>

            {current ? (
              <div className="now">
                <div className="nowMain">
                  <div className="nowIcon" aria-hidden="true">{currentDesc.icon}</div>
                  <div>
                    <div className="nowTemp">
                      {Math.round(current.temperature_2m)}°
                      <span className="unit">C</span>
                    </div>
                    <div className="nowLabel">{currentDesc.label}</div>
                  </div>
                </div>

                <div className="nowStats">
                  <div className="stat">
                    <div className="statK">Feels like</div>
                    <div className="statV">{Math.round(current.apparent_temperature)}°C</div>
                  </div>
                  <div className="stat">
                    <div className="statK">Wind</div>
                    <div className="statV">{Math.round(current.wind_speed_10m)} km/h</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="skeleton">
                <div className="skLine w60" />
                <div className="skLine w40" />
                <div className="skGrid">
                  <div className="skLine" />
                  <div className="skLine" />
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panelHeader">
              <div className="panelTitle">7‑Day forecast</div>
              <div className="panelHint">{forecast?.timezone ? `Timezone: ${forecast.timezone}` : ''}</div>
            </div>

            {dailyRows.length ? (
              <div className="table" role="table" aria-label="7 day forecast">
                {dailyRows.slice(0, 7).map((row) => {
                  const d = describeWeatherCode(row.code)
                  return (
                    <div className="tr" role="row" key={row.date}>
                      <div className="td date" role="cell">{dayLabel(row.date)}</div>
                      <div className="td wx" role="cell" title={d.label}>
                        <span className="wxIcon" aria-hidden="true">{d.icon}</span>
                        <span className="wxLabel">{d.label}</span>
                      </div>
                      <div className="td temp" role="cell">
                        <span className="hi">{Math.round(row.tMax)}°</span>
                        <span className="lo">{Math.round(row.tMin)}°</span>
                      </div>
                      <div className="td pop" role="cell">
                        {Number.isFinite(row.pop) ? `${Math.round(row.pop)}%` : '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty">Forecast will appear after you select a location.</div>
            )}
          </section>
        </section>
      </main>

      <footer className="footer">
        Data from Open‑Meteo (no API key required).
      </footer>
    </div>
  )
}

