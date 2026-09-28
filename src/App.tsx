import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  groups,
  labGroups,
  packages,
  patientFields,
  patientRecords,
  type Group,
  type PatientRecord,
} from "./data"
import Dashboard from "./Dashboard"

const STORAGE_KEY = "tmmc-phieu-chi-dinh"
const SUBMITTED_STORAGE_KEY = "tmmc-phieu-chi-dinh-submitted"
const ROLE_STORAGE_KEY = "tmmc-phieu-chi-dinh-role"

type Role = "staff" | "doctor"
type AppView = "dashboard" | "prescription"

function roleFromSearch(search: string): Role | null {
  const role = new URLSearchParams(search).get("role")
  return role === "staff" || role === "doctor" ? role : null
}

function loadRole(): Role | null {
  try {
    const linkedRole = roleFromSearch(window.location.search)
    if (linkedRole) return linkedRole

    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY)
    return savedRole === "staff" || savedRole === "doctor" ? savedRole : null
  } catch {
    return null
  }
}

function viewFromPath(pathname: string): AppView {
  return pathname.toLowerCase().startsWith("/prescription")
    ? "prescription"
    : "dashboard"
}

function pathForView(view: AppView): string {
  return view === "prescription" ? "/prescription" : "/dashboard"
}

type FormState = {
  patient: Record<string, string>
  flags: { bhyt: boolean service: boolean reexam: boolean }
  priority: "urgent" | "normal" | null
  diagnosis: string
  selected: string[]
  contrast: Record<string, boolean>
  notes: Record<string, string>
  returnEmail: string
  returnAddress: string
  staffName: string
  doctorName: string
  submittedAt: number | null
}

const emptyForm: FormState = {
  patient: {},
  flags: { bhyt: false, service: false, reexam: false },
  priority: null,
  diagnosis: "",
  selected: [],
  contrast: {},
  notes: {},
  returnEmail: "",
  returnAddress: "",
  staffName: "",
  doctorName: "",
  submittedAt: null,
}

function loadForm(): FormState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...emptyForm, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return emptyForm
}

function loadSubmittedForm(): FormState | null {
  try {
    const submittedRaw = localStorage.getItem(SUBMITTED_STORAGE_KEY)
    if (submittedRaw) return { ...emptyForm, ...JSON.parse(submittedRaw) }

    // Migrate a pending form saved before submitted drafts were separated.
    const draftRaw = localStorage.getItem(STORAGE_KEY)
    if (draftRaw) {
      const draft = { ...emptyForm, ...JSON.parse(draftRaw) }
      if (draft.submittedAt) return draft
    }
  } catch {
    /* ignore */
  }
  return null
}

const norm = (s: string) =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")

const normalizePhone = (phone: string) => phone.replace(/\D/g, "")

const allGroups = [...groups, ...labGroups, ...packages]

function buildSummary(
  selected: Set<string>,
  contrast: Record<string, boolean>,
  notes: Record<string, string>,
) {
  return allGroups
    .map((g) => ({
      title: g.vi,
      items: g.choices
        .filter((c) => selected.has(c.id))
        .map((c) => ({
          ...c,
          text: c.freetext ? notes[c.id]?.trim() || "" : "",
        })),
      contrast: g.toggle ? contrast[g.id] : undefined,
    }))
    .filter((g) => g.items.length > 0)
}

function Highlight({ text, query }: { text: string query: string }) {
  if (!query) return <>{text}</>
  const nText = norm(text)
  const nQ = norm(query)
  const i = nText.indexOf(nQ)
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-brand-mid/20 px-0.5 text-brand-deep">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  )
}

