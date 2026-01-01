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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>
                Promotion Code <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="SUMMER2025"
                  {...field}
                  disabled={isEditMode || isLoading}
                  className="uppercase"
                />
              </FormControl>
              <FormDescription>
                Unique code customers will use. Uppercase letters, numbers,
                dash, or underscore only.
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Save 20% on all room bookings this summer!"
                  {...field}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Optional description visible to customers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type & Scope Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Discount Type <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">
                      Fixed Amount (VND)
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
                <FormLabel>
                  Scope <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">All (Room + Service)</SelectItem>
                    <SelectItem value="ROOM">Room Only</SelectItem>
                    <SelectItem value="SERVICE">Service Only</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  What this promotion applies to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Value & Max Discount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Value */}
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Discount Value <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={promotionType === "PERCENTAGE" ? "1" : "1000"}
                    placeholder={
                      promotionType === "PERCENTAGE" ? "20" : "100000"
                    }
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  {promotionType === "PERCENTAGE"
                    ? "Percentage discount (0-100)"
                    : "Fixed discount amount (VND)"}
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
                  <FormLabel>Max Discount (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1000"
                      placeholder="500000"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum discount cap in VND
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
              <FormLabel>Minimum Booking Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="10000"
                  placeholder="0"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Minimum booking amount to use this promotion (VND). Set 0 for
                no minimum.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Start Date <span className="text-red-500">*</span>
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
                <FormLabel>
                  End Date <span className="text-red-500">*</span>
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Quantity & Per Customer Limit Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Quantity */}
          <FormField
            control={form.control}
            name="totalQty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Quantity (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Total number of times this promotion can be claimed. Leave
                  empty for unlimited.
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
                <FormLabel>
                  Per Customer Limit <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Max times each customer can claim this promotion.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Promotion" : "Create Promotion"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
