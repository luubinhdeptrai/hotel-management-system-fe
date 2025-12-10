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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý Nhân Viên
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin nhân viên và phân quyền hệ thống
        </p>
      </div>

      {/* Statistics Cards */}
      <StaffStatistics employees={employees} />

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="employees">Quản lý Nhân viên</TabsTrigger>
          <TabsTrigger value="roles">Quản lý Vai trò</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-6">
          <EmployeesTab
            employees={filteredEmployees}
            loading={loading}
            searchQuery={filters.searchQuery}
            statusFilter={filters.statusFilter}
            accountFilter={filters.accountFilter}
            hasFilters={hasFilters}
            onSearchChange={(value) => updateFilter("searchQuery", value)}
            onStatusChange={(value) => updateFilter("statusFilter", value)}
            onAccountChange={(value) => updateFilter("accountFilter", value)}
            onClearFilters={clearFilters}
            onAddEmployee={handleAddEmployee}
            onEdit={handleEditEmployee}
            onCreateAccount={handleCreateAccount}
            onDeactivate={handleDeactivate}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <RoleManagement
            roles={roles}
            permissions={mockPermissions}
            onUpdateRolePermissions={updateRolePermissions}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EmployeeFormModal
        open={employeeFormOpen}
        onOpenChange={setEmployeeFormOpen}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />

      {selectedEmployee && (
        <AccountFormModal
          open={accountFormOpen}
          onOpenChange={setAccountFormOpen}
          employee={selectedEmployee}
          onSave={handleSaveAccount}
        />
      )}

      <EmployeeDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
