import { useState, useEffect } from 'react'
import styles from './Clock.module.css'

// Timezone data with common cities/countries
const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'New York, USA' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, USA' },
  { value: 'America/Chicago', label: 'Chicago, USA' },
  { value: 'America/Denver', label: 'Denver, USA' },
  { value: 'Europe/London', label: 'London, UK' },
  { value: 'Europe/Paris', label: 'Paris, France' },
  { value: 'Europe/Berlin', label: 'Berlin, Germany' },
  { value: 'Europe/Rome', label: 'Rome, Italy' },
  { value: 'Europe/Madrid', label: 'Madrid, Spain' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam, Netherlands' },
  { value: 'Europe/Stockholm', label: 'Stockholm, Sweden' },
  { value: 'Europe/Vienna', label: 'Vienna, Austria' },
  { value: 'Europe/Zurich', label: 'Zurich, Switzerland' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
  { value: 'Asia/Shanghai', label: 'Shanghai, China' },
  { value: 'Asia/Taipei', label: 'Taipei, Taiwan' },
  { value: 'Asia/Seoul', label: 'Seoul, South Korea' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Bangkok', label: 'Bangkok, Thailand' },
  { value: 'Asia/Manila', label: 'Manila, Philippines' },
  { value: 'Asia/Jakarta', label: 'Jakarta, Indonesia' },
  { value: 'Asia/Kolkata', label: 'Mumbai, India' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE' },
  { value: 'Asia/Tehran', label: 'Tehran, Iran' },
  { value: 'Australia/Sydney', label: 'Sydney, Australia' },
  { value: 'Australia/Melbourne', label: 'Melbourne, Australia' },
  { value: 'Australia/Perth', label: 'Perth, Australia' },
  { value: 'Pacific/Auckland', label: 'Auckland, New Zealand' },
  { value: 'America/Toronto', label: 'Toronto, Canada' },
  { value: 'America/Vancouver', label: 'Vancouver, Canada' },
  { value: 'America/Mexico_City', label: 'Mexico City, Mexico' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires, Argentina' },
  { value: 'America/Santiago', label: 'Santiago, Chile' },
  { value: 'Africa/Cairo', label: 'Cairo, Egypt' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg, South Africa' },
  { value: 'Africa/Lagos', label: 'Lagos, Nigeria' },
  { value: 'Africa/Nairobi', label: 'Nairobi, Kenya' },
]

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimezone, setSelectedTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date, timezone: string) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone
    })
  }

  const formatDate = (date: Date, timezone: string) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    })
  }

  const getTimezoneOffset = (timezone: string) => {
    const now = new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const targetTime = new Date(utc + (now.toLocaleString("en-US", { timeZone: timezone }).split(',')[1] ? 0 : 0))
    const offset = (targetTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return offset
  }

  const formatTimezoneOffset = (timezone: string) => {
    const offset = getTimezoneOffset(timezone)
    const sign = offset >= 0 ? '+' : '-'
    const hours = Math.abs(Math.floor(offset))
    const minutes = Math.abs((offset % 1) * 60)
    return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const handleTimezoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimezone(event.target.value)
  }

  return (
    <div className={styles.clockContainer}>
      <div className={styles.timezoneSelector}>
        <label htmlFor="timezone-select" className={styles.timezoneLabel}>
          Select Timezone:
        </label>
        <select
          id="timezone-select"
          value={selectedTimezone}
          onChange={handleTimezoneChange}
          className={styles.timezoneSelect}
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label} ({formatTimezoneOffset(tz.value)})
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.timeDisplay}>
        <div className={styles.time}>{formatTime(currentTime, selectedTimezone)}</div>
        <div className={styles.date}>{formatDate(currentTime, selectedTimezone)}</div>
      </div>
      
      <div className={styles.timezone}>
        {timezones.find(tz => tz.value === selectedTimezone)?.label} ({formatTimezoneOffset(selectedTimezone)})
      </div>
    </div>
  )
}

export default Clock 