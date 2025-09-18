"use client";
import { useMemo, useState } from "react";
import ReModal from "../reuseable/re-modal";
import { Button } from "../ui/button";
import { ChatTools } from "@/types";

type Row = { id: string; fullName: string; email: string };

export default function DiginextCustomersPicker({
  tool,
}: {
  tool: ChatTools["diginextCustomers"];
}) {
  const rows: Row[] = tool.output?.customers ?? [];
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
      title="انتخاب مشتری‌ها"
      renderButton={() => (
        <Button variant="outline" size="sm">
          انتخاب مشتری
        </Button>
      )}
    >
      <div className="overflow-x-auto">
        <div className="overflow-auto max-h-[80vh]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">انتخاب</th>
                <th className="p-2">نام</th>
                <th className="p-2">ایمیل</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b hover:bg-accent/40">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [r.id]: e.target.checked }))
                      }
                    />
                  </td>
                  <td className="p-2">{r.fullName}</td>
                  <td className="p-2">{r.email}</td>
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
              const event = new CustomEvent("diginext:customers:selected", {
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
