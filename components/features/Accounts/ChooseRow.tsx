"use client";
// Big choice row used by the connect chooser (Plaid / manual / CSV).
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export function ChooseRow({
  iconName,
  iconClass,
  title,
  desc,
  onClick,
}: {
  iconName: Parameters<typeof Icon>[0]["name"];
  iconClass: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-[13px] rounded-[15px] border bg-secondary p-[18px] text-left"
    >
      <div className={cn("flex size-10 flex-none items-center justify-center rounded-[11px]", iconClass)}>
        <Icon name={iconName} size={20} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-foreground">{title}</div>
        <div className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{desc}</div>
      </div>
      <Icon name="chevronRight" size={17} strokeWidth={2.2} style={{ flex: "none", marginTop: 3 }} className="text-muted-foreground/60" />
    </button>
  );
}
