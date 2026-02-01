"use client";

export function Section(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-base-100 border border-base-300 p-5">
      <div className="flex flex-col gap-1">
        <div className="text-lg font-semibold">{props.title}</div>
        {props.subtitle ? <div className="text-sm text-base-content/70">{props.subtitle}</div> : null}
      </div>
      <div className="mt-4">{props.children}</div>
    </div>
  );
}
