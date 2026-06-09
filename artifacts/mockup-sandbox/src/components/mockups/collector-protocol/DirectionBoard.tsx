import React from 'react';
import './_group.css';
import { 
  Shield, 
  Search, 
  Wallet, 
  ChevronRight, 
  ArrowRight,
  Database,
  Lock,
  Activity,
  Box,
  Fingerprint,
  Link as LinkIcon
} from 'lucide-react';

const SectionHeader = ({ num, title, description }: { num: string, title: string, description?: string }) => (
  <div className="mb-12 border-b border-[#222] pb-6">
    <div className="flex items-center gap-4 mb-2">
      <span className="font-mono text-[#C4A46D] text-sm">{num}</span>
      <h2 className="text-2xl font-light tracking-wide uppercase">{title}</h2>
    </div>
    {description && <p className="text-[#888] font-light max-w-2xl">{description}</p>}
  </div>
);

export function DirectionBoard() {
  return (
    <div className="collector-board p-8 md:p-16 lg:p-24 w-full max-w-[1400px] mx-auto overflow-hidden">
      
      {/* 1. Cover */}
      <section className="mb-32 pt-20">
        <div className="font-mono text-[#C4A46D] mb-6 text-sm tracking-widest">DIRECTION B</div>
        <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-tight engraved-text">Collector<br/>Protocol</h1>
        <p className="text-2xl text-[#888] mb-8 font-light italic">The artifact is the hero. The vault is the interface.</p>
        <div className="max-w-2xl border-l border-[#C4A46D] pl-6 py-2">
          <p className="text-[#aaa] leading-relaxed text-lg">
            Mental model: artifact ownership first. The seat is expressed through what you hold. 
            A design language leaning into provenance, seals, collection presentation, and rarity.
            The cockpit frames the collection rather than dominating it.
          </p>
        </div>
      </section>

      {/* 2. Color System */}
      <section className="mb-32">
        <SectionHeader num="02" title="Color System" description="Deep obsidian, structural grays, and vault gold." />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { name: 'Base', hex: '#050505' },
            { name: 'Surface', hex: '#0A0A0A' },
            { name: 'Border', hex: '#222222' },
            { name: 'Primary Accent', hex: '#C4A46D' },
            { name: 'Text Main', hex: '#EDEDED' },
            { name: 'Text Muted', hex: '#888888' },
          ].map((c) => (
            <div key={c.name} className="flex flex-col gap-3">
              <div 
                className="h-24 rounded-sm border border-[#222]" 
                style={{ backgroundColor: c.hex }} 
              />
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs font-mono text-[#888]">{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Typography */}
      <section className="mb-32">
        <SectionHeader num="03" title="Typography" description="Outfit (UI), JetBrains Mono (Data), Fraunces (Chronicle)." />
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="font-mono text-[#888] text-xs mb-4">SANS (UI) / OUTFIT</div>
            <div className="font-sans text-4xl mb-4">Structural<br/>Legitimacy</div>
            <p className="font-sans text-[#aaa]">Used for all interfaces, dashboards, and standard controls. Clean, technical, neutral.</p>
          </div>
          <div>
            <div className="font-mono text-[#888] text-xs mb-4">MONO (DATA) / JETBRAINS</div>
            <div className="font-mono text-3xl mb-4 text-[#C4A46D]">0x7F2...9A1B<br/>1,250 USDC</div>
            <p className="font-sans text-[#aaa]">Used for block numbers, addresses, amounts, and metadata. Enforces verifiability.</p>
          </div>
          <div>
            <div className="font-mono text-[#888] text-xs mb-4">SERIF (CHRONICLE) / FRAUNCES</div>
            <div className="font-[Fraunces] text-4xl mb-4 italic">The Protocol<br/>is Alive</div>
            <p className="font-sans text-[#aaa]">Restricted entirely to the Chronicle / long-form reading experiences.</p>
          </div>
        </div>
      </section>

      {/* 4. Logo + Favicon */}
      <section className="mb-32">
        <SectionHeader num="04" title="Identity" />
        <div className="flex gap-12 items-end">
          <div className="p-8 vault-card flex items-center justify-center min-w-[300px]">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#C4A46D]" strokeWidth={1.5} />
              <span className="text-2xl tracking-widest uppercase font-light">THE SYNDICATE</span>
            </div>
          </div>
          <div className="p-8 vault-card flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#C4A46D]" strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* 5. Header / Nav */}
      <section className="mb-32">
        <SectionHeader num="05" title="Navigation" />
        <div className="vault-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 pl-4">
            <Shield className="w-5 h-5 text-[#C4A46D]" strokeWidth={1.5} />
            <span className="text-sm tracking-widest uppercase font-light">SYN</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-[#888]">
            <span className="text-white">Vault</span>
            <span>Join</span>
            <span>Archive</span>
            <span>Chronicle</span>
          </div>
          <button className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-sm text-sm font-mono flex items-center gap-2 transition-colors">
            <Wallet className="w-4 h-4 text-[#C4A46D]" />
            Connect
          </button>
        </div>
      </section>

      {/* 6. Buttons */}
      <section className="mb-32">
        <SectionHeader num="06" title="Actions" />
        <div className="flex flex-wrap gap-6 items-center">
          <button className="bg-[#C4A46D] text-black px-6 py-3 font-medium uppercase tracking-wide text-sm flex items-center gap-2 hover:bg-[#d6b782] transition-colors">
            Mint Artifact <ArrowRight className="w-4 h-4" />
          </button>
          <button className="bg-transparent border border-[#444] text-white px-6 py-3 font-medium uppercase tracking-wide text-sm hover:border-[#888] transition-colors">
            View Contract
          </button>
          <button className="text-[#888] hover:text-white px-4 py-3 font-medium uppercase tracking-wide text-sm transition-colors">
            Cancel
          </button>
          <button className="bg-[#2a0808] border border-[#5a1515] text-[#ff6b6b] px-6 py-3 font-medium uppercase tracking-wide text-sm">
            Revoke Access
          </button>
        </div>
      </section>

      {/* 7. Status Badges */}
      <section className="mb-32">
        <SectionHeader num="07" title="Status" />
        <div className="flex gap-4">
          <div className="px-3 py-1 border border-[#C4A46D]/30 bg-[#C4A46D]/10 text-[#C4A46D] text-xs font-mono tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C4A46D]" /> ACTIVE SEAT
          </div>
          <div className="px-3 py-1 border border-[#222] bg-[#111] text-[#888] text-xs font-mono tracking-wider">
            SEAT #0042
          </div>
          <div className="px-3 py-1 border border-green-900/50 bg-green-900/20 text-green-400 text-xs font-mono tracking-wider">
            VERIFIED ON-CHAIN
          </div>
        </div>
      </section>

      {/* 8. Card System & 9. Widgets */}
      <section className="mb-32">
        <SectionHeader num="08 & 09" title="Vault Surfaces & Telemetry" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="vault-card p-6 flex flex-col justify-between h-48">
            <div className="text-[#888] text-sm uppercase tracking-wider">Total Value Secured</div>
            <div className="font-mono text-3xl gold-gradient-text">$1,240,500.00</div>
            <div className="font-mono text-xs text-[#555]">VERIFIED • BLK 148902</div>
          </div>
          <div className="vault-card p-6 flex flex-col justify-between h-48">
            <div className="text-[#888] text-sm uppercase tracking-wider">Active Seats</div>
            <div className="font-mono text-3xl">442 <span className="text-xl text-[#555]">/ 500</span></div>
            <div className="font-mono text-xs text-[#555]">CHAPTER 1 OPEN</div>
          </div>
          <div className="vault-card p-6 flex flex-col justify-between h-48 bg-[#111] border-[#C4A46D]/20">
            <div className="text-[#C4A46D] text-sm uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Network Status
            </div>
            <div className="font-mono text-lg text-white">AVALANCHE MAINNET</div>
            <div className="font-mono text-xs text-green-500">OPTIMAL • 45ms PING</div>
          </div>
        </div>
      </section>

      {/* 10. Home Hero */}
      <section className="mb-32">
        <SectionHeader num="10" title="Landing Hero" />
        <div className="vault-card border-[#333] h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,164,109,0.05)_0%,rgba(0,0,0,0)_70%)]" />
          <div className="z-10 text-center max-w-3xl px-6">
            <div className="font-mono text-[#C4A46D] mb-6 tracking-widest text-sm">CHAPTER ONE IS OPEN</div>
            <h2 className="text-6xl uppercase tracking-tight mb-8 font-light engraved-text">Secure Your Seat</h2>
            <p className="text-xl text-[#888] mb-10 font-light">Mint your artifact. Enter the vault. Join the protocol.</p>
            <div className="flex justify-center gap-4">
              <button className="bg-[#C4A46D] text-black px-8 py-4 font-medium uppercase tracking-wide text-sm flex items-center gap-2">
                Mint Seat <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent border border-[#444] text-white px-8 py-4 font-medium uppercase tracking-wide text-sm">
                View Contract
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Archive / Artifacts (THE HERO) */}
      <section className="mb-32">
        <SectionHeader num="12" title="The Vault (Archive)" description="The core of the Collector direction. Artifacts presented like precious physical items." />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Seat Record", subtitle: "CHAPTER 1", img: "ref-artifacts-1.png" },
            { title: "Patron Seal", subtitle: "FOUNDER", img: "ref-artifacts-2.png" },
            { title: "First Signal", subtitle: "EVENT 01", img: "ref-artifacts-1.png" },
            { title: "Heart Signal", subtitle: "EVENT 02", img: "ref-artifacts-2.png" }
          ].map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="artifact-frame aspect-[3/4] mb-4 bg-[#0a0a0a] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02]">
                <img src={`/__mockup/images/${item.img}`} alt={item.title} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-mono text-[#C4A46D] text-xs mb-1">{item.subtitle}</div>
                  <div className="uppercase tracking-wide text-sm">{item.title}</div>
                </div>
                <div className="font-mono text-[#555] text-xs">#{String(i + 1).padStart(4, '0')}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. My Syndicate */}
      <section className="mb-32">
        <SectionHeader num="11" title="Member Cockpit" description="Framing the collection. Dense, technical, honest." />
        <div className="vault-card border-[#333] min-h-[500px] flex">
          <div className="w-64 border-r border-[#222] p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#222] rounded-full flex items-center justify-center text-[#C4A46D] font-mono text-xs">0x7</div>
              <div>
                <div className="font-mono text-sm">0x7F...9A1B</div>
                <div className="text-xs text-[#888] font-mono">SEAT #0042</div>
              </div>
            </div>
            <div className="text-[#888] text-sm flex flex-col gap-4">
              <div className="text-white">My Vault</div>
              <div>Activity</div>
              <div>Network</div>
              <div>Settings</div>
            </div>
          </div>
          <div className="flex-1 p-10 bg-[#080808]">
            <h3 className="text-2xl uppercase tracking-wide mb-8 font-light">My Vault</h3>
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="vault-card p-4">
                <div className="text-xs text-[#888] mb-2 uppercase">SYN Held</div>
                <div className="font-mono text-2xl">1.00</div>
              </div>
              <div className="vault-card p-4">
                <div className="text-xs text-[#888] mb-2 uppercase">Artifacts</div>
                <div className="font-mono text-2xl">4</div>
              </div>
            </div>
            <h4 className="text-[#888] text-sm uppercase mb-4 tracking-wider">Recent Mints</h4>
            <div className="border border-[#222] bg-[#0a0a0a] divide-y divide-[#222]">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#111] border border-[#333]" />
                    <div>
                      <div className="text-sm font-medium">Patron Seal</div>
                      <div className="text-xs text-[#666] font-mono">2 days ago</div>
                    </div>
                  </div>
                  <button className="text-[#C4A46D] font-mono text-xs hover:underline">VIEW TX ↗</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 13. Chronicle */}
      <section className="mb-32">
        <SectionHeader num="13" title="Chronicle" description="The only place serif is allowed. Editorial, long-form." />
        <div className="vault-card p-16 max-w-4xl mx-auto bg-[#0a0a0a]">
          <div className="font-mono text-[#C4A46D] text-sm mb-8">VOL 01. / THE BEGINNING</div>
          <h2 className="font-[Fraunces] text-5xl mb-8 italic leading-tight text-[#eee]">The Protocol is a living memory of its participants.</h2>
          <p className="font-[Fraunces] text-xl text-[#aaa] leading-relaxed mb-6">
            We are not building a static entity. We are building a vault that records every interaction, every patron, every moment of consequence. 
          </p>
          <p className="font-[Fraunces] text-xl text-[#aaa] leading-relaxed">
            When you hold a seat, you hold history.
          </p>
        </div>
      </section>

      {/* 14. Proof */}
      <section className="mb-32">
        <SectionHeader num="14" title="Proof Strip" description="Verifiable on-chain data." />
        <div className="border border-[#222] bg-[#0a0a0a] p-4 flex items-center gap-8 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-[#888] whitespace-nowrap">
            <Lock className="w-3 h-3 text-[#C4A46D]" />
            CONTRACT: <span className="text-white">0x8a9B...441F</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#888] whitespace-nowrap">
            <Database className="w-3 h-3" />
            LATEST BLK: <span className="text-white">14,992,101</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#888] whitespace-nowrap">
            <Fingerprint className="w-3 h-3" />
            TREASURY: <span className="text-white">0x11...FA2</span>
          </div>
          <div className="flex-1" />
          <button className="text-[#C4A46D] font-mono text-xs flex items-center gap-1 hover:underline whitespace-nowrap">
            <LinkIcon className="w-3 h-3" /> VERIFY ON SNOWTRACE
          </button>
        </div>
      </section>

      {/* 15. Mobile */}
      <section className="mb-32">
        <SectionHeader num="15" title="Mobile View" />
        <div className="w-[390px] h-[844px] border-[8px] border-[#222] rounded-[3rem] bg-[#050505] overflow-hidden relative mx-auto shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
            <div className="w-32 h-6 bg-[#222] rounded-b-3xl" />
          </div>
          
          <div className="p-6 pt-14">
            <div className="flex justify-between items-center mb-8">
              <Shield className="w-6 h-6 text-[#C4A46D]" />
              <div className="w-8 h-8 bg-[#222] rounded-full flex items-center justify-center text-[#C4A46D] font-mono text-[10px]">0x7</div>
            </div>
            
            <h3 className="text-2xl mb-6 tracking-wide font-light">My Vault</h3>
            
            <div className="vault-card p-4 mb-6">
              <div className="text-xs text-[#888] mb-1 uppercase">SYN Held</div>
              <div className="font-mono text-2xl text-[#C4A46D]">1.00</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="artifact-frame aspect-[3/4] bg-[#0a0a0a] flex flex-col justify-end p-2 relative">
                 <img src="/__mockup/images/ref-artifacts-1.png" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen" />
                 <div className="relative z-10 font-mono text-[10px] text-white bg-black/50 p-1">SEAT RECORD</div>
               </div>
               <div className="artifact-frame aspect-[3/4] bg-[#0a0a0a] flex flex-col justify-end p-2 relative">
                 <img src="/__mockup/images/ref-artifacts-2.png" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen" />
                 <div className="relative z-10 font-mono text-[10px] text-white bg-black/50 p-1">PATRON SEAL</div>
               </div>
            </div>

            <button className="w-full bg-[#111] border border-[#333] py-4 font-mono text-xs tracking-wider text-[#888]">
              VIEW FULL ARCHIVE
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
