import { describe, it, expect } from 'vitest';
import {
  factCheckClaimSchema,
  factCheckPlanSchema,
  formatClaimsForPrompt,
} from '../../fact-check/schema.js';
import type { FactCheckClaim } from '../../fact-check/schema.js';

describe('fact-check schema', () => {
  describe('factCheckClaimSchema', () => {
    it('should validate valid claim', () => {
      const claim = { id: 'C1', text: 'Node.js 20 is supported' };
      expect(() => factCheckClaimSchema.parse(claim)).not.toThrow();
    });

    it('should reject claim without id', () => {
      const claim = { text: 'Some text' };
      expect(() => factCheckClaimSchema.parse(claim)).toThrow();
    });

    it('should reject claim without text', () => {
      const claim = { id: 'C1' };
      expect(() => factCheckClaimSchema.parse(claim)).toThrow();
    });
  });

  describe('factCheckPlanSchema', () => {
    it('should validate valid plan with claims', () => {
      const plan = {
        claims: [
          { id: 'C1', text: 'First claim' },
          { id: 'C2', text: 'Second claim' },
        ],
      };
      expect(() => factCheckPlanSchema.parse(plan)).not.toThrow();
    });

    it('should validate empty claims array', () => {
      const plan = { claims: [] };
      expect(() => factCheckPlanSchema.parse(plan)).not.toThrow();
    });

    it('should reject plan without claims field', () => {
      const plan = {};
      expect(() => factCheckPlanSchema.parse(plan)).toThrow();
    });
  });

  describe('formatClaimsForPrompt', () => {
    it('should format single claim correctly', () => {
      const claims: FactCheckClaim[] = [{ id: 'C1', text: 'Node.js 20 is supported' }];
      const result = formatClaimsForPrompt(claims);
      expect(result).toBe('- C1: Node.js 20 is supported');
    });

    it('should format multiple claims with line breaks', () => {
      const claims: FactCheckClaim[] = [
        { id: 'C1', text: 'First claim' },
        { id: 'C2', text: 'Second claim' },
      ];
      const result = formatClaimsForPrompt(claims);
      expect(result).toBe('- C1: First claim\n- C2: Second claim');
    });

    it('should return empty string for empty array', () => {
      const claims: FactCheckClaim[] = [];
      const result = formatClaimsForPrompt(claims);
      expect(result).toBe('');
    });

    it('should handle claims with special characters', () => {
      const claims: FactCheckClaim[] = [
        { id: 'C1', text: 'API returns { "status": "ok" }' },
        { id: 'C2', text: 'Using "quotes" and \'apostrophes\'' },
      ];
      const result = formatClaimsForPrompt(claims);
      expect(result).toContain('- C1: API returns { "status": "ok" }');
      expect(result).toContain('- C2: Using "quotes" and \'apostrophes\'');
    });

    it('should handle claims with multiline text', () => {
      const claims: FactCheckClaim[] = [{ id: 'C1', text: 'Line one\nLine two' }];
      const result = formatClaimsForPrompt(claims);
      expect(result).toBe('- C1: Line one\nLine two');
    });
  });
});
