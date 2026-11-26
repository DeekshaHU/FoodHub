
import { useState } from 'react'

function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      alert('Enter a valid 10-digit Indian mobile number')
      return
    }

    setLoading(true)

    try {
      // Step 1: Check whether the mobile number already exists
      const usersResponse = await fetch('http://localhost:8080/api/users')

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users')
      }

      const users = await usersResponse.json()

      const existingUser = users.find(
        user => user.mobileNumber === mobileNumber
      )

      // Step 2: If user exists, log them in
      if (existingUser) {
        alert(`Welcome back, ${existingUser.name}!`)
        onLogin(existingUser)
        return
      }

      // Step 3: If user is new, ask for their name
      if (!name.trim()) {
        alert('New customer! Please enter your name to register.')
        return
      }

      // Step 4: Register the new customer
      const registerResponse = await fetch(
        'http://localhost:8080/api/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            mobileNumber: mobileNumber,
            role: 'CUSTOMER',
          }),
        }
      )

      const responseText = await registerResponse.text()

      let data

      try {
        data = JSON.parse(responseText)
      } catch {
        data = { message: responseText }
      }

      if (!registerResponse.ok) {
        alert(data.message || `Registration failed. Status: ${registerResponse.status}`)
        return
      }

      alert(`Registration successful! Welcome, ${data.name}!`)

      onLogin(data)

    } catch (error) {
      console.error('Login error:', error)
      alert('Cannot connect to backend. Check the backend server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h2>Login to FoodHub 🍽️</h2>

      <p>Enter your mobile number to continue</p>

      <input
        type="text"
        placeholder="Enter your name (for new users)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          margin: '10px 0',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '16px'
        }}
      />

      <input
        type="tel"
        placeholder="10-digit mobile number"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        maxLength="10"
        style={{
          width: '100%',
          padding: '12px',
          margin: '10px 0',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '16px'
        }}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Checking...' : 'Continue'}
      </button>
    </div>
  )
}

export default Login
