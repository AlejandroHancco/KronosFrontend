import type { TaskChannelInfo } from '../../types/measurement.types';
import { Eye, EyeOff } from "lucide-react";

interface ChannelSelectorProps {
    taskId: number;
    taskChannels: TaskChannelInfo[];
    selectedChannels: number[];
    onChannelToggle: (channel: number) => void;
    visibleChannels: number[];
    onToggleVisible: (channel: number) => void;
    onChannelClick: (channel: TaskChannelInfo) => void;
}

const ChannelSelector = ({
                             taskChannels,
                             selectedChannels,
                             onChannelToggle,
                             visibleChannels,
                             onToggleVisible,
                             onChannelClick,
                         }: ChannelSelectorProps) => {

    const getChannel = (channelNumber: number): TaskChannelInfo => {
        return taskChannels.find(c => c.channelNumber === channelNumber) ?? {
            channelNumber,
            alias: `Canal ${channelNumber}`,
            concreteMix: null,
            hasEmulsifier: null,
            notes: null,
            sampleAge: null,
            temperature: null,
            humidity: null,
        };
    };

    const isConfigured = (channel: TaskChannelInfo) =>
        channel.alias !== `Canal ${channel.channelNumber}`;

    const handleCardClick = (channel: TaskChannelInfo) => {
        if (!isConfigured(channel)) {
            onChannelClick(channel);
        } else {
            onChannelToggle(channel.channelNumber);
        }
    };

    const handleAliasClick = (e: React.MouseEvent, channel: TaskChannelInfo) => {
        e.stopPropagation();
        onChannelClick(channel);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 16 }, (_, i) => {
                        const channelNumber = i + 1;
                        const channel = getChannel(channelNumber);
                        const configured = isConfigured(channel);
                        const selected = selectedChannels.includes(channelNumber);

                        return (
                            // div en lugar de button para evitar button-in-button
                            <div
                                key={channelNumber}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleCardClick(channel)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(channel)}
                                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-2.5 min-h-[58px] w-full text-left transition-colors duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                    selected
                                        ? 'border-primary bg-primary/10 text-foreground'
                                        : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50'
                                }`}
                            >
                                {/* Número */}
                                <span className={`text-[10px] font-mono leading-none ${
                                    selected ? 'text-primary' : 'text-muted-foreground'
                                }`}>
                                    {String(channelNumber).padStart(2, '0')}
                                </span>

                                {/* Alias — clic abre modal */}
                                <span
                                    onClick={(e) => handleAliasClick(e, channel)}
                                    title={configured ? 'Editar canal' : `Configurar canal ${channelNumber}`}
                                    className={`text-[11px] font-medium truncate w-full text-center leading-tight transition-opacity ${
                                        configured
                                            ? 'text-foreground underline underline-offset-2 decoration-dotted cursor-pointer hover:opacity-70'
                                            : 'text-muted-foreground/60 cursor-pointer hover:text-muted-foreground'
                                    }`}
                                >
                                    {channel.alias}
                                </span>

                                {/* Indicador ON/OFF */}
                                {configured && (
                                    <span className={`text-[9px] font-bold leading-none ${
                                        selected ? 'text-primary' : 'text-muted-foreground/50'
                                    }`}>
                                        {selected ? 'ON' : 'OFF'}
                                    </span>
                                )}

                                {/* Eye (visible toggle) — ahora puede ser button sin problema */}
                                {configured && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleVisible(channelNumber);
                                        }}
                                        className={`absolute top-1 right-1 transition-colors cursor-pointer ${
                                            visibleChannels.includes(channelNumber)
                                                ? 'text-primary'
                                                : 'text-muted-foreground/30 hover:text-muted-foreground'
                                        }`}
                                    >
                                        {visibleChannels.includes(channelNumber)
                                            ? <Eye className="size-3" />
                                            : <EyeOff className="size-3" />
                                        }
                                    </button>
                                )}

                                {/* Punto verde: tiene metadata */}
                                {channel.concreteMix !== null && (
                                    <span className="absolute bottom-1 right-1 size-1.5 rounded-full bg-green-500" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChannelSelector;