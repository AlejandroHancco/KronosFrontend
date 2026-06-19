import { useEffect, useState } from 'react';
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
    onSubmit: (range: FrequencyRange) => void;
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

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider';

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
        const activeRange = getValues(`ranges.${safeIndex}`) as FrequencyRange;
        onSubmit(activeRange);
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
                        <label className={labelClass}>Start Freq (Hz)</label>
                        <Controller
                            name={`ranges.${safeIndex}.startFreq` as const}
                            control={control}
                            render={({ field }) => <NumberInput field={field} />}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Stop Freq (Hz)</label>
                        <Controller
                            name={`ranges.${safeIndex}.stopFreq` as const}
                            control={control}
                            render={({ field }) => <NumberInput field={field} />}
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