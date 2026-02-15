"use client"

import * as React from "react"
import { format, setMonth, setYear } from "date-fns"
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react"
import {
  type DayButton,
  type MonthProps,
  useDayPicker,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDateForInput(date: Date | undefined): string {
  if (!date) return ""
  return format(date, "yyyy-MM-dd")
}

function parseInputDate(str: string): Date | undefined {
  if (!str || !str.trim()) return undefined
  const d = new Date(str)
  return isNaN(d.getTime()) ? undefined : d
}

/** Display format: "MMM dd, yyyy" (e.g. Feb 03, 2026) */
function formatDisplayDate(date: Date): string {
  return format(date, "MMM dd, yyyy")
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


type ViewMode = "days" | "monthYear"

const DatePickerViewContext = React.createContext<{
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
}>({ viewMode: "days", setViewMode: () => {} })

/** Day cell — minimal, sophisticated, restrained states. */
function DatePickerDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isSelected =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelected}
      data-today={modifiers.today}
      className={cn(
        "relative flex size-8 cursor-pointer items-center justify-center rounded-md p-0 text-xs font-medium tabular-nums transition-colors duration-150",
        "hover:bg-primary/10 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        isSelected &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        modifiers.today &&
          !isSelected &&
          "ring-1 ring-inset ring-primary/40 font-semibold text-foreground",
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  )
}

function DatePickerMonthCaption(props: {
  calendarMonth: { date: Date }
  displayIndex: number
  className?: string
  children?: React.ReactNode
}) {
  const { calendarMonth, className } = props
  const { setViewMode } = React.useContext(DatePickerViewContext)
  const { goToMonth, previousMonth, nextMonth } = useDayPicker()
  const caption = format(calendarMonth.date, "MMMM yyyy")

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-0.5 pb-2",
        className
      )}
    >
      <button
        type="button"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label="Previous month"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeftIcon className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode("monthYear")}
        aria-label="Select month and year"
        className="flex flex-1 min-w-0 cursor-pointer items-center justify-center gap-1 rounded px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
      >
        <span className="truncate">{caption}</span>
        <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground" />
      </button>
      <button
        type="button"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label="Next month"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRightIcon className="size-3.5" />
      </button>
    </div>
  )
}

const MIN_YEAR = 1900
const MAX_YEAR = 2100

