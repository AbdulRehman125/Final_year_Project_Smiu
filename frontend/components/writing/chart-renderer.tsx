



























// "use client"

// // components/writing/chart-renderer.tsx
// // Renders Task 1 Academic chart_data natively — no images, no external
// // dependency on a DB/CDN. Supports: bar_chart, line_graph, pie_chart.
// // Colors use the shadcn CSS variables (hsl(var(--x))) so the chart
// // follows the app's light/dark theme automatically.
// //
// // IMPORTANT — Next.js + Recharts SSR fix:
// // Recharts' <ResponsiveContainer> measures its parent's DOM box to size
// // itself. On the server there is no DOM, so Next.js's server-rendered HTML
// // (and the first client render before hydration settles) can end up with
// // a 0-width/0-height container that never recovers until a window resize
// // fires. The fix is to only render the chart after the component has
// // mounted on the client (a one-render-tick delay), by which point the
// // real layout is available to measure. A lightweight skeleton is shown
// // in the meantime so the panel doesn't jump/flash empty.

// import { useEffect, useState } from "react"
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts"
// import { BarChart3 } from "lucide-react"
// import type { Task1ChartData } from "@/lib/writing-types"

// const CHART_HEIGHT = 300

// // Distinct, accessible palette — first two match the "Owned / Rented"
// // style comparison seen in the reference design (blue + slate).
// const SERIES_COLORS = [
//   "#3b82f6", // blue-500
//   "#64748b", // slate-500
//   "#f59e0b", // amber-500
//   "#10b981", // emerald-500
//   "#8b5cf6", // violet-500
// ]

// const AXIS_TICK_STYLE = { fontSize: 12, fill: "hsl(var(--muted-foreground))" }
// const TOOLTIP_STYLE = {
//   background: "hsl(var(--card))",
//   border: "1px solid hsl(var(--border))",
//   borderRadius: 8,
//   fontSize: 12,
//   color: "hsl(var(--foreground))",
// }

// function toRows(data: Task1ChartData) {
//   return data.categories.map((category, i) => {
//     const row: Record<string, string | number> = { category }
//     data.series.forEach((s) => {
//       row[s.name] = s.data[i] ?? 0
//     })
//     return row
//   })
// }

// function ChartTitle({ data }: { data: Task1ChartData }) {
//   if (!data.title) return null
//   return (
//     <div className="flex items-start gap-2 mb-3">
//       <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
//       <p className="text-sm font-medium text-foreground leading-snug">{data.title}</p>
//     </div>
//   )
// }

// // Fixed-height wrapper (not just the ResponsiveContainer prop) so the box
// // has a real, stable size for Recharts to measure against immediately —
// // this is the second half of the SSR-safety fix described above.
// function ChartBox({ children }: { children: React.ReactNode }) {
//   return (
//     <div style={{ width: "100%", height: CHART_HEIGHT }}>
//       <ResponsiveContainer width="100%" height="100%">
//         {children as any}
//       </ResponsiveContainer>
//     </div>
//   )
// }

// function BarChartView({ data }: { data: Task1ChartData }) {
//   const rows = toRows(data)
//   return (
//     <ChartBox>
//       <BarChart data={rows} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
//         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//         <XAxis dataKey="category" tick={AXIS_TICK_STYLE} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
//         <YAxis tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} unit={data.unit} width={48} />
//         <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(var(--muted))" }} />
//         <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
//         {data.series.map((s, i) => (
//           <Bar
//             key={s.name}
//             dataKey={s.name}
//             fill={SERIES_COLORS[i % SERIES_COLORS.length]}
//             radius={[4, 4, 0, 0]}
//             animationDuration={600}
//           />
//         ))}
//       </BarChart>
//     </ChartBox>
//   )
// }

// function LineChartView({ data }: { data: Task1ChartData }) {
//   const rows = toRows(data)
//   return (
//     <ChartBox>
//       <LineChart data={rows} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
//         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//         <XAxis dataKey="category" tick={AXIS_TICK_STYLE} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
//         <YAxis tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} unit={data.unit} width={48} />
//         <Tooltip contentStyle={TOOLTIP_STYLE} />
//         <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
//         {data.series.map((s, i) => (
//           <Line
//             key={s.name}
//             type="monotone"
//             dataKey={s.name}
//             stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
//             strokeWidth={2.5}
//             dot={{ r: 3 }}
//             activeDot={{ r: 5 }}
//             animationDuration={600}
//           />
//         ))}
//       </LineChart>
//     </ChartBox>
//   )
// }

