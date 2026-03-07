"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellOff } from "lucide-react";
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
  IDEAS_HUB_EMPTY_ICON,
  LOADING_STATE_WRAPPER_CLASS,
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

/** Circular avatar: initial (identified) or "?" (anonymous). Matches Coordinator style. */
function NotificationTypeIcon({
  type,
  message,
  isUnread,
}: {
  type: string;
  message: string;
  isUnread?: boolean;
}) {
  const initial = getAuthorInitial(type, message);
  if (initial) {
    return (
      <Avatar className="size-7 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isUnread
              ? "bg-primary text-primary-foreground"
              : "bg-primary/15 text-primary"
          )}
        >
          {initial}
        </AvatarFallback>
      </Avatar>
    );
  }
  return <Bell className="size-[14px]" aria-hidden />;
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
            "line-clamp-2 leading-snug",
            item.isRead ? TYPO_BODY_SM : NOTIFICATION_ROW_MESSAGE_UNREAD
          )}
        >
          {item.message}
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
      router.push(path);
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
        "relative text-muted-foreground/55 hover:text-foreground/80",
        open && "text-foreground/90"
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className={NOTIFICATION_ICON_SIZE} aria-hidden strokeWidth={1.75} />
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
            <span className={cn(TYPO_CAPTION, "text-muted-foreground/85")}>{unreadCount} unread</span>
          )}
        </div>
        <div className={NOTIFICATION_LIST_CLASS}>
          {isLoading ? (
            <div className={LOADING_STATE_WRAPPER_CLASS}>
              <LoadingState compact />
            </div>
          ) : !notifications?.length ? (
            <div className={NOTIFICATION_EMPTY_CLASS}>
              <span className={IDEAS_HUB_EMPTY_ICON}>
                <BellOff className="size-5 text-muted-foreground/40" strokeWidth={1.25} />
              </span>
              <p className={cn("text-center text-muted-foreground/85", TYPO_BODY_SM)}>
                No notifications yet
              </p>
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
  