/**
 * Deposit Settings Card Component
 * Manages deposit percentage configuration
 * Beautiful, animated, and vibrant design
 */

"use client";

import { useState } from "react";
import { Percent, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { UpdateDepositPercentageRequest } from "@/lib/types/app-settings";

interface DepositSettingsCardProps {
  depositPercentage: number | null;
  onUpdate: (config: UpdateDepositPercentageRequest) => Promise<any>;
  loading: boolean;
}

export function DepositSettingsCard({
  depositPercentage,
  onUpdate,
  loading,
}: DepositSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [percentage, setPercentage] = useState(depositPercentage ?? 50);
  const [inputValue, setInputValue] = useState(String(depositPercentage ?? 50));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    const initial = depositPercentage ?? 50;
    setPercentage(initial);
    setInputValue(String(initial));
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // revert any unsaved changes
    const original = depositPercentage ?? 50;
    setPercentage(original);
    setInputValue(String(original));
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onUpdate({ percentage });
      setIsEditing(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật tỷ lệ đặt cọc";
      setError(errorMsg);
      console.error("Failed to save deposit percentage:", err);
    } finally {
      setSaving(false);
    }
  };

  if (depositPercentage === null) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Tỷ lệ Đặt cọc
          </CardTitle>
          <CardDescription>
            Cấu hình tỷ lệ phần trăm đặt cọc cho booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  const depositAmount = ((percentage / 100) * 1000000);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden col-span-full">
      {/* Gradient background */}
      <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl opacity-40 -z-0`} />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg`}>
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold">Tỷ lệ Đặt cọc</div>
              <CardDescription className="text-xs mt-0.5">Cấu hình tỷ lệ phần trăm đặt cọc cho booking</CardDescription>
            </div>
          </span>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              disabled={loading}
               className="hover:bg-accent transition-colors z-10"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              ⚠️ {error}
            </p>
          </div>
        )}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Main Percentage Display */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 border border-blue-200 dark:border-blue-800 p-8 transition-transform duration-300 hover:scale-105`}>
              <div className="absolute inset-0 opacity-30">
                <div className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-bl from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl`} />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3`}>
                    💰 Tỷ lệ Đặt cọc Hiện tại
                  </p>
                  <p className={`text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent`}>
                    {percentage}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
                    Áp dụng cho mọi booking mới
                  </p>
                </div>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-2xl`} />
                  <div className={`relative p-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl`}>
                    <Percent className="h-12 w-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Amount Example */}
            <div className={`rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800 p-6 space-y-3`}>
              <div className={`inline-block px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider`}>
                📊 Ví Dụ Tính Toán
              </div>
              <div className="space-y-2">
                <p className={`text-sm text-emerald-600 dark:text-emerald-400`}>
                  Với booking <span className="font-bold">1.000.000đ</span>, khách cần đặt cọc:
                </p>
                <p className={`text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent`}>
                  {depositAmount.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 p-4 text-center">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">Tối thiểu</p>
                <p className="text-2xl font-black text-purple-900 dark:text-purple-100 mt-2">0%</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800 p-4 text-center">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Hiện tại</p>
                <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-2">{percentage}%</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 p-4 text-center">
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">Tối đa</p>
                <p className="text-2xl font-black text-orange-900 dark:text-orange-100 mt-2">100%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Slider Section */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Label htmlFor="percentage" className="text-base font-bold">
                  Điều chỉnh bằng Slider
                </Label>
                <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {percentage}%
                </span>
              </div>
              <div className="space-y-3">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[percentage]}
                  onValueChange={([value]) => {
                    setPercentage(value);
                    setInputValue(String(value));
                  }}
                  disabled={saving}
                  className="py-4"
                />
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Manual Input Section */}
            <div className="space-y-3 border-t pt-6">
              <Label htmlFor="percentage-input" className="text-base font-bold">
                Hoặc Nhập Trực Tiếp
              </Label>
              <div className="relative group">
                <Input
                  id="percentage-input"
                  type="text"
                  inputMode="numeric"
                  value={inputValue.replace(/^0+(?=\d)/, "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // allow empty input while typing
                    setInputValue(raw);
                    const parsed = parseFloat(raw);
                    if (!isNaN(parsed)) {
                      setPercentage(Math.min(100, Math.max(0, parsed)));
                    }
                  }}
                  onBlur={(e) => {
                    const parsed = parseFloat(e.target.value);
                    const normalized = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
                    setPercentage(normalized);
                    setInputValue(String(normalized));
                  }}
                  disabled={saving}
                  className={`text-2xl font-bold text-center py-6 border-2 focus:border-0 focus:ring-2 focus:ring-blue-500 transition-all`}
                />
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Nhập giá trị từ 0 đến 100
              </p>
            </div>

            {/* Live Example */}
            <div className={`rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border border-emerald-200 dark:border-emerald-800 p-6 space-y-3`}>
              <div className={`inline-block px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider`}>
                📊 Ví Dụ Trực Tiếp
              </div>
              <p className={`text-sm text-emerald-600 dark:text-emerald-400`}>
                Với tỷ lệ <span className="font-bold">{percentage}%</span>, booking 1.000.000đ cần đặt cọc:
              </p>
              <p className={`text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent`}>
                {((percentage / 100) * 1000000).toLocaleString("vi-VN")}đ
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2 font-semibold"
              >
                <X className="h-4 w-4" />
                Hủy
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className={`bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold gap-2 shadow-lg hover:shadow-xl transition-all`}
              >
                <Save className="h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
