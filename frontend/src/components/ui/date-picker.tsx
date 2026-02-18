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

/** Day cell — design scale: /[0.06] hover, /[0.08] ring. */
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
        "relative flex size-8 cursor-pointer items-center justify-center rounded-full p-0 text-[12px] tabular-nums font-normal transition-colors duration-200",
        "hover:bg-muted/[0.06]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/[0.08] focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-40",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary/95",
        modifiers.today && !isSelected && "text-primary font-medium",
        modifiers.outside && "text-muted-foreground/50",
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
    <div className={cn("flex items-center justify-between gap-0.5 pb-1", className)}>
      <button
        type="button"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label="Previous month"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/80 transition-colors duration-200 hover:bg-muted/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/[0.08] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeftIcon className="size-3" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => setViewMode("monthYear")}
        aria-label="Select month and year"
        className="flex flex-1 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium tracking-tight text-foreground transition-colors duration-200 hover:bg-muted/[0.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/[0.08]"
      >
        <span className="truncate">{caption}</span>
        <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground/80" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label="Next month"
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/80 transition-colors duration-200 hover:bg-muted/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/[0.08] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRightIcon className="size-3" strokeWidth={2} />
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

  const labelClass = "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80"
  const navBtnClass =
    "flex flex-1 cursor-pointer items-center justify-center text-muted-foreground/80 transition-colors duration-200 hover:bg-muted/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

  return (
    <div className="flex min-h-full min-w-full flex-col gap-2 pb-2.5 pt-2">
      <div className="border-b border-border/40 pb-2">
        <button
          type="button"
          onClick={() => setViewMode("days")}
          aria-label="Back to calendar"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-0 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 transition-colors duration-200 hover:bg-muted/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/[0.08]"
        >
          <ArrowLeftIcon className="size-3.5" strokeWidth={2} />
          Back
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="date-picker-year" className={labelClass}>Year</label>
          <div className="flex items-center overflow-hidden rounded-lg border border-border/40 bg-muted/[0.03]">
            <Input
              id="date-picker-year"
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              onBlur={handleYearBlur}
              onKeyDown={handleYearKeyDown}
              className="h-8 flex-1 min-w-0 rounded-none border-0 bg-transparent text-center text-[13px] tabular-nums font-medium focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="flex h-8 w-8 flex-col shrink-0 overflow-hidden border-l border-border/40">
              <button type="button" onClick={incrementYear} disabled={selectedYear >= MAX_YEAR} aria-label="Increment year" className={navBtnClass}>
                <ChevronUpIcon className="size-3.5" strokeWidth={2} />
              </button>
              <button type="button" onClick={decrementYear} disabled={selectedYear <= MIN_YEAR} aria-label="Decrement year" className={cn(navBtnClass, "border-t border-border/40")}>
                <ChevronDownIcon className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className={labelClass}>Month</span>
          <div className="grid grid-cols-4 gap-1 rounded-lg p-1">
            {MONTH_NAMES.map((name, i) => {
              const isSelected = selectedMonth === i
              const isCurrent = currentMonth === i && selectedYear === currentYear
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleMonthSelect(i)}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-1.5 text-center text-[12px] font-medium transition-colors duration-200",
                    "hover:bg-muted/[0.06]",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/95",
                    !isSelected && isCurrent && "text-primary font-semibold"
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
  // Exclude displayIndex so it isn't forwarded to DOM (react-day-picker internal prop)
  const { calendarMonth, displayIndex, ...rest } = props
  void displayIndex

  if (viewMode === "monthYear") {
    return (
      <div {...rest} className={cn(rest.className, "flex min-h-full min-w-full flex-col")} data-slot="month-year-picker">
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
              "h-10 w-full cursor-pointer justify-between gap-2 rounded-xl border border-border/80 bg-background text-left font-normal text-foreground transition-colors duration-200 hover:border-primary/30 hover:bg-muted/[0.03] focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-1 focus-visible:ring-primary/[0.08] aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10 [&>span]:line-clamp-1 [&>span]:flex [&>span]:items-center",
              !displayValue && "text-muted-foreground",
              className
            )}
          >
            <span className="flex min-w-0 flex-1 truncate">
              {displayValue || placeholder}
            </span>
            <CalendarIcon
              className="size-4 shrink-0 text-muted-foreground/80"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-2xl p-0"
          align="start"
          sideOffset={8}
        >
          <div
            data-slot="date-picker-calendar-container"
            className="flex min-h-[13.5rem] min-w-[15rem] flex-col overflow-hidden rounded-2xl"
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
                root: "min-h-full min-w-full !p-0 [--cell-size:2rem]",
                months: "flex min-h-full flex-col",
                month: "flex min-h-full flex-col gap-0 px-3 pb-2.5 pt-3",
                month_grid: "transition-opacity duration-200",
                table: "w-full border-collapse table-fixed",
                weekdays: "flex w-full gap-0.5 border-b border-border/40 pb-0.5 mb-0.5",
                weekday: "text-muted-foreground/80 flex flex-1 min-w-0 items-center justify-center py-0.5 text-[10px] font-medium uppercase tracking-wider tabular-nums",
                week: "flex w-full gap-0.5",
                day: "relative flex flex-1 min-w-0 p-0.5 text-center [&_button]:mx-auto [&_button]:block",
                today: "rounded-full bg-accent text-accent-foreground",
                outside: "text-muted-foreground/50",
                disabled: "text-muted-foreground/50 opacity-40",
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

/** Parsed date + time for refined display (separate styling). */
function parseDisplayDatetime(date: Date, time: string): { datePart: string; timePart: string } | null {
  const [h = 0, m = 0] = time.split(":").map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return {
    datePart: format(date, "MMM d, yyyy"),
    timePart: format(d, "h:mm a"),
  }
}

/** Converts "HH:mm" (24h) to { hour: 1-12, minute: 0-59, ampm: "AM"|"PM" } */
function timeTo12h(time: string): { hour: number; minute: number; ampm: "AM" | "PM" } {
  const [h = 0, m = 0] = time.split(":").map(Number)
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const ampm = h < 12 ? "AM" : "PM"
  return { hour: hour12, minute: m, ampm }
}

/** Converts { hour 1-12, minute, ampm } to "HH:mm" (24h) */
function timeFrom12h(hour: number, minute: number, ampm: "AM" | "PM"): string {
  let h = hour === 12 ? 0 : hour
  if (ampm === "PM") h += 12
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

/** Time selector — stepper layout, tối giản, dễ dùng. */
function TimeSelect({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (v: string) => void
  id?: string
}) {
  const { hour, minute, ampm } = timeTo12h(value)

  const step = (deltaH: number, deltaM: number, flipAmPm?: boolean) => {
    let h = hour
    let m = minute
    let a = ampm
    if (flipAmPm) a = a === "AM" ? "PM" : "AM"
    m += deltaM
    if (m >= 60) {
      m = 0
      h++
    } else if (m < 0) {
      m = 59
      h--
    }
    h += deltaH
    if (h > 12) {
      h = 1
      a = a === "AM" ? "PM" : "AM"
    } else if (h < 1) {
      h = 12
      a = a === "AM" ? "PM" : "AM"
    }
    onChange(timeFrom12h(h, m, a))
  }

  const stepperBtn =
    "flex size-7 shrink-0 items-center justify-center text-muted-foreground/80 transition-colors duration-200 hover:bg-muted/[0.06] hover:text-foreground"
  const stepperValue = "min-w-[2rem] py-1 text-center text-[12px] font-medium tabular-nums text-foreground"
  const ampmBtn =
    "flex min-w-[2rem] flex-1 cursor-pointer items-center justify-center rounded-md py-1 text-[11px] font-medium tabular-nums transition-colors duration-200"
  const ampmActive = "bg-primary/[0.08] text-primary"
  const ampmInactive = "text-muted-foreground/80 hover:bg-muted/[0.06] hover:text-foreground"

  return (
    <div id={id} className="flex items-center gap-2" aria-label="Time">
      {/* Hour */}
      <div className="flex h-8 items-center overflow-hidden rounded-lg border border-border/40 bg-muted/[0.03]">
        <button type="button" aria-label="Decrease hour" onClick={() => step(-1, 0)} className={cn(stepperBtn, "rounded-l-lg")}>
          <ChevronUpIcon className="size-3.5 rotate-180" strokeWidth={2} />
        </button>
        <span className={stepperValue}>{String(hour).padStart(2, "0")}</span>
        <button type="button" aria-label="Increase hour" onClick={() => step(1, 0)} className={cn(stepperBtn, "rounded-r-lg")}>
          <ChevronUpIcon className="size-3.5" strokeWidth={2} />
        </button>
      </div>
      <span className="text-muted-foreground/80 text-sm font-light tabular-nums" aria-hidden>:</span>
      {/* Minute */}
      <div className="flex h-8 items-center overflow-hidden rounded-lg border border-border/40 bg-muted/[0.03]">
        <button type="button" aria-label="Decrease minute" onClick={() => step(0, -1)} className={cn(stepperBtn, "rounded-l-lg")}>
          <ChevronUpIcon className="size-3.5 rotate-180" strokeWidth={2} />
        </button>
        <span className={stepperValue}>{String(minute).padStart(2, "0")}</span>
        <button type="button" aria-label="Increase minute" onClick={() => step(0, 1)} className={cn(stepperBtn, "rounded-r-lg")}>
          <ChevronUpIcon className="size-3.5" strokeWidth={2} />
        </button>
      </div>
      {/* AM/PM */}
      <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg border border-border/40 bg-muted/[0.03] p-0.5">
        {(["AM", "PM"] as const).map((a) => (
          <button
            key={a}
            type="button"
            role="option"
            aria-selected={ampm === a}
            className={cn(ampmBtn, ampm === a ? ampmActive : ampmInactive)}
            onClick={() => onChange(timeFrom12h(hour, minute, a))}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  )
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

  const displayParsed =
    tempDate && tempTime ? parseDisplayDatetime(tempDate, tempTime) : null

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
              "h-10 w-full cursor-pointer justify-between gap-2 rounded-xl border border-border/80 bg-background text-left font-normal transition-colors duration-200 hover:border-primary/30 hover:bg-muted/[0.03] focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-1 focus-visible:ring-primary/[0.08] aria-[invalid=true]:border-destructive/80 aria-[invalid=true]:ring-destructive/10 [&>span]:line-clamp-1 [&>span]:flex [&>span]:items-center",
              !displayParsed && "text-muted-foreground",
              className
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
              {displayParsed ? (
                <>
                  <span className="truncate text-foreground/95">
                    {displayParsed.datePart}
                  </span>
                  <span
                    className="shrink-0 text-muted-foreground/40"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground/88">
                    {displayParsed.timePart}
                  </span>
                </>
              ) : (
                placeholder
              )}
            </span>
            <CalendarIcon
              className="size-4 shrink-0 text-muted-foreground/80"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-2xl p-0"
          align="start"
          sideOffset={8}
        >
          <div
            data-slot="datetime-picker-container"
            className="flex min-h-0 flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex min-h-[13.5rem] min-w-[15rem] flex-col overflow-hidden">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonthState}
                initialFocus
                hideNavigation
                classNames={{
                  root: "min-h-full min-w-full !p-0 [--cell-size:2rem]",
                  months: "flex min-h-full flex-col",
                  month: "flex min-h-full flex-col gap-0 px-3 pb-2.5 pt-3",
                  month_grid: "transition-opacity duration-200",
                  table: "w-full border-collapse table-fixed",
                  weekdays: "flex w-full gap-0.5 border-b border-border/40 pb-0.5 mb-0.5",
                  weekday: "text-muted-foreground/80 flex flex-1 min-w-0 items-center justify-center py-0.5 text-[10px] font-medium uppercase tracking-wider tabular-nums",
                  week: "flex w-full gap-0.5",
                  day: "relative flex flex-1 min-w-0 p-0.5 text-center [&_button]:mx-auto [&_button]:block",
                  today: "rounded-full bg-accent text-accent-foreground",
                  outside: "text-muted-foreground/50",
                  disabled: "text-muted-foreground/50 opacity-40",
                  hidden: "invisible",
                }}
                components={{
                  DayButton: DatePickerDayButton,
                  MonthCaption: DatePickerMonthCaption,
                  Month: DatePickerMonthWrapper,
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5 border-t border-border/40 px-3 pb-2.5 pt-2">
              <label htmlFor="datetime-picker-time" className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Time
              </label>
              <TimeSelect
                id="datetime-picker-time"
                value={tempTime}
                onChange={setTempTime}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </DatePickerViewContext.Provider>
  )
}

export { DateTimePicker }
