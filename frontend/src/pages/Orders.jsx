import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [currentUser, filterStatus]);

  async function fetchOrders() {
    try {
      let q;
      if (isAdmin) {
        // Admin sees all orders
        q = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Regular users see only their orders
        q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      }
      const snapshot = await getDocs(q);
      let ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by status if not 'all'
      if (filterStatus !== 'all') {
        ordersData = ordersData.filter(order => order.status === filterStatus);
      }

      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  function getStatusClass(status) {
    const statusMap = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function downloadInvoice(order) {
    if (order.invoiceUrl) {
      window.open(order.invoiceUrl, '_blank');
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="orders-header">
        <h1>{isAdmin ? 'All Purchase Orders' : 'My Orders'}</h1>
        {isAdmin && (
          <div className="filter-controls">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>{isAdmin ? 'No orders found.' : "You haven't placed any orders yet."}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                  {isAdmin && (
                    <p className="order-customer">
                      Customer: <strong>{order.userEmail}</strong>
                    </p>
                  )}
                </div>
                <div className="order-status">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                <div className="items-header">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Subtotal</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">{item.quantity}</span>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                    <span className="item-subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="shipping-info">
                <h4>Shipping Address</h4>
                <p>
                  {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.zipCode}
                </p>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total Amount:</span>
                  <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="order-actions">
                  {order.invoiceUrl && (
                    <button
                      onClick={() => downloadInvoice(order)}
                      className="btn-invoice"
                    >
                      📥 Download Invoice
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="btn-details"
                  >
                    {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="order-details-expanded">
                  <div className="details-section">
                    <h4>Order Details</h4>
                    <p>Order ID: {order.id}</p>
                    <p>Status: {order.status}</p>
                    <p>Placed on: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="details-section">
                    <h4>Customer Information</h4>
                    <p>Email: {order.userEmail}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
