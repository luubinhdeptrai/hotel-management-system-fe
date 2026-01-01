/**
 * Promotions Page - Employee View
 * Manage promotions: create, list, edit, disable/enable
 */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePromotions } from "@/hooks/use-promotions";
import { PromotionForm, PromotionCard, PromotionFilters } from "@/components/promotions";
import type {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  GetPromotionsParams,
} from "@/lib/types/promotion";
import { Plus, Tag, AlertCircle, Sparkles, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PromotionsPage() {
  const {
    promotions,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    disablePromotion,
    enablePromotion,
  } = usePromotions({ page: 1, limit: 20 });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle create
  const handleCreate = async (data: CreatePromotionRequest) => {
    setActionLoading(true);
    const result = await createPromotion(data);
    setActionLoading(false);

    if (result) {
      setShowCreateDialog(false);
    }
  };

  // Handle edit
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setShowEditDialog(true);
  };

  const handleUpdate = async (data: UpdatePromotionRequest) => {
    if (!editingPromotion) return;

    setActionLoading(true);
    const result = await updatePromotion(editingPromotion.id, data);
    setActionLoading(false);

    if (result) {
      setShowEditDialog(false);
      setEditingPromotion(null);
    }
  };

  // Handle disable/enable
  const handleDisable = async (id: string) => {
    await disablePromotion(id);
  };

  const handleEnable = async (id: string) => {
    await enablePromotion(id);
  };

  // Handle filters
  const handleFilter = (params: any) => {
    fetchPromotions({ ...params, page: 1 });
  };

  const handleResetFilters = () => {
    fetchPromotions({ page: 1, limit: 20 });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Modern Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-500 via-orange-500 to-rose-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
                Promotions Management
              </h1>
            </div>
            <p className="text-white/90 text-lg font-medium drop-shadow">
              Create and manage promotional offers for customers
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setShowCreateDialog(true)}
            className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-2xl hover:scale-105 transition-transform h-12 px-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Promotion
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-2 shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Error</AlertTitle>
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Modern Stats Cards with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-blue-100 opacity-60" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Total Promotions
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-black text-blue-900">{total}</div>
            <p className="text-xs text-blue-600 font-medium mt-1">All promotional offers</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-green-50 to-emerald-100 opacity-60" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Active Promotions
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-black text-emerald-900">
              {
                promotions.filter((p: Promotion) => {
                  const endDate = new Date(p.endDate);
                  return !p.disabledAt && !isNaN(endDate.getTime()) && endDate > new Date();
                }).length
              }
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Currently available</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-pink-50 to-purple-100 opacity-60" />
          <CardHeader className="relative pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Claims
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-black text-purple-900">
              {promotions.reduce(
                (sum: number, p: Promotion) => sum + (p._count?.customerPromotions || 0),
                0
              )}
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1">By customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filter Section */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-linear-to-r from-slate-50 to-slate-100 border-b-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-md">
              <Tag className="h-4 w-4 text-white" />
            </div>
            Search & Filter
          </CardTitle>
          <CardDescription className="font-medium">
            Find promotions by code, description, or date range
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <PromotionFilters
            onFilter={handleFilter}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Promotions Grid */}
      {loading && promotions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <Card className="relative overflow-hidden border-2 border-dashed border-slate-300 shadow-xl">
          <div className="absolute inset-0 bg-linear-to-br from-slate-50 to-slate-100 opacity-50" />
          <CardContent className="relative text-center py-16">
            <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6 shadow-lg">
              <Tag className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800">No promotions found</h3>
            <p className="text-slate-600 mb-6 font-medium">
              Get started by creating your first promotional offer
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-xl hover:scale-105 transition-transform"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion, index) => (
            <PromotionCard
              key={promotion.id || `promotion-${index}`}
              promotion={promotion}
              onEdit={handleEdit}
              onDisable={handleDisable}
              onEnable={handleEnable}
            />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-slate-100 to-slate-200 shadow-lg border-2 border-slate-300">
            <span className="text-sm font-bold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-sm font-semibold text-slate-600">
              {total} total promotion(s)
            </span>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
            <DialogDescription>
              Create a new promotional offer for customers to claim and use
              during booking.
            </DialogDescription>
          </DialogHeader>
          <PromotionForm
            onSubmit={(data) => handleCreate(data as CreatePromotionRequest)}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>
              Update promotion details. Changes will affect future claims and
              usage.
            </DialogDescription>
          </DialogHeader>
          <PromotionForm
            promotion={editingPromotion}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingPromotion(null);
            }}
            isLoading={actionLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
