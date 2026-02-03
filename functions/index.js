const functions = require('firebase-functions');
const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Function to generate invoice PDF
function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);

    // Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('ShopStack', 50, 50);

    doc.fontSize(12)
       .font('Helvetica')
       .text('Your Online Store', 50, 80);

    // Invoice title
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('INVOICE', 400, 50);

    // Invoice details
    const invoiceY = 100;
    doc.fontSize(11)
       .text(`Invoice #: ${order.id.substring(0, 12).toUpperCase()}`, 50, invoiceY)
       .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, invoiceY + 20)
       .text(`Customer Email: ${order.userEmail}`, 50, invoiceY + 40);

    // Shipping address
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('SHIPPING ADDRESS', 50, invoiceY + 70);

    doc.fontSize(10)
       .font('Helvetica')
       .text(order.shippingAddress.address, 50, invoiceY + 95)
       .text(`${order.shippingAddress.city}, ${order.shippingAddress.zipCode}`, 50, invoiceY + 115)
       .text(`Phone: ${order.shippingAddress.phone}`, 50, invoiceY + 135);

    // Items table
    const tableTop = invoiceY + 170;
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('ITEMS', 50, tableTop);

    let itemY = tableTop + 25;
    doc.fontSize(10)
       .font('Helvetica')
       .text('Product', 50, itemY)
       .text('Quantity', 250, itemY)
       .text('Price', 350, itemY)
       .text('Total', 450, itemY);

    itemY += 15;
    doc.moveTo(50, itemY - 5)
       .lineTo(550, itemY - 5)
       .stroke();

    itemY += 10;
    order.items.forEach((item) => {
      doc.text(item.name, 50, itemY)
         .text(item.quantity.toString(), 250, itemY)
         .text(`$${item.price.toFixed(2)}`, 350, itemY)
         .text(`$${(item.quantity * item.price).toFixed(2)}`, 450, itemY);
      itemY += 20;
    });

    // Total
    doc.moveTo(50, itemY)
       .lineTo(550, itemY)
       .stroke();

    itemY += 15;
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('TOTAL', 350, itemY)
       .text(`$${order.totalAmount.toFixed(2)}`, 450, itemY);

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .text('Thank you for your purchase!', 50, 700);

    doc.end();
  });
}

// Cloud Function: Generate invoice when order is created
exports.generateInvoice = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const orderData = snap.data();

    try {
      // Generate PDF
      const pdfBuffer = await generateInvoicePDF({
        id: orderId,
        ...orderData
      });

      // Upload to Firebase Storage
      const filename = `invoices/${orderId}.pdf`;
      const file = bucket.file(filename);

      await file.save(pdfBuffer, {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            firebaseStorageDownloadTokens: context.eventId
          }
        }
      });

      // Get download URL
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      // Update order with invoice URL
      await db.collection('orders').doc(orderId).update({
        invoiceUrl: url,
        invoiceGeneratedAt: new Date()
      });

      console.log(`Invoice generated for order ${orderId}`);
      return { success: true, invoiceUrl: url };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new functions.https.HttpsError('internal', 'Failed to generate invoice');
    }
  });
