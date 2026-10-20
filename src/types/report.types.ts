export type WatcherStatus = 'correct' | 'warning' | 'error';

export interface ReportRange { from?: string; to?: string }

export interface ReportTaskRow {
  [key: string]: unknown;
  taskId: number;
  taskName: string;
  taskStatus: string | null;
  projectId: string;
  projectName: string;
  measurementCount: number;
  lastMeasuredAt: string | null;
  statusCounts: Record<WatcherStatus, number>;
}

export interface ReportChannel {
  channelNumber: number;
  channelAlias: string | null;
  concreteMix: number | null;
  hasEmulsifier: boolean | null;
  sampleAge: number | null;
  temperature: number | null;
  humidity: number | null;
}

export interface ReportMeasurement {
  id: number;
  takenAt: string | null;
  takenByName: string | null;
  presetName: string | null;
  sweepType: string;
  watcherStatus: WatcherStatus | null;
  watcherReason: string | null;
  channels: ReportChannel[];
}

export interface ReportPoint { frequency: number; g: number[]; b: number[] }

export interface TaskReportData {
  task: { id: number; name: string; description: string | null };
  project: { id: string; name: string };
  preference: {
    name: string;
    analyzer: { name: string; ip: string | null };
    mux: { name: string; ip: string | null };
    ranges: { startFreq: number; stopFreq: number; points: number; sweepType: string }[];
  } | null;
  measurements: ReportMeasurement[];
  latest: { id: number; takenAt: string | null; sweepType: string; data: ReportPoint[]; channels: ReportChannel[] } | null;
  range: { from: string | null; to: string | null };
}
