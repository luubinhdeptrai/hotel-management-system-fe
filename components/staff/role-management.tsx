"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role, Permission } from "@/lib/types/employee";
import { ICONS } from "@/src/constants/icons.enum";
import { RolePermissionEditModal } from "./role-permission-edit-modal";

interface RoleManagementProps {
  roles: Role[];
  permissions: Permission[];
  onUpdateRolePermissions?: (
    roleId: string,
    permissionIds: string[]
  ) => Promise<void>;
}

export function RoleManagement({
  roles,
  permissions,
  onUpdateRolePermissions,
}: RoleManagementProps) {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getRolePermissions = (role: Role) => {
    return permissions.filter((p) => role.permissions.includes(p.permissionId));
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditModalOpen(true);
  };

  const handleSavePermissions = async (
    roleId: string,
    permissionIds: string[]
  ) => {
    if (onUpdateRolePermissions) {
      await onUpdateRolePermissions(roleId, permissionIds);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Roles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => {
            const rolePermissions = getRolePermissions(role);
            return (
              <Card key={role.roleId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.roleName}</CardTitle>
                    {onUpdateRolePermissions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        className="h-8 w-8 p-0"
                      >
                        {ICONS.EDIT}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    {role.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Quyền hạn:</span>
                    <Badge className="bg-primary-100 text-primary-700 border-0">
                      {rolePermissions.length} quyền
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {ICONS.SETTINGS}
              Ma trận phân quyền
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold w-1/4">
                      Chức năng
                    </TableHead>
                    {roles.map((role) => (
                      <TableHead
                        key={role.roleId}
                        className="font-semibold text-center"
                      >
                        {role.roleName}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(permissionsByModule).map(
                    ([module, modulePermissions]) => (
                      <Fragment key={module}>
                        {/* Module Header */}
                        <TableRow>
                          <TableCell
                            colSpan={roles.length + 1}
                            className="bg-gray-50 font-semibold text-gray-900"
                          >
                            {module}
                          </TableCell>
                        </TableRow>

                        {/* Permissions */}
                        {modulePermissions.map((permission) => (
                          <TableRow key={permission.permissionId}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {permission.permissionName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                            </TableCell>
                            {roles.map((role) => (
                              <TableCell
                                key={`${role.roleId}-${permission.permissionId}`}
                                className="text-center"
                              >
                                {role.permissions.includes(
                                  permission.permissionId
                                ) ? (
                                  <div className="flex justify-center">
                                    <div className="w-5 h-5 rounded-full bg-success-500 text-white flex items-center justify-center">
                                      {ICONS.CHECK}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                                      <span className="text-xs">−</span>
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </Fragment>
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-success-500 text-white flex items-center justify-center">
                  {ICONS.CHECK}
                </div>
                <span>Có quyền</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                  <span className="text-xs">−</span>
                </div>
                <span>Không có quyền</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Permission Edit Modal */}
      <RolePermissionEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        role={editingRole}
        allPermissions={permissions}
        onSave={handleSavePermissions}
      />
    </>
  );
}
