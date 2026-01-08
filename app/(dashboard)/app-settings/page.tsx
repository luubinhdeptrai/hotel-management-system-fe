/**
 * App Settings Page
 * Manage application-wide settings including check-in/out times and deposit percentage
 */

"use client";

import { LogIn, LogOut, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeSettingsCard } from "@/components/app-settings/time-settings-card";
import { DepositSettingsCard } from "@/components/app-settings/deposit-settings-card";
import { useAppSettings } from "@/hooks/use-app-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AppSettingsPage() {
  const {
    checkInTime,
    checkOutTime,
    depositPercentage,
    loading,
    error,
    loadSettings,
    updateCheckInTime,
    updateCheckOutTime,
    updateDepositPercentage,
  } = useAppSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Cài đặt Hệ thống
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Quản lý cấu hình ứng dụng khách sạn
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadSettings}
            disabled={loading}
            className="gap-2 px-6 py-6 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Settings Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Check-in Time Settings */}
          <TimeSettingsCard
            title="Thời gian Check-in"
            description="Cấu hình thời gian check-in tiêu chuẩn"
            icon={<LogIn className="h-5 w-5" />}
            color="green"
            config={checkInTime}
            onUpdate={updateCheckInTime}
            loading={loading}
          />

          {/* Check-out Time Settings */}
          {checkOutTime && (
            <TimeSettingsCard
              title="Thời gian Check-out"
              description="Cấu hình thời gian check-out tiêu chuẩn"
              icon={<LogOut className="h-5 w-5" />}
              color="orange"
              config={checkOutTime}
              onUpdate={updateCheckOutTime}
              loading={loading}
            />
          )}
        </div>

        {/* Deposit Percentage Settings */}
        <DepositSettingsCard
          depositPercentage={depositPercentage}
          onUpdate={updateDepositPercentage}
          loading={loading}
        />

        {/* Info Section */}
        <div className="grid gap-4 md:grid-cols-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="group relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-default">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl transition-opacity duration-300" />
            
            <div className="relative space-y-3">
              <div className="p-3 w-fit bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl shadow-lg group-hover:shadow-emerald-500/50 group-hover:scale-110 transition-all duration-300">
                <LogIn className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-green-900 dark:text-green-100">Check-in</h3>
              <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                Thời gian check-in tiêu chuẩn được áp dụng cho tất cả booking. Thời gian chờ cho phép khách đến sớm mà không bị tính phí.
              </p>
            </div>
          </div>

          <div className="group relative p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-200 dark:border-orange-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-default">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl transition-opacity duration-300" />
            
            <div className="relative space-y-3">
              <div className="p-3 w-fit bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
                <LogOut className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-orange-900 dark:text-orange-100">Check-out</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                Thời gian check-out tiêu chuẩn được áp dụng cho tất cả booking. Thời gian chờ cho phép khách ở thêm mà không bị tính phí.
              </p>
            </div>
          </div>

          <div className="group relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-default">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl transition-opacity duration-300" />
            
            <div className="relative space-y-3">
              <div className="p-3 w-fit bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">Đặt cọc</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Tỷ lệ phần trăm đặt cọc được tính tự động dựa trên tổng giá trị booking. Khách phải thanh toán đặt cọc để xác nhận booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
