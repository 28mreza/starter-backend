export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate required fields
   */
  static validateRequired(data: any, fields: string[]): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    fields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors[field] = `${field} is required`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Sanitize string
   */
  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate pagination params
   */
  static validatePagination(page?: string, limit?: string): { page: number; limit: number } {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');

    return {
      page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
      limit: isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100) // max 100
    };
  }
}
