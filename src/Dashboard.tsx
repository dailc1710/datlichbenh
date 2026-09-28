import { useMemo, useState, type MouseEvent } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts"
import { groups, labGroups, packages } from "./data"

const WEEKLY = [
  { day: "T2", exams: 128 },
  { day: "T3", exams: 156 },
  { day: "T4", exams: 141 },
  { day: "T5", exams: 172 },
  { day: "T6", exams: 165 },
  { day: "T7", exams: 98 },
  { day: "CN", exams: 54 },
]

const MODALITY_VOL = [
  { name: "MRI", value: 42, color: "#a768e8" },
  { name: "CT", value: 58, color: "#3d86d8" },
  { name: "X-Quang", value: 96, color: "#c68420" },
  { name: "Siêu âm", value: 71, color: "#17a276" },
]

const NAV_ITEMS = [
  { id: "dashboard", label: "Tổng quan", icon: "⬡" },
  { id: "orders", label: "Phiếu chỉ định", icon: "◧" },
  { id: "patients", label: "Bệnh nhân", icon: "⊕" },
  { id: "results", label: "Kết quả", icon: "◈" },
  { id: "schedule", label: "Lịch hẹn", icon: "◷" },
]

const STATS = [
  {
    label: "Phiếu hôm nay",
    value: "142",
    delta: "+12",
    color: "#3d8ee8",
    bg: "#0f2240",
  },
  {
    label: "Chờ thực hiện",
    value: "38",
    delta: "-5",
    color: "#f59e0b",
    bg: "#1a1200",
  },
  {
    label: "Đã hoàn thành",
    value: "97",
    delta: "+8",
    color: "#10b981",
    bg: "#001a0f",
  },
  {
    label: "Cần từ (MRI/CT)",
    value: "23",
    delta: "+3",
    color: "#c084fc",
    bg: "#120a1a",
  },
]

const PATIENTS = [
  {
    id: "BN001284",
    name: "Nguyễn Thị Hoa",
    dob: "12/05/1978",
    tests: ["MRI Sọ não", "Siêu âm bụng TQ"],
    status: "Chờ thực hiện",
    time: "08:45",
    urgent: false,
    bhyt: true,
  },
  {
    id: "BN001285",
    name: "Trần Văn Minh",
    dob: "30/11/1965",
    tests: ["CT Ngực", "X-Quang Cột sống"],
    status: "Đang thực hiện",
    time: "09:10",
    urgent: true,
    bhyt: false,
  },
  {
    id: "BN001286",
    name: "Lê Thị Bích Ngọc",
    dob: "07/03/1990",
    tests: ["Siêu âm Tim", "XQ Tim phổi"],
    status: "Hoàn thành",
    time: "09:30",
    urgent: false,
    bhyt: true,
  },
  {
    id: "BN001287",
    name: "Phạm Quốc Hùng",
    dob: "22/08/1985",
    tests: ["MRI Vùng cổ", "Mạch máu não"],
    status: "Chờ thực hiện",
    time: "10:00",
    urgent: true,
    bhyt: true,
  },
  {
    id: "BN001288",
    name: "Võ Thị Kim Loan",
    dob: "14/02/1972",
    tests: ["Nội soi Dạ dày", "Sinh hóa máu"],
    status: "Chờ kết quả",
    time: "10:15",
    urgent: false,
    bhyt: false,
  },
  {
    id: "BN001289",
    name: "Đỗ Minh Tuấn",
    dob: "19/06/1955",
    tests: ["MRI Toàn thân", "XQ Xương khớp"],
    status: "Hoàn thành",
    time: "10:40",
    urgent: false,
    bhyt: true,
  },
  {
    id: "BN001290",
    name: "Hoàng Thị Lan",
    dob: "05/09/1998",
    tests: ["Siêu âm phụ khoa", "Xét nghiệm máu"],
    status: "Chờ thực hiện",
    time: "11:00",
    urgent: false,
    bhyt: true,
  },
]

const TEST_CATEGORIES = [
  {
    cat: "MRI",
    color: "#c084fc",
    items: [
      "Sọ não",
      "Vùng cổ",
      "Hốc mắt",
      "Lồng ngực",
      "Tuyến vú",
      "Bụng",
      "Chậu",
      "Cột sống",
      "Khớp (Vai/Gối/Háng)",
      "MRI Toàn thân",
    ],
  },
  {
    cat: "CT (MSCT)",
    color: "#3d8ee8",
    items: [
      "Não",
      "Xoang",
      "Hốc mắt",
      "Tai",
      "Vùng cổ",
      "Ngực",
      "Bụng",
      "Phổi liều thấp",
      "Chậu",
      "Hệ niệu",
      "Cột sống",
    ],
  },
  {
    cat: "X-Quang",
    color: "#6badf0",
    items: [
      "Ngực",
      "Tim phổi",
      "Cột sống",
      "Bụng",
      "Dạ dày",
      "Sọ",
      "Xoang",
      "Xương",
      "Khớp",
      "Khung chậu",
    ],
  },
  {
    cat: "Siêu âm",
    color: "#10b981",
    items: [
      "Bụng TQ",
      "Tim",
      "Giáp",
      "Mô mềm",
      "Phụ khoa",
      "Vú",
      "Mạch máu chi trên",
      "Mạch máu chi dưới",
      "Mạch cảnh",
      "Mạch máu Thận",
    ],
  },
]

const RECENT_RESULTS = [
  {
    id: "KQ2847",
    patient: "Nguyễn Thị Hoa",
    test: "MRI Sọ não",
    doctor: "BS. Trần Đức Anh",
    ready: "11:20",
    status: "Bình thường",
  },
  {
    id: "KQ2846",
    patient: "Đỗ Minh Tuấn",
    test: "XQ Xương khớp",
    doctor: "BS. Lê Thị Mai",
    ready: "10:55",
    status: "Bất thường",
  },
  {
    id: "KQ2845",
    patient: "Lê Thị Bích Ngọc",
    test: "Siêu âm Tim",
    doctor: "BS. Nguyễn Văn Bình",
    ready: "10:30",
    status: "Bình thường",
  },
  {
    id: "KQ2844",
    patient: "Võ Thị Kim Loan",
    test: "Sinh hóa máu",
    doctor: "BS. Phạm Thu Hà",
    ready: "09:50",
    status: "Cần theo dõi",
  },
]

