import { RoomType } from "@/lib/types/room";

export const ROOM_TYPE_TEMPLATES: Omit<RoomType, "roomTypeID">[] = [
  {
    roomTypeName: "Standard",
    price: 500000,
    capacity: 2,
    amenities: ["WiFi", "Tivi", "Điều hòa", "Tủ lạnh"],
  },
  {
    roomTypeName: "Deluxe",
    price: 800000,
    capacity: 2,
    amenities: ["WiFi", "Tivi", "Điều hòa", "Tủ lạnh", "Minibar", "Ban công"],
  },
  {
    roomTypeName: "Suite",
    price: 1200000,
    capacity: 4,
    amenities: [
      "WiFi",
      "Tivi",
      "Điều hòa",
      "Tủ lạnh",
      "Minibar",
      "Ban công",
      "Bồn tắm",
      "Phòng khách riêng",
    ],
  },
  {
    roomTypeName: "Family",
    price: 1500000,
    capacity: 6,
    amenities: [
      "WiFi",
      "Tivi",
      "Điều hòa",
      "Tủ lạnh",
      "Minibar",
      "Bếp nhỏ",
      "2 Phòng ngủ",
    ],
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function getTemplateDescription(
  template: (typeof ROOM_TYPE_TEMPLATES)[0]
): string {
  const amenitiesPreview = template.amenities.slice(0, 3).join(", ");
  return template.amenities.length > 3
    ? `${amenitiesPreview}...`
    : amenitiesPreview;
}
