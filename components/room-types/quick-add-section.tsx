"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ICONS } from "@/src/constants/icons.enum";
import {
  ROOM_TYPE_TEMPLATES,
  formatPrice,
  getTemplateDescription,
} from "@/lib/room-type-templates";
import { RoomType } from "@/lib/types/room";

interface QuickAddSectionProps {
  onAddNew: () => void;
  onSelectTemplate: (template: RoomType) => void;
}

export function QuickAddSection({
  onAddNew,
  onSelectTemplate,
}: QuickAddSectionProps) {
  return (
    <Card className="bg-linear-to-br from-primary-50 via-blue-50 to-primary-100 border-2 border-primary-200 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3 font-extrabold text-gray-900">
              <span className="w-8 h-8 text-primary-600 bg-white rounded-lg p-1.5 shadow-md">
                {ICONS.PLUS}
              </span>
              Thêm loại phòng mới
            </CardTitle>
            <CardDescription className="mt-2 text-base text-gray-700 font-medium">
              Tạo nhanh loại phòng mới hoặc chọn từ các mẫu phổ biến bên dưới
            </CardDescription>
          </div>
          <Button
            onClick={onAddNew}
            className="bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all h-12 px-6 font-bold text-base"
          >
            <span className="w-5 h-5 mr-2">{ICONS.PLUS}</span>
            Tạo mới tùy chỉnh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROOM_TYPE_TEMPLATES.map((template) => (
            <button
              key={template.roomTypeName}
              onClick={() =>
                onSelectTemplate({
                  roomTypeID: "",
                  ...template,
                })
              }
              className="bg-white rounded-xl border-2 border-gray-200 p-5 text-left hover:border-primary-400 hover:shadow-xl transition-all group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="w-10 h-10 bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 transition-all shadow-md">
                  <span className="w-6 h-6 text-gray-600 group-hover:text-primary-600">
                    {ICONS.BED_DOUBLE}
                  </span>
                </span>
                <span className="text-xs font-bold text-primary-600 bg-primary-100 px-3 py-1.5 rounded-full">
                  Mẫu
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                {template.roomTypeName}
              </h3>
              <p className="text-sm text-gray-600 mb-3 font-semibold">
                {template.capacity} người •{" "}
                {formatPrice(template.price).replace(/\s/g, "")}/đêm
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {getTemplateDescription(template)}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
