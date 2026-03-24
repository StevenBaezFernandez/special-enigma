import { strongPasswordValidator } from './password.validator';
import { FormControl } from '@angular/forms';

describe('strongPasswordValidator', () => {
  it('should return null for valid passwords', () => {
    const control = new FormControl('Pass123!@');
    const validator = strongPasswordValidator();
    expect(validator(control)).toBeNull();
  });

  it('should return errors for short passwords', () => {
    const control = new FormControl('Pas1!');
    const validator = strongPasswordValidator();
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['strongPassword']?.minLength).toBeDefined();
  });

  it('should return errors for passwords missing uppercase', () => {
    const control = new FormControl('pass123!@');
    const validator = strongPasswordValidator();
    const result = validator(control);
    expect(result).not.toBeNull();
    expect(result?.['strongPassword']?.missingUppercase).toBe(true);
  });
});
