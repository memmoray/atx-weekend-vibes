import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  type OnApproveData,
  type OnApproveActions,
} from "@paypal/react-paypal-js";
import chillPhoto from "../assets/chill-vibe.jpg";
import wildPhoto from "../assets/wild-vibe.jpg";
import socialPhotoAsset from "../assets/social-vibe.jpg.asset.json";

const socialPhoto = socialPhotoAsset.url;

const PAYPAL_CLIENT_ID =
  "BAAaHSFWndANttbM7entvAqqDBPkt9i0IzTYzdMPQZykv610K_J0wE1YbkPnxnzrJq4pH7rEiTvuV1yBq8";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATX Weekend Pass — Pick a Vibe, Get Your Austin Itinerary" },
      {
        name: "description",
        content:
          "One tap picks your vibe: three Austin stops — morning, afternoon, night — with a weekend total and instant PayPal checkout.",
      },
      {
        property: "og:title",
        content: "ATX Weekend Pass — Pick a Vibe, Get Your Austin Itinerary",
      },
      {
        property: "og:description",
        content:
          "Three Austin stops per vibe — morning, afternoon, night. One weekend total, one tap to checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Slot = "Morning" | "Afternoon" | "Night";

type Stop = {
  slot: Slot;
  time: string;
  name: string;
  detail: string;
  price: number;
};

type Vibe = {
  id: "chill" | "social" | "wild";
  label: string;
  tagline: string;
  photo: string;
  stops: Stop[];
};

const VIBES: Vibe[] = [
  {
    id: "chill",
    label: "Chill",
    tagline: "Slow mornings, soft landings",
    photo: chillPhoto,
    stops: [
      {
        slot: "Morning",
        time: "7:00 AM",
        name: "Zilker Sunrise",
        detail: "paddle + park loop",
        price: 18,
      },
      {
        slot: "Afternoon",
        time: "1:30 PM",
        name: "Snooze Rooftop",
        detail: "tacos + shade",
        price: 26,
      },
      {
        slot: "Night",
        time: "9:00 PM",
        name: "Cathedral Live",
        detail: "sets till late",
        price: 32,
      },
    ],
  },
  {
    id: "social",
    label: "Social",
    tagline: "Patios, music, people",
    photo: socialPhoto,
    stops: [
      {
        slot: "Morning",
        time: "9:00 AM",
        name: "Jo's on Congress",
        detail: "coffee + people-watch",
        price: 14,
      },
      {
        slot: "Afternoon",
        time: "2:00 PM",
        name: "Rainey Street Crawl",
        detail: "patio hopping",
        price: 48,
      },
      {
        slot: "Night",
        time: "10:00 PM",
        name: "Continental Club",
        detail: "two sets, front row",
        price: 40,
      },
    ],
  },
  {
    id: "wild",
    label: "Wild",
    tagline: "Go big, sleep later",
    photo: wildPhoto,
    stops: [
      {
        slot: "Morning",
        time: "8:00 AM",
        name: "Barton Springs Plunge",
        detail: "68° year-round",
        price: 12,
      },
      {
        slot: "Afternoon",
        time: "12:30 PM",
        name: "Lake Travis Zipline",
        detail: "six lines over water",
        price: 68,
      },
      {
        slot: "Night",
        time: "10:30 PM",
        name: "Dirty 6th Bar Hop",
        detail: "four venues, one wristband",
        price: 52,
      },
    ],
  },
];

const SLOT_CHIP: Record<Slot, string> = {
  Morning: "bg-mint/15 text-mint-deep",
  Afternoon: "bg-sky/15 text-sky-deep",
  Night: "bg-coral/15 text-coral-deep",
};

const SLOT_RING: Record<Slot, string> = {
  Morning: "bg-mint",
  Afternoon: "bg-sky",
  Night: "bg-coral",
};

function weekendLabel(): string {
  const now = new Date();
  const friday = new Date(now);
  friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(friday)}–${fmt(sunday)}`;
}

function Index() {
  const [vibeId, setVibeId] = useState<Vibe["id"]>("chill");
  const [paid, setPaid] = useState(false);
  const [weekend, setWeekend] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWeekend(weekendLabel());
    setMounted(true);
  }, []);

  const vibe = VIBES.find((v) => v.id === vibeId) as Vibe;
  const total = vibe.stops.reduce((sum, stop) => sum + stop.price, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink font-body text-ink">
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-[62vw] rounded-full bg-sky/50 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-44 size-[52vw] rounded-full bg-mint/30 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-1/3 size-[54vw] rounded-full bg-coral/30 blur-[90px]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 pt-6 pb-10">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-ink font-display text-[13px] font-semibold tracking-tight text-cream ring-1 ring-black/5">
              ATX
            </span>
            <div className="min-w-0 leading-none">
              <p className="truncate font-display text-[13px] font-semibold tracking-tight text-cream">
                Weekend Pass
              </p>
              <p className="mt-1 truncate text-[10px] tracking-[0.22em] text-cream/60 uppercase">
                Austin{weekend ? ` · ${weekend}` : ""}
              </p>
            </div>
          </div>
          <span className="glass-dim shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium text-ink-soft">
            3 stops
          </span>
        </header>

        {/* Vibe selector */}
        <div className="glass mt-5 rounded-2xl p-3">
          <p className="px-1 pb-2 text-[10px] font-medium tracking-[0.2em] text-ink-soft/70 uppercase">
            Choose your vibe
          </p>
          <div className="grid grid-cols-3 gap-2">
            {VIBES.map((v) => {
              const active = v.id === vibeId;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setVibeId(v.id);
                    setPaid(false);
                  }}
                  className={`rounded-[14px] px-2 py-2.5 text-center transition-all duration-200 ${
                    active ? "glass ring-1 ring-sky/40" : "glass-dim hover:glass"
                  }`}
                >
                  <img
                    src={v.photo}
                    alt=""
                    className="mx-auto mb-1.5 block size-9 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <span className="block font-display text-[13px] font-semibold text-ink">
                    {v.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] ${
                      active ? "text-sky-deep" : "text-ink-soft/60"
                    }`}
                  >
                    {active ? "Selected" : "Swap"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Itinerary card */}
        <main
          key={vibe.id}
          className="glass rise mt-4 rounded-2xl p-4"
          aria-label="Weekend itinerary"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium tracking-[0.2em] text-ink-soft/70 uppercase">
              Itinerary · {vibe.label}
            </p>
            <p className="text-[10px] tracking-[0.2em] text-ink-soft/70 uppercase">
              {vibe.tagline}
            </p>
          </div>

          <div className="mt-3 overflow-hidden rounded-[14px] ring-1 ring-black/10">
            <img
              src={vibe.photo}
              alt={`Friends enjoying a ${vibe.label.toLowerCase()} Austin weekend`}
              className="h-40 w-full object-cover"
            />
          </div>

          <div className="mt-3">
            {vibe.stops.map((stop, i) => (
              <div
                key={stop.slot}
                className={`flex items-start gap-3 py-3 ${
                  i > 0 ? "border-t border-ink/10" : ""
                }`}
              >
                <div className="min-w-0 shrink-0 pt-0.5">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase ${SLOT_CHIP[stop.slot]}`}
                  >
                    {stop.slot}
                  </span>
                  <p className="mt-2 font-display text-[15px] leading-tight font-semibold text-ink">
                    {stop.name}
                  </p>
                  <p className="mt-1 truncate text-[12px] text-ink-soft/70">
                    {stop.time} · {stop.detail}
                  </p>
                </div>
                <span className="ml-auto self-center font-display text-[15px] font-semibold text-ink">
                  ${stop.price}
                </span>
              </div>
            ))}
          </div>

          {/* Total + PayPal checkout */}
          <div className="mt-3 border-t border-ink/10 pt-3">
            <div className="flex items-center gap-3">
              <div className="leading-none">
                <p className="text-[10px] tracking-[0.18em] text-ink-soft/70 uppercase">
                  Total
                </p>
                <p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight text-ink">
                  ${total}
                </p>
              </div>
              <div className="glass-dim ml-auto rounded-xl px-3 py-2 text-right">
                <p className="text-[10px] text-ink-soft/70">per weekend</p>
                <p className="mt-0.5 font-display text-[12px] font-semibold text-ink-soft">
                  all 3 stops
                </p>
              </div>
            </div>

            {paid ? (
              <div
                className="rise mt-3 flex items-center justify-center gap-2 rounded-xl bg-mint/20 py-3 ring-1 ring-mint/40"
                role="status"
              >
                <span className="grid size-5 place-items-center rounded-full bg-mint text-[11px] font-bold text-ink">
                  ✓
                </span>
                <span className="text-[14px] font-semibold text-ink">
                  Pass secured — see you in Austin
                </span>
              </div>
            ) : (
              mounted && (
                <div className="mt-3">
                  <PayPalButtons
                    key={vibe.id}
                    forceReRender={[total, vibe.id]}
                    style={{
                      layout: "vertical",
                      color: "gold",
                      shape: "pill",
                      label: "paypal",
                      height: 45,
                    }}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            description: `ATX Weekend Pass — ${vibe.label} vibe (${vibe.stops.length} stops)`,
                            amount: {
                              currency_code: "USD",
                              value: total.toFixed(2),
                            },
                          },
                        ],
                      })
                    }
                    onApprove={async (
                      _data: OnApproveData,
                      actions: OnApproveActions,
                    ) => {
                      await actions.order?.capture();
                      setPaid(true);
                    }}
                  />
                  <p className="mt-2 text-center text-[10px] tracking-[0.18em] text-ink-soft/60 uppercase">
                    Secure sandbox checkout via PayPal
                  </p>
                </div>
              )
            )}
            {paid && (
              <button
                type="button"
                onClick={() => setPaid(false)}
                className="mt-2 w-full text-center text-[11px] font-medium tracking-[0.18em] text-ink-soft/70 uppercase hover:text-ink-soft"
              >
                Buy another pass
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <Index />
    </PayPalScriptProvider>
  );
}
