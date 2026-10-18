import { Package } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getListingsMenuItems } from './headerMenuConfig.js';

const HeaderListingsMenu = ({ isOpen, onToggle, onClose, orderCount }) => (
 <>
 <button
 onClick={onToggle}
 className="group relative p-2.5 text-text-secondary hover:text-text-primary transition-all duration-300 ease-in-out rounded hover:bg-background-tertiary/50"
 >
 <Package className="w-5 h-5 stroke-1.5" />
 {orderCount > 0 && (
 <span className="absolute top-1 right-1 flex h-2.5 w-2.5 bg-status-error rounded-full border border-white shadow-sm"></span>
 )}
 </button>

 {isOpen && (
 <HeaderDropdownPanel>
 {getListingsMenuItems().map((item) => (
 <HeaderMenuItem
 key={item.key}
 to={item.to}
 onClick={onClose}
 icon={item.icon}
 labelKey={item.labelKey}
 label={item.label}
 rightContent={
 item.key === 'orders' && orderCount > 0
 ? <span className="ml-auto text-xs font-semibold bg-status-error text-white w-5 h-5 flex items-center justify-center rounded">!</span>
 : null
 }
 />
 ))}
 </HeaderDropdownPanel>
 )}
 </>
);

export default HeaderListingsMenu;