const ORDERS = [
  {
    id: "PCD-2026-0847",
    patient: "Nguyễn Thị Hoa",
    bn: "BN001284",
    modality: "MRI",
    tests: ["MRI Sọ não", "Siêu âm bụng TQ"],
    doctor: "BS. Trần Đức Anh",
    date: "15/09/2026",
    time: "08:45",
    status: "Chờ thực hiện",
    priority: "Thường",
    cost: "3.850.000",
  },
  {
    id: "PCD-2026-0846",
    patient: "Trần Văn Minh",
    bn: "BN001285",
    modality: "CT",
    tests: ["CT Ngực", "X-Quang Cột sống"],
    doctor: "BS. Lê Thị Mai",
    date: "15/09/2026",
    time: "09:10",
    status: "Đang thực hiện",
    priority: "Khẩn",
    cost: "2.640.000",
  },
  {
    id: "PCD-2026-0845",
    patient: "Lê Thị Bích Ngọc",
    bn: "BN001286",
    modality: "Siêu âm",
    tests: ["Siêu âm Tim", "XQ Tim phổi"],
    doctor: "BS. Nguyễn Văn Bình",
    date: "15/09/2026",
    time: "09:30",
    status: "Hoàn thành",
    priority: "Thường",
    cost: "1.280.000",
  },
  {
    id: "PCD-2026-0844",
    patient: "Phạm Quốc Hùng",
    bn: "BN001287",
    modality: "MRI",
    tests: ["MRI Vùng cổ", "Mạch máu não"],
    doctor: "BS. Trần Đức Anh",
    date: "15/09/2026",
    time: "10:00",
    status: "Chờ thực hiện",
    priority: "Khẩn",
    cost: "5.120.000",
  },
  {
    id: "PCD-2026-0843",
    patient: "Võ Thị Kim Loan",
    bn: "BN001288",
    modality: "Nội soi",
    tests: ["Nội soi Dạ dày", "Sinh hóa máu"],
    doctor: "BS. Phạm Thu Hà",
    date: "15/09/2026",
    time: "10:15",
    status: "Chờ kết quả",
    priority: "Thường",
    cost: "1.950.000",
  },
  {
    id: "PCD-2026-0842",
    patient: "Đỗ Minh Tuấn",
    bn: "BN001289",
    modality: "MRI",
    tests: ["MRI Toàn thân", "XQ Xương khớp"],
    doctor: "BS. Lê Thị Mai",
    date: "15/09/2026",
    time: "10:40",
    status: "Hoàn thành",
    priority: "Thường",
    cost: "6.480.000",
  },
  {
    id: "PCD-2026-0841",
    patient: "Hoàng Thị Lan",
    bn: "BN001290",
    modality: "Siêu âm",
    tests: ["Siêu âm phụ khoa", "Xét nghiệm máu"],
    doctor: "BS. Nguyễn Văn Bình",
    date: "15/09/2026",
    time: "11:00",
    status: "Chờ thực hiện",
    priority: "Thường",
    cost: "890.000",
  },
]

const PATIENT_DIR = [
  {
    id: "BN001284",
    name: "Nguyễn Thị Hoa",
    dob: "12/05/1978",
    gender: "Nữ",
    phone: "0908 442 118",
    addr: "Q. Tân Bình, TP.HCM",
    visits: 8,
    last: "15/09/2026",
    bhyt: "SG4 79 123456789",
    tag: "Đang điều trị",
  },
  {
    id: "BN001285",
    name: "Trần Văn Minh",
    dob: "30/11/1965",
    gender: "Nam",
    phone: "0912 305 776",
    addr: "Q.12, TP.HCM",
    visits: 14,
    last: "15/09/2026",
    bhyt: "—",
    tag: "Ưu tiên",
  },
  {
    id: "BN001286",
    name: "Lê Thị Bích Ngọc",
    dob: "07/03/1990",
    gender: "Nữ",
    phone: "0987 221 903",
    addr: "Q. Gò Vấp, TP.HCM",
    visits: 3,
    last: "15/09/2026",
    bhyt: "SG4 79 998877665",
    tag: "Ổn định",
  },
  {
    id: "BN001287",
    name: "Phạm Quốc Hùng",
    dob: "22/08/1985",
    gender: "Nam",
    phone: "0903 118 447",
    addr: "Q. Bình Thạnh, TP.HCM",
    visits: 6,
    last: "15/09/2026",
    bhyt: "SG4 79 445566778",
    tag: "Đang điều trị",
  },
  {
    id: "BN001288",
    name: "Võ Thị Kim Loan",
    dob: "14/02/1972",
    gender: "Nữ",
    phone: "0938 774 210",
    addr: "H. Hóc Môn, TP.HCM",
    visits: 11,
    last: "15/09/2026",
    bhyt: "—",
    tag: "Theo dõi",
  },
  {
    id: "BN001289",
    name: "Đỗ Minh Tuấn",
    dob: "19/06/1955",
    gender: "Nam",
    phone: "0909 663 512",
    addr: "Q. Tân Phú, TP.HCM",
    visits: 22,
    last: "15/09/2026",
    bhyt: "SG4 79 112233445",
    tag: "Ưu tiên",
  },
  {
    id: "BN001290",
    name: "Hoàng Thị Lan",
    dob: "05/09/1998",
    gender: "Nữ",
    phone: "0977 540 189",
    addr: "Q. Bình Tân, TP.HCM",
    visits: 2,
    last: "15/09/2026",
    bhyt: "SG4 79 667788990",
    tag: "Ổn định",
  },
]

export type DashboardPrescription = {
  patient: Record<string, string>
  flags: { bhyt: boolean service: boolean reexam: boolean }
  priority: "urgent" | "normal" | null
  selected: string[]
  doctorName: string
  submittedAt: number | null
}

type DashboardPatient = typeof PATIENTS[number]
type DashboardOrder = typeof ORDERS[number]
type DashboardDirectoryPatient = typeof PATIENT_DIR[number]

const LIVE_DRAFT_STATUS = "Bản nháp"
const LIVE_PENDING_STATUS = "Chờ thực hiện"
const liveGroups = [...groups, ...labGroups, ...packages]
const choiceById = new Map(
  liveGroups.flatMap((group) =>
    group.choices.map((choice) => [choice.id, choice]),
  ),
)
const groupByChoiceId = new Map(
  liveGroups.flatMap((group) =>
    group.choices.map((choice) => [choice.id, group]),
  ),
)

