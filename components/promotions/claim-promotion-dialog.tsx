/**
 * Claim Promotion Dialog Component
 * Allows customers to claim promotions by code
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tag, Sparkles } from "lucide-react";

interface ClaimPromotionDialogProps {
  onClaim: (code: string) => Promise<boolean>;
  isLoading?: boolean;
  trigger?: React.ReactNode;
}

export function ClaimPromotionDialog({
  onClaim,
  isLoading = false,
  trigger,
}: ClaimPromotionDialogProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const handleClaim = async () => {
    if (!code.trim()) return;

    const success = await onClaim(code.trim().toUpperCase());
    if (success) {
      setCode("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="gap-2">
            <Tag className="h-5 w-5" />
            Claim Promotion
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Claim Promotion
          </DialogTitle>
          <DialogDescription>
            Enter the promotion code to claim your discount. You can find
            available promotion codes in our promotions list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Promotion Code</Label>
            <Input
              id="code"
              placeholder="SUMMER2025"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleClaim()}
              className="uppercase font-mono text-lg tracking-wider"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Code is case-insensitive and will be auto-converted to uppercase.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleClaim}
            disabled={!code.trim() || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Claim Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
