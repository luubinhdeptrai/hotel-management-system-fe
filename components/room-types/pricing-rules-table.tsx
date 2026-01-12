import type { PricingRule, CreatePricingRuleRequest, UpdatePricingRuleRequest } from "@/lib/types/pricing";
import type { RoomType } from "@/lib/types/room";
import { useState } from "react";
import { GripVertical, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";

interface PricingRulesTableProps {
  rules: PricingRule[];
  roomTypes: RoomType[];
  onEdit: (rule: PricingRule) => void;
  onDelete: (ruleId: string) => void;
  onReorder: (id: string, prevRank: string | null, nextRank: string | null) => Promise<boolean>;
  onToggleActive: (ruleId: string, isActive: boolean) => Promise<void>;
  loading: boolean;
}

export function PricingRulesTable({
  rules,
  roomTypes,
  onEdit,
  onDelete,
  onReorder,
  onToggleActive,
  loading,
}: PricingRulesTableProps) {
  const [draggedRule, setDraggedRule] = useState<PricingRule | null>(null);
  const [reordering, setReordering] = useState(false);

  const handleDragStart = (rule: PricingRule) => {
    setDraggedRule(rule);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (targetRule: PricingRule) => {
    if (!draggedRule || draggedRule.id === targetRule.id) {
      setDraggedRule(null);
      return;
    }

    try {
      setReordering(true);
      // Calculate LexoRank for the new position
      const draggedIndex = rules.findIndex((r) => r.id === draggedRule.id);
      const targetIndex = rules.findIndex((r) => r.id === targetRule.id);

      let prevRank: string | null = null;
      let nextRank: string | null = null;

      if (draggedIndex > targetIndex) {
        // Moving up
        if (targetIndex > 0) {
          prevRank = rules[targetIndex - 1].rank;
        }
        nextRank = targetRule.rank;
      } else {
        // Moving down
        prevRank = targetRule.rank;
        if (targetIndex < rules.length - 1) {
          nextRank = rules[targetIndex + 1].rank;
        }
      }

      await onReorder(draggedRule.id, prevRank, nextRank);
    } finally {
      setReordering(false);
      setDraggedRule(null);
    }
  };

  if (rules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
        📋 Danh sách quy tắc (kéo để sắp xếp thứ tự)
      </div>
      <div className="space-y-2">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            draggable
            onDragStart={() => handleDragStart(rule)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(rule)}
            className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
              draggedRule?.id === rule.id
                ? "opacity-50 bg-violet-50 border-violet-300"
                : "border-gray-200 hover:border-violet-300 hover:bg-violet-50 cursor-move"
            } ${reordering ? "pointer-events-none" : ""}`}
          >
            {/* Drag Handle */}
            <div className="flex-shrink-0 text-gray-400 hover:text-violet-600">
              <GripVertical size={20} />
            </div>

            {/* Index */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
              {index + 1}
            </div>

            {/* Rule Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{rule.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex px-2 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded">
                  {rule.adjustmentType === "PERCENTAGE" ? "📊 %" : "💰 VND"}
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {rule.adjustmentType === "PERCENTAGE"
                    ? `${Number(rule.adjustmentValue) > 0 ? "+" : ""}${rule.adjustmentValue}%`
                    : `${Number(rule.adjustmentValue) > 0 ? "+" : ""}${Number(rule.adjustmentValue).toLocaleString("vi-VN")} VND`}
                </span>
              </div>
            </div>

            {/* Active Toggle */}
            <button
              onClick={() => onToggleActive(rule.id, !rule.isActive)}
              className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-gray-100"
              title={rule.isActive ? "Click to disable" : "Click to enable"}
            >
              {rule.isActive ? (
                <CheckCircle2 size={20} className="text-green-600" />
              ) : (
                <Circle size={20} className="text-gray-400" />
              )}
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(rule)}
              className="flex-shrink-0 p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Edit rule"
            >
              <Edit2 size={18} />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (window.confirm(`Bạn có chắc muốn xóa quy tắc "${rule.name}"?`)) {
                  onDelete(rule.id);
                }
              }}
              className="flex-shrink-0 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Delete rule"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
