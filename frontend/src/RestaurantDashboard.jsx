
import { useState } from 'react'

function RestaurantDashboard() {
  const [restaurantId, setRestaurantId] = useState('')
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDashboard = async () => {
    if (!restaurantId) {
      alert('Please enter your restaurant ID')
      return
    }

    setLoading(true)

    try {
      const restaurantResponse = await fetch(
        `http://localhost:8080/api/restaurants/${restaurantId}`
      )

      if (!restaurantResponse.ok) {
        throw new Error('Restaurant not found')
      }

      const restaurantData = await restaurantResponse.json()
      setRestaurant(restaurantData)

      const foodResponse = await fetch(
        `http://localhost:8080/api/food-items/restaurant/${restaurantId}`
      )

      const ordersResponse = await fetch(
        `http://localhost:8080/api/orders/restaurant/${restaurantId}`
      )

      if (!foodResponse.ok || !ordersResponse.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const foodData = await foodResponse.json()
      const ordersData = await ordersResponse.json()

      setFoodItems(foodData)
      setOrders(ordersData)
    } catch (error) {
      console.error(error)
      alert('Unable to load restaurant data')
      setRestaurant(null)
      setFoodItems([])
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '30px auto',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center' }}>
        Restaurant Dashboard 🏪
      </h1>

      <div style={{
        textAlign: 'center',
        margin: '25px 0'
      }}>
        <input
          type="number"
          placeholder="Enter Restaurant ID"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
        />

        <button onClick={loadDashboard} disabled={loading}>
          {loading ? 'Loading...' : 'Load Dashboard'}
        </button>
      </div>

      {restaurant && (
        <>
          <h2>{restaurant.restaurantName}</h2>
          <p>Owner: {restaurant.ownerName}</p>
          <p>City: {restaurant.city}</p>
          <p>Cuisine: {restaurant.cuisine}</p>

          <hr />

          <h2>Food Items</h2>

          {foodItems.length === 0 ? (
            <p>No food items found.</p>
          ) : (
            foodItems.map(item => (
              <div key={item.id} style={{
                background: 'white',
                padding: '15px',
                margin: '15px 0',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3>{item.foodName}</h3>
                <p>{item.description}</p>
                <p>Price: ₹{item.price}</p>
                <p>Availability: {item.available ? 'Available' : 'Unavailable'}</p>
              </div>
            ))
          )}

          <hr />

          <h2>Customer Orders</h2>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{
                background: 'white',
                padding: '15px',
                margin: '15px 0',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3>Order #{order.id}</h3>
                <p>Customer ID: {order.userId}</p>
                <p>Amount: ₹{order.totalAmount}</p>
                <p>Status: {order.orderStatus}</p>
                <p>Date: {new Date(order.orderDate).toLocaleString()}</p>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}

export default RestaurantDashboard
