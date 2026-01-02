"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tag, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { RoomTag } from "@/lib/types/api";

interface RoomTagFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tagData: { name: string; description?: string }) => Promise<void>;
  editingTag: RoomTag | null;
}

export function RoomTagFormModal({
  open,
  onClose,
  onSave,
  editingTag,
}: RoomTagFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingTag) {
        setFormData({
          name: editingTag.name,
          description: editingTag.description || "",
        });
      } else {
        setFormData({ name: "", description: "" });
      }
      setErrors({});
      setSubmitError(null);
    }
  }, [open, editingTag]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên tiện nghi là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên tiện nghi phải có ít nhất 2 ký tự";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Tên tiện nghi không được vượt quá 100 ký tự";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu tiện nghi";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 px-6 py-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Tag className="h-7 w-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {editingTag ? "Chỉnh sửa tiện nghi" : "Thêm tiện nghi mới"}
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base mt-1">
                {editingTag
                  ? "Cập nhật thông tin tiện nghi"
                  : "Nhập thông tin để tạo tiện nghi mới"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {submitError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag className="h-4 w-4 text-blue-600" />
                Tên tiện nghi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: WiFi miễn phí, TV LED, Minibar..."
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`h-12 ${errors.name ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200 focus:border-blue-500"}`}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/100 ký tự
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                Mô tả chi tiết
                <span className="text-xs text-gray-500 font-normal">(Không bắt buộc)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về tiện nghi này..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`min-h-[120px] resize-none ${errors.description ? "border-red-500 focus:ring-red-200" : "focus:ring-indigo-200 focus:border-indigo-500"}`}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 ký tự
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-11"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Tag className="mr-2 h-4 w-4" />
                  {editingTag ? "Cập nhật" : "Tạo mới"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
