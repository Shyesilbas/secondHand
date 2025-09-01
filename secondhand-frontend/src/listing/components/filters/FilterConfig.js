
export class FilterConfig {
  constructor() {
    this.fields = [];
  }

  addEnumField(key, label, enumKey, options = {}) {
    this.fields.push({
      type: 'enum',
      key,
      label,
      enumKey,
      multiple: options.multiple !== false,
      required: options.required || false,
      gridSize: options.gridSize || 'md:grid-cols-2',
      ...options
    });
    return this;
  }

  addNumericRangeField(key, label, options = {}) {
    this.fields.push({
      type: 'numericRange',
      key,
      label,
      min: options.min || 0,
      max: options.max || null,
      step: options.step || 1,
      placeholder: options.placeholder || '',
      required: options.required || false,
      gridSize: options.gridSize || 'md:grid-cols-2',
      ...options
    });
    return this;
  }

  addDateRangeField(key, label, options = {}) {
    this.fields.push({
      type: 'dateRange',
      key,
      label,
      required: options.required || false,
      gridSize: options.gridSize || 'md:grid-cols-2',
      ...options
    });
    return this;
  }

  getFields() {
    return this.fields;
  }
}
