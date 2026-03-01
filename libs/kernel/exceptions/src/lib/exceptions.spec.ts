import { DomainException, EntityNotFoundException } from './exceptions';

describe('DomainExceptions', () => {
  it('should create a DomainException with correct name', () => {
    const error = new class extends DomainException {}('test message');
    expect(error.message).toBe('test message');
    expect(error.name).toBe('DomainException');
  });

  it('should create an EntityNotFoundException with correct message', () => {
    const error = new EntityNotFoundException('User', '123');
    expect(error.message).toBe('User with id 123 not found');
    expect(error.name).toBe('EntityNotFoundException');
  });
});
