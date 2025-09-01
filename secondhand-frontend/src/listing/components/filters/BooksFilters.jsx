import React from 'react';
import EnumDropdown from '../../../components/ui/EnumDropdown';

const BooksFilters = ({ filters, onChange }) => {
  const handleNum = (field, value) => onChange(field, value === '' ? null : parseInt(value));
  const currentYear = new Date().getFullYear();
  return (
    <div className="border-t border-slate-200 pt-6">
      <h4 className="text-md font-medium text-slate-800 mb-4">Books Filters</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <EnumDropdown label="Genre" enumKey="bookGenres" value={filters.genres || []} onChange={(v) => onChange('genres', v)} multiple={true} />
        </div>
        <div>
          <EnumDropdown label="Language" enumKey="bookLanguages" value={filters.languages || []} onChange={(v) => onChange('languages', v)} multiple={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <EnumDropdown label="Format" enumKey="bookFormats" value={filters.formats || []} onChange={(v) => onChange('formats', v)} multiple={true} />
        </div>
        <div>
          <EnumDropdown label="Condition" enumKey="bookConditions" value={filters.conditions || []} onChange={(v) => onChange('conditions', v)} multiple={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Year</label>
          <input type="number" min="1450" max={currentYear} value={filters.minYear || ''} onChange={(e) => handleNum('minYear', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="2000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Year</label>
          <input type="number" min="1450" max={currentYear} value={filters.maxYear || ''} onChange={(e) => handleNum('maxYear', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder={currentYear.toString()} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Page Count</label>
          <input type="number" min="0" value={filters.minPageCount || ''} onChange={(e) => handleNum('minPageCount', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Page Count</label>
          <input type="number" min="0" value={filters.maxPageCount || ''} onChange={(e) => handleNum('maxPageCount', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" placeholder="1000" />
        </div>
      </div>
    </div>
  );
};

export default BooksFilters;


