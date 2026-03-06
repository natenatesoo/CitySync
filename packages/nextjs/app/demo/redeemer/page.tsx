"use client";

import React, { useState } from "react";
import AppShell from "../_components/AppShell";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, OfferCategory, RedemptionOffer } from "../_data/mockData";

// ─── Tab icons ────────────────────────────────────────────────────────────────

const icons = {
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  redemptions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  mycity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M3 7l9-4 9 4v14H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  mces: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS = [
  { key: "profile", label: "Profile", icon: icons.profile },
  { key: "redemptions", label: "Redeem", icon: icons.redemptions },
  { key: "mycity", label: "MyCity", icon: icons.mycity },
  { key: "dashboard", label: "Dashboard", icon: icons.dashboard },
  { key: "mces", label: "MCEs", icon: icons.mces },
];

const _OFFER_CATEGORIES: Array<OfferCategory | "All"> = ["All", "Food", "Fitness", "Transit", "Culture", "Essentials"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RedeemerApp() {
  const { state, setRole, redeemerToggleMCE, redeemerAddOffer, redeemerRemoveOffer, redeemerProcessRedemption } =
    useDemo();
  const [activeTab, setActiveTab] = useState("profile");
  const [addOfferSheet, setAddOfferSheet] = useState(false);
  const [qrTarget, setQrTarget] = useState<string | null>(null);

  const { redeemer, mces } = state;

  React.useEffect(() => {
    setRole("redeemer");
  }, [setRole]);

  return (
    <>
      <AppShell
        role="redeemer"
        orgName={redeemer.orgName}
        address={FAKE_WALLETS.redeemer}
        cityBalance={0}
        voteBalance={0}
        mceBalance={0}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor="#34eeb6"
        title="Redeemer"
      >
        {activeTab === "profile" && <RedeemerProfileTab redeemer={redeemer} onToggleMCE={redeemerToggleMCE} />}
        {activeTab === "redemptions" && (
          <RedeemerRedemptionsTab
            redeemer={redeemer}
            onAddOffer={() => setAddOfferSheet(true)}
            onRemoveOffer={redeemerRemoveOffer}
            onShowQR={setQrTarget}
            onProcess={redeemerProcessRedemption}
          />
        )}
        {activeTab === "mycity" && <RedeemerMyCityTab mces={mces} redeemer={redeemer} />}
        {activeTab === "dashboard" && <RedeemerDashboard redeemer={redeemer} />}
        {activeTab === "mces" && <RedeemerMCEsTab mces={mces} acceptsMCE={redeemer.acceptsMCE} />}
      </AppShell>

      {addOfferSheet && (
        <AddOfferSheet
          redeemer={redeemer}
          onClose={() => setAddOfferSheet(false)}
          onAdd={offer => {
            redeemerAddOffer(offer);
            setAddOfferSheet(false);
          }}
        />
      )}

      {qrTarget && <QRModal offerId={qrTarget} offers={redeemer.offers} onClose={() => setQrTarget(null)} />}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function RedeemerProfileTab({
  redeemer,
  onToggleMCE,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  onToggleMCE: () => void;
}) {
  return (
    <div className="px-5 py-6">
      {/* Welcome banner */}
      <div
        className="mb-6 rounded-3xl p-5"
        style={{
          background: "linear-gradient(135deg, #001a14 0%, #1E1E2C 100%)",
          border: "1px solid rgba(52,238,182,0.25)",
        }}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(52,238,182,0.6)" }}>
          Welcome
        </div>
        <div className="mb-1 text-2xl font-bold text-white">{redeemer.orgName || "Your Venue"}</div>
        <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {FAKE_WALLETS.redeemer}
        </div>
        <div className="mt-4 flex gap-3">
          <StatusPill label="Registered Redeemer" color="#34eeb6" />
          {redeemer.acceptsMCE && <StatusPill label="MCE Accepted" color="#DD9E33" />}
        </div>
      </div>

      {/* About the redeemer role */}
      <div
        className="mb-6 rounded-2xl p-4"
        style={{ background: "rgba(52,238,182,0.05)", border: "1px solid rgba(52,238,182,0.12)" }}
      >
        <div className="mb-2 text-sm font-semibold text-white">Your Role as a Redeemer</div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Accept CITY credits from civic participants in exchange for goods and services. Generate QR codes for
          in-person redemption, finalize transactions from your wallet, and optionally accept MCECredits for expanded
          offerings.
        </p>
      </div>

      {/* MCE opt-in toggle */}
      <SectionHeader title="MCECredit Settings" />
      <div
        className="mb-6 rounded-2xl p-4"
        style={{
          background: "#1E1E2C",
          border: redeemer.acceptsMCE ? "1px solid rgba(221,158,51,0.25)" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Accept MCECredits</div>
            <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Opt in to receive MCECredits from Mass Coordination Event participants. Unlocks MCE-exclusive offer types
              and recognition in the city portal.
            </div>
          </div>
          <button
            onClick={onToggleMCE}
            className="shrink-0 rounded-full transition-colors"
            style={{
              width: 44,
              height: 24,
              background: redeemer.acceptsMCE ? "#DD9E33" : "rgba(255,255,255,0.15)",
              position: "relative",
            }}
          >
            <div
              className="absolute rounded-full bg-white transition-transform"
              style={{
                width: 18,
                height: 18,
                top: 3,
                left: redeemer.acceptsMCE ? 23 : 3,
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <SectionHeader title="Activity" />
      <div className="rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Active Offers" value={redeemer.offers.length} />
        <StatRow label="Pending Queue" value={redeemer.redemptionQueue.length} border />
        <StatRow label="Processed" value={redeemer.processedRedemptions.length} border />
        <StatRow
          label="CITY Received"
          value={redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0)}
          suffix="CITY"
          border
        />
      </div>
    </div>
  );
}

// ─── Redemptions Tab ──────────────────────────────────────────────────────────

function RedeemerRedemptionsTab({
  redeemer,
  onAddOffer,
  onRemoveOffer,
  onShowQR,
  onProcess,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  onAddOffer: () => void;
  onRemoveOffer: (id: string) => void;
  onShowQR: (id: string) => void;
  onProcess: (queueId: string) => void;
}) {
  const [view, setView] = useState<"offers" | "queue">("offers");

  return (
    <div className="px-5 py-6">
      {/* Segment */}
      <div className="mb-5 flex rounded-2xl p-1" style={{ background: "#1E1E2C" }}>
        {(["offers", "queue"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 rounded-xl py-2 text-sm font-medium transition"
            style={{
              background: view === v ? "#34eeb6" : "transparent",
              color: view === v ? "#15151E" : "rgba(255,255,255,0.5)",
            }}
          >
            {v === "offers" ? `My Offers (${redeemer.offers.length})` : `Queue (${redeemer.redemptionQueue.length})`}
          </button>
        ))}
      </div>

      {view === "offers" && (
        <>
          <button
            onClick={onAddOffer}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
            style={{ background: "rgba(52,238,182,0.1)", color: "#34eeb6", border: "1px dashed rgba(52,238,182,0.35)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Add New Offer
          </button>

          {redeemer.offers.length === 0 ? (
            <EmptyState
              emoji="🏪"
              title="No offers yet"
              desc="Add an offer to start accepting CITY credits from participants."
            />
          ) : (
            <div className="space-y-3">
              {redeemer.offers.map(offer => (
                <div
                  key={offer.id}
                  className="rounded-3xl p-4"
                  style={{
                    background: "#1E1E2C",
                    border: offer.mceOnly ? "1px solid rgba(221,158,51,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        {offer.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white">{offer.offerTitle}</span>
                          {offer.mceOnly && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-xs"
                              style={{ background: "rgba(221,158,51,0.2)", color: "#DD9E33" }}
                            >
                              MCE
                            </span>
                          )}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {offer.description}
                        </div>
                        <div className="mt-1 text-xs font-semibold" style={{ color: "#34eeb6" }}>
                          {offer.costCity} CITY
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onShowQR(offer.id)}
                      className="flex-1 rounded-xl py-2 text-xs font-semibold transition"
                      style={{ background: "rgba(52,238,182,0.12)", color: "#34eeb6" }}
                    >
                      Show QR
                    </button>
                    <button
                      onClick={() => onRemoveOffer(offer.id)}
                      className="rounded-xl px-3 py-2 text-xs transition"
                      style={{ background: "rgba(255,107,157,0.1)", color: "#ff6b9d" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "queue" && (
        <>
          {redeemer.redemptionQueue.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="Queue is empty"
              desc="When participants redeem your offers, they appear here for you to process and finalize."
            />
          ) : (
            <div className="space-y-3">
              {redeemer.redemptionQueue.map(r => (
                <div
                  key={r.id}
                  className="rounded-3xl p-4"
                  style={{ background: "#1E1E2C", border: "1px solid rgba(52,238,182,0.15)" }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{r.offerTitle}</div>
                      <div className="mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {r.citizenAddress}
                      </div>
                      <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold" style={{ color: "#34eeb6" }}>
                        {r.costCity}
                      </div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        CITY
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onProcess(r.id)}
                    className="w-full rounded-2xl py-2.5 text-sm font-semibold transition"
                    style={{ background: "#34eeb6", color: "#15151E" }}
                  >
                    Process Redemption
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Processed history */}
          {redeemer.processedRedemptions.length > 0 && (
            <>
              <div
                className="mt-6 mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Processed
              </div>
              <div className="space-y-2">
                {redeemer.processedRedemptions.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ background: "#1E1E2C" }}
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{r.offerTitle}</div>
                      <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {r.citizenAddress}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold" style={{ color: "#34eeb6" }}>
                        +{r.costCity} CITY
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Add Offer Sheet ──────────────────────────────────────────────────────────

const PRESET_OFFERS = [
  {
    title: "10% Grocery Discount",
    desc: "10% off any purchase up to $50",
    cost: 30,
    cat: "Essentials" as OfferCategory,
    emoji: "🛒",
  },
  { title: "Day Pass", desc: "Full access for one day", cost: 20, cat: "Fitness" as OfferCategory, emoji: "🏋️" },
  {
    title: "Meal Voucher ($10)",
    desc: "Any item up to $10 value",
    cost: 25,
    cat: "Food" as OfferCategory,
    emoji: "🍱",
  },
  {
    title: "Transit Pass (1 day)",
    desc: "Unlimited rides for one day",
    cost: 15,
    cat: "Transit" as OfferCategory,
    emoji: "🚌",
  },
  {
    title: "Workshop Entry",
    desc: "One drop-in workshop session",
    cost: 35,
    cat: "Culture" as OfferCategory,
    emoji: "🎨",
  },
  {
    title: "MCE Champion Reward",
    desc: "Special reward for MCE participants",
    cost: 80,
    cat: "Culture" as OfferCategory,
    emoji: "🏆",
    mceOnly: true,
  },
];

function AddOfferSheet({
  redeemer,
  onClose,
  onAdd,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  onClose: () => void;
  onAdd: (offer: RedemptionOffer) => void;
}) {
  const [selected, setSelected] = useState<(typeof PRESET_OFFERS)[number] | null>(null);
  const [customCost, setCustomCost] = useState("");
  const [step, setStep] = useState<"pick" | "configure">("pick");

  const handleAdd = () => {
    if (!selected) return;
    const cost = parseInt(customCost) > 0 ? parseInt(customCost) : selected.cost;
    const offer: RedemptionOffer = {
      id: `offer-custom-${Date.now()}`,
      redeemerName: redeemer.orgName,
      redeemerId: "redeemer-demo",
      offerTitle: selected.title,
      description: selected.desc,
      costCity: cost,
      acceptsMCE: redeemer.acceptsMCE,
      mceOnly: (selected as (typeof PRESET_OFFERS)[number] & { mceOnly?: boolean }).mceOnly ?? false,
      category: selected.cat,
      emoji: selected.emoji,
    };
    onAdd(offer);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 pb-10"
        style={{ background: "#1E1E2C", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

        {step === "pick" ? (
          <>
            <div className="mb-1 text-xl font-bold text-white">Add an Offer</div>
            <div className="mb-5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Choose a preset to get started quickly. You can adjust the CITY cost.
            </div>
            <div className="space-y-2">
              {PRESET_OFFERS.map(preset => (
                <button
                  key={preset.title}
                  onClick={() => {
                    setSelected(preset);
                    setCustomCost(String(preset.cost));
                    setStep("configure");
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span className="text-2xl">{preset.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{preset.title}</span>
                      {(preset as (typeof PRESET_OFFERS)[number] & { mceOnly?: boolean }).mceOnly && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-xs"
                          style={{ background: "rgba(221,158,51,0.2)", color: "#DD9E33" }}
                        >
                          MCE
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {preset.desc}
                    </div>
                  </div>
                  <div className="text-sm font-bold" style={{ color: "#34eeb6" }}>
                    {preset.cost} CITY
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : selected ? (
          <>
            <button onClick={() => setStep("pick")} className="mb-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              ← Back
            </button>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-3xl">{selected.emoji}</span>
              <div>
                <div className="text-xl font-bold text-white">{selected.title}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {selected.desc}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-white">CITY Cost</label>
              <input
                type="number"
                value={customCost}
                onChange={e => setCustomCost(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-lg font-bold text-white outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(52,238,182,0.3)" }}
                placeholder={String(selected.cost)}
              />
              <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Default: {selected.cost} CITY
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold transition"
              style={{ background: "#34eeb6", color: "#15151E" }}
            >
              Add Offer
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({ offerId, offers, onClose }: { offerId: string; offers: RedemptionOffer[]; onClose: () => void }) {
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return null;

  // Fake QR: render a simple SVG grid
  const qrPayload = `citysync://redeem?offer=${offerId}&redeemer=${FAKE_WALLETS.redeemer}&cost=${offer.costCity}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="mx-5 w-full rounded-3xl p-6"
        style={{ background: "#1E1E2C", maxWidth: 360 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 text-center">
          <div className="text-xl font-bold text-white">{offer.offerTitle}</div>
          <div className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {offer.redeemerName}
          </div>
        </div>

        {/* QR placeholder */}
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
          style={{ width: 200, height: 200, background: "#fff", padding: 12 }}
        >
          <QRGrid seed={offerId} />
        </div>

        <div
          className="mb-4 rounded-xl px-3 py-2 text-center"
          style={{ background: "rgba(52,238,182,0.1)", border: "1px solid rgba(52,238,182,0.2)" }}
        >
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Cost
          </div>
          <div className="text-2xl font-bold" style={{ color: "#34eeb6" }}>
            {offer.costCity} CITY
          </div>
        </div>

        <div className="mb-4 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="break-all font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {qrPayload}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-2xl py-3 text-sm font-semibold"
          style={{ background: "#34eeb6", color: "#15151E" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// Simple deterministic QR-like grid
function QRGrid({ seed }: { seed: string }) {
  const size = 13;
  // Hash seed into bits
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const cells = Array.from({ length: size * size }, (_, i) => {
    // Fixed corner squares
    const r = Math.floor(i / size);
    const c = i % size;
    if ((r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)) return true;
    return ((hash ^ (i * 0x5f3759df)) & 1) === 1;
  });

  return (
    <svg width="176" height="176" viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: "pixelated" }}>
      {cells.map((filled, i) =>
        filled ? <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="#15151E" /> : null,
      )}
    </svg>
  );
}

// ─── MyCity Tab ───────────────────────────────────────────────────────────────

function RedeemerMyCityTab({
  mces,
  redeemer,
}: {
  mces: ReturnType<typeof useDemo>["state"]["mces"];
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
}) {
  return (
    <div className="px-5 py-6">
      <SectionHeader title="City Activity" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Active MCEs" value={mces.filter(m => m.status === "Active").length} />
        <StatRow label="Total MCE Participants" value={mces.reduce((n, m) => n + m.participantCount, 0)} border />
        <StatRow label="MCEs in Voting" value={mces.filter(m => m.status === "Voting").length} border />
      </div>

      <SectionHeader title="Your Venue" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Active Offers" value={redeemer.offers.length} />
        <StatRow label="Redemptions Processed" value={redeemer.processedRedemptions.length} border />
        <StatRow
          label="CITY Received"
          value={redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0)}
          suffix="CITY"
          border
        />
        <StatRow label="MCE Opt-In" value={redeemer.acceptsMCE ? 1 : 0} border />
      </div>

      {mces
        .filter(m => m.status === "Active")
        .map(mce => (
          <div key={mce.id}>
            <SectionHeader title="Active MCE" />
            <div
              className="rounded-3xl p-5"
              style={{ background: "#1E1E2C", border: "1px solid rgba(52,238,182,0.2)" }}
            >
              <div className="mb-1">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: "rgba(52,238,182,0.15)", color: "#34eeb6" }}
                >
                  Active
                </span>
              </div>
              <div className="mt-2 text-base font-semibold text-white">{mce.title}</div>
              <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {mce.participantCount.toLocaleString()} participants · {mce.taskCount} tasks · {mce.mceCreditsPerTask}{" "}
                MCE/task
              </div>
              {redeemer.acceptsMCE && (
                <div
                  className="mt-3 rounded-xl px-3 py-2 text-xs"
                  style={{ background: "rgba(221,158,51,0.1)", color: "#DD9E33" }}
                >
                  ✓ You are accepting MCECredits from this event
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function RedeemerDashboard({ redeemer }: { redeemer: ReturnType<typeof useDemo>["state"]["redeemer"] }) {
  const totalCity = redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0);

  const categoryBreakdown = redeemer.offers.reduce<Record<string, number>>((acc, o) => {
    acc[o.category] = (acc[o.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-5 py-6">
      <SectionHeader title="Performance" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <MetricCard label="Active Offers" value={redeemer.offers.length} color="#34eeb6" />
        <MetricCard label="Processed" value={redeemer.processedRedemptions.length} color="#4169E1" />
        <MetricCard label="CITY Received" value={totalCity} color="#DD9E33" />
        <MetricCard label="Pending Queue" value={redeemer.redemptionQueue.length} color="#a78bfa" />
      </div>

      {Object.keys(categoryBreakdown).length > 0 && (
        <>
          <SectionHeader title="Offers by Category" />
          <div className="mb-6 space-y-2">
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: "#1E1E2C" }}
              >
                <span className="text-sm text-white">{cat}</span>
                <span className="text-sm font-semibold" style={{ color: "#34eeb6" }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* How it works */}
      <SectionHeader title="Redemption Flow" />
      <div className="rounded-2xl p-4 space-y-3" style={{ background: "#1E1E2C" }}>
        {[
          ["1️⃣", "Create offers", "Add offers from the Redemptions tab with your CITY pricing."],
          ["2️⃣", "Show QR code", "Participants scan your QR in person to initiate a redemption."],
          ["3️⃣", "Confirm in queue", "Redemption request appears in your queue — review and process."],
          ["4️⃣", "Credits arrive", "CITY is burned from the citizen's wallet and confirmed on-chain."],
        ].map(([num, title, desc]) => (
          <div key={title} className="flex gap-3">
            <span className="text-lg">{num}</span>
            <div>
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MCEs Tab ─────────────────────────────────────────────────────────────────

function RedeemerMCEsTab({
  mces,
  acceptsMCE,
}: {
  mces: ReturnType<typeof useDemo>["state"]["mces"];
  acceptsMCE: boolean;
}) {
  const STATUS_COLOR: Record<string, string> = {
    Voting: "#4169E1",
    Planning: "#DD9E33",
    Active: "#34eeb6",
    Closed: "rgba(255,255,255,0.3)",
    Rejected: "#ff6b9d",
  };

  return (
    <div className="px-5 py-6">
      {!acceptsMCE && (
        <div
          className="mb-5 rounded-2xl p-4"
          style={{ background: "rgba(221,158,51,0.06)", border: "1px solid rgba(221,158,51,0.2)" }}
        >
          <div className="mb-1 text-sm font-semibold" style={{ color: "#DD9E33" }}>
            ⚡ Enable MCECredits to unlock MCE offers
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Toggle MCE opt-in on your Profile tab to start accepting MCECredits from Mass Coordination Event
            participants — and create MCE-exclusive offers.
          </p>
        </div>
      )}

      <SectionHeader title="Mass Coordination Events" />
      <div className="space-y-4">
        {mces.map(mce => {
          const statusColor = STATUS_COLOR[mce.status] ?? "#4169E1";
          const total = mce.votesFor + mce.votesAgainst;
          const forPct = total > 0 ? (mce.votesFor / total) * 100 : 50;

          return (
            <div
              key={mce.id}
              className="rounded-3xl p-5"
              style={{ background: "#1E1E2C", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: `${statusColor}18`, color: statusColor }}
              >
                {mce.status}
              </span>
              <div className="mt-2 text-base font-semibold text-white">{mce.title}</div>
              <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {mce.mceCreditsPerTask} MCE credits/task · {mce.taskCount} tasks
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${forPct}%`, background: "linear-gradient(90deg, #4169E1, #34eeb6)" }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span>{mce.votesFor.toLocaleString()} for</span>
                <span>{mce.votesAgainst.toLocaleString()} against</span>
              </div>

              {acceptsMCE && mce.status === "Active" && (
                <div
                  className="mt-3 rounded-xl px-3 py-2 text-xs"
                  style={{ background: "rgba(52,238,182,0.1)", color: "#34eeb6" }}
                >
                  ✓ You can create MCE-exclusive offers for this event
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
      {title}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: `${color}20`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function StatRow({
  label,
  value,
  suffix,
  border,
}: {
  label: string;
  value: number;
  suffix?: string;
  border?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: border ? "1px solid rgba(255,255,255,0.06)" : undefined }}
    >
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-white">
        {value.toLocaleString()}
        {suffix && (
          <span className="ml-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: "#1E1E2C" }}>
      <div className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 text-5xl">{emoji}</div>
      <div className="mb-2 text-base font-semibold text-white">{title}</div>
      <div className="max-w-xs text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
        {desc}
      </div>
    </div>
  );
}
