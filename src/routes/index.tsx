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
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/")(
  {
  head: () => ({
    meta: [
      { title: "VeilPass | Private Age Proof" },
      {
        name: "description",
        content:
          "Prove you meet an age threshold without revealing your birth year — real Midnight ZK proofs.",
      },
      { property: "og:title", content: "VeilPass | Private Age Proof" },
      {
        property: "og:description",
        content:
          "Age / Eligibility Gate built on Midnight Network. Your birth year never leaves your device.",
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
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

function Index() {
  // ── Wallet state (real Midnight integration) ──────────────────────────────
  const { status: walletStatus, walletState, walletApi, error: walletError, isInstalled, connect: connectWallet, disconnect: disconnectWallet } = useMidnightWallet();

  // ── Proof flow state ──────────────────────────────────────────────────────
  const [state, setState] = useState<ProofState>("disconnected");
  const [birthYear, setBirthYear] = useState("");
  const [proof, setProof] = useState<AgeProof | null>(null);
  const [proofSecretKey, setProofSecretKey] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [ledgerState, setLedgerState] = useState<AgeGateLedgerState | null>(null);

  const connected = walletStatus === "connected" || walletStatus === "connecting";
  const activeStep =
    state === "disconnected" ? 0 : state === "ready" ? 1 : 2;
  const busy = state === "proving" || state === "submitting";

  // ── Sync wallet connection → proof flow ───────────────────────────────────
  useEffect(() => {
    if (walletStatus === "connected" && state === "disconnected") {
      setState("ready");
      void initContract();
    } else if (walletStatus !== "connected" && walletStatus !== "connecting" && state !== "disconnected") {
      setState("disconnected");
    }
  }, [walletStatus]);

  // ── Contract initialisation ───────────────────────────────────────────────
  async function initContract() {
    try {
      const addr = await deployAgeGateContract(walletApi);
      setContractAddress(addr);
      const ls = await fetchLedgerState();
      setLedgerState(ls);
    } catch {
      // Non-fatal — address will be shown as "deploying"
    }
  }

  // ── Refresh ledger state ──────────────────────────────────────────────────
  useEffect(() => {
    if (state === "ready" || state === "verified") {
      void fetchLedgerState().then(setLedgerState);
    }
    // Also resolve contract address on load
    const addr = getContractAddress();
    if (addr) setContractAddress(addr);
  }, [state]);

  // ── Connect wallet handler ────────────────────────────────────────────────
  async function handleConnect() {
    setError("");
    await connectWallet();
  }

  // ── Proof generation ──────────────────────────────────────────────────────
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

  // ── Proof submission ──────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Fingerprint className="size-5" />
            </div>
            <span className="text-lg font-semibold">VeilPass</span>
            <span className="hidden rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground sm:inline">
              Midnight Devnet
            </span>
          </div>

          {/* Wallet button */}
          {walletStatus === "connected" ? (
            <Button
              variant="outline"
              className="h-10 gap-2 bg-card"
              onClick={disconnectWallet}
            >
              <span className="size-2 rounded-full bg-success" />
              <span className="font-mono text-xs">
                {walletState?.displayAddress ?? "Connected"}
              </span>
              <Unplug className="size-3.5" />
            </Button>
          ) : walletStatus === "connecting" ? (
            <Button className="h-10" disabled>
              <LoaderCircle className="animate-spin" /> Connecting…
            </Button>
          ) : (
            <Button className="h-10" onClick={handleConnect}>
              <WalletCards /> Connect wallet
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:px-8 lg:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div className="pt-2">
            <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase text-primary">
              <LockKeyhole className="size-4" /> Age / Eligibility Gate
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Prove your age.<br />
              <span className="text-muted-foreground">Keep it private.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">
              Verify you're {MIN_AGE}+ without sharing your birth year. Your
              private data stays on your device — only a ZK proof goes on-chain.
            </p>

            {/* Stats */}
            <div className="mt-10 grid max-w-md grid-cols-3 border-y border-border py-5">
              <div>
                <div className="font-mono text-lg font-semibold text-primary">0</div>
                <div className="mt-1 text-xs text-muted-foreground">Personal fields sent</div>
              </div>
              <div className="border-x border-border px-5">
                <div className="font-mono text-lg font-semibold">
                  {ledgerState?.verifiedCount ?? 0}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Verifications on-chain</div>
              </div>
              <div className="pl-5">
                <div className="font-mono text-lg font-semibold">{MIN_AGE}+</div>
                <div className="mt-1 text-xs text-muted-foreground">Rule proved</div>
              </div>
            </div>

            {/* Contract address */}
            {contractAddress && (
              <div className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Code2 className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">Contract: {shorten(contractAddress, 12, 8)}</span>
                <ExternalLink className="size-3 shrink-0" />
              </div>
            )}

            {/* Wallet warning */}
            {!isInstalled && walletStatus !== "connected" && (
              <div className="mt-6 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-600">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Midnight Lace wallet not detected. Install it from{" "}
                  <a
                    href="https://midnight.network"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    midnight.network
                  </a>
                  , or use the demo below.
                </span>
              </div>
            )}

            {/* Wallet error */}
            {walletError && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {walletError}
              </div>
            )}

            <div className="mt-9 flex items-start gap-3 text-sm text-muted-foreground">
              <Code2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Powered by a Compact contract on Midnight. Uses{" "}
                <code className="rounded bg-secondary px-1 font-mono text-xs">
                  @midnight-ntwrk/dapp-connector-api
                </code>{" "}
                for real wallet integration.
              </span>
            </div>
          </div>

          {/* Proof card */}
          <div className="border border-border bg-card shadow-panel">
            {/* Card header */}
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
                      className={`hidden text-xs sm:block ${index <= activeStep ? "text-foreground" : "text-muted-foreground"}`}
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

            {/* Card body */}
            <div className="min-h-[420px] p-6 sm:p-8">

              {/* ── Step 0: Disconnected ────────────────────────────── */}
              {state === "disconnected" && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-full border border-border bg-secondary">
                    <WalletCards className="size-7 text-muted-foreground" />
                  </div>
                  <h2 className="mt-6 text-xl font-semibold">Connect to begin</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    {isInstalled
                      ? "Connect your Midnight Lace wallet to create and submit a private age proof."
                      : "Connect your Midnight Lace wallet — or use the demo flow without a wallet."}
                  </p>

                  <Button
                    className="mt-7 h-11 px-6"
                    onClick={handleConnect}
                    disabled={walletStatus === "connecting"}
                  >
                    {walletStatus === "connecting" ? (
                      <><LoaderCircle className="animate-spin" /> Connecting…</>
                    ) : isInstalled ? (
                      <>Connect Lace wallet <ArrowRight /></>
                    ) : (
                      <>Demo mode <ArrowRight /></>
                    )}
                  </Button>

                  {!isInstalled && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Info className="size-3.5" />
                      <span>
                        Demo mode runs entirely in-browser.{" "}
                        <a
                          href="https://midnight.network"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          Get real wallet →
                        </a>
                      </span>
                    </div>
                  )}
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
                      <h2 className="text-sm font-semibold">Private witness</h2>
                      <p className="text-xs text-muted-foreground">
                        Processed locally · never sent on-chain
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="birth-year"
                    className="mt-7 block text-sm font-medium"
                  >
                    Your birth year
                  </label>
                  <Input
                    id="birth-year"
                    type="number"
                    inputMode="numeric"
                    min="1900"
                    max={CURRENT_YEAR}
                    placeholder="e.g. 1994"
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

                  <div className="mt-6 space-y-3 bg-secondary/60 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Public condition</span>
                      <span className="font-mono">age ≥ {MIN_AGE}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Private input</span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <LockKeyhole className="size-3" /> birthYear
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Contract</span>
                      <span className="font-mono">AgeGate.compact</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Proof system</span>
                      <span className="font-mono">PLONK (Midnight ZK)</span>
                    </div>
                  </div>

                  <Button
                    className="mt-7 h-12 w-full text-sm"
                    disabled={!birthYear || busy}
                    onClick={generateProof}
                  >
                    {state === "proving" ? (
                      <>
                        <LoaderCircle className="animate-spin" /> Building zero-knowledge proof…
                      </>
                    ) : (
                      <>
                        <Zap /> Generate proof
                      </>
                    )}
                  </Button>
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    Your birth year is used only locally — it is discarded after proof generation.
                  </p>
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
                      <h2 className="text-sm font-semibold">Proof generated</h2>
                      <p className="text-xs text-muted-foreground">
                        Your private witness was discarded
                      </p>
                    </div>
                  </div>

                  <div className="my-7 border border-primary/30 bg-primary/5 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <ShieldCheck className="size-4" /> Eligibility proved
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      The ZK proof confirms you are {proof.referenceYear - proof.minAge} years old or
                      more without exposing the exact year.
                    </p>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-sans text-muted-foreground">Proof system</span>
                      <span>PLONK</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-sans text-muted-foreground">Nullifier</span>
                      <span>{shorten(proof.nullifier)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-sans text-muted-foreground">Reference year</span>
                      <span>{proof.referenceYear}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-muted-foreground">Payload</span>
                      <span className="text-primary">VALID</span>
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="mt-4 text-xs text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    className="mt-8 h-12 w-full"
                    onClick={submitProof}
                  >
                    Submit to contract <ChevronRight />
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
                  <h2 className="mt-7 text-xl font-semibold">Verifying on-chain</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The Compact circuit is checking your proof and nullifier.
                  </p>
                  <div className="mt-7 flex items-center gap-2 font-mono text-xs text-primary">
                    <LoaderCircle className="size-3.5 animate-spin" /> Submitting transaction
                  </div>
                </div>
              )}

              {/* ── Step 4: Verified ────────────────────────────────── */}
              {state === "verified" && (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="success-ring flex size-20 items-center justify-center rounded-full bg-success text-success-foreground">
                    <CheckCircle2 className="size-9" />
                  </div>
                  <h2 className="mt-7 text-2xl font-semibold">Age verified</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    Access granted. No personal data was stored by the contract.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={copyTransaction}
                    className="mt-6 font-mono text-xs text-muted-foreground"
                  >
                    {shorten(txHash, 10, 8)}{" "}
                    {copied ? (
                      <Check className="size-3.5 text-primary" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Total verifications: {ledgerState?.verifiedCount ?? "—"}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 h-11 bg-card"
                    onClick={reset}
                  >
                    <RotateCcw /> Create another proof
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-7 px-5 py-10 sm:grid-cols-3 lg:px-8">
          <div className="flex gap-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Local by design</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Birth year is used only in-browser and discarded before any
                network call is made.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Fingerprint className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Replay protected</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A cryptographic nullifier prevents duplicate credential use
                across the same contract.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Code2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Real wallet integration</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Uses <code className="font-mono text-[10px]">@midnight-ntwrk/dapp-connector-api</code>{" "}
                to connect the Midnight Lace wallet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
