"use client";

import { useState } from "react";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import {
  useAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
} from "@/hooks/use-academic-years";
import type { AcademicYear } from "@/lib/schemas/academic-years.schema";
import { CreateAcademicYearForm } from "./create-academic-year-form";
import { UpdateAcademicYearForm } from "./update-academic-year-form";
import { cn } from "@/lib/utils";

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AcademicYearsManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: years, status, error, isFetching } = useAcademicYearsQuery();
  const createMutation = useCreateAcademicYearMutation();
  const updateMutation = useUpdateAcademicYearMutation();

  if (status === "error") {
    throw error;
  }

  const setActive = (year: AcademicYear) => {
    if (year.isActive) return;
    updateMutation.mutate({ id: year.id, body: { isActive: true } });
  };

  return (
    <div className="space-y-6">
      <Can permission="ACADEMIC_YEARS">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {years ? `${years.length} academic year(s). Exactly one can be active.` : "Loading…"}
          </span>
          <Button onClick={() => setShowCreate((v) => !v)} variant="default">
            {showCreate ? "Cancel" : "Add academic year"}
          </Button>
        </div>
      </Can>

      {showCreate && (
        <Can permission="ACADEMIC_YEARS">
          <CreateAcademicYearForm
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
            mutateAsync={createMutation.mutateAsync}
            error={createMutation.error ?? null}
          />
        </Can>
      )}

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {status === "pending" && !years ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            Loading academic years…
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 font-medium text-foreground">Name</th>
                <th className="p-4 font-medium text-foreground">Start</th>
                <th className="p-4 font-medium text-foreground">End</th>
                <th className="p-4 font-medium text-foreground">Active</th>
                <Can permission="ACADEMIC_YEARS">
                  <th className="p-4 font-medium text-foreground">Actions</th>
                </Can>
              </tr>
            </thead>
            <tbody>
              {!years || years.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No academic years yet.
                  </td>
                </tr>
              ) : (
                years.map((y) =>
                  editingId === y.id ? (
                    <tr key={y.id} className="border-b border-border">
                      <td colSpan={5} className="p-4">
                        <UpdateAcademicYearForm
                          academicYear={y}
                          onSuccess={() => setEditingId(null)}
                          onCancel={() => setEditingId(null)}
                          isPending={updateMutation.isPending}
                          mutateAsync={updateMutation.mutateAsync}
                          error={updateMutation.error ?? null}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={y.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        isFetching && "opacity-70"
                      )}
                    >
                      <td className="p-4 font-medium text-foreground">{y.name}</td>
                      <td className="p-4 text-muted-foreground">
                        {formatDate(y.startDate)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {y.endDate ? formatDate(y.endDate) : "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            y.isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {y.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <Can permission="ACADEMIC_YEARS">
                        <td className="p-4 flex gap-2">
                          {!y.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActive(y)}
                              disabled={updateMutation.isPending}
                            >
                              Set active
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(y.id)}
                          >
                            Edit
                          </Button>
                        </td>
                      </Can>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
