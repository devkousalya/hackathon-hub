import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import {
  Upload,
  Loader2,
  Recycle,
  Repeat,
  HeartHandshake,
  IndianRupee,
  Trash2,
  Camera,
  Sparkles,
  Leaf,
} from "lucide-react";
import { analyzeWaste, type AnalysisResult } from "@/lib/analyze.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "ReWaste AI — Snap. Detect. Reuse, Recycle, Donate or Sell." },
      {
        name: "description",
        content:
          "Upload a photo of any waste or unused item. AI tells you if you can reuse, recycle, donate, or sell it — with a fair price estimate.",
      },
      { property: "og:title", content: "ReWaste AI" },
      {
        property: "og:description",
        content:
          "AI-powered waste sorter: reuse, recycle, donate or sell — with condition-based price estimates.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const MAX_BYTES = 6 * 1024 * 1024; // 6MB

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

type LinkItem = { name: string; url: string };

const DONATE_PLATFORMS: LinkItem[] = [
  { name: "Goonj", url: "https://goonj.org/donate-material/" },
  { name: "Robin Hood Army", url: "https://robinhoodarmy.com/" },
  { name: "GiveIndia", url: "https://www.giveindia.org/" },
  { name: "Bhumi", url: "https://bhumi.ngo/" },
  { name: "Local NGO (Google)", url: "https://www.google.com/search?q=NGO+near+me+accepting+donations" },
];

function donateLink(recipient: string): string {
  const q = encodeURIComponent(recipient);
  const lower = recipient.toLowerCase();
  if (lower.includes("goonj")) return "https://goonj.org/donate-material/";
  if (lower.includes("robin")) return "https://robinhoodarmy.com/";
  if (lower.includes("salvation")) return "https://salvationarmy.org/";
  if (lower.includes("kabadi") || lower.includes("scrap"))
    return "https://www.google.com/search?q=kabadiwala+near+me";
  return `https://www.google.com/search?q=${q}+near+me`;
}

function sellPlatforms(item: string): LinkItem[] {
  const q = encodeURIComponent(item);
  return [
    { name: "OLX", url: `https://www.olx.in/items/q-${q}` },
    { name: "Quikr", url: `https://www.quikr.com/search?query=${q}` },
    { name: "Facebook Marketplace", url: `https://www.facebook.com/marketplace/search?query=${q}` },
    { name: "Cashify", url: `https://www.cashify.in/search?q=${q}` },
    { name: "WhatsApp friends", url: `https://wa.me/?text=${encodeURIComponent("Selling: " + item)}` },
  ];
}

function HomePage() {
  const analyze = useServerFn(analyzeWaste);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image too large. Please use one under 6MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setResult(null);
  };

  const onAnalyze = async () => {
    if (!preview) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await analyze({ data: { imageDataUrl: preview, note: note || undefined } });
      setResult(r);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setNote("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">ReWaste AI</h1>
              <p className="text-xs text-muted-foreground">Waste to Worth</p>
            </div>
          </div>
          <div className="hidden items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:flex">
            <Sparkles className="h-3.5 w-3.5" /> Powered by AI Vision
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        {!result && (
          <section className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Snap it. <span className="text-primary">Sort it.</span> Save it.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Upload a photo of any old, broken, or unused item — from your home, shop, or
              institute. Our AI tells you whether to <b>reuse</b>, <b>recycle</b>, <b>donate</b>,
              or <b>sell</b> it, and suggests a fair price based on its condition.
            </p>
          </section>
        )}

        {/* Uploader */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="file"
                className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary hover:bg-secondary"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview of the item you uploaded"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Camera className="h-7 w-7" />
                    </div>
                    <p className="font-semibold">Tap to add a photo</p>
                    <p className="text-xs text-muted-foreground">
                      Take a photo or upload from gallery · Max 6MB
                    </p>
                  </div>
                )}
                <input
                  ref={inputRef}
                  id="file"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <label htmlFor="note" className="text-sm font-medium">
                Any extra detail? <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                placeholder="e.g. Wooden chair, one leg broken, bought 5 years ago"
                className="min-h-[120px] w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={onAnalyze}
                  disabled={!preview || loading}
                  className="h-11 flex-1 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Analyze Item
                    </>
                  )}
                </Button>
                {(preview || result) && (
                  <Button
                    variant="outline"
                    onClick={reset}
                    disabled={loading}
                    className="h-11"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Result */}
        {result && (
          <section className="mt-8 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Detected item
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">{result.itemName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.category} · {result.material}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase text-primary-foreground">
                    Best: {result.bestAction}
                  </span>
                  <ConditionPill
                    label={result.conditionLabel}
                    score={result.conditionScore}
                  />
                </div>
              </div>
              <p className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm">{result.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ActionCard
                icon={<Repeat className="h-5 w-5" />}
                title="Reuse"
                active={result.actions.reuse.possible}
                highlight={result.bestAction === "reuse"}
              >
                {result.actions.reuse.possible ? (
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {result.actions.reuse.ideas.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Not practical to reuse as-is.</p>
                )}
              </ActionCard>

              <ActionCard
                icon={<Recycle className="h-5 w-5" />}
                title="Recycle"
                active={result.actions.recycle.possible}
                highlight={result.bestAction === "recycle"}
              >
                <p className="text-sm">
                  {result.actions.recycle.possible
                    ? result.actions.recycle.how
                    : "This item isn't easily recyclable."}
                </p>
              </ActionCard>

              <ActionCard
                icon={<HeartHandshake className="h-5 w-5" />}
                title="Donate"
                active={result.actions.donate.possible}
                highlight={result.bestAction === "donate"}
              >
                {result.actions.donate.possible ? (
                  <>
                    <p className="mb-2 text-sm">Consider donating to:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.actions.donate.suggestedTo.map((s, idx) => (
                        <a
                          key={idx}
                          href={donateLink(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-secondary px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground"
                        >
                          {s} ↗
                        </a>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Popular donation platforms:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {DONATE_PLATFORMS.map((p) => (
                          <a
                            key={p.name}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                          >
                            {p.name} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Condition too poor to donate responsibly.
                  </p>
                )}
              </ActionCard>

              <ActionCard
                icon={<IndianRupee className="h-5 w-5" />}
                title="Sell"
                active={result.actions.sell.possible}
                highlight={result.bestAction === "sell"}
              >
                {result.actions.sell.possible ? (
                  <>
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">
                        ₹{result.actions.sell.estimatedPriceINR.min}
                      </span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{result.actions.sell.estimatedPriceINR.max}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.actions.sell.reasoning}
                    </p>
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        List it here to find buyers:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sellPlatforms(result.itemName).map((p) => (
                          <a
                            key={p.name}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                          >
                            {p.name} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not worth selling.</p>
                )}
              </ActionCard>

              {result.actions.dispose.needed && (
                <ActionCard
                  icon={<Trash2 className="h-5 w-5" />}
                  title="Dispose Safely"
                  active
                  highlight={result.bestAction === "dispose"}
                >
                  <p className="text-sm">{result.actions.dispose.how}</p>
                </ActionCard>
              )}
            </div>
          </section>
        )}

        {/* How it works */}
        {!result && (
          <section className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Camera className="h-5 w-5" />,
                title: "1. Snap",
                text: "Take or upload a photo of the item.",
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "2. Detect",
                text: "AI identifies the item and its condition.",
              },
              {
                icon: <Leaf className="h-5 w-5" />,
                title: "3. Act",
                text: "Get the best option — with a fair price if sellable.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-border bg-card p-5 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {s.icon}
                </div>
                <h4 className="font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="mt-12 border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built with love for a cleaner planet 🌱
      </footer>
    </div>
  );
}

function ConditionPill({ label, score }: { label: string; score: number }) {
  const tone =
    score >= 75
      ? "bg-emerald-100 text-emerald-800"
      : score >= 50
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {label} · {score}/100
    </span>
  );
}

function ActionCard({
  icon,
  title,
  active,
  highlight,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        highlight
          ? "border-primary bg-primary/5 shadow-md"
          : active
            ? "border-border bg-card"
            : "border-border bg-muted/40 opacity-70"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          }`}
        >
          {icon}
        </div>
        <h4 className="font-semibold">{title}</h4>
        {highlight && (
          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            Recommended
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
