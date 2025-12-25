import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

import { Payment } from '../../infrastructure/database/entities/payment.entity';
import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { User } from '../../infrastructure/database/entities/user.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
  ) {}

  async generateInvoice(paymentId: string, cartItems: CartItem[], user: User): Promise<Buffer> {
    const payment = await this.payments.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return this.generateInvoiceBuffer(payment, cartItems, user);
  }

  async generateInvoiceBuffer(
    payment: Payment,
    cartItems: CartItem[],
    user: User,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
    });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const primaryColor = '#0ea5e9'; // Sky blue
    const darkColor = '#1e293b'; // Slate 800
    const lightColor = '#64748b'; // Slate 500
    const borderColor = '#e2e8f0'; // Slate 200

    // Header Section with Background
    doc.rect(0, 0, pageWidth, 120)
       .fillColor(primaryColor)
       .fill();

    // Company Logo/Name
    doc.fillColor('#ffffff')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('CINE STORIEES', margin, 30, { align: 'left' });
    
    doc.fillColor('#ffffff')
       .fontSize(12)
       .font('Helvetica')
       .text('Photography Services', margin, 60, { align: 'left' });

    // Invoice Title
    doc.fillColor('#ffffff')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('INVOICE', pageWidth - margin, 40, { align: 'right' });

    // Reset fill color
    doc.fillColor('#000000');

    // Invoice Details Section
    let yPos = 140;

    // Invoice Number and Date Box
    const invoiceBoxWidth = 200;
    const invoiceBoxX = pageWidth - margin - invoiceBoxWidth;
    
    doc.rect(invoiceBoxX, yPos, invoiceBoxWidth, 60)
       .strokeColor(borderColor)
       .lineWidth(1)
       .stroke();

    doc.fillColor(darkColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('INVOICE NUMBER', invoiceBoxX + 10, yPos + 10);
    
    doc.fillColor('#000000')
       .fontSize(11)
       .font('Helvetica')
       .text(payment.referenceId, invoiceBoxX + 10, yPos + 25, { width: invoiceBoxWidth - 20 });

    doc.fillColor(darkColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('INVOICE DATE', invoiceBoxX + 10, yPos + 45);
    
    const invoiceDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fillColor('#000000')
       .fontSize(11)
       .font('Helvetica')
       .text(invoiceDate, invoiceBoxX + 10, yPos + 60, { width: invoiceBoxWidth - 20 });

    // Customer Details Section
    yPos += 80;
    
    doc.fillColor(darkColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('BILL TO:', margin, yPos);

    yPos += 25;

    const customerDetails = (payment.payload as any)?.customerDetails || {};
    const customerName = customerDetails.name || user.name || 'Guest User';
    const customerEmail = customerDetails.email || user.email || '';
    const customerPhone = customerDetails.phone || user.phone || '';
    const customerAddress = customerDetails.address || user.address || '';

    doc.fillColor('#000000')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(customerName, margin, yPos);

    yPos += 18;

    if (customerEmail) {
      doc.fillColor(lightColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Email: ${customerEmail}`, margin, yPos);
      yPos += 15;
    }

    if (customerPhone) {
      doc.fillColor(lightColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Phone: ${customerPhone}`, margin, yPos);
      yPos += 15;
    }

    if (customerAddress) {
      doc.fillColor(lightColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Address: ${customerAddress}`, margin, yPos, { width: 300 });
      yPos += 20;
    }

    // Items Table Header
    yPos += 20;
    const tableTop = yPos;
    
    // Table Header Background
    doc.rect(margin, yPos, contentWidth, 35)
       .fillColor(primaryColor)
       .fill();

    // Table Header Text
    doc.fillColor('#ffffff')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('DESCRIPTION', margin + 10, yPos + 12)
       .text('QUANTITY', margin + 250, yPos + 12)
       .text('UNIT PRICE', margin + 320, yPos + 12)
       .text('AMOUNT', pageWidth - margin - 100, yPos + 12, { align: 'right' });

    yPos += 35;

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach((item) => {
      const price = item.service?.price || 0;
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      subtotal += itemTotal;
    });

    // Items Table Rows
    cartItems.forEach((item, index) => {
      const price = item.service?.price || 0;
      const quantity = item.quantity;
      const itemTotal = price * quantity;
      const rowHeight = 40;

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(margin, yPos, contentWidth, rowHeight)
           .fillColor('#f8fafc')
           .fill();
      }

      // Row border
      doc.rect(margin, yPos, contentWidth, rowHeight)
         .strokeColor(borderColor)
         .lineWidth(0.5)
         .stroke();

      // Service Title
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(item.service?.title || 'Service', margin + 10, yPos + 8, { width: 230 });

      // Quantity
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica')
         .text(quantity.toString(), margin + 250, yPos + 8, { width: 60 });

      // Unit Price
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica')
         .text(`₹${price.toLocaleString('en-IN')}`, margin + 320, yPos + 8, { width: 80 });

      // Amount
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`₹${itemTotal.toLocaleString('en-IN')}`, pageWidth - margin - 10, yPos + 8, { 
           align: 'right',
           width: 90 
         });

      yPos += rowHeight;
    });

    // Summary Section
    yPos += 20;
    const summaryX = pageWidth - margin - 250;
    const summaryWidth = 250;

    // Subtotal
    doc.fillColor(lightColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Subtotal:', summaryX, yPos, { width: 150 });

    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`₹${subtotal.toLocaleString('en-IN')}`, summaryX + 150, yPos, { align: 'right', width: 100 });

    yPos += 20;

    // Tax (if applicable - currently 0)
    const tax = 0;
    doc.fillColor(lightColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Tax (GST):', summaryX, yPos, { width: 150 });

    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(`₹${tax.toLocaleString('en-IN')}`, summaryX + 150, yPos, { align: 'right', width: 100 });

    yPos += 25;

    // Total Box
    doc.rect(summaryX, yPos, summaryWidth, 50)
       .fillColor(primaryColor)
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('TOTAL AMOUNT', summaryX + 10, yPos + 10);

    const totalAmount = subtotal + tax;
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(`₹${totalAmount.toLocaleString('en-IN')}`, summaryX + 10, yPos + 30);

    // Payment Details Section
    yPos += 80;
    
    doc.fillColor(darkColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('PAYMENT DETAILS', margin, yPos);

    yPos += 20;

    const paymentDetailsBoxWidth = contentWidth;
    doc.rect(margin, yPos, paymentDetailsBoxWidth, 80)
       .strokeColor(borderColor)
       .lineWidth(1)
       .stroke();

    const payload = payment.payload as any;
    const razorpayPaymentId = payload?.razorpay_payment_id || 'N/A';
    const razorpayOrderId = payment.referenceId;

    doc.fillColor(darkColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Payment Reference ID:', margin + 10, yPos + 10);

    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica')
       .text(razorpayOrderId, margin + 10, yPos + 25, { width: paymentDetailsBoxWidth - 20 });

    doc.fillColor(darkColor)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Razorpay Payment ID:', margin + 10, yPos + 45);

    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica')
       .text(razorpayPaymentId, margin + 10, yPos + 60, { width: paymentDetailsBoxWidth - 20 });

    // Payment Status Badge
    const statusX = pageWidth - margin - 120;
    const statusColor = payment.status === 'paid' ? '#10b981' : payment.status === 'refunded' ? '#f59e0b' : '#ef4444';
    
    doc.rect(statusX, yPos + 10, 110, 25)
       .fillColor(statusColor)
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(payment.status.toUpperCase(), statusX + 5, yPos + 17, { align: 'center', width: 100 });

    // Footer Section
    const footerY = pageHeight - 80;
    
    // Footer line
    doc.moveTo(margin, footerY)
       .lineTo(pageWidth - margin, footerY)
       .strokeColor(borderColor)
       .lineWidth(1)
       .stroke();

    doc.fillColor(lightColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Thank you for your business!', margin, footerY + 10, { align: 'center', width: contentWidth });

    doc.fillColor(lightColor)
       .fontSize(8)
         .font('Helvetica')
         .text('Cine Stories - Professional Photography Services', margin, footerY + 25, { align: 'center', width: contentWidth });

    doc.fillColor(lightColor)
       .fontSize(8)
       .font('Helvetica')
       .text('This is a computer-generated invoice. No signature required.', margin, footerY + 40, { align: 'center', width: contentWidth });

    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  }
}
