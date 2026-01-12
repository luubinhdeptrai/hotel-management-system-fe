"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Key, Mail, Shield, Edit2, Save, X, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Employee } from "@/lib/types/api";
import { getEmployeeRole } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setEditedName(user.name);
    }
  }, [user]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(profile?.name || "");
    setMessage(null);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      setMessage({ type: "error", text: "Tên không được để trống" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await authService.updateProfile({ name: editedName.trim() });
      await refreshUser();
      setIsEditing(false);
      setMessage({ type: "success", text: "Cập nhật thông tin thành công! ✅" });
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông tin",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới và xác nhận không khớp" });
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công! 🎉" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      setPasswordMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Có lỗi xảy ra khi đổi mật khẩu",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700 border-red-200";
      case "RECEPTIONIST":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "HOUSEKEEPING":
        return "bg-green-100 text-green-700 border-green-200";
      case "STAFF":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
                Hồ Sơ Cá Nhân
              </h1>
              <p className="text-white/90 text-lg font-medium drop-shadow mt-2">
                Quản lý thông tin tài khoản của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 h-12 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold"
          >
            <User className="h-4 w-4 mr-2" />
            Thông Tin
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold"
          >
            <Key className="h-4 w-4 mr-2" />
            Bảo Mật
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-linear-to-r from-slate-50 to-slate-100 border-b-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <User className="h-6 w-6 text-blue-600" />
                    Thông Tin Cá Nhân
                  </CardTitle>
                  <CardDescription className="font-medium mt-2">
                    Thông tin chi tiết về tài khoản của bạn
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    onClick={handleEditProfile}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-md"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Chỉnh Sửa
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={`mb-6 border-2 ${
                    message.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : ""
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <AlertDescription className="font-medium">{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold text-slate-700">
                    Họ và Tên
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-12 text-base border-2 border-slate-200 rounded-xl hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="h-12 px-4 border-2 border-slate-200 rounded-xl flex items-center bg-slate-50 font-medium text-slate-900">
                      {profile.name}
                    </div>
                  )}
                </div>

                {/* Username Field (Read-only) */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Tên Đăng Nhập
                  </Label>
                  <div className="h-12 px-4 border-2 border-slate-200 rounded-xl flex items-center bg-slate-50 font-medium text-slate-600">
                    {profile.username}
                  </div>
                  <p className="text-sm text-slate-500">Tên đăng nhập không thể thay đổi</p>
                </div>

                {/* Role Field (Read-only) */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Vai Trò
                  </Label>
                  <div className="flex items-center gap-3">
                    {profile && (
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${getRoleBadgeColor(
                          getEmployeeRole(profile) || "STAFF"
                        )}`}
                      >
                        {getEmployeeRole(profile) || "Không có vai trò"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t-2 border-slate-100">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 font-semibold shadow-md"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      variant="outline"
                      className="h-12 px-6 border-2 border-slate-300 font-semibold hover:bg-slate-50"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-error-50 via-error-50/80 to-warning-50 border-b-2 border-error-100 py-8 px-8">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-error-600/10 border-2 border-error-200">
                  <Key className="h-8 w-8 text-error-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Bảo Mật Tài Khoản
                  </CardTitle>
                  <CardDescription className="font-semibold text-gray-600 mt-2 text-base">
                    Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-10">{/* Security Tab Message */}
              <div className="mb-6 p-4 rounded-xl bg-info-50 border-2 border-info-200 flex items-start gap-3">
                <Shield className="h-5 w-5 text-info-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-info-700 font-semibold">
                  Hãy tạo mật khẩu mạnh với ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              </div>
              {passwordMessage && (
                <Alert
                  variant={passwordMessage.type === "error" ? "destructive" : "default"}
                  className={`mb-6 border-2 ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : ""
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <AlertDescription className="font-medium">
                    {passwordMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleChangePassword} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-3">
                  <Label htmlFor="currentPassword" className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-error-600"></span>
                    Mật Khẩu Hiện Tại
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      placeholder="Nhập mật khẩu hiện tại"
                      className="h-12 text-base border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:border-error-500 focus:ring-2 focus:ring-error-200 bg-white transition-all shadow-sm"
                      disabled={passwordLoading}
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label htmlFor="newPassword" className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-error-600"></span>
                    Mật Khẩu Mới
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                      className="h-12 text-base border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:border-error-500 focus:ring-2 focus:ring-error-200 bg-white transition-all shadow-sm"
                      disabled={passwordLoading}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-gray-600 font-semibold flex items-center gap-1.5">
                    <span className="text-error-600">●</span>
                    Tối thiểu 8 ký tự
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-error-600"></span>
                    Xác Nhận Mật Khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Nhập lại mật khẩu mới"
                      className="h-12 text-base border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:border-error-500 focus:ring-2 focus:ring-error-200 bg-white transition-all shadow-sm"
                      disabled={passwordLoading}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t-2 border-gray-100 flex gap-3">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 h-12 bg-gradient-to-r from-error-600 to-error-500 hover:from-error-700 hover:to-error-600 font-bold text-white shadow-lg hover:shadow-xl transition-all rounded-lg"
                  >
                    <Key className="h-5 w-5 mr-2" />
                    {passwordLoading ? "Đang cập nhật..." : "Đổi Mật Khẩu"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
