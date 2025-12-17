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
      {/* Statistics Cards */}
      <StaffStatistics employees={employees} onAddEmployee={handleAddEmployee} />

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-white border border-gray-200 rounded-xl p-1">
          <TabsTrigger 
            value="employees"
            className="rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-info-500 data-[state=active]:to-info-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            Quản lý Nhân viên
          </TabsTrigger>
          <TabsTrigger 
            value="roles"
            className="rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-info-500 data-[state=active]:to-info-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold"
          >
            Quản lý Vai trò
          </TabsTrigger>
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
