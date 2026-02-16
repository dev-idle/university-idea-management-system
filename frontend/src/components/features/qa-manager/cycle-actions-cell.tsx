"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SubmissionCycle } from "@/lib/schemas/submission-cycles.schema";
import { cn } from "@/lib/utils";
import {
  ACTION_BUTTON_DISABLED_BLUR_CLASS,
  ACTION_BUTTON_DESTRUCTIVE_CLASS,
  ACTION_BUTTON_EDIT_CLASS,
  ACTION_BUTTON_LOCK_CLASS,
  ACTION_BUTTON_MUTED_CLASS,
  ACTION_BUTTON_SUCCESS_CLASS,
  ACTION_BUTTON_WARNING_CLASS,
  TABLE_ACTIONS_WRAPPER_CLASS,
} from "@/components/features/admin/constants";
import { Lock, LockOpen, Pencil, CircleCheck, CircleX, Trash2 } from "lucide-react";

/** Minimal mutation shape for actions that take cycle id. */
type IdMutationLike = {
  isPending: boolean;
  mutate: (id: string) => void;
  reset: () => void;
};

/** Update only needs isPending/reset; Edit opens dialog, form calls mutate. */
type UpdateMutationLike = Pick<IdMutationLike, "isPending" | "reset">;

function getWasEverClosed(c: SubmissionCycle): boolean {
  return c.wasEverClosed === true;
}

function getIdeaCount(c: SubmissionCycle): number {
  return c._count?.ideas ?? 0;
}

function canLock(c: SubmissionCycle): boolean {
  return (
    c.status === "CLOSED" ||
    (c.status === "DRAFT" && getIdeaCount(c) >= 1) ||
    (c.status === "ACTIVE" && getWasEverClosed(c) && getIdeaCount(c) >= 1)
  );
}

function isDisplayClosed(c: SubmissionCycle): boolean {
  const now = new Date();
  const interactionCloses = new Date(c.interactionClosesAt);
  const ideaCount = getIdeaCount(c);

  if (c.status === "DRAFT") return ideaCount >= 1;
  if (c.status === "ACTIVE") {
    if (now >= interactionCloses) return ideaCount >= 1;
  }
  if (c.status === "CLOSED") return ideaCount >= 1;
  return false;
}

export interface CycleActionsCellProps {
  cycle: SubmissionCycle;
  cycles: SubmissionCycle[] | undefined;
  onEdit: (c: SubmissionCycle) => void;
  onDeactivateConfirm: (c: SubmissionCycle) => void;
  onDeleteConfirm: (c: SubmissionCycle) => void;
  activateMutation: IdMutationLike;
  deactivateMutation: IdMutationLike;
  lockMutation: IdMutationLike;
  unlockMutation: IdMutationLike;
  deleteMutation: IdMutationLike;
  updateMutation: UpdateMutationLike;
}

