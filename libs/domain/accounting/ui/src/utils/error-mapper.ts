/**
 * Centralized error mapper for the Accounting domain UI.
 * Standardizes error messages for a consistent UX.
 */
export function mapAccountingError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.error?.message) {
    return error.error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred in the accounting module. Please try again or contact support.';
}
