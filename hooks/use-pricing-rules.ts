/**
 * Pricing Rules Hook
 * React hook for managing pricing rules state and operations
 */

import { useState, useEffect, useCallback } from "react";
import { useNotification } from "@/hooks/use-notification";
import type {
  PricingRule,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  CalendarEvent,
} from "@/lib/types/pricing";
import * as pricingRuleService from "@/lib/services/pricing-rule.service";

interface UsePricingRulesOptions {
  includeInactive?: boolean;
  autoLoad?: boolean;
}

export function usePricingRules(options: UsePricingRulesOptions = {}) {
  const { includeInactive = false, autoLoad = true } = options;
  const { showSuccess, showError } = useNotification();

  // State
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pricing rules
  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pricingRuleService.getPricingRules(includeInactive);
      setRules(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load pricing rules";
      setError(message);
      showError(`Lỗi tải quy tắc định giá: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [includeInactive, showError]);

  // Load calendar events
  const loadCalendarEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const data = await pricingRuleService.getCalendarEvents();
      setCalendarEvents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load calendar events";
      console.error("Failed to load calendar events:", message);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Create new pricing rule
  const createRule = useCallback(
    async (data: CreatePricingRuleRequest): Promise<PricingRule | null> => {
      try {
        setLoading(true);
        const newRule = await pricingRuleService.createPricingRule(data);
        setRules((prev) => [...prev, newRule]);
        showSuccess(`Đã tạo quy tắc "${newRule.name}"`);
        return newRule;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create pricing rule";
        showError(`Lỗi tạo quy tắc: ${message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Update existing pricing rule
  const updateRule = useCallback(
    async (id: string, data: UpdatePricingRuleRequest): Promise<PricingRule | null> => {
      try {
        setLoading(true);
        const updatedRule = await pricingRuleService.updatePricingRule(id, data);
        setRules((prev) =>
          prev.map((rule) => (rule.id === id ? updatedRule : rule))
        );
        showSuccess(`Đã cập nhật quy tắc "${updatedRule.name}"`);
        return updatedRule;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update pricing rule";
        showError(`Lỗi cập nhật quy tắc: ${message}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Delete pricing rule (soft delete)
  const deleteRule = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        await pricingRuleService.deletePricingRule(id);
        if (includeInactive) {
          await loadRules();
        } else {
          setRules((prev) => prev.filter((rule) => rule.id !== id));
        }
        showSuccess("Đã xóa quy tắc định giá");
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete pricing rule";
        showError(`Lỗi xóa quy tắc: ${message}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [includeInactive, loadRules, showSuccess, showError]
  );

  // Reorder pricing rule (drag-drop)
  const reorderRule = useCallback(
    async (id: string, prevRank: string | null, nextRank: string | null): Promise<boolean> => {
      try {
        const currentIndex = rules.findIndex((r) => r.id === id);
        if (currentIndex === -1) return false;

        const rule = rules[currentIndex];
        const newRules = [...rules];
        newRules.splice(currentIndex, 1);

        let newIndex = 0;
        if (prevRank) {
          const prevIndex = newRules.findIndex((r) => r.rank === prevRank);
          newIndex = prevIndex >= 0 ? prevIndex + 1 : 0;
        } else if (nextRank) {
          const nextIndex = newRules.findIndex((r) => r.rank === nextRank);
          newIndex = nextIndex >= 0 ? nextIndex : newRules.length;
        }

        newRules.splice(newIndex, 0, rule);
        setRules(newRules);

        const updatedRule = await pricingRuleService.reorderPricingRule(id, {
          prevRank,
          nextRank,
        });

        setRules((prev) =>
          prev.map((r) => (r.id === id ? updatedRule : r))
        );

        return true;
      } catch (err) {
        await loadRules();
        const message = err instanceof Error ? err.message : "Failed to reorder pricing rule";
        showError(`Lỗi sắp xếp quy tắc: ${message}`);
        return false;
      }
    },
    [rules, loadRules, showError]
  );

  // Toggle active status
  const toggleActive = useCallback(
    async (id: string, isActive: boolean): Promise<boolean> => {
      return await updateRule(id, { isActive }) !== null;
    },
    [updateRule]
  );

  // Get rule by ID
  const getRuleById = useCallback(
    async (id: string): Promise<PricingRule | null> => {
      try {
        return await pricingRuleService.getPricingRuleById(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load pricing rule";
        showError(`Lỗi tải quy tắc: ${message}`);
        return null;
      }
    },
    [showError]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadRules();
      loadCalendarEvents();
    }
  }, [autoLoad, loadRules, loadCalendarEvents]);

  // Statistics
  const stats = {
    total: rules.length,
    active: rules.filter((r) => r.isActive).length,
    inactive: rules.filter((r) => !r.isActive).length,
    byType: {
      percentage: rules.filter((r) => r.adjustmentType === "PERCENTAGE").length,
      fixedAmount: rules.filter((r) => r.adjustmentType === "FIXED_AMOUNT").length,
    },
    byTimeMethod: {
      calendar: rules.filter((r) => r.calendarEventId !== null).length,
      dateRange: rules.filter(
        (r) => r.calendarEventId === null && r.startDate !== null && r.endDate !== null
      ).length,
      recurrence: rules.filter(
        (r) => r.calendarEventId === null && r.recurrenceRule !== null
      ).length,
    },
    avgAdjustment: {
      percentage:
        rules
          .filter((r) => r.adjustmentType === "PERCENTAGE")
          .reduce((sum, r) => sum + parseFloat(r.adjustmentValue), 0) /
          (rules.filter((r) => r.adjustmentType === "PERCENTAGE").length || 1),
      fixedAmount:
        rules
          .filter((r) => r.adjustmentType === "FIXED_AMOUNT")
          .reduce((sum, r) => sum + parseFloat(r.adjustmentValue), 0) /
          (rules.filter((r) => r.adjustmentType === "FIXED_AMOUNT").length || 1),
    },
  };

  return {
    rules,
    calendarEvents,
    stats,
    loading,
    eventsLoading,
    error,
    loadRules,
    loadCalendarEvents,
    createRule,
    updateRule,
    deleteRule,
    reorderRule,
    toggleActive,
    getRuleById,
  };
}