function ActionBtn({
  label,
  tooltip,
  icon: Icon,
  className,
  disabled,
  onClick,
  asSpan,
}: {
  label: string;
  tooltip: string;
  icon: React.ElementType;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  asSpan?: boolean;
}) {
  const btn = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("size-8", className)}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  );
  const wrapped = asSpan ? <span className="inline-flex shrink-0">{btn}</span> : btn;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function CycleActionsCellInner({
  cycle: c,
  cycles,
  onEdit,
  onDeactivateConfirm,
  onDeleteConfirm,
  activateMutation,
  deactivateMutation,
  lockMutation,
  unlockMutation,
  deleteMutation,
  updateMutation,
}: CycleActionsCellProps) {
  const interactionStillOpen = () => new Date(c.interactionClosesAt) > new Date();
  const canActivate = () =>
    c.status === "DRAFT" &&
    c.academicYear?.isActive === true &&
    interactionStillOpen() &&
    !cycles?.some((x) => x.id !== c.id && x.status === "ACTIVE");
  const canReactivate = () =>
    (c.status === "CLOSED" || (c.status === "DRAFT" && getIdeaCount(c) >= 1)) &&
    c.academicYear?.isActive === true &&
    interactionStillOpen() &&
    !cycles?.some((x) => x.id !== c.id && x.status === "ACTIVE");

  const getActivateTooltipDraft = () => {
    if (!interactionStillOpen()) return "Interaction period ended";
    if (!c.academicYear?.isActive) return "Academic year inactive";
    if (cycles?.some((x) => x.id !== c.id && x.status === "ACTIVE"))
      return "Another cycle active";
    return "Activate";
  };
  const getActivateTooltipReactivate = () => {
    if (c.isLocked) return "Unlock to proceed";
    if (canReactivate()) return "Activate";
    if (!interactionStillOpen()) return "Interaction period ended";
    if (!c.academicYear?.isActive) return "Academic year inactive";
    return "Another cycle active";
  };

  const lockedEditClass = c.isLocked ? ACTION_BUTTON_DISABLED_BLUR_CLASS : ACTION_BUTTON_EDIT_CLASS;

  // --- Display Closed block: Edit, Activate (or "Already active"), Lock ---
  if (isDisplayClosed(c)) {
    if (canLock(c)) {
      return (
        <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
          <ActionBtn
            label="Edit cycle"
            tooltip={c.isLocked ? "Unlock to edit" : "Edit"}
            icon={Pencil}
            className={lockedEditClass}
            disabled={c.isLocked || updateMutation.isPending}
            onClick={() => !c.isLocked && onEdit(c)}
            asSpan
          />
          {c.status === "ACTIVE" ? (
            <ActionBtn
              label="Activate cycle"
              tooltip="Currently active"
              icon={CircleCheck}
              className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
              disabled
              asSpan
            />
          ) : (
            <ActionBtn
              label="Activate cycle"
              tooltip={
                c.isLocked
                  ? "Unlock to proceed"
                  : canReactivate()
                    ? "Activate"
                    : getActivateTooltipReactivate()
              }
              icon={CircleCheck}
              className={
                !c.isLocked && canReactivate()
                  ? ACTION_BUTTON_SUCCESS_CLASS
                  : ACTION_BUTTON_DISABLED_BLUR_CLASS
              }
              disabled={c.isLocked || activateMutation.isPending || !canReactivate()}
              onClick={() =>
                !c.isLocked && canReactivate() && activateMutation.mutate(c.id)
              }
              asSpan
            />
          )}
          {c.isLocked ? (
            <ActionBtn
              label="Unlock cycle"
              tooltip="Unlock"
              icon={LockOpen}
              className={ACTION_BUTTON_MUTED_CLASS}
              disabled={unlockMutation.isPending}
              onClick={() => unlockMutation.mutate(c.id)}
            />
          ) : (
            <ActionBtn
              label="Lock cycle"
              tooltip="Lock"
              icon={Lock}
              className={ACTION_BUTTON_LOCK_CLASS}
              disabled={lockMutation.isPending}
              onClick={() => lockMutation.mutate(c.id)}
            />
          )}
        </div>
      );
    }

    // Display Closed, ACTIVE !wasEverClosed: Edit, Deactivate, Lock (disabled). When Closed status appears, use Lock not Delete.
    return (
      <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
        <ActionBtn
          label="Edit cycle"
          tooltip="Edit"
          icon={Pencil}
          className={ACTION_BUTTON_EDIT_CLASS}
          onClick={() => onEdit(c)}
        />
        <ActionBtn
          label="Deactivate cycle"
          tooltip="Deactivate"
          icon={CircleX}
          className={ACTION_BUTTON_WARNING_CLASS}
          disabled={deactivateMutation.isPending}
          onClick={() => {
            deactivateMutation.reset();
            onDeactivateConfirm(c);
          }}
        />
        <ActionBtn
          label="Lock (available when cycle closes)"
          tooltip="Available after closure"
          icon={Lock}
          className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
          disabled
          asSpan
        />
      </div>
    );
  }

  // --- Display Active block ---
  const isDraft = c.status === "DRAFT";
  const isActive = c.status === "ACTIVE";
  const showLockForActive = isActive && canLock(c);
  const activeHasIdeas = isActive && getIdeaCount(c) >= 1;

  return (
    <div className={TABLE_ACTIONS_WRAPPER_CLASS}>
      {/* Slot 1: Edit */}
      <ActionBtn
        label={isDraft || isActive ? "Edit cycle" : "Edit"}
        tooltip="Edit"
        icon={Pencil}
        className={isDraft || isActive ? ACTION_BUTTON_EDIT_CLASS : ACTION_BUTTON_DISABLED_BLUR_CLASS}
        disabled={!(isDraft || isActive)}
        onClick={() => (isDraft || isActive) && onEdit(c)}
        asSpan={!(isDraft || isActive)}
      />

      {/* Slot 2: Activate or Deactivate */}
      {isDraft ? (
        <ActionBtn
          label="Activate cycle"
          tooltip={canActivate() ? "Activate" : getActivateTooltipDraft()}
          icon={CircleCheck}
          className={canActivate() ? ACTION_BUTTON_SUCCESS_CLASS : ACTION_BUTTON_DISABLED_BLUR_CLASS}
          disabled={activateMutation.isPending || !canActivate()}
          onClick={() => canActivate() && activateMutation.mutate(c.id)}
          asSpan
        />
      ) : isActive ? (
        <ActionBtn
          label="Deactivate cycle"
          tooltip="Deactivate"
          icon={CircleX}
          className={ACTION_BUTTON_WARNING_CLASS}
          disabled={c.isLocked || deactivateMutation.isPending}
          onClick={() => {
            if (c.isLocked) return;
            deactivateMutation.reset();
            onDeactivateConfirm(c);
          }}
        />
      ) : (
        <ActionBtn
          label="Activate"
          tooltip="Activate"
          icon={CircleCheck}
          className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
          disabled
          asSpan
        />
      )}

      {/* Slot 3: DRAFT with ideas → Lock (disabled, deactivate first to lock). DRAFT no ideas → Delete. ACTIVE reactivated → Lock. */}
      {isDraft ? (
        getIdeaCount(c) >= 1 ? (
          <ActionBtn
            label="Lock"
            tooltip="Requires closure first"
            icon={Lock}
            className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
            disabled
            asSpan
          />
        ) : (
          <ActionBtn
            label="Delete cycle"
            tooltip="Delete"
            icon={Trash2}
            className={ACTION_BUTTON_DESTRUCTIVE_CLASS}
            disabled={deleteMutation.isPending}
            onClick={() => {
              deleteMutation.reset();
              onDeleteConfirm(c);
            }}
            asSpan
          />
        )
      ) : isActive ? (
        activeHasIdeas ? (
          showLockForActive ? (
            c.isLocked ? (
              <ActionBtn
                label="Unlock cycle"
                tooltip="Unlock"
                icon={LockOpen}
                className={ACTION_BUTTON_MUTED_CLASS}
                disabled={unlockMutation.isPending}
                onClick={() => unlockMutation.mutate(c.id)}
              />
            ) : (
              <ActionBtn
                label="Lock cycle"
                tooltip="Lock"
                icon={Lock}
                className={ACTION_BUTTON_LOCK_CLASS}
                disabled={lockMutation.isPending}
                onClick={() => lockMutation.mutate(c.id)}
              />
            )
          ) : (
            <ActionBtn
              label="Lock cycle"
              tooltip="Requires closure first"
              icon={Lock}
              className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
              disabled
              asSpan
            />
          )
        ) : (
          <ActionBtn
            label="Delete cycle"
            tooltip="Deactivate to proceed"
            icon={Trash2}
            className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
            disabled
            asSpan
          />
        )
      ) : (
        <ActionBtn
          label="Lock"
          tooltip="Lock"
          icon={Lock}
          className={ACTION_BUTTON_DISABLED_BLUR_CLASS}
          disabled
          asSpan
        />
      )}
    </div>
  );
}

export const CycleActionsCell = memo(CycleActionsCellInner);
