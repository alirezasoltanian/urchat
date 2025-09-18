"use client";
import { memo, useMemo, useState, type FC } from "react";
import ReModal from "../reuseable/re-modal";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as RBarChart,
  Bar,
  Legend,
} from "recharts";
import { ChatTools, InvoiceStatus } from "@/types";

type Row = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerEmail?: string | null;
  totalCents: number;
  productsCount?: number;
  issuedAt?: string;
  status?: InvoiceStatus;
};

export default function DiginextInvoicesView({
  tool,
}: {
  tool: ChatTools["diginextCreateInvoices"] | ChatTools["diginextListInvoices"];
}) {
  const created = (tool.output?.created ?? []) as any[];
  const updated = (tool.output?.updated ?? []) as any[];
  const errors: string[] = tool.output?.errors ?? [];
  const rows: Row[] = useMemo(() => {
    const all = [...updated, ...created];
    return all.map((r) => ({
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      customerId: r.customerId,
      customerEmail: r.customerEmail ?? null,
      totalCents: r.totalCents,
      productsCount: r.productsCount,
      issuedAt: r.issuedAt,
      status: r.status as InvoiceStatus | undefined,
    }));
  }, [updated, created]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showCharts, setShowCharts] = useState<boolean>(
    Boolean((tool as any)?.input?.isChart) || false
  );

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const onConfirm = () => {
    const event = new CustomEvent("diginext:invoices:selected", {
      detail: { ids: selectedIds },
    });
    window.dispatchEvent(event);
    setOpen(false);
  };

  // charts data
  const dailySeries = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (!r.issuedAt) continue;
      const d = new Date(r.issuedAt);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        .toISOString()
        .slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + r.totalCents / 100);
    }
    const entries = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, value]) => ({ date, value }));
    return entries;
  }, [rows]);

  const weeklyCompare = useMemo(() => {
    // compare last two full weeks by weekday
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const start = new Date(end);
    start.setDate(end.getDate() - 14);
    const weekA = new Array(7).fill(0) as number[]; // earlier week
    const weekB = new Array(7).fill(0) as number[]; // recent week
    for (const r of rows) {
      if (!r.issuedAt) continue;
      const d = new Date(r.issuedAt);
      if (d < start || d >= end) continue;
      const weekday = d.getDay(); // 0..6
      const amount = r.totalCents / 100;
      if (d < new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        weekA[weekday] += amount;
      } else {
        weekB[weekday] += amount;
      }
    }
    return { weekA, weekB };
  }, [rows]);

  const weekdayFa = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
    "شنبه",
  ];

  const statusConfig: Record<
    InvoiceStatus,
    {
      label: string;
      variant?: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }
  > = {
    draft: {
      label: "پیش‌نویس",
      variant: "outline",
      className: "text-muted-foreground",
    },
    issued: {
      label: "صادر شده",
      className: "bg-blue-500 text-white border-transparent",
    },
    paid: {
      label: "پرداخت شده",
      className: "bg-emerald-500 text-white border-transparent",
    },
    void: {
      label: "باطل",
      variant: "destructive",
    },
  };

  const LineChartBase: FC<{
    data: { date: string; value: number }[];
  }> = ({ data }) => {
    if (data.length === 0)
      return (
        <div className="text-xs text-muted-foreground">
          داده‌ای برای نمایش نمودار درآمدی وجود ندارد.
        </div>
      );
    return (
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RLineChart
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.toLocaleString("fa-IR")}
            />
            <Tooltip
              formatter={(v: any) =>
                (Number(v) as number).toLocaleString("fa-IR")
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </RLineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  const LineChart = memo(LineChartBase);

  const BarCompareChartBase: FC<{
    a: number[];
    b: number[];
    labels: string[];
  }> = ({ a, b, labels }) => {
    const data = useMemo(
      () =>
        labels.map((label, i) => ({
          label,
          هفته_قبل: a[i] ?? 0,
          این_هفته: b[i] ?? 0,
        })),
      [labels, a, b]
    );
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RBarChart
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.toLocaleString("fa-IR")}
            />
            <Tooltip
              formatter={(v: any) =>
                (Number(v) as number).toLocaleString("fa-IR")
              }
            />
            <Legend />
            <Bar dataKey="هفته_قبل" fill="#60a5fa" isAnimationActive={false} />
            <Bar dataKey="این_هفته" fill="#34d399" isAnimationActive={false} />
          </RBarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  const BarCompareChart = memo(BarCompareChartBase);

  return (
    <>
      {!showCharts && (
        <ReModal
          title="فاکتورهای ایجاد شده"
          open={open}
          onOpenChange={setOpen}
          renderButton={() => (
            <Button variant="outline" size="sm">
              نمایش فاکتورهای ایجاد شده
            </Button>
          )}
        >
          <div className="overflow-x-auto">
            <div className="overflow-x-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">
                  {rows.length} فاکتور
                </div>
                {/* <div className="flex items-center gap-2">
                  <Button
                    variant={showCharts ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCharts(true)}
                  >
                    نمایش نمودار/گزارش
                  </Button>
                </div> */}
              </div>
              {errors.length > 0 && (
                <div className="mb-3 text-sm text-red-600">
                  {errors.map((e, i) => (
                    <div key={i}>• {e}</div>
                  ))}
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">انتخاب</th>
                    <th className="p-2">کد فاکتور</th>
                    <th className="p-2">مشتری</th>
                    <th className="p-2">ایمیل</th>
                    <th className="p-2">وضعیت</th>

                    <th className="p-2">تعداد اقلام</th>
                    <th className="p-2">مبلغ (تومان)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((inv) => (
                    <tr key={inv.id} className="border-b">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={!!selected[inv.id]}
                          onChange={(e) =>
                            setSelected((s) => ({
                              ...s,
                              [inv.id]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td className="p-2">{inv.invoiceNumber}</td>
                      <td className="p-2">{inv.customerId}</td>
                      <td className="p-2">{inv.customerEmail ?? "—"}</td>
                      <td className="p-2">
                        {inv.status ? (
                          <Badge
                            variant={statusConfig[inv.status].variant}
                            className={statusConfig[inv.status].className}
                          >
                            {statusConfig[inv.status].label}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2">{inv.productsCount ?? "—"}</td>
                      <td className="p-2">
                        {(inv.totalCents / 100).toLocaleString("fa-IR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                بستن
              </Button>
              <Button onClick={onConfirm} disabled={selectedIds.length === 0}>
                تایید ({selectedIds.length})
              </Button>
            </div>
          </div>
        </ReModal>
      )}
      {showCharts && (
        <div className="grid grid-cols-1 gap-4 mb-4 mt-4 w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                نمودار درآمدی (روزانه)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={dailySeries} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                مقایسه هفتگی (روزهای مشابه)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarCompareChart
                a={weeklyCompare.weekA}
                b={weeklyCompare.weekB}
                labels={weekdayFa}
              />
            </CardContent>
          </Card>
          <Separator />
        </div>
      )}
    </>
  );
}
