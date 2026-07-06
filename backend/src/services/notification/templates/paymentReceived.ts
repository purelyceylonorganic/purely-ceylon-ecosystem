export const paymentReceivedTemplate = (buyerName: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

  <div style="max-width:700px;margin:30px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
    
    <div style="background:#0A5C36;padding:25px;text-align:center;color:white;font-size:28px;font-weight:bold;">
      Purely Ceylon Organic (Pvt) Ltd
    </div>

    <div style="padding:40px;">
      <h2>Hello ${buyerName},</h2>
      <p>We have successfully received your payment.</p>
      <p>Your Bulk Order is now being processed.</p>
      <p>Thank you for your business.</p>
    </div>

    <div style="background:#eeeeee;padding:20px;text-align:center;font-size:13px;color:#555;">
      © 2026 Purely Ceylon Organic (Pvt) Ltd
      <br><br>
      This is an automated email.
    </div>

  </div>

</body>
</html>
  `;
};