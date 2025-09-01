import React from 'react';
import EnumDropdown from '../../../common/components/ui/EnumDropdown';

/**
 * FilterRenderer - Dinamik filtre bileşeni oluşturucu
 * FilterConfig yapılandırmasına göre filtre alanlarını render eder
 */
const FilterRenderer = ({ config, filters, onChange, title = "Filters" }) => {
  if (!config || !config.getFields) {
    return null;
  }

  const fields = config.getFields();

  /**
   * Sayısal değer değişikliğini handle eder
   * @param {string} field - Alan adı
   * @param {string} value - Değer
   * @param {string} type - Dönüşüm türü ('int', 'float')
   */
  const handleNumericChange = (field, value, type = 'int') => {
    const numericValue = value === '' ? null :
      type === 'float' ? parseFloat(value) : parseInt(value);
    onChange(field, numericValue);
  };

  /**
   * Alan bileşenini render eder
   * @param {Object} field - Alan yapılandırması
   * @returns {JSX.Element} Render edilmiş alan
   */
  const renderField = (field) => {
    switch (field.type) {
      case 'enum':
        return (
          <div key={field.key}>
            <EnumDropdown
              label={field.label}
              enumKey={field.enumKey}
              value={filters[field.key] || []}
              onChange={(value) => onChange(field.key, value)}
              multiple={field.multiple}
              required={field.required}
            />
          </div>
        );

      case 'numericRange':
        const minKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const maxKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;

        return (
          <div key={field.key} className={`grid grid-cols-1 ${field.gridSize} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min {field.label}
              </label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={filters[minKey] || ''}
                onChange={(e) => handleNumericChange(minKey, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder={field.placeholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max {field.label}
              </label>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={filters[maxKey] || ''}
                onChange={(e) => handleNumericChange(maxKey, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder={field.placeholder}
              />
            </div>
          </div>
        );

      case 'dateRange':
        const minDateKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const maxDateKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;

        return (
          <div key={field.key} className={`grid grid-cols-1 ${field.gridSize} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min {field.label}
              </label>
              <input
                type="date"
                value={filters[minDateKey] || ''}
                onChange={(e) => onChange(minDateKey, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max {field.label}
              </label>
              <input
                type="date"
                value={filters[maxDateKey] || ''}
                onChange={(e) => onChange(maxDateKey, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {field.label}
            </label>
            <input
              type="date"
              value={filters[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        );

      case 'text':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {field.label}
            </label>
            <input
              type="text"
              value={filters[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Alanları gruplara böler ve render eder
   * @param {Array} fields - Alanlar dizisi
   * @returns {Array} Gruplandırılmış JSX elementleri
   */
  const renderFieldGroups = (fields) => {
    const groups = [];
    let currentGroup = [];

    fields.forEach((field, index) => {
      currentGroup.push(field);

      // Her 2 alanda bir grup oluştur (daha iyi düzen için)
      if (currentGroup.length === 2 || index === fields.length - 1) {
        groups.push(
          <div key={`group-${groups.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {currentGroup.map(renderField)}
          </div>
        );
        currentGroup = [];
      }
    });

    return groups;
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <h4 className="text-md font-medium text-slate-800 mb-4">{title}</h4>
      {renderFieldGroups(fields)}
    </div>
  );
};

export default FilterRenderer;
