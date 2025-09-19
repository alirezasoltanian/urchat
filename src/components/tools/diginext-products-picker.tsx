"use client";
import { useMemo, useState } from "react";
import ReModal from "../reuseable/re-modal";
import { Button } from "../ui/button";
import { ChatTools } from "@/types";

type Row = { id: string; name: string; sku: string; priceCents: number };

export default function DiginextProductsPicker({
  tool,
}: {
  tool: ChatTools["diginextProducts"];
}) {
  const rows: Row[] = tool.output?.products ?? [];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  return (
    <ReModal
      onOpenChange={setOpen}
      open={open}
      title="انتخاب محصولات"
      renderButton={() => (
        <Button variant="outline" size="sm">
          انتخاب محصولات
        </Button>
      )}
    >
      <div className="overflow-x-auto">
        <div className="overflow-x-auto max-h-[80vh]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start border-b">
                <th className="p-2">شماره</th>

                <th className="p-2">انتخاب</th>
                <th className="p-2">نام</th>
                <th className="p-2">SKU</th>
                <th className="p-2">قیمت (تومان)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={r.id} className="border-b hover:bg-accent/40">
                  <td className="p-2">{index + 1}</td>

                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [r.id]: e.target.checked }))
                      }
                    />
                  </td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.sku}</td>
                  <td className="p-2">
                    {(r.priceCents / 100).toLocaleString("fa-IR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 ">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            بستن
          </Button>
          <Button
            onClick={() => {
              // fire a custom event so parent can read selected ids
              const event = new CustomEvent("diginext:products:selected", {
                detail: { ids: selectedIds },
              });
              window.dispatchEvent(event);
              setOpen(false);
            }}
            disabled={selectedIds.length === 0}
          >
            تایید ({selectedIds.length})
          </Button>
        </div>
      </div>
    </ReModal>
  );
}
