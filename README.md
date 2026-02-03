# ShopStack - Production-Ready E-Commerce Application

A complete, full-stack e-commerce web application built with React, Vite, and Firebase. This project demonstrates modern frontend architecture, secure backend rules, and cloud functions for scalable e-commerce operations.

## 🎯 Features

### Customer Features
- **User Authentication**: Email/password signup and login with role-based access
- **Product Catalog**: Browse products with images, prices, and descriptions
- **Shopping Cart**: Add/remove items, manage quantities with persistent storage
- **Checkout**: Secure order placement with shipping address collection
- **Order Management**: View order history with real-time status updates
- **Invoice Downloads**: Automatically generated PDF invoices for each order

### Admin Features
- **Secure Admin Dashboard**: Role-based access control for administrative functions
- **Product Management**: Add, edit, delete products with image uploads to Firebase Storage
- **Order Management**: View all customer orders and update order status
- **Business Analytics**: Dashboard displaying total products, orders, pending items, and revenue
- **Invoice Management**: Access and manage customer invoices

## 🏗️ Project Structure

```
ShopStack/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Auth.css
│   │   │   ├── Cart.jsx
│   │   │   ├── Cart.css
│   │   │   ├── Checkout.jsx
│   │   │   ├── Checkout.css
│   │   │   ├── Orders.jsx
│   │   │   ├── Orders.css
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDashboard.css
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminProducts.css
│   │   │   ├── AdminOrders.jsx
│   │   │   └── AdminOrders.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.css
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductCard.css
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── functions/
│   ├── index.js
│   └── package.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- GitHub Codespaces or local development environment

### Installation

1. **Clone or setup the repository**
```bash
cd /workspaces/ShopStack
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

3. **Install Cloud Functions Dependencies**
```bash
cd ../functions
npm install
```

## 🔐 Authentication & Security

### Firebase Configuration
The application uses the following Firebase configuration (pre-configured):
```javascript
{
  apiKey: "AIzaSyARKYbJGqCUPwb8GR1s6JKUHIeyBe2L7Z8",
  authDomain: "shopstack-5351f.firebaseapp.com",
  projectId: "shopstack-5351f",
  storageBucket: "shopstack-5351f.firebasestorage.app",
  messagingSenderId: "512342951833",
  appId: "1:512342951833:web:c9294afe9a52acb81bf508"
}
```

### Demo Credentials
Login with these credentials to test the application:

**Admin Account:**
- Email: `admin@shopstack.com`
- Password: `admin123`

**Customer Account:**
- Email: `customer@shopstack.com`
- Password: `customer123`

### User Roles
- **Customer**: Can browse products, add to cart, place orders, and view their orders
- **Admin**: Can manage products, manage all orders, and view business analytics

## 💾 Database Structure

### Firestore Collections

#### `users`
```javascript
{
  uid: string,          // Firebase UID
  name: string,         // User's full name
  email: string,        // User's email
  role: string,         // 'customer' or 'admin'
  createdAt: timestamp  // Account creation date
}
```

#### `products`
```javascript
{
  name: string,         // Product name
  price: number,        // Product price in USD
  description: string,  // Product description
  stock: number,        // Available quantity
  imageUrl: string,     // URL to product image in Storage
  createdAt: timestamp  // Product creation date
}
```

#### `orders`
```javascript
{
  userId: string,       // Reference to users/{uid}
  userEmail: string,    // Customer email
  items: array,         // Array of ordered items with details
  totalAmount: number,  // Total order amount
  shippingAddress: {    // Delivery address
    address: string,
    city: string,
    zipCode: string,
    phone: string
  },
  status: string,       // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  invoiceUrl: string,   // URL to PDF invoice
  invoiceGeneratedAt: timestamp,
  createdAt: timestamp  // Order placement date
}
```

## 🔒 Security Rules

### Firestore Rules
- **Users**: Only users can read/update their own profile
- **Products**: All authenticated users can read; only admins can write
- **Orders**: Customers see only their orders; admins see all orders

### Storage Rules
- **Product Images**: Public read, admin upload only
- **Invoices**: Accessible via signed URLs for order owners and admins

## ⚙️ Firebase Cloud Functions

### `generateInvoice()`
Triggers automatically when a new order is created:
1. Generates a professional PDF invoice using PDFKit
2. Uploads the invoice to Firebase Storage with a signed URL
3. Updates the order document with the invoice URL
4. Provides a one-year download link for the customer

