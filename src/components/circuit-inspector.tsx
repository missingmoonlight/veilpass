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
        <div className="bg-card/70 border border-border/80 p-4 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Primary Circuit</span>
            <Cpu className="size-4 text-primary" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-foreground">proveAge</div>
          <div className="mt-1 text-[11px] text-muted-foreground">k = 13 · 4,238 R1CS Rows</div>
        </div>

        <div className="bg-card/70 border border-border/80 p-4 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Nullifier Circuit</span>
            <Layers className="size-4 text-primary" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-foreground">isNullifierUsed</div>
          <div className="mt-1 text-[11px] text-muted-foreground">k = 9 · 305 R1CS Rows</div>
        </div>

        <div className="bg-card/70 border border-border/80 p-4 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Proof Latency</span>
            <Zap className="size-4 text-primary" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-primary">~180 ms</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Client-Side WASM / RAM</div>
        </div>

        <div className="bg-card/70 border border-border/80 p-4 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Gas Consumption</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-foreground">1 SPECK</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Negligible testnet gas</div>
        </div>
      </div>

      {/* Compact Code Inspector */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-panel">
        <div className="border-b border-border/80 bg-secondary/30 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-primary" />
            <span className="text-xs font-semibold font-mono text-foreground">contracts/AgeGate.compact</span>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Compact 0.5.2
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCompact}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            {copiedCode ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
            <span>{copiedCode ? "Copied" : "Copy"}</span>
          </Button>
        </div>
        <pre className="p-4 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto bg-[#0a0d14]">
          <code className="text-[#93c5fd]">{compactCode}</code>
        </pre>
      </div>

      {/* Developer Integrator SDK & 1-Click Interactive Gate Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SDK snippet */}
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-panel flex flex-col">
          <div className="border-b border-border/80 bg-secondary/30 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Embed in 3 Lines of TypeScript</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySdk}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              {copiedSdk ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
              <span>{copiedSdk ? "Copied" : "Copy SDK"}</span>
            </Button>
          </div>
          <pre className="p-4 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto bg-[#0a0d14] flex-1">
            <code className="text-[#86efac]">{sdkCode}</code>
          </pre>
        </div>

        {/* Live Simulated dApp Gate Integration */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <LockKeyhole className="size-4 text-primary" />
                Live 3rd-Party dApp Simulation
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Integration Test
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Test how an external decentralized exchange (DEX) or restricted DAO gated application uses VeilPass to grant instant privacy-preserving access.
            </p>

            <div className="mt-4 flex gap-2">
              <Button
                variant={simulatedDApp === "dex" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSimulatedDApp("dex"); setGatePassed(false); }}
                className="text-xs h-8 flex-1"
              >
                DeFi Perpetual DEX
              </Button>
              <Button
                variant={simulatedDApp === "dao" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSimulatedDApp("dao"); setGatePassed(false); }}
                className="text-xs h-8 flex-1"
              >
                Restricted DAO Voting
              </Button>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-lg border border-border/60 bg-secondary/30">
            {simulatedDApp === "none" ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                Select a simulated dApp above to test zero-knowledge gating.
              </div>
            ) : gatePassed ? (
              <div className="text-center py-2">
                <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40 mb-2">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {simulatedDApp === "dex" ? "DEX Trading Unlocked (18+ Verified)" : "DAO Voting Ballot Granted"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  VeilPass ZK credential verified on Midnight Preprod without identity disclosure.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="text-xs text-muted-foreground">
                  {simulatedDApp === "dex"
                    ? "🛡️ DEX requires age 18+ to access leveraged perpetual trading."
                    : "🏛️ DAO compliance policy requires age 18+ token holder status."}
                </div>
                <Button
                  size="sm"
                  onClick={() => setGatePassed(true)}
                  className="h-8 text-xs gap-1.5 w-full bg-primary text-primary-foreground"
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
