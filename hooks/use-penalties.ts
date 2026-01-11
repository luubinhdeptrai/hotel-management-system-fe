/**
 * Penalties Management Hook
 * 
 * Manages penalty operations (ServiceUsage with customPrice)
 * Backend: POST /employee/service/penalty
 * 
 * Note: Penalties are NOT regular services
 * - Service "Phạt" is READ-ONLY (seeded, do not CRUD)
 * - CRUD operations are on ServiceUsage records
 */

import { useState, useCallback } from 'react';
import { penaltyAPI } from '@/lib/services/service-unified.service';
import type { ServiceUsage, CreatePenaltySurchargeRequest, PenaltyDisplay } from '@/lib/types/service-unified';
import { toPenaltyDisplay } from '@/lib/types/service-unified';
import { useToast } from '@/hooks/use-toast';

export function usePenalties() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [penalties, setPenalties] = useState<PenaltyDisplay[]>([]);

  /**
   * Load penalties for a booking or booking room
   */
  const loadPenalties = useCallback(async (filters?: {
    bookingId?: string;
    bookingRoomId?: string;
  }) => {
    try {
      setLoading(true);
      const usages = await penaltyAPI.getPenaltyUsages(filters);
      
      // Convert ServiceUsage to PenaltyDisplay
      const displays = usages.map(toPenaltyDisplay);
      setPenalties(displays);
      
      return displays;
    } catch (error) {
      console.error('Failed to load penalties:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: 'Không thể tải danh sách phạt. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Apply penalty to a booking room
   */
  const applyPenalty = useCallback(async (data: CreatePenaltySurchargeRequest) => {
    try {
      setLoading(true);
      
      const newUsage = await penaltyAPI.applyPenalty(data);
      
      // Add to local state
      const newPenalty = toPenaltyDisplay(newUsage);
      setPenalties(prev => [...prev, newPenalty]);
      
      toast({
        title: 'Thành công',
        description: 'Đã áp dụng phạt thành công'
      });
      
      return newPenalty;
    } catch (error) {
      console.error('Failed to apply penalty:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi áp dụng phạt',
        description: error instanceof Error ? error.message : 'Không thể áp dụng phạt. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Update penalty usage
   */
  const updatePenalty = useCallback(async (
    id: string,
    data: {
      quantity?: number;
      status?: ServiceUsage['status'];
    }
  ) => {
    try {
      setLoading(true);
      
      const updated = await penaltyAPI.updatePenalty(id, data);
      
      // Update local state
      setPenalties(prev =>
        prev.map(p => (p.id === id ? toPenaltyDisplay(updated) : p))
      );
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật phạt thành công'
      });
      
      return toPenaltyDisplay(updated);
    } catch (error) {
      console.error('Failed to update penalty:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật phạt. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Delete penalty usage
   */
  const deletePenalty = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      await penaltyAPI.deletePenalty(id);
      
      // Remove from local state
      setPenalties(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa phạt thành công'
      });
    } catch (error) {
      console.error('Failed to delete penalty:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi xóa phạt',
        description: 'Không thể xóa phạt. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    penalties,
    loading,
    loadPenalties,
    applyPenalty,
    updatePenalty,
    deletePenalty
  };
}
