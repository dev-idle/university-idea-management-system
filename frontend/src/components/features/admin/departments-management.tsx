"use client";

import { useState } from "react";
import { Can } from "@/components/ui/can";
import { Button } from "@/components/ui/button";
import {
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/hooks/use-departments";
import { CreateDepartmentForm } from "./create-department-form";
import { UpdateDepartmentForm } from "./update-department-form";

export function DepartmentsManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: departments, status, error, isFetching } = useDepartmentsQuery();
  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();

  if (status === "error") {
    throw error;
  }

  return (
    <div className="space-y-6">
      <Can permission="DEPARTMENTS">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {departments ? `${departments.length} department(s)` : "Loading…"}
          </span>
          <Button onClick={() => setShowCreate((v) => !v)} variant="default">
            {showCreate ? "Cancel" : "Add department"}
          </Button>
        </div>
      </Can>

      {showCreate && (
        <Can permission="DEPARTMENTS">
          <CreateDepartmentForm
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
            mutateAsync={createMutation.mutateAsync}
            error={createMutation.error ?? null}
          />
        </Can>
      )}

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        {status === "pending" && !departments ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            Loading departments…
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 font-medium text-foreground">Name</th>
                <Can permission="DEPARTMENTS">
                  <th className="p-4 font-medium text-foreground">Actions</th>
                </Can>
              </tr>
            </thead>
            <tbody>
              {!departments || departments.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No departments yet.
                  </td>
                </tr>
              ) : (
                departments.map((d) =>
                  editingId === d.id ? (
                    <tr key={d.id} className="border-b border-border">
                      <td colSpan={2} className="p-4">
                        <UpdateDepartmentForm
                          department={d}
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
                      key={d.id}
                      className={`border-b border-border last:border-0 ${isFetching ? "opacity-70" : ""}`}
                    >
                      <td className="p-4 font-medium text-foreground">
                        {d.name}
                      </td>
                      <Can permission="DEPARTMENTS">
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(d.id)}
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
