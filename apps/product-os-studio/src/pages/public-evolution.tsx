import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublicProofNote, ConnectForPersonalCta } from "@/components/connect-cta";
import { MOCK_DATA } from "@/lib/mock-data";
import { Hexagon, Circle, CheckCircle2, Database } from "lucide-react";

export default function PublicEvolution() {
  const episodes = MOCK_DATA.protocolEpisodes;
  const liveBoard = MOCK_DATA.liveBoard;

  const liveModules = liveBoard.filter(m => m.status === "LIVE NOW");
  const readOnlyModules = liveBoard.filter(m => m.status === "READ-ONLY");
  const candidateModules = liveBoard.filter(m => m.status === "V1 CANDIDATE" || m.status === "IN REVIEW");
  const futureModules = liveBoard.filter(m => m.status === "FUTURE");

  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl space-y-8" data-testid="page-public-evolution">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
          Evolution
          <StatusBadge status="READ-ONLY" />
        </h1>
      </div>

      <PublicProofNote surfaceId="evolution" />

      <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
        The Syndicate is an unfolding series. Watch the protocol mature as new capabilities transition from concept to immutable reality. A living institution forming in public.
      </p>

      {/* Narrative Timeline */}
      <motion.div
        className="space-y-8 pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">The Series</h2>
        </div>

        <div className="relative border-l-2 border-white/10 ml-6 md:ml-8 space-y-12 pb-8">
          {episodes.map((ep, index) => {
            const isLive = ep.status === "LIVE NOW";
            return (
              <motion.div
                key={ep.id}
                className="relative pl-8 md:pl-12"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Timeline node */}
                <div className={`absolute -left-[21px] top-1 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center ${isLive ? 'bg-primary' : 'bg-muted'}`}>
                  {isLive ? <CheckCircle2 className="w-5 h-5 text-background" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-primary uppercase tracking-wider">Episode {ep.id}</span>
                        <span className="text-sm text-muted-foreground">• {ep.date}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold">{ep.name}</h3>
                        <StatusBadge status={ep.status as any} />
                      </div>
                      <p className="text-muted-foreground mt-2">{ep.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Module Matrix */}
      <motion.div
        className="space-y-8 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Protocol Surfaces</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Live & Verifiable
                <StatusBadge status="LIVE NOW" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {liveModules.map(m => (
                <div key={m.name} className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {m.name}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Read-Only
                <StatusBadge status="READ-ONLY" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {readOnlyModules.map(m => (
                <div key={m.name} className="flex items-center gap-2 text-sm font-medium text-blue-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {m.name}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Candidate
                <StatusBadge status="V1 CANDIDATE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {candidateModules.map(m => (
                <div key={m.name} className="flex items-center gap-2 text-sm font-medium text-purple-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {m.name}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                Future
                <StatusBadge status="FUTURE" showTooltip={false} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {futureModules.map(m => (
                <div key={m.name} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  {m.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <ConnectForPersonalCta surfaceId="evolution" />
    </div>
  );
}
