import type {DeviceInfo} from "./device.types.ts";

export interface MeasurementPoint {
  frequency: number;
  g: number[];  // 16 valores, uno por canal
  b: number[];  // 16 valores, uno por canal
}

export interface MeasurementSummary {
  id: number;
  takenAt: string;
  startFreq: number;
  stopFreq: number;
  sweepType: 'LOG' | 'LIN';
  analyzerName: string;
  muxName: string;
}

export interface MeasurementDetail extends MeasurementSummary {
  data: MeasurementPoint[];  // 801 puntos
}

export interface TaskPreferenceResponse {
  id: number;
  taskId: number;
  name: string;
  startFreq: number;
  stopFreq: number;
  points: number;
  sweepType: string;
  analyzerDevice: DeviceInfo;
  muxDevice: DeviceInfo;
}

export interface TaskDetail {
  id: number;
  name: string;
  status: string;
  activePreference: TaskPreferenceResponse | null;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export interface MeasureResponse {
  measurementId: number;
  takenAt: string;
  totalPoints: number;
  sweepType: 'LOG' | 'LIN';
  data: MeasurementPoint[];
}

export interface LatestMeasurement extends MeasurementDetail {
  projectName?: string;
  taskName?: string;
  taskId?: number;
  projectId?: string;
}

// WebSocket Events
export interface ProgressEvent {
  jobId: string;
  channel: number;
  total: number;
  percent: number;
  status: 'measuring' | 'completed' | 'error';
  message: string;
}

export interface CompletedEvent {
  jobId: string;
  measurementId: number;
  takenAt: string;
  totalPoints: number;
  data: MeasurementPoint[];
}

export interface ErrorEvent {
  jobId: string;
  message: string;
}

export interface MeasurementSocketState {
  progress: number;
  currentChannel: number;
  statusMessage: string;
  isCompleted: boolean;
  completedData: MeasurementPoint[] | null;
  error: string | null;
}

export interface TaskChannelInfo {
  channelNumber: number;
  alias: string;
  concreteMix: number | null;      // 0.0 a 1.0
  hasEmulsifier: boolean | null;
  notes: string | null;
  sampleAge: number | null;        // días
  temperature: number | null;      // °C
  humidity: number | null;         // %
}

export interface MeasurementChannelInfo {
  channelNumber: number;
  channelAlias: string | null;
  concreteMix: number | null;
  hasEmulsifier: boolean | null;
  notes: string | null;
  sampleAge: number | null;
  temperature: number | null;
  humidity: number | null;
}

export interface CreateTaskPreferenceDto {
  name: string;
  analyzerDeviceId: string;
  muxDeviceId: string;
  startFreq: number;
  stopFreq: number;
  points?: number;
  sweepType?: string;
}

export interface UpdateTaskPreferenceDto {
  name?: string;
  analyzerDeviceId?: string;
  muxDeviceId?: string;
  startFreq?: number;
  stopFreq?: number;
  points?: number;
  sweepType?: string;
}

export interface CreateDeviceDto {
  name: string;
  type: 'analyzer' | 'mux';
  ip?: string;
}

export type ScheduledJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface CreateScheduledJobDto {
  taskId: number;
  label: string | null;
  startAt: string;
  intervalMinutes: number | null;
  repeatCount: number;
  channelNumbers: number[];
}

export interface ScheduledJobResponse {
  id: number;
  taskId: number;
  label: string | null;
  startAt: string;
  intervalMinutes: number | null;
  repeatCount: number;
  channelNumbers: number[];
  status: ScheduledJobStatus;
  createdAt: string;
  task: {
    name: string;
    activePreference?: {
      analyzerDevice: DeviceInfo;
    }
  };
}
