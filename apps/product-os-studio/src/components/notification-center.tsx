import { useState } from "react";
import { Link } from "wouter";
import { Bell, Check, Receipt, GitBranch, Share2, ShieldCheck, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_DATA } from "@/lib/mock-data";

const CATEGORY_ICON: Record<string, typeof Bell> = {
  Receipt: Receipt,
  Evolution: GitBranch,
  Source: Share2,
  Release: Rocket,
  Security: ShieldCheck,
};

type NoteItem = (typeof MOCK_DATA.notifications)[number] & { read?: boolean };

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NoteItem[]>(() =>
    MOCK_DATA.notifications.map((n) => ({ ...n }))
  );

  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markRead = (id: string) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          data-testid="btn-notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center"
              data-testid="notification-badge"
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0 overflow-hidden"
        data-testid="notification-panel"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            <StatusBadge status="SIMULATED PROTOTYPE" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            data-testid="btn-mark-all-read"
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all read
          </Button>
        </div>

        <ScrollArea className="max-h-[340px]">
          <div className="divide-y divide-border">
            {items.map((n) => {
              const Icon = CATEGORY_ICON[n.category] ?? Bell;
              return (
                <Link
                  key={n.id}
                  href={n.surface}
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                  }}
                >
                  <div
                    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                      n.unread ? "bg-primary/[0.04]" : ""
                    }`}
                    data-testid={`notification-${n.id}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                        <Icon className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {n.title}
                        </span>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {n.body}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-1 inline-block">
                        {n.category} · {n.time}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        <div className="px-4 py-2.5 border-t text-[11px] text-muted-foreground bg-card/40">
          Prototype only — notifications are simulated, no alerts are sent.
        </div>
      </PopoverContent>
    </Popover>
  );
}
