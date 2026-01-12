/**
 * Surcharges Management Hook
 * 
 * Manages surcharge operations (ServiceUsage with customPrice)
 * Backend: POST /employee/service/surcharge
 * 
 * Note: Surcharges are NOT regular services
 * - Service "Phụ thu" is READ-ONLY (seeded, do not CRUD)
 * - CRUD operations are on ServiceUsage records
 */

import { useState, useCallback } from 'react';
import { surchargeAPI } from '@/lib/services/service-unified.service';
import type { ServiceUsage, CreatePenaltySurchargeRequest, SurchargeDisplay } from '@/lib/types/service-unified';
import { toSurchargeDisplay } from '@/lib/types/service-unified';
import { useToast } from '@/hooks/use-toast';

export function useSurcharges() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [surcharges, setSurcharges] = useState<SurchargeDisplay[]>([]);

  /**
   * Load surcharges for a booking or booking room
   */
  const loadSurcharges = useCallback(async (filters?: {
    bookingId?: string;
    bookingRoomId?: string;
  }) => {
    try {
      setLoading(true);
      const usages = await surchargeAPI.getSurchargeUsages(filters);
      
      // Convert ServiceUsage to SurchargeDisplay
      const displays = usages.map(toSurchargeDisplay);
      setSurcharges(displays);
      
      return displays;
    } catch (error) {
      console.error('Failed to load surcharges:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: 'Không thể tải danh sách phụ thu. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Apply surcharge to a booking room
   */
  const applySurcharge = useCallback(async (data: CreatePenaltySurchargeRequest) => {
    try {
      setLoading(true);
      
      const newUsage = await surchargeAPI.applySurcharge(data);
      
      // Add to local state
      const newSurcharge = toSurchargeDisplay(newUsage);
      setSurcharges(prev => [...prev, newSurcharge]);
      
      toast({
        title: 'Thành công',
        description: 'Đã áp dụng phụ thu thành công'
      });
      
      return newSurcharge;
    } catch (error) {
      console.error('Failed to apply surcharge:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi áp dụng phụ thu',
        description: error instanceof Error ? error.message : 'Không thể áp dụng phụ thu. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Update surcharge usage
   */
  const updateSurcharge = useCallback(async (
    id: string,
    data: {
      quantity?: number;
      status?: ServiceUsage['status'];
    }
  ) => {
    try {
      setLoading(true);
      
      const updated = await surchargeAPI.updateSurcharge(id, data);
      
      // Update local state
      setSurcharges(prev =>
        prev.map(s => (s.id === id ? toSurchargeDisplay(updated) : s))
      );
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật phụ thu thành công'
      });
      
      return toSurchargeDisplay(updated);
    } catch (error) {
      console.error('Failed to update surcharge:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật phụ thu. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Delete surcharge usage
   */
  const deleteSurcharge = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      await surchargeAPI.deleteSurcharge(id);
      
      // Remove from local state
      setSurcharges(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa phụ thu thành công'
      });
    } catch (error) {
      console.error('Failed to delete surcharge:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi xóa phụ thu',
        description: 'Không thể xóa phụ thu. Vui lòng thử lại.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    surcharges,
    loading,
    loadSurcharges,
    applySurcharge,
    updateSurcharge,
    deleteSurcharge
  };
}
