"use client";
// "Bills & subscriptions" screen — a reminder banner for anything due soon, an empty
// state when no bills exist, otherwise the list of bills with paid/unpaid status and
// a mark-paid / undo toggle. Reads s.bills.
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/store";
import { usd0 } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/composed";
import { Button } from "@/components/ui/button";

export default function Bills() {
  const { s, dispatch, openModal, showToast } = useStore();

  const billsTotal = s.bills.reduce((a, b) => a + b.amount, 0);
  const soon = s.bills.filter((b) => b.soon && !b.paid);
  const soonSum = soon.reduce((a, b) => a + b.amount, 0);
  const billsNone = s.bills.length === 0;

  return (
    <div>
      <div className="text-[13px] text-muted-foreground">{usd0(billsTotal)} recurring each month</div>
      <h1 className="mt-1 font-serif text-[34px] font-normal tracking-[-0.02em]">Bills &amp; subscriptions</h1>

      {soon.length > 0 && (
        <div className="mt-[22px] flex items-center gap-[13px] rounded-2xl border border-brand-amber/25 bg-brand-amber/[0.09] px-5 py-4">
          <div className="flex size-[34px] flex-none items-center justify-center rounded-[10px] bg-brand-amber/[0.16] text-brand-amber">
            <Icon name="bell" size={18} strokeWidth={2} />
          </div>
          <div className="flex-1 text-sm leading-normal text-foreground/80">
            <strong>
              {soon.length} {soon.length === 1 ? "bill is" : "bills are"} due soon
            </strong>{" "}
            <span className="text-muted-foreground">{usd0(soonSum)} coming due.</span>
          </div>
        </div>
      )}

      {billsNone && (
        <Card className="mt-[22px] px-9 py-12 text-center">
          <div className="mx-auto flex size-[52px] items-center justify-center rounded-[15px] bg-brand-amber/[0.12] text-brand-amber">
            <Icon name="bell" size={25} strokeWidth={1.9} />
          </div>
          <h2 className="mt-[18px] font-serif text-2xl font-medium">No bills or subscriptions yet</h2>
          <p className="mx-auto mt-2 max-w-[430px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
            Connect an account and I&apos;ll spot recurring charges automatically — rent, utilities, streaming and more — so a payment never slips past you.
          </p>
          <Button
            onClick={() => openModal({ kind: "connect" })}
            className="mt-5 inline-flex h-auto gap-[7px] rounded-[10px] px-[18px] py-[11px] text-sm font-semibold"
          >
            <Icon name="plus" size={16} strokeWidth={2.4} />
            Connect an account
          </Button>
        </Card>
      )}

      {!billsNone && (
        <Card className="mt-[18px] px-6 py-2">
          {s.bills.map((b) => {
            const dueSoon = b.soon && !b.paid;
            return (
              <div key={b.id} className="flex items-center gap-3.5 border-t border-border/60 py-[15px] first:border-t-0">
                <div
                  className={cn(
                    "flex size-9 flex-none items-center justify-center rounded-[10px]",
                    b.paid ? "bg-brand-green/[0.12] text-brand-green" : "bg-foreground/[0.06] text-muted-foreground/70"
                  )}
                >
                  {b.paid ? <Icon name="check" size={16} strokeWidth={2.2} /> : <Icon name="card" size={16} strokeWidth={1.8} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-medium">{b.name}</span>
                    {(b.paid || dueSoon) && (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10.5px] font-bold tracking-[0.02em] whitespace-nowrap",
                          b.paid ? "bg-brand-green/[0.12] text-brand-green" : "bg-brand-amber/[0.14] text-brand-amber"
                        )}
                      >
                        {b.paid ? "Paid" : "Due soon"}
                      </span>
                    )}
                  </div>
                  <div className="mt-px text-xs text-muted-foreground/70">
                    {b.kind} · due {b.due}
                  </div>
                </div>
                <span className="tnum w-[76px] text-right text-[14.5px] font-semibold">{usd0(b.amount)}</span>
                {b.paid ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      dispatch({ t: "toggleBill", id: b.id });
                      showToast(`${b.name} marked unpaid`);
                    }}
                    className="h-auto flex-none rounded-[9px] border-foreground/15 px-3.5 py-2 text-[12.5px] font-medium text-muted-foreground"
                  >
                    Undo
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      dispatch({ t: "toggleBill", id: b.id });
                      showToast(`${b.name} marked paid`);
                    }}
                    className="h-auto flex-none rounded-[9px] px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap"
                  >
                    Mark paid
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
