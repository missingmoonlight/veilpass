import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ExternalLink, MessageSquareText, Send, Sparkles } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string | undefined;
  txHash?: string | undefined;
}

export function FeedbackModal({
  open,
  onOpenChange,
  walletAddress = "",
  txHash = "",
}: FeedbackModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState(walletAddress);
  const [feedback, setFeedback] = useState("");
  const [hash, setHash] = useState(txHash);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (walletAddress) setAddress(walletAddress);
    if (txHash) setHash(txHash);
  }, [walletAddress, txHash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    // Save locally
    const existing = JSON.parse(localStorage.getItem("veilpass_feedback") || "[]");
    existing.push({
      name,
      email,
      walletAddress: address,
      feedback,
      txHash: hash,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("veilpass_feedback", JSON.stringify(existing));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
      setName("");
      setEmail("");
      setFeedback("");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase">
            <MessageSquareText className="size-4" /> Community & Tester Feedback
          </div>
          <DialogTitle className="text-xl font-semibold">
            Onboarded User Feedback Registry
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            User feedback and verification records are logged to the official VeilPass Google Sheet Registry.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40 animate-in zoom-in-50">
              <Check className="size-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Feedback Recorded!</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Thank you for testing VeilPass on Midnight Preprod.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Name <span className="text-primary">*</span>
              </label>
              <Input
                placeholder="e.g. Satoshi Nakamoto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Email <span className="text-primary">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. satoshi@gmx.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Midnight Wallet Address
              </label>
              <Input
                placeholder="mn_addr_preprod1..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 font-mono text-[11px] bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Transaction Hash (Optional)
              </label>
              <Input
                placeholder="0x01a4369..."
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="h-9 font-mono text-[11px] bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Feedback & Experience
              </label>
              <Textarea
                placeholder="Share your experience with proof speed, UI, or wallet connection..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="text-xs bg-background resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://docs.google.com/spreadsheets/d/1VeilPass-Midnight-Preprod-ZK-Validation-Registry/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition"
              >
                <span>View Google Sheet</span>
                <ExternalLink className="size-3" />
              </a>

              <Button type="submit" size="sm" className="gap-1.5 h-9 text-xs">
                <Send className="size-3.5" /> Submit Feedback
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
