import { useEffect, useRef, useState } from 'react';
import type { Control } from 'react-hook-form';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { MeasureResponse, TaskChannelInfo } from '../../types/measurement.types';
import { KronosCard, KronosButton, KronosBadge } from '../kronos';
import { Activity, Save, Zap, Calendar } from 'lucide-react';
import ScheduledJobModal from './ScheduledJobModal';

export interface FrequencyRange {
    id?: string | number;
    order: number;
    startFreq: number;
    stopFreq: number;
    points: number;
    sweepType: string;
}

export interface SweepFormData {
    ranges: FrequencyRange[];
}

interface SweepConfigCardProps {
    control: Control<SweepFormData>;
    onSubmit: (ranges: FrequencyRange[]) => void;
    onSave: (ranges: FrequencyRange[]) => void;
    isSaving?: boolean;
    isMeasuring: boolean;
    measureData: MeasureResponse | undefined;
    measureError: Error | null;
    progress?: number;
    currentChannel?: number;
    statusMessage?: string;
    isCompleted?: boolean;
    taskId: number;
    taskChannels: TaskChannelInfo[];
    selectedChannels: number[];
    preferenceRanges?: FrequencyRange[];
}

type SimpleField = {
    value: number | string | undefined;
    onChange: (val: number) => void;
    onBlur?: () => void;
    name?: string;
    ref?: React.LegacyRef<HTMLInputElement>;
};

const inputClass =
    'w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-foreground text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all';

const unitSelectClass =
    'shrink-0 w-[68px] px-1.5 py-2 rounded-md border border-border bg-muted/30 text-foreground text-xs ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all';

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider';

// ── Frecuencia: el valor que viaja al backend/DB siempre es Hz (lo que ya
// espera el schema). La unidad es puramente de presentación en el input. ──
type FreqUnit = 'Hz' | 'kHz' | 'MHz';
const DEFAULT_FREQ_UNIT: FreqUnit = 'kHz';
const UNIT_FACTORS: Record<FreqUnit, number> = { Hz: 1, kHz: 1e3, MHz: 1e6 };

const toHz = (hzLike: unknown): number => {
    const n = typeof hzLike === 'number' ? hzLike : Number(hzLike);
    return Number.isFinite(n) ? n : 0;
};

const formatInUnit = (hz: number, unit: FreqUnit): string => {
    if (!hz) return '';
    const value = hz / UNIT_FACTORS[unit];
    return Number(value.toFixed(6)).toString();
};

interface FrequencyInputProps {
    field: SimpleField;
    unit: FreqUnit;
    onUnitChange: (unit: FreqUnit) => void;
}

/** Input de frecuencia con selector de unidad (Hz/kHz/MHz) al costado. Siempre guarda/emite Hz. */
const FrequencyInput = ({ field, unit, onUnitChange }: FrequencyInputProps) => {
    const [display, setDisplay] = useState(() => formatInUnit(toHz(field.value), unit));
    const lastEmittedHz = useRef<number | null>(null);
    const lastUnit = useRef(unit);

    useEffect(() => {
        const hz = toHz(field.value);
        const unitChanged = lastUnit.current !== unit;
        lastUnit.current = unit;
        // No pisar lo que el usuario está escribiendo: solo resincronizar el
        // texto mostrado si el cambio vino de afuera (carga de preferencia) o
        // si cambió la unidad seleccionada.
        if (!unitChanged && lastEmittedHz.current === hz) return;
        setDisplay(formatInUnit(hz, unit));
    }, [field.value, unit]);

    const handleChange = (raw: string) => {
        setDisplay(raw);
        const cleaned = raw.replace(/[^0-9.]/g, '');
        if (cleaned === '' || cleaned === '.') {
            lastEmittedHz.current = 0;
            field.onChange(0);
            return;
        }
        const num = Number(cleaned);
        if (Number.isNaN(num)) return;
        const hz = Math.round(num * UNIT_FACTORS[unit]);
        lastEmittedHz.current = hz;
        field.onChange(hz);
    };

    return (
        <div className="flex gap-1.5">
            <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                value={display}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={field.onBlur}
            />
            <select
                value={unit}
                onChange={(e) => onUnitChange(e.target.value as FreqUnit)}
                className={unitSelectClass}
            >
                <option value="Hz">Hz</option>
                <option value="kHz">kHz</option>
                <option value="MHz">MHz</option>
            </select>
        </div>
    );
};

