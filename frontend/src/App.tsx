import { useEffect, useState } from 'react'

type ApiResponse = {
  success: boolean
  message: string
  time: string
}

function App() {
  const [message, setMessage] = useState<string>('Lade...')

  useEffect(() => {
    async function loadBackendTest() {
      try {
        const response = await fetch('/api/test')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        setMessage(data.message)
      } catch (error) {
        console.error(error)
        setMessage('Fehler beim Backend-Aufruf')
      }
    }

    loadBackendTest()
  }, [])

  return (
    <>
      <h1>React Frontend</h1>
      <p>{message}</p>
    </>
  )
}

export default App