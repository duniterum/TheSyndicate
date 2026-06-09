import React from 'react';
import './_hybrid.css';

export function DirectionBoard() {
  return (
    <div className="hybrid-board min-h-screen w-full flex flex-col items-center py-20 px-8 selection:bg-[#f59e0b] selection:text-black">
      <div className="w-full max-w-[1280px] flex flex-col gap-24">
        
        {/* 1. Cover */}
        <section className="hy-section flex flex-col items-start pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--hy-border)] bg-[var(--hy-surface)] mb-8">
            <div className="w-2 h-2 rounded-full bg-[var(--hy-accent-gold)]"></div>
            <span className="font-mono text-xs text-[var(--hy-text-300)]">DIRECTION C</span>
          </div>
          <h1 className="text-6xl font-semibold tracking-tight mb-4">Hybrid: Cockpit meets Vault</h1>
          <p className="text-xl text-[var(--hy-text-300)] font-mono mb-8">
            SYNTHESIS: LIVING PROTOCOL, BALANCED.
          </p>
          <p className="text-lg text-[var(--hy-text-200)] max-w-3xl leading-relaxed">
            Marries living member-OS density with artifact-ownership prestige, unified under strong protocol legitimacy. No single surface dominates: the cockpit feels alive and instrument-grade, the Archive feels like a real collection worth holding, and the Proof/Chronicle surfaces give the protocol gravitas.
          </p>
        </section>

        {/* 2. Color System */}
        <section className="hy-section">
          <span className="hy-label">02 / Color System</span>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <ColorSwatch hex="#050507" name="Base" border />
            <ColorSwatch hex="#0e0e11" name="Surface" border />
            <ColorSwatch hex="#18181c" name="Raised" border />
            <ColorSwatch hex="#232328" name="Border" />
            <ColorSwatch hex="#ffffff" name="Text Primary" />
            <ColorSwatch hex="#a1a1aa" name="Text Sec" />
            <ColorSwatch hex="#f59e0b" name="Gold Accent" />
            <ColorSwatch hex="#22d3ee" name="Cyan Tech" />
          </div>
        </section>

        {/* 3. Typography */}
        <section className="hy-section">
          <span className="hy-label">03 / Typography</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-sm text-[var(--hy-text-400)] mb-4 font-mono">SANS / UI & HEADINGS</div>
              <div className="text-4xl font-semibold mb-2">Outfit</div>
              <div className="text-xl mb-4">The Syndicate Protocol</div>
              <div className="text-sm text-[var(--hy-text-300)] leading-relaxed">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                0123456789
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--hy-text-400)] mb-4 font-mono">MONO / DATA & SPECS</div>
              <div className="text-4xl font-mono mb-2">Space Mono</div>
              <div className="text-xl font-mono mb-4">0x7A2...9B4F</div>
              <div className="text-sm font-mono text-[var(--hy-text-300)] leading-relaxed">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                0123456789
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--hy-text-400)] mb-4 font-mono">SERIF / CHRONICLE ONLY</div>
              <div className="text-4xl font-serif mb-2">Fraunces</div>
              <div className="text-xl font-serif mb-4">The Doctrine of State</div>
              <div className="text-sm font-serif text-[var(--hy-text-300)] leading-relaxed italic">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                0123456789
              </div>
            </div>
          </div>
        </section>

        {/* 4. Logo + Favicon */}
        <section className="hy-section">
          <span className="hy-label">04 / Logo & Marks</span>
          <div className="flex items-center gap-12">
            <div className="hy-panel p-8 flex items-center justify-center min-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[var(--hy-text-100)] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30 mix-blend-overlay"></div>
                   <span className="text-[var(--hy-bg)] font-sans font-bold text-lg leading-none mt-0.5">S</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">The Syndicate</span>
              </div>
            </div>
            <div className="hy-panel p-8 flex items-center justify-center w-24 h-24">
              <div className="w-8 h-8 rounded bg-[var(--hy-text-100)] flex items-center justify-center relative">
                 <span className="text-[var(--hy-bg)] font-sans font-bold text-lg leading-none mt-0.5">S</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Header / Nav */}
        <section className="hy-section">
          <span className="hy-label">05 / Header & Navigation</span>
          <div className="hy-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 pr-4 border-r border-[var(--hy-border)]">
                <div className="w-6 h-6 rounded bg-[var(--hy-text-100)] flex items-center justify-center">
                   <span className="text-[var(--hy-bg)] font-sans font-bold text-sm leading-none mt-0.5">S</span>
                </div>
                <span className="text-lg font-bold tracking-tight">SYN</span>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium text-[var(--hy-text-300)]">
                <span className="text-[var(--hy-text-100)]">Home</span>
                <span className="hover:text-[var(--hy-text-100)] cursor-pointer transition-colors">My Syndicate</span>
                <span className="hover:text-[var(--hy-text-100)] cursor-pointer transition-colors">Archive</span>
                <span className="hover:text-[var(--hy-text-100)] cursor-pointer transition-colors">Chronicle</span>
                <span className="hover:text-[var(--hy-text-100)] cursor-pointer transition-colors">Proof</span>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#10b981]/10 text-[#10b981] text-xs font-mono border border-[#10b981]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                AVALANCHE
              </div>
              <button className="bg-[var(--hy-text-100)] text-[var(--hy-bg)] px-4 py-2 rounded font-semibold text-sm hover:bg-[var(--hy-text-200)] transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        </section>

        {/* 6. Buttons */}
        <section className="hy-section">
          <span className="hy-label">06 / Controls</span>
          <div className="flex flex-wrap gap-6 items-end">
            <button className="bg-[var(--hy-text-100)] text-[var(--hy-bg)] px-6 py-2.5 rounded font-semibold text-sm hover:bg-[var(--hy-text-200)] transition-colors">
              Primary Action
            </button>
            <button className="bg-[var(--hy-surface-raised)] text-[var(--hy-text-100)] border border-[var(--hy-border)] px-6 py-2.5 rounded font-medium text-sm hover:bg-[var(--hy-border)] transition-colors">
              Secondary Action
            </button>
            <button className="text-[var(--hy-text-300)] px-6 py-2.5 font-medium text-sm hover:text-[var(--hy-text-100)] transition-colors">
              Ghost Action
            </button>
            <button className="bg-[var(--hy-accent-red)]/10 text-[var(--hy-accent-red)] border border-[var(--hy-accent-red)]/20 px-6 py-2.5 rounded font-medium text-sm hover:bg-[var(--hy-accent-red)]/20 transition-colors">
              Destructive
            </button>
            <button className="bg-[var(--hy-surface-raised)] text-[var(--hy-text-400)] border border-[var(--hy-border)] px-6 py-2.5 rounded font-medium text-sm cursor-not-allowed flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin text-[var(--hy-text-400)]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing Tx
            </button>
          </div>
        </section>

        {/* 7. Status Badges */}
        <section className="hy-section">
          <span className="hy-label">07 / Status Indicators</span>
          <div className="flex flex-wrap gap-4">
            <Badge color="gold">ACTIVE SEAT</Badge>
            <Badge color="cyan">VERIFIED ON-CHAIN</Badge>
            <Badge color="green">CHAPTER OPEN</Badge>
            <Badge color="gray">PENDING</Badge>
            <Badge color="default">MINTED</Badge>
            <Badge color="mono">SEAT #0042</Badge>
          </div>
        </section>

        {/* 8. Card System & 9. Dashboard Widgets */}
        <section className="hy-section grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <span className="hy-label">08 / Card Primitive</span>
            <div className="hy-panel p-6 relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--hy-accent-gold)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-12">
                <div className="w-10 h-10 rounded-full bg-[var(--hy-surface-raised)] border border-[var(--hy-border)] flex items-center justify-center">
                  <span className="font-mono text-xs text-[var(--hy-accent-gold)]">#42</span>
                </div>
                <Badge color="gold">ACTIVE</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-[var(--hy-text-100)]">Seat Record</h3>
                <p className="text-sm text-[var(--hy-text-300)]">Holds protocol access rights and governance standing.</p>
              </div>
            </div>
          </div>
          <div>
            <span className="hy-label">09 / Data Widgets</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="hy-panel p-5 flex flex-col justify-between h-32">
                <div className="text-xs font-mono text-[var(--hy-text-400)] uppercase tracking-wider">Treasury Routed</div>
                <div className="text-2xl font-mono text-[var(--hy-accent-cyan)]">$142,500<span className="text-sm text-[var(--hy-text-400)] ml-1">USDC</span></div>
              </div>
              <div className="hy-panel p-5 flex flex-col justify-between h-32">
                <div className="text-xs font-mono text-[var(--hy-text-400)] uppercase tracking-wider">Active Seats</div>
                <div className="text-2xl font-mono text-[var(--hy-text-100)]">482<span className="text-sm text-[var(--hy-text-400)] ml-1">/ 500</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Home Hero */}
        <section className="hy-section">
          <span className="hy-label">10 / Home Hero</span>
          <div className="hy-panel rounded-xl overflow-hidden border border-[var(--hy-border)] aspect-video relative flex flex-col items-center justify-center text-center p-12 bg-gradient-to-b from-[var(--hy-surface)] to-[var(--hy-bg)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            
            <Badge color="green" className="mb-6">CHAPTER 2: OPEN</Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-[var(--hy-text-100)] leading-[1.1]">
              The living protocol for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--hy-accent-gold)] to-yellow-200">on-chain membership.</span>
            </h1>
            <p className="text-xl text-[var(--hy-text-300)] max-w-2xl mb-10">
              Hold a seat. Mint artifacts of memory. Verify every action.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-[var(--hy-text-100)] text-[var(--hy-bg)] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[var(--hy-text-200)] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Join The Syndicate
              </button>
              <button className="bg-[var(--hy-surface-raised)] text-[var(--hy-text-100)] border border-[var(--hy-border)] px-8 py-4 rounded-lg font-medium text-lg hover:bg-[var(--hy-border)] transition-colors">
                Read Chronicle
              </button>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-[var(--hy-border)] pt-4">
               <div className="font-mono text-xs text-[var(--hy-text-400)]">
                 CONTRACT: <span className="text-[var(--hy-accent-cyan)]">0x8F9a...2b1C</span>
               </div>
               <div className="font-mono text-xs text-[var(--hy-text-400)]">
                 AVALANCHE MAINNET
               </div>
            </div>
          </div>
        </section>

        {/* 11. My Syndicate */}
        <section className="hy-section">
          <span className="hy-label">11 / Member Cockpit (My Syndicate)</span>
          <div className="hy-panel rounded-xl border border-[var(--hy-border)] flex h-[600px] overflow-hidden bg-[var(--hy-bg)] relative">
            {/* Sidebar */}
            <div className="w-64 border-r border-[var(--hy-border)] bg-[var(--hy-surface)] p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded bg-[var(--hy-text-100)] flex items-center justify-center">
                   <span className="text-[var(--hy-bg)] font-sans font-bold text-lg leading-none mt-0.5">S</span>
                </div>
                <span className="text-xl font-bold tracking-tight">OS</span>
              </div>
              <nav className="flex flex-col gap-2 flex-grow">
                <div className="px-3 py-2 bg-[var(--hy-surface-raised)] rounded text-[var(--hy-text-100)] font-medium text-sm border border-[var(--hy-border)]">Overview</div>
                <div className="px-3 py-2 text-[var(--hy-text-300)] hover:text-[var(--hy-text-100)] font-medium text-sm cursor-pointer transition-colors">My Artifacts</div>
                <div className="px-3 py-2 text-[var(--hy-text-300)] hover:text-[var(--hy-text-100)] font-medium text-sm cursor-pointer transition-colors">Protocol Data</div>
                <div className="px-3 py-2 text-[var(--hy-text-300)] hover:text-[var(--hy-text-100)] font-medium text-sm cursor-pointer transition-colors">Settings</div>
              </nav>
              <div className="mt-auto border-t border-[var(--hy-border)] pt-4">
                <div className="text-xs font-mono text-[var(--hy-text-400)] mb-1">CONNECTED</div>
                <div className="text-sm font-mono text-[var(--hy-text-100)] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                  0x4A...992E
                </div>
              </div>
            </div>
            {/* Main Area */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-semibold mb-1 text-[var(--hy-text-100)]">Welcome, Member.</h2>
                  <p className="text-[var(--hy-text-300)]">Your seat is active and verified.</p>
                </div>
                <Badge color="gold">SEAT #0042</Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="hy-panel p-4 rounded-lg">
                  <div className="text-xs font-mono text-[var(--hy-text-400)] mb-2 uppercase">Status</div>
                  <div className="text-lg font-medium text-[#10b981]">Active</div>
                </div>
                <div className="hy-panel p-4 rounded-lg">
                  <div className="text-xs font-mono text-[var(--hy-text-400)] mb-2 uppercase">Artifacts Minted</div>
                  <div className="text-lg font-mono text-[var(--hy-text-100)]">4 / 12</div>
                </div>
                <div className="hy-panel p-4 rounded-lg border-[var(--hy-accent-cyan)]/30 bg-[var(--hy-accent-cyan)]/5">
                  <div className="text-xs font-mono text-[var(--hy-accent-cyan)] mb-2 uppercase">Action Required</div>
                  <div className="text-sm font-medium text-[var(--hy-text-100)] mb-2">Mint Patron Seal</div>
                  <button className="text-xs bg-[var(--hy-accent-cyan)] text-black px-3 py-1.5 rounded font-semibold">Mint Now</button>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 text-[var(--hy-text-100)]">Recent Protocol Activity</h3>
              <div className="hy-panel rounded-lg border border-[var(--hy-border)] divide-y divide-[var(--hy-border)]">
                 <ActivityRow type="Mint" seat="#0481" action="minted The First Signal" time="2 mins ago" />
                 <ActivityRow type="Join" seat="#0482" action="claimed a seat" time="15 mins ago" />
                 <ActivityRow type="Treasury" seat="Protocol" action="routed 500 USDC to reserves" time="1 hour ago" />
              </div>
            </div>
          </div>
        </section>

        {/* 12. Archive / Artifacts */}
        <section className="hy-section">
          <span className="hy-label">12 / Artifact Gallery (The Archive)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ArtifactCard 
              name="Seat Record" 
              status="MINTED" 
              desc="The foundational token of membership." 
              imgSrc="/__mockup/images/ref-artifacts-1.png"
            />
            <ArtifactCard 
              name="Patron Seal" 
              status="ELIGIBLE" 
              desc="Marks early contribution to the treasury." 
              imgSrc="/__mockup/images/ref-artifacts-2.png"
            />
            <ArtifactCard 
              name="The First Signal" 
              status="LOCKED" 
              desc="Requires active participation in Season 1." 
            />
            <ArtifactCard 
              name="Heart Signal" 
              status="LOCKED" 
              desc="Reserved for continuous active status." 
            />
          </div>
        </section>

        {/* 13. Chronicle */}
        <section className="hy-section">
          <span className="hy-label">13 / The Chronicle (Editorial)</span>
          <div className="hy-panel max-w-3xl mx-auto p-12 md:p-20 bg-[#fbfbfb] text-[#111111] rounded-xl border border-[#e5e5e5]">
            <div className="font-mono text-xs text-[#888888] mb-8 text-center uppercase tracking-widest border-b border-[#e5e5e5] pb-4">
              Volume I — Section 1
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-medium mb-8 text-center leading-tight">
              The Doctrine of State
            </h1>
            <div className="font-serif text-lg leading-relaxed space-y-6 text-[#333333]">
              <p>
                A protocol is only as strong as its memory. When we built The Syndicate, we did not set out to create a static club; we sought to establish a living registry of intent.
              </p>
              <p>
                Holding <span className="font-sans font-medium text-black">SYN</span> is not a passive act. It is a declaration of presence within the ecosystem. The artifacts you mint are the indelible records of your trajectory through the chapters.
              </p>
              <div className="w-12 h-px bg-[#cccccc] mx-auto my-12"></div>
              <p className="italic text-center">
                Truth before marketing. Verifiability before trust.
              </p>
            </div>
          </div>
        </section>

        {/* 14. Proof */}
        <section className="hy-section">
          <span className="hy-label">14 / On-Chain Proof</span>
          <div className="hy-panel p-8 font-mono text-sm border-l-2 border-[var(--hy-accent-cyan)]">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-lg font-sans font-semibold text-[var(--hy-text-100)]">Registry Verification</h3>
               <Badge color="cyan">SYNCHRONIZED</Badge>
            </div>
            <div className="space-y-4 text-[var(--hy-text-300)]">
              <div className="flex justify-between py-2 border-b border-[var(--hy-border)]">
                <span>Contract Address</span>
                <span className="text-[var(--hy-accent-cyan)]">0x8F9a4B2c...1C3d</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hy-border)]">
                <span>Latest Block</span>
                <span className="text-[var(--hy-text-100)]">34,819,002</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--hy-border)]">
                <span>Network</span>
                <span>Avalanche C-Chain</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Total Seats Supply</span>
                <span className="text-[var(--hy-text-100)]">500</span>
              </div>
            </div>
          </div>
        </section>

        {/* 15. Mobile */}
        <section className="hy-section flex flex-col items-center">
          <span className="hy-label self-start">15 / Mobile View</span>
          <div className="w-[390px] h-[844px] hy-panel rounded-[3rem] border-8 border-[#111111] overflow-hidden flex flex-col bg-[var(--hy-bg)] relative shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#111111] rounded-b-2xl w-40 mx-auto z-10"></div>
            
            {/* Mobile Header */}
            <div className="pt-12 pb-4 px-6 flex justify-between items-center border-b border-[var(--hy-border)] bg-[var(--hy-surface)]">
              <div className="w-6 h-6 rounded bg-[var(--hy-text-100)] flex items-center justify-center">
                 <span className="text-[var(--hy-bg)] font-sans font-bold text-xs leading-none mt-0.5">S</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--hy-surface-raised)] flex items-center justify-center border border-[var(--hy-border)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </div>
            </div>
            
            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-1 text-[var(--hy-text-100)]">Cockpit</h2>
                <Badge color="gold" className="mt-2">SEAT #0042</Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div className="hy-panel p-4 rounded-lg flex justify-between items-center">
                  <div className="text-xs font-mono text-[var(--hy-text-400)] uppercase">Status</div>
                  <div className="text-sm font-medium text-[#10b981]">Active</div>
                </div>
                <div className="hy-panel p-4 rounded-lg flex justify-between items-center">
                  <div className="text-xs font-mono text-[var(--hy-text-400)] uppercase">Artifacts</div>
                  <div className="text-sm font-mono text-[var(--hy-text-100)]">4 / 12</div>
                </div>
              </div>

              <h3 className="text-base font-semibold mb-4 text-[var(--hy-text-100)]">Action Required</h3>
              <div className="hy-panel p-5 rounded-lg border-[var(--hy-accent-cyan)]/30 bg-[var(--hy-accent-cyan)]/5 mb-8">
                <div className="text-sm font-medium text-[var(--hy-text-100)] mb-1">Mint Patron Seal</div>
                <p className="text-xs text-[var(--hy-text-300)] mb-4">You are eligible to mint this artifact.</p>
                <button className="w-full text-sm bg-[var(--hy-accent-cyan)] text-black px-4 py-2.5 rounded font-semibold">Mint Now</button>
              </div>
              
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Helpers

function ColorSwatch({ hex, name, border = false }: { hex: string, name: string, border?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={`w-full aspect-video rounded-md shadow-inner ${border ? 'border border-[var(--hy-border)]' : ''}`}
        style={{ backgroundColor: hex }}
      ></div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--hy-text-100)]">{name}</span>
        <span className="text-xs font-mono text-[var(--hy-text-400)] uppercase">{hex}</span>
      </div>
    </div>
  );
}

