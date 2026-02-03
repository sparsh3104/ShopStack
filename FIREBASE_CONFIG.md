# ShopStack Firebase Configuration

This directory contains the Firebase configuration and deployment files for ShopStack.

## Files

- **firebase.json** - Firebase project configuration
- **firestore.rules** - Firestore database security rules
- **firestore.indexes.json** - Firestore composite indexes
- **storage.rules** - Firebase Storage security rules

## Deployment

To deploy all components:
```bash
firebase deploy
```

To deploy specific components:
```bash
# Deploy only Cloud Functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore

# Deploy only Storage rules
firebase deploy --only storage
```

## Security Rules

### Firestore Rules
- Users can only read/update their own documents
- Products can be read by anyone, written by admin only
- Orders can be read by the owner or admin, created by authenticated users
- Admin role is verified via Firestore documents

### Storage Rules
- Product images: public read, admin write only
- Invoices: read-only, accessible via signed URLs

## Indexes

Firestore uses the following composite indexes for optimal query performance:
- Orders by userId + createdAt (for customer order history)
- Orders by status + createdAt (for admin order filtering)

These are automatically created when you deploy using:
```bash
firebase deploy
```

## Troubleshooting

**"You don't have permission to access project"**
- Run `firebase login` to authenticate
- Verify you have the correct project: `firebase projects:list`
- Set the correct project: `firebase use shopstack-5351f`

**"Rules update failed"**
- Ensure the rules files are valid JSON/Firestore syntax
- Check the Firebase console for detailed error messages
- Review the rules documentation: https://firebase.google.com/docs/firestore/security/start

**"Indexes already exist"**
- Firebase will skip creating indexes that already exist
- This is normal and not an error
