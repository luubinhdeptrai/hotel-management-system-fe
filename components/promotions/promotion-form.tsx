/**
 * Promotion Form Component
 * Handles both Create and Update promotion forms
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "@/lib/types/promotion";

// Form validation schema
const promotionFormSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code must be at most 20 characters")
      .regex(new RegExp("^[A-Z0-9_-]+$"),
        "Code must be uppercase letters, numbers, dash or underscore only"
      ),
    description: z.string().optional().default(""),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    scope: z.enum(["ROOM", "SERVICE", "ALL"]),
    value: z.coerce
      .number()
      .positive("Value must be greater than 0")
      .max(100000000, "Value too large"),
    maxDiscount: z.coerce
      .number()
      .optional(),
    minBookingAmount: z.coerce.number().min(0, "Must be 0 or greater"),
    startDate: z.date(),
    endDate: z.date(),
    totalQty: z.coerce
      .number()
      .int()
      .optional(),
    perCustomerLimit: z.coerce
      .number()
      .int()
      .positive("Must be greater than 0")
      .min(1, "At least 1"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage cannot exceed 100%",
      path: ["value"],
    }
  );

type FormValues = z.infer<typeof promotionFormSchema>;

interface PromotionFormProps {
  promotion?: Promotion | null;
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  isLoading = false,
}: PromotionFormProps) {
  const isEditMode = !!promotion;

  // Safe value parsing helper
  const safeParseNumber = (value: string | undefined | null): number => {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Safe date parsing helper
  const safeParseDate = (dateValue: string | undefined): Date => {
    if (!dateValue) return new Date();
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(promotionFormSchema),
    mode: "onBlur",
    defaultValues: {
      code: promotion?.code || "",
      description: promotion?.description || "",
      type: promotion?.type || "PERCENTAGE",
      scope: promotion?.scope || "ALL",
      value: promotion ? safeParseNumber(promotion.value) : 0,
      maxDiscount: promotion?.maxDiscount
        ? safeParseNumber(promotion.maxDiscount)
        : undefined,
      minBookingAmount: promotion
        ? safeParseNumber(promotion.minBookingAmount)
        : 0,
      startDate: promotion ? safeParseDate(promotion.startDate) : new Date(),
      endDate: promotion
        ? safeParseDate(promotion.endDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      totalQty: promotion?.totalQty || undefined,
      perCustomerLimit: promotion?.perCustomerLimit || 1,
    },
  } as any);

  // Note: form.watch() is necessary here despite React Compiler warnings
  const promotionType = form.watch("type");

  const handleSubmit = async (values: any) => {
    // For create mode
    if (!isEditMode) {
      const createData = {
        code: values.code,
        description: values.description || undefined,
        type: values.type,
        scope: values.scope,
        value: values.value,
        maxDiscount: values.maxDiscount || undefined,
        minBookingAmount: values.minBookingAmount || 0,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        totalQty: values.totalQty || undefined,
        perCustomerLimit: values.perCustomerLimit,
      };
      await onSubmit(createData);
    } else {
      // For update mode - exclude type and scope
      const updateData = {
        code: values.code,
        description: values.description || undefined,
        value: values.value,
        maxDiscount: values.maxDiscount || undefined,
        minBookingAmount: values.minBookingAmount || 0,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        totalQty: values.totalQty || undefined,
        perCustomerLimit: values.perCustomerLimit,
      };
      await onSubmit(updateData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-5 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full bg-linear-to-b from-primary-600 to-primary-400"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Thông Tin Cơ Bản</h3>
          </div>

          {/* Code */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900">
                  Mã Khuyến Mại <span className="text-error-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="WELCOME2024"
                    {...field}
                    disabled={isEditMode || isLoading}
                    className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-600 mt-1.5">
                  Mã duy nhất mà khách hàng sử dụng. Chữ hoa, số, gạch ngang hoặc gạch dưới.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900">
                  Mô Tả Khuyến Mại
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Giảm giá 10% cho khách hàng mới..."
                    {...field}
                    disabled={isLoading}
                    rows={3}
                    className="rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow resize-none"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-600 mt-1.5">
                  Mô tả tùy chọn hiển thị cho khách hàng.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 2: Discount Details */}
        <div className="space-y-5 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full bg-linear-to-b from-success-600 to-success-400"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Chi Tiết Giảm Giá</h3>
          </div>

          {/* Type & Scope Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Loại Giảm Giá <span className="text-error-600">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success-600"></span>
                          Phần Trăm (%)
                        </span>
                      </SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                          Số Tiền Cố Định (VND)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scope */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Phạm Vi <span className="text-error-600">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <SelectValue placeholder="Chọn phạm vi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-info-600"></span>
                          Tất Cả (Phòng + Dịch Vụ)
                        </span>
                      </SelectItem>
                      <SelectItem value="ROOM">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-warning-600"></span>
                          Chỉ Phòng
                        </span>
                      </SelectItem>
                      <SelectItem value="SERVICE">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-error-600"></span>
                          Chỉ Dịch Vụ
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-gray-600 mt-1.5">
                    Khuyến mại áp dụng cho những gì
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Value & Max Discount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Value */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Giá Trị Giảm <span className="text-error-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step={promotionType === "PERCENTAGE" ? "1" : "10000"}
                        placeholder={
                          promotionType === "PERCENTAGE" ? "10" : "100000"
                        }
                        {...field}
                        disabled={isLoading}
                        className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                        {promotionType === "PERCENTAGE" ? "%" : "₫"}
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-600 mt-1.5">
                    {promotionType === "PERCENTAGE"
                      ? "Giảm giá theo phần trăm (0-100)"
                      : "Số tiền giảm cố định (VND)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Discount - only for percentage */}
            {promotionType === "PERCENTAGE" && (
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-900">
                      Giảm Giá Tối Đa (Tùy Chọn)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="10000"
                          placeholder="500000"
                          {...field}
                          disabled={isLoading}
                          className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                          ₫
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-600 mt-1.5">
                      Giới hạn giảm giá tối đa (VND)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Min Booking Amount */}
          <FormField
            control={form.control}
            name="minBookingAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900">
                  Giá Trị Đơn Tối Thiểu
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="10000"
                      placeholder="0"
                      {...field}
                      disabled={isLoading}
                      className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                      ₫
                    </span>
                  </div>
                </FormControl>
                <FormDescription className="text-xs text-gray-600 mt-1.5">
                  Giá trị đơn tối thiểu để sử dụng khuyến mại (VND). Để 0 nếu không có yêu cầu.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 3: Time & Quantity */}
        <div className="space-y-5 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full bg-linear-to-b from-warning-600 to-warning-400"></div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Thời Gian & Số Lượng</h3>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Ngày Bắt Đầu <span className="text-error-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isLoading}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value));
                        }
                      }}
                      className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Ngày Kết Thúc <span className="text-error-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isLoading}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value));
                        }
                      }}
                      className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Quantity & Per Customer Limit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Total Quantity */}
            <FormField
              control={form.control}
              name="totalQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Tổng Số Lượng (Tùy Chọn)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Để trống cho không giới hạn"
                      {...field}
                      disabled={isLoading}
                      className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-600 mt-1.5">
                    Tổng số lần khuyến mại có thể sử dụng. Để trống cho không giới hạn.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Per Customer Limit */}
            <FormField
              control={form.control}
              name="perCustomerLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Giới Hạn Trên Mỗi Khách <span className="text-error-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      {...field}
                      disabled={isLoading}
                      className="h-11 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-600 mt-1.5">
                    Số lần tối đa mỗi khách hàng có thể sử dụng khuyến mại này.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 px-6 rounded-lg font-semibold border-gray-300 hover:bg-gray-50 transition-all"
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-11 px-6 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Cập Nhật Khuyến Mại" : "Tạo Khuyến Mại"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
