import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { MOCK_DATA } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { ProductionAuthNote } from "@/components/production-auth-note";
import {
  User,
  Palette,
  Wallet,
  Bell,
  ShieldCheck,
  Eye,
  Terminal,
  FlaskConical,
  Megaphone,
  Moon,
  Sun,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Info,
  RotateCcw,
  Database,
  KeyRound,
  ChevronRight,
} from "lucide-react";

function maskWallet(addr: string) {
  const [head] = addr.split("...");
  return `${head?.slice(0, 4) ?? "0x"}••••••`;
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="pr-4">
        <div className="font-medium text-foreground">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-0.5 max-w-md">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  status,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  status?: React.ComponentProps<typeof StatusBadge>["status"];
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          {status && <StatusBadge status={status} showTooltip={false} />}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const {
    isConnected,
    setIsConnected,
    disconnect,
    isSeated,
    setIsSeated,
    isFounder,
    setFounder,
    theme,
    toggleTheme,
    density,
    setDensity,
    reducedMotion,
    setReducedMotion,
    highSecurity,
    setHighSecurity,
    hideBalance,
    setHideBalance,
    maskAddress,
    setMaskAddress,
    notifyEvolution,
    setNotifyEvolution,
    notifyReceipts,
    setNotifyReceipts,
    showCanonical,
    setShowCanonical,
    resetDemo,
  } = useApp();
  const { toast } = useToast();

  // Local-only preferences (prototype: not persisted beyond this session)
  const [displayName, setDisplayName] = useState("Member " + MOCK_DATA.memberNumber);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [notifyReferral, setNotifyReferral] = useState(false);
  const [notifyArchive, setNotifyArchive] = useState(true);
  const [notifyFounder, setNotifyFounder] = useState(false);
  const [requireSignedMessage, setRequireSignedMessage] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [showApprovalWarnings, setShowApprovalWarnings] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showDepth, setShowDepth] = useState(true);
  const [showFootprint, setShowFootprint] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [walletPrivacy, setWalletPrivacy] = useState(false);
  const [autoPrompt, setAutoPrompt] = useState(true);
  const [codexWorkflow, setCodexWorkflow] = useState(false);

  const walletDisplay = maskAddress ? maskWallet(MOCK_DATA.wallet) : MOCK_DATA.wallet;
  const role = isFounder ? "Founder / Operator" : "Member";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_DATA.walletFull);
      toast({
        title: "Address copied",
        description: "Full wallet address copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy unavailable",
        description: "Clipboard access was blocked by the browser.",
        variant: "destructive",
      });
    }
  };

  const saveName = () => {
    const next = nameDraft.trim();
    if (!next) {
      toast({
        title: "Name required",
        description: "Display name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setDisplayName(next);
    toast({
      title: "Display name updated",
      description: "Saved locally for this prototype session only.",
    });
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet disconnected (simulated)",
      description: "You would be returned to the public site. No on-chain action occurred.",
    });
  };

  const handleReset = () => {
    resetDemo();
    setDisplayName("Member " + MOCK_DATA.memberNumber);
    setNameDraft("Member " + MOCK_DATA.memberNumber);
    setNotifyReferral(false);
    setNotifyArchive(true);
    setNotifyFounder(false);
    setRequireSignedMessage(true);
    setSessionTimeout("30");
    setShowApprovalWarnings(true);
    setPublicProfile(true);
    setShowDepth(true);
    setShowFootprint(true);
    setShowAxes(true);
    setWalletPrivacy(false);
    setAutoPrompt(true);
    setCodexWorkflow(false);
    toast({
      title: "Demo state reset",
      description: "All prototype preferences returned to canonical defaults.",
    });
  };

  const auditLog = [
    { id: 1, actor: "Founder Multisig", action: "Reviewed SourceRegistryV1 activation gate", time: "2 hours ago" },
    { id: 2, actor: "Operator", action: "Approved Verified Introduction V1 scope", time: "1 day ago" },
    { id: 3, actor: "Founder Multisig", action: "Paused source-aware buy path", time: "1 day ago" },
    { id: 4, actor: "Operator", action: "Published Evolution episode: V3 Engine", time: "3 days ago" },
  ];

  const founderPermissions = [
    "Review and gate module activations (read-only in prototype)",
    "Publish Evolution episodes and protocol notes",
    "Annotate Registry and Architecture surfaces",
    "Access Founder Console review queues",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Your control center for identity, appearance, wallet, notifications, security and
            privacy. Every control here adjusts the prototype experience only.
          </p>
        </div>
        <StatusBadge status="SIMULATED PROTOTYPE" />
      </div>

      {/* Doctrine */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <p className="italic text-foreground/90">
          "{MOCK_DATA.doctrine}"
        </p>
      </div>

      {/* Prototype Disclaimers */}
      <div className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-xl text-sm text-orange-200">
        <p className="font-medium flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          Prototype Disclaimers
        </p>
        <p className="text-muted-foreground mt-1">
          This is a frontend prototype. Settings are saved locally only (some in your browser, some
          for this session). No backend data is modified, no wallet signatures are requested, and no
          on-chain transactions are sent.
        </p>
      </div>

      {/* 1. Profile */}
      <SectionCard
        icon={User}
        title="Profile"
        description="Who you are inside The Syndicate. Seat identity is binary; only your display name is editable."
        status="LIVE NOW"
      >
        <div className="space-y-1">
          <SettingRow
            title="Display name"
            description="A local label for this prototype session. Does not change your on-chain seat."
          >
            <div className="flex items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="w-48 bg-background/50"
                aria-label="Display name"
                data-testid="input-display-name"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={saveName}
                disabled={nameDraft.trim() === displayName.trim() || !nameDraft.trim()}
                data-testid="btn-save-name"
              >
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </SettingRow>
          <Separator className="bg-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="rounded-lg border border-white/5 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Wallet</div>
              <div className="font-mono text-sm mt-1">{walletDisplay}</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Member number</div>
              <div className="font-mono text-sm mt-1">{MOCK_DATA.memberNumber}</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Chapter</div>
              <div className="text-sm mt-1">{MOCK_DATA.chapter}</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Role</div>
              <div className="text-sm mt-1 flex items-center gap-2">
                {role}
                {isFounder && <StatusBadge status="LIVE NOW" showTooltip={false} className="text-[9px]" />}
              </div>
            </div>
          </div>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Connection status"
            description="Simulated wallet session. Connecting and disconnecting are local prototype actions."
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-wider ${
                isConnected
                  ? "border-green-500/20 bg-green-500/10 text-green-500"
                  : "border-neutral-500/20 bg-neutral-500/10 text-neutral-400"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-neutral-500"}`} />
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </SettingRow>
        </div>
      </SectionCard>

      {/* 2. Appearance */}
      <SectionCard
        icon={Palette}
        title="Appearance"
        description="Tune the interface to your environment. Preferences persist in your browser."
        status="LIVE NOW"
      >
        <div className="space-y-1">
          <SettingRow title="Theme" description="Switch between dark (default) and light mode.">
            <Button variant="outline" onClick={toggleTheme} data-testid="btn-toggle-theme">
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" /> Light mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" /> Dark mode
                </>
              )}
            </Button>
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Density"
            description="Comfortable spacing for reading, or compact to fit more on screen."
          >
            <Select value={density} onValueChange={(v) => setDensity(v as "comfortable" | "compact")}>
              <SelectTrigger className="w-44 bg-background/50" data-testid="select-density">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Reduced motion"
            description="Minimize animations and transitions across the interface."
          >
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
              data-testid="switch-reduced-motion"
            />
          </SettingRow>
        </div>
      </SectionCard>

      {/* 3. Wallet & Network */}
      <SectionCard
        icon={Wallet}
        title="Wallet & Network"
        description="Your simulated wallet session and preferred network. No signatures are requested."
        status="SIMULATED PROTOTYPE"
      >
        <div className="space-y-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="rounded-lg border border-white/5 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Connected wallet</div>
              <div className="font-mono text-sm mt-1 flex items-center gap-2">
                {walletDisplay}
              </div>
            </div>
            <div className="rounded-lg border border-white/5 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Preferred network</div>
              <div className="text-sm mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {MOCK_DATA.network}
              </div>
            </div>
          </div>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Copy address"
            description="Copies the full simulated wallet address to your clipboard."
          >
            <Button variant="outline" size="sm" onClick={copyAddress} data-testid="btn-copy-address">
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="View on explorer"
            description="Opens a block explorer. Address is simulated for this prototype."
          >
            <Button variant="outline" size="sm" disabled className="opacity-60 cursor-not-allowed" data-testid="btn-explorer">
              Explorer (Simulated) <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Disconnect wallet"
            description="Ends the simulated session and returns you to the public site. No on-chain effect."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={!isConnected}
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
              data-testid="btn-disconnect"
            >
              <LogOut className="h-4 w-4 mr-2" /> Disconnect
            </Button>
          </SettingRow>
        </div>
      </SectionCard>

      {/* 4. Notifications */}
      <SectionCard
        icon={Bell}
        title="Notifications"
        description="Choose what The Syndicate would surface to you. Delivery is simulated in this prototype."
        status="V1 CANDIDATE"
      >
        <div className="space-y-1">
          <SettingRow
            title="Protocol evolution updates"
            description="New episodes, module status changes, and roadmap milestones."
          >
            <Switch
              checked={notifyEvolution}
              onCheckedChange={setNotifyEvolution}
              data-testid="switch-notify-evolution"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Membership receipt updates"
            description="Confirmations when USDC is routed and receipts are recorded."
          >
            <Switch
              checked={notifyReceipts}
              onCheckedChange={setNotifyReceipts}
              data-testid="switch-notify-receipts"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Verified Introduction activity"
            description="Updates on referral / verified introduction status (V1 candidate)."
          >
            <Switch
              checked={notifyReferral}
              onCheckedChange={setNotifyReferral}
              data-testid="switch-notify-referral"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Archive memory updates"
            description="When new memory artifacts are anchored to your seat."
          >
            <Switch
              checked={notifyArchive}
              onCheckedChange={setNotifyArchive}
              data-testid="switch-notify-archive"
            />
          </SettingRow>
          {isFounder && (
            <>
              <Separator className="bg-white/5" />
              <SettingRow
                title="Founder / operator briefings"
                description="Operational notes intended for founders and operators. Visible because Founder / Operator mode is active."
              >
                <Switch
                  checked={notifyFounder}
                  onCheckedChange={setNotifyFounder}
                  data-testid="switch-notify-founder"
                />
              </SettingRow>
            </>
          )}
        </div>
      </SectionCard>

      {/* 5. Security */}
      <SectionCard
        icon={ShieldCheck}
        title="Security"
        description="Harden the prototype experience. These are preferences, not enforced contract logic."
        status="SIMULATED PROTOTYPE"
      >
        <div className="space-y-1">
          <SettingRow
            title="High security mode"
            description="Adds extra confirmation steps before any non-read action."
          >
            <Switch
              checked={highSecurity}
              onCheckedChange={setHighSecurity}
              data-testid="switch-high-security"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Require signed message before sensitive actions"
            description="Simulated signature prompt before disconnect, approvals, and resets."
          >
            <Switch
              checked={requireSignedMessage}
              onCheckedChange={setRequireSignedMessage}
              data-testid="switch-signed-message"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Session timeout"
            description="Auto-lock the simulated session after a period of inactivity."
          >
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger className="w-44 bg-background/50" data-testid="select-session-timeout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Hide wallet balance"
            description="Mask balances throughout the interface for shoulder-surfing protection."
          >
            <Switch
              checked={hideBalance}
              onCheckedChange={setHideBalance}
              data-testid="switch-hide-balance"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Mask wallet address"
            description="Abbreviate your address everywhere it appears, including this page."
          >
            <Switch
              checked={maskAddress}
              onCheckedChange={setMaskAddress}
              data-testid="switch-mask-address"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Show approval warnings"
            description="Display a caution before any simulated token approval."
          >
            <Switch
              checked={showApprovalWarnings}
              onCheckedChange={setShowApprovalWarnings}
              data-testid="switch-approval-warnings"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <div className="rounded-lg border border-white/5 bg-background/50 p-4 mt-2 flex gap-3">
            <KeyRound className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Revoking approvals.</span> Token approvals
              let a contract move funds on your behalf. Review allowances regularly and revoke any you
              no longer use. In production, revocation happens from the Wallet surface and requires a
              wallet signature — here it is education only.
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 6. Privacy */}
      <SectionCard
        icon={Eye}
        title="Privacy"
        description="Control what others can see. Contribution depth is variable; capital footprint is verified USDC routed through receipts."
        status="READ-ONLY"
      >
        <div className="space-y-1">
          <SettingRow
            title="Public profile visibility"
            description="Allow your seat to appear in the public Registry."
          >
            <Switch
              checked={publicProfile}
              onCheckedChange={setPublicProfile}
              data-testid="switch-public-profile"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Show contribution depth"
            description="Display your variable contribution depth on your public record."
          >
            <Switch
              checked={showDepth}
              onCheckedChange={setShowDepth}
              disabled={!publicProfile}
              data-testid="switch-show-depth"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Show capital footprint"
            description="Display verified USDC routed through receipts on your record."
          >
            <Switch
              checked={showFootprint}
              onCheckedChange={setShowFootprint}
              disabled={!publicProfile}
              data-testid="switch-show-footprint"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Show recognition axes"
            description="Display your standing across the eleven recognition axes."
          >
            <Switch
              checked={showAxes}
              onCheckedChange={setShowAxes}
              disabled={!publicProfile}
              data-testid="switch-show-axes"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Enhanced wallet privacy"
            description="Avoid linking your display name to your wallet on shared surfaces."
          >
            <Switch
              checked={walletPrivacy}
              onCheckedChange={setWalletPrivacy}
              data-testid="switch-wallet-privacy"
            />
          </SettingRow>
          <div className="rounded-lg border border-white/5 bg-background/50 p-4 mt-2 flex gap-3">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              Seat identity is binary — you either hold a seat or you do not. These toggles only
              affect what is displayed to others, not whether your seat exists.
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 7. Founder / Operator (only when isFounder) */}
      {isFounder && (
        <SectionCard
          icon={Terminal}
          title="Founder / Operator"
          description="Operational controls visible because Founder / Operator mode is active. Read-only in this prototype."
          status="IN REVIEW"
        >
          <div className="space-y-1">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-foreground">Founder wallet detected</div>
                <div className="text-muted-foreground font-mono mt-0.5">{walletDisplay}</div>
              </div>
            </div>

            <div className="py-4">
              <div className="text-sm font-medium text-foreground mb-3">Role permissions</div>
              <ul className="space-y-2">
                {founderPermissions.map((perm) => (
                  <li key={perm} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
            <Separator className="bg-white/5" />
            <SettingRow
              title="Prompt generation preferences"
              description="Auto-draft operator prompts when reviewing module activations."
            >
              <Switch
                checked={autoPrompt}
                onCheckedChange={setAutoPrompt}
                data-testid="switch-auto-prompt"
              />
            </SettingRow>
            <Separator className="bg-white/5" />
            <SettingRow
              title="Replit / Codex workflow"
              description="Prefer Codex-style review flows when generating operator tasks."
            >
              <Switch
                checked={codexWorkflow}
                onCheckedChange={setCodexWorkflow}
                data-testid="switch-codex-workflow"
              />
            </SettingRow>
            <Separator className="bg-white/5" />
            <div className="py-4">
              <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                Audit log
                <StatusBadge status="READ-ONLY" showTooltip={false} className="text-[9px]" />
              </div>
              <div className="space-y-2">
                {auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-background/50 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-foreground">{entry.action}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{entry.actor}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono shrink-0">{entry.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Prototype / Demo state */}
      <SectionCard
        icon={FlaskConical}
        title="Prototype Role Switcher"
        description="Preview the four prototype states (public, connected, seated, founder). These toggles only change what this prototype shows — they perform no real blockchain actions and grant no real permissions."
        status="SIMULATED PROTOTYPE"
      >
        <div className="space-y-1">
          <div
            className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 mb-3 text-xs font-mono uppercase tracking-wider text-orange-300 flex items-center gap-2"
            data-testid="role-switcher-warning"
          >
            <Info className="h-4 w-4 shrink-0" />
            Prototype role switcher · Not production auth · Simulated role
          </div>
          <SettingRow
            title="Wallet connected"
            description="Simulates an active wallet session. Turning this off returns you toward the public site, as a real disconnect would."
          >
            <Switch
              checked={isConnected}
              onCheckedChange={setIsConnected}
              data-testid="demo-state-connected"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Seat held"
            description="Off = connected wallet without a seat (preview the not-seated state)."
          >
            <Switch
              checked={isSeated}
              onCheckedChange={setIsSeated}
              data-testid="demo-state-seated"
            />
          </SettingRow>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Founder / Operator console"
            description="Reveals the Founder Console and founder-only surfaces. A demo switch only — it grants no real permissions."
          >
            <Switch
              checked={isFounder}
              onCheckedChange={setFounder}
              data-testid="demo-state-founder"
            />
          </SettingRow>
        </div>
      </SectionCard>

      {/* Production authorization (future) */}
      <ProductionAuthNote />

      {/* 8. Prototype / Data */}
      <SectionCard
        icon={FlaskConical}
        title="Prototype / Data"
        description="Demo-state controls. These reveal hidden surfaces and reset the experience — nothing here touches a backend."
        status="SIMULATED PROTOTYPE"
      >
        <div className="space-y-1">
          <SettingRow
            title="Show canonical values"
            description="Display canonical truths (routing split, statuses) alongside simulated data."
          >
            <Switch
              checked={showCanonical}
              onCheckedChange={setShowCanonical}
              data-testid="switch-show-canonical"
            />
          </SettingRow>
          {showCanonical && (
            <div className="rounded-lg border border-white/5 bg-background/50 p-4 mt-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Canonical USDC routing
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold font-mono text-primary">70%</div>
                  <div className="text-xs text-muted-foreground">Vault</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-primary">20%</div>
                  <div className="text-xs text-muted-foreground">Liquidity</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-primary">10%</div>
                  <div className="text-xs text-muted-foreground">Operations</div>
                </div>
              </div>
            </div>
          )}
          <Separator className="bg-white/5" />
          <div className="rounded-lg border border-white/5 bg-background/50 p-4 mt-2 flex gap-3">
            <Database className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Data source.</span> All values in this
              prototype are mocked. Addresses and balances are simulated; canonical truths (the
              70% / 20% / 10% routing split, module statuses, and doctrine) are accurate. Nothing is read
              from or written to a live contract or backend.
            </div>
          </div>
          <Separator className="bg-white/5" />
          <SettingRow
            title="Reset demo state"
            description="Return all prototype preferences to their canonical defaults."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-destructive border-destructive/20 hover:bg-destructive/10"
              data-testid="btn-reset-demo"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </SettingRow>
        </div>
      </SectionCard>

      {/* Official Channels */}
      <SectionCard
        icon={Megaphone}
        title="Official Channels"
        description="The only official channels for The Syndicate. Verify links before engaging."
        status="LIVE NOW"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" className="w-full justify-between" asChild data-testid="link-x">
            <a href="https://x.com/TheSyndicateOne" target="_blank" rel="noreferrer">
              X (Twitter)
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-between" asChild data-testid="link-telegram">
            <a href="https://t.me/TheSyndicateMoney" target="_blank" rel="noreferrer">
              Telegram
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