function Badge({ children, color, className = "" }: { children: React.ReactNode, color: string, className?: string }) {
  const colorMap: Record<string, string> = {
    gold: "bg-[var(--hy-accent-gold)]/10 text-[var(--hy-accent-gold)] border-[var(--hy-accent-gold)]/20",
    cyan: "bg-[var(--hy-accent-cyan)]/10 text-[var(--hy-accent-cyan)] border-[var(--hy-accent-cyan)]/20",
    green: "bg-[var(--hy-accent-green)]/10 text-[var(--hy-accent-green)] border-[var(--hy-accent-green)]/20",
    gray: "bg-[var(--hy-surface-raised)] text-[var(--hy-text-300)] border-[var(--hy-border)]",
    default: "bg-[var(--hy-text-100)] text-[var(--hy-bg)] border-[var(--hy-text-100)]",
    mono: "bg-transparent text-[var(--hy-text-100)] border-[var(--hy-border)] font-mono",
  };
  
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
}

function ActivityRow({ type, seat, action, time }: { type: string, seat: string, action: string, time: string }) {
  return (
    <div className="px-5 py-4 flex justify-between items-center hover:bg-[var(--hy-surface-raised)] transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-[var(--hy-accent-cyan)]"></div>
        <div className="text-sm">
          <span className="font-mono text-[var(--hy-text-100)]">{seat}</span>
          <span className="text-[var(--hy-text-300)] ml-2">{action}</span>
        </div>
      </div>
      <div className="text-xs font-mono text-[var(--hy-text-400)]">{time}</div>
    </div>
  );
}

function ArtifactCard({ name, status, desc, imgSrc }: { name: string, status: string, desc: string, imgSrc?: string }) {
  const isLocked = status === "LOCKED";
  return (
    <div className={`hy-panel rounded-xl overflow-hidden border border-[var(--hy-border)] flex flex-col h-full ${isLocked ? 'opacity-50 grayscale' : ''}`}>
      <div className="aspect-square bg-[var(--hy-surface-raised)] border-b border-[var(--hy-border)] relative flex items-center justify-center p-4">
        {imgSrc ? (
          <img src={imgSrc} alt={name} className="w-full h-full object-contain drop-shadow-2xl" />
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-[var(--hy-border)] rounded-full flex items-center justify-center text-[var(--hy-text-400)]">
             ?
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge color={status === "MINTED" ? "gold" : status === "ELIGIBLE" ? "cyan" : "gray"}>{status}</Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-lg font-semibold text-[var(--hy-text-100)] mb-1">{name}</h4>
        <p className="text-sm text-[var(--hy-text-300)] mt-auto leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