const NumberInput = ({ field, min, max }: { field: SimpleField; min?: number; max?: number }) => (
    <input
        {...field}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={inputClass}
        value={field.value ?? ''}
        onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            if (val === '') { field.onChange(0); return; }
            let num = Number(val);
            if (min !== undefined && num < min) num = min;
            if (max !== undefined && num > max) num = max;
            field.onChange(num);
        }}
    />
);

const SweepConfigCard = ({
                             control,
                             onSubmit,
                             onSave,
                             isSaving = false,
                             isMeasuring,
                             measureData,
                             measureError,
                             progress = 0,
                             currentChannel = 0,
                             statusMessage = '',
                             isCompleted = false,
                             taskId,
                             taskChannels,
                             selectedChannels,
                             preferenceRanges,
                         }: SweepConfigCardProps) => {
    const [isScheduledJobModalOpen, setIsScheduledJobModalOpen] = useState(false);

    // activeRangeIndex solo se modifica por interacción del usuario, nunca desde un effect
    const [activeRangeIndex, setActiveRangeIndex] = useState(0);

    // Unidad de presentación por rango (start/stop independientes) — kHz por default.
    // Puramente de UI: el form siempre guarda/envía Hz.
    const [startUnits, setStartUnits] = useState<Record<number, FreqUnit>>({});
    const [stopUnits, setStopUnits] = useState<Record<number, FreqUnit>>({});
    const getUnit = (map: Record<number, FreqUnit>, idx: number) => map[idx] ?? DEFAULT_FREQ_UNIT;

    const { getValues, setValue } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name: 'ranges' });

    // Sincronizar rangos del backend — SOLO setValue, sin ningún setState
    useEffect(() => {
        if (preferenceRanges && preferenceRanges.length > 0) {
            setValue('ranges', preferenceRanges);
        }
    }, [preferenceRanges, setValue]);

    // Garantizar al menos un rango — SOLO append, sin ningún setState
    useEffect(() => {
        if (!preferenceRanges?.length && fields.length === 0) {
            append({ order: 1, startFreq: 0, stopFreq: 0, points: 801, sweepType: 'LIN' });
        }
    }, [fields.length, preferenceRanges, append]);

    // Clampear el índice activo si queda fuera de rango tras eliminar — via render, no effect
    const safeIndex = fields.length > 0 ? Math.min(activeRangeIndex, fields.length - 1) : 0;

    const getStatusMessage = () => {
        if (statusMessage) return statusMessage;
        if (isMeasuring && progress === 0) return 'Conectando al Hioki IM3570...';
        if (measureError) return `Error: ${measureError.message}`;
        if (measureData && progress === 100) return `Medición completada — ${measureData.totalPoints} puntos`;
        if (isCompleted) return 'Medición completada correctamente';
        return 'Listo para enviar comandos';
    };

    const getStatusVariant = (): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
        if (measureError) return 'danger';
        if (isCompleted || (measureData && progress === 100)) return 'success';
        if (isMeasuring) return 'info';
        return 'default';
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const allRanges = getValues('ranges') as FrequencyRange[];
        onSubmit(allRanges);
    };

    const handleSave = () => {
        const allRanges = getValues('ranges') as FrequencyRange[];
        onSave(allRanges);
    };

    const handleRemove = (i: number) => {
        remove(i);
        // setActiveRangeIndex desde interacción del usuario — esto está bien
        setActiveRangeIndex(Math.max(0, i - 1));
    };

    const handleAppend = () => {
        append({ order: fields.length + 1, startFreq: 0, stopFreq: 0, points: 801, sweepType: 'LIN' });
        // setActiveRangeIndex desde interacción del usuario — esto está bien
        setActiveRangeIndex(fields.length);
    };

    return (
        <KronosCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                        <Zap className="size-3.5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Sweep Configuration</h2>
                        <p className="text-[10px] text-muted-foreground">Parámetros de barrido en frecuencia</p>
                    </div>
                </div>
                <KronosBadge variant={getStatusVariant()} dot size="sm">
                    {isMeasuring ? 'Midiendo' : isCompleted ? 'Completado' : measureError ? 'Error' : 'En espera'}
                </KronosBadge>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">

                {/* Rango selector (tabs/pills) */}
                <div className="flex gap-1.5 flex-wrap">
                    {fields.map((range, i) => (
                        <button
                            key={range.id}
                            type="button"
                            onClick={() => setActiveRangeIndex(i)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                safeIndex === i
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted/30 border border-border text-muted-foreground hover:border-primary/50'
                            }`}
                        >
                            Rango {i + 1}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={handleAppend}
                        className="px-2.5 py-1 rounded-md text-xs border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                    >
                        + Rango
                    </button>
                </div>

                {/* Inputs del rango activo */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Start Freq</label>
                        <Controller
                            name={`ranges.${safeIndex}.startFreq` as const}
                            control={control}
                            render={({ field }) => (
                                <FrequencyInput
                                    field={field}
                                    unit={getUnit(startUnits, safeIndex)}
                                    onUnitChange={(u) => setStartUnits((prev) => ({ ...prev, [safeIndex]: u }))}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Stop Freq</label>
                        <Controller
                            name={`ranges.${safeIndex}.stopFreq` as const}
                            control={control}
                            render={({ field }) => (
                                <FrequencyInput
                                    field={field}
                                    unit={getUnit(stopUnits, safeIndex)}
                                    onUnitChange={(u) => setStopUnits((prev) => ({ ...prev, [safeIndex]: u }))}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Points</label>
                        <Controller
                            name={`ranges.${safeIndex}.points` as const}
                            control={control}
                            render={({ field }) => <NumberInput field={field} min={1} max={801} />}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Sweep Type</label>
                        <Controller
                            name={`ranges.${safeIndex}.sweepType` as const}
                            control={control}
                            render={({ field }) => (
                                <select {...field} className={inputClass}>
                                    <option value="LOG">LOG</option>
                                    <option value="LIN">LIN</option>
                                </select>
                            )}
                        />
                    </div>
                </div>

                {fields.length > 1 && (
                    <button
                        type="button"
                        onClick={() => handleRemove(safeIndex)}
                        className="text-xs text-destructive hover:text-destructive/80"
                    >
                        Eliminar rango {safeIndex + 1}
                    </button>
                )}

                {/* Botones */}
                <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                        <KronosButton
                            type="submit"
                            size="sm"
                            className="flex-1"
                            disabled={isMeasuring}
                            leftIcon={<Activity className="size-3.5" />}
                        >
                            {isMeasuring ? 'Midiendo...' : 'Sweep Measure'}
                        </KronosButton>

                        <KronosButton
                            type="button"
                            variant="outline"
                            size="sm"
                            leftIcon={<Save className="size-3.5" />}
                            onClick={handleSave}
                            loading={isSaving}
                        >
                            Guardar
                        </KronosButton>
                    </div>

                    <KronosButton
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        leftIcon={<Calendar className="size-3.5" />}
                        onClick={() => setIsScheduledJobModalOpen(true)}
                    >
                        Programar Medición
                    </KronosButton>
                </div>

                {/* Barra de progreso */}
                {isMeasuring && progress > 0 && (
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Canal {currentChannel}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isCompleted ? 'bg-green-500' : 'bg-primary'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </form>

            {/* Status bar */}
            <div className="px-5 py-3 border-t border-border bg-muted/20">
                <p className={`text-xs ${measureError ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {getStatusMessage()}
                </p>
            </div>

            {/* Scheduled Job Modal */}
            <ScheduledJobModal
                isOpen={isScheduledJobModalOpen}
                onClose={() => setIsScheduledJobModalOpen(false)}
                taskId={taskId}
                selectedChannels={selectedChannels}
                taskChannels={taskChannels}
            />
        </KronosCard>
    );
};

export default SweepConfigCard;