// function PieChartView({ data }: { data: Task1ChartData }) {
//   const series = data.series[0]
//   if (!series) return null
//   const rows = data.categories.map((name, i) => ({ name, value: series.data[i] ?? 0 }))

//   return (
//     <ChartBox>
//       <PieChart>
//         <Pie
//           data={rows}
//           dataKey="value"
//           nameKey="name"
//           cx="50%"
//           cy="45%"
//           outerRadius={95}
//           label={(props: any) => `${props.name}: ${props.value}${data.unit ?? ""}`}
//           labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
//           animationDuration={600}
//         >
//           {rows.map((_, i) => (
//             <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip contentStyle={TOOLTIP_STYLE} />
//         <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
//       </PieChart>
//     </ChartBox>
//   )
// }

// function ChartSkeleton() {
//   return (
//     <div
//       className="w-full rounded-lg bg-muted/40 animate-pulse"
//       style={{ height: CHART_HEIGHT }}
//     />
//   )
// }

// export function ChartRenderer({ data }: { data: Task1ChartData | null | undefined }) {
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   if (!data) return null

//   // Stable key per question so Recharts fully remounts (not just re-renders)
//   // when a new question loads — avoids stale internal chart state.
//   const chartKey = `${data.chart_type}-${data.title}-${data.categories.join(",")}`

//   return (
//     <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
//       <ChartTitle data={data} />
//       {!mounted ? (
//         <ChartSkeleton />
//       ) : (
//         <div key={chartKey}>
//           {data.chart_type === "bar_chart" && <BarChartView data={data} />}
//           {data.chart_type === "line_graph" && <LineChartView data={data} />}
//           {data.chart_type === "pie_chart" && <PieChartView data={data} />}
//         </div>
//       )}
//     </div>
//   )
// }



































"use client"

// components/writing/chart-renderer.tsx
// Renders Task 1 Academic chart_data natively — no images, no external
// dependency on a DB/CDN. Supports: bar_chart, line_graph, pie_chart.
// Colors use the shadcn CSS variables (hsl(var(--x))) so the chart
// follows the app's light/dark theme automatically.
//
// IMPORTANT — Next.js + Recharts SSR fix:
// Recharts' <ResponsiveContainer> measures its parent's DOM box to size
// itself. On the server there is no DOM, so Next.js's server-rendered HTML
// (and the first client render before hydration settles) can end up with
// a 0-width/0-height container that never recovers until a window resize
// fires. The fix is to only render the chart after the component has
// mounted on the client (a one-render-tick delay), by which point the
// real layout is available to measure. A lightweight skeleton is shown
// in the meantime so the panel doesn't jump/flash empty.

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BarChart3 } from "lucide-react"
import type { Task1ChartData } from "@/lib/writing-types"

const CHART_HEIGHT = 300

// Distinct, accessible palette — first two match the "Owned / Rented"
// style comparison seen in the reference design (blue + slate).
const SERIES_COLORS = [
  "#3b82f6", // blue-500
  "#64748b", // slate-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
]

const AXIS_TICK_STYLE = { fontSize: 12, fill: "hsl(var(--muted-foreground))" }
const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
}

function toRows(data: Task1ChartData) {
  return data.categories.map((category, i) => {
    const row: Record<string, string | number> = { category }
    data.series.forEach((s) => {
      row[s.name] = s.data[i] ?? 0
    })
    return row
  })
}

