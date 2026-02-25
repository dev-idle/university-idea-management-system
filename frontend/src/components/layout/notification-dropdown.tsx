"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  type Notification,
} from "@/hooks/use-notifications";
import {
  HOVER_TRANSITION_NAV,
  TYPO_BODY_SM,
  TYPO_CAPTION,
  MGMT_BORDER_DIVIDER,
  MGMT_BG_TOOLBAR,
  MGMT_BG_ROW_HOVER,
  MGMT_BORDER_ROW,
} from "@/config/design";
import { LoadingState } from "@/components/ui/loading-state";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

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

const HEADER_ICON_CLASS =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
        "w-full text-left border-b px-4 py-3 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl last:border-b-0",
        MGMT_BORDER_ROW,
        MGMT_BG_ROW_HOVER,
        !item.isRead && "bg-primary/[0.03]"
      )}
    >
      <p
        className={cn(
          "line-clamp-2",
          item.isRead ? TYPO_BODY_SM : "text-sm font-medium text-foreground/92"
        )}
      >
        {item.message}
      </p>
      <span className={cn("mt-1 block", TYPO_CAPTION)}>
        {formatRelativeTime(item.createdAt)}
      </span>
    </button>
  );
}

interface NotificationDropdownProps {
  /** Staff: pill group. Management: single icon. */
  variant?: "pill" | "standalone";
}

export function NotificationDropdown({ variant = "standalone" }: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: notifications, isLoading } = useNotificationsQuery({
    enabled: open,
  });
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const markAsRead = useMarkAsReadMutation();

  const handleNavigate = (link: string | null) => {
    setOpen(false);
    const path = getNavigatePath(link);
    if (!path) return;
    if (path.startsWith("/")) {
      router.push(path);
    } else {
      window.location.href = path;
    }
  };

  const triggerContent = (
    <span
      className={cn(
        HEADER_ICON_CLASS,
        HOVER_TRANSITION_NAV,
        "relative text-muted-foreground/55 hover:text-foreground/80",
        open && "text-foreground/90"
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="size-[16.3px]" aria-hidden />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute right-0 top-0 flex items-center justify-center rounded-full bg-primary text-[10px] font-semibold leading-none text-primary-foreground",
            unreadCount > 9 ? "min-w-[1.125rem] px-1 py-0.5" : "size-4"
          )}
          aria-hidden
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "cursor-pointer",
                variant === "pill" &&
                  "flex size-8 shrink-0 items-center justify-center rounded-lg"
              )}
            >
              {triggerContent}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" sideOffset={8} className="w-[360px] p-0">
        <div
          className={cn(
            "border-b px-4 py-3",
            MGMT_BORDER_DIVIDER,
            MGMT_BG_TOOLBAR
          )}
        >
          <h3 className="text-sm font-semibold text-foreground/95">
            Notifications
          </h3>
        </div>
        <ScrollArea className="max-h-[min(320px,60vh)]">
          {isLoading ? (
            <div className="flex min-h-[8rem] items-center justify-center py-8">
              <LoadingState compact />
            </div>
          ) : !notifications?.length ? (
            <div
              className={cn(
                "flex min-h-[8rem] flex-col items-center justify-center gap-1 px-4 py-8",
                TYPO_BODY_SM
              )}
            >
              No notifications yet
            </div>
          ) : (
            <div className="py-1">
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
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
