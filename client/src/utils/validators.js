// Form validation utilities
export const validators = {
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  minLength: (min) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  match: (matchValue, matchFieldName) => (value, fieldName) => {
    if (!value) return null;
    if (value !== matchValue) {
      return `${fieldName} must match ${matchFieldName}`;
    }
    return null;
  }
};

// Validate entire form
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const commonRules = {
  ticket: {
    title: [
      validators.required,
      validators.minLength(5),
      validators.maxLength(200)
    ],
    description: [
      validators.required,
      validators.minLength(10),
      validators.maxLength(2000)
    ]
  },
  
  user: {
    name: [
      validators.required,
      validators.minLength(2),
      validators.maxLength(100)
    ],
    email: [
      validators.required,
      validators.email
    ],
    password: [
      validators.required,
      validators.password
    ]
  },
  
  comment: {
    content: [
      validators.required,
      validators.minLength(1),
      validators.maxLength(1000)
    ]
  }
};
