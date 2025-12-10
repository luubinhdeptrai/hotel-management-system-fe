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
    <Card className="bg-linear-to-br from-primary-blue-50 to-primary-blue-100 border-primary-blue-200">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-5 h-5 text-primary-blue-600">
                {ICONS.PLUS}
              </span>
              Thêm loại phòng mới
            </CardTitle>
            <CardDescription className="mt-1">
              Tạo nhanh loại phòng mới hoặc chọn từ các mẫu phổ biến bên dưới
            </CardDescription>
          </div>
          <Button
            onClick={onAddNew}
            className="bg-primary-600 hover:bg-primary-500"
          >
            <span className="w-4 h-4 mr-2">{ICONS.PLUS}</span>
            Tạo mới tùy chỉnh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROOM_TYPE_TEMPLATES.map((template) => (
            <button
              key={template.roomTypeName}
              onClick={() =>
                onSelectTemplate({
                  roomTypeID: "",
                  ...template,
                })
              }
              className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-primary-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-blue-100 transition-colors">
                  <span className="w-5 h-5 text-gray-600 group-hover:text-primary-blue-600">
                    {ICONS.BED_DOUBLE}
                  </span>
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Mẫu
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {template.roomTypeName}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {template.capacity} người •{" "}
                {formatPrice(template.price).replace(/\s/g, "")}/đêm
              </p>
              <p className="text-xs text-gray-600">
                {getTemplateDescription(template)}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
