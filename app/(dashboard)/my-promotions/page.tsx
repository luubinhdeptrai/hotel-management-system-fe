/**
 * My Promotions Page - Customer View
 * View available promotions and claimed promotions
 */

"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCustomerPromotions } from "@/hooks/use-customer-promotions";
import { CustomerPromotionCard } from "@/components/promotions/customer-promotion-card";
import { ClaimPromotionDialog } from "@/components/promotions/claim-promotion-dialog";
import {
  Tag,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Gift,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyPromotionsPage() {
  const {
    availablePromotions,
    availableTotal,
    availableLoading,
    myPromotions,
    myTotal,
    myLoading,
    error,
    fetchAvailablePromotions,
    fetchMyPromotions,
    claimPromotion,
  } = useCustomerPromotions();

  const [claiming, setClaiming] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchAvailablePromotions({ limit: 50 });
    fetchMyPromotions({ limit: 50 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle claim
  const handleClaim = async (code: string): Promise<boolean> => {
    setClaiming(true);
    const result = await claimPromotion(code);
    setClaiming(false);
    return !!result;
  };

  // Count by status
  const availableCount = myPromotions.filter(
    (p) => p.status === "AVAILABLE"
  ).length;
  const usedCount = myPromotions.filter((p) => p.status === "USED").length;
  const expiredCount = myPromotions.filter(
    (p) => p.status === "EXPIRED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Gift className="h-8 w-8 text-primary" />
            My Promotions
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and claim exclusive promotional offers
          </p>
        </div>
        <ClaimPromotionDialog onClaim={handleClaim} isLoading={claiming} />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Available to Claim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {availableTotal}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Ready to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {availableCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-500" />
              Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{usedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {expiredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="available" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Available ({availableTotal})
          </TabsTrigger>
          <TabsTrigger value="my-promotions" className="gap-2">
            <Gift className="h-4 w-4" />
            My Promotions ({myTotal})
          </TabsTrigger>
        </TabsList>

        {/* Available Promotions Tab */}
        <TabsContent value="available" className="space-y-6 mt-6">
          {availableLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availablePromotions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No promotions available
                </h3>
                <p className="text-muted-foreground">
                  Check back later for new promotional offers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Alert className="border-primary/50 bg-primary/5">
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Available Promotions</AlertTitle>
                <AlertDescription>
                  Browse and claim exclusive discounts. Each promotion has usage
                  limits and validity periods. Claimed promotions will appear in
                  &quot;My Promotions&quot; tab.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePromotions.map((promotion) => (
                  <CustomerPromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    onClaim={handleClaim}
                    showClaimButton
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* My Promotions Tab */}
        <TabsContent value="my-promotions" className="space-y-6 mt-6">
          {myLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myPromotions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No claimed promotions
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t claimed any promotions yet. Browse available
                  promotions to get started!
                </p>
                <ClaimPromotionDialog
                  onClaim={handleClaim}
                  isLoading={claiming}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status Filter Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3" />
                  {availableCount} Ready to Use
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {usedCount} Used
                </Badge>
                {expiredCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {expiredCount} Expired
                  </Badge>
                )}
              </div>

              {/* Promotions Grid - Grouped by Status */}
              <div className="space-y-8">
                {/* Available */}
                {availableCount > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Ready to Use
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myPromotions
                        .filter((cp) => cp.status === "AVAILABLE")
                        .map((customerPromotion) => (
                          <CustomerPromotionCard
                            key={customerPromotion.id}
                            promotion={customerPromotion.promotion!}
                            customerPromotion={customerPromotion}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Used */}
                {usedCount > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-5 w-5" />
                      Used
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myPromotions
                        .filter((cp) => cp.status === "USED")
                        .map((customerPromotion) => (
                          <CustomerPromotionCard
                            key={customerPromotion.id}
                            promotion={customerPromotion.promotion!}
                            customerPromotion={customerPromotion}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Expired */}
                {expiredCount > 0 && (
                  <div className="space-y-4 opacity-60">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-5 w-5" />
                      Expired
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myPromotions
                        .filter((cp) => cp.status === "EXPIRED")
                        .map((customerPromotion) => (
                          <CustomerPromotionCard
                            key={customerPromotion.id}
                            promotion={customerPromotion.promotion!}
                            customerPromotion={customerPromotion}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
