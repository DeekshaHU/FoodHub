
import { useEffect, useState } from 'react'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, restaurantsRes, ordersRes, billsRes] =
          await Promise.all([
            fetch('http://localhost:8080/api/admin/users'),
            fetch('http://localhost:8080/api/admin/restaurants'),
            fetch('http://localhost:8080/api/admin/orders'),
            fetch('http://localhost:8080/api/admin/bills'),
          ])

        if (
          !usersRes.ok ||
          !restaurantsRes.ok ||
          !ordersRes.ok ||
          !billsRes.ok
        ) {
          throw new Error('Failed to fetch dashboard data')
        }

        const usersData = await usersRes.json()
        const restaurantsData = await restaurantsRes.json()
        const ordersData = await ordersRes.json()
        const billsData = await billsRes.json()

        setUsers(usersData)
        setRestaurants(restaurantsData)
        setOrders(ordersData)
        setBills(billsData)
      } catch (error) {
        console.error('Dashboard error:', error)
        alert('Unable to load admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <h2 style={{ textAlign: 'center' }}>Loading dashboard...</h2>
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '30px auto',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center' }}>Admin Dashboard 📊</h1>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        margin: '30px 0'
      }}>
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <h2>{users.length}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Total Restaurants</h3>
          <h2>{restaurants.length}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Total Orders</h3>
          <h2>{orders.length}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Total Bills</h3>
          <h2>{bills.length}</h2>
        </div>
      </div>

      {/* Users */}
      <h2>Users</h2>
      <div style={tableStyle}>
        <table style={innerTableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile Number</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.mobileNumber}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Restaurants */}
      <h2>Restaurants</h2>
      <div style={tableStyle}>
        <table style={innerTableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant</th>
              <th>Owner</th>
              <th>City</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map(restaurant => (
              <tr key={restaurant.id}>
                <td>{restaurant.id}</td>
                <td>{restaurant.restaurantName}</td>
                <td>{restaurant.ownerName}</td>
                <td>{restaurant.city}</td>
                <td>
                  {restaurant.approved ? 'Approved' : 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders */}
      <h2>Orders</h2>
      <div style={tableStyle}>
        <table style={innerTableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Restaurant ID</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userId}</td>
                <td>{order.restaurantId}</td>
                <td>₹{order.totalAmount}</td>
                <td>{order.orderStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bills */}
      <h2>Bills</h2>
      <div style={tableStyle}>
        <table style={innerTableStyle}>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Restaurant ID</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id}>
                <td>{bill.id}</td>
                <td>{bill.orderId}</td>
                <td>{bill.userId}</td>
                <td>{bill.restaurantId}</td>
                <td>₹{bill.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
}

const tableStyle = {
  overflowX: 'auto',
  background: 'white',
  borderRadius: '10px',
  marginBottom: '30px'
}

const innerTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
}

export default AdminDashboard
