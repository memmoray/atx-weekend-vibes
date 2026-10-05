import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Coffee, Download, Music2, RefreshCw, Sparkles, Sun } from "lucide-react";
import chillPhoto from "../assets/chill-vibe.jpg";
import wildPhoto from "../assets/wild-vibe.jpg";
import socialPhotoAsset from "../assets/social-vibe.jpg.asset.json";

const socialPhoto = socialPhotoAsset.url;
const PAYPAL_CLIENT_ID = "BAAaHSFWndANttbM7entvAqqDBPkt9i0IzTYzdMPQZykv610K_J0wE1YbkPnxnzrJq4pH7rEiTvuV1yBq8";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATX Weekend Pass — Good Times, Zero Planning" },
      { name: "description", content: "Rally your favorite people for one unforgettable Saturday in Austin. We’ll handle every stop." },
      { property: "og:title", content: "ATX Weekend Pass — Good Times, Zero Planning" },
      { property: "og:description", content: "Pick your group vibe and get a curated three-stop Austin itinerary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Slot = "Morning" | "Afternoon" | "Night";
type Stop = { slot: Slot; time: string; name: string; detail: string; price: number };
type Vibe = { id: "chill" | "social" | "wild"; label: string; shortLabel: string; tagline: string; photo: string; stops: Stop[] };

const VIBES: Vibe[] = [
  { id: "chill", label: "Keep it chill", shortLabel: "Chill", tagline: "Easy does it", photo: chillPhoto, stops: [
    { slot: "Morning", time: "7:00 AM", name: "Zilker Sunrise", detail: "paddle + park loop", price: 18 },
    { slot: "Afternoon", time: "1:30 PM", name: "Snooze Rooftop", detail: "tacos + shade", price: 26 },
    { slot: "Night", time: "9:00 PM", name: "Cathedral Live", detail: "sets till late", price: 32 },
  ] },
  { id: "social", label: "Austin classic", shortLabel: "Social", tagline: "Best of ATX", photo: socialPhoto, stops: [
    { slot: "Morning", time: "9:30 AM", name: "Breakfast tacos at Veracruz", detail: "Two tacos + agua fresca", price: 14 },
    { slot: "Afternoon", time: "2:00 PM", name: "South Congress stroll", detail: "Boots, murals + local treats", price: 22 },
    { slot: "Night", time: "8:00 PM", name: "Two-step at The White Horse", detail: "Cover + first round", price: 30 },
  ] },
  { id: "wild", label: "Go all out", shortLabel: "Wild", tagline: "No curfew", photo: wildPhoto, stops: [
    { slot: "Morning", time: "8:00 AM", name: "Barton Springs Plunge", detail: "68° year-round", price: 12 },
    { slot: "Afternoon", time: "12:30 PM", name: "Lake Travis Zipline", detail: "six lines over water", price: 68 },
    { slot: "Night", time: "10:30 PM", name: "Dirty 6th Bar Hop", detail: "four venues, one wristband", price: 52 },
  ] },
];

const SLOT_STYLE: Record<Slot, string> = {
  Morning: "bg-sunrise text-ink",
  Afternoon: "bg-mint text-ink",
  Night: "bg-lavender text-ink",
};
const SLOT_ICON = { Morning: Coffee, Afternoon: Sun, Night: Music2 };

function weekendLabel(): string {
  const now = new Date();
  const friday = new Date(now);
  friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(friday)}–${fmt(sunday)}`;
}

function Index() {
  const [vibeId, setVibeId] = useState<Vibe["id"]>("social");
  const [paid, setPaid] = useState(false);
  const [weekend, setWeekend] = useState("");
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState<Slot[]>([]);
  const [aiStops, setAiStops] = useState<Partial<Record<Vibe["id"], Stop[]>>>({});
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [custom, setCustom] = useState<{ label: string; stops: Stop[] } | null>(null);
  const [pass, setPass] = useState<{ orderId: string; label: string; stops: Stop[]; total: number } | null>(null);
  const requestId = useRef(0);

  useEffect(() => { setWeekend(weekendLabel()); setMounted(true); }, []);

  const baseVibe = VIBES.find((item) => item.id === vibeId) as Vibe;
  const vibe: Vibe = custom
    ? { ...baseVibe, label: custom.label, shortLabel: "Custom", tagline: "Made for your crew", stops: custom.stops }
    : { ...baseVibe, stops: aiStops[vibeId] ?? baseVibe.stops };
  const selectedStops = vibe.stops.filter((stop) => !excluded.includes(stop.slot));
  const total = selectedStops.reduce((sum, stop) => sum + stop.price, 0);

  const toggleStop = (slot: Slot) => {
    setPaid(false);
    setExcluded((previous) => previous.includes(slot) ? previous.filter((item) => item !== slot) : [...previous, slot]);
  };

  const generate = async (id: Vibe["id"]) => {
    const currentRequest = ++requestId.current;
    setLoading(true); setAiError(null);
    try {
      const selected = VIBES.find((item) => item.id === id) as Vibe;
      const response = await fetch("/api/generate-itinerary", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vibe: selected.shortLabel }),
      });
      const json = await response.json();
      if (currentRequest !== requestId.current) return;
      if (!response.ok) throw new Error(json.error ?? "Couldn't generate an itinerary.");
      setCustom(null); setAiStops((previous) => ({ ...previous, [id]: json.stops as Stop[] })); setExcluded([]); setPaid(false);
    } catch (error) {
      if (currentRequest === requestId.current) setAiError(error instanceof Error ? error.message : "Couldn't generate an itinerary.");
    } finally { if (currentRequest === requestId.current) setLoading(false); }
  };

  const generateCustom = async () => {
    const text = customText.trim();
    if (text.length < 2) return;
    const currentRequest = ++requestId.current;
    setLoading(true); setAiError(null);
    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ custom: text }),
      });
      const json = await response.json();
      if (currentRequest !== requestId.current) return;
      if (!response.ok) throw new Error(json.error ?? "Couldn't generate an itinerary.");
      setCustom({ label: text, stops: json.stops as Stop[] }); setCustomText(""); setExcluded([]); setPaid(false);
    } catch (error) {
      if (currentRequest === requestId.current) setAiError(error instanceof Error ? error.message : "Couldn't generate an itinerary.");
    } finally { if (currentRequest === requestId.current) setLoading(false); }
  };

  const swapVibe = (id: Vibe["id"]) => { setVibeId(id); setCustom(null); setPaid(false); setExcluded([]); void generate(id); };

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-12 pt-5 sm:px-8 lg:pb-16 lg:pt-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-coral text-primary-foreground"><Sparkles size={17} strokeWidth={2.4} /></span>
            <div className="font-display text-[13px] font-bold leading-[0.9]">ATX Weekend<br />Pass</div>
          </div>
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] uppercase">Invite crew</span>
        </header>

        {!paid && (
          <>
            <section className="mt-8 grid items-center gap-7 lg:mt-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <div>
                <span className="inline-flex -rotate-2 rounded-full bg-paypal px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase">Made for the group chat</span>
                <h1 className="mt-5 max-w-[560px] font-editorial text-[48px] leading-[0.91] font-bold tracking-normal sm:text-[64px] lg:text-[76px]">
                  Good times,<br /><em className="font-normal text-coral">zero<br className="hidden lg:block" /> planning.</em>
                </h1>
                <p className="mt-5 max-w-md text-[14px] leading-6 text-muted-foreground sm:text-base">Rally your favorite people for one unforgettable Saturday in Austin. We’ll handle every stop.</p>
              </div>
              <div className="relative lg:justify-self-end">
                <div className="overflow-hidden rounded-[36px] border-2 border-foreground shadow-[10px_10px_0_var(--mint)]">
                  <img src={socialPhoto} alt="Friends enjoying drinks beside a colorful Austin mural" className="aspect-[1.38] w-full object-cover" />
                  <p className="absolute bottom-5 left-5 text-xs font-bold text-primary-foreground"><span className="mr-2 text-paypal">●</span>Austin looks good on you</p>
                </div>
                <div className="absolute -bottom-4 right-3 rotate-3 rounded-xl border-2 border-foreground bg-card px-4 py-3 shadow-[4px_4px_0_var(--foreground)]">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-coral uppercase">Crew approved</p>
                  <p className="mt-0.5 text-xs font-bold">4 friends are in</p>
                </div>
              </div>
            </section>

            <section className="mt-10 rounded-[28px] border border-border bg-card p-4 sm:p-5 lg:mt-12">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Pick the group vibe</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => void generate(vibeId)} disabled={loading} aria-label="Shuffle and generate a new pass" className="flex items-center gap-1 text-[10px] font-bold text-coral disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} />Shuffle</button>
                  <span className="text-[10px] font-bold text-coral">Step 1 of 2</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {VIBES.map((item) => {
                  const active = item.id === vibeId && !custom;
                  return <button key={item.id} type="button" aria-pressed={active} onClick={() => swapVibe(item.id)} className={`min-h-[68px] rounded-2xl border px-3 py-3 text-left transition-transform hover:-translate-y-0.5 ${active ? "border-foreground bg-foreground text-background shadow-[0_5px_0_var(--mint)]" : "border-border bg-card"}`}>
                    <span className="block text-[13px] font-bold sm:text-[15px]">{item.label}</span>
                    <span className={`mt-1 block text-[10px] ${active ? "text-background/60" : "text-muted-foreground"}`}>{item.tagline}</span>
                  </button>;
                })}
              </div>
              <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); void generateCustom(); }}>
                <input value={customText} onChange={(event) => setCustomText(event.target.value)} maxLength={60} aria-label="Custom vibe" placeholder="Custom vibe — Speakeasies & dessert" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground focus:border-foreground" />
                <button type="submit" disabled={loading || customText.trim().length < 2} className="rounded-xl bg-coral px-4 text-xs font-bold text-primary-foreground disabled:opacity-40">Mix it</button>
              </form>
            </section>
          </>
        )}

        {paid && pass ? (
          <main className="mx-auto mt-10 max-w-3xl rounded-[28px] border-2 border-foreground bg-card p-6 text-center shadow-[9px_9px_0_var(--foreground)] sm:p-10" aria-label="Digital pass">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-mint text-xl font-bold">✓</span>
            <p className="mt-5 text-[10px] font-bold tracking-[0.2em] text-coral uppercase">Pass confirmed</p>
            <h1 className="mt-2 font-editorial text-4xl font-bold">You’re all set for ATX Weekend!</h1>
            <p className="mt-2 text-sm text-muted-foreground">{pass.label} · {weekend}</p>
            <div className="mx-auto mt-6 w-fit rounded-2xl border border-border bg-background p-3"><QRCodeCanvas value={`ATX-PASS|${pass.orderId}|${pass.label}|$${pass.total.toFixed(2)}`} size={160} bgColor="#fffaf0" fgColor="#1d2923" level="M" /></div>
            <div className="mx-auto mt-6 max-w-lg divide-y divide-border text-left">
              {pass.stops.map((stop) => <div key={stop.slot} className="flex items-center gap-3 py-3"><span className="text-xs font-bold text-coral uppercase">{stop.slot}</span><span className="font-bold">{stop.name}</span><span className="ml-auto font-bold">${stop.price}</span></div>)}
              <div className="flex justify-between pt-4 text-lg font-bold"><span>Total paid</span><span>${pass.total.toFixed(2)}</span></div>
            </div>
            <div className="mx-auto mt-6 grid max-w-lg gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { const canvas = document.querySelector<HTMLCanvasElement>("main[aria-label='Digital pass'] canvas"); if (!canvas) return; const anchor = document.createElement("a"); anchor.href = canvas.toDataURL("image/png"); anchor.download = `atx-weekend-pass-${pass.orderId}.png`; anchor.click(); }} className="flex items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-xs font-bold text-background"><Download size={15} />Download Pass</button>
              <button type="button" onClick={() => { setPaid(false); setPass(null); }} className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-xs font-bold"><ArrowLeft size={15} />Back to Itinerary</button>
            </div>
          </main>
        ) : (
          <main className="mt-6 overflow-hidden rounded-[28px] border-2 border-foreground bg-card shadow-[9px_9px_0_var(--foreground)]" aria-label="Weekend itinerary">
            <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-8">
              <div><p className="text-[10px] font-bold tracking-[0.18em] text-coral uppercase">Saturday</p><h2 className="mt-1 text-lg font-bold">Your Austin itinerary</h2></div>
              <span className="rounded-full bg-paypal px-4 py-2 text-xs font-bold">{selectedStops.length} stops</span>
            </div>
            {loading && <p role="status" className="mx-5 mt-4 rounded-xl bg-mint/50 py-2 text-center text-xs font-bold">Curating fresh Austin stops…</p>}
            {aiError && !loading && <p role="alert" className="mx-5 mt-4 rounded-xl bg-coral/15 py-2 text-center text-xs font-bold">{aiError}</p>}
            <div className={`px-5 py-4 sm:px-8 ${loading ? "pointer-events-none opacity-40" : ""}`}>
              {vibe.stops.map((stop) => {
                const off = excluded.includes(stop.slot);
                const Icon = SLOT_ICON[stop.slot];
                return <button key={stop.slot} type="button" aria-pressed={!off} aria-label={`${off ? "Add" : "Remove"} ${stop.name}`} onClick={() => toggleStop(stop.slot)} className={`grid w-full grid-cols-[44px_1fr_auto] items-center gap-4 border-b border-border py-5 text-left last:border-0 ${off ? "opacity-35" : ""}`}>
                  <span className={`grid size-10 place-items-center rounded-xl shadow-[0_3px_0_var(--border)] ${SLOT_STYLE[stop.slot]}`}><Icon size={18} /></span>
                  <span><span className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-coral uppercase">{stop.slot}<span className="tracking-normal text-muted-foreground">{stop.time}</span></span><span className={`mt-1 block text-sm font-bold sm:text-base ${off ? "line-through" : ""}`}>{stop.name}</span><span className="mt-1 block text-xs text-muted-foreground">{stop.detail}</span></span>
                  <span className={`font-bold ${off ? "line-through" : ""}`}>${stop.price}</span>
                </button>;
              })}
              <div className="mt-3 flex items-end justify-between rounded-[22px] bg-mint-pale px-5 py-5">
                <div><p className="text-[10px] font-bold tracking-[0.17em] text-mint-deep uppercase">One price, whole day</p><p className="mt-2 text-xs text-muted-foreground">Reservations and fees included for each guest</p></div>
                <p className="shrink-0 text-xs text-muted-foreground">total <strong className="ml-1 font-editorial text-4xl font-bold text-foreground">${total}</strong></p>
              </div>
            </div>
          </main>
        )}

        {!paid && <section className="mx-auto mt-5 max-w-full">
          {total === 0 ? <p className="rounded-xl bg-coral/15 py-4 text-center text-sm font-bold">Pick at least one stop to check out</p> : mounted && <div><PayPalButtons key={`${vibe.id}-${total}`} forceReRender={[total, vibe.id]} style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 52 }} createOrder={(_data, actions) => actions.order.create({ intent: "CAPTURE", purchase_units: [{ description: `ATX Weekend Pass — ${custom ? custom.label : vibe.shortLabel} (${selectedStops.length} stops)`, amount: { currency_code: "USD", value: total.toFixed(2) } }] })} onApprove={async (data, actions) => { await actions.order?.capture(); setPass({ orderId: data.orderID, label: custom ? custom.label : `${vibe.shortLabel} vibe`, stops: selectedStops, total }); setPaid(true); }} /></div>}
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Plans change. Cancel for free up to 24 hours before.</p>
        </section>}
      </div>
    </div>
  );
}

function App() {
  return <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}><Index /></PayPalScriptProvider>;
}
