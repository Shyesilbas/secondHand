import React from 'react';
import EnumDropdown from '../../../../components/ui/EnumDropdown';

const SportsFilters = ({ filters, onChange }) => (
  <div className="border-t border-slate-200 pt-6">
    <h4 className="text-md font-medium text-slate-800 mb-4">Sports Filters</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <EnumDropdown label="Discipline" enumKey="sportDisciplines" value={filters.disciplines || []} onChange={(v) => onChange('disciplines', v)} multiple={true} />
      </div>
      <div>
        <EnumDropdown label="Equipment Type" enumKey="sportEquipmentTypes" value={filters.equipmentTypes || []} onChange={(v) => onChange('equipmentTypes', v)} multiple={true} />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <EnumDropdown label="Condition" enumKey="sportConditions" value={filters.conditions || []} onChange={(v) => onChange('conditions', v)} multiple={true} />
      </div>
    </div>
  </div>
);

export default SportsFilters;


