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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletModal } from "@/components/wallet-modal";
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
      setError(`You must be at least ${MIN_AGE} years old.`);
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

      {/* Header */}
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Fingerprint className="size-5" />
            </div>
            <span className="text-lg font-semibold">VeilPass</span>
            <span className="hidden rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground sm:inline">
              Midnight Preprod
            </span>
          </div>

          {/* Wallet Header Button */}
          {walletState?.isConnected ? (
            <Button
              variant="outline"
              className="h-10 gap-2 bg-card border-primary/30"
              onClick={disconnectWallet}
            >
              <span className="size-2 rounded-full bg-success animate-pulse" />
              <span className="font-mono text-xs">
                [{walletState.type.toUpperCase()}] {walletState.displayAddress}
              </span>
              <Unplug className="size-3.5 text-muted-foreground" />
            </Button>
          ) : isConnecting ? (
            <Button className="h-10" disabled>
              <LoaderCircle className="animate-spin" /> Connecting…
            </Button>
          ) : (
            <Button className="h-10" onClick={() => setWalletModalOpen(true)}>
              <WalletCards /> Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:px-8 lg:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div className="pt-2">
            <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase text-primary">
              <LockKeyhole className="size-4" /> Zero-Knowledge Age Gate
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Prove your age.<br />
              <span className="text-muted-foreground">Keep it private.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">
              Verify you are {MIN_AGE}+ without disclosing your birth year or identity.
              Your private witness stays in your wallet — only the ZK nullifier is published.
            </p>

            {/* Statistics */}
            <div className="mt-10 grid max-w-md grid-cols-3 border-y border-border py-5">
              <div>
                <div className="font-mono text-lg font-semibold text-primary">0</div>
                <div className="mt-1 text-xs text-muted-foreground">Personal fields sent</div>
              </div>
              <div className="border-x border-border px-5">
                <div className="font-mono text-lg font-semibold">
                  {ledgerState?.verifiedCount ?? 0}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">On-chain verifications</div>
              </div>
              <div className="pl-5">
                <div className="font-mono text-lg font-semibold">{MIN_AGE}+</div>
                <div className="mt-1 text-xs text-muted-foreground">Rule enforced</div>
              </div>
            </div>

            {/* Deployed Contract Address Pill */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground">Preprod Contract:</span>
              <a
                href="https://midnightexplorer.com/contract/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary hover:bg-primary/20 transition"
              >
                <span>020023cb0894...d586</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Wallet Error Alert */}
            {walletError && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {walletError}
              </div>
            )}

            <div className="mt-9 flex items-start gap-3 text-sm text-muted-foreground">
              <Code2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Powered by Midnight Network Compact contracts. Compatible with{" "}
                <span className="font-medium text-foreground">Lace Wallet</span> and{" "}
                <span className="font-medium text-foreground">1AM Wallet</span>.
              </span>
            </div>
          </div>

          {/* Interactive Proof Card */}
          <div className="border border-border bg-card shadow-panel">
            {/* Steps Header */}
            <div className="border-b border-border px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Age credential</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Policy: minimum age {MIN_AGE} · AgeGate.compact
                  </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {steps.map(({ label, icon: Icon }, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`flex size-6 items-center justify-center rounded-full border text-[10px] ${
                        index < activeStep || state === "verified"
                          ? "border-primary bg-primary text-primary-foreground"
                          : index === activeStep
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {index < activeStep || state === "verified" ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Icon className="size-3" />
                      )}
                    </div>
                    <span
                      className={`hidden text-xs sm:block ${
                        index <= activeStep ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <div className="ml-auto h-px w-5 bg-border sm:w-9" />
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
                  <div className="flex size-16 items-center justify-center rounded-full border border-border bg-secondary">
                    <WalletCards className="size-7 text-muted-foreground" />
                  </div>
                  <h2 className="mt-6 text-xl font-semibold">Connect to Begin</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Connect your <strong>Lace Wallet</strong>, <strong>1AM Wallet</strong>, or use the instant Sandbox ZK wallet.
                  </p>

                  <div className="mt-7 flex flex-col gap-2 w-full max-w-xs">
                    <Button
                      className="h-11 w-full gap-2"
                      onClick={() => setWalletModalOpen(true)}
                      disabled={isConnecting}
                    >
                      <WalletCards className="size-4" /> Select Wallet
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-full gap-2 text-xs text-muted-foreground"
                      onClick={() => connectWalletType("sandbox")}
                    >
                      <Sparkles className="size-3.5 text-primary" /> Instant Sandbox Wallet
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 1: Ready / Proving ─────────────────────────── */}
              {(state === "ready" || state === "proving") && (
                <div>
                  <div className="flex items-center gap-3 border-b border-border pb-5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                      <KeyRound className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">Private Witness Input</h2>
                      <p className="text-xs text-muted-foreground">
                        Evaluated locally · never sent to blockchain
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="birth-year"
                    className="mt-7 block text-sm font-medium"
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
                    className="mt-2 h-14 border-border bg-background px-4 font-mono text-lg"
                  />
                  {error && (
                    <p role="alert" className="mt-2 text-xs text-destructive">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 space-y-3 bg-secondary/60 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Public Condition</span>
                      <span className="font-mono">age ≥ {MIN_AGE}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Private Witness</span>
                      <span className="flex items-center gap-1.5 font-mono text-primary">
                        <LockKeyhole className="size-3" /> localBirthYear
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Smart Contract</span>
                      <span className="font-mono">AgeGate.compact</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Wallet Provider</span>
                      <span className="font-mono uppercase text-foreground">
                        {walletState?.type ?? "Connected"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="mt-7 h-12 w-full text-sm font-medium"
                    disabled={!birthYear || busy}
                    onClick={generateProof}
                  >
                    {state === "proving" ? (
                      <>
                        <LoaderCircle className="animate-spin" /> Building Zero-Knowledge Proof…
                      </>
                    ) : (
                      <>
                        <Zap className="size-4" /> Generate Proof
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* ── Step 2: Proved ──────────────────────────────────── */}
              {state === "proved" && proof && (
                <div>
                  <div className="flex items-center gap-3 border-b border-border pb-5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">ZK Proof Generated</h2>
                      <p className="text-xs text-muted-foreground">
                        Your birth year witness was discarded
                      </p>
                    </div>
                  </div>

                  <div className="my-7 border border-primary/30 bg-primary/5 p-5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <ShieldCheck className="size-4" /> Age Threshold Proven
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      The ZK circuit validates that your age satisfies the requirement without publishing your birth year.
                    </p>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-sans text-muted-foreground">Circuit</span>
                      <span>proveAge</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-sans text-muted-foreground">Nullifier</span>
                      <span>{shorten(proof.nullifier)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-muted-foreground">ZK Payload Status</span>
                      <span className="text-primary font-semibold">VALID</span>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="mt-4 text-xs text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    className="mt-8 h-12 w-full gap-2"
                    onClick={submitProof}
                  >
                    Submit Proof to Contract <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="mt-2 w-full text-muted-foreground"
                    onClick={reset}
                  >
                    Cancel
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
                  <h2 className="mt-7 text-xl font-semibold">Verifying On-Chain</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The Compact circuit is recording your nullifier and updating the verified count.
                  </p>
                  <div className="mt-7 flex items-center gap-2 font-mono text-xs text-primary">
                    <LoaderCircle className="size-3.5 animate-spin" /> Submitting transaction…
                  </div>
                </div>
              )}

              {/* ── Step 4: Verified ────────────────────────────────── */}
              {state === "verified" && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="success-ring flex size-20 items-center justify-center rounded-full bg-success text-success-foreground">
                    <CheckCircle2 className="size-9" />
                  </div>
                  <h2 className="mt-7 text-2xl font-semibold">Age Verified</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Access granted! Zero personal data was stored on the blockchain ledger.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={copyTransaction}
                      className="font-mono text-xs text-muted-foreground gap-2"
                    >
                      {shorten(txHash, 10, 8)}{" "}
                      {copied ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    {txHash && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs text-primary gap-1"
                      >
                        <a
                          href={`https://midnightexplorer.com/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Explorer <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Total ledger verifications: {ledgerState?.verifiedCount ?? "—"}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 h-11 bg-card"
                    onClick={reset}
                  >
                    <RotateCcw /> Create Another Proof
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Footers */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-7 px-5 py-10 sm:grid-cols-3 lg:px-8">
          <div className="flex gap-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Local by Design</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Your birth year witness is used solely inside local ZK proving and discarded immediately.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Fingerprint className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Replay Protected</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Persistent cryptographic nullifiers prevent double-credential use without identity tracking.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <WalletCards className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Lace & 1AM Wallet Support</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Connect seamlessly with Lace Wallet, 1AM Wallet, or instant sandbox testing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
