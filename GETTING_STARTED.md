# ShopStack - Getting Started Guide

Welcome to ShopStack! This guide will help you get the application up and running in minutes.

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Firebase CLI** (will be installed during setup)
- A **GitHub Codespaces** environment or local terminal

## 🚀 Quick Start (5 minutes)

### 1. Navigate to the project
```bash
cd /workspaces/ShopStack
```

### 2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install Cloud Functions dependencies (from project root)
cd ../functions
npm install
```

### 3. Run the development server
```bash
cd ../frontend
npm run dev
```

The application will start at `http://localhost:5173`

### 4. Login with demo credentials
- **Admin**: admin@shopstack.com / admin123
- **Customer**: customer@shopstack.com / customer123

## 📦 Project Overview

### Frontend Structure
```
frontend/src/
├── pages/          # Page components (Home, Login, Orders, etc.)
├── components/     # Reusable components (Navbar, Footer, etc.)
├── contexts/       # React Context for Auth and Cart state
├── firebase.js     # Firebase configuration and initialization
└── App.jsx         # Main app component with routing
```

### Backend Structure
```
functions/
├── index.js        # Cloud Functions (invoice generation)
├── initializeData.js  # Demo data initialization script
└── package.json    # Dependencies (firebase-admin, pdfkit)
```

## 🔐 Authentication Flow

### Sign Up
1. User enters email, password, and name
2. Firebase Authentication creates user account
3. User document created in Firestore with role 'customer'

### Login
1. User enters email and password
2. Firebase Authentication verifies credentials
3. User role fetched from Firestore
4. AuthContext updated with user data
5. Redirected to home page

### Role-Based Access
- **Customer**: Access to shop, cart, checkout, orders
- **Admin**: Access to dashboard, product management, order management

Protected routes check the user's role and redirect if unauthorized.

## 🛒 Customer Features

### 1. Browse Products
- View all available products on the home page
- Each product shows image, name, price, and description
- Add to cart button visible for available items

### 2. Shopping Cart
- Add/remove items from cart
- Adjust quantities with +/- buttons
- Cart persists using browser localStorage
- View order summary with total amount

### 3. Checkout
- Enter shipping address (street, city, ZIP, phone)
- Review order items and total
- Place order button creates order in Firestore
- Cart is cleared after successful order

### 4. Order History
- View all past orders with timestamps
- See order status (pending, processing, shipped, delivered)
- Download invoice PDF for each order
- Real-time status updates

## 👨‍💼 Admin Features

### 1. Admin Dashboard
- View statistics: total products, orders, pending orders, revenue
- Quick links to product and order management

### 2. Product Management
- **Add Products**: Form to create new product with image upload
- **Edit Products**: Modify existing product details
- **Delete Products**: Remove products from inventory
- **Inventory**: Track stock levels

### 3. Order Management
- View all customer orders
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Update order status
- View customer details and shipping address
- Access and manage invoices

## 📚 Common Tasks

### Add a Product
1. Login as admin
2. Go to Admin → Products
3. Click "Add Product"
4. Fill in product details (name, price, description, stock)
5. Upload product image
6. Click "Add Product"

### Place an Order
1. Login as customer
2. Browse products on home page
3. Click "Add to Cart"
4. Click cart icon to view cart
5. Click "Proceed to Checkout"
6. Fill in shipping address
7. Click "Place Order"
8. Order appears in "My Orders" with invoice link

### Update Order Status
1. Login as admin
2. Go to Admin → Orders
3. Click status dropdown for an order
4. Select new status (processing, shipped, delivered)
5. Changes are saved immediately

### Download Invoice
1. Login as customer
2. Go to "My Orders"
3. Find an order with "Download Invoice" button
4. Click to download PDF

## 🔧 Development Commands

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Cloud Functions (Local Testing)
```bash
# Start Firebase emulators (requires Firebase CLI)
firebase emulators:start

# Deploy functions to Firebase
firebase deploy --only functions
```

### Database
```bash
# Deploy Firestore rules
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Deploy everything
firebase deploy
```

## 🌐 Deployment

### Deploy to Firebase Hosting

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy everything**
```bash
cd ..
firebase deploy
```

Your app will be live at: `https://shopstack-5351f.web.app`

### Deploy Only Updates
```bash
# Update only Cloud Functions
firebase deploy --only functions

# Update only rules
firebase deploy --only firestore,storage

# Update only frontend
firebase deploy --only hosting
```

## 🐛 Troubleshooting

### "Cannot find module 'firebase'"
**Solution**: Install dependencies
```bash
cd frontend
npm install
```

### "Login failed - Invalid credentials"
**Solution**: Use demo credentials
- Admin: admin@shopstack.com / admin123
- Customer: customer@shopstack.com / customer123

### "Permission denied" when adding products
**Solution**: Make sure you're logged in as admin
```bash
# Check your Firestore database
# User document should have role: 'admin'
```

### "Cart items disappear after logout"
**This is by design** - cart is stored per user. Login with the same account to see your cart.

### "Invoice download returns 404"
**Solution**: 
1. Ensure Cloud Functions are deployed: `firebase deploy --only functions`
2. Place a new order to generate invoice
3. Invoices are created automatically when order is placed

### Port 5173 already in use
**Solution**: Use a different port
```bash
cd frontend
npm run dev -- --port 3000
```

## 📞 Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **React Router Documentation**: https://reactrouter.com

## 💡 Tips & Best Practices

1. **Always login before accessing customer/admin features**
   - Unauthenticated users are redirected to login page

2. **Use browser DevTools to debug**
   - Check Console for errors
   - Check Network tab for Firebase API calls
   - Check Application → LocalStorage for cart data

3. **Test both customer and admin flows**
   - Use incognito window to test multiple accounts
   - Verify role-based access restrictions work

4. **Monitor Firebase costs**
   - Free tier: 50,000 reads/writes per day
   - Review usage in Firebase Console

5. **Keep security rules up to date**
   - Review rules before production deployment
   - Test rules thoroughly with different user roles

## 🎯 Next Steps

1. ✅ Run the development server
2. ✅ Test customer workflow (add to cart, checkout)
3. ✅ Test admin workflow (manage products)
4. ✅ Deploy to Firebase (when ready)
5. ✅ Share with users!

## 🚀 Ready to Deploy?

Follow the deployment guide in [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) to deploy your app to production.

---

**Happy coding! Have fun building with ShopStack! 🎉**
