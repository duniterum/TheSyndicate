import React from 'react';
import './_group.css';

export function DirectionBoard() {
  return (
    <div className="obsidian-board min-h-screen w-full flex flex-col items-center py-20 px-8 text-sm">
      <div className="w-full max-w-[1280px] flex flex-col gap-32">
        
        {/* 1. Cover */}
        <section className="flex flex-col gap-6 border-l-2 border-[hsl(var(--accent-cyan))] pl-8">
          <h4 className="text-[hsl(var(--accent-cyan))] font-mono uppercase tracking-widest text-xs">Direction A</h4>
          <h1 className="text-6xl font-bold tracking-tight">Obsidian Cockpit</h1>
          <p className="text-2xl text-[hsl(var(--text-muted))] max-w-3xl leading-relaxed">
            Member OS first / Mission control.
          </p>
          <p className="text-lg text-[hsl(var(--text-muted))] max-w-4xl leading-relaxed">
            The dashboard is the product. The whole identity reads like the cockpit of a living protocol — dense telemetry, instrument panels, status rails, monospace data everywhere, sharp grid alignment, glowing accents on near-black obsidian surfaces.
          </p>
        </section>

        {/* 2. Color system */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">01 // Color System</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ColorSwatch name="Obsidian (Bg)" hex="#090A0C" color="hsl(var(--bg-obsidian))" />
            <ColorSwatch name="Panel (Surface)" hex="#121418" color="hsl(var(--bg-panel))" />
            <ColorSwatch name="Cyan (Accent)" hex="#00FFFF" color="hsl(var(--accent-cyan))" />
            <ColorSwatch name="Primary Text" hex="#F2F2F2" color="hsl(var(--text-primary))" />
            <ColorSwatch name="Muted Text" hex="#8A92A0" color="hsl(var(--text-muted))" />
          </div>
        </section>

        {/* 3. Typography */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">02 // Typography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="font-mono text-[hsl(var(--accent-cyan))] mb-4 text-xs">UI / DISPLAY — SPACE GROTESK</p>
              <div className="flex flex-col gap-4">
                <div className="text-5xl font-bold">The Syndicate</div>
                <div className="text-2xl font-medium">Mission Control</div>
                <div className="text-base text-[hsl(var(--text-muted))]">SYN is the seat. The protocol is alive. Everything is verifiable on-chain. Truth before marketing.</div>
              </div>
            </div>
            <div>
              <p className="font-mono text-[hsl(var(--accent-cyan))] mb-4 text-xs">DATA / MONO — SPACE MONO</p>
              <div className="flex flex-col gap-4 font-mono">
                <div className="text-3xl">0x8A9…4F21</div>
                <div className="text-xl">BLOCK #149,203</div>
                <div className="text-sm text-[hsl(var(--text-muted))]">TX HASH: 0x4B2A0F1…</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Logo + Favicon */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">03 // Logo & Identity</h2>
          <div className="flex items-center gap-12 bg-[hsl(var(--bg-panel))] p-12 rounded border border-[hsl(var(--border-dim))]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black border border-[hsl(var(--accent-cyan))] flex items-center justify-center glow-cyan">
                <span className="font-mono text-xl font-bold text-[hsl(var(--accent-cyan))]">S</span>
              </div>
              <span className="text-3xl font-bold tracking-widest uppercase">The Syndicate</span>
            </div>
            <div className="h-12 w-px bg-[hsl(var(--border-dim))]"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-black border border-[hsl(var(--text-muted))] flex items-center justify-center">
                <span className="font-mono text-sm font-bold">S</span>
              </div>
              <span className="font-mono text-xs text-[hsl(var(--text-muted))]">Favicon</span>
            </div>
          </div>
        </section>

        {/* 5. Header / Nav */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">04 // Navigation</h2>
          <div className="bg-[hsl(var(--bg-panel))] border-b border-[hsl(var(--border-dim))] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="w-8 h-8 bg-black border border-[hsl(var(--accent-cyan))] flex items-center justify-center glow-cyan">
                <span className="font-mono text-xs font-bold text-[hsl(var(--accent-cyan))]">S</span>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium text-[hsl(var(--text-muted))]">
                <span className="text-[hsl(var(--text-primary))]">Home</span>
                <span>Join</span>
                <span>My Syndicate</span>
                <span>Archive</span>
                <span>Chronicle</span>
                <span>Proof</span>
              </nav>
            </div>
            <button className="font-mono text-xs border border-[hsl(var(--border-bright))] px-4 py-2 hover:border-[hsl(var(--accent-cyan))] hover:text-[hsl(var(--accent-cyan))] transition-colors">
              CONNECT WALLET
            </button>
          </div>
        </section>

        {/* 6. Buttons */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">05 // Actions</h2>
          <div className="flex flex-wrap gap-6 items-center bg-[hsl(var(--bg-panel))] p-8 border border-[hsl(var(--border-dim))] rounded">
            <button className="bg-[hsl(var(--accent-cyan))] text-black px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide hover:opacity-90">
              Mint Seat Record
            </button>
            <button className="border border-[hsl(var(--border-bright))] px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-[hsl(var(--bg-surface))]">
              View Contract
            </button>
            <button className="text-[hsl(var(--text-muted))] px-6 py-3 font-mono text-sm uppercase tracking-wide hover:text-[hsl(var(--text-primary))]">
              Cancel
            </button>
            <button className="border border-red-900 text-red-500 bg-red-950/20 px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-red-900/40">
              Revoke Access
            </button>
            <button className="border border-[hsl(var(--border-dim))] text-[hsl(var(--text-dark))] px-6 py-3 font-mono text-sm uppercase tracking-wide cursor-not-allowed">
              Processing...
            </button>
          </div>
        </section>

        {/* 7. Status Badges */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">06 // Telemetry & Badges</h2>
          <div className="flex flex-wrap gap-4 p-8 bg-[hsl(var(--bg-panel))] border border-[hsl(var(--border-dim))]">
            <Badge className="bg-[hsl(var(--accent-cyan))/0.1] border-[hsl(var(--accent-cyan))] text-[hsl(var(--accent-cyan))] glow-cyan">ACTIVE SEAT</Badge>
            <Badge className="bg-yellow-900/20 border-yellow-700/50 text-yellow-500">PENDING TX</Badge>
            <Badge className="bg-green-900/20 border-green-700/50 text-green-500">VERIFIED ON-CHAIN</Badge>
            <Badge className="bg-purple-900/20 border-purple-700/50 text-purple-400">CHAPTER OPEN</Badge>
            <Badge className="bg-[hsl(var(--bg-surface))] border-[hsl(var(--border-bright))] text-[hsl(var(--text-muted))]">MINTED</Badge>
            <Badge className="bg-black border-[hsl(var(--border-bright))] font-mono">SEAT #0042</Badge>
          </div>
        </section>

        {/* 8. Card System & 9. Dashboard Widgets */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">07 // Cockpit Panels & Readouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel title="TREASURY BALANCE" value="$142,500.00 USDC" detail="AVAX: 2,450.5" />
            <Panel title="ACTIVE SEATS" value="842" detail="CHAPTER 2" />
            <Panel title="USDC ROUTED" value="$1.2M" detail="ALL TIME" />
          </div>
        </section>

        {/* 10. Home Hero */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">08 // Home (Hero)</h2>
          <div className="relative h-[600px] border border-[hsl(var(--border-dim))] bg-[hsl(var(--bg-panel))] flex items-center justify-center overflow-hidden">
            {/* Grid background effect */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(hsl(var(--accent-cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent-cyan)) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
            
            <div className="relative z-10 flex flex-col items-center text-center gap-8 px-6 max-w-4xl">
              <div className="font-mono text-[hsl(var(--accent-cyan))] tracking-[0.3em] text-sm">AVALANCHE // USDC</div>
              <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter">The Protocol<br/>Is Alive</h1>
              <p className="text-xl text-[hsl(var(--text-muted))] max-w-2xl font-light">
                SYN is the seat. Artifacts are the memory. Join the living on-chain membership protocol.
              </p>
              <div className="flex gap-4 mt-4">
                <button className="bg-[hsl(var(--accent-cyan))] text-black px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide">
                  Join Chapter 3
                </button>
                <button className="border border-[hsl(var(--border-bright))] px-8 py-4 font-mono text-sm uppercase tracking-wide bg-black/50">
                  Read Chronicle
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 11. My Syndicate (Cockpit) */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">09 // My Syndicate (Cockpit OS)</h2>
          <div className="border border-[hsl(var(--border-dim))] bg-[hsl(var(--bg-panel))] flex flex-col min-h-[700px]">
            <div className="border-b border-[hsl(var(--border-dim))] p-4 flex justify-between items-center bg-black/30">
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm text-[hsl(var(--accent-cyan))]">TERMINAL_ACTIVE</div>
                <div className="w-2 h-2 bg-[hsl(var(--accent-cyan))] rounded-full animate-pulse glow-cyan"></div>
              </div>
              <div className="font-mono text-xs text-[hsl(var(--text-muted))]">0x8A9…4F21 // CONNECTED</div>
            </div>
            
            <div className="flex-1 grid grid-cols-12 gap-px bg-[hsl(var(--border-dim))]">
              {/* Left rail */}
              <div className="col-span-3 bg-[hsl(var(--bg-panel))] p-6 flex flex-col gap-8">
                <div>
                  <h3 className="font-mono text-xs text-[hsl(var(--text-muted))] mb-4">IDENTITY</h3>
                  <div className="text-3xl font-bold">SEAT #0042</div>
                  <div className="text-[hsl(var(--accent-cyan))] font-mono text-sm mt-1">CHAPTER 1</div>
                </div>
                
                <div className="h-px w-full bg-[hsl(var(--border-bright))]"></div>
                
                <ul className="flex flex-col gap-4 font-mono text-sm">
                  <li className="text-[hsl(var(--accent-cyan))]">→ OVERVIEW</li>
                  <li className="text-[hsl(var(--text-muted))] hover:text-white">→ ARTIFACTS (4)</li>
                  <li className="text-[hsl(var(--text-muted))] hover:text-white">→ TREASURY</li>
                  <li className="text-[hsl(var(--text-muted))] hover:text-white">→ SETTINGS</li>
                </ul>
              </div>
              
              {/* Main OS view */}
              <div className="col-span-9 bg-[hsl(var(--bg-obsidian))] p-8 flex flex-col gap-8">
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-bold uppercase tracking-tight">System Status</h2>
                  <Badge className="bg-green-900/20 border-green-700/50 text-green-500 font-mono">ALL SYSTEMS NOMINAL</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="border border-[hsl(var(--border-bright))] bg-black/40 p-6 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[hsl(var(--accent-cyan))/0.05] rounded-bl-full"></div>
                    <div className="font-mono text-xs text-[hsl(var(--text-muted))]">NEXT ACTION</div>
                    <div className="text-xl font-bold">Mint Patron Seal</div>
                    <p className="text-sm text-[hsl(var(--text-muted))]">Your seat is eligible for the Chapter 2 Patron Seal artifact.</p>
                    <button className="mt-4 border border-[hsl(var(--accent-cyan))] text-[hsl(var(--accent-cyan))] px-4 py-2 font-mono text-xs self-start hover:bg-[hsl(var(--accent-cyan))] hover:text-black transition-colors">
                      INITIATE MINT
                    </button>
                  </div>
                  
                  <div className="border border-[hsl(var(--border-bright))] bg-black/40 p-6 flex flex-col gap-4">
                    <div className="font-mono text-xs text-[hsl(var(--text-muted))]">LATEST ACTIVITY</div>
                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border-dim))] pb-2">
                        <span className="text-[hsl(var(--text-primary))]">SEAT_RECORD_MINT</span>
                        <span className="text-[hsl(var(--text-muted))]">12h ago</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[hsl(var(--border-dim))] pb-2">
                        <span className="text-[hsl(var(--text-primary))]">HEART_SIGNAL</span>
                        <span className="text-[hsl(var(--text-muted))]">2d ago</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[hsl(var(--text-primary))]">JOINED_PROTOCOL</span>
                        <span className="text-[hsl(var(--text-muted))]">5d ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12. Archive / Artifacts */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">10 // Archive (Artifact Gallery)</h2>
          <div className="bg-[hsl(var(--bg-panel))] border border-[hsl(var(--border-dim))] p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ArtifactCard title="SEAT RECORD" img="/__mockup/images/ref-artifacts-1.png" id="0042" status="MINTED" />
              <ArtifactCard title="PATRON SEAL" img="/__mockup/images/ref-artifacts-2.png" id="0042" status="ELIGIBLE" />
              <ArtifactCard title="THE FIRST SIGNAL" status="LOCKED" />
              <ArtifactCard title="HEART SIGNAL" status="LOCKED" />
            </div>
          </div>
        </section>

        {/* 13. Chronicle */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">11 // Chronicle (Long-form)</h2>
          <div className="bg-[hsl(var(--bg-panel))] border border-[hsl(var(--border-dim))] p-16 max-w-4xl mx-auto w-full font-serif">
            <h1 className="text-5xl mb-8 leading-tight">The Doctrine of<br/>The Syndicate</h1>
            <p className="text-xl mb-6 text-[hsl(var(--text-muted))] leading-relaxed">
              SYN is the seat. It is not an abstract token; it is a position within a living system. Holding it confers rights, memory, and access.
            </p>
            <p className="text-lg mb-6 leading-relaxed">
              We reject the static brochure. We embrace the protocol as a living, breathing entity whose memory is etched indelibly onto the chain. Artifacts are the memory. They cannot be forged, they cannot be erased. 
            </p>
            <div className="font-sans font-mono text-xs border-t border-[hsl(var(--border-dim))] pt-6 mt-12 text-[hsl(var(--text-muted))]">
              // CHRONICLE ENTRY 001 // VERIFIED ON-CHAIN
            </div>
          </div>
        </section>

        {/* 14. Proof */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4">12 // Proof (On-chain Verification)</h2>
          <div className="bg-black border border-[hsl(var(--border-dim))] p-8 font-mono text-sm flex flex-col gap-4">
            <div className="flex items-center gap-4 text-[hsl(var(--accent-cyan))] mb-4 border-b border-[hsl(var(--border-dim))] pb-4">
              <div className="w-2 h-2 bg-[hsl(var(--accent-cyan))] rounded-full"></div>
              <span>ON-CHAIN VERIFICATION ENGINE</span>
            </div>
            
            <div className="grid grid-cols-[150px_1fr] gap-4 text-[hsl(var(--text-muted))] border-b border-[hsl(var(--border-dim))] pb-4">
              <span>CONTRACT:</span>
              <span className="text-[hsl(var(--text-primary))] break-all">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-4 text-[hsl(var(--text-muted))] border-b border-[hsl(var(--border-dim))] pb-4">
              <span>LATEST TX:</span>
              <span className="text-[hsl(var(--accent-blue))] break-all cursor-pointer hover:underline">0x4B2A0F1…9D3E</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-4 text-[hsl(var(--text-muted))]">
              <span>BLOCK:</span>
              <span className="text-[hsl(var(--text-primary))]">149,203 (CONFIRMED)</span>
            </div>
          </div>
        </section>

        {/* 15. Mobile */}
        <section className="flex flex-col gap-8 items-center pb-32">
          <h2 className="text-2xl font-bold tracking-tight border-b border-[hsl(var(--border-dim))] pb-4 w-full self-start">13 // Mobile View</h2>
          
          <div className="w-[390px] h-[844px] border-[8px] border-[hsl(var(--border-bright))] rounded-[40px] bg-[hsl(var(--bg-obsidian))] overflow-hidden flex flex-col relative">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[hsl(var(--border-bright))] w-40 mx-auto rounded-b-2xl z-20"></div>
            
            <div className="p-4 border-b border-[hsl(var(--border-dim))] mt-6 flex justify-between items-center bg-[hsl(var(--bg-panel))]">
              <span className="font-bold text-lg">The Syndicate</span>
              <div className="w-8 h-8 rounded-full bg-black border border-[hsl(var(--border-bright))] flex items-center justify-center">
                <span className="font-mono text-xs">0x</span>
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="bg-[hsl(var(--bg-panel))] p-6 rounded border border-[hsl(var(--border-dim))] flex flex-col gap-2">
                <span className="font-mono text-xs text-[hsl(var(--accent-cyan))]">SEAT #0042</span>
                <span className="text-2xl font-bold">Terminal Active</span>
              </div>
              
              <div className="flex flex-col gap-4 font-mono text-sm">
                <Panel title="TREASURY" value="$142.5k" detail="USDC" />
                <Panel title="ARTIFACTS" value="2" detail="MINTED" />
              </div>
              
              <button className="w-full bg-[hsl(var(--accent-cyan))] text-black py-4 font-mono font-bold uppercase tracking-wider mt-auto">
                System Menu
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Sub-components
function ColorSwatch({ name, hex, color }: { name: string; hex: string; color: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-24 rounded-md border border-[hsl(var(--border-dim))]" style={{ backgroundColor: color }}></div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="font-mono text-xs text-[hsl(var(--text-muted))]">{hex}</div>
      </div>
    </div>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 text-xs font-bold border rounded-sm tracking-wider ${className}`}>
      {children}
    </span>
  );
}

function Panel({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-dim))] p-6 flex flex-col gap-2 relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--accent-cyan))] opacity-0 hover:opacity-100 transition-opacity"></div>
      <div className="font-mono text-xs text-[hsl(var(--text-muted))]">{title}</div>
      <div className="font-mono text-2xl font-bold text-[hsl(var(--text-primary))]">{value}</div>
      <div className="font-mono text-xs text-[hsl(var(--accent-cyan))]">{detail}</div>
    </div>
  );
}

function ArtifactCard({ title, img, id, status }: { title: string; img?: string; id?: string; status: string }) {
  return (
    <div className="bg-black border border-[hsl(var(--border-dim))] flex flex-col group hover:border-[hsl(var(--accent-cyan))] transition-colors">
      <div className="aspect-square bg-[hsl(var(--bg-obsidian))] border-b border-[hsl(var(--border-dim))] flex items-center justify-center p-4 relative overflow-hidden">
        {img ? (
          <img src={img} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-[hsl(var(--border-bright))] text-[hsl(var(--text-muted))] font-mono text-xs">
            [ UNMINTED ]
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-[hsl(var(--text-muted))]">{id ? `ID #${id}` : '---'}</span>
          <Badge className={`text-[10px] px-1.5 py-0 ${status === 'MINTED' ? 'bg-green-900/20 text-green-500 border-green-900' : 'bg-transparent border-[hsl(var(--border-dim))] text-[hsl(var(--text-muted))]'}`}>
            {status}
          </Badge>
        </div>
        <span className="font-bold tracking-tight">{title}</span>
      </div>
    </div>
  );
}
