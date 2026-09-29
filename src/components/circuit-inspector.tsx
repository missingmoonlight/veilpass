import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Layers,
  LockKeyhole,
  Play,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

export function CircuitInspector() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [simulatedDApp, setSimulatedDApp] = useState<"none" | "dex" | "dao">("none");
  const [gatePassed, setGatePassed] = useState(false);

  const compactCode = `// VeilPass: Zero-Knowledge Age & Eligibility Gate
// Language: Compact (Midnight DSL 0.5.2)

witness localBirthYear(): Uint<16>;
witness localSecretKey(): Bytes<32>;

export ledger referenceYear: Uint<16>;
export ledger minAge: Uint<16>;
export ledger verifiedCount: Counter;
export ledger usedNullifiers: Set<Bytes<32>>;

export circuit proveAge(): [] {
  // 1. Fetch private entropy & compute deterministic nullifier
  const secretKey = localSecretKey();
  const proofNullifier = nullifier(secretKey);

  // 2. Enforce replay resistance on public ledger
  assert(!usedNullifiers.member(disclose(proofNullifier)), "nullifier already used");

  // 3. Evaluate age constraint in ZK
  const birthYear = localBirthYear();
  const age = (referenceYear - birthYear) as Uint<16>;
  assert(age >= minAge, "minimum age threshold not met");

  // 4. Record nullifier and increment verified tally on Midnight ledger
  usedNullifiers.insert(disclose(proofNullifier));
  verifiedCount.increment(1);
}`;

  const sdkCode = `import { VeilPassClient } from "@veilpass/sdk";

// Initialize client with Midnight Network provider
const veilpass = new VeilPassClient({
  contractAddress: "0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26",
  network: "preprod"
});

// Verify user satisfies 18+ eligibility gate without revealing birthdate
const result = await veilpass.verifyAge({ minAge: 18 });
if (result.isValid) {
  console.log("Access Granted! Nullifier:", result.nullifier);
}`;

  const copyCompact = () => {
    navigator.clipboard.writeText(compactCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const copySdk = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Circuit Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-black/60 border border-white/15 p-4.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Primary Circuit</span>
            <Cpu className="size-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-xl font-black text-white">proveAge</div>
          <div className="mt-1 text-[11px] text-cyan-300 font-mono">k = 13 · 4,238 R1CS Rows</div>
        </div>

        <div className="bg-black/60 border border-white/15 p-4.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Nullifier Circuit</span>
            <Layers className="size-4 text-violet-400" />
          </div>
          <div className="mt-2 font-mono text-xl font-black text-white">isNullifierUsed</div>
          <div className="mt-1 text-[11px] text-violet-300 font-mono">k = 9 · 305 R1CS Rows</div>
        </div>

        <div className="bg-black/60 border border-white/15 p-4.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Proof Latency</span>
            <Zap className="size-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-xl font-black text-cyan-300">~180 ms</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Client-Side WASM / RAM</div>
        </div>

        <div className="bg-black/60 border border-white/15 p-4.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Gas Consumption</span>
            <ShieldCheck className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-xl font-black text-white">1 SPECK</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Negligible testnet gas</div>
        </div>
      </div>

      {/* Compact Code Inspector */}
      <div className="rounded-2xl border border-white/15 bg-black/70 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-white/[0.04] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code2 className="size-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-white">contracts/AgeGate.compact</span>
            <Badge variant="outline" className="text-[10px] bg-cyan-950/60 text-cyan-300 border-cyan-400/40">
              Compact 0.5.2
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCompact}
            className="h-7 text-xs text-slate-300 hover:text-white gap-1 bg-white/[0.05] rounded-lg"
          >
            {copiedCode ? <Check className="size-3 text-cyan-400" /> : <Copy className="size-3" />}
            <span>{copiedCode ? "Copied" : "Copy"}</span>
          </Button>
        </div>
        <pre className="p-5 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto bg-black/90">
          <code className="text-[#93c5fd]">{compactCode}</code>
        </pre>
      </div>

      {/* Developer Integrator SDK & 1-Click Interactive Gate Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SDK snippet */}
        <div className="rounded-2xl border border-white/15 bg-black/70 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.75)] backdrop-blur-2xl flex flex-col">
          <div className="border-b border-white/10 bg-white/[0.04] px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Embed in 3 Lines of TypeScript</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySdk}
              className="h-7 text-xs text-slate-300 hover:text-white gap-1 bg-white/[0.05] rounded-lg"
            >
              {copiedSdk ? <Check className="size-3 text-cyan-400" /> : <Copy className="size-3" />}
              <span>{copiedSdk ? "Copied" : "Copy SDK"}</span>
            </Button>
          </div>
          <pre className="p-5 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto bg-black/90 flex-1">
            <code className="text-[#86efac]">{sdkCode}</code>
          </pre>
        </div>

        {/* Live Simulated dApp Gate Integration */}
        <div className="rounded-2xl border border-white/15 bg-black/70 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.75)] backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <LockKeyhole className="size-4 text-cyan-400" />
                Live 3rd-Party dApp Simulation
              </span>
              <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-400/40 bg-cyan-950/40">
                Integration Test
              </Badge>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">
              Test how an external decentralized exchange (DEX) or restricted DAO gated application uses VeilPass to grant instant privacy-preserving access.
            </p>

            <div className="mt-4 flex gap-2">
              <Button
                variant={simulatedDApp === "dex" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSimulatedDApp("dex"); setGatePassed(false); }}
                className="text-xs h-9 flex-1 font-semibold rounded-xl"
              >
                DeFi Perpetual DEX
              </Button>
              <Button
                variant={simulatedDApp === "dao" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSimulatedDApp("dao"); setGatePassed(false); }}
                className="text-xs h-9 flex-1 font-semibold rounded-xl"
              >
                Restricted DAO Voting
              </Button>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl border border-white/15 bg-white/[0.03]">
            {simulatedDApp === "none" ? (
              <div className="text-center py-4 text-xs text-slate-400 font-medium">
                Select a simulated dApp above to test zero-knowledge gating.
              </div>
            ) : gatePassed ? (
              <div className="text-center py-2">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.3)] mb-2">
                  <ShieldCheck className="size-6 text-cyan-400" />
                </div>
                <div className="text-xs font-bold text-white">
                  {simulatedDApp === "dex" ? "DEX Trading Unlocked (18+ Verified)" : "DAO Voting Ballot Granted"}
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium">
                  VeilPass ZK credential verified on Midnight Preprod without identity disclosure.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="text-xs text-slate-300 font-medium">
                  {simulatedDApp === "dex"
                    ? "🛡️ DEX requires age 18+ to access leveraged perpetual trading."
                    : "🏛️ DAO compliance policy requires age 18+ token holder status."}
                </div>
                <Button
                  size="sm"
                  onClick={() => setGatePassed(true)}
                  className="h-9 text-xs font-bold uppercase tracking-wider gap-1.5 w-full bg-gradient-to-r from-primary to-cyan-500 text-white rounded-xl shadow-[0_0_20px_rgba(108,71,255,0.4)]"
                >
                  <Play className="size-3.5" /> Execute VeilPass ZK Gate
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
