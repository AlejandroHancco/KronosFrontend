export type DeviceStatus = 'online' | 'offline' | 'unchecked' ;

export interface Device {
    id: string;
    projectId: string;
    name: string;
    type: string | null;
    ip: string | null;
    status: DeviceStatus;
    createdAt: string | null;
}
export interface DeviceResponse {
    id: string;
    projectId: string;
    name: string;
    type: string | null;  // 'analyzer' | 'mux'
    ip: string | null;
    status: DeviceStatus;
    createdAt: string;
}
export interface DeviceInfo {
    id: string;
    name: string;
    type: string | null;
    status: DeviceStatus;
    ip: string | null;
}
