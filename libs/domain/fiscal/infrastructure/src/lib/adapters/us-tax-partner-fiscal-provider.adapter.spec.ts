import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UsTaxPartnerFiscalAdapter } from './us-tax-partner-fiscal-provider.adapter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';

describe('UsTaxPartnerFiscalAdapter (Hardened)', () => {
  let adapter: UsTaxPartnerFiscalAdapter;
  let httpService: any;
  let configService: any;

  beforeEach(() => {
    httpService = {
      post: vi.fn(),
    };
    configService = {
      get: vi.fn().mockImplementation((key: string, def?: any) => {
        if (key === 'US_TAX_PARTNER_URL') return 'https://tax-partner.example.com';
        if (key === 'US_TAX_PARTNER_API_KEY') return 'valid-api-key';
        if (key === 'NODE_ENV') return 'development';
        return def;
      }),
    };
    adapter = new UsTaxPartnerFiscalAdapter(httpService as any, configService as any);
  });

  describe('Production Hardening', () => {
    it('should throw if URL is missing in production', () => {
      process.env['RELEASE_STAGE'] = 'production';
      configService.get.mockImplementation((key: string) => {
        if (key === 'US_TAX_PARTNER_URL') return '';
        if (key === 'US_TAX_PARTNER_API_KEY') return 'valid-api-key';
        return 'production';
      });

      expect(() => new UsTaxPartnerFiscalAdapter(httpService, configService)).toThrow(/Configure US_TAX_PARTNER_URL/);
      delete process.env['RELEASE_STAGE'];
    });

    it('should throw if API key is a mock placeholder in production', () => {
        process.env['RELEASE_STAGE'] = 'production';
        configService.get.mockImplementation((key: string) => {
          if (key === 'US_TAX_PARTNER_URL') return 'https://real-api.com';
          if (key === 'US_TAX_PARTNER_API_KEY') return 'test_api_key';
          return 'production';
        });

        expect(() => new UsTaxPartnerFiscalAdapter(httpService, configService)).toThrow(/REAL credentials/);
        delete process.env['RELEASE_STAGE'];
      });
  });

  describe('Validation', () => {
    it('should fail validation if ZIP code is missing (US specific rule)', async () => {
      const invoice = { id: 'inv-1', shippingAddress: { country: 'US' } };
      const isValid = await adapter.validateInvoice(invoice);
      expect(isValid).toBe(false);
    });

    it('should succeed if partner returns valid', async () => {
        const invoice = { id: 'inv-1', shippingAddress: { country: 'US', zipCode: '90210' } };
        httpService.post.mockReturnValue(of({ data: { valid: true } }));

        const isValid = await adapter.validateInvoice(invoice);
        expect(isValid).toBe(true);
        expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining('/v1/tax/validate'), invoice, expect.any(Object));
    });
  });

  describe('Signing / Calculation', () => {
      it('should return a JSON stringified fiscal summary on success', async () => {
          const invoice = { id: 'inv-1', tenantId: 't1' };
          httpService.post.mockReturnValue(of({ data: { transactionId: 'TX-123', totalTax: '15.50', summary: 'Tax summary' } }));

          const signature = await adapter.signInvoice(invoice);
          const parsed = JSON.parse(signature);

          expect(parsed.transactionId).toBe('TX-123');
          expect(parsed.totalTax).toBe('15.50');
      });

      it('should throw InternalServerErrorException if partner returns no transactionId', async () => {
        httpService.post.mockReturnValue(of({ data: {} }));
        await expect(adapter.signInvoice({})).rejects.toThrow(InternalServerErrorException);
      });
  });

  describe('Error Handling', () => {
    it('should throw ServiceUnavailableException on timeout', async () => {
        const error = new Error('Timeout');
        error.name = 'TimeoutError';
        httpService.post.mockReturnValue(throwError(() => error));

        // Use a shorter local timeout for the test to avoid Vitest global timeout
        await expect(adapter.signInvoice({})).rejects.toThrow(ServiceUnavailableException);
    }, 15000);

    it('should throw ServiceUnavailableException on 401', async () => {
        const error = { response: { status: 401 }, message: 'Unauthorized' };
        httpService.post.mockReturnValue(throwError(() => error));

        await expect(adapter.transmitInvoice({})).rejects.toThrow(ServiceUnavailableException);
    }, 15000);
  });
});
