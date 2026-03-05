import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface RequestedItem {
  id: string;
  name: string;
  quantity: number;
}

const createInvoiceHtml = (site: string, engineerName: string, items: RequestedItem[]) => {
  const itemsHtml = items
    .map((item) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px;">${item.name}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px solid #7B2CBF; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #7B2CBF; }
        .details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f2f2f2; text-align: left; padding: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CIMARA</h1>
          <p>Quality brings reliability</p>
          <h2>Material Request Invoice</h2>
        </div>
        <div class="details">
          <p><strong>Site:</strong> ${site}</p>
          <p><strong>Requesting Engineer:</strong> ${engineerName}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th style="text-align: center;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const { items, site, engineerName } = await request.json();

    // DEBUG LOG: Check your VS Code Terminal to see if 'site' is coming through correctly
    console.log('Incoming Material Request:', { site, engineerName, itemCount: items?.length });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ error: 'Server environment variables missing.' }, { status: 500 });
    }

    // Ensure site has a value, otherwise the email will look broken
    const finalSiteName = site && site !== "" ? site : "Unspecified Site";

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CIMARA Inventory" <${process.env.EMAIL_USER}>`,
      to: 'egrtaa@gmail.com',
      subject: `New Material Request from ${finalSiteName}`,
      html: createInvoiceHtml(finalSiteName, engineerName, items),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Request sent successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('[EMAIL_SEND_ERROR]', error);
    return NextResponse.json({ error: `Failed: ${error.message}` }, { status: 500 });
  }
}