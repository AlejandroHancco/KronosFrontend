import { cn } from "../../lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface SelectGroupConfig {
  label?: string
  options: SelectOption[]
}

interface KronosSelectProps {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options?: SelectOption[]
  groups?: SelectGroupConfig[]
  error?: string
  hint?: string
  disabled?: boolean
  className?: string
}

export function KronosSelect({
  label,
  placeholder = "Select an option",
  value,
  defaultValue,
  onValueChange,
  options,
  groups,
  error,
  hint,
  disabled,
  className,
}: KronosSelectProps) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-9 rounded-md border bg-card text-sm",
            "border-border focus:border-primary focus:ring-2 focus:ring-primary/20",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-md border border-border bg-popover">
          {/* Flat options */}
          {options?.map((option, index) => {
            const itemValue = option.value && option.value !== "" ? option.value : `fallback-option-${index}`
            return (
              <SelectItem
                key={itemValue}
                value={itemValue}
                disabled={option.disabled}
                className="cursor-pointer rounded-sm text-sm focus:bg-muted"
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            )
          })}

          {/* Grouped options */}
          {groups?.map((group, groupIndex) => (
            <SelectGroup key={groupIndex}>
              {group.label && (
                <SelectLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </SelectLabel>
              )}
              {group.options.map((option, optionIndex) => {
                const itemValue = option.value && option.value !== "" ? option.value : `fallback-group-${groupIndex}-option-${optionIndex}`
                return (
                  <SelectItem
                    key={itemValue}
                    value={itemValue}
                    disabled={option.disabled}
                    className="cursor-pointer rounded-sm text-sm focus:bg-muted"
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
