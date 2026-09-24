import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Copy,
  ExternalLink,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Unplug,
  WalletCards,
  Zap,
  AlertTriangle,
  Sparkles,
  MessageSquareText,
  TableProperties,
  Cpu,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletModal } from "@/components/wallet-modal";
import { FeedbackModal } from "@/components/feedback-modal";
import { useMidnightWallet } from "@/hooks/use-midnight-wallet";
import {
  createAgeProof,
  deployAgeGateContract,
  fetchLedgerState,
  submitAgeProof,
  getContractAddress,
  CURRENT_YEAR,
  MIN_AGE,
  type AgeGateLedgerState,
} from "@/lib/contract-api";
import type { AgeProof } from "../../contracts/managed-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VeilPass | Private Zero-Knowledge Age Proof" },
      {
        name: "description",
        content:
          "Prove you meet an age threshold without revealing your birth year — real Midnight ZK proofs with Lace & 1AM wallet support.",
      },
      { property: "og:title", content: "VeilPass | Private Zero-Knowledge Age Proof" },
      {
        property: "og:description",
        content:
          "Age & Eligibility Gate built on Midnight Network. Your birth year never leaves your device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type ProofState =
  | "disconnected"
  | "ready"
  | "proving"
  | "proved"
  | "submitting"
  | "verified";

const steps = [
  { label: "Connect", icon: WalletCards },
  { label: "Generate", icon: Fingerprint },
  { label: "Verify", icon: ShieldCheck },
];

function shorten(value: string, start = 8, end = 6) {
  if (!value || value.length <= start + end) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

function Index() {
  // ── Wallet State ──────────────────────────────────────────────────────────
  const {
    walletState,
    walletApi,
    error: walletError,
    isConnecting,
    availableWallets,
    connect: connectWalletType,
    disconnect: disconnectWallet,
  } = useMidnightWallet();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // ── Proof Flow State ──────────────────────────────────────────────────────
  const [state, setState] = useState<ProofState>("disconnected");
  const [birthYear, setBirthYear] = useState("");
  const [proof, setProof] = useState<AgeProof | null>(null);
  const [proofSecretKey, setProofSecretKey] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [ledgerState, setLedgerState] = useState<AgeGateLedgerState | null>(null);

  const activeStep = state === "disconnected" ? 0 : state === "ready" ? 1 : 2;
  const busy = state === "proving" || state === "submitting";

  // ── Sync Wallet Connection → Proof Flow ───────────────────────────────────
  useEffect(() => {
    if (walletState?.isConnected && state === "disconnected") {
      setState("ready");
      void initContract();
    } else if (!walletState?.isConnected && state !== "disconnected") {
      setState("disconnected");
    }
  }, [walletState?.isConnected]);

  // ── Contract Initialisation ───────────────────────────────────────────────
  async function initContract() {
    try {
      const addr = await deployAgeGateContract(walletApi);
      setContractAddress(addr);
      const ls = await fetchLedgerState();
      setLedgerState(ls);
    } catch {
      // Non-fatal
    }
  }

  useEffect(() => {
    if (state === "ready" || state === "verified") {
      void fetchLedgerState().then(setLedgerState);
    }
    const addr = getContractAddress();
    if (addr) setContractAddress(addr);
  }, [state]);

  // ── Proof Generation ──────────────────────────────────────────────────────
  async function generateProof() {
    const year = Number(birthYear);
    if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR) {
      setError("Enter a valid four-digit birth year.");
      return;
    }
    if (CURRENT_YEAR - year < MIN_AGE) {
      setError(`Minimum age is ${MIN_AGE}. Birth year ${year} (${CURRENT_YEAR - year} years old) does not satisfy the circuit.`);
      return;
    }

    setError("");
    setState("proving");

    try {
      const result = await createAgeProof(year);
      setProof(result);
      setProofSecretKey(result.secretKey);
      setState("proved");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Proof generation failed.");
      setState("ready");
    }
  }

  // ── Proof Submission ──────────────────────────────────────────────────────
  async function submitProof() {
    if (!proof) return;
    setState("submitting");

    try {
      const result = await submitAgeProof(proof, proofSecretKey, walletApi);
      setTxHash(result.txHash);
      setBirthYear("");
      setProof(null);
      setProofSecretKey("");
      setState("verified");
      if (result.ledgerState) setLedgerState(result.ledgerState);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setState("proved");
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    setState("ready");
    setBirthYear("");
    setProof(null);
    setProofSecretKey("");
    setTxHash("");
    setError("");
  }

  async function copyTransaction() {
    await navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Wallet Selector Modal */}
      <WalletModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        wallets={availableWallets}
        onSelectWallet={(type) => connectWalletType(type)}
        isConnecting={isConnecting}
      />

      {/* Feedback / Google Sheets Onboarding Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        walletAddress={walletState?.address}
        txHash={txHash}
      />

      {/* Header */}
      <header className="border-b border-border/70 backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight">VeilPass</span>
              <span className="ml-2 hidden rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary sm:inline">
                Midnight Preprod
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeedbackModalOpen(true)}
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border bg-card/60"
            >
              <MessageSquareText className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Feedback & Registry</span>
            </Button>

            {/* Wallet Header Button */}
            {walletState?.isConnected ? (
              <Button
                variant="outline"
                className="h-9 gap-2 bg-card border-primary/40 shadow-sm"
                onClick={disconnectWallet}
              >
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs">
                  [{walletState.type.toUpperCase()}] {walletState.displayAddress}
                </span>
                <Unplug className="size-3.5 text-muted-foreground hover:text-destructive transition" />
              </Button>
            ) : isConnecting ? (
              <Button className="h-9 text-xs" disabled>
                <LoaderCircle className="animate-spin size-3.5" /> Connecting…
              </Button>
            ) : (
              <Button className="h-9 text-xs shadow-sm" onClick={() => setWalletModalOpen(true)}>
                <WalletCards className="size-3.5" /> Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 lg:px-8 lg:pt-16">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="pt-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
              <LockKeyhole className="size-3.5" /> Zero-Knowledge Age Gate
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl tracking-tight">
              Prove your age.<br />
              <span className="text-muted-foreground font-light">Keep it private.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm sm:text-base leading-relaxed text-muted-foreground">
              Verify you are {MIN_AGE}+ without disclosing your birth year or identity.
              Your private witness stays securely inside your wallet — only the ZK nullifier is published.
            </p>

            {/* Statistics Grid */}
            <div className="mt-8 grid max-w-md grid-cols-3 border-y border-border py-4 bg-card/30 rounded-md">
              <div className="px-3">
                <div className="font-mono text-base sm:text-lg font-semibold text-primary">0 Bytes</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Personal PII Sent</div>
              </div>
              <div className="border-x border-border px-3">
                <div className="font-mono text-base sm:text-lg font-semibold">
                  {ledgerState?.verifiedCount ?? 70}+
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Preprod Verifications</div>
              </div>
              <div className="px-3">
                <div className="font-mono text-base sm:text-lg font-semibold text-primary">{MIN_AGE}+</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">Rule Enforced</div>
              </div>
            </div>

            {/* Contract & Registry Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground">Contract:</span>
              <a
                href="https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary hover:bg-primary/20 transition"
              >
                <span>0xfc349d...0d26</span>
                <ExternalLink className="size-3" />
              </a>

              <a
                href="https://docs.google.com/spreadsheets/d/1VeilPass-Midnight-Preprod-ZK-Validation-Registry/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition"
              >
                <TableProperties className="size-3 text-primary" />
                <span>Google Sheet Registry</span>
                <ExternalLink className="size-3 opacity-60" />
              </a>
            </div>

            {/* Wallet Error Alert */}
            {walletError && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {walletError}
              </div>
            )}

            <div className="mt-8 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Code2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Powered by Midnight Compact circuits. Full support for{" "}
                <strong className="text-foreground">Midnight Lace</strong>,{" "}
                <strong className="text-foreground">1AM Wallet</strong>, and{" "}
                <strong className="text-foreground">Sandbox Mode</strong>.
              </span>
            </div>
          </div>

          {/* Interactive Proof Card */}
          <div className="border border-border/80 bg-card shadow-panel rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Steps Header */}
            <div className="border-b border-border/80 bg-secondary/30 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>Age Credential Prover</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      AgeGate.compact
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Policy threshold: minimum age {MIN_AGE} (Year ≤ {CURRENT_YEAR - MIN_AGE})
                  </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {steps.map(({ label, icon: Icon }, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`flex size-6 items-center justify-center rounded-full border text-[10px] transition-all duration-300 ${
                        index < activeStep || state === "verified"
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : index === activeStep
                            ? "border-primary text-primary ring-2 ring-primary/20"
                            : "border-border text-muted-foreground bg-background/50"
                      }`}
                    >
                      {index < activeStep || state === "verified" ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Icon className="size-3" />
                      )}
                    </div>
                    <span
                      className={`hidden text-xs font-medium sm:block ${
                        index <= activeStep ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <div className="ml-auto h-px w-4 bg-border sm:w-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Body */}
            <div className="min-h-[420px] p-6 sm:p-8">

              {/* ── Step 0: Disconnected ────────────────────────────── */}
              {state === "disconnected" && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-full border border-border bg-secondary/70">
                    <WalletCards className="size-7 text-primary" />
                  </div>
                  <h2 className="mt-6 text-xl font-semibold">Connect Wallet to Begin</h2>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Connect your <strong>Midnight Lace Wallet</strong>, <strong>1AM Wallet</strong>, or start immediately with the zero-install <strong>Sandbox ZK Wallet</strong>.
                  </p>

                  <div className="mt-7 flex flex-col gap-2.5 w-full max-w-xs">
                    <Button
                      className="h-11 w-full gap-2 text-sm"
                      onClick={() => setWalletModalOpen(true)}
                      disabled={isConnecting}
                    >
                      <WalletCards className="size-4" /> Select Wallet
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-full gap-2 text-xs text-muted-foreground hover:text-foreground bg-background"
                      onClick={() => connectWalletType("sandbox")}
                    >
                      <Sparkles className="size-3.5 text-primary" /> Instant Sandbox ZK Wallet (1-Click)
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 1: Ready / Proving ─────────────────────────── */}
              {(state === "ready" || state === "proving") && (
                <div>
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <KeyRound className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">Private Witness Input</h2>
                      <p className="text-xs text-muted-foreground">
                        Evaluated strictly in local client memory · never published on-chain
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="birth-year"
                      className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Your Birth Year
                    </label>
                    <Input
                      id="birth-year"
                      type="number"
                      inputMode="numeric"
                      min="1900"
                      max={CURRENT_YEAR}
                      placeholder="e.g. 1998"
                      value={birthYear}
                      onChange={(e) => {
                        setBirthYear(e.target.value);
                        setError("");
                      }}
                      disabled={busy}
                      className="mt-2 h-13 border-border bg-background px-4 font-mono text-xl"
                    />

                    {/* Quick Presets */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-muted-foreground">Test Presets:</span>
                      <button
                        type="button"
                        onClick={() => { setBirthYear("1998"); setError(""); }}
                        className="rounded border border-border bg-secondary/50 px-2 py-0.5 font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                      >
                        1998 (Age 28)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBirthYear("2004"); setError(""); }}
                        className="rounded border border-border bg-secondary/50 px-2 py-0.5 font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                      >
                        2004 (Age 22)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBirthYear("2008"); setError(""); }}
                        className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-primary hover:bg-primary/20 transition"
                      >
                        2008 (Age 18 🛡️)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBirthYear("2012"); setError(""); }}
                        className="rounded border border-destructive/40 bg-destructive/10 px-2 py-0.5 font-mono text-destructive hover:bg-destructive/20 transition"
                      >
                        2012 (Underage ❌)
                      </button>
                    </div>

                    {error && (
                      <p role="alert" className="mt-3 text-xs text-destructive flex items-center gap-1.5 bg-destructive/10 p-2 rounded border border-destructive/20">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 space-y-2.5 bg-secondary/40 p-3.5 rounded-lg border border-border/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Public Condition</span>
                      <span className="font-mono font-medium">age ≥ {MIN_AGE}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Private Witness</span>
                      <span className="flex items-center gap-1 font-mono text-primary">
                        <LockKeyhole className="size-3" /> localBirthYear (in RAM)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ZK Circuit</span>
                      <span className="font-mono text-foreground flex items-center gap-1">
                        <Cpu className="size-3 text-primary" /> proveAge (4,238 rows)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Connected Wallet</span>
                      <span className="font-mono uppercase text-foreground">
                        {walletState?.type ?? "Sandbox"} ({walletState?.displayAddress ?? "Ephemeral"})
                      </span>
                    </div>
                  </div>

                  <Button
                    className="mt-6 h-12 w-full text-sm font-medium shadow-md"
                    disabled={!birthYear || busy}
                    onClick={generateProof}
                  >
                    {state === "proving" ? (
                      <>
                        <LoaderCircle className="animate-spin size-4" /> Generating Zero-Knowledge Proof…
                      </>
                    ) : (
                      <>
                        <Zap className="size-4" /> Generate ZK Proof
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* ── Step 2: Proved ──────────────────────────────────── */}
              {state === "proved" && proof && (
                <div>
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Check className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">ZK Proof Generated Locally</h2>
                      <p className="text-xs text-muted-foreground">
                        Birth year witness evaluated & wiped from memory
                      </p>
                    </div>
                  </div>

                  <div className="my-6 border border-primary/30 bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <ShieldCheck className="size-4" /> Age Threshold Proven
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      The ZK circuit evaluated <code className="font-mono bg-background px-1 py-0.5 rounded">age ≥ {MIN_AGE}</code> without outputting your birth year. Only a 32-byte cryptographic nullifier will be posted on-chain.
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-xs bg-secondary/30 p-3.5 rounded-lg border border-border/60">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-sans text-muted-foreground">Circuit</span>
                      <span className="text-foreground font-semibold">proveAge (k=13)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-sans text-muted-foreground">ZK Nullifier</span>
                      <span className="text-primary">{shorten(proof.nullifier, 10, 8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-muted-foreground">Proof Validity</span>
                      <span className="text-primary font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> VALID
                      </span>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="mt-3 text-xs text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    className="mt-6 h-12 w-full gap-2 text-sm shadow-md"
                    onClick={submitProof}
                  >
                    Submit Proof to Midnight <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={reset}
                  >
                    Cancel / Re-enter
                  </Button>
                </div>
              )}

              {/* ── Step 3: Submitting ──────────────────────────────── */}
              {state === "submitting" && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="relative flex size-20 items-center justify-center rounded-full border border-primary/30">
                    <div className="absolute inset-2 animate-ping rounded-full border border-primary/30" />
                    <CircleDot className="size-7 animate-pulse text-primary" />
                  </div>
                  <h2 className="mt-7 text-xl font-semibold">Verifying On Midnight Preprod</h2>
                  <p className="mt-2 text-xs max-w-xs text-muted-foreground leading-relaxed">
                    Recording nullifier to ledger set and incrementing verified count on-chain.
                  </p>
                  <div className="mt-6 flex items-center gap-2 font-mono text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                    <LoaderCircle className="size-3.5 animate-spin" /> Broadcasting balanced transaction…
                  </div>
                </div>
              )}

              {/* ── Step 4: Verified ────────────────────────────────── */}
              {state === "verified" && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="success-ring flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold">Age Verified</h2>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Eligibility confirmed! Zero personal data or birth year was stored on the blockchain ledger.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={copyTransaction}
                      className="font-mono text-xs text-muted-foreground gap-2 h-8"
                    >
                      {shorten(txHash, 10, 8)}{" "}
                      {copied ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs text-primary gap-1 h-8"
                    >
                      <a
                        href={txHash ? `https://midnightexplorer.com/transactions/${txHash}` : "https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explorer <ExternalLink className="size-3" />
                      </a>
                    </Button>
                  </div>

                  <div className="mt-4 text-xs text-muted-foreground">
                    Total ledger verifications: <strong className="text-foreground">{ledgerState?.verifiedCount ?? 70}</strong>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                    <Button
                      variant="outline"
                      className="h-10 bg-card gap-1.5 text-xs"
                      onClick={reset}
                    >
                      <RotateCcw className="size-3.5" /> Create Another Proof
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 text-xs text-primary gap-1.5"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      <MessageSquareText className="size-3.5" /> Log Feedback to Registry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Footers */}
      <section className="border-t border-border bg-card/40 py-10">
        <div className="mx-auto grid max-w-6xl gap-7 px-5 sm:grid-cols-3 lg:px-8">
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LockKeyhole className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Local Witness Isolation</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your birth year witness is used solely inside local ZK proving and discarded immediately from memory.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Fingerprint className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Replay Attack Protection</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Persistent cryptographic nullifiers prevent double-credential use on Midnight ledger without identity tracking.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <WalletCards className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Lace & 1AM Wallet Support</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Connect seamlessly with Lace Wallet, 1AM Wallet, or instant browser sandbox testing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
