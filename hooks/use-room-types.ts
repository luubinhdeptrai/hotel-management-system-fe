import { useState, useEffect } from "react";
import { RoomType } from "@/lib/types/room";
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  checkRoomTypeInUse,
} from "@/lib/mock-room-types";

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const data = await getRoomTypes();
      setRoomTypes(data);
      setError(null);
    } catch (err) {
      console.error("Error loading room types:", err);
      setError("Không thể tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingRoomType(null);
    setModalOpen(true);
  };

  const handleEdit = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setModalOpen(true);
  };

  const handleSave = async (roomTypeData: Partial<RoomType>) => {
    try {
      if (editingRoomType) {
        // Update existing room type
        await updateRoomType(editingRoomType.roomTypeID, roomTypeData);
      } else {
        // Create new room type
        await createRoomType(roomTypeData as Omit<RoomType, "roomTypeID">);
      }
      await loadRoomTypes();
      setModalOpen(false);
      setEditingRoomType(null);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Không thể lưu loại phòng"
      );
    }
  };

  const handleDelete = async (roomTypeID: string) => {
    // Check if room type is in use
    const inUse = checkRoomTypeInUse(roomTypeID);

    if (inUse) {
      setError(
        "Không thể xóa loại phòng đang được sử dụng. Bạn chỉ có thể chỉnh sửa thông tin."
      );
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setIsDeleting(roomTypeID);
      await deleteRoomType(roomTypeID);
      await loadRoomTypes();
      setError(null);
    } catch (err) {
      console.error("Error deleting room type:", err);
      setError(err instanceof Error ? err.message : "Không thể xóa loại phòng");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSelectTemplate = (template: RoomType) => {
    setEditingRoomType(template);
    setModalOpen(true);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    roomTypes,
    loading,
    modalOpen,
    editingRoomType,
    isDeleting,
    error,
    setModalOpen,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    handleSelectTemplate,
    clearError,
  };
}
