/**
 * ShopStack - Demo Data Initialization Script
 * 
 * This script initializes the Firebase database with demo products and admin/customer users.
 * Run this script once after deploying to Firebase to populate the database with sample data.
 * 
 * Usage: node initializeData.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  console.error('Set it to your Firebase service account key JSON file path');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Demo products data
const DEMO_PRODUCTS = [
  {
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
    stock: 15,
    imageUrl: 'https://via.placeholder.com/300x300?text=Headphones'
  },
  {
    name: 'USB-C Cable',
    price: 12.99,
    description: 'Durable 6-foot USB-C charging and data transfer cable',
    stock: 50,
    imageUrl: 'https://via.placeholder.com/300x300?text=USB-C+Cable'
  },
  {
    name: 'Portable Phone Stand',
    price: 15.99,
    description: 'Adjustable phone stand for desk, compatible with all phone sizes',
    stock: 30,
    imageUrl: 'https://via.placeholder.com/300x300?text=Phone+Stand'
  },
  {
    name: 'Wireless Keyboard',
    price: 44.99,
    description: 'Compact wireless mechanical keyboard with RGB backlight',
    stock: 20,
    imageUrl: 'https://via.placeholder.com/300x300?text=Keyboard'
  },
  {
    name: 'USB Flash Drive 64GB',
    price: 24.99,
    description: 'High-speed USB 3.0 flash drive with 64GB storage capacity',
    stock: 40,
    imageUrl: 'https://via.placeholder.com/300x300?text=Flash+Drive'
  },
  {
    name: 'Screen Protector Pack',
    price: 9.99,
    description: 'Pack of 5 tempered glass screen protectors for smartphones',
    stock: 60,
    imageUrl: 'https://via.placeholder.com/300x300?text=Screen+Protector'
  },
  {
    name: 'Laptop Stand',
    price: 34.99,
    description: 'Aluminum laptop stand for improved ergonomics and cooling',
    stock: 25,
    imageUrl: 'https://via.placeholder.com/300x300?text=Laptop+Stand'
  },
  {
    name: 'External Hard Drive 1TB',
    price: 59.99,
    description: 'Portable 1TB external hard drive for backup and file storage',
    stock: 18,
    imageUrl: 'https://via.placeholder.com/300x300?text=Hard+Drive'
  }
];

// Demo users data
const DEMO_USERS = [
  {
    email: 'admin@shopstack.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin'
  },
  {
    email: 'customer@shopstack.com',
    password: 'customer123',
    displayName: 'John Doe',
    role: 'customer'
  }
];

async function initializeData() {
  try {
    console.log('🚀 Initializing ShopStack demo data...\n');

    // Create users
    console.log('Creating demo users...');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      for (const user of DEMO_USERS) {
        try {
          const userRecord = await admin.auth().createUser({
            email: user.email,
            password: user.password,
            displayName: user.displayName
          });

          await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name: user.displayName,
            email: user.email,
            role: user.role,
            createdAt: new Date()
          });

          console.log(`✅ Created ${user.role}: ${user.email}`);
        } catch (error) {
          if (error.code === 'auth/email-already-exists') {
            console.log(`⚠️  User ${user.email} already exists`);
          } else {
            console.error(`❌ Error creating user ${user.email}:`, error.message);
          }
        }
      }
    } else {
      console.log('ℹ️  Users already exist, skipping user creation');
    }

    // Create products
    console.log('\nCreating demo products...');
    const productsSnapshot = await db.collection('products').get();
    
    if (productsSnapshot.empty) {
      let createdCount = 0;
      for (const product of DEMO_PRODUCTS) {
        await db.collection('products').add({
          ...product,
          createdAt: new Date()
        });
        createdCount++;
      }
      console.log(`✅ Created ${createdCount} demo products`);
    } else {
      console.log(`ℹ️  Products already exist (${productsSnapshot.size} found), skipping product creation`);
    }

    console.log('\n✅ Demo data initialization complete!');
    console.log('\nYou can now login with:');
    console.log('  Admin:    admin@shopstack.com / admin123');
    console.log('  Customer: customer@shopstack.com / customer123');
    console.log('\nHappy shopping! 🛍️\n');

  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initializeData();
