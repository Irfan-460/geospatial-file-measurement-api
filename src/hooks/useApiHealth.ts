import { useState, useEffect } from 'react'
import { checkApiHealth } from '../services/api'

export function useApiHealth() {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    checkApiHealth().then(setOnline)
    const interval = setInterval(() => checkApiHealth().then(setOnline), 30000)
    return () => clearInterval(interval)
  }, [])

  return online
}
