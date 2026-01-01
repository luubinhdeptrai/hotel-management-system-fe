"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmployeeFormModal,
  AccountFormModal,
  EmployeeDetailsModal,
  RoleManagement,
  StaffStatistics,
  EmployeesTab,
} from "@/components/staff";
import { useStaffPage } from "@/hooks/use-staff-page";
import { useRoleManagement } from "@/hooks/use-role-management";
import { mockRoles, mockPermissions } from "@/lib/mock-employees";
import { Role } from "@/lib/types/employee";

export default function StaffPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const {
    employees,
    filteredEmployees,
    loading,
    activeTab,
    setActiveTab,
    filters,
    updateFilter,
    clearFilters,
    hasFilters,
    employeeFormOpen,
    setEmployeeFormOpen,
    accountFormOpen,
    setAccountFormOpen,
    detailsModalOpen,
    setDetailsModalOpen,
    selectedEmployee,
    loadEmployees,
    handleAddEmployee,
    handleEditEmployee,
    handleViewDetails,
    handleCreateAccount,
    handleSaveEmployee,
    handleSaveAccount,
    handleDeactivate,
  } = useStaffPage();

  const { updateRolePermissions } = useRoleManagement(setRoles);

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhân viên</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin nhân viên, tài khoản và phân quyền</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
          <TabsTrigger value="accounts">Tài khoản</TabsTrigger>
          <TabsTrigger value="roles">Vai trò & Quyền</TabsTrigger>
          <TabsTrigger value="statistics">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeesTab
            employees={filteredEmployees}
            loading={loading}
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            hasFilters={hasFilters}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onViewDetails={handleViewDetails}
            onDeactivate={handleDeactivate}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý Tài khoản</CardTitle>
                <CardDescription>Tạo, chỉnh sửa và quản lý tài khoản nhân viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-sm text-gray-500">{employee.position}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateAccount(employee)}
                      >
                        {employee.account ? "Sửa tài khoản" : "Tạo tài khoản"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement roles={roles} permissions={mockPermissions} onUpdate={updateRolePermissions} />
        </TabsContent>

        <TabsContent value="statistics">
          <StaffStatistics employees={employees} loading={loading} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EmployeeFormModal
        open={employeeFormOpen}
        onOpenChange={setEmployeeFormOpen}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />

      <AccountFormModal
        open={accountFormOpen}
        onOpenChange={setAccountFormOpen}
        employee={selectedEmployee}
        onSave={handleSaveAccount}
      />

      <EmployeeDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
