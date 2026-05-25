import express from 'express';
import { sendVerificationEmail } from '../utils/sendEmail';

const router = express.Router();

router.get('/test-email', async (req, res) => {
  try {
    await sendVerificationEmail(
      'musab.nawfer@gmail.com',
      'sample-token-123'
    );

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
  console.error('EMAIL ERROR:', error.message);
} else {
  console.error('UNKNOWN ERROR:', error);
}

    res.status(500).json({
      success: false,
      message: 'Email sending failed',
    });
  }
});

export default router;