// Compact axis tick formatter — e.g. 50000 -> "50k". Keeps Y-axis ticks
// short and stable-width regardless of the unit's actual name, since the
// full unit is shown once in the subtitle instead of repeated per tick
// (repeating a multi-word unit like "thousand people" on every tick is
// what caused the earlier clipped/wrapped-label bug).
function formatAxisNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${+(value / 1_000).toFixed(1)}k`
  return `${value}`
}

function ChartTitle({ data }: { data: Task1ChartData }) {
  if (!data.title) return null
  return (
    <div className="flex items-start gap-2 mb-3">
      <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground leading-snug">{data.title}</p>
        {data.unit && (
          <p className="text-xs text-muted-foreground mt-0.5">Values shown in {data.unit}</p>
        )}
      </div>
    </div>
  )
}

// Fixed-height wrapper (not just the ResponsiveContainer prop) so the box
// has a real, stable size for Recharts to measure against immediately —
// this is the second half of the SSR-safety fix described above.
function ChartBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as any}
      </ResponsiveContainer>
    </div>
  )
}

function BarChartView({ data }: { data: Task1ChartData }) {
  const rows = toRows(data)
  return (
    <ChartBox>
      <BarChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="category" tick={AXIS_TICK_STYLE} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
        <YAxis
          tick={AXIS_TICK_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxisNumber}
          width={44}
        />
        {/* <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "hsl(var(--muted))" }}
          formatter={(value: number) => `${value.toLocaleString()}${data.unit ? ` ${data.unit}` : ""}`}
        /> */}

        <Tooltip
  contentStyle={TOOLTIP_STYLE}
  cursor={{ fill: "hsl(var(--muted))" }}
  formatter={(value) => {
    const formatted =
      typeof value === "number"
        ? value.toLocaleString()
        : String(value ?? "")

    return `${formatted}${data.unit ? ` ${data.unit}` : ""}`
  }}
/>
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {data.series.map((s, i) => (
          <Bar
            key={s.name}
            dataKey={s.name}
            fill={SERIES_COLORS[i % SERIES_COLORS.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={600}
          />
        ))}
      </BarChart>
    </ChartBox>
  )
}

function LineChartView({ data }: { data: Task1ChartData }) {
  const rows = toRows(data)
  return (
    <ChartBox>
      <LineChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="category" tick={AXIS_TICK_STYLE} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
        <YAxis
          tick={AXIS_TICK_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxisNumber}
          width={44}
        />
        {/* <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => `${value.toLocaleString()}${data.unit ? ` ${data.unit}` : ""}`}
        /> */}

        <Tooltip
  contentStyle={TOOLTIP_STYLE}
  formatter={(value) => {
    const formatted =
      typeof value === "number"
        ? value.toLocaleString()
        : String(value ?? "")

    return [formatted + (data.unit ? ` ${data.unit}` : ""), ""]
  }}
/>
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        {data.series.map((s, i) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={600}
          />
        ))}
      </LineChart>
    </ChartBox>
  )
}

function PieChartView({ data }: { data: Task1ChartData }) {
  const series = data.series[0]
  if (!series) return null
  const rows = data.categories.map((name, i) => ({ name, value: series.data[i] ?? 0 }))
  // Only inline short units (%, °C) on slice labels — long units (e.g.
  // "thousand people") are already shown once in the chart subtitle,
  // repeating them per-slice caused overlapping/cut-off label text.
  const inlineUnit = data.unit && data.unit.length <= 3 ? data.unit : ""

  return (
    <ChartBox>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={95}
          label={(props: any) => `${props.name}: ${props.value}${inlineUnit}`}
          labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
          animationDuration={600}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
          ))}
        </Pie>
        {/* <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value: number) => `${value.toLocaleString()}${data.unit ? ` ${data.unit}` : ""}`}
        /> */}

        <Tooltip
  contentStyle={TOOLTIP_STYLE}
  formatter={(value) => {
    const formatted =
      typeof value === "number"
        ? value.toLocaleString()
        : String(value ?? "")

    return [formatted + (data.unit ? ` ${data.unit}` : ""), ""]
  }}
/>
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
      </PieChart>
    </ChartBox>
  )
}

function ChartSkeleton() {
  return (
    <div
      className="w-full rounded-lg bg-muted/40 animate-pulse"
      style={{ height: CHART_HEIGHT }}
    />
  )
}

export function ChartRenderer({ data }: { data: Task1ChartData | null | undefined }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!data) return null

  // Stable key per question so Recharts fully remounts (not just re-renders)
  // when a new question loads — avoids stale internal chart state.
  const chartKey = `${data.chart_type}-${data.title}-${data.categories.join(",")}`

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <ChartTitle data={data} />
      {!mounted ? (
        <ChartSkeleton />
      ) : (
        <div key={chartKey}>
          {data.chart_type === "bar_chart" && <BarChartView data={data} />}
          {data.chart_type === "line_graph" && <LineChartView data={data} />}
          {data.chart_type === "pie_chart" && <PieChartView data={data} />}
        </div>
      )}
    </div>
  )
}