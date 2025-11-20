import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { request } = req.body;
    
    if (!request) {
      return res.status(400).json({ error: 'Missing request data' });
    }

    const resendApiKey = process.env.VITE_RESEND_API_KEY;
    const managerEmail = process.env.VITE_MANAGER_EMAIL || 'kerryngong@ekamiauto.com';

    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const serviceName = request.service_name || 'Service Request';
    
    const emailBody = `
      <h2>🔧 New Service Request</h2>
      <p><strong>Request ID:</strong> ${request.id}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Customer:</strong> ${request.customer_name}</p>
      <p><strong>Email:</strong> ${request.customer_email}</p>
      <p><strong>Phone:</strong> ${request.customer_phone}</p>
      <hr />
      <p><strong>Vehicle:</strong> ${request.vehicle_year || ''} ${request.vehicle_make} ${request.vehicle_model}</p>
      <p><strong>Mileage:</strong> ${request.mileage || 'Not provided'} km</p>
      <p><strong>License Plate:</strong> ${request.license_plate || 'Not provided'}</p>
      <hr />
      <p><strong>Problem:</strong> ${request.problem_description}</p>
      <p><strong>Urgency:</strong> ${request.urgency_level?.toUpperCase()}</p>
      <hr />
      <p><strong>Appointment:</strong> ${request.appointment_date} at ${request.appointment_time}</p>
      <p><strong>Service Location:</strong> ${request.service_location === 'drop-off' ? 'Drop-off' : 'Mobile Service'}</p>
      ${request.notes ? `<p><strong>Additional Notes:</strong> ${request.notes}</p>` : ''}
      <hr />
      <p><em>Please review and assign a mechanic in the admin dashboard.</em></p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Ekami Auto <onboarding@resend.dev>',
        to: managerEmail,
        subject: `🔧 New Service Request - ${serviceName}`,
        html: emailBody,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Email API error: ${responseData.message || response.statusText}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: responseData.id 
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Failed to send email', 
      message: error.message 
    });
  }
}
