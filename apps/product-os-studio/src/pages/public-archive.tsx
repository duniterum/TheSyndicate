import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/share-dialog";
import { Share2 } from "lucide-react";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";

export default function PublicArchive() {
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-archive">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Archive / Memory</h1>
        <StatusBadge status="READ-ONLY" />
      </div>
      
      <PublicProofNote surfaceId="archive" />
      
      <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
        Protocol Memory Layer. Memory and milestone artifacts — a public preview of the objects the protocol anchors. These are memory, not financial rights.
      </p>

      <motion.div 
        className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl text-sm text-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="font-bold mb-1">Memory, Not Claims</p>
        <p>NFTs are memory. NFTs are not seats. NFTs do not create financial rights. Archive is a public preview.</p>
      </motion.div>

      <motion.div
        className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-sm text-emerald-100/90 space-y-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        data-testid="archive-id-scheme"
      >
        <p className="font-bold mb-1 flex items-center gap-2">
          Archive IDs <StatusBadge status="READ-ONLY PRODUCTION PROOF" showTooltip={false} className="scale-90 origin-left" />
        </p>
        <ul className="space-y-1 text-emerald-100/80">
          <li><span className="font-mono">#1</span> First Signal — public, open.</li>
          <li><span className="font-mono">#2</span> Reserved / disabled — a future <span className="font-mono">SeatRecord721</span> identity record (not deployed).</li>
          <li><span className="font-mono">#3</span> Patron Seal — gated.</li>
        </ul>
        <p className="text-xs text-emerald-100/70">
          Canonical IDs from the production porting map, shown read-only. Archive is ERC-1155 protocol memory — not source-aware, no financial rights.
        </p>
      </motion.div>

      <div className="space-y-8 pt-4">
        <h2 className="text-2xl font-bold border-b border-white/10 pb-2">Preview Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_DATA.archiveItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 overflow-hidden h-full flex flex-col">
                <div className="aspect-square bg-white/5 relative shrink-0">
                  <img 
                    src={`/artifact-${i + 1}.png`} 
                    alt={item.name} 
                    className="w-full h-full object-cover opacity-80 mix-blend-screen"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTIwMmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzRjNTU2ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkFydGlmYWN0PC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                <CardHeader className="pb-2 shrink-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{item.description}</p>
                  <div className="flex justify-between items-center text-xs font-mono mb-4 shrink-0">
                    <span className="text-muted-foreground">{item.type}</span>
                    <span>{item.date}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <ShareDialog
                      payload={{
                        eyebrow: "Archive Memory",
                        title: item.name,
                        summary: item.description,
                        accent: "violet",
                        lines: [
                          { label: "Type", value: item.type },
                          { label: "Date", value: item.date },
                        ],
                        footnote: "memory, not rights",
                        shareText: `The Syndicate archive preview: "${item.name}" — memory of a moment in a living institution. Memory, not financial rights.`,
                      }}
                      trigger={
                        <Button variant="outline" size="sm" className="w-full" data-testid={`archive-share-${item.id}`}>
                          <Share2 className="w-3.5 h-3.5" /> Share Concept
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      <ConnectForPersonalCta surfaceId="archive" />
    </div>
  );
}
