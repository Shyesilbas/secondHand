import { Package } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getListingsMenuItems } from './headerMenuConfig.js';

const HeaderListingsMenu = ({ isOpen, onToggle, onClose, orderCount }) => (
    <>
        <button
            onClick={onToggle}
            className="group relative p-2.5 text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50"
        >
            <Package className="w-[20px] h-[20px] stroke-[1.5px]" />
            {orderCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 bg-red-500 rounded-full border border-white shadow-sm shadow-red-500/30"></span>
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
                        label={item.label}
                        rightContent={
                            item.key === 'orders' && orderCount > 0
                                ? <span className="ml-auto text-[10px] font-semibold bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm shadow-red-500/30">!</span>
                                : null
                        }
                    />
                ))}
            </HeaderDropdownPanel>
        )}
    </>
);

export default HeaderListingsMenu;