function DatePickerMonthYearView(props: {
  calendarMonth: { date: Date }
  onSelect: () => void
}) {
  const { calendarMonth } = props
  const { setViewMode } = React.useContext(DatePickerViewContext)
  const { goToMonth } = useDayPicker()
  const selectedYear = calendarMonth.date.getFullYear()
  const selectedMonth = calendarMonth.date.getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [yearInput, setYearInput] = React.useState(String(selectedYear))

  React.useEffect(() => {
    setYearInput(String(selectedYear))
  }, [selectedYear])

  const handleMonthSelect = (monthIndex: number) => {
    goToMonth(setMonth(calendarMonth.date, monthIndex))
    setViewMode("days")
  }

  const applyYear = React.useCallback(() => {
    const parsed = parseInt(yearInput, 10)
    if (!Number.isNaN(parsed) && parsed >= MIN_YEAR && parsed <= MAX_YEAR) {
      goToMonth(setYear(calendarMonth.date, parsed))
    } else {
      setYearInput(String(selectedYear))
    }
  }, [yearInput, selectedYear, calendarMonth.date, goToMonth])

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      applyYear()
    }
  }

  const handleYearBlur = () => {
    applyYear()
  }

  const incrementYear = () => {
    const next = Math.min(selectedYear + 1, MAX_YEAR)
    goToMonth(setYear(calendarMonth.date, next))
  }

  const decrementYear = () => {
    const prev = Math.max(selectedYear - 1, MIN_YEAR)
    goToMonth(setYear(calendarMonth.date, prev))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 pt-2">
      <button
        type="button"
        onClick={() => setViewMode("days")}
        className="flex w-fit cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
      >
        <ArrowLeftIcon className="size-3" />
        Back
      </button>

      <div className="flex flex-col gap-3">
        {/* Year */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="date-picker-year"
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            Year
          </label>
          <div className="flex items-center overflow-hidden rounded-lg border border-border">
            <Input
              id="date-picker-year"
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              onBlur={handleYearBlur}
              onKeyDown={handleYearKeyDown}
              className="h-9 flex-1 min-w-0 rounded-none border-0 bg-transparent text-center text-sm tabular-nums focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="flex h-9 w-8 flex-col shrink-0 overflow-hidden border-l border-border bg-muted/10">
              <button
                type="button"
                onClick={incrementYear}
                disabled={selectedYear >= MAX_YEAR}
                aria-label="Increment year"
                className="flex flex-1 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronUpIcon className="size-3" />
              </button>
              <button
                type="button"
                onClick={decrementYear}
                disabled={selectedYear <= MIN_YEAR}
                aria-label="Decrement year"
                className="flex flex-1 cursor-pointer items-center justify-center border-t border-border text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronDownIcon className="size-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Month grid */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Month
          </span>
          <div className="grid grid-cols-4 gap-0.5 rounded-lg border border-border bg-muted/[0.06] p-1.5">
            {MONTH_NAMES.map((name, i) => {
              const isSelected = selectedMonth === i
              const isCurrent = currentMonth === i && selectedYear === currentYear
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleMonthSelect(i)}
                  className={cn(
                    "cursor-pointer rounded px-2 py-2 text-center text-xs font-medium transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    !isSelected && isCurrent && "ring-1 ring-inset ring-primary/40 font-semibold"
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function DatePickerMonthWrapper(props: MonthProps) {
  const { viewMode } = React.useContext(DatePickerViewContext)
  const { calendarMonth, displayIndex: _displayIndex, ...rest } = props

  if (viewMode === "monthYear") {
    return (
      <div {...rest} className={cn(rest.className, "flex min-h-0 flex-1 flex-col")} data-slot="month-year-picker">
        <DatePickerMonthYearView calendarMonth={calendarMonth} onSelect={() => {}} />
      </div>
    )
  }

  return <div {...rest}>{props.children}</div>
}

export interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  className?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>("days")
  const [month, setMonthState] = React.useState<Date | undefined>(() =>
    parseInputDate(value ?? "") || new Date()
  )
  const date = parseInputDate(value ?? "")
  const displayValue = date ? formatDisplayDate(date) : ""

  const handleSelect = (d: Date | undefined) => {
    if (!d) return
    onChange?.(formatDateForInput(d))
    setOpen(false)
  }

  return (
    <DatePickerViewContext.Provider value={{ viewMode, setViewMode }}>
      <Popover open={open} onOpenChange={(o) => {
        setOpen(o)
        if (!o) setViewMode("days")
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            id={id}
            className={cn(
              "h-10 w-full cursor-pointer justify-between rounded-lg border border-border bg-transparent text-left font-normal text-foreground transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10 [&>span]:line-clamp-1 [&>span]:flex [&>span]:items-center [&>span]:gap-2",
              !displayValue && "text-muted-foreground",
              className
            )}
          >
            <span className="flex-1 truncate">
              {displayValue || placeholder}
            </span>
            <CalendarIcon
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border border-border p-0 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]"
          align="start"
          sideOffset={6}
        >
          <div
            data-slot="date-picker-calendar-container"
            className="flex min-h-[16rem] min-w-[15rem] flex-col overflow-hidden rounded-xl border-0 bg-popover"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonthState}
              initialFocus
              hideNavigation
              classNames={{
                root: "min-h-full min-w-full [--cell-size:2rem]",
                months: "flex min-h-full flex-col",
                month: "flex min-h-full flex-col gap-0 px-3 pb-3 pt-1",
                month_grid: "transition-opacity duration-150",
                table: "w-full border-collapse table-fixed",
                weekdays: "flex border-b border-border/60 pb-1.5 mb-0.5",
                weekday:
                  "text-muted-foreground flex flex-1 items-center justify-center py-1 text-[11px] font-medium uppercase tracking-wider tabular-nums",
                week: "flex w-full",
                day: "relative p-0.5 text-center [&_button]:mx-auto",
                outside: "text-muted-foreground/50",
                disabled: "text-muted-foreground/40 opacity-50",
                hidden: "invisible",
              }}
              components={{
                DayButton: DatePickerDayButton,
                MonthCaption: DatePickerMonthCaption,
                Month: DatePickerMonthWrapper,
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </DatePickerViewContext.Provider>
  )
}

export { DatePicker, formatDateForInput, parseInputDate, formatDisplayDate }

// ─── DateTimePicker (datetime-local format, Calendar UI + time) ─────────────────

function parseDatetimeLocal(str: string): { date: Date; time: string } | null {
  if (!str || !str.trim()) return null
  const d = new Date(str)
  if (isNaN(d.getTime())) return null
  const h = d.getHours()
  const m = d.getMinutes()
  const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  return { date: d, time }
}

function toDatetimeLocal(date: Date, time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return `${format(d, "yyyy-MM-dd")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** Display format: "MMM dd, yyyy, HH:mm" */
function formatDisplayDatetime(date: Date, time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number)
  return `${format(date, "MMM dd, yyyy")} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  className?: string
}

function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date and time",
  disabled = false,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
}: DateTimePickerProps) {
  const parsed = parseDatetimeLocal(value ?? "")
  const [open, setOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState<Date | undefined>(parsed?.date)
  const [tempTime, setTempTime] = React.useState(parsed?.time ?? "23:59")
  const [month, setMonthState] = React.useState<Date | undefined>(() =>
    parsed?.date ?? new Date()
  )
  const [viewMode, setViewMode] = React.useState<ViewMode>("days")

  React.useEffect(() => {
    const p = parseDatetimeLocal(value ?? "")
    if (p) {
      setTempDate(p.date)
      setTempTime(p.time)
    }
  }, [value, open])

  const displayValue =
    tempDate && tempTime
      ? formatDisplayDatetime(tempDate, tempTime)
      : ""

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) {
      setViewMode("days")
      if (tempDate && tempTime && onChange) {
        onChange(toDatetimeLocal(tempDate, tempTime))
      }
    }
  }

  const handleSelect = (d: Date | undefined) => {
    if (d) setTempDate(d)
  }

  return (
    <DatePickerViewContext.Provider value={{ viewMode, setViewMode }}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            id={id}
            className={cn(
              "h-10 w-full cursor-pointer justify-between rounded-lg border border-border bg-transparent text-left font-normal text-foreground transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10 [&>span]:line-clamp-1 [&>span]:flex [&>span]:items-center [&>span]:gap-2",
              !displayValue && "text-muted-foreground",
              className
            )}
          >
            <span className="flex-1 truncate">
              {displayValue || placeholder}
            </span>
            <CalendarIcon
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border border-border p-0 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.04)]"
          align="start"
          sideOffset={6}
        >
          <div
            data-slot="datetime-picker-container"
            className="flex min-h-0 flex-col overflow-hidden rounded-xl border-0 bg-popover"
          >
            <div className="flex min-h-[16rem] min-w-[15rem] flex-col overflow-hidden">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonthState}
                initialFocus
                hideNavigation
                classNames={{
                  root: "min-h-full min-w-full [--cell-size:2rem]",
                  months: "flex min-h-full flex-col",
                  month: "flex min-h-full flex-col gap-0 px-3 pb-3 pt-1",
                  month_grid: "transition-opacity duration-150",
                  table: "w-full border-collapse table-fixed",
                  weekdays: "flex border-b border-border/60 pb-1.5 mb-0.5",
                  weekday:
                    "text-muted-foreground flex flex-1 items-center justify-center py-1 text-[11px] font-medium uppercase tracking-wider tabular-nums",
                  week: "flex w-full",
                  day: "relative p-0.5 text-center [&_button]:mx-auto",
                  outside: "text-muted-foreground/50",
                  disabled: "text-muted-foreground/40 opacity-50",
                  hidden: "invisible",
                }}
                components={{
                  DayButton: DatePickerDayButton,
                  MonthCaption: DatePickerMonthCaption,
                  Month: DatePickerMonthWrapper,
                }}
              />
            </div>
            <div className="flex items-center gap-2 border-t border-border/60 px-3 pb-3 pt-2">
              <label
                htmlFor="datetime-picker-time"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Time
              </label>
              <input
                id="datetime-picker-time"
                type="time"
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                className="h-9 flex-1 min-w-0 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </DatePickerViewContext.Provider>
  )
}

export { DateTimePicker }
