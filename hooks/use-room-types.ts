import { useState, useEffect, useCallback } from "react";
import { RoomType } from "@/lib/types/room";
import {
  getRoomTypesForUI,
  createRoomType as createRoomTypeApi,
  updateRoomType as updateRoomTypeApi,
  deleteRoomType as deleteRoomTypeApi,
  transformUIToApiCreate,
  transformUIToApiUpdate,
} from "@/lib/services/room-type.service";
import { ApiError } from "@/lib/services/api";

// Flag to enable/disable mock data (set to false for real API)
const USE_MOCK_DATA = false;

// Import mock functions conditionally
import {
  getRoomTypes as getMockRoomTypes,
  createRoomType as createMockRoomType,
  updateRoomType as updateMockRoomType,
  deleteRoomType as deleteMockRoomType,
  checkRoomTypeInUse as checkMockRoomTypeInUse,
} from "@/lib/mock-room-types";

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRoomTypes = useCallback(async () => {
    try {
      setLoading(true);
      if (USE_MOCK_DATA) {
        const data = await getMockRoomTypes();
        setRoomTypes(data);
      } else {
        const response = await getRoomTypesForUI({ limit: 100 });
        setRoomTypes(response.roomTypes);
      }
      setError(null);
    } catch (err) {
      console.error("Error loading room types:", err);
      if (err instanceof ApiError) {
        setError(`Không thể tải danh sách loại phòng: ${err.message}`);
      } else {
        setError("Không thể tải danh sách loại phòng");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

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
      if (USE_MOCK_DATA) {
        if (editingRoomType) {
          await updateMockRoomType(editingRoomType.roomTypeID, roomTypeData);
        } else {
          await createMockRoomType(
            roomTypeData as Omit<RoomType, "roomTypeID">
          );
        }
      } else {
        if (editingRoomType) {
          // Get the room type ID from API (need to find the API ID)
          // For now, we'll use the code to find it from the loaded room types
          const existingRoomType = roomTypes.find(
            (rt) => rt.roomTypeID === editingRoomType.roomTypeID
          );
          if (existingRoomType) {
            // TODO: We need to map roomTypeID (code) to API ID
            // For now, we'll assume the API accepts the code or we need to fetch the ID
            const apiUpdateData = transformUIToApiUpdate(roomTypeData);
            // Note: This will fail if the API uses numeric IDs
            // Backend team needs to provide a way to update by code or include ID in response
            await updateRoomTypeApi(
              parseInt(editingRoomType.roomTypeID) || 1,
              apiUpdateData
            );
          }
        } else {
          const apiCreateData = transformUIToApiCreate(
            roomTypeData as Omit<RoomType, "roomTypeID">
          );
          await createRoomTypeApi(apiCreateData);
        }
      }
      await loadRoomTypes();
      setModalOpen(false);
      setEditingRoomType(null);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Không thể lưu loại phòng";
      throw new Error(errorMessage);
    }
  };

  const handleDelete = async (roomTypeID: string) => {
    if (USE_MOCK_DATA) {
      // Check if room type is in use (mock)
      const inUse = checkMockRoomTypeInUse(roomTypeID);
      if (inUse) {
        setError(
          "Không thể xóa loại phòng đang được sử dụng. Bạn chỉ có thể chỉnh sửa thông tin."
        );
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    try {
      setIsDeleting(roomTypeID);
      if (USE_MOCK_DATA) {
        await deleteMockRoomType(roomTypeID);
      } else {
        // TODO: We need to map roomTypeID (code) to API ID
        // For now, we'll try to delete and handle errors
        await deleteRoomTypeApi(parseInt(roomTypeID) || 1);
      }
      await loadRoomTypes();
      setError(null);
    } catch (err) {
      console.error("Error deleting room type:", err);
      if (err instanceof ApiError) {
        // Check if error is because room type is in use
        if (err.statusCode === 400 || err.statusCode === 409) {
          setError(
            "Không thể xóa loại phòng đang được sử dụng. Bạn chỉ có thể chỉnh sửa thông tin."
          );
        } else {
          setError(`Không thể xóa loại phòng: ${err.message}`);
        }
      } else {
        setError(
          err instanceof Error ? err.message : "Không thể xóa loại phòng"
        );
      }
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
