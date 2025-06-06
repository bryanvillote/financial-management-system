const { emailService, upload } = require('../services/emailService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Send receipt with optional image attachment
exports.sendReceipt = async (req, res) => {
  try {
    const { 
      email, 
      receiptHtml, 
      subject,
      homeownerName,
      blockNo,
      lotNo,
      dueAmount,
      paymentDate,
      referenceNumber
    } = req.body;

    const uploadedImageFile = req.file; // Get the uploaded file details from Multer
    let pdfBuffer = null;
    let pdfFileName = null;
    let imageFilePath = null;

    console.log('Received request to send receipt.');
    console.log('Uploaded file:', uploadedImageFile);

    if (uploadedImageFile) {
      imageFilePath = uploadedImageFile.path; // Path where Multer saved the image
      pdfFileName = `Payment_Screenshot_${Date.now()}.pdf`;
      const pdfFilePath = path.join(__dirname, '../uploads', pdfFileName); // Temporary path for the PDF

      console.log('Uploaded image path:', imageFilePath);
      console.log('Generating PDF to:', pdfFilePath);

      // Generate PDF from the image
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(pdfFilePath);
      doc.pipe(stream);

      // Add image to PDF
      try {
        // Using image-size to get dimensions without loading the whole image into memory
        const sizeOf = require('image-size');
        const dimensions = sizeOf(imageFilePath);
        console.log('Image dimensions:', dimensions);

        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

        doc.image(imageFilePath, { 
          fit: [pageWidth, pageHeight],
          align: 'center',
          valign: 'center'
        });
        console.log('Image added to PDF.');

      } catch (imgErr) {
        console.error('Error adding image to PDF:', imgErr);
        // Continue without the image in the PDF if adding fails
      }

      doc.end();

      // Wait for PDF to finish writing
      await new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log('PDF file writing finished.');
          resolve();
        });
        stream.on('error', (err) => {
          console.error('Error writing PDF file:', err);
          reject(err);
        });
      });

      // Read the generated PDF into a buffer
      pdfBuffer = fs.readFileSync(pdfFilePath);
      console.log('PDF buffer created. Buffer size:', pdfBuffer.length);

      // Clean up the temporary PDF file
      fs.unlink(pdfFilePath, (err) => {
        if (err) console.error('Error deleting temporary PDF file:', err);
        else console.log('Temporary PDF file deleted:', pdfFilePath);
      });
    } else {
      console.log('No image file uploaded.');
    }

    if (!email || !receiptHtml) {
      // If no file uploaded or missing required fields, return error
       if (imageFilePath) {
        // Clean up the uploaded image file if it exists
        fs.unlink(imageFilePath, (err) => {
          if (err) console.error('Error deleting uploaded image file:', err);
          else console.log('Uploaded image file deleted:', imageFilePath);
        });
      }
      console.log('Missing required fields or no image uploaded for PDF conversion.');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields or no image uploaded for PDF conversion'
      });
    }

    console.log('Sending email with PDF attachment...');
    await emailService.sendReceipt({
      email,
      receiptHtml,
      subject,
      homeownerName,
      blockNo,
      lotNo,
      dueAmount,
      paymentDate,
      referenceNumber,
      pdfAttachment: pdfBuffer, // Pass the PDF buffer
      pdfFileName: pdfFileName // Pass the PDF filename
    });

    console.log('Email sent successfully.');
    res.status(200).json({
      success: true,
      message: 'Receipt sent successfully'
    });
  } catch (error) {
    console.error('Error in sendReceipt controller:', error);
    // Clean up uploaded image file in case of error during PDF generation or email sending
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded image file after error:', err);
        else console.log('Uploaded image file deleted after error:', req.file.path);
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt',
      error: error.message
    });
  }
};

// Send payment reminder
exports.sendPaymentReminder = async (req, res) => {
  try {
    const { email, name, dueAmount, blockNo, lotNo } = req.body;

    if (!email || !name || !dueAmount || !blockNo || !lotNo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    await emailService.sendPaymentReminder(email, name, dueAmount, blockNo, lotNo);

    res.status(200).json({
      success: true,
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment reminder',
      error: error.message
    });
  }
}; 