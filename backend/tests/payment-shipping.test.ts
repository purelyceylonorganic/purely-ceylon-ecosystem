import { describe, it, expect } from '@jest/globals';
import { ShippingService } from '../src/services/shipping.service';
import { PaymentService } from '../src/services/payment.service';

describe('🧪 PURELY CEYLON ORGANIC - ECOSYSTEM QA SUITE', () => {

  // 🇱🇰 1. ஷிப்பிங் கட்டணக் கணக்கீடு சோதனை (Shipping Logic Test)
  describe('📦 Shipping & Logistics Engine Tests', () => {
    
    it('✓ மேல் மாகாணத்திற்கான (Western) அடிப்படை ஷிப்பிங் கட்டணம் 350 LKR ஆக இருக்க வேண்டும்', () => {
      const rate = ShippingService.calculateLocalShipping('WESTERN', 1);
      expect(rate).toBe(350);
    });

    it('✓ வெளி மாகாணங்களுக்கான (Outstation) அடிப்படை ஷிப்பிங் கட்டணம் 500 LKR ஆக இருக்க வேண்டும்', () => {
      const rate = ShippingService.calculateLocalShipping('CENTRAL', 1);
      expect(rate).toBe(500);
    });

    it('✓ 1KG க்கு மேல் செல்லும் எடைகளுக்கு கிலோவிற்கு 120 LKR கூடுதலாகக் கணக்கிடப்பட வேண்டும்', () => {
      // 3KG மேல் மாகாணம்: 350 + (2 * 120) = 590
      const rate = ShippingService.calculateLocalShipping('WESTERN', 3);
      expect(rate).toBe(590);
    });
  });

  // 💳 2. பேமெண்ட் பாதுகாப்பு சிக்னேச்சர் சோதனை (Payment Security Test)
  describe('🛡️ Cryptographic Payment Security Tests', () => {
    
    it('✓ PayHere கேட்வேக்கான MD5 சிக்னேச்சர் வெற்றிகரமாக உருவாக வேண்டும்', () => {
      const orderId = 'ORD-2026-TEST';
      const amount = 1500.00;
      
      const hash = PaymentService.generatePayHereHash(orderId, amount);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(32); // MD5 Hash எப்போதும் 32 எழுத்துக்களைக் கொண்டிருக்கும்
    });
  });

});