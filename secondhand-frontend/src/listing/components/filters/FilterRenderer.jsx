import React from 'react';
import EnumDropdown from '../../../common/components/ui/EnumDropdown';
import { ChevronDown, Calendar, Hash, Type } from 'lucide-react';

const FilterRenderer = ({ config, filters, onChange, title = "Specific Filters" }) => {
  if (!config || !config.getFields) return null;

  const fields = config.getFields();

  const handleNumericChange = (field, value, type = 'int') => {
    const numericValue = value === '' ? null :
      type === 'float' ? parseFloat(value) : parseInt(value);
    onChange(field, numericValue);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'enum':
        return (
          <div key={field.key} className="space-y-1">
            <EnumDropdown
              label={field.label}
              enumKey={field.enumKey}
              value={filters[field.key] || []}
              onChange={(value) => onChange(field.key, value)}
              multiple={field.multiple}
              required={field.required}
              className="w-full"
            />
          </div>
        );

      case 'numericRange':
        const minKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const maxKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;

        return (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">{field.label}</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={filters[minKey] || ''}
                  onChange={(e) => handleNumericChange(minKey, e.target.value)}
                  className="w-full pl-3 pr-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  placeholder={field.placeholder || "Min"}
                />
              </div>
              <span className="text-gray-400 font-medium">-</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={filters[maxKey] || ''}
                  onChange={(e) => handleNumericChange(maxKey, e.target.value)}
                  className="w-full pl-3 pr-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  placeholder={field.placeholder || "Max"}
                />
              </div>
            </div>
          </div>
        );

      case 'dateRange':
        const minDateKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const maxDateKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;

        return (
          <div key={field.key} className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">{field.label}</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={filters[minDateKey] || ''}
                  onChange={(e) => onChange(minDateKey, e.target.value)}
                  className="w-full pl-8 pr-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={filters[maxDateKey] || ''}
                  onChange={(e) => onChange(maxDateKey, e.target.value)}
                  className="w-full pl-8 pr-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">{field.label}</label>
            <div className="relative">
              <input
                type="text"
                value={filters[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
              <Type className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFieldGroups = (fields) => {
    const groups = [];
    let currentGroup = [];

    fields.forEach((field, index) => {
      currentGroup.push(field);

      if (currentGroup.length === 2 || index === fields.length - 1) {
        groups.push(
          <div key={`group-${groups.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentGroup.map(renderField)}
          </div>
        );
        currentGroup = [];
      }
    });

    return (
      <div className="space-y-6">
        {groups}
      </div>
    );
  };

  return (
    <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-white rounded-md shadow-sm text-indigo-600">
          <Hash className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h4>
      </div>
      {renderFieldGroups(fields)}
    </div>
  );
};

export default FilterRenderer;
