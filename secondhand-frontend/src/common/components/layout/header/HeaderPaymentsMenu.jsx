import { Receipt } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getPaymentsMenuItems } from './headerMenuConfig.js';

const HeaderPaymentsMenu = ({ isOpen, onToggle, onClose }) => (
    <>
        <button
            onClick={onToggle}
            title="Payments"
            type="button"
            className="group relative p-2.5 text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50"
        >
            <Receipt className="w-[20px] h-[20px] stroke-[1.5px]" />
        </button>

        {isOpen && (
            <HeaderDropdownPanel>
                {getPaymentsMenuItems().map((item) => (
                    <HeaderMenuItem
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        icon={item.icon}
                        label={item.label}
                    />
                ))}
            </HeaderDropdownPanel>
        )}
    </>
);

export default HeaderPaymentsMenu;
