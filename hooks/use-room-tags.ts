import { logger } from "@/lib/utils/logger";
import { useState, useEffect, useMemo } from "react";
import { roomTagService } from "@/lib/services";
import { getAccessToken } from "@/lib/services/api";
import type { RoomTag } from "@/lib/types/api";
import { ApiError } from "@/lib/services/api";

export function useRoomTags() {
  const [roomTags, setRoomTags] = useState<RoomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<RoomTag | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRoomTags();
  }, []);

  const loadRoomTags = async () => {
    try {
      if (!getAccessToken()) {
        setError("Vui lòng đăng nhập để tiếp tục");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const tags = await roomTagService.getRoomTags();
      setRoomTags(tags);
    } catch (err) {
      logger.error("Error loading room tags:", err);
      
      // More specific error messages
      if (err instanceof ApiError) {
        if (err.statusCode === 404) {
          setError("Không tìm thấy endpoint API. Vui lòng kiểm tra backend đang chạy.");
        } else if (err.statusCode === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setError(err.message || "Không thể tải danh sách tiện nghi");
        }
      } else {
        setError("Lỗi kết nối đến server. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtered tags based on search
  const filteredTags = useMemo(() => {
    return roomTags.filter((tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  }, [roomTags, searchTerm]);

  const handleAddNew = () => {
    setEditingTag(null);
    setModalOpen(true);
  };

  const handleEdit = (tag: RoomTag) => {
    setEditingTag(tag);
    setModalOpen(true);
  };

  const handleSave = async (tagData: { name: string; description?: string }) => {
    try {
      if (editingTag) {
        // Update existing tag
        const updated = await roomTagService.updateRoomTag(editingTag.id, tagData);
        setRoomTags(prev => prev.map(tag => 
          tag.id === editingTag.id ? updated : tag
        ));
      } else {
        // Create new tag
        const created = await roomTagService.createRoomTag(tagData);
        setRoomTags(prev => [...prev, created]);
      }
      setModalOpen(false);
      setEditingTag(null);
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Không thể lưu tiện nghi";
      throw new Error(message);
    }
  };

  const handleDelete = async (tagId: string) => {
    try {
      setIsDeleting(tagId);
      await roomTagService.deleteRoomTag(tagId);
      setRoomTags(prev => prev.filter((tag) => tag.id !== tagId));
      setError(null);
    } catch (err) {
      logger.error("Error deleting room tag:", err);
      const message = err instanceof ApiError ? err.message : 
        (err instanceof Error ? err.message : "Không thể xóa tiện nghi");
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return {
    roomTags: filteredTags,
    allRoomTags: roomTags, // Unfiltered for stats
    loading,
    modalOpen,
    editingTag,
    isDeleting,
    error,
    setModalOpen,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    clearError,
    handleSearch,
  };
}
