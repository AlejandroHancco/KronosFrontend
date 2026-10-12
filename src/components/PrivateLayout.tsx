import { Outlet } from 'react-router-dom';
import { useNotificationListener } from '../hooks/useNotifications';

const PrivateLayout = () => {
    // Conexión socket + toasts de notificaciones, una sola vez por sesión autenticada
    useNotificationListener();
    return <Outlet />;
};

export default PrivateLayout;
