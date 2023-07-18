const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const db = require("../app/models")
const PDFDocument = require('pdfkit');
const Customer = db.customer
const Order = db.order
const User = db.user
const pdf = require('html-pdf');

exports.checkDeliveredInTime = (pickedup_at, current_time, minimum_time) => {
    const pickedupTime = new Date(pickedup_at);
    const timeDifference = current_time - pickedupTime;
    const minutesDifference = Math.floor(timeDifference / 1000 / 60); // Convert milliseconds to minutes
  
    return minutesDifference <= minimum_time;
  }

exports.sendMail = (invoiceHtml,to,subject) => {    
      // Create a transporter object
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'email',
          pass: 'password'
        }
      });
    
      // Define the email options
      const mailOptions = {
        from: 'email',
        to,
        subject,
        html: invoiceHtml
      };
    
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent successfully:', info.response);
        }
      });
    
    }

exports.sendOrderConfirmationEmail = async(data) => {
    const customer = await this.getCustomerDetails(data.pickup_customer_id)

    // Read the invoice template HTML file
    const templatePath = path.join(__dirname, './templates/order-confirmation.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    // Compile the HTML template
    const template = handlebars.compile(templateHtml);
    
    // Generate the invoice HTML using the template and data
    const invoiceData = {
      orderId: data.id,
      customerName: customer.first_name + " "+customer.last_name,
      // Add more invoice data as needed
    };
    const invoiceHtml = template(invoiceData);
    this.sendMail(invoiceHtml,customer.email,"Order Confirmation")
}

exports.sendOrderPickedupEmail = async(data) => {
    const customer = await this.getCustomerDetails(data.pickup_customer_id)

    // Read the invoice template HTML file
    const templatePath = path.join(__dirname, './templates/order-picked.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    // Compile the HTML template
    const template = handlebars.compile(templateHtml);
    
    // Generate the invoice HTML using the template and data
    const invoiceData = {
      orderId: data.id,
      customerName: customer.first_name + " "+customer.last_name,
      // Add more invoice data as needed
    };
    const invoiceHtml = template(invoiceData);
    this.sendMail(invoiceHtml,customer.email,"Order is PickedUp")
}
exports.sendOrderDeliveredEmail = async(data) => {
    const customer = await this.getCustomerDetails(data.pickup_customer_id)

     // Read the invoice template HTML file
     const templatePath = path.join(__dirname, './templates/order-delivered.html');
     const templateHtml = fs.readFileSync(templatePath, 'utf-8');
     // Compile the HTML template
     const template = handlebars.compile(templateHtml);
     
     // Generate the invoice HTML using the template and data
     const invoiceData = {
       orderId: data.id,
       customerName: customer.first_name + " "+customer.last_name,
       // Add more invoice data as needed
     };
     const invoiceHtml = template(invoiceData);
     this.sendMail(invoiceHtml,customer.email,"Order is Delivered")
    this.sendInvoiceEmail(customer.email,data.id)
}

exports.getCustomerDetails = async(id) => {
    try{
        if(!id)
        return ""
        const customer = await Customer.findByPk(id);
        return customer
    }
    catch(e) {
        return ""
    }
}

exports.sendInvoiceEmail = async(customerEmail, orderId) => {    
  try {
    const order = await Order.findByPk(orderId,{ include: [  { model: Customer, as: 'pickup_customer' },{ model: Customer, as: 'delivery_customer' },{ model: User, as: 'delivery_boy_details' },{ model: User, as: 'clerk_details' }] })

    // Generate the HTML content dynamically
    const htmlContent = `
      <html>
        <head>
          <style>
          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          table {
              width: 80%;
          }
          td {
              width: 80%;
              padding: 10px;
          }
          th {
              padding-left: 10px;
          }
          .flex {
              display: flex;
              justify-content: space-around;
          }
          </style>
        </head>
        <body>
          <h1>Invoice for Order ID: ${orderId}</h1>
          <div class="flex">
          <table>
                <tr>
                <th>Price to Deliver</th>
                <td>$ ${ order.price_for_order}</td>
                </tr>
                <tr>
                <th>Distance</th>
                <td> ${ order.distance } Miles</td>
                </tr>
                <tr>
                <th>Expected Time for Delivery </th>
                <td> ${ order.minimum_time } Minutes</td>
                </tr>
                <tr>
                <th>Order Created At</th>
                <td> ${ order.createdAt } </td>
                </tr>
                <tr>
                <th>Picked up At</th>
                <td> ${ order.pickedup_at } </td>
                </tr>
                <tr>
                 <th>Delivered in time</th>
                <td> ${ order.delivered_in_time } </td>
                </tr>
                 <tr>
                 <th>Pickup Details</th>
                <td> 
                    <p> Name - ${ order.pickup_customer.first_name} ${ order.pickup_customer.last_name} <br/>
                     Email - ${ order.pickup_customer.email} <br/>
                     Mobile - ${ order.pickup_customer.mobile} <br/>
                     Address - ${ order.pickup_customer.address} <br/>
                     Apt Number - ${ order.pickup_customer.apartment_number} </p>
                </td>
                </tr>
                <tr>
                <th>Delivery Details</th>
                <td> 
                    <p> Name - ${ order.delivery_customer.first_name} ${ order.delivery_customer.last_name} <br/>
                     Email - ${ order.delivery_customer.email} <br/>
                     Mobile - ${ order.delivery_customer.mobile} <br/>
                     Address - ${ order.delivery_customer.address} <br/>
                     Apt Number - ${ order.delivery_customer.apartment_number} </p>
                </td>
                </tr>
            </table>
            </div>
        </body>
      </html>
    `;

    // Create a PDF from the HTML content
    const pdfOptions = { format: 'Letter' };
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdf.create(htmlContent, pdfOptions).toBuffer((error, buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(buffer);
        }
      });
    });

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'email',
          pass: 'password'
        }
      });

    // Define the email content
    const mailOptions = {
      from: 'email',
      to: customerEmail,
      subject: 'Invoice for Your Order',
      text: `Please find attached the invoice for your order with ID: ${orderId}`,
      attachments: [
        {
          filename: `invoice_${orderId}.pdf`,
          content: pdfBuffer
        }
      ]
    };

    // Send the email with the invoice PDF attachment
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.log('Error sending email:', error);
  }
}