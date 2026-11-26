
import { useEffect, useState } from 'react'

function MyOrders({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    fetch(`http://localhost:8080/api/orders/user/${user.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        return response.json()
      })
      .then(data => {
        setOrders(data)
      })
      .catch(error => {
        console.error('Error fetching orders:', error)
        alert('Unable to load orders')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return <h2 style={{ textAlign: 'center' }}>Loading orders...</h2>
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px'
    }}>
      <h2 style={{ textAlign: 'center' }}>My Orders 📦</h2>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          You haven't placed any orders yet.
        </p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{
            background: 'white',
            padding: '20px',
            margin: '20px 0',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            border: '1px solid #eee'
          }}>
            <h3>Order #{order.id}</h3>

            <p>
              <strong>Order Date:</strong>{' '}
              {new Date(order.orderDate).toLocaleString()}
            </p>

            <p>
              <strong>Restaurant ID:</strong> {order.restaurantId}
            </p>

            <p>
              <strong>Total Amount:</strong> ₹{order.totalAmount}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              <span style={{
                color: '#e67e22',
                fontWeight: 'bold'
              }}>
                {order.orderStatus}
              </span>
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default MyOrders
