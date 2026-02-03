import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ShopStack
        </Link>

        <div className="navbar-links">
          {currentUser ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="nav-link">
                    Products
                  </Link>
                  <Link to="/admin/orders" className="nav-link">
                    Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">
                    Shop
                  </Link>
                  <Link to="/cart" className="nav-link cart-link">
                    Cart
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                  </Link>
                  <Link to="/orders" className="nav-link">
                    My Orders
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link btn-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
