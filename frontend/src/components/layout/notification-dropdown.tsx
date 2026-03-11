"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellOff, CircleX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  type Notification,
} from "@/hooks/use-notifications";
import {
  TYPO_BODY_SM,
  TYPO_CAPTION,
  NOTIFICATION_ICON_SIZE,
  NAVBAR_TRIGGER_CLASS,
  LOADING_STATE_WRAPPER_CLASS,
  NOTIFICATION_EMPTY_ICON,
  NOTIFICATION_POPOVER_W,
  NOTIFICATION_POPOVER_OFFSET,
  NOTIFICATION_HEADER_CLASS,
  NOTIFICATION_HEADER_TITLE,
  NOTIFICATION_TRIGGER_ICON_CLASS,
  NOTIFICATION_LIST_CLASS,
  NOTIFICATION_LIST_ITEMS_CLASS,
  NOTIFICATION_ROW_CLASS,
  NOTIFICATION_ROW_UNREAD_CLASS,
  NOTIFICATION_ROW_READ_CLASS,
  NOTIFICATION_ROW_MESSAGE_UNREAD,
  NOTIFICATION_EMPTY_CLASS,
  NOTIFICATION_BADGE_CLASS,
} from "@/config/design";
import { LoadingState } from "@/components/ui/loading-state";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

const AUTHOR_PATTERNS: Record<string, RegExp> = {
  "idea.submitted": /from (.+?) needs/,
  "comment.added": /^(.+?) commented/,
  "comment.replied": /^(.+?) replied/,
};

function getAuthorInitial(type: string, message: string): string | null {
  const m = AUTHOR_PATTERNS[type]?.exec(message);
  if (!m) return null;
  const name = m[1];
  return name === "Anonymous" ? "?" : name.charAt(0).toUpperCase();
}

/** Initial, CircleX (removed), or Bell icon — minimal. */
function NotificationTypeIcon({
  type,
  message,
  isUnread,
}: {
  type: string;
  message: string;
  isUnread?: boolean;
}) {
  if (type === "idea.deleted") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center">
        <CircleX
          className={cn(
            "size-5",
            isUnread ? "text-destructive" : "text-destructive/70"
          )}
          aria-hidden
          strokeWidth={1.5}
        />
      </span>
    );
  }
  const initial = getAuthorInitial(type, message);
  if (initial) {
    return (
      <Avatar size="lg" className="shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isUnread ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {initial}
        </AvatarFallback>
      </Avatar>
    );
  }
  return (
    <Bell className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden strokeWidth={1.5} />
  );
}

/** Resolve link to client path: relative path or same-origin pathname. */
function getNavigatePath(link: string | null): string | null {
  if (!link?.trim()) return null;
  if (link.startsWith("/")) return link;
  try {
    const u = new URL(link);
    if (u.origin === env.NEXT_PUBLIC_APP_ORIGIN) {
      return u.pathname + u.search + u.hash;
    }
    return link;
  } catch {
    return null;
  }
}

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

const TITLE_MAX_LEN = 36;

/** Format message for display: truncate long titles, clean email authors. */
function formatNotificationMessage(message: string, type: string): string {
  // Truncate quoted title: "Slpeeeeeeeeee" → "Slpeeeeeeeeee" (≤36) or "Slpeeeeeeeeee…" (>36)
  const quotedMatch = message.match(/"([^"]+)"/);
  if (quotedMatch) {
    const title = quotedMatch[1];
    if (title.length > TITLE_MAX_LEN) {
      const truncated = title.slice(0, TITLE_MAX_LEN) + "…";
      message = message.replace(`"${title}"`, `"${truncated}"`);
    }
  }
  // idea.submitted: staff8@gre.ac.uk → staff8 (cleaner, polished)
  if (type === "idea.submitted") {
    const fromMatch = message.match(/ from (.+?) needs your review\./);
    if (fromMatch?.[1]?.includes("@")) {
      const local = fromMatch[1].split("@")[0];
      message = message.replace(fromMatch[1], local);
    }
  }
  return message;
}

