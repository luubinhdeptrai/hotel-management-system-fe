/**
 * Customer Ranks Management Page
 * Full CRUD interface for managing customer ranks
 * Redesigned with modern, professional UI
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RankForm } from "@/components/customer-ranks/rank-form";
import { RankBadge } from "@/components/customer-ranks/rank-badge";
import { RankStatistics } from "@/components/customer-ranks/rank-statistics";
import { useCustomerRanks } from "@/hooks/use-customer-ranks";
import { formatSpending } from "@/lib/types/customer-rank";
import type { CustomerRank, CreateCustomerRankRequest, UpdateCustomerRankRequest } from "@/lib/types/customer-rank";
import { Plus, Pencil, Trash2, RefreshCw, Sparkles } from "lucide-react";

export default function CustomerRanksPage() {
  const {
    ranks,
    statistics,
    loading,
    createRank,
    updateRank,
    deleteRank,
    refetch,
  } = useCustomerRanks();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<CustomerRank | null>(null);
  const [deletingRankId, setDeletingRankId] = useState<string | null>(null);

  const handleCreate = async (data: CreateCustomerRankRequest | UpdateCustomerRankRequest) => {
    const result = await createRank(data as CreateCustomerRankRequest);
    if (result) {
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdate = async (data: CreateCustomerRankRequest | UpdateCustomerRankRequest) => {
    if (!editingRank) return;
    const result = await updateRank(editingRank.id, data as UpdateCustomerRankRequest);
    if (result) {
      setEditingRank(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingRankId) return;
    const success = await deleteRank(deletingRankId);
    if (success) {
      setDeletingRankId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-lg shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Quản lý hạng khách hàng
                  </h1>
                  <p className="mt-1 bg-gradient-to-r from-slate-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent font-medium">
                    Thiết lập và quản lý các hạng khách hàng dựa trên chi tiêu tích lũy
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={refetch} 
                disabled={loading}
                className="h-10 w-10 bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border-cyan-300 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-600" : "text-cyan-600"}`} />
              </Button>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo hạng mới
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="animate-fade-in-delay">
          <RankStatistics statistics={statistics} loading={loading} />
        </div>

        {/* Ranks Table Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in-delay-2">
          <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50">
            <div className="space-y-1">
              <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Danh sách hạng khách hàng</CardTitle>
              <CardDescription>
                Hệ thống tự động xếp hạng khách hàng dựa trên tổng chi tiêu. Bạn có thể tạo, chỉnh sửa hoặc xóa các hạng.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading && ranks.length === 0 ? (
              <div className="py-16 text-center">
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-slate-200 rounded w-24 mx-auto"></div>
                  <div className="h-4 bg-slate-100 rounded w-32 mx-auto"></div>
                </div>
              </div>
            ) : ranks.length === 0 ? (
              <div className="py-16 text-center">
                <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-lg p-12 border-2 border-dashed border-cyan-300">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2">Chưa có hạng nào</h3>
                  <p className="text-slate-600 mb-6">Hãy tạo hạng đầu tiên để bắt đầu quản lý khách hàng của bạn</p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo hạng đầu tiên
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {ranks.map((rank, index) => {
                  const breakdown = statistics?.rankBreakdown?.find(
                    (b) => b.rankId === rank.id
                  );
                  
                  let benefits: Record<string, boolean> = {};
                  try {
                    if (typeof rank.benefits === 'string') {
                      benefits = JSON.parse(rank.benefits);
                    } else if (typeof rank.benefits === 'object' && rank.benefits) {
                      benefits = rank.benefits as Record<string, boolean>;
                    }
                  } catch (e) {
                    console.error("Error parsing benefits:", e);
                    benefits = {};
                  }

                  // Color variants for each rank
                  const rankColors = [
                    { border: "cyan-300", bg: "from-cyan-50 to-blue-50", hover: "hover:border-cyan-400", text: "cyan" },
                    { border: "indigo-300", bg: "from-indigo-50 to-purple-50", hover: "hover:border-indigo-400", text: "indigo" },
                    { border: "blue-300", bg: "from-blue-50 to-cyan-50", hover: "hover:border-blue-400", text: "blue" },
                    { border: "purple-300", bg: "from-purple-50 to-pink-50", hover: "hover:border-purple-400", text: "purple" },
                  ];
                  const colorSet = rankColors[index % rankColors.length];

                  return (
                    <div
                      key={rank.id}
                      className={`group border-2 border-${colorSet.border} rounded-lg p-4 bg-gradient-to-br ${colorSet.bg} ${colorSet.hover} hover:shadow-md transition-all duration-300`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        borderColor: `var(--color-${colorSet.text}-300)`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <RankBadge rank={rank} className="text-lg" />
                            <span className={`text-sm font-semibold text-${colorSet.text}-700 bg-${colorSet.text}-100 px-3 py-1 rounded-full`}>
                              {breakdown ? breakdown.customerCount : 0} khách hàng
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                            <div>
                              <p className={`text-${colorSet.text}-600 font-medium mb-1`}>Chi tiêu tối thiểu</p>
                              <p className="text-base font-semibold text-slate-900">{formatSpending(rank.minSpending)}</p>
                            </div>
                            <div>
                              <p className={`text-${colorSet.text}-600 font-medium mb-1`}>Chi tiêu tối đa</p>
                              <p className="text-base font-semibold text-slate-900">
                                {rank.maxSpending ? formatSpending(rank.maxSpending) : "Không giới hạn"}
                              </p>
                            </div>
                            <div>
                              <p className={`text-${colorSet.text}-600 font-medium mb-1`}>Quyền lợi</p>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const benefitKeys = Object.keys(benefits || {}).filter(key => benefits[key as keyof typeof benefits]);
                                  return (
                                    <>
                                      {benefitKeys.slice(0, 3).map((key, idx) => {
                                        const benefitColors = ["from-orange-400 to-red-500", "from-yellow-400 to-orange-500", "from-green-400 to-emerald-500"];
                                        return (
                                          <span key={key} className={`bg-gradient-to-r ${benefitColors[idx % benefitColors.length]} text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md`}>
                                            {key.slice(0, 12)}
                                          </span>
                                        );
                                      })}
                                      {benefitKeys.length > 3 && (
                                        <span className="bg-gradient-to-r from-slate-400 to-slate-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                                          +{benefitKeys.length - 3}
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingRank(rank)}
                            disabled={loading}
                            className="h-9 w-9 bg-gradient-to-br from-indigo-100 to-blue-100 hover:from-indigo-200 hover:to-blue-200 text-indigo-600 shadow-sm hover:shadow-md transition-all"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingRankId(rank.id)}
                            disabled={loading}
                            className="h-9 w-9 bg-gradient-to-br from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-600 shadow-sm hover:shadow-md transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white to-cyan-50">
          <DialogHeader className="border-b border-gradient-to-r from-indigo-200 to-cyan-200 pb-4 bg-gradient-to-r from-indigo-50 to-cyan-50">
            <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Tạo hạng khách hàng mới</DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              Thiết lập ngưỡng chi tiêu và quyền lợi cho hạng mới. Hệ thống sẽ tự động phân loại khách hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <RankForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              loading={loading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRank} onOpenChange={() => setEditingRank(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white to-indigo-50">
          <DialogHeader className="border-b border-gradient-to-r from-blue-200 to-indigo-200 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chỉnh sửa hạng khách hàng</DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              Cập nhật thông tin, ngưỡng chi tiêu và quyền lợi của hạng này.
            </DialogDescription>
          </DialogHeader>
          {editingRank && (
            <div className="pt-4">
              <RankForm
                rank={editingRank}
                onSubmit={handleUpdate}
                onCancel={() => setEditingRank(null)}
                loading={loading}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingRankId}
        onOpenChange={() => setDeletingRankId(null)}
      >
        <AlertDialogContent className="border-2 border-red-200 shadow-2xl bg-gradient-to-br from-white to-red-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Xác nhận xóa hạng</AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-base text-slate-600">
              Bạn có chắc chắn muốn xóa hạng này? Các khách hàng thuộc hạng này sẽ chuyển về trạng thái <strong>chưa có hạng</strong>. Hành động này <strong>không thể hoàn tác</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel disabled={loading} className="bg-slate-100 hover:bg-slate-200">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
            >
              {loading ? "Đang xóa..." : "Xóa hạng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSS Animation Classes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDelay {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeInDelay 0.6s ease-out 0.1s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeInDelay 0.6s ease-out 0.2s both;
        }

        .group {
          position: relative;
        }
      `}</style>
    </div>
  );
}
