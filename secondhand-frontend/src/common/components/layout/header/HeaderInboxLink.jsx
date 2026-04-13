import { Inbox } from 'lucide-react';
import { useInAppNotificationsContext } from '../../../../notification/InAppNotificationContext.jsx';
import HeaderIconButton from './HeaderIconButton.jsx';
import { ROUTES } from '../../../constants/routes.js';

const HeaderInboxLink = ({ emailCount, chatCount }) => {
    const { unreadCount } = useInAppNotificationsContext();
    const hubTotal = unreadCount + emailCount + chatCount;

    return <HeaderIconButton to={ROUTES.INBOX} icon={Inbox} badge={hubTotal} title="Inbox" />;
};

export default HeaderInboxLink;
