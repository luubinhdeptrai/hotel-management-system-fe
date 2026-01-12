/**
 * Time Settings Card Component
 * Manages check-in and check-out time configurations
 * Beautiful, animated, and vibrant design
 */

"use client";

import { useState } from "react";
import { Clock, Edit2, Save, X } from "lucide-react";
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
import type {
  CheckInTimeConfig,
  CheckOutTimeConfig,
  UpdateTimeConfigRequest,
} from "@/lib/types/app-settings";
import { PermissionGuard } from "@/components/permission-guard";

interface TimeSettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "green" | "orange"; // Color theme
  config: CheckInTimeConfig | CheckOutTimeConfig | null;
  onUpdate: (config: UpdateTimeConfigRequest) => Promise<any>;
  loading: boolean;
}

const colorClasses = {
  green: {
    bg: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 dark:bg-green-900",
    text: "text-green-900 dark:text-green-100",
    accent: "text-green-600 dark:text-green-400",
    button: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    pulse: "from-green-500/20 to-emerald-500/20",
  },
  orange: {
    bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 dark:bg-orange-900",
    text: "text-orange-900 dark:text-orange-100",
    accent: "text-orange-600 dark:text-orange-400",
    button: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
    pulse: "from-orange-500/20 to-amber-500/20",
  },
};

export function TimeSettingsCard({
  title,
  description,
  icon,
  color,
  config,
  onUpdate,
  loading,
}: TimeSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hour, setHour] = useState(config?.hour ?? 0);
  const [minute, setMinute] = useState(config?.minute ?? 0);
  const [gracePeriod, setGracePeriod] = useState(
    config?.gracePeriodMinutes ?? 60
  );
  const [saving, setSaving] = useState(false);

  const colors = colorClasses[color];

  const handleEdit = () => {
    setHour(config?.hour ?? 0);
    setMinute(config?.minute ?? 0);
    setGracePeriod(config?.gracePeriodMinutes ?? 60);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate({
        hour,
        minute,
        gracePeriodMinutes: gracePeriod,
      });
      setIsEditing(false);
    } catch (err) {
      // Error handled by hook
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (h: number, m: number) => {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  if (!config) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient background */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.pulse} rounded-full blur-3xl opacity-40 -z-0`} />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.button} text-white shadow-lg`}>
              {icon}
            </div>
            <div>
              <div className="text-lg font-bold">{title}</div>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
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
        {!isEditing ? (
          <div className="space-y-4">
            {/* Main Time Display */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} p-6 transition-transform duration-300 hover:scale-105`}>
              <div className="absolute inset-0 opacity-30">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.pulse} rounded-full blur-2xl`} />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${colors.accent} uppercase tracking-wider mb-2`}>
                    Thời gian tiêu chuẩn
                  </p>
                  <p className={`text-5xl font-black ${colors.text} tracking-tight`}>
                    {formatTime(config.hour, config.minute)}
                  </p>
                  <p className={`text-xs ${colors.accent} font-medium mt-1`}>
                    {config.hour}h {config.minute}m
                  </p>
                </div>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.pulse} rounded-full blur-xl`} />
                  <div className={`relative p-4 rounded-full bg-gradient-to-br ${colors.button} text-white shadow-xl`}>
                    <Clock className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Grace Period Display */}
            <div className={`rounded-2xl bg-gradient-to-r ${colors.pulse} border ${colors.border} p-6 space-y-2`}>
              <div className={`inline-block px-3 py-1.5 ${colors.badge} ${colors.text} rounded-full text-xs font-bold uppercase tracking-wider`}>
                ⏱️ Thời gian chờ
              </div>
              <p className={`text-3xl font-black ${colors.text}`}>
                {config.gracePeriodMinutes} phút
              </p>
              <p className={`text-sm ${colors.accent} leading-relaxed`}>
                Khách được phép đến sớm hoặc ở lại muộn mà không bị tính thêm phí
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Hour and Minute Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hour" className="text-xs font-bold uppercase tracking-wider">Giờ (0-23)</Label>
                <div className={`relative group`}>
                  <Input
                    id="hour"
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => setHour(parseInt(e.target.value) || 0)}
                    disabled={saving}
                    className={`text-xl font-bold text-center py-6 border-2 focus:border-0 focus:ring-2 ${colors.accent} transition-all`}
                  />
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colors.pulse} opacity-0 group-focus-within:opacity-20 pointer-events-none transition-opacity`} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minute" className="text-xs font-bold uppercase tracking-wider">Phút (0-59)</Label>
                <div className={`relative group`}>
                  <Input
                    id="minute"
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
                    disabled={saving}
                    className={`text-xl font-bold text-center py-6 border-2 focus:border-0 focus:ring-2 ${colors.accent} transition-all`}
                  />
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colors.pulse} opacity-0 group-focus-within:opacity-20 pointer-events-none transition-opacity`} />
                </div>
              </div>
            </div>

            {/* Grace Period Input */}
            <div className="space-y-2">
              <Label htmlFor="grace" className="text-xs font-bold uppercase tracking-wider">Thời gian chờ (phút)</Label>
              <div className="space-y-2">
                <div className={`relative group`}>
                  <Input
                    id="grace"
                    type="number"
                    min="0"
                    max="240"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
                    disabled={saving}
                    className={`text-xl font-bold text-center py-6 border-2 focus:border-0 focus:ring-2 ${colors.accent} transition-all`}
                  />
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${colors.pulse} opacity-0 group-focus-within:opacity-20 pointer-events-none transition-opacity`} />
                </div>
              </div>
              <p className={`text-xs ${colors.accent} leading-relaxed bg-opacity-5 p-3 rounded-lg`}>
                💡 Khoảng thời gian linh hoạt cho phép khách check-in/out muộn mà không bị tính phí
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2 font-semibold"
              >
                <X className="h-4 w-4" />
                Hủy
              </Button>
              <PermissionGuard permission="settings:update">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className={`bg-gradient-to-r ${colors.button} text-white font-semibold gap-2 shadow-lg hover:shadow-xl transition-all`}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </PermissionGuard>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
