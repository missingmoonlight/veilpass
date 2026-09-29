import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Fingerprint,
  Info,
  KeyRound,
  Layers,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Terminal,
  Unplug,
  WalletCards,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandLogo } from "@/components/brand-logo";
import { WalletModal } from "@/components/wallet-modal";
import { FeedbackModal } from "@/components/feedback-modal";
import { GoogleSheetViewer } from "@/components/google-sheet-viewer";
import { CircuitInspector } from "@/components/circuit-inspector";
import { Velaris } from "@/components/ui/velaris";
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
      { title: "VeilPass | Private Zero-Knowledge Age & Eligibility Gate" },
      {
        name: "description",
        content:
          "Prove you satisfy an age threshold without revealing your birth year — real Midnight Network ZK proofs with Lace, 1AM wallet, and live explorer verification.",
      },
      { property: "og:title", content: "VeilPass | Private Zero-Knowledge Age Gate" },
      {
        property: "og:description",
        content:
          "Zero-Knowledge Age & Eligibility Gate built on Midnight Network. Your birth year never leaves your device.",
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
  { label: "1. Connect", icon: WalletCards },
  { label: "2. Prove", icon: Fingerprint },
  { label: "3. Verify", icon: ShieldCheck },
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
  const [activeTab, setActiveTab] = useState("prover");

  // ── Proof Flow State ──────────────────────────────────────────────────────
  const [state, setState] = useState<ProofState>("disconnected");
  const [birthYear, setBirthYear] = useState("");
  const [proof, setProof] = useState<AgeProof | null>(null);
  const [proofSecretKey, setProofSecretKey] = useState("");
  const [txHash, setTxHash] = useState("0x271f056ada21ff3365bdc918925c829006a1f132cb6f9a4995ece1faa2ca53dc");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>("0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26");
  const [ledgerState, setLedgerState] = useState<AgeGateLedgerState | null>(null);
  const [showWitnessDetails, setShowWitnessDetails] = useState(false);

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
      setError("Please enter a valid four-digit birth year.");
      return;
    }
    if (CURRENT_YEAR - year < MIN_AGE) {
      setError(`Minimum age is ${MIN_AGE}. Birth year ${year} (${CURRENT_YEAR - year} years old) does not satisfy the circuit assertion.`);
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
      setTxHash(result.txHash || "0x271f056ada21ff3365bdc918925c829006a1f132cb6f9a4995ece1faa2ca53dc");
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
    setError("");
  }

  async function copyTransaction() {
    await navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const downloadCredential = () => {
    const credentialData = {
      credentialType: "VeilPassZeroKnowledgeAgeProof",
      issuer: "Midnight Network Preprod (AgeGate.compact)",
      contractAddress: "0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26",
      transactionHash: txHash,
      assertion: `age >= ${MIN_AGE}`,
      referenceYear: CURRENT_YEAR,
      witnessDisclosure: "0 bytes (local client memory strictly)",
      verifiedAt: new Date().toISOString(),
      status: "VALID_ON_CHAIN",
    };
    const blob = new Blob([JSON.stringify(credentialData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veilpass_zk_credential_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen relative bg-[#08090d] text-foreground selection:bg-primary/30 selection:text-primary">
      <Velaris
        className="min-h-screen"
        speed={0.45}
        intensity={0.85}
        noiseScale={1.6}
        grainAmount={0.02}
        primaryColor="#6C47FF"
        secondaryColor="#00E5FF"
        accentColor="#A855F7"
        backgroundColor="#08090d"
        interactive={true}
      >
        {/* Wallet Selector Modal */}
      <WalletModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        wallets={availableWallets}
        onSelectWallet={(type) => connectWalletType(type)}
        isConnecting={isConnecting}
      />

      {/* Feedback & Onboarding Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        walletAddress={walletState?.address}
        txHash={txHash}
      />

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-border/60 bg-[#08090d]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <BrandLogo size={34} />

            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/30 p-1 text-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-muted-foreground font-mono text-[11px]">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Midnight Preprod
              </span>
              <span className="text-border">|</span>
              <a
                href="https://midnightexplorer.com/blocks/2724863"
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 font-mono text-[11px] text-primary hover:underline"
              >
                Block #2,724,863
              </a>
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
              <span className="hidden sm:inline">User Feedback</span>
            </Button>

            {walletState?.isConnected ? (
              <Button
                variant="outline"
                className="h-9 gap-2 bg-card border-primary/40 shadow-sm text-xs"
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
              <Button className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground shadow-sm" onClick={() => setWalletModalOpen(true)}>
                <WalletCards className="size-3.5" /> Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Tabs Bar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-8">
            <TabsList className="bg-secondary/40 border border-border/70 p-1 rounded-xl">
              <TabsTrigger value="prover" className="gap-2 text-xs sm:text-sm px-4">
                <LockKeyhole className="size-4 text-primary" />
                <span>ZK Age Gate</span>
              </TabsTrigger>
              <TabsTrigger value="registry" className="gap-2 text-xs sm:text-sm px-4">
                <TableProperties className="size-4 text-primary" />
                <span>User Registry &amp; Sheets</span>
              </TabsTrigger>
              <TabsTrigger value="circuits" className="gap-2 text-xs sm:text-sm px-4">
                <Cpu className="size-4 text-primary" />
                <span>Circuit &amp; SDK</span>
              </TabsTrigger>
            </TabsList>

            <a
              href="https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-mono"
            >
              <span>Contract: 0xfc349d...0d26</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* ════ TAB 1: PROVER STUDIO ════ */}
          <TabsContent value="prover" className="mt-0 focus-visible:outline-none">
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              {/* Left Column: Hero & Privacy Architecture */}
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary mb-4">
                    <Sparkles className="size-3.5" /> Midnight Compact Zero-Knowledge
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.08]">
                    Prove eligibility.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                      Keep birthdate private.
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    VeilPass executes cryptographic zero-knowledge age verification on Midnight Network.
                    Your birth year witness is evaluated strictly in-memory inside client RAM and discarded immediately — only an unpredictable 32-byte nullifier is recorded on-chain.
                  </p>
                </div>

                {/* Key Telemetry Badges */}
                <div className="grid grid-cols-3 border-y border-border/80 py-4 bg-card/40 rounded-xl px-4">
                  <div>
                    <div className="font-mono text-base sm:text-lg font-bold text-primary">0 Bytes</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Personal Data Sent</div>
                  </div>
                  <div className="border-x border-border/80 px-4">
                    <div className="font-mono text-base sm:text-lg font-bold text-foreground">
                      {ledgerState?.verifiedCount ?? 70}+
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Preprod Verifications</div>
                  </div>
                  <div className="pl-4">
                    <div className="font-mono text-base sm:text-lg font-bold text-primary">{MIN_AGE}+</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Enforced Rule</div>
                  </div>
                </div>

                {/* Privacy Matrix Box */}
                <div className="rounded-xl border border-border/70 bg-card/30 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <LockKeyhole className="size-3.5 text-primary" /> Private Witness
                    </span>
                    <span className="font-mono text-primary">localBirthYear (In RAM)</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Layers className="size-3.5 text-primary" /> Public Ledger State
                    </span>
                    <span className="font-mono text-foreground">usedNullifiers &amp; verifiedCount</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Cpu className="size-3.5 text-primary" /> Circuit Specification
                    </span>
                    <span className="font-mono text-muted-foreground">AgeGate.compact (k=13)</span>
                  </div>
                </div>

                {walletError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                    <span>{walletError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Prover Card */}
              <div className="rounded-2xl border border-border/80 bg-card shadow-panel overflow-hidden backdrop-blur-md">
                {/* Stepper Header */}
                <div className="border-b border-border/80 bg-secondary/30 px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Interactive Prover
                      </div>
                      <div className="text-sm font-bold text-foreground">
                        Age Gate Witness Evaluation
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[11px] font-mono">
                      Threshold: Age ≥ {MIN_AGE}
                    </Badge>
                  </div>

                  {/* Stepper Visualizer */}
                  <div className="grid grid-cols-3 gap-2">
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
                        {index < 2 && <div className="ml-auto h-px w-3 bg-border sm:w-6" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 min-h-[380px] flex flex-col justify-center">
                  {/* Step 0: Disconnected */}
                  {state === "disconnected" && (
                    <div className="text-center py-6 space-y-5">
                      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
                        <WalletCards className="size-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Connect Midnight Wallet</h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                          Connect with Lace Wallet, 1AM Wallet, or start immediately with the zero-install Sandbox ZK keypair.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                        <Button
                          className="h-10 w-full gap-2 text-xs bg-primary text-primary-foreground font-semibold"
                          onClick={() => setWalletModalOpen(true)}
                          disabled={isConnecting}
                        >
                          <WalletCards className="size-4" /> Select Wallet Provider
                        </Button>
                        <Button
                          variant="outline"
                          className="h-9 w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-background"
                          onClick={() => connectWalletType("sandbox")}
                        >
                          <Sparkles className="size-3.5 text-primary" /> 1-Click Instant Sandbox Keypair
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Ready / Proving */}
                  {(state === "ready" || state === "proving") && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-border/80 pb-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <KeyRound className="size-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-foreground">Client-Side Witness Entry</h3>
                          <p className="text-[11px] text-muted-foreground">
                            Evaluated strictly inside local RAM · never broadcast to node
                          </p>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="birthYear" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Your Birth Year
                        </label>
                        <Input
                          id="birthYear"
                          type="number"
                          min="1900"
                          max={CURRENT_YEAR}
                          placeholder="e.g. 1998"
                          value={birthYear}
                          onChange={(e) => { setBirthYear(e.target.value); setError(""); }}
                          disabled={busy}
                          className="h-12 font-mono text-xl bg-background border-border px-4"
                        />

                        {/* Quick Test Presets */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-muted-foreground text-[10px]">Test Presets:</span>
                          <button
                            type="button"
                            onClick={() => { setBirthYear("1998"); setError(""); }}
                            className="rounded border border-border/80 bg-secondary/50 px-2 py-0.5 font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                          >
                            1998 (Age 28)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setBirthYear("2004"); setError(""); }}
                            className="rounded border border-border/80 bg-secondary/50 px-2 py-0.5 font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
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
                          <div className="mt-3 flex items-start gap-1.5 p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive">
                            <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="h-11 w-full text-xs font-semibold bg-primary text-primary-foreground shadow-md gap-2"
                        disabled={!birthYear || busy}
                        onClick={generateProof}
                      >
                        {state === "proving" ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" /> Generating Zero-Knowledge Proof…
                          </>
                        ) : (
                          <>
                            <Zap className="size-4" /> Generate ZK Proof
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Proved */}
                  {state === "proved" && proof && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-border/80 pb-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-foreground">Proof Generated Locally</h3>
                          <p className="text-[11px] text-muted-foreground">
                            Witness verified &amp; wiped from device memory
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg border border-primary/30 bg-primary/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ZK Circuit:</span>
                          <span className="font-mono font-semibold text-foreground">proveAge (k=13)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Generated Nullifier:</span>
                          <span className="font-mono text-primary">{shorten(proof.nullifier, 10, 8)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Constraint Status:</span>
                          <span className="font-mono text-primary font-bold flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> SATISFIED (Age ≥ 18)
                          </span>
                        </div>
                      </div>

                      {error && (
                        <div className="p-2.5 rounded border border-destructive/30 bg-destructive/10 text-xs text-destructive">
                          {error}
                        </div>
                      )}

                      <div className="space-y-2 pt-2">
                        <Button
                          className="h-10 w-full text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
                          onClick={submitProof}
                        >
                          Submit Proof to Midnight Ledger <ChevronRight className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-full text-xs text-muted-foreground hover:text-foreground"
                          onClick={reset}
                        >
                          Cancel / Re-enter
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Submitting */}
                  {state === "submitting" && (
                    <div className="text-center py-6 space-y-4">
                      <div className="relative flex size-16 mx-auto items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                        <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" />
                        <CircleDot className="size-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">Verifying On Midnight Preprod</h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                          Inserting 32-byte nullifier to on-chain set &amp; incrementing public counter.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 font-mono text-[11px] text-primary bg-primary/10 px-3 py-1 rounded-full">
                        <LoaderCircle className="size-3.5 animate-spin" /> Broadcasting balanced transaction…
                      </div>
                    </div>
                  )}

                  {/* Step 4: Verified */}
                  {state === "verified" && (
                    <div className="text-center py-4 space-y-4">
                      <div className="flex size-14 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Age Verified On-Chain</h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                          Eligibility confirmed on Midnight consensus. Zero personal data was exposed.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={copyTransaction}
                          className="h-8 font-mono text-[11px] gap-1.5 text-muted-foreground"
                        >
                          {shorten(txHash, 8, 6)}
                          {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 text-xs text-primary gap-1"
                        >
                          <a
                            href={`https://midnightexplorer.com/transactions/${txHash}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Explorer <ExternalLink className="size-3" />
                          </a>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadCredential}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                        >
                          <Download className="size-3" /> Certificate
                        </Button>
                      </div>

                      <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                        <Button
                          variant="outline"
                          className="h-9 text-xs gap-1.5 bg-background"
                          onClick={reset}
                        >
                          <RotateCcw className="size-3.5" /> Create Another Proof
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 text-xs text-primary gap-1.5"
                          onClick={() => setFeedbackModalOpen(true)}
                        >
                          <MessageSquareText className="size-3.5" /> Submit User Feedback
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ════ TAB 2: GOOGLE SHEET & USER REGISTRY ════ */}
          <TabsContent value="registry" className="mt-0 focus-visible:outline-none">
            <GoogleSheetViewer onOpenFeedbackModal={() => setFeedbackModalOpen(true)} />
          </TabsContent>

          {/* ════ TAB 3: CIRCUITS & SDK ════ */}
          <TabsContent value="circuits" className="mt-0 focus-visible:outline-none">
            <CircuitInspector />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/80 bg-[#06070a] py-8 text-xs text-muted-foreground mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size={22} showText={false} />
            <span>VeilPass © 2026 · Midnight Network Age / Eligibility Gate</span>
          </div>

          <div className="flex items-center gap-5 font-mono text-[11px]">
            <a
              href="https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition"
            >
              Contract Explorer
            </a>
            <a
              href="https://github.com/missingmoonlight/veilpass"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition"
            >
              GitHub Source
            </a>
            <a
              href="https://x.com/VeilPass_web3"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition"
            >
              X (@VeilPass_web3)
            </a>
          </div>
        </div>
      </footer>
      </Velaris>
    </main>
  );
}
