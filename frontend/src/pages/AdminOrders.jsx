import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import './AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Manage Orders</h1>

      <div className="orders-filter">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({orders.length})
        </button>
        <button 
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button 
          className={filter === 'processing' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('processing')}
        >
          Processing ({orders.filter(o => o.status === 'processing').length})
        </button>
        <button 
          className={filter === 'shipped' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('shipped')}
        >
          Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
        <button 
          className={filter === 'delivered' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('delivered')}
        >
          Delivered ({orders.filter(o => o.status === 'delivered').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id.substring(0, 8).toUpperCase()}</td>
                  <td>{order.userEmail}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.items.length} item(s)</td>
                  <td className="order-total">${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`status-select status-${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {order.invoiceUrl ? (
                      <a 
                        href={order.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="invoice-link"
                      >
                        View
                      </a>
                    ) : (
                      <span className="no-invoice">Pending</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn-view-details"
                      onClick={() => {
                        const details = order.items.map(item => 
                          `${item.name} (${item.quantity}x) - $${item.price}`
                        ).join('\n');
                        alert(`Order Details:\n\n${details}\n\nShipping:\n${order.shippingAddress.address}\n${order.shippingAddress.city}, ${order.shippingAddress.zipCode}\nPhone: ${order.shippingAddress.phone}`);
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
