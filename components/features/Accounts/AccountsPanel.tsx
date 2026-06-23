"use client";
// Connected-accounts panel reachable from the shell. Lists linked accounts with net
// worth / assets / owed summary, and routes to the per-account form or the connect
// chooser. Shared composed components live in @/components/composed.
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { usd0, initialOf } from "@/lib/format";
import { netWorth, assets, owed } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModalShell, ModalHeader } from "@/components/composed";

export function AccountsPanel() {
  const { s, closeModal, openModal } = useStore();
  const nw = netWorth(s);
  const totalAssets = assets(s);
  const totalOwed = owed(s);
  const count = s.accounts.length;

  return (
    <ModalShell onClose={closeModal} maxWidth={540}>
      <ModalHeader
        title="Connected accounts"
        sub={`${count} linked · net worth ${usd0(nw)}`}
      />

      <div className="mt-[18px] rounded-2xl border bg-gradient-to-b from-card to-secondary px-5 py-[18px]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[12.5px] tracking-[0.02em] text-muted-foreground">Total balance</div>
            <div className="tnum mt-0.5 font-serif text-[30px] font-medium tracking-[-0.02em]">{usd0(nw)}</div>
          </div>
          <div className="text-right text-xs text-muted-foreground/70">Across {count} accounts</div>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-px overflow-hidden rounded-[13px] border bg-border">
        <div className="bg-card px-4 py-[13px]">
          <div className="text-xs text-muted-foreground">Assets</div>
          <div className="tnum mt-0.5 text-lg font-semibold text-brand-green">{usd0(totalAssets)}</div>
        </div>
        <div className="bg-card px-4 py-[13px]">
          <div className="text-xs text-muted-foreground">Owed</div>
          <div className="tnum mt-0.5 text-lg font-semibold text-brand-warm">{usd0(totalOwed)}</div>
        </div>
      </div>

      <div className="mt-[18px] flex flex-col">
        {s.accounts.length === 0 ? (
          <div className="px-4 pt-[30px] pb-1.5 text-center">
            <div className="mx-auto max-w-[300px] text-[13.5px] leading-relaxed text-muted-foreground">
              No accounts linked yet. Connect one to auto-sync balances, or add it by hand below.
            </div>
          </div>
        ) : (
          s.accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => openModal({ kind: "account", accountId: a.id })}
              className="flex w-full items-center gap-[13px] border-t border-border/60 px-0.5 py-[13px] text-left first:border-t-0"
            >
              <div
                className="flex size-[38px] flex-none items-center justify-center rounded-[11px] text-[15px] font-semibold text-white opacity-90"
                style={{ background: a.color }}
              >
                {initialOf(a.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-medium text-foreground">{a.name}</div>
                <div className="text-xs text-muted-foreground/70">
                  {a.inst} · {a.type} ••{a.mask}
                </div>
                <div className="mt-[5px] flex">
                  {a.synced ? (
                    <span className="flex items-center gap-1 rounded-md bg-brand-green/10 px-2 py-0.5 text-[11px] font-semibold text-brand-green">
                      <Icon name="refresh" size={11} strokeWidth={2.4} />
                      {a.syncLabel}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-md bg-brand-amber/[0.12] px-2 py-0.5 text-[11px] font-semibold text-brand-gold">
                      <Icon name="edit" size={11} strokeWidth={2} />
                      {a.syncLabel}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn("tnum text-[14.5px] font-semibold", a.balance < 0 ? "text-brand-warm" : "text-foreground")}>
                {usd0(a.balance)}
              </span>
              <Icon name="chevronRight" size={16} strokeWidth={2.2} style={{ flex: "none" }} className="text-muted-foreground/60" />
            </button>
          ))
        )}
      </div>

      <Button
        onClick={() => openModal({ kind: "connect" })}
        className="mt-[18px] h-auto w-full gap-[7px] rounded-xl p-3 text-sm font-semibold"
      >
        <Icon name="plus" size={16} strokeWidth={2.4} />
        Connect an account
      </Button>
    </ModalShell>
  );
}