function Check({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
        checked
          ? "border-brand bg-brand text-white"
          : "border-line bg-white group-hover:border-brand-mid"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
          <path
            d="M2.5 6.2 5 8.6l4.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

function Panel({
  group,
  selected,
  toggle,
  contrast,
  onContrast,
  query,
  notes,
  setNote,
}: {
  group: Group
  selected: Set<string>
  toggle: (id: string) => void
  contrast?: boolean
  onContrast?: () => void
  query: string
  notes: Record<string, string>
  setNote: (id: string, v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const visible = query
    ? group.choices.filter((c) => norm(c.vi).includes(norm(query)))
    : group.choices
  if (visible.length === 0) return null
  const expanded = open || !!query
  const count = group.choices.reduce(
    (n, c) => n + (selected.has(c.id) ? 1 : 0),
    0,
  )
  return (
    <section className="flex break-inside-avoid flex-col overflow-hidden rounded-lg border border-line bg-white shadow-[0_1px_2px_rgba(20,33,61,0.04)]">
      <header className="flex items-center gap-2 bg-brand px-3.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left text-white"
          aria-expanded={expanded}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 shrink-0 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path
              d="m9 6 6 6-6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="flex items-baseline gap-2">
            <span className="text-[13px] font-bold uppercase tracking-wide">
              {group.vi}
            </span>
            {group.en && (
              <span className="text-[11px] font-medium text-white/70">
                | {group.en}
              </span>
            )}
          </span>
          {count > 0 && (
            <span className="ml-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 font-mono text-[11px] font-semibold text-brand">
              {count}
            </span>
          )}
        </button>
        {group.toggle && (
          <button
            type="button"
            onClick={onContrast}
            className={`flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              contrast
                ? "bg-white text-brand"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <Check checked={!!contrast} />
            {group.toggle.vi}
          </button>
        )}
      </header>
      <div className={`p-3.5 ${expanded ? "" : "hidden"}`}>
        <ul
          className={`grid gap-x-4 gap-y-1.5 ${
            group.columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {visible.map((c) => {
            const on = selected.has(c.id)
            return (
              <li
                key={c.id}
                className={c.freetext && on ? "sm:col-span-2" : undefined}
              >
                <label className="group flex cursor-pointer items-center gap-2 rounded py-0.5 text-[13px] leading-snug">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => toggle(c.id)}
                  />
                  <Check checked={on} />
                  <span
                    className={on ? "font-medium text-ink" : "text-ink-soft"}
                  >
                    <Highlight text={c.vi} query={query} />
                  </span>
                </label>
                {c.freetext && on && (
                  <input
                    type="text"
                    autoFocus
                    value={notes[c.id] || ""}
                    onChange={(e) => setNote(c.id, e.target.value)}
                    placeholder="Nhập nội dung…"
                    className="mt-1 ml-[23px] h-8 w-[calc(100%-23px)] rounded-md border border-brand-mid/40 bg-brand-tint/40 px-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-brand-mid focus:bg-white focus:ring-2 focus:ring-brand-mid/20"
                  />
                )}
              </li>
            )
          })}
        </ul>
        {group.hint && (
          <p className="mt-2.5 border-t border-dashed border-line pt-2 text-[11px] italic text-ink-soft/80">
            {group.hint}
          </p>
        )}
      </div>
    </section>
  )
}

function Field({
  vi,
  en,
  span,
  value,
  onChange,
  readOnly,
}: {
  vi: string
  en: string
  span: number
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
}) {
  const spanClass =
    span === 3
      ? "md:col-span-3"
      : span === 2
        ? "md:col-span-2"
        : "md:col-span-1"
  return (
    <div className={`flex flex-col gap-1 ${spanClass}`}>
      <label className="flex items-baseline gap-1.5 text-[12px]">
        <span className="font-semibold text-ink">{vi}</span>
        <span className="text-[11px] text-ink-soft">/ {en}</span>
      </label>
      {readOnly ? (
        <div className="flex min-h-9 items-center rounded-md border border-line bg-ground/60 px-3 py-1.5 text-[13px] font-medium text-ink">
          {value || <span className="text-ink-soft/50">—</span>}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-9 rounded-md border border-line bg-brand-tint/40 px-3 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-brand-mid focus:bg-white focus:ring-2 focus:ring-brand-mid/20"
        />
      )}
    </div>
  )
}

function PatientHistoryCard({
  record,
  onUse,
}: {
  record: PatientRecord
  onUse: () => void
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-brand-mid/30 bg-brand-tint/30">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-mid/20 bg-white/70 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ok/10 text-ok">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="m5 12 4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-brand">
                Hồ sơ khám bệnh trước đây
              </h3>
              <p className="text-[11px] text-ink-soft">
                Đã tìm thấy theo số điện thoại {record.phone}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onUse}
          className="rounded-md bg-brand px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Dùng thông tin hồ sơ
        </button>
      </header>

      <div className="grid gap-3 border-b border-brand-mid/20 px-4 py-3 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Mã bệnh nhân", record.id],
          ["Họ tên", record.name],
          ["Ngày sinh", record.dob],
          ["BHYT", record.bhyt],
          ["Địa chỉ", record.address],
        ].map(([label, value], index) => (
          <div key={label} className={index === 4 ? "sm:col-span-2" : ""}>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
              {label}
            </div>
            <div className="mt-0.5 font-medium text-ink">{value}</div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          Lịch sử khám gần nhất
        </p>
        <div className="flex flex-col gap-2">
          {record.visits.map((visit, index) => (
            <article
              key={`${visit.date}-${visit.service}-${index}`}
              className="grid gap-2 rounded-md border border-line bg-white p-3 text-[12px] md:grid-cols-[100px_1fr_1.4fr]"
            >
              <div>
                <div className="font-mono font-semibold text-brand">
                  {visit.date}
                </div>
                <div className="mt-0.5 text-[10px] text-ink-soft">
                  {visit.department}
                </div>
              </div>
              <div>
                <div className="font-semibold text-ink">{visit.service}</div>
                <div className="mt-0.5 text-[11px] text-ink-soft">
                  {visit.doctor}
                </div>
              </div>
              <div className="leading-relaxed text-ink-soft">
                {visit.diagnosis}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function balance(items: Group[], cols: number): Group[][] {
  const columns: Group[][] = Array.from({ length: cols }, () => [])
  const heights = new Array(cols).fill(0)
  for (const g of items) {
    const i = heights.indexOf(Math.min(...heights))
    columns[i].push(g)
    heights[i] += g.choices.length + 3
  }
  return columns
}

function BalancedColumns(props: {
  items: Group[]
  cols?: number
  selected: Set<string>
  toggle: (id: string) => void
  query: string
  contrast: Record<string, boolean>
  onContrast: (id: string) => void
  notes: Record<string, string>
  setNote: (id: string, v: string) => void
}) {
  const {
    items,
    cols = 2,
    selected,
    toggle,
    query,
    contrast,
    onContrast,
    notes,
    setNote,
  } = props
  return (
    <div className="flex flex-col gap-5 md:flex-row">
      {balance(items, cols).map((col, i) => (
        <div key={i} className="flex flex-1 flex-col gap-5">
          {col.map((g) => (
            <Panel
              key={g.id}
              group={g}
              selected={selected}
              toggle={toggle}
              query={query}
              contrast={contrast[g.id]}
              onContrast={() => onContrast(g.id)}
              notes={notes}
              setNote={setNote}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function HospitalHeader() {
  return (
    <header className="mb-5 flex flex-col gap-4 rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(20,33,61,0.04)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />
            <path
              d="M9 12h2l1-2 1.5 3 1-1h1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-extrabold uppercase leading-tight tracking-wide text-brand">
            Bệnh viện Đa khoa Tâm Trí Sài Gòn
          </p>
          <p className="text-[12px] text-ink-soft">
            171/3 Trường Chinh, P. Đông Hưng Thuận, TP. HCM
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-[12px] text-ink-soft md:text-right">
        <span>
          <span className="font-semibold text-ink">f.</span> (84) 28 6260 1100
        </span>
        <span>
          <span className="font-semibold text-ink">e.</span>{" "}
          info.d12@tmmchealthcare.com
        </span>
        <a
          className="font-mono text-[11px] text-brand-mid hover:underline"
          href="https://bvtamtrisaigon.com.vn/"
        >
          bvtamtrisaigon.com.vn
        </a>
      </div>
    </header>
  )
}

/* ---------- Role landing screen ---------- */
function RoleGate({
  onPick,
  pending,
  patientName,
}: {
  onPick: (r: Role) => void
  pending: boolean
  patientName: string
}) {
  const cards: {
    role: Role
    title: string
    en: string
    desc: string
    icon: ReactNode
  }[] = [
    {
      role: "staff",
      title: "Nhân viên tiếp nhận",
      en: "Receiving staff",
      desc: "Nhập thông tin bệnh nhân và chọn các chỉ định cận lâm sàng.",
      icon: (
        <path
          d="M4 20a8 8 0 0 1 16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      role: "doctor",
      title: "Bác sĩ chỉ định",
      en: "Indicating doctor",
      desc: "Xem lại thông tin & chỉ định nhân viên đã lập, xác nhận và ký duyệt.",
      icon: (
        <>
          <path
            d="M4 20a8 8 0 0 1 12.5-6.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m15 18 2 2 4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ),
    },
  ]
  return (
    <div className="mx-auto max-w-[880px] px-4 py-8 md:py-14">
      <HospitalHeader />
      <div className="rounded-xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(20,33,61,0.04)] md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-brand">
            Phiếu chỉ định
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Chọn vai trò để bắt đầu · Choose your role
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((c) => {
            const notify = c.role === "doctor" && pending
            const available = c.role === "staff" || pending
            return (
              <button
                key={c.role}
                type="button"
                disabled={!available}
                onClick={() => available && onPick(c.role)}
                className={`group relative flex flex-col items-start gap-4 rounded-xl border p-6 text-left transition-all ${
                  available
                    ? "hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(20,33,61,0.08)]"
                    : "cursor-not-allowed opacity-60"
                } ${
                  notify
                    ? "border-urgent/50 bg-urgent/[0.04]"
                    : "border-line bg-ground/40 hover:border-brand-mid"
                }`}
              >
                {notify && (
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-urgent px-2.5 py-1 text-[11px] font-bold text-white">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    Phiếu mới
                  </span>
                )}
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white transition-colors group-hover:bg-brand-deep">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    {c.icon}
                  </svg>
                </span>
                <div>
                  <p className="text-[15px] font-bold text-ink">{c.title}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                    {c.en}
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {notify ? (
                    <>
                      Có phiếu mới cần duyệt
                      {patientName ? (
                        <>
                          {" · "}
                          <span className="font-semibold text-ink">
                            Bệnh nhân: {patientName}
                          </span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    c.desc
                  )}
                </p>
                <span
                  className={`mt-auto flex items-center gap-1.5 text-[13px] font-semibold ${
                    notify ? "text-urgent" : "text-brand"
                  }`}
                >
                  {c.role === "doctor"
                    ? notify
                      ? "Xem phiếu ngay"
                      : "Chưa có phiếu nào"
                    : "Tiếp tục"}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <footer className="mt-6 text-center text-[11px] text-ink-soft/70">
        © {new Date().getFullYear()} TMMC Healthcare · Tâm Trí Sài Gòn General
        Hospital
      </footer>
    </div>
  )
}

/* ---------- Role top bar ---------- */
function RoleBar({ role }: { role: Role }) {
  const isDoctor = role === "doctor"
  return (
    <div className="no-print mb-5 flex items-center justify-between rounded-lg border border-line bg-white px-4 py-2.5">
      <span className="flex items-center gap-2 text-[13px]">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isDoctor ? "bg-ok/10 text-ok" : "bg-brand-tint text-brand"
          }`}
        >
          {isDoctor ? "Bác sĩ" : "Nhân viên"}
        </span>
        <span className="text-ink-soft">
          {isDoctor
            ? "Chế độ xem lại & ký duyệt"
            : "Chế độ nhập & chọn chỉ định"}
        </span>
      </span>
    </div>
  )
}

/* ---------- Doctor read-only review ---------- */
function ReviewList({ summary }: { summary: ReturnType<typeof buildSummary> }) {
  if (summary.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white py-10 text-center text-[13px] text-ink-soft">
        Nhân viên chưa chọn chỉ định nào.
      </div>
    )
  }
  return (
    <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5">
      {summary.map((g) => (
        <section
          key={g.title}
          className="break-inside-avoid overflow-hidden rounded-lg border border-line bg-white shadow-[0_1px_2px_rgba(20,33,61,0.04)]"
        >
          <header className="flex items-center gap-2 bg-brand px-3.5 py-2">
            <span className="text-[13px] font-bold uppercase tracking-wide text-white">
              {g.title}
            </span>
            {g.contrast && (
              <span className="rounded bg-white/20 px-1.5 py-px text-[10px] font-semibold text-white">
                + cản
              </span>
            )}
          </header>
          <ul className="flex flex-col gap-1 p-3.5">
            {g.items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-2 text-[13px] text-ink"
              >
                <span className="text-brand">
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                    <path
                      d="M2.5 6.2 5 8.6l4.5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>
                  {it.vi}
                  {it.text && (
                    <span className="text-ink-soft">: {it.text}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Toast({
  message,
  onClose,
}: {
  message: string | null
  onClose: () => void
}) {
  if (!message) return null
  return (
    <div className="no-print fixed right-4 top-4 z-50 flex max-w-[360px] items-start gap-3 rounded-lg border border-ok/30 bg-white px-4 py-3 shadow-[0_12px_32px_rgba(20,33,61,0.16)]">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ok text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path
            d="m5 13 4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="flex-1 text-[13px] leading-snug text-ink">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-ink-soft transition-colors hover:text-ink"
        aria-label="Đóng"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<AppView>(() =>
    viewFromPath(window.location.pathname),
  )
  const [role, setRole] = useState<Role | null>(loadRole)
  const [form, setForm] = useState<FormState>(loadForm)
  const [submittedForm, setSubmittedForm] = useState<FormState | null>(
    loadSubmittedForm,
  )
  const [query, setQuery] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const navigateTo = (nextView: AppView) => {
    const nextPath = pathForView(nextView)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath)
    }
    setView(nextView)
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    try {
      if (role) {
        localStorage.setItem(ROLE_STORAGE_KEY, role)

        const linkedRole = roleFromSearch(window.location.search)
        if (linkedRole) {
          const url = new URL(window.location.href)
          url.searchParams.delete("role")
          window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}${url.hash}`,
          )
        }
      } else {
        localStorage.removeItem(ROLE_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [role])

  useEffect(() => {
    const syncViewFromPath = () =>
      setView(viewFromPath(window.location.pathname))
    const canonicalPath = pathForView(view)
    if (window.location.pathname !== canonicalPath) {
      window.history.replaceState({}, "", canonicalPath)
    }
    window.addEventListener("popstate", syncViewFromPath)
    return () => window.removeEventListener("popstate", syncViewFromPath)
  }, [])

  // Persist the staff draft separately from the snapshot sent to the doctor.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      /* ignore */
    }
  }, [form])

  useEffect(() => {
    try {
      if (submittedForm) {
        localStorage.setItem(
          SUBMITTED_STORAGE_KEY,
          JSON.stringify(submittedForm),
        )
      } else {
        localStorage.removeItem(SUBMITTED_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [submittedForm])

  // Keep staff and doctor tabs in sync without exposing unsent draft changes.
  useEffect(() => {
    const syncFormFromStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setForm(loadForm())
      if (event.key === SUBMITTED_STORAGE_KEY) {
        try {
          setSubmittedForm(
            event.newValue
              ? { ...emptyForm, ...JSON.parse(event.newValue) }
              : null,
          )
        } catch {
          setSubmittedForm(null)
        }
      }
    }
    window.addEventListener("storage", syncFormFromStorage)
    return () => window.removeEventListener("storage", syncFormFromStorage)
  }, [])

  const visibleForm = role === "doctor" ? (submittedForm ?? emptyForm) : form
  const matchedPatientRecord = useMemo(() => {
    const phone = normalizePhone(form.patient.phone || "")
    if (phone.length < 9) return null
    return (
      patientRecords.find((record) => normalizePhone(record.phone) === phone) ??
      null
    )
  }, [form.patient.phone])
  const selectedSet = useMemo(
    () => new Set(visibleForm.selected),
    [visibleForm.selected],
  )
  const summary = useMemo(
    () => buildSummary(selectedSet, visibleForm.contrast, visibleForm.notes),
    [selectedSet, visibleForm.contrast, visibleForm.notes],
  )
  const total = visibleForm.selected.length

  const toggle = (id: string) =>
    setForm((f) => ({
      ...f,
      selected: f.selected.includes(id)
        ? f.selected.filter((x) => x !== id)
        : [...f.selected, id],
    }))
  const setContrastId = (id: string) =>
    setForm((f) => ({
      ...f,
      contrast: { ...f.contrast, [id]: !f.contrast[id] },
    }))
  const setPatient = (id: string, v: string) =>
    setForm((f) => ({ ...f, patient: { ...f.patient, [id]: v } }))
  const setNote = (id: string, v: string) =>
    setForm((f) => ({ ...f, notes: { ...f.notes, [id]: v } }))

  const applyPatientRecord = (record: PatientRecord) => {
    setForm((current) => ({
      ...current,
      patient: {
        ...current.patient,
        id: record.id,
        name: record.name,
        dob: record.dob,
        phone: record.phone,
        address: record.address,
      },
      flags: {
        ...current.flags,
        bhyt: record.bhyt !== "—",
      },
    }))
    setToast(`Đã điền thông tin hồ sơ của ${record.name}`)
  }

  const hasData =
    form.selected.length > 0 ||
    Object.values(form.patient).some(Boolean) ||
    !!form.diagnosis
  const patientName = (visibleForm.patient.name || "").trim()
  const draftPatientName = (form.patient.name || "").trim()
  const submittedPatientName = (submittedForm?.patient.name || "").trim()

  const sendToDoctor = () => {
    if (!hasData) {
      setToast(
        "Vui lòng nhập thông tin bệnh nhân hoặc chọn ít nhất một chỉ định trước khi gửi",
      )
      return
    }
    const submittedAt = Date.now()
    const submittedSnapshot = { ...form, submittedAt }
    setForm(submittedSnapshot)
    setSubmittedForm(submittedSnapshot)
    setToast(
      draftPatientName
        ? `Đã gửi phiếu của bệnh nhân ${draftPatientName} qua bác sĩ`
        : "Đã gửi phiếu qua bác sĩ",
    )
  }

  const clearSubmittedForm = () => {
    setSubmittedForm(null)
    setForm((current) => ({ ...current, submittedAt: null }))
  }

  const matchCount = query
    ? allGroups.reduce(
        (n, g) =>
          n + g.choices.filter((c) => norm(c.vi).includes(norm(query))).length,
        0,
      )
    : 0

  if (view === "dashboard") {
    return (
      <Dashboard
        prescription={form}
        onOpenPrescription={() => navigateTo("prescription")}
      />
    )
  }

  if (!role) {
    return (
      <div className="min-h-screen">
        <Toast message={toast} onClose={() => setToast(null)} />
        <RoleGate
          onPick={setRole}
          pending={!!submittedForm?.submittedAt}
          patientName={submittedPatientName}
        />
      </div>
    )
  }

  const readOnly = role === "doctor"

  if (readOnly && !submittedForm) {
    return (
      <div className="min-h-screen">
        <Toast message={toast} onClose={() => setToast(null)} />
        <div className="mx-auto max-w-[880px] px-4 py-8 md:py-12">
          <HospitalHeader />
          <RoleBar role={role} />
          <section className="rounded-xl border border-line bg-white px-6 py-14 text-center shadow-[0_1px_2px_rgba(20,33,61,0.04)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="mt-4 text-lg font-bold text-ink">
              Chưa có phiếu nào được gửi
            </h1>
            <p className="mx-auto mt-2 max-w-[460px] text-[13px] leading-relaxed text-ink-soft">
              Bác sĩ chỉ nhìn thấy phiếu sau khi nhân viên bấm “Gửi qua bác sĩ”.
              Bản nháp đang nhập được giữ riêng và không hiển thị tại đây.
            </p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Toast message={toast} onClose={() => setToast(null)} />
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-8 md:py-10">
        <HospitalHeader />
        <RoleBar role={role} />

        {role === "doctor" && visibleForm.submittedAt && (
          <div className="no-print mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-brand-mid/40 bg-brand-tint px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
              >
                <path
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="flex-1 text-[13px] leading-snug">
              <span className="font-semibold text-brand">
                Phiếu mới cần duyệt
              </span>
              {patientName && (
                <span className="text-ink"> · Bệnh nhân: {patientName}</span>
              )}
              <span className="block text-[11px] text-ink-soft">
                Nhân viên gửi lúc{" "}
                {new Date(visibleForm.submittedAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={clearSubmittedForm}
              className="rounded-md border border-brand-mid/40 bg-white px-3 py-1.5 text-[12px] font-medium text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Đã xem
            </button>
          </div>
        )}

        {role === "staff" && submittedForm?.submittedAt && (
          <div className="no-print mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-ok/30 bg-ok/5 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ok text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="m5 12 4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="flex-1 text-[13px] leading-snug">
              <span className="font-semibold text-ok">
                Đã gửi phiếu qua bác sĩ
              </span>
              {submittedPatientName && (
                <span className="text-ink">
                  {" "}
                  · Bệnh nhân: {submittedPatientName}
                </span>
              )}
              <span className="block text-[11px] text-ink-soft">
                Nhân viên vẫn ở chế độ nhập liệu. Bác sĩ xem phiếu ở vai trò
                riêng.
              </span>
            </div>
          </div>
        )}

        <div
          className={`grid gap-5 ${readOnly ? "" : "lg:grid-cols-[1fr_308px]"}`}
        >
          <main className="flex flex-col gap-5">
            {/* Title bar */}
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-brand-deep to-brand px-5 py-3.5 text-white">
              <h1 className="flex items-baseline gap-2.5">
                <span className="text-xl font-extrabold uppercase tracking-wide">
                  Phiếu chỉ định
                </span>
                <span className="hidden text-[13px] font-medium uppercase tracking-widest text-white/70 sm:inline">
                  Medical Tests Prescription
                </span>
              </h1>
              <span className="hidden font-mono text-[11px] text-white/60 sm:block">
                No. {new Date().getFullYear()}-
                {String(Math.floor(1000 + total * 7)).padStart(4, "0")}
              </span>
            </div>

            {/* Patient information */}
            <section className="rounded-lg border border-line bg-white p-5 shadow-[0_1px_2px_rgba(20,33,61,0.04)]">
              <div className="grid gap-4 md:grid-cols-3">
                {patientFields.map((f) => (
                  <Field
                    key={f.id}
                    vi={f.vi}
                    en={f.en}
                    span={f.span}
                    value={visibleForm.patient[f.id] || ""}
                    onChange={(v) => setPatient(f.id, v)}
                    readOnly={readOnly}
                  />
                ))}
              </div>
              {role === "staff" && matchedPatientRecord && (
                <PatientHistoryCard
                  record={matchedPatientRecord}
                  onUse={() => applyPatientRecord(matchedPatientRecord)}
                />
              )}
              {role === "staff" &&
                normalizePhone(form.patient.phone || "").length >= 9 &&
                !matchedPatientRecord && (
                  <div className="mt-4 rounded-md border border-dashed border-line bg-ground/40 px-4 py-3 text-[12px] text-ink-soft">
                    Không tìm thấy hồ sơ khám trước đây với số điện thoại này.
                  </div>
                )}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
                {([
                  ["bhyt", "BHYT"],
                  ["service", "Dịch Vụ"],
                  ["reexam", "Tái khám / Re-examination"],
                ] as const).map(([key, label]) => (
                  <label
                    key={key}
                    className={`group flex items-center gap-2 text-[13px] font-medium text-ink ${
                      readOnly ? "" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={visibleForm.flags[key]}
                      disabled={readOnly}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          flags: { ...f.flags, [key]: !f.flags[key] },
                        }))
                      }
                    />
                    <Check checked={visibleForm.flags[key]} />
                    {label}
                  </label>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  {([
                    ["urgent", "Khẩn"],
                    ["normal", "Thường"],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      disabled={readOnly}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          priority: f.priority === key ? null : key,
                        }))
                      }
                      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wide transition-colors ${
                        visibleForm.priority === key
                          ? key === "urgent"
                            ? "border-urgent bg-urgent text-white"
                            : "border-ok bg-ok text-white"
                          : `border-line bg-white text-ink-soft ${
                              readOnly ? "opacity-50" : "hover:border-brand-mid"
                            }`
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <label className="text-[12px]">
                  <span className="font-semibold text-ink">
                    Chẩn đoán lâm sàng
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    {" "}
                    / Clinical diagnosis
                  </span>
                </label>
                {readOnly ? (
                  <div className="min-h-[52px] rounded-md border border-line bg-ground/60 px-3 py-2 text-[13px] text-ink">
                    {visibleForm.diagnosis || (
                      <span className="text-ink-soft/50">—</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={visibleForm.diagnosis}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, diagnosis: e.target.value }))
                    }
                    className="resize-none rounded-md border border-line bg-brand-tint/40 px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-brand-mid focus:bg-white focus:ring-2 focus:ring-brand-mid/20"
                  />
                )}
              </div>
            </section>

            {readOnly ? (
              /* ---------- DOCTOR: read-only review ---------- */
              <>
                <div className="flex items-center gap-2 px-1">
                  <h2 className="text-[14px] font-bold uppercase tracking-wide text-brand">
                    Chỉ định đã lập
                  </h2>
                  <span className="rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                    {total} mục
                  </span>
                </div>
                <ReviewList summary={summary} />
              </>
            ) : (
              /* ---------- STAFF: editable form ---------- */
              <>
                {/* Search bar */}
                <div className="no-print relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm chỉ định… (vd: MRI sọ não, sieu am tim, xoang)"
                    className="h-11 w-full rounded-lg border border-line bg-white pl-11 pr-24 text-[14px] text-ink shadow-[0_1px_2px_rgba(20,33,61,0.04)] outline-none transition-colors placeholder:text-ink-soft/50 focus:border-brand-mid focus:ring-2 focus:ring-brand-mid/20"
                  />
                  {query && (
                    <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-soft">
                        {matchCount} kết quả
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-brand-tint hover:text-brand"
                        aria-label="Xóa tìm kiếm"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M6 6l12 12M18 6 6 18"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {query && matchCount === 0 && (
                  <div className="rounded-lg border border-dashed border-line bg-white py-10 text-center text-[13px] text-ink-soft">
                    Không tìm thấy chỉ định nào khớp với “{query}”.
                  </div>
                )}

                <BalancedColumns
                  items={[
                    ...groups,
                    ...labGroups.filter((g) => g.id !== "biochem"),
                    ...packages,
                  ]}
                  selected={selectedSet}
                  toggle={toggle}
                  query={query}
                  contrast={visibleForm.contrast}
                  onContrast={setContrastId}
                  notes={visibleForm.notes}
                  setNote={setNote}
                />
                {labGroups
                  .filter((g) => g.id === "biochem")
                  .map((g) => (
                    <Panel
                      key={g.id}
                      group={g}
                      selected={selectedSet}
                      toggle={toggle}
                      query={query}
                      contrast={visibleForm.contrast[g.id]}
                      onContrast={() => setContrastId(g.id)}
                      notes={visibleForm.notes}
                      setNote={setNote}
                    />
                  ))}
              </>
            )}

            {/* Return results */}
            <section className="rounded-lg border border-line bg-white p-5">
              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-brand">
                Nơi trả kết quả{" "}
                <span className="font-medium text-ink-soft">
                  / Return results
                </span>
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  vi="Email"
                  en="Email"
                  span={3}
                  value={visibleForm.returnEmail}
                  onChange={(v) => setForm((f) => ({ ...f, returnEmail: v }))}
                  readOnly={readOnly}
                />
                <Field
                  vi="Địa chỉ"
                  en="Address"
                  span={3}
                  value={visibleForm.returnAddress}
                  onChange={(v) => setForm((f) => ({ ...f, returnAddress: v }))}
                  readOnly={readOnly}
                />
              </div>
            </section>
          </main>

          {/* Staff-only working sidebar */}
          {!readOnly && (
            <aside className="no-print lg:sticky lg:top-6 lg:self-start">
              <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(20,33,61,0.04)]">
                <div className="flex items-center justify-between bg-brand-deep px-4 py-3 text-white">
                  <span className="text-[13px] font-bold uppercase tracking-wide">
                    Tóm tắt chỉ định
                  </span>
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 font-mono text-[12px] font-semibold text-brand-deep">
                    {total}
                  </span>
                </div>
                <div className="max-h-[52vh] overflow-y-auto p-4">
                  {summary.length === 0 ? (
                    <p className="py-8 text-center text-[13px] text-ink-soft">
                      Chưa chọn chỉ định nào.
                      <br />
                      <span className="text-[12px] text-ink-soft/70">
                        Tích chọn các mục ở bên trái.
                      </span>
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {summary.map((g) => (
                        <li key={g.title}>
                          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand">
                            {g.title}
                            {g.contrast && (
                              <span className="rounded bg-brand-tint px-1.5 py-px text-[10px] text-brand-mid">
                                + cản
                              </span>
                            )}
                          </p>
                          <ul className="flex flex-col gap-0.5 border-l-2 border-brand-tint pl-2.5">
                            {g.items.map((it) => (
                              <li
                                key={it.id}
                                className="text-[12.5px] leading-snug text-ink-soft"
                              >
                                {it.vi}
                                {it.text && (
                                  <span className="text-ink">: {it.text}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-col gap-2 border-t border-line p-4">
                  <button
                    type="button"
                    onClick={sendToDoctor}
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-brand text-[13px] font-semibold text-white transition-colors hover:bg-brand-deep"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Gửi qua bác sĩ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, selected: [], contrast: {} }))
                    }
                    className="h-9 rounded-md border border-line text-[12px] font-medium text-ink-soft transition-colors hover:border-brand-mid hover:text-brand"
                  >
                    Xóa lựa chọn
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Doctor confirm action */}
        {readOnly && (
          <div className="no-print mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-5 text-[13px] font-semibold text-brand transition-colors hover:border-brand-mid"
            >
              In phiếu
            </button>
          </div>
        )}

        <footer className="mt-6 text-center text-[11px] text-ink-soft/70">
          © {new Date().getFullYear()} TMMC Healthcare · Tâm Trí Sài Gòn General
          Hospital
        </footer>
      </div>
    </div>
  )
}
