"use client";
// Advisor chat screen — responsive across breakpoints (one component, no device split):
//   - header: compact sticky bar on phones, larger inline header at md+
//   - message list: AI vs user bubbles, sized down on phones
//   - composer: shown at md+ (desktop). On phones the composer is the docked
//     AdvisorInputBar in the shell chrome (MobileFrame), so it's hidden here below md.
// Sending dispatches the user message, then appends a canned AI reply after a short
// delay.
import { useRef, useState } from "react";
import { Sparkle, Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { ADVISOR_SUGGESTIONS } from "@/lib/seed";
import { Card } from "@/components/composed";
import { Button } from "@/components/ui/button";

// PROTOTYPE STUB: keyword-matched canned advisor replies. Replace with a real call to
// the advisor backend (streamed response) for production.
function cannedReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("debt") || p.includes("pay off")) {
    return "Funnel your spare cash flow at the Visa Signature first — at 24.9% APR it's the costliest balance. Clearing it before the Apple Card saves you the most interest overall.";
  }
  if (p.includes("vacation") || p.includes("afford") || p.includes("trip")) {
    return "The vacation fund is at $1,850 of $5,000 and on pace for December. You can comfortably keep the $263/mo auto-save without touching your emergency buffer.";
  }
  if (p.includes("overspend") || p.includes("spending") || p.includes("budget")) {
    return "Dining out is your hot spot — up 18% over your 3-month average. Trimming about $120/mo there fully covers your vacation contribution.";
  }
  return "Good question. Based on your accounts and funds, the highest-leverage move right now is steering your extra free cash flow toward the 24.9% Visa balance — want me to set that as your plan?";
}

export default function Advisor() {
  const { s, dispatch, uid } = useStore();
  const [draft, setDraft] = useState("");
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    dispatch({ t: "addMessage", v: { id: uid("m"), role: "user", text: body } });
    setDraft("");
    if (replyTimer.current) clearTimeout(replyTimer.current);
    // PROTOTYPE STUB: fake reply delay; swap for the real advisor backend call.
    replyTimer.current = setTimeout(() => {
      dispatch({ t: "addMessage", v: { id: uid("m"), role: "ai", text: cannedReply(body) } });
    }, 500);
  };

  return (
    <div>
      {/* Header: compact sticky bar on phones, larger inline header at md+ */}
      <div className="sticky top-0 z-[6] -mx-4 flex items-center gap-2.5 border-b bg-background/85 px-5 pt-[13px] pb-3 backdrop-blur-md md:static md:mx-0 md:gap-[11px] md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="flex size-[34px] flex-none items-center justify-center rounded-[11px] bg-gradient-to-br from-primary to-brand-accent-soft md:size-10 md:rounded-[13px]">
          <Sparkle size={18} fill="#fff" />
        </div>
        <div className="flex-1 md:flex-none">
          <h1 className="font-serif text-[19px] font-medium leading-none md:text-[26px] md:leading-[1.1] md:tracking-[-0.01em]">
            <span className="md:hidden">Advisor</span>
            <span className="hidden md:inline">Your advisor</span>
          </h1>
          <div className="mt-[3px] flex items-center gap-1.5 md:mt-0">
            <span className="size-[7px] rounded-full bg-brand-green md:hidden" />
            <span className="text-[11.5px] text-muted-foreground md:text-[12.5px]">
              <span className="md:hidden">Sees every account &amp; fund</span>
              <span className="hidden md:inline">Sees every account, balance, and fund</span>
            </span>
          </div>
        </div>
      </div>

      {/* Message list. On phones it flows in the page (composer is the docked shell bar,
          hence the bottom padding to clear it); at md+ it lives in a fixed-height Card
          with the composer below. */}
      <div className="md:mt-[22px] md:flex md:h-[540px] md:flex-col md:overflow-hidden md:rounded-2xl md:border md:bg-card">
        <div className="flex flex-col gap-3.5 pt-4 pb-[188px] md:flex-1 md:gap-4 md:overflow-y-auto md:p-6 md:pb-6">
          {s.messages.map((m) =>
            m.role === "ai" ? (
              <div key={m.id} className="flex gap-[9px] md:gap-[11px]">
                <span className="mt-px flex size-7 flex-none items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-brand-accent-soft md:size-[30px]">
                  <Sparkle size={14} fill="#fff" />
                </span>
                <div className="max-w-[80%] rounded-[4px_16px_16px_16px] border bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground/80 md:max-w-[78%] md:rounded-[4px_15px_15px_15px] md:border-0 md:bg-background md:px-4 md:py-[13px] md:text-[14.5px]">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-[16px_16px_4px_16px] bg-primary px-3.5 py-[11px] text-sm leading-relaxed text-primary-foreground md:max-w-[78%] md:rounded-[15px_15px_4px_15px] md:px-4 md:py-3 md:text-[14.5px]">
                  {m.text}
                </div>
              </div>
            )
          )}
        </div>

        {/* Composer — desktop only; phones use the docked AdvisorInputBar in the shell. */}
        <div className="hidden border-t px-[18px] py-4 md:block">
          <div className="mb-3 flex flex-wrap gap-2">
            {ADVISOR_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => send(sug)}
                className="rounded-[9px] border bg-background px-[13px] py-[7px] text-[12.5px] text-foreground/80"
              >
                {sug}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5 rounded-[13px] border bg-secondary py-[9px] pr-[9px] pl-4">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(draft);
              }}
              placeholder="Ask anything about your money…"
              className="flex-1 border-none bg-transparent text-[14.5px] text-foreground outline-none"
            />
            <Button onClick={() => send(draft)} size="icon" aria-label="Send" className="size-9 flex-none rounded-[10px]">
              <Icon name="send" size={16} strokeWidth={2.4} style={{ color: "#fff" }} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