function NotificationRow({
  item,
  onMarkRead,
  onNavigate,
}: {
  item: Notification;
  onMarkRead: (id: string) => void;
  onNavigate: (link: string | null) => void;
}) {
  const handleClick = () => {
    if (!item.isRead) {
      onMarkRead(item.id);
    }
    onNavigate(item.link);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        NOTIFICATION_ROW_CLASS,
        item.isRead ? NOTIFICATION_ROW_READ_CLASS : NOTIFICATION_ROW_UNREAD_CLASS
      )}
    >
      <span className="flex shrink-0 items-center">
        <NotificationTypeIcon type={item.type} message={item.message} isUnread={!item.isRead} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "line-clamp-2 break-words leading-snug",
            item.isRead
              ? "text-sm text-muted-foreground/90"
              : NOTIFICATION_ROW_MESSAGE_UNREAD
          )}
        >
          {formatNotificationMessage(item.message, item.type)}
        </p>
        <span className={cn("mt-0.5 block", TYPO_CAPTION)}>
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>
    </button>
  );
}

interface NotificationDropdownProps {
  /** Staff: pill group. Management: single icon. */
  variant?: "pill" | "standalone";
}

const TOOLTIP_SUPPRESS_MS = 600;

export function NotificationDropdown({ variant = "standalone" }: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [suppressTooltip, setSuppressTooltip] = useState(false);

  const { data: notifications, isLoading } = useNotificationsQuery({
    enabled: open,
  });
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const markAsRead = useMarkAsReadMutation();

  const handleNavigate = (link: string | null) => {
    setOpen(false);
    setSuppressTooltip(true);
    const path = getNavigatePath(link);
    if (!path) return;

    if (path.startsWith("/")) {
      const hashIdx = path.indexOf("#");
      const pathname = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
      const hash = hashIdx >= 0 ? path.slice(hashIdx) : "";
      const samePage =
        typeof window !== "undefined" && window.location.pathname === pathname;

      if (samePage && hash) {
        window.location.hash = hash;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } else {
        router.push(path);
      }
      setTimeout(() => setSuppressTooltip(false), TOOLTIP_SUPPRESS_MS);
    } else {
      window.location.href = path;
    }
  };

  const triggerContent = (
    <span
      className={cn(
        NOTIFICATION_TRIGGER_ICON_CLASS,
        NAVBAR_TRIGGER_CLASS,
        "relative text-muted-foreground hover:text-foreground",
        open && "text-foreground"
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className={NOTIFICATION_ICON_SIZE} aria-hidden strokeWidth={1.5} />
      {unreadCount > 0 && (
        <span
          className={cn(NOTIFICATION_BADGE_CLASS, unreadCount > 9 && "px-1")}
          aria-hidden
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip delayDuration={0} {...(open || suppressTooltip ? { open: false } : {})}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                NAVBAR_TRIGGER_CLASS,
                variant === "pill" &&
                  "flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted/[0.05]"
              )}
            >
              {triggerContent}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={NOTIFICATION_POPOVER_OFFSET}
        className={cn(NOTIFICATION_POPOVER_W, "p-0 overflow-hidden")}
      >
        <div className={NOTIFICATION_HEADER_CLASS}>
          <h3 className={NOTIFICATION_HEADER_TITLE}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={TYPO_CAPTION}>{unreadCount} unread</span>
          )}
        </div>
        <div className={NOTIFICATION_LIST_CLASS}>
          {isLoading ? (
            <div className={LOADING_STATE_WRAPPER_CLASS}>
              <LoadingState compact />
            </div>
          ) : !notifications?.length ? (
            <div className={NOTIFICATION_EMPTY_CLASS}>
              <span className={NOTIFICATION_EMPTY_ICON}>
                <BellOff className="size-5 text-muted-foreground/50" strokeWidth={1.25} aria-hidden />
              </span>
              <p className={cn("text-center", TYPO_BODY_SM)}>No notifications</p>
            </div>
          ) : (
            <div className={NOTIFICATION_LIST_ITEMS_CLASS}>
              {notifications.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onMarkRead={(id) => markAsRead.mutate(id)}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
  