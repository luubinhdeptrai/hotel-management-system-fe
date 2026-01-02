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

// Role colors for modern styling
const ROLE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  "Admin": { bg: "from-purple-500 to-purple-600", text: "text-purple-600", accent: "purple" },
  "Quản lý": { bg: "from-primary-500 to-primary-600", text: "text-primary-600", accent: "primary" },
  "Lễ tân": { bg: "from-info-500 to-info-600", text: "text-info-600", accent: "info" },
  "Phục vụ": { bg: "from-warning-500 to-warning-600", text: "text-warning-600", accent: "warning" },
};

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
        {/* Roles Overview - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => {
            const rolePermissions = getRolePermissions(role);
            const colors = ROLE_COLORS[role.roleName] || ROLE_COLORS["Phục vụ"];
            
            return (
              <Card key={role.roleId} className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-${colors.accent}-200 hover:shadow-xl transition-all duration-300">
                {/* Gradient Background */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-linear-to-r ${colors.bg}`}></div>
                
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${colors.bg} flex items-center justify-center text-white shadow-lg`}>
                        <span className="w-6 h-6">{ICONS.SHIELD}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{role.roleName}</CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5">Vai trò hệ thống</p>
                      </div>
                    </div>
                    {onUpdateRolePermissions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        className={`h-9 w-9 p-0 hover:bg-${colors.accent}-50 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <span className="w-4 h-4">{ICONS.EDIT}</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {role.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Quyền hạn:</span>
                    <Badge className={`bg-linear-to-r ${colors.bg} text-white border-0 font-semibold px-3 py-1 shadow-md`}>
                      {rolePermissions.length} quyền
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Permissions Matrix */}
        <Card className="rounded-2xl border-2 border-gray-100 shadow-lg overflow-hidden">
          <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b-2 border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-linear-to-br from-info-500 to-info-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <span className="w-5 h-5">{ICONS.SETTINGS}</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Ma trận phân quyền</div>
                <p className="text-sm text-gray-500 font-normal mt-0.5">Quản lý quyền truy cập cho từng vai trò</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <TableHead className="font-bold text-gray-900 w-1/4 py-4 sticky left-0 bg-linear-to-r from-gray-50 to-gray-100 z-10">
                      Chức năng
                    </TableHead>
                    {roles.map((role) => {
                      const colors = ROLE_COLORS[role.roleName] || ROLE_COLORS["Phục vụ"];
                      return (
                        <TableHead
                          key={role.roleId}
                          className="font-bold text-center py-4 min-w-[120px]"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${colors.bg} flex items-center justify-center text-white shadow-md`}>
                              <span className="w-5 h-5">{ICONS.SHIELD}</span>
                            </div>
                            <span className={colors.text}>{role.roleName}</span>
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(permissionsByModule).map(
                    ([module, modulePermissions], moduleIndex) => (
                      <Fragment key={module}>
                        {/* Module Header */}
                        <TableRow className="border-t-2 border-gray-200">
                          <TableCell
                            colSpan={roles.length + 1}
                            className="bg-linear-to-r from-info-50 to-info-100/50 font-bold text-info-900 py-3 sticky left-0 z-10"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-linear-to-br from-info-500 to-info-600 rounded-lg flex items-center justify-center text-white">
                                <span className="text-xs font-bold">{moduleIndex + 1}</span>
                              </div>
                              {module}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Permissions */}
                        {modulePermissions.map((permission, permIndex) => (
                          <TableRow 
                            key={permission.permissionId}
                            className="hover:bg-linear-to-r hover:from-gray-50 hover:to-transparent transition-colors border-b border-gray-100"
                          >
                            <TableCell className="sticky left-0 bg-white hover:bg-gray-50 z-10 py-4">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 mt-0.5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs font-semibold shrink-0">
                                  {permIndex + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {permission.permissionName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            {roles.map((role) => (
                              <TableCell
                                key={`${role.roleId}-${permission.permissionId}`}
                                className="text-center py-4"
                              >
                                {role.permissions.includes(
                                  permission.permissionId
                                ) ? (
                                  <div className="flex justify-center">
                                    <div className="w-7 h-7 rounded-xl bg-linear-to-br from-success-500 to-success-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                                      <span className="w-4 h-4 flex items-center justify-center">{ICONS.CHECK}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                      <span className="text-sm font-bold flex items-center justify-center">−</span>
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
            <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-t-2 border-gray-100">
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-linear-to-br from-success-500 to-success-600 text-white flex items-center justify-center shadow-md">
                    <span className="w-4 h-4">{ICONS.CHECK}</span>
                  </div>
                  <span className="font-medium text-gray-700">Có quyền</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                    <span className="text-sm font-bold">−</span>
                  </div>
                  <span className="font-medium text-gray-700">Không có quyền</span>
                </div>
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
