import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Initialize() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleInitialize() {
    setLoading(true);
    setStatus('Starting initialization...');

    try {
      // Step 1: Create admin user
      setStatus('Creating admin user...');
      try {
        const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@shopstack.com', 'admin123');
        await setDoc(doc(db, 'users', adminCredential.user.uid), {
          uid: adminCredential.user.uid,
          name: 'Admin User',
          email: 'admin@shopstack.com',
          role: 'admin',
          createdAt: new Date()
        });
        setStatus('✅ Admin user created!');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setStatus('ℹ️ Admin user already exists, continuing...');
        } else {
          throw error;
        }
      }

      // Step 2: Check if products already exist
      const productsSnapshot = await getDocs(collection(db, 'products'));
      if (productsSnapshot.size > 0) {
        setStatus(`ℹ️ Found ${productsSnapshot.size} products already. Skipping product creation.`);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // Step 3: Add products
      setStatus('Adding products to database...');
      const products = [
        { name: 'Wireless Bluetooth Headphones Pro', price: 129.99, description: 'Premium noise-canceling wireless headphones with 40-hour battery life, Bluetooth 5.0, built-in mic', stock: 25, category: 'Audio', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', specifications: { brand: 'TechAudio', batteryLife: '40 hours', connectivity: 'Bluetooth 5.0', weight: '250g', warranty: '2 years' } },
        { name: 'High-Speed USB-C Cable 3.1', price: 15.99, description: 'Premium 6-foot USB-C 3.1 cable for fast charging and data transfer up to 10Gbps', stock: 100, category: 'Cables & Adapters', imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop', specifications: { length: '6 feet', version: 'USB 3.1', dataTransfer: '10Gbps', chargingAmperage: '5A', warranty: '1 year' } },
        { name: 'Ergonomic Phone Stand Adjustable', price: 19.99, description: 'Adjustable aluminum phone stand for desk, compatible with all smartphones and tablets', stock: 50, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop', specifications: { material: 'Aluminum', compatibility: 'Universal', adjustability: 'Full 360°', maxWeight: '2kg', warranty: '1 year' } },
        { name: 'Mechanical Gaming Keyboard RGB', price: 79.99, description: 'Professional mechanical keyboard with RGB backlight, tactile switches, 60% compact design', stock: 30, category: 'Keyboards', imageUrl: 'https://images.unsplash.com/photo-1587829191301-26a1489c1fc6?w=300&h=300&fit=crop', specifications: { switchType: 'Mechanical', layout: '60% Compact', backlight: 'RGB', keyCount: '61', warranty: '2 years' } },
        { name: 'USB 3.0 Flash Drive 64GB', price: 24.99, description: 'High-speed USB 3.0 flash drive with 64GB storage capacity and secure encryption', stock: 75, category: 'Storage', imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', specifications: { capacity: '64GB', interface: 'USB 3.0', readSpeed: '150MB/s', writeSpeed: '90MB/s', warranty: '5 years' } },
        { name: 'Tempered Glass Screen Protector Pack', price: 9.99, description: 'Pack of 3 premium tempered glass screen protectors with installation kit', stock: 200, category: 'Phone Accessories', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop', specifications: { quantity: '3 pcs', thickness: '0.3mm', hardness: '9H', compatibility: 'Most smartphones', warranty: '6 months' } },
        { name: 'Premium Aluminum Laptop Stand', price: 49.99, description: 'Heavy-duty aluminum laptop stand for improved ergonomics and cooling, adjustable height', stock: 40, category: 'Laptop Accessories', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop', specifications: { material: 'Aluminum Alloy', compatibility: '10"-17" laptops', adjustment: 'Adjustable Height & Angle', maxLoad: '25kg', warranty: '3 years' } },
        { name: 'External SSD 1TB USB-C', price: 99.99, description: 'Portable 1TB external SSD with USB-C 3.1 interface, 550MB/s transfer speed', stock: 35, category: 'Storage', imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', specifications: { capacity: '1TB', interface: 'USB-C 3.1', readSpeed: '550MB/s', writeSpeed: '450MB/s', warranty: '5 years' } },
        { name: 'Wireless Mouse Pro', price: 39.99, description: 'Precision wireless mouse with 2.4GHz receiver, ergonomic design, 18-month battery', stock: 60, category: 'Mice', imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop', specifications: { connectivity: '2.4GHz Wireless', dpi: '3200 DPI', batteryLife: '18 months', buttons: '6 programmable', warranty: '2 years' } },
        { name: '4K Webcam Professional', price: 129.99, description: '4K resolution webcam with autofocus, stereo microphone, USB plug-and-play', stock: 20, category: 'Video', imageUrl: 'https://images.unsplash.com/photo-1598211165051-faa9a5cbe3a0?w=300&h=300&fit=crop', specifications: { resolution: '4K (2160p)', frameRate: '30fps', autofocus: 'Yes', microphone: 'Stereo', warranty: '2 years' } },
        { name: 'Portable Phone Charger 20000mAh', price: 34.99, description: 'High-capacity portable power bank with dual USB and USB-C output, 20000mAh capacity', stock: 80, category: 'Power & Charging', imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop', specifications: { capacity: '20000mAh', output: 'Dual USB + USB-C', fastCharging: 'Yes', weight: '380g', warranty: '2 years' } },
        { name: 'USB Hub 7-Port Active', price: 44.99, description: 'Active USB 3.0 hub with 7 ports, power adapter included, hot-swappable', stock: 45, category: 'Hubs & Adapters', imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop', specifications: { ports: '7x USB 3.0', powerSupply: 'Included', dataTransfer: '5Gbps', compatible: 'Windows & Mac', warranty: '2 years' } },
        { name: 'HDMI 2.1 Cable 8K Support', price: 21.99, description: 'Premium HDMI 2.1 cable with 8K support at 120Hz, 2 meters length, gold-plated connectors', stock: 90, category: 'Cables & Adapters', imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop', specifications: { standard: 'HDMI 2.1', support: '8K@120Hz', length: '2 meters', connector: 'Gold-plated', warranty: '3 years' } }
      ];

      for (let i = 0; i < products.length; i++) {
        await addDoc(collection(db, 'products'), {
          ...products[i],
          createdAt: serverTimestamp()
        });
        setStatus(`Added ${i + 1}/${products.length} products...`);
      }

      setStatus('✅ All done! Created admin user and added 13 products. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#667eea', marginBottom: '1rem' }}>🚀 Initialize ShopStack</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This will create the admin user and add sample products to your store.
      </p>
      
      <button
        onClick={handleInitialize}
        disabled={loading}
        style={{
          background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {loading ? '⏳ Initializing...' : '✨ Initialize Now'}
      </button>

      {status && (
        <div style={{
          background: status.includes('✅') ? '#d1e7dd' : status.includes('❌') ? '#f8d7da' : '#cfe2ff',
          color: status.includes('✅') ? '#0f5132' : status.includes('❌') ? '#842029' : '#084298',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          fontWeight: '600'
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <p>This will create:</p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '1rem auto' }}>
          <li>Admin user: admin@shopstack.com / admin123</li>
          <li>13 hardware products with images</li>
        </ul>
      </div>
    </div>
  );
}
