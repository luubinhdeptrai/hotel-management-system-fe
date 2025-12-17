"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Role, Permission } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";

interface RolePermissionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  allPermissions: Permission[];
  onSave: (roleId: string, permissionIds: string[]) => Promise<void>;
}

export function RolePermissionEditModal({
  open,
  onOpenChange,
  role,
  allPermissions,
  onSave,
}: RolePermissionEditModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  useEffect(() => {
    if (open && role) {
      setTimeout(() => {
        setSelectedPermissions([...role.permissions]);
        setError("");
      }, 0);
    }
  }, [open, role]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModule = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map((p) => p.permissionId);
    const allSelected = modulePermissionIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      // Deselect all in this module
      setSelectedPermissions((prev) =>
        prev.filter((id) => !modulePermissionIds.includes(id))
      );
    } else {
      // Select all in this module
      setSelectedPermissions((prev) => [
        ...prev.filter((id) => !modulePermissionIds.includes(id)),
        ...modulePermissionIds,
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPermissions.length === 0) {
      setError("Vui lòng chọn ít nhất một quyền cho vai trò này");
      return;
    }

    if (!role) return;

    setIsSubmitting(true);
    setError("");

    try {
      await onSave(role.roleId, selectedPermissions);
      onOpenChange(false);
    } catch {
      setError("Có lỗi xảy ra khi cập nhật quyền");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa quyền - {role.roleName}</DialogTitle>
          <DialogDescription>{role.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <div className="flex items-center gap-2">
                {ICONS.ALERT}
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {Object.entries(permissionsByModule).map(
                ([module, modulePermissions]) => {
                  const allSelected = modulePermissions.every((p) =>
                    selectedPermissions.includes(p.permissionId)
                  );

                  return (
                    <div
                      key={module}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      {/* Module Header with Select All */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900">
                          {module}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModule(modulePermissions)}
                          className="text-xs"
                        >
                          {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </Button>
                      </div>

                      {/* Permissions */}
                      <div className="space-y-2">
                        {modulePermissions.map((permission) => {
                          const isChecked = selectedPermissions.includes(
                            permission.permissionId
                          );

                          return (
                            <label
                              key={permission.permissionId}
                              htmlFor={permission.permissionId}
                              className={`flex items-start space-x-3 p-3 rounded-md border transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-primary-50 border-primary-300 hover:bg-primary-100"
                                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                              }`}
                            >
                              <Checkbox
                                id={permission.permissionId}
                                checked={isChecked}
                                onCheckedChange={() =>
                                  togglePermission(permission.permissionId)
                                }
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={permission.permissionId}
                                  className="font-medium cursor-pointer text-gray-900"
                                >
                                  {permission.permissionName}
                                </Label>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {permission.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-gray-600">
                Đã chọn:{" "}
                <span className="font-medium">
                  {selectedPermissions.length}
                </span>{" "}
                / {allPermissions.length} quyền
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || selectedPermissions.length === 0}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
