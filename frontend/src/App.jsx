import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import MyOrders from './MyOrders'
import AdminDashboard from './AdminDashboard'
import RestaurantDashboard from './RestaurantDashboard'

const API = 'http://localhost:8080'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const [cart, setCart] = useState([])
  const [cartMessage, setCartMessage] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(null)

  const [showLogin, setShowLogin] = useState(false)
  const [showMyOrders, setShowMyOrders] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showRestaurantDashboard, setShowRestaurantDashboard] = useState(false)
  const [showCart, setShowCart] = useState(false)

  const [loadingRestaurants, setLoadingRestaurants] = useState(false)
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  // Load restaurants
  const fetchRestaurants = async () => {
    setLoadingRestaurants(true)

    try {
      const response = await fetch(`${API}/api/restaurants`)

      if (!response.ok) {
        throw new Error('Unable to load restaurants')
      }

      const data = await response.json()

      setRestaurants(
        Array.isArray(data)
          ? data.filter(restaurant => restaurant.approved !== false)
          : []
      )
    } catch (error) {
      console.error('Restaurant loading error:', error)
      setRestaurants([])
    } finally {
      setLoadingRestaurants(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  // Load restaurant menu
  const viewMenu = async (restaurant) => {
    setSelectedRestaurant(restaurant)
    setFoodItems([])
    setShowCart(false)
    setShowMyOrders(false)
    setShowLogin(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
    setLoadingMenu(true)
    setCartMessage('')

    try {
      const response = await fetch(
        `${API}/api/food-items/restaurant/${restaurant.id}`
      )

      if (!response.ok) {
        throw new Error('Unable to load menu')
      }

      const data = await response.json()
      setFoodItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Menu loading error:', error)
      alert('Unable to load this restaurant menu.')
    } finally {
      setLoadingMenu(false)
    }
  }

  // Add food to cart
  const addToCart = (item) => {
    const restaurantId =
      item.restaurantId ??
      item.restaurant?.id ??
      selectedRestaurant?.id

    const foodId = item.id ?? item.foodItemId
    const foodName = item.foodName ?? item.name ?? 'Food Item'
    const price = Number(item.price ?? item.cost)

    if (foodId == null) {
      alert('Food item ID is missing.')
      return
    }

    if (restaurantId == null) {
      alert('Restaurant ID is missing.')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert('Invalid food price.')
      return
    }

    const cartItem = {
      ...item,
      id: foodId,
      foodName,
      price,
      restaurantId,
    }

    if (
      cart.length > 0 &&
      cart.some(
        existingItem =>
          String(existingItem.restaurantId) !== String(restaurantId)
      )
    ) {
      alert('Please order items from one restaurant at a time.')
      return
    }

    setCart(previousCart => {
      const existingItem = previousCart.find(
        cartItem => String(cartItem.id) === String(foodId)
      )

      if (existingItem) {
        return previousCart.map(cartItem =>
          String(cartItem.id) === String(foodId)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }

      return [...previousCart, { ...cartItem, quantity: 1 }]
    })

    setCartMessage(`${foodName} added to cart!`)
    setShowCart(true)
  }

  // Decrease quantity
  const decreaseQuantity = (itemId) => {
    setCart(previousCart =>
      previousCart
        .map(item =>
          String(item.id) === String(itemId)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  // Remove item
  const removeFromCart = (itemId) => {
    setCart(previousCart =>
      previousCart.filter(item => String(item.id) !== String(itemId))
    )
  }

  // Cart calculations
  const totalAmount = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  )

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  // Login callback
  const handleLogin = (user) => {
    setLoggedInUser(user)
    setShowLogin(false)
    setShowMyOrders(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
    setShowCart(false)
    setSelectedRestaurant(null)
    setFoodItems([])
  }

  // Admin access
  const openAdmin = () => {
    const password = prompt('Enter Admin Password:')

    if (password === 'FoodHub@2026') {
      setSelectedRestaurant(null)
      setFoodItems([])
      setShowLogin(false)
      setShowMyOrders(false)
      setShowRestaurantDashboard(false)
      setShowCart(false)
      setShowAdmin(true)
    } else if (password !== null) {
      alert('Incorrect Admin Password!')
    }
  }

  // Restaurant dashboard
  const openRestaurantDashboard = () => {
    if (!loggedInUser) {
      alert('Please login first.')
      setShowLogin(true)
      return
    }

    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowMyOrders(false)
    setShowAdmin(false)
    setShowCart(false)
    setShowRestaurantDashboard(true)
  }

  // My orders
  const openMyOrders = () => {
    if (!loggedInUser) {
      alert('Please login first.')
      setShowLogin(true)
      return
    }

    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
    setShowCart(false)
    setShowMyOrders(true)
  }

  // Checkout
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty.')
      return
    }

    if (!loggedInUser) {
      alert('Please login to place your order.')
      setShowLogin(true)
      return
    }

    const restaurantId = cart[0].restaurantId

    if (
      cart.some(
        item => String(item.restaurantId) !== String(restaurantId)
      )
    ) {
      alert('Please order items from one restaurant at a time.')
      return
    }

    setPlacingOrder(true)

    try {
      const orderResponse = await fetch(`${API}/api/orders/place`, {
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
      })

      if (!orderResponse.ok) {
        throw new Error('Order creation failed')
      }

      const order = await orderResponse.json()

      // Add food items to order
      for (const item of cart) {
        const itemResponse = await fetch(
          `${API}/api/order-items/add/${order.id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              foodItemId: item.id,
              quantity: item.quantity,
            }),
          }
        )

        if (!itemResponse.ok) {
          throw new Error(`Unable to add ${item.foodName} to order`)
        }
      }

      // Generate bill
      const billResponse = await fetch(
        `${API}/api/bills/generate/${order.id}`,
        {
          method: 'POST',
        }
      )

      if (!billResponse.ok) {
        console.warn('Order placed but bill generation failed.')
      }

      alert('Order placed successfully!')

      setCart([])
      setCartMessage('')
      setShowCart(false)
      setShowMyOrders(true)
      setSelectedRestaurant(null)
      setFoodItems([])
    } catch (error) {
      console.error('Order error:', error)
      alert(`Unable to place order: ${error.message}`)
    } finally {
      setPlacingOrder(false)
    }
  }

  // Home navigation
  const goHome = () => {
    setSelectedRestaurant(null)
    setFoodItems([])
    setShowLogin(false)
    setShowMyOrders(false)
    setShowAdmin(false)
    setShowRestaurantDashboard(false)
    setShowCart(false)
    setCartMessage('')
    fetchRestaurants()
  }

  // Render
  return (
    <div className="app">

      {/* Navigation */}
      <header className="navbar">
        <h1 onClick={goHome} style={{ cursor: 'pointer' }}>
          FoodHub
        </h1>

        <nav>
          <button type="button" onClick={goHome}>
            Home
          </button>

          <button type="button" onClick={() => setShowCart(true)}>
            Cart ({cartCount})
          </button>

          <button type="button" onClick={openMyOrders}>
            My Orders
          </button>

          <button type="button" onClick={openRestaurantDashboard}>
            Restaurant
          </button>

          <button type="button" onClick={openAdmin}>
            Admin
          </button>

          {loggedInUser ? (
            <span>
              Welcome, {loggedInUser.name || loggedInUser.mobileNumber}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowLogin(true)
                setShowCart(false)
                setShowMyOrders(false)
                setShowAdmin(false)
                setShowRestaurantDashboard(false)
              }}
            >
              Login
            </button>
          )}
        </nav>
      </header>

      {/* Login */}
      {showLogin && (
        <Login onLogin={handleLogin} />
      )}

      {/* Admin */}
      {showAdmin && (
        <AdminDashboard />
      )}

      {/* Restaurant Dashboard */}
      {showRestaurantDashboard && (
        <RestaurantDashboard
          user={loggedInUser}
          onBack={goHome}
        />
      )}

      {/* My Orders */}
      {showMyOrders && (
        <MyOrders user={loggedInUser} />
      )}

      {/* Cart */}
      {showCart && !showLogin && !showMyOrders && !showAdmin && !showRestaurantDashboard && (
        <section className="cart-section">
          <h2>Your Cart</h2>

          <button type="button" onClick={goHome}>
            Back to Home
          </button>

          {cartMessage && (
            <p style={{ color: 'green' }}>
              {cartMessage}
            </p>
          )}

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <h3>{item.foodName}</h3>

                  <p>Price: ₹{item.price}</p>

                  <p>
                    Quantity: {item.quantity}
                  </p>

                  <p>
                    Subtotal: ₹
                    {(Number(item.price) * item.quantity).toFixed(2)}
                  </p>

                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    −
                  </button>

                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <h2>
                Total: ₹{totalAmount.toFixed(2)}
              </h2>

              <button
                type="button"
                onClick={placeOrder}
                disabled={placingOrder}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </section>
      )}

      {/* Restaurant list */}
      {!selectedRestaurant &&
        !showLogin &&
        !showMyOrders &&
        !showAdmin &&
        !showRestaurantDashboard &&
        !showCart && (
          <section className="restaurant-section">
            <h2>Available Restaurants</h2>

            {loadingRestaurants ? (
              <p>Loading restaurants...</p>
            ) : restaurants.length === 0 ? (
              <p>No restaurants available.</p>
            ) : (
              <div className="restaurant-list">
                {restaurants.map(restaurant => (
                  <div
                    className="restaurant-card"
                    key={restaurant.id}
                  >
                    <h3>
                      {restaurant.restaurantName || restaurant.name}
                    </h3>

                    <p>
                      {restaurant.cuisine || 'Cuisine'}
                    </p>

                    <p>
                      {restaurant.city || ''}
                    </p>

                    <p>
                      {restaurant.address || ''}
                    </p>

                    <button
                      type="button"
                      onClick={() => viewMenu(restaurant)}
                    >
                      View Menu
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      {/* Menu */}
      {selectedRestaurant &&
        !showLogin &&
        !showMyOrders &&
        !showAdmin &&
        !showRestaurantDashboard &&
        !showCart && (
          <section className="menu-section">
            <button type="button" onClick={goHome}>
              Back to Restaurants
            </button>

            <h2>
              {selectedRestaurant.restaurantName ||
                selectedRestaurant.name}
            </h2>

            <p>
              {selectedRestaurant.cuisine}
            </p>

            <h3>Menu</h3>

            {loadingMenu ? (
              <p>Loading menu...</p>
            ) : foodItems.length === 0 ? (
              <p>No food items available for this restaurant.</p>
            ) : (
              <div className="food-list">
                {foodItems.map(item => (
                  <div className="food-card" key={item.id}>
                    <h3>
                      {item.foodName || item.name}
                    </h3>

                    <p>
                      {item.description || ''}
                    </p>

                    <p>
                      ₹{item.price}
                    </p>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      {/* Footer */}
      {!showAdmin &&
        !showRestaurantDashboard &&
        !showLogin &&
        !showMyOrders && (
          <footer>
            <p>FoodHub - Restaurant Ordering System</p>
          </footer>
        )}
    </div>
  )
}

export default App