function formatLiveDateTime(timestamp: number) {
  const date = new Date(timestamp)
  return {
    date: date.toLocaleDateString("vi-VN"),
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function buildLiveDashboardData(form: DashboardPrescription) {
  const hasData =
    form.selected.length > 0 ||
    Object.values(form.patient).some(Boolean) ||
    !!form.submittedAt
  if (!hasData) return null

  const timestamp = form.submittedAt ?? Date.now()
  const { date, time } = formatLiveDateTime(timestamp)
  const patientName = form.patient.name?.trim() || "Chưa nhập tên"
  const patientId =
    form.patient.id?.trim() || `BN-DRAFT-${String(timestamp).slice(-6)}`
  const selectedChoices = form.selected
    .map((id) => choiceById.get(id))
    .filter(Boolean)
  const tests =
    selectedChoices.length > 0
      ? selectedChoices.map((choice) => choice!.vi)
      : ["Chưa chọn chỉ định"]
  const selectedGroups = form.selected
    .map((id) => groupByChoiceId.get(id))
    .filter(Boolean)
  const modality =
    [
      ["mri", "MRI"],
      ["msct", "CT"],
      ["xray", "X-Quang"],
      ["ultrasound", "Siêu âm"],
      ["endoscopy", "Nội soi"],
    ].find(([groupId]) =>
      selectedGroups.some((group) => group?.id === groupId),
    )?.[1] ?? "Xét nghiệm"
  const status = form.submittedAt ? LIVE_PENDING_STATUS : LIVE_DRAFT_STATUS
  const priority = form.priority === "urgent" ? "Khẩn" : "Thường"
  const doctor = form.doctorName?.trim()
    ? `BS. ${form.doctorName.trim()}`
    : "Chưa phân công"

  const order: DashboardOrder = {
    id: `PCD-${
      form.submittedAt ? String(form.submittedAt).slice(-8) : "DRAFT"
    }`,
    patient: patientName,
    bn: patientId,
    modality,
    tests,
    doctor,
    date,
    time,
    status,
    priority,
    cost: "—",
  }

  const patient: DashboardPatient = {
    id: patientId,
    name: patientName,
    dob: form.patient.dob || "—",
    tests,
    status,
    time,
    urgent: form.priority === "urgent",
    bhyt: form.flags.bhyt,
  }

  const directoryPatient: DashboardDirectoryPatient = {
    id: patientId,
    name: patientName,
    dob: form.patient.dob || "—",
    gender: "—",
    phone: form.patient.phone || "—",
    addr: form.patient.address || "—",
    visits: 1,
    last: date,
    bhyt: form.flags.bhyt ? "BHYT" : "—",
    tag: status,
  }

  return { order, patient, directoryPatient }
}

const RESULTS_FULL = [
  {
    id: "KQ2847",
    patient: "Nguyễn Thị Hoa",
    bn: "BN001284",
    test: "MRI Sọ não",
    modality: "MRI",
    doctor: "BS. Trần Đức Anh",
    ready: "11:20",
    date: "15/09/2026",
    status: "Bình thường",
    summary:
      "Nhu mô não hai bán cầu đồng nhất, không thấy tổn thương choán chỗ. Hệ thống não thất cân đối.",
  },
  {
    id: "KQ2846",
    patient: "Đỗ Minh Tuấn",
    bn: "BN001289",
    test: "XQ Xương khớp",
    modality: "X-Quang",
    doctor: "BS. Lê Thị Mai",
    ready: "10:55",
    date: "15/09/2026",
    status: "Bất thường",
    summary:
      "Thoái hóa khớp gối hai bên độ II–III, hẹp khe khớp, gai xương bờ diện khớp. Đề nghị theo dõi chuyên khoa.",
  },
  {
    id: "KQ2845",
    patient: "Lê Thị Bích Ngọc",
    bn: "BN001286",
    test: "Siêu âm Tim",
    modality: "Siêu âm",
    doctor: "BS. Nguyễn Văn Bình",
    ready: "10:30",
    date: "15/09/2026",
    status: "Bình thường",
    summary:
      "Buồng tim kích thước bình thường, chức năng tâm thu thất trái bảo tồn (EF 62%). Không thấy dịch màng tim.",
  },
  {
    id: "KQ2844",
    patient: "Võ Thị Kim Loan",
    bn: "BN001288",
    test: "Sinh hóa máu",
    modality: "Xét nghiệm",
    doctor: "BS. Phạm Thu Hà",
    ready: "09:50",
    date: "15/09/2026",
    status: "Cần theo dõi",
    summary:
      "Glucose 7.8 mmol/L (tăng nhẹ), cholesterol toàn phần 6.2 mmol/L. Khuyến nghị điều chỉnh chế độ ăn và tái khám.",
  },
  {
    id: "KQ2843",
    patient: "Trần Văn Minh",
    bn: "BN001285",
    test: "CT Ngực",
    modality: "CT",
    doctor: "BS. Lê Thị Mai",
    ready: "09:15",
    date: "15/09/2026",
    status: "Bất thường",
    summary:
      "Nốt mờ thùy trên phổi phải kích thước 9mm, bờ rõ. Đề nghị chụp CT liều thấp kiểm tra sau 3 tháng.",
  },
]

const SCHEDULE = [
  {
    time: "08:00",
    patient: "Nguyễn Thị Hoa",
    room: "Phòng MRI 1",
    test: "MRI Sọ não",
    doctor: "BS. Trần Đức Anh",
    status: "Hoàn thành",
    dur: 45,
  },
  {
    time: "08:45",
    patient: "Trần Văn Minh",
    room: "Phòng CT 2",
    test: "CT Ngực",
    doctor: "BS. Lê Thị Mai",
    status: "Đang thực hiện",
    dur: 30,
  },
  {
    time: "09:30",
    patient: "Lê Thị Bích Ngọc",
    room: "Phòng Siêu âm 3",
    test: "Siêu âm Tim",
    doctor: "BS. Nguyễn Văn Bình",
    status: "Hoàn thành",
    dur: 25,
  },
  {
    time: "10:00",
    patient: "Phạm Quốc Hùng",
    room: "Phòng MRI 1",
    test: "MRI Vùng cổ",
    doctor: "BS. Trần Đức Anh",
    status: "Chờ thực hiện",
    dur: 50,
  },
  {
    time: "10:15",
    patient: "Võ Thị Kim Loan",
    room: "Phòng Nội soi",
    test: "Nội soi Dạ dày",
    doctor: "BS. Phạm Thu Hà",
    status: "Chờ thực hiện",
    dur: 40,
  },
  {
    time: "11:00",
    patient: "Hoàng Thị Lan",
    room: "Phòng Siêu âm 3",
    test: "Siêu âm phụ khoa",
    doctor: "BS. Nguyễn Văn Bình",
    status: "Chờ thực hiện",
    dur: 20,
  },
  {
    time: "13:30",
    patient: "Đỗ Minh Tuấn",
    room: "Phòng MRI 2",
    test: "MRI Toàn thân",
    doctor: "BS. Lê Thị Mai",
    status: "Chờ thực hiện",
    dur: 70,
  },
]

const NAV_META: Record<string, { title: string sub: string }> = {
  dashboard: { title: "Tổng quan hệ thống", sub: "Thứ Hai, 15/09/2026" },
  orders: { title: "Phiếu chỉ định", sub: "Quản lý phiếu chỉ định xét nghiệm" },
  patients: { title: "Hồ sơ bệnh nhân", sub: "Danh bạ và lịch sử khám" },
  results: { title: "Kết quả xét nghiệm", sub: "Kết quả đã trả và chờ đọc" },
  schedule: { title: "Lịch hẹn", sub: "Thứ Hai, 15/09/2026" },
}

const TAG_COLOR: Record<string, string> = {
  "Đang điều trị": "#3d8ee8",
  "Ưu tiên": "#ef4444",
  "Ổn định": "#10b981",
  "Theo dõi": "#f59e0b",
  [LIVE_PENDING_STATUS]: "#f59e0b",
  [LIVE_DRAFT_STATUS]: "#6b8ab0",
}

const STATUS_COLOR: Record<string, string> = {
  [LIVE_DRAFT_STATUS]: "#6b8ab0",
  "Chờ thực hiện": "#f59e0b",
  "Đang thực hiện": "#3d8ee8",
  "Hoàn thành": "#10b981",
  "Chờ kết quả": "#c084fc",
}

const RESULT_COLOR: Record<string, string> = {
  "Bình thường": "#10b981",
  "Bất thường": "#ef4444",
  "Cần theo dõi": "#f59e0b",
}

type DashboardProps = {
  onOpenPrescription: () => void
  prescription: DashboardPrescription
}

type AccessRole = "staff" | "doctor"

export default function Dashboard({
  onOpenPrescription,
  prescription,
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState("dashboard")
  const [activeTab, setActiveTab] = useState("queue")
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedRole, setCopiedRole] = useState<AccessRole | null>(null)

  const toggleTest = (t: string) =>
    setSelectedTests((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )

  const liveData = useMemo(
    () => buildLiveDashboardData(prescription),
    [prescription],
  )
  const patients = useMemo<DashboardPatient[]>(
    () =>
      liveData
        ? [
            liveData.patient,
            ...PATIENTS.filter((p) => p.id !== liveData.patient.id),
          ]
        : PATIENTS,
    [liveData],
  )
  const orders = useMemo<DashboardOrder[]>(
    () =>
      liveData
        ? [liveData.order, ...ORDERS.filter((o) => o.id !== liveData.order.id)]
        : ORDERS,
    [liveData],
  )
  const dashboardStats = useMemo(() => {
    if (!liveData) return STATS
    return STATS.map((stat, index) => {
      const increment =
        index === 0 ||
        index === 1 ||
        (index === 3 && ["MRI", "CT"].includes(liveData.order.modality))
          ? 1
          : 0
      return {
        ...stat,
        value: String(Number(stat.value) + increment),
        delta: index === 0 ? "+1" : stat.delta,
      }
    })
  }, [liveData])
  const weeklyData = useMemo(
    () =>
      liveData
        ? WEEKLY.map((day, index) =>
            index === WEEKLY.length - 1
              ? { ...day, exams: day.exams + 1 }
              : day,
          )
        : WEEKLY,
    [liveData],
  )
  const modalityVolume = useMemo(
    () =>
      liveData
        ? MODALITY_VOL.map((modality) =>
            modality.name === liveData.order.modality
              ? { ...modality, value: modality.value + 1 }
              : modality,
          )
        : MODALITY_VOL,
    [liveData],
  )
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.includes(searchQuery),
  )

  const copyRoleLink = async (role: AccessRole) => {
    const url = new URL("/prescription", window.location.origin)
    url.searchParams.set("role", role)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString())
      } else {
        const input = document.createElement("textarea")
        input.value = url.toString()
        input.style.position = "fixed"
        input.style.opacity = "0"
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        input.remove()
      }

      setCopiedRole(role)
      window.setTimeout(() => {
        setCopiedRole((current) => (current === role ? null : current))
      }, 2500)
    } catch {
      setCopiedRole(null)
    }
  }

  return (
    <div
      className="dashboard-shell"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#050d1a",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        className="dashboard-sidebar"
        style={{
          width: 220,
          background: "#0a1628",
          borderRight: "1px solid #163059",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 18px 16px",
            borderBottom: "1px solid #163059",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "#1a73d4",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              T
            </div>
            <div className="dashboard-brand-copy">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#e2eaf4",
                  letterSpacing: "0.05em",
                }}
              >
                TÂM TRÍ
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#6b8ab0",
                  letterSpacing: "0.03em",
                }}
              >
                SÀI GÒN
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 10px",
                borderRadius: 7,
                marginBottom: 3,
                border: "none",
                background: activeNav === item.id ? "#163059" : "transparent",
                color: activeNav === item.id ? "#3d8ee8" : "#7a9cc0",
                fontSize: 13,
                fontWeight: activeNav === item.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span className="dashboard-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #163059" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#163059",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#3d8ee8",
                fontWeight: 700,
              }}
            >
              BS
            </div>
            <div className="dashboard-user-copy">
              <div style={{ fontSize: 12, fontWeight: 600, color: "#c8d8ec" }}>
                BS. Nguyễn Văn Bình
              </div>
              <div style={{ fontSize: 10, color: "#4a6a90" }}>
                Khoa Chẩn đoán hình ảnh
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className="dashboard-main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          className="dashboard-topbar"
          style={{
            height: 56,
            background: "#0a1628",
            borderBottom: "1px solid #163059",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#e2eaf4" }}>
              {NAV_META[activeNav].title}
            </span>
            <span style={{ fontSize: 12, color: "#4a6a90", marginLeft: 12 }}>
              {NAV_META[activeNav].sub}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative" }}>
              <input
                className="dashboard-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bệnh nhân, mã phiếu..."
                style={{
                  background: "#0f2240",
                  border: "1px solid #163059",
                  borderRadius: 7,
                  padding: "6px 12px 6px 32px",
                  color: "#c8d8ec",
                  fontSize: 12,
                  width: 240,
                  outline: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#4a6a90",
                  fontSize: 13,
                }}
              >
                ⌕
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenPrescription}
              style={{
                background: "#1a73d4",
                border: "none",
                borderRadius: 7,
                padding: "7px 14px",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Phiếu mới
            </button>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#0f2240",
                  border: "1px solid #163059",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#7a9cc0",
                  fontSize: 15,
                }}
              >
                🔔
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  background: "#ef4444",
                  borderRadius: "50%",
                  border: "2px solid #0a1628",
                }}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="dashboard-content"
          style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}
        >
          {activeNav === "dashboard" && (
            <>
              <div
                style={{
                  ...CARD,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 16,
                  padding: "14px 16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 280px" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#c8d8ec",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Cấp link truy cập phiếu
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: "#4a6a90",
                      lineHeight: 1.5,
                    }}
                  >
                    Người nhận mở link sẽ vào đúng vai trò và trình duyệt tự ghi
                    nhớ cho những lần sau.
                  </div>
                </div>
                {([
                  {
                    role: "staff",
                    label: "Nhân viên nhập phiếu",
                    color: "#3d8ee8",
                  },
                  {
                    role: "doctor",
                    label: "Bác sĩ xem chỉ-đọc",
                    color: "#c084fc",
                  },
                ] as const).map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => copyRoleLink(item.role)}
                    style={{
                      minWidth: 180,
                      border: `1px solid ${item.color}66`,
                      borderRadius: 7,
                      background: `${item.color}18`,
                      color: item.color,
                      padding: "9px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copiedRole === item.role
                      ? "✓ Đã sao chép link"
                      : `Sao chép · ${item.label}`}
                  </button>
                ))}
              </div>
              {liveData && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                    padding: "10px 14px",
                    background: "#071f25",
                    border: "1px solid #0d7660",
                    borderRadius: 8,
                    color: "#a7f3d0",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#34d399", fontSize: 15 }}>✓</span>
                  <span style={{ flex: 1 }}>
                    Phiếu từ form đã đồng bộ:{" "}
                    <strong>{liveData.order.patient}</strong> ·{" "}
                    {liveData.order.id}
                  </span>
                  <span style={{ color: "#6ee7b7", fontWeight: 600 }}>
                    {liveData.order.status}
                  </span>
                </div>
              )}
              {/* Stats row */}
              <div
                className="dashboard-stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {dashboardStats.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#0a1628",
                      border: "1px solid #163059",
                      borderRadius: 10,
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#4a6a90",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 32,
                          fontWeight: 700,
                          color: s.color,
                          fontFamily: "JetBrains Mono, monospace",
                          lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: s.delta.startsWith("+")
                            ? "#10b981"
                            : "#ef4444",
                          background: s.delta.startsWith("+")
                            ? "#001a0f"
                            : "#1a0000",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        {s.delta} hôm nay
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div
                className="dashboard-charts-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div style={{ ...CARD, padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#9bb8d8",
                        letterSpacing: "0.04em",
                      }}
                    >
                      LƯU LƯỢNG XÉT NGHIỆM 7 NGÀY
                    </span>
                    <span style={{ fontSize: 11, color: "#4a6a90" }}>
                      Tổng{" "}
                      <strong style={{ color: "#4a9fe8", fontFamily: MONO }}>
                        {weeklyData.reduce((s, d) => s + d.exams, 0)}
                      </strong>{" "}
                      ca
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={weeklyData}
                      margin={{ top: 6, right: 6, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="volFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4a9fe8"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="#4a9fe8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#163059"
                        strokeDasharray="2 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#4a6a90", fontSize: 11 }}
                        axisLine={{ stroke: "#163059" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: "#4a6a90",
                          fontSize: 11,
                          fontFamily: MONO,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ stroke: "#1e4080", strokeWidth: 1 }}
                        contentStyle={{
                          background: "#0f2240",
                          border: "1px solid #163059",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#9bb8d8" }}
                        itemStyle={{ color: "#4a9fe8" }}
                        formatter={(v) => [`${v} ca`, "Xét nghiệm"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="exams"
                        stroke="#4a9fe8"
                        strokeWidth={2}
                        fill="url(#volFill)"
                        dot={{ r: 3, fill: "#4a9fe8", strokeWidth: 0 }}
                        activeDot={{
                          r: 5,
                          fill: "#4a9fe8",
                          stroke: "#0a1628",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ ...CARD, padding: "16px 18px" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#9bb8d8",
                      letterSpacing: "0.04em",
                      marginBottom: 14,
                    }}
                  >
                    PHÂN BỔ THEO NHÓM (HÔM NAY)
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={modalityVolume}
                      layout="vertical"
                      margin={{ top: 0, right: 28, left: 8, bottom: 0 }}
                      barCategoryGap="28%"
                    >
                      <CartesianGrid
                        stroke="#163059"
                        strokeDasharray="2 4"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{
                          fill: "#4a6a90",
                          fontSize: 11,
                          fontFamily: MONO,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#9bb8d8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={62}
                      />
                      <Tooltip
                        cursor={{ fill: "#0f2240" }}
                        contentStyle={{
                          background: "#0f2240",
                          border: "1px solid #163059",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#9bb8d8" }}
                        formatter={(v) => [`${v} ca`, "Số lượng"]}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        background={{ fill: "#0f2240", radius: 4 } as any}
                      >
                        {modalityVolume.map((m) => (
                          <Cell key={m.name} fill={m.color} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="right"
                          fill="#c8d8ec"
                          fontSize={11}
                          style={{ fontFamily: MONO }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Main grid */}
              <div
                className="dashboard-main-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 360px",
                  gap: 16,
                }}
              >
                {/* Left column */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Tabs */}
                  <div
                    style={{
                      background: "#0a1628",
                      border: "1px solid #163059",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        borderBottom: "1px solid #163059",
                      }}
                    >
                      {[
                        { id: "queue", label: "Hàng chờ bệnh nhân" },
                        { id: "orders", label: "Chỉ định xét nghiệm" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          style={{
                            padding: "12px 18px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            background:
                              activeTab === tab.id ? "#0f2240" : "transparent",
                            color: activeTab === tab.id ? "#3d8ee8" : "#4a6a90",
                            borderBottom:
                              activeTab === tab.id
                                ? "2px solid #1a73d4"
                                : "2px solid transparent",
                            transition: "all 0.15s",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {activeTab === "queue" && (
                      <div>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr style={{ background: "#050d1a" }}>
                              {[
                                "Mã BN",
                                "Họ tên",
                                "Ngày sinh",
                                "Xét nghiệm chỉ định",
                                "Giờ vào",
                                "Trạng thái",
                                "",
                              ].map((h) => (
                                <th
                                  key={h}
                                  style={{
                                    padding: "9px 14px",
                                    textAlign: "left",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#4a6a90",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((p, i) => (
                              <tr
                                key={p.id}
                                style={{
                                  borderTop: "1px solid #0f2240",
                                  background:
                                    i % 2 === 0 ? "transparent" : "#050d1a",
                                  transition: "background 0.1s",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#0f2240")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    i % 2 === 0 ? "transparent" : "#050d1a")
                                }
                              >
                                <td style={{ padding: "10px 14px" }}>
                                  <span
                                    style={{
                                      fontFamily: "JetBrains Mono, monospace",
                                      fontSize: 11,
                                      color: "#3d8ee8",
                                    }}
                                  >
                                    {p.id}
                                  </span>
                                  {p.urgent && (
                                    <span
                                      style={{
                                        marginLeft: 5,
                                        background: "#ef4444",
                                        color: "#fff",
                                        fontSize: 9,
                                        padding: "1px 4px",
                                        borderRadius: 3,
                                        fontWeight: 700,
                                      }}
                                    >
                                      KHẨN
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 500,
                                      color: "#e2eaf4",
                                    }}
                                  >
                                    {p.name}
                                  </div>
                                  {p.bhyt && (
                                    <div
                                      style={{
                                        fontSize: 10,
                                        color: "#3d8ee8",
                                        marginTop: 1,
                                      }}
                                    >
                                      BHYT
                                    </div>
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: 12,
                                    color: "#6b8ab0",
                                  }}
                                >
                                  {p.dob}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 4,
                                    }}
                                  >
                                    {p.tests.map((t) => (
                                      <span
                                        key={t}
                                        style={{
                                          background: "#0f2240",
                                          border: "1px solid #163059",
                                          color: "#9bb8d8",
                                          fontSize: 10,
                                          padding: "2px 7px",
                                          borderRadius: 4,
                                        }}
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td
                                  style={{
                                    padding: "10px 14px",
                                    fontFamily: "JetBrains Mono, monospace",
                                    fontSize: 12,
                                    color: "#6b8ab0",
                                  }}
                                >
                                  {p.time}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span
                                    style={{
                                      background: STATUS_COLOR[p.status] + "22",
                                      color: STATUS_COLOR[p.status],
                                      fontSize: 11,
                                      fontWeight: 600,
                                      padding: "3px 9px",
                                      borderRadius: 20,
                                      border: `1px solid ${STATUS_COLOR[p.status]}44`,
                                    }}
                                  >
                                    {p.status}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <button
                                    style={{
                                      background: "transparent",
                                      border: "1px solid #163059",
                                      borderRadius: 5,
                                      color: "#4a6a90",
                                      fontSize: 11,
                                      padding: "4px 10px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Chi tiết
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === "orders" && (
                      <div style={{ padding: 18 }}>
                        <div style={{ marginBottom: 14 }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b8ab0",
                              marginBottom: 10,
                            }}
                          >
                            Đã chọn{" "}
                            <strong style={{ color: "#3d8ee8" }}>
                              {selectedTests.length}
                            </strong>{" "}
                            xét nghiệm
                          </div>
                          {selectedTests.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 5,
                                marginBottom: 12,
                              }}
                            >
                              {selectedTests.map((t) => (
                                <span
                                  key={t}
                                  style={{
                                    background: "#163059",
                                    border: "1px solid #1a73d4",
                                    color: "#6badf0",
                                    fontSize: 11,
                                    padding: "3px 8px",
                                    borderRadius: 5,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => toggleTest(t)}
                                >
                                  {t} ×
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 14,
                          }}
                        >
                          {TEST_CATEGORIES.map((cat) => (
                            <div
                              key={cat.cat}
                              style={{
                                background: "#050d1a",
                                border: "1px solid #163059",
                                borderRadius: 8,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  padding: "8px 12px",
                                  background: cat.color + "22",
                                  borderBottom: "1px solid " + cat.color + "44",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: cat.color,
                                    display: "inline-block",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: cat.color,
                                    letterSpacing: "0.06em",
                                  }}
                                >
                                  {cat.cat}
                                </span>
                              </div>
                              <div
                                style={{
                                  padding: 10,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 5,
                                }}
                              >
                                {cat.items.map((item) => {
                                  const sel = selectedTests.includes(item)
                                  return (
                                    <button
                                      key={item}
                                      onClick={() => toggleTest(item)}
                                      style={{
                                        background: sel
                                          ? cat.color + "33"
                                          : "transparent",
                                        border: `1px solid ${
                                          sel ? cat.color : "#163059"
                                        }`,
                                        color: sel ? cat.color : "#6b8ab0",
                                        fontSize: 11,
                                        padding: "3px 8px",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                        transition: "all 0.12s",
                                        fontWeight: sel ? 600 : 400,
                                      }}
                                    >
                                      {item}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            marginTop: 14,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                          }}
                        >
                          <button
                            onClick={() => setSelectedTests([])}
                            style={{
                              background: "transparent",
                              border: "1px solid #163059",
                              borderRadius: 7,
                              color: "#6b8ab0",
                              fontSize: 12,
                              padding: "8px 16px",
                              cursor: "pointer",
                            }}
                          >
                            Xóa tất cả
                          </button>
                          <button
                            style={{
                              background: "#1a73d4",
                              border: "none",
                              borderRadius: 7,
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "8px 20px",
                              cursor: "pointer",
                            }}
                          >
                            Lưu phiếu chỉ định
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {/* Daily progress */}
                  <div
                    style={{
                      background: "#0a1628",
                      border: "1px solid #163059",
                      borderRadius: 10,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#9bb8d8",
                        marginBottom: 14,
                        letterSpacing: "0.04em",
                      }}
                    >
                      TIẾN ĐỘ HÔM NAY
                    </div>
                    {[
                      {
                        label: "MRI / CT",
                        done: 23,
                        total: 30,
                        color: "#c084fc",
                      },
                      {
                        label: "X-Quang",
                        done: 41,
                        total: 50,
                        color: "#3d8ee8",
                      },
                      {
                        label: "Siêu âm",
                        done: 28,
                        total: 35,
                        color: "#10b981",
                      },
                      {
                        label: "Xét nghiệm máu",
                        done: 65,
                        total: 70,
                        color: "#f59e0b",
                      },
                    ].map((row) => (
                      <div key={row.label} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 5,
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#7a9cc0" }}>
                            {row.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "JetBrains Mono, monospace",
                              color: row.color,
                            }}
                          >
                            {row.done}/{row.total}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "#0f2240",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(row.done / row.total) * 100}%`,
                              background: row.color,
                              borderRadius: 3,
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent results */}
                  <div
                    style={{
                      background: "#0a1628",
                      border: "1px solid #163059",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #163059",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#9bb8d8",
                          letterSpacing: "0.04em",
                        }}
                      >
                        KẾT QUẢ GẦN ĐÂY
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#3d8ee8",
                          cursor: "pointer",
                        }}
                      >
                        Xem tất cả →
                      </span>
                    </div>
                    {RECENT_RESULTS.map((r, i) => (
                      <div
                        key={r.id}
                        style={{
                          padding: "12px 16px",
                          borderTop: i > 0 ? "1px solid #0f2240" : undefined,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#c8d8ec",
                            }}
                          >
                            {r.patient}
                          </span>
                          <span
                            style={{
                              background: RESULT_COLOR[r.status] + "22",
                              color: RESULT_COLOR[r.status],
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: 10,
                            }}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#4a6a90" }}>
                          {r.test}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 5,
                          }}
                        >
                          <span style={{ fontSize: 10, color: "#2d4a6a" }}>
                            {r.doctor}
                          </span>
                          <span
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: 10,
                              color: "#2d4a6a",
                            }}
                          >
                            {r.ready}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick info */}
                  <div
                    style={{
                      background: "#0a1628",
                      border: "1px solid #163059",
                      borderRadius: 10,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#9bb8d8",
                        letterSpacing: "0.04em",
                        marginBottom: 12,
                      }}
                    >
                      THÔNG TIN LIÊN HỆ
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4a6a90",
                        lineHeight: 1.8,
                      }}
                    >
                      <div>
                        📍 171/3 Trường Chinh, P. Đông Hưng Thuận, TP. HCM
                      </div>
                      <div>📞 (84) 28 6260 1100</div>
                      <div style={{ color: "#3d8ee8" }}>
                        ✉ info.d12@tmmchealthcare.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeNav === "orders" && (
            <OrdersView search={searchQuery} orders={orders} />
          )}
          {activeNav === "patients" && (
            <PatientsView
              search={searchQuery}
              onOpenPrescription={onOpenPrescription}
              livePatient={liveData?.directoryPatient ?? null}
            />
          )}
          {activeNav === "results" && <ResultsView search={searchQuery} />}
          {activeNav === "schedule" && <ScheduleView />}
        </div>
      </div>
    </div>
  )
}

const CARD = {
  background: "#0a1628",
  border: "1px solid #163059",
  borderRadius: 10,
} as const
const TH = {
  padding: "9px 14px",
  textAlign: "left" as const,
  fontSize: 10,
  fontWeight: 600,
  color: "#4a6a90",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
}
const MONO = "JetBrains Mono, monospace"

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? "#6b8ab0"
  return (
    <span
      style={{
        background: c + "22",
        color: c,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        border: `1px solid ${c}44`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  )
}

function rowHover(
  e: MouseEvent<HTMLTableRowElement>,
  on: boolean,
  base: string,
) {
  e.currentTarget.style.background = on ? "#0f2240" : base
}

function OrdersView({
  search,
  orders,
}: {
  search: string
  orders: DashboardOrder[]
}) {
  const [filter, setFilter] = useState("Tất cả")
  const modalities = [
    "Tất cả",
    "MRI",
    "CT",
    "X-Quang",
    "Siêu âm",
    "Nội soi",
    "Xét nghiệm",
  ]
  const rows = orders.filter(
    (o) =>
      (filter === "Tất cả" || o.modality === filter) &&
      (o.patient.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.bn.includes(search)),
  )
  const totalCost = rows.reduce((s, o) => {
    const cost = Number(o.cost.replace(/\./g, ""))
    return s + (Number.isFinite(cost) ? cost : 0)
  }, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        className="dashboard-view-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {[
          {
            label: "Tổng phiếu",
            value: String(orders.length),
            color: "#3d8ee8",
          },
          {
            label: "Phiếu khẩn",
            value: String(orders.filter((o) => o.priority === "Khẩn").length),
            color: "#ef4444",
          },
          {
            label: "Chờ thực hiện",
            value: String(
              orders.filter(
                (o) =>
                  o.status === "Chờ thực hiện" ||
                  o.status === LIVE_DRAFT_STATUS,
              ).length,
            ),
            color: "#f59e0b",
          },
          {
            label: "Doanh thu hiển thị",
            value: (totalCost / 1_000_000).toFixed(1) + "M",
            color: "#10b981",
          },
        ].map((s) => (
          <div key={s.label} style={{ ...CARD, padding: "16px 18px" }}>
            <div
              style={{
                fontSize: 11,
                color: "#4a6a90",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: s.color,
                fontFamily: MONO,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderBottom: "1px solid #163059",
            flexWrap: "wrap",
          }}
        >
          {modalities.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${filter === m ? "#1a73d4" : "#163059"}`,
                background: filter === m ? "#163059" : "transparent",
                color: filter === m ? "#6badf0" : "#6b8ab0",
                transition: "all 0.15s",
              }}
            >
              {m}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#4a6a90" }}>
            {rows.length} phiếu
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#050d1a" }}>
              {[
                "Mã phiếu",
                "Bệnh nhân",
                "Chỉ định",
                "BS chỉ định",
                "Giờ",
                "Chi phí (đ)",
                "Trạng thái",
                "",
              ].map((h) => (
                <th key={h} style={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o, i) => {
              const base = i % 2 === 0 ? "transparent" : "#050d1a"
              return (
                <tr
                  key={o.id}
                  style={{
                    borderTop: "1px solid #0f2240",
                    background: base,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => rowHover(e, true, base)}
                  onMouseLeave={(e) => rowHover(e, false, base)}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: "#3d8ee8",
                      }}
                    >
                      {o.id}
                    </div>
                    {o.priority === "Khẩn" && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 3,
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 9,
                          padding: "1px 4px",
                          borderRadius: 3,
                          fontWeight: 700,
                        }}
                      >
                        KHẨN
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#e2eaf4",
                      }}
                    >
                      {o.patient}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4a6a90",
                        fontFamily: MONO,
                      }}
                    >
                      {o.bn}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {o.tests.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: "#0f2240",
                            border: "1px solid #163059",
                            color: "#9bb8d8",
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#6b8ab0",
                    }}
                  >
                    {o.doctor}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: MONO,
                      fontSize: 12,
                      color: "#6b8ab0",
                    }}
                  >
                    {o.time}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: MONO,
                      fontSize: 12,
                      color: "#c8d8ec",
                      textAlign: "right",
                    }}
                  >
                    {o.cost}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <StatusPill status={o.status} />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      style={{
                        background: "transparent",
                        border: "1px solid #163059",
                        borderRadius: 5,
                        color: "#4a6a90",
                        fontSize: 11,
                        padding: "4px 10px",
                        cursor: "pointer",
                      }}
                    >
                      In phiếu
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PatientsView({
  search,
  onOpenPrescription,
  livePatient,
}: {
  search: string
  onOpenPrescription: () => void
  livePatient: DashboardDirectoryPatient | null
}) {
  const patients = livePatient
    ? [livePatient, ...PATIENT_DIR.filter((p) => p.id !== livePatient.id)]
    : PATIENT_DIR
  const [selected, setSelected] = useState(livePatient?.id ?? PATIENT_DIR[0].id)
  const rows = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search),
  )
  const active =
    patients.find((p) => p.id === selected) ?? rows[0] ?? patients[0]

  return (
    <div
      className="dashboard-two-column"
      style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}
    >
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #163059",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9bb8d8",
              letterSpacing: "0.04em",
            }}
          >
            DANH BẠ BỆNH NHÂN
          </span>
          <span style={{ fontSize: 12, color: "#4a6a90" }}>
            {rows.length} hồ sơ
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#050d1a" }}>
              {[
                "Mã BN",
                "Họ tên",
                "Giới tính",
                "Điện thoại",
                "Lần khám",
                "Phân loại",
              ].map((h) => (
                <th key={h} style={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const isSel = p.id === selected
              const base = isSel
                ? "#0f2240"
                : i % 2 === 0
                  ? "transparent"
                  : "#050d1a"
              return (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  style={{
                    borderTop: "1px solid #0f2240",
                    background: base,
                    cursor: "pointer",
                    borderLeft: isSel
                      ? "2px solid #1a73d4"
                      : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) rowHover(e, true, base)
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) rowHover(e, false, base)
                  }}
                >
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: MONO,
                      fontSize: 11,
                      color: "#3d8ee8",
                    }}
                  >
                    {p.id}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#e2eaf4",
                    }}
                  >
                    {p.name}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#6b8ab0",
                    }}
                  >
                    {p.gender}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: MONO,
                      fontSize: 12,
                      color: "#6b8ab0",
                    }}
                  >
                    {p.phone}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: MONO,
                      fontSize: 12,
                      color: "#c8d8ec",
                    }}
                  >
                    {p.visits}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        background: TAG_COLOR[p.tag] + "22",
                        color: TAG_COLOR[p.tag],
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 9px",
                        borderRadius: 20,
                        border: `1px solid ${TAG_COLOR[p.tag]}44`,
                      }}
                    >
                      {p.tag}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr
              style={{ background: "#050d1a", borderTop: "1px solid #163059" }}
            >
              <td
                colSpan={4}
                style={{
                  padding: "10px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4a6a90",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Tổng kết
              </td>
              <td
                style={{
                  padding: "10px 14px",
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#3d8ee8",
                }}
              >
                {rows.reduce((s, p) => s + p.visits, 0)}
              </td>
              <td
                style={{ padding: "10px 14px", fontSize: 11, color: "#6b8ab0" }}
              >
                {rows.length} hồ sơ · lượt khám
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ ...CARD, padding: 20, alignSelf: "start" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#163059",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              color: "#3d8ee8",
            }}
          >
            {active.name.split(" ").pop()?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e2eaf4" }}>
              {active.name}
            </div>
            <div style={{ fontSize: 11, color: "#4a6a90", fontFamily: MONO }}>
              {active.id}
            </div>
          </div>
        </div>
        {[
          ["Ngày sinh", active.dob],
          ["Giới tính", active.gender],
          ["Điện thoại", active.phone],
          ["Địa chỉ", active.addr],
          ["Số thẻ BHYT", active.bhyt],
          ["Lần khám gần nhất", active.last],
          ["Tổng lượt khám", String(active.visits)],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #0f2240",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#4a6a90" }}>{k}</span>
            <span
              style={{
                color: "#c8d8ec",
                fontWeight: 500,
                textAlign: "right",
                maxWidth: 180,
              }}
            >
              {v}
            </span>
          </div>
        ))}
        <button
          type="button"
          onClick={onOpenPrescription}
          style={{
            width: "100%",
            marginTop: 18,
            background: "#1a73d4",
            border: "none",
            borderRadius: 7,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            padding: "9px",
            cursor: "pointer",
          }}
        >
          + Tạo phiếu chỉ định
        </button>
      </div>
    </div>
  )
}

function ResultsView({ search }: { search: string }) {
  const [open, setOpen] = useState<string | null>(RESULTS_FULL[0].id)
  const rows = RESULTS_FULL.filter(
    (r) =>
      r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.bn.includes(search),
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        className="dashboard-view-stats dashboard-results-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {[
          {
            label: "Kết quả bình thường",
            value: RESULTS_FULL.filter((r) => r.status === "Bình thường")
              .length,
            color: "#10b981",
          },
          {
            label: "Bất thường",
            value: RESULTS_FULL.filter((r) => r.status === "Bất thường").length,
            color: "#ef4444",
          },
          {
            label: "Cần theo dõi",
            value: RESULTS_FULL.filter((r) => r.status === "Cần theo dõi")
              .length,
            color: "#f59e0b",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              ...CARD,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: s.color,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: MONO,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "#4a6a90", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => {
          const c = RESULT_COLOR[r.status]
          const isOpen = open === r.id
          return (
            <div
              key={r.id}
              style={{
                ...CARD,
                overflow: "hidden",
                borderLeft: `3px solid ${c}`,
              }}
            >
              <div
                onClick={() => setOpen(isOpen ? null : r.id)}
                style={{
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                }}
              >
                <div style={{ minWidth: 90 }}>
                  <div
                    style={{ fontFamily: MONO, fontSize: 11, color: "#3d8ee8" }}
                  >
                    {r.id}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: "#4a6a90",
                      marginTop: 2,
                    }}
                  >
                    {r.ready}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#e2eaf4" }}
                  >
                    {r.patient}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b8ab0", marginTop: 2 }}>
                    {r.test} · {r.doctor}
                  </div>
                </div>
                <span
                  style={{
                    background: "#0f2240",
                    border: "1px solid #163059",
                    color: "#9bb8d8",
                    fontSize: 10,
                    padding: "3px 9px",
                    borderRadius: 4,
                  }}
                >
                  {r.modality}
                </span>
                <span
                  style={{
                    background: c + "22",
                    color: c,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: `1px solid ${c}44`,
                  }}
                >
                  {r.status}
                </span>
                <span
                  style={{
                    color: "#4a6a90",
                    fontSize: 14,
                    transform: isOpen ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  ›
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 18px 16px 122px" }}>
                  <div
                    style={{
                      background: "#050d1a",
                      border: "1px solid #163059",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4a6a90",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Kết luận chẩn đoán
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#c8d8ec",
                        lineHeight: 1.6,
                      }}
                    >
                      {r.summary}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        style={{
                          background: "#1a73d4",
                          border: "none",
                          borderRadius: 6,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "6px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Tải PDF
                      </button>
                      <button
                        style={{
                          background: "transparent",
                          border: "1px solid #163059",
                          borderRadius: 6,
                          color: "#6b8ab0",
                          fontSize: 11,
                          padding: "6px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Gửi cho bác sĩ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScheduleView() {
  const rooms = [
    "Phòng MRI 1",
    "Phòng MRI 2",
    "Phòng CT 2",
    "Phòng Siêu âm 3",
    "Phòng Nội soi",
  ]
  return (
    <div
      className="dashboard-two-column"
      style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}
    >
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #163059",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9bb8d8",
              letterSpacing: "0.04em",
            }}
          >
            LỊCH HẸN — 15/09/2026
          </span>
          <span style={{ fontSize: 12, color: "#4a6a90" }}>
            {SCHEDULE.length} ca
          </span>
        </div>
        <div style={{ padding: "8px 0" }}>
          {SCHEDULE.map((s, i) => {
            const c = STATUS_COLOR[s.status] ?? "#6b8ab0"
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "12px 18px",
                  borderTop: i > 0 ? "1px solid #0f2240" : undefined,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#c8d8ec",
                    minWidth: 48,
                  }}
                >
                  {s.time}
                </div>
                <div
                  style={{
                    width: 2,
                    alignSelf: "stretch",
                    background: c,
                    borderRadius: 2,
                    opacity: 0.6,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#e2eaf4" }}
                  >
                    {s.patient}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b8ab0", marginTop: 2 }}>
                    {s.test} · {s.doctor}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      background: "#0f2240",
                      border: "1px solid #163059",
                      color: "#9bb8d8",
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {s.room}
                  </span>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#4a6a90",
                      marginTop: 4,
                      fontFamily: MONO,
                    }}
                  >
                    {s.dur} phút
                  </div>
                </div>
                <StatusPill status={s.status} />
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ ...CARD, padding: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9bb8d8",
              letterSpacing: "0.04em",
              marginBottom: 14,
            }}
          >
            CÔNG SUẤT PHÒNG
          </div>
          {rooms.map((room) => {
            const count = SCHEDULE.filter((s) => s.room === room).length
            const pct = Math.min((count / 3) * 100, 100)
            return (
              <div key={room} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#7a9cc0" }}>{room}</span>
                  <span
                    style={{ fontSize: 11, fontFamily: MONO, color: "#3d8ee8" }}
                  >
                    {count} ca
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    background: "#0f2240",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "#3d8ee8",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ ...CARD, padding: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9bb8d8",
              letterSpacing: "0.04em",
              marginBottom: 10,
            }}
          >
            GHI CHÚ CA TRỰC
          </div>
          <div style={{ fontSize: 12, color: "#6b8ab0", lineHeight: 1.7 }}>
            <div>· Nghỉ trưa: 11:30 – 13:30</div>
            <div>· Ca MRI toàn thân cần đặt trước 60 phút</div>
            <div style={{ color: "#f59e0b" }}>
              · 1 ca khẩn đang chờ xếp phòng
            </div>
          </div>
          <button
            style={{
              width: "100%",
              marginTop: 14,
              background: "#1a73d4",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              padding: "9px",
              cursor: "pointer",
            }}
          >
            + Đặt lịch mới
          </button>
        </div>
      </div>
    </div>
  )
}
