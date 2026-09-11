import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletCards, ExternalLink, Zap, CheckCircle2, ShieldCheck } from "lucide-react";
import type { WalletInfo, WalletType } from "@/lib/midnight-wallet";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: WalletInfo[];
  onSelectWallet: (type: WalletType) => void;
  isConnecting: boolean;
}

export function WalletModal({
  open,
  onOpenChange,
  wallets,
  onSelectWallet,
  isConnecting,
}: WalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <WalletCards className="size-5 text-primary" />
            Connect Midnight Wallet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select your preferred Midnight Network wallet to sign private zero-knowledge transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4 transition-all hover:border-primary/50 hover:bg-secondary/70"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  {wallet.id === "lace" ? (
                    <ShieldCheck className="size-5" />
                  ) : wallet.id === "1am" ? (
                    <Zap className="size-5" />
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{wallet.name}</span>
                    {wallet.installed && (
                      <span className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{wallet.description}</p>
                </div>
              </div>

              <div>
                {wallet.installed || wallet.id === "sandbox" ? (
                  <Button
                    size="sm"
                    disabled={isConnecting}
                    onClick={() => {
                      onSelectWallet(wallet.id);
                      onOpenChange(false);
                    }}
                  >
                    Connect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-1 text-xs text-muted-foreground"
                  >
                    <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer">
                      Install <ExternalLink className="size-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
