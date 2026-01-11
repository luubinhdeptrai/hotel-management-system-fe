/**
 * Penalty & Surcharge Service Info Card
 * Displays penalty and surcharge service IDs stored in App Settings
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { serviceAPI, penaltyAPI, surchargeAPI } from "@/lib/services/service-unified.service";

export function PenaltySurchargeInfoCard() {
  const [penaltyService, setPenaltyService] = useState<{ id: string; name: string; price: number } | null>(null);
  const [surchargeService, setSurchargeService] = useState<{ id: string; name: string; price: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [PenaltySurchargeInfoCard] Starting loadServices...');

      // Load all services
      console.log('📡 [PenaltySurchargeInfoCard] Calling serviceAPI.getAllServices()');
      const allServices = await serviceAPI.getAllServices();
      console.log('✅ [PenaltySurchargeInfoCard] All services loaded:', {
        count: allServices.length,
        services: allServices
      });

      // Find penalty and surcharge services
      const penalty = allServices.find(s => s.name === 'Phạt');
      const surcharge = allServices.find(s => s.name === 'Phụ thu');

      console.log('🎯 [PenaltySurchargeInfoCard] Penalty service:', penalty);
      console.log('🎯 [PenaltySurchargeInfoCard] Surcharge service:', surcharge);

      if (penalty) setPenaltyService(penalty);
      if (surcharge) setSurchargeService(surcharge);

      // Show warning if not found
      if (!penalty) {
        console.warn('⚠️ [PenaltySurchargeInfoCard] Penalty service "Phạt" not found in Backend seed data');
      }
      if (!surcharge) {
        console.warn('⚠️ [PenaltySurchargeInfoCard] Surcharge service "Phụ thu" not found in Backend seed data');
      }
    } catch (err) {
      console.error('❌ [PenaltySurchargeInfoCard] Failed to load penalty/surcharge services:', err);
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          Cài đặt Phạt & Phụ Thu
        </CardTitle>
        <CardDescription>
          Thông tin về các dịch vụ phạt và phụ thu hệ thống
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Penalty Service */}
            <div className="space-y-2 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-700 dark:text-red-400">
                  Dịch vụ Phạt
                </span>
                {penaltyService ? (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Có sẵn
                  </Badge>
                ) : (
                  <Badge variant="destructive">Chưa cấu hình</Badge>
                )}
              </div>

              {penaltyService ? (
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">ID:</span>
                    <code className="ml-2 px-2 py-1 bg-white dark:bg-black rounded text-xs font-mono">
                      {penaltyService.id}
                    </code>
                  </p>
                  <p>
                    <span className="font-medium">Tên:</span> {penaltyService.name}
                  </p>
                  <p>
                    <span className="font-medium">Giá mặc định:</span>{" "}
                    <code className="px-1 bg-white dark:bg-black rounded text-xs">
                      {penaltyService.price} VND
                    </code>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ⚠️ Dịch vụ phạt chưa được cấu hình. Vui lòng kiểm tra Backend seed data.
                </p>
              )}
            </div>

            {/* Surcharge Service */}
            <div className="space-y-2 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  Dịch vụ Phụ Thu
                </span>
                {surchargeService ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Có sẵn
                  </Badge>
                ) : (
                  <Badge variant="destructive">Chưa cấu hình</Badge>
                )}
              </div>

              {surchargeService ? (
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">ID:</span>
                    <code className="ml-2 px-2 py-1 bg-white dark:bg-black rounded text-xs font-mono">
                      {surchargeService.id}
                    </code>
                  </p>
                  <p>
                    <span className="font-medium">Tên:</span> {surchargeService.name}
                  </p>
                  <p>
                    <span className="font-medium">Giá mặc định:</span>{" "}
                    <code className="px-1 bg-white dark:bg-black rounded text-xs">
                      {surchargeService.price} VND
                    </code>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ⚠️ Dịch vụ phụ thu chưa được cấu hình. Vui lòng kiểm tra Backend seed data.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <Alert className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>Chú ý:</strong> Các dịch vụ phạt và phụ thu được quản lý theo từng booking. 
            Xem chi tiết tại màn hình <strong>"Phạt"</strong> và <strong>"Phụ Thu"</strong> trong menu quản lý.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
