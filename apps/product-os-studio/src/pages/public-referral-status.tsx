import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";
import { MOCK_DATA } from "@/lib/mock-data";
import { ShieldAlert, AlertTriangle, Check } from "lucide-react";

export default function PublicReferralStatus() {
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-referral-status">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
          Verified Introduction
          <StatusBadge status="V1 CANDIDATE" />
        </h1>
      </div>

      <PublicProofNote surfaceId="referral-status" />

      <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
        Source-aware membership acquisition protocol. A V1 candidate mechanism, not live today.
      </p>

      <motion.div
        className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-xl text-sm text-orange-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-bold mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Not Live Today</p>
        <p className="leading-relaxed">
          No public source link today, no source dashboard today, no claim UI today, no public source-aware buy path today.
          Default attribution is currently fixed to <span className="font-mono text-orange-300">{MOCK_DATA.defaultSourceId}</span>.
          No yield. No MLM.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-bold text-purple-400 flex justify-between items-center">
                V1 Candidate Scope
                <StatusBadge status="V1 CANDIDATE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-sm">
              <ul className="space-y-5 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                  <span><strong>Invite-only mechanism</strong>. Manually approved sources only. Not an open affiliate program.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                  <span><strong>MembershipSaleV3 integration</strong>. Scoped strictly to the live membership engine.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> 
                  <span><strong>Buyer-clearable</strong>. New entrants will always be able to clear their source identity and return to the default {MOCK_DATA.defaultSourceId}.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white/5 border-white/10 border-l-4 border-l-orange-500 h-full">
            <CardContent className="p-6 flex gap-4 h-full">
              <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-4">
                <h3 className="font-bold text-orange-200">Doctrine & Compliance</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {MOCK_DATA.doctrine}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed border-t border-white/10 pt-4">
                  If activated, Verified Introduction links must not be promoted as a financial offering, yield opportunity, or MLM. Do not promise downline commissions. 
                  Protocol mechanics are transparent; misrepresentation will result in immediate source revocation.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="pt-4">
        <ConnectForPersonalCta surfaceId="referral-status" />
      </div>
    </div>
  );
}
