const functions = require('firebase-functions');
const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Function to generate professional invoice PDF
function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);

    // Company Header
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#667eea')
       .text('ShopStack', 50, 40);

    doc.fontSize(11)
       .fillColor('#666')
       .font('Helvetica')
       .text('Professional Hardware Store', 50, 75)
       .text('www.shopstack.com | support@shopstack.com', 50, 92);

    // Invoice Title and Number
    doc.fontSize(18)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text('INVOICE', 450, 50);

    doc.fontSize(11)
       .fillColor('#333')
       .font('Helvetica')
       .text(`Invoice #: ${order.id.substring(0, 12).toUpperCase()}`, 450, 80, { align: 'right' });

    // Horizontal line
    doc.strokeColor('#ddd')
       .lineWidth(1)
       .moveTo(50, 120)
       .lineTo(550, 120)
       .stroke();

    // Invoice Details
    const detailsY = 140;
    doc.fontSize(10)
       .fillColor('#666')
       .text('INVOICE DATE:', 50, detailsY)
       .text('ORDER STATUS:', 50, detailsY + 20);

    const orderDate = order.createdAt instanceof Date 
      ? order.createdAt.toLocaleDateString() 
      : new Date(order.createdAt.seconds * 1000).toLocaleDateString();

    doc.fontSize(10)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text(orderDate, 180, detailsY)
       .text(order.status.toUpperCase(), 180, detailsY + 20);

    // Bill To Section
    doc.fontSize(11)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text('BILL TO:', 50, detailsY + 60);

    doc.fontSize(10)
       .fillColor('#333')
       .font('Helvetica')
       .text(order.userEmail, 50, detailsY + 85)
       .text(order.shippingAddress.phone, 50, detailsY + 103);

    // Shipping Address Section
    doc.fontSize(11)
       .fillColor('#1a1a1a')
       .font('Helvetica-Bold')
       .text('SHIPPING ADDRESS:', 320, detailsY + 60);

    doc.fontSize(10)
       .fillColor('#333')
       .font('Helvetica')
       .text(order.shippingAddress.address, 320, detailsY + 85)
       .text(`${order.shippingAddress.city}, ${order.shippingAddress.zipCode}`, 320, detailsY + 103);

    // Items Table Header
    const tableTop = detailsY + 160;
    const col1 = 50, col2 = 280, col3 = 400, col4 = 520;

    doc.fillColor('#667eea')
       .rect(col1 - 10, tableTop - 5, 520, 25)
       .fill();

    doc.fontSize(11)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text('Description', col1, tableTop + 5)
       .text('Qty', col2, tableTop + 5)
       .text('Unit Price', col3, tableTop + 5)
       .text('Amount', col4, tableTop + 5, { align: 'right' });

    // Items
    let itemY = tableTop + 35;
    const lineHeight = 25;
    let subtotal = 0;

    order.items.forEach((item) => {
      doc.fontSize(10)
         .fillColor('#333')
         .font('Helvetica');

      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;

      // Alternate row background
      if (Math.floor((itemY - tableTop - 35) / lineHeight) % 2 === 0) {
        doc.fillColor('#f8f9fa')
           .rect(col1 - 10, itemY - 8, 520, lineHeight)
           .fill();
      }

      doc.fillColor('#1a1a1a')
         .font('Helvetica')
         .text(item.name, col1, itemY)
         .text(item.quantity.toString(), col2, itemY)
         .text(`$${item.price.toFixed(2)}`, col3, itemY)
         .text(`$${itemTotal.toFixed(2)}`, col4, itemY, { align: 'right' });

      itemY += lineHeight;
    });

    // Summary Section
    const summaryY = itemY + 10;

    doc.strokeColor('#ddd')
       .lineWidth(1)
       .moveTo(col1 - 10, summaryY)
       .lineTo(550, summaryY)
       .stroke();

    doc.fontSize(10)
       .fillColor('#666')
       .font('Helvetica')
       .text('Subtotal:', col3, summaryY + 15)
       .text('Shipping:', col3, summaryY + 35)
       .text('Tax (0%):', col3, summaryY + 55);

    doc.fillColor('#1a1a1a')
       .text(`$${subtotal.toFixed(2)}`, col4, summaryY + 15, { align: 'right' })
       .text('$0.00', col4, summaryY + 35, { align: 'right' })
       .text('$0.00', col4, summaryY + 55, { align: 'right' });

    // Total
    doc.strokeColor('#667eea')
       .lineWidth(2)
       .moveTo(col1 - 10, summaryY + 75)
       .lineTo(550, summaryY + 75)
       .stroke();

    doc.fontSize(13)
       .fillColor('#667eea')
       .font('Helvetica-Bold')
       .text('TOTAL DUE:', col3, summaryY + 85)
       .text(`$${order.totalAmount.toFixed(2)}`, col4, summaryY + 85, { align: 'right' });

    // Footer
    doc.fontSize(9)
       .fillColor('#999')
       .font('Helvetica')
       .text('Thank you for your purchase! This is a professional invoice generated by ShopStack.', 50, 700, { align: 'center' })
       .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, 715, { align: 'center' });

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
      console.log(`Generating invoice for order ${orderId}`);

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF({
        id: orderId,
        ...orderData
      });

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const filename = `invoices/${orderId}-${timestamp}.pdf`;
      const file = bucket.file(filename);

      await file.save(pdfBuffer, {
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=3600',
          metadata: {
            orderId: orderId,
            generatedAt: new Date().toISOString()
          }
        }
      });

      // Get download URL valid for 365 days
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      // Update order with invoice URL
      await db.collection('orders').doc(orderId).update({
        invoiceUrl: url,
        invoiceId: filename,
        invoiceGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        invoiceStatus: 'ready'
      });

      console.log(`✅ Invoice generated successfully for order ${orderId}`);
      return { success: true, invoiceUrl: url, orderId: orderId };
    } catch (error) {
      console.error(`❌ Error generating invoice for order ${orderId}:`, error);
      
      // Update order with error status
      try {
        await db.collection('orders').doc(orderId).update({
          invoiceStatus: 'failed',
          invoiceError: error.message
        });
      } catch (updateError) {
        console.error('Failed to update order with error status:', updateError);
      }

      throw new functions.https.HttpsError('internal', 'Failed to generate invoice');
    }
  });

// HTTP Function: Manually regenerate invoice (for admin use)
exports.regenerateInvoice = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { orderId } = data;

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID is required');
  }

  try {
    // Get order
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const orderData = orderDoc.data();

    // Check if user is admin or order owner
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (userData.role !== 'admin' && orderData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized to regenerate this invoice');
    }

    // Generate new invoice
    const pdfBuffer = await generateInvoicePDF({
      id: orderId,
      ...orderData
    });

    const timestamp = Date.now();
    const filename = `invoices/${orderId}-${timestamp}.pdf`;
    const file = bucket.file(filename);

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        cacheControl: 'public, max-age=3600'
      }
    });

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000
    });

    // Update order
    await db.collection('orders').doc(orderId).update({
      invoiceUrl: url,
      invoiceId: filename,
      invoiceGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      invoiceStatus: 'ready'
    });

    console.log(`✅ Invoice regenerated for order ${orderId}`);
    return { success: true, invoiceUrl: url };
  } catch (error) {
    console.error('Error regenerating invoice:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to regenerate invoice');
  }
});
