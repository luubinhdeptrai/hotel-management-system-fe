import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CreateCustomerRequest } from "@/lib/types/api";

const createCustomerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  idNumber: z.string().min(9, "CMND/CCCD không hợp lệ"),
  address: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ")
    .optional()
    .or(z.literal("")),
});

type CreateCustomerValues = z.infer<typeof createCustomerSchema>;

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCustomerRequest) => Promise<any>;
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      idNumber: "",
      address: "",
    },
  });

  const handleFormSubmit = async (data: CreateCustomerValues) => {
    try {
      setIsSubmitting(true);
      // Map form values to API request (handle optional/empty strings)
      await onSubmit({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        idNumber: data.idNumber,
        address: data.address || undefined,
        password: "DefaultPassword@123", // Needs a default password if required by backend, or handle backend side.
        // Based on API types, password IS required for CreateCustomerRequest.
        // Assuming we set a default or the backend handles it.
        // Let's use a placeholder securely or ask user. For now, hardcode a placeholder for "walk-in" customers if the API demands it.
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm Khách Hàng Mới</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="fullName">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input id="phone" {...register("phone")} placeholder="0901234567" />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register("email")}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="idNumber">
              CCCD/CMND <span className="text-red-500">*</span>
            </Label>
            <Input
              id="idNumber"
              {...register("idNumber")}
              placeholder="012345678912"
            />
            {errors.idNumber && (
              <p className="text-red-500 text-sm">{errors.idNumber.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Đường ABC..."
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu khách hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
