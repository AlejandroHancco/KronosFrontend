import { Outlet } from 'react-router-dom';
import { useNotificationListener } from '../hooks/useNotifications';
import { useDeviceStatusListener } from '../hooks/useDeviceStatusListener';

const PrivateLayout = () => {
    // Conexión socket + toasts de notificaciones, una sola vez por sesión autenticada
    useNotificationListener();
    // Refresca el estado online/offline de dispositivos en tiempo real
    useDeviceStatusListener();
    return <Outlet />;
};

export default PrivateLayout;
