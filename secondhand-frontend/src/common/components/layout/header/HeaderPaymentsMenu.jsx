import { useTranslation } from "react-i18next";
import { Receipt } from 'lucide-react';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getPaymentsMenuItems } from './headerMenuConfig.js';
const HeaderPaymentsMenu = ({
 isOpen,
 onToggle,
 onClose
}) => {
 const {
 t
 } = useTranslation();

 return <>
 <button onClick={onToggle} title={t("payments")} type="button" className="group relative p-2.5 text-text-secondary hover:text-text-primary transition-all duration-300 ease-in-out rounded hover:bg-background-tertiary/50">
 <Receipt className="w-5 h-5 stroke-1.5" />
 </button>

 {isOpen && <HeaderDropdownPanel>
 {getPaymentsMenuItems().map(item => <HeaderMenuItem key={item.to} to={item.to} onClick={onClose} icon={item.icon} labelKey={item.labelKey} label={item.label} />)}
 </HeaderDropdownPanel>}
 </>;
};
export default HeaderPaymentsMenu;
