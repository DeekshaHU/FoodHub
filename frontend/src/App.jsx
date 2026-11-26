
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import MyOrders from './MyOrders'
import AdminDashboard from './AdminDashboard'
import RestaurantDashboard from './RestaurantDashboard'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showMyOrders, setShowMyOrders] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showRestaurantDashboard, setShowRestaurantDashboard] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/restaurants')

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants')
      }

      const data = await response.json()
      setRestaurants(data.filter(restaurant => restaurant.approved))
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const goHome = () => {
    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowMyOrders(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
  }

  const viewMenu = async (restaurant) => {
    setLoading(true)
    setSelectedRestaurant(restaurant)
    setShowMyOrders(false)
    setShowLogin(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)

    try {
      const response = await fetch(
        `http://localhost:8080/api/food-items/restaurant/${restaurant.id}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch food items')
      }

      const data = await response.json()
      setFoodItems(data.filter(item => item.available !== false))
    } catch (error) {
      console.error('Error fetching menu:', error)
      alert('Unable to load menu')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item) => {
    setCart(previousCart => {
      const existingItem = previousCart.find(
        cartItem => cartItem.id === item.id
      )

      if (existingItem) {
        return previousCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }

      return [...previousCart, { ...item, quantity: 1 }]
    })
  }

  const decreaseQuantity = (itemId) => {
    setCart(previousCart =>
      previousCart
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const handleLogin = (user) => {
    setLoggedInUser(user)
    setShowLogin(false)
    setShowMyOrders(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
    alert(`Welcome, ${user.name}!`)
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    goHome()
    alert('Logged out successfully!')
  }

  const placeOrder = async () => {
    if (!loggedInUser) {
      alert('Please login before placing your order.')
      setShowLogin(true)
      return
    }

    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    const restaurantId = cart[0].restaurantId

    if (cart.some(item => item.restaurantId !== restaurantId)) {
      alert('Please order items from one restaurant at a time.')
      return
    }

    setPlacingOrder(true)

    try {
      // Step 1: Create order
      const orderResponse = await fetch(
        'http://localhost:8080/api/orders/place',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: loggedInUser.id,
            restaurantId: restaurantId,
            totalAmount: totalAmount,
            orderStatus: 'PLACED',
          }),
        }
      )

      if (!orderResponse.ok) {
        throw new Error('Order creation failed')
      }

      const order = await orderResponse.json()

      // Step 2: Save order items
      for (const item of cart) {
        const itemResponse = await fetch(
          `http://localhost:8080/api/order-items/add/${order.id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              foodItemId: item.id,
              quantity: item.quantity,
              price: item.price,
            }),
          }
        )

        if (!itemResponse.ok) {
          throw new Error('Failed to save order items')
        }
      }

      // Step 3: Generate bill
      const billResponse = await fetch(
        `http://localhost:8080/api/bills/generate/${order.id}`,
        {
          method: 'POST',
        }
      )

      if (!billResponse.ok) {
        throw new Error('Bill generation failed')
      }

      const bill = await billResponse.json()

      alert(
        `Order placed successfully!\nOrder ID: ${order.id}\nBill ID: ${bill.id}\nTotal: ₹${totalAmount}`
      )

      setCart([])
      setSelectedRestaurant(null)
      setFoodItems([])
      setShowMyOrders(false)
      setShowAdmin(false)
      setShowRestaurantDashboard(false)
    } catch (error) {
      console.error('Order error:', error)
      alert('Something went wrong while placing your order.')
    } finally {
      setPlacingOrder(false)
    }
  }

  const openMyOrders = () => {
    if (!loggedInUser) {
      alert('Please login to view your orders.')
      setShowLogin(true)
      setShowMyOrders(false)
      setShowAdmin(false)
      setShowRestaurantDashboard(false)
      setSelectedRestaurant(null)
      return
    }

    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
    setShowMyOrders(true)
  }

  const openAdmin = () => {
    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowMyOrders(false)
    setShowRestaurantDashboard(false)
    setShowAdmin(true)
  }

  const openRestaurantDashboard = () => {
    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowMyOrders(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(true)
  }

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo" onClick={goHome}>
          FoodHub 🍽️
        </h2>

        <div className="nav-links">
          <button onClick={goHome}>Home</button>

          <button onClick={goHome}>Restaurants</button>

          <button onClick={openMyOrders}>My Orders</button>

          <button onClick={openAdmin}>Admin</button>

          <button onClick={openRestaurantDashboard}>
            Restaurant
          </button>

          {loggedInUser ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={() => {
              setShowLogin(true)
              setShowMyOrders(false)
              setShowAdmin(false)
              setShowRestaurantDashboard(false)
              setSelectedRestaurant(null)
            }}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Page content */}
      {showLogin ? (
        <Login onLogin={handleLogin} />
      ) : showMyOrders ? (
        <MyOrders user={loggedInUser} />
      ) : showAdmin ? (
        <AdminDashboard />
      ) : showRestaurantDashboard ? (
        <RestaurantDashboard />
      ) : (
        <>
          {/* Hero */}
          <section className="hero">
            <h1>Delicious Food, Delivered to You 🍕</h1>
            <p>Discover restaurants and order your favourite food.</p>
          </section>

          {/* Restaurants */}
          {!selectedRestaurant && (
            <section className="restaurants">
              <h2>Available Restaurants</h2>

              {restaurants.length === 0 ? (
                <p>No approved restaurants available.</p>
              ) : (
                <div className="restaurant-list">
                  {restaurants.map(restaurant => (
                    <div className="restaurant-card" key={restaurant.id}>
                      <h3>{restaurant.restaurantName}</h3>
                      <p>{restaurant.cuisine}</p>
                      <p>{restaurant.city}</p>
                      <p>{restaurant.description}</p>

                      <button onClick={() => viewMenu(restaurant)}>
                        View Menu
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Menu */}
          {selectedRestaurant && (
            <section className="menu-section">
              <button onClick={() => {
                setSelectedRestaurant(null)
                setFoodItems([])
              }}>
                ← Back to Restaurants
              </button>

              <h2>{selectedRestaurant.restaurantName} Menu</h2>

              {loading ? (
                <p>Loading menu...</p>
              ) : foodItems.length === 0 ? (
                <p>No food items available.</p>
              ) : (
                <div className="food-list">
                  {foodItems.map(item => (
                    <div className="food-card" key={item.id}>
                      <h3>{item.foodName}</h3>
                      <p>{item.description}</p>
                      <p>₹{item.price}</p>

                      <button onClick={() => addToCart(item)}>
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Cart */}
          <section className="cart-section">
            <h2>Your Cart 🛒</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <p>{item.foodName} - ₹{item.price}</p>
                    <p>Quantity: {item.quantity}</p>

                    <button onClick={() => decreaseQuantity(item.id)}>
                      -
                    </button>

                    <button onClick={() => addToCart(item)}>
                      +
                    </button>

                    <p>
                      Subtotal: ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}

                <h3>Total: ₹{totalAmount}</h3>

                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </>
            )}
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 FoodHub | Multi-Restaurant Food Ordering System</p>
      </footer>

    </div>
  )
}

export default App