**Triggered on**: `orders` document creation
**Output**: Invoice PDF stored in `invoices/{orderId}.pdf`

## 🎨 UI/UX Design

### Design Principles
- **Minimalist Layout**: Clean, spacious interface without clutter
- **Consistent Styling**: Unified color palette (purple gradient: #667eea to #764ba2)
- **Mobile Responsive**: Fully responsive design using CSS Grid and Flexbox
- **Clear CTAs**: Prominent, actionable buttons with clear hierarchy
- **Professional Appearance**: Modern, production-ready look

### Responsive Breakpoints
- Desktop: Full layout (1200px+)
- Tablet: Adjusted grid layout (768px - 1199px)
- Mobile: Single column layout (<768px)

## 🚀 Deployment

### Deploy to Firebase Hosting & Cloud Functions

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Build the Frontend**
```bash
cd frontend
npm run build
```

4. **Deploy to Firebase**
```bash
cd ..
firebase deploy
```

This command will:
- Deploy Cloud Functions to your Firebase project
- Deploy Firestore and Storage rules
- Deploy the frontend to Firebase Hosting

### Deploy Only Cloud Functions
```bash
firebase deploy --only functions
```

### Deploy Only Rules
```bash
firebase deploy --only firestore,storage
```

## 🔧 Development Workflow

### Run Frontend Locally
```bash
cd frontend
npm run dev
```

### Run Cloud Functions Locally
```bash
firebase emulators:start
```

### Environment Variables
The Firebase configuration is hardcoded in `frontend/src/firebase.js`. For production, consider using environment variables:

```javascript
// Example: frontend/.env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

Then update `firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

## 📦 Technologies Used

### Frontend
- **React 18**: UI framework with hooks and context API
- **Vite**: Lightning-fast build tool and dev server
- **React Router**: Client-side routing
- **Firebase SDK v9**: Modular Firebase services
- **Plain CSS**: Custom styling for full control

### Backend
- **Firebase Firestore**: NoSQL cloud database
- **Firebase Authentication**: Email/password authentication
- **Firebase Storage**: Image and invoice storage
- **Firebase Cloud Functions**: Serverless backend logic
- **PDFKit**: PDF generation for invoices

### DevOps
- **Firebase CLI**: Project management and deployment
- **GitHub Codespaces**: Cloud-based development environment

## 🎓 Key Learnings & Best Practices

### Authentication
- Role-based access control (RBAC) via Firestore documents
- Protected routes using React context and higher-order components
- Persistent authentication state with Firebase session management

### State Management
- React Context API for global authentication and cart state
- LocalStorage for persistent shopping cart
- Firestore for persistent order and product data

### UI Components
- Reusable component architecture (ProductCard, Navbar, etc.)
- CSS modules and component-scoped styling
- Responsive design patterns using CSS Grid and Flexbox

### Security
- Firestore security rules enforcing role-based access
- Storage rules for admin-only uploads
- No sensitive data in localStorage
- Secure invoice links via signed URLs

### Performance
- Lazy loading with React.lazy and Suspense (ready for implementation)
- Image optimization in Storage
- Efficient Firestore queries with proper indexing
- Vite's optimized bundle splitting

## 🐛 Troubleshooting

### Common Issues

**"Firebase configuration not found"**
- Ensure `firebase.js` exists in `frontend/src/`
- Check that the configuration object is properly exported

**"Permission denied" on Firestore**
- Verify security rules are deployed: `firebase deploy --only firestore`
- Check user role in Firestore `users` collection
- Ensure user UID matches authentication context

**"Cannot upload product images"**
- Verify Storage rules allow admin uploads: `firebase deploy --only storage`
- Check that the user has `role: 'admin'` in the `users` collection

**"Invoice generation fails"**
- Ensure Cloud Functions are deployed: `firebase deploy --only functions`
- Check function logs: `firebase functions:log`
- Verify PDFKit is installed in functions/package.json

**"Cart items not persisting"**
- Check browser's localStorage is enabled
- Verify user is authenticated before accessing cart
- Clear localStorage and try again: `localStorage.clear()`

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase documentation: https://firebase.google.com/docs
3. Check Vite documentation: https://vitejs.dev
4. Review React Router docs: https://reactrouter.com

## 📄 License

This project is provided as-is for educational and commercial use.

## 🎉 Credits

Built with modern web technologies and Firebase services to create a production-ready e-commerce platform.

---

**Happy Coding! 🚀**